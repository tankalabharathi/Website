-- One-time RDS setup. Run as the RDS master user, e.g.:
--   psql "host=<rds-endpoint> dbname=postgres user=postgres sslmode=require" \
--     -v migrator_password="'<strong-password-1>'" -v app_password="'<strong-password-2>'" \
--     -f scripts/rds-bootstrap.sql
\set ON_ERROR_STOP on

CREATE ROLE interior_migrator LOGIN PASSWORD :migrator_password;
CREATE ROLE interior_app LOGIN PASSWORD :app_password;

-- RDS master is not a true superuser; membership is needed to assign ownership.
GRANT interior_migrator TO CURRENT_USER;

CREATE DATABASE interior_design OWNER interior_migrator ENCODING 'UTF8';

ALTER ROLE interior_app IN DATABASE interior_design SET statement_timeout = '30s';
ALTER ROLE interior_app IN DATABASE interior_design SET idle_in_transaction_session_timeout = '60s';
ALTER ROLE interior_app IN DATABASE interior_design SET lock_timeout = '10s';

\connect interior_design

REVOKE ALL ON DATABASE interior_design FROM PUBLIC;
GRANT CONNECT ON DATABASE interior_design TO interior_app;

ALTER SCHEMA public OWNER TO interior_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO interior_app;

-- Tables and sequences created later by migrations are usable by the app without DDL rights.
ALTER DEFAULT PRIVILEGES FOR ROLE interior_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO interior_app;
ALTER DEFAULT PRIVILEGES FOR ROLE interior_migrator IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO interior_app;
ALTER DEFAULT PRIVILEGES FOR ROLE interior_migrator IN SCHEMA public
  GRANT USAGE ON TYPES TO interior_app;
