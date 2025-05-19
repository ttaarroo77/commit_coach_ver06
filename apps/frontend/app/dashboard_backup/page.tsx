"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { HierarchicalTaskItem } from "@/components/hierarchical-task-item"
import { AICoachSidebar } from "@/components/ai-coach-sidebar"
import {
  getDashboardData,
  saveDashboardData,
  addProjectToDashboard,
  addTaskToProject,
  addSubtaskToTask,
  calculateProgress,
  type TaskGroup,
  type SubTask,
}  from "@/lib/dashboard-utils"

export default function DashboardPage() {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // ダッシュボードデータを読み込む
  useEffect(() => {
    const data = getDashboardData()
    setTaskGroups(data)
    setIsLoading(false)

    // 現在時刻を更新
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 1分ごとに更新

    return () => clearInterval(timer)
  }, [])

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    if (!isLoading) {
      saveDashboardData(taskGroups)
    }
  }, [taskGroups, isLoading])

  // タスクグループの展開/折りたたみを切り替える
  const toggleTaskGroup = (groupId: string) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => (group.id === groupId ? { ...group, expanded: !group.expanded } : group)),
    )
  }
  
  // プロジェクトの展開/折りたたみを切り替える
  const toggleProject = (groupId: string, projectId: string) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => 
              project.id === projectId ? { ...project, expanded: !project.expanded } : project
            )
          }
        }
        return group
      })
    )
  }
  
  // プロジェクトの完了状態を切り替える
  const handleProjectStatusChange = (groupId: string, projectId: string, completed: boolean) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => {
              if (project.id === projectId) {
                const newStatus = completed ? "completed" : "in-progress";
                // プロジェクト内のすべてのタスクも同じステータスに変更
                const updatedTasks = project.tasks.map(task => ({
                  ...task,
                  completed,
                  status: newStatus
                }));
                
                return {
                  ...project,
                  completed,
                  status: newStatus,
                  tasks: updatedTasks
                };
              }
              return project;
            })
          }
        }
        return group
      })
    )
    
    toast({
      title: completed ? "プロジェクトを完了しました" : "プロジェクトを未完了に戻しました",
      description: "プロジェクト内のすべてのタスクも更新されました",
    });
  }
  
  // タスクの展開/折りたたみを切り替える
  const toggleTask = (groupId: string, projectId: string, taskId: string) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: project.tasks.map((task) =>
                    task.id === taskId ? { ...task, expanded: !task.expanded } : task
                  )
                }
              }
              return project
            })
          }
        }
        return group
      })
    )
  }
  
  // タスクのステータスを変更
  const handleTaskStatusChange = (groupId: string, projectId: string, taskId: string, completed: boolean) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: project.tasks.map((task) => {
                    if (task.id === taskId) {
                      const newStatus = completed ? "completed" : "in-progress"
                      return { 
                        ...task, 
                        completed, 
                        status: newStatus,
                        progress: completed ? 100 : calculateProgress(task)
                      }
                    }
                    return task
                  })
                }
              }
              return project
            })
          }
        }
        return group
      })
    )
  }
  
  // サブタスクのステータスを変更
  const handleSubtaskToggle = (groupId: string, projectId: string, taskId: string, subtaskId: string, completed: boolean) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: project.tasks.map((task) => {
                    if (task.id === taskId) {
                      const updatedSubtasks = task.subtasks.map((subtask) =>
                        subtask.id === subtaskId ? { ...subtask, completed } : subtask
                      )
                      
                      // サブタスクの状態に基づいてタスクの進捗を更新
                      const progress = updatedSubtasks.length > 0
                        ? Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
                        : 0
                        
                      // すべてのサブタスクが完了したらタスクも完了とする
                      const allCompleted = updatedSubtasks.every(st => st.completed)
                      
                      return { 
                        ...task, 
                        subtasks: updatedSubtasks,
                        completed: allCompleted,
                        status: allCompleted ? "completed" : progress > 0 ? "in-progress" : "todo",
                        progress
                      }
                    }
                    return task
                  })
                }
              }
              return project
            })
          }
        }
        return group
      })
    )
  }
  
  // タスクのメニューを開く
  const handleTaskMenuOpen = (taskId: string) => {
    toast({
      title: "タスクメニュー",
      description: `タスクID: ${taskId} のメニューを開きます`,
    })
  }
  
  // サブタスクを追加
  const handleAddSubtask = (groupId: string, projectId: string, taskId: string) => {
    const subtaskTitle = prompt("サブタスクのタイトルを入力してください")
    if (!subtaskTitle) return

    // 新しいサブタスクオブジェクトを作成
    const newSubtask: DashboardSubTask = {
      id: `subtask-${Date.now()}`,
      title: subtaskTitle,
      completed: false,
    }

    // タスクグループを更新
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              projects: group.projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      tasks: project.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              // タスクを展開状態にする
                              expanded: true,
                              // サブタスクを追加
                              subtasks: [...task.subtasks, newSubtask],
                              // 進捗を更新
                              progress: calculateProgress({
                                ...task,
                                subtasks: [...task.subtasks, newSubtask],
                              }),
                            }
                          : task,
                      ),
                      // プロジェクトの進捗を更新
                      status: "in-progress",
                    }
                  : project,
              ),
            }
          : group,
      ),
    )


    // ローカルストレージにも保存
    const updatedGroups = taskGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            projects: group.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    tasks: project.tasks.map((task) =>
                      task.id === taskId
                        ? {
                            ...task,
                            subtasks: [...task.subtasks, newSubtask],
                            progress: calculateProgress({
                              ...task,
                              subtasks: [...task.subtasks, newSubtask],
                            }),
                          }
                        : task,
                    ),
                  }
                : project,
            ),
          }
        : group,
    )
    saveDashboardData(updatedGroups)

    toast({
      title: "サブタスクを追加しました",
      description: `「${subtaskTitle}」を追加しました`,
    })
  }
  
  // タスクを追加
  const handleAddTask = (groupId: string, projectId: string) => {
    const taskTitle = prompt("タスクのタイトルを入力してください")
    if (taskTitle) {
      addTaskToProject(taskTitle, projectId, groupId)
      
      // 状態を更新
      const data = getDashboardData()
      setTaskGroups(data)
      
      toast({
        title: "タスク追加",
        description: `「${taskTitle}」を追加しました`,
      })
    }
  }
  
  // プロジェクトを追加
  const handleAddProject = (groupId: string) => {
    const projectTitle = prompt("プロジェクトのタイトルを入力してください")
    if (projectTitle) {
      addProjectToDashboard(projectTitle, projectTitle, groupId)
      
      // 状態を更新
      const data = getDashboardData()
      setTaskGroups(data)
      
      toast({
        title: "プロジェクト追加",
        description: `「${projectTitle}」を追加しました`,
      })
    }
  }
  
  // タスクの並び替え
  const handleTasksReorder = (groupId: string, projectId: string, reorderedTasks: Task[]) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            projects: group.projects.map((project) => {
              if (project.id === projectId) {
                // 型変換の問題を回避するため、IDのみを使用して順序を更新
                const taskIds = reorderedTasks.map(t => t.id)
                const reorderedDashboardTasks = taskIds.map(id => 
                  project.tasks.find(t => t.id === id)
                ).filter(Boolean) as DashboardTask[]
                
                return {
                  ...project,
                  tasks: reorderedDashboardTasks
                }
              }
              return project
            })
          }
        }
        return group
      })
    )
  }
  
  // ダッシュボードのタスクをコンポーネント用のタスク型に変換
  const convertToComponentTask = (dashboardTask: DashboardTask): Task => ({
    id: dashboardTask.id,
    title: dashboardTask.title,
    status: dashboardTask.status,
    time: dashboardTask.startTime ? `${dashboardTask.startTime} - ${dashboardTask.endTime || ''}` : undefined,
    tags: dashboardTask.priority ? [dashboardTask.priority] : [],
    subTasks: dashboardTask.subtasks.map(st => ({
      id: st.id,
      title: st.title,
      completed: st.completed
    })),
    progress: dashboardTask.progress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // 日付表示のフォーマット
  const formatDateDisplay = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}曜日`
  }

  // 時刻表示のフォーマット
  const formatTimeDisplay = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="flex min-h-screen">
      {/* サイドバー */}
      <Sidebar />

      <div className="flex-1">
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">ダッシュボード</h1>
              <p className="text-sm text-muted-foreground">{formatDateDisplay(currentTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">現在時刻</p>
              <p className="text-2xl font-bold">{formatTimeDisplay(currentTime)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {taskGroups.map((group) => (
              <Card key={group.id} className="mb-4">
                <CardHeader
                  className="py-3 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleTaskGroup(group.id)}
                >
                  <div className="flex items-center">
                    {group.expanded ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddProject(group.id)
                    }}
                    className="ml-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    プロジェクト追加
                  </Button>
                </CardHeader>
                
                {group.expanded && (
                  <CardContent>
                    {group.projects.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>プロジェクトがありません</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddProject(group.id)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          プロジェクトを追加
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {group.projects.map((project, index) => (
                          <Card key={`${group.id}-${project.id}-${index}`} className="overflow-hidden">
                            <CardHeader
                              className="py-2 px-4 cursor-pointer flex flex-row items-center justify-between bg-muted/50"
                              onClick={() => toggleProject(group.id, project.id)}
                            >
                              <div className="flex items-center">
                                <Checkbox 
                                  checked={project.completed} 
                                  onCheckedChange={(checked) => {
                                    handleProjectStatusChange(group.id, project.id, checked === true);
      </div>
    ) : (
      <DraggableTaskList
        tasks={project.tasks.map(convertToComponentTask)}
        onTasksReorder={(reorderedTasks) => handleTasksReorder(group.id, project.id, reorderedTasks)}
        onStatusChange={(taskId, completed) => handleTaskStatusChange(group.id, project.id, taskId, completed)}
        onMenuOpen={(taskId) => handleTaskMenuOpen(taskId)}
      >
        {project.tasks.map((task, index) => (
          <HierarchicalTaskItem
            key={task.id}
            id={task.id}
            title={task.title}
            completed={task.completed}
            level={2}
            expanded={task.expanded}
            hasChildren={task.subtasks.length > 0}
            startTime={task.startTime}
            endTime={task.endTime}
            onToggleExpand={() =>
              toggleTask(group.id, project.id, task.id)
            }
            onToggleComplete={() =>
              toggleTaskComplete(group.id, project.id, task.id)
            }
            onDelete={() =>
              handleDeleteTask(group.id, project.id, task.id)
            }
            onAddChild={() =>
              handleAddSubtask(group.id, project.id, task.id)
            }
            dragHandleProps={provided.dragHandleProps}
            onTimeChange={(startTime, endTime) =>
              handleTaskTimeChange(
                group.id,
                project.id,
                task.id,
                startTime,
                endTime,
              )
            }
          />
        ))}
      </DraggableTaskList>
    )}
  </CardContent>
)}

// ...
      <AICoachSidebar />
    </div>
  )
}
