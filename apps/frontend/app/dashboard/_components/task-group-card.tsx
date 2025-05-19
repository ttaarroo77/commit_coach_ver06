// apps/frontend/app/dashboard/_components/task-group-card.tsx
"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { ProjectCard } from "./project-card"

interface Props {
  ctx: DashboardCtx
  group: import("@/lib/dashboard-utils").TaskGroup
  idx: number
}
export const TaskGroupCard = ({ ctx, group, idx }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: group.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-6">
        <CardHeader 
          className="bg-gray-50 p-4 flex items-center justify-between" 
          {...attributes} 
          {...listeners}
        >
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 w-6 mr-2" 
              onClick={() => ctx.toggleTaskGroup(group.id)}
            >
              {group.expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            <CardTitle className="text-lg font-bold">
              {group.id === "today" ? "### 今日のタスク" : "### 未定のタスク"}
            </CardTitle>
          </div>
        </CardHeader>

        {group.expanded && (
          <CardContent>
            {/* プロジェクトのドラッグ＆ドロップコンテキスト */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                if (event.active && event.over) {
                  const activeId = event.active.id;
                  const overId = event.over.id;
                  if (activeId !== overId) {
                    // ここでプロジェクトのドラッグ＆ドロップ処理を呼び出す
                    // ctx.handleProjectDragEnd({ activeId, overId, groupId: group.id });
                  }
                }
              }}
            >
              <SortableContext
                items={group.projects.map(project => project.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {group.projects.map((project, pIdx) => (
                    <ProjectCard key={project.id} ctx={ctx} gid={group.id} project={project} idx={pIdx} />
                  ))}

                  {/* プロジェクト追加 */}
                  <Button variant="outline" className="border-dashed w-full mt-4" onClick={() => ctx.handleAddProject(group.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    新しいプロジェクトを追加
                  </Button>
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
