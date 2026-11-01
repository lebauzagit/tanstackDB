# Estado de la lección 03

Fecha: 1 de noviembre de 2026. **Implementada, verificada automáticamente y revisada en navegador. Hallazgos de foco corregidos y comprobados.**

## Objetivo

Entender que compartir el código de un composable no comparte su estado por sí solo. Dos componentes necesitan recibir la misma colección para consultar y modificar las mismas entidades. Ruta: `/lessons/03-shared-collection`.

## Implementación

- `SharedPlayground.vue` crea una colección local por sesión y se la pasa por props a los dos componentes lectores.
- `AllTasksView.vue` usa `useAllTasks(collection)`; `PendingTasksView.vue` usa `usePendingTasks(collection)`.
- Cada componente mantiene su propia consulta viva. No crea otra colección ni copia las filas a un array mutable.
- `TaskEditorRow.vue` permite editar el título, cancelar el borrador y alternar el estado. `useSharedTaskActions` escribe en la fuente y espera `when('settled')`.
- El inspector lee la única colección de origen. Los dos resultados responden según su propia consulta.
- Se puede desmontar B, cambiar datos desde A y montar B de nuevo; el propietario conserva la fuente.
- El reinicio recrea la sesión. La limpieza del propietario utiliza `cleanup({ dependents: true })` después de que los hijos desmonten sus lectores.
- `VueComparison.vue` ejecuta una alternativa breve con un array `ref` y un `computed`. Sus datos son independientes de DB y así se explica en la interfaz.
- Código real importado mediante `?raw`, predicción, experimento, reto y solución.
- Navegación desde el recorrido y entre las tres lecciones.

No se añadieron dependencias ni se modificaron las versiones o el lockfile.

## Verificación inicial

- Typecheck y lint: correctos.
- Suite completa: diecinueve pruebas aprobadas en cuatro archivos; se conservan las once anteriores.
- Ocho pruebas de la lección 03: edición bidireccional conservando IDs, cambios de estado sin fetch, validación y cancelación, pendientes vacías sin pérdida de tareas, desmontaje y remontaje, reinicio repetido sin errores de limpieza, aislamiento entre sesiones y comparación Vue independiente con reinicio.
- La prueba de navegación recorre las tres lecciones y vuelve a la primera.
- Build de producción: correcto.
- Servidor de desarrollo: la ruta de la lección responde HTTP 200.

Las pruebas usan TanStack DB real. La verificación de ausencia de peticiones observa `fetch` durante las interacciones del laboratorio; la limpieza se comprueba también al desmontar lectores y reiniciar la sesión.

## Revisión visual y límites

Se revisó mediante Chrome DevTools en escritorio y móvil emulado. Se observaron edición bidireccional, validación, cancelación, cambio de estado, desmontaje/remontaje de B, comparación Vue independiente y reinicio. La presentación mantiene las vistas en dos columnas en escritorio y las apila en móvil, sin ensanchar la página. No se contrastó el contenido del portapapeles.

Los dos hallazgos iniciales dejaban el foco en `BODY` al desaparecer una tarea de B y al guardar un título. Ahora, completar desde B enfoca otra fila o el encabezado cuando no quedan pendientes; completar desde A conserva la casilla. Guardar devuelve el foco a «Editar» después de habilitarlo.

Se añadieron cinco pruebas: retirada de primera/última pendiente y resultado vacío, conservación en A y guardado desde A/B. La suite completa pasa veintinueve pruebas, junto con typecheck, lint y build. En Chrome se comprobaron Espacio para completar desde B y Enter para editar y guardar, además de la propagación del título. El [informe de revisión](09-revision-visual.md) detalla el alcance.

Compartir esta colección es un comportamiento local entre componentes de una sesión. No implementa persistencia ni sincronización entre clientes remotos. La [lección 04](10-estado-leccion-04.md) ya completa CRUD y compara almacenamiento local; las lecciones de API llegarán después.
