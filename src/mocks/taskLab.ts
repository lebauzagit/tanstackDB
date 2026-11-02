import type { Task } from '../domain/task'

export interface LabEvent {
  id: number
  elapsed: number
  side: 'client' | 'api'
  message: string
}
export interface LabRequest {
  id: number
  method: 'GET' | 'PATCH'
  path: string
  latency: number
  status: 'pending' | 'success' | 'rejected' | 'aborted'
  httpStatus?: number
}

const labs = new Map<string, TaskLab>()
export function getTaskLab(id: string) {
  return labs.get(id)
}

// Esta es la fuente autoritativa del mock: no importa ni lee TanStack DB.
export class TaskLab {
  readonly id = crypto.randomUUID()
  readonly startedAt = Date.now()
  private rows: Task[] = [
    { id: 'task-1', title: 'Leer desde una API simulada', completed: true },
    { id: 'task-2', title: 'Completar sin esperar a la red', completed: false },
    { id: 'task-3', title: 'Observar la confirmación', completed: false },
  ]
  private listeners = new Set<() => void>()
  private history: LabEvent[] = []
  private traffic: LabRequest[] = []
  private latency = 0
  private nextReadFails = false
  private nextWriteFailure: 'reject' | 'confirmation' | null = null
  active = true

  constructor() {
    labs.set(this.id, this)
  }

  get tasks() {
    return this.rows.map((task) => ({ ...task }))
  }
  get events() {
    return this.history.map((event) => ({ ...event }))
  }
  get requests() {
    return this.traffic.map((request) => ({ ...request }))
  }
  get latencyMs() {
    return this.latency
  }
  get faults() {
    return { read: this.nextReadFails, write: this.nextWriteFailure }
  }

  failNextRead() {
    this.nextReadFails = true
    this.record(
      'api',
      'Preparado: la próxima lectura GET fallará una sola vez.',
    )
  }

  failNextWrite(mode: 'reject' | 'confirmation') {
    this.nextWriteFailure = mode
    this.record(
      'api',
      mode === 'reject'
        ? 'Preparado: la próxima escritura PATCH será rechazada sin commit.'
        : 'Preparado: el próximo PATCH se aceptará, pero fallará su lectura de confirmación.',
    )
  }

  consumeReadFailure() {
    const fail = this.nextReadFails
    this.nextReadFails = false
    this.notify()
    return fail
  }

  consumeWriteFailure() {
    const failure = this.nextWriteFailure
    this.nextWriteFailure = null
    this.notify()
    return failure
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  record(side: LabEvent['side'], message: string) {
    if (!this.active) return
    this.history.push({
      id: this.history.length + 1,
      elapsed: Date.now() - this.startedAt,
      side,
      message,
    })
    this.notify()
  }

  setLatency(ms: number) {
    if (![0, 500, 1500].includes(ms)) throw new Error('Latencia no soportada.')
    this.latency = ms
    this.record('api', `Latencia del mock: ${ms} ms por petición.`)
  }

  beginRequest(method: LabRequest['method'], path: string): LabRequest {
    const request: LabRequest = {
      id: this.traffic.length + 1,
      method,
      path,
      latency: this.latency,
      status: 'pending',
    }
    this.traffic.push(request)
    this.record(
      'api',
      `${method} recibido; espera simulada de ${request.latency} ms.`,
    )
    return request
  }

  finishRequest(id: number, status: LabRequest['status'], httpStatus?: number) {
    const request = this.traffic.find((item) => item.id === id)
    if (request) {
      request.status = status
      request.httpStatus = httpStatus
    }
    this.notify()
  }

  updateTask(id: string, completed: boolean) {
    const task = this.rows.find((item) => item.id === id)
    if (!task || !this.active) return null
    task.completed = completed
    this.record('api', `Escritura aplicada a ${id} en el estado del mock.`)
    return { ...task }
  }

  dispose() {
    this.active = false
    labs.delete(this.id)
    this.listeners.clear()
  }
}
