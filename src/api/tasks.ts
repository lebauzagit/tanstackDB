import { isTask, type Task } from '../domain/task'

export class TaskApiError extends Error {
  constructor(readonly status: number) {
    super(`La API simulada devolvió HTTP ${status}.`)
  }
}

export function createTasksApi(
  sessionId: string,
  origin = window.location.origin,
) {
  const baseUrl = new URL(
    `/api/lab/${encodeURIComponent(sessionId)}/tasks`,
    origin,
  )

  async function readTasks(signal: AbortSignal): Promise<Task[]> {
    const response = await fetch(baseUrl, { signal })
    if (!response.ok) throw new TaskApiError(response.status)
    const body: unknown = await response.json()
    if (
      !body ||
      typeof body !== 'object' ||
      !('items' in body) ||
      !Array.isArray(body.items) ||
      !body.items.every(isTask) ||
      new Set(body.items.map((task) => task.id)).size !== body.items.length
    ) {
      throw new Error('La API simulada devolvió tareas inválidas.')
    }
    return body.items
  }

  async function setCompleted(
    id: string,
    completed: boolean,
    signal: AbortSignal,
  ): Promise<Task> {
    const response = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    if (!response.ok) throw new TaskApiError(response.status)
    const body: unknown = await response.json()
    if (!isTask(body) || body.id !== id)
      throw new Error('La API devolvió una tarea inválida.')
    return body
  }

  return { readTasks, setCompleted }
}
