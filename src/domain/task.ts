export interface Task {
  id: string
  title: string
  completed: boolean
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    !!task.id &&
    typeof task.title === 'string' &&
    !!task.title.trim() &&
    typeof task.completed === 'boolean'
  )
}
