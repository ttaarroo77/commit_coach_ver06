# 🗒️ Commit Coach Scratchpad — Hierarchical Checklist

*ネストされたチェックリスト ( `[ ]` / `[x]` ) だけで進捗を管理する軽量テンプレ*

---

## ルール (最短版)

1. **1 行 1 項目** — 親 → 子 → 孫 … とインデント 2 スペースでネスト。
2. **\[ ] 未完 / \[x] 完了** を切り替えるだけ。期日やメモは必要に応じて末尾 `(MM‑DD)`。
3. **親がすべて \[x] になったら自動で折りたたみ表示 (GitHub UI)**。

<details>
<summary>多層構造のチェックリスト記法サンプル</summary>

```markdown
- [ ] 🏁 リリース準備 (06‑10)
  - [ ] ビルド最終確認 @Taro
  - [ ] Netlify ステージングデプロイ @Sara
    - [ ] env 変数反映 (06‑08)
  - [ ] QA リグレッション @Alex
- [ ] ドキュメント更新 @Mia (06‑09)
```

</details>

---

## Backlog

* [ ] 🌱 新機能アイデア

  * [ ] AI でタスク見積もり
  * [ ] ダークモード自動切替

---

## Doing

* [x] 📚 **docs/refactoring ドキュメント確定** (05‑31)

  * [x] 01〜09.md 校閲 @nakazawatarou
  * [x] spell‑check & linter 実行
  * [x] Reviewer アサイン (@tech‑lead, @ux)
* [x] 📨 **ドキュメントをリポジトリに push** (05‑31)

  * [x] `docs/refactoring` に配置
  * [x] `git add && commit -m "docs: add x_docs_refactoring"`
  * [x] GitHub PR 作成 (draft)
* [ ] 🏗 **フロント移行タスクの着手** (06‑01)

  * [x] `feature/remove-dashboard` 最新リベース
  * [ ] Storybook import エラー修正 (`Cascade > Fix imports`)
  * [ ] `pnpm test` & `pnpm lint` で green に

---

## Blockers

* [ ] Supabase Edge Function 削除に伴う Zapier Hook 影響範囲調査 (担当未定)

---

## Done

* [x] Scratchpad 雛形決定 & 反映 (05‑30)

---

## Ideas

* [ ] Postgres → ClickHouse 移行調査

---

<!-- End of File -->
