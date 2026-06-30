export * from "./client.js"
export * from "./server.js"

import { createClawcClient } from "./client.js"
import { createClawcServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createClawc(options?: ServerOptions) {
  const server = await createClawcServer({
    ...options,
  })

  const client = createClawcClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
