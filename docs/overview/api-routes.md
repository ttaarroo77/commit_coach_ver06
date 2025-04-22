---
name: "docs/overview/api-routes.md"
title: "APIルート設計 (API Routes)"
description: "アプリケーションのAPIエンドポイントの設計と仕様"
---

# APIルート設計

## 1. API概要

### 1.1 基本情報
- **ベースURL**: `/api`
- **認証方式**: JWT
- **レスポンス形式**: JSON
- **エンコーディング**: UTF-8

### 1.2 共通仕様
- **リクエストヘッダー**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **レスポンス形式**:
  ```typescript
  interface ApiResponse<T> {
    data: T;
    error: string | null;
    status: number;
  }
  ```
- **エラーレスポンス**:
  ```typescript
  interface ErrorResponse {
    error: string;
    status: number;
    details?: any;
  }
  ```

## 2. エンドポイント一覧

### 2.1 認証関連

#### POST /api/auth/register
- **説明**: ユーザー登録
- **リクエスト**:
  ```typescript
  interface RegisterRequest {
    email: string;
    password: string;
    name: string;
  }
  ```
- **レスポンス**: `ApiResponse<User>`

#### POST /api/auth/login
- **説明**: ユーザーログイン
- **リクエスト**:
  ```typescript
  interface LoginRequest {
    email: string;
    password: string;
  }
  ```
- **レスポンス**: `ApiResponse<{ token: string; user: User }>`

#### POST /api/auth/logout
- **説明**: ユーザーログアウト
- **レスポンス**: `ApiResponse<null>`

#### GET /api/auth/me
- **説明**: 現在のユーザー情報取得
- **レスポンス**: `ApiResponse<User>`

### 2.2 プロジェクト関連

#### GET /api/projects
- **説明**: プロジェクト一覧取得
- **クエリパラメータ**:
  ```typescript
  interface ProjectsQuery {
    page?: number;
    limit?: number;
    status?: ProjectStatus;
  }
  ```
- **レスポンス**: `ApiResponse<{ projects: Project[]; total: number }>`

#### POST /api/projects
- **説明**: プロジェクト作成
- **リクエスト**:
  ```typescript
  interface CreateProjectRequest {
    name: string;
    description?: string;
  }
  ```
- **レスポンス**: `ApiResponse<Project>`

#### GET /api/projects/:id
- **説明**: プロジェクト詳細取得
- **レスポンス**: `ApiResponse<Project>`

#### PUT /api/projects/:id
- **説明**: プロジェクト更新
- **リクエスト**:
  ```typescript
  interface UpdateProjectRequest {
    name?: string;
    description?: string;
    status?: ProjectStatus;
  }
  ```
- **レスポンス**: `ApiResponse<Project>`

#### DELETE /api/projects/:id
- **説明**: プロジェクト削除
- **レスポンス**: `ApiResponse<null>`

### 2.3 タスク関連

#### GET /api/tasks
- **説明**: タスク一覧取得
- **クエリパラメータ**:
  ```typescript
  interface TasksQuery {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    page?: number;
    limit?: number;
  }
  ```
- **レスポンス**: `ApiResponse<{ tasks: Task[]; total: number }>`

#### POST /api/tasks
- **説明**: タスク作成
- **リクエスト**:
  ```typescript
  interface CreateTaskRequest {
    title: string;
    description?: string;
    projectId: string;
    priority?: TaskPriority;
    dueDate?: string;
  }
  ```
- **レスポンス**: `ApiResponse<Task>`

#### GET /api/tasks/:id
- **説明**: タスク詳細取得
- **レスポンス**: `ApiResponse<Task>`

#### PUT /api/tasks/:id
- **説明**: タスク更新
- **リクエスト**:
  ```typescript
  interface UpdateTaskRequest {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
  }
  ```
- **レスポンス**: `ApiResponse<Task>`

#### DELETE /api/tasks/:id
- **説明**: タスク削除
- **レスポンス**: `ApiResponse<null>`

### 2.4 サブタスク関連

#### GET /api/tasks/:taskId/subtasks
- **説明**: サブタスク一覧取得
- **レスポンス**: `ApiResponse<Subtask[]>`

#### POST /api/tasks/:taskId/subtasks
- **説明**: サブタスク作成
- **リクエスト**:
  ```typescript
  interface CreateSubtaskRequest {
    title: string;
  }
  ```
- **レスポンス**: `ApiResponse<Subtask>`

#### PUT /api/subtasks/:id
- **説明**: サブタスク更新
- **リクエスト**:
  ```typescript
  interface UpdateSubtaskRequest {
    title?: string;
    isCompleted?: boolean;
  }
  ```
- **レスポンス**: `ApiResponse<Subtask>`

#### DELETE /api/subtasks/:id
- **説明**: サブタスク削除
- **レスポンス**: `ApiResponse<null>`

### 2.5 AIコーチング関連

#### POST /api/ai/chat
- **説明**: AIとのチャット
- **リクエスト**:
  ```typescript
  interface AIChatRequest {
    taskId: string;
    message: string;
  }
  ```
- **レスポンス**: `ApiResponse<AIMessage>`

#### GET /api/ai/history
- **説明**: チャット履歴取得
- **クエリパラメータ**:
  ```typescript
  interface AIChatHistoryQuery {
    taskId: string;
    page?: number;
    limit?: number;
  }
  ```
- **レスポンス**: `ApiResponse<{ messages: AIMessage[]; total: number }>`

#### DELETE /api/ai/history/:id
- **説明**: チャット履歴削除
- **レスポンス**: `ApiResponse<null>`

## 3. エラーコード

### 3.1 共通エラー
- **400**: リクエストが不正
- **401**: 認証が必要
- **403**: アクセス権限なし
- **404**: リソースが見つからない
- **500**: サーバーエラー

### 3.2 カスタムエラー
- **1001**: メールアドレスが既に使用されている
- **1002**: パスワードが弱い
- **1003**: プロジェクトメンバーでない
- **1004**: タスクのステータスが不正
- **1005**: AIコーチングの制限に達した
