"use client"

import { useState } from "react"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreVertical, Clock, GripVertical } from "lucide-react"

// ドラッグ可能なタスク項目
interface SortableTaskItemProps {
  task: Task
  onStatusChange?: (taskId: string, completed: boolean) => void
  onMenuOpen?: (taskId: string) => void
}

function SortableTaskItem({ task, onStatusChange, onMenuOpen }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  }
  
  const isCompleted = task.status === "completed"
  
  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className={`overflow-hidden ${isDragging ? "border-2 border-blue-400" : ""} ${task.status === "in-progress" ? "border-l-4 border-l-[#31A9B8]" : ""}`}>
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            {/* ドラッグハンドル */}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-grab active:cursor-grabbing mr-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </Button>
            
            {/* チェックボックス */}
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={(checked) => onStatusChange?.(task.id, !!checked)}
              className="mr-3 h-5 w-5" 
            />
            
            {/* タスク内容 */}
            <div className="flex-1">
              <h3 className={`font-medium ${isCompleted ? "line-through text-gray-400" : ""}`}>
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
    </div>
  )
}

// ドラッグ可能なタスクリスト
interface DraggableTaskListProps {
  tasks: Task[]
  onTasksReorder?: (tasks: Task[]) => void
  onStatusChange?: (taskId: string, completed: boolean) => void
  onMenuOpen?: (taskId: string) => void
}

export function DraggableTaskList({ 
  tasks, 
  onTasksReorder,
  onStatusChange,
  onMenuOpen
}: DraggableTaskListProps) {
  const [items, setItems] = useState<Task[]>(tasks)
  
  // センサー設定（ポインター操作とキーボード操作）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px動かすとドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id)
        const newIndex = currentItems.findIndex(item => item.id === over.id)
        
        const reorderedItems = arrayMove(currentItems, oldIndex, newIndex)
        
        // 親コンポーネントに変更を通知
        onTasksReorder?.(reorderedItems)
        
        return reorderedItems
      })
    }
  }
  
  // タスクのステータス変更
  const handleStatusChange = (taskId: string, completed: boolean) => {
    const newStatus = completed ? "completed" : "in-progress"
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === taskId ? { ...item, status: newStatus } : item
      )
    )
    
    onStatusChange?.(taskId, completed)
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {items.map(task => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onMenuOpen={onMenuOpen}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
