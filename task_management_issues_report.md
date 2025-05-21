# タスク管理システム改善検討レポート

**日時**: 2025-05-21
**作成者**: チーム開発メンバー
**テーマ**: タスク分解と移動機能に関する問題と改善案

## 1. 現状の問題点

### 1.1 技術的問題
- **データ整合性の課題**
  タスクやプロジェクトを「未定タスク」と「今日タスク」グループ間で往復させると、特に分解済みタスクでIDの重複が発生
- **親子関係のあるタスクの移動時の問題**
  サブタスクを持つタスクを別グループに移動すると、参照整合性が崩れる可能性

### 1.2 ユーザー体験の問題
- ユーザーがタスクを移動させると予期しない副作用が発生
- 同じタスクが複数の場所に存在することで混乱を招く
- 階層構造を持つタスク（親子関係）の整合性が視覚的に把握しづらい



## 2. 根本的な改善案

### 2.1 参照ベースのアプローチ
- **概要**: 「今日のタスク」と「未定のタスク」は実タスクへの参照として扱う
- **メリット**: データの一貫性が保たれる
- **実装例**:
  ```typescript
  // タスクマスターリスト
  masterTasks: Task[]

  // グループは参照を持つ
  todayTasks: { taskId: string, displayOrder: number }[]
  unscheduledTasks: { taskId: string, displayOrder: number }[]
  ```

### 2.2 タスクの「状態」としての分類（推奨）
- **概要**: 「今日/未定」をタスクの属性として扱い、表示を分離
- **メリット**: 実装がシンプル、拡張性が高い
- **実装例**:
  ```typescript
  type Task = {
    // ...他のフィールド
    status: 'scheduled' | 'unscheduled'
    scheduledDate?: Date
  }
  ```

### 2.3 親子関係を保持したまま移動
- **概要**: サブタスクを移動する際は、親タスクごと移動するか選択させる
- **メリット**: ユーザーの意図を明確に反映できる
- **実装例**: 移動前に確認ダイアログを表示

### 2.4 ドラッグ＆ドロップの制限
- **概要**: 親子関係のあるタスクのドラッグ＆ドロップに制限をかける
- **メリット**: エラーを未然に防止できる
- **実装例**: サブタスクを持つタスクのドラッグをブロックまたは警告表示

## 3. 今後の対応計画

### 3.1 短期対応（～2週間）
- [ ] 既存データの整合性チェックとクリーンアップ
- [ ] エラーハンドリングの改善

### 3.2 中期対応（～1ヶ月）
- [ ] タスク状態ベースのモデルへのリファクタリング検討
- [ ] UI/UXの改善案の詳細設計
- [ ] 移行計画の策定

### 3.3 長期対応（～3ヶ月）
- [ ] 新しいデータモデルへの移行
- [ ] 高度なタスク分類・フィルタリング機能の追加
- [ ] カレンダービューの統合

## 4. レビュー対象ファイル

### 4.1 コア実装ファイル
- `/apps/frontend/app/dashboard/_hooks/use-dashboard.ts` - タスク管理の主要ロジック
- `/apps/frontend/app/dashboard/_components/DashboardNestedList.tsx` - タスクリスト表示
- `/apps/frontend/app/dashboard/_components/DashboardItemRow.tsx` - タスク行の表示
- `/apps/frontend/lib/dashboard-utils.ts` - データモデルとユーティリティ関数

### 4.2 リファクタリング対象
- データモデル定義部分 (`dashboard-utils.ts`内の型定義)
- タスク移動ロジック (`use-dashboard.ts`内の`moveTaskBetweenGroups`と`moveProjectBetweenGroups`)
- UI部分 (`DashboardNestedList.tsx`のドラッグ&ドロップ実装)

## 5. 参考資料

- [React公式: リストとキー](https://ja.reactjs.org/docs/lists-and-keys.html)
- [状態管理のベストプラクティス](https://redux.js.org/style-guide/style-guide)
- [ネストされたデータ構造の正規化](https://redux.js.org/tutorials/essentials/part-6-performance-normalization)

---

このレポートは開発チームの内部文書として作成されました。今後の開発計画の参考にしてください。
