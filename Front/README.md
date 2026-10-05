# Frontend

React, TypeScript y Vite. La interfaz incluye portada, catálogo, carrito, saldo de puntos y conexión con el backend.

## Funcionalidad

- Catálogo: búsqueda por nombre, categorías y paginación resueltas por la API.
- Carrito: agregar, quitar, cambiar cantidades y consultar el total. La interfaz anticipa el cambio y restaura el estado anterior si falla.
- Compra simulada: confirma con el Back, vacía el carrito y vuelve a consultar el catálogo con el stock temporal actualizado.
- Puntos: saldo y premio recibidos del servidor. La actualización optimista nunca inventa recompensas.
- Estados de carga, error, vacío y reintento; distribución adaptable a móvil y escritorio.

## Ejecutar

Requiere Node.js 24 o superior. Inicia primero el [backend](../Back/README.md). Desde la raíz, en otra terminal PowerShell:

```powershell
cd Front
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abre `http://localhost:5173`. `API_TARGET` indica el backend; por defecto es `http://localhost:3000`. Reinicia Vite si cambias esta variable. El proxy reenvía `/health` y `/api` al Back.

## Organización

- `src/content/texts.json`: textos, mensajes y etiquetas accesibles. Se importan directamente en los componentes.
- `src/styles/theme.css`: paleta y tipografías; también configura las variables de Bootstrap.
- `src/styles.css`: distribución, tamaños y estilos de la ilustración.
- `src/components/ui`: botones, enlaces, marca, iconos y etiquetas compartidos.
- `src/api`: peticiones HTTP; la comprobación de conexión cancela peticiones pendientes y espera como máximo 8 segundos.
- `src/api/contracts.ts`: valida la estructura de las respuestas antes de usarlas en React.
- `src/api/session.ts`: conserva en `sessionStorage` el identificador de la simulación; no guarda un login.
- `src/hooks`: carga del catálogo y carrito, estados de interfaz y coordinación de las acciones.
- `src/lib/format.ts`: formato de precios y etiquetas de categorías compartidos.

Los componentes son propios de React y usan clases de Bootstrap. Los iconos son SVG en `ui/Icon.tsx`; la bolsa se dibuja con CSS. La paleta es una elección de diseño del proyecto, definida en `theme.css`. Los puntos se calculan en el backend; los textos explicativos solo describen la regla.

## Librerías y referencias

| Paquete | Uso y documentación |
| --- | --- |
| `react`, `react-dom` | Componentes, estado y renderizado. [React](https://react.dev/learn) |
| `bootstrap` | Retícula, botones y utilidades. [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/) y [variables CSS](https://getbootstrap.com/docs/5.3/customize/css-variables/) |
| `@fontsource/anton` | Fuente de títulos. [Anton](https://fontsource.org/fonts/anton) |
| `@fontsource-variable/manrope` | Fuente de textos. [Manrope](https://fontsource.org/fonts/manrope) |
| `vite`, `@vitejs/plugin-react` | Servidor local, compilación y recarga de React. [Vite](https://vite.dev/guide/) |
| `typescript`, `@types/react`, `@types/react-dom`, `@types/node` | Comprobación de tipos. [TypeScript](https://www.typescriptlang.org/docs/) |

Las fuentes se incluyen localmente. Las versiones están en `package.json` y `package-lock.json`.

Las imágenes de ejemplo provienen de `placehold.co`, configuradas en el seed del Back. Si no cargan, `ProductImage` muestra una ilustración SVG propia; sus colores usan la misma paleta central.

## Compilar

```powershell
npm.cmd run build
npm.cmd run preview
```

La compilación verifica los tipos y genera `dist`. La vista previa usa `http://localhost:4173`. Al desplegar, configura el servidor para reenviar `/health` y `/api` al backend.

## Decisiones

La búsqueda espera 250 ms y cancela peticiones anteriores para evitar resultados fuera de orden. Las categorías se conservan durante la sesión del componente para evitar pedirlas con cada búsqueda. Las mutaciones del carrito se procesan de una en una; el resto de la tienda sigue disponible. El `PUT` envía la cantidad final para que repetir una petición no agregue unidades por accidente.

Una interrupción de red puede ocurrir después de que el servidor haya guardado el cambio. En ese caso, la interfaz revierte su vista local; recargar permite consultar el estado persistido. No se incluyen autenticación, pagos ni sincronización entre pestañas.

## Uso

Busca un producto, elige una categoría y recorre las páginas. Agrega productos disponibles; los botones de cantidad y Quitar modifican el carrito. El total se confirma con la API. La primera incorporación de cada producto otorga 10 puntos y muestra un aviso. El saldo y el carrito permanecen al recargar.

Comprar (simulación) no realiza cobros. El Back valida las existencias, vacía el carrito y descuenta unidades del inventario temporal. Recargar conserva la sesión; abrir una pestaña nueva con una sesión nueva restaura el stock inicial. Reiniciar el Back también borra ese inventario temporal. Los puntos siguen la regla de primera incorporación y no se reinician por una compra. Si el navegador bloquea `sessionStorage`, la sesión solo dura hasta recargar.
