#!/usr/bin/env bash
RETRIES=5

until psql -h postgres -U postgres -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done

echo Downloading dvdrental.zip db..
curl https://www.postgresqltutorial.com/wp-content/uploads/2019/05/dvdrental.zip --output dvdrental.zip
echo unzipping dvdrental.zip..
unzip dvdrental.zip

psql -h postgres -U postgres <<OMG
CREATE DATABASE dvdrental;
OMG

echo restoring dvdrental db..
pg_restore -h postgres -U postgres -d dvdrental dvdrental.tar

echo deleting files..
rm dvdrental.zip dvdrental.tar

echo DONE

uvicorn server:app --host 0.0.0.0