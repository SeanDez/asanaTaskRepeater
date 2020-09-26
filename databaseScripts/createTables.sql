-- run command:
-- psql -h localhost -U userName -d dbname -a -f fullFilePath

BEGIN;

CREATE TABLE IF NOT EXISTS "app_user" (
  "local_id" SERIAL primary key,
  "gid" TEXT not null unique,
  "asana_email" TEXT not null unique,
  "display_name" TEXT,
  "refresh_token_encrypted" TEXT not null,
  "access_token_encrypted" TEXT,
  "state" TEXT
);

/*
CREATE TABLE IF NOT EXISTS "repeat_rule" (
  "id" SERIAL primary key,
  "project_gid" TEXT not null,
  "task_gid" TEXT not null,
  "start_timestamp" TIMESTAMP not null,
  "repeat_number" SMALLINT,
  "repeat_unit" TEXT, -- days, weeks, etc
  "app_user_id" INTEGER references app_user (id) on delete cascade
)
*/

COMMIT;