import { http, HttpResponse } from 'msw'
import { getTaskLab, type TaskLab, type LabRequest } from './taskLab'

function waitForRequest(request: Request, ms: number) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      request.signal.removeEventListener('abort', abort)
      reject(new DOMException('Petición cancelada.', 'AbortError'))
    }
    const timer = setTimeout(() => {
      request.signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    if (request.signal.aborted) abort()
    else request.signal.addEventListener('abort', abort, { once: true })
  })
}

async function wait(lab: TaskLab, request: Request, entry: LabRequest) {
  try {
    await waitForRequest(request, entry.latency)
    if (!lab.active || request.signal.aborted)
      throw new Error('Sesión cerrada.')
    return true
  } catch {
    lab.finishRequest(entry.id, 'aborted')
    return false
  }
}

export const handlers = [
  http.get('*/api/lab/:sessionId/tasks', async ({ params, request }) => {
    const lab = getTaskLab(String(params.sessionId))
    if (!lab)
      return HttpResponse.json({ code: 'SESSION_NOT_FOUND' }, { status: 404 })
    const entry = lab.beginRequest('GET', new URL(request.url).pathname)
    if (!(await wait(lab, request, entry)))
      return new HttpResponse(null, { status: 499 })
    const items = lab.tasks
    lab.finishRequest(entry.id, 'success')
    lab.record(
      'api',
      'Respuesta GET emitida desde el estado independiente del mock.',
    )
    return HttpResponse.json({ items, total: items.length })
  }),
  http.patch(
    '*/api/lab/:sessionId/tasks/:taskId',
    async ({ params, request }) => {
      const lab = getTaskLab(String(params.sessionId))
      if (!lab)
        return HttpResponse.json({ code: 'SESSION_NOT_FOUND' }, { status: 404 })
      const entry = lab.beginRequest('PATCH', new URL(request.url).pathname)
      if (!(await wait(lab, request, entry)))
        return new HttpResponse(null, { status: 499 })
      let body: unknown
      try {
        body = await request.json()
      } catch {
        body = null
      }
      if (
        !body ||
        typeof body !== 'object' ||
        !('completed' in body) ||
        typeof body.completed !== 'boolean' ||
        Object.keys(body).some((key) => key !== 'completed')
      ) {
        lab.finishRequest(entry.id, 'rejected')
        return HttpResponse.json(
          { code: 'INVALID_TASK_CHANGE' },
          { status: 400 },
        )
      }
      // La comprobación de sesión y el commit no tienen esperas intermedias.
      if (!lab.active || request.signal.aborted)
        return new HttpResponse(null, { status: 499 })
      const task = lab.updateTask(String(params.taskId), body.completed)
      lab.finishRequest(entry.id, task ? 'success' : 'rejected')
      return task
        ? HttpResponse.json(task)
        : HttpResponse.json({ code: 'TASK_NOT_FOUND' }, { status: 404 })
    },
  ),
]
