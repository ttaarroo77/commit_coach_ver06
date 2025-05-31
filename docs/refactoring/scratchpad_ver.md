# Commit Coach プロジェクト – 未完了タスク調査（Ver 0 対応版）

- 本ドキュメントは緊急の臨時レポートです。

- **Ver 0 (公開デモ)** を 48 時間以内に完成させることを目的に、現状のタスクを再棚卸しし、クリティカルパスを明確にするために更新したものです。**`feat/005-ui-storybook-fix` ブランチ** の内容と、開発者ヒアリング結果（2025‑05‑30 時点）を反映しています。

*generated 2025‑05‑30*

---

## 1. 現在の進捗サマリー

| 区分         | タスク                                      | ステータス | 備考                                    |
| ---------- | ---------------------------------------- | ----- | ------------------------------------- |
| **Must**   | Supabase Magic‑Link 認証                   | ❌ 未着手 | `/login` ページのみ存在 – API 呼び出しなし         |
|            | AI コーチングチャット Edge Function + `/api/chat` | ❌ 未着手 | `supabase/functions` ディレクトリ空          |
|            | トーンプリセット（Friendly / Tough‑Love / Humor）  | ❌ 未着手 | UI・DB ともに未実装                          |
|            | ランディングページ (Hero + CTA)                   | ？ 不明  | ソース未確認 – 状況要ヒアリング                     |
|            | マイページ (`/mypage`)                        | ⏳ 途中  | UI あり / データバインド不完全・アバター未実装            |
|            | Vercel デプロイ & CI                         | ❌ 未着手 | `vercel.json` 不在・CI workflow なし       |
| **Should** | Storybook ローカル復旧                         | ❌ 未着手 | import エラーは解決済みだが `pnpm storybook` 失敗 |
|            | 404 ページ & ErrorBoundary                  | ⏳ 要検証 | 実装はあるが手動テスト未実施                        |
| **Could**  | Lighthouse 簡易チェック (60+)                  | ❌ 未着手 | –                                     |

> **注**: ランディングページの実装有無がリポジトリから判別できません。確認をお願いします。

---

## 2. 更新後タスクリスト

* **Legend**: `[x] 完了 / [ ] 未完了 / [~] 進行中`

### 2.1 Must

1. **認証 (FR‑1)**

   * [ ] `/login` ページ & Magic‑Link フロー
   * [ ] `SupabaseProvider` でセッション保持 (7 日 Cookie)

2. **チャット (FR‑2)**

   * [ ] Edge Function `chat`
   * [ ] DB `messages` 保存
   * [ ] `/api/chat` → SWR ストリーム

3. **トーンプリセット (FR‑3)**

   * [ ] `profiles.tone` カラム追加
   * [ ] Select UI & Context
   * [ ] System Prompt 連動

4. **ランディング (FR‑4)**

   * [ ] Hero + CTA
   * [ ] `/login` リンク

5. **マイページ (FR‑5)**

   * \[\~] レイアウト/ガード
   * [ ] 直近 10 件リスト
   * [ ] ユーザーアイコン表示 (fallback 初期)

6. **デプロイ (FR‑6)**

   * [ ] `vercel.json` + 公開 URL
   * [ ] env 変数/CI
   * [ ] Storybook ビルドスキップ

### 2.2 Should

7. **Storybook**

   * [ ] `pnpm storybook` グリーン
   * [ ] 基本コンポーネント登録

8. **404 & ErrorBoundary**

   * [ ] 手動テスト
   * [ ] Sentry / console ログ確認

### 2.3 Could

9. **Lighthouse**

   * [ ] Desktop Perf ≥ 60

---

## 3. 48 h ロードマップ（提案）

| #        | 期限 (JST)    | 作業                                 | 担当        | 見積 (h) | ブロック条件 |
| -------- | ----------- | ---------------------------------- | --------- | ------ | ------ |
| ①        | 05‑30 18:00 | **Supabase プロジェクト & テーブル作成**       | @backend  | 1      | –      |
| ②        | 05‑30 23:00 | 認証 `/login` ページ + Provider         | @frontend | 3      | ①      |
| ③        | 05‑31 02:00 | Edge Function `chat` + `/api/chat` | @backend  | 3      | ①      |
| ④        | 05‑31 05:00 | チャット UI ＋ Stream Hook              | @frontend | 3      | ② ③    |
| ⑤        | 05‑31 09:00 | トーンプリセット (UI + DB)                 | @frontend | 2      | ④      |
| ⑥        | 05‑31 11:00 | マイページ DB バインド                      | @frontend | 2      | ④      |
| ⑦        | 05‑31 12:00 | ランディングページ仕上げ                       | @frontend | 1      | –      |
| ⑧        | 05‑31 13:00 | 404 & ErrorBoundary 動作確認           | @frontend | 1      | –      |
| ⑨        | 05‑31 14:00 | Storybook smoke テスト                | @frontend | 1      | –      |
| ⑩        | 05‑31 16:00 | Vercel 接続 & env 設定                 | @devops   | 2      | ②‑⑦    |
| ⑪        | 05‑31 17:00 | 手動 QA & Lighthouse                 | 全員        | 1      | ⑩      |
| **バッファ** | 05‑31 18:00 | 予備                                 | –         | 1      | –      |

> **クリティカルパス**: ①→②→③→④→⑤→⑥→⑩
> 遅延リスクがある場合は **トーンプリセット** と **Storybook** を後回しにしてもデモは成立します。

---

## 4. 作業ガイドライン

1. **小 PR & 早レビュー** — 200 LoC 以下で区切り、main に squash‑merge。
2. **`.env.local.example` 同期** — 変更多いので PR 毎に最新化。
3. **RLS 試験** — Supabase SQL エディタで `auth.uid()` チェックを必ず実行。
4. **OpenAI 予算** — `gpt‑3.5‑turbo` をデフォルト、`gpt‑4o` は `X‑-Client-Testing: true` ヘッダ時のみ。
5. **Lint/Typecheck gate** — `pnpm lint && pnpm typecheck && pnpm test` を pre‑push hook に。

---

## 5. 未確定事項（要返信）

| ID  | 質問                                   | 必要タイミング     |
| --- | ------------------------------------ | ----------- |
| Q‑1 | **ランディングページの進捗**を教えてください。存在する場合はパスも。 | 05‑30 15:00 |
| Q‑2 | **Vercel** で確定して良い？（Netlify 併用可能性）   | 05‑30 18:00 |
| Q‑3 | OpenAI **API Key** を共有できるタイミングは？     | 05‑30 20:00 |

---

このドキュメントを **Windsurf のバックログボード**に貼り付ければ、そのままチェックリストとして利用できます。
ご確認のうえ、質問 (Q‑1〜Q‑3) への回答と担当アサインだけご共有ください。
