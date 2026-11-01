import { useLiveQuery } from '@tanstack/vue-db'
import type { TasksCollection } from './collections'

export function useAllTasks(collection: TasksCollection) {
  // Recibimos la fuente existente; aquí no se crea otra colección.
  return useLiveQuery((q) =>
    q.from({ task: collection }).orderBy(({ task }) => task.id, 'asc'),
  )
}
