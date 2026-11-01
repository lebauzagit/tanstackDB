import { createCollection, localOnlyCollectionOptions } from '@tanstack/db'
import { createTaskSeed, type Task } from './seed'

export function createTasksCollection() {
  return createCollection(
    localOnlyCollectionOptions<Task, string>({
      id: `lesson-03-tasks-${crypto.randomUUID()}`,
      getKey: (task) => task.id,
      initialData: createTaskSeed(),
    }),
  )
}

export type TasksCollection = ReturnType<typeof createTasksCollection>
