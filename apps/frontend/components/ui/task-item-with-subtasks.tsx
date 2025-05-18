"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  MoreVertical, 
  Clock,
  ChevronDown,
  ChevronRight,
  Plus
} from "lucide-react"
import { Task, SubTask } from "@/types/task"

interface TaskItemWithSubtasksProps {
  task: Task
  level?: number
  onSubtaskAdd?: (taskId: string) => void
  onSubtaskToggle?: (taskId: string, subtaskId: string, completed: boolean) => void
  onToggleCollapse?: (taskId: string) => void
  onMenuOpen?: (taskId: string) => void
}

export function TaskItemWithSubtasks({ 
  task, 
  level = 0,
  onSubtaskAdd,
  onSubtaskToggle,
  onToggleCollapse,
  onMenuOpen
}: TaskItemWithSubtasksProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // サブタスクの完了状況から進捗率を計算
  const calculateProgress = (subTasks?: SubTask[]): number => {
    if (!subTasks || subTasks.length === 0) return task.status === "completed" ? 100 : 0
    
    const completedCount = subTasks.filter(st => st.completed).length
    return Math.round((completedCount / subTasks.length) * 100)
  }

  const progress = task.progress ?? calculateProgress(task.subTasks)
  const hasSubtasks = task.subTasks && task.subTasks.length > 0
  
  // 折りたたみ状態の切り替え
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    onToggleCollapse?.(task.id)
  }

  // サブタスクの状態変更
  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    onSubtaskToggle?.(task.id, subtaskId, completed)
  }

  return (
    <div className="task-item-container">
      <Card className={`overflow-hidden mb-2 ${task.status === "in-progress" ? "border-l-4 border-l-[#31A9B8]" : ""}`}>
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            {/* インデントとトグルボタン */}
            <div style={{ width: `${level * 20}px` }} className="flex-shrink-0" />
            
            {hasSubtasks ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 mr-1" 
                onClick={toggleCollapse}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            ) : (
              <div className="w-7" /> // スペーサー
            )}
            
            {/* チェックボックス */}
            <Checkbox 
              checked={task.status === "completed"} 
              className="mr-3 h-5 w-5" 
            />
            
            {/* タスク内容 */}
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === "completed" ? "line-through text-gray-400" : ""}`}>
                {task.title}
              </h3>
              
              {/* タグ */}
              {task.tags && task.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 進捗バー */}
              {hasSubtasks && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1.5" />
                  <span className="text-xs text-gray-500 mt-1">{progress}% 完了</span>
                </div>
              )}
            </div>
            
            {/* 期限 */}
            {task.time && (
              <div className="ml-2 flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                <Clock className="h-3 w-3" />
                {task.time}
              </div>
            )}
            
            {/* メニューボタン */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2"
              onClick={() => onMenuOpen?.(task.id)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* サブタスク */}
      {!isCollapsed && hasSubtasks && (
        <div className="subtasks-container ml-7">
          {task.subTasks?.map((subtask) => (
            <div key={subtask.id} className="flex items-center p-2 ml-6">
              <Checkbox 
                checked={subtask.completed} 
                onCheckedChange={(checked) => handleSubtaskToggle(subtask.id, !!checked)}
                className="mr-3 h-4 w-4" 
              />
              <span className={`text-sm ${subtask.completed ? "line-through text-gray-400" : ""}`}>
                {subtask.title}
              </span>
            </div>
          ))}
          
          {/* サブタスク追加ボタン */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-6 text-xs flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => onSubtaskAdd?.(task.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            サブタスクを追加
          </Button>
        </div>
      )}
    </div>
  )
}
