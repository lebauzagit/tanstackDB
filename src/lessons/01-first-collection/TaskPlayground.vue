<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalTasks } from './useLocalTasks'

const emit = defineEmits<{ reset: [] }>()
const {
  data: tasks,
  sourceRows,
  completedCount,
  isLoading,
  isLoadingError,
  isCrashed,
  lastAction,
  addTask,
  toggleTask,
} = useLocalTasks()
const title = ref('')
const formError = ref('')
const busy = ref(false)
const inspectorTab = ref<'collection' | 'query'>('collection')
const inspectorRows = computed(() =>
  inspectorTab.value === 'collection' ? sourceRows.value : tasks.value,
)
// Proyección solo para mostrar JSON: no es una segunda fuente de verdad.
const json = computed(() =>
  JSON.stringify(
    inspectorRows.value.map(({ id, title, completed }) => ({
      id,
      title,
      completed,
    })),
    null,
    2,
  ),
)

async function submit() {
  if (busy.value) return
  busy.value = true
  formError.value = ''
  try {
    await addTask(title.value)
    title.value = ''
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'No se pudo añadir la tarea.'
  } finally {
    busy.value = false
  }
}

async function toggle(id: string) {
  busy.value = true
  formError.value = ''
  try {
    await toggleTask(id)
  } catch {
    formError.value =
      'No se pudo cambiar la tarea. Reinicia la lección para intentarlo otra vez.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="playground" aria-labelledby="playground-title">
    <div class="playground-heading">
      <div>
        <span class="tiny-label">MESA DE EXPERIMENTOS</span>
        <h2 id="playground-title">Tu primera colección</h2>
      </div>
      <span class="storage-badge"
        ><span aria-hidden="true">●</span> En memoria</span
      >
    </div>
    <div class="playground-body">
      <div class="list-heading">
        <h3>Mis tareas</h3>
        <span class="quiet"
          >{{ completedCount }} de {{ tasks.length }} completadas</span
        >
      </div>
      <p v-if="isLoading" role="status">Preparando la colección…</p>
      <p
        v-else-if="isLoadingError || isCrashed"
        class="error-message"
        role="alert"
      >
        No se pudo preparar la colección. Reinicia la lección.
      </p>
      <template v-else>
        <ul class="task-list" aria-label="Tareas de la consulta viva">
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
                @change="toggle(task.id)"
              /><span>{{ task.title }}</span></label
            >
            <span class="task-state">{{
              task.completed ? 'Hecha' : 'Pendiente'
            }}</span>
          </li>
        </ul>
        <p v-if="tasks.length === 0" class="quiet">
          La colección está vacía. Añade tu primera tarea.
        </p>
        <form class="add-task" novalidate @submit.prevent="submit">
          <label for="task-title">Añade una tarea y observa el inspector</label>
          <div class="input-row">
            <input
              id="task-title"
              v-model="title"
              name="title"
              autocomplete="off"
              placeholder="Ej. Leer sobre colecciones"
              :aria-invalid="!!formError"
              :aria-describedby="formError ? 'task-error' : 'task-hint'"
            /><button class="button primary" type="submit" :disabled="busy">
              Añadir <span aria-hidden="true">+</span>
            </button>
          </div>
          <p id="task-hint" class="field-hint">
            Un título de hasta 100 caracteres.
          </p>
        </form>
      </template>
      <p v-if="formError" id="task-error" class="error-message" role="alert">
        {{ formError }}
      </p>
    </div>
    <div class="observation" role="status">
      <span class="observation-icon" aria-hidden="true">↳</span>
      <p>{{ lastAction }}</p>
    </div>
    <details class="inspector" open>
      <summary>
        <span>Inspector de datos</span
        ><span class="tiny-label">OBSERVA EL CAMBIO</span>
      </summary>
      <div
        class="inspector-switch"
        role="group"
        aria-label="Datos del inspector"
      >
        <button
          type="button"
          :aria-pressed="inspectorTab === 'collection'"
          @click="inspectorTab = 'collection'"
        >
          Colección de origen <span>{{ sourceRows.length }}</span>
        </button>
        <button
          type="button"
          :aria-pressed="inspectorTab === 'query'"
          @click="inspectorTab = 'query'"
        >
          Resultado de consulta <span>{{ tasks.length }}</span>
        </button>
      </div>
      <p class="inspector-explanation">
        {{
          inspectorTab === 'collection'
            ? 'Filas leídas directamente de la colección con toArray.'
            : 'Filas devueltas por useLiveQuery, ordenadas por id.'
        }}
      </p>
      <pre
        class="json-view"
        tabindex="0"
        :aria-label="
          inspectorTab === 'collection'
            ? 'JSON de la colección de origen'
            : 'JSON del resultado de la consulta'
        "
      ><code>{{ json }}</code></pre>
    </details>
    <div class="playground-footer">
      <span>Datos locales · sin API · sin persistencia</span
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
