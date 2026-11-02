<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
} from 'vue'
import { createFailureSession } from './collections'
import type { RemoteSession } from '../05-remote-tasks/collections'
import ErrorTasks from './ErrorTasks.vue'

const session = shallowRef<RemoteSession | null>(null)
const booting = ref(true)
const resetting = ref(false)
const bootError = ref('')
const heading = useTemplateRef<HTMLElement>('error-heading')
let disposed = false

async function start() {
  booting.value = true
  bootError.value = ''
  try {
    const { ensureMockApi } = await import('../../mocks/browser')
    await ensureMockApi()
    if (!disposed) session.value = createFailureSession()
  } catch {
    bootError.value =
      'No se pudo activar la API simulada. Usa localhost/127.0.0.1 o HTTPS y comprueba que el navegador permite service workers.'
  } finally {
    booting.value = false
  }
}

async function restart(failFirstRead = false) {
  if (booting.value || resetting.value) return
  resetting.value = true
  const previous = session.value
  previous?.stop()
  session.value = null
  await nextTick()
  try {
    await previous?.dispose()
    if (!disposed) session.value = createFailureSession(failFirstRead)
  } catch {
    bootError.value =
      'No se pudo reiniciar la práctica. Vuelve a activar la simulación.'
  } finally {
    resetting.value = false
    await nextTick()
    if (!disposed) heading.value?.focus()
  }
}

onMounted(start)
onUnmounted(() => {
  disposed = true
  void session.value
    ?.dispose()
    .catch((error: unknown) =>
      console.error('No se pudo liberar la lección 06.', error),
    )
})
</script>

<template>
  <section class="playground" aria-labelledby="error-playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2 id="error-playground-title" ref="error-heading" tabindex="-1">
          Un error, varias historias
        </h2>
      </div>
      <span class="storage-badge">API HTTP simulada</span>
    </div>
    <p class="remote-disclosure">
      Fallos preparados y de una sola petición. MSW simula una API con datos
      propios en este navegador. No hay servidor desplegado ni persistencia
      remota; recargar restaura la semilla.
    </p>
    <p v-if="booting || resetting" class="playground-body" role="status">
      {{
        booting
          ? 'Activando la simulación…'
          : 'Cancelando peticiones y recreando la sesión…'
      }}
    </p>
    <div v-else-if="bootError" class="playground-body">
      <p class="error-message" role="alert">{{ bootError }}</p>
      <button class="button primary" type="button" @click="start">
        Reintentar activación
      </button>
    </div>
    <ErrorTasks
      v-else-if="session"
      :key="session.lab.id"
      :session="session"
      @first-load-failure="restart(true)"
    />
    <div class="playground-footer">
      <span
        >Reiniciar cancela peticiones y elimina solo los fallos y datos de esta
        sesión.</span
      ><button
        class="text-button"
        type="button"
        :disabled="booting || resetting || !session"
        @click="restart(false)"
      >
        ↺ Reiniciar esta lección
      </button>
    </div>
  </section>
</template>
