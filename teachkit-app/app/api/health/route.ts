import { NextResponse } from "next/server"

/**
 * Route Handler: a plain HTTP endpoint that runs on the server.
 * Used here as a simple liveness check. It returns no secrets and no configuration.
 * Streaming model responses will use this same mechanism in a later module.
 */
export function GET() {
  return NextResponse.json({ ok: true })
}
