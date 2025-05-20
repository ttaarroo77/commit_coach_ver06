# まだ行がビョーンと伸びる場合の “根本治療” パッチ
（実際の崩れは **アイコン 44 px × ボタン 40 px 固定** が残っているのが原因でした）

---

## 🔍 症状
- 1 行目は OK だが、ドラッグ＆ドロップした行だけ高さ 100 px 以上
- チェックボックスや「▶︎」「＋」「🗑」が **やたら巨大**

## 💡 原因
`className="h-10 w-10 [&>svg]:h-[66px] [&>svg]:w-[66px]"` がまだ生きている。
DnD で `<Transform>` が入り「アイコン > 行高」→ 親の `flex` が高さを広げる。

---

## 🛠️ 最小修正 2 ステップ

### **① 固定サイズを一掃**
行コンテナから `overflow-hidden` を外したうえで **アイコンは 18 px／ボタンは `auto`** に統一。

```diff
// apps/frontend/components/dashboard/HierarchicalTaskItem.tsx
- import { Plus, Trash2, ChevronDown, ChevronRight, Clock,
-          Pen, Check, X } from "lucide-react"
+ import { Plus, Trash2, ChevronDown, ChevronRight, Clock,
+          Pen, Check, X } from "lucide-react"

- const iconBtn = "h-10 w-10 p-1 ... [&>svg]:h-[66px] [&>svg]:w-[66px]"
+ const iconBtn =
+   "p-1.5 w-auto h-auto rounded-md \
+    opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto \
+    transition-opacity duration-150"

 const ICON = 18   // ここで一括制御

 <Button className={iconBtn + " text-green-600 hover:bg-green-100/70"} ...>
-   <Plus size={44} strokeWidth={2.25}/>
+   <Plus size={ICON}/>
 </Button>
 // ↓ Pen / Trash / Check / X も全部 size={ICON}
````

> **point**: `w-auto h-auto` にすれば SVG の縦横が行高を決めることはなくなる。

---

### **② DnD ラッパーで高さを固定**

行本体がまだ跳ねる場合は **ドラッグ用コンテナ**に高さを与える。

```tsx
// apps/frontend/components/dashboard/SortableRow.tsx
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"

export const SortableRow = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "48px",          // ✅ 行高を固定（px or rem で）
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
         className={cn(isDragging && "opacity-70")}>
      {children}
    </div>
  )
}
```

* `height: 48px`（= py-2 + アイコン 18px + 行間）に揃える
* ボタンやテキストが大きくても **行コンテナが伸びない**

---

## 🧹 **消し忘れチェックリスト**

検索して **全部削除／置換** してください ⬇︎

```
h-10 w-10             // 固定 40px ボタン
[&>svg]:h-\[66px\]    // 66px アイコン
[&>svg]:w-\[66px\]
size="sm" && 44       // size="sm" なのに SVG 44px
```

---

## ✅ 動作確認

1. **通常表示** : 行高 ≒ 48 px、アイコンは 18 px、ホバーでフェードイン
2. **ドラッグ中** : 行がスライドしても高さは固定のまま
3. **ドロップ後** : 行高そのまま、崩れ無し
4. **リサイズ** : 高 DPI でもアイコン比率変わらず

---

これで “行が膨張する／アイコンが巨大化する” 問題は完全に消えるはずです。
もしまだおかしい場合は **ブラウザのキャッシュをクリア or `tailwind build` し直し** をお試しください 🙌

```
```
