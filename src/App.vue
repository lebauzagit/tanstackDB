<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { lessons } from './learning/lessons'
</script>

<template>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="app-header">
    <RouterLink to="/" class="brand" aria-label="Taller DB, inicio">
      <span class="brand-mark" aria-hidden="true">[·]</span>
      <span>Taller<span class="brand-db">DB</span></span>
    </RouterLink>
    <span class="header-caption">Un laboratorio para entender tus datos.</span>
    <span class="version-label">TanStack DB <strong>1.0 RC1</strong></span>
  </header>

  <div class="app-layout">
    <aside class="sidebar" aria-label="Recorrido de aprendizaje">
      <RouterLink class="overview-link" to="/">↗ Tu recorrido</RouterLink>
      <div class="sidebar-heading">
        <span>CUADERNO DE PRÁCTICAS</span><span>10</span>
      </div>
      <nav aria-label="Lecciones">
        <ol class="lesson-nav">
          <li v-for="lesson in lessons" :key="lesson.number">
            <RouterLink
              v-if="lesson.path"
              :to="lesson.path"
              class="lesson-link"
            >
              <span class="lesson-number">{{ lesson.number }}</span>
              <span
                >{{ lesson.title
                }}<small>Disponible · {{ lesson.level }}</small></span
              >
            </RouterLink>
            <div v-else class="lesson-link upcoming">
              <span class="lesson-number">{{ lesson.number }}</span>
              <span
                >{{ lesson.title
                }}<small>En preparación · {{ lesson.level }}</small></span
              >
            </div>
          </li>
        </ol>
      </nav>
      <div class="sidebar-note">
        <span class="tiny-label">EL MÉTODO</span>
        <p>Predice. Experimenta.<br />Observa. Comprende.</p>
        <span class="sidebar-footnote">Una idea nueva en cada paso.</span>
      </div>
    </aside>

    <main id="main" tabindex="-1">
      <RouterView />
    </main>
  </div>
  <footer class="app-footer">
    <span>Hecho para aprender, una colección a la vez.</span
    ><span>Vue 3 + TypeScript + TanStack DB</span>
  </footer>
</template>
