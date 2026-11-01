import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../learning/HomeView.vue'
import LessonView from '../lessons/01-first-collection/LessonView.vue'
import FilteredLessonView from '../lessons/02-filtered-tasks/LessonView.vue'
import SharedLessonView from '../lessons/03-shared-collection/LessonView.vue'
import StorageLessonView from '../lessons/04-storage/LessonView.vue'
import NotFoundView from '../learning/NotFoundView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Tu recorrido' } },
    {
      path: '/lessons/01-first-collection',
      component: LessonView,
      meta: { title: 'Tres tareas, una colección' },
    },
    {
      path: '/lessons/02-filtered-tasks',
      component: FilteredLessonView,
      meta: { title: 'Pregúntale a los datos' },
    },
    {
      path: '/lessons/03-shared-collection',
      component: SharedLessonView,
      meta: { title: 'Dos ventanas, los mismos datos' },
    },
    {
      path: '/lessons/04-storage',
      component: StorageLessonView,
      meta: { title: 'CRUD y almacenamiento' },
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
      meta: { title: 'Página no encontrada' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((route) => {
  document.title = `${String(route.meta.title)} · Taller DB`
})
