import random
import redis
import asyncpg
import pickle

from fastapi import FastAPI

redis_pool = redis.ConnectionPool(host='redis', port=6379, db=0)
r = redis.Redis(connection_pool=redis_pool)

pg_pool = None


async def read_from_postgres(n):
    global pg_pool
    if not pg_pool:
        pg_pool = await asyncpg.create_pool(**{
            "user": 'postgres',
            "password": 'example',
            "database": 'dvdrental',
            "host": 'postgres'
        })
    async with pg_pool.acquire() as conn:
        rows = await conn.fetch(
            f'''
          SELECT SUM(amount)
          from payment 
          where customer_id >= {n}
        '''
        )
        data = [dict(r) for r in rows]
        return data


app = FastAPI()


@app.get("/default")
async def read_root():
    n = random.randrange(1, 500)
    return await read_from_postgres(n)


@app.get("/cached")
async def read_root():
    n = random.randrange(1, 500)
    data = r.get(n)
    if data:
        return pickle.loads(data)
    data = await read_from_postgres(n)
    r.set(n, pickle.dumps(data))
    r.expire(n, 5)
    return data
