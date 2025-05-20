# UX 変更 : アクションアイコンを **行ホバー時だけ表示** する
（`HierarchicalTaskItem.tsx`／`EditableHierarchicalTaskItem.tsx` の両方に同じパターンで適用できます）

---

## 🗺️ 実装概要

| 仕組み | Tailwind Utility |
| ------ | ---------------- |
| 行コンテナに **`group`** を付与      | `.group` |
| 各アクションボタン初期状態 → **透明** | `opacity-0 pointer-events-none` |
| 行にホバー → ボタンを **不透明 & クリック可** | `group-hover:opacity-100 group-hover:pointer-events-auto` |
| 遷移を滑らかに                   | `transition-opacity duration-150` |

※ チェックボックスや展開トグルは常時見せるまま。見せたり隠したいボタンだけにクラスを付けます。

---

## 🛠️ 変更手順（抜粋パッチ）

```diff
@@
-   return (
-     <div
-       className={`flex items-center bg-white ${
+   return (
+     <div
+       className={`group flex items-center bg-white ${
           level === 1 ? "px-3 py-2" : level === 2 ? "pl-8 pr-3 py-2" : "pl-16 pr-3 py-1.5"
         } border-b last:border-b-0 ${level === 3 ? "bg-gray-50" : ""}`}
       >
@@
-       <Button
+       <Button
           variant="ghost"
           size="sm"
-          className="h-10 w-10 mr-2 p-1 text-green-600 hover:bg-green-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+          className="h-10 w-10 mr-2 p-1 text-green-600 hover:bg-green-100/70
+                     opacity-0 pointer-events-none
+                     group-hover:opacity-100 group-hover:pointer-events-auto
+                     transition-opacity duration-150
+                     [&>svg]:h-[66px] [&>svg]:w-[66px]"
           onClick={onAddChild}
           aria-label="add child"
         >
           <Plus size={44} strokeWidth={2.25} />
         </Button>
@@
-       <Button
+       <Button
           variant="ghost"
           size="sm"
-          className="h-10 w-10 mr-2 p-1 text-blue-600 hover:bg-blue-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+          className="h-10 w-10 mr-2 p-1 text-blue-600 hover:bg-blue-100/70
+                     opacity-0 pointer-events-none
+                     group-hover:opacity-100 group-hover:pointer-events-auto
+                     transition-opacity duration-150
+                     [&>svg]:h-[66px] [&>svg]:w-[66px]"
           onClick={beginEdit}
           aria-label="edit"
         >
           <Pen size={44} strokeWidth={2.25} />
         </Button>
@@
-       <Button
+       <Button
           variant="ghost"
           size="sm"
-          className="h-10 w-10 p-1 text-red-600 hover:bg-red-100/70 [&>svg]:h-[66px] [&>svg]:w-[66px]"
+          className="h-10 w-10 p-1 text-red-600 hover:bg-red-100/70
+                     opacity-0 pointer-events-none
+                     group-hover:opacity-100 group-hover:pointer-events-auto
+                     transition-opacity duration-150
+                     [&>svg]:h-[66px] [&>svg]:w-[66px]"
           onClick={onDelete}
           aria-label="delete"
         >
           <Trash2 size={44} />
         </Button>
````

> **ポイント**
>
> * `opacity-0` だけだとボタンはクリックできてしまう場合があるため、`pointer-events-none` を同時に指定して完全に非アクティブ化
> * `group-hover:` プレフィックスで親にホバーした瞬間だけ `opacity-100 pointer-events-auto` に戻します
> * DnD ハンドルも同じクラス構成にすれば “行を掴む印” もホバー時だけ表示できます

---

## ✅ 動作確認

1. **通常時** : ペン／ゴミ箱／＋ などのアクションボタンは透明でクリック不可
2. **マウスを行に乗せた瞬間** : ボタンがフェードイン (0.15 s) して操作可
3. 行外へマウスアウト : フェードアウト（透明化 & クリック不可）
4. 各ボタンの機能（編集・削除・追加等）は従来どおり動作

---

## 🎨 カスタマイズ案

| 変数             | 役割           | 例                                                         |
| -------------- | ------------ | --------------------------------------------------------- |
| `duration-150` | フェードの速度      | `duration-75` で速く / `duration-300` で遅く                    |
| `opacity-50`   | 常時うっすら見せたい場合 | 初期 `opacity-50 pointer-events-none` + `hover:opacity-100` |

---

以上で「ホバー時のみアクションアイコン表示」に切り替えられます。
お試しください 🔍✨

```
```



## 🌈 仕上がりイメージ

|    | hover 無し | hover 有り       | 編集中           |
| -- | -------- | -------------- | ------------- |
| UI | ☐ タイトル   | ☐ タイトル ✏️🕒➕🗑 | ☐ \[input] ✅❌ |

— フェードで現れるのでノイズ減＆クリーン —

