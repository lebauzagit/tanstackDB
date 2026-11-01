<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { captureTaskListFocus } from '../../components/learning/taskListFocus'
import { useFilteredTasks, type TaskFilter } from './useFilteredTasks'

const emit = defineEmits<{ reset: [] }>()
const filter = ref<TaskFilter>('all')
const filters: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
]
const {
  data: tasks,
  sourceRows,
  isLoading,
  isLoadingError,
  isCrashed,
  lastAction,
  toggleTask,
} = useFilteredTasks(filter)
const busy = ref(false)
const errorMessage = ref('')
const filterLabel = computed(
  () => filters.find((item) => item.value === filter.value)?.label,
)
const condition = computed(() =>
  filter.value === 'all'
    ? 'Sin condición: todas las tareas'
    : `completed = ${filter.value === 'completed'}`,
)
const sourceJson = computed(() =>
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
const resultJson = computed(() =>
  JSON.stringify(
    tasks.value.map(({ id, label, completed }) => ({ id, label, completed })),
    null,
    2,
  ),
)

async function toggle(id: string, event: Event) {
  if (busy.value) return
  const checkbox = event.currentTarget as HTMLInputElement
  const restoreFocus = captureTaskListFocus(
    checkbox,
    checkbox
      .closest('.playground-body')
      ?.querySelector<HTMLElement>(
        '.task-filters button[aria-pressed="true"]',
      ) ?? null,
  )
  busy.value = true
  errorMessage.value = ''
  try {
    await toggleTask(id)
  } catch {
    errorMessage.value =
      'No se pudo cambiar la tarea. Reinicia esta lección para intentarlo de nuevo.'
  } finally {
    busy.value = false
    await nextTick()
    restoreFocus()
  }
}
</script>

<template>
  <section class="playground" aria-labelledby="filtered-playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2 id="filtered-playground-title">
          Una colección, distintas preguntas
        </h2>
      </div>
      <span class="storage-badge"
        ><span aria-hidden="true">●</span> En memoria</span
      >
    </div>
    <div class="playground-body">
      <div
        class="task-filters"
        role="group"
        aria-label="Filtrar tareas por estado"
      >
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          :aria-pressed="filter === option.value"
          :disabled="busy"
          @click="filter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="filter-summary" role="status">
        {{ filterLabel }}: {{ tasks.length }} resultados de
        {{ sourceRows.length }} tareas de origen.
      </p>
      <p class="query-condition">
        <code>{{ condition }}</code>
      </p>
      <p v-if="isLoading" role="status">Preparando la consulta…</p>
      <p
        v-else-if="isLoadingError || isCrashed"
        class="error-message"
        role="alert"
      >
        No se pudo preparar la consulta. Reinicia esta lección.
      </p>
      <template v-else>
        <ul class="task-list" aria-label="Tareas que cumplen el filtro">
          <li
            v-for="task in tasks"
            :key="task.id"
            :class="{ completed: task.completed }"
          >
            <label
              ><input
                type="checkbox"
                :checked="task.completed"
                :disabled="busy"
                @change="toggle(task.id, $event)"
              /><span>{{ task.label }}</span></label
            >
            <span class="task-state">{{
              task.completed ? 'Hecha' : 'Pendiente'
            }}</span>
          </li>
        </ul>
        <p v-if="tasks.length === 0" class="filter-empty" role="status">
          Ninguna tarea cumple este filtro. Las tareas siguen en la colección;
          prueba con «Todas».
        </p>
      </template>
      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
      <p class="field-hint">
        Orden: título ascendente; si se repite, ID ascendente.
      </p>
    </div>
    <div class="observation" role="status">
      <span class="observation-icon" aria-hidden="true">↳</span>
      <p>{{ lastAction }}</p>
    </div>
    <details class="inspector" open>
      <summary>
        <span>Inspector: origen y resultado</span
        ><span class="tiny-label">COMPARA LAS FILAS</span>
      </summary>
      <h3 class="inspector-label">
        Colección de origen · {{ sourceRows.length }} filas
      </h3>
      <p class="inspector-explanation">
        Conserva title y todas las tareas, sea cual sea el filtro.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        aria-label="JSON de la colección de origen"
      ><code>{{ sourceJson }}</code></pre>
      <h3 class="inspector-label">
        Resultado de consulta · {{ tasks.length }} filas
      </h3>
      <p class="inspector-explanation">
        where elige las filas; select expone title como label. El origen
        conserva su estructura.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        aria-label="JSON del resultado de la consulta"
      ><code>{{ resultJson }}</code></pre>
    </details>
    <div class="playground-footer">
      <span>Datos locales · sin peticiones de datos</span
      ><button
        class="text-button"
        type="button"
        :disabled="busy"
        @click="emit('reset')"
      >
        ↺ Reiniciar esta lección
      </button>
    </div>
  </section>
</template>
