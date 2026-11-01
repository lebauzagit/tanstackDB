# Registro del hito 1

Fecha de entrega: 30 de octubre de 2026. Revisión visual: 1 de noviembre de 2026. **Estado: hito completado, con verificación automática y revisión en navegador.**

## Entrega escrita

- Base Vue 3, Vite, TypeScript estricto y Vue Router.
- Inicio con recorrido de diez lecciones; solo la primera se presenta como disponible.
- Lección 01: semilla de tres tareas, formulario con validación y cambio de estado.
- `useLocalTasks()` crea una colección local por montaje y usa `useLiveQuery`.
- Inspector que lee la colección de origen mediante una suscripción y `toArray`; no mantiene otra copia mutable de las filas.
- Reinicio mediante desmontaje de la sesión y creación de otra colección.
- Código visible importado de los archivos reales con `?raw` y botón de copia.
- Predicción, experimento, explicación, reto y solución en español.
- Estilos adaptables, foco visible, controles nativos y etiquetas accesibles.
- Cuatro pruebas de interacción: alta y cambio reflejados en origen/consulta, título vacío, reinicio y aislamiento entre dos montajes.

## APIs contrastadas

Se consultaron mediante GitHub MCP los manifiestos actuales del [core](https://github.com/TanStack/db/blob/main/packages/db/package.json) y del [adaptador Vue](https://github.com/TanStack/db/blob/main/packages/vue-db/package.json), que declaran `1.0.0-rc.1`. La fuente de `useLiveQuery` y LocalOnly se contrastó con el commit de preparación de RC1:

- [useLiveQuery en el commit de RC1](https://github.com/TanStack/db/blob/43d4ef65cfe5c3cfbce6c56891795cd36a73cc37/packages/vue-db/src/useLiveQuery.ts).
- [LocalOnly en el mismo commit](https://github.com/TanStack/db/blob/43d4ef65cfe5c3cfbce6c56891795cd36a73cc37/packages/db/src/local-only.ts).

Ambos archivos coinciden con la fuente revisada de la rama principal. El manifiesto de ese commit todavía usaba el número anterior del adaptador. La instalación confirmó `1.0.0-rc.1` tanto para el core como para Vue.

La implementación usa `ComputedRef` del adaptador, `isLoadingError`/`isCrashed`, `transaction.when('settled')` y limpieza explícita de consulta antes de fuente. No necesita `DbClient` para esta colección concreta. Los filtros reactivos se verificarán al implementar la lección 02; la lección 01 no expone filtros.

## Versiones declaradas

| Dependencia | Versión |
| --- | --- |
| `@tanstack/db`, `@tanstack/vue-db` | `1.0.0-rc.1` |
| Vue | `3.5.40` |
| Vue Router | `5.2.0` |
| Vite / plugin Vue | `8.2.0` / `6.0.8` |
| TypeScript / vue-tsc | `5.9.3` / `3.3.9` |
| Vitest / Vue Test Utils / jsdom | `4.1.10` / `2.4.11` / `29.1.1` |
| ESLint / plugin Vue / typescript-eslint | `9.39.4` / `10.10.0` / `8.59.2` |

Las versiones de la tabla ya están instaladas. pnpm resolvió sus peers sin conflictos con `strict-peer-dependencies=true` y generó `pnpm-lock.yaml`. Se añadió `eslint-config-prettier@10.1.8` para que el lint no compita con el formato de Prettier. Entorno: Node `24.22.1`, pnpm `11.5.0`; `CODEX_PRIMARY_RUNTIME_ROOT` no estaba definido.

## Verificación realizada

- `pnpm install`: correcto; 312 paquetes iniciales y uno adicional de configuración de lint.
- `pnpm typecheck`: correcto contra los paquetes instalados.
- `pnpm lint`: correcto, sin errores ni avisos después de ajustar la configuración Vue/TypeScript y Prettier.
- `pnpm test`: 1 archivo, 4 pruebas aprobadas con DB real. No se observaron errores de limpieza durante estas pruebas.
- `pnpm build`: correcto; bundle de producción generado en `dist`.
- `pnpm dev --port 5173 --strictPort`: servidor iniciado en `http://127.0.0.1:5173/`.
- Inicio y `/lessons/01-first-collection`: HTTP 200, con entrada Vue servida.
- Repositorio indexado con codebase-memory-mcp en modo completo.

## Bloqueo de instalación resuelto

La sesión anterior rechazaba npm con `EACCES` y no admitía ampliación de permisos. Después del cambio de política y la autorización del usuario, la instalación con permisos ampliados terminó correctamente.

La conexión fue lenta y requirió algunos reintentos, sin impedir la descarga. pnpm advierte que ESLint `9.39.4` y la dependencia transitiva `glob@10.5.0` están deprecados. Las versiones se mantienen fijadas en esta entrega; actualizar el tooling queda como mantenimiento separado.

## Revisión visual completada

El intento inicial mediante Computer Use no tenía conexión. El 1 de noviembre se pudo abrir la aplicación con Chrome DevTools MCP y revisar la primera lección en escritorio (1440 × 1000) y móvil emulado (390 × 844).

Se comprobaron alta, cambio de estado, inspector, validación de título vacío, confirmación de copia, reinicio con recuperación del foco y recarga. No se observaron solapamientos ni desbordamiento horizontal de página. El [informe de revisión](09-revision-visual.md) detalla el alcance y los límites; los hallazgos de foco corresponden a las lecciones posteriores.
