import type { TasksCollection } from './collections'

export class TaskInputError extends Error {}

function normalizeTitle(title: string) {
  const normalized = title.trim()
  if (!normalized) throw new TaskInputError('Escribe un título para la tarea.')
  if (normalized.length > 100)
    throw new TaskInputError('Usa un título de hasta 100 caracteres.')
  return normalized
}

export function useTaskActions(collection: TasksCollection) {
  async function addTask(title: string) {
    const task = {
      id: crypto.randomUUID(),
      title: normalizeTitle(title),
      completed: false,
    }
    await collection.insert(task).when('settled')
  }

  async function renameTask(id: string, title: string) {
    const normalized = normalizeTitle(title)
    await collection
      .update(id, (draft) => {
        draft.title = normalized
      })
      .when('settled')
  }

  async function toggleTask(id: string) {
    await collection
      .update(id, (draft) => {
        draft.completed = !draft.completed
      })
      .when('settled')
  }

  async function deleteTask(id: string) {
    await collection.delete(id).when('settled')
  }

  return { addTask, renameTask, toggleTask, deleteTask }
}
