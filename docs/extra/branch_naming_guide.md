# 🚦 Branch Naming & Workflow Guide

> **目的 / Purpose**
> ブランチ数が増えても *一目で状態と内容が分かり、いつでも安全地点に戻れる* 運用を実現する。
> 本ファイルはリポジトリ共通の **命名ルール + 実用フロー** を示すシングルソース。

---

## 1. 命名フォーマット

```
<risk>/<nnn>-<scope>-<topic>
```

| セグメント     | 例                                                   | 意味                       |
| --------- | --------------------------------------------------- | ------------------------ |
| **risk**  | `safe` `hotfix` `feat` `refactor` `spike` `release` | ブランチの安心度／用途カテゴリ          |
| **nnn**   | `001` `002` …                                       | **リポジトリ全体で通し連番** (欠番 OK) |
| **scope** | `ui` `api` `infra` `docs`                           | 影響範囲・レイヤー                |
| **topic** | `2-tab-mode` `editable-fix`                         | ケバブケースで具体的テーマ            |

> **並び順の意図** – `risk` 先頭で **GUI/CLI のグループ化**、`nnn` で **時系列** が自然昇順。

### 1.1 サンプル

* `safe/001-ui-2-tab-mode` – 安定スナップショット (基点)
* `hotfix/002-ui-editable-fix` – 本番パッチ
* `feat/003-api-bulk-import` – 新機能
* `refactor/004-ui-split-components` – 構造整理
* `spike/005-editor-ai-prototype` – PoC
* `release/006-release-v0.9` – リリース候補

---

## 2. 推奨 prefix カテゴリ

| prefix        | 用途 / リスク             | 補足                |
| ------------- | -------------------- | ----------------- |
| **safe/**     | “最後に動いた”スナップショット     | ここから派生して戻れる基点     |
| **hotfix/**   | Production への即時パッチ   | 小粒・最優先            |
| **feat/**     | 新機能開発（通常リスク）         | scope でさらに分類可能    |
| **refactor/** | 内部構造変更。挙動は変えないが壊しやすい | リファクタ専用           |
| **spike/**    | PoC・実験・捨てブランチ        | 短命を前提             |
| **release/**  | バージョン凍結・タグ準備         | Release Candidate |

> **命名ヒント** – prefix は 3〜7 文字で統一し、`git checkout fe<Tab>` などの補完が快適になるよう配慮。

---

## 3. ブランチ作成ワークフロー

```bash
# 1. 安定点をブランチとして固定
$ git checkout <stable-sha>
$ git checkout -b safe/001-ui-2-tab-mode
$ git push -u origin safe/001-ui-2-tab-mode

# 2. Hotfix を切る
$ git checkout -b hotfix/002-ui-editable-fix safe/001-ui-2-tab-mode

# 3. 新機能 or リファクタは同じ基点から派生
$ git checkout -b feat/003-api-bulk-import safe/001-ui-2-tab-mode

# 4. マージ完了後は削除（履歴は PR が保持）
$ git push origin --delete hotfix/002-ui-editable-fix
```

### 3.1 運用ルール

1. **連番はカテゴリ内で一意**: 欠番は詰めない。<br>
2. **終了ブランチは即削除**: GitHub PR が履歴代わり。<br>
3. **衝突防止**: 新しい番号を取る前に `git fetch --prune` で最新を確認。<br>
4. **状態変更** はブランチ名を変えずに **新規ブランチで切り直す** こと。

---

## 4. よくある質問

| Q                      | A                                                                              |
| ---------------------- | ------------------------------------------------------------------------------ |
| **連番が大きくなり過ぎない？**      | 1000 を超えたら桁を増やすだけ。欠番OKなので管理は簡単。                                                |
| **risk を増やしたい**        | `spike/` など **末尾に追加**し、アルファベット順で自動的に下に並ぶようにする。                                 |
| **prefix を typo したら？** | ブランチは作り直し推奨。GitHub で Rename も可能だが連番は再利用しない。                                    |
| **PR タイトルと連動させたい**     | CI で `branch-name ⟹ PR title` をテンプレート生成するスクリプト例を `scripts/pr-template.js` に置く。 |

---

## 5. チートシート

```bash
# 一覧を状態別で確認
$ git branch --list "hotfix/*"

# 連番の最新値を確認する簡易コマンド
$ git branch -r --format="%(refname:short)" | grep '^feat/' | cut -d'/' -f2 | cut -d'-' -f1 | sort -n | tail -1
```

---

> 最後に：**“戻れる場所をいつも先に切る”** が事故ゼロ開発の第一歩。safe ブランチを育てながら、hotfix・feat・refactor を安心して回していきましょう。
