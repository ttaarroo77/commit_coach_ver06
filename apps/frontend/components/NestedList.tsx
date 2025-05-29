"use client"
import { useProjects } from "@/store/useProjects"
import { ItemRow } from "./ItemRow"

export const NestedList = () => {
  const s = useProjects()

  return (
    <>
      {s.projects.map((p) => (
        <div key={p.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 space-y-1 mb-3">
          {/* Project 行 */}
          <ItemRow
            hasChildren={p.tasks.length > 0}
            expanded={p.expanded}
            onToggle={() => s.toggleProjectExpanded(p.id)}
            title={p.title}
            onTitleChange={(t) => s.updateProjectTitle(p.id, t)}
            onAdd={() => s.addTask(p.id)}
            onBreakdown={() => s.breakdown("project", [p.id])}
            onDelete={() => s.deleteProject(p.id)}
          />

          {/* Tasks */}
          {p.expanded &&
            p.tasks.map((t) => (
              <div key={t.id}>
                <ItemRow
                  indent={24}
                  hasChildren={t.subtasks.length > 0}
                  expanded={t.expanded}
                  onToggle={() => s.toggleTaskExpanded(p.id, t.id)}
                  title={t.title}
                  onTitleChange={(tt) => s.updateTaskTitle(p.id, t.id, tt)}
                  onAdd={() => s.addSubtask(p.id, t.id)}
                  onBreakdown={() => s.breakdown("task", [p.id, t.id])}
                  onDelete={() => s.deleteTask(p.id, t.id)}
                  completed={t.completed}
                  onToggleComplete={() => s.toggleComplete("task", [p.id, t.id])}
                />

                {/* Subtasks */}
                {t.expanded &&
                  t.subtasks.map((st) => (
                    <ItemRow
                      key={st.id}
                      indent={48}
                      hasChildren={false}
                      isSubtask
                      title={st.title}
                      onTitleChange={(tt) => s.updateSubtaskTitle(p.id, t.id, st.id, tt)}
                      onDelete={() => s.deleteSubtask(p.id, t.id, st.id)}
                      completed={st.completed}
                      onToggleComplete={() => s.toggleComplete("subtask", [p.id, t.id, st.id])}
                    />
                  ))}
              </div>
            ))}
        </div>
      ))}
    </>
  )
}
