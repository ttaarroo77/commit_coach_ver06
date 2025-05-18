// タスクの優先度
export type TaskPriority = "low" | "medium" | "high"

// タスクのステータス
export type TaskStatus = "todo" | "in-progress" | "completed"

// サブタスクの型定義
export interface SubTask {
  id: string
  title: string
  completed: boolean
}

// タスクの型定義
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  time?: string
  tags?: string[]
  parentId?: string | null
  subTasks?: SubTask[]
  progress?: number // 0-100の進捗率
  createdAt: string
  updatedAt: string
}

// タスクグループの型定義
export interface TaskGroup {
  id: string
  title: string
  tasks: Task[]
  collapsed?: boolean
}
