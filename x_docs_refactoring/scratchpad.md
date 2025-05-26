# 🗒️ Commit Coach Scratchpad — 2‑Tab ダッシュボード移行トラッカー

> **目的** 
> 既存ダッシュボードを **Plan / Work の 2 タブ UI** に段階的に移行する進捗を 1 ファイルで管理する。PR や Issue をまたがず、この Markdown を *ドラッグ＆ドロップ* で整理しながら使う。

---

## セクション定義（固定）

* **Backlog** – まだ手を付けていないタスク（優先度順）
* **In Progress** – 着手中のタスク
* **Blockers / Errors** – 直近で詰まっている技術課題
* **Done** – 終わったらここへ移動（週次でアーカイブ）
* **Ideas & Icebox** – いつかやるかもしれないアイデア
* **Meta** – Scratchpad の運用ルールメモ

タスク記法：

```markdown
- [ ] タスク名 – ラベル – 期日
  - Context: 背景や詳細
  - Owner: @担当者
  - Confidence: 0‑100
```

---

# Backlog

### 🚀 Milestone `two‑tab‑dashboard‑v2`

* [ ] **1️⃣  ブランチ & フィーチャーフラグ確立** – chore – 2025‑05‑26

  * Context: `feat/002-ui-2-tab` ブランチ作成、LaunchDarkly に `dashboard.v2.*` フラグ追加
  * Owner: @Taro
  * Confidence: 95

* [ ] **2️⃣  PlanTab 基本 UI 実装** – ui – 2025‑05‑27

  * Context: `ProjectCard`, `TaskCard`, `SubtaskListItem` の JSX / Tailwind 雛形
  * Confidence: 90

* [ ] **3️⃣  WorkTab カンバン UI 実装** – ui – 2025‑05‑28

  * Context: `TaskColumn`, `TaskCardSmall` を実装して DnD でステータス変更
  * Confidence: 88

* [ ] **4️⃣  Zustand ストア統合** – feature – 2025‑05‑29

  * Context: `entitiesSlice`, `orderSlice`, `uiSlice` を実装
  * Confidence: 85

* [ ] **5️⃣  React Query & API v2** – feature – 2025‑05‑30

  * Context: `/projects`, `/tasks` CRUD, `mutateAsync` 楽観更新を実装
  * Confidence: 80

* [ ] **6️⃣  Drag‑and‑Drop 統合 (dnd‑kit)** – feature – 2025‑05‑31

  * Context: 全レベルの reorder + `pointerSensor` 最適化
  * Confidence: 80

* [ ] **7️⃣  インライン編集フロー** – feature – 2025‑06‑01

  * Context: `InlineEditor`, `DatePickerPopover`, `onEdit` ストア統合
  * Confidence: 75

* [ ] **8️⃣  WebSocket リアルタイム同期** – feature – 2025‑06‑02

  * Context: `task.updated`, `order.tasks.reordered` イベント購読
  * Confidence: 70

* [ ] **9️⃣  アクセシビリティ & ダークモード** – ui – 2025‑06‑03

  * Context: WCAG 2.1 AA、prefers‑color‑scheme ダークテーマ
  * Confidence: 80

* [ ] **🔟  テストスイート更新** – test – 2025‑06‑04

  * Context: Jest slice 単体テスト、RTL Drag & Edit、Playwright E2E
  * Confidence: 85

* [ ] **11️⃣  CI/CD パイプライン改修** – chore – 2025‑06‑05

  * Context: Build matrix `build:v2`, size‑limit コメント Bot
  * Confidence: 90

* [ ] **12️⃣  ステージング公開 & QA** – release – 2025‑06‑06

  * Context: Canary 5% ロールアウト、Sentry error\_rate <0.1% 確認
  * Confidence: 85

* [ ] **13️⃣  本番ロールアウト (100%)** – release – 2025‑06‑10

  * Context: フラグ `dashboard.v2.enabled=true`, `percent=100`
  * Confidence: 80

* [ ] **14️⃣  旧 UI 削除 & クリーンアップ** – refactor – 2025‑06‑12

  * Context: `/src/vue` ディレクトリ削除、unused CSS Token 削除
  * Confidence: 90

---

# In Progress

*(空欄で開始)*

---

# Blockers / Errors

*(詰まったらここへ移動)*

---

# Done

*(完了したらここへ移動)*

---

# Ideas & Icebox

* [ ] AI でタスク工数見積もり (GPT‑4o fine‑tune)
* [ ] Postgres→ClickHouse ログ分析移行

---

# Meta

* 毎朝 stand‑up 時に **In Progress** を確認し、終わったら **Done** へ移動。
* 金曜夕方に **Done** を `docs/archive/YYYY‑WW.md` へ退避して履歴を残す。
* 本 Scratchpad は 1 ファイル運用。GitHub 上でもドラッグ＆ドロップ可能 (Markdown Task List)。
* セクション見出しやタスクは *自由に挿入* して OK。ただし **Backlog → In Progress → Done** の流れを守ること。

---

© 2025 Commit Coach チーム
