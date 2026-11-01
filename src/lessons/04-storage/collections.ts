import {
  createCollection,
  localOnlyCollectionOptions,
  localStorageCollectionOptions,
} from '@tanstack/db'
import { createTaskSeed, type Task } from './seed'

export const STORAGE_KEY = 'taller-db:lesson-04:tasks:v1'

export function createMemoryTasksCollection() {
  return createCollection(
    localOnlyCollectionOptions<Task, string>({
      id: `lesson-04-memory-${crypto.randomUUID()}`,
      getKey: (task) => task.id,
      initialData: createTaskSeed(),
    }),
  )
}

export async function createStoredTasksCollection(storage: Storage) {
  // Clave ausente significa primera visita. Una instantánea vacía no es ausencia.
  const firstVisit = storage.getItem(STORAGE_KEY) === null
  const collection = createCollection(
    localStorageCollectionOptions<Task, string>({
      id: `lesson-04-storage-${crypto.randomUUID()}`,
      storageKey: STORAGE_KEY,
      storage, // Se exige almacenamiento real; no fingimos persistencia en memoria.
      getKey: (task) => task.id,
    }),
  )
  try {
    await collection.preload()
    if (firstVisit && collection.size === 0) {
      await collection.insert(createTaskSeed()).when('settled')
    }
    if (
      collection.toArray.some(
        (task) =>
          typeof task.id !== 'string' ||
          !task.id ||
          typeof task.title !== 'string' ||
          !task.title.trim() ||
          task.title.length > 100 ||
          typeof task.completed !== 'boolean',
      )
    ) {
      throw new Error('Las tareas guardadas no tienen el formato esperado.')
    }
    return collection
  } catch (error) {
    await collection.cleanup({ dependents: true })
    throw error
  }
}

export type TasksCollection =
  | ReturnType<typeof createMemoryTasksCollection>
  | Awaited<ReturnType<typeof createStoredTasksCollection>>
