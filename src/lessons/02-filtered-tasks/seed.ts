export interface Task {
  id: string
  title: string
  completed: boolean
}

// El orden de inserción es intencional: la consulta ordenará por título e ID.
export function createTaskSeed(): Task[] {
  return [
    { id: 'task-4', title: 'Leer sobre colecciones', completed: false },
    { id: 'task-2', title: 'Cambiar un filtro', completed: false },
    { id: 'task-1', title: 'Cambiar un filtro', completed: true },
    { id: 'task-3', title: 'Observar el resultado', completed: false },
  ]
}
