# scratchpad.md — Dashboard “2‑Tab UI” 要件チェックリスト

> **目標スコープ**: 既存 Dashboard 画面を「Today / Unscheduled」の **2 タブ方式** に改修し、UI 破綻なくリリースできる状態にする。
> **アウト・オブ・スコープ**: 3 タブ以上の拡張・新 API 設計・全面デザインシステム導入。
> **ゴール定義**: 2 タブ切替で **(1) 表示切替 150 ms 以内**、**(2) URL 同期**、**(3) e2e テスト通過**。

## 📝 作業完了リスト

* [x] **Dashboard タイトル編集機能の改修**
  * [x] `HierarchicalTaskItem`を`EditableHierarchicalTaskItem`に置換
  * [x] 編集開始イベントの実装（ダブルクリックとペンアイコン押下）
  * [x] ペン＆ごみ箱アイコンの常時表示化
  * [x] 編集モード時の背景色変更

---

## 📃 多層チェックリスト

### 1. 情報設計

* [ ] \[P0] **UI 要件の整理**

  * [ ] Figma モックで要素一覧を抽出
  * [ ] タブ切替時に **保持する state / 破棄する state** を整理

    * [ ] 選択プロジェクト ID
    * [ ] 展開状態 (`expanded`)
    * [ ] 編集中タイトル (`editingTitle`)
* [ ] \[P1] **ユーザーシナリオ確認**

  * [ ] 通常タスク追加フロー
  * [ ] D\&D 移動→タブ自動切替フロー
  * [ ] スマホ（幅 375 px）閲覧フロー

### 2. レイアウト / Tab コンポーネント

* [ ] \[P0] **Tab API 決定**

  * [ ] `@/components/ui/tabs` 再利用可否調査
  * [ ] props: `tabs: { id: string; label: string; badge?: number }[]`
* [ ] \[P0] **アクセシビリティ**

  * [ ] `role="tablist"` / `role="tab"` / `aria-selected` 実装
  * [ ] キーボード操作 (←/→/Home/End) 確認
* [ ] \[P1] **レスポンシブ**

  * [ ] モバイル時に bottom navigation 化の是非検討

### 3. ルーティング & URL 同期

* [ ] \[P0] **クエリパラメータ設計**

  * [ ] `/dashboard?view=today` vs パス分割 `/dashboard/today`
  * [ ] ブラウザバック動作テスト
* [ ] \[P0] **Next.js Segment 追加**

  * [ ] `app/dashboard/(tabs)/today/page.tsx`
  * [ ] `app/dashboard/(tabs)/unscheduled/page.tsx`
* [ ] \[P1] **Deep Linking QA**

  * [ ] 直接 URL でアクセス → 正常描画

### 4. 状態管理

* [ ] \[P0] **タブ状態**

  * [ ] Zustand store `dashboard.view`
  * [ ] Persist middleware で LS 保存
* [ ] \[P1] **派生 Selector**

  * [ ] `selectVisibleProjects(view)` 実装

### 5. コンポーネント分割

* [ ] \[P0] **現在の `DashboardNestedList` を分解**

  * [ ] `DashboardListToday.tsx`
  * [ ] `DashboardListUnscheduled.tsx`
* [ ] \[P0] **共通部品抽出**

  * [ ] `ProjectCard`
  * [ ] `TaskRow`
* [ ] \[P2] Storybook 追加

### 6. スタイリング / 動作

* [ ] \[P0] **Tab 切替アニメーション** (Framer Motion)

  * [ ] Fade + Slide 20 px
  * [ ] prefers-reduced-motion 対応
* [ ] \[P1] **高さ揺れ対策**

  * [ ] 同一高さコンテナ & `overflow‑anchor` 無効化

### 7. テスト

* [ ] \[P0] **ユニット** (Jest + Testing Library)

  * [ ] 初期レンダーが Today
  * [ ] タブクリック → 期待タスクが表示
* [ ] \[P0] **e2e** (Playwright)

  * [ ] URL 直打ち `/dashboard/unscheduled` で Unscheduled タブ
  * [ ] D\&D でタスク移動 → 他タブに表示される
* [ ] \[P1] **AXE 自動テスト**

### 8. パフォーマンス

* [ ] \[P1] **Code‑Split**

  * [ ] `dynamic()` でタブ毎に遅延読み込み
* [ ] \[P2] **React.memo** 適用箇所洗い出し

### 9. アナリティクス

* [ ] \[P2] Tab 切替イベントを `gtag("event", "dashboard_view_change")` 送信
* [ ] \[P3] ヒートマップ要件検討

### 10. ロールアウト計画

* [ ] \[P0] **フラグ管理**

  * [ ] LaunchDarkly flag `dashboard_2tab`
  * [ ] QA グループ 100 % → ステージ
* [ ] \[P0] **リリースノート**草案
* [ ] \[P1] **撤退戦略**

  * [ ] フラグ OFF で旧 UI 復帰確認

---

## 参考リンク

* `x_docs_refactoring` ➜ *UI Layer/Navigation.md*
* Figma ➜ *Dashboard v2 / Page32*
* 課題: [https://github.com/ttaarroo77/commit\_coach\_ver04/issues/123](https://github.com/ttaarroo77/commit_coach_ver04/issues/123)
