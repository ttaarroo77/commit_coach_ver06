---
name: "docs/overview/types.md"
title: "型定義 (Types)"
description: "アプリケーションで使用する型定義の一覧"
---

# 型定義

## 1. プロジェクト関連

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMember[];
  tasks: Task[];
}
```

### ProjectMember
```typescript
interface ProjectMember {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}
```

### ProjectStatus
```typescript
type ProjectStatus = 'active' | 'archived' | 'completed';
```

## 2. タスク関連

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assigneeId: string | null;
  projectId: string;
  subtasks: Subtask[];
  aiMessages: AIMessage[];
}
```

### Subtask
```typescript
interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
}
```

### TaskStatus
```typescript
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
```

### TaskPriority
```typescript
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

## 3. AI関連

### AIMessage
```typescript
interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  taskId: string;
}
```

## 4. ユーザー関連

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}
```

### UserSettings
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: 'ja' | 'en';
}
```

## 5. 共通型

### ApiResponse
```typescript
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}
```

### PaginationParams
```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```
