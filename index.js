import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';
import boardsRouter from './routes/boards.js';
import listsRouter from './routes/lists.js';
import commentsRouter from './routes/comments.js';
import notificationsRouter from './routes/notifications.js';
import attachmentsRouter from './routes/attachments.js';
import workspacesRouter from './routes/workspaces.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API documentation for the Task Manager application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
