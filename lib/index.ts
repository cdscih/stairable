import { cpus } from 'node:os';
import autocannon from 'autocannon';

interface ConnectionsTest {
  success?: boolean,
  connections: number,
  rps: number,
  avgMs: number,
  stddev: number,
  non2xx: number
}

interface Result {
  url: string,
  requirements: {
    maxResTime: number, minRPS: number, minConnections?: number
  }
  meetsRequirements: boolean,
  best: ConnectionsTest,
  tests?: ConnectionsTest[]
}

export class Test {
  constructor(
    readonly url: string,
    readonly requirements: Result['requirements'],
    readonly method?: autocannon.Request["method"],
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


  async launch(): Promise<Result> {
    const tests: ConnectionsTest[] = []

    let best: ConnectionsTest = {} as any
    let connections = 1
    let success

    do {
      const { latency, requests, non2xx } = await this.fire(connections)

      const testResults = {
        connections,
        rps: requests.sent,
        avgMs: latency.average,
        stddev: latency.stddev,
        non2xx: non2xx,
      }

      success = (latency.average < this.requirements.maxResTime) ? true : false

      tests.push({
        success,
        ...testResults
      })
      if (success) {
        best = testResults
        connections *= 10
      }
    } while (success);

    return {
      url: this.url,
      requirements: this.requirements,
      meetsRequirements: this.meetsRequirements(best),
      best,
      ...(this.verbose ? { tests } : {})
    }
  }

}

new Test(
  'localhost:3000',
  {
    maxResTime: 100, minRPS: 100000
  }
).launch().then(console.log)
