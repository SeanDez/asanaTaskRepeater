-- run command:
-- psql -h localhost -U userName -d dbname -a -f fullFilePath

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "asana_id" VARCHAR not null unique
)

/*
CREATE TABLE IF NOT EXISTS "repeater" (
  "id" SERIAL primary key,
)
*/


