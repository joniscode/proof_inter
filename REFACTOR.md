# Diagnóstico del snippet

## Prioridad

1. **Puntos manipulables:** el cliente decide el premio y envía el saldo del usuario 1. El servidor debe identificar al usuario y calcular la recompensa dentro de la misma transacción que la acción.
2. **Fetch dentro del render:** cada respuesta cambia el estado y vuelve a solicitar datos. Moverlo a un efecto dependiente de la categoría, cancelar al cambiarla y comprobar el estado HTTP.
3. **Mutación del carrito:** `push` conserva la referencia y React puede omitir el render. Crear un estado nuevo y restaurar el anterior si falla la API.
4. **Búsqueda destructiva:** filtrar sobre el resultado ya filtrado impide recuperar productos al borrar la búsqueda. Conservar la fuente y derivar la vista; en la aplicación paginada, buscar en el servidor.
5. **Estado global y accesibilidad:** `cachedProducts` se comparte entre instancias sin una política de caché. Faltan claves, etiquetas, texto alternativo y botones utilizables con teclado.

## Corrección selectiva

Estos bloques sustituyen la carga, búsqueda y acción del componente original. No cambian su distribución visual. Se agregan `useEffect`, `useRef` y los estados de carga/error; se eliminan `cachedProducts` y el estado local de puntos. El contrato de la API propia devuelve `{ data, pagination }` para productos y un carrito con `items`, `total` y `points`.

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  setError('');

  async function load() {
    try {
      const query = new URLSearchParams({ page: '1', limit: '6' });
      if (props.category) query.set('category', props.category);
      const response = await fetch(`/api/products?${query}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('No se pudo cargar el catálogo.');
      const result = await response.json();
      if (!controller.signal.aborted) setProducts(result.data);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  void load();
  return () => controller.abort();
}, [props.category]);

// Para el snippet, la búsqueda deriva una vista sin destruir la fuente.
const visibleProducts = products.filter(product =>
  product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
);
function handleSearch(event) {
  setSearch(event.target.value);
}
```

La aplicación final envía también `search` y `page` al backend: filtrar solo seis productos en el navegador ocultaría coincidencias de otras páginas. `useCatalog` implementa esta variante con espera de 250 ms y cancelación.

La acción original se reemplaza por una petición al carrito. El estado es el carrito completo recibido de la API, no un array de productos duplicados. Un bloqueo con `useRef` evita mutaciones simultáneas mientras la interfaz conserva la vista optimista.

```jsx
const [cart, setCart] = useState(null); // Se carga con GET /api/cart.
const [busy, setBusy] = useState(false);
const pending = useRef(false);

async function addToCart(product) {
  if (pending.current || !cart) return;
  const quantity = (cart.items.find(item =>
    item.product.id === product.id)?.quantity ?? 0) + 1;
  if (quantity > Math.min(product.stock, 999)) return;

  pending.current = true;
  setBusy(true);
  setError('');
  const previous = cart;
  const items = cart.items.filter(item => item.product.id !== product.id);
  items.push({ product, quantity, subtotal: product.price * quantity });
  setCart({ ...cart, items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  });

  try {
    const response = await fetch(`/api/cart/items/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('No se pudo actualizar el carrito.');
    setCart(await response.json()); // Incluye puntos calculados por el servidor.
  } catch (error) {
    setCart(previous);
    setError(error instanceof Error ? error.message : 'No se pudo actualizar el carrito.');
  } finally {
    pending.current = false;
    setBusy(false);
  }
}
```

No se envía `userId`, precio ni puntos. El servidor valida stock y entradas; el `PUT` fija una cantidad absoluta. El cálculo local del total solo anticipa la vista, y la respuesta del servidor la reemplaza. Los puntos se muestran con `cart?.points`, sin sumas locales.

En el JSX original: renderizar `visibleProducts`, usar `key={product.id}`, un `label` asociado al buscador, `alt={product.name}` y un botón deshabilitado cuando `busy` o no haya stock. Mostrar carga, error y vacío explícitamente. La implementación de estos cambios está en `ProductCard`, `ShopSection` y `useCart`.

## Segunda iteración

- Autenticación: sustituir al usuario de demostración por una identidad verificada antes de un uso real.
- Recuperación tras una respuesta perdida: consultar el carrito y su versión para reconciliar la vista con el servidor; una petición puede haberse guardado aunque el navegador reciba un error de red.
- Caché de catálogo e invalidación por cambios de inventario, cuando el tráfico justifique añadir esa complejidad.
- Reserva de stock y checkout de pedidos reales: la compra actual solo descuenta inventario temporal de una simulación. Agregar al carrito no reserva unidades.

Se priorizan integridad de puntos, ausencia de bucles y estado consistente; las capacidades anteriores amplían el alcance de la prueba.
