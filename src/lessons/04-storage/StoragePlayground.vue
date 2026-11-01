<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
} from 'vue'
import {
  createMemoryTasksCollection,
  createStoredTasksCollection,
  STORAGE_KEY,
} from './collections'
import TaskList from './TaskList.vue'

const memory = shallowRef(createMemoryTasksCollection())
const stored = shallowRef<Awaited<
  ReturnType<typeof createStoredTasksCollection>
> | null>(null)
const initializing = ref(true)
const resetting = ref(false)
const showReaders = ref(true)
const busyReaders = ref(0)
const storageError = ref('')
const heading = useTemplateRef<HTMLElement>('playground-heading')
let disposed = false

async function openStorage() {
  initializing.value = true
  storageError.value = ''
  try {
    const collection = await createStoredTasksCollection(window.localStorage)
    if (disposed) await collection.cleanup({ dependents: true })
    else stored.value = collection
  } catch {
    storageError.value =
      'No se pudo abrir el almacenamiento: puede estar bloqueado, lleno o contener datos inválidos. La lista en memoria sigue disponible. Reiniciar elimina solo los datos guardados de esta lección e intenta abrirla de nuevo.'
  } finally {
    initializing.value = false
  }
}

async function reset() {
  if (initializing.value || resetting.value || busyReaders.value) return
  resetting.value = true
  showReaders.value = false
  await nextTick() // Los lectores se liberan antes de destruir sus fuentes.
  try {
    await memory.value.cleanup({ dependents: true })
    await stored.value?.cleanup({ dependents: true })
    stored.value = null
    memory.value = createMemoryTasksCollection()
    window.localStorage.removeItem(STORAGE_KEY) // Nunca localStorage.clear().
    await openStorage()
  } catch {
    storageError.value =
      'No se pudo reiniciar el almacenamiento de esta lección. Comprueba los permisos del navegador e inténtalo de nuevo.'
  } finally {
    showReaders.value = true
    resetting.value = false
    await nextTick()
    heading.value?.focus()
  }
}

onMounted(openStorage)
onUnmounted(() => {
  disposed = true
  void Promise.all([
    memory.value.cleanup({ dependents: true }),
    stored.value?.cleanup({ dependents: true }),
  ]).catch((error: unknown) =>
    console.error('No se pudo liberar la lección 04.', error),
  )
})

function changeBusy(value: boolean) {
  busyReaders.value += value ? 1 : -1
}
function reload() {
  window.location.reload()
}
</script>

<template>
  <section class="playground" aria-labelledby="storage-playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2
          id="storage-playground-title"
          ref="playground-heading"
          tabindex="-1"
        >
          Dos listas, dos destinos
        </h2>
      </div>
      <span class="storage-badge">Sin API</span>
    </div>
    <div class="storage-controls">
      <p>Los cambios de una lista no modifican la otra.</p>
      <button
        class="button primary"
        type="button"
        :disabled="initializing || resetting || !!busyReaders"
        @click="reload"
      >
        Recargar la página
      </button>
    </div>
    <div v-if="showReaders" class="storage-panels">
      <section class="storage-panel" aria-label="Lista en memoria">
        <span class="tiny-label">A · SOLO MEMORIA</span>
        <h3>Se pierde al recargar.</h3>
        <p class="quiet">
          Cada apertura crea una colección nueva con tres tareas.
        </p>
        <TaskList :collection="memory" label="memoria" @busy="changeBusy" />
      </section>
      <section class="storage-panel" aria-label="Lista en el navegador">
        <span class="tiny-label">B · ALMACENAMIENTO DEL NAVEGADOR</span>
        <h3>Se conserva aquí.</h3>
        <p class="quiet">
          localStorage de este origen y perfil. Puedes borrarlo desde el
          navegador.
        </p>
        <p v-if="initializing" role="status">Abriendo las tareas guardadas…</p>
        <p v-else-if="storageError" class="error-message" role="alert">
          {{ storageError }}
        </p>
        <TaskList
          v-else-if="stored"
          :collection="stored"
          label="navegador"
          @busy="changeBusy"
        />
        <p class="field-hint storage-key">
          Clave de esta práctica: <code>{{ STORAGE_KEY }}</code>
        </p>
      </section>
    </div>
    <p v-else role="status" class="playground-body">
      Reiniciando las dos listas…
    </p>
    <div class="playground-footer">
      <span
        >Reiniciar repone ambas semillas y borra solo la clave de esta
        práctica.</span
      >
      <button
        class="text-button"
        type="button"
        :disabled="initializing || resetting || !!busyReaders"
        @click="reset"
      >
        ↺ Reiniciar esta lección
      </button>
    </div>
  </section>
</template>
