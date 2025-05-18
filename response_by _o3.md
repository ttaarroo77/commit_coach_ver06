
## o3 からのコメント

### 解決のための手順 (チェックリスト)

* [ ] **再現手順を固定化**
  同じブラウザ／同じプロジェクトで `http://localhost:3000/dashboard` にアクセスし、
  DevTools Console に `Encountered two children with the same key` が出ることを確認する。

* [ ] **重複キーを検出**

  1. `app/dashboard/page.tsx` で `group.projects` をログ出力し、
     `id: "project-2"` が複数回現れることを確かめる。
  2. `group.projects.map((project)…` 以前に

     ```ts
     const ids = group.projects.map(p => p.id);
     console.assert(new Set(ids).size === ids.length, 'Duplicated IDs', ids);
     ```

     を一度入れて重複を可視化。

* [ ] **原因を切り分け**

  * **データ層**: `getProjectsByGroup()`（仮）などで同じ ID を 2 回返していないか。
  * **UI 層**: **同一 ID が別グループからも来る** 可能性があるか。

* [ ] **修正**

  * **最優先**: ID が真にユニークになるようサーバ／DB 側で正す。
  * **暫定**: 重複が許容できるなら

    ```tsx
    <Card key={`${group.id}-${project.id}`}> … </Card>
    ```

    のように *複合キー* にして衝突を回避。

* [ ] **テスト追加**
  Jest などで

  ```ts
  expect(new Set(projects.map(p => p.id)).size).toBe(projects.length);
  ```

  を入れ、重複が CI で検知できるようにする。

* [ ] **再確認**
  ブラウザの Console から警告が消えることを確認し、MR/PR を提出。

### 注意すべき点とその対策

| リスク                                                  | 対策                                                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **キー衝突による UI 不整合**<br>（行の重複表示・イベント紛れ込み）              | ・ID を生成／取得する関数では **必ず** UUID か DB 主キーを返す。<br>・`Array.prototype.filter` で ID 重複を除外してから描画する手もある。 |
| **キーの“安定性”の欠如**<br>（毎レンダーでキーが変わるとアニメーションや入力がリセットされる） | 複合キーを使う場合も「決して変わらない値」の組み合わせに限定する。例: `group.id + '-' + project.id` は OK、`Math.random()` は NG。   |
| **型安全性**                                             | `id` を `string` ではなくリテラル型／`Brand<"ProjectID", string>` のように包むことで、別エンティティ ID との取り違えをコンパイル時に防げる。 |

### 初学者向けガイド & 学習 Tips

1. **React の key とは？**
   同じ階層（siblings）にある要素を識別するためのラベル。

   * *ユニーク* かつ *安定* していることが必須。
   * 再レンダー時に key が変わると「別物」と見なされ DOM を作り直す。

2. **よくある落とし穴**

   * **リレーション ID の重複**:
     「グループ A の project-2」と「グループ B の project-2」がぶつかる。
     → **複合キー**で回避。
   * **インデックスキー (`key={i}`) の使用**:
     並び替えや削除でバグるので避ける。

3. **デバッグのコツ**

   * `React DevTools` の “Components” タブで key を確認。
   * Console に `(key)` を付けてログを出すと追いやすい。

     ```ts
     console.log('[Render]', group.id, project.id);
     ```

4. **参考リンク**

   * React 公式 「Rendering Lists」
   * Kent C. Dodds 「A Complete Guide to React Keys」
     （“key がなぜ重要か” を図入りで解説）

