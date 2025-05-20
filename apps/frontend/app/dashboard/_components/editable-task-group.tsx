"use client"

import { useState } from "react"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react"
import { Project, Task, TaskGroup } from "@/lib/dashboard-utils"
import { EditableTaskItem } from "@/components/ui/editable-task-item"
import { EditableText } from "@/components/ui/editable-text"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"

interface EditableTaskGroupProps {
  ctx: DashboardCtx
  group: TaskGroup
  project: Project
}

export function EditableTaskGroup({ ctx, group, project }: EditableTaskGroupProps) {
  // ドラッグ＆ドロップのセンサー
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // プロジェクトタイトル変更ハンドラ
  const handleProjectTitleChange = (newTitle: string) => {
    ctx.handleProjectTitleChange(group.id, project.id, newTitle);
  }

  // ドラッグ終了ハンドラ
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const tasks = [...project.tasks];
    const activeIndex = tasks.findIndex(task => task.id === activeId);
    const overIndex = tasks.findIndex(task => task.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      // 並び順が変わった場合のみ更新
      if (activeIndex !== overIndex) {
        ctx.handleReorderTasks(group.id, project.id, activeIndex, overIndex);
      }
    }
  }
  
  // sort_orderでタスクをソート
  const sortedTasks = [...project.tasks].sort((a, b) => a.sort_order - b.sort_order);
  const taskIds = sortedTasks.map(task => task.id);

  return (
    <Card className="mb-6">
      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 mr-2 data-[state=open]:bg-accent"
            onClick={() => ctx.toggleProject(group.id, project.id)}
          >
            {project.expanded ? (
              <ChevronDown className="h-4 w-4 text-blue-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-blue-500" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
          <CardTitle className="text-sm font-medium flex-1">
            <EditableText 
              value={project.title}
              onChange={handleProjectTitleChange}
              className="text-base font-semibold"
              placeholder="プロジェクト名を入力"
            />
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-500"
            onClick={() => ctx.handleAddTask(group.id, project.id)}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add Task</span>
          </Button>
        </div>
      </CardHeader>
      {project.expanded && (
        <CardContent className="p-0">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext 
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {sortedTasks.map((task, index) => (
                <EditableTaskItem
                  key={task.id}
                  ctx={ctx}
                  gid={group.id}
                  pid={project.id}
                  task={task}
                  idx={index}
                  dragProps={{ group: group.id, project: project.id }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      )}
    </Card>
  )
}
