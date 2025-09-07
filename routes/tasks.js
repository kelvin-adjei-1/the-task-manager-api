/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               listId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
import express from 'express';
import { dBConfig, getPostgresPool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPostgresPool(dBConfig);


// GET /api/tasks?boardId=...
router.get('/', async (req, res) => {
  const { boardId } = req.query;
  try {
    let result;
    if (boardId) {
      result = await pool.query('SELECT * FROM tasks WHERE board_id = $1', [boardId]);
    } else {
      result = await pool.query('SELECT * FROM tasks');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  const { title, description, boardId, listId, workspaceId, createdById } = req.body;
  if (!title || !boardId || !listId || !workspaceId) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO tasks (id, title, description, board_id, list_id, workspace_id, created_by_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, title, description || '', boardId, listId, workspaceId, createdById || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:taskId
router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });
  try {
    // Build dynamic SET clause
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [taskId, ...keys.map(k => updates[k])];
    const result = await pool.query(
      `UPDATE tasks SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:taskId

router.delete('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
