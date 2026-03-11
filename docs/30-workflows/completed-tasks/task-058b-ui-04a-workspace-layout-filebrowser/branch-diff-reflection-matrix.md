# ブランチ差分反映マトリクス

## 目的

本ブランチで追加した仕様書変更が、`task-specification-creator` と `aiworkflow-requirements` のどの要求に対応しているかを明示する。

| 変更ファイル                                                          | 反映した skill 要件                                        | 補足                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `index.md`                                                            | 13 Phase 一覧、SubAgent 分担、主要成果物、システム仕様参照 | create モードの workflow index             |
| `task-specification-creator-compliance-matrix.md`                     | task-spec 正本要求の監査台帳                               | 破棄ではなく正規化で整える方針を明文化     |
| `requirements-traceability-matrix.md`                                 | 元タスク仕様から Phase 仕様へのトレース                    | task-spec の要件一貫性                     |
| `aiworkflow-requirements-extraction-matrix.md`                        | 正本仕様の抽出根拠を可視化                                 | requirements スキル準拠の証跡              |
| `phase-1` から `phase-13`                                             | 共通テンプレート節の完全化、100% 実行確認、次 Phase 導線   | `phase-templates.md` の欠落補完            |
| `phase-1-requirements.md`                                             | P50 調査、FR/NFR、スコープ境界、SubAgent 分担              | Phase 1-3 先行確定の要件                   |
| `phase-2-design.md`                                                   | layout / component / state / IPC / watcher 設計            | design-phases / generate-task-specs の反映 |
| `phase-3-design-review.md`                                            | gate 判定、P31/P5/Phase 12 運用観点                        | review gate                                |
| `phase-4` から `phase-10`                                             | TDD / coverage / QA / final review                         | execute workflow の標準 13 phase           |
| `phase-11-manual-test.md`                                             | preview preflight、TC、screenshot 証跡、coverage matrix    | phase-11-12-guide 反映                     |
| `phase-12-documentation.md`                                           | Part 1/2、Step 1-A/B/C、LOGS / SKILL 更新、未タスク検出    | phase12 checklist / evidence sync 反映     |
| `phase-13-pr-creation.md`                                             | PR 準備のみ、commit / PR 保留条件                          | ユーザー制約を明示                         |
| `artifacts.json`                                                      | create モード初期化と phase registry                       | init-artifacts                             |
| `outputs/verification-report.md`                                      | verify-all-specs 出力                                      | 自動検証証跡                               |
| `apps/desktop/src/renderer/views/WorkspaceView/*`                     | Workspace 04A 本実装、hook、component、test 追加           | 実装コードと Phase 5-11 証跡の対応         |
| `apps/desktop/src/main/ipc/fileHandlers.ts` / `fileHandlers.test.ts`  | file watch Main handler と contract test 追加              | 既存 preload 契約の Main 実装補完          |
| `apps/desktop/src/renderer/main.tsx`                                  | Phase 11 dedicated harness 追加                            | screenshot 安定化                          |
| `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs` | current worktree build を static 配信して screenshot 取得  | worktree capture drift 対策                |

## 現時点の差分評価

| 観点              | 判定     | 内容                                                                                                           |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| task-spec 準拠    | 改善済み | Phase 全体をテンプレート準拠へ正規化し、task-spec 監査台帳を追加                                               |
| requirements 抽出 | 改善済み | architecture / design-principles / quality / a11y / error-handling まで抽出範囲を拡張                          |
| 実装コード反映    | 改善済み | workflow 文書と実装コード・テスト・screenshot harness を同一 workflow 配下の outputs と system spec に接続した |
