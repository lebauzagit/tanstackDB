# Referencia técnica y política de versión

Consulta inicial: **30 de octubre de 2026**. Objetivo del aprendizaje: **TanStack DB 1.0.0-rc.1**, una release candidate. Las URLs con `latest` son móviles; al implementar se debe contrastar su contenido con la versión fijada.

## Qué está confirmado

El [anuncio oficial de RC1](https://tanstack.com/blog/tanstack-db-1.0-rc1-going-all-in-on-oracles) presenta la primera candidata de 1.0. La [guía de migración](https://tanstack.com/db/latest/docs/guides/migrate-to-1-0-rc) identifica `1.0.0-rc.1` y advierte que algunos adaptadores tienen numeración independiente.

La [instalación oficial](https://tanstack.com/db/latest/docs/installation) incluye `@tanstack/vue-db`. No se debe asumir que todos los paquetes comparten el número de versión del core.

## Cambios de RC1 relevantes para este laboratorio

Resumen de la [guía de migración RC1](https://tanstack.com/db/latest/docs/guides/migrate-to-1-0-rc):

- `$synced` se sustituye por `$hasPendingWrites`, con significado booleano inverso.
- Esperar `transaction.when('settled')` en lugar de `isPersisted.promise`.
- Settlement depende del trabajo que espere el handler; no prueba por sí solo confirmación remota.
- Query Collection requiere reconciliación explícita en sus handlers: refetch o escritura de datos confirmados.
- Los handlers devuelven `Promise<void>`; no usar respuestas antiguas para coordinar sync.
- Distinguir `isLoadingError`, `isCrashed` e `isSyncError`; no copiar `isError` de ejemplos anteriores.
- Revisar `include()` en selecciones anidadas y `groupKeys()` cuando se agrupa sin agregados.
- La retirada de arrays de dependencias indicada para React no debe extrapolarse a Vue.

## Vue: verificación obligatoria

La [guía del adaptador Vue](https://tanstack.com/db/latest/docs/framework/vue/overview) y la [referencia de useLiveQuery](https://tanstack.com/db/latest/docs/framework/vue/reference/functions/useLiveQuery) consultadas muestran ejemplos con dependencias reactivas explícitas y algunos estados anteriores a RC1. No tomarlas como una instantánea coherente de la candidata.

Antes de escribir un composable, comprobar en los tipos y fuente del paquete instalado:

1. Sobrecarga de `useLiveQuery` elegida y uso de refs/getters.
2. Forma reactiva del resultado y acceso desde script y template.
3. Estados de carga, health y recuperación.
4. Soporte y necesidad de `DbClient` en ese patrón.
5. Adquisición, liberación y estabilidad de las colecciones.

La implementación debe documentar la firma realmente utilizada y validarla con typecheck y un cambio de filtro observable. No se incluye aquí un snippet aparentemente ejecutable construido mezclando generaciones de API.

## Matriz a resolver en el hito 1

| Paquete | Política |
| --- | --- |
| `@tanstack/db` | Objetivo exacto `1.0.0-rc.1`; comprobar publicación |
| `@tanstack/vue-db` | Versión publicada compatible con ese core; comprobar exports y peers |
| `@tanstack/query-db-collection` | `1.5.0`, instalado y verificado en 05; peer DB `^1.0.0-rc.0` |
| `@tanstack/query-core` | `5.105.1`, satisface el peer `^5.90.15` del adaptador |
| Vue, Vite, TypeScript y Vue Router | Versiones compatibles verificadas al crear el proyecto |
| Adaptador local persistido | `localStorageCollectionOptions` incluido en `@tanstack/db@1.0.0-rc.1`; verificado en lección 04 |
| MSW | `2.15.0`, compatible con el peer de Vitest 4.1.10; worker oficial generado |

**Estado:** versiones exactas instaladas y resueltas con `strict-peer-dependencies=true`, conservadas en `pnpm-lock.yaml`. Typecheck, lint, cincuenta pruebas y build pasan. Los registros del [hito 1](06-estado-hito-1.md), la [lección 02](07-estado-leccion-02.md), la [lección 03](08-estado-leccion-03.md), la [lección 04](10-estado-leccion-04.md) y la [lección 05](11-estado-leccion-05.md) detallan las comprobaciones. Los adaptadores de las lecciones futuras se verificarán al incorporarlos.

La lección 02 usa la sobrecarga Vue `useLiveQuery(queryFn, deps?)` con `[filter]`, donde `filter` es un `Ref<TaskFilter>`. Se contrastó con `node_modules/@tanstack/vue-db/src/useLiveQuery.ts` de RC1: el adaptador lee esas dependencias mediante `toValue` dentro de su resolución reactiva. Las pruebas cambian el filtro y conservan mutaciones previas sin remontar la práctica.

La lección 03 reutiliza esa sobrecarga con fuentes concretas estables. Se comprobó en la fuente instalada que el hook libera su observador al desmontarse; la colección compartida se limpia solo al terminar su propietario. Las pruebas desmontan y remontan un lector mientras el otro sigue modificando los datos.

En la lección 04 se contrastó la [guía LocalStorage](https://tanstack.com/db/latest/docs/collections/local-storage-collection), la [referencia de la fábrica](https://tanstack.com/db/latest/docs/reference/functions/localStorageCollectionOptions) y `node_modules/@tanstack/db/src/local-storage.ts` de RC1. La fábrica recibe `storageKey`, `storage` y `getKey`; el laboratorio usa `preload()` antes de montar la consulta. Las mutaciones directas esperan `when('settled')`, comprobando también rechazo y rollback ante cuota agotada. Se exige Storage real para que la interfaz no prometa persistencia si solo existe memoria.

En 05 se contrastaron `query-db-collection/src/query.ts`, las propiedades virtuales y `reload()` del core RC1, además de las APIs publicadas de MSW 2.15.0. Se usan `queryCollectionOptions` con `createCollection`, un QueryClient concreto y refetch explícito dentro del handler. Las pruebas verifican `$hasPendingWrites` proyectado como `pending`, optimismo, reconciliación, fallo posterior al commit y recuperación sin repetir la escritura. El worker se espera antes de montar lectores y se activa también en el build del tutorial.

## Fuentes para implementar cada bloque

| Fuente oficial | Uso |
| --- | --- |
| [Overview](https://tanstack.com/db/latest/docs/overview) | Modelo general y relación con fuentes de datos |
| [LocalOnly Collection](https://tanstack.com/db/latest/docs/collections/local-only-collection) | Primeras colecciones en memoria |
| [Live Queries](https://tanstack.com/db/latest/docs/guides/live-queries) | Filtros, relaciones, proyecciones y agregados |
| [Mutations](https://tanstack.com/db/latest/docs/guides/mutations) | Escrituras y frontera de confirmación |
| [Query Collection](https://tanstack.com/db/latest/docs/collections/query-collection) | HTTP, reconciliación y carga bajo demanda |
| [Migración RC1](https://tanstack.com/db/latest/docs/guides/migrate-to-1-0-rc) | Diferencias frente a ejemplos previos |

Las [mutaciones oficiales](https://tanstack.com/db/latest/docs/guides/mutations) separan cambio optimista, ejecución del handler y settlement. Por eso Taller DB verificará también el caso «escritura aplicada, lectura posterior fallida»: el laboratorio debe enseñar la frontera real de confirmación y recuperación.

## Orden para resolver discrepancias

1. Consultar Context7 si está disponible y verificar la versión de lo recuperado.
2. Contrastar con la guía de migración y documentación oficial.
3. Inspeccionar tipos y fuente publicados de la versión exacta.
4. Construir el ejemplo mínimo y verificar tipos más comportamiento.
5. Registrar discrepancias y la decisión adoptada en este documento.

Durante la redacción y el primer hito, Context7 no estaba disponible entre las herramientas conectadas. Se consultaron las fuentes oficiales enlazadas y GitHub MCP; las comprobaciones del primer hito ya se ejecutaron contra los paquetes RC1 instalados.
