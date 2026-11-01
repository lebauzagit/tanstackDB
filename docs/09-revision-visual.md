# Revisión en Chrome DevTools

Fecha: 1 de noviembre de 2026. Servidor: `http://127.0.0.1:5173`.

**Estado: revisión de las tres lecciones completada; los dos hallazgos de accesibilidad están corregidos y comprobados.** Se abrió la aplicación con Chrome DevTools MCP y se inspeccionaron capturas y el DOM real. La revisión inicial no modificó código; después se implementaron las correcciones descritas al final.

## Comprobado

| Lección | Presentación | Interacciones observadas |
| --- | --- | --- |
| 01 · Primera colección | Escritorio de 1440 × 1000 y móvil emulado de 390 × 844; sin solapamientos ni desbordamiento horizontal de página | Añadir una tarea, completarla, reflejarla en el inspector, rechazar título vacío, mostrar «Copiado», reiniciar y recargar |
| 02 · Consultas reactivas | Escritorio y móvil; explicación, filtros, inspector y selector de código legibles | Pendientes: 3 → 2 al completar una tarea; origen conserva 4 filas; Completadas muestra 2; resultado proyectado con `label`; estado vacío con 0 resultados y 4 filas de origen; reinicio |
| 03 · Colección compartida | Escritorio con dos columnas y móvil con vistas A y B apiladas; selector de nueve archivos distribuido en varias líneas | Editar desde A y B; rechazar título vacío; cancelar sin cambiar la fuente; completar desde B y restaurar desde A; editar mientras B está desmontada y recuperar el cambio al montarla; comparación Vue independiente; reinicio de ambas semillas |

En las tres rutas, el ancho de página móvil fue de 390 px, igual al viewport. Los bloques de código tienen desplazamiento horizontal propio y no ensanchan la página. Los JSON también mantienen el desplazamiento dentro de sus contenedores.

En la lección 01, el reinicio devolvió el foco al encabezado de la práctica. El botón de copia mostró su confirmación; no se leyó el portapapeles para contrastar su contenido.

Las consultas de consola realizadas no mostraron errores ni advertencias. La consulta de red de la primera lección, después de recargar, no mostró solicitudes XHR/fetch; esta observación tiene ese alcance temporal.

Las capturas se inspeccionaron en las respuestas de Chrome DevTools. No se guardaron archivos de imagen: el servidor MCP rechazó la ruta solicitada para guardarlas por su restricción de directorios.

Parte de las acciones de la tercera lección se activó mediante eventos DOM y envío de formulario desde `evaluate_script`, además de `fill` y teclado con `press_key`. Esto permitió contrastar estado y foco; no equivale a una auditoría completa de interacción por ratón o de accesibilidad.

## Hallazgos iniciales de accesibilidad

### 1. Foco después de desaparecer una fila · lecciones 02 y 03

En la lección 02, al completar una tarea desde «Pendientes», la fila desaparece correctamente pero `document.activeElement` pasa a `BODY`. Quien usa teclado pierde su posición en los controles de la lista.

El mismo resultado se reprodujo en la vista B de la lección 03: enfocar una casilla y pulsar Espacio completa la tarea, la excluye de B y deja el foco en `BODY`.

Mejora propuesta: tras quitar la fila enfocada, dirigir el foco a la siguiente tarea visible, a la anterior si era la última, o a un control estable de la práctica cuando el resultado quede vacío.

### 2. Foco después de guardar un título · lección 03

Al guardar con Enter, el nuevo título llega a las dos vistas pero el foco queda en `BODY`. En `TaskEditorRow.vue`, `save()` intenta enfocar «Editar» mientras `busy` todavía mantiene ese botón deshabilitado; `busy` se libera después, en `finally`. La corrección debe enfocar el botón una vez que vuelva a estar habilitado y el DOM refleje el cambio.

## Resultado y límites

No se observaron fallos de presentación ni de datos en los escenarios descritos. El hito 1 completa su revisión visual. Los dos hallazgos de foco de las lecciones 02 y 03 se corrigieron tras esta revisión.

Chrome DevTools dejó temporalmente de devolver respuestas durante el cambio de móvil a escritorio en la lección 03. La conexión se recuperó y se completaron las comprobaciones descritas. Se dejó la aplicación abierta en la tercera lección, en escritorio.

En la revisión inicial no se cambiaron dependencias ni código y no se repitió la suite de diecinueve pruebas. Esta revisión no cubre todos los tamaños, motores de navegador, lectores de pantalla ni un recorrido completo por teclado.

## Correcciones y verificación posterior

El 1 de noviembre de 2026 se corrigieron ambos hallazgos sin cambiar dependencias ni las APIs de TanStack DB.

- La utilidad de presentación `captureTaskListFocus` conserva referencias DOM de la casilla y sus vecinas. Después de habilitar controles y actualizar el DOM, restaura la misma casilla si sigue visible; en caso contrario elige la siguiente o la anterior. No mantiene una copia de las filas de DB.
- Si no quedan resultados, la lección 02 enfoca el filtro activo y la vista B de la lección 03 enfoca «Solo pendientes», con `tabindex="-1"` para recibir foco programático.
- Guardar un título espera a que «Editar» vuelva a estar habilitado. La restauración respeta un cambio de foco hacia otro control durante la operación.
- Diez pruebas nuevas reproducen los escenarios de foco sobre las colecciones reales. Siete fallaron antes de corregir el código; las veintinueve pruebas pasan después. También pasan typecheck, lint y build.

Comprobaciones posteriores en Chrome DevTools, en escritorio:

| Escenario | Resultado observado |
| --- | --- |
| Completar una pendiente con Espacio en 02 | Foco en la siguiente casilla |
| Vaciar pendientes en 02 mediante activación DOM y comprobar la última casilla con Espacio | Foco en «Pendientes»; resultado vacío y cuatro filas de origen |
| Completar pendientes con Espacio en B de 03 | Foco en la siguiente casilla y, al vaciar B, en «Solo pendientes» |
| Abrir edición con Enter, escribir y guardar con Enter desde B | Foco en «Editar» habilitado; título actualizado en A y B |

Las pruebas automatizadas también cubren elección de la fila anterior, conservación de la casilla visible, guardado desde A y cambios que no deben robar foco. La comprobación de navegador tiene el alcance de los escenarios de la tabla.
