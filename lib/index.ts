import autocannon from 'autocannon';

interface Options {
  urls: string[],
  rps: number,
//   inputNumLimit: 10,
//   responseTimeLimitMs: 30,
}

export async function fire({ urls, rps }: Options) {
  return urls.map((url) => autocannon({
    url,
    amount: rps,
    timeout: 1,
  }, console.log));
}

fire({
  urls: ['example.com'],
  rps: 1000,
});
