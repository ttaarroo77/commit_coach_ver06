---
name: "docs/overview/database.md"
title: "データベース設計 (Database Design)"
description: "Supabaseを使用したデータベースの設計とスキーマ定義"
---

# データベース設計

## 1. データベース概要

### 1.1 使用技術
- **プラットフォーム**: Supabase
- **データベース**: PostgreSQL
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage

### 1.2 設計方針
- 正規化されたスキーマ設計
- 適切なインデックス設定
- セキュリティ考慮
- パフォーマンス最適化

## 2. テーブル定義

### 2.1 ユーザー関連

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_settings
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  notifications JSONB DEFAULT '{"email": true, "push": true}',
  language TEXT DEFAULT 'ja',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 プロジェクト関連

#### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE
);
```

#### project_members
```sql
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);
```

### 2.3 タスク関連

#### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL
);
```

#### subtasks
```sql
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE
);
```

### 2.4 AIコーチング関連

#### ai_messages
```sql
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE
);
```

## 3. インデックス設定

### 3.1 主要インデックス
```sql
-- ユーザー関連
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- プロジェクト関連
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- タスク関連
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);

-- AIメッセージ関連
CREATE INDEX idx_ai_messages_task_id ON ai_messages(task_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
```

## 4. セキュリティ設定

### 4.1 RLS (Row Level Security)
```sql
-- ユーザー関連
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- プロジェクト関連
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members can view projects" ON projects
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- タスク関連
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id AND
      (owner_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM project_members
         WHERE project_id = projects.id AND user_id = auth.uid()
       ))
    )
  );
```

## 5. データベース管理

### 5.1 バックアップ
- 自動バックアップ: 日次
- バックアップ保持期間: 30日
- バックアップストレージ: Supabase Storage

### 5.2 マイグレーション
- マイグレーションツール: Supabase CLI
- マイグレーション管理: Gitリポジトリ
- デプロイメント: CI/CDパイプライン

### 5.3 モニタリング
- パフォーマンスモニタリング
- クエリ最適化
- リソース使用状況の監視
