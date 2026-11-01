<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import SharedPlayground from './SharedPlayground.vue'
import VueComparison from './VueComparison.vue'
import sessionSource from './SharedPlayground.vue?raw'
import allQuerySource from './useAllTasks.ts?raw'
import pendingQuerySource from './usePendingTasks.ts?raw'
import actionsSource from './useSharedTaskActions.ts?raw'
import allViewSource from './AllTasksView.vue?raw'
import pendingViewSource from './PendingTasksView.vue?raw'
import editorSource from './TaskEditorRow.vue?raw'
import collectionSource from './collections.ts?raw'
import vueSource from './useVueTaskExample.ts?raw'

const session = ref(0)
const codeTab = ref(0)
const experimentHeading = useTemplateRef<HTMLElement>('experiment-heading')
const files = [
  {
    title: 'Sesión compartida',
    filename: 'SharedPlayground.vue',
    source: sessionSource,
  },
  { title: 'Consulta A', filename: 'useAllTasks.ts', source: allQuerySource },
  {
    title: 'Consulta B',
    filename: 'usePendingTasks.ts',
    source: pendingQuerySource,
  },
  {
    title: 'Componente A',
    filename: 'AllTasksView.vue',
    source: allViewSource,
  },
  {
    title: 'Componente B',
    filename: 'PendingTasksView.vue',
    source: pendingViewSource,
  },
  {
    title: 'Acciones',
    filename: 'useSharedTaskActions.ts',
    source: actionsSource,
  },
  {
    title: 'Editor de tarea',
    filename: 'TaskEditorRow.vue',
    source: editorSource,
  },
  { title: 'Colección', filename: 'collections.ts', source: collectionSource },
  {
    title: 'Alternativa Vue',
    filename: 'useVueTaskExample.ts',
    source: vueSource,
  },
]

async function reset() {
  // Se recrean la sesión DB y la comparación Vue, cada una con su propia semilla.
  session.value++
  await nextTick()
  experimentHeading.value?.focus()
}
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 03
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">Estado compartido</span
      ><span class="quiet">Prerrequisito: filtros reactivos</span>
    </div>
    <h1>
      Dos ventanas,<br />los mismos datos<span class="accent-dot">.</span>
    </h1>
    <p class="page-intro">
      ¿Por qué varias vistas cambian juntas? Dos componentes hacen preguntas
      diferentes a una misma colección.
    </p>

    <div class="shared-lesson-intro">
      <section class="guide-section">
        <span class="step-token">01 / ENTIENDE</span>
        <h2>Comparte la fuente.</h2>
        <p>
          La práctica crea una colección y la pasa a ambos componentes mediante
          props. <code>useAllTasks(collection)</code> lee todas las tareas;
          <code>usePendingTasks(collection)</code> pregunta solo por las
          pendientes.
        </p>
        <p>
          Reutilizar un composable no comparte el estado automáticamente. Si
          creara una colección nueva en cada llamada, las vistas tendrían
          fuentes independientes.
        </p>
      </section>
      <section class="guide-section">
        <span class="step-token">02 / PREDICE</span>
        <h2>Dos consultas, ¿dos copias?</h2>
        <p>
          Si editas un título desde B, ¿tendrás que avisar a A para actualizar
          su lista? Si completas una pendiente desde A, ¿seguirá apareciendo en
          B?
        </p>
        <p class="handwritten-note">
          Observa la misma tarea en los dos componentes.
        </p>
      </section>
    </div>
    <section class="guide-section experiment">
      <span class="step-token">03 / EXPERIMENTA</span>
      <h2 ref="experiment-heading" tabindex="-1">Edita aquí. Observa allí.</h2>
      <ol>
        <li>
          Desde A, cambia el título de
          <strong>«Editar un título desde una vista»</strong>. Comprueba el
          nuevo título en B.
        </li>
        <li>
          Desde B, completa esa tarea: desaparece de B y queda marcada en A.
        </li>
        <li>Desde A, desmárcala: vuelve a aparecer en B.</li>
        <li>
          Opcional: desmonta B, edita desde A y vuelve a montar B. La fuente
          sigue existiendo.
        </li>
      </ol>
    </section>

    <SharedPlayground :key="session" @reset="reset" />

    <section class="code-section" aria-labelledby="shared-code-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="shared-code-heading">El código compartido.</h2>
        </div>
        <span class="quiet">Los archivos reales de los dos componentes</span>
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
          Empieza por <code>SharedPlayground.vue</code>: crea la colección fuera
          de las consultas y entrega la misma instancia a A y B. Después compara
          ambos composables. Las acciones escriben en la fuente; no envían
          eventos para mantener dos arrays sincronizados.
        </p>
      </div>
    </section>

    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>La misma fuente, dos resultados.</h2>
        <p>
          Al cambiar un título, las dos consultas reflejan el nuevo valor. Al
          completar una tarea, A la conserva y B la excluye por su condición. No
          hay dos colecciones que reconciliar.
        </p>
        <p>
          El borrador del formulario sí es estado Vue. Hasta pulsar «Guardar»,
          escribir o cancelar no modifica la tarea de origen.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>¿Esto sincroniza otro navegador?</h2>
        <p>
          Las dos vistas responden juntas. ¿Significa que una persona en otro
          ordenador verá tus cambios?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            No. Son dos componentes de la misma sesión que leen una fuente
            local. Compartir datos con otro cliente necesita una API y un
            mecanismo para recibir cambios. Aquí no hay peticiones de datos,
            almacenamiento duradero ni conexión entre navegadores.
          </p>
        </details>
      </section>
    </div>
    <VueComparison :key="session" />
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Cuando varios componentes necesitan leer y modificar las mismas
        entidades. Crea una fuente con un propietario claro y pásala a los
        lectores. El propietario la libera al terminar la sesión; desmontar una
        vista no debe destruir los datos que usa la otra.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/lessons/02-filtered-tasks"
        >← Lección 02: filtros reactivos</RouterLink
      ><RouterLink class="text-link" to="/lessons/04-storage"
        >Lección 04: CRUD y almacenamiento →</RouterLink
      >
    </div>
  </article>
</template>
