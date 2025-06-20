# 01\_Product\_Overview

> **バージョン:** 2025‑05‑30 (draft)
<!-- > **対象ブランチ:** `feature/remove-dashboard` -->
> **責任者:** @nakazawatarou

---

## 1. はじめに

コミットコーチ (Commit Coach) は、ソフトウェア開発プロジェクトの **コミット、タスク、レビュー** を俯瞰し、開発者の生産性と学習効率を高める「AI アシスタント」 プラットフォームです。本ドキュメントでは **`/projects` 画面に機能を統合した 2025 Q3 時点の新アーキテクチャ** を前提に、プロダクトの目的・全体像・スコープ・非機能要件を定義します。

<!-- 元の記述: コミットコーチ (Commit Coach) は、ソフトウェア開発プロジェクトの **コミット、タスク、レビュー** を俯瞰し、開発者の生産性と学習効率を高める「AI アシスタント & ダッシュボード」 プラットフォームです。本ドキュメントでは **Dashboard 機能を撤去し `/projects` 画面に機能を統合した 2025 Q3 時点の新アーキテクチャ** を前提に、プロダクトの目的・全体像・スコープ・非機能要件を定義します。 -->

このドキュメントは、開発チーム・デザイナー・QA・カスタマーサクセス・外部協力者が共通の理解を持つための「最上位仕様」です。詳細実装や API 仕様は別ドキュメント ( `02_ui_component_catalog.md`, `04_api_contract.md` など) を参照してください。

---

## 2. プロダクトビジョン

> **“個人もチームも、コードを軸に学び続けられる開発体験”** を提供する。

* **Learn by Commit:** 過去コミットとレビューコメントを AI が解析し、改善提案・学習コンテンツをレコメンド
* **Flow over Verbose:** UI は "今やるべきタスク" を中心に最短距離で操作完結できる
* **One Screen Rule:** `/projects` ページへ情報を集約し、全機能 3 クリック以内で到達

<!-- 元の記述: * **One Screen Rule:** Dashboard 廃止により `/projects` ページへ情報を集約し、全機能 3 クリック以内で到達 -->
* **Open & Composable:** Supabase・Webhook・GraphQL で外部ツール連携を容易に

---

## 3. 主要ユースケース

| UC‑ID | ユースケース     | 概要                             |
| ----- | ---------- | ------------------------------ |
| UC‑01 | プロジェクト作成   | 新規リポジトリを連携し、初回スキャンを開始          |
| UC‑02 | タスク分解      | コミット差分をタスク・サブタスクへ自動クラスタリング     |
| UC‑03 | AI コードレビュー | Pull Request 作成時、AI が改善コメントを提案 |
| UC‑04 | 進捗トラッキング   | `/projects` でステータス・担当者・期日を一括管理 |
| UC‑05 | レトロスペクティブ  | スプリント終了時にベロシティと改善ポイントを自動生成     |

---

## 4. ペルソナ & JTBD

### ⚙️ 開発者 (Dev Daniel)

* **職種:** フルスタックエンジニア (経験 3 年)
* **JTBD:** 「PR を出すたびに高品質なフィードバックがほしい」
* **主要 KPI:** コードレビュー待ち時間 ↓、自己学習時間 ↑

### 🧭 テックリード (Lead Lisa)

* **JTBD:** 「チーム全体の進捗と品質をリアルタイムで把握したい」
* **主要 KPI:** リードタイム、リグレッションバグ件数

### 🛠️ OSS メンテナ (OSS Oscar)

* **JTBD:** 「貢献者が迷わず Issue に着手できるよう導きたい」

> **採用方針:** v1.2 では Dev Daniel を一次ターゲットに据え、Lead Lisa を補助する機能までをスコープとする。

---

## 5. 機能スコープ (2025 Q3)

| Priority   | 機能                | 説明                                    |
| ---------- | ----------------- | ------------------------------------- |
| **MUST**   | プロジェクト一覧 / 詳細     | CRUD, Tagging, ソート & フィルタ             |
|            | タスク & サブタスク管理     | Nested List UI, Drag\&Drop, Bulk Edit |
|            | GitHub OAuth 連携   | リポジトリ情報 & Webhook 受信                  |
|            | AI レビュー提案         | OpenAI API (gpt‑4o) を使用               |
| **SHOULD** | レトロスペクティブレポート     | スプリントベースで自動生成                         |
|            | Slack 通知          | Project Event → Slack Channel         |
| **COULD**  | VS Code Extension | Inline Suggestions                    |
<!-- | **WON'T**  | ダッシュボード復活         | 当面は削除状態を維持 (再導入時は別ブランチにて検討)           | -->

---

## 6. 非機能要件

| カテゴリ                     | 指標               | 目標値                  |
| ------------------------ | ---------------- | -------------------- |
| **SLO (可用性)**            | API エンドポイント稼働率   | 99.5 % (月次)          |
| **Performance**          | `/projects` 初期表示 | ≤ 1.5 秒 (p95)        |
| **Security**             | OWASP Top‑10     | A 等級 (Zap 報告基準)      |
| **Accessibility**        | WCAG 2.2 AA      | 100 % 達成             |
| **Internationalization** | 多言語化             | i18n 設計済、日本語 UI 完全対応 |

---

## 7. KPI / 成功指標

1. **MAU:** 月次アクティブ開発者数 ≥ 2,500
2. **PR Review Turnaround:** 平均レビュー時間 ≤ 4 時間
3. **Adoption Rate:** プロジェクト作成から初回 AI レビュー実行までの完了率 ≥ 60 %
4. **Churn:** 30 日以内離脱率 ≤ 15 %

---

## 8. ステークホルダー

| 役割            | 氏名/部門 | 責務                    |
| ------------- | ----- | --------------------- |
| Product Owner | 中澤 太郎 | プロダクトビジョン策定、優先度決定     |
| Tech Lead     | 田辺 智也 | 技術選定・アーキテクチャレビュー      |
| UX Designer   | 鈴木 沙織 | 画面設計・ユーザビリティテスト       |
| QA Engineer   | 佐藤 悟  | 受け入れ基準定義・自動テスト整備      |
| DevRel        | 山本 美咲 | OSS コミュニティ運営・ドキュメント管理 |

---

## 9. 制約・前提条件

* **OSS ライセンス互換性:** MIT もしくは Apache‑2.0 ライブラリのみ採用
* **OpenAI 利用上限:** 月間 80 k トークン / プロジェクト (2025 Q3 契約)
* **ブラウザサポート:** Chrome 109+, Firefox 102+, Safari 16+
* **Self‑Hosted 非対応:** 現行フェーズでは SaaS 提供のみ

---

## 10. 今後のロードマップ (抜粋)

| 四半期     | 目標テーマ       | 主要機能                 | 指標                      |
| ------- | ----------- | -------------------- | ----------------------- |
| 2025 Q4 | コラボレーション強化  | リアルタイム共同編集, コメントスレッド | Session Length ↑        |
| 2026 Q1 | ML 効果測定     | AB テスト基盤 & モデル候補自動評価 | MRR ↑, Review Quality ↑ |
| 2026 Q2 | Marketplace | プラグイン SDK & ストア公開    | プラグイン数                  |

---

## 11. 参考資料

* **Pitch Deck v3 (2025‑04):** `/docs/pitch_deck/`
* **ユーザーインタビュー録画:** Notion → Folder "/User Research 2025 Q2"
* **OpenAI Best Practices:** [https://platform.openai.com/docs/best-practices](https://platform.openai.com/docs/best-practices)

---

<!-- End of File -->
