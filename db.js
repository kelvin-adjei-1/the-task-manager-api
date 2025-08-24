// This file will contain the database connection logic for MySQL and PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection
export function getPostgresPool() {
  return new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'Kpk102275005!', // update as needed
    database: 'the_task_manager',
    port: 5432
  });
}
