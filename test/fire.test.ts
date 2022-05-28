import { fire } from "../lib";

describe('Fire', () => {
  test('basic use', async () => {
    expect(await fire({ urls: ['example.com'], rps: 10 })).toBeDefined();
  });
});
