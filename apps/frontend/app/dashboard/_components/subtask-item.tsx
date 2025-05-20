// apps/frontend/app/dashboard/_components/subtask-item.tsx
"use client"
import { HierarchicalTaskItem } from "@/components/dashboard/HierarchicalTaskItem"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { type SubTask } from "@/lib/dashboard-utils"

interface Props {
  ctx: DashboardCtx
  gid: string  // group id
  pid: string  // project id
  tid: string  // task id
  subtask: SubTask
  idx: number
  dragProps: any
}

export const SubtaskItem = ({ ctx, gid, pid, tid, subtask, idx, dragProps }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: subtask.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HierarchicalTaskItem
        level={3}
        id={subtask.id}
        title={subtask.title}
        completed={subtask.completed}
        hasChildren={false}
        onToggleComplete={() => ctx.toggleSubtaskComplete(gid, pid, tid, subtask.id)}
        onDelete={() => ctx.handleDeleteSubtask(gid, pid, tid, subtask.id)}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
      />
    </div>
  );
}
