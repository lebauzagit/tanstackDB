<script setup lang="ts">
import { useVueTaskExample } from './useVueTaskExample'

const { tasks, pendingTasks, completeFirstPending } = useVueTaskExample()
</script>

<template>
  <details class="vue-comparison">
    <summary>Comparar con un array de Vue y un computed</summary>
    <p>
      Para tres tareas locales, Vue también puede resolverlo. Este ejemplo tiene
      sus propios datos: sus botones no cambian la colección DB de arriba.
    </p>
    <p class="vue-counts" role="status">
      Vue: {{ tasks.length }} tareas · {{ pendingTasks.length }}
      {{ pendingTasks.length === 1 ? 'pendiente' : 'pendientes' }}
    </p>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }} · {{ task.completed ? 'Completada' : 'Pendiente' }}
      </li>
    </ul>
    <button
      class="button primary"
      type="button"
      :disabled="pendingTasks.length === 0"
      @click="completeFirstPending"
    >
      Completar una pendiente en Vue
    </button>
    <p>
      Un array reactivo compartido y un computed son suficientes para este caso
      pequeño. DB añade un modelo de colecciones y consultas relacionales. En
      ambos casos, compartir la misma fuente es una decisión de tu arquitectura.
    </p>
    <p class="field-hint">
      En «El código compartido», abre la pestaña «Alternativa Vue» para ver el
      composable real de esta comparación.
    </p>
  </details>
</template>
