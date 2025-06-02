import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();

// ミドルウェア
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// エラーハンドリング
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

export default app;
