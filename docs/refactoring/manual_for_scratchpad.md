# Commit Coach – Ver.0 ポートフォリオ化実装マニュアル
_Branch:_ **feat/007-ui-ux-polish**
_作成日:_ 2025-06-03
_更新日:_ 2025-06-04

---

## 0. 全体像

> **ゴール:**
> 「動く URL ＋ README ＋ 品質を担保する CI/CD」をワンセットで用意し、
> 就職活動のポートフォリオとして提出できる状態に仕上げる。

---

## 1. ワークフロー設計

| フェーズ | ゴール | 手法／ツール | 具体的な進め方 |
|----------|-------|-------------|----------------|
| **1. イシュー駆動化** | _追える粒度_ に分解 | GitHub **Issues / Projects** | - Phase をエピック Issue 化<br>- チェックリスト項目を子 Issue 化<br>- Projects β kanban で進捗可視化 |
| **2. ブランチ運用** | レビュー前提の小 PR 量産 | **GitHub Flow** | `feat/<scope>` / `chore/<scope>` → **≤300 行**で PR → rebase-merge |
| **3. PR レビュー設計** | 品質 & ストーリー担保 | PR テンプレ／コードオーナー | `.github/PULL_REQUEST_TEMPLATE.md` に:<br>・概要・スクショ<br>・必要性 (ポートフォリオ用途)<br>・動作確認手順 |
| **4. 自動テスト & CI** | 緑バッジで信頼性可視化 | **GitHub Actions** × **pnpm** | ワークフロー:`lint → type-check → jest → playwright → build`<br>Cursor/Windsurf で failing-test 生成 → **o3** が実装設計 |
| **5. プレビュー/本番デプロイ** | 動く URL を毎 PR で共有 | **Vercel Preview** | preview 環境には `service_role_key` を渡さない<br>PR に自動 URL コメント |
| **6. Docs as Code** | 仕様変更と同時に docs 更新 | `docs/` + **MDX** | 同一 PR でドキュメントも修正<br>Mermaid で ER 図生成 (`npx mmdc`) を CI |
| **7. UI/UX 品質ゲート** | 見た目の破壊を防止 | **Storybook + Chromatic** | 主要コンポーネントを Storybook 化<br>Chromatic visual-diff → 変化時に PR fail |
| **8. 最終リリースタグ** | 提出物を固定 | SemVer タグ & GitHub Release | `v0.0.0-portfolio` タグ<br>Release notes に: 🟢 機能一覧／🛠 技術／🎥 Demo GIF |

---

## 2. 実行中のスプリント状況 (2025-06-04更新)

| Day | 予定 | 実際の進捗状況 |
|-----|---------------|---------------|
| **Tue (06-03)** | Phase 1 (Deploy) & Phase 2 (README) | ✅ README更新、ビルド確認完了 |
| **Wed (06-04)** | Storybook 初期化 | ✅ AIタスク分解機能実装
✅ 日本語IME入力対応改善 |
| **Thu (06-05)** | 最初は「e2eテスト雑形」 | → **修正計画**: 
1. 本番環境でのAI機能テスト
2. タスク優先度変更機能実装
3. `HierarchicalTaskItem`型エラー修正 |
| **Fri (06-06)** | Phase 3 UI/UX 改修 PR | - |
| **Sat (06-07)** | Lint / test 確認 | - |
| **Sun (06-08)** | リリースノート仕上げ | - |

---

## 3. TDD 用チェックリストひな形

```text
- [ ] routes/app.spec.ts        # API 健康チェック
- [ ] auth/login.spec.ts        # ログイン成功/失敗
- [ ] chat/stream.spec.ts       # 逐次レスポンスが来る
- [ ] ui/mobile.snap            # Storybook スクリーンショット一致
````

1. **Cursor** に「赤いテスト」を生成させる
2. **o3** に「緑にする実装」を設計させる
3. CI が緑 → マージ

---

## 4. 面接官が見る“効率”アピールポイント

| 観点          | アピール方法                                     |
| ----------- | ------------------------------------------ |
| **設計の意図**   | PR 説明・README に「課題→解決策」を必ず書く                |
| **チーム開発耐性** | 小 PR + self-review + CI で discussion ログを残す |
| **品質への姿勢**  | Red→Green→Refactor の履歴を明示的に残す              |

---

## 5. すぐ使えるコマンド集

```bash
# CI と同じローカルテスト
pnpm lint && pnpm type-check && pnpm test && pnpm build

# Storybook
pnpm storybook

# e2e (Playwright)
pnpm exec playwright test
```

---

### Appendix A — `.github/PULL_REQUEST_TEMPLATE.md` 例

```md
## 概要
<!-- 何を / なぜ -->

## スクリーンショット
| Before | After |
|--------|-------|
| ![before](...) | ![after](...) |

## 動作確認
1. `pnpm dev`
2. `/dashboard` で ○○を確認

## レビュー観点
- [ ] UI の破壊がないか
- [ ] テストが追加されているか
```

---

*このファイルを `docs/manuals/portfolio_workflow.md` としてコミットし、
windsurf に貼り付けてください。*
