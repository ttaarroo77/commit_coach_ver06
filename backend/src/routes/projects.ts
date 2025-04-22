import express from 'express';
import { supabase } from '../lib/supabase';
import { ValidationError, NotFoundError } from '../lib/errors';

const router = express.Router();

// プロジェクト一覧を取得
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      message: 'プロジェクト一覧を取得しました',
      data
    });
  } catch (error) {
    next(error);
  }
});

// 新規プロジェクトを作成
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: '新規プロジェクトを作成しました',
      data
    });
  } catch (error) {
    next(error);
  }
});

export default router;