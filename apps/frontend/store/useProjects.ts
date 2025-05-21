import { create } from "zustand"
import { getDashboardData, saveDashboardData, addProjectToDashboard, addTaskToProject, addSubtaskToTask } from "@/lib/dashboard-utils"

/* 型定義 */
export type Subtask = { id: string; title: string; completed: boolean }
export type Task    = { id: string; title: string; completed: boolean; expanded: boolean; subtasks: Subtask[] }
export type Project = { id: string; title: string; expanded: boolean; tasks: Task[] }

/* 初期ダミーデータ */
const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "要件定義・設計",
    expanded: true,
    tasks: [
      {
        id: "task-1",
        title: "プロジェクト準備",
        completed: false,
        expanded: true,
        subtasks: [
          { id: "subtask-1-1", title: "プロジェクトの目的と範囲の定義", completed: false },
          { id: "subtask-1-2", title: "主要なステークホルダーの特定",  completed: false },
          { id: "subtask-1-3", title: "プロジェクト計画書の作成",        completed: false },
        ],
      },
    ],
  },
  { id: "project-2", title: "フロントエンド開発",        expanded: false, tasks: [] },
  { id: "project-3", title: "バックエンド連携・API実装", expanded: false, tasks: [] },
]

type Store = {
  projects: Project[]
  selectedForDashboard: string[]
  /* CRUD & UI アクション */
  addProject: () => void
  deleteProject: (projectId: string) => void
  toggleProjectExpanded: (projectId: string) => void
  updateProjectTitle: (projectId: string, title: string) => void
  addTask: (projectId: string) => void
  deleteTask: (projectId: string, taskId: string) => void
  toggleTaskExpanded: (projectId: string, taskId: string) => void
  updateTaskTitle: (projectId: string, taskId: string, title: string) => void
  addSubtask: (projectId: string, taskId: string) => void
  deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => void
  updateSubtaskTitle: (projectId: string, taskId: string, subtaskId: string, title: string) => void
  toggleComplete: (level:"task"|"subtask", ids:string[]) => void
  toggleDashboard: (id:string)=>void
  breakdown: (level:"project"|"task", ids:string[]) => void
}

export const useProjects = create<Store>((set) => ({
  projects: mockProjects,
  selectedForDashboard: [],

  /* --- Project --- */
  addProject: () =>
    set((s) => ({
      projects: [
        ...s.projects,
        { id: `project-${Date.now()}`, title: "新しいプロジェクト", expanded: true, tasks: [] },
      ],
    })),
  deleteProject: (projectId) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== projectId) })),
  toggleProjectExpanded: (projectId) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === projectId ? { ...p, expanded: !p.expanded } : p)),
    })),
  updateProjectTitle: (projectId, title) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === projectId ? { ...p, title } : p)),
    })),

  /* --- Task --- */
  addTask: (projectId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              expanded: true,
              tasks: [
                ...p.tasks,
                {
                  id: `task-${Date.now()}`,
                  title: "新しいタスク",
                  completed: false,
                  expanded: true,
                  subtasks: [],
                },
              ],
            }
          : p
      ),
    })),
  deleteTask: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
      ),
    })),
  toggleTaskExpanded: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, expanded: !t.expanded } : t
              ),
            }
          : p
      ),
    })),
  updateTaskTitle: (projectId, taskId, title) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
            }
          : p
      ),
    })),

  /* --- Subtask --- */
  addSubtask: (projectId, taskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      expanded: true,
                      subtasks: [
                        ...t.subtasks,
                        {
                          id: `subtask-${Date.now()}`,
                          title: "新しいサブタスク",
                          completed: false,
                        },
                      ],
                    }
                  : t
              ),
            }
          : p
      ),
    })),
  deleteSubtask: (projectId, taskId, subtaskId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
                  : t
              ),
            }
          : p
      ),
    })),
  updateSubtaskTitle: (projectId, taskId, subtaskId, title) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      subtasks: t.subtasks.map((st) =>
                        st.id === subtaskId ? { ...st, title } : st
                      ),
                    }
                  : t
              ),
            }
          : p
      ),
    })),

  /* --- 共通 --- */
  toggleComplete: (level, ids) =>
    set((s) => {
      const [pId, tId, stId] = ids
      return {
        projects: s.projects.map((p) => {
          if (p.id !== pId) return p
          if (level === "task") {
            return {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === tId ? { ...t, completed: !t.completed } : t
              ),
            }
          }
          if (level === "subtask") {
            return {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === tId
                  ? {
                      ...t,
                      subtasks: t.subtasks.map((st) =>
                        st.id === stId ? { ...st, completed: !st.completed } : st
                      ),
                    }
                  : t
              ),
            }
          }
          return p
        }),
      }
    }),

  toggleDashboard: (id) =>
    set((s) => {
      // 選択されたIDがすでにあるか確認
      const isSelected = s.selectedForDashboard.includes(id);
      
      // IDに関連するプロジェクト、タスク、サブタスクを検索
      const projectWithId = s.projects.find((p) => p.id === id);
      let relatedTask = null;
      let relatedSubtask = null;
      let parentProject = null;
      let parentTask = null;
      
      if (!projectWithId) {
        // タスクかサブタスクの場合
        for (const project of s.projects) {
          // タスクを検索
          const task = project.tasks.find((t) => t.id === id);
          if (task) {
            relatedTask = task;
            parentProject = project;
            break;
          }
          
          // サブタスクを検索
          for (const t of project.tasks) {
            const subtask = t.subtasks.find((st) => st.id === id);
            if (subtask) {
              relatedSubtask = subtask;
              parentTask = t;
              parentProject = project;
              break;
            }
          }
          
          if (relatedTask || relatedSubtask) break;
        }
      }
      
      if (!isSelected) {
        // 選択に追加された場合のみダッシュボードに追加
        const groupId = "today"; // 今日のタスクグループに追加
        
        if (projectWithId) {
          // プロジェクトを追加
          addProjectToDashboard(projectWithId.id, projectWithId.title, groupId);
        } else if (relatedTask && parentProject) {
          // タスクを追加
          addTaskToProject(relatedTask.title, parentProject.id, groupId, {
            sort_order: Date.now(),
            sourceTaskData: {
              id: relatedTask.id,
              title: relatedTask.title,
              completed: relatedTask.completed,
              subtasks: relatedTask.subtasks
            }
          });
        } else if (relatedSubtask && parentTask && parentProject) {
          // サブタスクを追加
          addSubtaskToTask(relatedSubtask.title, parentTask.id, parentProject.id, groupId, Date.now());
        }
      }
      
      // Zustandの状態も更新
      return {
        selectedForDashboard: isSelected
          ? s.selectedForDashboard.filter((x) => x !== id)
          : [...s.selectedForDashboard, id],
      };
    }),

  breakdown: () => alert("今はダミーです 🚧"),
}))
