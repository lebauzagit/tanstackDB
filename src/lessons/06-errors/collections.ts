import { createRemoteSession } from '../05-remote-tasks/collections'
import { TaskLab } from '../../mocks/taskLab'

export function createFailureSession(failFirstRead = false) {
  const lab = new TaskLab()
  lab.setLatency(500)
  // Se prepara antes de crear la colección, para no competir con el primer GET.
  if (failFirstRead) lab.failNextRead()
  return createRemoteSession('lesson-06', lab)
}
