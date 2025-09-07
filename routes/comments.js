/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments for a task
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *   post:
 *     summary: Add a comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               text:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
import express from 'express';
import { dBConfig, getPostgresPool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPostgresPool(dBConfig);


// GET /api/comments?taskId=...
router.get('/', async (req, res) => {
  const { taskId } = req.query;
  try {
    let result;
    if (taskId) {
      result = await pool.query('SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at', [taskId]);
    } else {
      result = await pool.query('SELECT * FROM comments ORDER BY created_at');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments
router.post('/', async (req, res) => {
  const { taskId, authorId, body } = req.body;
  if (!taskId || !authorId || !body) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO comments (id, task_id, author_id, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, taskId, authorId, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/comments/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...keys.map(k => updates[k])];
    const result = await pool.query(
      `UPDATE comments SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
