import express from 'express';
import { getPostgresPool } from '../db.js';

const router = express.Router();
const pool = getPostgresPool();

// GET /api/notifications?userId=...
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id (mark as read)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET read_at = NOW() WHERE id = $1', [id]);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
