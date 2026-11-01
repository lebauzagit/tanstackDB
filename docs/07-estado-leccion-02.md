# Estado de la lección 02

**Implementada, verificada automáticamente y revisada en navegador. Recuperación del foco corregida y comprobada.**

## Objetivo

Comprender la diferencia entre cambiar los parámetros de una consulta y cambiar una entidad de la colección. Ruta: `/lessons/02-filtered-tasks`.

## Comportamiento

- Cuatro tareas locales; dos comparten título para enseñar el desempate por ID.
- Filtros «Todas», «Pendientes» y «Completadas», mediante `useFilteredTasks(filter)`.
- `where` elige filas por `completed`; `select` expone `title` como `label` en el resultado.
- Orden ascendente por título, después ID. El orden de iteración del origen no se presupone como contrato.
- Completar una tarea pendiente la retira de esa vista y la mantiene en la colección y en la vista de completadas.
- Inspector con JSON de origen y resultado, recuentos y condición activa.
- Estado vacío que explica que las entidades siguen existiendo.
- Reinicio con datos y filtro iniciales. Limpieza de consultas derivadas de filtros anteriores al terminar la sesión.
- Código real importado con `?raw`, experimento, reto y solución.
- Acceso desde inicio, barra lateral y final de la primera lección. La disponibilidad se deriva de la ruta en los metadatos de cada lección.

No se añadieron dependencias ni se cambiaron las versiones de RC1. Los modelos y colecciones siguen siendo locales a cada lección para conservar ejemplos pequeños y sesiones independientes.

## Verificación inicial

- `pnpm typecheck`: correcto.
- `pnpm lint`: correcto, sin avisos.
- `pnpm test`: once pruebas aprobadas en tres archivos: cuatro de la primera lección, seis de filtros y una de navegación.
- `pnpm build`: correcto.
- Ruta de la lección 02 en el servidor de desarrollo: HTTP 200.

Las seis pruebas nuevas verifican filtros sin alterar el origen, proyección y orden con empate, cambio de estado conservado al alternar filtros, resultado vacío sin pérdida de entidades, reinicios repetidos sin errores de limpieza y aislamiento respecto de la primera lección. La prueba de navegación comprueba que el enlace del recorrido abre la segunda lección y permite volver a la primera.

## Revisión visual y corrección del foco

El 1 de noviembre de 2026 se revisó con Chrome DevTools en escritorio y móvil emulado. Se comprobaron filtros, proyección, conservación de las cuatro filas de origen, resultado vacío y reinicio. La página no desborda horizontalmente; el código se desplaza dentro de su propio contenedor.

El hallazgo inicial dejaba el foco en `BODY` al completar una tarea desde «Pendientes». Ahora se conserva en la misma casilla si permanece, en la siguiente o anterior si desaparece, o en el filtro activo si no quedan filas. La restauración espera a que los controles estén habilitados y no se activa si la casilla no tenía el foco.

Se añadieron cinco pruebas de foco: retirada de primera/fila intermedia/última y resultado vacío, conservación de la casilla visible y cambio iniciado sin foco en ella. La suite completa pasa veintinueve pruebas; también pasan typecheck, lint y build. La comprobación en Chrome se detalla en el [informe de revisión](09-revision-visual.md).

Los hitos 1 y 2 están completos; la [lección 04](10-estado-leccion-04.md) añade CRUD y persistencia local.
