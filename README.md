# stairable

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![Node.js CI](https://github.com/claudio-di-sciacca/stairable/workflows/Node.js%20CI/badge.svg)



A simple tool, based on [autocannon](https://github.com/mcollina/autocannon), which tests the target scalability of endpoints based on the variability of:
* requests per second
* simultaneous connections
* variability of input size/quantity

Test your endpoint with an increasing load, based on these variables, it's going to give you an idea of how close your endpoint to your wanted "scalability".

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

First setup the function call in the `index.ts` file to target your wanted endpoint:
```javascript
new Test(
  'localhost:3000',
  {
    maxResTime: 100, minRPS: 100000
  }
).launch().then(console.log)
```

Second run `npm start` and wait for the results to be logged in the console.

Note: you can setup a fake multithread test server running `npm run launch-fake-server` which will run on `localhost:3000`.
