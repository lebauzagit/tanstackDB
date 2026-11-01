<script setup lang="ts">
import type { TasksCollection } from './collections'
import { usePendingTasks } from './usePendingTasks'
import TaskEditorRow from './TaskEditorRow.vue'

const { collection } = defineProps<{ collection: TasksCollection }>()
const {
  data: tasks,
  isLoading,
  isLoadingError,
  isCrashed,
} = usePendingTasks(collection)
</script>

<template>
  <section class="shared-view" aria-label="Vista B: tareas pendientes">
    <span class="tiny-label">COMPONENTE B · usePendingTasks</span>
    <div class="list-heading">
      <h3 tabindex="-1">Solo pendientes</h3>
      <span class="quiet"
        >{{ tasks.length }}
        {{ tasks.length === 1 ? 'pendiente' : 'pendientes' }}</span
      >
    </div>
    <p v-if="isLoading" role="status">Preparando la vista…</p>
    <p
      v-else-if="isLoadingError || isCrashed"
      class="error-message"
      role="alert"
    >
      No se pudo preparar esta vista. Reinicia la lección.
    </p>
    <template v-else>
      <ul class="task-list">
        <TaskEditorRow
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :collection="collection"
        />
      </ul>
      <p v-if="tasks.length === 0" class="filter-empty" role="status">
        No quedan pendientes. Las tareas siguen en la vista A.
      </p>
    </template>
    <p class="field-hint">
      Al completar una tarea, deja de cumplir este filtro.
    </p>
  </section>
</template>
