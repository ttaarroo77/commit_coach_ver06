import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabaseの設定が不足しています。.envファイルを確認してください。');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 型定義
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  task_id: number;
  created_at: string;
  updated_at: string;
}