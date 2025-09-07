import express from 'express';
import { dBConfig, getPostgresPool } from './db.js';

const router = express.Router();

// Example: GET /api/tasks (from PostgreSQL)
router.get('/', async (req, res) => {
  try {
    const pool = getPostgresPool(dBConfig);
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: POST /api/tasks (to PostgreSQL)
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const pool = getPostgresPool(dBConfig);
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title, description, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add PUT, DELETE, GET by ID, etc.

export default router;
