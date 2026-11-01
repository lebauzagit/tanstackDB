# Estado de la lección 04

Fecha: 1 de noviembre de 2026. **Implementada, verificada automáticamente y revisada con Chrome DevTools en escritorio y móvil emulado. Hito 2 completado.**

## Objetivo y recorrido

Ruta: `/lessons/04-storage`. Crear, leer, editar, completar y eliminar tareas para distinguir reactividad de persistencia. Dos listas independientes permiten comparar el mismo CRUD sin cambiar la API de acciones:

- A usa memoria y recupera tres tareas de semilla al abrir de nuevo la lección.
- B usa localStorage del origen y perfil del navegador. Conserva altas, títulos, estados, eliminaciones y una lista vacía al recargar.
- Los formularios mantienen borradores Vue; las entidades solo se modifican al confirmar una acción.
- La interfaz incluye validación, cancelación, estados de carga/error, inspectores, recuperación de foco y código real importado con `?raw`.
- Hay enlaces desde el recorrido y la lección 03. Las lecciones 05–10 siguen en preparación.

## Adaptador contrastado

Context7 no está disponible en esta sesión. Se contrastaron la [guía oficial de LocalStorage Collection](https://tanstack.com/db/latest/docs/collections/local-storage-collection), la [referencia de localStorageCollectionOptions](https://tanstack.com/db/latest/docs/reference/functions/localStorageCollectionOptions) y los tipos/fuente instalados de `@tanstack/db@1.0.0-rc.1`, especialmente `src/local-storage.ts`.

El adaptador está incluido en el core ya instalado. No se añadieron dependencias ni se modificaron versiones o lockfile. Prettier 3.6.2 se ejecutó temporalmente para formatear los archivos, sin incorporarlo como dependencia del proyecto.

La implementación usa `localStorageCollectionOptions<Task, string>`, `storageKey`, `storage`, `getKey`, `preload()` y mutaciones esperadas con `when('settled')`. No se trasladaron imports de React. La consulta utiliza `useLiveQuery` de Vue sobre una fuente concreta ya abierta.

## Propiedad, semilla y reinicio

`StoragePlayground.vue` posee las dos colecciones. B se abre de forma asíncrona antes de montar su lector. Si su apertura falla, A sigue disponible y se muestra un mensaje explícito; no se sustituye silenciosamente el almacenamiento por memoria.

La clave exclusiva es `taller-db:lesson-04:tasks:v1`. Solo una clave ausente inicializa la semilla. Una instantánea vacía se conserva y los datos inválidos no se sobrescriben automáticamente. La fábrica comprueba el formato básico de las tareas restauradas y libera una fuente cuya apertura falle.

El reinicio se deshabilita mientras hay escrituras o apertura en curso. Desmonta lectores, espera la limpieza de fuentes, elimina únicamente esa clave y recrea ambas colecciones. No usa `localStorage.clear()`. Devuelve el foco al título de la práctica. La inicialización también libera su colección si termina después de desmontar el propietario.

`useTaskActions` concentra validación y CRUD; `useTasks` concentra la consulta. El inspector proyecta únicamente `id`, `title` y `completed`, evitando presentar metadatos de una consulta como datos persistidos. No hay otra lista mutable de entidades en Vue.

## Verificación automática

- Typecheck, lint y build: correctos.
- Suite completa: **40 pruebas aprobadas en 5 archivos**, incluidas las 29 anteriores.
- Once pruebas nuevas: CRUD independiente en A/B; reapertura con altas, edición, cambio de estado y eliminación; vacío persistido; dos casos de título inválido; cancelación y foco; reinicio repetido preservando claves ajenas; datos corruptos con recuperación explícita; almacenamiento bloqueado; cuota agotada con rollback y conservación de la última instantánea durable.
- La prueba de navegación recorre las cuatro lecciones y vuelve a la primera.

Las pruebas usan DB y el adaptador local reales con Storage de jsdom. Simulan bloqueo y cuota mediante sus métodos para comprobar la reacción del laboratorio; no prueban la cuota de un perfil real ni una recarga de proceso de navegador.

## Verificación en Chrome DevTools

- Escritorio a 1440 × 1000: dos paneles legibles y sin solapamientos observados.
- Móvil emulado a 390 × 844: paneles apilados, formulario, acciones, inspector y pestañas de código dentro del ancho. `scrollWidth` de página: 390 px. El código tiene desplazamiento horizontal propio.
- Alta desde los dos formularios con Enter y recarga real: A volvió a tres tareas y B conservó la nueva.
- Eliminación de todas las tareas de B y recarga real: B siguió vacía y A conservó su semilla.
- Reinicio desde la interfaz: ambas listas volvieron a tres tareas; una clave ajena permaneció; el foco volvió a «Dos listas, dos destinos».
- Sin errores ni advertencias en las consultas de consola realizadas.

Parte de las activaciones se hizo por DOM con `evaluate_script`, además de `fill` y Enter con `press_key`. Las capturas se inspeccionaron en las respuestas de la herramienta. Se retiraron los datos temporales y se restauró la instantánea que había en B antes de la revisión.

## Límites y siguiente entrega

Es almacenamiento local, síncrono y limitado. No incorpora una API, autenticación, respaldo remoto, resolución de conflictos ni una cola offline duradera. El origen incluye protocolo, host y puerto; otra URL o perfil puede tener datos distintos. No se auditó sincronización entre pestañas, lectores de pantalla, todos los tamaños ni todos los navegadores.

La siguiente entrega es la lección 05: Query Collection y API HTTP simulada, con latencia y reconciliación explícita. La complejidad remota se introduce allí.
