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
