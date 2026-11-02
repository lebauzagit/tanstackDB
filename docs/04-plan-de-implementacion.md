# Plan de implementación y validación

## Estado

- [x] Definir intención, experiencia, arquitectura y recorrido.
- [x] Consultar fuentes oficiales de RC1 y registrar las diferencias relevantes.
- [x] Verificar paquetes y crear aplicación Vue.
- [ ] Implementar y validar los hitos siguientes.

La base Vue y las lecciones 01–05 pasan las comprobaciones automáticas (cincuenta pruebas), typecheck, lint y build. Los hitos 1 y 2 están completos; el hito 3 tiene implementada y revisada la lección 05 y conserva pendiente 06. Véanse los registros del [hito 1](06-estado-hito-1.md), la [lección 02](07-estado-leccion-02.md), la [lección 03](08-estado-leccion-03.md), la [revisión visual](09-revision-visual.md), la [lección 04](10-estado-leccion-04.md) y la [lección 05](11-estado-leccion-05.md).

### Avance del hito 1

- [x] Inspeccionar instrucciones y revisar la API Vue en la fuente oficial.
- [x] Crear configuración Vue/Vite/TypeScript, router y scripts de calidad.
- [x] Escribir colección, composable, demo, inspector y reinicio por sesión.
- [x] Importar código real mediante `?raw`.
- [x] Escribir cuatro pruebas de interacción con la biblioteca real.
- [x] Comprobar sintaxis de scripts y formato; indexar el código.
- [x] Instalar dependencias, confirmar peers y generar lockfile.
- [x] Pasar typecheck, lint, pruebas y build.
- [x] Ejecutar y revisar la aplicación en navegador, escritorio y móvil.

## Hito 1 · Base y primera colección

1. Inspeccionar carpeta, instrucciones y herramientas disponibles.
2. Resolver la matriz de versiones exactas, compatibilidad y requisitos de Node.
3. Crear Vue con Vite, TypeScript estricto y pnpm; añadir router y scripts reales de calidad.
4. Instalar solo los paquetes necesarios para la lección 01.
5. Implementar su colección local, composable, componente y reinicio.
6. Mostrar código desde los archivos reales, con importación como texto o extracción verificable.

**Salida:** abrir la aplicación, añadir una tarea y explicar el flujo sin introducir HTTP. Typecheck, lint y build pasan. Una comprobación de interacción demuestra cambio visible y reinicio.

## Hito 2 · Fundamentos y persistencia local

- [x] Lección 02: filtro reactivo, proyección, orden estable, inspector y reinicio.
- [x] Navegación entre las cuatro lecciones y regresión automatizada de las anteriores.
- [x] Revisión visual de la lección 02.
- [x] Lección 03: dos componentes consistentes sobre la misma colección, edición, desmontaje y comparación Vue.
- [x] Revisión visual de la lección 03.
- [x] Corregir y verificar el foco al desaparecer filas en 02/03 y al guardar títulos en 03.
- [x] Lección 04: CRUD y comparación con persistencia local.
- [x] Revisión de 04 en escritorio/móvil, recarga real y reinicio limitado a su clave.

Implementar lecciones 02–04, estructura didáctica reutilizable y navegación. Añadir persistencia local únicamente en la comparación correspondiente.

**Salida:** filtros reactivos sin remontar; dos vistas consistentes; CRUD con validación; recarga y reinicio demuestran la diferencia entre memoria y persistencia local. Los ejemplos iniciales siguen siendo pequeños.

## Hito 3 · HTTP, latencia y errores

- [x] Lección 05: Query Collection, API MSW, cliente HTTP, latencia y reconciliación explícita.
- [x] Inspector de API independiente, peticiones y cronología.
- [x] Cancelación/reinicio con petición en vuelo, aislamiento y recuperación de errores cubiertos automáticamente.
- [x] Revisión en escritorio/móvil y del build estático con worker real.
- [ ] Lección 06: controles deterministas de fallo y recorrido guiado de rollback/recuperación.

Implementar API simulada, Query Collection, cliente HTTP y lecciones 05–06. Añadir cronología y controles de fallo. Fijar políticas de reintento para que el comportamiento sea reproducible.

**Salida:** carga HTTP visible, escritura pendiente con latencia, reconciliación, rechazo con rollback y aviso de actualización fallida sin vaciar datos útiles. Comprobar también escritura aceptada cuya lectura posterior falla.

## Hito 4 · Relaciones y acciones coordinadas

Implementar lecciones 07–08, entidades normalizadas, consultas relacionales, agregados y endpoint de intención.

**Salida:** renombrar un miembro actualiza el tablero; un proyecto sin tareas sigue visible; los conteos no se multiplican por joins; completar con actividad confirma o rechaza el conjunto. Repetir `operationId` no duplica eventos.

## Hito 5 · Escala y caso final

Implementar lecciones 09–10, contrato de subconjuntos, paginación, actor simulado y conflictos por versión.

**Salida:** solo se solicita el subconjunto esperado; cambiar filtros rápidamente no muestra respuestas antiguas; un 409 permite recuperar datos y reaplicar intención sin sobrescritura silenciosa. La UI identifica el alcance de las métricas.

## Hito 6 · Revisión del recorrido

Revisar contenido, accesibilidad, móvil, estados vacíos, retos y enlaces. Comprobar que todo fragmento corresponde al código que se ejecuta. Actualizar versiones resueltas y guía de ejecución real en README.

**Salida:** las diez lecciones tienen objetivo, demo, experimento, explicación, reto y solución; se puede completar el recorrido desde una instalación limpia.

## Matriz de validación

| Comportamiento | Verificación prevista |
| --- | --- |
| Tipos, imports y API RC1 | Typecheck contra los paquetes fijados |
| Compilación | Build de producción |
| Calidad | Lint configurado en el proyecto |
| Filtros reactivos | Cambiar filtro y comprobar filas sin remontar |
| Sesiones independientes | Mutar A, abrir B y verificar semillas separadas |
| Reinicio con petición en vuelo | Reiniciar durante latencia; ninguna respuesta antigua reaparece |
| Persistencia local | Recargar y limpiar únicamente el namespace de la lección |
| Confirmación HTTP | Comparar resultado cliente con estado independiente del mock |
| Rechazo | Forzar fallo y verificar cliente, servidor y mensaje |
| Fallo después del commit | Escritura aplicada, lectura fallida y recuperación sin duplicar |
| Relaciones y agregados | Fixtures con nulos, proyectos vacíos y relaciones múltiples |
| Acción coordinada | Éxito, rechazo e idempotencia |
| Carga parcial | Parámetros enviados, ventana devuelta y cobertura declarada |
| Conflicto | Versión antigua devuelve 409 y conserva la edición externa |
| Código mostrado | Extraído del archivo ejecutado o comprobado contra él |
| Experiencia | Navegación por teclado y revisión en móvil/escritorio |

Vitest se usará para lógica y composables cuando exista el código; las interacciones críticas se verificarán en navegador con la herramienta elegida al implementar. No crear suites para validar únicamente texto documental.

## Definición de terminado por lección

- Cumple su criterio de aceptación en la ruta de aprendizaje.
- Usa APIs verificadas y mantiene visible el concepto que enseña.
- Cubre sus estados relevantes y ofrece reinicio reproducible.
- Explicación, código e inspector describen el mismo comportamiento.
- Pasa las comprobaciones pertinentes y las comprobaciones generales disponibles.
- README y plan reflejan su estado real.

## Disciplina de implementación

Avanzar por lecciones funcionales con comprobaciones automáticas, conservando visibles las revisiones pendientes. Un hito solo se declara cerrado cuando completa también su revisión visual. No sustituir la primera lección por el tablero final ni introducir abstracciones anticipadas para cubrir todas las variantes. Si un paquete impide continuar con RC1, registrar el problema y resolver la compatibilidad explícitamente; no bajar a 0.x ni subir de versión sin señalar el cambio de objetivo.
