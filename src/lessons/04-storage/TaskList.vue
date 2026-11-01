<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef } from 'vue'
import type { TasksCollection } from './collections'
import { useTasks } from './useTasks'
import { TaskInputError, useTaskActions } from './useTaskActions'
import type { Task } from './seed'

const { collection, label } = defineProps<{
  collection: TasksCollection
  label: string
}>()
const emit = defineEmits<{ busy: [value: boolean] }>()
const {
  data: tasks,
  isLoading,
  isLoadingError,
  isCrashed,
} = useTasks(collection)
const { addTask, renameTask, toggleTask, deleteTask } =
  useTaskActions(collection)
const draftTitle = ref('')
const editingId = ref<string | null>(null)
const busy = ref(false)
const errorMessage = ref('')
const lastAction = ref(
  'Ambas listas empiezan con la misma semilla; sus datos son independientes.',
)
const titleId = useId()
const titleInput = useTemplateRef<HTMLInputElement>('title-input')
const taskList = useTemplateRef<HTMLUListElement>('task-list')
const json = computed(() =>
  JSON.stringify(
    tasks.value.map(({ id, title, completed }) => ({ id, title, completed })),
    null,
    2,
  ),
)

async function run(action: () => Promise<void>, message: string) {
  if (busy.value) return false
  busy.value = true
  emit('busy', true)
  errorMessage.value = ''
  try {
    await action()
    lastAction.value = message
    return true
  } catch (error) {
    errorMessage.value =
      error instanceof TaskInputError
        ? error.message
        : 'No se pudo guardar el cambio. Comprueba el espacio y los permisos del navegador e inténtalo de nuevo.'
    return false
  } finally {
    busy.value = false
    emit('busy', false)
    await nextTick()
  }
}

function beginEdit(task: Task) {
  editingId.value = task.id
  draftTitle.value = task.title
  errorMessage.value = ''
  titleInput.value?.focus()
}

function cancelEdit() {
  editingId.value = null
  draftTitle.value = ''
  errorMessage.value = ''
  titleInput.value?.focus()
}

async function save() {
  const id = editingId.value
  const saved = await run(
    () => (id ? renameTask(id, draftTitle.value) : addTask(draftTitle.value)),
    id
      ? 'Título actualizado en esta colección.'
      : 'Tarea creada en esta colección.',
  )
  if (saved) {
    editingId.value = null
    draftTitle.value = ''
    await nextTick()
  }
  titleInput.value?.focus()
}

async function toggle(id: string, event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const hadFocus = document.activeElement === input
  await run(() => toggleTask(id), 'Estado actualizado en esta colección.')
  if (hadFocus && input.isConnected && document.activeElement === document.body)
    input.focus()
}

async function remove(id: string, event: Event) {
  const button = event.currentTarget as HTMLButtonElement
  const hadFocus = document.activeElement === button
  const buttons = Array.from(
    taskList.value?.querySelectorAll<HTMLButtonElement>('.delete-task') ?? [],
  )
  const index = buttons.indexOf(button)
  const next = buttons[index + 1] ?? buttons[index - 1]
  const deleted = await run(
    () => deleteTask(id),
    'Tarea eliminada. Una lista vacía también se conserva en almacenamiento.',
  )
  if (deleted && editingId.value === id) cancelEdit()
  if (hadFocus && document.activeElement === document.body) {
    if (deleted) (next?.isConnected ? next : titleInput.value)?.focus()
    else button.focus()
  }
}
</script>

<template>
  <div class="storage-task-list">
    <form class="storage-form" novalidate @submit.prevent="save">
      <label :for="titleId">{{
        editingId ? 'Editar título' : 'Nueva tarea'
      }}</label>
      <input
        :id="titleId"
        ref="title-input"
        v-model="draftTitle"
        :disabled="busy"
        autocomplete="off"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${titleId}-error` : undefined"
      />
      <div class="rename-actions">
        <button class="button primary" type="submit" :disabled="busy">
          {{ editingId ? 'Guardar título' : 'Añadir tarea' }}
        </button>
        <button
          v-if="editingId"
          class="text-button"
          type="button"
          :disabled="busy"
          @click="cancelEdit"
        >
          Cancelar edición
        </button>
      </div>
      <span class="field-hint"
        >Título de hasta 100 caracteres; el borrador todavía no es una
        fila.</span
      >
    </form>
    <p
      v-if="errorMessage"
      :id="`${titleId}-error`"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <p v-if="isLoading" role="status">Preparando la consulta…</p>
    <p
      v-else-if="isLoadingError || isCrashed"
      class="error-message"
      role="alert"
    >
      No se pudo leer la colección. Reinicia esta lección.
    </p>
    <template v-else>
      <p class="quiet">
        {{ tasks.length }} tareas ·
        {{ tasks.filter((task) => task.completed).length }} completadas
      </p>
      <ul ref="task-list" class="task-list" :aria-label="`Tareas: ${label}`">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="storage-task-row"
          :class="{ completed: task.completed }"
        >
          <label
            ><input
              type="checkbox"
              :checked="task.completed"
              :disabled="busy"
              @change="toggle(task.id, $event)"
            /><span>{{ task.title }}</span></label
          >
          <div class="storage-row-actions">
            <button
              class="text-button"
              type="button"
              :aria-label="`Editar ${task.title}`"
              :disabled="busy"
              @click="beginEdit(task)"
            >
              Editar
            </button>
            <button
              class="text-button delete-task"
              type="button"
              :aria-label="`Eliminar ${task.title}`"
              :disabled="busy"
              @click="remove(task.id, $event)"
            >
              Eliminar
            </button>
          </div>
        </li>
      </ul>
      <p v-if="!tasks.length" class="filter-empty" role="status">
        No hay tareas. Puedes añadir una nueva; recargar no repone las
        eliminadas en la lista del navegador.
      </p>
    </template>
    <p class="storage-observation" role="status">{{ lastAction }}</p>
    <details class="storage-inspector">
      <summary>Consulta viva · {{ label }}</summary>
      <p class="field-hint">
        Filas leídas desde DB; no se guarda otra lista en Vue.
      </p>
      <pre
        class="json-view"
        tabindex="0"
        :aria-label="`JSON de ${label}`"
      ><code>{{ json }}</code></pre>
    </details>
  </div>
</template>
