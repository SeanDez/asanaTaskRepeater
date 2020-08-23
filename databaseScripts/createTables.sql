-- run command:
-- psql -h localhost -U userName -d dbname -a -f fullFilePath

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "asana_id" TEXT not null unique,
  "name" TEXT,
  "email" TEXT,
  "refresh_token_encrypted" TEXT,
  "access_token_encrypted" TEXT
)

/*
CREATE TABLE IF NOT EXISTS "repeater" (
  "id" SERIAL primary key,
)
*/


