import { createCollection } from '@tanstack/db'
import { QueryClient } from '@tanstack/query-core'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createTasksApi } from '../../api/tasks'
import type { Task } from '../../domain/task'
import { TaskLab } from '../../mocks/taskLab'

export class ReconciliationError extends Error {
  constructor() {
    super(
      'La escritura llegó a la API, pero falló la lectura de confirmación. Vuelve a leer la API para conocer su estado.',
    )
  }
}

export function createRemoteSession() {
  const lab = new TaskLab()
  const writes = new AbortController()
  const api = createTasksApi(lab.id)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })
  const collection = createCollection(
    queryCollectionOptions({
      id: `lesson-05-${lab.id}`,
      queryKey: ['lesson-05', lab.id, 'tasks'],
      queryClient,
      queryFn: ({ signal }) => api.readTasks(signal),
      getKey: (task: Task) => task.id,
      onUpdate: async ({ transaction, collection }) => {
        for (const mutation of transaction.mutations) {
          await api.setCompleted(
            mutation.key,
            mutation.modified.completed,
            writes.signal,
          )
        }
        lab.record(
          'client',
          'Respuesta PATCH recibida. Se pide un GET de confirmación.',
        )
        try {
          // RC1 exige reconciliar explícitamente, no basta con devolver la respuesta HTTP.
          await collection.utils.refetch({ throwOnError: true })
        } catch {
          if (!lab.active)
            throw new DOMException('Sesión cerrada.', 'AbortError')
          throw new ReconciliationError()
        }
      },
    }),
  )

  function stop() {
    // Cierra el mock y cancela escrituras; dispose cancela también las lecturas.
    lab.dispose()
    writes.abort()
  }

  async function dispose() {
    stop()
    await queryClient.cancelQueries()
    await collection.cleanup({ dependents: true })
    queryClient.clear()
  }

  return { collection, lab, stop, dispose }
}

export type RemoteSession = ReturnType<typeof createRemoteSession>
