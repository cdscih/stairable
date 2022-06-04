import { Stairable } from './../lib'

const createBody = (n: number): string => {
  const items = []
  for (let i = 0; i < n; i++) {
    items.push(i)
  }
  return JSON.stringify({ items })
}

new Stairable(
  {
    url: 'localhost:3000',
    requirements: { maxResTime: 100, minRPS: 50000 },
    body: { create: createBody, maxNs: 1000 },
    connectionTestsDuration: 5
  }
).launch().then(console.log).catch(console.error)
