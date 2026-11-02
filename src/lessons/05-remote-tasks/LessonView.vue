<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import RemotePlayground from './RemotePlayground.vue'
import collectionSource from './collections.ts?raw'
import querySource from './useRemoteTasks.ts?raw'
import apiSource from '../../api/tasks.ts?raw'
import handlerSource from '../../mocks/handlers.ts?raw'
import labSource from '../../mocks/taskLab.ts?raw'
import workerSource from '../../mocks/browser.ts?raw'
import sessionSource from './RemotePlayground.vue?raw'
import viewSource from './RemoteTasks.vue?raw'
import inspectorSource from './useLabInspector.ts?raw'
import trafficSource from '../../components/learning/LabTraffic.vue?raw'

const codeTab = ref(0)
const files = [
  {
    title: 'Colección y handler',
    filename: 'collections.ts',
    source: collectionSource,
  },
  { title: 'Composable', filename: 'useRemoteTasks.ts', source: querySource },
  { title: 'Cliente HTTP', filename: 'api/tasks.ts', source: apiSource },
  {
    title: 'Rutas del mock',
    filename: 'mocks/handlers.ts',
    source: handlerSource,
  },
  { title: 'Estado del mock', filename: 'mocks/taskLab.ts', source: labSource },
  { title: 'Arranque MSW', filename: 'mocks/browser.ts', source: workerSource },
  {
    title: 'Sesión y reinicio',
    filename: 'RemotePlayground.vue',
    source: sessionSource,
  },
  { title: 'Vista', filename: 'RemoteTasks.vue', source: viewSource },
  {
    title: 'Inspector',
    filename: 'useLabInspector.ts',
    source: inspectorSource,
  },
  { title: 'Registro HTTP', filename: 'LabTraffic.vue', source: trafficSource },
]
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 05
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">HTTP y escrituras optimistas</span
      ><span class="quiet">Prerrequisito: CRUD y almacenamiento</span>
    </div>
    <h1>
      La API tarda,<br />la interfaz responde<span class="accent-dot">.</span>
    </h1>
    <p class="page-intro">
      ¿Cuándo viaja un cambio por la red? Observa un dato en el cliente, en una
      API simulada y durante la lectura que los vuelve a reconciliar.
    </p>
    <div class="shared-lesson-intro">
      <section class="guide-section">
        <span class="step-token">01 / ENTIENDE</span>
        <h2>Tres responsabilidades.</h2>
        <p>
          Vue presenta la lista. TanStack DB mantiene la colección y el cambio
          optimista. Query Collection usa Query Core para leer por HTTP y un
          handler para escribir y confirmar.
        </p>
        <p>
          En esta práctica, el handler espera un PATCH y pide un GET. La
          respuesta de escritura por sí sola no sustituye las filas de la
          colección.
        </p>
      </section>
      <section class="guide-section">
        <span class="step-token">02 / PREDICE</span>
        <h2>¿Ya está guardado?</h2>
        <p>
          Con 1500 ms de latencia, si marcas una tarea, ¿cambia primero A o B?
          ¿La casilla marcada demuestra que la API ya aceptó el cambio?
        </p>
        <p class="handwritten-note">
          Una interfaz rápida no es una confirmación remota.
        </p>
      </section>
    </div>
    <section class="guide-section experiment">
      <span class="step-token">03 / EXPERIMENTA</span>
      <h2>Sigue el cambio de extremo a extremo.</h2>
      <ol>
        <li>Espera la primera carga. El contador mostrará un GET.</li>
        <li>Elige 1500 ms y completa «Completar sin esperar a la red».</li>
        <li>
          Compara A y B durante la espera: cambia el cliente antes que el mock.
        </li>
        <li>
          Observa el PATCH, el cambio en B y el GET de confirmación. La marca
          «Pendiente local» termina al asentarse la escritura.
        </li>
        <li>
          Prueba «Volver a leer la API»: añade un GET sin escribir. Reinicia
          durante otra escritura y comprueba que los datos anteriores no
          reaparecen.
        </li>
      </ol>
    </section>
    <RemotePlayground />
    <section class="code-section" aria-labelledby="remote-code-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="remote-code-title">El handler define qué esperar.</h2>
        </div>
        <span class="quiet">Código real de esta práctica</span>
      </div>
      <div class="code-tabs" role="group" aria-label="Archivos del ejemplo">
        <button
          v-for="(file, index) in files"
          :key="file.filename"
          type="button"
          :aria-pressed="codeTab === index"
          @click="codeTab = index"
        >
          {{ file.title }}
        </button>
      </div>
      <template v-for="(file, index) in files" :key="file.filename"
        ><SourceCode
          v-if="codeTab === index"
          :filename="file.filename"
          :source="file.source"
      /></template>
      <div class="code-reading">
        <strong>Cómo leerlo</strong>
        <p>
          Busca <code>queryFn</code> para la lectura y
          <code>onUpdate</code> para PATCH +
          <code>collection.utils.refetch({ throwOnError: true })</code>. El
          composable espera <code>when('settled')</code>. Esa espera cubre el
          trabajo concreto del handler de este ejemplo, no una garantía
          universal de persistencia.
        </p>
      </div>
    </section>
    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>Optimismo, escritura, reconciliación.</h2>
        <p>
          Al marcar, DB cambia la vista local y señala
          <code>$hasPendingWrites</code>. El mock aplica la escritura después de
          su latencia. El handler pide datos autoritativos y la consulta refleja
          el resultado confirmado.
        </p>
        <p>
          Las claves de caché y rutas incluyen una sesión nueva por reinicio.
          Cancelar peticiones y cerrar el estado del mock evita que una
          respuesta antigua contamine la práctica nueva.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>¿Una consulta viva hace HTTP por cada fila?</h2>
        <p>
          Ya están cargadas las tres tareas. ¿Cada actualización visible
          necesita una petición independiente por fila?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            No. La consulta de esta práctica trabaja sobre una colección cargada
            completa. Su lectura inicial es un GET; una acción ejecuta PATCH +
            GET porque así se programó el handler. La consulta viva no define
            por sí sola un endpoint por fila. Más adelante veremos carga parcial
            y errores controlados.
          </p>
        </details>
      </section>
    </div>
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Para conectar una colección a una API mediante lecturas y handlers de
        escritura explícitos. Aquí todo lo remoto está simulado con MSW y se
        reinicia al recargar. No hay autorización, respaldo remoto ni trabajo
        offline duradero. La lección 06 añade controles deterministas para
        estudiar errores y recuperación.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/lessons/04-storage"
        >← Lección 04: CRUD y almacenamiento</RouterLink
      ><RouterLink class="text-link" to="/lessons/06-errors"
        >Lección 06: errores y recuperación →</RouterLink
      >
    </div>
  </article>
</template>
