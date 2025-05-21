// apps/frontend/app/dashboard/_components/task-group-list.tsx
"use client"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { TaskGroupCard } from "./task-group-card"
import { DashboardCtx } from "../_hooks/use-dashboard"

export const TaskGroupList = (ctx: DashboardCtx) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        ctx.handleDragEnd(event);
      }}
    >
      <SortableContext 
        items={ctx.taskGroups.map(group => group.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {ctx.taskGroups.map((group, idx) => (
            <TaskGroupCard key={group.id} ctx={ctx} group={group} idx={idx} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
