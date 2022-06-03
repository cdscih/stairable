# stairable

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![Node.js CI](https://github.com/claudio-di-sciacca/stairable/workflows/Node.js%20CI/badge.svg)

A simple tool, based on [autocannon](https://github.com/mcollina/autocannon), which tests whether or not the target scalability of an endpoint is reached based on the variability of:
* requests per second
* simultaneous connections
* variability of input size/quantity

Example output:
```javascript
{
  url: 'localhost:3000',
  requirements: { maxResTime: 100, minRPS: 100000 },
  meetsRequirements: true,
  best: {
    connections: 1000,
    rps: 342932,
    avgMs: 29.4,
    stddev: 23.64,
    non2xx: 0
  }
}
```

## Definition of a Scalable Endpoint

A Scalable Endpoint is an endpoint that, given a certain target of parameters, is able to handle all the expected traffic, respecting those parameters, in more than 99% of cases.

## Instructions

Import the `Stairable` class and set it up like in the following snippet.

```typescript
import { Stairable } from "stairable";

new Stairable(
  'localhost:3000',
  {
    maxResTime: 100, minRPS: 100000
  }
).launch().then(console.log)
```

Then run your server followed by the node file where you setup the class.

### Quick test

For a quick test just run the script `start-sample-server`, which will run a sample node server on localhost:3000, and then the `start-sample-test` one to launch a *Stairable* test on that endpoint.
