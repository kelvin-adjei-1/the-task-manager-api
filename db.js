// This file will contain the database connection logic for MySQL and PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;
export const dBConfig = {
  host: "localhost",
  user: "postgres",
  password: "Kpk102275005!",
  database: "the_task_manager",
  port: 5432
};

// PostgreSQL connection
export function getPostgresPool(config = {}) {
  return new Pool({
    host: config.host || process.env.PGHOST || '',
    user: config.user || process.env.PGUSER || '',
    password: (config.password || process.env.PGPASSWORD || '').toString(),
    database: config.database || process.env.PGDATABASE || '',
    port: config.port || process.env.PGPORT || 5432
  });
}
