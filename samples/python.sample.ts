/* eslint-disable no-console */
import { Stairable } from './../lib'

// NOTE: change this to localhost if you're not running the tests in a devcontainer
const baseUrl = 'host.docker.internal:8002'

new Stairable().launch({
  url: `${baseUrl}/default`,
  requirements: { maxResTime: 1000, minRPS: 2000 }
}).then(res => {
  console.log('Default endpoint test (no cache):')
  console.log(res)
}).catch(console.error)

new Stairable().launch({
  url: `${baseUrl}/cached`,
  requirements: { maxResTime: 1000, minRPS: 2000 }
}).then(res => {
  console.log('Cached endpoint test:')
  console.log(res)
}).catch(console.error)
