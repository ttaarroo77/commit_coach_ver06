# Patch : ペン✏️ボタンで **タイトルをインライン編集** する
（`apps/frontend/components/dashboard/HierarchicalTaskItem.tsx` 用。
そのまま windsurf に貼って OK です）

---

## 🗺 実装概要

| ボタン          | 役割                           | UI 表示条件 |
| --------------- | ------------------------------ | ----------- |
| ✅ **Checkbox** | `Done / yet-Done` 切替         | 常時        |
| ✏️ **ペン**     | 「編集モード」に入るトグル     | **編集前**  |
| 💾 **チェック** | 編集内容を保存 & モード終了     | **編集中**  |
| ❌ **バツ**     | 編集キャンセル & ロールバック   | **編集中**  |
| 🗑 **ゴミ箱**   | タスク削除                     | 常時        |

---

## 🔑 変更ポイント

### 1. 依存アイコンを追加インポート

```diff
- import { Plus, Trash2, ChevronDown, ChevronRight, Clock } from "lucide-react"
+ import { Plus, Trash2, ChevronDown, ChevronRight, Clock,
+          Pen, Check, X } from "lucide-react"   // ★追加
````

### 2. `onTitleChange` を Props に追加

```diff
   startTime?: string
   endTime?: string
+  onTitleChange?: (newTitle: string) => void   // ★追加
```

### 3. **編集用ステート** を用意

```ts
const [editing, setEditing]   = useState(false)
const [draft, setDraft]       = useState(title)
```

### 4. 編集モード切替／保存ロジック

```ts
const beginEdit  = (e: React.MouseEvent) => { e.stopPropagation(); setDraft(title); setEditing(true) }
const cancelEdit = () => setEditing(false)
const commitEdit = () => {
  const v = draft.trim()
  if (v && v !== title) onTitleChange?.(v)
  setEditing(false)
}
```

### 5. JSX : **タイトル領域とボタン列** を差し替え

```diff
- {/* タイトル */}
- <label …>{title}</label>
+ {/* タイトル or 入力フォーム */}
+ <div className="flex-1 truncate">
+   {editing ? (
+     <input
+       value={draft}
+       onChange={e => setDraft(e.target.value)}
+       onKeyDown={e => {
+         if (e.key === "Enter") commitEdit()
+         if (e.key === "Escape") cancelEdit()
+       }}
+       onBlur={commitEdit}
+       className="border rounded px-1 w-full text-sm"
+       autoFocus
+     />
+   ) : (
+     <span
+       className={completed ? "line-through text-gray-400" : "text-gray-800"}
+     >
+       {title}
+     </span>
+   )}
+ </div>
```

### 6. **操作ボタン群**（ゴミ箱左に配置）

```diff
   {/* 削除 */}
   {onDelete && (
     …
   )}

+ {/* 編集 or 保存／キャンセル */}
+ {editing ? (
+   <>
+     <Button
+       variant="ghost" size="sm"
+       className="h-10 w-10 p-1 text-green-600 hover:bg-green-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+       onClick={commitEdit} aria-label="save"
+     >
+       <Check size={44} strokeWidth={2.25}/>
+     </Button>
+     <Button
+       variant="ghost" size="sm"
+       className="h-10 w-10 p-1 text-gray-500 hover:bg-gray-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+       onClick={cancelEdit} aria-label="cancel"
+     >
+       <X size={44} strokeWidth={2.25}/>
+     </Button>
+   </>
+ ) : (
+   <Button
+     variant="ghost" size="sm"
+     className="h-10 w-10 mr-2 p-1 text-blue-600 hover:bg-blue-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+     onClick={beginEdit} aria-label="edit"
+   >
+     <Pen size={44} strokeWidth={2.25}/>
+   </Button>
+ )}
```

> ※ `Pen` アイコンは `lucide-react` で提供 💡 ([Lucide][1])

---

## ✅ 動作確認

1. ペンをクリック → 入力フォーム表示 & チェック/バツボタンに変化
2. 入力

   * **Enter / 緑チェック** : 保存して表示モードへ戻る
   * **Esc / 灰バツ** : 破棄して戻る
   * **Blur** : 自動保存
3. 編集中にチェックボックスや DnD ハンドルを触ってもタイトルは更新されない
4. `onTitleChange` でステート/API が更新される

---

### もし **`onTitleChange` が上位でまだ未実装** の場合…

`EditableHierarchicalTaskItem` などと同様のロジックで

```ts
ctx.handleTaskTitleChange(groupId, projectId, taskId, newTitle)
```

を呼び出すだけで OK です。

---

以上で「ペンボタン → タイトル編集」版が組み込めます。
お試しください！ 🙌

```
::contentReference[oaicite:1]{index=1}
```

[1]: https://lucide.dev/icons/pen?utm_source=chatgpt.com "pen - Lucide"
