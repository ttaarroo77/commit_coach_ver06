# プロジェクト最終ディレクトリ構造 — commit‑coach v0.9

> **目的**
> フロントエンド統合・バックエンド刷新後の “完成形” ディレクトリ構成を明示し、追加ファイルや配置ルールを共有する。Next.js (App Router **非**使用) + Supabase Edge Functions を前提に設計。

---

```text
commit-coach/
├── .github/
│   └── workflows/
│       ├── ci.yml               # lint / build / test / e2e
│       └── release.yml          # タグ push → Vercel promote
├── public/
│   ├── icons/
│   └── favicon.svg
├── pages/                       # Next.js ルーティング
│   ├── _app.tsx                 # global providers
│   ├── index.tsx                # redirect → /dashboard
│   ├── dashboard.tsx            # 統合 UI 本体
│   └── api/
│       └── status-preview.ts    # ※暫定：AI コーチ叩き窓口
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Separator.tsx
│   ├── TodayPane.tsx
│   ├── ProjectPane.tsx
│   ├── TaskCard.tsx
│   ├── SubtaskRow.tsx
│   ├── StatusBadge.tsx
│   └── ui/
│       └── Toast.tsx
├── store/
│   └── useProjectStore.ts       # Zustand 集約
├── types/
│   └── domain.ts                # Status enum & 型定義
├── hooks/
│   ├── useRealtimeSubtasks.ts   # Supabase リアルタイム購読
│   └── useScrollToTask.ts       # Today→ProjectPan e スクロール
├── lib/
│   ├── supabaseClient.ts        # singleton
│   ├── dnd-utils.ts             # sortIndex 計算など
│   └── analytics.ts             # vercel/analytics wrapper
├── styles/
│   └── globals.css              # Tailwind base + カスタム
├── scripts/
│   ├── migrate-to-status.ts     # 旧 is_today → status に移行
│   └── seed-demo-data.ts
├── edge-functions/              # Supabase Deno Edge Functions
│   ├── move_subtask.ts
│   ├── reorder_subtasks.ts
│   └── bulk_update_status.ts
├── test/
│   ├── unit/
│   │   └── moveSubtask.spec.ts
│   ├── visual/
│   │   └── task-card.story.tsx  # Storybook snapshots
│   └── e2e/
│       └── dashboard.spec.ts    # Playwright
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   └── archive/
│       └── 2025-22w.md          # Done タスク週次アーカイブ
├── .env.example                 # Supabase keys etc.
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 補足ガイドライン

1. **pages と components の分離**
   ページ直下ではデータ取得 (SWR) とレイアウトのみを担当し、UI ロジックはすべて `components/` に配置。
2. **Edge Functions**
   Supabase CLI の `functions deploy` 対応構造。RPC と同名のファイルで運用。
3. **テスト階層**
   `unit / visual / e2e` の 3 階層で粒度を分け、CI では `unit → visual → e2e` の順に実行。
4. **ドキュメント置き場**
   仕様書は `docs/` に集約し、週次アーカイブは `docs/archive/` へ自動で移動(`archive.sh`).

---

最終更新: 2025-05-22
