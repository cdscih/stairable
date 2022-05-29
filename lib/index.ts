import { cpus } from 'node:os';
import autocannon from 'autocannon';

interface Options {
  url: string,
  maxResTime: number,
  minRPS: number
  minConnections?: number,
  method?: autocannon.Request["method"],
  duration?: number,
  threads?: number,
  verbose?: boolean,
  //   inputNumLimit: 10,
}

export async function isScalableEnough(opts: Options): Promise<any> {

  const {
    url,
    method,
    maxResTime,
    minRPS,
    minConnections,
    duration,
    threads,
    verbose
  } = opts

  const output: Record<string, any> = { url, tests: [], outcome: {} }

  let connections = 1
  let success = false
  do {
    const result = await autocannon({
      url,
      method: method ?? 'GET',
      duration: duration ?? 10,
      workers: threads ?? (cpus().length - 1),
      connections: connections
    })

    success = (result.latency.average < maxResTime) ? true : false

    const outcome = {
      connections,
      rps: result.requests.sent,
      avgMs: result.latency.average,
      stddev: result.latency.stddev,
      non2xx: result.non2xx,
    }

    output.tests.push({
      success,
      ...outcome
    })
    if (success) {
      output.outcome = {
        targets: {
          maxResTime,
          minRPS,
          minConnections,
        },
        ...outcome
      }
      connections *= 10
    }
  } while (success);

  if (!verbose) delete output.tests

  output.outcome["success"] = output.outcome.avgMs < maxResTime && output.outcome.rps > minRPS && output.outcome.connections <= (minConnections ?? output.outcome.connections)

  return output
}

isScalableEnough({
  url: 'localhost:3000',
  maxResTime: 100,
  minRPS: 100000
}).then(console.log);
