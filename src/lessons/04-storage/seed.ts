export interface Task {
  id: string
  title: string
  completed: boolean
}

export function createTaskSeed(): Task[] {
  return [
    { id: 'task-1', title: 'Crear una tarea', completed: true },
    { id: 'task-2', title: 'Editar antes de recargar', completed: false },
    { id: 'task-3', title: 'Eliminar y comprobar', completed: false },
  ]
}
