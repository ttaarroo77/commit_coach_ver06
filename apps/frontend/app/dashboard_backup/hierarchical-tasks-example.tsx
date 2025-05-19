"use client"

import { useState } from "react"
import { TaskItemWithSubtasks } from "@/components/ui/task-item-with-subtasks"
import { Task, SubTask } from "@/types/task"
import { toast } from "@/hooks/use-toast"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash, Plus } from "lucide-react"

// サンプルタスクデータ
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "プロジェクト計画の作成",
    description: "プロジェクト全体の計画を立てる",
    status: "in-progress",
    priority: "high",
    time: "今週",
    tags: ["計画", "重要"],
    subTasks: [
      { id: "subtask-1-1", title: "要件定義", completed: true },
      { id: "subtask-1-2", title: "スケジュール作成", completed: false },
      { id: "subtask-1-3", title: "リソース割り当て", completed: false }
    ],
    createdAt: "2025-05-15T10:00:00Z",
    updatedAt: "2025-05-17T14:30:00Z"
  },
  {
    id: "task-2",
    title: "デザインシステムの構築",
    description: "UIコンポーネントの設計と実装",
    status: "todo",
    priority: "medium",
    time: "来週",
    tags: ["デザイン", "フロントエンド"],
    subTasks: [
      { id: "subtask-2-1", title: "カラーパレット定義", completed: false },
      { id: "subtask-2-2", title: "タイポグラフィ設定", completed: false }
    ],
    createdAt: "2025-05-16T09:00:00Z",
    updatedAt: "2025-05-16T09:00:00Z"
  },
  {
    id: "task-3",
    title: "バックエンドAPI実装",
    description: "RESTful APIの実装",
    status: "todo",
    priority: "high",
    tags: ["バックエンド", "API"],
    createdAt: "2025-05-17T11:00:00Z",
    updatedAt: "2025-05-17T11:00:00Z"
  }
]

export function HierarchicalTasksExample() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // サブタスク追加ハンドラ
  const handleSubtaskAdd = (taskId: string) => {
    const newSubtaskId = `subtask-${taskId}-${Date.now()}`
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = [...(task.subTasks || []), {
          id: newSubtaskId,
          title: "新しいサブタスク",
          completed: false
        }]
        
        return {
          ...task,
          subTasks: updatedSubTasks
        }
      }
      return task
    }))
    
    toast({
      title: "サブタスク追加",
      description: `タスク「${tasks.find(t => t.id === taskId)?.title}」にサブタスクを追加しました`
    })
  }

  // サブタスク状態変更ハンドラ
  const handleSubtaskToggle = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.subTasks) {
        const updatedSubTasks = task.subTasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
        )
        
        return {
          ...task,
          subTasks: updatedSubTasks
        }
      }
      return task
    }))
  }

  // 折りたたみ状態変更ハンドラ
  const handleToggleCollapse = (taskId: string) => {
    // この実装では各コンポーネントが内部で折りたたみ状態を管理
    console.log(`タスク ${taskId} の折りたたみ状態が変更されました`)
  }

  // タスク編集ハンドラ
  const handleEditTask = (taskId: string) => {
    toast({
      title: "タスク編集",
      description: `タスクID: ${taskId} の編集モーダルを開きます`
    })
    setActiveTaskId(null)
  }

  // タスク削除ハンドラ
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast({
      title: "タスク削除",
      description: `タスクID: ${taskId} を削除しました`,
      variant: "destructive"
    })
    setActiveTaskId(null)
  }

  // 新規タスク追加ハンドラ
  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "新しいタスク",
      description: "",
      status: "todo",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setTasks([...tasks, newTask])
    toast({
      title: "タスク追加",
      description: "新しいタスクを追加しました"
    })
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">階層構造タスク</h2>
        <Button onClick={handleAddTask} className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          新規タスク
        </Button>
      </div>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="relative">
            <TaskItemWithSubtasks
              task={task}
              onSubtaskAdd={handleSubtaskAdd}
              onSubtaskToggle={handleSubtaskToggle}
              onToggleCollapse={handleToggleCollapse}
              onMenuOpen={setActiveTaskId}
            />
            
            {activeTaskId === task.id && (
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu open={activeTaskId === task.id} onOpenChange={() => setActiveTaskId(null)}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
