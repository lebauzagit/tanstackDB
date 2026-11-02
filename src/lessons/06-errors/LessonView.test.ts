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
import {
  createRemoteSession,
  type RemoteSession,
} from '../05-remote-tasks/collections'
import RemoteTasks from '../05-remote-tasks/RemoteTasks.vue'
import { createFailureSession } from './collections'
import ErrorTasks from './ErrorTasks.vue'
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
  const session = createFailureSession()
  session.lab.setLatency(0)
  sessions.push(session)
  const wrapper = mount(ErrorTasks, {
    props: { session },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return { wrapper, session }
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
  await vi.waitFor(
    () =>
      expect(
        wrapper.findAll('[aria-label="Tareas del laboratorio de errores"] li'),
      ).toHaveLength(3),
    { timeout: 3500 },
  )
}
function clientRows(wrapper: VueWrapper) {
  return JSON.parse(
    wrapper.get('[aria-label="JSON del cliente de errores"]').text(),
  ) as Array<{ id: string; completed: boolean; pending: boolean }>
}
function clientView(wrapper: VueWrapper) {
  return wrapper.get('[aria-label="Cliente en el laboratorio de errores"]')
}
function input(wrapper: VueWrapper) {
  return wrapper.findAll<HTMLInputElement>('.task-list input')[1]!
}
function controls(wrapper: VueWrapper) {
  return wrapper.findAll<HTMLButtonElement>('.failure-buttons button')
}
async function read(wrapper: VueWrapper) {
  await wrapper.get('.read-api').trigger('click')
  await vi.waitFor(
    () =>
      expect(wrapper.get('.read-api').attributes('disabled')).toBeUndefined(),
    { timeout: 3500 },
  )
}

describe('fallos deterministas y recuperación RC1', () => {
  it('preparar un fallo no hace HTTP y sustituye el fallo de escritura anterior', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    await controls(wrapper)[0]!.trigger('click')
    expect(session.lab.requests).toHaveLength(1)
    expect(wrapper.get('.failure-plan').text()).toContain('rechazo 422')
    await controls(wrapper)[2]!.trigger('click')
    expect(session.lab.faults.write).toBe('confirmation')
    expect(session.lab.requests).toHaveLength(1)
    expect(session.lab.tasks[1]!.completed).toBe(false)
  })

  it('rechaza un PATCH, revierte el optimismo y consume el fallo una sola vez', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    session.lab.setLatency(500)
    await controls(wrapper)[0]!.trigger('click')
    const checkbox = input(wrapper)
    checkbox.element.focus()
    await checkbox.setValue(true)
    await vi.waitFor(() => expect(clientRows(wrapper)[1]!.pending).toBe(true))
    expect(clientRows(wrapper)[1]!.completed).toBe(true)
    expect(session.lab.tasks[1]!.completed).toBe(false)
    await vi.waitFor(
      () =>
        expect(wrapper.get('.remote-summary strong').text()).toContain(
          'Rechazo confirmado',
        ),
      { timeout: 3500 },
    )
    expect(clientRows(wrapper)[1]).toMatchObject({
      completed: false,
      pending: false,
    })
    expect(session.lab.tasks[1]!.completed).toBe(false)
    expect(session.lab.requests.map((request) => request.httpStatus)).toEqual([
      200, 422,
    ])
    expect(document.activeElement).toBe(checkbox.element)
    session.lab.setLatency(0)
    await checkbox.setValue(true)
    await vi.waitFor(() =>
      expect(clientRows(wrapper)[1]).toMatchObject({
        completed: true,
        pending: false,
      }),
    )
    expect(session.lab.tasks[1]!.completed).toBe(true)
    expect(session.lab.requests.map((request) => request.httpStatus)).toEqual([
      200, 422, 200, 200,
    ])
  })

  it('un GET fallido conserva las filas visibles y recupera con otro GET sin PATCH', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    const original = clientRows(wrapper)
    await controls(wrapper)[1]!.trigger('click')
    await read(wrapper)
    expect(clientView(wrapper).text()).toContain(
      'Se conservan los datos ya disponibles',
    )
    expect(clientRows(wrapper)).toEqual(original)
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
    expect(session.lab.requests.map((request) => request.httpStatus)).toEqual([
      200, 503,
    ])
    await read(wrapper)
    expect(clientView(wrapper).findAll('[role="alert"]')).toHaveLength(0)
    expect(session.lab.requests.map((request) => request.httpStatus)).toEqual([
      200, 503, 200,
    ])
    expect(
      session.lab.requests.every((request) => request.method === 'GET'),
    ).toBe(true)
  })

  it('distingue la primera carga fallida y la recupera sin reintentos ocultos', async () => {
    const wrapper = openLesson()
    await ready(wrapper)
    await controls(wrapper)[3]!.trigger('click')
    await vi.waitFor(
      () =>
        expect(clientView(wrapper).text()).toContain('Falló la primera carga'),
      { timeout: 3500 },
    )
    expect(clientRows(wrapper)).toEqual([])
    expect(
      JSON.parse(
        wrapper.get('[aria-label="JSON de la API de errores"]').text(),
      ),
    ).toHaveLength(3)
    expect(wrapper.findAll('.request-inspector tbody tr')).toHaveLength(1)
    expect(wrapper.get<HTMLButtonElement>('.read-api').element.disabled).toBe(false)
    await controls(wrapper)[1]!.trigger('click')
    await read(wrapper)
    expect(clientView(wrapper).text()).toContain('Todavía no hay datos del cliente')
    expect(clientRows(wrapper)).toEqual([])
    await read(wrapper)
    await ready(wrapper)
    expect(wrapper.findAll('.request-inspector tbody tr')).toHaveLength(3)
  })

  it('un commit con GET fallido exige verificar y nunca repite el PATCH al recuperar', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    await controls(wrapper)[2]!.trigger('click')
    input(wrapper).element.focus()
    await input(wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(clientView(wrapper).text()).toContain(
        'La escritura llegó a la API',
      ),
    )
    expect(session.lab.tasks[1]!.completed).toBe(true)
    expect(clientRows(wrapper)[1]).toMatchObject({
      completed: false,
      pending: false,
    })
    expect(input(wrapper).element.disabled).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('.read-api').element)
    session.lab.failNextRead()
    await read(wrapper)
    expect(input(wrapper).element.disabled).toBe(true)
    expect(wrapper.get('.remote-summary strong').text()).toContain(
      'Estado sin verificar',
    )
    await read(wrapper)
    expect(clientRows(wrapper)[1]).toMatchObject({
      completed: true,
      pending: false,
    })
    expect(input(wrapper).element.disabled).toBe(false)
    expect(
      session.lab.requests.filter((request) => request.method === 'PATCH'),
    ).toHaveLength(1)
    expect(session.lab.requests.map((request) => request.httpStatus)).toEqual([
      200, 200, 503, 503, 200,
    ])
  })

  it('un fallo de transporte de escritura también exige leer antes de volver a escribir', async () => {
    const { wrapper } = openTasks()
    await ready(wrapper)
    mockServer.use(
      http.patch('*/api/lab/:sessionId/tasks/:taskId', () =>
        HttpResponse.error(),
      ),
    )
    await input(wrapper).setValue(true)
    await vi.waitFor(() =>
      expect(wrapper.get('.remote-summary strong').text()).toContain(
        'Estado sin verificar',
      ),
    )
    expect(input(wrapper).element.disabled).toBe(true)
    mockServer.resetHandlers()
    await read(wrapper)
    expect(input(wrapper).element.disabled).toBe(false)
    expect(clientRows(wrapper)[1]!.completed).toBe(false)
  })

  it('los fallos de 06 no afectan a otra sesión ni a la lección 05', async () => {
    const first = openTasks()
    const second = createRemoteSession()
    sessions.push(second)
    const other = mount(RemoteTasks, { props: { session: second } })
    wrappers.push(other)
    await ready(first.wrapper)
    await vi.waitFor(() =>
      expect(other.findAll('.task-list li')).toHaveLength(3),
    )
    await controls(first.wrapper)[0]!.trigger('click')
    await other.findAll('input')[1]!.setValue(true)
    await vi.waitFor(() => expect(second.lab.tasks[1]!.completed).toBe(true))
    expect(first.session.lab.tasks[1]!.completed).toBe(false)
    expect(first.session.lab.faults.write).toBe('reject')
    expect(second.lab.faults).toEqual({ read: false, write: null })
  })

  it('el reinicio elimina fallos preparados y conserva una semilla nueva', async () => {
    const wrapper = openLesson()
    await ready(wrapper)
    await controls(wrapper)[0]!.trigger('click')
    await controls(wrapper)[1]!.trigger('click')
    await wrapper.get('.playground-footer button').trigger('click')
    await ready(wrapper)
    expect(wrapper.get('.failure-plan').text()).toContain(
      'Sin fallo de escritura preparado',
    )
    expect(wrapper.get('.failure-plan').text()).toContain(
      'Sin fallo de lectura preparado',
    )
    expect(clientRows(wrapper)[1]!.completed).toBe(false)
    expect(wrapper.findAll('.request-inspector tbody tr')).toHaveLength(1)
  })

  it('reiniciar durante un PATCH impide que el commit anterior reaparezca', async () => {
    const wrapper = openLesson()
    await ready(wrapper)
    const oldId = new URL(received[0]!).pathname.split('/')[3]!
    const oldLab = getTaskLab(oldId)!
    await input(wrapper).setValue(true)
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
    expect(clientRows(wrapper)[1]).toMatchObject({
      completed: false,
      pending: false,
    })
    expect(document.activeElement?.textContent).toContain(
      'Un error, varias historias',
    )
  })

  it('no permite preparar otro fallo mientras una escritura está en curso', async () => {
    const { wrapper, session } = openTasks()
    await ready(wrapper)
    session.lab.setLatency(500)
    await input(wrapper).setValue(true)
    expect(controls(wrapper).every((button) => button.element.disabled)).toBe(
      true,
    )
    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
    await vi.waitFor(
      () => expect(clientRows(wrapper)[1]!.pending).toBe(false),
      { timeout: 3500 },
    )
    expect(session.lab.faults).toEqual({ read: false, write: null })
  })
})
