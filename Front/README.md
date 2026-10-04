# Frontend

## Fase 1: configuración inicial

React y TypeScript con Vite. Incluye una pantalla base responsiva y una comprobación de conexión con el backend, con estados de carga, conexión y error, y opción de reintentar.

### Ejecución

Requiere Node.js 24 o superior y npm. Primero inicia el backend siguiendo [sus instrucciones](../Back/README.md). Desde la raíz del repositorio, en otra terminal PowerShell:

```powershell
cd Front
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abre `http://localhost:5173`. `API_TARGET` configura la dirección del backend y utiliza `http://localhost:3000` por defecto. Si cambias el puerto del Back, actualiza esta variable y reinicia Vite.

El navegador consulta `/health`; Vite reenvía la solicitud al backend. También queda configurado el proxy para `/api`. La comprobación cancela peticiones al desmontar el componente y limita la espera a 8 segundos.

### Verificación y compilación

```powershell
npm.cmd run check
npm.cmd run preview
```

`check` verifica los tipos y genera `dist`. `preview` permite revisar el resultado en `http://localhost:4173`, con el backend iniciado. Para desplegar los archivos compilados, el servidor que los publique debe reenviar `/health` y `/api` al backend; el proxy de Vite se utiliza solo en desarrollo y vista previa.
