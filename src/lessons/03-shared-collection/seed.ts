export interface Task {
  id: string
  title: string
  completed: boolean
}

export function createTaskSeed(): Task[] {
  return [
    { id: 'task-1', title: 'Crear una colección compartida', completed: true },
    {
      id: 'task-2',
      title: 'Editar un título desde una vista',
      completed: false,
    },
    { id: 'task-3', title: 'Observar el cambio en la otra', completed: false },
  ]
}
