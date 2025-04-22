import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.use('/api/auth', authRoutes);

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

export default app; 