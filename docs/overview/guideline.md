# AI駆動開発ガイドライン

## 1. はじめに

### 1.1 AI駆動型開発とは
- [ ] 従来のエディターでのコーディング + AI（提案、自動テスト、要件定義補助）
- [ ] 目的：開発速度と品質の向上

#### 特徴
- [ ] プロジェクト初期段階での要件定義とUI設計の重視
- [ ] ディレクトリ構造の明確化
- [ ] 設計変更リスクの低減
- [ ] Waterfall型開発の課題（要件変更困難など）をAIでカバー
- [ ] 柔軟に修正可能な新しいワークフローの構築

### 1.2 Cursorとは
- [ ] AIモデルとの連携をスムーズにするエディター

#### 機能
- [ ] ソースコード編集（VSCodeと同様）
- [ ] AI連携機能（自然言語での指示に基づくコード生成、リファクタリング、ドキュメント生成など）

#### Composer機能
- [ ] プロンプト管理、複数ステップ連携
- [ ] 要件定義・設計方針とコード生成の紐付け
- [ ] ソフトウェア開発フローの一貫性
- [ ] コード部分生成、要件変更時の差分生成を容易化
- [ ] 効果：要件とコードを行き来するワークフローを構築

### 1.3 従来のWaterfall型にAIエージェントをどう組み込むか

#### Waterfall型開発プロセス
- [ ] 要件定義
- [ ] 基本設計
- [ ] 詳細設計
- [ ] 実装
- [ ] テスト
- [ ] 運用

#### 課題と解決策
- [ ] 課題：要件変更時の負荷増大
- [ ] 解決策：AIエージェントによる部分的な担当

#### AIエージェントの役割
##### PMエージェント（PM）
- [ ] 進捗管理、リソース配分提案
- [ ] タスク優先度付け、要件変更管理サポート

##### 開発担当AIエージェント（Dev）
- [ ] Claude 3.5 sonnet（コード特化型モデル）活用
- [ ] 要件・設計ドキュメント参照、コード生成
- [ ] 生成コードをソースリポジトリ（Code）に反映

##### テスト担当AIエージェント（Test）
- [ ] 単体/結合テストケース自動生成、テスト実行、結果レポート
- [ ] テストコード変更・再生成、リグレッションテスト対応

## 2. CursorのComposer機能によるAI駆動型開発

### 2.1 Composer機能の概要
- [ ] プロンプト（指示）を保存・管理、複数ステップ連携

#### 利用手順例
1. プロンプト作成：要件・目的を記述
2. 要件定義連携：要件定義書の機能・仕様をプロンプトに反映
3. ステップ化：
   - ステップA：ディレクトリ構造雛形生成
   - ステップB：UIコンポーネント生成
   - ステップC：ビジネスロジックコード生成
   - ステップD：テストコード生成
4. 実行と確認：各ステップ順に実行、コード確認・修正・統合

#### 効果
- [ ] 要求仕様ごとのプロンプト体系的管理
- [ ] 要件・設計見直し反映の容易化

### 2.2 基本要件書と詳細要件書の作り方

#### 基本要件書に含めるべき項目
- [ ] プロジェクトの目的と背景
- [ ] 実現したい機能と優先度（大枠）
- [ ] ユーザー数、負荷要件、サービス制約（大枠）
- [ ] 使用UIフレームワーク、DB、インフラなど

#### 詳細要件書に含めるべき項目
- [ ] 機能一覧と具体的な振る舞い
- [ ] 画面遷移図、ワイヤーフレーム、UIデザインレイアウト案
- [ ] エンドポイント仕様、DBスキーマなど技術的詳細
- [ ] 例外処理、エラーメッセージ、バリデーション要件

## 3. cursorrules活用ガイド

### 3.1 cursorrulesの基本
- [ ] Cursor上で設定する「AIに守らせたいルール」記述ファイル群
- [ ] JSON、設定ファイル形式

#### ルール例
```json
{
  "fileNameRules": [
    {
      "pattern": "src/components/*",
      "namingConvention": "PascalCase"
    },
    {
      "pattern": "src/hooks/*",
      "namingConvention": "camelCase"
    }
  ],
  "directoryRules": [
    {
      "path": "src/components",
      "allow": ["tsx", "jsx"],
      "deny": ["js"]
    }
  ]
}
```

### 3.2 実践的な使用方法
- [ ] バリデーション：フォーム部品バリデーションルールの記述
- [ ] コメント規約：JSDoc形式コメント記載規定
- [ ] UIデザインガイド：Tailwind CSS、Chakra UIなどのクラス名規則

### 3.3 推奨ディレクトリ構成
```
ai-driven-todo/
├─ .github/
│   └─ workflows/
│       └─ ci-test.yml            # CI用ワークフロー
├─ docs/
│   ├─ basic-requirements.md      # 基本要件書
│   ├─ detailed-requirements.md   # 詳細要件書
│   ├─ design.cursorrules        # UI/ディレクトリ構成規則
│   └─ architecture.md           # システム構成図
├─ frontend/
│   └─ src/
├─ backend/
│   └─ src/
├─ cursorrules/
│   └─ main-rules.json
└─ tests/
```

## 4. 運用とベストプラクティス

### 4.1 運用時の注意点
- [ ] AIモデルのバージョン管理
- [ ] コスト管理（API利用料金、呼出し回数）
- [ ] セキュリティ（APIキー、機密情報の扱い）

### 4.2 改修ループの回し方
1. バグ報告、機能要望の受付
2. 詳細要件書に修正点を記入
3. Composerで該当モジュールのみ再生成
4. テスト担当AIがリグレッションテスト実行
5. 影響範囲が大きい場合はPMエージェントがリソース配分を提案

### 4.3 今後の展望
- [ ] 大規模プロジェクトへの展開
- [ ] ドキュメント自動生成の進化
- [ ] チーム学習効率の向上

## 5. まとめ

### 5.1 メリット
- [ ] コード生成、テストの高速化
- [ ] 要件変更への柔軟な対応
- [ ] cursorrulesによる一貫性維持

### 5.2 デメリット
- [ ] AI出力への依存（人間レビューは必須）
- [ ] AI導入コスト
- [ ] 要件定義の自動化限界

### 5.3 推奨される学習リソース
- [ ] Cursor公式ドキュメント
- [ ] Composerチュートリアル
- [ ] cursorrulesサンプル集
- [ ] コミュニティフォーラム