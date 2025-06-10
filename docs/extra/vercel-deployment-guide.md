# Commit Coach Vercelデプロイガイド

このドキュメントでは、Commit Coachアプリケーションを[Vercel](https://vercel.com/)にデプロイする手順を説明します。

## 必要条件

- Vercelアカウント
- GitHubリポジトリへのアクセス権限
- Supabaseプロジェクト

## デプロイ手順

### 1. Vercelプロジェクトの作成

1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. リポジトリを選択（GitHubアクセスを許可する必要があります）
4. 「Import」をクリック

### 2. プロジェクト設定

フレームワークプリセットが自動的に検出されるはずですが、以下の設定を確認してください：

- **Framework Preset**: Next.js
- **Root Directory**: ./
- **Build Command**: `cd apps/frontend && pnpm build`（自動設定されるはず）
- **Output Directory**: `apps/frontend/.next`（自動設定されるはず）
- **Install Command**: `pnpm install`（自動設定されるはず）

### 3. 環境変数の設定

以下の環境変数をVercelプロジェクトの「Environment Variables」セクションに追加します：

#### 必須環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### オプション環境変数（必要に応じて）

```
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_APP_URL=https://your-vercel-project-url.vercel.app
NEXT_PUBLIC_DEMO_MODE=true  # デモモードを有効にする場合
```

### 4. デプロイ実行

全ての設定が完了したら、「Deploy」ボタンをクリックしてデプロイを開始します。

### 5. カスタムドメイン設定（オプション）

独自ドメインを使用する場合：

1. Vercelプロジェクトダッシュボードから「Settings」→「Domains」を選択
2. 使用したいドメインを追加し、DNSの設定手順に従って設定

## デプロイ後のチェックリスト

- [ ] アプリケーションが正常に動作するか確認
- [ ] Supabaseへの接続が正常か確認
- [ ] 認証フローが機能しているか確認
- [ ] デモモードが有効な場合、デモ機能が動作するか確認

## トラブルシューティング

### ビルドエラー

1. Vercelログを確認して具体的なエラーの詳細を把握
2. `pnpm`関連のエラーの場合、Vercelの設定でNode.jsとpnpmのバージョンが適切か確認
3. 環境変数が正しく設定されているか確認

### ランタイムエラー

1. ブラウザの開発者ツールでコンソールエラーを確認
2. Supabase接続情報が正しいか再確認
3. APIエンドポイントが正しく設定されているか確認

## デプロイの自動化

プロジェクトの`.github/workflows/ci.yml`が既に設定されており、mainブランチへのマージでテストと基本的なビルドが自動的に実行されます。Vercelへの自動デプロイは、GitHubリポジトリを連携することで既に設定されています。

CIパイプラインの詳細については、プロジェクトルートの`.github/workflows/ci.yml`ファイルを確認してください。
