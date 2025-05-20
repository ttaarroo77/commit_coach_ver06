````markdown
# ✅ **タスク行クリックの役割分離**
（そのまま windsurf に貼り付けてレビュー依頼に使えます）

## 🎯 ゴール
| UIパーツ | シングルクリック | ダブルクリック | 備考 |
| --- | --- | --- | --- |
| **チェックボックス** | `yet-done ⇄ done` 切替 | – | 行全体は反応させない |
| **タスク名 (テキスト)** | フォーカスして **編集モード** へ | 同上 | チェック状態は変えない |

---

## 🛠 変更ポイント

### 1. 行全体のクリックハンドラを撤去
以前は `<div … onClick={onToggleComplete}>` のように**行全体**に完了トグルがバインドされていたはず。
`EditableHierarchicalTaskItem` では **チェックボックスだけ**が `onToggleComplete` を受け取るようにしてください。

```diff
- <div onClick={onToggleComplete} …>   // ❌ 行クリック
+ <div …>                               // ✅ 削除
````

### 2. **Checkbox** 内で `e.stopPropagation()`

*まれに* 行全体や親コンポーネントにクリックがバブリングしている場合があるため、
チェックボックス側で明示的に止めておくと安全です。

```tsx
<Checkbox
  checked={completed}
  onCheckedChange={(checked) => {
    // Radix-style Checkbox は checked = true | false | "indeterminate"
    if (checked !== "indeterminate") onToggleComplete?.();
  }}
  onClick={(e) => e.stopPropagation()}   // ← ★ ここを追加
/>
```

### 3. **EditableText** 側でもバブリング抑止

`input`/`textarea` にフォーカスした瞬間に親へ click が伝播すると
“完了トグル → 取り消し線” が走るケースがあるため同様に防御。

```tsx
<EditableText
  value={title}
  onChange={(v) => onTitleChange?.(v)}
  onClick={(e) => e.stopPropagation()}   // ← ★ 追加
  className={completed ? "line-through text-gray-400" : "text-gray-800"}
/>
```

### 4. `EditableText` コンポーネントの実装チェック

* `div` → `input` のトグル時に **autoFocus** しているか
* Enter / Esc / Blur で **commit / cancel** しているか
  ここは既に動いていれば OK。
  もし動かない場合は下記の最小実装を参考に。

```tsx
export const EditableText = ({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) => {
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (edit) inputRef.current?.focus() }, [edit])

  const commit = () => {
    if (draft.trim() && draft !== value) onChange(draft.trim())
    setEdit(false)
  }

  return edit ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit()
        if (e.key === "Escape") setEdit(false)
      }}
      className={`w-full border rounded px-1 ${className}`}
    />
  ) : (
    <span
      className={`cursor-text ${className}`}
      onDoubleClick={() => setEdit(true)}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </span>
  )
}
```

---

## 🔍 テスト観点

1. **チェックボックス**

   * ✔ チェックすると `completed = true`, 取り消し線が付く
   * ✔ 再クリックで解除
   * ✔ クリック時にテキスト編集が始まらない

2. **テキスト**

   * ✔ ダブルクリックで入力フォームに変化
   * ✔ Enter またはフォーカスアウトで保存
   * ✔ Esc でキャンセル
   * ✔ 編集中にチェック状態は変化しない

---

## 📝 To Do リスト

* [ ] `EditableHierarchicalTaskItem.tsx` に上記 **stopPropagation** を追加
* [ ] 行全体の `onClick`（完了トグル）を削除
* [ ] `EditableText` が無ければ or 不安定なら最小実装に置き換え
* [ ] ユニットテスト／Playwright で UI 動作を確認
* [ ] PR: `fix/task-item-click-behavior` を作成

---

以上です！ 「チェック＝完了」「テキスト＝編集」に完全に分離できるはず。
疑問点があればお気軽にどうぞ 🙌

```
::contentReference[oaicite:0]{index=0}
```
