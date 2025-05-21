
# Commit Coach – `/projects` 機能実装タスク仕様書
*(フロントエンド: `apps/frontend/app/projects`)*

---

## ゴール
1. **「要件定義・設計」「フロントエンド開発」「バックエンド連携・API実装」** すべてで
   - タスク / サブタスクを自由に追加・展開・削除
   - 行アイコン : `＋` `{}` `🕒` `🗑️` が機能
2. **サブタスク行** は `＋` と `{}` を **非表示**
3. **余計なテキストメニュー**（例:「＋ 新しいタスクを追加」）は表示しない
4. `🕒` で選択した項目は `/dashboard` に即反映
5. 一番下に **「＋ 新しいプロジェクトを追加」** だけを固定

---

## ディレクトリ / 変更ファイル

| 種別 | パス | 目的 |
|------|------|------|
| **NEW** | `apps/frontend/store/useProjects.ts` | Zustand グローバルストア |
| **NEW** | `apps/frontend/components/ItemRow.tsx` | 行 UI (アイコン & タイトル編集) |
| **NEW** | `apps/frontend/components/NestedList.tsx` | 3 階層を再帰レンダリング |
| **MODIFY** | `apps/frontend/app/projects/page.tsx` | `NestedList` を呼び出す簡素版に差し替え |

> **import エイリアス**
> `tsconfig.json` ですでに `@/*` が `apps/frontend/*` を指す設定あり。
> 新規ファイルを置けば `import { useProjects } from "@/store/useProjects"` が通る。

---

## 0. 依存追加

```bash
cd apps/frontend
pnpm add zustand clsx
```

---

## 1. `store/useProjects.ts`

```tsx
import { create } from "zustand"

/* 型定義 */
export type Subtask = { id: string; title: string; completed: boolean }
export type Task    = { id: string; title: string; completed: boolean; expanded: boolean; subtasks: Subtask[] }
export type Project = { id: string; title: string; expanded: boolean; tasks: Task[] }

/* 初期ダミーデータ */
const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "要件定義・設計",
    expanded: true,
    tasks: [
      {
        id: "task-1",
        title: "プロジェクト準備",
        completed: false,
        expanded: true,
        subtasks: [
          { id: "subtask-1-1", title: "プロジェクトの目的と範囲の定義", completed: false },
          { id: "subtask-1-2", title: "主要なステークホルダーの特定",  completed: false },
          { id: "subtask-1-3", title: "プロジェクト計画書の作成",        completed: false },
        ],
      },
    ],
  },
  { id: "project-2", title: "フロントエンド開発",        expanded: false, tasks: [] },
  { id: "project-3", title: "バックエンド連携・API実装", expanded: false, tasks: [] },
]

type Store = {
  projects: Project[]
  selectedForDashboard: string[]
  /* CRUD & UI アクション */
  addProject: () => void
  deleteProject: (projectId: string) => void
  toggleProjectExpanded: (projectId: string) => void
  updateProjectTitle: (projectId: string, title: string) => void
  addTask: (projectId: string) => void
  deleteTask: (projectId: string, taskId: string) => void
  toggleTaskExpanded: (projectId: string, taskId: string) => void
  updateTaskTitle: (projectId: string, taskId: string, title: string) => void
  addSubtask: (projectId: string, taskId: string) => void
  deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => void
  updateSubtaskTitle: (projectId: string, taskId: string, subtaskId: string, title: string) => void
  toggleComplete: (level:"task"|"subtask", ids:string[]) => void
  toggleDashboard: (id:string)=>void
  breakdown: (level:"project"|"task", ids:string[]) => void
}

export const useProjects = create<Store>((set) => ({
  projects: mockProjects,
  selectedForDashboard: [],

  /* --- Project --- */
  addProject: () =>
    set((s) => ({
      projects: [
        ...s.projects,
        { id: `project-${Date.now()}`, title: "新しいプロジェクト", expanded: true, tasks: [] },
      ],
    })),
  deleteProject: (projectId) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== projectId) })),
  toggleProjectExpanded: (projectId) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === projectId ? { ...p, expanded: !p.expanded } : p)),
    })),
  updateProjectTitle: (projectId, title) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === projectId ? { ...p, title } : p)),
    })),

  /* --- Task --- */
  addTask: (projectId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              expanded: true,
              tasks: [
                ...p.tasks,
                {
                  id: `task-${Date.now()}`,
                  title: "新しいタスク",
                  completed: false,
                  expanded: true,
                  subtasks: [],
                },
              ],
            }
          : p
      ),
    })),
  deleteTask: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
      ),
    })),
  toggleTaskExpanded: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, expanded: !t.expanded } : t
              ),
            }
          : p
      ),
    })),
  updateTaskTitle: (projectId, taskId, title) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
            }
          : p
      ),
    })),

  /* --- Subtask --- */
  addSubtask: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      expanded: true,
                      subtasks: [
                        ...t.subtasks,
                        {
                          id: `subtask-${Date.now()}`,
                          title: "新しいサブタスク",
                          completed: false,
                        },
                      ],
                    }
                  : t
              ),
            }
          : p
      ),
    })),
  deleteSubtask: (projectId, taskId, subtaskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
                  : t
              ),
            }
          : p
      ),
    })),
  updateSubtaskTitle: (projectId, taskId, subtaskId, title) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      subtasks: t.subtasks.map((st) =>
                        st.id === subtaskId ? { ...st, title } : st
                      ),
                    }
                  : t
              ),
            }
          : p
      ),
    })),

  /* --- 共通 --- */
  toggleComplete: (level, ids) =>
    set((s) => {
      const [pId, tId, stId] = ids
      return {
        projects: s.projects.map((p) => {
          if (p.id !== pId) return p
          if (level === "task") {
            return {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === tId ? { ...t, completed: !t.completed } : t
              ),
            }
          }
          if (level === "subtask") {
            return {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === tId
                  ? {
                      ...t,
                      subtasks: t.subtasks.map((st) =>
                        st.id === stId ? { ...st, completed: !st.completed } : st
                      ),
                    }
                  : t
              ),
            }
          }
          return p
        }),
      }
    }),

  toggleDashboard: (id) =>
    set((s) => ({
      selectedForDashboard: s.selectedForDashboard.includes(id)
        ? s.selectedForDashboard.filter((x) => x !== id)
        : [...s.selectedForDashboard, id],
    })),

  breakdown: () => alert("今はダミーです 🚧"),
}))
```

---

## 2. `components/ItemRow.tsx`

```tsx
"use client"
import { useState, KeyboardEvent } from "react"
import {
  Trash2, Plus, Clock, Braces, ChevronDown, ChevronRight,
} from "lucide-react"
import clsx from "clsx"

type Props = {
  indent?: number
  hasChildren?: boolean
  expanded?: boolean
  onToggle?: () => void
  title: string
  onTitleChange: (v: string) => void
  onAdd?: () => void
  onBreakdown?: () => void
  onDelete: () => void
  onClock: () => void
  completed?: boolean
  onToggleComplete?: () => void
  isSubtask?: boolean
}

export const ItemRow = ({
  indent = 0,
  hasChildren,
  expanded,
  onToggle,
  title,
  onTitleChange,
  onAdd,
  onBreakdown,
  onDelete,
  onClock,
  completed,
  onToggleComplete,
  isSubtask,
}: Props) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)

  const finish = () => {
    onTitleChange(draft.trim() || title)
    setEditing(false)
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === "Enter") finish()
    if (e.key === "Escape") {
      setDraft(title)
      setEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: indent }}>
      {/* 矢印 */}
      {hasChildren ? (
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ) : (
        <div style={{ width: 24 }} />
      )}

      {/* チェック */}
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggleComplete}
        className="mr-1 accent-black"
      />

      {/* タイトル */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finish}
          onKeyDown={key}
          className="flex-1 border rounded px-1 py-0.5 text-sm"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={clsx("flex-1 text-sm", completed && "line-through text-gray-400")}
        >
          {title}
        </span>
      )}

      {/* アイコン群 */}
      {!isSubtask && (
        <button onClick={onAdd} className="p-1 hover:bg-gray-100 rounded">
          <Plus size={16} />
        </button>
      )}
      {!isSubtask && (
        <button onClick={onBreakdown} className="p-1 hover:bg-gray-100 rounded">
          <Braces size={16} />
        </button>
      )}
      <button onClick={onClock} className="p-1 hover:bg-gray-100 rounded">
        <Clock size={16} />
      </button>
      <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
```

---

## 3. `components/NestedList.tsx`

```tsx
"use client"
import { useProjects } from "@/store/useProjects"
import { ItemRow } from "./ItemRow"

export const NestedList = () => {
  const s = useProjects()

  return (
    <>
      {s.projects.map((p) => (
        <div key={p.id} className="border rounded-lg px-3 py-2 space-y-1">
          {/* Project 行 */}
          <ItemRow
            hasChildren={p.tasks.length > 0}
            expanded={p.expanded}
            onToggle={() => s.toggleProjectExpanded(p.id)}
            title={p.title}
            onTitleChange={(t) => s.updateProjectTitle(p.id, t)}
            onAdd={() => s.addTask(p.id)}
            onBreakdown={() => s.breakdown("project", [p.id])}
            onDelete={() => s.deleteProject(p.id)}
            onClock={() => s.toggleDashboard(p.id)}
          />

          {/* Tasks */}
          {p.expanded &&
            p.tasks.map((t) => (
              <div key={t.id}>
                <ItemRow
                  indent={24}
                  hasChildren={t.subtasks.length > 0}
                  expanded={t.expanded}
                  onToggle={() => s.toggleTaskExpanded(p.id, t.id)}
                  title={t.title}
                  onTitleChange={(tt) => s.updateTaskTitle(p.id, t.id, tt)}
                  onAdd={() => s.addSubtask(p.id, t.id)}
                  onBreakdown={() => s.breakdown("task", [p.id, t.id])}
                  onDelete={() => s.deleteTask(p.id, t.id)}
                  onClock={() => s.toggleDashboard(t.id)}
                  completed={t.completed}
                  onToggleComplete={() => s.toggleComplete("task", [p.id, t.id])}
                />

                {/* Subtasks */}
                {t.expanded &&
                  t.subtasks.map((st) => (
                    <ItemRow
                      key={st.id}
                      indent={48}
                      hasChildren={false}
                      isSubtask
                      title={st.title}
                      onTitleChange={(tt) => s.updateSubtaskTitle(p.id, t.id, st.id, tt)}
                      onDelete={() => s.deleteSubtask(p.id, t.id, st.id)}
                      onClock={() => s.toggleDashboard(st.id)}
                      completed={st.completed}
                      onToggleComplete={() => s.toggleComplete("subtask", [p.id, t.id, st.id])}
                    />
                  ))}
              </div>
            ))}
        </div>
      ))}
    </>
  )
}
```

---

## 4. `app/projects/page.tsx`

（差し替えサンプル。Sidebar / AICoachSidebar は既存のまま）

```tsx
"use client"
import { Sidebar } from "@/components/sidebar"
import { AICoachSidebar } from "@/components/ai-coach-sidebar"
import { NestedList } from "@/components/NestedList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useProjects } from "@/store/useProjects"

export default function ProjectsPage() {
  const addProject = useProjects((s) => s.addProject)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-2"># プロジェクト一覧</h1>

        <NestedList />

        <div className="flex justify-center">
          <Button variant="outline" className="border-dashed" onClick={addProject}>
            <Plus className="mr-2 h-4 w-4" />
            新しいプロジェクトを追加
          </Button>
        </div>
      </main>
      <AICoachSidebar />
    </div>
  )
}
```

---

## 5. 動作確認手順

```bash
cd apps/frontend
pnpm dev
# http://localhost:3000/projects を開く
```

1. **＋アイコン** でタスク / サブタスクが追加出来る
2. **{ }** はクリックするとアラート（ダミー）
3. **🕒** を押した項目は `/dashboard` で確認
4. **🗑️** で削除、タイトルは **ダブルクリック編集**

---

## 6. 注意

* **Redux / Supabase** など他の状態とは独立。衝突しない。
* Tailwind クラスは既存デザインに合わせて最小限。
* DnD 並べ替え・Undo 等は未対応。

---

以上を実装すると、見た目は現状を維持しつつ「意味のあるタスク分解アプリ」として動きます。
