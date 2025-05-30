# 04\_API\_Contract

> **バージョン:** 2025-05-30 (draft)
<!-- > **対象ブランチ:** `feature/remove-dashboard` -->
> **責任者:** @nakazawatarou

---

## 1. ドキュメントの目的

本書は Commit Coach の **フロントエンド ↔ BFF(GraphQL) ↔ Supabase/Postgres** 間の API 契約を定義するものです。フロント開発者・バックエンド開発者・QA が同一仕様を参照し、破壊的変更を未然に防ぐことを目的とします。

---

## 2. API スタック概要

| レイヤ           | 技術                                         | 備考                                      |
| ------------- | ------------------------------------------ | --------------------------------------- |
| **BFF**       | **Fastify (Node 20)** + **Mercurius**      | GraphQL Gateway / DataLoader で N＋1 解消   |
| **データベース**    | Supabase (Postgres 16)                     | RLS 有効・Realtime PubSub                  |
| **Auth**      | Clerk JWT (RS256)                          | Header: `Authorization: Bearer <token>` |
| **Cache**     | Cloudflare Cache (GraphQL persisted query) | `max-age=60`                            |
| **Transport** | HTTPS (HTTP/2)                             | WS サブスクリプションは GraphQL over WebSocket    |

---

## 3. 認証・認可フロー

1. クライアントは **Clerk** でサインイン
2. Clerk JWT を `Authorization` ヘッダに付与
3. BFF で JWT 検証後、`user_id` を Supabase Row Level Security ポリシーに伝搬
4. **RBAC:** *Owner / Member* 2 ロールモデル

```http
POST /graphql HTTP/2
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIn0...
Content-Type: application/json
```

> 🍪 Cookie 認証は廃止。SPA / SSG 両対応のため 100% Bearer Token。

---

## 4. バージョニングポリシー

* **URL 版 (推奨):** `/v1/graphql`
* MAJOR が上がる場合のみエンドポイントを変更。MINOR/PATCH はスキーマの非破壊的追加で管理
* クライアントは `Accept-Version` ヘッダで明示可能 (オプション)

---

## 5. GraphQL スキーマ概要 (SDL 抜粋)

```graphql
"ISO 8601 形式の日時"
scalar DateTime

"プロジェクト"
type Project {
  id: ID!
  name: String!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
  owner: User!
  tasks(filter: TaskFilterInput, orderBy: TaskOrderInput): [Task!]!
}

"タスク"
type Task {
  id: ID!
  title: String!
  status: TaskStatus!
  dueDate: DateTime
  project: Project!
  subtasks: [Subtask!]!
}

enum TaskStatus { TODO IN_PROGRESS DONE ARCHIVED }

input CreateProjectInput { name: String!, description: String }

extend type Query {
  projects(limit: Int = 20, offset: Int = 0): [Project!]!
  project(id: ID!): Project
  me: User!
}

extend type Mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
}

extend type Subscription {
  projectUpdated(id: ID!): Project!
}
```

> **ベストプラクティス:** フロントは [`apollo-link-persisted-queries`](https://www.apollographql.com/docs/react/performance/automatic-persisted-queries/) を有効化し、sha256 でキャッシュ。

---

## 6. REST Fallback エンドポイント

| Method | Path               | Purpose           | Notes          |
| ------ | ------------------ | ----------------- | -------------- |
| `GET`  | `/healthz`         | Liveness Probe    | 200 OK 固定レスポンス |
| `POST` | `/webhooks/github` | GitHub Webhook 受信 | HMAC-SHA256 検証 |
| `POST` | `/auth/refresh`    | トークンリフレッシュ        | Clerk JWKS 使用  |

---

## 7. エラーコード設計

| Code   | Name               | Message                   | HTTP | 説明                 |
| ------ | ------------------ | ------------------------- | ---- | ------------------ |
| `1001` | `UNAUTHENTICATED`  | "Authentication required" | 401  | JWT 不備             |
| `1002` | `FORBIDDEN`        | "Access denied"           | 403  | RBAC 失敗            |
| `2001` | `VALIDATION_ERROR` | "Invalid input"           | 422  | GraphQL Validation |
| `3001` | `NOT_FOUND`        | "Resource not found"      | 404  | ID 不存在             |
| `5001` | `INTERNAL_ERROR`   | "Unexpected error"        | 500  | ログ参照               |

GraphQL では `errors[0].extensions.code` に上記コードを格納。

```jsonc
{
  "errors": [
    {
      "message": "Access denied",
      "extensions": { "code": "FORBIDDEN", "timestamp": "2025-05-30T12:34:56Z" }
    }
  ]
}
```

---

## 8. 入出力サンプル

### 8.1 Query

```graphql
query ListProjects($limit:Int!) {
  projects(limit: $limit) {
    id
    name
    updatedAt
  }
}
```

**Response**

```jsonc
{
  "data": {
    "projects": [
      { "id": "p1", "name": "Alpha", "updatedAt": "2025-05-30T10:10:00Z" }
    ]
  }
}
```

### 8.2 Mutation

```graphql
mutation AddTask($projectId:ID!, $title:String!) {
  addTask(projectId:$projectId, title:$title) {
    id
    title
    status
  }
}
```

**Response**

```jsonc
{
  "data": {
    "addTask": { "id": "t100", "title": "Write tests", "status": "TODO" }
  }
}
```

### 8.3 Subscription (WebSocket)

```graphql
subscription OnProjectUpdated($id:ID!) {
  projectUpdated(id:$id) {
    id
    name
    updatedAt
  }
}
```

---

## 9. ページネーション & ソート

* **Offset Pagination**…小規模 (≤ 1000 row) 用
* **Relay Cursor Pagination**…`tasks` フィールドに採用 (`pageInfo { endCursor, hasNextPage }`)
* **orderBy** 引数は `field` + `direction(ASC|DESC)` ペア配列

---

## 10. レート制限

| ルート                | 制限             | 処理                            |
| ------------------ | -------------- | ----------------------------- |
| all BFF routes     | 600 rpm / user | Fastify `@fastify/rate-limit` |
| `/webhooks/github` | 20 rpm / repo  | IP と repo ID でキー生成            |

制限超過時は **HTTP 429** + `Retry-After` ヘッダ。

---

## 11. セキュリティ

* **RLS:** `user_id = auth.uid()` 制約 + `role` カラムフィルタ
* **CORS:** `*.commitcoach.dev`, `localhost:3000` のみ許可
* **Input Sanitization:** すべての文字列引数に Apollo `sanitize-html` 事前フィルタ
* **Secrets:** `Authorization: Bearer` のみ。ApiKey は廃止。

---

## 12. SDK 生成フロー

1. `yarn gen:schema` — GraphQL SDL を `schema.graphql` にエクスポート
2. `graphql-codegen` で TypeScript 型 + React Hooks を生成 (`src/generated/`)
3. Pull Request に **schema diff bot** がコメント (GraphQL Inspector)

---

## 13. 契約テスト

| レイヤ         | ツール                            | 頻度        |
| ----------- | ------------------------------ | --------- |
| GraphQL SDL | `graphql-validate`             | CI Push 時 |
| Resolvers   | Jest + `apollo-server-testing` | PR 時      |
| E2E         | Playwright + WireMock          | Nightly   |

---

## 14. 今後の拡張計画

| 期       | 施策                   | 概要           |
| ------- | -------------------- | ------------ |
| 2025 Q4 | OpenAPI 3.2 互換エクスポート | REST 客向け自動生成 |
|         |                      |              |
