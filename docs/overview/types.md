---
name: "docs/overview_0/types.md"
title: "主要な型定義概要 (Types)"
description: "コミットコーチ — AIコーチング機能を含む共通 TypeScript 型定義一覧"
---

# 主要な型定義 (Types)

このドキュメントでは、**コミットコーチ** アプリケーション（フロント／バックエンド共通）にて使用する TypeScript 型定義を示します。  
**AIコーチング**や**タスク分解**など、本アプリ特有の要素を含めた設計となっています。

---

## 1. 共通ユーティリティ型

```ts
/** API レスポンス共通フォーマット */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ResponseError;
}

/** エラー情報 */
export interface ResponseError {
  code: string;          // エラーコード（例: "VALIDATION_ERROR"）
  message: string;       // ユーザー向けメッセージ
  details?: Record<string, any>; // 任意の追加情報
}

/** ページネーション用クエリパラメータ */
export interface PaginationParams {
  page?: number;         // 1-based
  perPage?: number;      // 1～100
  search?: string;       // キーワード検索
}

/** ページネーション結果ジェネリック */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
```

---

## 2. 認証・ユーザー関連型

```ts
/** Supabase セッション情報 (バックエンド認証に利用) */
export type AuthSession = import('@supabase/supabase-js').Session;

/** ユーザーの基本情報 */
export interface UserBasicInfo {
  id: string;            // UUID
  name: string;
  email?: string;        // バックエンド内部用
  avatarUrl?: string;
}

/** ユーザー詳細 */
export interface UserProfile extends UserBasicInfo {
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;     // ISO8601
  updatedAt: string;     // ISO8601

  /** AIコーチの設定 (ユーザーごとに保持) */
  aiSetting?: AICoachSetting;
}
```

---

## 3. プロジェクト関連型

```ts
/** プロジェクト状態 */
export type ProjectStatus = 'active' | 'paused' | 'archived';

/** プロジェクトメンバー */
export interface ProjectMember {
  user: UserBasicInfo;
  role: 'owner' | 'developer' | 'viewer';
  lastActiveAt?: string; // ISO8601
}

/** プロジェクト情報 */
export interface Project {
  id: string;                  // UUID
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;             // UserBasicInfo.id
  members?: ProjectMember[];
  createdAt: string;           // ISO8601
  updatedAt: string;           // ISO8601
}
```

---

## 4. タスク管理関連型

```ts
/** タスクグループ */
export interface TaskGroup {
  id: string;                  // UUID
  projectId: string;           // Project.id
  name: string;
  order: number;               // 並び順 (D&Dでの移動に利用)
  createdAt: string;           // ISO8601
  updatedAt: string;           // ISO8601
}

/** タスク状態 */
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

/** タスク */
export interface Task {
  id: string;                  // UUID
  groupId: string;             // TaskGroup.id
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;            // ISO8601 (日時指定タスクなら日付+時刻)
  order: number;               // 同一グループ内での表示順
  createdAt: string;           // ISO8601
  updatedAt: string;           // ISO8601

  /** サブタスク一覧 */
  subtasks?: Subtask[];
}

/** サブタスク */
export interface Subtask {
  id: string;                  // UUID
  taskId: string;              // Task.id
  title: string;
  isDone: boolean;
  order: number;               // タスク内での並び順
  createdAt: string;           // ISO8601
  updatedAt: string;           // ISO8601
}
```

---

## 5. AIコーチング関連型

```ts
/** AIメッセージの送信者 */
export type AIMessageRole = 'system' | 'user' | 'assistant';

/** AIメッセージ */
export interface AIMessage {
  id: string;               // UUID
  projectId?: string;       // Project.id (プロジェクト単位のAIコーチング履歴に紐づけ)
  role: AIMessageRole;
  content: string;
  createdAt: string;        // ISO8601
}

/** ユーザーが持つAIコーチ設定 */
export interface AICoachSetting {
  /** 選択するモデル (Freeユーザーは gpt-3.5, 有料ユーザーは gpt-4 など) */
  model?: 'gpt-3.5-turbo' | 'gpt-4' | string;
  /** 想像力パラメータ (0.0〜1.0) */
  temperature?: number;
  /** システムプロンプト (AIの役割を設定) */
  systemMessage?: string;
  /** その他パラメータ拡張用 */
  [key: string]: any;
}

/** AIコーチへのリクエスト（例: コーチング, タスク分解など） */
export interface AICoachRequest {
  prompt: string;
  context?: Record<string, any>; // 追加情報、プロジェクト状況など
}

/** AIコーチからの応答 */
export interface AICoachResponse {
  assistantMessage: string;  // AIの回答
  tokensUsed?: number;       // 消費トークン数 (オプション)
  context?: any;             // 追加データ（サブタスク提案等）
}
```

---

## 6. タスク分解 (AI + ユーザー入力) 型

```ts
/**
 * ユーザーが「タスク分解」を行う際の入力データ
 * 大目標や前提条件などをまとめてAIに送る
 */
export interface TaskBreakdownRequest {
  goal: string;               // 大目標
  constraints?: string[];     // 制約条件 (ツール、時間、コストなど)
  currentProgress?: string;   // 現在の進捗 (任意)
}

/** AI が提案したサブタスクや計画 */
export interface TaskBreakdownProposal {
  title: string;
  description?: string;       // 提案の詳細説明
  estimatedTime?: number;     // 所要時間(単位: 時間)
  dependencies?: string[];    // 依存関係
}

/** タスク分解応答 */
export interface TaskBreakdownResponse {
  breakdown: TaskBreakdownProposal[];
  explanation?: string;       // 提案の背景や根拠など
  tokensUsed?: number;        // AIトークン使用量 (オプション)
}
```

---

## 7. コミット (将来拡張) 型

```ts
/** コミット状態 (将来的に GitHub連携を想定) */
export type CommitStatus = 'draft' | 'published' | 'reverted' | 'archived';

/** コミットコメント（ネスト可） */
export interface CommitComment {
  id: string;                  // UUID
  commitId: string;            // Commit.id
  author: UserBasicInfo;
  content: string;
  createdAt: string;           // ISO8601
  replies?: CommitComment[];
}

/** コミット情報 */
export interface Commit {
  id: string;                  // Git SHA or UUID
  projectId: string;           // Project.id
  message: string;
  author: UserBasicInfo;
  timestamp: string;           // Git commit date ISO8601
  status?: CommitStatus;
  comments?: CommitComment[];
  createdAt: string;           // レコード登録日時 ISO8601
}
```

---

## 8. DTO / リクエストボディ型

```ts
/** 新規プロジェクト作成リクエスト */
export interface CreateProjectDto {
  name: string;
  description?: string;
}

/** タスク更新リクエスト */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;    // ISO8601
  order?: number;
}

/** AIコーチングリクエスト */
export interface AiCoachRequest {
  prompt: string;
  context?: Record<string, any>;
}

/** AIコーチングレスポンス */
export interface AiCoachResponse {
  assistantMessage: string;
  tokensUsed?: number;
  // タスク分解や追加情報が返される場合
  context?: any;
}
```

---

## 9. 運用上の注意点

1. **型と DB スキーマの整合性**  
   - Supabase (PostgreSQL) や ORM (Prisma/TypeORM) でのスキーマ定義と同期を保つこと。  
2. **AI関連の型変更に注意**  
   - GPTモデルや temperature、その他パラメータが変わる場合、**AICoachSetting** を更新し、後方互換を意識する。  
3. **バージョニング**  
   - 大きな変更・互換性切り離しが必要な場合は、API バージョン (v1, v2 等) を設定し、混在を避ける。

---

## 10. 参考資料

- [OpenAI API Docs](https://platform.openai.com/docs/introduction)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
```
