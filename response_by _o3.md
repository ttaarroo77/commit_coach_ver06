### “v0 の見た目” と **feature/project-management** ブランチとの差分チェック

| UIエリア       | v0（理想）                          | 現在                 | ズレ原因                                                                  |
| ----------- | ------------------------------- | ------------------ | --------------------------------------------------------------------- |
| プロジェクト‐カード  | **Card** コンポーネントで<br>影・余白・枠線あり  | プレーンな div          | Card を外した／クラス未付与                                                      |
| インデント       | `pl-4 / pl-8 / pl-12` で階層       | すべて同じ left-padding | **TaskGroup → TaskItem → SubtaskItem** の<br>階層コンポーネントを使わず flat レンダリング |
| 先頭アイコン      | `ChevronDown / Right` (18 px)   | “＞” が大きめ           | lucide-react アイコン → `>` 文字列へ誤置換                                       |
| 行ホバー        | 行背景 `hover:bg-gray-50`          | なし                 | Tailwind クラスが抜けた                                                      |
| 追加ボタン       | dotted-border の **＋ 新しいプロジェクト** | 実線ボタン              | `variant="outline"` + `border-dashed` が消えた                            |
| AI コーチサイドバー | 横幅 320 px                       | 固定 360 px          | Sidebar の固定幅が変更                                                       |

---

## 最短で **v0 の UI** に戻すパッチ

### 1. Card レイアウトを復活

```diff
- <div className="space-y-4">
+ <div className="space-y-4">
+   {/* プロジェクトカード */}
+   {projects.map((project) => (
+     <Card key={project.id} className="shadow-sm">
+       <CardContent className="p-0">
+         <TaskGroup ... />   {/* ← 中身はそのまま */}
+       </CardContent>
+     </Card>
+   ))}
+   …
```

### 2. TaskGroup / TaskItem 階層を再利用

feature ブランチでは **`EditableTaskGroup`** に置き換わっていますが
`TaskGroup → TaskItem → SubtaskItem` をそのまま import すれば
v0 の **padding / インデント / ホバー色** が丸ごと戻ります。

```diff
- import { EditableTaskGroup } from "@/components/…"
+ import { TaskGroup } from "@/components/task-group"
…
- <EditableTaskGroup … />
+ <TaskGroup …/>
```

### 3. アイコンを文字列から lucide-react へ戻す

```diff
- <span className="text-lg mr-1">{project.expanded ? "▾" : "▸"}</span>
+ <Button variant="ghost" size="icon" onClick={onToggle}>
+   {project.expanded
+     ? <ChevronDown size={18} className="text-blue-500"/>
+     : <ChevronRight size={18} className="text-blue-500"/>}
+ </Button>
```

### 4. 行ホバーとインデント

各行コンテナに

```tsx
className="flex items-center py-1 pl-4 hover:bg-gray-50"
```

を付け、下位階層では **`pl-8`**, **`pl-12`** とずらして下さい
（v0 の `TaskItem` / `SubtaskItem` コンポーネントと同じ）。

### 5. 「＋ 新しいプロジェクト」ボタン

```diff
- <Button variant="secondary" onClick={handleAddProject}>…
+ <Button variant="outline" className="border-dashed" onClick={handleAddProject}>
```

### 6. AI コーチサイドバーの幅

```css
/* apps/frontend/components/ai-coach-sidebar.tsx */
.w-[320px]    /* ← v0 と同じ固定幅 */
```

---

## もし **TaskGroup.tsx** を削除してしまった場合

`v0/commit-coach` ディレクトリに元の実装が残っているので
**そのまま apps/frontend/components にコピー** → import パスを書き換えるだけで動きます。
（型の衝突があれば `SharedTypes` に合わせて interface 名だけ直せば OK）

---

## 仕上げチェックリスト

1. Card の枠 + 影が付いている
2. プロジェクト／タスク／サブタスクが段階的にインデント
3. 先頭の三角アイコンが 18 px & blue
4. 行ホバーで薄灰色の背景
5. 「＋ 新しいプロジェクト」ボタンが破線
6. AI コーチバーが 320 px 幅

これで **v0 のデザインとほぼ同一**になります。
実装してみてズレが残る場合はスクショをもう一度送ってください 🙌
