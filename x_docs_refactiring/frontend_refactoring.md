# フロントエンド要件定義書 — Dashboard & Projects 統合

## 1. 目的

Dashboard（本日のタスク一覧）と Projects（タスク分解ツリー）を 1 画面に統合し、状態（status）フィルタによる二重表示を実現する。ユーザーは同一画面内でタスクの閲覧・編集・ステータス変更を完結できる。

## 2. 背景と課題

* 既存 UI ではページ間遷移時にデータ重複・同期ラグが発生し UX が低下していた。
* 親子タスク移動時に ID 競合が起きるなど実装負債が拡大。
* スマートフォンでの操作性も課題。

## 3. スコープ

| 項目                                         | 含む/含まない | 備考                            |
| ------------------------------------------ | ------- | ----------------------------- |
| Task/Project の CRUD                        | 含む      | Drag & Drop / モーダル編集          |
| Status 更新 (today/unscheduled/done/deleted) | 含む      | TodayPane は R/O（self-drop 無し） |
| タスクの階層 Drag & Drop                         | 含む      | dnd‑kit 利用                    |
| UI のレスポンシブ対応 (720px〜)                      | 含む      | Tailwind + CSS Grid           |
| オフライン対応                                    | 含まない    | 次フェーズで検討                      |
| カレンダー連携                                    | 含まない    | バックログに追加                      |

## 4. ターゲットペルソナ

* 週 3〜4 プロジェクトを並行するフリーランス
* PC ⟨80%⟩ / モバイル ⟨20%⟩ で日次タスクを管理

## 5. ユースケース & ユーザーストーリー

| No    | ユーザーストーリー                              | 優先度 |
| ----- | -------------------------------------- | --- |
| US‑01 | ユーザーとして、今日やるタスクだけを上部一覧で確認したい           | ★★★ |
| US‑02 | サブタスクをドラッグして “今日” に移動したい               | ★★★ |
| US‑03 | Task を Done にしたら TodayPane から自動で消えてほしい | ★★☆ |
| US‑04 | 誤操作で削除した Task を復元したい                   | ★★☆ |

## 6. 情報設計

### 6.1 ドメインモデル（フロント）

```ts
export type Status = 'today' | 'unscheduled' | 'done' | 'deleted';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: Status;
  sortIndex: number;
}
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: Status;
  sortIndex: number;
  subtasks: Subtask[];
}
export interface Project {
  id: string;
  title: string;
  status: Status; // project 自体は通常 unscheduled
  sortIndex: number;
  tasks: Task[];
}
```

### 6.2 状態管理フロー

```
Zustand Store
  ├─ projects[]
  ├─ tasks[]
  └─ subtasks[]
        ↓
<Server Sync Hook> (optimistic update → Supabase RPC)
```

## 7. 画面仕様

### 7.1 レイアウト

```
┌─ Header ─────────────────────────────────┐
│  Hamburger | Commit Coach | + New Task   │
└───────────────────────────────────────────┘
┌─ TodayPane (read‑only) ───────────────────┐
│  # 本日のタスク                           │
│  ▸ task B‑2  (Project B)                 │
│    ▸ subtask B‑2‑1                       │
│    ▸ subtask B‑2‑2                       │
│  ▸ task B‑3                              │
└───────────────────────────────────────────┘
┌─ ProjectPane (editable) ──────────────────┐
│  # Projects                               │
│  ▼ Project A                              │
│     ▸ task A‑1                           │
│     ▸ task A‑2                           │
│     ▾ task A‑3                           │
│         ▸ subtask A‑3‑1                  │
│         ▸ subtask A‑3‑2                  │
└───────────────────────────────────────────┘
```

### 7.2 コンポーネント一覧

| Component       | 役割                  | ライブラリ                  |
| --------------- | ------------------- | ---------------------- |
| `<TodayPane>`   | today フィルタ結果を縦リスト表示 | tanstack/virtual       |
| `<ProjectPane>` | project ツリー + DnD   | dnd‑kit                |
| `<TaskCard>`    | Task/Project 共通カード  | Headless UI + Tailwind |
| `<SubtaskRow>`  | Subtask 行           | –                      |
| `<StatusBadge>` | status 色分けラベル       | –                      |
| `<Toast>`       | Undo／操作通知           | radix‑ui               |

## 8. 機能要件

1. タスク／サブタスクの **ドラッグで status 更新**（ドロップ先で自動判定）。
2. TodayPane は **ドラッグソースのみ有効**（誤操作防止）。
3. done/deleted は 0.35s フェード後に ProjectPane からも非表示。
4. Undo トーストは 5s 表示、Undo で state rollback。
5. sortIndex は status 毎に振り直し、ドラッグ時に計算。

## 9. 非機能要件

* **FPS ≥ 55** @ 500 Tasks on M2 MBA (測定環境)。
* **初回 LCP < 2.5s** / Standard broadband。
* WCAG AA 準拠（キーボード操作、コントラスト、ARIA）。
* i18n 対応（ja / en-US）。
* lint/format: eslint‑next‑v3, prettier。
* Unit Test: Vitest + Testing Library、e2e: Playwright。

## 10. エラーハンドリング

| ケース               | 表示            | リトライ             |
| ----------------- | ------------- | ---------------- |
| Supabase write 失敗 | トースト「保存に失敗」   | 3 回自動、以降手動       |
| ネットワーク切断          | スナックバー「オフライン」 | Online イベントで自動再送 |

## 11. 測定 & テレメトリ

* `@vercel/analytics` でページ滞在時間と DnD 操作数を計測。
* Sentry で runtime error を収集。

## 12. スケジュール（暫定）

| マイルストーン   | 期間            | Deliverables                |
| --------- | ------------- | --------------------------- |
| UI プロトタイプ | 05/27 – 05/31 | Figma / Storybook           |
| Core 実装   | 06/01 – 06/14 | TodayPane / ProjectPane     |
| テスト & 調整  | 06/15 – 06/21 | Playwright suite pass ≥ 95% |
| リリース      | 06/22         | v0.9 tag                    |

## 13. オープン課題

* モバイルでの multi‑column DnD UX 調整。
* done/deleted の完全非表示にするかアーカイブ表示にするか。
* 状態が 4 種で足りるか？（例：in‑progress）

---

最終更新: 2025‑05‑22
