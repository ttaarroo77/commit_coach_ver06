---
name: "docs/overview_0/components.md"
title: "UIコンポーネント要件定義書 (Components)"
description: "コミットコーチ – AIコーチング機能を含む画面ごとの主要コンポーネントと共通パーツ要件"
---

# UIコンポーネント要件定義書

本ドキュメントは、**コミットコーチ** における主要画面・機能を実装するための UI コンポーネント要件を整理したものです。  
Tailwind CSS + shadcn/ui をベースとしたデザイン、そして **AIチャット機能** (OpenAI / Vercel AI SDK) を含む構成を想定しています。

---

## 1. 目的と対象範囲

**目的**  
- UI 設計と開発の共通ルール・コンポーネント構造を明確化し、**一貫性・再利用性・保守性**を高める。  
- デザイナー・開発者・PM間の認識をすり合わせ、スムーズな実装フローを支援する。  

**対象画面／機能**  
1. ダッシュボード (今日のタスク・未定タスク・AIコーチ)  
2. プロジェクト一覧・詳細 (タスクボード含む)  
3. AIチャット／コーチング機能  
4. ユーザー設定、マイページ  
5. 共通レイアウト、ヘッダー／サイドバー、フォーム、ボタン、モーダル 等

---

## 2. UI/UX 設計方針

1. **シンプル & 直感的**  
   - タスクの階層管理 (プロジェクト > タスクグループ > タスク > サブタスク) が一目で分かるUI  
   - AIチャットはいつでも呼び出せるフローティングUIやサイドパネル等、自然に対話できる動線  

2. **再利用性 + デザイン一貫性**  
   - ボタンやフォーム、カードなどは `shadcn/ui` をベースに拡張  
   - デザイントークン（色・余白・タイポグラフィ）を定義し、Tailwind + カスタムクラスで統一

3. **レスポンシブ & クロスブラウザ対応**  
   - モバイル／タブレット／デスクトップで最適レイアウトを実現  
   - 最新主要ブラウザ（Chrome, Firefox, Safari, Edge）に対応

4. **アクセシビリティ重視**  
   - WAI‑ARIA 属性付与、キーボード操作対応  
   - 適切なコントラスト比 (WCAG 2.1 準拠)  
   - フォーカスリング・スクリーンリーダー対応を確保

---

## 3. 画面別機能要件

### 3.1 ダッシュボード

- **TodayTasksSection**  
  - 今日のタスク一覧を表示 (期限時刻順にソート)  
  - チェックボックスで完了状態を切り替え  
  - 「ドラッグ & ドロップ」でタスクの順序や所属を変更可能 (react-beautiful-dnd 予定)

- **UnscheduledTasksSection**  
  - 期限が未設定のタスク一覧を表示  
  - ドラッグ & ドロップにより、今日のタスクへ移動可能

- **AIChatPanel** (簡易版 or フローティングチャット)  
  - ユーザーがAIに質問・相談ができる入力フォーム  
  - AI応答をチャット形式で表示

### 3.2 プロジェクト一覧／詳細

- **ProjectList**  
  - プロジェクトをカード表示またはリスト表示  
  - ページネーション or 無限スクロール (検討)  
  - フィルター: ステータス (active, paused, archived 等)

- **ProjectCard**  
  - プロジェクト名、説明、進捗度合い、期限 (任意)  
  - プロジェクトのサムネイル・色分けやタグ表示 (shadcn/ui の Badge 等)

- **ProjectDetail** (タスクボード画面)  
  - **TaskGroupColumn**: タスクグループを列 (レーン) として表示 (Trello風)  
  - タスク／サブタスクをD&Dで並び替え可能  
  - AIチャット (サイドパネル or ボトムチャット)  
  - プロジェクト編集モーダル、グループ編集モーダルなど

### 3.3 AIコーチング機能

- **AIChat** (共通コンポーネント)  
  - メッセージ入力フィールド (送信時にOpenAI API or Vercel AI SDK呼び出し)  
  - メッセージ表示 (ユーザー/AI のバブル表示)  
  - ローディング表示 (スピナー or ドットアニメーション)  
  - エラー時のリトライ操作

- **TaskBreakdown** (AIによるタスク分解)  
  - 大目標・制約条件などを入力 -> 「分解」ボタン  
  - AI提案のサブタスクやスケジュールプランを表示し、ワンクリックでタスクに追加

- **AISettingsModal** (ユーザーごとのAI設定)  
  - モデル選択 (gpt-3.5-turbo, gpt-4 など)  
  - creativity(temperature) / システムプロンプト設定  
  - テスト送信ボタン

### 3.4 ユーザー設定・マイページ

- **UserProfileForm**  
  - 表示名・メールアドレス・アバター画像URLなど  
  - `react-hook-form` + Zod でバリデーション  
  - フォーム送信後はトースト(Toast)や Alert コンポーネントで結果表示

- **UserAccountSecurity** (拡張)  
  - パスワード変更や2FA設定  
  - OAuth連携管理

### 3.5 共通レイアウト

- **Header** / **Sidebar**  
  - ロゴ、グローバルナビ、ユーザーメニュー (ログアウト、設定 など)  
  - サイドバーにはプロジェクト一覧/AIチャット呼び出しアイコンなど

- **Footer**  
  - バージョン情報、利用規約、問い合わせ先など

---

## 4. 共通コンポーネント要件

| コンポーネント          | 主な Props / Behavior                                                       |
|-------------------------|----------------------------------------------------------------------------|
| **Button** (shadcn/ui)  | variants: `default`, `destructive`, `outline` etc.; sizes: `sm`, `md`, `lg` |
|                         | `disabled`, `loading` state                                                 |
| **Modal** (Dialog)      | header/body/footer のスロット; `open`/`onOpenChange`; focus trap, ESC close |
| **Alert**               | types: `success`, `info`, `warning`, `error`; icon variant                 |
| **Toast**               | 自動 dismiss (数秒後) or マニュアル dismiss                                |
| **Input / Textarea**    | label, placeholder, バリデーション表示 (エラーメッセージ)                   |
| **Select**              | options[], searchable (拡張), multi-select (拡張)                           |
| **DatePicker**          | 日付選択、時刻選択 (TimePicker付き)                                         |
| **TaskCard**            | タスクタイトル、期限、ステータスアイコン、ドラッグハンドル                  |
| **TaskGroupColumn**     | グループ名、タスクリスト、D&Dハンドラ                                       |
| **AIChat**              | チャットバブル一覧、テキスト入力、送信ボタン、ローディング状態             |
| **TaskBreakdown**       | 大目標・制約条件入力フォーム、AI応答表示、サブタスク登録ボタン             |

---

## 5. フォームバリデーション

- **ライブラリ**: React Hook Form + Zod  
- **ルール例**:  
  - 必須チェック、文字数制限、メール形式  
  - 期限日が過去日でないか (タスク作成時)  
  - モデル切り替え (gpt-4) はユーザープラン制約など

- **UI**:  
  - エラー時は `shadcn/ui` の `Input` コンポーネントをエラースタイルに変更  
  - フォーカス時枠ハイライト + エラーメッセージのトースト or インライン表示

---

## 6. スタイルガイド

1. **デザイントークン** (Tailwind + カスタムプロパティ)  
   - `--color-primary: #31A9B8;` (ティール系)  
   - `--color-accent: #F5BE41;` (注意)  
   - `--color-danger: #CF3721;` (エラー)  
   - `--spacing-md: 16px;`  
   - `--font-base: "Inter", sans-serif;`

2. **UIフレームワーク**  
   - **Tailwind CSS** (ユーティリティクラス中心) + **shadcn/ui** (Dialog, Alert, Button等)  
   - カスタムクラス: `.task-card`, `.task-group-column` など

3. **アイコン**  
   - `lucide-react` を採用 (shadcn/ui との親和性)  
   - コンポーネント単位でインポートし、`<Icon name="..."/>` 的にラップ

4. **アニメーション**  
   - 余裕があれば `framer-motion` でD&Dアニメーションなどを実装

---

## 7. テスト要件

- **Unit テスト** (Jest + React Testing Library)  
  - コンポーネント Snapshot テスト (Button, Modal, AIChat等)  
  - イベントハンドラ (クリック、フォーム送信、ドラッグ&ドロップ)

- **E2E テスト** (Cypress or Playwright)  
  - 主要フロー (ログイン → プロジェクト作成 → タスク追加 → AIコーチへ質問)  
  - レスポンシブレイアウト (width 320px, 768px, 1024pxなど)

- **アクセシビリティ** (axe-core / cypress-axe)  
  - ARIA属性、ラベル紐付け、キーボード操作検証

---

## 8. リリース & CI フロー

1. **実装 → Pull Request → Code Review**  
2. **Storybook** で各コンポーネントの見た目＆操作を確認  
3. **CI**  
   - ESLint / Prettier  
   - Type Check (tsc)  
   - Unit & E2E テスト  
4. **ステージングで検証**  
   - ダッシュボード / AIチャット / タスク管理動作チェック  
5. **本番デプロイ**  
   - Vercel + Supabase の設定確認 (APIキーやDBテーブル)  
   - リリースノート作成

---

## 9. 今後の拡張

1. **リアルタイム更新**  
   - Supabase Realtime や WebSocket (Server-Sent Events)  
   - タスクの更新を他ユーザーにも即時反映
2. **多言語対応 (i18n)**  
   - next-i18next / react-i18next  
   - UIラベル、AIチャット文言の翻訳管理
3. **テーマ切替**  
   - ライト / ダークモード  
   - カラーブラインドフレンドリーなパレット検討

---

## 10. 変更履歴

| 日付       | 変更内容                                          | 担当     |
|------------|---------------------------------------------------|----------|
| 2025-04-10 | 初版作成                                          | PM       |
| 2025-04-15 | Tailwind/CSS設計の詳細追記                        | 担当A    |
| 2025-04-20 | AIチャットやTaskBreakdownなどAI機能コンポーネント追加 | 担当B    |
| 2025-04-25 | shadcn/ui コンポーネント一覧＆アクセシビリティ要件強化 | 担当C    |

---

## 11. 参考資料

- **Figma デザインモック**: [リンク](#) (詳細なレイアウトおよびスタイル規格)  
- **Next.js Docs (App Router)**: [https://nextjs.org/docs](https://nextjs.org/docs)  
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)  
- **React Hook Form**: [https://react-hook-form.com/](https://react-hook-form.com/)  
- **Tailwind CSS**: [https://tailwindcss.com/](https://tailwindcss.com/)  
- **WCAG 2.1 Guidelines**: [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)
