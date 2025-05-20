// apps/frontend/lib/dashboard-utils.ts
// --- 型定義 -------------------------------------------------
export type SubTask = {
  id: string
  title: string
  completed: boolean
  sort_order: number  // 並び順
  /* 時間欄は後日拡張
  startTime?: string
  endTime?: string
  */
}

export type Task = {
  id: string
  title: string
  completed: boolean
  expanded: boolean
  subtasks: SubTask[]
  progress: number
  status: "todo" | "in-progress" | "completed"
  sort_order: number  // 並び順
  startTime?: string
  endTime?: string
  project?: string
  priority?: string
}

export type Project = {
  id: string
  title: string
  completed: boolean
  expanded: boolean
  tasks: Task[]
  status: "todo" | "in-progress" | "completed"
  sort_order: number  // 並び順
  startTime?: string
  endTime?: string
  priority?: string
}

export type TaskGroup = {
  id: string
  title: string
  expanded: boolean
  projects: Project[]
}

// --- Storage helpers ---------------------------------------
const STORAGE_KEY = "dashboardData"
const read = (): TaskGroup[] => {
  if (typeof window === "undefined") return getDefaultDashboardData()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const def = getDefaultDashboardData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(def))
    return def
  }
  try {
    return JSON.parse(raw)
  } catch {
    return getDefaultDashboardData()
  }
}
const write = (d: TaskGroup[]) => {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
}

export const getDashboardData = read
export const saveDashboardData = write

// --- デフォルトダミーデータ（既存コードそのまま） -------
export const getDefaultDashboardData = (): TaskGroup[] => {
  return [
    {
      id: "today",
      title: "今日のタスク",
      expanded: true,
      projects: [
        {
          id: "project-1",
          title: "チーム管理",
          completed: false,
          expanded: true,
          tasks: [
            {
              id: "task-1",
              title: "朝のミーティング",
              completed: true,
              expanded: true,
              subtasks: [
                { id: "subtask-1-1", title: "議事録作成", completed: true },
                { id: "subtask-1-2", title: "タスク割り当て", completed: true },
              ],
              startTime: "09:00",
              endTime: "10:00",
              status: "completed",
              priority: "中",
              progress: 100,
            },
            {
              id: "task-3",
              title: "ランチミーティング",
              completed: true,
              expanded: false,
              subtasks: [],
              startTime: "13:00",
              endTime: "14:00",
              status: "completed",
              priority: "低",
              progress: 100,
            },
          ],
          status: "in-progress",
        },
        {
          id: "project-2",
          title: "ウェブアプリ開発",
          completed: false,
          expanded: true,
          tasks: [
            {
              id: "task-2",
              title: "ログイン機能の実装",
              completed: true,
              expanded: false,
              subtasks: [
                { id: "subtask-2-1", title: "UI設計", completed: true },
                { id: "subtask-2-2", title: "バックエンド連携", completed: true },
                { id: "subtask-2-3", title: "テスト", completed: true },
              ],
              startTime: "10:00",
              endTime: "13:00",
              status: "completed",
              priority: "高",
              progress: 100,
            },
            {
              id: "task-4",
              title: "APIエンドポイントの実装",
              completed: false,
              expanded: true,
              subtasks: [
                { id: "subtask-4-1", title: "認証エンドポイント", completed: true },
                { id: "subtask-4-2", title: "ユーザー管理API", completed: false },
                { id: "subtask-4-3", title: "データ取得API", completed: false },
              ],
              startTime: "14:00",
              endTime: "16:00",
              status: "in-progress",
              priority: "高",
              progress: 50,
            },
          ],
          status: "in-progress",
        },
      ],
    },
    {
      id: "unscheduled",
      title: "未定のタスク",
      expanded: true,
      projects: [
        {
          id: "project-4",
          title: "ウェブアプリ開発",
          completed: false,
          expanded: true,
          tasks: [
            {
              id: "task-6",
              title: "レスポンシブデザインの実装",
              completed: false,
              expanded: true,
              subtasks: [
                { id: "subtask-6-1", title: "モバイル対応", completed: false },
                { id: "subtask-6-2", title: "タブレット対応", completed: false },
              ],
              status: "todo",
              priority: "中",
              progress: 0,
            },
          ],
          status: "todo",
        },
      ],
    },
  ]
}

// --- 追加 / CRUD 関数 ------------
// ダッシュボードにプロジェクトを追加する関数
export const addProjectToDashboard = (projectId: string, projectTitle: string, groupId = "today"): void => {
  const now = new Date()
  const startTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  const endTime = `${(now.getHours() + 1).toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  // プロジェクト一覧からプロジェクトデータを取得（実際の実装ではAPIやデータベースから取得）
  let projectData: Project | null = null

  // ローカルストレージからプロジェクト一覧を取得
  try {
    const projectsData = localStorage.getItem("projects")
    if (projectsData) {
      const projects = JSON.parse(projectsData)
      if (projects[projectId]) {
        // プロジェクトデータを取得
        const sourceProject = projects[projectId]

        // ダッシュボード用のプロジェクトデータを作成
        projectData = {
          id: projectId,
          title: sourceProject.projectTitle || projectTitle,
          completed: false,
          expanded: true,
          tasks: [],
          startTime: groupId === "today" ? startTime : undefined,
          endTime: groupId === "today" ? endTime : undefined,
          status: "todo",
          priority: "中",
        }

        // タスクグループを変換
        if (sourceProject.taskGroups && Array.isArray(sourceProject.taskGroups)) {
          sourceProject.taskGroups.forEach((taskGroup: { tasks: any[] }) => {
            if (taskGroup.tasks && Array.isArray(taskGroup.tasks)) {
              taskGroup.tasks.forEach((task: { id: string; title: string; completed?: boolean; subtasks?: any[] }) => {
                // タスクを追加
                const newTask: Task = {
                  id: task.id,
                  title: task.title,
                  completed: task.completed || false,
                  expanded: false, // 初期状態では折りたたむ
                  subtasks: [],
                  status: task.completed ? "completed" : "todo",
                  progress: task.completed ? 100 : 0,
                  priority: "中",
                }

                // サブタスクを追加
                if (task.subtasks && Array.isArray(task.subtasks)) {
                  newTask.subtasks = task.subtasks.map((subtask: { id: string; title: string; completed?: boolean }) => ({
                    id: subtask.id,
                    title: subtask.title,
                    completed: subtask.completed || false,
                  }))

                  // サブタスクの完了状態に基づいてタスクの進捗を計算
                  if (newTask.subtasks.length > 0) {
                    const completedSubtasks = newTask.subtasks.filter((st) => st.completed).length
                    newTask.progress = Math.round((completedSubtasks / newTask.subtasks.length) * 100)
                    newTask.status =
                      newTask.progress === 100 ? "completed" : newTask.progress > 0 ? "in-progress" : "todo"
                  }
                }

                projectData?.tasks.push(newTask)
              })
            }
          })
        }
      }
    }
  } catch (error) {
    console.error("プロジェクトデータの取得に失敗しました", error)
  }

  // プロジェクトデータが取得できなかった場合は新規作成
  if (!projectData) {
    projectData = {
      id: projectId || `project-${Date.now()}`,
      title: projectTitle,
      completed: false,
      expanded: true,
      tasks: [],
      startTime: groupId === "today" ? startTime : undefined,
      endTime: groupId === "today" ? endTime : undefined,
      status: "todo",
      priority: "中",
    }
  }

  const dashboardData = getDashboardData()
  const updatedData = dashboardData.map((group) => {
    if (group.id === groupId) {
      return {
        ...group,
        projects: [...group.projects, projectData!],
      }
    }
    return group
  })

  saveDashboardData(updatedData)
}

// タスクをプロジェクトに追加（サブタスクも含めて）
export const addTaskToProject = (taskTitle: string, projectId: string, groupId: string, options?: { sort_order?: number, sourceTaskData?: any }): void => {
  const sourceTaskData = options?.sourceTaskData;
  const dashboardData = getDashboardData()
  const updatedData = dashboardData.map((group) => {
    if (group.id === groupId) {
      return {
        ...group,
        projects: group.projects.map((project) => {
          if (project.id === projectId) {
            // ソースタスクデータがある場合はそれを使用
            let newTask: Task

            if (sourceTaskData) {
              // ソースタスクデータから新しいタスクを作成
              newTask = {
                id: sourceTaskData.id || `task-${Date.now()}`,
                title: sourceTaskData.title || taskTitle,
                completed: sourceTaskData.completed || false,
                expanded: false, // 初期状態では折りたたむ
                subtasks: [],
                status: sourceTaskData.completed ? "completed" : "todo",
                progress: sourceTaskData.completed ? 100 : 0,
                priority: "中",
              }

              // サブタスクを追加
              if (sourceTaskData.subtasks && Array.isArray(sourceTaskData.subtasks)) {
                newTask.subtasks = sourceTaskData.subtasks.map((subtask: { id?: string; title: string; completed?: boolean }) => ({
                  id: subtask.id || `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: subtask.title,
                  completed: subtask.completed || false,
                }))

                // サブタスクの完了状態に基づいてタスクの進捗を計算
                if (newTask.subtasks.length > 0) {
                  const completedSubtasks = newTask.subtasks.filter((st) => st.completed).length
                  newTask.progress = Math.round((completedSubtasks / newTask.subtasks.length) * 100)
                  newTask.status =
                    newTask.progress === 100 ? "completed" : newTask.progress > 0 ? "in-progress" : "todo"
                }
              }
            } else {
              // 新規タスクを作成
              newTask = {
                id: `task-${Date.now()}`,
                title: taskTitle,
                completed: false,
                expanded: true,
                subtasks: [],
                status: "todo",
                priority: "中",
                progress: 0,
                sort_order: options?.sort_order || 0,
              }
            }

            // 今日のタスクの場合は時間を設定
            if (groupId === "today") {
              const now = new Date()
              newTask.startTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
              newTask.endTime = `${(now.getHours() + 1).toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
            }

            return {
              ...project,
              tasks: [...project.tasks, newTask],
            }
          }
          return project
        }),
      }
    }
    return group
  })

  saveDashboardData(updatedData)
}

// サブタスクをタスクに追加
export const addSubtaskToTask = (subtaskTitle: string, taskId: string, projectId: string, groupId: string, sort_order: number = 0): void => {
  const dashboardData = getDashboardData()
  const updatedData = dashboardData.map((group) => {
    if (group.id === groupId) {
      return {
        ...group,
        projects: group.projects.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: project.tasks.map((task) => {
                if (task.id === taskId) {
                  const newSubtask: SubTask = {
                    id: `subtask-${Date.now()}`,
                    title: subtaskTitle,
                    completed: false,
                    sort_order: sort_order,
                  }
                  return {
                    ...task,
                    subtasks: [...task.subtasks, newSubtask],
                  }
                }
                return task
              }),
            }
          }
          return project
        }),
      }
    }
    return group
  })

  saveDashboardData(updatedData)
}


// ===========================================================
// 🛠 ここから下を new Hook 仕様に合わせて修正
// ===========================================================

// --- 並び替え関連関数 -------------------------------------------

// 並び替え処理用のAPI関数
export const reorderItems = async <T extends { id: string; sort_order: number }>(items: T[], startIndex: number, endIndex: number): Promise<T[]> => {
  const result = Array.from(items);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  // sort_orderを更新
  const updatedItems = result.map((item, index) => ({
    ...item,
    sort_order: index
  }));

  return updatedItems;
};

// データのsort_order順でソート
export const sortByOrder = <T extends { sort_order: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
};

// 並び替えAPIを呼び出すための関数
export const callReorderApi = async (path: string, ids: string[], order: number[]): Promise<boolean> => {
  try {
    const response = await fetch(`/api/tasks/reorder${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids, order })
    });
    
    return response.ok;
  } catch (error) {
    console.error('並び替えAPI呼び出しエラー:', error);
    return false;
  }
};

/**
 * 新仕様：SubTask[] を受け取って進捗(%)を返す
 */
export const calculateProgress = (subtasks: SubTask[]): number => {
  if (!subtasks || subtasks.length === 0) return 0
  const done = subtasks.filter((s) => s.completed).length
  return Math.round((done / subtasks.length) * 100)
}

/* 更新関数も SubTask[] 版に対応 */
export const updateTaskProgress = (
  data: TaskGroup[],
  groupId: string,
  projectId: string,
  taskId: string,
) => {
  const group = data.find((g) => g.id === groupId)
  if (!group) return data

  const project = group.projects.find((p) => p.id === projectId)
  if (!project) return data

  const task = project.tasks.find((t) => t.id === taskId)
  if (!task) return data

  task.progress = calculateProgress(task.subtasks)
  task.completed = task.subtasks.length > 0 && task.subtasks.every((st) => st.completed)
  task.status = task.completed ? "completed" : task.progress > 0 ? "in-progress" : "todo"

  return data
}

export const updateProjectCompletionStatus = (
  data: TaskGroup[],
  groupId: string,
  projectId: string,
) => {
  const group = data.find((g) => g.id === groupId)
  if (!group) return data

  const project = group.projects.find((p) => p.id === projectId)
  if (!project) return data

  const allTasksCompleted = project.tasks.length > 0 && project.tasks.every((t) => t.completed)
  project.completed = allTasksCompleted
  project.status = allTasksCompleted
    ? "completed"
    : project.tasks.some((t) => t.status === "in-progress")
    ? "in-progress"
    : "todo"

  return data
}



// 以下は旧コード
// // lib- > dashboard-utils.ts

// // ダッシュボードに追加するタスクの型定義
// export type SubTask = {
//   id: string
//   title: string
//   completed: boolean
//   // 以下の時間関連フィールドは現在は使用しないためコメントアウト
//   /*
//   startTime?: string
//   endTime?: string
//   */
// }

// export type Task = {
//   id: string
//   title: string
//   completed: boolean
//   expanded: boolean
//   subtasks: SubTask[]
//   progress: number
//   status: "todo" | "in-progress" | "completed"
//   startTime?: string
//   endTime?: string
//   project?: string
//   priority?: string
// }

// export type Project = {
//   id: string
//   title: string
//   completed: boolean
//   expanded: boolean
//   tasks: Task[]
//   status: "todo" | "in-progress" | "completed"
//   startTime?: string
//   endTime?: string
//   priority?: string
// }

// export type TaskGroup = {
//   id: string
//   title: string
//   expanded: boolean
//   projects: Project[]
// }

// // ダッシュボードのタスクをローカルストレージから取得
// export const getDashboardData = (): TaskGroup[] => {
//   if (typeof window === "undefined") return getDefaultDashboardData()

//   const storedData = localStorage.getItem("dashboardData")
//   if (!storedData) {
//     // 初回アクセス時はデフォルトデータをストレージに保存
//     const defaultData = getDefaultDashboardData()
//     localStorage.setItem("dashboardData", JSON.stringify(defaultData))
//     return defaultData
//   }

//   try {
//     return JSON.parse(storedData)
//   } catch (error) {
//     console.error("ダッシュボードデータの解析に失敗しました", error)
//     return getDefaultDashboardData()
//   }
// }

// // ダッシュボードのデータをローカルストレージに保存
// export const saveDashboardData = (data: TaskGroup[]) => {
//   if (typeof window === "undefined") return
//   localStorage.setItem("dashboardData", JSON.stringify(data))
// }

// // デフォルトのダッシュボードデータを取得
// export const getDefaultDashboardData = (): TaskGroup[] => {
//   return [
//     {
//       id: "today",
//       title: "今日のタスク",
//       expanded: true,
//       projects: [
//         {
//           id: "project-1",
//           title: "チーム管理",
//           completed: false,
//           expanded: true,
//           tasks: [
//             {
//               id: "task-1",
//               title: "朝のミーティング",
//               completed: true,
//               expanded: true,
//               subtasks: [
//                 { id: "subtask-1-1", title: "議事録作成", completed: true },
//                 { id: "subtask-1-2", title: "タスク割り当て", completed: true },
//               ],
//               startTime: "09:00",
//               endTime: "10:00",
//               status: "completed",
//               priority: "中",
//               progress: 100,
//             },
//             {
//               id: "task-3",
//               title: "ランチミーティング",
//               completed: true,
//               expanded: false,
//               subtasks: [],
//               startTime: "13:00",
//               endTime: "14:00",
//               status: "completed",
//               priority: "低",
//               progress: 100,
//             },
//           ],
//           status: "in-progress",
//         },
//         {
//           id: "project-2",
//           title: "ウェブアプリ開発",
//           completed: false,
//           expanded: true,
//           tasks: [
//             {
//               id: "task-2",
//               title: "ログイン機能の実装",
//               completed: true,
//               expanded: false,
//               subtasks: [
//                 { id: "subtask-2-1", title: "UI設計", completed: true },
//                 { id: "subtask-2-2", title: "バックエンド連携", completed: true },
//                 { id: "subtask-2-3", title: "テスト", completed: true },
//               ],
//               startTime: "10:00",
//               endTime: "13:00",
//               status: "completed",
//               priority: "高",
//               progress: 100,
//             },
//             {
//               id: "task-4",
//               title: "APIエンドポイントの実装",
//               completed: false,
//               expanded: true,
//               subtasks: [
//                 { id: "subtask-4-1", title: "認証エンドポイント", completed: true },
//                 { id: "subtask-4-2", title: "ユーザー管理API", completed: false },
//                 { id: "subtask-4-3", title: "データ取得API", completed: false },
//               ],
//               startTime: "14:00",
//               endTime: "16:00",
//               status: "in-progress",
//               priority: "高",
//               progress: 50,
//             },
//           ],
//           status: "in-progress",
//         },
//         {
//           id: "project-3",
//           title: "デザインプロジェクト",
//           completed: false,
//           expanded: true,
//           tasks: [
//             {
//               id: "task-5",
//               title: "ダッシュボード画面のデザイン",
//               completed: false,
//               expanded: true,
//               subtasks: [
//                 { id: "subtask-5-1", title: "ワイヤーフレーム作成", completed: false },
//                 { id: "subtask-5-2", title: "コンポーネント設計", completed: false },
//                 { id: "subtask-5-3", title: "レスポンシブ対応", completed: false },
//               ],
//               startTime: "16:00",
//               endTime: "18:00",
//               status: "todo",
//               priority: "中",
//               progress: 0,
//             },
//           ],
//           status: "todo",
//         },
//       ],
//     },
//     {
//       id: "unscheduled",
//       title: "未定のタスク",
//       expanded: true,
//       projects: [
//         {
//           id: "project-4",
//           title: "ウェブアプリ開発",
//           completed: false,
//           expanded: true,
//           tasks: [
//             {
//               id: "task-6",
//               title: "レスポンシブデザインの実装",
//               completed: false,
//               expanded: true,
//               subtasks: [
//                 { id: "subtask-6-1", title: "モバイル対応", completed: false },
//                 { id: "subtask-6-2", title: "タブレット対応", completed: false },
//               ],
//               status: "todo",
//               priority: "中",
//               progress: 0,
//             },
//             {
//               id: "task-7",
//               title: "ユーザー設定画面の作成",
//               completed: false,
//               expanded: false,
//               subtasks: [
//                 { id: "subtask-7-1", title: "プロフィール編集機能", completed: false },
//                 { id: "subtask-7-2", title: "パスワード変更機能", completed: false },
//                 { id: "subtask-7-3", title: "通知設定機能", completed: false },
//               ],
//               status: "todo",
//               priority: "低",
//               progress: 0,
//             },
//           ],
//           status: "todo",
//         },
//         {
//           id: "project-5",
//           title: "QA",
//           completed: false,
//           expanded: true,
//           tasks: [
//             {
//               id: "task-8",
//               title: "テスト計画書の作成",
//               completed: false,
//               expanded: true,
//               subtasks: [
//                 { id: "subtask-8-1", title: "テスト範囲の定義", completed: false },
//                 { id: "subtask-8-2", title: "テストケースの作成", completed: false },
//               ],
//               status: "todo",
//               priority: "高",
//               progress: 0,
//             },
//           ],
//           status: "todo",
//         },
//       ],
//     },
//   ]
// }

// // プロジェクト一覧からプロジェクトをダッシュボードに追加（階層構造を維持）
// export const addProjectToDashboard = (projectId: string, projectTitle: string, groupId = "today"): void => {
//   const now = new Date()
//   const startTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
//   const endTime = `${(now.getHours() + 1).toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

//   // プロジェクト一覧からプロジェクトデータを取得（実際の実装ではAPIやデータベースから取得）
//   let projectData: Project | null = null

//   // ローカルストレージからプロジェクト一覧を取得
//   try {
//     const projectsData = localStorage.getItem("projects")
//     if (projectsData) {
//       const projects = JSON.parse(projectsData)
//       if (projects[projectId]) {
//         // プロジェクトデータを取得
//         const sourceProject = projects[projectId]

//         // ダッシュボード用のプロジェクトデータを作成
//         projectData = {
//           id: projectId,
//           title: sourceProject.projectTitle || projectTitle,
//           completed: false,
//           expanded: true,
//           tasks: [],
//           startTime: groupId === "today" ? startTime : undefined,
//           endTime: groupId === "today" ? endTime : undefined,
//           status: "todo",
//           priority: "中",
//         }

//         // タスクグループを変換
//         if (sourceProject.taskGroups && Array.isArray(sourceProject.taskGroups)) {
//           sourceProject.taskGroups.forEach((taskGroup) => {
//             if (taskGroup.tasks && Array.isArray(taskGroup.tasks)) {
//               taskGroup.tasks.forEach((task) => {
//                 // タスクを追加
//                 const newTask: Task = {
//                   id: task.id,
//                   title: task.title,
//                   completed: task.completed || false,
//                   expanded: false, // 初期状態では折りたたむ
//                   subtasks: [],
//                   status: task.completed ? "completed" : "todo",
//                   progress: task.completed ? 100 : 0,
//                   priority: "中",
//                 }

//                 // サブタスクを追加
//                 if (task.subtasks && Array.isArray(task.subtasks)) {
//                   newTask.subtasks = task.subtasks.map((subtask) => ({
//                     id: subtask.id,
//                     title: subtask.title,
//                     completed: subtask.completed || false,
//                   }))

//                   // サブタスクの完了状態に基づいてタスクの進捗を計算
//                   if (newTask.subtasks.length > 0) {
//                     const completedSubtasks = newTask.subtasks.filter((st) => st.completed).length
//                     newTask.progress = Math.round((completedSubtasks / newTask.subtasks.length) * 100)
//                     newTask.status =
//                       newTask.progress === 100 ? "completed" : newTask.progress > 0 ? "in-progress" : "todo"
//                   }
//                 }

//                 projectData?.tasks.push(newTask)
//               })
//             }
//           })
//         }
//       }
//     }
//   } catch (error) {
//     console.error("プロジェクトデータの取得に失敗しました", error)
//   }

//   // プロジェクトデータが取得できなかった場合は新規作成
//   if (!projectData) {
//     projectData = {
//       id: projectId || `project-${Date.now()}`,
//       title: projectTitle,
//       completed: false,
//       expanded: true,
//       tasks: [],
//       startTime: groupId === "today" ? startTime : undefined,
//       endTime: groupId === "today" ? endTime : undefined,
//       status: "todo",
//       priority: "中",
//     }
//   }

//   const dashboardData = getDashboardData()
//   const updatedData = dashboardData.map((group) => {
//     if (group.id === groupId) {
//       return {
//         ...group,
//         projects: [...group.projects, projectData!],
//       }
//     }
//     return group
//   })

//   saveDashboardData(updatedData)
// }

// // タスクをプロジェクトに追加（サブタスクも含めて）
// export const addTaskToProject = (taskTitle: string, projectId: string, groupId: string, sourceTaskData?: any): void => {
//   const dashboardData = getDashboardData()
//   const updatedData = dashboardData.map((group) => {
//     if (group.id === groupId) {
//       return {
//         ...group,
//         projects: group.projects.map((project) => {
//           if (project.id === projectId) {
//             // ソースタスクデータがある場合はそれを使用
//             let newTask: Task

//             if (sourceTaskData) {
//               // ソースタスクデータから新しいタスクを作成
//               newTask = {
//                 id: sourceTaskData.id || `task-${Date.now()}`,
//                 title: sourceTaskData.title || taskTitle,
//                 completed: sourceTaskData.completed || false,
//                 expanded: false, // 初期状態では折りたたむ
//                 subtasks: [],
//                 status: sourceTaskData.completed ? "completed" : "todo",
//                 progress: sourceTaskData.completed ? 100 : 0,
//                 priority: "中",
//               }

//               // サブタスクを追加
//               if (sourceTaskData.subtasks && Array.isArray(sourceTaskData.subtasks)) {
//                 newTask.subtasks = sourceTaskData.subtasks.map((subtask: any) => ({
//                   id: subtask.id || `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
//                   title: subtask.title,
//                   completed: subtask.completed || false,
//                 }))

//                 // サブタスクの完了状態に基づいてタスクの進捗を計算
//                 if (newTask.subtasks.length > 0) {
//                   const completedSubtasks = newTask.subtasks.filter((st) => st.completed).length
//                   newTask.progress = Math.round((completedSubtasks / newTask.subtasks.length) * 100)
//                   newTask.status =
//                     newTask.progress === 100 ? "completed" : newTask.progress > 0 ? "in-progress" : "todo"
//                 }
//               }
//             } else {
//               // 新規タスクを作成
//               newTask = {
//                 id: `task-${Date.now()}`,
//                 title: taskTitle,
//                 completed: false,
//                 expanded: true,
//                 subtasks: [],
//                 status: "todo",
//                 priority: "中",
//                 progress: 0,
//               }
//             }

//             // 今日のタスクの場合は時間を設定
//             if (groupId === "today") {
//               const now = new Date()
//               newTask.startTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
//               newTask.endTime = `${(now.getHours() + 1).toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
//             }

//             return {
//               ...project,
//               tasks: [...project.tasks, newTask],
//             }
//           }
//           return project
//         }),
//       }
//     }
//     return group
//   })

//   saveDashboardData(updatedData)
// }

// // サブタスクをタスクに追加
// export const addSubtaskToTask = (subtaskTitle: string, taskId: string, projectId: string, groupId: string): void => {
//   const dashboardData = getDashboardData()
//   const updatedData = dashboardData.map((group) => {
//     if (group.id === groupId) {
//       return {
//         ...group,
//         projects: group.projects.map((project) => {
//           if (project.id === projectId) {
//             return {
//               ...project,
//               tasks: project.tasks.map((task) => {
//                 if (task.id === taskId) {
//                   const newSubtask: SubTask = {
//                     id: `subtask-${Date.now()}`,
//                     title: subtaskTitle,
//                     completed: false,
//                   }
//                   return {
//                     ...task,
//                     subtasks: [...task.subtasks, newSubtask],
//                   }
//                 }
//                 return task
//               }),
//             }
//           }
//           return project
//         }),
//       }
//     }
//     return group
//   })

//   saveDashboardData(updatedData)
// }

// // 進捗率を計算する
// export const calculateProgress = (task: Task): number => {
//   if (!task.subtasks || task.subtasks.length === 0) {
//     return task.completed ? 100 : 0
//   }

//   const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
//   return Math.round((completedSubtasks / task.subtasks.length) * 100)
// }

// // 状態更新関数
// export const updateTaskProgress = (data: TaskGroup[], groupId: string, projectId: string, taskId: string) => {
//   const group = data.find((g) => g.id === groupId)
//   if (group) {
//     const project = group.projects.find((p) => p.id === projectId)
//     if (project) {
//       const task = project.tasks.find((t) => t.id === taskId)
//       if (task) {
//         const progress = calculateProgress(task)
//         const allCompleted = task.subtasks.length > 0 && task.subtasks.every((st) => st.completed)
//         task.progress = progress
//         task.completed = allCompleted
//         task.status = allCompleted ? "completed" : progress > 0 ? "in-progress" : "todo"
//       }
//     }
//   }
//   return data
// }

// export const updateProjectCompletionStatus = (data: TaskGroup[], groupId: string, projectId: string) => {
//   const group = data.find((g) => g.id === groupId)
//   if (group) {
//     const project = group.projects.find((p) => p.id === projectId)
//     if (project) {
//       const allTasksCompleted = project.tasks.length > 0 && project.tasks.every((task) => task.completed)
//       project.completed = allTasksCompleted
//       project.status = allTasksCompleted
//         ? "completed"
//         : project.tasks.some((t) => t.status === "in-progress")
//           ? "in-progress"
//           : "todo"
//     }
//   }
//   return data
// }
