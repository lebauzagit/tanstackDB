<script setup lang="ts">
import { nextTick, ref, useId, useTemplateRef } from 'vue'
import { captureTaskListFocus } from '../../components/learning/taskListFocus'
import type { TasksCollection } from './collections'
import type { Task } from './seed'
import { useSharedTaskActions } from './useSharedTaskActions'

const { task, collection } = defineProps<{
  task: Task
  collection: TasksCollection
}>()
const { renameTask, toggleTask } = useSharedTaskActions(collection)
const editing = ref(false)
const draftTitle = ref('') // Un borrador de formulario, no otra copia de la colección.
const busy = ref(false)
const errorMessage = ref('')
const fieldId = useId()
const titleInput = useTemplateRef<HTMLInputElement>('title-input')
const editButton = useTemplateRef<HTMLButtonElement>('edit-button')

async function beginEdit() {
  draftTitle.value = task.title
  errorMessage.value = ''
  editing.value = true
  await nextTick()
  titleInput.value?.focus()
}

async function cancelEdit() {
  editing.value = false
  errorMessage.value = ''
  await nextTick()
  editButton.value?.focus()
}

async function save() {
  if (busy.value) return
  const form = titleInput.value?.form
  const hadFocus = form?.contains(document.activeElement)
  busy.value = true
  errorMessage.value = ''
  try {
    await renameTask(task.id, draftTitle.value)
    editing.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo guardar el título.'
  } finally {
    busy.value = false
    // El botón debe estar habilitado antes de poder recibir el foco.
    await nextTick()
    if (
      !editing.value &&
      hadFocus &&
      (document.activeElement === document.body ||
        form?.contains(document.activeElement))
    ) {
      editButton.value?.focus()
    }
  }
}

async function toggle(event: Event) {
  if (busy.value) return
  const checkbox = event.currentTarget as HTMLInputElement
  const restoreFocus = captureTaskListFocus(
    checkbox,
    checkbox.closest('.shared-view')?.querySelector<HTMLElement>('h3') ?? null,
  )
  busy.value = true
  errorMessage.value = ''
  try {
    await toggleTask(task.id)
  } catch {
    errorMessage.value = 'No se pudo cambiar la tarea. Inténtalo de nuevo.'
  } finally {
    busy.value = false
    await nextTick()
    restoreFocus()
  }
}
</script>

<template>
  <li class="shared-task-row" :class="{ completed: task.completed }">
    <div class="shared-task-heading">
      <label
        ><input
          type="checkbox"
          :checked="task.completed"
          :disabled="busy || editing"
          @change="toggle"
        /><span>{{ task.title }}</span></label
      >
      <button
        v-if="!editing"
        ref="edit-button"
        type="button"
        class="text-button"
        :aria-label="`Editar título de ${task.title}`"
        :disabled="busy"
        @click="beginEdit"
      >
        Editar
      </button>
    </div>
    <form
      v-if="editing"
      class="shared-rename-form"
      novalidate
      @submit.prevent="save"
    >
      <label :for="fieldId">Nuevo título</label>
      <input
        :id="fieldId"
        ref="title-input"
        v-model="draftTitle"
        autocomplete="off"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${fieldId}-error` : undefined"
      />
      <div class="rename-actions">
        <button class="button primary" type="submit" :disabled="busy">
          Guardar</button
        ><button
          type="button"
          class="text-button"
          :disabled="busy"
          @click="cancelEdit"
        >
          Cancelar
        </button>
      </div>
    </form>
    <p
      v-if="errorMessage"
      :id="`${fieldId}-error`"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </li>
</template>
