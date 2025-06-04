import { create } from "zustand"
import { toast } from "sonner"

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
  breakdown: (level:"project"|"task", ids:string[]) => void
}

export const useProjects = create<Store>((set) => ({
  projects: mockProjects,

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



  // タスク分解機能
  breakdown: (level: "project"|"task", ids: string[]) => {
    // ローディング表示
    toast.loading('AIがタスクを分解しています...', { id: 'ai-breakdown' });
    
    // 非同期処理を実行
    (async () => {
      try {
        const [projectId, taskId] = ids;
        const state = useProjects.getState();
        let title = '';
        
        // レベルに応じてタイトルを取得
        if (level === 'project') {
          const project = state.projects.find(p => p.id === projectId);
          if (!project) throw new Error('プロジェクトが見つかりません');
          title = project.title;
        } else if (level === 'task') {
          const project = state.projects.find(p => p.id === projectId);
          if (!project) throw new Error('プロジェクトが見つかりません');
          
          const task = project.tasks.find(t => t.id === taskId);
          if (!task) throw new Error('タスクが見つかりません');
          title = task.title;
        }
        
        // APIリクエスト
        const response = await fetch('/api/tasks/breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, title })
        });
        
        // エラーチェック
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'タスク分解中にエラーが発生しました');
        }
        
        // レスポンスからサブタスクを取得
        const data = await response.json();
        const subtasks = data.subtasks || [];
        
        // 成功メッセージ
        toast.success('タスクを分解しました', { id: 'ai-breakdown' });
        
        // 状態を更新する関数を呼び出す
        useProjects.setState(state => ({
          projects: state.projects.map(p => {
            if (p.id !== projectId) return p;
            
            // プロジェクトレベルの分解
            if (level === 'project') {
              // 新しいタスクを生成
              const newTasks = subtasks.map((st: { title: string, completed: boolean }) => ({
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                title: st.title,
                completed: false,
                expanded: false,
                subtasks: []
              }));
              
              return {
                ...p,
                expanded: true,
                tasks: [...p.tasks, ...newTasks]
              };
            }
            
            // タスクレベルの分解
            return {
              ...p,
              tasks: p.tasks.map(t => {
                if (t.id !== taskId) return t;
                
                // 新しいサブタスクを生成
                const newSubtasks = subtasks.map((st: { title: string, completed: boolean }) => ({
                  id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: st.title,
                  completed: false
                }));
                
                return {
                  ...t,
                  expanded: true,
                  subtasks: [...t.subtasks, ...newSubtasks]
                };
              })
            };
          })
        }));
        
      } catch (error) {
        // エラーハンドリング
        console.error('タスク分解エラー:', error);
        toast.error(error instanceof Error ? error.message : '予期しないエラーが発生しました', { id: 'ai-breakdown' });
      }
    })();
  },
}))
