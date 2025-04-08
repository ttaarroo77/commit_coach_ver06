# Git コマンド実行手順

| 順番 | コマンド | 説明 |
|------|----------|------|
| 1 | `git status` | 変更ファイルの確認 |
| 2 | `git add docs/design_system.md` | デザインシステムの追加 |
| 3 | `git add app/assets/stylesheets/application.bootstrap.scss` | スタイル変更の追加 |
| 4 | `git add app/views/layouts/application.html.erb` | レイアウト変更の追加 |
| 5 | `git add app/views/layouts/_navbar.html.erb` | ナビバー変更の追加 |
| 6 | `git add app/views/devise/passwords/*` | パスワード関連ビューの追加 |
| 7 | `git commit -m "デザインシステムの統一とUIの改善"` | 変更のコミット |
| 8 | `git push origin main` | リモートリポジトリへの反映 |

## コミットメッセージの詳細
```
デザインシステムの統一とUIの改善

- デザインシステムドキュメントの作成
- ナビバーの固定位置問題を解決
- 背景色を#f8f9faに統一
- ボタンホバー効果の追加
- スクロール動作の改善 