import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: '無効な認証トークン形式です' });
    }

    // SupabaseでJWTを検証
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: '無効な認証トークンです' });
    }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    console.error('認証エラー:', error);
    return res.status(500).json({ error: '認証処理中にエラーが発生しました' });
  }
};
