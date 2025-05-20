import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Braces } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskRow } from "./task-row"

// タスクの型定義
interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  completed: boolean
  expanded: boolean
  subtasks: Subtask[]
}

// TaskGroupの型定義
interface TaskGroupProps {
  id: string
  title: string
  tasks: Task[]
  defaultExpanded?: boolean
  onDelete: () => void
  onAddTask: () => void
  onToggleExpand: () => void
  onAddSubtask: (taskId: string) => void
  onToggleTaskExpand: (taskId: string) => void
  onTitleChange: (newTitle: string) => void
  onTaskTitleChange: (taskId: string, newTitle: string) => void
  onSubtaskTitleChange: (taskId: string, subtaskId: string, newTitle: string) => void
  onBreakdown: () => void
}

export function TaskGroup({
  id,
  title,
  tasks,
  defaultExpanded = false,
  onDelete,
  onAddTask,
  onToggleExpand,
  onAddSubtask,
  onToggleTaskExpand,
  onTitleChange,
  onTaskTitleChange,
  onSubtaskTitleChange,
  onBreakdown,
}: TaskGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)

  return (
    <>
      <TaskRow
        level={1}
        title={`## ${title}`}
        expanded={expanded}
        hasChildren={tasks.length > 0}
        onToggle={() => {
          setExpanded(!expanded)
          onToggleExpand()
        }}
        checked={false}
      />

      {/* 子タスク一覧 */}
      {expanded &&
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            level={2}
            title={`### ${task.title}`}
            expanded={task.expanded}
            hasChildren={task.subtasks.length > 0}
            onToggle={() => onToggleTaskExpand(task.id)}
            checked={task.completed}
            onCheck={() => console.log(`タスク完了状態を変更: ${task.id}`)}
          >
            {/* サブタスク */}
            {task.expanded &&
              task.subtasks.map((st) => (
                <TaskRow
                  key={st.id}
                  level={3}
                  title={st.title}
                  checked={st.completed}
                  onCheck={() => { /* サブタスクの完了状態をトグルする処理を追加 */ }}
                />
              ))}
          </TaskRow>
        ))}

      {expanded && (
        <Button
          variant="outline"
          className="w-full border-dashed text-sm mt-4"
          onClick={onAddTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          新しいタスクを追加
        </Button>
      )}
    </>
  )
}
