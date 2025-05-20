
# scratchpad.md の 注意点（例: `caveats.md`）


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



# scratchpad.md の 注意点（例: `caveats.md`）

```markdown
# Scratchpad 運用時の注意点

## ファイルサイズ
- Claude Sonnet の快適領域は **~2 k tokens (≒ 1,500 語)**
- `Done` が 30 件を超えたら必ずアーカイブし、Scratchpad を軽量に保つ

## セクション厳守
- 見出し名を変更すると LLM がパースできなくなる
- H3 以下を増やさず、階層はリストで表現する

## 重複タスク
- 同一タスクを Backlog / In Progress 両方に置かない
- 似たタスクは `Context:` にリンクを追加してまとめる

## ブロッカー優先
- `Blockers / Errors` が空になるまで Backlog に着手しない
- Composer へのプロンプトにも優先順位を必ず明記する

## 期日表記
- **ISO 8601 (`YYYY-MM-DD`) 固定**
- 相対表現（“来週” など）は LLM が誤解しやすい

## Confidence の扱い
- 50 未満: 要追加情報。質問して確度を上げる
- 80 以上: すぐに実装可能。In Progress へ移動

## アーカイブ方法
```bash
# 月次で Done を切り出し
$ mv skratchpad.md archive/scratchpad_$(date +%Y%m).md
# テンプレの空ファイルを配置
$ cp templates/scratchpad_base.md skratchpad.md
````

* 履歴を残すことで検索性を担保
* memories.md にはアーカイブを参照するリンクを追記しておく




## 使い方フロー

1. **タスク追加**
   `Backlog` へエントリを追記。Composer へは「Backlog を見て計画して」と指示。
2. **着手**
   作業開始時に `- [ ]` を `In Progress` へ移動。
3. **ブロッカー発生**
   エラーが出たら同じフォーマットで `Blockers / Errors` へ移動。
4. **完了**
   `- [x]` に変えて `Done` へ。週次で `archive/scratchpad_YYYYMM.md` へ切り出す。
5. **アイデアメモ**
   閃きや将来タスクは `Ideas / Icebox` に置き、定期レビューで採用可否を判断。

## Composer / Claude との連携例

```text
@scratchpad-management.mdc に従い、
## In Progress と ## Blockers / Errors だけを抽出して
優先度順に解決策を提案してください。
```

* セクション限定で渡すと応答高速化
* `Confidence` が低い行は質問を促して精度を高める

````

---
