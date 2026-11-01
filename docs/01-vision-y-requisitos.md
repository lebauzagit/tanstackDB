# Visión y requisitos

## Intención del usuario

Quiero aprender y comprender TanStack DB 1.0 RC1 mediante un proyecto Vue. Quiero ver ejemplos sencillos al principio y casos complejos al final, entender cómo organizarlos con composables y disponer de documentación que dé contexto a un agente de código.

## Propuesta: Taller DB

Una aplicación que funciona como laboratorio guiado. Su dominio es familiar: tareas de un pequeño equipo. La historia empieza en una lista personal y termina en un tablero de proyectos con responsables, métricas y acciones coordinadas.

La creatividad está en hacer visible lo que normalmente queda escondido: qué cambió inmediatamente, qué llegó a la API y qué sucede cuando algo falla.

## Perfil y conocimientos previos

El usuario conoce los fundamentos de Vue y TypeScript, pero está empezando con TanStack DB. No se presupone conocimiento de motores de sincronización, consultas incrementales ni arquitectura local-first. Los términos nuevos se definen antes de usarlos.

## Resultados de aprendizaje

Al terminar, el usuario debe poder:

1. Explicar dónde encaja DB entre Vue y una API.
2. Crear y consultar una colección tipada.
3. Construir un composable que preserve la reactividad de sus parámetros.
4. Comparar una consulta viva con una petición de red y con un `computed` sobre un array.
5. Entender el recorrido de una escritura y reconocer un cambio pendiente.
6. Diseñar consultas con relaciones y agregados sin duplicar entidades.
7. Conectar colecciones con una API y comprobar su reconciliación.
8. Separar una transacción optimista del cliente de una operación atómica del servidor.
9. Decidir cuándo cargar todos los datos o pedir subconjuntos.
10. Identificar los límites de una demo: persistencia, concurrencia, conectividad y seguridad.

## Anatomía de una lección

Cada pantalla tendrá, en este orden:

1. **Pregunta:** un problema concreto, por ejemplo «¿Por qué cambian dos listas al editar una tarea?».
2. **Idea clave:** explicación corta con vocabulario definido.
3. **Predicción:** una pregunta antes de ejecutar la acción.
4. **Demo:** controles mínimos para observar el comportamiento.
5. **Código real:** fragmentos de colección, composable y componente; señalar el bloque relevante.
6. **Qué ocurrió:** explicación del flujo y un registro legible.
7. **Experimento:** cambiar una condición con un resultado esperado.
8. **Comprueba que lo entendiste:** pequeño reto y solución desplegable.
9. **Cuándo usarlo:** utilidad y límites del patrón.

No se necesita un editor ejecutable dentro del navegador. Se necesita código copiable, enlazado a sus archivos y coherente con lo que está funcionando.

## Experiencia y navegación

- Inicio con mapa del recorrido, nivel y prerrequisitos.
- Una URL por lección: `/lessons/01-first-collection`, siguiendo el mismo patrón para las demás.
- Navegación anterior/siguiente y acceso directo a cualquier lección; sin bloqueos artificiales.
- Progreso de lectura opcional guardado localmente; independiente de los datos de negocio.
- En escritorio: explicación y demo visibles juntas; inspector plegable.
- En móvil: bloques apilados sin desbordamientos; código con desplazamiento horizontal.
- Navegación por teclado, etiquetas de formulario, foco visible y estados que no dependan solo del color.

## Inspector didáctico

Se introduce gradualmente: las primeras lecciones muestran filas y resultado; las posteriores añaden red y escrituras.

| Vista | Qué debe enseñar |
| --- | --- |
| Colección | Entidades de origen y claves estables |
| Consulta | Resultado actual y filtros aplicados |
| Escrituras | Acción local pendiente, completada o fallida |
| API simulada | Datos autoritativos de la simulación y peticiones realizadas |
| Cronología | Acción → actualización visible → petición → respuesta → reconciliación |

Los eventos del inspector serán instrumentación propia del laboratorio, identificada así; no se presentarán como una API oficial de Devtools. El panel de servidor no debe leer las filas del cliente para fingir que la persistencia funcionó.

## Requisitos funcionales transversales

- Semillas deterministas, con botón «Reiniciar esta lección».
- Reinicio: detener operaciones pendientes, desmontar lectores y recrear la sesión desde la semilla; las respuestas antiguas no pueden contaminar la nueva sesión.
- Selector de latencia para lecciones HTTP: 0, 500 y 1500 ms.
- Botón «Fallar la próxima escritura» de forma determinista; sin fallos aleatorios por defecto.
- Contador de peticiones, con explicación de qué operaciones requieren red.
- Tratamiento distinto de primera carga fallida, pérdida de actualización y escritura rechazada.
- Estado vacío y validación de formularios con mensajes comprensibles.
- Contenido y controles explicativos en español.

## Alcance y límites

El recorrido principal se ejecutará sin cuentas, claves ni infraestructura externa. La API simulada permite aprender contratos HTTP y fallos, pero sus datos se perderán al recargar. Una lección posterior podrá incorporar un backend real sin cambiar el propósito de las primeras.

No son objetivos iniciales: un SaaS desplegable, usuarios reales, facturación, permisos, SSR, un editor de código completo o comparar todos los adaptadores. El proyecto final debe ser limpio y verificable, sin añadir infraestructura que oculte lo que se está enseñando.

## Éxito del proyecto

El recorrido estará completo cuando las diez lecciones satisfagan sus criterios, el usuario pueda seguir una operación desde el componente hasta la fuente de datos y el caso final demuestre comportamientos correctos tanto al confirmar como al rechazar una escritura.
