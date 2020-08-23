import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.PGHOST!,
  port: Number(process.env.PGPORT)!,
  database: process.env.PGDATABASE!,
  user: process.env.PGUSER!,
  password: process.env.PGPASSWORD!,
};

export default dbConfig;
