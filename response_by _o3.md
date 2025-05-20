

---

## 1. データ構造／DB まわり

### 1-1. Supabase マイグレーション

```sql
-- ① tasks テーブルに親参照を追加（NULL = 最上位）
alter table tasks
add column parent_task_id uuid references tasks(id) on delete cascade;

-- ② ついでにインデックスを貼っておくとツリー展開が軽くなります
create index tasks_parent_idx on tasks(parent_task_id);
```

### 1-2. 共有型 (`packages/shared-types/src/task.ts`)

```ts
export interface Task {
  id: string;
  projectId: string;
  parentTaskId: string | null;   // ★追加
  title: string;
  completed: boolean;
  startTime?: string | null;
  endTime?: string | null;

  /** フロントで組み立てる木構造用プロパティ */
  children?: Task[];
}
```

---

## 2. クライアント側ユーティリティ

`apps/frontend/lib/buildTree.ts`

```ts
import { Task } from "@shared-types/task";

export const buildTaskTree = (flat: Task[]): Task[] => {
  const map = new Map<string, Task & { children: Task[] }>();
  flat.forEach(t => map.set(t.id, { ...t, children: [] }));

  const roots: Task[] = [];
  map.forEach(t => {
    if (t.parentTaskId) {
      map.get(t.parentTaskId)?.children.push(t);
    } else {
      roots.push(t);
    }
  });

  return roots;
};
```

---

## 3. コンポーネント

### 3-1. `HierarchicalTaskItem.tsx`

```tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@shared-types/task";

type Props = {
  task: Task;
  level?: number;                          // 0:Project 1:Task 2:Subtask
  onAddChild?: (parentId: string) => void; // Subtask には表示しない
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, done: boolean) => void;
};

const INDENTS = ["pl-0", "pl-6", "pl-12"]; // Tailwind でインデント段を決定

export const HierarchicalTaskItem = ({
  task,
  level = 0,
  onAddChild,
  onDelete,
  onToggleComplete,
}: Props) => {
  const [open, setOpen] = useState(true);
  const hasChildren = task.children && task.children.length > 0;

  return (
    <>
      <div className={cn("flex items-center py-1", INDENTS[level] ?? "pl-12")}>
        {/* 展開トグル */}
        {hasChildren ? (
          <button
            className="mr-1 rounded hover:bg-muted/60"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="mr-5 w-4" /> /* アイコン位置合わせ */
        )}

        {/* 完了チェック */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={v => onToggleComplete?.(task.id, !!v)}
          className="mr-2"
        />

        {/* タイトル */}
        <span
          className={cn(
            "flex-1 text-sm",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>

        {/* 時間帯表示（任意） */}
        {task.startTime && task.endTime && (
          <span className="mr-2 flex items-center text-xs text-muted-foreground">
            <Clock size={14} className="mr-1" />
            {task.startTime} – {task.endTime}
          </span>
        )}

        {/* + は Project と Task レベルにのみ表示 */}
        {level < 2 && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onAddChild?.(task.id)}
            className="hover:bg-primary/10"
          >
            <Plus size={18} className="text-sky-600" />
          </Button>
        )}

        {/* ゴミ箱は全レベルで表示 */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete?.(task.id)}
          className="hover:bg-destructive/10"
        >
          <Trash2 size={18} className="text-red-500" />
        </Button>
      </div>

      {/* 再帰レンダリング */}
      {hasChildren && open && (
        <div>
          {task.children!.map(child => (
            <HierarchicalTaskItem
              key={child.id}
              task={child}
              level={level + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </>
  );
};
```

### 3-2. ダッシュボード側での呼び出し例

```tsx
// apps/frontend/app/dashboard/page.tsx
import { buildTaskTree } from "@/lib/buildTree";
import { HierarchicalTaskItem } from "@/components/hierarchical-task-item";
import { useTasks } from "@/hooks/useTasks"; // ← supabase から平坦な配列で fetch

export default function Dashboard() {
  const { tasks, addChild, toggleDone, remove } = useTasks();
  const tree = buildTaskTree(tasks);

  return (
    <section className="space-y-2">
      {tree.map(t => (
        <HierarchicalTaskItem
          key={t.id}
          task={t}
          onAddChild={addChild}
          onToggleComplete={toggleDone}
          onDelete={remove}
        />
      ))}
    </section>
  );
}
```

---

## 4. アイコン配色だけ変えたい場合

Tailwind でクラスだけ追加すれば OK です。上記のとおり

```tsx
<Plus  className="text-sky-600" />
<Trash2 className="text-red-500" />
```

にしてあります（背景に溶け込まない別色）。

---

## 5. 将来の **Project Page → Dashboard 反映** について

* **追加時ロジック**

  1. Project ページで「プロジェクト作成」→ `tasks` に `parent_task_id = NULL` で 1 件 INSERT
  2. 同ページから「タスク追加」→ `parent_task_id = <プロジェクトID>`
  3. サブタスクの場合 → `parent_task_id = <タスクID>`
* Dashboard 側は **常に平坦な配列を再取得** → `buildTaskTree()` で木構築するだけなので、新規追加が即座に 3 階層で表示されます。再レンダリングは SWR か React Query の `mutate`/`invalidate` が楽。

---

### これで「3レベル階層表示」＋「見やすい +／ゴミ箱アイコン」が完成です。

動かしてみて詰まる所があれば気軽に教えてください 💪
