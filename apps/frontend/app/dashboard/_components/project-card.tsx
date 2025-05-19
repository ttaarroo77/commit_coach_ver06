// apps/frontend/app/dashboard/_components/project-card.tsx
"use client"
import { CardContent } from "@/components/ui/card"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { HierarchicalTaskItem } from "@/components/hierarchical-task-item"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { TaskItem } from "./task-item"

interface Props {
  ctx: DashboardCtx
  gid: string
  project: import("@/lib/dashboard-utils").Project
  idx: number
}
export const ProjectCard = ({ ctx, gid, project, idx }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: project.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HierarchicalTaskItem
        id={project.id}
        title={project.title}
        level={1}
        completed={project.completed}
        expanded={project.expanded}
        hasChildren={project.tasks.length > 0}
        startTime={project.startTime}
        endTime={project.endTime}
        onToggleExpand={() => ctx.toggleProject(gid, project.id)}
        onToggleComplete={() => ctx.toggleProjectComplete(gid, project.id)}
        onDelete={() => ctx.handleDeleteProject(gid, project.id)}
        onAddChild={() => ctx.handleAddTask(gid, project.id)}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
        onTimeChange={(s, e) => ctx.handleTimeChange?.(gid, project.id, s, e)} /* optional */
      />

      {project.expanded && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            if (event.active && event.over) {
              const activeId = event.active.id.toString();
              const overId = event.over.id.toString();
              if (activeId !== overId) {
                ctx.handleTaskDragEnd({ activeId, overId, groupId: gid, projectId: project.id });
              }
            }
          }}
        >
          <SortableContext
            items={project.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {project.tasks.map((task, tIdx) => (
                <TaskItem
                  key={task.id}
                  ctx={ctx}
                  gid={gid}
                  pid={project.id}
                  task={task}
                  idx={tIdx}
                  // dragPropsは不要になりますが、TaskItemの実装によっては修正が必要かもしれません
                  dragProps={null}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
