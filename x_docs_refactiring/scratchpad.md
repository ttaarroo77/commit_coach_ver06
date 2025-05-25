# 🗒️ commit‑coach Scratchpad — Dashboard 統合フロント改修

> **目的** 
> Dashboard と Projects を 1 画面に統合し、フロントエンドのリファクタを段階的に完了する。単一ファイルで進捗を管理し、Cursor / windsurf どちらでも同じ形式で扱えるようにする。

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

### 💡 Milestone `unify-dashboard-projects`

* [ ] **1️⃣  ブランチ戦略確立** – chore – 2025‑05‑24

  * Context: `feature/unify-dashboard-projects` ブランチ作成、PR 運用方針を決定
  * Owner: @Taro
  * Confidence: 95

* [ ] **2️⃣  依存パッケージ更新** – chore – 2025‑05‑24

  * Context: `dnd-kit@latest`, `@tanstack/virtual`, `zustand`, `@headlessui/react`, `eslint-next-v3` へアップグレード
  * Confidence: 90

* [ ] **3️⃣  TypeScript strict 化** – refactor – 2025‑05‑24

  * Context: `strictNullChecks` を `true`、`any` の撲滅を開始
  * Confidence: 85

* [ ] **4️⃣  ドメインモデル再編** – refactor – 2025‑05‑25

  * Context: `/types/domain.ts` に `Status` enum & `Project / Task / Subtask` 型を集約
  * Confidence: 88

* [ ] **5️⃣  Zustand ストア刷新** – feature – 2025‑05‑26

  * Context: `useProjectStore` を新設し `moveSubtask`, `bulkUpdateStatus`, `reorderSubtasks` を実装
  * Confidence: 80

* [ ] **6️⃣  UI レイアウト統合** – ui – 2025‑05‑27

  * Context: `/dashboard` と `/projects` を `/pages/dashboard.tsx` に統合、SWR fetch 化
  * Confidence: 75

* [ ] **7️⃣  TodayPane Skeleton** – ui – 2025‑05‑28

  * Context: 読み取り専用リスト + Skeleton を実装
  * Confidence: 80

* [ ] **8️⃣  ProjectPane & VirtualScroll** – ui – 2025‑05‑29

  * Context: 折り畳みツリー + `@tanstack/virtual` でパフォーマンス最適化
  * Confidence: 75

* [ ] **9️⃣  Drag‑and‑Drop 統合** – feature – 2025‑05‑30

  * Context: `DndContext` をルートで wrap、`onDragEnd` ハンドラを実装
  * Confidence: 70

* [ ] **🔟  Realtime サブスクリプション** – feature – 2025‑05‑31

  * Context: Supabase `subtasks:<task_id>` チャネルを購読しストアへ反映
  * Confidence: 70

* [ ] **11️⃣  UI/UX 微調整 & アクセシビリティ** – ui – 2025‑06‑01

  * Context: Toast + ダークモード + WCAG チェック
  * Confidence: 80

* [ ] **12️⃣  テスト更新** – test – 2025‑06‑02

  * Context: Unit (`moveSubtask`)、Storybook visual、Playwright E2E（DnD）
  * Confidence: 85

* [ ] **13️⃣  CI/CD パイプライン更新** – chore – 2025‑06‑03

  * Context: GitHub Actions に build/test、Vercel Preview 自動コメント
  * Confidence: 90

* [ ] **14️⃣  デプロイ & リリース** – release – 2025‑06‑04

  * Context: ステージング確認後 `frontend-v0.9` タグを Production へ promote
  * Confidence: 85

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

* [ ] Task 仮想化 (react‑window)
* [ ] GPT‑4o で「今日やるべきタスク提案」

---

# Meta

* 毎朝 stand‑up 時に **In Progress** を確認し、終わったら **Done** へ移動。
* 週末に **Done** を `docs/archive/YYYY‑WW.md` へ退避。
* 本 Scratchpad は 1 ファイル運用。PR や Issue ではなく、この Markdown 内でドラッグ＆ドロップして整理する。
