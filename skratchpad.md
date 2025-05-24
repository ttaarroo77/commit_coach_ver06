# 🗒️ commit‑coach Scratchpad — リファクタ MVP 版

> **目的** 
> UI を崩さずに「status 属性一本化 & 2 ページ運用」を完了し、最低限の AI コーチ連携まで持っていく。Cursor / windsurf どちらでも同じ単一ファイルを見ながら進捗管理する。

---

## セクション定義（固定）

* **Backlog** – まだ手を付けていないタスク（優先度順）
* **In Progress** – 着手中のタスク
* **Blockers / Errors** – 直近で詰まっている技術課題
* **Done** – 終わったらここへ移動（週次でアーカイブ）
* **Ideas & Icebox** – いつかやるかもしれないアイデア
* **Meta** – Scratchpad の運用ルールメモ

フォーム例（流用）：

```markdown
- [ ] タスク名 – ラベル – 期日
  - Context: 背景
  - Owner: @担当者
  - Confidence: 0‑100
```

---

# Backlog

### 💡 Milestone `status-refactor-MVP`

* [ ] **1️⃣  Task 型に `status` 追加** – feature – 2025‑05‑22

  * Context: `/lib/dashboard-utils.ts` に

    ```ts
    status: 'today' | 'unscheduled' | 'done'
    ```
  * Owner: @Taro
  * Confidence: 90
* [ ] **2️⃣  旧データ移行スクリプト作成** – chore – 2025‑05‑22

  * Context: `scripts/migrate-to-status.js` で `tasks.json` を出力
  * Confidence: 85
* [ ] **3️⃣  `use-dashboard` をフィルタ方式へ書換** – refactor – 2025‑05‑22

  * Context: today / backlog 取得ロジックを `status` 参照に変更
* [ ] **4️⃣  `DashboardNestedList` ラベル動的化** – ui – 2025‑05‑23

  * Context: `STATUS_LABEL` マップで表示切替
* [ ] **5️⃣  `/projects` ページを projectId フィルタに** – feature – 2025‑05‑23
* [ ] **6️⃣  手動スモークテスト（PC / Mobile）** – test – 2025‑05‑24

  * Checklist:

    * [ ] today → 未定 移動反映
    * [ ] スマホ幅で右パネル非表示
    * [ ] リロード後にも位置保持
* [ ] **7️⃣  D\&D を一旦 OFF、プルダウンに差替え** – ui – 任意
* [ ] **8️⃣  localStorage → Supabase 切替** – feature – 任意

  * Sub‑tasks:

    * [ ] Supabase プロジェクト作成 & `tasks` テーブル
    * [ ] `.env.local` 追加
    * [ ] SDK 化 & CRUD 差替え
    * [ ] JSON インポート
* [ ] **9️⃣  AI コーチ最小 API 連携** – feature – 任意

---

# In Progress

*(空欄で開始)*

---

# Blockers / Errors

*(詰まったらここへ移動)*

---

# Done

*(完了したらここへ移動)*

---

# Ideas & Icebox

* [ ] タスク仮想化 (react‑window)
* [ ] GPT‑4o で「今日やるべきタスク提案」

---

# Meta

* 毎朝 stand‑up 時に **In Progress** を確認、終わったら **Done** へ移動。
* 週末に **Done** を `docs/archive/YYYY‑WW.md` へ退避。
