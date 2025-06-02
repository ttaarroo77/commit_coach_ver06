# 🗂️ Commit Coach — Ver 0 **Revised Requirements & Implementation Checklist**
*Cursor にそのまま貼り付けて使える指示書*
*更新: 2025-06-02*

---

## 0. 目的

48 時間以内に「**クリック可能な公開デモ**」を構築し、AI コーチによる習慣形成体験の**核心フロー**を実現する。
本指示書は *Ver 0* の **要件定義** と **実装ステップ** を統合し、Cursor がそのままタスク駆動で実装できる粒度に落とし込んだもの。

---

## 1. MoSCoW スコープ

| Priority | Epic / Feature |
| :-- | :-- |
| **Must** | 1. Supabase **Magic-Link** 認証（メールのみ）<br>2. **AI コーチングチャット** Edge Function + `/api/chat`<br>3. **トーンプリセット**（Friendly / Tough-Love / Humor）& 選択値の永続化<br>4. **ランディングページ**（Hero + CTA）<br>5. **マイページ**（直近チャット10件 + 認可ガード）<br>6. **Vercel デプロイ**（ビルド ≤5 min） |
| **Should** | 7. Storybook ローカル起動<br>8. 404 ページ & Error Boundary |
| **Could** | 9. Lighthouse Perf ≥ 60 |
| **Won’t (Ver 0)** | Todo 管理、リマインダー、PWA、分析、SNS OAuth、ダークモード |

---

## 2. ユーザーストーリー

| ID | Story | 完了条件 (BDD) |
| :-- | :-- | :-- |
| U-1 | **初回訪問者**はメールを入力し Magic-Link でログインできる | GIVEN 未登録のメール, WHEN 送信, THEN 60 秒以内にリンク受信しクリックで自動ログイン |
| U-2 | **ログインユーザー**は AI コーチとチャットできる | GIVEN `/chat`, WHEN メッセージ送信, THEN ストリームで返信が返り会話が継続 |
| U-3 | **ユーザー**はトーンを切り替えられる | WHEN Tone Selector で変更, THEN 即座に AI 口調が変わり `profiles.tone` へ保存 |
| U-4 | **再訪ユーザー**はマイページで会話を再開できる | GIVEN `/mypage`, WHEN アクセス, THEN 直近10件のペアを降順表示 |

---

## 3. 機能要件

| ID | 要件 | 受け入れ基準 |
| :-- | :-- | :-- |
| **FR-1** | **Magic-Link 認証** | (a) `/login` はメール1フィールドのみ<br>(b) `supabase.auth.signInWithOtp` で送信 (`shouldCreateUser: true`, `emailRedirectTo=/login/callback`)<br>(c) `/login/callback` でセッションクッキー 7 日発行し `/chat` へ |
| **FR-2** | **チャット API** | (a) Edge Function `chat` が OpenAI ストリーム & `messages` 挿入<br>(b) クライアントは `AbortController` で **30 s タイムアウト**を検知しトースト表示 |
| **FR-3** | **トーンプリセット** | (a) Tone Selector (Friendly / Tough-Love / Humor) UI<br>(b) 選択値を system プロンプトへ注入<br>(c) `profiles.tone` へ `upsert` 保存（再訪時デフォルトに） |
| **FR-4** | **ランディング** | Hero＋CTA（/login リンク）画像は `next/image` で < 250 KB |
| **FR-5** | **マイページ** | (a) 未ログインなら `/login` へリダイレクト<br>(b) `messages` から user_id で直近10ペア取得・降順表示 |
| **FR-6** | **デプロイ** | (a) Vercel Free Tier で公開 URL<br>(b) `.env.*` 変数を README に記載<br>(c) ビルド ≤ 5 min |

---

## 4. 非機能要件

| Category | 指標 |
| :-- | :-- |
| パフォーマンス | Desktop **TTI < 3 s**（Lighthouse Perf ≥ 60） |
| 信頼性 | 稼働率 95 % / チャット503時にトースト "Service busy" |
| セキュリティ | Supabase **RLS** (`user_id = auth.uid()`) 全テーブル |
| アクセシビリティ | チャット入力 & 送信ボタンがキーボード操作可能 (WCAG 2.1 AA) |
| 保守性 | `pnpm lint && pnpm typecheck` pass |

---

## 5. 技術スタック

| Layer | Stack | 備考 |
| :-- | :-- | :-- |
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS | App Router |
| AI | OpenAI Chat API (gpt-4o or 3.5-turbo, budget ≤ 2 USD) |  |
| Backend | Supabase (Postgres15, Edge Functions) | pgvector 不使用 |
| Infra | Vercel Free | |

---

## 6. 実装ステップ別チェックリスト

チェック欄 **\[ ] / \[x]** を Cursor が自動置換する想定。
親タスクは子タスク完了で自然に Close する。

### 0. 初期クリーンアップ
* [x] `.gitignore` に `.next`, `.turbo`, `.vercel`, `node_modules`, `dist`, `coverage`, `logs` を追加
* [ ] `git rm -r --cached` で不要ファイル履歴を削除

### 1. Magic-Link 認証 (FR-1)
* [x] `/login` ページを 1-input フォームに簡素化
* [x] `signInWithOtp({ email, options... })` 実装
* [x] 成功トースト「Link sent!」; 失敗トースト表示
* [x] `/login/callback` ページ作成 → セッション取得 → `/chat` リダイレクト
* [x] Cookie Max-Age 7 days 設定

### 2. チャット Edge Function & API (FR-2)
* [x] Edge Function `chat` — Zod でバリデーション, OpenAI stream, 504 on timeout
* [x] フロント `/api/chat` ラッパー + SWR/React-Query
* [x] `AbortController` 30 s timeout → destruct toast 「AI busy, try later」

### 3. トーンプリセット (FR-3)
* [x] `ToneSelector` コンポーネント (react-aria or native `<select>`)
* [x] `setTone(tone)` **async** 関数で `profiles` upsert
* [x] 再訪時 `getProfile()` でデフォルトトーン設定
* [x] Chat system prompt 内に tone を挿入

### 4. UI / Pages
* [ ] **Landing** `app/page.tsx` — Hero + CTA（`next/image` & webp/avif）
* [x] **Chat** — `MessageList`, `ChatInput`, tone context
* [ ] **MyPage** — ガード付きレイアウト, 直近10ペア取得・表示
* [ ] 404 page (`not-found.tsx`), global Error Boundary (`app/error.tsx`)

### 5. Storybook & Dev-XP
* [ ] `.storybook/` config 修正 & `pnpm storybook` 起動確認
* [ ] 主要 UI: `Button`, `MessageCard`, `ToneSelector` stories 追加

### 6. Lighthouse & Perf
* [ ] Landing で Perf ≥ 60（画像圧縮・`priority` 属性）
* [ ] Accessibility ≥ 90（aria-label, focus ring）

### 7. Vercel デプロイ (FR-6)
* [ ] GitHub → Vercel import, env 変数登録
* [ ] `VERCEL_SKIP_BUILD=1` を Storybook CI に設定
* [ ] ビルド ≤ 5 min, 公開 URL 確認
* [ ] README に **Quick Start**, `.env` 説明, demo URL 追記

### 8. QA & Close-out
* [ ] `pnpm lint && pnpm typecheck` pass
* [ ] 手動 QA: Desktop / Mobile, tone 保存確認
* [ ] Lighthouse report スクショを `/docs/metrics` に保存
* [ ] Tag `v0.0.1` & merge → main

---

## 7. Glossary

| Term | Definition |
| :-- | :-- |
| **Tone Preset** | AI コーチの人格を切り替える system プロンプト集合 |
| **Magic-Link** | Supabase が発行するワンタイム JWT 含むパスワードレスメール |
| **Edge Function** | Supabase のグローバルサーバレスファンクション。本 Ver では `/chat` プロキシのみ使用 |

---

*以上 — Cursor 用 Ver 0 指示書 完成*
