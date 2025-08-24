import { getPostgresPool } from '../db.js';

const pool = getPostgresPool();

export async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getWorkspaceById(id) {
  const result = await pool.query('SELECT * FROM workspaces WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getBoardById(id) {
  const result = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getListById(id) {
  const result = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);
  return result.rows[0];
}

// Add more helpers as needed for comments, notifications, attachments, etc.
