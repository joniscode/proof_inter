# Backend

## Fase 1: configuración inicial

API con Express y TypeScript, configuración mediante `.env` y endpoint de salud.

### Ejecución

Requiere Node.js 24 o superior y npm. Desde la raíz del repositorio, en PowerShell:

```powershell
cd Back
npm.cmd ci
Copy-Item .env.example .env
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
