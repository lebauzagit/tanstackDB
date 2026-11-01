import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import LessonView from './LessonView.vue'
import { STORAGE_KEY } from './collections'

const wrappers: VueWrapper[] = []
function openLesson() {
  const wrapper = mount(LessonView, {
    attachTo: document.body,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  wrappers.push(wrapper)
  return wrapper
}
function panel(wrapper: VueWrapper, mode: 'memoria' | 'navegador') {
  return wrapper.get(
    mode === 'memoria'
      ? '[aria-label="Lista en memoria"]'
      : '[aria-label="Lista en el navegador"]',
  )
}
function rows(view: ReturnType<typeof panel>) {
  return JSON.parse(view.get('.json-view').text()) as Array<{
    id: string
    title: string
    completed: boolean
  }>
}
async function add(view: ReturnType<typeof panel>, title: string) {
  await view.get('form input').setValue(title)
  await view.get('form').trigger('submit')
  await flushPromises()
}
function close(wrapper: VueWrapper) {
  wrappers.splice(wrappers.indexOf(wrapper), 1)
  wrapper.unmount()
}
beforeEach(() => window.localStorage.removeItem(STORAGE_KEY))
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await flushPromises()
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem('taller-db:test:unrelated')
})

describe('CRUD y persistencia local RC1', () => {
  it.each(['memoria', 'navegador'] as const)(
    'crea, edita, completa y elimina en %s sin modificar la otra lista',
    async (mode) => {
      const wrapper = openLesson()
      await flushPromises()
      const view = panel(wrapper, mode)
      const other = panel(wrapper, mode === 'memoria' ? 'navegador' : 'memoria')
      const original = rows(other)
      await add(view, '  Nueva tarea  ')
      expect(rows(view)).toHaveLength(4)
      const row = view
        .findAll('.task-list li')
        .find((item) => item.text().includes('Nueva tarea'))!
      await row.get('button').trigger('click')
      await view.get('form input').setValue('Título editado')
      await view.get('form').trigger('submit')
      await flushPromises()
      expect(
        rows(view).find((task) => task.title === 'Título editado'),
      ).toBeDefined()
      await row.get('input').setValue(true)
      await flushPromises()
      expect(
        rows(view).find((task) => task.title === 'Título editado')?.completed,
      ).toBe(true)
      await row.get('.delete-task').trigger('click')
      await flushPromises()
      expect(rows(view)).toHaveLength(3)
      expect(rows(other)).toEqual(original)
    },
  )

  it('restaura altas, edición, estado y eliminaciones de B; A recupera la semilla', async () => {
    const first = openLesson()
    await flushPromises()
    await add(panel(first, 'memoria'), 'Solo en memoria')
    const stored = panel(first, 'navegador')
    await add(stored, 'Tarea persistida')
    await stored.get('.task-list button').trigger('click')
    await stored.get('form input').setValue('Título persistido')
    await stored.get('form').trigger('submit')
    await flushPromises()
    const checkbox = stored.get<HTMLInputElement>('.task-list input')
    await checkbox.setValue(!checkbox.element.checked)
    await stored.findAll('.delete-task')[1]!.trigger('click')
    await flushPromises()
    const expected = rows(stored)
    close(first)
    await flushPromises()
    const second = openLesson()
    await flushPromises()
    expect(rows(panel(second, 'navegador'))).toEqual(expected)
    expect(rows(panel(second, 'memoria'))).toHaveLength(3)
    expect(panel(second, 'memoria').text()).not.toContain('Solo en memoria')
  })

  it('conserva una lista vacía al volver a abrirla', async () => {
    const first = openLesson()
    await flushPromises()
    const stored = panel(first, 'navegador')
    for (let i = 0; i < 3; i++) {
      await stored.get('.delete-task').trigger('click')
      await flushPromises()
    }
    expect(rows(stored)).toEqual([])
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    close(first)
    await flushPromises()
    const second = openLesson()
    await flushPromises()
    expect(rows(panel(second, 'navegador'))).toEqual([])
  })

  it.each(['', 'x'.repeat(101)])(
    'rechaza un título inválido sin cambiar DB',
    async (title) => {
      const wrapper = openLesson()
      await flushPromises()
      const view = panel(wrapper, 'navegador')
      const original = rows(view)
      await add(view, title)
      expect(view.find('[role="alert"]').exists()).toBe(true)
      expect(rows(view)).toEqual(original)
      expect(view.get('form input').attributes('aria-invalid')).toBe('true')
    },
  )

  it('cancela borradores y recupera foco útil después de guardar y eliminar', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const view = panel(wrapper, 'navegador')
    const original = rows(view)
    await view.get('.task-list button').trigger('click')
    await view.get('form input').setValue('Borrador')
    await view.get('form button[type="button"]').trigger('click')
    expect(rows(view)).toEqual(original)
    await add(view, 'Tarea con foco')
    expect(document.activeElement).toBe(view.get('form input').element)
    while (view.findAll('.delete-task').length) {
      const buttons = view.findAll<HTMLButtonElement>('.delete-task')
      buttons[0]!.element.focus()
      await buttons[0]!.trigger('click')
      await flushPromises()
      expect(document.activeElement).toBe(
        buttons[1]?.element ?? view.get('form input').element,
      )
    }
  })

  it('reinicia repetidamente sin borrar claves ajenas ni dejar lectores activos', async () => {
    window.localStorage.setItem('taller-db:test:unrelated', 'conservar')
    const errors = vi.spyOn(console, 'error')
    const wrapper = openLesson()
    await flushPromises()
    for (let i = 0; i < 2; i++) {
      await add(panel(wrapper, 'navegador'), 'Temporal')
      await wrapper.get('.playground-footer button').trigger('click')
      await flushPromises()
      expect(rows(panel(wrapper, 'navegador'))).toHaveLength(3)
      expect(rows(panel(wrapper, 'memoria'))).toHaveLength(3)
      expect(window.localStorage.getItem('taller-db:test:unrelated')).toBe(
        'conservar',
      )
    }
    close(wrapper)
    await flushPromises()
    expect(errors).not.toHaveBeenCalled()
  })

  it('muestra datos corruptos como error y solo los sustituye al reiniciar explícitamente', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'datos inválidos')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = openLesson()
    await flushPromises()
    expect(panel(wrapper, 'navegador').get('[role="alert"]').text()).toContain(
      'No se pudo abrir',
    )
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('datos inválidos')
    expect(rows(panel(wrapper, 'memoria'))).toHaveLength(3)
    await wrapper.get('.playground-footer button').trigger('click')
    await flushPromises()
    expect(rows(panel(wrapper, 'navegador'))).toHaveLength(3)
  })

  it('mantiene A disponible si el acceso a localStorage está bloqueado', async () => {
    const getItem = Storage.prototype.getItem
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (
      this: Storage,
      key,
    ) {
      if (key === STORAGE_KEY)
        throw new DOMException('Bloqueado', 'SecurityError')
      return getItem.call(this, key)
    })
    const wrapper = openLesson()
    await flushPromises()
    expect(panel(wrapper, 'navegador').get('[role="alert"]').text()).toContain(
      'No se pudo abrir',
    )
    await add(panel(wrapper, 'memoria'), 'Sigue funcionando')
    expect(rows(panel(wrapper, 'memoria'))).toHaveLength(4)
  })

  it('revierte una escritura rechazada por cuota y conserva el último estado durable', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const view = panel(wrapper, 'navegador')
    const original = rows(view)
    const durable = window.localStorage.getItem(STORAGE_KEY)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const setItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === STORAGE_KEY)
        throw new DOMException('Lleno', 'QuotaExceededError')
      return setItem.call(this, key, value)
    })
    await add(view, 'No debe persistirse')
    expect(view.get('[role="alert"]').text()).toContain('No se pudo guardar')
    expect(rows(view)).toEqual(original)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(durable)
  })
})
