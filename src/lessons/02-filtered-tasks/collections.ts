import { createCollection, localOnlyCollectionOptions } from '@tanstack/db'
import { createTaskSeed, type Task } from './seed'

// Esta lección tiene su propia colección: practicar aquí no altera la lección 01.
export function createTasksCollection() {
  return createCollection(
    localOnlyCollectionOptions<Task, string>({
      id: `lesson-02-tasks-${crypto.randomUUID()}`,
      getKey: (task) => task.id,
      initialData: createTaskSeed(),
    }),
  )
}
