// apps/frontend/app/dashboard/_components/task-item.tsx
"use client"
import { HierarchicalTaskItem } from "@/components/dashboard/HierarchicalTaskItem"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { type Task } from "@/lib/dashboard-utils"

interface Props {
  ctx: DashboardCtx
  gid: string
  pid: string
  task: Task
  idx: number
  dragProps: any
}
export const TaskItem = ({ ctx, gid, pid, task, idx, dragProps }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HierarchicalTaskItem
        level={2}
        id={task.id}
        title={task.title}
        completed={task.completed}
        expanded={task.expanded}
        hasChildren={task.subtasks.length > 0}
        startTime={task.startTime}
        endTime={task.endTime}
        onToggleExpand={() => ctx.toggleTask(gid, pid, task.id)}
        onToggleComplete={() => ctx.toggleTaskComplete(gid, pid, task.id)}
        onDelete={() => ctx.handleDeleteTask(gid, pid, task.id)}
        onAddChild={() => ctx.handleAddSubtask(gid, pid, task.id)}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
        onTimeChange={(s, e) => ctx.handleTaskTimeChange?.(gid, pid, task.id, s, e)} /* optional */
      />
    </div>
  );
}
