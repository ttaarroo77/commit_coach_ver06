# 03\_State\_Management

> **バージョン:** 2025-05-30 (draft)
<!-- > **対象ブランチ:** `feature/remove-dashboard` -->
> **責任者:** @nakazawatarou

---

## 1. ドキュメントの目的

本書は Commit Coach フロントエンドの **状態管理戦略** を体系的にまとめるものです。`/projects` 画面へフォーカスした新アーキテクチャにおいて、Zustand を中心とした各ストア設計・副作用層との接続・パフォーマンス最適化・テスト方針を定義します。

<!-- 元の記述: 本書は Commit Coach フロントエンドの **状態管理戦略** を体系的にまとめるものです。Dashboard 機能を撤去し `/projects` 画面へフォーカスした新アーキテクチャにおいて、Zustand を中心とした各ストア設計・副作用層との接続・パフォーマンス最適化・テスト方針を定義します。 -->

---

## 2. 採用ライブラリと原則

| ライブラリ                     | 用途                       | 採用理由                       |
| ------------------------- | ------------------------ | -------------------------- |
| **Zustand** (`^4`)        | グローバル状態                  | ボイラープレート最小・Hooks API・小サイズ  |
| **Zustand/Middleware**    | Persist, Immer, Devtools | localStorage 永続化・イミュータブル更新 |
| **TanStack Query** (`^5`) | Server state / キャッシュ     | リトライ・キャッシュ・Suspense        |
| **Immer**                 | イミュータブル操作                | 深いネストを安全に更新                |

> **原則:**
>
> 1. **Server State と UI State を分離** (TanStack Query vs Zustand)
> 2. **Single Source of Truth** — Redux Toolkit 併存時でも重複保持しない
> 3. **Selector & Shallow Compare** — レンダリング最適化必須

---

## 3. ストア全体像

```
┌─────────────────────┐
│      Zustand        │
│─────────────────────│
│ projectStore        │
│ taskStore           │
│ uiStore             │
│ authStore           │
│ notificationStore   │
└─────────────────────┘
          ▲
          │  subscription
          ▼
┌─────────────────────┐
│   React Components  │
└─────────────────────┘
          ▲
          │  hook (useQuery)
          ▼
┌─────────────────────┐
│   TanStack Query    │
└─────────────────────┘
          ▲
          │ HTTP/WS
          ▼
┌─────────────────────┐
│     Backend API     │
└─────────────────────┘
```

---

## 4. ストア定義詳細

### 4.1 projectStore

```ts
export interface ProjectState {
  projects: Project[];
  selectedId: string | null;
  setProjects: (ps: Project[]) => void;
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  removeProject: (id: string) => void;
  selectProject: (id: string | null) => void;
}
```

* **Persist:** しない (server source)
* **Subscribe Example:** `useProjectById(id)`

### 4.2 taskStore

```ts
interface TaskState {
  expandedIds: Set<string>; // UI 展開状態
  setExpanded: (id: string, open: boolean) => void;
}
```

* **Note:** タスクデータ本体は **TanStack Query** で取得。

### 4.3 uiStore

| Key         | 型                                       | 説明                 |
| ----------- | --------------------------------------- | ------------------ |
| theme       | "light"\|"dark"\|"system"               | テーマスキーマ            |
| sidebarOpen | boolean                                 | SP サイズ時 Sidebar 表示 |
| modal       | { type: ModalType; props: any } \| null | 全画面 Modal 状態       |

### 4.4 authStore (Clerk ラッパー)

* 現状は Clerk の Hook を直接使用。**脱外部依存時** に Local store 化予定。

### 4.5 notificationStore

```ts
interface Notification {
  id: string;
  title: string;
  message?: string;
  variant: "info" | "success" | "error";
  createdAt: number;
}
```

* Add/remove API を公開し `<ToastProvider>` でレンダリング

---

## 5. Derived State & Selectors

```ts
import { shallow } from "zustand/shallow";

// 例: 現在選択中プロジェクト
export const useCurrentProject = () =>
  useProjectStore(
    (s) => s.projects.find((p) => p.id === s.selectedId),
    shallow,
  );
```

* 可能な限り **selector を外部定義** し reusability を確保
* `shallow` or `deepEqual` を常用することで再レンダリングを最小化

---

## 6. 副作用管理 (Effect Layer)

| 処理                | 実装                                 | トリガー                       | メモ                           |
| ----------------- | ---------------------------------- | -------------------------- | ---------------------------- |
| CRUD fetch        | TanStack Query                     | component mount / mutation | キャッシュキー = `["projects", id]` |
| WebSocket Push    | Pusher + useEffect                 | connection open            | taskStore へ state merge      |
| Optimistic Update | zustand + queryClient.setQueryData | UI レイテンシ削減                 | 失敗時 rollback                 |

---

## 7. 永続化 & ハイドレーション

| store             | persist? | medium       | version | migration         |
| ----------------- | -------- | ------------ | ------- | ----------------- |
| uiStore           | ✅        | localStorage | v3      | `migrateUiV2toV3` |
| projectStore      | ❌        | -            | -       | -                 |
| taskStore         | ❌        | -            | -       | -                 |
| notificationStore | ❌        | -            | -       | -                 |

```ts
import { persist } from "zustand/middleware";

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({ theme: "system", sidebarOpen: false, modal: null }),
    {
      name: "cc-ui", // Storage key
      version: 3,
      migrate: migrateUiV2toV3,
    },
  ),
);
```

---

## 8. React コンポーネントとの接続パターン

### 基本

```tsx
const { theme } = useUiStore((s) => ({ theme: s.theme }));
```

### セレクタ & Shallow

```tsx
const { expandedIds, setExpanded } = useTaskStore(
  (s) => ({ expandedIds: s.expandedIds, setExpanded: s.setExpanded }),
  shallow,
);
```

### Server State との連携

```tsx
const { data: tasks } = useQuery({
  queryKey: ["tasks", projectId],
  queryFn: () => fetchTasks(projectId),
});

useEffect(() => {
  if (tasks) taskStore.setTasks(tasks);
}, [tasks]);
```

---

## 9. テスト戦略

| レイヤ                  | ツール                            | カバレッジ目標          |
| -------------------- | ------------------------------ | ---------------- |
| Unit (selectors)     | Jest + ts-jest                 | 95 %             |
| Hook (store actions) | `@testing-library/react-hooks` | CRUD 流れ          |
| E2E                  | Playwright                     | フロー (ページ遷移・ドラッグ) |

### Mock Store Utility

```ts
export const renderWithStore = (
  ui: React.ReactElement,
  { projectState = {}, uiState = {} } = {},
) =>
  render(<StoreProvider project={projectState} ui={uiState}>{ui}</StoreProvider>);
```

---

## 10. コーディングガイドライン

1. **不要なレンダリング防止** — `subscribeWithSelector` を検討
2. **Immer を乱用しない** — パフォーマンス劣化に注意
3. **デバッグ** — `devtools` ミドルウェアは dev 環境のみ bundle
4. **型安全** — 決して `any` で突っ込まない。Partial 更新には専用関数を用意

---

## 11. マイグレーション手順 (v2 → v3)

1. `yarn remove redux react-redux`
2. `yarn add zustand @tanstack/react-query immer` (既存プロジェクトは skip)
3. `src/stores/` 下に新ストアを追加
4. 既存 `mapStateToProps` を Hook 呼び出しに差し替え
5. Persist Migration Script 実行

---

## 12. 今後の拡張計画

| 期       | 施策                 | 詳細                             |
| ------- | ------------------ | ------------------------------ |
| 2025 Q4 | Redux Toolkit 併存実験 | 大規模チーム向けルーム機能試験                |
| 2026 Q1 | Zustand v5 移行      | React 20 対応 & Partial Suspense |

---

## 13. 参考リンク

* **Zustand Docs:** [https://docs.pmnd.rs/zustand/getting-started](https://docs.pmnd.rs/zustand/getting-started)
* **TanStack Query:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
* **Clerk Integration Guide:** [https://clerk.com/docs/reference/react](https://clerk.com/docs/reference/react)

---

<!-- End of File -->
