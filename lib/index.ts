import { cpus } from 'node:os'
import autocannon from 'autocannon'

import type {
  ConnectionsTest,
  Result,
  FireResult,
  EnvOptions,
  TestOptions
} from './types'

export class Stairable {
  constructor (
    readonly opts?: EnvOptions
  ) { }

  private meetsRequirements = (testOpts: TestOptions, best: Result['best']): boolean => {
    const { avgMs, rps, connections } = best
    const { maxResTime, minRPS, minConnections } = testOpts.requirements

    const respectedAvgMsLimit = avgMs < maxResTime
    const respectedRPSLimit = rps > minRPS
    const respectedConnectionsLimit = connections <= (minConnections ?? connections)

    return respectedAvgMsLimit && respectedRPSLimit && respectedConnectionsLimit
  }

  private fire = async (testOpts: TestOptions, connections: number, bodyNs?: number): Promise<FireResult> => (
    ({ latency, requests, non2xx }) => ({ latency, requests, non2xx }))(await autocannon({
    url: testOpts.url,
    method: testOpts.method ?? 'GET',
    headers: testOpts.headers ?? {},
    body: testOpts.body?.create ? testOpts.body?.create(bodyNs ?? 1) : undefined,
    duration: this.opts?.connectionTestsDuration ?? 5,
    workers: this.opts?.workers ?? (cpus().length - 1),
    connections
  }))

  private fireIncreasingBodyLength = async (testOpts: TestOptions, connections: number): Promise<FireResult> => {
    const maxNs = testOpts.body?.maxNs ?? 1
    let bodyNs = (testOpts.body?.maxNs ?? 1000) / 1000
    let success
    let res = {}
    do {
      const { latency, requests, non2xx } = await this.fire(testOpts, connections, bodyNs)
      success = latency.average < testOpts.requirements.maxResTime
      if (success || !Object.keys(res).length) {
        res = {
          latency, requests, non2xx, maxBodyLenght: bodyNs
        }
      }
      bodyNs *= this.opts?.bodyNMultiplier ?? 10
    } while (bodyNs <= maxNs && success)
    return res as FireResult
  }

  async launch (testOpts: TestOptions): Promise<Result> {
    const tests: ConnectionsTest[] = []

    let best: ConnectionsTest = {} as never
    let connections = 1
    let success: boolean

    do {
      const { latency, requests, non2xx, maxBodyLenght } =
        testOpts.body
          ? await this.fireIncreasingBodyLength(testOpts, connections)
          : await this.fire(testOpts, connections)

      const testResults = {
        connections,
        rps: requests.sent,
        avgMs: latency.average,
        stddev: latency.stddev,
        non2xx,
        ...(testOpts.body ? { maxBodyLenght } : {})
      }

      success = latency.average < testOpts.requirements.maxResTime

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
      url: testOpts.url,
      meetsRequirements: this.meetsRequirements(testOpts, best),
      best
    }

    if (this.opts?.verbose) {
      res.requirements = testOpts.requirements
      res.tests = tests
    }

    return res
  }
}
