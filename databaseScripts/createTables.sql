-- run command:
-- psql -h localhost -U userName -d dbname -a -f fullFilePath

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "asana_id" VARCHAR not null unique,
  "refresh_token_encrypted" VARCHAR(10000),
  "access_token_encrypted" VARCHAR(10000)
)

/*
CREATE TABLE IF NOT EXISTS "repeater" (
  "id" SERIAL primary key,
)
*/


