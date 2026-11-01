import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import LessonView from './LessonView.vue'
import FirstLessonView from '../01-first-collection/LessonView.vue'

const wrappers: VueWrapper[] = []

function openLesson() {
  const wrapper = mount(LessonView, {
    attachTo: document.body,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  wrappers.push(wrapper)
  return wrapper
}

function sourceRows(wrapper: VueWrapper) {
  return JSON.parse(
    wrapper.get('[aria-label="JSON de la colección de origen"]').text(),
  ) as Array<{ id: string; title: string; completed: boolean }>
}

function resultRows(wrapper: VueWrapper) {
  return JSON.parse(
    wrapper.get('[aria-label="JSON del resultado de la consulta"]').text(),
  ) as Array<{ id: string; label: string; completed: boolean }>
}

async function chooseFilter(wrapper: VueWrapper, label: string) {
  const button = wrapper
    .findAll('.task-filters button')
    .find((item) => item.text() === label)
  expect(button).toBeDefined()
  await button!.trigger('click')
  await flushPromises()
}

afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await flushPromises()
})

describe('filtros reactivos con TanStack DB RC1 real', () => {
  it.each([0, 1, 2])(
    'conserva el recorrido de teclado al retirar la fila %i y al vaciar la lista',
    async (index) => {
      const wrapper = openLesson()
      await flushPromises()
      await chooseFilter(wrapper, 'Pendientes')
      const inputs = wrapper.findAll<HTMLInputElement>('.task-list input')
      const next = inputs[index + 1] ?? inputs[index - 1]
      inputs[index]!.element.focus()
      await inputs[index]!.setValue(true)
      await flushPromises()
      expect(document.activeElement).toBe(next!.element)

      while (wrapper.findAll('.task-list input').length) {
        const input = wrapper.get<HTMLInputElement>('.task-list input')
        input.element.focus()
        await input.setValue(true)
        await flushPromises()
      }
      expect(document.activeElement).toBe(
        wrapper.get('.task-filters button[aria-pressed="true"]').element,
      )
      expect(sourceRows(wrapper)).toHaveLength(4)
    },
  )

  it('mantiene el foco en la misma casilla si la tarea sigue visible', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const input = wrapper.get<HTMLInputElement>('.task-list input')
    input.element.focus()
    await input.setValue(false)
    await flushPromises()
    expect(document.activeElement).toBe(input.element)
    expect(input.element.disabled).toBe(false)
  })

  it('no roba el foco si el cambio no se inició desde la casilla enfocada', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await chooseFilter(wrapper, 'Pendientes')
    const filter = wrapper.get<HTMLButtonElement>(
      '.task-filters button[aria-pressed="true"]',
    )
    filter.element.focus()
    await wrapper.get('.task-list input').setValue(true)
    await flushPromises()
    expect(document.activeElement).toBe(filter.element)
  })

  it('cambia de todas a pendientes y completadas sin alterar el origen', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const original = sourceRows(wrapper)
    expect(wrapper.findAll('.task-list li')).toHaveLength(4)

    await chooseFilter(wrapper, 'Pendientes')
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
    expect(resultRows(wrapper).every((task) => !task.completed)).toBe(true)
    expect(sourceRows(wrapper)).toEqual(original)

    await chooseFilter(wrapper, 'Completadas')
    expect(resultRows(wrapper).map((task) => task.id)).toEqual(['task-1'])
    expect(sourceRows(wrapper)).toEqual(original)

    await chooseFilter(wrapper, 'Todas')
    expect(wrapper.findAll('.task-list li')).toHaveLength(4)
  })

  it('muestra la proyección y el desempate por ID conservando los campos de origen', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const source = sourceRows(wrapper)
    const result = resultRows(wrapper)
    // No suponemos un orden de iteración implícito para la colección fuente.
    expect(source.map((task) => task.id).sort()).toEqual([
      'task-1',
      'task-2',
      'task-3',
      'task-4',
    ])
    expect(result.map((task) => task.id)).toEqual([
      'task-1',
      'task-2',
      'task-4',
      'task-3',
    ])
    expect(result[0]).toEqual({
      id: 'task-1',
      label: 'Cambiar un filtro',
      completed: true,
    })
    expect(source[0]).toHaveProperty('title')
    expect(result[0]).not.toHaveProperty('title')
  })

  it('saca una tarea completada de pendientes y conserva el cambio al filtrar', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await chooseFilter(wrapper, 'Pendientes')
    const row = wrapper
      .findAll('.task-list li')
      .find((item) => item.text().includes('Cambiar un filtro'))
    await row!.get('input').setValue(true)
    await flushPromises()
    expect(wrapper.findAll('.task-list li')).toHaveLength(2)
    expect(resultRows(wrapper).map((task) => task.id)).not.toContain('task-2')
    expect(
      sourceRows(wrapper).find((task) => task.id === 'task-2')?.completed,
    ).toBe(true)

    await chooseFilter(wrapper, 'Completadas')
    expect(resultRows(wrapper).map((task) => task.id)).toEqual([
      'task-1',
      'task-2',
    ])
    await chooseFilter(wrapper, 'Todas')
    expect(sourceRows(wrapper)).toHaveLength(4)
    expect(
      resultRows(wrapper).find((task) => task.id === 'task-2')?.completed,
    ).toBe(true)
  })

  it('explica un resultado vacío sin perder las entidades', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await chooseFilter(wrapper, 'Pendientes')
    for (let count = 0; count < 3; count++) {
      await wrapper.get('.task-list input').setValue(true)
      await flushPromises()
    }
    expect(wrapper.findAll('.task-list li')).toHaveLength(0)
    expect(wrapper.get('.filter-empty').text()).toContain(
      'siguen en la colección',
    )
    expect(sourceRows(wrapper)).toHaveLength(4)
    await chooseFilter(wrapper, 'Todas')
    expect(resultRows(wrapper)).toHaveLength(4)
    expect(resultRows(wrapper).every((task) => task.completed)).toBe(true)
  })

  it('reinicia datos y filtro repetidamente y libera las consultas anteriores', async () => {
    const cleanupErrors = vi.spyOn(console, 'error')
    const wrapper = openLesson()
    await flushPromises()
    for (let iteration = 0; iteration < 3; iteration++) {
      await chooseFilter(wrapper, 'Pendientes')
      await wrapper.get('.task-list input').setValue(true)
      await flushPromises()
      await chooseFilter(wrapper, 'Completadas')
      await wrapper.get('.playground-footer button').trigger('click')
      await flushPromises()
      expect(
        wrapper.get('.task-filters button[aria-pressed="true"]').text(),
      ).toBe('Todas')
      expect(resultRows(wrapper)).toHaveLength(4)
      expect(sourceRows(wrapper).filter((task) => task.completed)).toHaveLength(
        1,
      )
    }
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    await flushPromises()
    expect(cleanupErrors).not.toHaveBeenCalled()
  })

  it('mantiene intacta la primera lección al practicar con los filtros', async () => {
    const first = mount(FirstLessonView, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    wrappers.push(first)
    const second = openLesson()
    await flushPromises()
    const original = first.get('.json-view').text()
    await chooseFilter(second, 'Pendientes')
    await second.get('.task-list input').setValue(true)
    await flushPromises()
    expect(first.findAll('.task-list li')).toHaveLength(3)
    expect(first.get('.json-view').text()).toBe(original)
  })
})
