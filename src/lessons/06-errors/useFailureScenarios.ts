import { computed } from 'vue'
import type { RemoteSession } from '../05-remote-tasks/collections'
import { useRemoteTasks } from '../05-remote-tasks/useRemoteTasks'
import { useLabInspector } from '../05-remote-tasks/useLabInspector'

export function useFailureScenarios(session: RemoteSession) {
  const tasks = useRemoteTasks(session)
  const inspector = useLabInspector(session.lab)
  const busy = computed(
    () =>
      tasks.writing.value ||
      tasks.reading.value ||
      (tasks.isLoading.value &&
        !tasks.isLoadingError.value &&
        !tasks.isCrashed.value),
  )
  const canArm = computed(() => !busy.value && !tasks.needsVerification.value)
  const outcome = computed(() => {
    if (tasks.writing.value) return 'Escritura optimista en curso…'
    if (tasks.reading.value) return 'Leyendo la API para comprobar su estado…'
    if (
      !tasks.data.value.length &&
      (tasks.isLoadingError.value || tasks.isCrashed.value)
    )
      return 'Primera carga fallida: todavía no hay datos del cliente.'
    if (tasks.isLoading.value && !tasks.data.value.length)
      return 'Cargando por primera vez…'
    if (tasks.needsVerification.value)
      return 'Estado sin verificar: recupera con una lectura antes de volver a escribir.'
    if (tasks.failure.value === 'write-rejected')
      return 'Rechazo confirmado: rollback local completado.'
    if (tasks.failure.value === 'read-failed')
      return 'Lectura fallida: se conserva el último resultado disponible.'
    return 'Listo: prepara un fallo y observa el resultado.'
  })

  function rejectNextWrite() {
    if (canArm.value) session.lab.failNextWrite('reject')
  }
  function failNextRead() {
    if (canArm.value) session.lab.failNextRead()
  }
  function failConfirmation() {
    if (canArm.value) session.lab.failNextWrite('confirmation')
  }

  return {
    ...tasks,
    ...inspector,
    busy,
    canArm,
    outcome,
    rejectNextWrite,
    failNextRead,
    failConfirmation,
  }
}
