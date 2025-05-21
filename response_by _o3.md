# Dashboard ― 「今日のタスク ↔ 未定のタスク」矢印ボタン 実装ガイド

> apps/frontend/app/dashboard 配下の **プロジェクト／タスク／サブタスク** を、
> *today* ↔ *unscheduled* の 2 グループ間で移動させるための実装手順。
>
> **目的：**
>
> * **今日のタスク** (group.id === `"today"`) には ↓ ボタンのみ
> * **未定のタスク** (group.id === `"unscheduled"`) には ↑ ボタンのみ
> * プロジェクト／タスク／サブタスクいずれも同じ操作感
>
> ---

## 0. ざっくり構造把握

| レイヤ                | 主なファイル                                                                         | 役割                                                           |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **UI コンポーネント**     | `_components/DashboardItemRow.tsx`                                             | 単一行（プロジェクト／タスク／サブタスク）の表示。ここで矢印ボタンを描画する                       |
|                    | `_components/DashboardNestedList.tsx`<br>`_components/DashboardItemRow.tsx` など | DnD & ネスト描画。`onMoveUp / onMoveDown` props を渡している             |
| **状態管理 (Zustand)** | `_hooks/use-dashboard.ts`                                                      | taskGroups state とユーティリティ (`moveProjectBetweenGroups` 等) を公開 |
| **ユーティリティ**        | `lib/dashboard-utils.ts`                                                       | 型定義 (`TaskGroup / Project / Task / SubTask`) と汎用 helper      |

---

## 1. 型と state の前提

```ts
// dashboard-utils.ts（抜粋）
export interface SubTask { id: string; title: string; completed: boolean; }
export interface Task    { id: string; title: string; completed: boolean; subtasks: SubTask[]; }
export interface Project { id: string; title: string; completed: boolean; tasks: Task[]; }
export interface TaskGroup { id: "today" | "unscheduled"; expanded: boolean; projects: Project[]; }
```

`use-dashboard.ts` では次のような shape の state を保持している想定です。

```ts
const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(initialGroups);
```

---

## 2. Context に “移動” ユーティリティを実装

### 2-1. `moveProjectBetweenGroups`

```ts
/**
 * Project 全体を today ↔ unscheduled に移動させる
 */
const moveProjectBetweenGroups = (
  from: "today" | "unscheduled",
  to: "today" | "unscheduled",
  projectId: string,
) =>
  setTaskGroups(prev => {
    // 1) 取り出し
    const project = prev
      .find(g => g.id === from)!.projects
      .find(p => p.id === projectId)!;

    // 2) 削除 & 追加
    return prev.map(g => {
      if (g.id === from) {
        return { ...g, projects: g.projects.filter(p => p.id !== projectId) };
      }
      if (g.id === to) {
        return { ...g, projects: [project, ...g.projects] };
      }
      return g;
    });
  });
```

### 2-2. `moveTaskBetweenGroups`

```ts
/**
 * Task / SubTask を today ↔ unscheduled に移動させる
 */
const moveTaskBetweenGroups = (
  from: "today" | "unscheduled",
  to: "today" | "unscheduled",
  projectId: string,
  taskId: string,
  subtaskId?: string, // undefined → Task, defined → SubTask
) =>
  setTaskGroups(prev => {
    // 1) source から取り出し
    let moved: Task | SubTask | undefined;
    const newPrev = prev.map(g => {
      if (g.id !== from) return g;

      return {
        ...g,
        projects: g.projects.map(p => {
          if (p.id !== projectId) return p;
          if (subtaskId) {
            return {
              ...p,
              tasks: p.tasks.map(t => {
                if (t.id !== taskId) return t;
                const subtask = t.subtasks.find(s => s.id === subtaskId)!;
                moved = subtask;
                return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
              }),
            };
          }
          const task = p.tasks.find(t => t.id === taskId)!;
          moved = task;
          return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
        }),
      };
    });

    // 2) target に追加
    return newPrev.map(g => {
      if (g.id !== to) return g;
      return {
        ...g,
        projects: g.projects.map(p => {
          if (p.id !== projectId) return p;
          if (subtaskId && moved && "title" in moved) {
            // SubTask
            return {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId ? { ...t, subtasks: [moved as SubTask, ...t.subtasks] } : t,
              ),
            };
          }
          // Task
          return { ...p, tasks: [moved as Task, ...p.tasks] };
        }),
      };
    });
  });
```

> **ポイント**
>
> * **mutation を避けて** `prev.map` で深いコピーを作り直す
> * Task と SubTask のロジックを 1 関数でまとめると楽

`useDashboard` で上記 2 関数を `return` し、UI 側から呼べるようにします。

```ts
return {
  …既存の ctx,
  moveProjectBetweenGroups,
  moveTaskBetweenGroups,
};
```

---

## 3. UI ― `DashboardItemRow.tsx` を修正

1. props に下記を追加

   ```ts
   onMoveUp?: () => void;
   onMoveDown?: () => void;
   groupId: "today" | "unscheduled";
   ```

2. ボタンを描画

   ```tsx
   {onMoveUp && (
     <ArrowUpCircle
       size={16}
       className="cursor-pointer text-gray-500 hover:text-gray-800"
       onClick={onMoveUp}
     />
   )}
   {onMoveDown && (
     <ArrowDownCircle
       size={16}
       className="cursor-pointer text-gray-500 hover:text-gray-800"
       onClick={onMoveDown}
     />
   )}
   ```

3. `groupId` に応じて親側で props を渡す（コードはすでに記載済み）。

> **注 :** すでに `_components/DashboardNestedList.tsx` で `onMoveUp / onMoveDown` を渡しているため、描画さえ行えばボタンは機能する。

---

## 4. 動作確認

1. `pnpm --filter frontend dev` でローカル起動
2. **今日のタスク** のプロジェクト行で ↓ をクリック → "未定" に即移動
3. **未定のタスク** で ↑ をクリック → "今日" に移動
4. タスク／サブタスクにも同様に矢印が表示・移動するか確認
5. コンソール警告（key 重複・state ミューテーション）などが無いかチェック

---

## 5. よくあるハマりポイント

| 症状                          | 原因                                      | 対処                                          |
| --------------------------- | --------------------------------------- | ------------------------------------------- |
| ボタンクリックで UI は変わるが次の再読込で元に戻る | Supabase など永続層へ `UPDATE` していない          | `move*` 内で API 叩く or `useEffect` で sync     |
| サブタスク移動で `undefined` エラー    | `subtaskId` が `Task` 側にも存在すると思い込んでいる    | 深いコピーの順序を確認し、`find` の結果 null チェック           |
| DnD と衝突してドラッグ開始時にボタンが誤反応    | `<button>` 内で `e.stopPropagation()` を呼ぶ | `onClick={e => { e.stopPropagation(); … }}` |

---

## 6. 次の拡張アイデア

* ドラッグ＆ドロップでも today ↔ unscheduled 間の移動をサポート（`dnd-kit` `useDroppable` を利用）
* 移動後にトースト通知 / アンドゥ実装（`use-toast.ts` を流用）
* タグや優先度を付けて並び替え条件を複合化

---

### 以上

このドキュメントを **windsurf** に貼り付ければ、開発者が不足無く実装できるはずです。もし `use-dashboard.ts` の実装詳細や別ファイルの I/F が分からなければ、該当ファイルを共有してください。
