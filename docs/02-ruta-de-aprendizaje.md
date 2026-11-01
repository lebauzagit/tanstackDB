# Ruta de aprendizaje

Todas las lecciones son requisitos del recorrido final. Los hitos de implementación permiten construirlas sin anticipar complejidad. Los nombres `use...` de esta página son composables propios propuestos, no exports de TanStack DB.

## 01 · Tres tareas, una colección

**Nivel:** inicial. **Pregunta:** ¿Qué aporta una colección?

- Dataset: tres registros con `id`, `title` y `completed`.
- Crear una colección local y leerla con `useLiveQuery` desde `useLocalTasks()`.
- Mostrar las entidades de origen junto a la lista resultante.
- Experimento: añadir «Leer sobre colecciones» y marcarla completada.
- Aceptación: ambas vistas reflejan el cambio; recargar restaura la semilla y se explica la ausencia de persistencia.
- Reto: explicar qué identifica `getKey` y qué ocurriría al repetir un ID.

## 02 · Pregúntale a los datos

**Nivel:** inicial. **Pregunta:** ¿Cómo cambia la consulta cuando cambio un filtro?

- `useFilteredTasks()` recibe un filtro reactivo: todas, pendientes o completadas.
- Introducir `where`, `select` y orden estable por título e ID.
- Experimento: filtrar pendientes y completar una tarea visible.
- Aceptación: desaparece del resultado sin copiar manualmente arrays; cambiar el filtro funciona sin remontar la pantalla.
- Reto: explicar la diferencia entre cambiar los datos y cambiar los parámetros de la consulta.

## 03 · Dos ventanas, los mismos datos

**Nivel:** inicial. **Pregunta:** ¿Por qué varias vistas cambian juntas?

- Lista general y lista de pendientes consumen la misma colección mediante consultas separadas.
- Comparación breve con un array Vue y un `computed`; explicar que para una lista pequeña ese patrón también es válido.
- Experimento: editar desde una vista y observar la otra.
- Aceptación: no hay una segunda copia mutable de las tareas y no aparecen peticiones HTTP.
- Reto: distinguir reactividad de la consulta y sincronización entre clientes remotos.

## 04 · CRUD y límites del almacenamiento

**Nivel:** intermedio. **Pregunta:** ¿Qué sobrevive a una recarga?

- Completar creación, edición y eliminación; formularios separados de las filas.
- Comparar explícitamente una sesión en memoria con una colección local persistida, usando un adaptador oficial compatible verificado.
- `useTaskActions()` concentra acciones pequeñas y validación de entradas.
- Experimento: editar, recargar y contrastar los dos modos.
- Aceptación: el modo persistido conserva cambios; reiniciar limpia solo su propio espacio de almacenamiento.
- Reto: explicar por qué guardar en el navegador no equivale a guardar en un servidor.

## 05 · La API tarda, la interfaz responde

**Nivel:** intermedio. **Pregunta:** ¿Cuándo se produce realmente una petición?

- Cambiar a Query Collection y una API HTTP simulada. `useRemoteTasks()` expone consulta y acciones.
- Mostrar datos de cliente y servidor simulado separados.
- Experimento: activar 1500 ms de latencia y completar una tarea.
- Aceptación: se ve el cambio local antes de la respuesta, la escritura viaja por HTTP y la lectura autoritativa posterior coincide; recargar vuelve a la semilla del mock.
- Reto: identificar la función del adaptador, la consulta viva y el handler.

## 06 · Romperlo para entenderlo

**Nivel:** intermedio. **Pregunta:** ¿Qué pasa si el servidor rechaza el cambio?

- Fallo controlado de escritura, de primera carga y de actualización posterior.
- Configurar reintentos explícitos para que no escondan el experimento.
- Experimento: fallar la siguiente escritura; observar el estado optimista y su reversión.
- Aceptación: aparece un mensaje útil, el servidor no cambia y el cliente vuelve al valor correcto; una actualización fallida conserva datos ya disponibles con un aviso.
- Reto: explicar por qué dejar de tener escrituras pendientes no prueba por sí solo una confirmación remota.

## 07 · Relacionar sin duplicar

**Nivel:** avanzado. **Pregunta:** ¿Cómo construyo un tablero a partir de entidades pequeñas?

- Añadir `projects` y `members`; tareas referencian IDs.
- `useProjectBoard()` relaciona tareas, proyectos y responsables. `useProjectMetrics()` calcula agregados.
- Incluir tareas sin responsable y proyectos sin tareas; explicar el tipo de join elegido.
- Experimento: renombrar una persona y mover una tarea entre proyectos.
- Aceptación: nombres y métricas se actualizan en todas las vistas; los proyectos vacíos no desaparecen por accidente; no hay endpoints por tarjeta.
- Reto: detectar cómo un join de uno a muchos puede inflar un conteo.

## 08 · Una intención, varios cambios

**Nivel:** avanzado. **Pregunta:** ¿Cómo coordino una operación que afecta a varias colecciones?

- Acción «Completar tarea y registrar actividad» mediante `useCompleteTask()`.
- Explorar una acción optimista y una transacción explícita con APIs verificadas de RC1.
- Enviar una única intención a un endpoint que valida todo antes de aplicar tarea y actividad.
- Experimento: rechazar la operación completa.
- Aceptación: no queda una tarea confirmada sin su actividad; el rechazo revierte ambas proyecciones; se explica dónde se garantiza atomicidad.
- Reto: justificar por qué dos llamadas HTTP exitosas de forma independiente no constituyen una transacción del servidor.

## 09 · Pedir solo lo necesario

**Nivel:** avanzado. **Pregunta:** ¿Qué ocurre cuando ya no quiero descargar todo?

- Dataset generado determinísticamente de 5000 tareas; tamaño elegido para el ejercicio, no como umbral universal.
- Comparar carga completa y carga `on-demand` mediante `useTaskExplorer()`.
- Empezar con filtros soportados de proyecto y estado, orden y ventana; traducirlos al contrato HTTP explícito.
- Experimento: cambiar proyecto y avanzar de página; observar filas transferidas, peticiones y resultados.
- Aceptación: la API recibe y aplica los parámetros; el resultado coincide con la referencia para ese subconjunto; se cancelan o descartan respuestas obsoletas.
- Reto: explicar por qué filtrar en memoria sobre una página parcial no calcula un total global correcto.

## 10 · Misión final: tablero bajo presión

**Nivel:** integración. **Pregunta:** ¿Puedo explicar y depurar un flujo completo?

- Tablero con proyectos, miembros, tareas, métricas y actividad; reutilizar patrones de las lecciones anteriores.
- Cambiar responsable, filtrar, completar con actividad y consultar datos bajo demanda.
- `useConcurrencyLab()` simula un segundo actor modificando el estado autoritativo de la API; no finge un canal realtime.
- El cliente se entera por recarga explícita. Añadir polling solo como comparación identificada.
- Experimento: cargar una tarea, provocar una edición externa y enviar una modificación con versión antigua.
- Aceptación: el servidor devuelve conflicto, el cliente no sobrescribe silenciosamente, permite recargar y reaplicar la intención; se ve qué datos están cargados y qué métricas son globales o parciales.
- Reto final: dibujar y explicar componente → composable → colección → handler → API → reconciliación, incluyendo un rechazo.

## Extensiones después del recorrido

- Sustituir el mock por una API real, por ejemplo NestJS, conservando el contrato.
- Comparar polling con un adaptador de sincronización real compatible.
- Estudiar persistencia de datos y cola offline duradera por separado, con pruebas de recarga y reconexión.
- Analizar consultas anidadas, índices y rendimiento con mediciones reproducibles.

Estas extensiones no deben presentarse como capacidades ya implementadas ni como requisitos para abrir la primera lección.
