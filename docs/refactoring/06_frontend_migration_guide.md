# 06\_Frontend\_Migration\_Guide

> **バージョン:** 2025-05-30 (draft)
>
> **移行対象ブランチ:** `safe/004-ui-simple-dashboard` → `feature/remove-dashboard`
>
> **責任者:** @nakazawatarou

---

## 1. ガイドの目的

本書は **Dashboard 機能を完全撤去し `/projects` 画面へ一本化** するフロントエンド移行手順をまとめたものです。ローカル環境での作業開始から PR 作成・デプロイ確認・ロールバックまで、フロントエンド実装者が迷わず作業できることを目的とします。

> 🛑 **注意:** バックエンド (Supabase) に対する schema 変更は別ドキュメント `07_backend_migration_guide.md` を参照。

---

## 2. 移行概要

| Before                      | After                  |
| --------------------------- | ---------------------- |
| `/app/dashboard/**` ルートページ  | **削除**                 |
| ルート `/` = Dashboard         | **リダイレクト** `/projects` |
| `dashboardStore` (zustand)  | **削除**（他 store に依存なし）  |
| Sidebar "Dashboard" navItem | **行ごと削除**              |
| 強制オプトイン for Dashboard Beta  | **不要** → トグル削除         |

---

## 3. 前提条件

* Node.js 20.x
* PNPM 9.x (`corepack` 推奨)
* Vite 5.x / Next.js 13.4
* 環境変数 `.env.development` が設定済み

---

## 4. 工程一覧

| 手順 | 作業                     | コマンド/ファイル                                                                    | 完了チェック                                                   |
| -- | ---------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1  | **作業ブランチ作成**           | `git switch -c feature/remove-dashboard`                                     | `git branch --show-current` = `feature/remove-dashboard` |
| 2  | **Dashboard ディレクトリ削除** | `rm -rf apps/web/app/dashboard`                                              | `git status` に削除表示                                       |
| 3  | **ルートリダイレクト設定**        | `apps/web/app/page.tsx`                                                      | `redirect('/projects')` が追加                              |
| 4  | **Sidebar navItem 削除** | `src/components/Sidebar.tsx`                                                 | `"Dashboard"` 行が無いこと                                     |
| 5  | **zustand ストア削除**      | `rm src/stores/dashboardStore.ts`                                            | 依存 compile error 0 件                                     |
| 6  | **Import エラー一括修正**     | Windsurf Editor > `Cascade → Fix all import errors`                          | `pnpm lint` PASS                                         |
| 7  | **ユニットテスト更新**          | Update/Remove dashboard tests                                                | `pnpm test` PASS                                         |
| 8  | **コミット & Push**        | `git add -A && git commit -m "feat: remove dashboard" && git push -u origin` | CI green                                                 |

---

## 5. 削除・変更ファイル詳細

### 5.1 削除

```
apps/web/app/dashboard/
├─ layout.tsx
├─ page.tsx
└─ components/
   ├─ DashboardCard.tsx
   ├─ ...
```

`src/stores/dashboardStore.ts`

`src/components/icons/ClockIcon.tsx` (Dashboard 専用)

### 5.2 変更

| ファイル                         | 変更内容                              |
| ---------------------------- | --------------------------------- |
| `apps/web/app/page.tsx`      | `redirect('/projects')` を追加       |
| `src/components/Sidebar.tsx` | `navItems` 配列から Dashboard 行削除     |
| `src/components/ItemRow.tsx` | 時計アイコン削除、`toggleDashboard` 呼び出し削除 |

---

## 6. 型定義・依存解消

1. **`Dashboard*` 型の削除**: `types/dashboard.ts` を削除し、import 修正
2. **ESLint**: `unused-vars` エラーを確認しクリア
3. **CVA Variants**: `dashboard` variant を削除 (`Button`, `Badge`)

---

## 7. QA チェックリスト

| テスト        | 手順                   | 期待結果                            |
| ---------- | -------------------- | ------------------------------- |
| Routing    | `/` にアクセス            | 自動で `/projects` へ 302 → 200     |
| Navigation | サイドバー一覧              | "Projects" が選択状態、"Dashboard" 不在 |
| CRUD       | 新規プロジェクト作成 → 編集 → 削除 | すべて成功しエラーなし                     |
| A11y       | Storybook a11y アドオン  | Violations 0                    |
| Lighthouse | `/projects`          | Performance ≥ 95                |

---

## 8. Netlify One‑Click Deploy 手順

1. **Windsurf** 右上 **Deploy** → **Netlify**
2. Build Command は `pnpm build:web` (mono repo root)
3. Publish Directory `apps/web/out`
4. Branch: `feature/remove-dashboard`
5. Deploy 完了後 **Open URL** → `/projects` が表示されること

---

## 9. ロールバック手順

1. GitHub で Revert PR (#123) をクリック → `revert-feature-remove-dashboard`
2. CI が通過したら `main` にマージ
3. Netlify 本番サイトを **Redeploy** し、Dashboard が復活すること確認

---

## 10. 既知の問題 & 対処策

| ID    | 症状                                | 回避策                                        |
| ----- | --------------------------------- | ------------------------------------------ |
| KB-01 | `/projects` で古い Dashboard CSS が残る | キャッシュ削除 or `@/styles/dashboard.scss` を物理削除 |
| KB-02 | ブラウザブックマーク `/dashboard` 直アクセス     | Cloudflare Redirect Rule を追加               |

---

## 11. アフターケア

* 1 週間 Crashlytics と Sentry をモニタリング
* 毎朝 10:00 JST stand-up でデプロイステータス共有

---

## 12. 参考資料

* **リファクタ指示書 (Notion):** [https://notion.so/xyz](https://notion.so/xyz)
* **Windsurf Docs – App Deploys:** `docs/windsurf/app-deploys.md`

---

<!-- End of File -->
