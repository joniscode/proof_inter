# Catálogo con recompensas

Backend en Node.js, Express y TypeScript con persistencia SQLite y Sesión storage. Incluye catálogo paginado, filtros, carrito y recompensas calculadas en el servidor.

Las instrucciones de ejecución, endpoints, pruebas y decisiones están en [Back/README.md](Back/README.md).

El frontend utiliza React, TypeScript, Vite y Bootstrap. Incluye catálogo con búsqueda, filtros y paginación, carrito optimista y saldo de puntos. La ejecución y las decisiones están en [Front/README.md](Front/README.md).

El diagnóstico y la corrección selectiva del fragmento entregado están en [REFACTOR.md](REFACTOR.md).

## Alcance

Usuario de demostración sin login. El servidor otorga 10 puntos una vez por producto y usuario; quitarlo no elimina puntos ni permite repetir el premio. SQLite conserva carrito y puntos. La compra simulada vacía el carrito y descuenta inventario durante la sesión, sin modificar el stock guardado en SQLite ni realizar cobros. Agregar al carrito no reserva inventario.

## Tiempo dedicado

Aproximadamente 7 horas de desarrollo y revisión, con cierre previsto hacia las 9:00 p. m. del 4 de octubre de 2026. Es una estimación de esfuerzo; las horas de los commits indican cuándo se guardaron los avances, no cuánto duró cada tarea.

## Avances registrados

Horas locales de Bogotá, del 4 de octubre de 2026.

| Commit | Hora | Entrega |
| --- | --- | --- |
| `7cd16e9` | 15:04 | Carpetas Back y Front. |
| `3acb61b` | 15:40 | Express, TypeScript, configuración de entorno y estado de la API. |
| `3f953ef` | 15:47 | SQLite, esquema y datos iniciales. |
| `b86ce65` | 15:50 | Catálogo con paginación, categorías, búsqueda y validaciones. |
| `6654db5` | 15:55 | Carrito persistente, cantidades, stock y totales. |
| `4481277` | 16:02 | Premios calculados en el servidor, historial y protección contra duplicados. |
| `a4e01d9` | 16:06 | Verificación del backend y documentación de ejecución. |
| `2aa9066` | 18:55 | React, Vite, conexión con la API y estados de disponibilidad. |

La etapa final incorpora catálogo interactivo, carrito optimista, saldo visible, diseño Bootstrap, compra simulada por sesión y análisis del refactor.

## Verificación de cierre

Compilación de Front y Back y 33 pruebas del backend correctas. Verificado en navegador: búsqueda, categorías, paginación, cantidades, reversión del carrito ante error, persistencia, recompensas sin duplicados y rechazo de respuestas inválidas.

Diseño comprobado en 118 anchos entre 320 y 3840 píxeles, incluidos los cambios de distribución de Bootstrap, sin desbordamiento horizontal. Sin incidencias en las comprobaciones automáticas de accesibilidad a 375, 768 y 1440 píxeles; también se revisó el acceso por teclado. Estas comprobaciones no sustituyen una revisión completa con lectores de pantalla y otros navegadores.
