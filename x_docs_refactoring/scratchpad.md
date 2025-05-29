# Dashboard Task List Refactor

このドキュメントは、**Work Tasks** タブの下に **Plan Tasks** を表示させるためのリファクタリング手順をまとめたものです。対象ブランチは
`refactor/002-ui-dashboard-task-management` です。

---

## 1. 目的
- **UX 向上**: タブを切り替えずに Work と Plan の両方のタスクを一望できるようにする。
- **実装簡素化**: タブ間で重複しているロジックや状態管理を一元化する。
- **拡張性**: 将来のタスク種別追加に備えてスケーラブルなデータモデルへ移行する。

---

## 2. 変更概要
1. **データモデル統合**
   `Task` 型に `category: 'work' | 'plan'` を追加し、単一配列で両カテゴリを管理。

2. **状態管理のリファクタ**
   `useTaskStore`（Zustand 例）の selector を削除し、`tasks` 配列を直接クエリ。
   ```ts
   // before
   const workTasks = useTaskStore(s => s.workTasks)
   const planTasks = useTaskStore(s => s.planTasks)

   // after
   const tasks = useTaskStore(s => s.tasks)
   const workTasks = tasks.filter(t => t.category === 'work')
   const planTasks = tasks.filter(t => t.category === 'plan')
````

3. **UI コンポーネント統合**

   * `DashboardTabs.tsx` を削除。
   * `WorkTaskList.tsx` を `TaskList.tsx` に改名し、`category` prop でフィルタリング。
   * Plan セクションを Work セクション配下に描画。

4. **スタイリングの調整**
   Figma 参照: Plan セクションは Work リストの**直下**に `border-t` を入れて区切る。

5. **既存データのマイグレーション**

   ```sql
   -- PostgreSQL 例
   UPDATE tasks SET category = 'plan'
   WHERE list_id IN (SELECT id FROM lists WHERE name = 'Plan Tasks');
   ```

6. **E2E / 単体テスト更新**

   * Cypress: `dashboard_tab.spec.ts` を `dashboard_tasklist.spec.ts` にリネーム。
   * 期待 DOM セレクタを `.plan-section` へ変更。

---

## 3. 手順詳細

| #  | ステップ         | コマンド/ファイル                                                                    | メモ                                                            |
| -- | ------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1  | 新ブランチ作成      | `git checkout -b feature/merge-plan-into-work`                               |                                                               |
| 2  | 型定義更新        | `types/task.ts`                                                              | `category` フィールド追加                                            |
| 3  | Store 統合     | `stores/taskStore.ts`                                                        | selector 統合                                                   |
| 4  | UI 改修        | `components/TaskList.tsx`                                                    | JSX と tailwind クラス調整                                          |
| 5  | 不要タブ削除       | `components/DashboardTabs.tsx`                                               | ファイル削除 & import 削除                                            |
| 6  | ルーティング調整     | `pages/dashboard/index.tsx`                                                  | `<TaskList category="work" />` `<TaskList category="plan" />` |
| 7  | DB マイグレーション  | `prisma/migrations/xxxx`                                                     | SQL 例参照                                                       |
| 8  | テスト修正        | `cypress/e2e/dashboard_tasklist.spec.ts`                                     |                                                               |
| 9  | lint & build | `pnpm lint && pnpm build`                                                    |                                                               |
| 10 | commit & PR  | `git commit -am "feat: merge plan tasks under work tasks"`<br>`gh pr create` |                                                               |

---

## 4. ロールバック手順

1. `git revert` で対象コミットを戻す。
2. DB の `category` 値を `NULL` へリセット。

---

## 5. 参考

* [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
* Zustand Docs – Selectors
* Tailwind UI – List Groups

---

Happy Coding!

```
```
