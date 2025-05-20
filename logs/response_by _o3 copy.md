### “`size={66}` にしても大きくならない”本当の理由

\*\*`<Button>` のベースクラスにある
`[&_svg]:size-4` が **常に子 SVG を `w-4 h-4`（16 px）に上書き** しているからです。([raw.githubusercontent.com][1])
属性で `width/height="66"` を渡しても CSS が勝つため、見た目は 16 px のままになります。

---

## ✏️ 対策 ① ― 個別コンポーネントで簡単に直す

ボタン側のユーティリティに **SVG のサイズを上書きする Tailwind クラス** を追加します。

```tsx
<Button
  variant="ghost"
  size="icon"
  /* ← これを足す       ↓ボタン自体も広げておく */
  className="h-16 w-16 p-1 mr-2 text-blue-600 hover:bg-blue-100/70
             [&>svg]:h-[66px] [&>svg]:w-[66px]"
  onClick={onToggleExpand}
>
  {expanded ? <ChevronDown /> : <ChevronRight />}
</Button>
```

* `h-16 w-16`（= 64 px）の大きいクリック領域
* `[&>svg]:h-[66px]` でデフォルトの `size-4` を完全に打ち消す
* 他のアイコン（Plus / Trash2）も同じ要領で `className` に ` [&>svg]:h-[66px] [&>svg]:w-[66px]` を追加するだけで OK

---

## ✏️ 対策 ② ― **Button コンポーネント自体** に “icon-lg” サイズを増やす

**apps/frontend/components/ui/button.tsx**

```diff
 export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
   variant?: "default" | "ghost" | "outline"
-  size?: "sm" | "md"
+  size?: "sm" | "md" | "icon" | "iconLg"   // ★追加
 }
 ...
 // --- ここは cva() を使っている場合 ---
 size: {
   sm:   "h-9 rounded-md px-3",
   md:   "h-10 px-4 py-2",
   icon: "h-10 w-10 [&_svg]:size-5",       // 既存
+  iconLg: "h-16 w-16 [&_svg]:size-[66px]", // ★追加
 },
 // ------------------------------------
```

> **型を忘れず更新** 👉 `size?: "sm" | "md" | "icon" | "iconLg"`

使い方:

```tsx
<Button variant="ghost" size="iconLg" className="text-green-600 hover:bg-green-100/70">
  <Plus />
</Button>
```

これで **全画面で一貫して 66 px アイコン** が使えます。

---

## ✏️ 対策 ③ ― “\[&\_svg]\:size-4” をそもそも外す

* Button のベースクラスから `[&_svg]:size-4` を削除
* 代わりに **各アイコンに `className="w-5 h-5"`** などを付ける
* すると `size={}` がそのまま効くようになります

プロジェクト全体で **「ボタン内アイコンは 16 px 固定」** という前提が不要なら、この方法が最もシンプルです。

---

### まとめ

| 方法          | 修正対象         | 手軽さ | メリット        |
| ----------- | ------------ | --- | ----------- |
| ① クラス追加     | 該当ボタンのみ      | ◎   | すぐ試せる       |
| ② size 追加   | `button.tsx` | ○   | 再利用・型安全     |
| ③ size-4 削除 | `button.tsx` | △   | アイコンサイズを自由化 |

まずは **① を適用して動くことを確認 → ②/③ でリファクタ** がオススメです。

[1]: https://raw.githubusercontent.com/ttaarroo77/commit_coach_ver03/unsafe-refactoring-plan-implementation/apps/frontend/components/ui/button.tsx "raw.githubusercontent.com"
