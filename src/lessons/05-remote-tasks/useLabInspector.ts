import { computed, onUnmounted, ref } from 'vue'
import type { TaskLab } from '../../mocks/taskLab'

export function useLabInspector(lab: TaskLab) {
  const revision = ref(0)
  const unsubscribe = lab.subscribe(() => {
    revision.value++
  })
  onUnmounted(unsubscribe)
  // Son lecturas del mock autoritativo. No se derivan de las filas de DB.
  const serverTasks = computed(() => {
    void revision.value
    return lab.tasks
  })
  const requests = computed(() => {
    void revision.value
    return lab.requests
  })
  const events = computed(() => {
    void revision.value
    return lab.events
  })
  return { serverTasks, requests, events }
}
