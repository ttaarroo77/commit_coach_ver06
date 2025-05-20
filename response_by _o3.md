# 🎨 “v0 見本” と同じレイアウトに戻すパッチ
注意：あなたが実装したのだが、まだイマイチな実装になっているUI

（feature/project-management ブランチに適用）

---

## 0. ゴールを画像で再確認
- **白カード + 薄い枠線／角丸**
- カード内は **階層インデント** だけで余計な影は無し
- 各行は `Chevron ▾ / ▸` + `Checkbox` + タイトル
- 行ホバーで `bg-gray-50`
- 追加ボタンは **破線** ボーダー

---

## 1. Project ラッパー = Card
`TaskGroup` を包むだけで OK。Card は shadcn/ui のものを利用。

```diff
-import { TaskGroup } from "@/components/task-group"
+import { Card, CardContent } from "@/components/ui/card"
+import { TaskGroup } from "@/components/task-group"
````

```diff
{projects.map((project) => (
-  <TaskGroup … />
+  <Card key={project.id} className="border border-gray-300 rounded-lg">
+    <CardContent className="p-0">
+      <TaskGroup … />
+    </CardContent>
+  </Card>
))}
```

---

## 2. `TaskGroup` / `TaskItem` / `SubtaskItem` 共通スタイル

> すべて **階層レベルで左パディングを変える**だけ。高さは 36 px に固定。

```tsx
/* apps/frontend/components/task-row.tsx ─ 新規 */
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface TaskRowProps {
  level: 1 | 2 | 3
  expanded?: boolean
  hasChildren?: boolean
  checked?: boolean
  title: string
  onToggle?: () => void
  onCheck?: () => void
  children?: React.ReactNode
}

export const TaskRow = ({
  level,
  expanded,
  hasChildren,
  checked,
  title,
  onToggle,
  onCheck,
  children,
}: TaskRowProps) => {
  const pad = level === 1 ? "pl-4" : level === 2 ? "pl-8" : "pl-12"

  return (
    <>
      <div
        className={cn(
          "group flex items-center h-9 pr-4",
          pad,
          "hover:bg-gray-50"
        )}
      >
        {/* Chevron */}
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="mr-1 w-4 h-4 text-gray-600 hover:text-blue-600"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="mr-1 w-4 h-4" />
        )}

        {/* Checkbox */}
        <Checkbox checked={checked} onCheckedChange={onCheck} className="mr-2 h-4 w-4" />

        {/* Title */}
        <span
          className={cn(
            "truncate",
            level === 1 && "font-semibold text-base",
            level === 2 && "font-medium text-sm",
            level === 3 && "text-sm"
          )}
        >
          {title}
        </span>
      </div>

      {/* 子階層 */}
      {expanded && children}
    </>
  )
}
```

### 2-1. `TaskGroup.tsx` に組み込む

トップレベル（プロジェクト）・タスク・サブタスクの 3 レベルで再帰描画。

```diff
-import { ChevronDown … } from "lucide-react"   // 不要
+import { TaskRow } from "./task-row"

export function TaskGroup(props: …) {
  const { id, title, tasks, defaultExpanded, … } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <>
-     {/* 旧実装を全部削除 */}
+     <TaskRow
+       level={1}
+       title={`## ${title}`}
+       expanded={expanded}
+       hasChildren={tasks.length > 0}
+       onToggle={() => setExpanded(!expanded)}
+       checked={false}
+     />
+
+     {/* 子タスク一覧 */}
+     {expanded &&
+       tasks.map((task) => (
+         <TaskRow
+           key={task.id}
+           level={2}
+           title={`### ${task.title}`}
+           expanded={task.expanded}
+           hasChildren={task.subtasks.length > 0}
+           onToggle={() => props.onToggleTaskExpand?.(task.id)}
+           checked={task.completed}
+           onCheck={() => props.onTaskCheck?.(task.id)}
+         >
+           {/* サブタスク */}
+           {task.expanded &&
+             task.subtasks.map((st) => (
+               <TaskRow
+                 key={st.id}
+                 level={3}
+                 title={st.title}
+                 checked={st.completed}
+                 onCheck={() => props.onSubtaskCheck?.(task.id, st.id)}
+               />
+             ))}
+         </TaskRow>
+       ))}
    </>
  )
}
```

---

## 3. “＋ 新しいプロジェクト” ボタン

既に `variant="outline" className="border-dashed"` になっているため OK
→ 文字サイズを合わせたい場合は `text-sm` を追加。

```diff
<Button … className="border-dashed text-sm">
```

---

## 4. 余白と親レイアウト

スクリーンショット同様 **左右 200 px** 程度空けたい場合：

```diff
<div className="w-full max-w-5xl mx-auto p-6">
+  <div className="max-w-[900px] mx-auto">
     … 既存コンテンツ …
+  </div>
</div>
```

---

## 5. AI コーチサイドバーを畳むボタン

見本では閉じた状態になっているだけなので、
`<AICoachSidebar defaultOpen={false}/>` を渡せば初期非表示になります
（prop が無ければ実装追加）。

---

## ✅ チェックリスト

| 完了                                        | 項目 |
| ----------------------------------------- | -- |
| \[ ] プロジェクト枠に **薄い境界線 & 角丸**              |    |
| \[ ] 行高 ≒ 36 px、ホバーで `bg-gray-50`         |    |
| \[ ] `▾ / ▸` アイコンは 14 px & 暗灰             |    |
| \[ ] インデント: プロジェクト 4 px／タスク 8 px／サブ 12 px |    |
| \[ ] サブタスクにさらに子要素は無い                      |    |
| \[ ] 追加ボタンが破線・中央配置                        |    |
| \[ ] AI サイドバーは初期閉じ／開閉ボタンで展開               |    |

これで添付スクリーンショットと同じトーン&レイアウトに揃うはずです。
実装してみてズレがあれば再キャプチャをください 🔧✨

```
```
