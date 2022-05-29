# stairable

A simple tool, based on [autocannon](https://github.com/mcollina/autocannon), which tests the target scalability of endpoints based on the variability of:
* requests per second
* simultaneous connections
* variability of input size/quantity

Test your endpoint with an increasing load, based on these variables, it's going to give you an idea of how close your endpoint to your wanted "scalability".

Example output:
```json
{
  "url": "localhost:3000",
  "outcome": {
    "targets": { "maxResTime": 100, "minRPS": 100000, "minConnections": null },
    "connections": 1000,
    "rps": 309903,
    "avgMs": 32.56,
    "stddev": 23.23,
    "non2xx": 0,
    "success": true
  }
}
```

## Definition of a Scalable Endpoint

A Scalable Endpoint is an endpoint that, given a certain target of parameters, is able to handle all the expected traffic in more than 99% of cases.

## (WIP) Instructions

First setup the function call in the `index.ts` file to target your wanted endpoint:
```javascript
isScalableEnough({
  url: 'localhost:3000',
  maxResTime: 100,
  minRPS: 100000
}).then(console.log);
```

Second run `npm start` and wait for the results to be logged in the console.
