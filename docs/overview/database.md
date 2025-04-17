以下に、**コミットコーチ** のデータベース要件定義書（`database.md`）を、AI機能（OpenAI / Vercel AI SDK 等）や**Next.js + Supabase**での運用を想定した形でアップデートしたサンプルを示します。既存テーブルに加え、AI関連のテーブルや設定項目を盛り込んでいます。

---

```markdown
---
name: "docs/overview_0/database.md"
title: "データベース要件定義書 (Database Requirements)"
description: "コミットコーチ - Supabase (PostgreSQL) を前提としたデータベース設計・要件定義"
---

# 1. 概要

本ドキュメントは、**コミットコーチ** プロジェクトにおけるデータベース要件定義を厳密に記載したものです。

- **データベース基盤**: Supabase (PostgreSQL)
- **将来的な他 RDBMS への移行**: 標準 SQL を優先し、プロバイダ固有機能の依存を最小化  
- **ORM 抽象化層**: Prisma or TypeORM 等を採用予定
- **AI機能**: OpenAI / Vercel AI SDK を活用し、ユーザーのAIコーチング設定やチャット履歴などを管理

---

# 2. 運用ポリシー

## 2.1 開発環境
- Supabase 無料プラン、またはローカル PostgreSQL を利用  
- チーム全員がアクセス権を持ち、**マイグレーション**やテストデータ投入手順を共有  
- マイグレーションは CLI (Supabase CLI や Prisma CLI) で実行し、Git 管理下の `migrations/` に集約

## 2.2 本番環境
- Supabase 有料プラン (高可用性・自動バックアップ・モニタリング)  
- **RLS (Row Level Security)** やバックアップポリシーを厳密に設定  
- SLA, RTO/RPO 要件に合わせて設定をチューニング

## 2.3 プロバイダ依存の最小化
- 移行コストを抑えるため、SQL 関数・拡張機能への依存は限定的に  
- 各種機能 (Auth, Realtime, Edge Functions など) は Supabase を優先的に活用するが、  
  代替手段を想定できる設計を心がける

---

# 3. 機能要件

## 3.1 管理対象エンティティ

| エンティティ      | 概要                                                             |
|-------------------|------------------------------------------------------------------|
| **users**         | 認証連携を含むユーザー情報                                      |
| **projects**      | プロジェクト管理情報                                            |
| **task_groups**   | プロジェクト内タスクグループ                                    |
| **tasks**         | タスク (グループに紐づく)                                       |
| **subtasks**      | サブタスク (タスクに紐づく)                                     |
| **ai_messages**   | AI コーチングのチャット履歴 (ユーザー ↔ AI)                     |
| **ai_user_settings** | ユーザーごとのAI設定 (応答スタイル、使用モデル、温度など)   |
| **comments**      | プロジェクトやコミットに対するコメント (拡張オプション)         |

## 3.2 ユースケース

1. **ユーザー登録・認証**  
   - メール/パスワード、あるいは OAuth (GitHub, Google 等)
2. **プロジェクト管理**  
   - 作成・更新・削除・一覧表示
3. **タスク管理**  
   - タスクグループ／タスク／サブタスクのCRUD
4. **AI コーチング**  
   - AIチャットの送受信・履歴管理  
   - タスク分解やモチベーション維持のアドバイスを取得  
   - ユーザーごとの AI設定 (モデルや口調など)
5. **コメント機能 (拡張)**  
   - コミットやプロジェクトにコメントを付けられるスレッド機能
6. **リアルタイム更新**  
   - プロジェクトやタスクの変更を Subscriptions (Supabase Realtime) で通知

---

# 4. 非機能要件

## 4.1 可用性
- 1日1回以上の自動バックアップ  
- 障害時のフェイルオーバー (Supabase もしくは DNS レイヤー)  
- Supabase 側のSLAに従い、可能な範囲でマルチAZ/リージョン活用を検討

## 4.2 セキュリティ
- **RLS** を用いた行レベルアクセス制御  
- **CORS 制限**: フロントエンドのドメインをホワイトリスト化  
- **Rate limiting**: 連続リクエスト制限 (Next.js Middleware or Supabase Edge Functions)  
- **SQLインジェクション対策**: ORM, プリペアドステートメントで担保

## 4.3 パフォーマンス
- 必要なカラムへの**適切なインデックス設計**  
- 高頻度読み取りデータ (例: ユーザーのAI設定) はキャッシュ検討 (Redis 等)  
- 将来的にパーティショニング/シャーディングを見据える

## 4.4 ロギング・モニタリング
- クエリ遅延ログの有効化  
- エラー/操作ログを外部モニタリングサービス (Datadog, Prometheusなど) と連携

## 4.5 運用・運搬
- スキーマ変更ごとに**マイグレーション**を作成し、レビュー＋CIテストを必須化  
- スナップショット取得とロールバック手順を明確化

---

# 5. テーブル定義

以下は初期スキーマの詳細定義です。  
(カラムや型名は運用上の制約やORMフレームワークによって調整可能)

## 5.1 `users` テーブル

| カラム         | 型                                | PK/FK           | 必須 | デフォルト           | 説明                               |
|---------------|-----------------------------------|-----------------|-----:|----------------------|------------------------------------|
| **id**        | UUID                              | PK              |  ○  | `gen_random_uuid()`  | 主キー、Supabase Auth UID 連携      |
| **email**     | VARCHAR(255)                      | UNIQUE          |  ○  |                      | 認証用メールアドレス               |
| **display_name** | VARCHAR(100)                   | —               |  ○  |                      | 表示名 (ユーザー名)                |
| **avatar_url**| VARCHAR(512)                      | —               |  -  |                      | プロフィール画像 URL               |
| **role**      | VARCHAR(20)                       | —               |  ○  | `'user'`             | ロール (例: user/admin)            |
| **created_at**| TIMESTAMPTZ                       | —               |  -  | `now()`              | レコード作成日時                   |
| **updated_at**| TIMESTAMPTZ                       | —               |  -  | `now()`              | 更新トリガー等で自動更新           |

- **インデックス**: `email` (UNIQUE), `role`
- **RLS ポリシー**: ユーザー自身のみ `id` が一致するレコードを読み書き可能、adminは全件

---

## 5.2 `projects` テーブル

| カラム        | 型                | PK/FK          | 必須 | デフォルト           | 説明                          |
|--------------|-------------------|----------------|-----:|----------------------|--------------------------------|
| **id**       | UUID              | PK             |  ○  | `gen_random_uuid()`  | プロジェクトID                |
| **owner_id** | UUID              | FK → users.id  |  ○  |                      | 作成者ユーザーID              |
| **name**     | VARCHAR(255)      | —              |  ○  |                      | プロジェクト名                 |
| **description**| TEXT            | —              |  -  |                      | 詳細説明                      |
| **status**   | VARCHAR(20)       | —              |  ○  | `'active'`           | active/paused/archived         |
| **created_at**| TIMESTAMPTZ      | —              |  -  | `now()`              | 作成日時                      |
| **updated_at**| TIMESTAMPTZ      | —              |  -  | `now()`              | 更新日時                      |

- **インデックス**: `owner_id`, `status`
- **外部キー制約**: `owner_id` → `users(id)` ON DELETE CASCADE
- **RLS ポリシー**: (owner_id = 認証ユーザー) OR (role=admin) の場合のみアクセス許可

---

## 5.3 `task_groups` テーブル

| カラム        | 型                | PK/FK              | 必須 | デフォルト           | 説明                      |
|--------------|-------------------|--------------------|-----:|----------------------|---------------------------|
| **id**       | UUID              | PK                 |  ○  | `gen_random_uuid()`  | タスクグループID         |
| **project_id** | UUID            | FK → projects.id   |  ○  |                      | 所属プロジェクトID       |
| **name**     | VARCHAR(100)      | —                  |  ○  |                      | グループ名               |
| **order_index**| INTEGER         | —                  |  ○  | `0`                  | 表示順                   |
| **created_at**| TIMESTAMPTZ      | —                  |  -  | `now()`              | 作成日時                 |
| **updated_at**| TIMESTAMPTZ      | —                  |  -  | `now()`              | 更新日時                 |

- **インデックス**: `(project_id, order_index)`
- **外部キー制約**: `project_id` → `projects(id)` ON DELETE CASCADE

---

## 5.4 `tasks` テーブル

| カラム        | 型                | PK/FK             | 必須 | デフォルト           | 説明                                       |
|--------------|-------------------|-------------------|-----:|----------------------|--------------------------------------------|
| **id**       | UUID              | PK                |  ○  | `gen_random_uuid()`  | タスクID                                   |
| **group_id** | UUID              | FK → task_groups.id|  ○  |                    | 所属タスクグループID                       |
| **title**    | VARCHAR(255)      | —                 |  ○  |                    | タスクタイトル                             |
| **description**| TEXT            | —                 |  -  |                    | 詳細説明                                   |
| **status**   | VARCHAR(20)       | —                 |  ○  | `'pending'`         | pending/in_progress/completed 等           |
| **due_date** | DATE              | —                 |  -  |                    | 期限日                                     |
| **order_index**| INTEGER         | —                 |  ○  | `0`                 | 表示順                                     |
| **created_at**| TIMESTAMPTZ      | —                 |  -  | `now()`             | 作成日時                                   |
| **updated_at**| TIMESTAMPTZ      | —                 |  -  | `now()`             | 更新日時                                   |

- **インデックス**: `(group_id, order_index)`, `status`
- **外部キー制約**: `group_id` → `task_groups(id)` ON DELETE CASCADE

---

## 5.5 `subtasks` テーブル

| カラム        | 型                | PK/FK             | 必須 | デフォルト           | 説明                          |
|--------------|-------------------|-------------------|-----:|----------------------|--------------------------------|
| **id**       | UUID              | PK                |  ○  | `gen_random_uuid()`  | サブタスクID                   |
| **task_id**  | UUID              | FK → tasks.id     |  ○  |                    | 親タスクID                     |
| **title**    | VARCHAR(255)      | —                 |  ○  |                    | サブタスクタイトル             |
| **is_done**  | BOOLEAN           | —                 |  ○  | `false`            | 完了フラグ                     |
| **order_index**| INTEGER         | —                 |  ○  | `0`                | 表示順                         |
| **created_at**| TIMESTAMPTZ      | —                 |  -  | `now()`            | 作成日時                       |
| **updated_at**| TIMESTAMPTZ      | —                 |  -  | `now()`            | 更新日時                       |

- **インデックス**: `(task_id, order_index)`, `is_done`
- **外部キー制約**: `task_id` → `tasks(id)` ON DELETE CASCADE

---

## 5.6 `ai_messages` テーブル

AIコーチングやチャット対話の履歴を格納。ユーザーが送信したメッセージと、AIからの応答を区別します。  
将来的に**ストリーミング応答**なども考慮し、`response` は十分なサイズの `TEXT` を利用します。

| カラム        | 型                | PK/FK             | 必須 | デフォルト          | 説明                                  |
|--------------|-------------------|-------------------|-----:|---------------------|---------------------------------------|
| **id**       | UUID              | PK                |  ○  | `gen_random_uuid()` | メッセージID                          |
| **project_id**| UUID             | FK → projects.id  |  ○  |                     | どのプロジェクト(ユーザー)に紐づくか   |
| **sender**   | VARCHAR(20)       | —                 |  ○  | `'user'`            | 送信者 (例: user/assistant)           |
| **prompt**   | TEXT              | —                 |  ○  |                     | ユーザー質問や入力内容                |
| **response** | TEXT              | —                 |  -  |                     | AI応答 (ある場合)                     |
| **created_at**| TIMESTAMPTZ      | —                 |  -  | `now()`             | 作成日時                              |

- **インデックス**: `project_id`
- **外部キー制約**: `project_id` → `projects(id)` ON DELETE CASCADE

---

## 5.7 `ai_user_settings` テーブル

ユーザーごとのAIコーチ設定を格納。ユーザー自身の好みや利用プランに応じて、  
モデルや温度(temperature)、キャラクター（口調）などを管理できます。

| カラム          | 型                | PK/FK           | 必須 | デフォルト          | 説明                                                     |
|----------------|-------------------|-----------------|-----:|---------------------|----------------------------------------------------------|
| **user_id**    | UUID              | PK → users.id   |  ○  |                     | ユーザーID (主キー)                                     |
| **model**      | VARCHAR(50)       | —               |  ○  | `'gpt-3.5-turbo'`   | AIモデル指定                                             |
| **temperature**| NUMERIC(3,2)      | —               |  ○  | `0.7`               | 言語モデルの creative 度合 (0〜1.0程度)                  |
| **style**      | VARCHAR(50)       | —               |  -  |                     | 口調・キャラクターなどを示すタグ (例: `friendly` / `strict`) |
| **created_at** | TIMESTAMPTZ       | —               |  -  | `now()`             | レコード作成日時                                        |
| **updated_at** | TIMESTAMPTZ       | —               |  -  | `now()`             | 更新日時                                                |

- **PK**: `user_id` (1対1設定)
- **外部キー制約**: `user_id` → `users(id)` ON DELETE CASCADE
- **RLS ポリシー**: `user_id = auth.uid()` のみ読み書き可能 (admin除く)

---

## 5.8 `comments` テーブル (オプション)

コミットやプロジェクトへのコメントを扱う拡張テーブル。  
タスクやサブタスクにも流用可能な設計にする場合は `target_type` や `target_id` を柔軟に。

| カラム        | 型                 | PK/FK              | 必須 | デフォルト          | 説明                                           |
|--------------|--------------------|--------------------|-----:|---------------------|------------------------------------------------|
| **id**       | UUID               | PK                 |  ○  | `gen_random_uuid()` | コメントID                                     |
| **target_type**| VARCHAR(20)      | —                  |  ○  |                     | コメント対象の種類 (例: 'project', 'commit')   |
| **target_id**| UUID               | —                  |  ○  |                     | 対象リソースのID                               |
| **author_id**| UUID               | FK → users.id      |  ○  |                     | 投稿者ユーザーID                               |
| **content**  | TEXT               | —                  |  ○  |                     | コメント本文                                   |
| **parent_id**| UUID               | FK → comments.id   |  -  |                     | スレッド親コメント (なければルート)            |
| **created_at**| TIMESTAMPTZ       | —                  |  -  | `now()`             | 作成日時                                       |
| **updated_at**| TIMESTAMPTZ       | —                  |  -  | `now()`             | 更新日時                                       |

- **インデックス**: `(target_type, target_id)`, `author_id`
- **外部キー制約**: 
  - `author_id` → `users(id)`,  
  - `parent_id` → `comments(id)` ON DELETE SET NULL

---

# 6. インデックス設計

| テーブル          | インデックス対象カラム                          | 目的                                          |
|-------------------|-----------------------------------------------|-----------------------------------------------|
| **users**         | `email` (UNIQUE), `role`                      | 認証検索、高速フィルタリング                 |
| **projects**      | `owner_id`, `status`                          | 所有者検索、ステータスによる絞り込み         |
| **task_groups**   | `(project_id, order_index)`                   | グループ順序取得                             |
| **tasks**         | `(group_id, order_index)`, `status`           | タスク順序、ステータス別検索                 |
| **subtasks**      | `(task_id, order_index)`, `is_done`           | サブタスク順序、完了フラグ検索               |
| **ai_messages**   | `project_id`                                  | プロジェクト別のチャット履歴検索             |
| **ai_user_settings** | `user_id`                                  | ユーザーごとのAI設定アクセス                |
| **comments**      | `(target_type, target_id)`, `author_id`       | コメント対象検索、投稿者検索                 |

---

# 7. マイグレーション管理

- **ディレクトリ**: `supabase/migrations/` などに配置  
- **ツール**: Supabase CLI, Prisma Migrate 等  
- バージョン毎に SQL / スクリプトファイルを作成し、**既存のマイグレーションファイルは編集しない**  
- CI パイプラインで自動テストし、ステージング→本番の順で適用

---

# 8. RLS ポリシー定義例

```sql
-- 例: users テーブル
-- ユーザー本人のみ自分のレコードを閲覧・更新可能 (admin は例外)
CREATE POLICY "Users must be owner" ON public.users
  FOR ALL USING ( auth.uid() = id OR auth.role() = 'admin' );

-- projects テーブル
-- オーナー or admin がフルアクセス可能
CREATE POLICY "Projects select" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR auth.role() = 'admin'
  );
CREATE POLICY "Projects modify" ON public.projects
  FOR INSERT, UPDATE, DELETE USING (
    owner_id = auth.uid() OR auth.role() = 'admin'
  );

-- ai_messages テーブル
-- 同じプロジェクトに属するユーザーのみ閲覧可能 (owner_id チェックなど)
CREATE POLICY "AI messages select" ON public.ai_messages
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.role() = 'admin'
    )
  );
```

> **実際の条件**は要件に応じて調整し、プロジェクト共同メンバー等を考慮したポリシー設定を行う。

---

# 9. 将来拡張

1. **通知機能**  
   - `notifications` テーブルを追加し、期限切れやAIアドバイスをトリガーとした通知を管理
2. **外部連携**  
   - GitHub / GitLab とのCI連携情報を格納する拡張テーブル (コミット⇔タスクの自動リンクなど)
3. **分析用テーブル**  
   - ユーザーのタスク完了率やAIコーチ利用頻度を集計する専用テーブルまたはビュー
4. **リアルタイム機能強化**  
   - Supabase Realtime でタスク/コメントの変更を自動配信

---

# 10. 参考資料

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL Official Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **Prisma Migrate**: [https://www.prisma.io/docs/concepts/components/prisma-migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- **OpenAI API Docs**: [https://platform.openai.com/docs/introduction](https://platform.openai.com/docs/introduction)
- **Vercel AI SDK**: [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)

```

---

上記スキーマは、**Supabase** の **Row Level Security**（RLS）や認証機構を活用し、**Next.js** との連携でAI機能を含むプロダクトを運用する想定です。  
必要に応じて **マイグレーション** を段階的に適用しながら、AIコーチングやタスク管理の拡張にも対応できる柔軟な構成を目指します。