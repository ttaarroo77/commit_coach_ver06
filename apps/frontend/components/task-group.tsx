import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, ChevronDown, ChevronRight, Trash2, Braces, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // 展開状態の切り替え
  const handleToggle = () => {
    setExpanded(!expanded)
    onToggleExpand()
  }

  // タイトル編集の保存
  const handleSaveTitle = () => {
    onTitleChange(editedTitle)
    setIsEditing(false)
  }

  // タイトルクリック時の編集モード切り替え
  const handleTitleClick = () => {
    setIsEditing(true)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg border border-b-0">
        <div className="flex items-center flex-1 hover:bg-gray-50 py-1 pl-4 rounded">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto w-auto mr-2"
            onClick={handleToggle}
          >
            {expanded ? 
              <ChevronDown size={18} className="text-blue-500"/> : 
              <ChevronRight size={18} className="text-blue-500"/>}
          </Button>
          
          {isEditing ? (
            <div className="flex items-center flex-1">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-lg font-bold"
                autoFocus
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              />
            </div>
          ) : (
            <span className="text-lg font-bold cursor-pointer" onClick={handleTitleClick}>
              {title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBreakdown}
            title="AIによるタスク分解"
            className="h-auto w-auto p-1.5"
          >
            <Braces size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            title="削除"
            className="h-auto w-auto p-1.5"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border border-t-0 rounded-b-lg">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-md">
                <div className="flex items-start justify-between hover:bg-gray-50 py-1 pl-8 rounded-md">
                  <div className="flex items-start flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto w-auto mr-2 mt-0.5"
                      onClick={() => onToggleTaskExpand(task.id)}
                    >
                      {task.expanded ? 
                        <ChevronDown size={18} className="text-blue-500"/> : 
                        <ChevronRight size={18} className="text-blue-500"/>}
                    </Button>
                    <div className="flex-1">
                      <Input
                        value={task.title}
                        onChange={(e) => onTaskTitleChange(task.id, e.target.value)}
                        className="h-8 mb-2"
                      />
                      
                      {task.expanded && task.subtasks.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center hover:bg-gray-50 py-1 pl-12 rounded-md">
                              <Checkbox
                                id={subtask.id}
                                checked={subtask.completed}
                                // 完了状態の切り替え機能は実装されていないため、ダミー関数を設定
                                onChange={() => {}}
                                className="mr-2"
                              />
                              <Input
                                value={subtask.title}
                                onChange={(e) => onSubtaskTitleChange(task.id, subtask.id, e.target.value)}
                                className="h-7 text-sm flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddSubtask(task.id)}
                    title="サブタスクを追加"
                    className="h-auto w-auto p-1.5 mt-0.5"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full border-dashed mt-4"
              onClick={onAddTask}
            >
              <Plus className="mr-2 h-4 w-4" />
              新しいタスクを追加
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
