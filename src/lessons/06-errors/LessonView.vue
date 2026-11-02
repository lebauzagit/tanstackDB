<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import SourceCode from '../../components/learning/SourceCode.vue'
import ErrorPlayground from './ErrorPlayground.vue'
import setupSource from './collections.ts?raw'
import scenariosSource from './useFailureScenarios.ts?raw'
import sharedCollectionSource from '../05-remote-tasks/collections.ts?raw'
import actionsSource from '../05-remote-tasks/useRemoteTasks.ts?raw'
import mockSource from '../../mocks/taskLab.ts?raw'
import handlerSource from '../../mocks/handlers.ts?raw'
import viewSource from './ErrorTasks.vue?raw'
import sessionSource from './ErrorPlayground.vue?raw'
import trafficSource from '../../components/learning/LabTraffic.vue?raw'

const codeTab = ref(0)
const files = [
  {
    title: 'Escenarios',
    filename: 'useFailureScenarios.ts',
    source: scenariosSource,
  },
  {
    title: 'Acciones y errores',
    filename: 'useRemoteTasks.ts',
    source: actionsSource,
  },
  {
    title: 'Sesión de 06',
    filename: '06-errors/collections.ts',
    source: setupSource,
  },
  {
    title: 'Colección compartida',
    filename: '05-remote-tasks/collections.ts',
    source: sharedCollectionSource,
  },
  {
    title: 'Fallos del mock',
    filename: 'mocks/taskLab.ts',
    source: mockSource,
  },
  {
    title: 'Handlers HTTP',
    filename: 'mocks/handlers.ts',
    source: handlerSource,
  },
  { title: 'Vista', filename: 'ErrorTasks.vue', source: viewSource },
  { title: 'Reinicio', filename: 'ErrorPlayground.vue', source: sessionSource },
  { title: 'Registro HTTP', filename: 'LabTraffic.vue', source: trafficSource },
]
</script>

<template>
  <article class="page lesson-page">
    <p class="eyebrow">
      <RouterLink to="/">EL RECORRIDO</RouterLink><span>/</span> LECCIÓN 06
    </p>
    <div class="lesson-title-row">
      <span class="level-badge">Errores y recuperación</span
      ><span class="quiet">Prerrequisito: HTTP y reconciliación</span>
    </div>
    <h1>Romperlo<br />para entenderlo<span class="accent-dot">.</span></h1>
    <p class="page-intro">
      ¿Qué significa que una operación falle? Prepara un rechazo, conserva datos
      útiles y recupera el estado sin repetir una escritura aceptada.
    </p>
    <div class="shared-lesson-intro">
      <section class="guide-section">
        <span class="step-token">01 / ENTIENDE</span>
        <h2>Fallar no cuenta toda la historia.</h2>
        <p>
          Un PATCH rechazado antes del commit permite revertir el optimismo
          local. Un GET fallido solo informa de una lectura: no deshace una
          escritura que la API ya aceptó.
        </p>
        <p>
          Una primera carga fallida deja al cliente sin datos. Una actualización
          fallida debe conservar el último resultado disponible y avisar del
          problema.
        </p>
      </section>
      <section class="guide-section">
        <span class="step-token">02 / PREDICE</span>
        <h2>La casilla vuelve atrás. ¿Y la API?</h2>
        <p>
          Si la API acepta un cambio y falla su GET de confirmación, DB puede
          revertir el optimismo de una transacción fallida. ¿Eso prueba que la
          API también volvió al estado anterior?
        </p>
        <p class="handwritten-note">
          Compara A y B antes de decidir qué repetir.
        </p>
      </section>
    </div>
    <section class="guide-section experiment">
      <span class="step-token">03 / EXPERIMENTA</span>
      <h2>Provoca un fallo cada vez.</h2>
      <ol>
        <li>
          <strong>Rechazo:</strong> pulsa «Fallar la próxima escritura» y
          completa una tarea. Observa el cambio inmediato, el HTTP 422 y el
          rollback. B conserva su valor anterior.
        </li>
        <li>
          <strong>Lectura con datos:</strong> pulsa «Fallar la próxima lectura»
          y «Volver a leer la API». El GET 503 no vacía las tareas. Repite la
          lectura para recuperar.
        </li>
        <li>
          <strong>Commit sin confirmación:</strong> pulsa «Aceptar y fallar
          confirmación» y cambia una tarea. B aplica el cambio; el GET falla.
          Recupera con una lectura, sin repetir el PATCH.
        </li>
        <li>
          <strong>Primera carga:</strong> pulsa «Fallar la primera carga · nueva
          sesión». A no tiene tareas recuperadas; B sí tiene su semilla. Usa
          «Reintentar primera carga».
        </li>
        <li>
          Reinicia durante una petición o con un fallo preparado. La nueva
          sesión recupera la semilla sin arrastrar fallos anteriores.
        </li>
      </ol>
    </section>
    <ErrorPlayground />
    <section class="code-section" aria-labelledby="errors-code-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">04 / CONECTA LAS PIEZAS</p>
          <h2 id="errors-code-title">La recuperación depende del fallo.</h2>
        </div>
        <span class="quiet"
          >Código real, compartido con 05 cuando corresponde</span
        >
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
          Los handlers consumen fallos de una sola petición en el mock.
          <code>useRemoteTasks</code> distingue rechazo y confirmación fallida,
          conserva los datos de lectura y pide verificar antes de escribir otra
          vez. La recuperación usa GET; el handler de escritura sigue siendo
          PATCH + refetch.
        </p>
      </div>
    </section>
    <div class="recap-grid">
      <section>
        <p class="eyebrow">05 / QUÉ OCURRIÓ</p>
        <h2>Rollback del cliente, estado de la API.</h2>
        <p>
          El rechazo 422 de esta simulación ocurre antes de modificar el mock.
          DB revierte el cambio optimista. En el otro caso, PATCH responde 200 y
          el GET falla con 503: una transacción cliente fallida no deshace ese
          commit de la API.
        </p>
        <p>
          Por eso <code>$hasPendingWrites = false</code> no prueba por sí solo
          que ambas fuentes coincidan. La interfaz explica la incertidumbre y
          recupera el estado con otra lectura.
        </p>
      </section>
      <section class="challenge">
        <p class="eyebrow">06 / COMPRUÉBALO</p>
        <h2>¿Reintentar siempre es seguro?</h2>
        <p>
          La lectura de confirmación falló después de aceptar la escritura.
          ¿Repetirías la escritura o leerías primero el estado autoritativo?
        </p>
        <details>
          <summary>Ver la explicación</summary>
          <p>
            Leer primero evita duplicar una intención ya aceptada. Aquí
            completar una tarea envía un estado concreto, pero otras operaciones
            podrían crear eventos, cobros o envíos. Diseñar reintentos e
            idempotencia necesita un contrato explícito; esta práctica no
            implementa esos sistemas.
          </p>
        </details>
      </section>
    </div>
    <section class="when-to-use">
      <strong>Cuándo usar este patrón</strong>
      <p>
        Para separar primera carga, actualización, rechazo y confirmación
        incompleta. Los fallos son deterministas y los reintentos automáticos
        están deshabilitados. No se demuestra trabajo offline duradero ni
        resolución de conflictos. Las relaciones entre entidades llegan en la
        lección 07.
      </p>
    </section>
    <div class="lesson-end">
      <RouterLink class="text-link" to="/lessons/05-remote-tasks"
        >← Lección 05: API y latencia</RouterLink
      ><span class="quiet"
        >Próxima práctica: relaciones sin duplicación · En preparación</span
      >
    </div>
  </article>
</template>
