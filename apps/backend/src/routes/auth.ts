import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードが必要です' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログイン処理中にエラーが発生しました' });
  }
});

// サインアップ
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードが必要です' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('サインアップエラー:', error);
    res.status(500).json({ error: 'サインアップ処理中にエラーが発生しました' });
  }
});

// ログアウト
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('ログアウトエラー:', error);
    res.status(500).json({ error: 'ログアウト処理中にエラーが発生しました' });
  }
});

// ユーザー情報取得
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'ユーザー情報の取得に失敗しました' });
    }

    res.json({ user });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ error: 'ユーザー情報の取得中にエラーが発生しました' });
  }
});

export default router; 