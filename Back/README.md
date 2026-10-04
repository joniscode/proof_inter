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
