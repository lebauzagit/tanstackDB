# Estado de la lección 05

Fecha: 1 de noviembre de 2026. **Implementada, verificada automáticamente y revisada en Chrome DevTools.** Ruta: `/lessons/05-remote-tasks`. Este registro describe la entrega inicial de 05; su continuación está documentada en la [lección 06](12-estado-leccion-06.md).

## Qué enseña

Tres tareas y una sola acción: alternar `completed`. La colección del cliente, el estado independiente de la API simulada, las peticiones y la cronología muestran el recorrido de una escritura optimista.

La carga inicial hace un GET. Al marcar una tarea, DB cambia la vista local y proyecta `$hasPendingWrites` como `pending`. El handler espera PATCH y después `collection.utils.refetch({ throwOnError: true })`. El composable espera `transaction.when('settled')`. «Volver a leer la API» hace un GET sin escribir.

La latencia es de 0, 500 o 1500 ms por petición. Con 1500 ms, PATCH + GET necesitan aproximadamente 3 segundos. La interfaz lo explica y permite observar que el cliente cambia antes que el mock.

El contador y la cronología son instrumentación del laboratorio. El inspector B lee `TaskLab`, que no importa ni consulta las filas de DB. Se identifica como API HTTP simulada en este navegador; recargar pierde su estado.

## Versiones y fuentes contrastadas

Context7 no está disponible. Se consultaron la [guía oficial de Query Collection](https://tanstack.com/db/latest/docs/collections/query-collection), la [integración de MSW en navegador](https://mswjs.io/guides/integrations/browser) y [Node](https://mswjs.io/guides/integrations/node), además de la fuente y tipos instalados de las versiones exactas.

| Paquete | Versión fijada |
| --- | --- |
| `@tanstack/db`, `@tanstack/vue-db` | `1.0.0-rc.1`, sin cambios |
| `@tanstack/query-db-collection` | `1.5.0` |
| `@tanstack/query-core` | `5.105.1` |
| `msw` | `2.15.0` |

MSW 2 satisface el peer `^2.4.9` de `@vitest/mocker@4.1.10`; MSW 3 no lo satisfacía. `pnpm peers check` no informa conflictos en la entrega final. El lockfile conserva las versiones resueltas.

Se comprobó en `query-db-collection/src/query.ts` que el handler es `Promise<void>` y la utilidad `refetch` acepta `throwOnError`. Se contrastaron `collection.reload()`, cleanup y las propiedades virtuales en el core instalado. No se usa un adaptador React ni se necesita `@tanstack/vue-query` para esta instancia de Query Core.

## HTTP, propiedad y errores

- `src/api/tasks.ts` valida las respuestas y propaga AbortSignal a fetch. El contrato de esta lección es GET `/api/lab/:sessionId/tasks` → `{ items, total }` y PATCH `/api/lab/:sessionId/tasks/:id` con `{ completed: boolean }` → tarea confirmada. Campos adicionales o tipos incorrectos se rechazan con 400.
- `src/mocks/taskLab.ts` mantiene semillas y tráfico por sesión. Los handlers de MSW son los que leen/escriben ese estado. Las respuestas se construyen desde él.
- `collections.ts` crea un QueryClient y una colección estables por sesión. Las claves incluyen el ID de sesión. Los reintentos y refetch automáticos por foco/reconexión están deshabilitados para que el experimento sea reproducible.
- El reinicio cierra el mock anterior, aborta escrituras, desmonta lectores, cancela consultas y espera cleanup antes de crear otra sesión. El handler comprueba vigencia/cancelación antes de aplicar cambios. El foco vuelve al encabezado.
- Se distinguen fallo de activación del worker, primera carga fallida, rechazo de escritura y escritura aceptada cuya lectura de confirmación falla. Este último caso avisa de la incertidumbre y permite recuperar con GET, sin repetir el PATCH.

`RemotePlayground` carga MSW dinámicamente y espera su arranque antes de crear la sesión. La ruta 05 también se carga bajo demanda. Las primeras lecciones no arrancan el worker. El build estático sí puede activar la simulación cuando se abre esta lección; es una función deliberada del tutorial y la interfaz lo indica.

`public/mockServiceWorker.js` se generó con el CLI de MSW y se conserva sin edición manual. `package.json` registra `msw.workerDirectory`. `pnpm-workspace.yaml` conserva la aprobación específica del postinstall de MSW y la excepción exacta de antigüedad de Query Core generada por pnpm. No define un monorepo. ESLint excluye únicamente el worker generado, además de sus exclusiones anteriores.

## Verificación automática

- Typecheck, lint y build: correctos. El build final separa ruta y arranque MSW en chunks propios y no presenta el aviso de chunks mayores de 500 kB.
- Suite completa: **50 pruebas en 6 archivos**, incluidas las 40 anteriores.
- Diez pruebas nuevas: carga HTTP única; optimismo antes de commit y PATCH + GET; lectura manual; reinicio con PATCH en vuelo; aislamiento entre sesiones; primera carga fallida y recuperación sin retry oculto; rechazo con rollback; escritura aceptada/lectura fallida con recuperación sin duplicar PATCH; validación del contrato HTTP; fallo y recuperación de activación del worker.
- La prueba de navegación recorre las cinco lecciones y vuelve a la primera.

Las pruebas usan DB, Query Collection, Query Core y handlers reales de MSW con `setupServer` en jsdom. Solo se sustituye el arranque del service worker en esos tests. La integración real del worker se comprobó en Chrome.

## Revisión en navegador

- Desarrollo en `127.0.0.1:5173`: primer GET visible, divergencia temporal entre cliente optimista y mock con latencia de 1500 ms, y reconciliación posterior.
- Network mostró GET → PATCH → GET con respuestas 200 para una acción completa. También mostró solicitudes abortadas durante reinicio, sin contaminar el estado de la sesión nueva.
- Reinicio mientras había un PATCH en curso: ambos paneles recuperaron la semilla, un GET nuevo y cero acciones pendientes; foco en «La red se hace visible».
- Escritorio de 1440 × 1000 y móvil emulado de 390 × 844: paneles, controles, tabla, cronología y código legibles, sin desbordamiento de página observado. El ancho móvil de página fue 390 px. Los bloques de código tienen su propio desplazamiento.
- Build servido con Vite Preview en `127.0.0.1:4173`: el worker arrancó, se confirmaron PATCH + GET, lectura manual como cuarto GET y recarga real que restauró la semilla del mock.
- Las consultas de consola realizadas no mostraron errores ni advertencias.

Parte de las acciones se activó mediante DOM desde `evaluate_script`; se inspeccionaron capturas y datos del DOM real. Esto no equivale a una auditoría completa de teclado, lectores de pantalla, todos los navegadores o conectividad. Los errores HTTP se forzaron en las pruebas automatizadas; la interfaz de esta lección todavía no ofrece los controles de fallo de 06.

## Versionado y siguiente entrega

La base 01–04 está en `main`, commit `648e18c`, etiqueta `v0.1.0`, en el repositorio privado [lebauzagit/tanstackDB](https://github.com/lebauzagit/tanstackDB). La lección 05 se integró mediante la [PR #1](https://github.com/lebauzagit/tanstackDB/pull/1), merge `c583a3f92c601d6687e0e74b8defaba25881429e`.

La continuación implementada es la [lección 06](12-estado-leccion-06.md): controles deterministas para rechazar escrituras, fallar primera carga y lectura posterior, explicar rollback y recuperar sin duplicar operaciones. Comparte acciones HTTP e inspector con 05, con sesiones independientes.
