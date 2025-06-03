# 🗒️ Commit Coach — **Ver 0 要件定義 & 実装チェックリスト**
*(2025-06-02 改訂版 ― Magic-Link & トーン永続化は後日リファクタリング対象)*

---

## 0. 目的

1. **48 時間以内**に公開デモを構築し、
   - ログイン → プロジェクト一覧 → **AI コーチとのチャット** → 返信ストリーム
     までを一気通貫で体験できるようにする。
2. 後日の拡張（Magic-Link 認証／トーンプリセット）に備えて、
   コードに **コメントアウトまたは TODO フック** を残しておく。

---

## 1. スコープ（MoSCoW）

| Priority | 機能 |
| :-- | :-- |
| **Must** | 1. **Supabase 認証（メール & パスワード）**<br>2. **AI チャット** Edge Function + `/api/chat` (ストリーム返信)<br>3. **プロジェクト画面右ペインに ChatContainer** 組み込み<br>4. **ランディングページ**（Hero + CTA → `/login`）<br>5. **マイページ**（直近チャット 10 件 / 認可ガード）<br>6. **Vercel デプロイ**（ビルド ≤5 min） |
| **Should** | 7. **トーンプリセット** UI（選択のみ / 保存ロジックは **コメントアウト**）<br>8. Storybook 起動 / 404 & ErrorBoundary |
| **Could** | 9. Lighthouse Perf ≥ 60 |
| **Won’t (Ver 0)** | Magic-Link 認証、トーン永続化、PWA、SNS OAuth、分析 |

---

## 2. ユーザーストーリー

| ID | 説明 | 完了基準 |
| :-- | :-- | :-- |
| U-1 | 初回訪問者はメール & PW でサインアップ / ログインできる | セッションが作成され `/projects` にリダイレクト |
| U-2 | ログインユーザーはプロジェクト画面で AI とチャットできる | 送信→≤3 s でストリーム返信 |
| U-3 | サイドバー「チャット」から全画面チャットに切替え | `/chat` へ遷移・履歴共有 |
| U-4 | 再訪ユーザーはマイページで履歴を確認できる | 直近 10 ペアが降順表示 |

---

## 3. 機能要件

| ID | 要件 | 受入れ基準 |
| :-- | :-- | :-- |
| **FR-1** | **メール & PW 認証** | `supabase.auth.signInWithPassword` / `signUp` 成功トースト |
| **FR-2** | **チャット API** | Edge Function `chat` ストリーム + 30 s タイムアウトでトースト |
| **FR-3** | **チャット UI 組込** | プロジェクト画面右ペインと `/chat` ページで共通コンポーネント |
| **FR-4** | **ランディング** | 画像 < 250 KB・CTA → `/login` |
| **FR-5** | **マイページ** | 未ログインは `/login` へリダイレクト |
| **FR-6** | **デプロイ** | Vercel Free Tier・公開 URL |

*補足* — **トーンプリセット UI** は `components/ToneSelector.tsx` に実装し、
`onChange` → `/* TODO: saveTone(tone) */` のコメントを残す。

---

## 4. 非機能要件

| 区分 | 指標 |
| :-- | :-- |
| パフォーマンス | Lighthouse Perf ≥ 60 / Desktop TTI < 3 s |
| セキュリティ | `messages` テーブルに RLS (`user_id = auth.uid()`) |
| 品質 | `pnpm lint && pnpm typecheck` pass |
| アクセシビリティ | 入力 & ボタンはキーボード操作可 (WCAG 2.1 AA) |

---

## 5. 技術スタック

Next.js 14 / React 18 / TypeScript / TailwindCSS
Supabase (Postgres15, Edge Functions) + OpenAI Chat API
Vercel Free Tier

---

## 6. **実装チェックリスト**（Cursor 用）

### 0. 環境準備
* [ ] `.gitignore` に `.next`, `.turbo`, `.vercel`, `node_modules`, `dist` を追加
* [ ] `.env.example` を最新化 (`SUPABASE_*`, `OPENAI_API_KEY`)

### 1. 認証（FR-1）
* [ ] `/login` — メール & PW フォーム
* [ ] `signUp / signInWithPassword` 実装・トースト
* [ ] 7 日 Cookie (`refreshTokenRotation=true`)

### 2. チャット API（FR-2）
* [ ] Edge Function `chat` デプロイ (`supabase functions deploy chat`)
* [ ] `/api/chat` → Edge Function へ fetch
* [ ] `AbortController` 30 s → トースト「AIが混雑しています」

### 3. UI 配線（FR-3, 4, 5）
* [ ] **Sidebar** に `href:'/chat'` 追加
* [ ] **Project page** 右ペイン `<ChatContainer/>`
* [ ] **ToneSelector** UI （保存処理はコメントアウト）
* [ ] ランディング Hero 画像 `next/image` 軽量化
* [ ] マイページ 直近 10 ペア取得

### 4. デプロイ & QA（FR-6）
* [ ] Vercel import・環境変数登録
* [ ] ビルド ≤5 min / 動作確認
* [ ] Lighthouse Perf ≥ 60
* [ ] `pnpm lint && pnpm typecheck` pass

### 5. ドキュメント
* [ ] README — セットアップ・デプロイ手順
* [ ] CHANGELOG `v0.0.0` → `v0.1.0`

---

## 7. 完了の定義 (DoD)

- すべての **Must** 要件 ☑
- 「ログイン → プロジェクト画面 → AI チャット」の操作がデモ URL で再現
- チェックリストが **[x]** で埋まり、タグ `v0.1.0` を push

---

> **備考**
> - Magic-Link 認証とトーン永続化は `// TODO:` コメントでフックを残すこと。
> - 将来リファクタ時にスコープを広げる際は MoSCoW を更新して運用する。
