/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Get all boards
 *     responses:
 *       200:
 *         description: List of boards
 *   post:
 *     summary: Create a new board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created
 */
import express from 'express';
import { dBConfig, getPostgresPool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPostgresPool(dBConfig);

// GET /api/boards?workspaceId=...
router.get('/', async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'Missing workspaceId' });
  try {
    const result = await pool.query('SELECT * FROM boards WHERE workspace_id = $1 ORDER BY order_index', [workspaceId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/boards
router.post('/', async (req, res) => {
  const { name, workspaceId } = req.body;
  if (!name || !workspaceId) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO boards (id, name, workspace_id) VALUES ($1, $2, $3) RETURNING *',
      [id, name, workspaceId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/boards/:boardId
router.patch('/:boardId', async (req, res) => {
  const { boardId } = req.params;
  const updates = req.body;
  if (!boardId) return res.status(400).json({ error: 'Missing boardId' });
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [boardId, ...keys.map(k => updates[k])];
    const result = await pool.query(
      `UPDATE boards SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/boards/:boardId
router.delete('/:boardId', async (req, res) => {
  const { boardId } = req.params;
  if (!boardId) return res.status(400).json({ error: 'Missing boardId' });
  try {
    await pool.query('DELETE FROM boards WHERE id = $1', [boardId]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
