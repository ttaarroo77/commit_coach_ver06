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
        // 既存のhandleDragEndを適切に変換して呼び出す必要があります
        // @dnd-kitとreact-beautiful-dndでは引数の形式が異なるため、
        // 必要に応じてctx.handleDragEndの実装も修正する必要があります
        if (event.active && event.over) {
          const activeId = event.active.id;
          const overId = event.over.id;
          if (activeId !== overId) {
            // ここでctx.handleDragEndに相当する処理を呼び出す
            // 例: ctx.handleDndKitDragEnd({ activeId, overId });
          }
        }
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
