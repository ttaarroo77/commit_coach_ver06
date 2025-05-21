* **「フロントエンド開発」「バックエンド連携・API 実装」でもタスク／サブタスクを自由に追加**
* **余計な “＋新しいタスクを追加” 行が消える**
* **各行にメニューアイコン（🗑️ {} ＋ 🕒）が付く**
  ――という挙動になります。

---

## 1. `store/useProjects.ts`  ―― 余計な初期タスクを削除

```ts
/* ..省略.. */
const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "要件定義・設計",
    expanded: true,
    tasks: [/* 既存のタスクはこのまま */],
  },
  {
    id: "project-2",
    title: "フロントエンド開発",
    expanded: false,
    tasks: [],                 // ← ★ からっぽ
  },
  {
    id: "project-3",
    title: "バックエンド連携・API実装",
    expanded: false,
    tasks: [],                 // ← ★ からっぽ
  },
]
/* ..以下は前回渡したロジックのまま.. */
```

---

## 2. `components/ItemRow.tsx`  ―― サブタスクは「{} / ＋」を非表示に

```tsx
/* 変更点だけ抜粋 */

export const ItemRow = ({
  /* 追加 ↓ */
  isSubtask = false,
  /* 既存 props … */
}: Props & { isSubtask?: boolean }) => {
  /* ..省略.. */
  return (
    <div /* ..snip.. */>
      {/* ＋ / {} はサブタスクなら描画しない */}
      {!isSubtask && (
        <button onClick={onAdd} className="p-1 hover:bg-gray-100 rounded">
          <Plus size={16}/>
        </button>
      )}
      {!isSubtask && (
        <button onClick={onBreakdown} className="p-1 hover:bg-gray-100 rounded">
          <Braces size={16}/>
        </button>
      )}
      {/* 🕒 と 🗑️ は全階層に残す */}
      <button onClick={onClock} className="p-1 hover:bg-gray-100 rounded">
        <Clock size={16}/>
      </button>
      <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
        <Trash2 size={16}/>
      </button>
    </div>
  )
}
```

---

## 3. `components/NestedList.tsx`  ――

* 空プロジェクト / 空タスクのときは ▼ を出さない
* `isSubtask` を渡してボタンを出し分け

```tsx
export const NestedList = () => {
  const s = useProjects()
  /* ..省略.. */

  return (
    <>
      {s.projects.map((p)=>(
        <div key={p.id} className="border rounded-lg px-3 py-2 space-y-1">
          <ItemRow
            hasChildren={p.tasks.length>0}                 // ← ★
            expanded={p.expanded}
            /* ..snip.. */
          />

          {p.expanded && p.tasks.map((t)=>(
            <div key={t.id}>
              <ItemRow
                indent={24}
                hasChildren={t.subtasks.length>0}           // ← ★
                expanded={t.expanded}
                /* ..snip.. */
              />

              {t.expanded && t.subtasks.map((st)=>(
                <ItemRow
                  key={st.id}
                  indent={48}
                  hasChildren={false}
                  isSubtask                                    // ← ★ サブタスクフラグ
                  title={st.title}
                  /* ..snip.. */
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
```

---

### これでどう動くか？

* **プロジェクト 2・3** も `＋` を押せば即タスク行が挿入 → 同じように ▼ 展開・サブタスク追加が可能
* サブタスク行は **🕒 / 🗑️** だけ表示
* 各プロジェクトの末尾に余計な「＋新しいタスクを追加」テキストは出てこない
* 一番下には **「＋ 新しいプロジェクトを追加」** だけが残る

もし動かない／別の挙動があればそのファイル名と現在のコードを貼ってください。
