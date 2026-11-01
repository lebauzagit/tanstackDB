import { createCollection, localOnlyCollectionOptions } from '@tanstack/db'
import { createTaskSeed, type Task } from './seed'

// Se crea una vez por sesión, no en cada actualización del componente.
export function createTasksCollection() {
  return createCollection(
    localOnlyCollectionOptions<Task, string>({
      id: `lesson-01-tasks-${crypto.randomUUID()}`,
      getKey: (task) => task.id,
      initialData: createTaskSeed(),
    }),
  )
}
