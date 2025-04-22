import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import subtasksRouter from './routes/subtasks';
import aiMessagesRouter from './routes/aiMessages';
import authRouter from './routes/auth';

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルーティング
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/subtasks', subtasksRouter);
app.use('/api/ai-messages', aiMessagesRouter);
app.use('/api/auth', authRouter);

// エラーハンドリング
app.use(errorHandler);

export default app; 