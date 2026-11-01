<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { lessons } from './lessons'

const availableLessonCount = lessons.filter((lesson) => lesson.path).length
</script>

<template>
  <div class="page home-page">
    <p class="eyebrow">TU RECORRIDO / DE LA PRIMERA FILA AL TABLERO</p>
    <h1>
      Entiende los datos.<br /><span class="muted-heading"
        >Construye con confianza.</span
      >
    </h1>
    <p class="page-intro">
      Un pequeño taller de Vue para descubrir TanStack DB. Empieza con tres
      tareas; cambia una y observa cómo responde todo lo demás.
    </p>
    <div class="home-start">
      <RouterLink class="button primary" to="/lessons/01-first-collection"
        >Abrir la primera lección <span aria-hidden="true">→</span></RouterLink
      >
      <span class="quiet">Sin cuentas ni configuración externa.</span>
    </div>
    <div class="principle-strip">
      <div>
        <span class="step-token">01</span><strong>Una idea</strong>
        <p>Explicaciones pequeñas y concretas.</p>
      </div>
      <div>
        <span class="step-token">02</span><strong>Un experimento</strong>
        <p>Datos que puedes cambiar tú.</p>
      </div>
      <div>
        <span class="step-token">03</span><strong>Una explicación</strong>
        <p>El código y el resultado, juntos.</p>
      </div>
    </div>
    <div class="section-heading">
      <h2>Tu cuaderno de prácticas</h2>
      <span class="quiet"
        >{{ availableLessonCount }} de {{ lessons.length }} lecciones
        disponibles</span
      >
    </div>
    <p class="quiet">
      Conocer Vue y TypeScript básico es suficiente para empezar. El resto se
      introduce paso a paso.
    </p>
    <ol class="roadmap">
      <li
        v-for="lesson in lessons"
        :key="lesson.number"
        :class="{ ready: !!lesson.path }"
      >
        <span class="roadmap-number">{{ lesson.number }}</span>
        <div>
          <h3>{{ lesson.title }}</h3>
          <span class="quiet"
            >{{ lesson.level }} ·
            {{
              lesson.path ? 'Lista para experimentar' : 'En preparación'
            }}</span
          >
        </div>
        <RouterLink v-if="lesson.path" class="text-link" :to="lesson.path"
          >Empezar →</RouterLink
        >
      </li>
    </ol>
    <div class="note">
      <strong>¿Y el backend?</strong>
      <p>
        TanStack DB organiza datos reactivos en el cliente. En este primer paso
        todo vive en memoria; la conexión con una API llegará en la lección 05.
      </p>
    </div>
  </div>
</template>
