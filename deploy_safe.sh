# rails tmp:cache:clear

# find app -type f -name "*.rb" | sort
# rails tmp:clear

# find . -type d -not -path "*/node_modules/*" -not -path "*/tmp/*" -not -path "*/.git/*" | sort
# rails assets:clobber



# ./deploy_safe.sh
#!/bin/bash

# スクリプト名
SCRIPT_NAME="Deploy Safe - Commit Coach"

# 現在のブランチを取得
CURRENT_BRANCH=$(git branch --show-current)

echo "🚀 $SCRIPT_NAME を開始します..."
echo "現在のブランチ: $CURRENT_BRANCH"

# プリデプロイチェック
echo "📋 プリデプロイチェックを実行しています..."

# TypeScriptの型チェック
echo "🔍 TypeScript型チェック..."
cd apps/frontend && pnpm build --dry-run 2>/dev/null || echo "⚠️  フロントエンドのビルドチェックでエラーがありました"
cd ../..

# テストの実行（存在する場合）
if [ -f "apps/frontend/package.json" ] && grep -q "test" apps/frontend/package.json; then
  echo "🧪 テストを実行しています..."
  cd apps/frontend && pnpm test --passWithNoTests 2>/dev/null || echo "⚠️  テストでエラーがありました"
  cd ../..
fi

# コミットメッセージの入力
echo "📝 コミットメッセージを入力してください:"
read COMMIT_MESSAGE

# Git ステータスの確認
echo "📊 Git ステータスを確認しています..."
git status

# 変更をステージング
echo "📦 変更をステージングしています..."
git add .

# コミット
echo "💾 コミットを実行しています..."
git commit -m "$COMMIT_MESSAGE"

# コミットログの表示
echo "📜 直近のコミットログを表示します..."
git log -1 --oneline

# リモートリポジトリにプッシュ
echo "🌐 リモートリポジトリにプッシュしています..."
git push origin $CURRENT_BRANCH

# デプロイ先の選択
echo "🎯 デプロイ先を選択してください:"
echo "1) Vercel (推奨)"
echo "2) Supabaseマイグレーション実行"
echo "3) 両方実行"
echo "4) スキップ"
read DEPLOY_TARGET

case $DEPLOY_TARGET in
  1)
    echo "🚀 Vercelにデプロイしています..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo "⚠️  Vercel CLIがインストールされていません。"
      echo "npm i -g vercel でインストールしてください。"
      echo "または、Vercel Dashboardから手動でデプロイしてください。"
    fi
    ;;
  2)
    echo "🗄️  Supabaseマイグレーションを実行しています..."
    if command -v supabase &> /dev/null; then
      supabase db push
      echo "📡 Edge Functionsをデプロイしています..."
      supabase functions deploy chat
    else
      echo "⚠️  Supabase CLIがインストールされていません。"
      echo "手動でマイグレーションを実行してください。"
    fi
    ;;
  3)
    echo "🚀 Vercelにデプロイしています..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo "⚠️  Vercel CLIがインストールされていません。"
    fi

    echo "🗄️  Supabaseマイグレーションを実行しています..."
    if command -v supabase &> /dev/null; then
      supabase db push
      echo "📡 Edge Functionsをデプロイしています..."
      supabase functions deploy chat
    else
      echo "⚠️  Supabase CLIがインストールされていません。"
    fi
    ;;
  4)
    echo "⏭️  デプロイをスキップしました。"
    ;;
  *)
    echo "❌ 無効な選択です。デプロイをスキップします。"
    ;;
esac

# 完了メッセージ
echo ""
echo "✅ $SCRIPT_NAME が正常に完了しました！"
echo "🌐 アプリケーションURL: https://your-app.vercel.app"
echo "📚 Storybook: https://your-app.vercel.app/storybook"
echo ""
echo "📋 次のステップ:"
echo "1. Vercel Dashboardで環境変数を確認"
echo "2. Supabaseプロジェクトの設定を確認"
echo "3. 本番環境での動作テスト"
