# Instrucciones para el agente de Taller DB

## Propósito y estado

Este proyecto enseña TanStack DB 1.0.0-rc.1 con Vue 3, TypeScript y composables. La claridad pedagógica es un requisito funcional. Un CRUD que funciona pero no explica su flujo de datos está incompleto.

La base Vue y las lecciones 01–05 están instaladas y pasan typecheck, lint, cincuenta pruebas y build. Las cinco tienen revisión de escritorio/móvil; 05 también se verificó en Vite Preview con el worker real. Los hitos 1 y 2 están completos; el hito 3 conserva pendiente la lección 06. Lee los registros del [hito 1](docs/06-estado-hito-1.md), la [lección 02](docs/07-estado-leccion-02.md), la [lección 03](docs/08-estado-leccion-03.md), el [informe visual](docs/09-revision-visual.md), la [lección 04](docs/10-estado-leccion-04.md) y la [lección 05](docs/11-estado-leccion-05.md). No describas comprobaciones pendientes como realizadas ni lecciones futuras como implementadas.

Lee antes de implementar, en este orden:

1. [README](README.md).
2. [Visión](docs/01-vision-y-requisitos.md).
3. [Ruta de aprendizaje](docs/02-ruta-de-aprendizaje.md).
4. [Arquitectura](docs/03-arquitectura.md).
5. [Plan](docs/04-plan-de-implementacion.md).
6. [Referencia RC1](docs/05-referencia-rc1.md).

## Reglas del producto

- Conserva ejemplos pequeños y autónomos, aunque el caso final sea más complejo.
- Explica objetivo, acción, resultado observable y límite de cada patrón.
- Muestra el código que realmente ejecuta la demo; evita copias que puedan divergir.
- Las explicaciones van en español y los nombres del código en inglés.
- Identifica memoria, almacenamiento del navegador y API simulada en la interfaz.
- No atribuyas a DB persistencia remota, autorización, resolución de conflictos ni trabajo offline duradero sin una implementación concreta.
- Cada lección debe poder reiniciarse sin alterar los datos de otras lecciones.
- La lección 04 usa solo `taller-db:lesson-04:tasks:v1` para persistencia. Conserva la diferencia entre clave ausente y lista guardada vacía; no uses `localStorage.clear()` ni sustituyas fallos de almacenamiento por memoria sin indicarlo.
- La API de 05 es una simulación MSW con estado propio, identificada en pantalla. Arranca bajo demanda, también en el build estático. Conserva IDs de sesión en rutas/caché, abortos y la separación entre datos de DB y del mock. No atribuyas confirmación remota únicamente a `$hasPendingWrites` o a la casilla marcada.

## Reglas de implementación

- Usa Vue 3 Composition API, `<script setup lang="ts">` y TypeScript estricto.
- Comprueba la disponibilidad y compatibilidad de RC1 antes de instalar; fija versiones exactas y conserva el lockfile.
- Usa Context7 si está disponible para APIs sensibles a versión. Si no está disponible, consulta documentación oficial, tipos instalados y fuente de la versión exacta. No inventes APIs ni traslades firmas de React a Vue.
- Verifica especialmente reactividad de filtros, ciclo de vida, estados de error y confirmación de mutaciones.
- Las consultas y acciones de dominio viven en composables pequeños. La configuración de colecciones vive fuera de los componentes de presentación.
- No dupliques las filas de DB en Pinia o en un `ref` utilizado como segunda fuente de verdad.
- Usa estado Vue para formularios y controles; usa DB para los ejemplos de datos que se están enseñando.
- No crees colecciones nuevas en cada evaluación reactiva. Su identidad debe permanecer estable durante la sesión de la lección.
- Libera lectores antes de destruir su fuente; comprueba la API exacta de cleanup de RC1.
- No ocultes DB detrás de un repositorio genérico o un composable universal con numerosas opciones.
- No añadas NestJS, Nuxt, Supabase, autenticación o un motor de sync a los primeros hitos. Las extensiones se justifican por una lección.

## Inspección y ejecución

- Antes de modificar, inspecciona el estado actual y los archivos de instrucciones aplicables.
- Para descubrir código, prioriza codebase-memory-mcp. Si el proyecto no está indexado y ya contiene código, ejecuta `index_repository` primero. Usa búsqueda textual para documentación, configuración o resultados insuficientes del grafo.
- Repositorio privado `https://github.com/lebauzagit/tanstackDB`, remoto `origin`, rama principal `main`. Trabaja las entregas siguientes en ramas por lección. No hay rama `dev` definida: no inventes una integración. Si posteriormente necesitas integrar `origin/dev`, aplica la secuencia de integración indicada por las instrucciones globales del usuario, incluida auditoría i18n y reindexación final.
- Antes de cada comando pnpm en PowerShell, incorpora el runtime:

```powershell
$env:PATH = "$env:CODEX_PRIMARY_RUNTIME_ROOT/dependencies/bin;$env:PATH"
```

- Ejecuta los scripts reales disponibles de typecheck, lint, pruebas y build después de cambios de código. No afirmes haber ejecutado scripts que aún no existen.
- Prueba comportamientos observables: filtros reactivos, rollback, reconciliación, aislamiento y conflictos; evita pruebas que solo reproduzcan la implementación.
- Actualiza documentación y estado del plan cuando cambie el alcance o se complete un hito.
- Reporta qué cambió, qué verificaste y cualquier limitación material.
