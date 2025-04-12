---
name: "api-routes.md"
title: "APIルート設計 (App Router)"
description: "コミットコーチ: Next.js App Router を使ったAPIルートの概要"
---

# API Routes 概要

このドキュメントでは、**コミットコーチ** のAPIルート設計について説明します。  
**Next.js** の**App Router**を採用し、従来の`pages/api`フォルダではなく、`app/api` ディレクトリ配下にルートを定義します。

---

## 1. ディレクトリ構成イメージ

```
app/
  ├── api/
  │   ├── users/
  │   │   └── route.ts    // /api/users
  │   ├── tasks/
  │   │   └── route.ts    // /api/tasks
  │   ├── ai/
  │   │   └── route.ts    // /api/ai
  │   └── ... (その他エンドポイント)
  ├── (ページコンポーネントたち)
  └── ...
```

- **`app/api/`** ディレクトリ以下に、APIエンドポイントを設置します。  
- `route.ts` (または `route.js`) ファイルが1つのエンドポイントを表し、HTTPメソッドごとにハンドラを定義します。

---

## 2. 基本的なエンドポイント例

### 2.1 `/api/users` - ユーザー関連
- **`GET /api/users`**  
  - ユーザー一覧の取得
  - Queryパラメータ（例: ページングや検索）に応じた絞り込み
- **`POST /api/users`**  
  - 新規ユーザーの作成

### 2.2 `/api/tasks` - タスク関連
- **`GET /api/tasks`**  
  - タスクの一覧取得
- **`POST /api/tasks`**  
  - 新規タスクの登録
- **`GET /api/tasks/:id`**  
  - 個別タスクの詳細取得
- **`PUT /api/tasks/:id`**  
  - タスクの更新（タイトル、ステータス、期限など）
- **`DELETE /api/tasks/:id`**  
  - タスクの削除

### 2.3 `/api/ai` - AIコーチング関連
- **`POST /api/ai/coach`**  
  - AIコーチとの対話用エンドポイント  
  - ボディにユーザーの質問や進捗状況などを送り、アシスタントの返信を受け取る
- **`POST /api/ai/breakdown`**  
  - AIにタスク分解をさせるエンドポイント（大目標を受け取り、小目標を返すイメージ）
- **`GET /api/ai/settings`**  
  - AIの内部プロンプト設定の取得（※ユーザー固有設定など）
- **`PUT /api/ai/settings`**  
  - AIコーチのプロンプト・キャラクター設定の更新

> **Note**: 実際のAI処理にはOpenAI API等を利用し、Next.jsのサーバーレス関数 (`route.ts`) から呼び出す設計を想定しています。

---

## 3. 実装サンプル

```ts
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server"

// GET /api/tasks
export async function GET() {
  // タスク一覧の取得処理（DB呼び出し等）
  const tasks = await fetchTasksFromDB() 
  return NextResponse.json({ tasks })
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const body = await req.json()
  // bodyからタスク情報を取得し、DBに保存
  const newTask = await createTaskInDB(body)
  return NextResponse.json({ success: true, task: newTask }, { status: 201 })
}
```

- **`GET` メソッド**: タスク一覧を返す
- **`POST` メソッド**: 新規タスクを作成

次のように、`route.ts` 内でHTTPメソッドに合わせた関数 (`GET` / `POST` / `PUT` / `DELETE` など) をエクスポートすることでエンドポイントが定義されます。

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
    "createdAt": "2025-04-07T08:00:00Z",
    "updatedAt": "2025-04-07T08:00:00Z"
  }
}
```

---

## 5. エラーハンドリング・ステータスコード
エラーが発生した場合、基本的に**400番台**（クライアントエラー）または**500番台**（サーバーエラー）を返却し、レスポンスは以下のフォーマットを推奨します。

```jsonc
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "パラメータが正しくありません。"
  }
}
```

- **例**:  
  - **400**: バリデーションエラー  
  - **401**: 認証失敗  
  - **403**: 権限エラー  
  - **404**: 該当リソースなし  
  - **500**: サーバーエラー  

---

## 6. セキュリティ
- **認証**: `next-auth` や `JWT` を活用。トークンの検証を `route.ts` 側で行う。
- **APIリミット**: 連続リクエストを制限するためのレートリミットを導入検討。
- **CORS**: 必要に応じてヘッダ設定を管理。通常は同一オリジンで問題なければ最小限に。

---

## 7. 今後の拡張
- **GitHub API連携**: コミット履歴自動取得エンドポイント `api/integrations/github` などを追加予定
- **キャッシュ層**: タスク一覧など頻繁に参照されるAPIについては、RedisやEdgeキャッシュの導入検討
- **WebSocket (Server-Sent Events)**: リアルタイム更新が必要な場合に拡張

---

### まとめ
コミットコーチのAPIは、**Next.js App Router** で柔軟に定義します。  
各エンドポイントは `/app/api/[endpoint]/route.ts` にメソッドごとのハンドラ (`GET`, `POST`, など) を配置し、**レスポンスはJSON** を基本とします。認証やエラーハンドリング、拡張機能などを適宜追加し、**モジュール化** していく運用を推奨します。
```