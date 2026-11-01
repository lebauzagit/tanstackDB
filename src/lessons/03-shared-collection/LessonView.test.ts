import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  flushPromises,
  mount,
  type DOMWrapper,
  type VueWrapper,
} from '@vue/test-utils'
import LessonView from './LessonView.vue'

const wrappers: VueWrapper[] = []
type TaskView = Pick<DOMWrapper<Element>, 'findAll'>

function openLesson() {
  const wrapper = mount(LessonView, {
    attachTo: document.body,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  wrappers.push(wrapper)
  return wrapper
}

function allView(wrapper: VueWrapper) {
  return wrapper.get('[aria-label="Vista A: todas las tareas"]')
}

function pendingView(wrapper: VueWrapper) {
  return wrapper.get('[aria-label="Vista B: tareas pendientes"]')
}

function findTask(view: TaskView, title: string) {
  const row = view
    .findAll('.task-list li')
    .find(
      (item) => item.get('.shared-task-heading label span').text() === title,
    )
  if (!row) throw new Error(`No aparece la tarea: ${title}`)
  return row
}

async function rename(view: TaskView, original: string, title: string) {
  const row = findTask(view, original)
  await row.get('button').trigger('click')
  await row.get('form input').setValue(title)
  await row.get('form').trigger('submit')
  await flushPromises()
}

function sourceRows(wrapper: VueWrapper) {
  return JSON.parse(
    wrapper.get('[aria-label="JSON de la colección compartida"]').text(),
  ) as Array<{ id: string; title: string; completed: boolean }>
}

afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await flushPromises()
})

describe('dos componentes sobre la misma colección RC1', () => {
  it.each([0, 1])(
    'tras retirar la pendiente %i enfoca otra fila y el encabezado si B queda vacía',
    async (index) => {
      const wrapper = openLesson()
      await flushPromises()
      const inputs = pendingView(wrapper).findAll<HTMLInputElement>('input')
      inputs[index]!.element.focus()
      await inputs[index]!.setValue(true)
      await flushPromises()
      expect(document.activeElement).toBe(inputs[1 - index]!.element)

      const last = pendingView(wrapper).get<HTMLInputElement>('input')
      last.element.focus()
      await last.setValue(true)
      await flushPromises()
      expect(document.activeElement).toBe(pendingView(wrapper).get('h3').element)
      expect(allView(wrapper).findAll('.task-list li')).toHaveLength(3)
    },
  )

  it('mantiene el foco al completar una tarea que permanece en A', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const input = allView(wrapper).get<HTMLInputElement>('input')
    input.element.focus()
    await input.setValue(false)
    await flushPromises()
    expect(document.activeElement).toBe(input.element)
    expect(input.element.disabled).toBe(false)
  })

  it.each(['A', 'B'])('devuelve el foco a Editar tras guardar desde %s', async (view) => {
    const wrapper = openLesson()
    await flushPromises()
    const list = view === 'A' ? allView(wrapper) : pendingView(wrapper)
    const row = findTask(list, 'Editar un título desde una vista')
    await row.get('button').trigger('click')
    expect(document.activeElement).toBe(row.get('form input').element)
    await row.get('form input').setValue('Título con foco')
    await row.get('form').trigger('submit')
    await flushPromises()
    const edit = findTask(list, 'Título con foco').get<HTMLButtonElement>('button')
    expect(edit.element.disabled).toBe(false)
    expect(document.activeElement).toBe(edit.element)
    expect(findTask(pendingView(wrapper), 'Título con foco').exists()).toBe(true)
  })

  it('propaga ediciones en ambos sentidos y conserva el ID de la entidad', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await rename(
      allView(wrapper),
      'Editar un título desde una vista',
      'Título desde A',
    )
    expect(findTask(pendingView(wrapper), 'Título desde A').exists()).toBe(true)
    expect(
      sourceRows(wrapper).find((task) => task.id === 'task-2')?.title,
    ).toBe('Título desde A')

    await rename(pendingView(wrapper), 'Título desde A', '  Título desde B  ')
    expect(findTask(allView(wrapper), 'Título desde B').exists()).toBe(true)
    expect(findTask(pendingView(wrapper), 'Título desde B').exists()).toBe(true)
    expect(sourceRows(wrapper)).toHaveLength(3)
    expect(
      sourceRows(wrapper).find((task) => task.id === 'task-2')?.title,
    ).toBe('Título desde B')
  })

  it('completa y reabre desde ambas vistas sin peticiones de datos', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Esta lección no usa red.'))
    const wrapper = openLesson()
    await flushPromises()
    const title = 'Editar un título desde una vista'
    await findTask(pendingView(wrapper), title)
      .get('input[type="checkbox"]')
      .setValue(true)
    await flushPromises()
    expect(pendingView(wrapper).findAll('.task-list li')).toHaveLength(1)
    expect(
      (
        findTask(allView(wrapper), title).get('input')
          .element as HTMLInputElement
      ).checked,
    ).toBe(true)

    await findTask(allView(wrapper), title).get('input').setValue(false)
    await flushPromises()
    expect(pendingView(wrapper).findAll('.task-list li')).toHaveLength(2)
    await findTask(allView(wrapper), title).get('input').setValue(true)
    await flushPromises()
    expect(pendingView(wrapper).findAll('.task-list li')).toHaveLength(1)
    expect(sourceRows(wrapper)).toHaveLength(3)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('valida los títulos y permite cancelar un borrador sin modificar la colección', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const original = sourceRows(wrapper)
    const row = findTask(
      pendingView(wrapper),
      'Editar un título desde una vista',
    )
    await row.get('button').trigger('click')
    await row.get('form input').setValue('   ')
    await row.get('form').trigger('submit')
    await flushPromises()
    expect(row.get('[role="alert"]').text()).toContain('Escribe un título')
    expect(sourceRows(wrapper)).toEqual(original)
    await row.get('form input').setValue('Un borrador que no se guarda')
    await row.get('button[type="button"]').trigger('click')
    expect(row.find('form').exists()).toBe(false)
    expect(sourceRows(wrapper)).toEqual(original)
    expect(allView(wrapper).text()).not.toContain(
      'Un borrador que no se guarda',
    )
  })

  it('mantiene todas las tareas al vaciar la consulta de pendientes', async () => {
    const wrapper = openLesson()
    await flushPromises()
    for (let index = 0; index < 2; index++) {
      await pendingView(wrapper).get('.task-list input').setValue(true)
      await flushPromises()
    }
    expect(pendingView(wrapper).findAll('.task-list li')).toHaveLength(0)
    expect(pendingView(wrapper).get('.filter-empty').text()).toContain(
      'vista A',
    )
    expect(allView(wrapper).findAll('.task-list li')).toHaveLength(3)
    expect(sourceRows(wrapper).every((task) => task.completed)).toBe(true)
  })

  it('desmonta una vista sin destruir la fuente y la remonta con los últimos datos', async () => {
    const wrapper = openLesson()
    await flushPromises()
    await wrapper.get('.shared-controls button').trigger('click')
    await flushPromises()
    expect(
      wrapper.find('[aria-label="Vista B: tareas pendientes"]').exists(),
    ).toBe(false)
    await rename(
      allView(wrapper),
      'Editar un título desde una vista',
      'Editada mientras B no estaba',
    )
    await wrapper.get('.shared-controls button').trigger('click')
    await flushPromises()
    expect(
      findTask(pendingView(wrapper), 'Editada mientras B no estaba').exists(),
    ).toBe(true)
    expect(sourceRows(wrapper)).toHaveLength(3)
  })

  it('reinicia las dos vistas repetidamente sin errores de limpieza', async () => {
    const cleanupErrors = vi.spyOn(console, 'error')
    const wrapper = openLesson()
    await flushPromises()
    for (let iteration = 0; iteration < 3; iteration++) {
      await rename(
        pendingView(wrapper),
        'Editar un título desde una vista',
        'Cambio temporal',
      )
      await wrapper.get('.shared-controls button').trigger('click')
      await wrapper.get('.playground-footer button').trigger('click')
      await flushPromises()
      expect(allView(wrapper).findAll('.task-list li')).toHaveLength(3)
      expect(pendingView(wrapper).findAll('.task-list li')).toHaveLength(2)
      expect(
        sourceRows(wrapper).some((task) => task.title === 'Cambio temporal'),
      ).toBe(false)
    }
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    await flushPromises()
    expect(cleanupErrors).not.toHaveBeenCalled()
  })

  it('comparte dentro de una sesión y mantiene separadas dos sesiones', async () => {
    const first = openLesson()
    const second = openLesson()
    await flushPromises()
    const original = sourceRows(second)
    await rename(
      allView(first),
      'Editar un título desde una vista',
      'Solo en la sesión A',
    )
    expect(pendingView(first).text()).toContain('Solo en la sesión A')
    expect(sourceRows(second)).toEqual(original)
    expect(pendingView(second).text()).not.toContain('Solo en la sesión A')
  })

  it('ejecuta la comparación Vue con datos independientes y la reinicia junto a la práctica', async () => {
    const wrapper = openLesson()
    await flushPromises()
    const original = sourceRows(wrapper)
    const comparison = wrapper.get('.vue-comparison')
    await comparison.get('summary').trigger('click')
    expect(comparison.get('.vue-counts').text()).toContain('2 pendientes')
    await comparison.get('button').trigger('click')
    expect(comparison.get('.vue-counts').text()).toContain('1 pendiente')
    expect(sourceRows(wrapper)).toEqual(original)
    await rename(
      allView(wrapper),
      'Editar un título desde una vista',
      'Solo en DB',
    )
    expect(comparison.text()).not.toContain('Solo en DB')
    await wrapper.get('.playground-footer button').trigger('click')
    await flushPromises()
    expect(wrapper.get('.vue-counts').text()).toContain('2 pendientes')
    expect(sourceRows(wrapper)).toEqual(original)
  })
})
