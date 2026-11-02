import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)
let started: Promise<unknown> | null = null

// El tutorial también usa el mock en su build estático; la UI siempre lo identifica.
export async function ensureMockApi() {
  if (!started) {
    started = worker
      .start({
        serviceWorker: {
          url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
        onUnhandledRequest: 'bypass',
        quiet: true,
      })
      .catch((error: unknown) => {
        started = null
        throw error
      })
  }
  await started
}
