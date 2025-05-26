# 状態管理仕様 (v2 – 2 タブ構成)

本書では、Commit Coach ダッシュボードを 2 タブ構成 (`Plan` / `Work`) に再構築するにあたり採用する **フロントエンド状態管理の詳細** を定義する。実装は **Zustand** + **Immer** をベースに、サーバ通信には **React Query** を組み合わせる。

> **前提バージョン**
>
> * React 18
> * Zustand 4.x（middleware: `immer`, `subscribeWithSelector`, `persist`）
> * @tanstack/react-query 5.x

---

## 1. 目的

* **シングルソースオブトゥルース**：Plan / Work タブ間で常に同一データを参照。
* **楽観的 UI**：Create / Update / Delete 時に即時フィードバックを行い、ネットワーク遅延を隠蔽。
* **スケーラブルな slice 構成**：将来的なチーム機能やファイル添付などを無理なく拡張。

---

## 2. ストア全体構造

```ts
export interface RootState {
  entities: {
    projects: Record<ProjectId, Project>;
    tasks:    Record<TaskId, Task>;
    subtasks: Record<SubtaskId, Subtask>;
  };
  order: {
    projectIds: ProjectId[];          // Planタブ: プロジェクト表示順
    taskIds:    Record<ProjectId, TaskId[]>;
    subtaskIds: Record<TaskId, SubtaskId[]>;
  };
  ui: {
    activeTab: "plan" | "work";
    editingItem: {
      type: "project" | "task" | "subtask";
      id: string;
      field: "title" | "description" | "dueDate";
    } | null;
    draggingId: string | null;
    toast: ToastState;
  };
  // キャッシュキーと React Query hydration 用
  version: number;
}
```

* **Normalized Structure**：ID → Entity の辞書 + 並び順 array の 2 段構成に統一。
* **editingItem**：インラインエディタがマウント解除されても保持し続け、タブ切替時に復元。
* **version**：サーバからの `etag` を保存。差分更新やオフライン同期に使用。

---

## 3. Slice 設計

| Slice             | 責務                     | 主な API                                                   |
| ----------------- | ---------------------- | -------------------------------------------------------- |
| **entitiesSlice** | エンティティの CRUD / 正規化     | `addProject`, `updateTask`, `deleteSubtask`, `bulkMerge` |
| **orderSlice**    | 並び順の永続化、ドラッグ & ドロップ処理  | `reorderProjects`, `reorderTasks`, `moveTaskToProject`   |
| **uiSlice**       | アクティブタブ、編集中アイテム、トーストなど | `setActiveTab`, `startEdit`, `stopEdit`, `showToast`     |
| **metaSlice**     | バージョン管理、オフラインフラグ       | `setVersion`, `setOffline`                               |

各 slice は **`create<name>Slices`** ファクトリ関数で定義し、`createRootStore` で組み合わせる。

```ts
import { create } from "zustand";
import { devtools, immer, subscribeWithSelector } from "zustand/middleware";

export const useRootStore = create<RootState>()(
  devtools(
    subscribeWithSelector(
      immer((...rest) => ({
        ...createEntitiesSlice(...rest),
        ...createOrderSlice(...rest),
        ...createUiSlice(...rest),
        ...createMetaSlice(...rest),
      }))
    ),
    { name: "commit-coach" }
  )
);
```

---

## 4. React Query と連携

* **Query key** は `["projects"]`, `["tasks", projectId]`, `["subtasks", taskId]` の 3 階層構造。
* **Mutation** では `onMutate` で楽観的に store を先更新し、`onError` でロールバック。
* **Invalidate 戦略**：成功後に対象階層だけ `invalidateQueries` し、WebSocket 経由で他クライアントへ Push される変化を取り込む。

```ts
const mutation = useMutation(patchProject, {
  onMutate: async ({ id, payload }) => {
    await queryClient.cancelQueries(["projects"]);
    const prev = queryClient.getQueryData<Project[]>(["projects"]);
    useRootStore.getState().updateProject(id, payload); // 楽観的更新
    return { prev };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.prev) queryClient.setQueryData(["projects"], ctx.prev);
  },
  onSuccess: () => queryClient.invalidateQueries(["projects"]),
});
```

---

## 5. ドラッグ & ドロップフロー

```mermaid
flowchart LR
  A[ユーザがカードを掴む] --> B((draggingId 更新))
  B --> C[並び順をメモリ上で変更]
  C --> D[drop]
  D --> E{並び順に変化?}
  E -- Yes --> F[orderSlice.reorder*()]
  F --> G[useMutation(saveOrder)]
  G --> H[invalidateQueries]
  E -- No --> H
```

* **パフォーマンス**：`draggingId` は選択レンダリング対象だけ再描画。大量要素でも 60 fps を維持。

---

## 6. 派生 (Selector) API

共通ヘルパを `selectors.ts` に集約。Zustand の `useStore(selector, shallow)` でコンポーネントを最小再描画に保つ。

```ts
export const useProjectById = (id: ProjectId) =>
  useRootStore((s) => s.entities.projects[id]);
export const useOrderedTasks = (projectId: ProjectId) =>
  useRootStore((s) => s.order.taskIds[projectId].map((tid) => s.entities.tasks[tid]), shallow);
```

---

## 7. 中間ウェア & 永続化

| ミドルウェア                   | 目的                                       |
| ------------------------ | ---------------------------------------- |
| **localStorage persist** | サインイン前のローカル下書きを保持 (expires: 7 日)         |
| **undo/redo**            | `ctrl+Z / shift+ctrl+Z` で操作履歴を 20 ステップ保存 |
| **logger (dev only)**    | slice ごとの差分を console.group で出力           |
| **offlineQueue**         | オフライン時にミューテーションをキューして再接続時 flush          |

---

## 8. エラーハンドリング & 冗長化

* **Conflict (409)**：トースト + モーダルで“サーバ側が更新済”を提示し、`overwrite` または `merge` をユーザに選択させる。
* **Network Error**：オフラインモードへ遷移し、ストア書き込みはキューイング。
* **Fatal (500)**：state を巻き戻し、Sentry へ例外を送信。

---

## 9. テスト指針

* **単体テスト**：slice の pure reducer 関数を Jest で検証。
* **統合テスト**：RTL + MSW でドラッグ & 編集シナリオを網羅。
* **E2E**：Playwright で Plan ↔ Work 切替/編集/並び替えを 3 ブラウザ (Chrome, Firefox, Safari) で実行。

---

## 10. 将来拡張

* **multiAccountSlice**：複数ワークスペース対応
* **commentSlice**：コメントストリーム (v3)
* **fileSlice**：添付ファイルと presigned URL (v2.1)

---

© 2025 Commit Coach フロントエンドチーム
