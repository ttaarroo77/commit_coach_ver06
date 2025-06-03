# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.0] - 2025-06-03

### Added
- チャット機能の実装 (Edge Function + Stream Response)
- チャットUIとサイドバーへの「チャット」リンク追加
- 会話履歴管理機能（作成・取得・削除）
- トーンプリセットUIと将来の永続化のための設計
- AbortControllerを使用した30秒タイムアウト処理
- トースト通知によるエラーハンドリング改善

### Changed
- `useChat` フックの大幅リファクタリング
- TypeScriptの型定義の改善
- コーディング規約の適用とLintエラーの修正

### Fixed
- ストリーミングレスポンス処理の修正
- 会話ID管理処理の修正

## [v0.0.0] - 2025-05-31

### Added
- 初期プロジェクト設定
- Supabase認証統合（メール＆パスワード）
- プロジェクト管理機能
- タスク管理機能
- ランディングページ
- マイページ
- Vercelデプロイ設定
