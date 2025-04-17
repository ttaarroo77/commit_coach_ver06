---
name: "docs/overview_0/development_flow.md"
title: "開発フロー概要 (Development Flow)"
description: "[コミットコーチ] - ステップ別の開発フロー (合計200ステップ以上)"
---

# 開発手順書 (詳細版) - AI駆動開発対応

本手順書は、**コミットコーチ**における **フロントエンド** と **バックエンド** の開発フローを、それぞれ 100 ステップ以上、合計 200 ステップ以上に分割して解説します。  
**Next.js + React** ベースのフロントエンドと **Supabase/PostgreSQL** ＋ **Node.js** (Express/Nest.js 等) ベースのバックエンドを想定し、**AI駆動開発**での効率化手法を随所に取り入れています。

> **ポイント**  
> - フロントとバックエンドは **並行開発** 可能  
> - **AI駆動開発**: Cursor, ClaudeなどのAIツール、cursorrules、Composer(段階的コード生成)を活用  
> - チームの実状に合わせてステップを **追加／削除／順番入れ替え** してもOK

---

## 1. 前提・共通作業

### 1.1. 初期環境準備 (共通)

- [ ] **Node.js** / npm (または yarn, pnpm) のインストール  
- [ ] **Git** の初期設定（`git init` または既存リポジトリをクローン）  
- [ ] **.gitignore** に `node_modules` やビルド生成物など除外設定  
- [ ] **エディタ / IDE** (Cursor, VSCode等) をセットアップ
  - ESLint / Prettier のプラグイン  
  - **Cursor** なら AIモデル設定 (Claude 3.5 など)
  - **cursorrules** の初期導入
- [ ] **AIモデル連携**: ソースコード生成/自動テストで活用する

### 1.2. プロジェクト方針

- [ ] 基本要件書・詳細要件書を作成 (AI支援を受ける際の前提資料)  
- [ ] フロント/バックエンドの **API 仕様** を大まかに合意 (HTTPメソッド、エンドポイント、JSON構造)  
- [ ] DB 設計方針 (Supabase/PostgreSQL) + 認証方法 (JWT / Supabase Auth) の確認  
- [ ] リポジトリ構成 (MonoRepo or 分割リポジトリ) の決定  
- [ ] 全体マイルストーン (2ヶ月MVP) と主要機能 (タスク管理, AIコーチング) のスケジュール策定

---

## 2. フロントエンド開発フロー (Step 1～100)

ここでは、**Next.js + React + TypeScript** を想定した 100 ステップのフロントエンド開発フローを示します。  
**AI駆動開発**の観点から、各ステップでの **AIツール** 活用も随時取り入れます。

### 2.1. プロジェクト初期化 (Step 1～10)

1. [ ] **Step 1**: `frontend/` ディレクトリを作成し移動  
2. [ ] **Step 2**: `npm init -y` で Node.js プロジェクト初期化  
3. [ ] **Step 3**: Next.js, React, TypeScript, Tailwind CSS 等をインストール  
4. [ ] **Step 4**: `tsconfig.json` の生成 (ターゲット/モジュール設定) - **AIで最適な設定を提案してもらう**  
5. [ ] **Step 5**: `.eslintrc` / `.prettierrc` を作成し、cursorrules と整合性を取る  
6. [ ] **Step 6**: `package.json` の scripts に `dev`, `build`, `start`, `lint` など追加  
7. [ ] **Step 7**: 開発サーバーを起動して、初期の Next.js ページが表示されるか確認  
8. [ ] **Step 8**: **Gitコミット**: "feat(frontend): initial Next.js setup"  
9. [ ] **Step 9**: Tailwindの `tailwind.config.js` を最適化 (テーマ拡張など)  
10. [ ] **Step 10**: フロントエンド開発方針を簡単にドキュメント化

### 2.2. ベースレイアウト構築 (Step 11～20)

11. [ ] **Step 11**: `app/` ディレクトリ (Next.js App Router) で基本ページ (`layout.tsx`, `page.tsx`) を作成  
12. [ ] **Step 12**: グローバルスタイル (`globals.css`) に Tailwind + カスタムCSS を適用  
13. [ ] **Step 13**: **Header** コンポーネント (ロゴ, ユーザープロフィールアイコン など)  
14. [ ] **Step 14**: **Footer** コンポーネント (コピーライト表記)  
15. [ ] **Step 15**: サイドバー (プロジェクト一覧リンク, 設定リンク) を実装 (レスポンシブ対応)  
16. [ ] **Step 16**: ダークモード対応（トグルスイッチ）をオプションで実装 - **AIによるコード例生成**  
17. [ ] **Step 17**: ルーティング: `/dashboard`, `/projects`, `/settings` などを仮作成  
18. [ ] **Step 18**: UI の一貫性確認 (フォント, 色, コンポーネント配置)  
19. [ ] **Step 19**: **Gitコミット**: "feat(frontend): add base layout with header/footer"  
20. [ ] **Step 20**: 小規模E2Eテスト (Cypress等) でレイアウト崩れ確認

### 2.3. 認証・ユーザー管理 (Step 21～30)

21. [ ] **Step 21**: `/login` ページ作成 (メール/パスワード入力フォーム)  
22. [ ] **Step 22**: `useAuth` カスタムフック or Context で認証情報をグローバル管理  
23. [ ] **Step 23**: ログイン成功時に JWT or Supabaseセッションをフロントに保持  
24. [ ] **Step 24**: ログアウト機能 (トークン破棄 or Supabaseサインアウト)  
25. [ ] **Step 25**: 未認証ユーザーへのガード (認証必須ページにリダイレクト)  
26. [ ] **Step 26**: `/register` (新規ユーザー登録) や `/password/reset` (パスワードリセット) が必要な場合は追加  
27. [ ] **Step 27**: バリデーション (Email形式、パスワード長など) - **AIが簡易バリデーションを自動生成**  
28. [ ] **Step 28**: UI 改善 (エラーメッセージ, ローディングスピナー)  
29. [ ] **Step 29**: **Gitコミット**: "feat(frontend): login & auth flow"  
30. [ ] **Step 30**: 簡易ユニットテスト (React Testing Library) で認証フォームの動作を確認

### 2.4. ダッシュボード (Step 31～40)

31. [ ] **Step 31**: `/dashboard` ページ: ユーザー名や今日のタスク, 未定タスクなどを表示する領域  
32. [ ] **Step 32**: **AIコーチング用チャット**をサイド or 下部に設置 (UIのみ仮)  
33. [ ] **Step 33**: ホーム画面に「今日のタスクリスト」「期限間近のタスク」をカードで表示  
34. [ ] **Step 34**: 時刻表示や簡単なカレンダー (Tailwind + date-fnsなど)  
35. [ ] **Step 35**: レスポンシブ対応 (モバイル時はカード縦並び)  
36. [ ] **Step 36**: バックエンドと通信が未実装なら、モックデータで仮表示  
37. [ ] **Step 37**: 軽いアニメーション (カードホバー, ドロップシャドウ等) でUX向上  
38. [ ] **Step 38**: **Gitコミット**: "feat(frontend): dashboard UI with mock tasks"  
39. [ ] **Step 39**: 余裕があれば E2E テスト (Cypress) でダッシュボード画面動作確認  
40. [ ] **Step 40**: AIコーチング画面の要件 (タスク分解機能など) を検討・設計

### 2.4.1. ダッシュボードリファクタリング (Step 41～45)

41. [ ] **Step 41**: コンポーネント分割
    - `TaskGroup.tsx`: タスクグループ表示
    - `TaskCard.tsx`: タスクカード表示
    - `SubTaskList.tsx`: サブタスクリスト
    - `EditableText.tsx`: 編集可能テキスト
    - `TaskActions.tsx`: タスク操作ボタン
42. [ ] **Step 42**: カスタムフック導入
    - `useTaskManagement.ts`: タスク管理ロジック
    - `useDragAndDrop.ts`: ドラッグ&ドロップ処理
    - `useTaskFilters.ts`: タスクフィルタリング
43. [ ] **Step 43**: 型定義の強化
    - インターフェースの分割
    - ユーティリティ型の追加
    - エラーハンドリング型の追加
44. [ ] **Step 44**: テストの追加
    - 各コンポーネントのユニットテスト
    - カスタムフックのテスト
    - 統合テストの追加
45. [ ] **Step 45**: **Gitコミット**: "refactor(frontend): split dashboard into components"

### 2.5. プロジェクト一覧・詳細 (Step 46～50)

46. [ ] **Step 46**: `/projects` ページ: プロジェクトリスト (カード or テーブル)  
47. [ ] **Step 47**: フィルター (status: active/archived) や検索バー  
48. [ ] **Step 48**: ページネーション or 無限スクロールを検討  
49. [ ] **Step 49**: リストアイテムをクリックすると `/projects/[id]` に遷移  
50. [ ] **Step 50**: `/projects/[id]`: プロジェクト名や説明、AIコーチングチャット、タスクグループ一覧を配置  

### 2.6. タスク管理 (Step 51～60)

51. [ ] **Step 51**: `/tasks` or `/projects/[id]` 内タスク管理UI (Trello風カンバン、またはリスト)  
52. [ ] **Step 52**: ドラッグ&ドロップ (react-beautiful-dnd等) による並び替え  
53. [ ] **Step 53**: タスクグループ (列) とタスク (カード) の階層表示  
54. [ ] **Step 54**: クリックでタスク詳細をモーダル表示 (説明、期限、サブタスクなど)  
55. [ ] **Step 55**: サブタスクは折りたたみ/展開 UI も検討  
56. [ ] **Step 56**: AIコーチの「タスク分解提案」を受け取ってサブタスクを自動生成 (UI/モック) - **AI駆動設計**  
57. [ ] **Step 57**: 「完了」チェックボックス, 期限切れのビジュアル (赤文字など)  
58. [ ] **Step 58**: バックエンドAPIが用意できていなければモックを仮実装 → 後で切り替え  
59. [ ] **Step 59**: **Gitコミット**: "feat(frontend): task management UI (kanban & subtasks)"  
60. [ ] **Step 60**: レスポンシブ検証 + ユニットテスト数件追加

### 2.7. AIコーチング画面 (Step 61～70)

61. [ ] **Step 61**: `/ai` or ダッシュボード・プロジェクトページのサイドなどにチャットUI配置  
62. [ ] **Step 62**: チャット入力 → 送信 → 送信ログを画面に表示 (モック)  
63. [ ] **Step 63**: システムメッセージ (AIコーチのキャラクター設定) を表示 (デバッグ用)  
64. [ ] **Step 64**: AIからの応答をメッセージバブルとして表示  
65. [ ] **Step 65**: 「タスク分解モード」「モチベーション支援モード」などタブ分けUI (オプション)  
66. [ ] **Step 66**: **音声入力**(Web Speech APIなど) や音声読み上げ対応 (将来検討)  
67. [ ] **Step 67**: スクロール時に過去メッセージが遡れるUI  
68. [ ] **Step 68**: バックエンドと連携 (暫定エンドポイントを叩いてみる)  
69. [ ] **Step 69**: **Gitコミット**: "feat(frontend): AI coaching chat UI (mock integration)"  
70. [ ] **Step 70**: 簡易的な対話ログ保存 (localStorage か Redux/Zustand) → 後で本API連携

### 2.8. 設定/マイページ (Step 71～80)

71. [ ] **Step 71**: `/settings` ページ (AIコーチ設定, 通知設定, テーマ切り替え等)  
72. [ ] **Step 72**: AIコーチ設定フォーム (model選択, temperatureなど)  
73. [ ] **Step 73**: `/mypage` ページ (ユーザー情報, アバター画像変更)  
74. [ ] **Step 74**: API連携(仮)で保存し、UIに反映  
75. [ ] **Step 75**: バリデーション (数値範囲チェック, 文字数など)  
76. [ ] **Step 76**: 「保存成功」時のトースト表示、エラー時のアラート  
77. [ ] **Step 77**: 開発中はモックAPIでも可 → 後で本番APIに切り替え  
78. [ ] **Step 78**: **Gitコミット**: "feat(frontend): user settings & AI coach config"  
79. [ ] **Step 79**: ユニットテスト (フォーム送信テスト)  
80. [ ] **Step 80**: アクセシビリティ (Tabナビ, スクリーンリーダー) の基本チェック

### 2.9. テスト・品質向上 (Step 81～90)

81. [ ] **Step 81**: Jest + React Testing Library の単体テスト書き込み  
82. [ ] **Step 82**: 各主要コンポーネント (Dashboard, ProjectList 等) のスナップショットテスト  
83. [ ] **Step 83**: フォーム/バリデーション系テスト (空欄, 不正フォーマット)  
84. [ ] **Step 84**: Cypress など E2E テスト (ログイン → ダッシュボード → ログアウト)  
85. [ ] **Step 85**: **AIによるテストケース生成** → カバレッジを高める  
86. [ ] **Step 86**: レスポンシブモードでのスクリーンショット比較  
87. [ ] **Step 87**: 不要なconsole.log, デッドコード整理  
88. [ ] **Step 88**: **Gitコミット**: "test(frontend): add unit & e2e tests, code cleanup"  
89. [ ] **Step 89**: Lintや型エラーを全て解決し、CIでエラーが出ないようにする  
90. [ ] **Step 90**: Storybookドキュメントの充実 (任意)

### 2.10. ビルド・デプロイ (Step 91～100)

91. [ ] **Step 91**: `npm run build` で本番ビルド、バンドルサイズを確認  
92. [ ] **Step 92**: Vercel や Netlify へのデプロイを検討 (Next.jsならVercelが好適)  
93. [ ] **Step 93**: `.env` や `.env.production` の管理 (APIのURL, Supabaseキー等)  
94. [ ] **Step 94**: 初回デプロイ → URLアクセスで動作確認  
95. [ ] **Step 95**: デザイン微調整 (ダークモード, 色の統一)  
96. [ ] **Step 96**: アクセシビリティ追加対応 (aria-label, focus outline 等)  
97. [ ] **Step 97**: CI/CD セットアップ (GitHub Actions でビルド & デプロイ)  
98. [ ] **Step 98**: **Gitコミット**: "build(frontend): production ready + deployment config"  
99. [ ] **Step 99**: バグ修正・チューニング (AIの最適化提案を適宜採用)  
100. [ ] **Step 100**: フロントエンドのドキュメント整理 (README, wiki)

> 以上がフロントエンド 100 ステップです。  
> **AI駆動開発** を活用することで、各ステップのコード生成/テスト自動化を効率化できます。

---

## 3. バックエンド開発フロー (Step 101～200)

次に、**Supabase/PostgreSQL + Node.js** (ExpressやNest.jsなど)を想定したバックエンド開発を **100 ステップ**に分割します。

### 3.1. プロジェクト初期化 (Step 101～110)

101. [ ] **Step 101**: `backend/` ディレクトリ作成  
102. [ ] **Step 102**: `npm init -y` → Node.js プロジェクト初期化  
103. [ ] **Step 103**: TypeScript, ESLint, Prettier, cursorrules 等を設定  
104. [ ] **Step 104**: フレームワーク選択 (Express / Nest.js / Fastify など) → インストール  
105. [ ] **Step 105**: `tsconfig.json` でターゲット/モジュールを調整  
106. [ ] **Step 106**: `npm run dev` / `npm run build` スクリプトを `package.json` に登録  
107. [ ] **Step 107**: **Gitコミット**: "feat(backend): initial setup"  
108. [ ] **Step 108**: 環境変数 (`.env`) で DB接続文字列やポート番号を管理  
109. [ ] **Step 109**: AIを活用して初期設計ドキュメントを生成 (API方針, アーキテクチャ)  
110. [ ] **Step 110**: サーバ起動時に "Hello from Backend" 等を返すテストルート

### 3.2. Supabase / DB 設定 (Step 111～120)

111. [ ] **Step 111**: Supabase プロジェクト作成 or ローカルPostgreSQL を準備  
112. [ ] **Step 112**: `@supabase/supabase-js` をインストール (BaaS的利用)  
113. [ ] **Step 113**: **DB マイグレーション**: Supabase CLI か Prisma/TypeORM でスキーマ管理  
114. [ ] **Step 114**: テーブル定義: `users`, `projects`, `task_groups`, `tasks`, `subtasks`, `ai_messages`  
115. [ ] **Step 115**: **RLS (Row Level Security)** を検討 (Supabaseでのセキュリティ)  
116. [ ] **Step 116**: テーブルリレーション (projects - tasks など) 確認  
117. [ ] **Step 117**: `supabase/migrations` に SQL or Prismaファイルを用意 → DB作成  
118. [ ] **Step 118**: 接続テスト (SupabaseのAnonKey, URLを `.env` に設定)  
119. [ ] **Step 119**: DBトランザクション処理やエラーハンドリングの方針決定  
120. [ ] **Step 120**: **Gitコミット**: "chore(backend): supabase DB & migrations"

### 3.3. ルーティング設計 (Step 121～130)

121. [ ] **Step 121**: `app/api/` ディレクトリ (Next.js APIルート) or `src/routes/` (Express) にルート定義  
122. [ ] **Step 122**: `/api/v1/users`, `/api/v1/projects`, `/api/v1/tasks` 等  
123. [ ] **Step 123**: メソッド別に `GET`, `POST`, `PUT`, `DELETE` を用意 (mock responseでもOK)  
124. [ ] **Step 124**: リクエストバリデーション (Zod/JOI/class-validatorなど) 導入  
125. [ ] **Step 125**: [GET] `/api/v1/projects` でプロジェクト一覧を取得するダミー実装  
126. [ ] **Step 126**: [POST] `/api/v1/projects` で新規プロジェクト作成 (仮)  
127. [ ] **Step 127**: [GET] `/api/v1/tasks` でタスク一覧 (モック)  
128. [ ] **Step 128**: エラーレスポンス形式 (JSON { error: {code, message} }) 統一  
129. [ ] **Step 129**: **Gitコミット**: "feat(backend): basic routes (mock data)"  
130. [ ] **Step 130**: CORS, ログ出力(Morgan等)の設定

### 3.4. 認証・セキュリティ (Step 131～140)

131. [ ] **Step 131**: Supabase Auth もしくは JWT 認証を採用  
132. [ ] **Step 132**: `authMiddleware.ts` or `authHandler.ts` でトークン検証ロジック  
133. [ ] **Step 133**: ログインAPI: [POST] `/api/v1/auth/login` → 成功時にJWT or Supabaseセッション発行  
134. [ ] **Step 134**: ユーザー登録 (Supabase Auth.signUp) or 手動 (パスワードハッシュ化)  
135. [ ] **Step 135**: ログアウト (フロントでトークン破棄 or セッション無効化)  
136. [ ] **Step 136**: 認可 (ProjectのownerId とリクエストユーザーが一致するかチェック)  
137. [ ] **Step 137**: ロール (admin, user) がある場合はアクセス権を制限  
138. [ ] **Step 138**: エラーメッセージを共通化 (401: unauthorized, 403: forbidden)  
139. [ ] **Step 139**: **Gitコミット**: "feat(backend): add supabase/jwt auth & role-based guard"  
140. [ ] **Step 140**: E2Eテストで認証が正しく動くか検証

### 3.5. コントローラ・サービス (Step 141～150)

141. [ ] **Step 141**: `projectController.ts`, `taskController.ts` など用意  
142. [ ] **Step 142**: `projectService.ts`, `taskService.ts` でビジネスロジック (DB呼び出し) 分離  
143. [ ] **Step 143**: 例: `createProject(userId, data)` → DB挿入, `updateTaskStatus(taskId, status)` など  
144. [ ] **Step 144**: コントローラはルーティングから呼ばれ、サービスを使って結果を返す  
145. [ ] **Step 145**: `/api/v1/projects` → GET でユーザーの所有プロジェクトを返す  
146. [ ] **Step 146**: `/api/v1/tasks/:id` → PUT でタスク更新 (タイトル, 期限, 状態 等)  
147. [ ] **Step 147**: エラーハンドリングは try-catch で行い、共通レスポンスへ集約  
148. [ ] **Step 148**: バリデーション/アクセスチェックの追加 (自己のタスクのみ更新可等)  
149. [ ] **Step 149**: **Gitコミット**: "feat(backend): implement controllers & services (projects, tasks)"  
150. [ ] **Step 150**: 簡単なユニットテスト (service単位) でロジック確認

### 3.6. AIコーチングAPI (Step 151～160)

151. [ ] **Step 151**: `/api/v1/ai/coach` → POST で { prompt, context } を受け、AI問い合わせ (OpenAI API等)  
152. [ ] **Step 152**: AI設定 (model, temperature) はユーザー単位 or グローバル設定から取得  
153. [ ] **Step 153**: 試験的に OpenAI/GPT へのリクエスト (API KEY は .env に保存)  
154. [ ] **Step 154**: タスク分解 (goal, constraints) のリクエストを受けてサブタスク提案を返すAPI  
155. [ ] **Step 155**: **Rate limit** 設定 (AI問い合わせが過剰にならないように)  
156. [ ] **Step 156**: エラー処理 (OpenAI エラー時にリトライ or エラーJSON応答)  
157. [ ] **Step 157**: **ai_messages** テーブルにログを記録 (ユーザーのpromptとAI応答を保存)  
158. [ ] **Step 158**: AIコーチングのレスポンス形式をフロントと協議 (assistantMessage, tokensUsedなど)  
159. [ ] **Step 159**: **Gitコミット**: "feat(backend): AI coaching endpoints (chat, breakdown)"  
160. [ ] **Step 160**: 簡易テストでAIリクエストが成功するか確認 (APIキー有効時)

### 3.7. タスク / サブタスク管理 (Step 161～170)

161. [ ] **Step 161**: `task_groups` + `tasks` + `subtasks` のCRUDをサービス層に用意  
162. [ ] **Step 162**: `/api/v1/task-groups` → GET/POST/PUT/DELETE  
163. [ ] **Step 163**: `/api/v1/tasks` → GET/POST/PUT/DELETE  
164. [ ] **Step 164**: `/api/v1/subtasks` → GET/POST/PUT/DELETE  
165. [ ] **Step 165**: 並び順 (order_index) の更新API (D&D対応)  
166. [ ] **Step 166**: 期限/完了状態の更新API (タスクがdone→AIコーチに通知など発火ロジック検討)  
167. [ ] **Step 167**: トランザクション (サブタスク一括更新時) が必要か検討  
168. [ ] **Step 168**: 全APIに認証・所有権チェックを適用  
169. [ ] **Step 169**: **Gitコミット**: "feat(backend): tasks & subtasks CRUD implementation"  
170. [ ] **Step 170**: 各エンドポイントのユニットテスト・結合テスト (Supertest 等)

### 3.8. テスト・品質向上 (Step 171～180)

171. [ ] **Step 171**: Jest + Supertest でルートレベルのインテグレーションテスト  
172. [ ] **Step 172**: ユーザーの認証テスト (正しいJWT → 200, 間違いJWT → 401)  
173. [ ] **Step 173**: Projects/Tasks CRUDの正常系・異常系テスト  
174. [ ] **Step 174**: AIコーチングAPIのテスト (モックOpenAIクライアント)  
175. [ ] **Step 175**: レスポンス形式 (ApiResponse<T>) が想定通りかチェック  
176. [ ] **Step 176**: カバレッジレポートを確認し、不足部分を追加  
177. [ ] **Step 177**: ロギング (pino or Winston) を導入し、重要な操作を記録  
178. [ ] **Step 178**: エラー/例外処理: DBエラー, 未知例外 などの試験  
179. [ ] **Step 179**: **Gitコミット**: "test(backend): add coverage for main endpoints"  
180. [ ] **Step 180**: コードリファクタリング (AI提案によるクリーンアップ) 実施

### 3.9. デプロイ・運用 (Step 181～190)

181. [ ] **Step 181**: `npm run build` (tsc) で dist/ フォルダ生成  
182. [ ] **Step 182**: Dockerfile 作成 → `docker build` → ローカル実行確認  
183. [ ] **Step 183**: Supabaseへの接続: `.env.production` にURLやKEYを設定  
184. [ ] **Step 184**: CI/CD (GitHub Actions 等) で ビルド + テスト + Docker push  
185. [ ] **Step 185**: リアルタイム機能 (Supabase Realtime) 使う場合は設定 (オプション)  
186. [ ] **Step 186**: 本番環境 (AWS ECS, Render, Fly.io 等) にデプロイ  
187. [ ] **Step 187**: ログ/アラートの監視 (Supabaseダッシュボード, CloudWatch等)  
188. [ ] **Step 188**: Post-deployment ヘルスチェック (主要エンドポイントが200返すか)  
189. [ ] **Step 189**: **Gitコミット**: "chore(backend): production deployment config"  
190. [ ] **Step 190**: 環境差異 (dev/staging/production) やスケール戦略 (autoscaling) 検討

### 3.10. 運用・メンテナンス (Step 191～200)

191. [ ] **Step 191**: 運用監視 (Datadog, Sentry等) を導入  
192. [ ] **Step 192**: DBバックアップスケジュール (Supabaseの自動バックアップ or 手動)  
193. [ ] **Step 193**: 定期的なセキュリティパッチ (npm依存パッケージ更新, Node.js LTSアップデート)  
194. [ ] **Step 194**: アップタイム監視 (Pingdom, UptimeRobot)  
195. [ ] **Step 195**: 運用ドキュメント (障害対応手順, SLA) 整備  
196. [ ] **Step 196**: 新機能 (GitHub連携, Slack通知, チーム機能 など) 追加時の影響調査  
197. [ ] **Step 197**: コードやDBスキーマのリファクタリング (AI提案を取り入れ継続改善)  
198. [ ] **Step 198**: 不要データのアーカイブやレポート生成 (定期的にAIを活用したデータ分析を検討)  
199. [ ] **Step 199**: まとめ・レトロスペクティブで改善点をチーム共有  
200. [ ] **Step 200**: **Gitコミット**: "chore(backend): finalize ops & maintenance tasks"

---

## 4. 総合チェックポイント

- **フロントエンド (1～100)** + **バックエンド (101～200)** で計 200 ステップ超  
- 適宜 **並行開発** 可能。APIモック/スタブでフロント先行実装 → 後ほど本APIと連携  
- **AI駆動開発**:  
  - コード生成（コンポーネントやAPIのテンプレ）  
  - テスト作成（単体/E2E）  
  - リファクタリング提案  
  - ドキュメント自動生成  
- 要件変更やスケジュール短縮に合わせて **ステップ取捨選択** や優先度付け

---

## 5. まとめ

- **コミットコーチ**では、タスク管理・AIコーチングを中核とするため、  
  - **フロントエンド**: 直感的なカンバンUI、AIチャットUI  
  - **バックエンド**: Supabase, Node.js, AI (OpenAI API)  
- **全200ステップ** の手順をチェックリスト化し、AIツールを活用しながら開発を進める  
- 運用フェーズでは RLS, レートリミット, ログ監視, バックアップ等の体制を整える  
- 必要に応じて **GitHub連携**, **カレンダー連携**, **通知機能** などを拡張し、次のステップへ

この一連の手順を参照して、**コミットコーチ**の開発を効率的かつ着実に進めましょう。
