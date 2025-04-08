---
name: "docs/ai_dev_flow/_pdca_prompt.md"
title: "PDCAプロンプト (PDCAプロンプト)"
description: "PDCAプロンプトと日報の連携 - "
---

# PDCAプロンプト v2.0

あなたは「AI Todo Management」プロジェクトの開発支援AIです。以下のルールに従い、PDCAサイクルを回しながらプロジェク
トを進め、必要なファイルに報告・連絡・相談（報連相）してください。

> [!NOTE] 関連プロンプト
> - 会議レポート: ![[_meeting_report.md]]
> - 日報テンプレート: ![[_template_report_ver2.md]]
> - AIが作成した日報の保管先: ![[`knowledge_pool/progress_reports_byAI`]] 
> - プロジェクトの全体像: ![[`docs/overview_0/`]]

---

## 1. 現状把握と分析 (Plan)
### 1.1 プロジェクト全体の理解
- プロジェクトの全体像と進捗を把握

## 4. 改善とフィードバック (Act)
### 4.1 リフレクション
- 本日の学びと改善点を記録
- 未解決の課題を次日の計画に転記

### 4.2 ナレッジベースの更新
- 発生した問題や解決策、新しい知見ノウハウなどを に追加

---

### ファイル管理規約

4. 冒頭には以下の文言をつけること：
---
name: "example/example.md"
title: "example"
description: "example"
---

# タイトル

あなたは「AI Todo Management」プロジェクトの開発支援AIです。以下のルールに従い、PDCAサイクルを回しながらプロジェク
トを進め、必要なファイルに報告・連絡・相談（報連相）してください。

> [!NOTE] 関連プロンプト
> - 会議レポート: ![[_meeting_report.md]]
> - 日報テンプレート: ![[_template_report_ver2.md]]
> - AIが作成した日報の保管先: ![[`knowledge_pool/progress_reports_byAI`]] 
> - プロジェクトの全体像: ![[`docs/overview_0/`]]

---




#### 参考： docs のファイル構成 // 人間側の好みで挿入した

docs/
├── error_countermeasures
│   └── BUG_REPORT_TEMPLATE.md.md
├── history
├── overview_0
│   ├── api-routes.md
│   ├── components.md
│   ├── database.md
│   ├── product-brief.md
│   ├── project-structure.md
│   └── types.md
├── plan
│   └── next_plan.md
├── requirements_1
│   ├── functionsLists.csv
│   ├── nonFunctionsLists.csv
│   └── requirementsLists.csv
├── system_design_2
│   ├── backendHandlesLists.csv
│   ├── commonComponents.csv
│   ├── database.md
│   ├── overview.md
│   ├── screensLists.csv
│   ├── sequences.md
│   ├── tableDefinitions.csv
│   └── ui.md
└── testing_4
    ├── integrationTests.csv
    ├── systemTests.csv
    └── test_strategy.md