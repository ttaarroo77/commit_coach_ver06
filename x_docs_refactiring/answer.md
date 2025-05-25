# 🏁 Dashboard & Projects 統合 — 最終実装レポート

> **目的**
> Dashboard と Projects を 1 画面に統合する MVP を実現するうえで、移行・実装・パフォーマンス・環境整備に関する質問と回答を 1 本にまとめました。要件定義書 2‑1〜2‑4 を併せて参照してください。

---

## 📑 目次

1. [データモデル移行](#データモデル移行)
2. [DnD 実装詳細](#dnd-実装詳細)
3. [パフォーマンス最適化](#パフォーマンス最適化)
4. [バックエンド連携](#バックエンド連携)
5. [ディレクトリ構成への移行フロー](#ディレクトリ構成への移行フロー)
6. [開発準備 Q\&A](#開発準備-qa)
7. [未解決の課題](#未解決の課題)

---

## データモデル移行

### 変換ロジック概要

| 旧スキーマ                                      | 新 `status` 値  | 条件    |
| ------------------------------------------ | ------------- | ----- |
| `is_today_flag = true`                     | `today`       | 当日タスク |
| `is_today_flag = false` & `is_done = true` | `done`        | 完了済み  |
| `deleted_at IS NOT NULL`                   | `deleted`     | ごみ箱相当 |
| 上記以外                                       | `unscheduled` | 予定なし  |

### 移行 SQL (PostgreSQL / Supabase)

```sql
DO $$ BEGIN
  CREATE TYPE status AS ENUM ('today','unscheduled','done','deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE subtasks
  ADD COLUMN IF NOT EXISTS status status DEFAULT 'unscheduled';

UPDATE subtasks
SET status = CASE
  WHEN is_today_flag THEN 'today'
  WHEN is_done THEN 'done'
  WHEN deleted_at IS NOT NULL THEN 'deleted'
  ELSE 'unscheduled'
END;

ALTER TABLE subtasks
  DROP COLUMN is_today_flag,
  DROP COLUMN is_done;
```

> **Tip**: 複数テーブルを一括変換する場合は Supabase CLI の `db push --file` を利用し、`BEGIN; … COMMIT;` でラップすると安全です。

---

## DnD 実装詳細

### 最小構成 (dnd‑kit)

```tsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={subtasksIds} strategy={verticalListSortingStrategy}>
    {subtasksIds.map(id => <SubtaskRow key={id} id={id} />)}
  </SortableContext>
</DndContext>
```

### `sortIndex` 再計算

```ts
function reorder(ids: string[], activeId: string, overId: string) {
  return arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId));
}

function handleDragEnd({ active, over }: DragEndEvent) {
  if (!over) return;
  const newOrder = reorder(list, active.id, over.id);
  const toStatus: Status = over.data.current?.status ?? 'unscheduled';
  moveSubtask(active.id, toStatus, newOrder.indexOf(active.id));
}
```

### TodayPane をドラッグ「ソースのみ」にする方法

```tsx
/* TodayPane.tsx — Droppable コンテナを配置しない */
<SortableContext items={todayIds} strategy={verticalListSortingStrategy}>
  {todayIds.map(id => <SubtaskRow key={id} id={id} />)}
</SortableContext>
```

> `pointer-events-none` を適用せず、**Droppable を置かない**ことでドロップ不可を保証します。

---

## パフォーマンス最適化

### tanstack/virtual 導入例

```tsx
const parentRef = useRef<HTMLDivElement>(null);
const rowVirtualizer = useVirtual({
  size: subtasks.length,
  parentRef,
  overscan: 10,
});
```

* **overscan**: 10〜15 が目安。
* React 18 の `useId()` を key に使い、不要リレンダリングを防止。

### 計測フロー

1. React DevTools Profiler で 500 行スクロールを録画。
2. 16 ms を超えるコミットを特定し `memo` / `forwardRef` で改善。
3. ブラウザの Performance panel でもフレームドロップを確認し、**FPS ≥ 55** を担保。

---

## バックエンド連携

### Edge Functions 呼び出し

```ts
export async function moveSubtask(id: string, status: Status, index: number) {
  const { error } = await supabase.functions.invoke('move_subtask', {
    body: { id, status, index },
  });
  if (error) throw error;
}
```

### Realtime 購読戦略

```ts
const channel = supabase
  .channel(`subtasks:${taskId}`)
  .on('postgres_changes', { event: '*', table: 'subtasks', filter: `task_id=eq.${taskId}` }, handle)
  .subscribe();
```

* **多チャンネル管理**: `Map<taskId, channel>` を保持し、折り畳み閉鎖時に `unsubscribe()` で解放。
* **省チャネル案**: `projects:<user_id>` 1 本で全変更を受け取り、フロントでフィルタする方法もある。負荷計測のうえ選択。

---

## ディレクトリ構成への移行フロー

| フェーズ   | 主作業                      | ディレクトリ変更             |
| ------ | ------------------------ | -------------------- |
| **F1** | ブランチ作成                   | 既存構造維持               |
| **F2** | ドメインモデル (`types/`) 新設    | `types/` 追加          |
| **F3** | Zustand ストア刷新            | `store/` 新設          |
| **F4** | ページ統合 (`/dashboard.tsx`) | 旧ページと共存              |
| **F5** | コンポーネント再配置               | `components/ui/` 作成  |
| **F6** | Edge Functions 追加        | `edge-functions/` 作成 |
| **F7** | 不要ページ削除 & ルーティング整理       | 最終構成確定               |

> **段階的に**: F1〜F4 を並行デプロイで安全に切り替え、F7 でクリーンアップします。

---

## 開発準備 Q\&A

| カテゴリ         | Q                         | A                                                                                                   |
| ------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| **コードベース**   | 重要コンポーネントは？               | `DashboardNestedList`, `ProjectAccordion`, `TaskCard`, `SubtaskRow`, そして `use-dashboard.ts` ストアが中核。 |
|              | 折り畳み機能に既知の問題は？            | **未確認**                                                                                             |
| **認証 / RLS** | owner\_id チェックは実装済み？      | **未確認**                                                                                             |
|              | auth.users 連携は？           | **未確認**                                                                                             |
| **データ移行**    | 既存データ量 & 所要時間は？           | **未確認**                                                                                             |
|              | ローカルにもマイグレーション必要？         | **必要** — `supabase db reset` + 移行 SQL 実行。                                                           |
| **環境設定**     | Supabase CLI セットアップ状況     | **未確認**                                                                                             |
|              | Edge Functions のローカルテスト方法 | `supabase functions serve --env-file .env.local` でホットリロードし、Playwright で叩く。                          |
| **優先度**      | 最初に着手すべきは？                | ① ブランチ & 依存更新 → ② ドメインモデル整備 → ③ ストア刷新。                                                              |
|              | 既知の注意点                    | `any` 型が散在、strict モード有効化でビルドが赤くなる想定。                                                                |

---

## 未解決の課題

* 既存折り畳み機能の具体的な問題点は？
* RLS (owner\_id) が現行 DB に適用済みか？
* auth.users との具体的な紐付け方法は？
* 既存データ量と移行所要時間の見積もりは？
* Supabase CLI が全開発者環境に導入済みか？

> **次ステップ**: 未解決項目をチーム内で確認し、このレポートを更新してください。

---

最終更新: 2025‑05‑22
