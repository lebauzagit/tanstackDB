import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import LessonView from './LessonView.vue'

const wrappers: VueWrapper[] = []

function openLesson() {
  const wrapper = mount(LessonView, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await flushPromises()
})

describe('la primera colección con TanStack DB real', () => {
  it('propaga altas y cambios al resultado y al inspector de origen', async () => {
    const wrapper = openLesson()
    await flushPromises()
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)

    await wrapper.get('#task-title').setValue('Leer sobre colecciones')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.findAll('.task-list li')).toHaveLength(4)
    expect(wrapper.get('.json-view').text()).toContain('Leer sobre colecciones')

    const row = wrapper
      .findAll('.task-list li')
      .find((item) => item.text().includes('Leer sobre colecciones'))
    expect(row).toBeDefined()
    await row!.get('input').setValue(true)
    await flushPromises()
    const rows = JSON.parse(wrapper.get('.json-view').text()) as Array<{
      title: string
      completed: boolean
    }>
    expect(
      rows.find((item) => item.title === 'Leer sobre colecciones')?.completed,
    ).toBe(true)

    await wrapper.findAll('.inspector-switch button')[1]!.trigger('click')
    expect(wrapper.get('.json-view').text()).toContain('Leer sobre colecciones')
    expect(wrapper.get('.list-heading').text()).toContain('2 de 4')
  })

  it('rechaza títulos vacíos sin añadir filas', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await wrapper.get('#task-title').setValue('   ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Escribe un título')
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
  })

  it('reinicia con una nueva sesión y vuelve a publicar cambios', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await wrapper.get('#task-title').setValue('Cambio temporal')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('.playground-footer button').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
    expect(wrapper.get('.json-view').text()).not.toContain('Cambio temporal')
    await wrapper.get('#task-title').setValue('Nueva sesión')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('.json-view').text()).toContain('Nueva sesión')
  })

  it('mantiene independientes dos montajes de la lección', async () => {
    const first = openLesson()
    const second = openLesson()
    await flushPromises()
    await first.get('#task-title').setValue('Solo en la sesión A')
    await first.get('form').trigger('submit')
    await flushPromises()
    await nextTick()
    expect(first.findAll('.task-list li')).toHaveLength(4)
    expect(second.findAll('.task-list li')).toHaveLength(3)
    expect(second.get('.json-view').text()).not.toContain('Solo en la sesión A')
  })
})
