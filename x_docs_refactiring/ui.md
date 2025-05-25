# uiイメージ

┌──────────────────────────────────────────────────────────┐
│  ╭─╴≡  Commit Coach                              ＋New  │  ← Header
└──────────────────────────────────────────────────────────┘
┌───────────────┬──────────────────────────────────────────┐
│  📅  Today    │   🗂  Projects                           │  ← lg:grid-cols-2
│───────────────┼──────────────────────────────────────────│
│  ☑ task B-2   │  ▼ Project A                            │
│    • B-2-1    │     ▸ task A-1                          │
│    • B-2-2    │     ▸ task A-2                          │
│               │     ▾ task A-3                          │
│  ☐ task C-1   │         • A-3-1                         │
│  ☐ task D-4   │         • A-3-2                         │
│───────────────┤  ▼ Project B                            │
│  ☑ task E-5   │     ▸ task B-1                          │
│───────────────┴──────────────────────────────────────────┘
           ▲ drag from Today  │  ▼ drag into Project lists
           │ (Today = source) │  (drop targets: unsched/done)

《モバイル幅（≤ lg）は縦スタックに自動切替》

┌──────────────────────────┐
│  📅  Today               │
│──────────────────────────│
│  ☐ task B-2             │
│  ☐ task C-1             │
│──────────────────────────│
│  🗂  Projects            │
│──────────────────────────│
│  ▼ Project A            │
│     ▸ task A-1          │
│     …                   │
└──────────────────────────┘


---

## 🛠 現行 UI との差分を埋めるための決定事項

### 1. 3 カラム基本レイアウト
| エリア | 幅 | 背景 | 備考 |
|-------|----|------|------|
| **Left Nav** | `w-[180px]` 固定 | `bg-[#F8FAFC]` | サイドバー (ダッシュボード, プロジェクト一覧) |
| **Main Content** | `flex-1 max-w-[820px] mx-auto` | `bg-white` | TodayPane + ProjectsPane を内包 |
| **Right Coach** | `w-[260px]` 固定 (`hidden md:block`) | `bg-[#F8FAFC]` | 「AI コーチ」パネル |

> **lg 以上**: 3 カラム表示
> **md 未満**: Right Coach 非表示、Left Nav はドロワー化

### 2. Header (共通トップバー)
```text
╭─╴≡  Commit Coach                             ＋New
````

* 高さ `h-12` / 影 `shadow-sm`
* 中央は **現在ページタイトル** (今回は「ダッシュボード」)
* 右端に **リアルタイム時計** を配置

  ```tsx
  <time dateTime={isoNow}>{format(now, 'HH:mm')}</time>
  ```

### 3. TodayPane / ProjectsPane レイアウト

```text
┌─────── MainContent (grid-cols-[5fr_7fr] lg) ────────┐
│ 📅 Today (w-5/12)  │ 🗂 Projects (w-7/12)            │
└──────────────────────────────────────────────────────┘
```

* **lg 以上**: `grid grid-cols-[5fr_7fr] gap-4`
* **md 以下**: `flex flex-col` → Today → Projects の順で縦並び

### 4. カード & 行スタイル

| 要素              | re-use class    | スタイル                                                   |
| --------------- | --------------- | ------------------------------------------------------ |
| **ProjectCard** | `.project-card` | `rounded-lg border border-gray-200 px-4 py-2 bg-white` |
| **TaskRow**     | `.task-row`     | `flex items-center gap-2 py-1`                         |
| **SubtaskRow**  | `.subtask-row`  | `pl-6 text-sm`                                         |
| **アイコン群**       | `.task-actions` | `flex gap-1 text-gray-500 hover:text-gray-700`         |

### 5. DnD キャプチャ

* **ドラッグ中**: `ring-4 ring-primary/30 bg-primary/5`
* **ドロップ許可エリア**: `outline-dashed outline-2 outline-primary/40`

### 6. “AI コーチ” パネル

```
┌─────────────────┐
│ AI コーチ        │
│─────────────────│
│ ここにコーチング  │
│ メッセージを表示  │
└─────────────────┘
```

* タイポ: `text-sm leading-relaxed`
* オーバーフロー時は `overflow-y-auto h-full`

---

> **これで何を得られる？**
>
> * レイアウト比率・ブレークポイント・背景色が明文化 → 「どこに何 px で置くか」が 1 行で判断可。
> * 共通クラス名を先に決めるため、既存コードとの置換が楽。
> * Clock / AI パネルなどスクショにだけある要素が ASCII ワイヤーにも登場し、差分が消える。

まずは上記ルールで CSS / Tailwind class を統一し、コンポーネントを 3 カラムに再配置すれば “見た目のギャップ” はほぼ解消できます。

```

貼り付け後に **UI が揃ったか** を確認し、細部 (色味・フォント階層・アイコン) はフィードバックを回しながら追加でブラッシュアップしてください。
```
