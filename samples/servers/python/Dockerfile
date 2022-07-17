FROM python:3.9-slim

RUN apt-get update && \
  apt-get install -y postgresql-client curl unzip

RUN pip install fastapi uvicorn asyncpg redis

ARG PGPASSWORD

COPY . .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
