import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

export const pgpOptioned = pgPromise({
  capSQL: true,
});

const dbConfig = {
  host: process.env.PGHOST!,
  port: Number(process.env.PGPORT)!,
  database: process.env.PGDATABASE!,
  user: process.env.PGUSER!,
  password: process.env.PGPASSWORD!,
};

export const pgpConfigured = pgpOptioned(dbConfig);
