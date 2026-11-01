import { computed, onUnmounted, readonly, ref } from 'vue'
import { useLiveQuery } from '@tanstack/vue-db'
import { createTasksCollection } from './collections'

export function useLocalTasks() {
  const tasksCollection = createTasksCollection()

  // La consulta se actualiza al cambiar la colección, sin pedir datos por HTTP.
  const query = useLiveQuery((q) =>
    q.from({ task: tasksCollection }).orderBy(({ task }) => task.id, 'asc'),
  )

  // El inspector lee la colección de origen; solo el contador es estado Vue.
  const revision = ref(0)
  const subscription = tasksCollection.subscribeChanges(() => {
    revision.value++
  })
  const sourceRows = computed(() => {
    void revision.value
    return tasksCollection.toArray
  })

  const lastAction = ref('La semilla cargó tres tareas en una colección local.')
  const completedCount = computed(
    () => query.data.value.filter((task) => task.completed).length,
  )

  async function addTask(title: string) {
    const normalizedTitle = title.trim()
    if (!normalizedTitle) throw new Error('Escribe un título para la tarea.')
    if (normalizedTitle.length > 100)
      throw new Error('Usa un título de hasta 100 caracteres.')

    const transaction = tasksCollection.insert({
      id: `task-${crypto.randomUUID()}`,
      title: normalizedTitle,
      completed: false,
    })
    await transaction.when('settled')
    lastAction.value = `insert(): «${normalizedTitle}» entró en la colección y en la consulta.`
  }

  async function toggleTask(id: string) {
    const transaction = tasksCollection.update(id, (draft) => {
      draft.completed = !draft.completed
    })
    await transaction.when('settled')
    lastAction.value = `update(): cambió completed. La consulta reflejó el nuevo valor.`
  }

  // El hook libera su lector. Limpiamos su consulta antes que la fuente,
  // sin depender del temporizador de recolección de la biblioteca.
  onUnmounted(() => {
    subscription.unsubscribe()
    void query.collection.value
      .cleanup()
      .then(() => tasksCollection.cleanup())
      .catch((error: unknown) => {
        console.error(
          'No se pudo liberar la colección de la lección 01.',
          error,
        )
      })
  })

  return {
    ...query,
    sourceRows,
    completedCount,
    lastAction: readonly(lastAction),
    addTask,
    toggleTask,
  }
}
