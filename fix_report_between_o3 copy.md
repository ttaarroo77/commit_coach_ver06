以下は `skratchpad.md` の**要件定義**と**サンプル**、そして Cursor × Claude-3-7 Sonnet （以下 Claude Sonnet）で無理なくハンドリングできる規模についての考察です。

---

## 1. 目的（Purpose）

* **単一ソースでタスクを管理**し、Composer／Chat 両モードから常に同一の To-Do を参照・更新できる。
* **エラー・TODO・アイデアの即時メモ**を促し、タスク化の抜け漏れを防ぐ。
* **Markdown ＋ チェックボックス**フォーマットに統一し、LLM が機械的に読みやすい構造を保つ。

---

## 2. ファイル構造と見出し（Headings）

| レベル     | 見出し               | 必須 | 用途                                                               |
| ------- | ----------------- | -- | ---------------------------------------------------------------- |
| H1 `#`  | Scratchpad        | ✔  | ファイルのトップ。目的を 1 行で書く（例: “開発タスク & エラーログ”）。                         |
| H2 `##` | Backlog           | ✔  | **実装予定**だが着手していないタスク。優先度順に並べる。                                   |
| H2      | In Progress       | ✔  | **現在着手中**のタスク。Composer への指示はここを参照する。                             |
| H2      | Blockers / Errors | ✔  | **エラー・技術的課題**。根本原因が不明／保留の場合はここへ。                                 |
| H2      | Done              | ✔  | 完了したタスク。直近 1〜2 週間分だけ残し、古いものは `archive/scratchpad_YYYYMM.md` へ移動。 |
| H2      | Ideas / Icebox    | ◯  | いつかやるかもしれないタスク・メモ。Backlog と明確に分離。                                |
| H2      | Meta              | ◯  | Scratchpad 運用に関するメモ（例: “週次で Done をアーカイブ”）。                       |

> **命名のポイント**
>
> * セクション名は英単語で固定すると、LLM がセクション位置を正確に取得しやすい。
> * 必要以上のネスト（H3 以下）は避け、リストで階層を表現する。

---

## 3. エントリ書式（チェックリスト）

```
- [ ] {タスク名} – {ラベル} – {期日}
  - Context: {発生経緯や関連 Issue URI を簡潔に}
  - Owner: @user
  - Confidence: 0-100  ← Claude に推定させても OK
```

* **`- [ ]` / `- [x]`** だけで状態を判断させる。
* サブタスクは 2 段目の `- [ ]` を使う。
* ラベル（例: bug / chore / feature）と期日をワンラインで持たせると、正規表現 1 本でパース可能。

---

## 4. サンプル `skratchpad.md`

```markdown
# Scratchpad – 開発タスク & エラーログ

## Backlog
- [ ] GraphQL スキーマ自動生成の CI 連携 – feature – 2025-05-25
  - Context: #321 API 型整合性エラー対策
  - Owner: @alice
  - Confidence: 70
- [ ] 解像度 4K の画像アップロード失敗を調査 – bug – 2025-05-20
  - Context: Sentry ERR_UPLOAD_413
  - Owner: @bob

## In Progress
- [ ] Stripe Webhook のリトライロジック実装 – chore – 2025-05-18
  - Context: 支払い失敗時の二重課金防止

## Blockers / Errors
- [ ] CI/CD で `node-gyp` のビルドが落ちる – blocker – ASAP
  - Context: Ubuntu 22.04 + Node 20 で再現
  - Owner: @carol

## Done
- [x] Prisma マイグレーション自動ロールバック – feature – 完了 2025-05-16

## Ideas / Icebox
- [ ] GitHub Actions で e2e video レコーディング保存 – idea
```

---

## 5. Claude Sonnet が扱える規模の目安と運用

| 項目      | Claude Sonnet の仕様                 | 推奨運用                                                       |
| ------- | --------------------------------- | ---------------------------------------------------------- |
| コンテキスト長 | **最大 ≈ 200 k tokens**（理論値）        | 実際は *100 k tokens* 超で応答遅延が顕著。                              |
| 安定動作域   | \~10 k tokens（Markdown なら 7 MB 弱） | Scratchpad は **1–2 k tokens** に抑え、<br>長文は memories.md へ退避。 |
| パース速度   | セクション見出し & チェックボックス程度なら高速         | セクション数は **10 以下**、<br>1 セクション 100 行未満が快適。                  |
| 更新コスト   | 大きいファイルを毎回与えると料金/遅延増              | **差分プロンプト or git diff** を LLM に渡す。                         |

### 実践的なガイドライン

1. **週次アーカイブ**
   `Done` が 30 件を超えたら `archive/` ディレクトリに切り出し、Scratchpad を 2 k tokens 未満に保つ。

2. **Blockers 優先**
   Composer に “まず `Blockers / Errors` を解決してから `Backlog` に着手” というルールを渡すと、誤った優先順位を避けやすい。

3. **Context 抽出プロンプト**

   ```text
   以下のセクションのみを抽出して処理：
   ## In Progress
   ## Blockers / Errors
   ```

   のように、**必要箇所だけ**投げると速度が段違い。

4. **大型議論は memories.md へ**
   規模の大きい PoC、議論ログ、振り返りは memories.md に蓄積し、Scratchpad には “#123 の結論を実装” という粒度で置く。

5. **Claude Sonnet × Cursor の sweet-spot**

   * **並列タスク 5〜10 件 / ファイル 2 k tokens 前後**
   * これなら *1 プロンプトあたり数秒* で応答し、コストも現実的。
   * それ以上は Composer のスロットリングが起こりやすくなるため、差分渡しやセクション分割で対応。

---

## 6. まとめ

1. 見出しは **Backlog / In Progress / Blockers / Done / Ideas** を軸に固定。
2. エントリは **`- [ ]` 書式＋Context/Owner/Confidence** を 1 段で記述。
3. Scratchpad サイズは **常時 2 k tokens（おおよそ 1,500 語）以内**をキープし、超過分はアーカイブ or memories.md へ。
4. Claude Sonnet は理論上 200 k tokens まで読めるが、**運用コストと応答速度**を考慮すると 10 k tokens 以下がベスト。
5. 差分渡し・セクション限定読み込みを徹底すると、Cursor × Claude Sonnet でもストレスなくペアプロ感覚で運用できる。

この設計をベースに運用を始め、**週次でファイルサイズと応答速度を点検**しながら、アーカイブルールや見出しを微調整していくと、長期的にも快適な AI 駆動開発環境になります。
