"use client"

import { useState } from "react"
import { DraggableTaskList } from "@/components/ui/draggable-task-list"
import { Task } from "@/types/task"
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
    title: "デザインシステムの構築",
    description: "UIコンポーネントの設計と実装",
    status: "in-progress",
    priority: "high",
    time: "今日",
    tags: ["デザイン", "UI"],
    createdAt: "2025-05-15T10:00:00Z",
    updatedAt: "2025-05-17T14:30:00Z"
  },
  {
    id: "task-2",
    title: "APIエンドポイントの実装",
    description: "RESTful APIの実装",
    status: "todo",
    priority: "medium",
    time: "明日",
    tags: ["バックエンド"],
    createdAt: "2025-05-16T09:00:00Z",
    updatedAt: "2025-05-16T09:00:00Z"
  },
  {
    id: "task-3",
    title: "ユーザーテスト実施",
    description: "ユーザビリティテストの実施と分析",
    status: "completed",
    priority: "low",
    time: "昨日",
    tags: ["テスト", "UX"],
    createdAt: "2025-05-14T11:00:00Z",
    updatedAt: "2025-05-17T11:00:00Z"
  },
  {
    id: "task-4",
    title: "ドキュメント作成",
    description: "API仕様書とユーザーマニュアルの作成",
    status: "todo",
    priority: "medium",
    time: "来週",
    tags: ["ドキュメント"],
    createdAt: "2025-05-17T11:00:00Z",
    updatedAt: "2025-05-17T11:00:00Z"
  }
]

export function DraggableTasksExample() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // タスク並べ替えハンドラ
  const handleTasksReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks)
    toast({
      title: "タスク順序変更",
      description: "タスクの順序を変更しました"
    })
  }

  // タスクステータス変更ハンドラ
  const handleStatusChange = (taskId: string, completed: boolean) => {
    const status = completed ? "completed" : "in-progress"
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ))
    
    toast({
      title: "ステータス変更",
      description: `タスクを${completed ? '完了' : '進行中'}に変更しました`
    })
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
      description: `タスクを削除しました`,
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
        <h2 className="text-2xl font-bold">ドラッグ＆ドロップタスク</h2>
        <Button onClick={handleAddTask} className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          新規タスク
        </Button>
      </div>
      
      <div className="relative">
        <DraggableTaskList
          tasks={tasks}
          onTasksReorder={handleTasksReorder}
          onStatusChange={handleStatusChange}
          onMenuOpen={setActiveTaskId}
        />
        
        {activeTaskId && (
          <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setActiveTaskId(null)}>
            <div className="absolute top-4 right-4" onClick={e => e.stopPropagation()}>
              <DropdownMenu open={!!activeTaskId} onOpenChange={() => setActiveTaskId(null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditTask(activeTaskId)}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteTask(activeTaskId)}>
                    <Trash className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium mb-2">使用方法</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>タスクをドラッグ＆ドロップで並べ替え</li>
          <li>チェックボックスでタスク完了/未完了を切り替え</li>
          <li>メニューボタンでタスクの編集/削除</li>
          <li>「新規タスク」ボタンでタスク追加</li>
        </ul>
      </div>
    </div>
  )
}
