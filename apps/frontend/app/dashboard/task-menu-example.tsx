"use client";

import { useState } from "react";
import { TaskItemWithMenu } from "@/components/ui/task-item-with-menu";
import { toast } from "@/components/ui/use-toast";

// サンプルタスクデータ
const initialTasks = [
  {
    id: "task-1",
    title: "デザインシステムの構築",
    status: "in-progress",
    time: "今日",
    tags: ["デザイン", "UI"],
    priority: "high" as const,
  },
  {
    id: "task-2",
    title: "APIエンドポイントの実装",
    status: "todo",
    time: "明日",
    tags: ["バックエンド"],
    priority: "medium" as const,
  },
  {
    id: "task-3",
    title: "ユーザーテスト実施",
    status: "completed",
    time: "昨日",
    tags: ["テスト", "UX"],
    priority: "low" as const,
  },
];

export function TaskMenuExample() {
  const [tasks, setTasks] = useState(initialTasks);

  // タスク編集ハンドラ
  const handleEdit = (taskId: string) => {
    toast({
      title: "タスク編集",
      description: `タスクID: ${taskId} の編集モーダルを開きます`,
    });
    // 実際の実装ではここでモーダルを開く
  };

  // タスク削除ハンドラ
  const handleDelete = (taskId: string) => {
    toast({
      title: "タスク削除",
      description: `タスクID: ${taskId} を削除します`,
      variant: "destructive",
    });
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // ステータス変更ハンドラ
  const handleStatusChange = (taskId: string, status: string) => {
    toast({
      title: "ステータス変更",
      description: `タスクID: ${taskId} のステータスを ${status} に変更しました`,
    });
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  // 優先度変更ハンドラ
  const handlePriorityChange = (
    taskId: string,
    priority: "low" | "medium" | "high"
  ) => {
    toast({
      title: "優先度変更",
      description: `タスクID: ${taskId} の優先度を ${priority} に変更しました`,
    });
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, priority } : task))
    );
  };

  // タグ追加ハンドラ
  const handleTagAdd = (taskId: string) => {
    toast({
      title: "タグ追加",
      description: `タスクID: ${taskId} のタグ追加モーダルを開きます`,
    });
    // 実際の実装ではここでモーダルを開く
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">タスク一覧</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItemWithMenu
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onTagAdd={handleTagAdd}
          />
        ))}
      </div>
    </div>
  );
}
