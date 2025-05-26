# last\_conversation.md — 会話ログ／決定事項テンプレート

> **目的**
> Slack／Zoom／ChatGPT などで直近に行ったディスカッションの要点・決定事項・TODO を整理し、関係者が “何が決まって何が宿題か” を即時に把握できる状態にする。原文ログを丸ごと貼るのではなく、**要約 + 必要に応じて全文引用** の 2 段構成とする。

---

## 1. メタデータ

| 項目               | 内容                         |
| ---------------- | -------------------------- |
| **Date**         | YYYY‑MM‑DD                 |
| **Topic**        | （例）2‑Tab UI 仕様レビュー         |
| **Participants** | @Taro, @Yuki, @Akira       |
| **Source**       | Zoom / Slack / ChatGPT / … |

---

## 2. TL;DR (120 文字以内)

> ここに “今回の結論” を 1–2 行で書く。

---

## 3. Key Decisions ✅

| # | 決定事項                                           | 理由 / 背景                     |
| - | ---------------------------------------------- | --------------------------- |
| 1 | 例: **インライン編集を onBlur 保存に変更**                   | UX テストで Enter 押下が分かりづらかったため |
| 2 | 例: **Task status を ENUM(todo/doing/done) に固定** | データクレンジング簡略化                |

---

## 4. Action Items 🔨

| # | タスク                          | Owner  | Due   | Notes         |
| - | ---------------------------- | ------ | ----- | ------------- |
| 1 | API `/tasks/:id` PATCH 実装    | @Akira | 05‑30 | —             |
| 2 | UI: DatePickerPopover スタイリング | @Yuki  | 05‑31 | Figma #123 参照 |

---

## 5. Open Questions ❓

* Q1: Subtask の `done` → Task `status` 自動更新ロジックは必要か？
* Q2: WebSocket ACK をクライアント毎に返すか、バッチ ACK にするか？

---

## 6. Reference Materials 📎

* [02\_ui\_component\_list.md §3. 編集ユーティリティ系](./02_ui_component_list.md)
* Miro 共同編集ボード (link)

---

## 7. 更新ルール

1. 会話終了後 **15 分以内** に TL;DR と Key Decisions を作成。
2. TL;DR 以外はドラフトでもよいので Issue リンクや TODO を残す。
3. 新しい会話が発生したら同ファイルを **上書きではなく追記** (`## 2025‑06‑??` のように見出しを増やす) か、`last_conversation_YYYYMMDD.md` として複製して保存。

---

## 8. Full Transcript (Optional)

<details>
<summary>▼ クリックで展開</summary>

```text
ここに全文ログをコピペ。長い場合は抜粋でも可。
```

</details>

---

© 2025 Commit Coach チーム
