"use client"

import { useState } from "react"
import { EditableHierarchicalTaskItem } from "@/components/dashboard/EditableHierarchicalTaskItem"
import { SortableTaskWrapper } from "@/components/dashboard/SortableTaskWrapper"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DashboardCtx } from "@/app/dashboard/_hooks/use-dashboard"
import { Task, SubTask } from "@/lib/dashboard-utils"

interface Props {
  ctx: DashboardCtx
  gid: string
  pid: string
  task: Task
  idx: number
  dragProps: any
}

export const EditableTaskItem = ({ ctx, gid, pid, task, idx, dragProps }: Props) => {
  // タイトル変更ハンドラ
  const handleTitleChange = (newTitle: string) => {
    ctx.handleTaskTitleChange?.(gid, pid, task.id, newTitle);
  };

  return (
    <div>
      <SortableTaskWrapper id={task.id}>
        <EditableHierarchicalTaskItem
          level={2}
          id={task.id}
          title={task.title}
          completed={task.completed}
          expanded={task.expanded}
          hasChildren={task.subtasks.length > 0}
          startTime={task.startTime}
          endTime={task.endTime}
          sort_order={task.sort_order}
          onToggleExpand={() => ctx.toggleTask(gid, pid, task.id)}
          onToggleComplete={() => ctx.toggleTaskComplete(gid, pid, task.id)}
          onDelete={() => ctx.handleDeleteTask(gid, pid, task.id)}
          onAddChild={() => ctx.handleAddSubtask(gid, pid, task.id)}
          onTitleChange={handleTitleChange}
          dragHandleProps={{
            ...attributes,
            ...listeners
          }}
          onTimeChange={(s, e) => ctx.handleTaskTimeChange?.(gid, pid, task.id, s, e)} /* optional */
          groupId={gid} /* タスクのグループID（today/unscheduled）*/
          onMoveUp={gid === "unscheduled" ? () => ctx.moveTaskToToday?.(pid, task.id) : undefined}
          onMoveDown={gid === "today" ? () => ctx.moveTaskToUnscheduled?.(pid, task.id) : undefined}
        />
      </SortableTaskWrapper>

      {/* サブタスクの表示 */}
      {task.expanded && task.subtasks.length > 0 && (
        <div className="subtasks-container">
          {task.subtasks
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order) // sort_orderでソート
            .map((subtask, subtaskIdx) => (
              <EditableSubtaskItem
                key={subtask.id}
                ctx={ctx}
                gid={gid}
                pid={pid}
                tid={task.id}
                subtask={subtask}
                idx={subtaskIdx}
                dragProps={dragProps}
              />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubtaskProps {
  ctx: DashboardCtx
  gid: string  // group id
  pid: string  // project id
  tid: string  // task id
  subtask: SubTask
  idx: number
  dragProps: any
}

export const EditableSubtaskItem = ({ ctx, gid, pid, tid, subtask, idx, dragProps }: SubtaskProps) => {
  // サブタスクのタイトル変更ハンドラ
  const handleSubtaskTitleChange = (newTitle: string) => {
    ctx.handleSubtaskTitleChange?.(gid, pid, tid, subtask.id, newTitle);
  };

  return (
    <SortableTaskWrapper id={subtask.id}>
      <EditableHierarchicalTaskItem
        level={3}
        id={subtask.id}
        title={subtask.title}
        completed={subtask.completed}
        hasChildren={false}
        sort_order={subtask.sort_order}
        onToggleComplete={() => ctx.toggleSubtaskComplete(gid, pid, tid, subtask.id)}
        onDelete={() => ctx.handleDeleteSubtask(gid, pid, tid, subtask.id)}
        onTitleChange={handleSubtaskTitleChange}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
      />
    </SortableTaskWrapper>
  );
}
