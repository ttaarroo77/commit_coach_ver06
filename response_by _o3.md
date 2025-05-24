# commit_coach_ver04 — **最小差分リファクタ手順書**

> **目的**
> 1. **UI は一切変えず** に「status 属性一本化」を適用
> 2. **Dashboard / Projects** 2 ページ運用を完成させる
> 3. _余力があれば_ **localStorage → Supabase** へ載せ替え
> 4. D&D が重い場合は **チェックボックス＋プルダウン** に簡略化
>
> _※ アプリの本質は「Dashboard ↔ Projects AI分解」と「AI コーチ連携」なので、他機能は削ぎ落として OK。_

---

## 3. 作業手順（コピペでいけるレベル）

### 3-1. 型定義に `status` を追加
<details><summary>`/apps/frontend/lib/dashboard-utils.ts`</summary>

```ts
// ★ 追加 or 変更行だけ抜粋
export type Task = {
  id: string
  title: string
  status: 'today' | 'unscheduled' | 'done'        // ← NEW
  projectId: string | null
  parentId?: string
  sortIndex: number
}
````

</details>

---

### 3-2. 旧データを一括変換（1 回だけ実行）

```bash
# scripts/migrate-to-status.js
node scripts/migrate-to-status.js
```

```js
// scripts/migrate-to-status.js
import fs from 'fs'
import { todayTasks, unscheduledTasks } from './old-data.json'

const tasks = [
  ...todayTasks.map((t) => ({ ...t, status: 'today' })),
  ...unscheduledTasks.map((t) => ({ ...t, status: 'unscheduled' }))
]

fs.writeFileSync(
  './data/tasks.json',
  JSON.stringify(tasks, null, 2),
  'utf-8'
)
console.log('✅  migrated old tasks → tasks.json')
```

---

### 3-3. Hook を書き換え

<details><summary>`/apps/frontend/app/dashboard/_hooks/use-dashboard.ts`</summary>

```ts
// ① グループ抽出をフィルタに変更
export const useDashboard = () => {
  const tasks = useTaskStore((s) => s.tasks)

  const todayTasks = tasks.filter((t) => t.status === 'today')
  const backlog    = tasks.filter((t) => t.status === 'unscheduled')

// ② 移動ロジックを PATCH に統一
  const moveTask = (id: string, newStatus: Task['status'], newIdx: number) => {
    updateTask(id, { status: newStatus, sortIndex: newIdx })
  }
}
```

</details>

---

### 3-4. UI ラベルだけ動的に

<details><summary>`DashboardNestedList.tsx`（抜粋）</summary>

```tsx
const STATUS_LABEL: Record<Task['status'], string> = {
  today: '今日のタスク',
  unscheduled: '未定のタスク',
  done: '完了'
}

export function DashboardNestedList({ status }: { status: Task['status'] }) {
  const tasks = useTasksByStatus(status)
  return (
    <Card>
      <CardHeader>
        <h3>{`### ${STATUS_LABEL[status]}`}</h3>
      </CardHeader>
      {/* …既存のリスト描画を流用… */}
    </Card>
  )
}
```

</details>

---

### 3-5. `/projects` ページをプロジェクトフィルタに

```tsx
// app/projects/page.tsx (想定)
const ProjectPage = () => {
  const { projectId } = useParams()  // /projects/:projectId
  const tasks = useTasks().filter(t => t.projectId === projectId)

  return (
    <TaskList title="プロジェクト内タスク" tasks={tasks} />
  )
}
```

---

## 4. 「今の UI で粘る」場合の注意点

| 項目             | リスク           | 最小コスト回避策                                         |
| -------------- | ------------- | ------------------------------------------------ |
| **親子タスクのドラッグ** | サブタスクが孤立する    | `draggable={subtasks.length===0}` にする or 親ごとパッチ  |
| **列追加を後で頼まれる** | UI が 2 列前提で崩壊 | `const STATUS = [...]` 配列で一元管理し map で描画          |
| **スマホ幅**       | 右の AI コーチが潰れる | `@media (max-width:768px){.coach{display:none}}` |
| **大量タスクで重い**   | 初期ロード遅延       | `useMemo` + `virtualized list` を後付け可能            |
| **D\&D がむずい**  | 実装に時間         | 初期 MVP は「↑↓ボタン」+「ステータス切替プルダウン」だけ                 |

---

## 5. これでも「無理そう」と感じたら…

### 5-1. **localStorage → Supabase** へ移行

1. **Supabase プロジェクト作成**

   * `Table: tasks` を GUI で作成（列名は型定義どおり）。
2. **環境変数**

   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **SDK インストール**

   ```bash
   pnpm add @supabase/supabase-js
   ```
4. **ユーティリティ作成**

   ```ts
   // lib/supa.ts
   export const supa = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```
5. **読み書きを差し替え**

   * `useTaskStore` の `fetchTasks` → `supa.from('tasks').select('*')`
   * `updateTask` → `.update({...}).eq('id',id)`
6. **既存 JSON を一括 import**

   ```bash
   supabase import json --table tasks data/tasks.json --upsert
   ```

### 5-2. **D\&D を削除 → プルダウン簡略版**

1. **`@dnd-kit` をコメントアウト**

   * `<DndContext>` ラッパーを削除。
2. **UI 変更**

   ```tsx
   <select
     value={task.status}
     onChange={(e)=>updateTask(task.id,{status:e.target.value as Task['status']})}
   >
     <option value="today">今日</option>
     <option value="unscheduled">未定</option>
     <option value="done">完了</option>
   </select>
   ```
3. **並べ替え**

   * 「↑↓ボタン」のみ残す or `sortIndex` を自動で `Date.now()` に。
4. **あとで Drag & Drop を戻す**

   * `git checkout -p` で `@dnd-kit` 関連コミットを再適用すれば OK。

---

## 6. AI コーチ連携の最小実装

```ts
// /app/coach/_actions/sendMessage.ts
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function sendToCoach(history: string) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role:'user', content: history }]
  })
  return res.choices[0].message.content
}
```

* **.env.local** に `OPENAI_API_KEY=` をセット
* フロントから `fetch('/api/coach', {method:'POST', body:history})`

---

### 🎯 ゴールチェックリスト

* [ ] `npm run dev` で旧 UI のまま動く
* [ ] today ↔ 未定 の切替が PATCH 1 発で動く
* [ ] プロジェクトページで projectId フィルタが効く
* [ ] （オプション）Supabase に同期しても同じ UI で動く
* [ ] AI コーチ欄に返信が出た

完成したら **GitHub に “minimal-migration” ブランチ** としてプッシュし、
試用 → 問題なければ `main` にマージするだけでリリースできます 🚀

```

> 上記を **そのまま windsurf に貼り付け** れば、チーム全員が手順を共有できます。
```
