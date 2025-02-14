#!/bin/bash
set -e

# Run the standard entrypoint setup from Postgres
export PGPASSWORD="$POSTGRES_PASSWORD"

psql -v ON_ERROR_STOP=1 --username "$POSTGRESQL_USERNAME" <<-EOSQL
    CREATE DATABASE boilerplate_dev;
    CREATE DATABASE boilerplate_test;
EOSQL