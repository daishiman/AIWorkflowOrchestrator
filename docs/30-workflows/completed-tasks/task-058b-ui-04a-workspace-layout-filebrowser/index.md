# TASK-058B-UI-04A-WORKSPACE-LAYOUT-FILEBROWSER: 作業スペースレイアウト基盤

## メタ情報

| 項目         | 値                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-04A-WORKSPACE-LAYOUT                                                                                                                 |
| 元タスク     | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058b-ui-04a-workspace-layout-filebrowser.md` |
| 機能名       | task-058b-ui-04a-workspace-layout-filebrowser                                                                                                |
| 作成日       | 2026-03-10                                                                                                                                   |
| ステータス   | in_progress                                                                                                                                  |
| 総Phase数    | 13                                                                                                                                           |
| 依存タスク   | TASK-UI-00, TASK-UI-01, TASK-UI-02                                                                                                           |
| ブロック対象 | TASK-UI-04B, TASK-UI-04C                                                                                                                     |

## 概要

本 workflow は `WorkspaceView` の 1 ペイン起点レイアウト、ファイルサイドバー、3-pane リサイズ、`WorkspaceStatusBar`、ファイル変更監視を仕様化する。現状コードでは [WorkspaceView](./phase-1-requirements.md) の画面本体は stub、`workspaceSlice` と `fileSelectionSlice` は既存実装で存在するため、既存資産を活用した P50 混在タスクとして扱う。

## SubAgent 分担

| SubAgent   | 担当関心                                          | 主担当 Phase      |
| ---------- | ------------------------------------------------- | ----------------- |
| SubAgent-A | レイアウト、トグル、StatusBar、リサイズ UI        | 1, 2, 4, 5, 11    |
| SubAgent-B | Store 境界、Hook、ファイル監視、IPC 活用          | 1, 2, 5, 6, 9     |
| SubAgent-C | コンポーネントテスト、Hook テスト、カバレッジ監査 | 3, 4, 6, 7, 10    |
| SubAgent-D | Phase 12 文書同期、未タスク検出、教訓反映         | 3, 10, 11, 12, 13 |

## Phase 一覧

| Phase | 名称                 | ファイル                                                       | ステータス |
| ----- | -------------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | pending    |

## 主要成果物

| 区分               | パス                                              | 用途                                                    |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| トレーサビリティ   | `requirements-traceability-matrix.md`             | 元タスク仕様と Phase 仕様の対応表                       |
| task-spec 監査台帳 | `task-specification-creator-compliance-matrix.md` | `task-specification-creator` の要求反映と未反映ゼロ確認 |
| 仕様抽出台帳       | `aiworkflow-requirements-extraction-matrix.md`    | `aiworkflow-requirements` から抽出した正本仕様の根拠    |
| 差分反映台帳       | `branch-diff-reflection-matrix.md`                | 本ブランチ変更と workflow 反映箇所の対応表              |
| 成果物レジストリ   | `artifacts.json`                                  | Phase 成果物登録                                        |
| 検証レポート       | `outputs/verification-report.md`                  | 自動検証結果                                            |

## システム仕様の反映範囲

| 正本仕様                                                                          | 反映内容                                                       |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/master-design.md`              | `WorkspaceView` をプロダクト全体の view 一覧へ位置付ける       |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | Renderer / Main / Preload の層境界と依存方向を固定する         |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | WorkspaceView の UI 責務、Atomic Design、テスト観点            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | `SlideInPanel` を含む共通 UI 基盤の再利用条件                  |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG、WCAG、8px グリッド、responsive 判断の正本とする     |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `workspaceSlice` とローカル state の責務分離、個別セレクタ規約 |
| `.claude/skills/aiworkflow-requirements/references/directory-structure.md`        | 配置パスとディレクトリ境界                                     |
| `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`          | workspace store / main / preload / renderer の責務境界         |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `ViewType="workspace"` と Global Navigation 契約               |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom 前提の component / hook テストパターン               |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | keyboard nav / tree / switch の a11y 手動・自動観点を補強する  |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD、coverage gate、Phase 7/9/10 の品質下限を固定する          |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | watcher と file 読み込みの IPC ライフサイクル / sender 境界    |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | `EACCES` などの権限エラーと UI への surfacing 契約を補う       |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 11 preview preflight、Phase 12 同期手順                  |

## task-spec skill 反映範囲

| task-spec 正本                                                                         | 反映内容                                                                          |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/create-workflow.md`              | create モードの生成順序、Phase 1-3 先行確定、validator 実行を workflow 全体へ反映 |
| `.claude/skills/task-specification-creator/references/phase-templates.md`              | 全 13 Phase に共通節、Subtask 管理、100% 実行確認、次 Phase を反映                |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | Phase 3 / 10 の PASS / MINOR / MAJOR / CRITICAL と戻り先を固定                    |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Phase 11 の screenshot coverage と Phase 12 の必須タスク群を反映                  |
| `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | LOGS 2 ファイル、SKILL 更新、未タスク 3 ステップ完了の同期規則を反映              |
| `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Part 1 / Part 2、documentation-changelog、unassigned detection の実体確認を反映   |
| `.claude/skills/task-specification-creator/references/commands.md`                     | `validate-phase-output.js` と `verify-all-specs.js` を標準検証コマンドとして固定  |

## 検証コマンド

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser

node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser
```
