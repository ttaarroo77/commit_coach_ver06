
---

## 📁 ディレクトリツリー

```
apps/frontend/
├─ app/
│  └─ dashboard/
│     └─ page.tsx          ← いま貼り付けた巨大ファイル
├─ components/
│  ├─ sidebar.tsx
│  ├─ ai-coach-sidebar.tsx
│  ├─ hierarchical-task-item.tsx
│  └─ ui/
│     ├─ button.tsx
│     └─ card.tsx
└─ lib/
   └─ dashboard-utils.ts
```

---

## 1. `lib/dashboard-utils.ts`

```ts
/* apps/frontend/lib/dashboard-utils.ts */
export type SubTask = {
  id: string
  title: string
  completed: boolean
  startTime?: string
  endTime?: string
}

export type Task = {
  id: string
  title: string
  completed: boolean
  expanded: boolean
  progress: number
  status: "todo" | "in-progress" | "completed"
  subtasks: SubTask[]
  startTime?: string
  endTime?: string
}

export type Project = {
  id: string
  title: string
  completed: boolean
  expanded: boolean
  status: "todo" | "in-progress" | "completed"
  tasks: Task[]
  startTime?: string
  endTime?: string
}

export type TaskGroup = {
  id: "today" | "unscheduled" | string
  title?: string
  expanded: boolean
  projects: Project[]
}

/* ─── LocalStorage helpers ─── */
const STORAGE_KEY = "commit_coach_dashboard_v1"

export const getDashboardData = (): TaskGroup[] =>
  JSON.parse(typeof window === "undefined" ? "[]" : localStorage.getItem(STORAGE_KEY) ?? "[]")

export const saveDashboardData = (data: TaskGroup[]) => {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ─── CRUD shortcuts ─── */
export const addProjectToDashboard = (id: string, title: string, groupId: string) => {
  const data = getDashboardData()
  const group = data.find((g) => g.id === groupId)
  if (!group) return
  group.projects.push({
    id,
    title,
    completed: false,
    expanded: true,
    status: "todo",
    tasks: [],
  })
  saveDashboardData(data)
}

export const addTaskToProject = (title: string, projectId: string, groupId: string) => {
  const data = getDashboardData()
  const project = data
    .find((g) => g.id === groupId)
    ?.projects.find((p) => p.id === projectId)
  if (!project) return
  project.tasks.push({
    id: `task-${Date.now()}`,
    title,
    completed: false,
    expanded: true,
    progress: 0,
    status: "todo",
    subtasks: [],
  })
  saveDashboardData(data)
}

export const addSubtaskToTask = (
  title: string,
  taskId: string,
  projectId: string,
  groupId: string,
) => {
  const data = getDashboardData()
  const task = data
    .find((g) => g.id === groupId)
    ?.projects.find((p) => p.id === projectId)
    ?.tasks.find((t) => t.id === taskId)
  if (!task) return
  task.subtasks.push({
    id: `subtask-${Date.now()}`,
    title,
    completed: false,
  })
  saveDashboardData(data)
}

export const calculateProgress = (subs: SubTask[]) =>
  subs.length ? Math.round((subs.filter((s) => s.completed).length / subs.length) * 100) : 0
```

---

## 2. `components/ui/button.tsx`

```tsx
/* apps/frontend/components/ui/button.tsx */
"use client"
import { cn } from "@/lib/utils" // なければ削除 or 自作
import { ComponentPropsWithoutRef, forwardRef } from "react"

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition",
        variant === "ghost" && "hover:bg-gray-100",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        size === "sm" ? "h-7 px-2 text-sm" : "h-9 px-3",
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"
```

---

## 3. `components/ui/card.tsx`

```tsx
/* apps/frontend/components/ui/card.tsx */
import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef } from "react"

export const Card = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("rounded-lg border bg-white shadow-sm", className)} {...props} />
)

export const CardHeader = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("border-b", className)} {...props} />
)

export const CardContent = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("p-4", className)} {...props} />
)

export const CardTitle = ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
)
```

---

## 4. `components/sidebar.tsx`

```tsx
/* apps/frontend/components/sidebar.tsx */
"use client"
import Link from "next/link"

export const Sidebar = () => (
  <aside className="w-56 border-r p-4 space-y-2">
    <h2 className="font-bold mb-2">Commit Coach</h2>
    <nav className="space-y-1 text-sm">
      <Link href="/dashboard" className="block px-2 py-1 hover:bg-gray-100 rounded">
        ダッシュボード
      </Link>
    </nav>
  </aside>
)
```

---

## 5. `components/ai-coach-sidebar.tsx`

```tsx
/* apps/frontend/components/ai-coach-sidebar.tsx */
"use client"
export const AICoachSidebar = () => (
  <aside className="w-64 border-l p-4 hidden lg:block">
    <h3 className="font-semibold mb-2">AI コーチ</h3>
    <p className="text-sm text-gray-500">ここにコーチングメッセージを表示</p>
  </aside>
)
```

---

## 6. `components/hierarchical-task-item.tsx`

```tsx
/* apps/frontend/components/hierarchical-task-item.tsx */
"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

interface Props extends ComponentProps<"div"> {
  id: string
  title: string
  completed: boolean
  expanded?: boolean
  level: 1 | 2 | 3
  hasChildren?: boolean
  startTime?: string
  endTime?: string
  onToggleExpand?: () => void
  onToggleComplete?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  onTimeChange?: (start: string, end: string) => void
  dragHandleProps?: Record<string, unknown>
}

export const HierarchicalTaskItem = ({
  title,
  completed,
  expanded,
  level,
  hasChildren,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onAddChild,
  startTime,
  endTime,
  onTimeChange,
  dragHandleProps,
  className,
  ...rest
}: Props) => {
  /* 時間入力 */
  const timeInput =
    onTimeChange && level !== 3 ? (
      <div className="ml-2 flex items-center space-x-1">
        <input
          type="time"
          className="border rounded text-xs px-1 py-0.5"
          value={startTime ?? ""}
          onChange={(e) => onTimeChange(e.target.value, endTime ?? "")}
        />
        <span className="text-xs">〜</span>
        <input
          type="time"
          className="border rounded text-xs px-1 py-0.5"
          value={endTime ?? ""}
          onChange={(e) => onTimeChange(startTime ?? "", e.target.value)}
        />
      </div>
    ) : null

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1",
        level === 1 && "bg-gray-50",
        level === 2 && "pl-6",
        level === 3 && "pl-10",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center" {...dragHandleProps}>
        {hasChildren && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={onToggleExpand}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 text-green-600"
          onClick={onToggleComplete}
        >
          {completed ? <CheckSquare className="h-4 w-4" /> : <div className="h-4 w-4 border" />}
        </Button>

        <span className={cn("ml-2", completed && "line-through text-gray-400")}>{title}</span>
        {timeInput}
      </div>

      <div className="flex items-center space-x-1">
        {onAddChild && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={onAddChild}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

## 7. 既にある `page.tsx`

→ そのまま利用で OK（hooks／ハンドラの参照先はすべて上記 stub に一致させてある）。

---

### ✅ 手順

1. **上記ファイルをフォルダごとに配置**
2. `pnpm dev -F frontend` で起動
3. 404 が出たら `next.config.js` / `tsconfig.json` の `paths` を確認
4. 動いたら stub (`TODO`) を本実装に置き換えていこう！

---

**短いまとめ**
フォルダツリー＋7ファイルを丸ごとコピペ → 動けば stub を肉付け、でリファクタリング完了だよ！

---

