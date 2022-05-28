import { isScalableEnough } from "../lib";
import express from 'express';

jest.setTimeout(20000)

describe('Fire', () => {

  let server: any

  beforeAll(() => {
    const app = express()
    const port = 3000

    app.get('/', (req: any, res: any) => {
      res.send('test')
    })

    server = app.listen(port)
  })

  afterAll(() => {
    server.close()
  })

  test('basic use', async () => {
    const res = await isScalableEnough({
      url: 'localhost:3000',
      method: "GET",
      expectedAvgMsResponseTime: 1,
      expectedMaxStdDevMsResponseTime: 1
    })
    expect(res[1]).toBeDefined();
  });
});
