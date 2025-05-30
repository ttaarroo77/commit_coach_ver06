# 02\_UI\_Component\_List

> **バージョン:** 2025‑05‑30 (draft)
>
> **対象ブランチ:** `feature/remove-dashboard`
>
> **責任者:** @nakazawatarou

---

## 1. ドキュメントの目的

本書は Commit Coach フロントエンド (Next.js 13 App Router + TypeScript + TailwindCSS) における **再利用可能 UI コンポーネントの網羅カタログ** です。Atomic Design をベースに、各コンポーネントの役割・ props・依存・配置パスを定義し、Storybook の参照場所を示します。これにより新規開発・リファクタリング時の認知負荷を下げ、デザイン一貫性を担保します。

> **対象外:** `/projects` ページの画面遷移図・イベントフローは `09_event_flow.md` を参照。

---

## 2. 基本指針

| # | 指針                    | 補足                                                                      |
| - | --------------------- | ----------------------------------------------------------------------- |
| 1 | **Atomic Design** を採用 | `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/` フォルダ階層を厳守。 |
| 2 | **TailwindCSS + CVA** | Variant は `class‑variance-authority` で集中管理。`className` 直書き禁止。           |
| 3 | **shadcn/ui** 拡張ルール   | shadcn 発生元コードは `atoms/` に置き、見た目変更は `tailwind.config.ts` の `extend` で吸収。 |
| 4 | **Strict Props**      | すべての props は `export type XxxProps = {…}` で明示。optional を乱用しない。          |
| 5 | **Storybook**         | 1 コンポーネント = 1 `*.stories.tsx`。Controls を使いテーマ切替/RTL を必ず確認。              |
| 6 | **i18n**              | 文言は **必ず** `<Trans>` or `t('key')` を介す。ハードコード禁止。                        |
| 7 | **A11y**              | `aria-*` 属性を優先。カラーコントラスト比 4.5:1 以上。kbd ナビ OK を Storybook アドオンで検証。       |

---

## 3. ディレクトリ構成

```text
src/
└─ components/
   ├─ atoms/
   │  ├─ Button.tsx
   │  ├─ Icon.tsx
   │  ├─ Badge.tsx
   │  └─ …
   ├─ molecules/
   │  ├─ InputWithLabel.tsx
   │  ├─ AvatarWithStatus.tsx
   │  └─ …
   ├─ organisms/
   │  ├─ ProjectList.tsx
   │  ├─ TaskTable.tsx
   │  ├─ SidebarNav.tsx
   │  └─ …
   ├─ templates/
   │  ├─ ProjectsLayout.tsx
   │  └─ …
   └─ pages/  ← Next.js `app/` 配下に相当
```

---

## 4. コンポーネントカタログ

### 4.1 Atoms

| コンポーネント   | 概要                                                | 主な props                                       | Storybook ID            | 備考                                                      |
| --------- | ------------------------------------------------- | ---------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| `Button`  | 汎用ボタン (primary / secondary / destructive / ghost) | `variant`, `size`, `icon`, `disabled`          | `atoms-button--primary` | `ButtonLink` への派生禁止、代わりに `<Link><Button …/></Link>` を使用 |
| `Icon`    | Lucide-React 包装 Icon                              | `name`, `size`, `ariaLabel`                    | `atoms-icon--default`   | 動的 import                                               |
| `Badge`   | ステータス表示                                           | `variant`(success/warning/neutral), `children` | `atoms-badge--success`  | 色は tailwind config の semantic-color 参照                  |
| `Tooltip` | shadcn Popover ベース                                | `content`, `placement`                         | `atoms-tooltip--top`    | マウス & フォーカス両対応                                          |
| `Spinner` | ローディングインジケータ                                      | `size`, `color`                                | `atoms-spinner--md`     | 12px, 16px, 24px のみ                                     |

### 4.2 Molecules

| コンポーネント              | 概要                 | 主な props                                         | Storybook ID                       | 備考                              |
| -------------------- | ------------------ | ------------------------------------------------ | ---------------------------------- | ------------------------------- |
| `InputWithLabel`     | label+input+error  | `label`, `placeholder`, `error`, `...inputProps` | `molecules-input-label--default`   | ARIA `aria‑describedby` 自動付与    |
| `AvatarWithStatus`   | ユーザアバター+オンラインステータス | `src`, `alt`, `status`(online/offline/busy)      | `molecules-avatar--online`         | ステータスは Badge を再利用               |
| `ConfirmModal`       | O.K./Cancel Modal  | `title`, `message`, `onConfirm`                  | `molecules-confirm-modal--default` | Radix Dialog + CVA button group |
| `PaginationControls` | ページネーション UI        | `page`, `pageSize`, `total`, `onChange`          | `molecules-pagination--default`    | キー操作 & スクリーンリーダ対応               |

### 4.3 Organisms

| コンポーネント            | 概要              | 主な props                    | Storybook ID                      | 備考                          |
| ------------------ | --------------- | --------------------------- | --------------------------------- | --------------------------- |
| `ProjectList`      | プロジェクト一覧テーブル    | `projects[]`, `onSelect`    | `organisms-project-list--default` | `react-virtualized` でレンダリング |
| `TaskTable`        | タスク & サブタスク折畳み表 | `tasks[]`, `onStatusChange` | `organisms-task-table--nested`    | 内部で `RowRenderer` memo 化    |
| `SidebarNav`       | アプリ左ナビ          | `currentPath`               | `organisms-sidebar--default`      | navItems config から動的生成      |
| `HeaderBar`        | 上部ヘッダー          | `user`, `onLogout`          | `organisms-header--default`       | Mobile では Drawer に変形        |
| `NotificationList` | トースト通知リスト       | `notifications[]`           | `organisms-notification--stack`   | `@radix-ui/react-toast` 管理  |

### 4.4 Templates

| テンプレート           | 役割                    | 子要素スロット                         | 備考                               |
| ---------------- | --------------------- | ------------------------------- | -------------------------------- |
| `ProjectsLayout` | Projects セクション共通レイアウト | `sidebar`, `content`, `footer?` | `<SidebarNav>` + main content 包む |
| `AuthGuard`      | 認証ガード                 | `children`                      | Clerk Session 監視                 |

### 4.5 Utility Hooks (UI)

| Hook          | 概要           | 依存                | 備考                  |
| ------------- | ------------ | ----------------- | ------------------- |
| `useToast`    | トースト呼び出し API | Zustand `uiStore` | variant/resolver 対応 |
| `useDragDrop` | タスク D\&D 管理  | `@dnd-kit/core`   | センサーカスタム設定          |

---

## 5. コンポーネント命名・配置ルール

1. **ファイル名/コンポーネント名** は必ず一致 (`ProjectList.tsx` 内に `export function ProjectList()`)
2. **default export 禁止** — ツリーシェイキング向上のため
3. スタイルは **Tailwind**。例外的に複雑 UI は `styled‑components` を許容 (要レビュー)
4. **テスト:** `*.test.tsx` を同一ディレクトリに配置。`react-testing-library` 使用

---

## 6. Storybook 運用

| 設定項目              | 規定値                                                                             |
| ----------------- | ------------------------------------------------------------------------------- |
| framework         | `@storybook/react-vite`                                                         |
| アドオン              | `@storybook/addon-a11y`, `@storybook/addon-interactions`, `storybook-dark-mode` |
| Docs tab          | JSDoc から自動抽出 (`react-docgen-typescript`)                                        |
| Visual Regression | Chromatic (main → feat ブランチ差分)                                                  |

---

## 7. i18n キー命名規則

`component.{ComponentName}.{element}.{state}`

例: `component.Button.label.save`, `component.Sidebar.item.projects.active`

---

## 8. 拡張計画 (Backlog)

| 期       | 追加予定                    | 優先度    | 備考                    |
| ------- | ----------------------- | ------ | --------------------- |
| 2025 Q4 | `CommandPalette` オーガニズム | High   | kbar ベース              |
| 2025 Q4 | `KanbanBoard` テンプレート    | Medium | DnD-kit 連携            |
| 2026 Q1 | `ThemeSwitcher` アトム     | Low    | dark / light / system |

---

## 9. 参考リンク

* **shadcn/ui Docs:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
* **class-variance-authority:** [https://cva.style/](https://cva.style/)
* **Radix UI:** [https://www.radix-ui.com/](https://www.radix-ui.com/)

---

<!-- End of File -->
