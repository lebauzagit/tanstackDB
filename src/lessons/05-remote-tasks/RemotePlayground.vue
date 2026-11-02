<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
} from 'vue'
import { createRemoteSession, type RemoteSession } from './collections'
import RemoteTasks from './RemoteTasks.vue'

const session = shallowRef<RemoteSession | null>(null)
const booting = ref(true)
const resetting = ref(false)
const bootError = ref('')
const latency = ref(0)
const heading = useTemplateRef<HTMLElement>('remote-heading')
let disposed = false

async function start() {
  booting.value = true
  bootError.value = ''
  try {
    // Ninguna consulta HTTP empieza antes de que el worker pueda interceptarla.
    const { ensureMockApi } = await import('../../mocks/browser')
    await ensureMockApi()
    if (!disposed) session.value = createRemoteSession()
  } catch {
    bootError.value =
      'No se pudo activar la API simulada. Comprueba que la app se abre en localhost/127.0.0.1 o HTTPS y que el navegador permite service workers.'
  } finally {
    booting.value = false
  }
}

async function reset() {
  if (booting.value || resetting.value) return
  resetting.value = true
  const previous = session.value
  previous?.stop() // La petición anterior deja de poder confirmar datos.
  session.value = null
  await nextTick() // Desmontar lectores antes de limpiar su colección.
  try {
    await previous?.dispose()
    if (!disposed) {
      latency.value = 0
      session.value = createRemoteSession()
    }
  } catch {
    bootError.value =
      'No se pudo reiniciar la sesión. Vuelve a activar la API simulada.'
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
      console.error('No se pudo liberar la lección 05.', error),
    )
})
</script>

<template>
  <section class="playground" aria-labelledby="remote-playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2 id="remote-playground-title" ref="remote-heading" tabindex="-1">
          La red se hace visible
        </h2>
      </div>
      <span class="storage-badge">API HTTP simulada</span>
    </div>
    <p class="remote-disclosure">
      MSW intercepta estas peticiones en este navegador. El estado del mock es
      independiente de DB y se pierde al recargar. No es un servidor desplegado.
    </p>
    <p v-if="booting || resetting" class="playground-body" role="status">
      {{
        booting
          ? 'Activando la API simulada…'
          : 'Cancelando la sesión anterior y creando otra…'
      }}
    </p>
    <div v-else-if="bootError" class="playground-body">
      <p class="error-message" role="alert">{{ bootError }}</p>
      <button class="button primary" type="button" @click="start">
        Reintentar activación
      </button>
    </div>
    <template v-else-if="session">
      <div class="remote-controls">
        <label
          >Latencia por petición
          <select
            v-model.number="latency"
            @change="session.lab.setLatency(latency)"
          >
            <option :value="0">0 ms</option>
            <option :value="500">500 ms</option>
            <option :value="1500">1500 ms</option>
          </select></label
        >
        <p class="field-hint">
          Se aplica a las próximas peticiones. PATCH + GET esperan dos veces:
          con 1500 ms, la confirmación tarda aproximadamente 3 segundos.
        </p>
      </div>
      <RemoteTasks :key="session.lab.id" :session="session" />
    </template>
    <div class="playground-footer">
      <span
        >Reiniciar también cancela peticiones pendientes y crea una API simulada
        nueva.</span
      ><button
        class="text-button"
        type="button"
        :disabled="booting || resetting || !session"
        @click="reset"
      >
        ↺ Reiniciar esta lección
      </button>
    </div>
  </section>
</template>
