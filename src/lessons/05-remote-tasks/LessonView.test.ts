import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { mockServer } from '../../mocks/node'
import { getTaskLab } from '../../mocks/taskLab'
import { createRemoteSession, type RemoteSession } from './collections'
import RemoteTasks from './RemoteTasks.vue'
import LessonView from './LessonView.vue'

const { bootstrap } = vi.hoisted(() => ({
  bootstrap: vi.fn<() => Promise<void>>(),
}))
vi.mock('../../mocks/browser', () => ({ ensureMockApi: bootstrap }))

const wrappers: VueWrapper[] = []
const sessions: RemoteSession[] = []
const received: string[] = []

beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' })
  mockServer.events.on('request:start', ({ request }) => {
    received.push(request.url)
  })
})
beforeEach(() => {
  received.length = 0
  bootstrap.mockReset().mockResolvedValue(undefined)
})
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await Promise.all(sessions.splice(0).map((session) => session.dispose()))
  await flushPromises()
  mockServer.resetHandlers()
})
afterAll(() => mockServer.close())

function openTasks() {
  const session = createRemoteSession()
  sessions.push(session)
  const wrapper = mount(RemoteTasks, {
    props: { session },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return { session, wrapper }
}
function openLesson() {
  const wrapper = mount(LessonView, {
    attachTo: document.body,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  wrappers.push(wrapper)
  return wrapper
}
async function ready(wrapper: VueWrapper) {
  await vi.waitFor(() =>
    expect(wrapper.findAll('[aria-label="Tareas remotas"] li')).toHaveLength(3),
  )
}
function rows(wrapper: VueWrapper) {
  return JSON.parse(
    wrapper.get('[aria-label="JSON del cliente remoto"]').text(),
  ) as Array<{ id: string; completed: boolean; pending: boolean }>
}
function pendingInput(wrapper: VueWrapper) {
  return wrapper.findAll<HTMLInputElement>('.task-list input')[1]!
}

describe('Query Collection RC1 y HTTP simulado', () => {
  it('carga por HTTP una sola vez y mantiene un estado autoritativo independiente', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    expect(session.lab.requests.map((request) => request.method)).toEqual([
      'GET',
    ])
    expect(rows(wrapper).every((task) => !task.pending)).toBe(true)
    const apiRows = session.lab.tasks
    apiRows[1]!.completed = true
    expect(session.lab.tasks[1]!.completed).toBe(false)
    expect(rows(wrapper)[1]!.completed).toBe(false)
  })

  it('muestra optimismo antes del commit y confirma con PATCH seguido de GET', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    session.lab.setLatency(500)
    const input = pendingInput(wrapper)
    input.element.focus()
    await input.setValue(true)
    await vi.waitFor(() => expect(rows(wrapper)[1]!.pending).toBe(true))
    expect(input.element.checked).toBe(true)
    expect(session.lab.tasks[1]!.completed).toBe(false)
    expect(wrapper.text()).toContain('Esperando escritura y confirmación')
    await vi.waitFor(() => expect(rows(wrapper)[1]!.pending).toBe(false), {
      timeout: 4000,
    })
    expect(session.lab.tasks[1]!.completed).toBe(true)
    expect(rows(wrapper)[1]!.completed).toBe(true)
    expect(session.lab.requests.map((request) => request.method)).toEqual([
      'GET',
      'PATCH',
      'GET',
    ])
    expect(session.lab.events.at(-1)?.message).toContain(
      'Reconciliación completada',
    )
    expect(document.activeElement).toBe(input.element)
  })

  it('una lectura manual añade un GET sin escribir ni vaciar la colección', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    const original = session.lab.tasks
    await wrapper.get('button').trigger('click')
    await vi.waitFor(() => expect(session.lab.requests).toHaveLength(2))
    await vi.waitFor(() =>
      expect(wrapper.get('button').attributes('disabled')).toBeUndefined(),
    )
    expect(
      session.lab.requests.every((request) => request.method === 'GET'),
    ).toBe(true)
    expect(session.lab.tasks).toEqual(original)
    expect(rows(wrapper)).toHaveLength(3)
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
  })

  it('reinicia durante un PATCH y las respuestas antiguas no contaminan la sesión nueva', async () => {
    const wrapper = openLesson()
    await ready(wrapper)
    const oldId = new URL(received[0]!).pathname.split('/')[3]!
    const oldLab = getTaskLab(oldId)!
    await wrapper.get('select').setValue('500')
    await pendingInput(wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(
        oldLab.requests.some((request) => request.method === 'PATCH'),
      ).toBe(true),
    )
    await wrapper.get('.playground-footer button').trigger('click')
    await ready(wrapper)
    await new Promise((resolve) => setTimeout(resolve, 550))
    expect(oldLab.active).toBe(false)
    expect(oldLab.tasks[1]!.completed).toBe(false)
    expect(rows(wrapper)[1]!.completed).toBe(false)
    expect(rows(wrapper)[1]!.pending).toBe(false)
    expect(wrapper.get('select').element.value).toBe('0')
    expect(document.activeElement?.textContent).toContain(
      'La red se hace visible',
    )
  })

  it('aísla dos sesiones en sus rutas, cachés y datos de la API', async () => {
    const first = openTasks()
    const second = openTasks()
    await Promise.all([ready(first.wrapper), ready(second.wrapper)])
    await pendingInput(first.wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(first.session.lab.tasks[1]!.completed).toBe(true),
    )
    await vi.waitFor(() => expect(rows(first.wrapper)[1]!.pending).toBe(false))
    expect(second.session.lab.tasks[1]!.completed).toBe(false)
    expect(rows(second.wrapper)[1]!.completed).toBe(false)
    expect(second.session.lab.requests).toHaveLength(1)
    expect(first.session.lab.id).not.toBe(second.session.lab.id)
  })

  it('permite reintentar la primera carga fallida sin reintentos ocultos', async () => {
    mockServer.use(
      http.get('*/api/lab/:sessionId/tasks', () =>
        HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 503 }),
      ),
    )
    const { wrapper } = openTasks()
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('No se pudo realizar la primera carga'),
    )
    expect(received).toHaveLength(1)
    mockServer.resetHandlers()
    await wrapper.get('button').trigger('click')
    await ready(wrapper)
    expect(rows(wrapper)[1]!.completed).toBe(false)
  })

  it('un rechazo de escritura revierte el cliente y no cambia el mock', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    mockServer.use(
      http.patch('*/api/lab/:sessionId/tasks/:taskId', () =>
        HttpResponse.json({ code: 'REJECTED' }, { status: 400 }),
      ),
    )
    await pendingInput(wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('No se pudo confirmar el cambio'),
    )
    expect(rows(wrapper)[1]!.completed).toBe(false)
    expect(rows(wrapper)[1]!.pending).toBe(false)
    expect(session.lab.tasks[1]!.completed).toBe(false)
  })

  it('distingue escritura aceptada de lectura fallida y recupera sin repetir el PATCH', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    mockServer.use(
      http.get('*/api/lab/:sessionId/tasks', () =>
        HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 503 }),
      ),
    )
    await pendingInput(wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('La escritura llegó a la API'),
    )
    expect(session.lab.tasks[1]!.completed).toBe(true)
    expect(rows(wrapper)).toHaveLength(3)
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
    mockServer.resetHandlers()
    await wrapper.get('button').trigger('click')
    await vi.waitFor(() => expect(rows(wrapper)[1]!.completed).toBe(true))
    expect(
      session.lab.requests.filter((request) => request.method === 'PATCH'),
    ).toHaveLength(1)
  })

  it('rechaza cambios fuera del contrato HTTP sin modificar datos', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    const response = await fetch(
      new URL(
        `/api/lab/${session.lab.id}/tasks/task-2`,
        window.location.origin,
      ),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: 'sí' }),
      },
    )
    expect(response.status).toBe(400)
    expect(session.lab.tasks[1]!.completed).toBe(false)
  })

  it('muestra un error de arranque del worker y permite volver a activarlo', async () => {
    bootstrap.mockRejectedValueOnce(new Error('Worker no disponible'))
    const wrapper = openLesson()
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('No se pudo activar la API simulada'),
    )
    expect(received).toHaveLength(0)
    await wrapper.get('.playground .button').trigger('click')
    await ready(wrapper)
  })
})
