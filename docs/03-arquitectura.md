# Arquitectura propuesta

Este documento define el diseño del recorrido. La base Vue y las lecciones 01–05 están implementadas, instaladas y verificadas automáticamente y en navegador. Véanse la [revisión visual](09-revision-visual.md), el CRUD/persistencia de [04](10-estado-leccion-04.md) y la API simulada de [05](11-estado-leccion-05.md). Las lecciones 06–10 siguen planificadas. Las rutas, funciones y contratos HTTP propuestos son propios de Taller DB.

## Decisiones de base

| Decisión | Motivo |
| --- | --- |
| Vue 3 + Vite + TypeScript estricto | Mantener el foco en datos y composables, con una SPA sencilla |
| Vue Router | URLs independientes para las lecciones |
| CSS sencillo con variables | Evitar que una biblioteca visual domine el ejemplo |
| Adaptador `@tanstack/vue-db` | Integración con el ciclo de vida y reactividad de Vue |
| `@tanstack/query-db-collection` + `@tanstack/query-core` al introducir HTTP | Conectar DB con peticiones sin imponer otro framework |
| Mock Service Worker desde la lección HTTP | Inspeccionar peticiones reales del navegador sin desplegar un servidor |
| Vitest y pruebas de navegador al añadir interacciones | Verificar comportamiento y no solo tipos |

Las versiones exactas de Vite, Vue, MSW y herramientas se comprobarán al crear el proyecto. No se añade `@tanstack/vue-query` salvo que una lección use sus composables: Query Core cubre la instancia requerida por Query Collection.

## Flujo y responsabilidades

```text
Componente Vue
  → composable de lectura o acción
  → colección / consulta TanStack DB
  → handler y cliente HTTP, en lecciones remotas
  → API simulada con estado independiente
  → reconciliación de datos autoritativos
  → resultado reactivo → componente Vue
```

- **Componente:** presentación, controles y borradores de formularios.
- **Composable:** consulta o intención concreta; adapta parámetros reactivos.
- **Colección:** definición tipada, claves, adaptador y handlers asociados.
- **Cliente HTTP:** serializa contratos, comprueba respuestas y conserva información de errores.
- **Mock:** valida y aplica reglas sobre su propio estado; nunca consulta DB del cliente.
- **Contenido didáctico:** explica el ejemplo y referencia sus archivos reales.
- **Instrumentación:** registra eventos propios sin alterar las reglas del dominio.

## Estructura prevista

```text
src/
  app/                 # arranque, router y contexto de aplicación
  components/learning/ # estructura de lección, código, retos e inspector
  lessons/
    01-first-collection/
      LessonView.vue
      collections.ts
      useLocalTasks.ts
      seed.ts
    ...                # carpetas añadidas al implementar cada lección
    10-project-board/
  domain/              # tipos compartidos cuando haya reutilización real
  data/                # fábricas de sesión y adaptadores compartidos
  api/                 # cliente HTTP y contratos
  mocks/               # handlers MSW y estado autoritativo simulado
  learning/            # metadatos y contenido de las lecciones
  styles/
docs/
```

Empezar con archivos juntos en la lección 01. Extraer a carpetas compartidas cuando dos lecciones necesiten el mismo concepto y la extracción mantenga el ejemplo legible.

## Sesión de lección

Cada lección posee una sesión de datos independiente. Su fábrica crea las colecciones y dependencias necesarias una vez. Los lectores reciben la fuente de forma explícita: en la lección 03 se pasa mediante props tipadas. Un contexto Vue tipado será una opción cuando la profundidad del árbol lo justifique.

No imponer un provider de React a Vue. Si se usa `DbClient`, verificar primero su integración con el adaptador Vue instalado. La primera lección puede usar una colección concreta estable, sin introducir descriptores y clientes antes de necesitarlos.

Al reiniciar: bloquear temporalmente controles, abortar peticiones, desmontar consultas, liberar fuentes y crear una sesión nueva. El mock utiliza un identificador de sesión y una generación para impedir escrituras tardías. Las claves de caché incluyen lección y sesión.

## Contrato de composables

| Composable propio | Entrada | Responsabilidad |
| --- | --- | --- |
| `useLocalTasks()` | Sin argumentos; crea su sesión local | Exponer consulta mínima de la lección 01 |
| `useFilteredTasks()` | `Ref<TaskFilter>`; crea su sesión local | Consulta filtrada de la lección 02 con `where`, `select` y orden por título/ID |
| `useAllTasks()` | Colección existente de la lección 03 | Consulta de todas las tareas, sin crear otra fuente |
| `usePendingTasks()` | La misma colección existente | Consulta independiente de tareas pendientes |
| `useSharedTaskActions()` | Colección existente de la lección 03 | Renombrar y alternar estado sobre la fuente |
| `useVueTaskExample()` | Sin argumentos; semilla Vue independiente | Alternativa didáctica con `ref` y `computed`, sin duplicar las filas de DB |
| `useTasks()` | Colección concreta de la lección 04 | Consulta viva de tareas ordenadas por ID |
| `useTaskActions()` | Colección concreta de la lección 04 | Validar título, crear, editar, alternar estado y eliminar; esperar settlement |
| `useRemoteTasks()` | Sesión concreta de la lección 05 | Consulta viva, alternar estado con settlement, lectura manual y errores HTTP |
| `useLabInspector()` | Estado autoritativo del mock | Leer datos, peticiones y cronología independientes de DB |
| `useProjectBoard()` | sesión y proyecto reactivo | Proyección relacional para el tablero |
| `useProjectMetrics()` | sesión y alcance | Métricas con cobertura explícita |
| `useCompleteTask()` | sesión | Coordinar intención y actividad |
| `useTaskExplorer()` | sesión, filtros y ventana | Carga bajo demanda |
| `useConcurrencyLab()` | sesión | Controles propios del actor simulado |

Los resultados preservan refs y estados nativos que aporte la versión instalada. Las acciones devuelven un resultado observable de su operación y conservan el error. No prometer ahora una interfaz de biblioteca inventada con propiedades que no se han verificado.

Las dos primeras lecciones conservan sus fábricas y semillas locales para que cada ejemplo se pueda leer por separado. Al desmontar la lección 02, se limpian también las consultas derivadas de filtros anteriores mediante `cleanup({ dependents: true })`; la colección pertenece exclusivamente a esa sesión. No se comparten filas entre lecciones.

En la lección 03, `SharedPlayground.vue` es propietario de una única colección y la pasa a `AllTasksView` y `PendingTasksView`. Cada hijo abre su consulta mediante su composable. `TaskEditorRow` conserva únicamente el borrador del formulario y usa acciones sobre la fuente. Desmontar un hijo libera su lector; desmontar el propietario libera la colección y sus consultas dependientes. La comparación con Vue mantiene datos propios y está identificada como ejemplo independiente.

En la lección 04, `StoragePlayground.vue` posee dos fuentes independientes: LocalOnly y LocalStorage. La segunda se abre y valida antes de montar su lector `TaskList.vue`. Ambos lectores usan los mismos composables concretos de consulta y CRUD. El reinicio bloquea acciones, desmonta lectores, espera cleanup, elimina solo `taller-db:lesson-04:tasks:v1` y recrea las fuentes. Los fallos de apertura de B dejan A disponible; una apertura que termina tras desmontar su propietario libera inmediatamente la nueva fuente.

En 05, `RemotePlayground.vue` espera el arranque diferido del worker y posee una sesión concreta con QueryClient, colección y API simulada. El lector recibe esa fuente estable. Reiniciar cierra el mock y aborta escrituras, desmonta el lector, cancela consultas y limpia la colección antes de recrearla. Rutas y query keys incluyen un ID nuevo. `TaskLab` conserva sus propios datos y publica cambios para el inspector, sin leer DB.

Usar `MaybeRefOrGetter` solo donde aporte utilidad; comprobar cómo el adaptador sigue refs/getters. Evitar convertir una entrada reactiva en un valor fijo al crear el composable. No añadir watchers para duplicar filas en arrays.

## Modelo evolutivo

Introducir únicamente los campos que necesite la lección actual.

| Entidad | Campos finales propuestos |
| --- | --- |
| Task | `id`, `title`, `completed`, `priority`, `projectId`, `assigneeId`, `createdAt`, `updatedAt`, `version` |
| Project | `id`, `name`, `archived` |
| Member | `id`, `name` |
| Activity | `id`, `taskId`, `actorId`, `kind`, `createdAt` |

IDs string estables; `assigneeId` nullable. Fechas ISO en el contrato HTTP. `version` es un entero asignado e incrementado por el servidor simulado. `priority` usa `low`, `medium`, `high`; `kind` empieza con `task_completed`. Las etiquetas visibles se traducen sin alterar valores técnicos.

Las primeras lecciones solo usan los tres campos iniciales de Task. El mock remoto rechaza títulos vacíos, referencias inexistentes e IDs duplicados. La validación del formulario mejora la UX; la validación de la API protege el contrato.

## API HTTP simulada

Base propuesta: `/api/lab/:sessionId`. Todas las rutas son de este proyecto.

Estado actual de 05: solo GET `/tasks` con `{ items, total }` y PATCH `/tasks/:id` con `{ completed: boolean }`, que devuelve la tarea confirmada. La tabla siguiente describe la ampliación prevista; filtros, `expectedVersion`, autenticación y operaciones coordinadas no están implementados en esta lección.

| Método y ruta relativa | Contrato |
| --- | --- |
| `GET /tasks` | `{ items, total }`; acepta proyecto, completada, orden, límite y offset |
| `POST /tasks` | Nueva tarea con ID cliente; devuelve fila autoritativa |
| `PATCH /tasks/:id` | `{ changes, expectedVersion }`; devuelve fila actualizada |
| `DELETE /tasks/:id` | Requiere versión esperada; devuelve 204 |
| `GET /projects` | `{ items }` |
| `GET /members` | `{ items }` |
| `GET /activities` | `{ items }`; filtro opcional `taskId` |
| `POST /actions/complete-task` | `{ taskId, actorId, expectedVersion, operationId }`; devuelve `{ task, activity }` |

Filtros de tareas: `projectId`, `completed` (`true`/`false`), `sort` (`title`/`createdAt`), `direction` (`asc`/`desc`), `limit` y `offset`. El servidor añade ID como desempate. Valida límites y rechaza parámetros no soportados con 400. No serializar expresiones arbitrarias de DB como código ejecutable.

Errores: `{ code, message, current? }`; códigos HTTP 400 para contrato inválido, 404 para recurso inexistente y 409 para versión incompatible. `current` contiene la fila autoritativa cuando hay conflicto. La UI usa `code` para mensajes en español y conserva detalles técnicos en el inspector.

La acción de completar valida toda la intención antes de escribir. Mantiene un registro por `operationId` para que repetir la misma operación no duplique actividad. En el mock, el bloque de validación y commit se ejecuta sin esperas intermedias; en un backend real requiere una transacción de base de datos.

## Semántica de red y consistencia

Query Collection conecta la carga mediante Query con colecciones DB. Su integración y opciones se verifican en la [guía oficial](https://tanstack.com/db/latest/docs/collections/query-collection) y la fuente instalada. La lección 05 usa refetch explícito tras escritura: `onUpdate` espera PATCH y `collection.utils.refetch({ throwOnError: true })`. Query tiene retry desactivado, staleTime infinito y refetch por foco/reconexión desactivado para reproducir el experimento. La aplicación de respuestas autoritativas por escritura directa podrá compararse después.

Para concurrencia, una versión obsoleta produce 409 antes de modificar datos. La acción del otro actor cambia solo el mock; la lección debe mostrar la recarga que trae ese cambio al cliente.

Si la escritura se aplica y falla la lectura posterior, mostrar «No se pudo verificar el estado» y permitir recargar; una lectura fallida no deshace por sí sola lo que el servidor ya guardó. Evitar un reintento ciego que duplique acciones.

En carga parcial, identificar métricas locales como «sobre datos cargados». Los totales globales deben provenir de un contrato del servidor o de una colección con cobertura completa; no presentar conteos parciales como globales.

## Persistencia y conectividad

LocalOnly mantiene datos en memoria; no sobrevive a recarga, según su [documentación](https://tanstack.com/db/latest/docs/collections/local-only-collection). La lección 04 lo compara con `localStorageCollectionOptions`, incluido en el core RC1 instalado. Usa Storage real explícito, no un fallback a memoria. Solo una clave ausente inicializa la semilla; una lista guardada vacía se conserva. Bloqueo, cuota y datos corruptos producen errores visibles y comprobados. El inspector muestra campos de tarea, sin serializar metadatos internos como parte del modelo.

El estado remoto del mock vive en memoria y se reinicia al recargar. Una integración real futura es la que permitirá demostrar persistencia remota duradera. Una cola offline que sobreviva al cierre necesita su propio diseño; no forma parte del recorrido base.
