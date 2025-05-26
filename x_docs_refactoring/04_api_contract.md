# API 契約書 (v2 – Commit Coach ダッシュボード)

本書はダッシュボード 2 タブ版リファクタリングにおける **バックエンド REST API** のエンドポイント、リクエスト／レスポンス仕様、エラーフォーマット、およびバージョニング方針を定義する。フロントエンド各ドキュメントは本契約を前提とする。

---

## 1. API 基本情報

| 項目          | 値                                                           |
| ----------- | ----------------------------------------------------------- |
| **ベース URL** | `https://api.commitcoach.app/v1`                            |
| **認証方式**    | Bearer Token (JWT) – `Authorization: Bearer <token>`        |
| **データ形式**   | JSON (utf-8)                                                |
| **タイムゾーン**  | すべて ISO‑8601 (UTC)                                          |
| **バージョン管理** | URL パスに `/v{major}` を付与。後方互換が壊れない限り minor は URL 変更なし。       |
| **同時編集制御**  | `ETag` + `If-Match` ヘッダによる悲観ロック OR 409 Conflict レスポンスによる検出。 |

---

## 2. 共通ヘッダ

| ヘッダ             | 必須           | 値                      | 説明     |
| --------------- | ------------ | ---------------------- | ------ |
| `Authorization` | ✔︎           | `Bearer <jwt>`         | 認証トークン |
| `Content-Type`  | POST/PATCH 時 | `application/json`     | —      |
| `If-Match`      | 更新系で推奨       | エンティティ取得時に受け取った `ETag` | 競合回避用  |

---

## 3. 共通レスポンス構造

成功レスポンス（2xx）はリソース本体、または以下メタのみ。

```jsonc
{
  "data": { /* Resource or Array */ },
  "meta": {
    "version": 42,
    "generatedAt": "2025-05-25T12:34:56Z"
  }
}
```

エラーレスポンス（4xx/5xx）は下記形式。

```jsonc
{
  "error": {
    "code": "invalid_parameter",
    "message": "title must not be empty",
    "details": {
      "field": "title"
    }
  }
}
```

| code           | 意味                 | HTTP 状態 |
| -------------- | ------------------ | ------- |
| `unauthorized` | トークン無効／期限切れ        | 401     |
| `forbidden`    | アクセス権限不足           | 403     |
| `not_found`    | リソース不存在            | 404     |
| `conflict`     | バージョン衝突 (ETag 不一致) | 409     |
| `rate_limited` | レート制限超過            | 429     |
| `server_error` | 予期せぬサーバ障害          | 500     |

---

## 4. エンドポイント一覧

### 4.1 プロジェクト (Project)

| Method     | Path                          | 用途                     |
| ---------- | ----------------------------- | ---------------------- |
| **GET**    | `/projects`                   | プロジェクト一覧取得             |
| **POST**   | `/projects`                   | プロジェクト新規作成             |
| **GET**    | `/projects/{projectId}`       | 単一プロジェクト取得             |
| **PATCH**  | `/projects/{projectId}`       | プロジェクト更新 **(編集フロー対応)** |
| **DELETE** | `/projects/{projectId}`       | プロジェクト削除               |
| **PATCH**  | `/projects/{projectId}/order` | タスク並び順更新               |

#### 4.1.1 POST /projects

```http
POST /v1/projects HTTP/1.1
Authorization: Bearer abc.def.ghi
Content-Type: application/json

{
  "title": "新規プロジェクト",
  "description": "markdown ok",
  "dueDate": "2025-08-31"
}
```

レスポンス 201:

```jsonc
{
  "data": {
    "id": "prj_123",
    "title": "新規プロジェクト",
    "description": "markdown ok",
    "dueDate": "2025-08-31",
    "createdAt": "2025-05-25T12:40:00Z",
    "updatedAt": "2025-05-25T12:40:00Z"
  },
  "meta": { "version": 43 }
}
```

#### 4.1.2 PATCH /projects/{id}

\*可変フィールドのみ送信可。

```http
PATCH /v1/projects/prj_123 HTTP/1.1
If-Match: "v43"
Content-Type: application/json

{
  "title": "タイトル変更",
  "dueDate": null
}
```

##### 成功 200

ETag が更新される。

```http
ETag: "v44"
```

##### 競合 409

```jsonc
{
  "error": {
    "code": "conflict",
    "message": "resource version mismatch",
    "details": { "currentVersion": 44 }
  }
}
```

---

### 4.2 タスク (Task)

| Method | Path                    |                |
| ------ | ----------------------- | -------------- |
| GET    | `/tasks?projectId={id}` |                |
| POST   | `/tasks`                |                |
| GET    | `/tasks/{taskId}`       |                |
| PATCH  | `/tasks/{taskId}`       |                |
| DELETE | `/tasks/{taskId}`       |                |
| PATCH  | `/tasks/{taskId}/move`  | タスクを別プロジェクトへ移動 |

##### PATCH /tasks/{id}

更新可能フィールド:

```jsonc
{
  "title": "文字列",
  "description": "文字列",
  "dueDate": "YYYY-MM-DD" | null,
  "status": "todo" | "doing" | "done"
}
```

---

### 4.3 サブタスク (Subtask)

| Method | Path                    |
| ------ | ----------------------- |
| GET    | `/subtasks?taskId={id}` |
| POST   | `/subtasks`             |
| PATCH  | `/subtasks/{subtaskId}` |
| DELETE | `/subtasks/{subtaskId}` |

リクエスト／レスポンスはタスクと同様フォーマット。

---

## 5. 並び順 (Order) API

ドラッグ & ドロップで変更される順序は配列で送る。

### 5.1 PATCH /projects/{projectId}/order

```http
PATCH /v1/projects/prj_123/order HTTP/1.1
Content-Type: application/json

{
  "taskIds": ["tsk_a", "tsk_b", "tsk_c"]
}
```

### 5.2 PATCH /tasks/{taskId}/order

```jsonc
{
  "subtaskIds": ["sub_z", "sub_x"]
}
```

戻り値は 204 (No Content)。フロントは React Query `invalidateQueries` を実行。

---

## 6. WebSocket (オプション)

`wss://api.commitcoach.app/realtime?token=<jwt>` でサブスクライブ可能。

```jsonc
{
  "event": "project.updated",
  "payload": {
    "id": "prj_123",
    "title": "タイトル変更",
    "version": 44
  }
}
```

クライアントは受信時に zustand へ `bulkMerge()` を呼び出し、表示を即時更新する。

---

## 7. レート制限

* **Authenticated:** 600 リクエスト / 10 分 / ユーザ
* **Burst:** 60 リクエスト / 10 秒
* `429` 時間当たりのリミットを超えると `Retry-After` ヘッダで秒数を返す。

---

## 8. セキュリティ & GDPR

* 13 ヶ月を超えるアクセスログは自動削除
* `deletedAt` が設定されたデータは 30 日後に物理削除
* 全通信 TLS1.2+ 必須

---

© 2025 Commit Coach バックエンドチーム
