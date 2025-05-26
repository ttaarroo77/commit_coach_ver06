# フロントエンド移行ガイド (v2 – 旧シングルペイン UI → 2-Tab UI)

本書は既存の Vue/React 混在ダッシュボード (旧シングルペイン構成) から、**Plan / Work の 2-タブ UI** へコードベースを段階的に移行するための手順書である。**ダウンタイムなし**・**段階的リリース** を目標とし、**feature flag** と **CI/CD パイプライン** を活用してリスクを最小化する。

> **対象リポジトリ**: `github.com/ttaarroo77/commit_coach_ver04`
>
> **移行対象ブランチ**: `main` → `feat/002-ui-2-tab`

---

## 1. 移行方針まとめ

1. **コード共存期間**を設け、旧 UI と新 UI を同じ bundle に同梱。<br>→ `?uiVersion=v2` クエリ or userFlag でトグル。
2. **feature flag** で Canary → Beta → 100% Rollout の 3 段階展開。
3. 旧 Vue コンポーネントを React 化し次第、**シャドー DOM** 内でレンダリングしてユーザ側から差し替え。
4. 完全移行後に不要コードと CSS Token を削除し、Bundle Size を再最適化。

---

## 2. 前提条件 / 必要バージョン

| ツール        | 推奨バージョン                        |
| ---------- | ------------------------------ |
| Node.js    | ≥ 20.x                         |
| PNPM       | ≥ 9.x                          |
| react      | 18.3                           |
| vite       | 5.x                            |
| typescript | 5.5                            |
| eslint     | @commit-coach/eslint-config v3 |

---

## 3. タイムライン (目安)

| Phase                          | 期間    | 主要タスク                                              |
| ------------------------------ | ----- | -------------------------------------------------- |
| **P0: 準備**                     | 0.5 w | Feature flag プロビジョニング、CI ジョブ複製                     |
| **P1: コンポーネント実装**              | 2 w   | ProjectCard / TaskCard / SubtaskListItem 完成、E2E 通過 |
| **P2: 社内 Dogfood (Canary 5%)** | 1 w   | パフォーマンス計測、エラー率 0.1% 未満確認                           |
| **P3: ベータ (30%)**              | 1 w   | ユーザ feedback + バグ修正                                |
| **P4: 全体公開**                   | 0.5 w | 旧 UI フォールバック維持、エラーログ監視                             |
| **P5: デッドコード削除**               | 0.5 w | Vue ファイル・旧 CSS Token 削除                            |

---

## 4. Feature Flag 戦略

### 4.1 新規フラグ定義

| Key                    | Type        | Default | 対象環境      |
| ---------------------- | ----------- | ------- | --------- |
| `dashboard.v2.enabled` | boolean     | false   | prod/stg  |
| `dashboard.v2.percent` | int (0-100) | 0       | prod only |

#### 4.2 実装例 (LaunchDarkly)

```ts
import { useFlags } from "launchdarkly-react-client-sdk";

export const useIsV2Enabled = (): boolean => {
  const { "dashboard.v2.enabled": enabled, "dashboard.v2.percent": pct } = useFlags();
  const hash = window.localStorage.getItem("userHash") ?? "0";
  return enabled && Number(hash) % 100 < pct;
};
```

### 4.3 切替ポイント

```tsx
export const DashboardRouter = () => {
  const v2 = useIsV2Enabled();
  return v2 ? <DashboardV2 /> : <DashboardV1 />;
};
```

---

## 5. コンポーネント置換マトリクス

| 旧 (Vue)           | 新 (React)             | 置換ステータス | 備考                           |
| ----------------- | --------------------- | ------- | ---------------------------- |
| `ProjectCard.vue` | `ProjectCard.tsx`     | ✅ 完了    | DragHandle + InlineEditor 統合 |
| `TaskItem.vue`    | `TaskCard.tsx`        | ✅ 完了    | —                            |
| `SubtaskItem.vue` | `SubtaskListItem.tsx` | ✅ 完了    | —                            |
| `Sidebar.vue`     | (保留)                  | ⏳ 計画外   | Epic v2.2 で再設計               |

> **TIP**: 置換後 1-2 日は旧コンポーネントもコードベースに残し、`console.warn("V1 Fallback")` を仕込んで意図せず呼ばれていないか検証する。

---

## 6. コードモッド / 自動変換

1. **Vue SFC → React**: `vue-to-react-codemod` を fork し、JSX + TSX 対応を拡張。
2. **Composition API** → `useXxx` Hook に書換。
3. `v-bind:class` → `clsx` 関数へ一括置換。

```bash
pnpm codemod vue2react "src/**/*.vue"
```

---

## 7. CSS Token 移行

### 7.1 新旧対応表

| 旧 Token (sass) | 新 Token (tailwind)                                   | 注記                 |
| -------------- | ---------------------------------------------------- | ------------------ |
| `$primary`     | `text-primary` (class) / `--color-primary` (css var) | #4F6AFB に統一        |
| `$bg-card`     | `bg-surface`                                         | rgba 変換済           |
| `$radius-md`   | `rounded-lg`                                         | `12px` → `0.75rem` |

### 7.2 Tailwind preset 更新

`tailwind.config.js` に以下を追加:

```js
module.exports = {
  theme: {
    colors: {
      primary: "#4F6AFB",
    },
    borderRadius: {
      lg: "0.75rem",
    },
  },
};
```

---

## 8. ビルド・CI 調整

* **vite alias** に `@components/v2/*` を追加。
* Storybook を `main.ts` で `/v2/` 配下の stories を読み込み。
* CI matrix に `build:v2` ジョブを新設し、Bundle size 差分 (`size-limit`) を PR コメントへ出力。

---

## 9. QA チェックリスト (抜粋)

| 項目            | OK 基準                                     |
| ------------- | ----------------------------------------- |
| **レンダリング**    | 200 件プロジェクトで 60 fps 以上                    |
| **アクセシビリティ**  | 全操作がキーボードで実行可能 (WCAG 2.1 AA)              |
| **パーマリンク**    | `/dashboard?uiVersion=v1` が常に fallback 動作 |
| **エラーハンドリング** | API 500 時にトースト表示 + 再試行で成功                 |

---

## 10. ロールバック手順

1. LaunchDarkly で `dashboard.v2.enabled` を即時 OFF。
2. CloudFront CDN キャッシュを invalidation。
3. Sentry Issue #top を確認し、原因 Pull Request を revert。

平均復旧目標 (MTTR): **< 5 分**。

---

## 11. 完了後のクリーンアップ

* `/src/vue/` ディレクトリを削除
* `dashboard.v2.*` フラグを **2025-12** で Sunset
* ESLint ルール `no-vue-imports` を追加し再発防止

---

## 12. 付録

### 12.1 Canary ユーザを手動指定するスニペット

```js
// DevTools Console で実行
localStorage.setItem("userHash", "7");
```

### 12.2 LaunchDarkly リリースノート雛形

```md
### Rollout 2-Tab Dashboard
- Phase: Beta (30%)
- Metrics:
  - JS Error Rate < 0.1%
  - Page Load < 300 ms (P75)
- Rollout schedule: 2025-06-10 10:00 JST
```

---

© 2025 Commit Coach フロントエンドチーム
