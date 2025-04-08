---

```yaml
name: "docs/overview/types.md"
title: "主要な型定義概要 (Types)"
description: "コミットコーチ - プロジェクト/コミット/ユーザーなどの型定義"
```

# 主要な型定義 (Types)

ここでは、**コミットコーチ** アプリケーションにおける、フロントエンド/バックエンドで共通利用可能な型定義の一例を示します。  
実際には認証や外部連携などの要件に応じて拡張・変更してください。

---

## 1. `Project` 型

```typescript
export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  /** プロジェクトに参加しているメンバー情報一覧 */
  members?: ProjectMember[]
  /** 関連するコミット情報の配列 */
  commits?: Commit[]
  /** 作成日時 (ISO8601形式) */
  createdAt?: string
  /** 更新日時 (ISO8601形式) */
  updatedAt?: string
}
```

- `id`: プロジェクトを一意に識別するID
- `name`: プロジェクト名
- `description`: プロジェクトの説明文 (任意)
- `status`: プロジェクトの状態 (後述 `ProjectStatus` 型を参照)
- `members`: プロジェクトに紐づくユーザーとそのロール情報
- `commits`: 本プロジェクトで作成/管理されるコミット一覧
- `createdAt` / `updatedAt`: レコードの作成・更新時刻

---

## 2. `ProjectMember` 型

```typescript
export interface ProjectMember {
  user: UserBasicInfo
  /** プロジェクト内での権限ロール */
  role: "admin" | "developer" | "viewer"
  /** 最終操作日時等を保持したい場合などに活用 (任意) */
  lastActiveAt?: string
}
```

- `user`: 参加ユーザー (`UserBasicInfo`) の情報
- `role`: プロジェクト内での役割  
  - `"admin"`: 設定変更やメンバー管理が可能  
  - `"developer"`: 通常開発メンバー  
  - `"viewer"`: 閲覧のみ可能
- `lastActiveAt`: 任意で最後に操作/アクセスしたタイミングなどを保持する

---

## 3. `ProjectStatus` 型

```typescript
export type ProjectStatus =
  | "active"    // 現在運用中
  | "paused"    // 一時停止 (保留状態)
  | "archived"  // アーカイブ済み
```

- `"active"`: メンテナンスなどを含め、通常稼働中  
- `"paused"`: 一時的に開発停止やメンバーが不在など  
- `"archived"`: 過去プロジェクトとしてクローズされ、参照だけを行いたい場合

---

## 4. `Commit` 型

```typescript
export interface Commit {
  id: string
  /** Git SHAなど */
  message: string
  author: UserBasicInfo
  timestamp: string
  projectId: string
  status?: CommitStatus
  /** コミットに紐づくコメントやレビュー指摘など */
  comments?: CommitComment[]
}
```

- `id`: コミットを一意に識別するID (Git SHAなど)
- `message`: コミットメッセージ
- `author`: 作成者の基本情報 (`UserBasicInfo`)
- `timestamp`: コミットの日時 (ISO8601 など)
- `projectId`: 紐づくプロジェクトのID
- `status`: コミット状態 (`CommitStatus`)
- `comments`: コミットへのコメント/レビューなどの情報

---

## 5. `CommitStatus` 型

```typescript
export type CommitStatus =
  | "draft"
  | "published"
  | "reverted"
  | "archived"
```

- `"draft"`: 下書きとして保存されたコミット
- `"published"`: メインブランチ等に正式に反映されたコミット
- `"reverted"`: リバートされ、実質的に取り消しされたコミット
- `"archived"`: 履歴管理目的でアーカイブしたコミット

---

## 6. `CommitComment` 型

```typescript
export interface CommitComment {
  id: string
  commitId: string
  author: UserBasicInfo
  content: string
  createdAt: string
  /** 返信をネストさせたい場合に配列で管理 */
  replies?: CommitComment[]
}
```

- `id`: コメントを一意に識別するID
- `commitId`: 関連付けられたコミットのID
- `author`: コメント投稿者 (`UserBasicInfo`)
- `content`: コメント内容
- `createdAt`: コメント投稿日時 (ISO8601 など)
- `replies`: コメントへの返信を再帰的に格納する場合に利用

---

## 7. `UserBasicInfo` 型

```typescript
export interface UserBasicInfo {
  id: string
  name: string
  avatarUrl?: string
}
```

- `id`: ユーザーID
- `name`: ユーザー名 (表示名)
- `avatarUrl`: 任意のプロフィール画像URL

---

## 8. 補足

1. **認証・認可系の型**  
   - 例: `AuthUser`, `Session`, `AuthContext` などは別ドキュメントで管理し、各種認証機構との連携に応じて拡張します。

2. **DB スキーマや ORM**  
   - ここで示した型はアプリケーションレイヤーの概念的な定義です。実際にデータベースを使用する場合は、Prisma / TypeORM / Sequelize などの ORM で管理するエンティティ/テーブル定義と整合性を確認してください。

3. **型の増減・調整**  
   - チーム内のコードベースやプロジェクト規模に応じて、柔軟にフィールドの追加・削除を行ってください。たとえば `src/types/` 以下に適切に分割し、`import` して利用する形がおすすめです。

以上が、コミットコーチにおける主要な型定義の例です。実装時には、実際のビジネスロジックや認証要件にあわせて拡張・修正を行ってください。