import { readonly, ref } from 'vue'
import { useLiveQuery } from '@tanstack/vue-db'
import { ReconciliationError, type RemoteSession } from './collections'
import { TaskApiError } from '../../api/tasks'

export type RemoteFailure =
  | 'write-rejected'
  | 'confirmation-failed'
  | 'write-unknown'
  | 'read-failed'
  | null

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
  const failure = ref<RemoteFailure>(null)
  const needsVerification = ref(false)

  async function toggleTask(id: string) {
    if (writing.value || reading.value || needsVerification.value) return
    writing.value = true
    errorMessage.value = ''
    failure.value = null
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
      if (error instanceof ReconciliationError) {
        failure.value = 'confirmation-failed'
        needsVerification.value = true
        errorMessage.value = error.message
      } else if (
        error instanceof TaskApiError &&
        [400, 404, 422].includes(error.status)
      ) {
        failure.value = 'write-rejected'
        errorMessage.value =
          'No se pudo confirmar el cambio: la API rechazó la escritura. DB revirtió el cambio optimista; la API no lo aplicó.'
      } else {
        failure.value = 'write-unknown'
        needsVerification.value = true
        errorMessage.value =
          'No se pudo confirmar el cambio. Vuelve a leer la API simulada para comprobar su estado.'
      }
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
    failure.value = null
    try {
      if (query.isLoadingError.value || query.isCrashed.value)
        // RC1 recarga las fuentes fallidas y después reconstruye este lector.
        await query.collection.value.reload()
      else await collection.utils.refetch({ throwOnError: true })
      needsVerification.value = false
      if (lab.active)
        lab.record(
          'client',
          'Lectura manual completada; los datos proceden de la API simulada.',
        )
    } catch {
      if (lab.active) {
        failure.value = 'read-failed'
        errorMessage.value = query.data.value.length
          ? 'No se pudo leer la API simulada. Se conservan los datos ya disponibles; vuelve a intentarlo.'
          : 'No se pudo leer la API simulada. Todavía no hay datos del cliente; vuelve a intentar la primera carga.'
      }
    } finally {
      reading.value = false
    }
  }

  return {
    ...query,
    writing: readonly(writing),
    reading: readonly(reading),
    errorMessage: readonly(errorMessage),
    failure: readonly(failure),
    needsVerification: readonly(needsVerification),
    toggleTask,
    readAgain,
  }
}
