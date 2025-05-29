# Windsurf 用デプロイ & リファクタリング指示書

_Repository: **commit_coach_ver04** (branch: `safe/004-ui-simple-dashboard` → `feature/remove-dashboard`)_

---

## 📝 進捗状況 (2025-05-29 22:00)

### ✅ 完了した作業
1. `feature/remove-dashboard` ブランチ作成
2. Dashboard関連ディレクトリ・ファイルの削除
3. ルートページを `/projects` にリダイレクト
4. サイドバーからDashboardエントリを削除
5. Dashboard連携機能の削除（`toggleDashboard`など）
6. 変更をコミット・プッシュ

### 🔍 特記事項
- プロジェクト/タスク/サブタスクの階層構造は維持
- `ItemRow`コンポーネントからDashboard関連機能（時計アイコンなど）を削除

### 📋 次のステップ
- Windsurf Editorでの作業（インポートエラー修正など）
- Netlifyへのデプロイ

---

## 1. ゴール

- **Dashboard 機能を一旦撤去**し、`/projects` 画面のみで運用できるようにする。
- Windsurf Editor 内で **Netlify へ 1‑Click Deploy** できる状態まで整備する。

## 2. 完了後のディレクトリ構成 (主要部のみ)

```text
apps/web/
└─ app/
   ├─ layout.tsx
   ├─ page.tsx          # redirect('/projects')
   └─ projects/
      ├─ page.tsx
      ├─ components/
      │  └─ ProjectList.tsx
      └─ ...            # (Project 関連コード)
src/
└─ components/
   ├─ Sidebar.tsx       # Dashboard 参照を削除済
   └─ ...
```

> **ポイント**
>
> - `app/dashboard/**` ディレクトリは **削除**。
> - `src/stores/dashboardStore.ts` など Dashboard専用 slice も合わせて削除。
> - `Sidebar.tsx` の `navItems` 配列から Dashboard をコメントアウトではなく**行ごと削除**。

## 3. 変更手順

| 手順                                                         | ファイル/コマンド                                               | 目的                             |
| ------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------- |
| 1                                                            | `git switch -c feature/remove-dashboard`                        | 作業ブランチ作成                 |
| 2                                                            | `rm -rf apps/web/app/dashboard`                                 | ページ・コンポーネント削除       |
| 3                                                            | `vim apps/web/app/page.tsx`<br>```ts                            |
| export default function Home() { redirect("/projects"); }``` | ルートを `/projects` に                                         |
| 4                                                            | `vim src/components/Sidebar.tsx`                                | navItems から Dashboard 行を削除 |
| 5                                                            | `pnpm lint && pnpm test`                                        | 静的解析・テスト確認             |
| 6                                                            | `git add -A && git commit -m "chore: remove dashboard feature"` | コミット                         |
| 7                                                            | `git push -u origin feature/remove-dashboard`                   | Push                             |

## 4. Windsurf Editor で行う作業 // 以下はまだ作業してない。

1. **Open Repository**: `Ctrl+P` → _Open From GitHub_ → 対象ブランチを選択
2. **AI Fix**: `Cascade > Run "Fix all import errors"` で不要 import を一括削除
3. **Preview**: `Preview` タブで `/projects` のみ表示されることを確認
4. **AI Commit Message** でメッセージを整える (任意)

参照: Windsurf Docs – _App Deploys_ citeturn0search0

## 5. Netlify への 1‑Click Deploy

1. Windsurf 右上の **Deploy** ボタン → **Netlify** を選択
2. 初回のみ Netlify と OAuth 連携
3. **Branch: `feature/remove-dashboard`** を指定し **Deploy**
4. 生成された URL で `/projects` 表示を確認

Netlify × Windsurf 統合の詳細: citeturn0search3turn0search4

## 6. 今後のロードマップ (メモ)

- `app/settings` を追加し **AI コーチの口調**を zustand で管理
- `app/me` (Mypage) でプロフィール & Daily Task まとめページ
- Dashboard 復活時は `git revert <hash>` で戻せるよう、この PR は squash しない

---

**Maintainer:** @your‑github‑handle
**Last Update:** 2025‑05‑29
