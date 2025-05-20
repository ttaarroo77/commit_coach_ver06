// apps/frontend/app/dashboard/_hooks/use-dashboard.ts
"use client"
import { useState, useEffect } from "react"
import {
  getDashboardData,
  saveDashboardData,
  addProjectToDashboard,
  addTaskToProject,
  addSubtaskToTask,
  calculateProgress,
  reorderItems,
  sortByOrder,
  callReorderApi,
  type TaskGroup,
  type Project,
  type Task,
  type SubTask,
} from "@/lib/dashboard-utils"
import type { DragEndEvent } from "@dnd-kit/core"

export type DashboardCtx = ReturnType<typeof useDashboard>

export const useDashboard = () => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  /* --- 初期ロード & clock --- */
  useEffect(() => {
    setTaskGroups(getDashboardData())
    setIsLoading(false)
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  /* --- persist --- */
  useEffect(() => {
    if (!isLoading) saveDashboardData(taskGroups)
  }, [taskGroups, isLoading])

  /* --- helper format --- */
  const formatTimeDisplay = (d: Date) =>
    d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
  const formatDateDisplay = (d: Date) =>
    d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })

  /* --- UI handlers（すべて page.tsx から移植）--- */
  const toggleTaskGroup = (id: string) =>
    setTaskGroups((g) => g.map((tg) => (tg.id === id ? { ...tg, expanded: !tg.expanded } : tg)))

  const toggleProject = (gid: string, pid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? { ...g, projects: g.projects.map((p) => (p.id === pid ? { ...p, expanded: !p.expanded } : p)) }
          : g,
      ),
    )

  const toggleTask = (gid: string, pid: string, tid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === tid ? { ...t, expanded: !t.expanded } : t,
                      ),
                    }
                  : p,
              ),
            }
          : g,
      ),
    )

  const updateProjectCompletionStatus = (gid: string, pid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) => {
                if (p.id !== pid) return p
                const allCompleted = p.tasks.length > 0 && p.tasks.every((t) => t.completed)
                return {
                  ...p,
                  completed: allCompleted,
                  status: allCompleted
                    ? "completed"
                    : p.tasks.some((t) => t.status === "in-progress")
                    ? "in-progress"
                    : "todo",
                }
              }),
            }
          : g,
      ),
    )

  const updateTaskProgress = (gid: string, pid: string, tid: string) => {
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) => {
                        if (t.id !== tid) return t
                        const prog = calculateProgress(t.subtasks)
                        const all = t.subtasks.length > 0 && t.subtasks.every((s) => s.completed)
                        return { ...t, progress: prog, completed: all, status: all ? "completed" : prog > 0 ? "in-progress" : "todo" }
                      }),
                    }
                  : p,
              ),
            }
          : g,
      ),
    )
    updateProjectCompletionStatus(gid, pid)
  }

  /* --- complete toggles (project / task / subtask) --- */
  const toggleProjectComplete = (gid: string, pid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) => {
                if (p.id !== pid) return p
                const newC = !p.completed
                return {
                  ...p,
                  completed: newC,
                  status: newC ? "completed" : "todo",
                  tasks: p.tasks.map((t) => ({
                    ...t,
                    completed: newC,
                    status: newC ? "completed" : "todo",
                    progress: newC ? 100 : 0,
                    subtasks: t.subtasks.map((s) => ({ ...s, completed: newC })),
                  })),
                }
              }),
            }
          : g,
      ),
    )

  const toggleTaskComplete = (gid: string, pid: string, tid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) => {
                        if (t.id !== tid) return t
                        const newC = !t.completed
                        return {
                          ...t,
                          completed: newC,
                          status: newC ? "completed" : "todo",
                          progress: newC ? 100 : 0,
                          subtasks: t.subtasks.map((s) => ({ ...s, completed: newC })),
                        }
                      }),
                    }
                  : p,
              ),
            }
          : g,
      ),
    )

  const toggleSubtaskComplete = (
    gid: string,
    pid: string,
    tid: string,
    sid: string,
  ) => {
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === tid
                          ? {
                              ...t,
                              subtasks: t.subtasks.map((s) =>
                                s.id === sid ? { ...s, completed: !s.completed } : s,
                              ),
                            }
                          : t,
                      ),
                    }
                  : p,
              ),
            }
          : g,
      ),
    )
    updateTaskProgress(gid, pid, tid)
  }

  /* --- add / delete --- */
  const handleAddProject = (gid: string) => {
    addProjectToDashboard(`project-${Date.now()}`, `新しいプロジェクト ${new Date().toLocaleTimeString()}`, gid)
    setTaskGroups(getDashboardData())
  }
  const handleAddTask = (gid: string, pid: string) => {
    // 既存タスクの最大sort_orderを取得
    const group = taskGroups.find(g => g.id === gid);
    if (!group) return;
    
    const project = group.projects.find(p => p.id === pid);
    if (!project) return;
    
    const maxOrder = project.tasks.length > 0 
      ? Math.max(...project.tasks.map(t => t.sort_order)) 
      : -1;
    
    // 新しいsort_orderは最大値+1
    addTaskToProject(`新しいタスク #${Date.now().toString().slice(-4)}`, pid, gid, { sort_order: maxOrder + 1 });
    setTaskGroups(getDashboardData())
  }
  const handleAddSubtask = (gid: string, pid: string, tid: string) => {
    // 既存サブタスクの最大sort_orderを取得
    const group = taskGroups.find(g => g.id === gid);
    if (!group) return;
    
    const project = group.projects.find(p => p.id === pid);
    if (!project) return;
    
    const task = project.tasks.find(t => t.id === tid);
    if (!task) return;
    
    const maxOrder = task.subtasks.length > 0 
      ? Math.max(...task.subtasks.map(s => s.sort_order)) 
      : -1;
    
    // 新しいsort_orderは最大値+1
    addSubtaskToTask(`サブタスク #${Date.now().toString().slice(-4)}`, tid, pid, gid, maxOrder + 1);
    setTaskGroups(getDashboardData())
  }

  const handleDeleteProject = (gid: string, pid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid ? { ...g, projects: g.projects.filter((p) => p.id !== pid) } : g,
      ),
    )
  const handleDeleteTask = (gid: string, pid: string, tid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid ? { ...p, tasks: p.tasks.filter((t) => t.id !== tid) } : p,
              ),
            }
          : g,
      ),
    )
  const handleDeleteSubtask = (gid: string, pid: string, tid: string, sid: string) =>
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === tid
                          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== sid) }
                          : t,
                      ),
                    }
                  : p,
              ),
            }
          : g,
      ),
    )

  /* --- drag & drop (taskGroup / project / task / subtask) --- */
  // @dnd-kit用のドラッグ＆ドロップハンドラー
  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.active || !event.over) return;
    
    const activeId = event.active.id.toString();
    const overId = event.over.id.toString();
    
    if (activeId === overId) return;
    
    // タスクグループの並べ替え
    const activeGroupIndex = taskGroups.findIndex(g => g.id === activeId);
    const overGroupIndex = taskGroups.findIndex(g => g.id === overId);
    
    if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
      const newTaskGroups = [...taskGroups];
      const [movedGroup] = newTaskGroups.splice(activeGroupIndex, 1);
      newTaskGroups.splice(overGroupIndex, 0, movedGroup);
      setTaskGroups(newTaskGroups);
      return;
    }
  }
  
  // プロジェクトのドラッグ＆ドロップ処理
  const handleProjectDragEnd = ({ activeId, overId, groupId }: { activeId: string, overId: string, groupId: string }) => {
    const group = taskGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const activeIndex = group.projects.findIndex(p => p.id === activeId);
    const overIndex = group.projects.findIndex(p => p.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      const newProjects = [...group.projects];
      const [movedProject] = newProjects.splice(activeIndex, 1);
      newProjects.splice(overIndex, 0, movedProject);
      
      setTaskGroups(taskGroups.map(g => 
        g.id === groupId ? { ...g, projects: newProjects } : g
      ));
    }
  }
  
  // タスクのドラッグ＆ドロップ処理
  const handleTaskDragEnd = ({ 
    activeId, 
    overId, 
    groupId, 
    projectId 
  }: { 
    activeId: string, 
    overId: string, 
    groupId: string, 
    projectId: string 
  }) => {
    const group = taskGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const project = group.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const activeIndex = project.tasks.findIndex(t => t.id === activeId);
    const overIndex = project.tasks.findIndex(t => t.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      const newTasks = [...project.tasks];
      const [movedTask] = newTasks.splice(activeIndex, 1);
      newTasks.splice(overIndex, 0, movedTask);
      
      setTaskGroups(taskGroups.map(g => 
        g.id === groupId ? {
          ...g,
          projects: g.projects.map(p => 
            p.id === projectId ? { ...p, tasks: newTasks } : p
          )
        } : g
      ));
      
      updateProjectCompletionStatus(groupId, projectId);
    }
  }
  
  // 時間変更のハンドラー
  const handleTimeChange = (gid: string, pid: string, startTime: string, endTime: string) => {
    setTaskGroups(prev => 
      prev.map(g => 
        g.id === gid ? {
          ...g,
          projects: g.projects.map(p => 
            p.id === pid ? { 
              ...p, 
              startTime, 
              endTime 
            } : p
          )
        } : g
      )
    );
  }
  
  // タスクの時間変更ハンドラー
  const handleTaskTimeChange = (gid: string, pid: string, tid: string, startTime: string, endTime: string) => {
    setTaskGroups(prev => 
      prev.map(g => 
        g.id === gid ? {
          ...g,
          projects: g.projects.map(p => 
            p.id === pid ? {
              ...p,
              tasks: p.tasks.map(t => 
                t.id === tid ? { ...t, startTime, endTime } : t
              )
            } : p
          )
        } : g
      )
    );
  }

    // プロジェクトのタイトル編集
  const handleProjectTitleChange = (gid: string, pid: string, newTitle: string) => {
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid ? { ...p, title: newTitle } : p
              ),
            }
          : g
      )
    );
  };

  // タスクのタイトル編集
  const handleTaskTitleChange = (gid: string, pid: string, tid: string, newTitle: string) => {
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === tid ? { ...t, title: newTitle } : t
                      ),
                    }
                  : p
              ),
            }
          : g
      )
    );
  };

  // サブタスクのタイトル編集
  const handleSubtaskTitleChange = (gid: string, pid: string, tid: string, sid: string, newTitle: string) => {
    setTaskGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? {
              ...g,
              projects: g.projects.map((p) =>
                p.id === pid
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === tid
                          ? {
                              ...t,
                              subtasks: t.subtasks.map((s) =>
                                s.id === sid ? { ...s, title: newTitle } : s
                              ),
                            }
                          : t
                      ),
                    }
                  : p
              ),
            }
          : g
      )
    );
    updateTaskProgress(gid, pid, tid);
  };

  // プロジェクトの並べ替え（sort_order 使用）
  const handleReorderProjects = async (gid: string, startIndex: number, endIndex: number) => {
    const group = taskGroups.find((g) => g.id === gid);
    if (!group) return;
    
    const projects = [...group.projects];
    const updatedProjects = await reorderItems(projects, startIndex, endIndex);
    
    // データを更新
    setTaskGroups(taskGroups.map((g) =>
      g.id === gid ? { ...g, projects: updatedProjects } : g
    ));
    
    // API呼び出し（バックエンド同期）
    const ids = updatedProjects.map(p => p.id);
    const orders = updatedProjects.map(p => p.sort_order);
    callReorderApi('/projects', ids, orders);
  };

  // タスクの並べ替え（sort_order 使用）
  const handleReorderTasks = async (gid: string, pid: string, startIndex: number, endIndex: number) => {
    const group = taskGroups.find((g) => g.id === gid);
    if (!group) return;
    
    const project = group.projects.find((p) => p.id === pid);
    if (!project) return;
    
    const tasks = [...project.tasks];
    const updatedTasks = await reorderItems(tasks, startIndex, endIndex);
    
    // データを更新
    setTaskGroups(taskGroups.map((g) =>
      g.id === gid ? {
        ...g,
        projects: g.projects.map((p) =>
          p.id === pid ? { ...p, tasks: updatedTasks } : p
        )
      } : g
    ));
    
    // API呼び出し（バックエンド同期）
    const ids = updatedTasks.map(t => t.id);
    const orders = updatedTasks.map(t => t.sort_order);
    callReorderApi(`/tasks?groupId=${gid}&projectId=${pid}`, ids, orders);
  };

  // サブタスクの並べ替え（sort_order 使用）
  const handleReorderSubtasks = async (gid: string, pid: string, tid: string, startIndex: number, endIndex: number) => {
    const group = taskGroups.find((g) => g.id === gid);
    if (!group) return;
    
    const project = group.projects.find((p) => p.id === pid);
    if (!project) return;
    
    const task = project.tasks.find((t) => t.id === tid);
    if (!task) return;
    
    const subtasks = [...task.subtasks];
    const updatedSubtasks = await reorderItems(subtasks, startIndex, endIndex);
    
    // データを更新
    setTaskGroups(taskGroups.map((g) =>
      g.id === gid ? {
        ...g,
        projects: g.projects.map((p) =>
          p.id === pid ? {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === tid ? { ...t, subtasks: updatedSubtasks } : t
            )
          } : p
        )
      } : g
    ));
    
    // API呼び出し（バックエンド同期）
    const ids = updatedSubtasks.map(s => s.id);
    const orders = updatedSubtasks.map(s => s.sort_order);
    callReorderApi(`/subtasks?groupId=${gid}&projectId=${pid}&taskId=${tid}`, ids, orders);
  };

  return {
    /* state */
    taskGroups,
    currentTime,
    isLoading,
    /* formatter */
    formatTimeDisplay,
    formatDateDisplay,
    /* handlers */
    toggleTaskGroup,
    toggleProject,
    toggleTask,
    toggleProjectComplete,
    toggleTaskComplete,
    toggleSubtaskComplete,
    handleAddProject,
    handleAddTask,
    handleAddSubtask,
    handleDeleteProject,
    handleDeleteTask,
    handleDeleteSubtask,
    handleDragEnd,
    handleProjectDragEnd,
    handleTaskDragEnd,
    handleTimeChange,
    handleTaskTimeChange,
    /* 新機能：編集と並び替え */
    handleProjectTitleChange,
    handleTaskTitleChange,
    handleSubtaskTitleChange,
    handleReorderProjects,
    handleReorderTasks,
    handleReorderSubtasks
  }
}
