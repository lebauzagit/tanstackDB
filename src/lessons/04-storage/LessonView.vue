<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import StoragePlayground from './StoragePlayground.vue'
import collectionsSource from './collections.ts?raw'
import actionsSource from './useTaskActions.ts?raw'
import querySource from './useTasks.ts?raw'
import sessionSource from './StoragePlayground.vue?raw'
import formSource from './TaskList.vue?raw'
import seedSource from './seed.ts?raw'

const codeTab = ref(0)
const files = [
  {
    title: 'Colecciones',
    filename: 'collections.ts',
    source: collectionsSource,
  },
  {
    title: 'Acciones CRUD',
    filename: 'useTaskActions.ts',
    source: actionsSource,
  },
  { title: 'Consulta', filename: 'useTasks.ts', source: querySource },
  {
    title: 'Sesión y reinicio',
    filename: 'StoragePlayground.vue',
    source: sessionSource,
  },
  { title: 'Formulario y lista', filename: 'TaskList.vue', source: formSource },
  { title: 'Semilla', filename: 'seed.ts', source: seedSource },
]
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 04
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">CRUD y persistencia local</span
      ><span class="quiet">Prerrequisito: fuente compartida</span>
    </div>
    <h1>¿Qué queda<br />al volver<span class="accent-dot">?</span></h1>
    <p class="page-intro">
      Crear, leer, actualizar y eliminar: el mismo CRUD sobre dos colecciones.
      La diferencia aparece al recargar.
    </p>

    <div class="shared-lesson-intro">
      <section class="guide-section">
        <span class="step-token">01 / ENTIENDE</span>
        <h2>Reactividad y persistencia.</h2>
        <p>
          Una consulta viva mantiene la pantalla al día. Persistir es guardar
          los datos para volver a abrirlos. Son responsabilidades diferentes.
        </p>
        <p>
          <code>localOnlyCollectionOptions</code> usa memoria.
          <code>localStorageCollectionOptions</code>, incluido en DB RC1,
          escribe en el almacenamiento de este navegador. Ambos permiten
          <code>insert</code>, <code>update</code> y <code>delete</code>.
        </p>
      </section>
      <section class="guide-section">
        <span class="step-token">02 / PREDICE</span>
        <h2>La misma tarea, otro destino.</h2>
        <p>
          Renombra una tarea en cada lista. Si recargas la página, ¿qué título
          esperas ver en A? ¿Y en B? ¿Qué pasaría si dejaras B completamente
          vacía?
        </p>
        <p class="handwritten-note">
          Antes de recargar, predice qué se conservará.
        </p>
      </section>
    </div>
    <section class="guide-section experiment">
      <span class="step-token">03 / EXPERIMENTA</span>
      <h2>Deja una señal y vuelve.</h2>
      <ol>
        <li>
          Añade «Volver a esta tarea» en cada lista. Usa «Editar» para cambiar
          un título y «Guardar título» para confirmarlo.
        </li>
        <li>
          Prueba «Cancelar edición»: el borrador cambia, pero las filas de DB
          todavía no.
        </li>
        <li>
          Completa una tarea y elimina otra en cada lista. Abre sus inspectores.
        </li>
        <li>
          Pulsa «Recargar la página». A vuelve a tres tareas; B recupera lo
          guardado.
        </li>
        <li>
          Elimina todas las tareas de B y recarga: seguirá vacía. «Reiniciar
          esta lección» repone ambas semillas.
        </li>
      </ol>
    </section>
    <StoragePlayground />

    <section class="code-section" aria-labelledby="storage-code-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="storage-code-heading">
            Cambia el destino, conserva las acciones.
          </h2>
        </div>
        <span class="quiet">Archivos reales de la práctica</span>
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
          Compara las dos fábricas en <code>collections.ts</code>. La fuente
          persistida se abre antes de montar su lector.
          <code>useTaskActions</code> valida los títulos y espera
          <code>when('settled')</code>; aquí significa que terminó el trabajo
          local del adaptador, no una confirmación de servidor.
        </p>
      </div>
    </section>
    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>Una clave no es un servidor.</h2>
        <p>
          En B, el adaptador serializa las tareas bajo una clave propia. Una
          apertura nueva restaura esa instantánea. Solo una clave ausente carga
          la semilla; una lista guardada vacía conserva tu decisión de eliminar
          todas las tareas.
        </p>
        <p>
          El reinicio desmonta los lectores, libera las colecciones, elimina
          únicamente la clave de esta práctica y vuelve a crearlas. Las demás
          lecciones no comparten estos datos.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>¿Lo verá otra persona?</h2>
        <p>
          Tu tarea sobrevive a una recarga. ¿Eso prueba que está guardada en una
          API o disponible en otro ordenador?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            No. localStorage pertenece al origen y al perfil de este navegador.
            Cambiar de puerto, navegador o dispositivo no abre los mismos datos.
            No hay autenticación, respaldo remoto ni autorización. El navegador
            puede bloquear el almacenamiento, agotar su cuota o borrarlo.
          </p>
        </details>
      </section>
    </div>
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Para practicar persistencia de pequeñas cantidades de estado local,
        preferencias o borradores sin servidor. El almacenamiento es síncrono y
        tiene límites; no demuestra una cola offline duradera ni resolución de
        conflictos. La siguiente lección introduce una API simulada y latencia.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/lessons/03-shared-collection"
        >← Lección 03: dos vistas compartidas</RouterLink
      ><RouterLink class="text-link" to="/lessons/05-remote-tasks"
        >Lección 05: API y latencia →</RouterLink
      >
    </div>
  </article>
</template>
