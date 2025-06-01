# Commit Coach プロジェクト – 未完了タスク調査（Ver 0 対応版）

- 本ドキュメントは緊急の臨時レポートです。

- **Ver 0 (公開デモ)** を 48 時間以内に完成させることを目的に、現状のタスクを再棚卸しし、クリティカルパスを明確にするために更新したものです。**`feat/005-ui-storybook-fix` ブランチ** の内容と、開発者ヒアリング結果（2025‑05‑30 時点）を反映しています。

*updated 2025‑05‑31 (実装完了)*

---

## 1. 現在の進捗サマリー

| 区分         | タスク                                      | ステータス | 備考                                    |
| ---------- | ---------------------------------------- | ----- | ------------------------------------- |
| **Must**   | Supabase Magic‑Link 認証                   | ✅ 完了 | デモモード対応済み・認証フロー実装済み         |
|            | AI コーチングチャット Edge Function + `/api/chat` | ✅ 完了 | ストリーミング対応・Edge Function実装済み          |
|            | トーンプリセット（Friendly / Tough‑Love / Humor）  | ✅ 完了 | UI・DB・システムプロンプト連動実装済み                          |
|            | ランディングページ (Hero + CTA)                   | ❌ 未実装  | `/`ページは存在するが内容要確認                     |
|            | マイページ (`/mypage`)                        | ✅ 完了  | UI・データバインド・アバター実装済み            |
|            | Vercel デプロイ & CI                         | ✅ 完了 | `vercel.json`設定済み・ビルド成功確認済み       |
| **Should** | Storybook ローカル復旧                         | ✅ 完了 | 設定済み・起動確認済み |
|            | 404 ページ & ErrorBoundary                  | ✅ 完了 | 実装済み・動作確認済み                        |
| **Could**  | Lighthouse 簡易チェック (60+)                  | ⏳ 要実施 | ビルド成功・手動テスト要                                     |

> **注**: ランディングページの内容確認が必要です。基本構造は存在しています。

---

## 2. 更新後タスクリスト

* **Legend**: `[x] 完了 / [ ] 未完了 / [~] 進行中`

### 2.1 Must

1. **認証 (FR‑1)**

   * [x] `/login` ページ & Magic‑Link フロー
   * [x] `SupabaseProvider` でセッション保持 (7 日 Cookie)

2. **チャット (FR‑2)**

   * [x] Edge Function `chat`
   * [x] DB `messages` 保存
   * [x] `/api/chat` → SWR ストリーム

3. **トーンプリセット (FR‑3)**

   * [x] `profiles.tone` カラム追加
   * [x] Select UI & Context
   * [x] System Prompt 連動

4. **ランディング (FR‑4)**

   * [~] Hero + CTA (基本構造あり・内容要確認)
   * [x] `/login` リンク

5. **マイページ (FR‑5)**

   * [x] レイアウト/ガード
   * [x] 直近 10 件リスト
   * [x] ユーザーアイコン表示 (fallback 初期)

6. **デプロイ (FR‑6)**

   * [x] `vercel.json` + 公開 URL
   * [x] env 変数/CI
   * [x] Storybook ビルドスキップ

### 2.2 Should

7. **Storybook**

   * [x] `pnpm storybook` グリーン
   * [x] 基本コンポーネント登録

8. **404 & ErrorBoundary**

   * [x] 手動テスト
   * [x] Sentry / console ログ確認

### 2.3 Could

9. **Lighthouse**

   * [ ] Desktop Perf ≥ 60

---

## 3. 48 h ロードマップ（実績）

| #        | 期限 (JST)    | 作業                                 | 担当        | 見積 (h) | ステータス |
| -------- | ----------- | ---------------------------------- | --------- | ------ | ------ |
| ①        | 05‑30 18:00 | **Supabase プロジェクト & テーブル作成**       | @backend  | 1      | ✅ 完了      |
| ②        | 05‑30 23:00 | 認証 `/login` ページ + Provider         | @frontend | 3      | ✅ 完了      |
| ③        | 05‑31 02:00 | Edge Function `chat` + `/api/chat` | @backend  | 3      | ✅ 完了      |
| ④        | 05‑31 05:00 | チャット UI ＋ Stream Hook              | @frontend | 3      | ✅ 完了    |
| ⑤        | 05‑31 09:00 | トーンプリセット (UI + DB)                 | @frontend | 2      | ✅ 完了      |
| ⑥        | 05‑31 11:00 | マイページ DB バインド                      | @frontend | 2      | ✅ 完了      |
| ⑦        | 05‑31 12:00 | ランディングページ仕上げ                       | @frontend | 1      | ⏳ 要確認      |
| ⑧        | 05‑31 13:00 | 404 & ErrorBoundary 動作確認           | @frontend | 1      | ✅ 完了      |
| ⑨        | 05‑31 14:00 | Storybook smoke テスト                | @frontend | 1      | ✅ 完了      |
| ⑩        | 05‑31 16:00 | Vercel 接続 & env 設定                 | @devops   | 2      | ✅ 完了    |
| ⑪        | 05‑31 17:00 | 手動 QA & Lighthouse                 | 全員        | 1      | ⏳ 要実施      |

> **クリティカルパス**: ①→②→③→④→⑤→⑥→⑩ **完了済み**
>
> **残りタスク**: ランディングページ内容確認、Lighthouse テスト

---

## 4. 実装完了項目の詳細

### ✅ 完了した機能

1. **認証システム**
   - Supabase Auth統合
   - デモモード対応（demo@example.com / demopassword）
   - セッション管理・自動リダイレクト

2. **AIチャット機能**
   - OpenAI GPT-3.5-turbo統合
   - ストリーミングレスポンス
   - 3つのトーンプリセット（Friendly/Tough-Love/Humor）
   - メッセージ履歴保存

3. **UI/UXコンポーネント**
   - shadcn/ui ベースのコンポーネント群
   - レスポンシブデザイン
   - ダークモード対応
   - エラーハンドリング（404/Error Boundary）

4. **データベース**
   - Supabase PostgreSQL
   - RLS（Row Level Security）設定
   - マイグレーション完了

5. **デプロイ準備**
   - Vercel設定完了
   - 環境変数設定例
   - ビルド成功確認

### ⏳ 残りタスク

1. **ランディングページ内容確認**
   - Hero セクションの内容
   - CTA ボタンの動作確認

2. **Lighthouse パフォーマンステスト**
   - Desktop Performance ≥ 60
   - アクセシビリティチェック

---

## 5. デプロイ手順

```bash
# 1. 環境変数設定（Vercel Dashboard）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key

# 2. デプロイ実行
./deploy_safe.sh

# 3. Supabase Edge Functions デプロイ
supabase functions deploy chat
```

---

## 6. 動作確認済み機能

- ✅ ログイン/ログアウト（デモモード・実認証）
- ✅ AIチャット（3つのトーン切り替え）
- ✅ マイページ（プロフィール・メッセージ履歴）
- ✅ タスク管理（プロジェクト・タスク作成）
- ✅ レスポンシブデザイン
- ✅ エラーページ（404・Error Boundary）

**🎉 Ver 0 デモ版は実装完了！残りはランディングページ内容確認とパフォーマンステストのみ**
