<script setup lang="ts">
import type { TasksCollection } from './collections'
import { useAllTasks } from './useAllTasks'
import TaskEditorRow from './TaskEditorRow.vue'

const { collection } = defineProps<{ collection: TasksCollection }>()
const {
  data: tasks,
  isLoading,
  isLoadingError,
  isCrashed,
} = useAllTasks(collection)
</script>

<template>
  <section class="shared-view" aria-label="Vista A: todas las tareas">
    <span class="tiny-label">COMPONENTE A · useAllTasks</span>
    <div class="list-heading">
      <h3 tabindex="-1">Todas las tareas</h3>
      <span class="quiet">{{ tasks.length }} tareas</span>
    </div>
    <p v-if="isLoading" role="status">Preparando la vista…</p>
    <p
      v-else-if="isLoadingError || isCrashed"
      class="error-message"
      role="alert"
    >
      No se pudo preparar esta vista. Reinicia la lección.
    </p>
    <ul v-else class="task-list">
      <TaskEditorRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :collection="collection"
      />
    </ul>
    <p class="field-hint">Cambiar el estado conserva la tarea en esta lista.</p>
  </section>
</template>
