import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import { router } from './router'
import { mockServer } from '../mocks/node'

vi.mock('../mocks/browser', () => ({ ensureMockApi: async () => {} }))
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }))
afterAll(() => mockServer.close())

it('recorre las cinco lecciones disponibles y vuelve a la primera', async () => {
  // jsdom no implementa el desplazamiento de la ventana.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  await router.push('/')
  const wrapper = mount(App, { global: { plugins: [router] } })
  try {
    await router.isReady()
    expect(wrapper.get('.section-heading').text()).toContain('5 de 10')
    await wrapper
      .get('.roadmap a[href="/lessons/02-filtered-tasks"]')
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/lessons/02-filtered-tasks')
    expect(wrapper.get('h1').text()).toContain('Pregúntale')
    expect(wrapper.get('.lesson-link.router-link-active').text()).toContain(
      '02',
    )
    await wrapper
      .get('.lesson-end a[href="/lessons/03-shared-collection"]')
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/lessons/03-shared-collection')
    expect(wrapper.get('h1').text()).toContain('Dos ventanas')
    expect(wrapper.get('.lesson-link.router-link-active').text()).toContain(
      '03',
    )
    await wrapper
      .get('.lesson-end a[href="/lessons/04-storage"]')
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/lessons/04-storage')
    expect(wrapper.get('h1').text()).toContain('¿Qué queda')
    expect(wrapper.findAll('.storage-panel')).toHaveLength(2)
    await wrapper
      .get('.lesson-end a[href="/lessons/05-remote-tasks"]')
      .trigger('click')
    await vi.waitFor(() =>
      expect(wrapper.get('h1').text()).toContain('La API tarda'),
    )
    expect(router.currentRoute.value.path).toBe('/lessons/05-remote-tasks')
    await wrapper
      .get('.lesson-end a[href="/lessons/04-storage"]')
      .trigger('click')
    await flushPromises()
    await wrapper
      .get('.lesson-end a[href="/lessons/03-shared-collection"]')
      .trigger('click')
    await flushPromises()
    await wrapper
      .get('.lesson-end a[href="/lessons/02-filtered-tasks"]')
      .trigger('click')
    await flushPromises()
    await wrapper
      .get('.lesson-end a[href="/lessons/01-first-collection"]')
      .trigger('click')
    await flushPromises()
    expect(wrapper.get('h1').text()).toContain('Tres tareas')
    expect(wrapper.findAll('.task-list li')).toHaveLength(3)
  } finally {
    wrapper.unmount()
    await flushPromises()
  }
})
