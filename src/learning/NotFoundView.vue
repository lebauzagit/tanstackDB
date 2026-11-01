<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="page">
    <p class="eyebrow">404 / FUERA DEL CUADERNO</p>
    <h1>Esta página no está aquí.</h1>
    <p class="page-intro">
      Vuelve al recorrido para consultar las lecciones disponibles.
    </p>
    <RouterLink class="button primary" to="/">Volver al recorrido</RouterLink>
  </div>
</template>
