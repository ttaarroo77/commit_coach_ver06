# Scratchpad 概要

## 目的
- Cursor / windsurf が、自分のタスク手順をチェックリストで自己管理する
- **単一ファイルでタスク・エラー・アイデアを一元管理**し、Cursor / windsurf いずれのセッションでも同じ情報を参照できるようにする
- **チェックボックス形式 (`- [ ]` / `- [x]`)** を徹底して、LLM が進捗を機械的に判定できるようにする

## Scratchpadの基本入力項目 – 開発タスク & エラーログ

### Backlog // まだ着手していない実装タスク。優先度順に並べる

### In Progress // 作業中のタスク。Composer がここを中心に処理

### Blockers / Errors // エラー・技術的課題。最優先で解決する

### Done // 完了タスク。週次でアーカイブへ移動

### Ideas & Icebox // 将来やるかもしれないアイデア・メモ

### Meta // Scratchpad 運用ルールのメモ


## エントリ書式の例：
```markdown
- [ ] タスク名 – ラベル – 期日
  - Context: 背景や関連 Issue
  - Owner: @担当者
  - Confidence: 0-100
````

* **`- [ ]` / `- [x]`** で進捗を管理
* ラベル例: `feature`, `bug`, `chore`, `idea`
* 期日は `YYYY-MM-DD` 固定表記
