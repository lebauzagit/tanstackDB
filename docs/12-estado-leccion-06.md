# Estado de la lección 06

Fecha: 1 de noviembre de 2026. **Implementada, verificada automáticamente y revisada en Chrome DevTools.** Ruta: `/lessons/06-errors`. Completa el hito 3 junto a la lección 05.

## Qué enseña

«Romperlo para entenderlo» compara el resultado del cliente con el estado independiente de la API simulada. La latencia inicial es de 500 ms por petición y se puede cambiar a 0 o 1500 ms.

| Experimento | Resultado observable | Recuperación |
| --- | --- | --- |
| Rechazar el próximo PATCH | Optimismo inmediato; HTTP 422 antes del commit; rollback; API sin cambios | La siguiente escritura ya puede confirmarse |
| Fallar el próximo GET con datos cargados | HTTP 503 y aviso; las tres tareas siguen visibles | Otro GET, sin PATCH |
| Aceptar PATCH y fallar su confirmación | PATCH 200 y GET 503; API actualizada, optimismo revertido en cliente | Bloquear escrituras y leer la API, sin repetir PATCH |
| Fallar la primera carga | Nueva sesión; GET 503; cliente vacío y semilla disponible en la API | Reintentar la consulta viva |

Los tres primeros botones preparan una petición futura y no hacen HTTP por sí solos. El cuarto crea una sesión y prepara su fallo antes de construir la colección. Los fallos se consumen al comenzar la petición correspondiente. Preparar otro fallo de escritura sustituye el anterior; preparar uno de lectura es independiente. No hay reintentos automáticos.

## Implementación y decisiones

- `useFailureScenarios` añade controles y explicación del resultado al composable concreto `useRemoteTasks`. Las filas proceden de `useLiveQuery`; los refs propios solo contienen controles y estados de acción.
- `createFailureSession` reutiliza la configuración HTTP de 05 con un namespace de 06 y un `TaskLab` nuevo. No comparte filas, caché, fallos ni reinicios con otras sesiones.
- `TaskLab` conserva datos propios y fallos deterministas. Los handlers de MSW rechazan antes del commit o fallan la lectura posterior. `LabTraffic` comparte la tabla y cronología con 05; en 06 añade códigos HTTP. Una cancelación muestra «—», sin atribuir al navegador una respuesta HTTP recibida.
- Un rechazo confirmado 400/404/422 se distingue de una confirmación incompleta o un fallo de transporte. En estos últimos casos `needsVerification` bloquea escrituras hasta que una lectura tenga éxito. Otro GET fallido conserva el bloqueo.
- El foco vuelve a la casilla después de un rechazo, pasa a la recuperación cuando es necesario verificar y vuelve al encabezado al reiniciar.
- El propietario cierra el mock, aborta escrituras, desmonta lectores, cancela consultas y espera cleanup antes de crear otra sesión. Reiniciar borra también fallos preparados y repone la latencia inicial.

## Hallazgo de RC1

Context7 no está disponible; se contrastaron los tipos y la fuente instalada de `@tanstack/vue-db` y `@tanstack/db` **1.0.0-rc.1**. No se añadieron paquetes ni se modificaron versiones o lockfile.

Después de fallar la primera carga, recargar solo la colección fuente podía devolver HTTP 200 y dejar el lector sin filas. La recuperación usa `query.collection.value.reload()`: RC1 recarga las fuentes fallidas y después la consulta viva. La prueba incluye una segunda lectura fallida antes del éxito y exige ver las tres filas, no únicamente una respuesta HTTP correcta. Un crash interno es distinto de un error recuperable de carga; `reload()` no promete reparar un crash en el sitio y el laboratorio permite reiniciar la sesión completa.

Las importaciones `?raw` muestran los archivos que ejecuta la demo, incluidos acciones compartidas, colección, escenarios, handlers, propietario e inspector.

## Validación

Typecheck, lint y build correctos. Suite completa: **60 pruebas en 7 archivos**, incluidas las 50 anteriores. Diez pruebas nuevas cubren preparación sin HTTP, fallo de una sola petición, optimismo/rollback, GET fallido con datos visibles, primera carga con dos fallos y recuperación real de filas, confirmación fallida sin repetir PATCH, fallo de transporte, aislamiento con 05, reinicio de fallos y reinicio durante escritura. La navegación recorre las seis lecciones.

Se usan DB, Query Collection, Query Core y handlers MSW reales con `setupServer` en jsdom. Solo se sustituye el arranque del worker. Una ejecución intermedia no pudo arrancar el worker de Vitest; la repetición enfocada y la suite completa posterior terminaron correctamente.

En Chrome, con el service worker real en `127.0.0.1:5173`, se comprobó:

- Rechazo: cliente `completed: true, pending: true` antes de responder; después de PATCH 422, cliente y API conservan `completed: false`, sin pendientes, con foco en la casilla.
- Confirmación fallida: PATCH 200 y GET 503; API con `completed: true`, cliente con `false`, escrituras bloqueadas y foco en «Volver a leer la API». Enter activa la recuperación; ambos quedan con `true`, se desbloquean escrituras y no aumenta el número de PATCH.
- Primera carga fallida y recuperación: cliente vacío ante 503, botón disponible; tras GET 200 vuelven las tres tareas. También se observó un segundo 503 antes de recuperar.
- Lectura fallida con datos en móvil: las tres filas permanecen, aparece el aviso y otro GET lo elimina sin escribir.
- Escritorio de 1440 × 1000 y móvil emulado de 390 × 844: controles, paneles y mensajes legibles. El ancho de página móvil fue 390 px; los bloques de código conservan su desplazamiento propio.

Las capturas y el DOM real se inspeccionaron con Chrome DevTools. Parte de las acciones se activó mediante DOM desde `evaluate_script`; se comprobó también la recuperación con Enter. Los errores HTTP 422/503 y sus mensajes de Query Collection son esperados en estos experimentos. No se detectaron excepciones JavaScript adicionales en las consultas de consola realizadas. No equivale a una auditoría completa de accesibilidad o de todos los navegadores. El build de 06 se compiló; la revisión de Vite Preview con worker documentada en 05 corresponde a aquella entrega.

## Versionado

La lección 05 quedó integrada en `main` mediante la [PR #1](https://github.com/lebauzagit/tanstackDB/pull/1), merge `c583a3f92c601d6687e0e74b8defaba25881429e`. La entrega de 06 se trabaja en `feat/lesson-06-errors`, con una PR independiente para revisión.

## Límites y siguiente entrega

MSW simula HTTP y estado en memoria dentro del navegador. Recargar restaura la semilla. No hay backend desplegado, persistencia remota, cola offline duradera ni resolución de conflictos. Un rollback cliente no revierte un commit de la API.

La lección 07 será la siguiente entrega: relaciones entre tareas, proyectos y miembros, consultas vivas y agregados. Sigue en preparación.
