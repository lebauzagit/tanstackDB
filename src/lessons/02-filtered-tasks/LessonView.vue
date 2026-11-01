<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import FilteredPlayground from './FilteredPlayground.vue'
import collectionSource from './collections.ts?raw'
import composableSource from './useFilteredTasks.ts?raw'
import componentSource from './FilteredPlayground.vue?raw'
import seedSource from './seed.ts?raw'

const session = ref(0)
const codeTab = ref(0)
const experimentHeading = useTemplateRef<HTMLElement>('experiment-heading')
const files = [
  {
    title: 'Consulta reactiva',
    filename: 'useFilteredTasks.ts',
    source: composableSource,
  },
  {
    title: 'Componente',
    filename: 'FilteredPlayground.vue',
    source: componentSource,
  },
  { title: 'Colección', filename: 'collections.ts', source: collectionSource },
  { title: 'Semilla', filename: 'seed.ts', source: seedSource },
]

async function reset() {
  session.value++
  await nextTick()
  experimentHeading.value?.focus()
}
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 02
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">Consultas reactivas</span
      ><span class="quiet">Prerrequisito: primera colección</span>
    </div>
    <h1>Pregúntale<br />a los datos<span class="accent-dot">.</span></h1>
    <p class="page-intro">
      ¿Cómo cambia la consulta cuando cambio un filtro? Cuatro tareas, tres
      preguntas y una colección que conserva sus datos.
    </p>

    <div class="lesson-workbench">
      <div class="lesson-guide">
        <section class="guide-section">
          <span class="step-token">01 / ENTIENDE</span>
          <h2>Elegir no es borrar.</h2>
          <p>
            <code>where</code> decide qué filas aparecen. Al elegir
            «Pendientes», la consulta busca tareas con
            <code>completed = false</code>; las completadas siguen en la
            colección.
          </p>
          <p>
            <code>select</code> da forma al resultado. Aquí renombramos
            <code>title</code> como <code>label</code> para la lista,
            conservando el ID.
          </p>
        </section>
        <div
          class="data-flow"
          aria-label="Flujo: filtro reactivo, consulta viva, lista visible"
        >
          <span>Filtro reactivo</span><span aria-hidden="true">↓</span
          ><span>Consulta viva</span><span aria-hidden="true">↓</span
          ><span>Lista visible</span>
        </div>
        <section class="guide-section">
          <span class="step-token">02 / PREDICE</span>
          <h2>¿Desaparece o se elimina?</h2>
          <p>
            Selecciona «Pendientes». Si completas una tarea visible, ¿seguirá en
            esa lista? ¿Seguirá en el JSON de origen?
          </p>
          <p class="handwritten-note">
            Cambia la pregunta; luego cambia un dato →
          </p>
        </section>
        <section class="guide-section experiment">
          <span class="step-token">03 / EXPERIMENTA</span>
          <h2 ref="experiment-heading" tabindex="-1">
            Sigue a la misma tarea.
          </h2>
          <ol>
            <li>Selecciona <strong>«Pendientes»</strong>.</li>
            <li>Completa la tarea <strong>«Cambiar un filtro»</strong>.</li>
            <li>Comprueba que sale del resultado y permanece en el origen.</li>
            <li>
              Elige <strong>«Completadas»</strong>: allí aparece con su nuevo
              estado.
            </li>
            <li>
              Vuelve a <strong>«Todas»</strong>. Siguen existiendo cuatro
              tareas.
            </li>
          </ol>
        </section>
        <div class="note">
          <strong>El filtro también es reactivo.</strong>
          <p>
            El componente pasa el ref <code>filter</code> al composable. La
            colección se crea una sola vez; el adaptador observa ese ref para
            actualizar la consulta sin remontar la práctica.
          </p>
        </div>
      </div>
      <FilteredPlayground :key="session" @reset="reset" />
    </div>

    <section class="code-section" aria-labelledby="filtered-code-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="filtered-code-heading">Lee la pregunta en el código.</h2>
        </div>
        <span class="quiet">Archivos reales de esta lección</span>
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
          Busca <code>filter.value</code> dentro de la función de consulta y
          <code>[filter]</code> en <code>useLiveQuery</code>. En el adaptador
          Vue RC1 instalado, esa lista admite refs. La fábrica de colección
          queda fuera de la consulta para conservar su identidad y sus cambios.
        </p>
      </div>
    </section>

    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>Dos cambios diferentes.</h2>
        <p>
          Elegir otro filtro cambia los parámetros de la consulta. Marcar una
          tarea cambia <code>completed</code> en la colección, y la consulta
          vuelve a reflejar qué filas cumplen la condición.
        </p>
        <p>
          Dos tareas tienen el mismo título a propósito. Dos llamadas a
          <code>orderBy</code> definen la prioridad: primero título, después ID
          para desempatar. No dependemos del orden de inserción.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>Una lista vacía, ¿cero tareas?</h2>
        <p>
          Completa todas las pendientes. ¿Qué significa que la lista
          «Pendientes» esté vacía?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            No queda ninguna tarea que cumpla <code>completed = false</code>. La
            colección conserva las cuatro. Cambia a «Todas» para comprobarlo.
            Del mismo modo, <code>select</code> cambia la estructura del
            resultado, no la entidad de origen.
          </p>
        </details>
      </section>
    </div>
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Para listas cuyo resultado depende de controles reactivos: estado,
        categoría o responsable. En esta práctica los datos ya están en memoria;
        cambiar el filtro no hace peticiones HTTP. Consultar subconjuntos
        remotos se estudiará más adelante.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/lessons/01-first-collection"
        >← Lección 01: primera colección</RouterLink
      >
      <RouterLink class="text-link" to="/lessons/03-shared-collection"
        >Lección 03: dos vistas compartidas →</RouterLink
      >
    </div>
  </article>
</template>
