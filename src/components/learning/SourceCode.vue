<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ source: string; filename: string }>()
const copyState = ref('Copiar código')

async function copy(source: string) {
  try {
    await navigator.clipboard.writeText(source)
    copyState.value = 'Copiado'
  } catch {
    copyState.value = 'Selecciona y copia el código'
  }
}
</script>

<template>
  <div class="source-code">
    <div class="source-toolbar">
      <span>{{ filename }}</span
      ><button class="copy-button" type="button" @click="copy(source)">
        {{ copyState }}
      </button>
    </div>
    <pre
      tabindex="0"
      :aria-label="`Código de ${filename}`"
    ><code>{{ source }}</code></pre>
    <p class="code-caption" role="status">
      Archivo real de la demo · importado con ?raw
    </p>
  </div>
</template>
