/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Get all lists
 *     responses:
 *       200:
 *         description: List of lists
 *   post:
 *     summary: Create a new list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               boardId:
 *                 type: string
 *     responses:
 *       201:
 *         description: List created
 */
import express from 'express';
import { dBConfig, getPostgresPool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPostgresPool(dBConfig);

// GET /api/lists?boardId=...
router.get('/', async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) return res.status(400).json({ error: 'Missing boardId' });
  try {
    const result = await pool.query('SELECT * FROM lists WHERE board_id = $1 ORDER BY order_index', [boardId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lists
router.post('/', async (req, res) => {
  const { name, boardId } = req.body;
  if (!name || !boardId) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO lists (id, name, board_id) VALUES ($1, $2, $3) RETURNING *',
      [id, name, boardId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/lists/:listId
router.patch('/:listId', async (req, res) => {
  const { listId } = req.params;
  const updates = req.body;
  if (!listId) return res.status(400).json({ error: 'Missing listId' });
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [listId, ...keys.map(k => updates[k])];
    const result = await pool.query(
      `UPDATE lists SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/lists/:listId
router.delete('/:listId', async (req, res) => {
  const { listId } = req.params;
  if (!listId) return res.status(400).json({ error: 'Missing listId' });
  try {
    await pool.query('DELETE FROM lists WHERE id = $1', [listId]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
