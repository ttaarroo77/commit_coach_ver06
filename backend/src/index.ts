import express from 'express';
import dotenv from 'dotenv';
// import { createClient } from '@supabase/supabase-js';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';
import app from './app';

// 環境変数の読み込み
dotenv.config();

const port = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ルート
app.get('/', (req, res) => {
  res.json({ message: 'バックエンドサーバーが起動しています' });
});

// APIルート
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 開発フローエンドポイント
app.get('/api/development-flow', (req, res) => {
  res.json({
    steps: [
      { id: 1, title: 'プロジェクト設定', completed: false },
      { id: 2, title: 'データベース設計', completed: false },
      { id: 3, title: 'API実装', completed: false },
      { id: 4, title: 'フロントエンド実装', completed: false },
      { id: 5, title: 'テスト', completed: false },
      { id: 6, title: 'デプロイ', completed: false }
    ]
  });
});

// エラーハンドリング
app.use(errorHandler);

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 