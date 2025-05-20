import { NextRequest, NextResponse } from "next/server";
import { getDashboardData, saveDashboardData, TaskGroup } from "@/lib/dashboard-utils";

export async function PATCH(req: NextRequest) {
  try {
    const { ids, order, path } = await req.json();
    
    // path パラメータがない場合はエラー
    if (!ids || !order || ids.length !== order.length) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    // ダッシュボードデータを取得
    const dashboardData = getDashboardData();
    
    // クエリパラメータから操作対象を特定
    const pathSegments = req.nextUrl.pathname.split('/');
    const resourceType = pathSegments[pathSegments.length - 1]; // 最後のセグメントを取得
    
    let updatedData: TaskGroup[] = [];
    
    if (resourceType === 'projects') {
      // プロジェクトの並び替え
      updatedData = reorderProjects(dashboardData, ids, order);
    } else if (resourceType === 'tasks') {
      // タスクの並び替え
      const projectId = req.nextUrl.searchParams.get('projectId');
      const groupId = req.nextUrl.searchParams.get('groupId');
      
      if (!projectId || !groupId) {
        return NextResponse.json(
          { error: "Missing projectId or groupId" },
          { status: 400 }
        );
      }
      
      updatedData = reorderTasks(dashboardData, groupId, projectId, ids, order);
    } else if (resourceType === 'subtasks') {
      // サブタスクの並び替え
      const taskId = req.nextUrl.searchParams.get('taskId');
      const projectId = req.nextUrl.searchParams.get('projectId');
      const groupId = req.nextUrl.searchParams.get('groupId');
      
      if (!taskId || !projectId || !groupId) {
        return NextResponse.json(
          { error: "Missing taskId, projectId or groupId" },
          { status: 400 }
        );
      }
      
      updatedData = reorderSubtasks(dashboardData, groupId, projectId, taskId, ids, order);
    } else {
      return NextResponse.json(
        { error: "Invalid resource type" },
        { status: 400 }
      );
    }
    
    // 更新データを保存
    saveDashboardData(updatedData);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Reorder API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// プロジェクトの並び替え処理
function reorderProjects(data: TaskGroup[], ids: string[], order: number[]): TaskGroup[] {
  return data.map((group) => {
    const updatedProjects = group.projects.map((project) => {
      const index = ids.indexOf(project.id);
      if (index !== -1) {
        return {
          ...project,
          sort_order: order[index]
        };
      }
      return project;
    }).sort((a, b) => a.sort_order - b.sort_order);
    
    return {
      ...group,
      projects: updatedProjects
    };
  });
}

// タスクの並び替え処理
function reorderTasks(data: TaskGroup[], groupId: string, projectId: string, ids: string[], order: number[]): TaskGroup[] {
  return data.map((group) => {
    if (group.id !== groupId) return group;
    
    const updatedProjects = group.projects.map((project) => {
      if (project.id !== projectId) return project;
      
      const updatedTasks = project.tasks.map((task) => {
        const index = ids.indexOf(task.id);
        if (index !== -1) {
          return {
            ...task,
            sort_order: order[index]
          };
        }
        return task;
      }).sort((a, b) => a.sort_order - b.sort_order);
      
      return {
        ...project,
        tasks: updatedTasks
      };
    });
    
    return {
      ...group,
      projects: updatedProjects
    };
  });
}

// サブタスクの並び替え処理
function reorderSubtasks(data: TaskGroup[], groupId: string, projectId: string, taskId: string, ids: string[], order: number[]): TaskGroup[] {
  return data.map((group) => {
    if (group.id !== groupId) return group;
    
    const updatedProjects = group.projects.map((project) => {
      if (project.id !== projectId) return project;
      
      const updatedTasks = project.tasks.map((task) => {
        if (task.id !== taskId) return task;
        
        const updatedSubtasks = task.subtasks.map((subtask) => {
          const index = ids.indexOf(subtask.id);
          if (index !== -1) {
            return {
              ...subtask,
              sort_order: order[index]
            };
          }
          return subtask;
        }).sort((a, b) => a.sort_order - b.sort_order);
        
        return {
          ...task,
          subtasks: updatedSubtasks
        };
      });
      
      return {
        ...project,
        tasks: updatedTasks
      };
    });
    
    return {
      ...group,
      projects: updatedProjects
    };
  });
}
