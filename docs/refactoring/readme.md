# Commit Coach — 🚢 v2 Docs Index

> **Commit Coach プロジェクトの設計・実装ドキュメント専用スペースです。**
> 30 秒で全体像を把握できるよう、ファイル構成と読み方をまとめました。
> ブランチ: **feat/007-ui-ux-polish** (中身: AIタスク分解機能と日本語IME入力対応)

---

## 📂 ドキュメント構成

```text
docs/refactoring/
╲─ 01_product_overview.md         # UX 概要 & 要件
╲─ 02_ui_component_list.md        # React コンポーネント仕様
╲─ 03_state_management.md         # Zustand + React Query 設計
╲─ 04_api_contract.md             # REST / WebSocket API 契約
╲─ 05_acceptance_criteria.md      # QA 受け入れ基準
╲─ 06_frontend_migration_guide.md # フロント段階移行手順
╲─ 07_backend_migration_guide.md  # DB & サービス切替手順
╲─ 08_data_model.md               # 論理/物理データモデル
╲─ 09_event_flow.md               # リアルタイムイベント仕様
╲─ 10_ai_features.md              # AIタスク分解とチャット機能仕様
╲─ 11_ux_improvements.md          # 日本語IME対応とUI改善
╲─ manual_for_scratchpad.md       # ポートフォリオ化実装マニュアル
╲─ scratchpad.md                  # タスク進行ボード (2025-06-04更新)
╲─ last_conversation.md           # 完了済み仕様記録
── archive/                       # 旧版 / 完了済みドキュメント
```

| カテゴリ        | ファイル           | 一言で説明                              | 主な読者           |
| ----------- | -------------- | ---------------------------------- | -------------- |
| **プロダクト仕様** | 01, 02         | 画面設計と UI 詳細                        | デザイナ / FEエンジニア |
| **技術設計**    | 03, 04, 08, 09 | フロント状態管理、API、データモデル、イベント           | FE / BE / QA   |
| **移行手順**    | 06, 07         | Blue‑Green・Feature Flag を使った段階リリース | DevOps / SRE   |
| **品質保証**    | 05             | 受け入れ条件とテスト観点                       | QA / PM        |
| **進捗管理**    | scratchpad.md  | WIP タスクのカンバン                       | チーム全員          |

---

## 🔰 まず読む順番

<!-- 1. **01\_dashboard\_overview\.md** – 何を作るかを把握 -->
1. **01\_product\_overview\.md** – 何を作るかを把握
2. **02\_ui\_component\_list.md** – 画面部品の責務を確認
3. **03\_state\_management.md** – ストア設計を理解 → 実装開始
4. **04\_api\_contract.md** – バックエンド I/F を確認
5. **05\_acceptance\_criteria.md** – 品質定義を共有

> 実装者なら 06→07 で移行手順を、データ系なら 08→09 を合わせて参照してください。

---

## 🛠️ 開発 Quick Start

```bash
# リポジトリルートで
pnpm i         # 依存インストール
cd apps/frontend && pnpm dev  # フロントエンド (Next.js) on PORT=3100
```

### 環境変数設定

```bash
# 開発環境用
# NEXT_PUBLIC_DEMO_MODE=true   # 認証バイパスとダミーデータを有効化

# AI機能テスト用
# 本番環境では実際のAIレスポンスが返されるが、開発/デモ環境ではダミーレスポンス
```

* 詳細は **06\_frontend\_migration\_guide.md** / **07\_backend\_migration\_guide.md** の「準備手順」を参照。

---

## 📌 運用ルール

* ドキュメントは **PR 経由で更新**し、main へマージ後すぐ共有。
* 週次で scratchpad の **Done** セクションを `archive/YYYY-WW.md` に自動退避 (CI あり)。
* 破壊的変更 (breaking) を加える場合は該当ファイルのヘッダに `## Breaking Change YYYY-MM-DD` を追記。

---

## ❓ よくある質問

| Q                       | A                                         |
| ----------------------- | ----------------------------------------- |
| **旧版 (Vue) へのリンクは？**    | `/archive/legacy_vue_docs/` に移動済みです。      |
| **ER 図だけ見たい**           | 08\_data\_model.md の冒頭に mermaid で記載しています。 |
| **WebSocket イベントの一覧は？** | 09\_event\_flow\.md の §4 を参照ください。         |

---

## 🏷️ ライセンス

MIT © 2025 Commit Coach Team
