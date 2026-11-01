export interface Task {
  id: string
  title: string
  completed: boolean
}

// Una copia nueva por sesión: editar una tarea nunca modifica la semilla.
export function createTaskSeed(): Task[] {
  return [
    { id: 'task-1', title: 'Crear mi primera colección', completed: true },
    { id: 'task-2', title: 'Observar una consulta viva', completed: false },
    {
      id: 'task-3',
      title: 'Cambiar un dato y ver qué ocurre',
      completed: false,
    },
  ]
}
