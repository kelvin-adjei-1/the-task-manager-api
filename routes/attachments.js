/**
 * @swagger
 * /api/attachments:
 *   get:
 *     summary: Get attachments for a task
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attachments
 *   post:
 *     summary: Add an attachment (metadata only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               fileName:
 *                 type: string
 *               url:
 *                 type: string
 *               size:
 *                 type: integer
 *               mimeType:
 *                 type: string
 *               uploadedById:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attachment created
 */
import express from 'express';
import { dBConfig, getPostgresPool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPostgresPool(dBConfig);

// GET /api/attachments?taskId=...
router.get('/', async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE task_id = $1 ORDER BY uploaded_at DESC', [taskId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attachments (metadata only, file upload not implemented)
router.post('/', async (req, res) => {
  const { taskId, fileName, url, size, mimeType, uploadedById } = req.body;
  if (!taskId || !fileName || !url || !size || !mimeType) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO attachments (id, task_id, file_name, url, size, mime_type, uploaded_by_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, taskId, fileName, url, size, mimeType, uploadedById || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
