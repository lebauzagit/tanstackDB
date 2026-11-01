import type { TasksCollection } from './collections'

export function useSharedTaskActions(collection: TasksCollection) {
  async function renameTask(id: string, title: string) {
    const normalizedTitle = title.trim()
    if (!normalizedTitle) throw new Error('Escribe un título para la tarea.')
    if (normalizedTitle.length > 100)
      throw new Error('Usa un título de hasta 100 caracteres.')

    const transaction = collection.update(id, (draft) => {
      draft.title = normalizedTitle
    })
    await transaction.when('settled')
  }

  async function toggleTask(id: string) {
    const transaction = collection.update(id, (draft) => {
      draft.completed = !draft.completed
    })
    await transaction.when('settled')
  }

  return { renameTask, toggleTask }
}
