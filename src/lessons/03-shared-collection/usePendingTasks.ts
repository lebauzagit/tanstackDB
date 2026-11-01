import { eq } from '@tanstack/db'
import { useLiveQuery } from '@tanstack/vue-db'
import type { TasksCollection } from './collections'

export function usePendingTasks(collection: TasksCollection) {
  return useLiveQuery((q) =>
    q
      .from({ task: collection })
      .where(({ task }) => eq(task.completed, false))
      .orderBy(({ task }) => task.id, 'asc'),
  )
}
