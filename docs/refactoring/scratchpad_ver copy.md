# Chat機能 実装方針ドキュメント
_— commit_coach_ver04 / temp-branch_

- 概要：コーチングそのものに関する実装についての議論まとめ

## 0. なぜまだ実装されていないのか
| 観測ポイント | 現状 | 影響 |
|--------------|------|------|
| **UI** | `components/AICoachSidebar.tsx` に “ここにコーチングメッセージを表示” とコメントのみ。チャット画面を描画する JSX が無い | 画面に入力欄も履歴も出ない |
| **API** | `apps/backend` 配下に `/api/chat` や OpenAI 呼び出しロジックが存在しない | サーバーへ送る経路が無い |
| **DB / Prisma** | `schema.prisma` に `Message` / `Conversation` モデルが未定義 | メッセージを永続化できない |
| **状態管理** | `useChat()` などのカスタム Hook が未実装 | 送信・受信フローを React 側で扱えない |

> **結論**: UI / API / DB / State の 4 層すべてが“骨組みだけ”の状態。まずはデータモデルと API を決めてから流れを縦に貫通させるのが最短。

---

## 1. 要件定義

### 1.1 機能要件
| ID | 項目 | 詳細 |
|----|------|------|
| FR-1 | **ユーザー送信** | プロジェクト単位で質問を送信できる |
| FR-2 | **AI 返信** | OpenAI ChatCompletion (gpt-4o) を呼び出し、ストリームで返す |
| FR-3 | **履歴保持** | 会話を `messages` テーブルに保存し、プロジェクトをまたいで参照可能 |
| FR-4 | **コンテキスト注入** | 送信時に該当プロジェクトのタスクツリーを system プロンプトへ自動付与 |
| FR-5 | **リアルタイム更新** | 返信を逐次描画 (SSE もしくは Fetch-stream) |
| FR-6 | **再生成／停止** | 途中でストップ & “Regenerate” を提供 |

### 1.2 非機能要件
* **性能**: 95％ の応答を 3 秒以内に最初の token 表示
* **セキュリティ**: OpenAI API Key を Vercel/ .env に格納。ログに漏らさない
* **スケーラビリティ**: 1 チャットあたり 3 MB 以内に履歴を要約 (token 上限対策)
* **保守性**: 共通 `lib/ai.ts` にモデル呼び出しラッパーを集約

---

## 2. システム設計

### 2.1 ER 図（新規）
```

Project 1───∞ Conversation 1───∞ Message

````
| テーブル | 主な列 |
|----------|--------|
| **Project** | id (PK), title, … |
| **Conversation** | id (PK), projectId (FK), createdAt |
| **Message** | id (PK), convId (FK), role (`user` / `assistant` / `system`), content (text), createdAt |

### 2.2 API エンドポイント
| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/chat` | `{ projectId, conversationId?, message }` を受け取り、<br>DB 保存 → OpenAI 呼び出し → Stream 返信 |
| GET | `/api/chat/:conversationId` | 既存会話の履歴を返す |

*実装例*（Edge Runtime, streaming）
```ts
export const runtime = 'edge';
export async function POST(req: Request) {
  const { projectId, conversationId, message } = await req.json();
  // ① DB 保存 → ② OpenAI.stream() → ③ push with ReadableStream
}
````

### 2.3 クライアント構成

```
AICoachSidebar
 ├─ ChatWindow  … message list (auto-scroll)
 ├─ ChatInput   … textarea + SendButton
 └─ useChat()   … zustand or React-Query for state
```

---

## 3. 実装ステップ

| #  | タスク                                            | ファイル or コマンド                                       |
| -- | ---------------------------------------------- | -------------------------------------------------- |
| 1  | **DB マイグレーション** – `Message`, `Conversation` 追加 | `prisma/schema.prisma` → `pnpm prisma migrate dev` |
| 2  | **API ルート新設** – streaming POST handler         | `apps/backend/src/app/api/chat/route.ts`           |
| 3  | **OpenAI ラッパー** – 温度や最大 token を共通化             | `libs/openai.ts`                                   |
| 4  | **useChat Hook** – 送信, 受信, ローディング管理            | `apps/frontend/hooks/use-chat.ts`                  |
| 5  | **Chat UI** – `<ChatWindow>` と `<ChatInput>`   | `apps/frontend/components/chat/`                   |
| 6  | **Sidebar 組込み** – `AICoachSidebar.tsx` 差し替え    | 同上                                                 |
| 7  | **コンテキスト注入** – `getProjectPrompt(projectId)`   | `libs/prompts.ts`                                  |
| 8  | **履歴ローディング** – ページ遷移時に GET 取得                  | `useEffect` in `AICoachSidebar`                    |
| 9  | **テスト** – jest + msw で API モック                 | `apps/backend/__tests__/chat.test.ts`              |
| 10 | **デプロイ** – Vercel 環境変数 `OPENAI_API_KEY` 設定     | Vercel Dashboard                                   |

---

## 4. 参考実装パターン

* **vercel/ai** の `streamText()` ヘルパー → POC に最適
* **next-auth** を導入済みなら `session.user.id` を system プロンプトへ
* **LangChainJS ChatOpenAI** を使う場合、Memory = PrismaMemory + Buffer

---

## 5. 次のアクションチェックリスト

* [x] `Message` / `Conversation` モデルを追加して migrate
* [x] `/api/chat` POST で Skeleton Response (200 OK) が返ることを確認
* [x] `useChat` でローカル echo → UI が更新されることを確認
* [x] OpenAI のストリームが textarea に逐次反映されることを確認
* [x] プロジェクトごとのタスク概要が system プロンプトに渡ることを確認
* [x] 履歴がリロード後も残っていることを確認
* [x] Rate-limit (1 req/sec) ミドルウェアを挟む
* [x] README に “Chat enabled 🎉” を追記

---

### Appendix: 推奨ディレクトリ (after refactor)

```
apps/
 ├─ backend/
 │   └─ src/app/api/chat/route.ts
 ├─ frontend/
 │   ├─ components/chat/
 │   │   ├─ ChatWindow.tsx
 │   │   └─ ChatInput.tsx
 │   └─ hooks/use-chat.ts
 └─ lib/
     ├─ openai.ts
     ├─ prompts.ts
     └─ prisma.ts
```

---

**以上** – これを `docs/specs/chat_feature.md` として winds⛵surf に貼れば、そのまま実装タスクリストとして使えます。

```
::contentReference[oaicite:0]{index=0}
```
