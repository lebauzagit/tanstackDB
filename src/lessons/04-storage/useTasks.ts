import { useLiveQuery } from '@tanstack/vue-db'
import type { TasksCollection } from './collections'

export function useTasks(collection: TasksCollection) {
  // La fuente está abierta antes de montar este lector; no se crea en la consulta.
  return useLiveQuery((q) =>
    q
      .from({ task: collection })
      .orderBy(({ task }) => task.id, 'asc')
      .select(({ task }) => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
      })),
  )
}
