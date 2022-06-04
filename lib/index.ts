import { cpus } from 'node:os'
import autocannon from 'autocannon'

import type {
  ConnectionsTest,
  Options,
  Result,
  FireResult
} from './types'

export class Stairable {
  constructor (
    readonly opts: Options
  ) { }

  private meetsRequirements = (best: Result['best']): boolean => {
    const { avgMs, rps, connections } = best
    const { maxResTime, minRPS, minConnections } = this.opts.requirements

    const respectedAvgMsLimit = avgMs < maxResTime
    const respectedRPSLimit = rps > minRPS
    const respectedConnectionsLimit = connections <= (minConnections ?? connections)

    return respectedAvgMsLimit && respectedRPSLimit && respectedConnectionsLimit
  }

  private fire = async (connections: number, bodyNs?: number): Promise<FireResult> => {
    const test = {
      url: this.opts.url,
      method: this.opts.method ?? 'GET',
      headers: this.opts.headers ?? {},
      body: this.opts.body?.create ? this.opts.body?.create(bodyNs ?? 1) : undefined,
      duration: this.opts?.connectionTestsDuration ?? 5,
      workers: this.opts?.workers ?? (cpus().length - 1),
      connections
    }
    return (({ latency, requests, non2xx }) => ({ latency, requests, non2xx }))(await autocannon(test))
  }

  private fireIncreasingBodyLength = async (connections: number): Promise<FireResult> => {
    const maxNs = this.opts.body?.maxNs ?? 1
    let bodyNs = (this.opts.body?.maxNs ?? 1000) / 1000
    let success = false
    let res = {}
    do {
      const { latency, requests, non2xx } = await this.fire(connections, bodyNs)
      if (!Object.keys(res).length) {
        res = {
          latency, requests, non2xx, maxBodyLenght: bodyNs
        }
      }
      success = latency.average < this.opts.requirements.maxResTime
      if (success) {
        res = {
          latency, requests, non2xx, maxBodyLenght: bodyNs
        }
      }
      bodyNs *= this.opts?.bodyNMultiplier ?? 10
    } while (bodyNs <= maxNs && success)
    return res as FireResult
  }

  async launch (): Promise<Result> {
    const tests: ConnectionsTest[] = []

    let best: ConnectionsTest = {} as never
    let connections = 1
    let success: boolean

    do {
      const { latency, requests, non2xx, maxBodyLenght } =
        this.opts.body
          ? await this.fireIncreasingBodyLength(connections)
          : await this.fire(connections)

      const testResults = {
        connections,
        rps: requests.sent,
        avgMs: latency.average,
        stddev: latency.stddev,
        non2xx,
        ...(this.opts.body ? { maxBodyLenght } : {})
      }

      success = latency.average < this.opts.requirements.maxResTime

      tests.push({
        success,
        ...testResults
      })
      if (success) {
        best = testResults
        connections *= this.opts?.connectionsMultipler ?? 10
      }
    } while (success)

    const res: Result = {
      url: this.opts.url,
      meetsRequirements: this.meetsRequirements(best),
      best
    }

    if (this.opts?.verbose) {
      res.requirements = this.opts.requirements
      res.tests = tests
    }

    return res
  }
}
