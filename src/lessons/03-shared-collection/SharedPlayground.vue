<script setup lang="ts">
import { computed, onUnmounted, ref, useId } from 'vue'
import { createTasksCollection } from './collections'
import AllTasksView from './AllTasksView.vue'
import PendingTasksView from './PendingTasksView.vue'

const emit = defineEmits<{ reset: [] }>()
// Una instancia por sesión; ambos componentes reciben exactamente esta fuente.
const tasksCollection = createTasksCollection()
const showPending = ref(true)
const pendingViewId = useId()
const revision = ref(0)
const subscription = tasksCollection.subscribeChanges(() => {
  revision.value++
})
const sourceRows = computed(() => {
  void revision.value
  return tasksCollection.toArray
})
const json = computed(() =>
  JSON.stringify(
    sourceRows.value.map(({ id, title, completed }) => ({
      id,
      title,
      completed,
    })),
    null,
    2,
  ),
)

// Los hijos desmontan sus lectores antes del onUnmounted de este propietario.
onUnmounted(() => {
  subscription.unsubscribe()
  void tasksCollection.cleanup({ dependents: true }).catch((error: unknown) => {
    console.error(
      'No se pudo liberar la sesión compartida de la lección 03.',
      error,
    )
  })
})
</script>

<template>
  <section class="playground" aria-labelledby="shared-playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2 id="shared-playground-title">Dos componentes, una fuente</h2>
      </div>
      <span class="storage-badge"
        ><span aria-hidden="true">●</span> En memoria</span
      >
    </div>
    <div class="shared-controls">
      <span class="quiet">Consultas distintas sobre la misma fuente.</span
      ><button
        class="text-button"
        type="button"
        :aria-expanded="showPending"
        :aria-controls="pendingViewId"
        @click="showPending = !showPending"
      >
        {{ showPending ? 'Desmontar vista B' : 'Volver a montar vista B' }}
      </button>
    </div>
    <div class="shared-views">
      <AllTasksView :collection="tasksCollection" />
      <div :id="pendingViewId">
        <PendingTasksView v-if="showPending" :collection="tasksCollection" />
        <p v-else class="shared-view quiet">
          La vista B está desmontada. La vista A y la colección siguen activas.
          Puedes cambiar un título y volver a montar B.
        </p>
      </div>
    </div>
    <div class="observation">
      <span class="observation-icon" aria-hidden="true">↳</span>
      <p>
        Ambas consultas leen la misma colección. Los títulos y el estado se
        modifican en esa fuente; cada vista recibe su resultado.
      </p>
    </div>
    <details class="inspector" open>
      <summary>
        <span>La única colección de origen · {{ sourceRows.length }} filas</span
        ><span class="tiny-label">UNA SOLA FUENTE</span>
      </summary>
      <p class="inspector-explanation">
        Los formularios guardan borradores; este JSON muestra las entidades
        confirmadas en la colección local.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        aria-label="JSON de la colección compartida"
      ><code>{{ json }}</code></pre>
    </details>
    <div class="playground-footer">
      <span>Consultas locales · sin API · sin persistencia</span
      ><button class="text-button" type="button" @click="emit('reset')">
        ↺ Reiniciar esta lección
      </button>
    </div>
  </section>
</template>
