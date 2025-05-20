# ダッシュボードが真っ白になる原因と解決策

## 原因 — `page.tsx` が何も描画していない

リポジトリ `apps/frontend/app/dashboard/page.tsx` を確認すると、読み込み完了後に **空要素 (`<> </>`) だけ返している** ため、React が DOM に何も挿入せずブラウザには真っ白なページが表示されます。

```tsx
export default function DashboardPage() {
  const ctx = useDashboard();

  if (ctx.isLoading) return (<div>読み込み中...</div>);
  return (<> </>); // ← 空のまま
}
```

## 補足 — 他ファイルは実装済み

* `HeaderSection`: タイトル・日付などを描画  
* `TaskGroupList` / `TaskGroupCard`: タスク一覧 UI  
* `AICoachSidebar`: 右側の AI コーチパネル  

> **つまり「親レイアウトだけ空」で、その子コンポーネントは揃っている状態です。**

## 解決策（最小パッチ例）

`apps/frontend/app/dashboard/page.tsx` を以下のように組み立てると UI が表示されます。

```tsx
"use client";

import { Sidebar } from "@/components/sidebar";
import { AICoachSidebar } from "@/components/ai-coach-sidebar";
import { HeaderSection } from "./_components/header-section";
import { TaskGroupList } from "./_components/task-group-list";
import { useDashboard } from "./_hooks/use-dashboard";

export default function DashboardPage() {
  const ctx = useDashboard();

  if (ctx.isLoading) return (<div className="p-6">読み込み中...</div>);

  return (
    <div className="flex h-screen">
      {/* 左サイドバー */}
      <Sidebar />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
        <HeaderSection
          currentTime={ctx.currentTime}
          formatDateDisplay={ctx.formatDateDisplay}
          formatTimeDisplay={ctx.formatTimeDisplay}
        />
        {/* タスク一覧 */}
        <TaskGroupList {...ctx} />
      </main>

      {/* 右の AI コーチ */}
      <AICoachSidebar />
    </div>
  );
}
```

### 期待される動作

1. **読み込み中** は従来どおり表示  
2. 読み込み完了後  
   * 左: ナビゲーション (`Sidebar`)  
   * 中央: ヘッダー + タスクグループ一覧 (`HeaderSection`, `TaskGroupList`)  
   * 右: AI コーチ (`AICoachSidebar`)  
   が描画される  
3. `TaskGroupList` が DnD などの既存ロジックで動作

## ワンポイント

* “真っ白”かどうかは **開発者ツール → Elements** で `<body>` 直下が空か確認すると早い  
* タスクが 0 件の場合でもヘッダー･サイドバーは見えるはず  
  * それでも中央が空ならダミーデータが無いだけなので
    `ctx.handleAddProject(...)` でプロジェクトを追加してみる  

## まとめ

* `git reset` は成功しており、ブランチ **`unsafe-refactoring-plan-implementation`** は UI を再構成中  
* 真っ白の直接原因は **`page.tsx` が空要素のみ返している** こと  
* 上記パッチでダッシュボード UI が復旧する
