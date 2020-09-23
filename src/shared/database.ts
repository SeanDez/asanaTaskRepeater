import dotenv from 'dotenv';
import pgpromise from 'pg-promise';

dotenv.config();

const {
  PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD,
} = process.env;

export const pgOptioned = pgpromise({
  capSQL: true,
});

export const pgConfigured = pgOptioned({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
});
