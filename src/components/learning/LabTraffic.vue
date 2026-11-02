<script setup lang="ts">
import type { LabEvent, LabRequest } from '../../mocks/taskLab'
const { showStatusCodes = false } = defineProps<{
  requests: LabRequest[]
  events: LabEvent[]
  showStatusCodes?: boolean
}>()
const statusLabels = {
  pending: 'En curso',
  success: 'Respondida',
  rejected: 'Rechazada',
  aborted: 'Cancelada',
}
</script>

<template>
  <section class="request-inspector" aria-label="Peticiones de esta sesión">
    <h3>Peticiones observadas</h3>
    <p class="quiet">
      Instrumentación del laboratorio; también puedes ver las peticiones en
      Network.
    </p>
    <div class="request-table-scroll">
      <table>
        <caption>
          HTTP recibido por la API simulada de esta sesión
        </caption>
        <thead>
          <tr>
            <th scope="col">N.º</th>
            <th scope="col">Método</th>
            <th scope="col">Latencia</th>
            <th v-if="showStatusCodes" scope="col">HTTP</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>
              <code>{{ request.method }}</code>
            </td>
            <td>{{ request.latency }} ms</td>
            <td v-if="showStatusCodes">{{ request.httpStatus ?? '—' }}</td>
            <td>{{ statusLabels[request.status] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section class="remote-timeline" aria-label="Cronología del laboratorio">
    <h3>El recorrido del cambio</h3>
    <p class="quiet">
      Registro propio del laboratorio; no es una API de Devtools de TanStack DB.
    </p>
    <ol>
      <li v-for="event in events" :key="event.id">
        <span class="timeline-time"
          >+{{ event.elapsed }} ms ·
          {{ event.side === 'api' ? 'API simulada' : 'Cliente' }}</span
        ><span>{{ event.message }}</span>
      </li>
    </ol>
  </section>
</template>
