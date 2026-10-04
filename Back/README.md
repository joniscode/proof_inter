# Backend

## Fase 1: configuración inicial

API con Express y TypeScript, configuración mediante `.env` y endpoint de salud.

### Ejecución

Requiere Node.js 24 o superior y npm. Desde la raíz del repositorio, en PowerShell:

```powershell
cd Back
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run db:seed
npm.cmd run dev
```

El archivo `.env.example` incluye `PORT=3000` y `NODE_ENV=development`.

### Comprobación

`GET http://localhost:3000/health` devuelve HTTP 200:

```json
{ "status": "ok", "service": "proof-inter-back" }
```

### Compilación

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

## Fase 2: persistencia y datos de demostración

SQLite almacena productos y usuarios. La API crea el esquema al arrancar y aplica las migraciones pendientes. `DATABASE_PATH` permite cambiar la ubicación; por defecto usa `data/store.sqlite` dentro de `Back`. Los archivos de la base de datos se excluyen de Git.

Para cargar 12 productos de tres categorías y un usuario con saldo de puntos inicial en cero:

```powershell
npm.cmd run db:seed
```

La carga se puede repetir sin duplicar los datos ni reemplazar los registros existentes. Los precios se expresan en pesos colombianos enteros. Se usa SQLite nativo de Node.js; puede mostrar un aviso de API experimental según la versión de Node.

Para comprobar persistencia, carga repetida y restricciones de datos:

```powershell
npm.cmd test
```

## Fase 3: catálogo

| Endpoint | Descripción |
| --- | --- |
| `GET /api/products` | Lista de productos con paginación y filtros en SQLite |
| `GET /api/categories` | Categorías disponibles |

Ejemplo: `GET /api/products?page=1&limit=6&category=tecnologia&search=audifonos`.

- `page`: entero positivo, predeterminado `1`, máximo `1000000`.
- `limit`: tamaño de página entre `1` y `100`, predeterminado `6`.
- `category`: categoría exacta, hasta 50 caracteres.
- `search`: coincidencia parcial en el nombre, hasta 100 caracteres; ignora mayúsculas y tildes.

La respuesta contiene `data` y `pagination` (`page`, `limit`, `total`, `totalPages`). Sin coincidencias o en una página fuera del resultado, `data` es una lista vacía. Los parámetros inválidos devuelven HTTP 400 con `{ "error": { "code": "INVALID_INPUT", "message": "..." } }`.

Las consultas utilizan parámetros y orden estable por identificador. El índice de categoría ayuda al filtrado; la búsqueda parcial recorre los nombres, una decisión suficiente para este catálogo pequeño. `npm.cmd test` también verifica paginación, filtros y validación mediante peticiones HTTP.

## Fase 4: carrito

| Endpoint | Acción |
| --- | --- |
| `GET /api/cart` | Consulta el carrito |
| `POST /api/cart/items` | Agrega unidades con `{ "productId": 1, "quantity": 2 }` |
| `PUT /api/cart/items/:productId` | Establece la cantidad con `{ "quantity": 1 }` |
| `DELETE /api/cart/items/:productId` | Quita un producto; repetir la eliminación es válido |

Cada operación devuelve `items` (producto, cantidad y subtotal), `totalItems` (unidades), `total` y `currency: "COP"`. El servidor consulta los precios almacenados para calcular los importes y rechaza campos adicionales, como precios o puntos enviados por el cliente.

El carrito persiste en SQLite y utiliza el usuario de demostración `1`, seleccionado por el servidor. No hay autenticación en este alcance. Ejecuta `npm.cmd run db:seed` antes de probarlo.

Las cantidades deben ser enteros entre 1 y 999 y no superar el stock; para quitar un producto se usa `DELETE`. Las operaciones de escritura usan transacciones. Un producto inexistente devuelve 404 y stock insuficiente devuelve 409. Agregar al carrito no reserva ni descuenta inventario.

`PUT` permite reintentar una cantidad absoluta sin acumular unidades; `POST` agrega unidades y no debe reintentarse automáticamente. La actualización optimista y su reversión ante errores se implementarán en el frontend.

Las pruebas incluyen totales, modificaciones del carrito, stock, solicitudes concurrentes y rechazo de datos manipulados.

## Fase 5: recompensas

El usuario gana **10 puntos por cada producto distinto agregado al carrito por primera vez**. Agregar más unidades, actualizar la cantidad o quitar y volver a agregar el mismo producto no genera puntos adicionales. Quitar productos conserva los puntos obtenidos.

La regla se aplica tanto a `POST` como a `PUT` cuando crean una entrada en el carrito. Los cambios de carrito, el historial de recompensas y el saldo se guardan en una misma transacción. Una restricción única por usuario, producto y acción impide repetir premios, incluso después de reiniciar la API.

`GET /api/user` devuelve el usuario de demostración con `id`, `name` y `points`. Las respuestas del carrito incluyen el saldo en `points`; las operaciones de modificación también incluyen `pointsGranted`, con el premio de esa operación o `0`.

El cliente solo envía el producto y la cantidad. No existe un endpoint para asignar puntos. Las acciones rechazadas por validación o stock no generan recompensas. Las pruebas verifican premios únicos, persistencia, concurrencia y reversión de la transacción ante fallos.

## Fase 6: verificación y cierre del backend

Para ejecutar la comprobación de tipos, las pruebas y la compilación:

```powershell
npm.cmd run check
```

Las pruebas usan bases de datos en memoria o archivos temporales; no modifican la base local. Cubren catálogo, carrito, stock, recompensas, persistencia, migraciones, configuración y formato de errores.

### Contrato de errores

```json
{ "error": { "code": "INSUFFICIENT_STOCK", "message": "La cantidad solicitada supera el stock disponible." } }
```

| HTTP | Códigos |
| --- | --- |
| 400 | `INVALID_INPUT`, `INVALID_JSON` |
| 404 | `NOT_FOUND`, `PRODUCT_NOT_FOUND`, `USER_NOT_FOUND` |
| 409 | `INSUFFICIENT_STOCK` |
| 413 | `PAYLOAD_TOO_LARGE` |
| 500 | `INTERNAL_ERROR` |

### Decisiones y alcance

- Las rutas validan las solicitudes; los servicios resuelven carrito, usuario y recompensas; los repositorios consultan SQLite.
- SQLite simplifica la ejecución local. Sus operaciones síncronas son suficientes para esta prueba; con mayor tráfico se evaluaría otro acceso a datos y búsqueda indexada.
- Se utiliza un usuario de demostración fijo. La autenticación, pagos, checkout y administración de inventario quedan fuera de este alcance.
- Los precios, el stock y los puntos se resuelven en el servidor. Las imágenes de demostración provienen de un servicio externo de placeholders.
- El frontend podrá usar un proxy para `/api` durante desarrollo y enviar cantidades absolutas con `PUT` para evitar duplicar unidades en reintentos.

### Ejemplo de uso en PowerShell

Con la API iniciada, desde otra terminal:

```powershell
Invoke-RestMethod 'http://localhost:3000/api/products?page=1&limit=6'
Invoke-RestMethod 'http://localhost:3000/api/user'
Invoke-RestMethod 'http://localhost:3000/api/cart/items' -Method Post -ContentType 'application/json' -Body '{"productId":1,"quantity":1}'
Invoke-RestMethod 'http://localhost:3000/api/cart'
Invoke-RestMethod 'http://localhost:3000/api/cart/items/1' -Method Delete
```

La primera adición de un producto otorga 10 puntos; las siguientes conservan el saldo. Para producción local, ejecuta `npm.cmd run build` y luego `npm.cmd start`. Las migraciones se aplican al iniciar; `db:seed` se ejecuta cuando se requieren los datos de demostración.
