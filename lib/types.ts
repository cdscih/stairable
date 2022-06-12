import type autocannon from 'autocannon'

export interface FireResult {
  latency: autocannon.Result['latency']
  requests: autocannon.Result['requests']
  non2xx: autocannon.Result['non2xx']
  maxBodyLenght?: number
}

export interface ConnectionsTest {
  success?: boolean
  connections: number
  rps: number
  avgMs: number
  stddev: number
  non2xx: number
}

export interface Requirements {
  maxResTime: number
  minRPS: number
  minConnections?: number
}

export type CreateBody = (n: number) => string | Buffer | undefined

export interface EnvOptions {
  inputLimit?: number
  connectionsMultipler?: number,
  bodyNMultiplier?: number,
  connectionTestsDuration?: number
  workers?: number
  verbose?: boolean
}

export interface TestOptions {
  url: string
  requirements: Requirements
  headers?: Record<string, string | string[]>
  method?: autocannon.Request['method']
  body?: {
    create: CreateBody,
    maxNs: number
  }
}

export interface Result {
  url: string
  requirements?: Requirements
  meetsRequirements: boolean
  best: ConnectionsTest
  tests?: ConnectionsTest[]
}
