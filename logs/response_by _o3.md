# o3 からのコメント

# Dashboard Refactor Guide
> Target file: `apps/frontend/app/dashboard/page.tsx`
> Goal: Run as a single-file client component, with logic extracted to `lib/dashboard-utils.ts` and existing UI components reused.

## 1. Pre-flight checks
| Item | Action |
|------|--------|
| **Node modules** | `pnpm i` to ensure all deps are present |
| **Path aliases** | Confirm `@/components/*` and `@/lib/*` are mapped in `tsconfig.base.json` |
| **Old code** | Delete `apps/frontend/app/dashboard_backup` (`git rm -r` recommended) |

## 2. Minimum stubs to unblock TypeScript
Create **empty but typed** placeholders if they do not exist yet:


// apps/frontend/lib/dashboard-utils.ts
export type SubTask = { id: string; title: string; completed: boolean }
export type Task = { ... }                 // replicate the shape used in page.tsx
export type Project = { ... }
export type TaskGroup = { ... }

export const getDashboardData  = (): TaskGroup[] => JSON.parse(localStorage.getItem("dashboard") ?? "[]")
export const saveDashboardData = (d: TaskGroup[]) => localStorage.setItem("dashboard", JSON.stringify(d))
export const addProjectToDashboard = (id:string,title:string,groupId:string)=>{/* TODO */}
export const addTaskToProject      = (title:string,projectId:string,groupId:string)=>{/* TODO */}
export const addSubtaskToTask      = (title:string,taskId:string,projectId:string,groupId:string)=>{/* TODO */}
export const calculateProgress     = (subs:SubTask[]) => Math.round((subs.filter(s=>s.completed).length/subs.length)*100)||0



## 3. Compile-time sanity
pnpm dev -F frontend

Fix any import not found errors; they point to missing UI components.

If you see React-18 strict-mode double-invoke issues with react-beautiful-dnd, consider switching to @hello-pangea/dnd.

## 4. Functional checkpoints
Load / Save — verify that adding a project persists after reload (checks get/saveDashboardData).

Drag-and-drop — confirm all 4 levels (taskGroup,project,task,subtask) reorder correctly.

Completion cascade — ticking a task should propagate status & progress up to its project.

Time fields — editing start/end times should update state without unmounting components.

## 5. Clean-up & CI
Remove any inline TODO comments once implemented.

Run pnpm lint && pnpm format.

Ensure GitHub Actions passes on PR: apps/frontend build + Playwright smoke test (if present).

## 6. Next steps (optional)
Migrate storage from localStorage to Supabase.

Replace react-beautiful-dnd (maintenance-mode) with dnd-kit for better RTL support.
