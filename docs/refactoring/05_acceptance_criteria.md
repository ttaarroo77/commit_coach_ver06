# 05\_Acceptance\_Criteria

> **バージョン:** 2025-05-30 (draft)
>
<!-- > **対象ブランチ:** `feature/remove-dashboard` -->
>
> **責任者:** @nakazawatarou

---

## 1. ドキュメントの目的

本書は Commit Coach の **ユーザーストーリーごとの受け入れ条件 (Acceptance Criteria)** を明文化し、開発・QA・ステークホルダー間の “Done の定義” を統一することを目的とします。`/projects` を中心とした新フロー、AI コードレビュー機能、基本 CRUD 操作、アクセシビリティなど、機能要件と非機能要件の双方を綴羅します。

<!-- 元の記述: 本書は Commit Coach (Dashboard 撤去版) の **ユーザーストーリーごとの受け入れ条件 (Acceptance Criteria)** を明文化し、開発・QA・ステークホルダー間の "Done の定義" を統一することを目的とします。`/projects` を中心とした新フロー、AI コードレビュー機能、基本 CRUD 操作、アクセシビリティなど、機能要件と非機能要件の双方を綴羅します。 -->

---

## 2. フォーマット

* **User Story (US-xx):** ビジネス価値記述 (As a / I want / So that)
* **Acceptance Criteria (AC-x.x):** Gherkin 形式 or チェックリスト形式
* **Definition of Done (DoD):** 横断的完了基準 (テスト・レビュー・ドキュメント)

```gherkin
Scenario: ユーザがプロジェクトを作成する
  Given 有効な JWT でログインしている
  When   "New Project" ボタンをクリックし
         "Name" 入力欄に "Awesome" と入力して
         "Create" を押す
  Then   ProjectList に "Awesome" が表示される
  And    URL が /projects/<id> に遷移する
```

---

## 3. 共通 DoD

| # | 項目      | 基準                         |
| - | ------- | -------------------------- |
| 1 | 単体テスト   | 90%+ カバレッジ (関数 / ロジック層)    |
| 2 | E2E テスト | Playwright シナリオが Pass      |
| 3 | A11y    | Storybook a11y アドオン違反 0 件  |
| 4 | パフォーマンス | `/projects` p95 LCP ≤ 1.5s |
| 5 | 国際化     | 日本語＆英語で文言欠落なし              |
| 6 | ドキュメント  | 関連 .md 更新済 & PR 説明に記載      |

---

## 4. ユーザーストーリー & 受け入れ条件

### US-01: プロジェクト一覧を閲覧したい

> **As a** 開発者
> **I want** `/projects` で自分のプロジェクトを一覧表示できる
> **So that** 進捗を高速に確認できる

| AC     | Gherkin or チェック                                         | メモ                    |
| ------ | ------------------------------------------------------- | --------------------- |
| AC-1.1 | プロジェクトが存在する場合、テーブルに name / owner / updatedAt が行として表示される | 表示順は `updatedAt DESC` |
| AC-1.2 | 0 件の場合、空状態イラストと "Create your first project" CTA が表示される  | CTA → モーダル            |
| AC-1.3 | 読み込み中は `<Spinner>` が中央に表示され、終了後に消える                     | Skeleton 不採用          |

### US-02: プロジェクトを作成・編集・削除したい

| AC     | Gherkin                                                   | 備考                  |
| ------ | --------------------------------------------------------- | ------------------- |
| AC-2.1 | Create シナリオ(上記例)                                          | ---                 |
| AC-2.2 | 編集: Project Detail で "Edit" → 名前変更後、リストに即時反映 (Optimistic) | 失敗時 Rollback Toast  |
| AC-2.3 | Delete: ConfirmModal で "Delete" → OK で行が消える               | owner のみ許可、RBAC テスト |

### US-03: タスクをドラッグ & ドロップで並べ替えたい

| AC     | チェック                                      | 備考                    |
| ------ | ----------------------------------------- | --------------------- |
| AC-3.1 | タスク行をドラッグするとプレースホルダが表示される                 | `useDragDrop`         |
| AC-3.2 | ドロップ後、status カラムが自動更新 (TODO→IN\_PROGRESS) | optimistically update |
| AC-3.3 | 並べ替えがサーバに保存され、リロード後も順序が保持される              | order\_index 更新       |

### US-04: AI コードレビュー提案を受け取りたい

| AC     | Gherkin                                          | 備考                      |
| ------ | ------------------------------------------------ | ----------------------- |
| AC-4.1 | PR 作成時、バックエンドが `/ai/review` でコメント生成 → UI にスレッド表示 | GitHub Webhook stub     |
| AC-4.2 | コメントには "🧠 Commit Coach" ラベルが付与される               | CSS class `.ai-comment` |
| AC-4.3 | レビュー提案が 0 件の場合、何も表示しない                           | Silence is golden       |

### US-05: 通知をリアルタイムで受け取りたい

| AC     | チェック                                         | 備考           |
| ------ | -------------------------------------------- | ------------ |
| AC-5.1 | WebSocket (Pusher) 接続後、新規コメント時に Toast が表示される | variant=info |
| AC-5.2 | 画面下部 `<NotificationList>` にスタックされる           | 最大 5 件まで     |

### US-06: アクセシビリティ基準を満たしたい

| AC     | チェック                                              | WCAG 2.2 AA       |
| ------ | ------------------------------------------------- | ----------------- |
| AC-6.1 | すべての clickable 要素に `role` と `aria-label` が設定されている | リンカビリティ           |
| AC-6.2 | キーボード操作で完全に操作完了できる                                | Tab order logical |
| AC-6.3 | 色だけに依存しないステータス表示                                  | Badge+Icon        |

---

## 5. 非機能受け入れ (NFR)

| カテゴリ       | 指標                  | 基準            |
| ---------- | ------------------- | ------------- |
| Perf (LCP) | `/projects`         | ≤ 1.5s (p95)  |
| Error      | JS エラー率             | < 0.1% Sentry |
| SEO        | Lighthouse Score    | ≥ 95          |
| Security   | OWASP ZAP Medium 未満 | 0 件           |

---

## 6. スモークテストリスト

1. **Login → /projects** まで 200 OK
2. プロジェクト作成 → 一意 URL に遷移
3. リロード → データ永続を確認
4. Logout → `/login` にリダイレクト

---

## 7. 変更管理

* 新しいユーザーストーリー追加時、本書に **AC** を必ず追記
* 破壊的変更 (AC 改定) は **PO + QA** 承認後にマージ

---

## 8. 参考リンク

* **Gherkin Syntax:** [https://cucumber.io/docs/gherkin](https://cucumber.io/docs/gherkin)
* **Playwright Test:** [https://playwright.dev/test](https://playwright.dev/test)

---

<!-- End of File -->
