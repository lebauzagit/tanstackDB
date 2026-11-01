# Taller DB

Un proyecto para aprender **TanStack DB 1.0.0-rc.1 con Vue 3 y composables**, construyendo una pequeña aplicación de tareas que evoluciona hasta un tablero de proyectos.

El objetivo es comprender qué ocurre con los datos, poder explicarlo y reutilizar los patrones en otros proyectos.

Repositorio privado: [lebauzagit/tanstackDB](https://github.com/lebauzagit/tanstackDB), rama principal `main`. La primera entrega versionada incluye las lecciones 01–04 y su documentación; los cambios posteriores se trabajan en ramas por lección.

## Estado actual

**Lecciones 01–04 implementadas y verificadas.** Incluyen primera colección, filtros reactivos, fuente compartida y CRUD con comparación entre memoria y almacenamiento del navegador. Las lecciones 05–10 aparecen como «En preparación».

Las dependencias están instaladas y `pnpm-lock.yaml` conserva las versiones resueltas. Pasan typecheck, lint, las cuarenta pruebas y build. Las cuatro lecciones se revisaron con Chrome DevTools en escritorio y móvil emulado. Los detalles de foco de 02/03 están corregidos; consulta el [informe de revisión](docs/09-revision-visual.md) y el [registro de la lección 04](docs/10-estado-leccion-04.md).

## Ejecutar el proyecto

Requiere Node.js 22.12 o superior y pnpm 11.5.0. Entorno usado para preparar los archivos: Node 24.22.1 en Windows.

Desde una terminal con acceso a npm, en esta carpeta:

```powershell
# En sesiones Codex, incorporar primero su runtime, si está configurado.
if ($env:CODEX_PRIMARY_RUNTIME_ROOT) {
  $env:PATH = "$env:CODEX_PRIMARY_RUNTIME_ROOT/dependencies/bin;$env:PATH"
}
pnpm install --frozen-lockfile
pnpm dev
```

Abre la URL que indique Vite y entra en «Abrir la primera lección». La ruta directa es `/lessons/01-first-collection`.

La segunda lección está en `/lessons/02-filtered-tasks`, accesible desde el recorrido y desde el final de la primera. Permite alternar entre todas, pendientes y completadas sin perder las tareas de origen.

La tercera está en `/lessons/03-shared-collection`. Permite editar y completar desde dos componentes que comparten la misma colección, desmontar una vista sin perder la fuente y comparar con un ejemplo independiente de Vue y `computed`.

La cuarta está en `/lessons/04-storage`. Compara CRUD sobre dos listas independientes: una en memoria y otra persistida con el adaptador oficial localStorage de DB RC1. Recargar permite comprobar qué sobrevive; reiniciar repone ambas semillas y solo elimina la clave de esta práctica.

El lockfile ya está generado y debe conservarse en el repositorio. Usa `pnpm install --frozen-lockfile` para reproducir las versiones verificadas.

## Comprobaciones

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Las cuarenta pruebas pasan. Cubren DB real, filtros, proyección, estado compartido, edición, CRUD, reapertura del almacenamiento, vacío persistido, errores de almacenamiento, rollback, reinicio, aislamiento, navegación y recuperación del foco. Consulta los registros del [hito 1](docs/06-estado-hito-1.md), la [lección 02](docs/07-estado-leccion-02.md), la [lección 03](docs/08-estado-leccion-03.md), la [revisión inicial en navegador](docs/09-revision-visual.md) y la [lección 04](docs/10-estado-leccion-04.md) para distinguir las comprobaciones y sus límites.

## La idea

Cada lección combina una explicación breve, una demo manipulable, su código real y un experimento. Un inspector permitirá observar cómo una acción cambia la colección, la consulta y, cuando corresponda, la API simulada.

El recorrido empieza con tres tareas en memoria y termina con un tablero que combina proyectos, personas, tareas y actividad.

## Una distinción fundamental

TanStack DB es un almacén reactivo de datos del **cliente**, con colecciones, consultas relacionales vivas y escrituras optimistas. Se conecta a fuentes de datos; el backend sigue siendo responsable de persistencia, validación y reglas de negocio. Véase la [descripción oficial](https://tanstack.com/db/latest/docs/overview).

En Taller DB aprenderemos esa frontera usando primero memoria local y después una API HTTP simulada. La simulación siempre estará identificada como tal.

## Documentación

| Documento | Para qué sirve |
| --- | --- |
| [Visión y requisitos](docs/01-vision-y-requisitos.md) | Qué debe aprender el usuario y cómo será la experiencia |
| [Ruta de aprendizaje](docs/02-ruta-de-aprendizaje.md) | Diez lecciones con experimentos y criterios de aceptación |
| [Arquitectura](docs/03-arquitectura.md) | Capas, composables, modelo y contrato HTTP propuestos |
| [Plan de implementación](docs/04-plan-de-implementacion.md) | Entregas incrementales y verificaciones |
| [Referencia de RC1](docs/05-referencia-rc1.md) | Fuentes oficiales y precauciones de versión |
| [Estado del hito 1](docs/06-estado-hito-1.md) | Primera lección, instalación y verificaciones |
| [Estado de la lección 02](docs/07-estado-leccion-02.md) | Filtros reactivos, pruebas y recuperación del foco |
| [Estado de la lección 03](docs/08-estado-leccion-03.md) | Fuente compartida, dos componentes y alternativa Vue |
| [Revisión en navegador](docs/09-revision-visual.md) | Escritorio, móvil, escenarios comprobados y mejoras de foco |
| [Estado de la lección 04](docs/10-estado-leccion-04.md) | CRUD, persistencia local, recuperación y cierre del hito 2 |
| [Instrucciones del agente](AGENTS.md) | Cómo trabajar en este proyecto sin perder su propósito educativo |

## Decisiones iniciales

- Vue 3, Composition API, TypeScript estricto y Vite como SPA.
- Documentación e interfaz en español; identificadores del código en inglés.
- Composables pequeños y explícitos que permitan seguir el flujo de datos.
- Una sola aplicación, sin monorepo ni servicios externos obligatorios.
- Ejemplos aislados y reiniciables; complejidad añadida por etapas.

Son decisiones de diseño para este proyecto, no requisitos de TanStack DB. Las versiones de herramientas y adaptadores se concretarán al iniciar la implementación, según la [política de versiones](docs/05-referencia-rc1.md).

## Próxima entrega definida

La siguiente lección del [plan](docs/04-plan-de-implementacion.md) es la 05: Query Collection y API HTTP simulada con latencia. Los hitos 1 y 2 están completos.
