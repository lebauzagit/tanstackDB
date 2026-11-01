import { computed, ref } from 'vue'
import { createTaskSeed } from './seed'

export function useVueTaskExample() {
  // Ejemplo alternativo independiente: estas filas no provienen de TanStack DB.
  const tasks = ref(createTaskSeed())
  const pendingTasks = computed(() =>
    tasks.value.filter((task) => !task.completed),
  )

  function completeFirstPending() {
    const task = pendingTasks.value[0]
    if (task) task.completed = true
  }

  return { tasks, pendingTasks, completeFirstPending }
}
