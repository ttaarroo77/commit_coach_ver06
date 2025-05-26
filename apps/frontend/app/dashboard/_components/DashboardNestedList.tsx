"use client"
import { DashboardItemRow } from "./DashboardItemRow"
import { useDashboard } from "../_hooks/use-dashboard"
import { DashboardCtx } from "../_hooks/use-dashboard"
import { TaskGroup, Project, Task, SubTask } from "@/lib/dashboard-utils"
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
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"

export const DashboardNestedList = () => {
  const ctx = useDashboard()

  // メインリストのセンサー
  const mainSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (ctx.isLoading) {
    return <div className="py-4 text-center">読み込み中...</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {ctx.taskGroups.map((group) => (
        <TaskGroupCard key={group.id} group={group} ctx={ctx} />
      ))}
    </div>
  );
}

interface TaskGroupCardProps {
  group: TaskGroup;
  ctx: DashboardCtx;
}

const TaskGroupCard = ({ group, ctx }: TaskGroupCardProps) => {
  // センサーを各コンポーネント内で初期化
  const taskGroupSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* グループヘッダー */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button
            className="p-1 hover:bg-gray-50 rounded mr-2"
            onClick={() => ctx.toggleTaskGroup(group.id)}
          >
            {group.expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <h3 className="text-lg font-bold">
            {group.id === "today" ? "### 今日のタスク" : "### 未定のタスク"}
          </h3>
        </div>
      </div>

      {/* プロジェクトリスト */}
      {group.expanded && (
        <div className="p-4 space-y-2">
          <DndContext
            sensors={taskGroupSensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              if (event.active && event.over) {
                const activeId = event.active.id.toString();
                const overId = event.over.id.toString();
                if (activeId !== overId) {
                  ctx.handleProjectDragEnd({ activeId, overId, groupId: group.id });
                }
              }
            }}
          >
            <SortableContext
              items={group.projects.map(project => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {group.projects.map((project: Project) => (
                  <SortableProject key={`${group.id}-${project.id}`} project={project} group={group} ctx={ctx} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* プロジェクト追加ボタン */}
          <Button variant="outline" className="border-dashed w-full border-gray-200 hover:border-gray-300 bg-white" onClick={() => ctx.handleAddProject(group.id)}>
            <Plus className="mr-2 h-4 w-4" />
            新しいプロジェクトを追加
          </Button>
        </div>
      )}
    </div>
  );
}

interface SortableProjectProps {
  project: Project;
  group: TaskGroup;
  ctx: DashboardCtx;
}

const SortableProject = ({ project, group, ctx }: SortableProjectProps) => {
  // プロジェクト内のタスク用のセンサーを初期化
  const projectSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // タスクグループ間の移動ハンドラ
  const handleMoveToToday = () => {
    if (group.id === "unscheduled") {
      ctx.moveProjectBetweenGroups("unscheduled", "today", project.id);
    }
  };

  const handleMoveToUnscheduled = () => {
    if (group.id === "today") {
      ctx.moveProjectBetweenGroups("today", "unscheduled", project.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="mb-2 border border-gray-100 rounded p-2 bg-white">
        {/* プロジェクト行 */}
        <DashboardItemRow
          indent={0}
          hasChildren={project.tasks.length > 0}
          expanded={project.expanded}
          onToggle={() => ctx.toggleProject(group.id, project.id)}
          title={project.title}
          onTitleChange={(t) => ctx.handleProjectTitleChange(group.id, project.id, t)}
          onAdd={() => ctx.handleAddTask(group.id, project.id)}
          onBreakdown={() => alert("プロジェクト分解は今後実装予定です")}
          onDelete={() => ctx.handleDeleteProject(group.id, project.id)}
          completed={project.completed}
          onToggleComplete={() => ctx.toggleProjectComplete(group.id, project.id)}
          startTime={project.startTime}
          endTime={project.endTime}
          onTimeChange={(s, e) => ctx.handleTimeChange(group.id, project.id, s, e)}
          dragHandleProps={{
            ...attributes,
            ...listeners
          }}
          groupId={group.id}
          onMoveUp={group.id === "unscheduled" ? handleMoveToToday : undefined}
          onMoveDown={group.id === "today" ? handleMoveToUnscheduled : undefined}
        />

        {/* タスクリスト */}
        {project.expanded && project.tasks.length > 0 && (
          <div className="ml-6">
            <DndContext
              sensors={projectSensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                if (event.active && event.over) {
                  const activeId = event.active.id.toString();
                  const overId = event.over.id.toString();
                  if (activeId !== overId) {
                    ctx.handleTaskDragEnd({ activeId, overId, groupId: group.id, projectId: project.id });
                  }
                }
              }}
            >
              <SortableContext
                items={project.tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {project.tasks.map((task: Task, index: number) => (
                  <SortableTask
                    key={`${group.id}-${project.id}-${task.id}-${index}`}
                    task={task}
                    project={project}
                    group={group}
                    ctx={ctx}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableTaskProps {
  task: Task;
  project: Project;
  group: TaskGroup;
  ctx: DashboardCtx;
}

const SortableTask = ({ task, project, group, ctx }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `${group.id}-${project.id}-${task.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="mb-2">
        {/* タスク行 */}
        <DashboardItemRow
          indent={24}
          hasChildren={task.subtasks.length > 0}
          expanded={task.expanded}
          onToggle={() => ctx.toggleTask(group.id, project.id, task.id)}
          title={task.title}
          onTitleChange={(t) => ctx.handleTaskTitleChange(group.id, project.id, task.id, t)}
          onAdd={() => ctx.handleAddSubtask(group.id, project.id, task.id)}
          onBreakdown={() => alert("タスク分解は今後実装予定です")}
          onDelete={() => ctx.handleDeleteTask(group.id, project.id, task.id)}
          completed={task.completed}
          onToggleComplete={() => ctx.toggleTaskComplete(group.id, project.id, task.id)}
          startTime={task.startTime}
          endTime={task.endTime}
          onTimeChange={(s, e) => ctx.handleTaskTimeChange(group.id, project.id, task.id, s, e)}
          dragHandleProps={{
            ...attributes,
            ...listeners
          }}
          groupId={group.id}
          onMoveUp={group.id === "unscheduled" ? () => ctx.moveTaskBetweenGroups("unscheduled", "today", project.id, task.id) : undefined}
          onMoveDown={group.id === "today" ? () => ctx.moveTaskBetweenGroups("today", "unscheduled", project.id, task.id) : undefined}
        />

        {/* サブタスクリスト */}
        {task.expanded && task.subtasks.length > 0 && (
          <div className="ml-6">
            {task.subtasks.map((subtask: SubTask) => (
              <DashboardItemRow
                key={subtask.id}
                indent={48}
                isSubtask
                title={subtask.title}
                onTitleChange={(t) => ctx.handleSubtaskTitleChange(group.id, project.id, task.id, subtask.id, t)}
                onDelete={() => ctx.handleDeleteSubtask(group.id, project.id, task.id, subtask.id)}
                completed={subtask.completed}
                onToggleComplete={() => ctx.toggleSubtaskComplete(group.id, project.id, task.id, subtask.id)}
                groupId={group.id}
                onMoveUp={group.id === "unscheduled" ? () => ctx.moveTaskBetweenGroups("unscheduled", "today", project.id, task.id) : undefined}
                onMoveDown={group.id === "today" ? () => ctx.moveTaskBetweenGroups("today", "unscheduled", project.id, task.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
