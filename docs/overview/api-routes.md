---
title: "API Routes"
description: "APIエンドポイントの一覧と仕様"
version: "1.0"
last_updated: "2024-04-22"
---

# API Routes

## 概要

このドキュメントでは、Commit CoachのバックエンドAPIの仕様を定義します。

## 基本情報

- Base URL: `http://localhost:3001` (開発環境)
- API Version: v1
- 認証: Bearer Token (JWT)
- レスポンスフォーマット: JSON

## 共通仕様

### リクエストヘッダー
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### エラーレスポンス
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### ページネーション
```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

## エンドポイント一覧

### 認証

#### POST /api/v1/auth/signup
新規ユーザー登録

**Request**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "token": "string"
}
```

#### POST /api/v1/auth/login
ログイン

**Request**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "token": "string"
}
```

### プロジェクト

#### GET /api/v1/projects
プロジェクト一覧取得

**Query Parameters**
- page (optional): number
- limit (optional): number
- status (optional): "active" | "archived"

**Response**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

#### POST /api/v1/projects
プロジェクト作成

**Request**
```json
{
  "name": "string",
  "description": "string"
}
```

### タスク

#### GET /api/v1/tasks
タスク一覧取得

**Query Parameters**
- projectId (required): string
- status (optional): "todo" | "in_progress" | "done"
- priority (optional): "high" | "medium" | "low"

#### POST /api/v1/tasks
タスク作成

**Request**
```json
{
  "projectId": "string",
  "title": "string",
  "description": "string",
  "priority": "string",
  "dueDate": "string"
}
```

### AIコーチ

#### POST /api/v1/ai/coach
AIコーチからのアドバイス取得

**Request**
```json
{
  "taskId": "string",
  "message": "string"
}
```

## レート制限

- 認証済みユーザー: 100リクエスト/15分
- 未認証ユーザー: 20リクエスト/15分

## エラーコード

- AUTH_001: 認証エラー
- AUTH_002: 認可エラー
- VAL_001: バリデーションエラー
- REQ_001: 不正なリクエスト
- SRV_001: サーバーエラー
