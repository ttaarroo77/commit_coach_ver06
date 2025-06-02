# wintsurfとの最後の会話

これがどの程度実装されてるのか調査して。実装されてないのは実装して。
@scratchpad_ver0 copy.md

Revert
まず、指定されたファイルの内容を確認して、実装状況を調査します。

Analyzed
scratchpad_ver0 copy.md:(1-200)
指定されたファイル「scratchpad_ver0 copy.md」の内容を確認しました。これは実装チェックリストとなっており、現在の実装状況を把握するために、プロジェクトの構造と実装状況を調査します。

まず、プロジェクトのディレクトリ構造を確認します。

Analyzed
~/Documents/tarou/project/【safe】commit_coach_ver.14
モノレポ構造のプロジェクトのようですので、フロントエンドのコードを確認します。メモリから、apps/frontendディレクトリに主要なコードがあることがわかります。

Analyzed
apps/frontend
チェックリストに基づいて、実装状況を確認していきます。まず、未実装の部分を特定するために、ランディングページとマイページの実装状況を確認します。

Analyzed
apps/frontend/app
ランディングページとマイページの実装状況を確認します。まず、ランディングページを確認しましょう。

Analyzed

page.tsx
次に、マイページの実装状況を確認します。

Analyzed
apps/frontend/app/mypage
Analyzed

page.tsx
次に、404ページとエラーバウンダリーの実装状況を確認します。

Analyzed

not-found.tsx
Analyzed

error.tsx
Storybookの設定を確認して、実装状況を調査します。

Analyzed
apps/frontend/.storybook
ここまでの調査結果から、チェックリストに基づいて実装状況を整理します。

実装状況の調査結果
実装済み項目
Magic-Link 認証 (FR-1) - 完全実装済み
チャット Edge Function & API (FR-2) - 完全実装済み
トーンプリセット (FR-3) - 完全実装済み
UI / Pages
Chat - 実装済み
404 page - 実装済み
Error Boundary - 実装済み
Landing page - 実装済み（Hero + CTAあり）
MyPage - 実装済み（ガード付きレイアウト、直近チャット表示）
未実装または確認が必要な項目
初期クリーンアップ
git rm -r --cached で不要ファイル履歴を削除 - 未実装
Storybook & Dev-XP
.storybook/ config 修正 & pnpm storybook 起動確認 - 確認が必要
主要 UI: Button, MessageCard, ToneSelector stories 追加 - 確認が必要
Lighthouse & Perf
Landing で Perf ≥ 60（画像圧縮・priority 属性）- 確認が必要
Accessibility ≥ 90（aria-label, focus ring）- 確認が必要
Vercel デプロイ (FR-6) - 確認が必要
まず、未実装の初期クリーンアップから実装していきましょう。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git rm -r --cached

fatal: No pathspec was given. Which files should I remove?
Exit Code 128

Not auto-run
git rm -r --cachedコマンドを実行する際には、削除対象のファイルやディレクトリを指定する必要があります。不要なファイルを特定して削除しましょう。まず、.gitignoreに含まれているが、すでにGitに追跡されているファイルを確認します。

Analyzed
.gitignore:(1-200)
不要なファイルを削除するために、Gitの追跡対象になっているが.gitignoreに含まれているファイルを確認し、それらを削除します。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git ls-files --ignored --exclude-standard

fatal: ls-files -i must be used with either -o or -c
Exit Code 128

Not auto-run
コマンドを修正して再実行します。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git ls-files -o --ignored --exclude-standard

<truncated 92327 lines>
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/shallow.d.mts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/shallow.mjs
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/traditional.d.mts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/traditional.mjs
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/vanilla.d.mts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/vanilla.mjs
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/vanilla/shallow.d.mts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/esm/vanilla/shallow.mjs
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/index.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/index.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/combine.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/devtools.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/immer.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/immer.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/persist.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/redux.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/middleware/subscribeWithSelector.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/package.json
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/react.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/react.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/react/shallow.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/react/shallow.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/shallow.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/shallow.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/traditional.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/traditional.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/ts_version_4.5_and_above_is_required.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/vanilla.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/vanilla.js
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/vanilla/shallow.d.ts
node_modules/.pnpm/zustand@5.0.5_@types+react@19.1.6_react@19.1.0/node_modules/zustand/vanilla/shallow.js
node_modules/.pnpm/zwitch@2.0.4/node_modules/zwitch/index.d.ts
node_modules/.pnpm/zwitch@2.0.4/node_modules/zwitch/index.js
node_modules/.pnpm/zwitch@2.0.4/node_modules/zwitch/license
node_modules/.pnpm/zwitch@2.0.4/node_modules/zwitch/package.json
node_modules/.pnpm/zwitch@2.0.4/node_modules/zwitch/readme.md
node_modules/@dnd-kit/core
node_modules/@dnd-kit/sortable
node_modules/@dnd-kit/utilities
node_modules/@eslint-community/eslint-utils
node_modules/@eslint-community/regexpp
node_modules/@eslint/eslintrc
node_modules/@eslint/js
node_modules/@hookform/resolvers
node_modules/@next/eslint-plugin-next
node_modules/@radix-ui/react-accordion
node_modules/@radix-ui/react-alert-dialog
node_modules/@radix-ui/react-aspect-ratio
node_modules/@radix-ui/react-avatar
node_modules/@radix-ui/react-checkbox
node_modules/@radix-ui/react-collapsible
node_modules/@radix-ui/react-context-menu
node_modules/@radix-ui/react-dialog
node_modules/@radix-ui/react-dropdown-menu
node_modules/@radix-ui/react-hover-card
node_modules/@radix-ui/react-label
node_modules/@radix-ui/react-menubar
node_modules/@radix-ui/react-navigation-menu
node_modules/@radix-ui/react-popover
node_modules/@radix-ui/react-progress
node_modules/@radix-ui/react-radio-group
node_modules/@radix-ui/react-scroll-area
node_modules/@radix-ui/react-select
node_modules/@radix-ui/react-separator
node_modules/@radix-ui/react-slider
node_modules/@radix-ui/react-slot
node_modules/@radix-ui/react-switch
node_modules/@radix-ui/react-tabs
node_modules/@radix-ui/react-toast
node_modules/@radix-ui/react-toggle
node_modules/@radix-ui/react-toggle-group
node_modules/@radix-ui/react-tooltip
node_modules/@rushstack/eslint-patch
node_modules/@storybook/addon-docs
node_modules/@storybook/addon-onboarding
node_modules/@storybook/nextjs
node_modules/@supabase/supabase-js
node_modules/@types/eslint
node_modules/@types/eslint-scope
node_modules/@types/node
node_modules/@types/react
node_modules/@types/react-dom
node_modules/@typescript-eslint/eslint-plugin
node_modules/@typescript-eslint/parser
node_modules/@typescript-eslint/scope-manager
node_modules/@typescript-eslint/type-utils
node_modules/@typescript-eslint/types
node_modules/@typescript-eslint/typescript-estree
node_modules/@typescript-eslint/utils
node_modules/@typescript-eslint/visitor-keys
node_modules/autoprefixer
node_modules/class-variance-authority
node_modules/clsx
node_modules/cmdk
node_modules/date-fns
node_modules/embla-carousel-react
node_modules/eslint
node_modules/eslint-config-next
node_modules/eslint-config-prettier
node_modules/eslint-import-resolver-node
node_modules/eslint-import-resolver-typescript
node_modules/eslint-module-utils
node_modules/eslint-plugin-import
node_modules/eslint-plugin-jsx-a11y
node_modules/eslint-plugin-prettier
node_modules/eslint-plugin-react
node_modules/eslint-plugin-react-hooks
node_modules/eslint-scope
node_modules/eslint-visitor-keys
node_modules/input-otp
node_modules/js-cookie
node_modules/lucide-react
node_modules/next
node_modules/next-themes
node_modules/postcss
node_modules/prettier
node_modules/prettier-linter-helpers
node_modules/react
node_modules/react-beautiful-dnd
node_modules/react-day-picker
node_modules/react-dom
node_modules/react-hook-form
node_modules/react-resizable-panels
node_modules/recharts
node_modules/sonner
node_modules/storybook
node_modules/tailwind-merge
node_modules/tailwindcss
node_modules/tailwindcss-animate
node_modules/typescript
node_modules/vaul
node_modules/zod
node_modules/zustand
packages/domain/node_modules/.bin/tsc
packages/domain/node_modules/.bin/tsserver
packages/domain/node_modules/typescript
packages/domain/node_modules/zod
packages/shared-types/.turbo/turbo-build.log
packages/shared-types/.turbo/turbo-lint.log
packages/shared-types/dist/index.js
packages/shared-types/node_modules/.bin/acorn
packages/shared-types/node_modules/.bin/esbuild
packages/shared-types/node_modules/.bin/eslint
packages/shared-types/node_modules/.bin/jiti
packages/shared-types/node_modules/.bin/tsc
packages/shared-types/node_modules/.bin/tsserver
packages/shared-types/node_modules/.bin/tsup
packages/shared-types/node_modules/.bin/tsup-node
packages/shared-types/node_modules/.bin/yaml
packages/shared-types/node_modules/@typescript-eslint/eslint-plugin
packages/shared-types/node_modules/@typescript-eslint/parser
packages/shared-types/node_modules/eslint
packages/shared-types/node_modules/tsup
packages/shared-types/node_modules/typescript
packages/shared-types/node_modules/zod
supabase/.temp/cli-latest
supabase/.temp/gotrue-version
supabase/.temp/pooler-url
supabase/.temp/postgres-version
supabase/.temp/project-ref
supabase/.temp/rest-version
supabase/.temp/storage-version
Exit Code 0

Not auto-run
出力結果から、多くの無視すべきファイル（主にnode_modulesや.next、.turboなど）がGitに追跡されていることがわかります。これらを削除するために、以下のコマンドを実行します。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git rm -r --cached .next .turbo .vercel node_modules dist coverage logs

fatal: pathspec '.next' did not match any files
Exit Code 128

Not auto-run
特定のファイルが見つからないようです。ルートディレクトリではなく、サブディレクトリにある可能性があります。apps/frontendディレクトリで実行してみましょう。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git rm -r --cached apps/frontend/.next apps/frontend/.turbo apps/frontend/.vercel apps/frontend/node_modules

fatal: pathspec 'apps/frontend/.next' did not match any files
Exit Code 128

Not auto-run
これらのファイルがGitに追跡されていないようです。ただし、チェックリストの「初期クリーンアップ」タスクを完了するために、念のため全体的なクリーンアップを行いましょう。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ git clean -n -d

Would remove apps/frontend/components/ui/collapsible.tsx
Would remove docs/refactoring/scratchpad_ver copy.md
Exit Code 0

Not auto-run
次に、Storybookの設定を確認し、必要なUIコンポーネントのストーリーが追加されているか確認します。

Analyzed
apps/frontend/stories
ここまでの調査から、実装状況と未実装の項目が明確になりました。チェックリストに基づいて、未実装の項目を実装していきましょう。

実装状況のまとめ
実装済み項目
Magic-Link 認証 (FR-1) - 完全実装済み
チャット Edge Function & API (FR-2) - 完全実装済み
トーンプリセット (FR-3) - 完全実装済み
UI / Pages
Chat - 実装済み
404 page - 実装済み
Error Boundary - 実装済み
Landing page - 実装済み（Hero + CTAあり）
MyPage - 実装済み（ガード付きレイアウト、直近チャット表示）
未実装または改善が必要な項目
Storybook & Dev-XP
主要 UI: MessageCard, ToneSelector stories の追加が必要
Lighthouse & Perf
Landing で Perf ≥ 60（画像圧縮・priority 属性）の確認
Accessibility ≥ 90（aria-label, focus ring）の確認
まず、Storybookに必要なストーリーを追加します。MessageCardとToneSelectorのストーリーを作成しましょう。

Searched filesystem
0 results
Searchedinapps/frontend/componentswith pattern*MessageCard*
Searched filesystem
3 results
Searchedinapps/frontend/components/chatwith pattern*
Feedback submitted
Me

Continue

Revert
調査を続けます。chat-message.tsxとtone-selector.tsxのコンポーネントを確認して、Storybook用のストーリーを作成しましょう。

Analyzed

chat-message.tsx
Analyzed

tone-selector.tsx
これからChatMessageとToneSelectorコンポーネント用のStorybookストーリーを作成します。まず、Storybookの構成を確認しましょう。

Analyzed
main.ts:(1-200)
ここからは、未実装のコンポーネントのStorybookストーリーを作成します。ChatMessageとToneSelectorコンポーネント用のストーリーを作成しましょう。

まず、ChatMessageコンポーネントのストーリーを作成します。

Created
ChatMessage.stories.tsx
+51
-0
 0
Open diff

次に、ToneSelectorコンポーネントのストーリーを作成します。

Created
ToneSelector.stories.tsx
+72
-0
 0
Open diff
ここまででChatMessageとToneSelectorコンポーネントのStorybookストーリーを作成しました。次に、Storybookが正常に起動するか確認しましょう。

Running background terminal command
~/…/【safe】commit_coach_ver.14 $ cd apps/frontend && pnpm storybook


> commit-coach-frontend@0.1.0 storybook /Users/nakazawatarou/Documents/tarou/project/【safe】commit_coach_ver.14/apps/frontend
> storybook dev -p 6006

storybook v9.0.1


attention => Storybook now collects completely anonymous telemetry regarding usage.
This information is used to shape Storybook's roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://storybook.js.org/telemetry

info => Starting manager..
info => Starting preview..
info Addon-docs: using MDX3
info => Using implicit CSS loaders
info => Using SWC as compiler
info => Using default Webpack5 setup
<i> [webpack-dev-middleware] wait until bundle finished
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 3% setup watch run VirtualModulesPlugin
<s> [webpack.Progress] 3% setup watch run webpack-dev-middleware
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 4% setup normal module factory CaseSensitivePathsPlugin
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 8% setup compilation HtmlWebpackPlugin
<s> [webpack.Progress] 8% setup compilation unplugin-csf
<s> [webpack.Progress] 8% setup compilation ArrayPushCallbackChunkFormatPlugin
<s> [webpack.Progress] 8% setup compilation JsonpChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation StartupChunkDependenciesPlugin
<s> [webpack.Progress] 8% setup compilation ImportScriptsChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation WorkerPlugin
<s> [webpack.Progress] 8% setup compilation SplitChunksPlugin
<s> [webpack.Progress] 8% setup compilation RuntimeChunkPlugin
<s> [webpack.Progress] 8% setup compilation ResolverCachePlugin
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation HotModuleReplacementPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ReactRefreshPlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ChunkPrefetchPreloadPlugin
<s> [webpack.Progress] 9% setup compilation ModuleInfoHeaderPlugin
<s> [webpack.Progress] 9% setup compilation SourceMapDevToolPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptModulesPlugin
<s> [webpack.Progress] 9% setup compilation JsonModulesPlugin
<s> [webpack.Progress] 9% setup compilation AssetModulesPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation RuntimePlugin
<s> [webpack.Progress] 9% setup compilation InferAsyncModulesPlugin
<s> [webpack.Progress] 9% setup compilation DataUriPlugin
<s> [webpack.Progress] 9% setup compilation FileUriPlugin
<s> [webpack.Progress] 9% setup compilation CompatibilityPlugin
<s> [webpack.Progress] 9% setup compilation HarmonyModulesPlugin
<s> [webpack.Progress] 9% setup compilation AMDPlugin
<s> [webpack.Progress] 9% setup compilation RequireJsStuffPlugin
<s> [webpack.Progress] 9% setup compilation CommonJsPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation NodeStuffPlugin
<s> [webpack.Progress] 9% setup compilation APIPlugin
<s> [webpack.Progress] 9% setup compilation ExportsInfoApiPlugin
<s> [webpack.Progress] 9% setup compilation WebpackIsIncludedPlugin
<s> [webpack.Progress] 9% setup compilation ConstPlugin
<s> [webpack.Progress] 9% setup compilation UseStrictPlugin
<s> [webpack.Progress] 9% setup compilation RequireIncludePlugin
<s> [webpack.Progress] 9% setup compilation RequireEnsurePlugin
<s> [webpack.Progress] 9% setup compilation RequireContextPlugin
<s> [webpack.Progress] 9% setup compilation ImportPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaContextPlugin
<s> [webpack.Progress] 9% setup compilation SystemPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaPlugin
<s> [webpack.Progress] 9% setup compilation URLPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsFactoryPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPresetPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPrinterPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptMetaInfoPlugin
<s> [webpack.Progress] 9% setup compilation EnsureChunkConditionsPlugin
<s> [webpack.Progress] 9% setup compilation RemoveEmptyChunksPlugin
<s> [webpack.Progress] 9% setup compilation MergeDuplicateChunksPlugin
<s> [webpack.Progress] 9% setup compilation SideEffectsFlagPlugin
<s> [webpack.Progress] 9% setup compilation FlagDependencyExportsPlugin
<s> [webpack.Progress] 9% setup compilation NamedModuleIdsPlugin
<s> [webpack.Progress] 9% setup compilation NamedChunkIdsPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation TemplatedPathPlugin
<s> [webpack.Progress] 9% setup compilation RecordIdsPlugin
<s> [webpack.Progress] 9% setup compilation WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 9% setup compilation IgnoreWarningsPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 10% building
<s> [webpack.Progress] 10% building 0/1 entries 0/0 dependencies 0/0 modules
info Using tsconfig paths for react-docgen
<s> [webpack.Progress] 10% building 0/3 entries 4/11 dependencies 0/3 modules
<s> [webpack.Progress] 10% building 0/3 entries 89/100 dependencies 8/59 modules
<s> [webpack.Progress] 11% building 0/3 entries 187/272 dependencies 29/91 modules
<s> [webpack.Progress] 13% building 0/3 entries 422/500 dependencies 69/164 modules
<s> [webpack.Progress] 15% building 0/3 entries 500/556 dependencies 91/191 modules
<s> [webpack.Progress] 16% building 0/3 entries 694/2267 dependencies 110/300 modules
<s> [webpack.Progress] 14% building 0/3 entries 3200/3980 dependencies 146/1908 modules
<s> [webpack.Progress] 17% building 0/3 entries 5700/5744 dependencies 282/1996 modules
<s> [webpack.Progress] 51% building 0/3 entries 6900/6965 dependencies 1922/2545 modules
<s> [webpack.Progress] 60% building 1/3 entries 7425/7437 dependencies 2366/2562 modules
<s> [webpack.Progress] 63% building 2/3 entries 7506/7544 dependencies 2471/2562 modules
<s> [webpack.Progress] 65% building 3/3 entries 8106/8106 dependencies 2809/2809 modules
<s> [webpack.Progress] 65% building
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing finish module graph ResolverCachePlugin
<s> [webpack.Progress] 70% sealing finish module graph InferAsyncModulesPlugin
<s> [webpack.Progress] 70% sealing finish module graph FlagDependencyExportsPlugin
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 70% sealing plugins WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing dependencies optimization SideEffectsFlagPlugin
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 75% sealing chunk optimization EnsureChunkConditionsPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization MergeDuplicateChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization SplitChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 79% sealing module reviving RecordIdsPlugin
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 80% sealing module ids NamedModuleIdsPlugin
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 82% sealing chunk reviving RecordIdsPlugin
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk ids NamedChunkIdsPlugin
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record modules RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 86% sealing record chunks RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 92% sealing asset processing HotModuleReplacementPlugin
<s> [webpack.Progress] 92% sealing asset processing PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 92% sealing asset processing SourceMapDevToolPlugin
<s> [webpack.Progress] 92% sealing asset processing HtmlWebpackPlugin
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 93% sealing recording HotModuleReplacementPlugin
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 95% emitting emit DevMiddleware
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 98% emitting after emit SizeLimitsPlugin
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99% done plugins CaseSensitivePathsPlugin
<s> [webpack.Progress] 99% done plugins webpack-dev-middleware
<s> [webpack.Progress] 99% done plugins webpack-hot-middleware
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99%

<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 100%

╭───────────────────────────────────────────────────╮
│                                                   │
│   [38;2;162;224;94mStorybook 9.0.1 for nextjs started[39m              │
│   361 ms for manager and 7.75 s for preview       │
│                                                   │
│    Local:            http://localhost:6006/       │
│    On your network:  http://192.168.1.24:6006/    │
│                                                   │
╰───────────────────────────────────────────────────╯
<s> [webpack.Progress] 0%

<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 3% setup watch run VirtualModulesPlugin
<s> [webpack.Progress] 3% setup watch run webpack-dev-middleware
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 4% setup normal module factory CaseSensitivePathsPlugin
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 8% setup compilation HtmlWebpackPlugin
<s> [webpack.Progress] 8% setup compilation unplugin-csf
<s> [webpack.Progress] 8% setup compilation ArrayPushCallbackChunkFormatPlugin
<s> [webpack.Progress] 8% setup compilation JsonpChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation StartupChunkDependenciesPlugin
<s> [webpack.Progress] 8% setup compilation ImportScriptsChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation WorkerPlugin
<s> [webpack.Progress] 8% setup compilation SplitChunksPlugin
<s> [webpack.Progress] 8% setup compilation RuntimeChunkPlugin
<s> [webpack.Progress] 8% setup compilation ResolverCachePlugin
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation HotModuleReplacementPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ReactRefreshPlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ChunkPrefetchPreloadPlugin
<s> [webpack.Progress] 9% setup compilation ModuleInfoHeaderPlugin
<s> [webpack.Progress] 9% setup compilation SourceMapDevToolPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptModulesPlugin
<s> [webpack.Progress] 9% setup compilation JsonModulesPlugin
<s> [webpack.Progress] 9% setup compilation AssetModulesPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation RuntimePlugin
<s> [webpack.Progress] 9% setup compilation InferAsyncModulesPlugin
<s> [webpack.Progress] 9% setup compilation DataUriPlugin
<s> [webpack.Progress] 9% setup compilation FileUriPlugin
<s> [webpack.Progress] 9% setup compilation CompatibilityPlugin
<s> [webpack.Progress] 9% setup compilation HarmonyModulesPlugin
<s> [webpack.Progress] 9% setup compilation AMDPlugin
<s> [webpack.Progress] 9% setup compilation RequireJsStuffPlugin
<s> [webpack.Progress] 9% setup compilation CommonJsPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation NodeStuffPlugin
<s> [webpack.Progress] 9% setup compilation APIPlugin
<s> [webpack.Progress] 9% setup compilation ExportsInfoApiPlugin
<s> [webpack.Progress] 9% setup compilation WebpackIsIncludedPlugin
<s> [webpack.Progress] 9% setup compilation ConstPlugin
<s> [webpack.Progress] 9% setup compilation UseStrictPlugin
<s> [webpack.Progress] 9% setup compilation RequireIncludePlugin
<s> [webpack.Progress] 9% setup compilation RequireEnsurePlugin
<s> [webpack.Progress] 9% setup compilation RequireContextPlugin
<s> [webpack.Progress] 9% setup compilation ImportPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaContextPlugin
<s> [webpack.Progress] 9% setup compilation SystemPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaPlugin
<s> [webpack.Progress] 9% setup compilation URLPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsFactoryPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPresetPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPrinterPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptMetaInfoPlugin
<s> [webpack.Progress] 9% setup compilation EnsureChunkConditionsPlugin
<s> [webpack.Progress] 9% setup compilation RemoveEmptyChunksPlugin
<s> [webpack.Progress] 9% setup compilation MergeDuplicateChunksPlugin
<s> [webpack.Progress] 9% setup compilation SideEffectsFlagPlugin
<s> [webpack.Progress] 9% setup compilation FlagDependencyExportsPlugin
<s> [webpack.Progress] 9% setup compilation NamedModuleIdsPlugin
<s> [webpack.Progress] 9% setup compilation NamedChunkIdsPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation TemplatedPathPlugin
<s> [webpack.Progress] 9% setup compilation RecordIdsPlugin
<s> [webpack.Progress] 9% setup compilation WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 9% setup compilation IgnoreWarningsPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 10% building
<s> [webpack.Progress] 10% building 0/1 entries 0/0 dependencies 0/0 modules
<s> [webpack.Progress] 14% building 1/3 entries 37/38 dependencies 218/20 modules
<s> [webpack.Progress] 17% building 2/3 entries 77/82 dependencies 360/49 modules
<s> [webpack.Progress] 65% building 3/3 entries 122/122 dependencies 2809/71 modules
<s> [webpack.Progress] 65% building
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing finish module graph ResolverCachePlugin
<s> [webpack.Progress] 70% sealing finish module graph InferAsyncModulesPlugin
<s> [webpack.Progress] 70% sealing finish module graph FlagDependencyExportsPlugin
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 70% sealing plugins WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing dependencies optimization SideEffectsFlagPlugin
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 75% sealing chunk optimization EnsureChunkConditionsPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization MergeDuplicateChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization SplitChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 79% sealing module reviving RecordIdsPlugin
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 80% sealing module ids NamedModuleIdsPlugin
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 82% sealing chunk reviving RecordIdsPlugin
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk ids NamedChunkIdsPlugin
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record modules RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 86% sealing record chunks RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 92% sealing asset processing HotModuleReplacementPlugin
<s> [webpack.Progress] 92% sealing asset processing PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 92% sealing asset processing SourceMapDevToolPlugin
<s> [webpack.Progress] 92% sealing asset processing HtmlWebpackPlugin
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 93% sealing recording HotModuleReplacementPlugin
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 95% emitting emit DevMiddleware
<s> [webpack.Progress] 95% emitting emit
<i> [webpack-dev-middleware] wait until bundle finished: /iframe.html?viewMode=story&id=*
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 98% emitting after emit SizeLimitsPlugin
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99% done plugins CaseSensitivePathsPlugin
<s> [webpack.Progress] 99% done plugins webpack-dev-middleware
<s> [webpack.Progress] 99% done plugins webpack-hot-middleware
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99%

<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 100%

<s> [webpack.Progress] 0%

<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 3% setup watch run VirtualModulesPlugin
<s> [webpack.Progress] 3% setup watch run webpack-dev-middleware
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 4% setup normal module factory CaseSensitivePathsPlugin
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 8% setup compilation HtmlWebpackPlugin
<s> [webpack.Progress] 8% setup compilation unplugin-csf
<s> [webpack.Progress] 8% setup compilation ArrayPushCallbackChunkFormatPlugin
<s> [webpack.Progress] 8% setup compilation JsonpChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation StartupChunkDependenciesPlugin
<s> [webpack.Progress] 8% setup compilation ImportScriptsChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation WorkerPlugin
<s> [webpack.Progress] 8% setup compilation SplitChunksPlugin
<s> [webpack.Progress] 8% setup compilation RuntimeChunkPlugin
<s> [webpack.Progress] 8% setup compilation ResolverCachePlugin
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation HotModuleReplacementPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ReactRefreshPlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ChunkPrefetchPreloadPlugin
<s> [webpack.Progress] 9% setup compilation ModuleInfoHeaderPlugin
<s> [webpack.Progress] 9% setup compilation SourceMapDevToolPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptModulesPlugin
<s> [webpack.Progress] 9% setup compilation JsonModulesPlugin
<s> [webpack.Progress] 9% setup compilation AssetModulesPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation RuntimePlugin
<s> [webpack.Progress] 9% setup compilation InferAsyncModulesPlugin
<s> [webpack.Progress] 9% setup compilation DataUriPlugin
<s> [webpack.Progress] 9% setup compilation FileUriPlugin
<s> [webpack.Progress] 9% setup compilation CompatibilityPlugin
<s> [webpack.Progress] 9% setup compilation HarmonyModulesPlugin
<s> [webpack.Progress] 9% setup compilation AMDPlugin
<s> [webpack.Progress] 9% setup compilation RequireJsStuffPlugin
<s> [webpack.Progress] 9% setup compilation CommonJsPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation NodeStuffPlugin
<s> [webpack.Progress] 9% setup compilation APIPlugin
<s> [webpack.Progress] 9% setup compilation ExportsInfoApiPlugin
<s> [webpack.Progress] 9% setup compilation WebpackIsIncludedPlugin
<s> [webpack.Progress] 9% setup compilation ConstPlugin
<s> [webpack.Progress] 9% setup compilation UseStrictPlugin
<s> [webpack.Progress] 9% setup compilation RequireIncludePlugin
<s> [webpack.Progress] 9% setup compilation RequireEnsurePlugin
<s> [webpack.Progress] 9% setup compilation RequireContextPlugin
<s> [webpack.Progress] 9% setup compilation ImportPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaContextPlugin
<s> [webpack.Progress] 9% setup compilation SystemPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaPlugin
<s> [webpack.Progress] 9% setup compilation URLPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsFactoryPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPresetPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPrinterPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptMetaInfoPlugin
<s> [webpack.Progress] 9% setup compilation EnsureChunkConditionsPlugin
<s> [webpack.Progress] 9% setup compilation RemoveEmptyChunksPlugin
<s> [webpack.Progress] 9% setup compilation MergeDuplicateChunksPlugin
<s> [webpack.Progress] 9% setup compilation SideEffectsFlagPlugin
<s> [webpack.Progress] 9% setup compilation FlagDependencyExportsPlugin
<s> [webpack.Progress] 9% setup compilation NamedModuleIdsPlugin
<s> [webpack.Progress] 9% setup compilation NamedChunkIdsPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation TemplatedPathPlugin
<s> [webpack.Progress] 9% setup compilation RecordIdsPlugin
<s> [webpack.Progress] 9% setup compilation WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 9% setup compilation IgnoreWarningsPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 10% building
<s> [webpack.Progress] 10% building 0/1 entries 0/0 dependencies 0/0 modules
<s> [webpack.Progress] 22% building 0/3 entries 42/67 dependencies 16/25 modules
<s> [webpack.Progress] 60% building 0/3 entries 111/117 dependencies 100/65 modules
<s> [webpack.Progress] 62% building 0/3 entries 117/117 dependencies 200/66 modules
<s> [webpack.Progress] 62% building 0/3 entries 117/117 dependencies 600/66 modules
<s> [webpack.Progress] 62% building 0/3 entries 117/117 dependencies 1000/66 modules
<s> [webpack.Progress] 62% building 0/3 entries 117/119 dependencies 1100/66 modules
<s> [webpack.Progress] 63% building 1/3 entries 119/119 dependencies 1876/68 modules
<s> [webpack.Progress] 64% building 1/3 entries 120/121 dependencies 2600/69 modules
<s> [webpack.Progress] 64% building 2/3 entries 122/122 dependencies 2796/71 modules
<s> [webpack.Progress] 65% building 3/3 entries 122/122 dependencies 2809/71 modules
<s> [webpack.Progress] 65% building
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing finish module graph ResolverCachePlugin
<s> [webpack.Progress] 70% sealing finish module graph InferAsyncModulesPlugin
<s> [webpack.Progress] 70% sealing finish module graph FlagDependencyExportsPlugin
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 70% sealing plugins WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing dependencies optimization SideEffectsFlagPlugin
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 75% sealing chunk optimization EnsureChunkConditionsPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization MergeDuplicateChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization SplitChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 79% sealing module reviving RecordIdsPlugin
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 80% sealing module ids NamedModuleIdsPlugin
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 82% sealing chunk reviving RecordIdsPlugin
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk ids NamedChunkIdsPlugin
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record modules RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 86% sealing record chunks RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 92% sealing asset processing HotModuleReplacementPlugin
<s> [webpack.Progress] 92% sealing asset processing PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 92% sealing asset processing SourceMapDevToolPlugin
<s> [webpack.Progress] 92% sealing asset processing HtmlWebpackPlugin
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 93% sealing recording HotModuleReplacementPlugin
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 95% emitting emit DevMiddleware
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 98% emitting after emit SizeLimitsPlugin
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99% done plugins CaseSensitivePathsPlugin
<s> [webpack.Progress] 99% done plugins webpack-dev-middleware
<s> [webpack.Progress] 99% done plugins webpack-hot-middleware
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99%

<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 100%

<s> [webpack.Progress] 0%

<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 3% setup watch run VirtualModulesPlugin
<s> [webpack.Progress] 3% setup watch run webpack-dev-middleware
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 4% setup normal module factory CaseSensitivePathsPlugin
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 8% setup compilation HtmlWebpackPlugin
<s> [webpack.Progress] 8% setup compilation unplugin-csf
<s> [webpack.Progress] 8% setup compilation ArrayPushCallbackChunkFormatPlugin
<s> [webpack.Progress] 8% setup compilation JsonpChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation StartupChunkDependenciesPlugin
<s> [webpack.Progress] 8% setup compilation ImportScriptsChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation WorkerPlugin
<s> [webpack.Progress] 8% setup compilation SplitChunksPlugin
<s> [webpack.Progress] 8% setup compilation RuntimeChunkPlugin
<s> [webpack.Progress] 8% setup compilation ResolverCachePlugin
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation HotModuleReplacementPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ReactRefreshPlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ChunkPrefetchPreloadPlugin
<s> [webpack.Progress] 9% setup compilation ModuleInfoHeaderPlugin
<s> [webpack.Progress] 9% setup compilation SourceMapDevToolPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptModulesPlugin
<s> [webpack.Progress] 9% setup compilation JsonModulesPlugin
<s> [webpack.Progress] 9% setup compilation AssetModulesPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation RuntimePlugin
<s> [webpack.Progress] 9% setup compilation InferAsyncModulesPlugin
<s> [webpack.Progress] 9% setup compilation DataUriPlugin
<s> [webpack.Progress] 9% setup compilation FileUriPlugin
<s> [webpack.Progress] 9% setup compilation CompatibilityPlugin
<s> [webpack.Progress] 9% setup compilation HarmonyModulesPlugin
<s> [webpack.Progress] 9% setup compilation AMDPlugin
<s> [webpack.Progress] 9% setup compilation RequireJsStuffPlugin
<s> [webpack.Progress] 9% setup compilation CommonJsPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation NodeStuffPlugin
<s> [webpack.Progress] 9% setup compilation APIPlugin
<s> [webpack.Progress] 9% setup compilation ExportsInfoApiPlugin
<s> [webpack.Progress] 9% setup compilation WebpackIsIncludedPlugin
<s> [webpack.Progress] 9% setup compilation ConstPlugin
<s> [webpack.Progress] 9% setup compilation UseStrictPlugin
<s> [webpack.Progress] 9% setup compilation RequireIncludePlugin
<s> [webpack.Progress] 9% setup compilation RequireEnsurePlugin
<s> [webpack.Progress] 9% setup compilation RequireContextPlugin
<s> [webpack.Progress] 9% setup compilation ImportPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaContextPlugin
<s> [webpack.Progress] 9% setup compilation SystemPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaPlugin
<s> [webpack.Progress] 9% setup compilation URLPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsFactoryPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPresetPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPrinterPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptMetaInfoPlugin
<s> [webpack.Progress] 9% setup compilation EnsureChunkConditionsPlugin
<s> [webpack.Progress] 9% setup compilation RemoveEmptyChunksPlugin
<s> [webpack.Progress] 9% setup compilation MergeDuplicateChunksPlugin
<s> [webpack.Progress] 9% setup compilation SideEffectsFlagPlugin
<s> [webpack.Progress] 9% setup compilation FlagDependencyExportsPlugin
<s> [webpack.Progress] 9% setup compilation NamedModuleIdsPlugin
<s> [webpack.Progress] 9% setup compilation NamedChunkIdsPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation TemplatedPathPlugin
<s> [webpack.Progress] 9% setup compilation RecordIdsPlugin
<s> [webpack.Progress] 9% setup compilation WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 9% setup compilation IgnoreWarningsPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 10% building
<s> [webpack.Progress] 10% building 0/1 entries 0/0 dependencies 0/0 modules
<s> [webpack.Progress] 16% building 0/3 entries 14/36 dependencies 10/10 modules
<s> [webpack.Progress] 63% building 0/3 entries 118/118 dependencies 400/67 modules
<s> [webpack.Progress] 63% building 0/3 entries 118/120 dependencies 1000/67 modules
<s> [webpack.Progress] 64% building 1/3 entries 120/120 dependencies 1929/69 modules
<s> [webpack.Progress] 64% building 2/3 entries 122/122 dependencies 2796/71 modules
<s> [webpack.Progress] 65% building 3/3 entries 122/122 dependencies 2809/71 modules
<s> [webpack.Progress] 65% building
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing finish module graph ResolverCachePlugin
<s> [webpack.Progress] 70% sealing finish module graph InferAsyncModulesPlugin
<s> [webpack.Progress] 70% sealing finish module graph FlagDependencyExportsPlugin
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 70% sealing plugins WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing dependencies optimization SideEffectsFlagPlugin
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 75% sealing chunk optimization EnsureChunkConditionsPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization MergeDuplicateChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization SplitChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 79% sealing module reviving RecordIdsPlugin
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 80% sealing module ids NamedModuleIdsPlugin
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 82% sealing chunk reviving RecordIdsPlugin
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk ids NamedChunkIdsPlugin
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record modules RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 86% sealing record chunks RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 92% sealing asset processing HotModuleReplacementPlugin
<s> [webpack.Progress] 92% sealing asset processing PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 92% sealing asset processing SourceMapDevToolPlugin
<s> [webpack.Progress] 92% sealing asset processing HtmlWebpackPlugin
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 93% sealing recording HotModuleReplacementPlugin
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 95% emitting emit DevMiddleware
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 98% emitting after emit SizeLimitsPlugin
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99% done plugins CaseSensitivePathsPlugin
<s> [webpack.Progress] 99% done plugins webpack-dev-middleware
<s> [webpack.Progress] 99% done plugins webpack-hot-middleware
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99%

<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 100%

<s> [webpack.Progress] 0%

<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 1% cache end idle
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 3% setup watch run VirtualModulesPlugin
<s> [webpack.Progress] 3% setup watch run webpack-dev-middleware
<s> [webpack.Progress] 3% setup watch run
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 4% setup normal module factory CaseSensitivePathsPlugin
<s> [webpack.Progress] 4% setup normal module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 5% setup context module factory
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile ProgressPlugin
<s> [webpack.Progress] 6% setup before compile
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile ExternalsPlugin
<s> [webpack.Progress] 7% setup compile
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 8% setup compilation HtmlWebpackPlugin
<s> [webpack.Progress] 8% setup compilation unplugin-csf
<s> [webpack.Progress] 8% setup compilation ArrayPushCallbackChunkFormatPlugin
<s> [webpack.Progress] 8% setup compilation JsonpChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation StartupChunkDependenciesPlugin
<s> [webpack.Progress] 8% setup compilation ImportScriptsChunkLoadingPlugin
<s> [webpack.Progress] 8% setup compilation WorkerPlugin
<s> [webpack.Progress] 8% setup compilation SplitChunksPlugin
<s> [webpack.Progress] 8% setup compilation RuntimeChunkPlugin
<s> [webpack.Progress] 8% setup compilation ResolverCachePlugin
<s> [webpack.Progress] 8% setup compilation
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation HotModuleReplacementPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ReactRefreshPlugin
<s> [webpack.Progress] 9% setup compilation ProvidePlugin
<s> [webpack.Progress] 9% setup compilation ChunkPrefetchPreloadPlugin
<s> [webpack.Progress] 9% setup compilation ModuleInfoHeaderPlugin
<s> [webpack.Progress] 9% setup compilation SourceMapDevToolPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptModulesPlugin
<s> [webpack.Progress] 9% setup compilation JsonModulesPlugin
<s> [webpack.Progress] 9% setup compilation AssetModulesPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation EntryPlugin
<s> [webpack.Progress] 9% setup compilation RuntimePlugin
<s> [webpack.Progress] 9% setup compilation InferAsyncModulesPlugin
<s> [webpack.Progress] 9% setup compilation DataUriPlugin
<s> [webpack.Progress] 9% setup compilation FileUriPlugin
<s> [webpack.Progress] 9% setup compilation CompatibilityPlugin
<s> [webpack.Progress] 9% setup compilation HarmonyModulesPlugin
<s> [webpack.Progress] 9% setup compilation AMDPlugin
<s> [webpack.Progress] 9% setup compilation RequireJsStuffPlugin
<s> [webpack.Progress] 9% setup compilation CommonJsPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation LoaderPlugin
<s> [webpack.Progress] 9% setup compilation NodeStuffPlugin
<s> [webpack.Progress] 9% setup compilation APIPlugin
<s> [webpack.Progress] 9% setup compilation ExportsInfoApiPlugin
<s> [webpack.Progress] 9% setup compilation WebpackIsIncludedPlugin
<s> [webpack.Progress] 9% setup compilation ConstPlugin
<s> [webpack.Progress] 9% setup compilation UseStrictPlugin
<s> [webpack.Progress] 9% setup compilation RequireIncludePlugin
<s> [webpack.Progress] 9% setup compilation RequireEnsurePlugin
<s> [webpack.Progress] 9% setup compilation RequireContextPlugin
<s> [webpack.Progress] 9% setup compilation ImportPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaContextPlugin
<s> [webpack.Progress] 9% setup compilation SystemPlugin
<s> [webpack.Progress] 9% setup compilation ImportMetaPlugin
<s> [webpack.Progress] 9% setup compilation URLPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsFactoryPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPresetPlugin
<s> [webpack.Progress] 9% setup compilation DefaultStatsPrinterPlugin
<s> [webpack.Progress] 9% setup compilation JavascriptMetaInfoPlugin
<s> [webpack.Progress] 9% setup compilation EnsureChunkConditionsPlugin
<s> [webpack.Progress] 9% setup compilation RemoveEmptyChunksPlugin
<s> [webpack.Progress] 9% setup compilation MergeDuplicateChunksPlugin
<s> [webpack.Progress] 9% setup compilation SideEffectsFlagPlugin
<s> [webpack.Progress] 9% setup compilation FlagDependencyExportsPlugin
<s> [webpack.Progress] 9% setup compilation NamedModuleIdsPlugin
<s> [webpack.Progress] 9% setup compilation NamedChunkIdsPlugin
<s> [webpack.Progress] 9% setup compilation DefinePlugin
<s> [webpack.Progress] 9% setup compilation TemplatedPathPlugin
<s> [webpack.Progress] 9% setup compilation RecordIdsPlugin
<s> [webpack.Progress] 9% setup compilation WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 9% setup compilation IgnoreWarningsPlugin
<s> [webpack.Progress] 9% setup compilation ProgressPlugin
<s> [webpack.Progress] 9% setup compilation
<s> [webpack.Progress] 10% building
<s> [webpack.Progress] 10% building 0/1 entries 0/0 dependencies 0/0 modules
<s> [webpack.Progress] 42% building 0/3 entries 75/75 dependencies 42/50 modules
<s> [webpack.Progress] 62% building 1/3 entries 117/118 dependencies 324/66 modules
<s> [webpack.Progress] 63% building 1/3 entries 118/120 dependencies 1000/67 modules
<s> [webpack.Progress] 64% building 2/3 entries 122/122 dependencies 2796/71 modules
<s> [webpack.Progress] 65% building 3/3 entries 122/122 dependencies 2809/71 modules
<s> [webpack.Progress] 65% building
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 69% building finish
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing finish module graph ResolverCachePlugin
<s> [webpack.Progress] 70% sealing finish module graph InferAsyncModulesPlugin
<s> [webpack.Progress] 70% sealing finish module graph FlagDependencyExportsPlugin
<s> [webpack.Progress] 70% sealing finish module graph
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 70% sealing plugins WarnCaseSensitiveModulesPlugin
<s> [webpack.Progress] 70% sealing plugins
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing dependencies optimization SideEffectsFlagPlugin
<s> [webpack.Progress] 71% sealing dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 71% sealing after dependencies optimization
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 72% sealing chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing after chunk graph
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 73% sealing optimizing
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 74% sealing module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing after module optimization
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 75% sealing chunk optimization EnsureChunkConditionsPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization MergeDuplicateChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization SplitChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization RemoveEmptyChunksPlugin
<s> [webpack.Progress] 75% sealing chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 76% sealing after chunk optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing module and chunk tree optimization PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 77% sealing module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 77% sealing after module and chunk tree optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 78% sealing after chunk modules optimization
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 79% sealing module reviving RecordIdsPlugin
<s> [webpack.Progress] 79% sealing module reviving
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing before module ids
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 80% sealing module ids NamedModuleIdsPlugin
<s> [webpack.Progress] 80% sealing module ids
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 81% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing module id optimization
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 82% sealing chunk reviving RecordIdsPlugin
<s> [webpack.Progress] 82% sealing chunk reviving
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 83% sealing before chunk ids
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk ids NamedChunkIdsPlugin
<s> [webpack.Progress] 84% sealing chunk ids
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 84% sealing chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 85% sealing after chunk id optimization
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record modules RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record modules
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 86% sealing record chunks RecordIdsPlugin
<s> [webpack.Progress] 86% sealing record chunks
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing module hashing
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 87% sealing code generation
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 88% sealing runtime requirements
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 89% sealing after hashing
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 90% sealing record hash
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing module assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 91% sealing chunk assets processing
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 92% sealing asset processing HotModuleReplacementPlugin
<s> [webpack.Progress] 92% sealing asset processing PersistentChildCompilerSingletonPlugin
<s> [webpack.Progress] 92% sealing asset processing SourceMapDevToolPlugin
<s> [webpack.Progress] 92% sealing asset processing HtmlWebpackPlugin
<s> [webpack.Progress] 92% sealing asset processing
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing after asset optimization
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 93% sealing recording HotModuleReplacementPlugin
<s> [webpack.Progress] 93% sealing recording
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 94% sealing after seal
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 95% emitting emit DevMiddleware
<s> [webpack.Progress] 95% emitting emit
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 98% emitting after emit SizeLimitsPlugin
<s> [webpack.Progress] 98% emitting after emit
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99% done plugins CaseSensitivePathsPlugin
<s> [webpack.Progress] 99% done plugins webpack-dev-middleware
<s> [webpack.Progress] 99% done plugins webpack-hot-middleware
<s> [webpack.Progress] 99% done plugins
<s> [webpack.Progress] 99%

<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache store build dependencies
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 99% cache begin idle
<s> [webpack.Progress] 100%


Not auto-run
Checked command status
Storybookの起動を確認しています。次に、チェックリストの残りの項目を確認しましょう。Lighthouse & Perfの確認が必要です。

ランディングページの画像最適化とアクセシビリティを確認します。まず、ランディングページの画像がnext/imageを使用しているか確認しましょう。

Searched codebase
0 results
Searched inapps/frontend/app/page.tsxwith querynext/image
ランディングページでnext/imageが使用されていないことがわかりました。パフォーマンスとアクセシビリティを向上させるために、画像の最適化を行いましょう。

まず、ランディングページの画像を最適化するために、next/imageを使用するように修正します。

Error while editing
page.tsx
The model produced an invalid tool call.
申し訳ありません。ツール呼び出しの形式に問題がありました。正しい形式で再試行します。

Edited
page.tsx
+28
-7
 190
Open diff
画像ファイルを作成する必要があります。next/imageコンポーネントで使用する画像を用意しましょう。

Error while analyzing directory
Cannot list directory /Users/nakazawatarou/Documents/tarou/project/【safe】commit_coach_ver.14/apps/frontend/public which does not exist.
publicディレクトリが存在しないようです。画像を保存するためのディレクトリを作成し、必要な画像ファイルを用意しましょう。

Ran terminal command
~/…/【safe】commit_coach_ver.14 $ mkdir -p apps/frontend/public/images


Not auto-run
次に、画像ファイルを作成します。Webpフォーマットの画像を生成するために、SVGを作成してから変換します。

Created
chat-background.svg
+20
-0
 0
Open diff
Created
coach-background.svg
+20
-0
 0
Open diff
SVGファイルをWebP形式に変換します。まず、必要なツールがインストールされているか確認し、なければインストールします。

Ran terminal command
~/…/【safe】commit_coach_ver.14Working directory: ~/Documents/tarou/project/【safe】commit_coach_ver.14 $ which convert || echo "ImageMagick not found"

convert not found
ImageMagick not found
Exit Code 0

Not auto-run
ImageMagickがインストールされていないようです。SVGをWebPに変換する代わりに、SVGファイルを直接使用するように修正しましょう。

Edited
page.tsx
+2
-2
 216
Open diff
次に、アクセシビリティを向上させるために、フォーカスリングとaria属性を追加しましょう。

Edited
page.tsx
+17
-17
 201
Open diff
次に、Storybookの起動確認を行い、前回作成したストーリーが正しく表示されるか確認しましょう。

Ran background terminal command
~/…/【safe】commit_coach_ver.14 $ cd apps/frontend && pnpm storybook


> commit-coach-frontend@0.1.0 storybook /Users/nakazawatarou/Documents/tarou/project/【safe】commit_coach_ver.14/apps/frontend
> storybook dev -p 6006

storybook v9.0.1

[?25l[2K[1G[36m?[39m [1mPort 6006 is not available. Would you like to run Storybook on port 6007 instead?[22m [90m›[39m [90m(Y/n)[39m
Exit Code 0

Not auto-run
Storybookの起動を待っている間に、MessageCardコンポーネントのストーリーも作成しましょう。まず、MessageCardコンポーネントの実装を確認します。

Searched filesystem
0 results
Searchedforfilesinapps/frontend/componentswith pattern*message-card*
MessageCardコンポーネントが見つかりませんでした。他の名前で実装されている可能性があります。マイページで表示されている最近のチャットメッセージのコンポーネントを探してみましょう。

Analyzed

page.tsx
マイページを確認したところ、MessageCardという独立したコンポーネントはなく、マイページ内で直接チャットメッセージのカードを実装していることがわかりました。Storybookのストーリーを作成するために、このメッセージカードを独立したコンポーネントとして抽出しましょう。


- ここで会話が終わってる。

## continue ボタンが押せない。以下のエラーが発生している。




Application error: a client-side exception has occurred while loading localhost (see the browser console for more information).
Unhandled Runtime Error


ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3001/_next/static/chunks/app/layout.js)

app/layout.tsx (21:9) @ RootLayout


  19 |     <html lang="ja" suppressHydrationWarning={true}>
  20 |       <body suppressHydrationWarning={true}>
> 21 |         <AuthProvider>{children}</AuthProvider>
     |         ^
  22 |         <Toaster position="top-right" />
  23 |       </body>
  24 |     </html>
Call Stack
12

Show 6 ignore-listed frame(s)
__webpack_require__.f.j
.next/static/chunks/webpack.js (858:29)
<unknown>
.next/static/chunks/webpack.js (153:40)
Array.reduce
<anonymous> (0:0)
__webpack_require__.e
.next/static/chunks/webpack.js (152:67)
fn.e
.next/static/chunks/webpack.js (389:50)
RootLayout
app/layout.tsx (21:9)
Was this helpful?



1
2

1/1

Next.js 15.2.4 (stale)
