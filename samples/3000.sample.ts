import { Stairable } from "./../lib"

new Stairable(
  'localhost:3000',
  {
    maxResTime: 100, minRPS: 100000
  }
).launch().then(console.log)
