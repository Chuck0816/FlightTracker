# Database setup

These original MySQL exports define the application's base schema and aviation reference data. They are preserved byte-for-byte, including their UTF-16 encoding. The application also requires the SQL objects in `doc/sql/`.

## Included and excluded data

- `00_schema_only.sql`: base tables, constraints, and indexes, including empty account tables.
- `01` through `08`: states, airlines, cities, markets, airports, airport-market links, routes, and delay-cause definitions.
- `40_data_airfaremarkets.sql`: historical market fare data.
- `10` through `14` and `20` through `24`: bulk flight records and per-flight delay causes; kept outside Git.
- `30_data_users.sql` and `31_data_savedroutes.sql`: excluded from the public repository to keep account data private.

Airport and route lookup can use the compact reference data. Historical flight analytics require the omitted flight records and delay causes; without them, the route-details procedure may return `NO_DATA`. Obtain or prepare those datasets separately using the sources and schema documented in `doc/`.

## Import into a fresh local database

Use MySQL 8 and a new, empty local database. The original schema dump drops existing tables, and the cache setup scripts also recreate cache tables. Do not run them against a database containing data you need to retain.

The following examples run from the repository root. `-p` prompts for the password instead of placing it in command history. Replace `your_database_user` with your local account.

```bash
mysql -u your_database_user -p -e 'CREATE DATABASE flight_optimizer CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;'

iconv -f UTF-16 -t UTF-8 'Database Chunked 3/00_schema_only.sql' \
  | mysql -u your_database_user -p flight_optimizer

for file in 'Database Chunked 3'/0[1-8]_data_*.sql; do
  iconv -f UTF-16 -t UTF-8 "$file" \
    | mysql -u your_database_user -p flight_optimizer
done

iconv -f UTF-16 -t UTF-8 'Database Chunked 3/40_data_airfaremarkets.sql' \
  | mysql -u your_database_user -p flight_optimizer
```

If you have the original bulk exports, import flight-record chunks in numeric order, followed by flight-delay-cause chunks, using the same UTF-16 conversion. Keep those files local. Leave the account tables empty and create a new account through the application's signup flow.

Then install the analytics objects in order:

```bash
mysql -u your_database_user -p flight_optimizer < doc/sql/route_details_cache.sql
mysql -u your_database_user -p flight_optimizer < doc/sql/route_details_cache_indexes.sql
mysql -u your_database_user -p flight_optimizer < doc/sql/get_or_create_route_details.sql
mysql -u your_database_user -p flight_optimizer < doc/sql/savedroutes_cache_cleanup.sql
```

Use a database account with the required schema, procedure, and trigger permissions for setup. Runtime configuration is described in `flighttracker-app/.env.example`; keep the real values in your local `.env`.

The schema uses lowercase table names. Preserve the exported naming when importing into a case-sensitive MySQL installation. Earlier design documents may show different capitalization.
