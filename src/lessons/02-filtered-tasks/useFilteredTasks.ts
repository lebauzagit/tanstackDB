import { computed, onUnmounted, readonly, ref, type Ref } from 'vue'
import { eq } from '@tanstack/db'
import { useLiveQuery } from '@tanstack/vue-db'
import { createTasksCollection } from './collections'

export type TaskFilter = 'all' | 'pending' | 'completed'

export function useFilteredTasks(filter: Ref<TaskFilter>) {
  // Se crea una vez por montaje, fuera de la función que reconstruye la consulta.
  const tasksCollection = createTasksCollection()

  const query = useLiveQuery(
    (q) => {
      const currentFilter = filter.value
      const source = q.from({ task: tasksCollection })
      const filtered =
        currentFilter === 'all'
          ? source
          : source.where(({ task }) =>
              eq(task.completed, currentFilter === 'completed'),
            )

      return filtered
        .orderBy(({ task }) => task.title, 'asc')
        .orderBy(({ task }) => task.id, 'asc')
        .select(({ task }) => ({
          id: task.id,
          label: task.title,
          completed: task.completed,
        }))
    },
    [filter], // Pasamos el ref; pasar filter.value capturaría solo el valor actual.
  )

  // Una señal para invalidar la lectura del inspector, sin copiar las filas.
  const revision = ref(0)
  const subscription = tasksCollection.subscribeChanges(() => {
    revision.value++
  })
  const sourceRows = computed(() => {
    void revision.value
    return tasksCollection.toArray
  })

  const lastAction = ref(
    'Elige un filtro: cambia la consulta, no las cuatro tareas de origen.',
  )

  async function toggleTask(id: string) {
    const transaction = tasksCollection.update(id, (draft) => {
      draft.completed = !draft.completed
    })
    await transaction.when('settled')
    lastAction.value =
      'Cambió completed en la colección. La consulta vuelve a decidir si esa tarea cumple el filtro.'
  }

  // El hook desmonta su lector. La sesión posee también las consultas previas
  // creadas al cambiar el filtro, por eso limpiamos sus dependientes explícitamente.
  onUnmounted(() => {
    subscription.unsubscribe()
    void tasksCollection
      .cleanup({ dependents: true })
      .catch((error: unknown) => {
        console.error('No se pudo liberar la sesión de la lección 02.', error)
      })
  })

  return { ...query, sourceRows, lastAction: readonly(lastAction), toggleTask }
}
