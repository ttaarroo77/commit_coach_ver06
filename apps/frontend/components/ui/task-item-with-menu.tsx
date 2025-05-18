"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  MoreVertical, 
  Clock,
  Edit,
  Trash,
  Flag,
  Calendar,
  Tag,
  CheckCircle2,
  Clock3,
  XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskItemWithMenuProps {
  task: {
    id: string
    title: string
    status: string
    time?: string
    tags?: string[]
    priority?: "low" | "medium" | "high"
  }
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: string) => void
  onPriorityChange?: (taskId: string, priority: "low" | "medium" | "high") => void
  onTagAdd?: (taskId: string) => void
}

export function TaskItemWithMenu({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onPriorityChange,
  onTagAdd
}: TaskItemWithMenuProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "completed")

  const handleStatusChange = (checked: boolean) => {
    setIsCompleted(checked)
    const newStatus = checked ? "completed" : "in-progress"
    onStatusChange?.(task.id, newStatus)
  }

  // 優先度に応じた色を返す関数
  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case "high": return "text-red-500"
      case "medium": return "text-yellow-500"
      case "low": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  // ステータス変更ハンドラ
  const handleStatusMenuChange = (status: string) => {
    setIsCompleted(status === "completed")
    onStatusChange?.(task.id, status)
  }

  return (
    <Card className={`overflow-hidden ${task.status === "in-progress" ? "border-l-4 border-l-[#31A9B8]" : ""}`}>
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <Checkbox checked={isCompleted} onCheckedChange={handleStatusChange} className="mr-3 h-5 w-5" />
          <div className="flex-1">
            <h3 className={`font-medium ${isCompleted ? "line-through text-gray-400" : ""}`}>{task.title}</h3>
            {task.tags && task.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <span key={index} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {task.time && (
            <div className="ml-2 flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
              <Clock className="h-3 w-3" />
              {task.time}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(task.id)}>
                <Trash className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleStatusMenuChange("todo")}>
                <Clock3 className="mr-2 h-4 w-4" />
                未着手
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusMenuChange("in-progress")}>
                <Clock className="mr-2 h-4 w-4" />
                進行中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusMenuChange("completed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                完了
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onPriorityChange?.(task.id, "low")}>
                <Flag className={`mr-2 h-4 w-4 text-green-500`} />
                優先度: 低
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange?.(task.id, "medium")}>
                <Flag className={`mr-2 h-4 w-4 text-yellow-500`} />
                優先度: 中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange?.(task.id, "high")}>
                <Flag className={`mr-2 h-4 w-4 text-red-500`} />
                優先度: 高
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onTagAdd?.(task.id)}>
                <Tag className="mr-2 h-4 w-4" />
                タグ追加
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
