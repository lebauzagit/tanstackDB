<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue'
import LabTraffic from '../../components/learning/LabTraffic.vue'
import type { RemoteSession } from './collections'
import { useRemoteTasks } from './useRemoteTasks'
import { useLabInspector } from './useLabInspector'

const { session } = defineProps<{ session: RemoteSession }>()
const {
  data: tasks,
  isLoading,
  isLoadingError,
  isCrashed,
  writing,
  reading,
  errorMessage,
  needsVerification,
  toggleTask,
  readAgain,
} = useRemoteTasks(session)
const { serverTasks, requests, events } = useLabInspector(session.lab)
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
const pendingRequests = computed(
  () => requests.value.filter((request) => request.status === 'pending').length,
)
const readButton = useTemplateRef<HTMLButtonElement>('read-button')

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
</script>

<template>
  <div class="remote-summary" role="status">
    <span
      >{{ requests.length }}
      {{ requests.length === 1 ? 'petición recibida' : 'peticiones recibidas' }}
      por el mock · {{ pendingRequests }} en curso</span
    >
    <strong>{{
      writing
        ? 'Esperando escritura y confirmación…'
        : reading
          ? 'Leyendo la API…'
          : 'Sin acción local pendiente'
    }}</strong>
  </div>
  <div class="remote-panels">
    <section class="remote-panel" aria-label="Cliente DB">
      <span class="tiny-label">A · COLECCIÓN DEL CLIENTE</span>
      <h3>La interfaz responde.</h3>
      <p class="quiet">
        El cambio optimista aparece antes de la respuesta HTTP.
      </p>
      <p
        v-if="(isLoadingError || isCrashed) && !tasks.length && !reading"
        class="error-message"
        role="alert"
      >
        No se pudo realizar la primera carga. Pulsa «Volver a leer la API» para
        reintentarlo.
      </p>
      <p v-else-if="(isLoading || reading) && !tasks.length" role="status">
        Cargando tareas por HTTP…
      </p>
      <ul v-else class="task-list" aria-label="Tareas remotas">
        <li
          v-for="task in tasks"
          :key="task.id"
          :class="{ completed: task.completed }"
        >
          <label
            ><input
              type="checkbox"
              :checked="task.completed"
              :disabled="writing || reading || needsVerification"
              @change="toggle(task.id, $event)"
            /><span>{{ task.title }}</span></label
          >
          <span v-if="task.pending" class="pending-badge">Pendiente local</span>
        </li>
      </ul>
      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
      <button
        ref="read-button"
        class="text-button"
        type="button"
        :disabled="
          writing || reading || (isLoading && !isLoadingError && !isCrashed)
        "
        @click="readAgain"
      >
        Volver a leer la API
      </button>
      <p class="field-hint">
        <code>pending</code> proyecta <code>$hasPendingWrites</code>: optimismo
        local, no prueba aislada de confirmación remota.
      </p>
      <details class="storage-inspector" open>
        <summary>JSON de la consulta del cliente</summary>
        <pre
          class="json-view"
          tabindex="0"
          aria-label="JSON del cliente remoto"
        ><code>{{ clientJson }}</code></pre>
      </details>
    </section>
    <section class="remote-panel" aria-label="API simulada">
      <span class="tiny-label">B · ESTADO AUTORITATIVO DEL MOCK</span>
      <h3>La API tiene sus datos.</h3>
      <p class="quiet">
        Este panel lee el estado independiente del handler, no la colección del
        cliente. Vive en este navegador y se pierde al recargar.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        aria-label="JSON de la API simulada"
      ><code>{{ serverJson }}</code></pre>
      <p class="field-hint">
        Durante el PATCH, A puede mostrar el nuevo estado mientras B conserva el
        anterior. Después del commit, un GET confirma el resultado.
      </p>
    </section>
  </div>
  <LabTraffic :requests="requests" :events="events" />
</template>
