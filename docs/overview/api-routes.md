---
name: "api-routes.md"
title: "APIルート設計 (App Router)"
description: "コミットコーチ: Next.js App Router を使ったAPIルートの概要"
---

# API Routes 概要

このドキュメントでは、**コミットコーチ** の APIルート設計について説明します。  
**Next.js** の **App Router** を採用し、従来の `pages/api` フォルダではなく、`app/api` ディレクトリ配下にルートを定義します。  
また、データの永続化には **Supabase** を用いており、AI機能は **OpenAI API** や **Vercel AI SDK** を呼び出す想定です。

---

## 1. ディレクトリ構成イメージ

```
app/
  ├── api/
  │   ├── auth/
  │   │   └── route.ts          // /api/auth - ログイン/ログアウトなど
  │   ├── users/
  │   │   └── route.ts          // /api/users
  │   ├── projects/
  │   │   └── route.ts          // /api/projects
  │   ├── tasks/
  │   │   └── route.ts          // /api/tasks
  │   ├── tasks/
  │   │   └── [id]/
  │   │       └── route.ts      // /api/tasks/[id]
  │   ├── ai/
  │   │   ├── coach/
  │   │   │   └── route.ts      // /api/ai/coach
  │   │   └── breakdown/
  │   │       └── route.ts      // /api/ai/breakdown
  │   └── ... (その他エンドポイント)
  ├── (ページコンポーネントたち)
  └── ...
```

- **`app/api/`** ディレクトリ以下に、APIエンドポイントを設置します。  
- `route.ts` (または `route.js`) ファイルが1つのエンドポイントを表し、HTTPメソッドごとにハンドラを定義します。  
- Supabase認証やDB操作が必要な場合、各 `route.ts` 内で Supabaseクライアントを利用します。
- AIコーチング系のエンドポイントでは、**Vercel AI SDK** や **OpenAI API** を呼び出す構造を想定しています。

---

## 2. 主なエンドポイント概要

### 2.1 認証関連 - `/api/auth`
- **`POST /api/auth/login`**  
  - メールアドレス・パスワード認証（あるいはSupabase Authのセッション生成）
- **`POST /api/auth/logout`**  
  - ログアウト処理（セッショントークンの破棄）

> **Note**: 実装方法は複数ありますが、Supabase Authを利用する場合はフロントエンドから直接Supabase AuthのAPIを呼ぶ方法も可能です。ただし、サーバー側でより細かい認可制御を行いたい場合は、`route.ts` 内でトークン確認・セッション無効化などを行います。

---

### 2.2 ユーザー関連 - `/api/users`
- **`GET /api/users`**  
  - ユーザー一覧の取得  
  - ページングや検索クエリを利用して絞り込み  
  - **要認証**: 管理者権限または特定のロールのみアクセス許可

- **`POST /api/users`**  
  - 新規ユーザーの作成  
  - 招待フローや追加情報を扱う場合などに利用（通常は `/api/auth/signup` でも可）

---

### 2.3 プロジェクト関連 - `/api/projects`
- **`GET /api/projects`**  
  - ログインユーザーがアクセス可能なプロジェクト一覧を取得  
  - Supabase で user_id をキーにフィルタリング

- **`POST /api/projects`**  
  - 新規プロジェクトの作成  
  - リクエストボディに `title`, `dueDate` などを含む

- **`GET /api/projects/:id`**  
  - 指定IDのプロジェクト詳細を取得

- **`PUT /api/projects/:id`**  
  - プロジェクト情報の更新

- **`DELETE /api/projects/:id`**  
  - プロジェクトの削除

---

### 2.4 タスク関連 - `/api/tasks`
#### `/api/tasks` (タスクの一覧・新規登録)
- **`GET /api/tasks`**  
  - ログインユーザーに紐づくタスク一覧を取得  
  - クエリでプロジェクトIDやステータスでの絞り込みも可
- **`POST /api/tasks`**  
  - 新規タスクの登録  
  - リクエストボディに `title`, `description`, `dueDate`, `status` など

#### `/api/tasks/:id` (個別タスク取得・更新・削除)
- **`GET /api/tasks/:id`**  
  - 個別タスクの詳細取得
- **`PUT /api/tasks/:id`**  
  - タスクの更新（タイトル、ステータス、期限など）
- **`DELETE /api/tasks/:id`**  
  - タスクの削除

> **Note**: Supabase の Row Level Security を使い、  
> 「ユーザーは自分が作成したタスクのみCRUD可能」などの制御を行うケースもあります。

---

### 2.5 AIコーチング関連 - `/api/ai`

#### **`POST /api/ai/coach`**  
- AIコーチとの対話用エンドポイント  
- リクエストボディにユーザーのメッセージや進捗状況などを送信  
- **Vercel AI SDK** もしくは **OpenAI API** を呼び出し、コーチング用の回答を生成

#### **`POST /api/ai/breakdown`**  
- AIによるタスク分解機能  
- 大目標（例: 「新機能Aを2週間でリリースする」）を入力すると、AIが小タスクやステップを提案

#### **`GET /api/ai/settings`**  
- ユーザーごとのAI設定（プロンプトやキャラクター設定）を取得

#### **`PUT /api/ai/settings`**  
- AIコーチングの応答スタイルなどを更新  

---

## 3. 実装サンプル: タスク関連 (`app/api/tasks/route.ts`)

```ts
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server"
// Supabase クライアント (例)
import { supabase } from "@/lib/supabaseClient" 
import { getUserIdFromToken } from "@/lib/auth" // JWT or Supabase Auth など

// GET /api/tasks
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "ログインが必要です" } },
        { status: 401 }
      )
    }
    // クエリパラメータ取得
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    // Supabaseからタスク一覧を取得
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId ?? null)

    if (error) throw error

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "GET_TASKS_ERROR", message: err.message } },
      { status: 500 }
    )
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "ログインが必要です" } },
        { status: 401 }
      )
    }

    const body = await req.json()
    // 受け取ったデータをDBに保存
    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert([{ ...body, user_id: userId }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, task: newTask }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "CREATE_TASK_ERROR", message: err.message } },
      { status: 500 }
    )
  }
}
```

- **`GET` メソッド**: タスク一覧を返す（ログインユーザーのみ許可）  
- **`POST` メソッド**: 新規タスクをDBに作成（`user_id` 紐付け）

---

## 4. リクエスト/レスポンスの基本形

### 4.1 リクエスト例

```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "新しいタスクのタイトル",
  "description": "タスクの詳細説明",
  "dueDate": "2025-04-10T15:00:00Z",
  "priority": "high"
}
```

### 4.2 レスポンス例

```jsonc
{
  "success": true,
  "task": {
    "id": "abc123",
    "title": "新しいタスクのタイトル",
    "description": "タスクの詳細説明",
    "dueDate": "2025-04-10T15:00:00Z",
    "priority": "high",
    "status": "todo",
    "created_at": "2025-04-07T08:00:00Z",
    "updated_at": "2025-04-07T08:00:00Z",
    "user_id": "user123"
  }
}
```

---

## 5. エラーハンドリング・ステータスコード

エラーが発生した場合は、**400番台**（クライアントエラー）または**500番台**（サーバーエラー）を返却し、レスポンスは以下のフォーマットを推奨します。

```jsonc
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "パラメータが正しくありません。"
  }
}
```

- **例**:  
  - **400**: バリデーションエラー（リクエストボディ不備など）  
  - **401**: 認証失敗 / トークン期限切れ  
  - **403**: 権限エラー / Row Level Security違反  
  - **404**: 該当リソースが存在しない  
  - **500**: サーバーエラー  

---

## 6. セキュリティ

- **認証 (Auth)**:  
  - Supabase Authや独自のJWT方式を利用  
  - `route.ts` でリクエストヘッダを確認し、セッショントークン等を検証  

- **APIリミット**:  
  - 連続リクエストを制限するためのレートリミットを導入検討  
  - Next.jsのミドルウェアやEdge Functionsで対応可能  

- **CORS**:  
  - 通常は同一オリジンで運用するため最小限の設定  
  - 外部ドメインからのアクセスを許可する場合は `vercel.json` やカスタムヘッダで設定  

- **RLS (Row Level Security)**:  
  - SupabaseのRLS機能を用いることで、認証済みユーザーのみが自分のデータを操作可能にする  
  - route.ts側のチェックと合わせて二重の保護を行うことを推奨  

---

## 7. AIエンドポイント実装上の注意

- **OpenAI/Vercel AI SDKの呼び出し**:  
  - `POST /api/ai/coach` などでリクエストを受けたら、サーバー側でOpenAI APIを呼び出す  
  - 応答が長文になる可能性があるため、必要に応じて**ストリーミング**レスポンス (Edge Runtime) を検討  

- **モデル・プロンプト管理**:  
  - システムプロンプトや温度 (temperature) の設定をSupabaseのテーブルで管理し、ユーザーごとにカスタマイズする方法もある  
  - `/api/ai/settings` で取得・更新できるようにしておくと柔軟  

- **APIコスト**:  
  - AIコールは費用がかかる場合があるため、レートリミットやフリーミアム枠などの設計が重要  

---

## 8. 今後の拡張

1. **GitHub API連携**:  
   - コミット履歴を自動取得するエンドポイント `/api/integrations/github`  
   - タスクとGitHub Issueを紐付ける

2. **リアルタイム更新**:  
   - Supabase Realtime や Next.js Edge Functionsを利用して、  
     タスク更新をクライアントへプッシュ通知（WebSocket/SSE）する仕組み

3. **キャッシュ層**:  
   - タスク一覧やAI応答をメモリキャッシュ、Redis等にキャッシュしてパフォーマンス向上

4. **モバイルアプリ想定API**:  
   - iOS/Android向けに同一APIを再利用し、Native Appとの連携

---

## まとめ

- コミットコーチのAPIは、**Next.js App Router** 上で柔軟に定義し、**Supabase** をデータ永続化および認証に活用します。  
- 各エンドポイントは `app/api/[endpoint]/route.ts` に配置し、HTTPメソッド（`GET`, `POST`, `PUT`, `DELETE`など）に対応する関数をエクスポートすることで実現。  
- AIコーチング系の機能は**OpenAI API**や**Vercel AI SDK**との連携を行い、必要に応じてユーザーの設定やタスク情報を照会して柔軟なアドバイスを生成します。  
- セキュリティ要件として、**Supabase Auth**や**RLS**を組み合わせて、ユーザーが自分のデータにのみアクセスできる設計を実施。  
- 今後はGitHubとの連携やリアルタイム性の強化など、SaaSとしての拡張性を意識してAPI設計を継続的に改善していきます。
