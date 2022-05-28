import autocannon from 'autocannon';

interface Options {
  url: string,
  expectedAvgMsResponseTime: number,
  expectedMaxStdDevMsResponseTime: number,
  method?: autocannon.Request["method"],
  duration?: number,
  threads?: number,
  //   inputNumLimit: 10,
}

export async function isScalableEnough(opts: Options) {
  const {
    url,
    method,
    expectedAvgMsResponseTime,
    expectedMaxStdDevMsResponseTime,
    duration,
    threads
  } = opts

  const output: Record<string, any> = { url }

  const connectionsTests = [1, 10, 100, 1000, 10000]

  let connections = 1
  let level = 0
  let outcome

  do {
    const result = await autocannon({
      url,
      method: method ?? 'GET',
      duration: duration ?? 5,
      workers: threads ?? 1,
      connections: connections
    })

    outcome = (result.latency.average < expectedAvgMsResponseTime && result.latency.stddev < expectedMaxStdDevMsResponseTime) ? "success" : "failure"

    output[level] = {
      outcome,
      expectedAvgMsResponseTime,
      expectedMaxStdDevMsResponseTime,
      avgMs: result.latency.average,
      stddev: result.latency.stddev,
      non2xx: result.non2xx,
      rps: result.requests.sent
    }
    connections *= 10
    level++
  } while (outcome == "success");

  return output
}

isScalableEnough({
  url: 'example.com',
  method: "GET",
  expectedAvgMsResponseTime: 1,
  expectedMaxStdDevMsResponseTime: 1
}).then((res) => console.log(res));
