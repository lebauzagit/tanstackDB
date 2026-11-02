<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import type { RemoteSession } from '../05-remote-tasks/collections'
import LabTraffic from '../../components/learning/LabTraffic.vue'
import { useFailureScenarios } from './useFailureScenarios'

const { session } = defineProps<{ session: RemoteSession }>()
const emit = defineEmits<{ firstLoadFailure: [] }>()
const {
  data: tasks,
  isLoading,
  isLoadingError,
  isCrashed,
  reading,
  errorMessage,
  failure,
  needsVerification,
  serverTasks,
  requests,
  events,
  faults,
  busy,
  canArm,
  outcome,
  toggleTask,
  readAgain,
  rejectNextWrite,
  failNextRead,
  failConfirmation,
} = useFailureScenarios(session)
const latency = ref(session.lab.latencyMs)
const readButton = useTemplateRef<HTMLButtonElement>('read-button')
const clientJson = computed(() =>
  JSON.stringify(
    tasks.value.map(({ id, title, completed, pending }) => ({
      id,
      title,
      completed,
      pending,
    })),
    null,
    2,
  ),
)
const serverJson = computed(() => JSON.stringify(serverTasks.value, null, 2))
const pendingCount = computed(
  () => requests.value.filter((request) => request.status === 'pending').length,
)

async function toggle(id: string, event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const hadFocus = document.activeElement === input
  await toggleTask(id)
  await nextTick()
  if (
    hadFocus &&
    input.isConnected &&
    (document.activeElement === document.body ||
      document.activeElement === input)
  ) {
    if (needsVerification.value) readButton.value?.focus()
    else input.focus()
  }
}

async function read(event: Event) {
  const button = event.currentTarget as HTMLButtonElement
  const hadFocus = document.activeElement === button
  await readAgain()
  await nextTick()
  if (
    hadFocus &&
    button.isConnected &&
    document.activeElement === document.body
  )
    button.focus()
}
</script>

<template>
  <div
    class="failure-controls"
    role="group"
    aria-label="Preparar fallos deterministas"
  >
    <h3>Prepara un fallo; después ejecuta la acción.</h3>
    <p class="quiet">
      Los tres primeros botones preparan una única petición futura. No hacen
      HTTP por sí solos. El cuarto crea una sesión nueva cuya primera lectura
      falla.
    </p>
    <div class="failure-buttons">
      <button
        class="button"
        type="button"
        :disabled="!canArm"
        @click="rejectNextWrite"
      >
        Fallar la próxima escritura
      </button>
      <button
        class="button"
        type="button"
        :disabled="!canArm"
        @click="failNextRead"
      >
        Fallar la próxima lectura
      </button>
      <button
        class="button"
        type="button"
        :disabled="!canArm"
        @click="failConfirmation"
      >
        Aceptar y fallar confirmación
      </button>
      <button
        class="button first-load-failure"
        type="button"
        :disabled="busy"
        @click="emit('firstLoadFailure')"
      >
        Fallar la primera carga · nueva sesión
      </button>
    </div>
    <p class="failure-plan" role="status">
      {{
        faults.write === 'reject'
          ? 'Próximo PATCH: rechazo 422 antes del commit.'
          : faults.write === 'confirmation'
            ? 'Próximo PATCH: aceptado; su GET de confirmación fallará con 503.'
            : 'Sin fallo de escritura preparado.'
      }}
      {{
        faults.read
          ? 'Próximo GET: fallo 503.'
          : 'Sin fallo de lectura preparado.'
      }}
    </p>
    <label
      >Latencia por petición
      <select
        v-model.number="latency"
        :disabled="busy"
        @change="session.lab.setLatency(latency)"
      >
        <option :value="0">0 ms</option>
        <option :value="500">500 ms</option>
        <option :value="1500">1500 ms</option>
      </select></label
    >
    <p class="field-hint">
      500 ms permiten observar el cambio optimista. PATCH + GET esperan una vez
      cada uno. No hay reintentos automáticos.
    </p>
  </div>
  <div class="remote-summary" role="status">
    <span
      >{{ requests.length }}
      {{
        requests.length === 1 ? 'petición recibida' : 'peticiones recibidas'
      }}
      · {{ pendingCount }} en curso</span
    ><strong>{{ outcome }}</strong>
  </div>
  <div class="remote-panels">
    <section
      class="remote-panel"
      aria-label="Cliente en el laboratorio de errores"
    >
      <span class="tiny-label">A · CLIENTE DB</span>
      <h3>El último resultado disponible.</h3>
      <p
        v-if="!tasks.length && (isLoadingError || isCrashed) && !reading"
        class="error-message"
        role="alert"
      >
        Falló la primera carga. Aún no se recuperó ninguna tarea para el
        cliente.
      </p>
      <p v-else-if="(isLoading || reading) && !tasks.length" role="status">
        Cargando por HTTP…
      </p>
      <ul
        v-else
        class="task-list"
        aria-label="Tareas del laboratorio de errores"
      >
        <li
          v-for="task in tasks"
          :key="task.id"
          :class="{ completed: task.completed }"
        >
          <label
            ><input
              type="checkbox"
              :checked="task.completed"
              :disabled="busy || needsVerification"
              @change="toggle(task.id, $event)"
            /><span>{{ task.title }}</span></label
          ><span v-if="task.pending" class="pending-badge"
            >Pendiente local</span
          >
        </li>
      </ul>
      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
      <p v-if="failure === 'read-failed' && tasks.length" class="failure-note">
        La lectura falló; conservamos las {{ tasks.length }} tareas disponibles.
        No se vacía una lista útil por un error de actualización.
      </p>
      <p v-if="needsVerification" class="failure-note">
        No repitas la escritura: primero recupera el estado con una lectura. No
        tener escrituras pendientes no prueba que el cliente coincida con la
        API.
      </p>
      <button
        ref="read-button"
        class="button primary read-api"
        type="button"
        :disabled="busy"
        @click="read"
      >
        {{
          reading
            ? 'Leyendo…'
            : !tasks.length && (isLoadingError || isCrashed)
              ? 'Reintentar primera carga'
              : 'Volver a leer la API'
        }}
      </button>
      <p class="field-hint">
        Recuperar solo envía GET. Una lectura fallida después del commit no
        deshace lo guardado en la API simulada.
      </p>
      <details class="storage-inspector" open>
        <summary>JSON del cliente y optimismo local</summary>
        <pre
          class="json-view"
          tabindex="0"
          aria-label="JSON del cliente de errores"
        ><code>{{ clientJson }}</code></pre>
      </details>
    </section>
    <section class="remote-panel" aria-label="API del laboratorio de errores">
      <span class="tiny-label">B · API SIMULADA INDEPENDIENTE</span>
      <h3>¿La escritura llegó a aplicarse?</h3>
      <p class="quiet">
        El handler del mock conserva sus propias filas. Este panel no copia
        datos de DB. Compáralo con A tras cada error.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        aria-label="JSON de la API de errores"
      ><code>{{ serverJson }}</code></pre>
      <p class="field-hint">
        422: escritura rechazada antes del commit. 503: lectura simulada
        fallida; por sí sola no dice si una escritura previa fue aceptada.
      </p>
    </section>
  </div>
  <LabTraffic :requests="requests" :events="events" show-status-codes />
</template>
