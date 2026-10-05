# Backend

API REST con Node.js, Express y TypeScript. SQLite guarda productos, usuario, carrito e historial de recompensas.

## Ejecutar

Requiere Node.js 24 o superior. Desde la raíz del repositorio, en PowerShell:

```powershell
cd Back
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run db:seed
npm.cmd run dev
```

La API usa `http://localhost:3000`. `.env` configura `PORT`, `NODE_ENV` y `DATABASE_PATH` (por defecto `data/store.sqlite`). El seed carga 12 productos y el usuario 1; repetirlo no duplica registros ni reemplaza cambios existentes. Las migraciones se aplican al iniciar.

## Endpoints

| Método y ruta | Uso |
| --- | --- |
| `GET /health` | Estado del proceso HTTP |
| `GET /api/products` | Catálogo paginado; admite `page`, `limit`, `category` y `search` |
| `GET /api/categories` | Categorías disponibles |
| `GET /api/user` | Usuario de demostración y saldo de puntos |
| `GET /api/cart` | Productos del carrito, unidades, total y puntos |
| `POST /api/cart/items` | Agrega unidades: `{ "productId": 1, "quantity": 1 }` |
| `PUT /api/cart/items/:productId` | Establece cantidad: `{ "quantity": 2 }` |
| `DELETE /api/cart/items/:productId` | Quita un producto |
| `POST /api/cart/checkout` | Compra simulada con cuerpo `{}`; vacía el carrito y descuenta stock de la sesión |

El catálogo usa `page=1` y `limit=6` por defecto; el límite máximo es 100. La búsqueda ignora mayúsculas y tildes. Devuelve `data` y `pagination` con `page`, `limit`, `total` y `totalPages`.

## Reglas y decisiones

- El servidor calcula precios, totales y recompensas. Los precios son pesos colombianos enteros.
- Se otorgan 10 puntos por producto agregado por primera vez. Quitar y volver a agregar no repite el premio.
- Carrito, premio y saldo se guardan en una misma transacción. La clave única del historial evita premios duplicados.
- Las cantidades deben estar entre 1 y 999 y no superar el stock. El carrito no reserva inventario.
- La compra simulada valida el carrito completo antes de vaciarlo. No genera premios adicionales ni modifica el stock de SQLite.
- El inventario temporal vive en memoria del servidor y se identifica con `X-Simulation-Session`. Una sesión nueva o reiniciar el Back restaura el stock inicial. El identificador no es autenticación; se usa solo para la demostración.
- Se usa el usuario 1, sin autenticación. Pagos reales, historial de pedidos y administración quedan fuera del alcance. El carrito persistente pertenece al usuario de demostración y es compartido entre sus pestañas; el inventario simulado pertenece a cada sesión.
- Rutas: validación HTTP. Servicios: reglas de negocio. Repositorios: consultas parametrizadas a SQLite.

Los errores usan `{ "error": { "code": "...", "message": "..." } }`: 400 para entradas inválidas, 404 para recursos inexistentes, 409 para stock insuficiente, 413 para cuerpos grandes y 500 para fallos internos.

## Librerías y referencias

| Tecnología | Uso y documentación |
| --- | --- |
| `express` | Rutas, lectura de JSON y manejo de errores. [Express](https://expressjs.com/en/5x/api/) |
| `typescript`, `@types/express`, `@types/node` | Tipos y compilación. [TypeScript](https://www.typescriptlang.org/docs/) |
| `tsx` | Ejecutar TypeScript en desarrollo y el seed. [Proyecto tsx](https://github.com/privatenumber/tsx) |
| Node.js | Carga de `.env` y ciclo de vida del servidor. [Node.js](https://nodejs.org/api/process.html) |
| SQLite nativo de Node.js | Persistencia local, sin ORM. [node:sqlite](https://nodejs.org/api/sqlite.html) |

SQLite síncrono simplifica esta prueba; con más tráfico se revisaría el acceso a datos. Las imágenes del seed usan `placehold.co`. Las versiones de dependencias están en `package.json` y `package-lock.json`.

## Compilar y verificar al cierre

```powershell
npm.cmd run build
npm.cmd start
```

Las pruebas existentes se ejecutan con `npm.cmd test`; `npm.cmd run check` reúne tipos, pruebas y compilación.
