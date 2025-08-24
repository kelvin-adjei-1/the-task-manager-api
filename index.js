import express from 'express';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';
import boardsRouter from './routes/boards.js';
import listsRouter from './routes/lists.js';
import commentsRouter from './routes/comments.js';
import notificationsRouter from './routes/notifications.js';
import attachmentsRouter from './routes/attachments.js';
import workspacesRouter from './routes/workspaces.js';

const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/workspaces', workspacesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});
