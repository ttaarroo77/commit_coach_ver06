# feat: プロジェクトページを追加する

## 概要
- `/projects` で **プロジェクト一覧ページ** を表示
- `/projects/[id]` で **個別プロジェクト詳細** を表示
- サイドバーに **「プロジェクト一覧」** へのナビゲーションを追加
- 既存の **Dashboard 機能** とデザイン(Shadcn + Tailwind)の一貫性を保つ
- v0 で試作した React コンポーネントを Next.js /app ディレクトリ構成に落とし込む

---

## 変更ファイル

| 種別 | 追加 / 変更 | パス |
|------|-------------|------|
| **page** | ➕ | `apps/frontend/app/projects/page.tsx` |
| **page** | ➕ | `apps/frontend/app/projects/[id]/page.tsx` |
| **template** | ➕ | `apps/frontend/app/projects/project-template.tsx` |
| **sidebar** | ✏️ | `apps/frontend/components/sidebar.tsx` |
| **type & utils** | ➕ | `apps/frontend/lib/project-utils.ts` |
| **doc** | ➕ | `docs/specs/projects-page.md` ← ★このファイル |

---

## 実装ステップ

### 1. ルーティング

```txt
apps/frontend/app
└─ projects
   ├─ page.tsx          # 一覧
   ├─ [id]
   │  └─ page.tsx       # 詳細
   └─ project-template.tsx  # 詳細用コンポーネント
````

### 2. コンポーネント / ロジック

1. **TaskGroup・EditableText・DatePicker** などは既存 Dashboard で利用中のものを再利用。
   必要に応じて `apps/frontend/components/` へ移動し **共通化**。
2. **Mock データ** でローカル状態を管理する実装を行い、後日 Supabase に差し替えやすい構成にする。

   * `getProjectData()` は一旦 `lib/project-utils.ts` でモックを返す。
3. **Drag & Drop** は `react-beautiful-dnd` を利用（既に package.json に含まれている）。

   * グループ／タスク単位の `Draggable` / `Droppable` 実装を v0 コードから移植。

### 3. サイドバーの更新

```diff
// apps/frontend/components/sidebar.tsx
- { pathname === "/dashboard" && ... }
+ <NavItem href="/dashboard" icon={Home}>ダッシュボード</NavItem>
+ <NavItem href="/projects"  icon={Folder}>プロジェクト一覧</NavItem>
```

### 4. スタイル指針

| 要素    | Tailwind クラス例                 | 備考                                                 |
| ----- | ----------------------------- | -------------------------------------------------- |
| ボタン   | `variant="ghost" size="icon"` | アイコンのみボタン。`[&>svg]:h-4 [&>svg]:w-4` が base にある点に注意 |
| カード   | `rounded-md border bg-white`  | TaskGroup / Task コンテナ                              |
| ドラッグ時 | `shadow-lg bg-gray-50`        | `snapshot.isDragging` 判定                           |

### 5. コードスニペット（抜粋）

> **`app/projects/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TaskGroup } from "@/components/task-group";
import { AICoachSidebar } from "@/components/ai-coach-sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState(/* ← mockProjects を貼付 */);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 overflow-auto">
        <div className="w-full max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6"># プロジェクト一覧</h1>

          {projects.map((p) => (
            <TaskGroup
              key={p.id}
              {...p}
              onAddTask={() => /* 省略 */}
              /* 省略 */
            />
          ))}

          <div className="flex justify-center mt-6">
            <Button variant="outline" className="border-dashed" onClick={/* 省略 */}>
              <Plus className="mr-2 h-4 w-4" />
              新しいプロジェクトを追加
            </Button>
          </div>
        </div>
      </main>
      <AICoachSidebar />
    </div>
  );
}
```

> **`app/projects/[id]/page.tsx`**

```tsx
"use client";

import { useParams } from "next/navigation";
import { getProjectData } from "@/lib/project-utils";
import ProjectTemplate from "../project-template";

export default async function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const data = await getProjectData(id); // ← まずはモック

  return <ProjectTemplate {...data} />;
}
```

### 6. 型定義（`lib/project-utils.ts`）

```ts
export interface ProjectData {
  projectTitle: string;
  taskGroups: TaskGroup[];
  dueDate?: string;
}

/* mock 実装 */
export async function getProjectData(id: string): Promise<ProjectData> {
  await new Promise((r) => setTimeout(r, 200)); // simulate fetch
  return mockProjects.find((p) => p.id === id)!;
}
```

---

## 動作確認

1. `pnpm dev` 起動
2. `http://localhost:3000/projects` で一覧が描画されること
3. TaskGroup / Task / Subtask の **追加・削除・展開・ドラッグ** が正常動作
4. `/projects/<project-id>` に直接アクセスしても詳細が表示されること
5. サイドバーから Dashboard ↔ Projects を遷移し状態が保持されること

---

## 今後の拡張 TODO

* Supabase テーブル設計 `projects / task_groups / tasks / subtasks` で永続化
* AI コーチング機能との連携（分解 / 優先順位付け）
* ガントチャート／カレンダー表示へのスケジュール反映

---

### Reviewer メモ

* Shadcn の `Button` には **`[&_svg]:size-4`** がデフォルトで効くので、
  アイコンサイズを可変にしたい場合は `size="iconLg"` を追加するか、
  `className="[&>svg]:h-5 [&>svg]:w-5"` で上書きしてください。
