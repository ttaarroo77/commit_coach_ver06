# 🛠️ Duplicate‑Key Error 撲滅手順書 （Commit Coach）

> **目的** ‒ `Encountered two children with the same key` 警告を解消しつつ、既存 UI のレイアウト崩壊（チェックボックスやアイコンのズレ・高さジャンプ）を起こさない。
> **対象ブランチ** ‒ `temp-branch`（運用中） ※ `x_docs_refactoring` で後続の全面リファクタリングが予定されているため **“最小パッチ”** で対処する。

---

## 1  原因まとめ

| 症状                                                                           | 根本原因                                  | UI 崩れの副次要因                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Next.js devtools に<br>`Encountered two children with the same key, 'task-1'` | `project.tasks` 配列内に重複 `id` が存在（連番採番） | 暫定対応で `key={id}-{index}` にした結果、並び替えで `index` が変化 → React が **別要素と誤認** し再マウント → レイアウト再計算が乱れる |

---

## 2  解決方針（3 ステップ）

1. **ユニーク ID へ全面移行** ‒ `nanoid()` / UUID。
2. **キーは安定 & 一意** ‒ `key={task.id}` に戻す（index は付けない）。
3. **既存データを一括マイグレーション** ‒ 重複を排除してからデプロイ。

> **留意:** `x_docs_refactoring` では DB スキーマ再設計が予定されているため、ここでは **モデル / API を壊さない範囲で** 対応する。

---

## 3  実装手順

### 3‑1  依存追加

```bash
pnpm add nanoid
```

### 3‑2  ID 生成ヘルパー（`apps/frontend/lib/createTask.ts` など）

```ts
import { nanoid } from "nanoid";
import type { Task } from "@/types";

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: nanoid(),          // ぶつからない ID
  title: "新しいタスク",
  completed: false,
  expanded: true,
  startTime: null,
  endTime: null,
  subtasks: [],
  ...overrides,
});
```

### 3‑3  追加系ハンドラを置換

`DashboardNestedList.tsx` / `useDashboard.ts` 等の *連番採番ロジック* をすべて `createTask()` へ置換。

```diff
- const newTaskId = `task-${project.tasks.length + 1}`;
- const newTask: Task = { id: newTaskId, ... };
+ const newTask = createTask();
```

※ レンダリング関数内で `nanoid()` を呼ばないこと（StrictMode 2 回レンダーで ID が変わる）。

### 3‑4  DOM キーを純粋化

```diff
- key={`${task.id}-${index}`}
+ key={task.id}
```

> **フェールセーフ不要** — ID が本当に一意なら `index` 付きキーは百害あって一利なし。

### 3‑5  既存データのマイグレーション

* Supabase を使用している場合：

  ```sql
  UPDATE tasks SET id = gen_random_uuid() WHERE id IN (
    SELECT id FROM tasks GROUP BY id HAVING COUNT(*) > 1
  );
  ```
* あるいはスクリプト例：`scripts/dedupeTaskIds.ts`（※詳細はリポジトリ参照）。

> **デプロイ順序**
> 1️⃣ DB マイグレーション → 2️⃣ FE デプロイ　（ID が一意であることを先に保証）

---

## 4  動作確認チェックリスト

* [ ] タスク 50 件連続追加しても警告ゼロ
* [ ] Today ↔ Unscheduled でドラッグ＆ドロップ後も警告／UI 歪みなし
* [ ] ページ遷移 → 戻ってもチェック状態・展開状態が維持
* [ ] CI / ESLint / Jest すべてグリーン

---

## 5  将来リファクタとの整合 (x\_docs\_refactoring)

| 区分  | 今回の対応           | 将来の計画 (refactor doc)    | 衝突リスク | 回避策                       |
| --- | --------------- | ----------------------- | ----- | ------------------------- |
| DB  | `uuid` 型カラム追加のみ | テーブル再設計／正規化             | **低** | マイグレーションファイルを別 PR に分離     |
| API | エンドポイント仕様変更なし   | REST → tRPC 移行          | 中     | 型共有層を `@/schema` に抽出      |
| FE  | ID 生成と key 修正   | Zustand → Redux Toolkit | 低     | `createTask` をユーティリティ層に残す |

> **メモ:** 本ドキュメントで触れたファイルは *refactor ブランチでも再利用* されるため、パス & エクスポート名を変更しないこと。

---

## 6  Git 運用例

```bash
# 1. 作業ブランチ
git checkout -b fix/duplicate-key-temp

# 2. コード修正 & DB スクリプト
pnpm run migrate:dedupe-ids
pnpm test && pnpm lint

# 3. コミット
git add .
git commit -m "fix: use nanoid and drop index key to resolve duplicate‑key warning"

# 4. PR 作成（タイトル必須）
# "fix: duplicate key (temp hotfix)"
```

---

### Appendix — よくある落とし穴

1. **Strict‑Mode 二重レンダー** … ハンドラ外に ID 生成を置く。
2. **Framer‑Motion の `layoutId` 重複** … `id` と同期させる。
3. **Immer 直書き更新** … Draft 書き換えが key 判定に影響する場合は `produce` を徹底。

---

✅ 以上で Duplicate‑Key 問題と UI 歪みの両方を解消できます。
疑問点・追加調査が必要な場合は `@your‑slack‑channel` までどうぞ。
