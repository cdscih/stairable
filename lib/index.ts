import { cpus } from 'node:os'
import autocannon from 'autocannon'

interface ConnectionsTest {
  success?: boolean
  connections: number
  rps: number
  avgMs: number
  stddev: number
  non2xx: number
}

interface Requirements {
  maxResTime: number
  minRPS: number
  minConnections?: number
}

interface Result {
  url: string
  requirements?: Requirements
  meetsRequirements: boolean
  best: ConnectionsTest
  tests?: ConnectionsTest[]
}

export class Stairable {
  // eslint-disable-next-line no-useless-constructor
  constructor (
    readonly url: string,
    readonly requirements: Requirements,
    readonly method?: autocannon.Request['method'],
    readonly duration?: number,
    readonly workers?: number,
    readonly verbose?: boolean
    // readonly inputNumLimit?: number,
  ) { }

  meetsRequirements = (best: Result['best']): boolean => {
    const { avgMs, rps, connections } = best
    const { maxResTime, minRPS, minConnections } = this.requirements

    const respectedAvgMsLimit = avgMs < maxResTime
    const respectedRPSLimit = rps > minRPS
    const respectedConnectionsLimit = connections <= (minConnections ?? connections)

    return respectedAvgMsLimit && respectedRPSLimit && respectedConnectionsLimit
  }

  fire = async (connections: number): Promise<autocannon.Result> => await autocannon({
    url: this.url,
    method: this.method ?? 'GET',
    duration: this.duration ?? 10,
    workers: this.workers ?? (cpus().length - 1),
    connections
  })

  async launch (): Promise<Result> {
    const tests: ConnectionsTest[] = []

    let best: ConnectionsTest = {} as never
    let connections = 1
    let success

    do {
      const { latency, requests, non2xx } = await this.fire(connections)

      const testResults = {
        connections,
        rps: requests.sent,
        avgMs: latency.average,
        stddev: latency.stddev,
        non2xx
      }

      success = (latency.average < this.requirements.maxResTime)

      tests.push({
        success,
        ...testResults
      })
      if (success) {
        best = testResults
        connections *= 10
      }
    } while (success)

    const res: Result = {
      url: this.url,
      meetsRequirements: this.meetsRequirements(best),
      best
    }

    if (this.verbose) {
      res.requirements = this.requirements
      res.tests = tests
    }

    return res
  }
}
