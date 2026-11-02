import { readonly, ref } from 'vue'
import { useLiveQuery } from '@tanstack/vue-db'
import { ReconciliationError, type RemoteSession } from './collections'

export function useRemoteTasks(session: RemoteSession) {
  const { collection, lab } = session
  const query = useLiveQuery((q) =>
    q
      .from({ task: collection })
      .orderBy(({ task }) => task.id, 'asc')
      .select(({ task }) => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        pending: task.$hasPendingWrites,
      })),
  )
  const writing = ref(false)
  const reading = ref(false)
  const errorMessage = ref('')

  async function toggleTask(id: string) {
    if (writing.value || reading.value) return
    writing.value = true
    errorMessage.value = ''
    lab.record(
      'client',
      `Acción local sobre ${id}: se crea una escritura optimista.`,
    )
    try {
      const transaction = collection.update(id, (draft) => {
        draft.completed = !draft.completed
      })
      await transaction.when('settled')
      if (lab.active)
        lab.record(
          'client',
          'Reconciliación completada: escritura y lectura autoritativa terminaron.',
        )
    } catch (error) {
      if (!lab.active) return
      errorMessage.value =
        error instanceof ReconciliationError
          ? error.message
          : 'No se pudo confirmar el cambio. Vuelve a leer la API simulada para comprobar su estado.'
      lab.record(
        'client',
        'La acción no pudo confirmarse. Revisa el aviso y el estado de la API.',
      )
    } finally {
      writing.value = false
    }
  }

  async function readAgain() {
    if (writing.value || reading.value) return
    reading.value = true
    errorMessage.value = ''
    try {
      if (query.isLoadingError.value || query.isCrashed.value)
        await collection.reload()
      else await collection.utils.refetch({ throwOnError: true })
      if (lab.active)
        lab.record(
          'client',
          'Lectura manual completada; los datos proceden de la API simulada.',
        )
    } catch {
      if (lab.active)
        errorMessage.value =
          'No se pudo leer la API simulada. Se conservan los datos ya disponibles; vuelve a intentarlo.'
    } finally {
      reading.value = false
    }
  }

  return {
    ...query,
    writing: readonly(writing),
    reading: readonly(reading),
    errorMessage: readonly(errorMessage),
    toggleTask,
    readAgain,
  }
}
