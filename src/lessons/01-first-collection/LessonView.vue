<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import TaskPlayground from './TaskPlayground.vue'
import collectionSource from './collections.ts?raw'
import composableSource from './useLocalTasks.ts?raw'
import componentSource from './TaskPlayground.vue?raw'
import seedSource from './seed.ts?raw'

const session = ref(0)
const codeTab = ref(0)
const experimentHeading = useTemplateRef<HTMLElement>('experiment-heading')
const files = [
  { title: 'Colección', filename: 'collections.ts', source: collectionSource },
  {
    title: 'Composable',
    filename: 'useLocalTasks.ts',
    source: composableSource,
  },
  {
    title: 'Componente',
    filename: 'TaskPlayground.vue',
    source: componentSource,
  },
  { title: 'Semilla', filename: 'seed.ts', source: seedSource },
]

async function reset() {
  // La key desmonta los lectores y su colección; el nuevo componente crea otra sesión.
  session.value++
  await nextTick()
  experimentHeading.value?.focus()
}
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 01
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">Fundamentos</span
      ><span class="quiet">Vue + composables · Primera práctica</span>
    </div>
    <h1>Tres tareas,<br />una colección<span class="accent-dot">.</span></h1>
    <p class="page-intro">
      ¿Qué aporta una colección? Cambia una tarea y sigue su recorrido: del dato
      de origen a lo que ves en pantalla.
    </p>

    <div class="lesson-workbench">
      <div class="lesson-guide">
        <section class="guide-section">
          <span class="step-token">01 / ENTIENDE</span>
          <h2>Un lugar para tus datos.</h2>
          <p>
            Una <strong>colección</strong> es un conjunto de objetos
            identificados por una clave. Aquí cada tarea tiene <code>id</code>,
            <code>title</code> y <code>completed</code>.
          </p>
          <p>
            Una <strong>consulta viva</strong> lee esa colección y mantiene su
            resultado al día cuando cambia un dato.
          </p>
        </section>
        <div
          class="data-flow"
          aria-label="Flujo: colección, consulta viva, componente Vue"
        >
          <span>Colección</span><span aria-hidden="true">↓</span
          ><span>Consulta viva</span><span aria-hidden="true">↓</span
          ><span>Componente Vue</span>
        </div>
        <section class="guide-section">
          <span class="step-token">02 / PREDICE</span>
          <h2>Antes de tocar nada…</h2>
          <p>
            Si completas la segunda tarea, ¿tendrás que actualizar también el
            JSON? ¿Se hará una petición al servidor?
          </p>
          <p class="handwritten-note">
            Haz tu predicción. Luego, compruébala →
          </p>
        </section>
        <section class="guide-section experiment">
          <span class="step-token">03 / EXPERIMENTA</span>
          <h2 ref="experiment-heading" tabindex="-1">
            Prueba un cambio pequeño.
          </h2>
          <ol>
            <li>Añade <strong>«Leer sobre colecciones»</strong>.</li>
            <li>Marca la nueva tarea como completada.</li>
            <li>Compara la colección y el resultado en el inspector.</li>
            <li>Reinicia: vuelves a las tres tareas originales.</li>
          </ol>
        </section>
        <div class="note">
          <strong>Solo vive en esta sesión.</strong>
          <p>
            LocalOnly guarda estas filas en memoria. Al recargar o salir de esta
            lección, se descartan. Todavía no estamos guardando nada en un
            backend.
          </p>
        </div>
      </div>
      <TaskPlayground :key="session" @reset="reset" />
    </div>

    <section class="code-section" aria-labelledby="code-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="code-heading">El código que lo hace posible.</h2>
        </div>
        <span class="quiet">Los mismos archivos que ejecuta esta demo</span>
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
          :source="file.source"
          :filename="file.filename"
      /></template>
      <div class="code-reading">
        <strong>Cómo leerlo</strong>
        <p>
          <code>collections.ts</code> configura los datos.
          <code>useLocalTasks()</code> conecta la consulta y las acciones. El
          componente usa el resultado para dibujar la lista. Los borradores del
          formulario son estado Vue; las tareas viven en DB.
        </p>
      </div>
    </section>

    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>Un cambio, dos maneras de verlo.</h2>
        <p>
          <code>insert()</code> añade una fila; <code>update()</code> cambia una
          existente. La colección publica el cambio, la consulta actualiza su
          resultado y Vue lo muestra.
        </p>
        <p>
          En esta práctica no hay filtros: ambas vistas contienen las mismas
          tareas. La consulta las ordena por ID. No se ejecuta ninguna petición
          de datos.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>¿Por qué necesita un ID?</h2>
        <p>
          Dos tareas pueden llamarse igual. ¿Podrían compartir también el mismo
          <code>id</code>?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            <code>getKey</code> identifica cada fila. Los títulos pueden
            repetirse; las claves deben ser únicas. Insertar un ID ya existente
            se rechaza: para modificar esa fila se usa
            <code>update(id, …)</code>.
          </p>
        </details>
      </section>
    </div>
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Cuando necesitas consultar y modificar datos locales con una estructura
        explícita. Para un formulario pequeño, un <code>ref</code> de Vue puede
        bastar. Las relaciones y la conexión con APIs mostrarán más adelante
        dónde aporta valor DB.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/">← Volver al recorrido</RouterLink>
      <RouterLink class="text-link" to="/lessons/02-filtered-tasks"
        >Lección 02: filtros reactivos →</RouterLink
      >
    </div>
  </article>
</template>
