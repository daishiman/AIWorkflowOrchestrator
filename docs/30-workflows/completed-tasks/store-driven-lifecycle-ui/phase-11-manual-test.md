# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 11                        |
| タスクID   | TASK-10A-F                |
| 機能名     | store-driven-lifecycle-ui |
| 作成日     | 2026-03-08                |
| ステータス | 完了                      |

## 目的

`SkillAnalysisView` / `useSkillAnalysis` の Store 駆動統合が UI 上で正しく動作し、`SkillCreateWizard` の既存 Store 経由フローと合わせて直接 IPC 呼び出しが Renderer から排除されていることを、実画面と証跡で確認する。

## 実行タスク

- 自動テスト前提確認: Phase 9 / 10 を通過したコードだけを手動検証する
- テストケース定義: `TC-ID` 単位で UI 状態と期待結果を固定する
- 撮影計画作成: `outputs/phase-11/screenshot-plan.json` に画面状態を列挙する
- 手動実行と証跡取得: 各 TC に最低 1 枚の `.png` 証跡を紐付ける
- 結果記録と監査: `manual-test-result.md` / `discovered-issues.md` / coverage validator を同期する

## テストケース

| TC-ID    | 内容                                | 優先度 | 期待結果                                                    |
| -------- | ----------------------------------- | ------ | ----------------------------------------------------------- |
| TC-11-01 | SkillAnalysisView 初期表示（dark）  | A      | 分析結果と主要CTAが表示される                               |
| TC-11-02 | SkillAnalysisView 提案選択状態      | A      | 提案選択が UI と state に反映される                         |
| TC-11-03 | SkillAnalysisView 改善適用後表示    | A      | 選択改善後に再分析可能な状態へ遷移する                      |
| TC-11-04 | SkillAnalysisView 自動改善後表示    | A      | 自動改善後に loading 解除と再分析結果が整合する             |
| TC-11-05 | SkillAnalysisView エラー表示        | B      | `skillError` と UI 表示が一致する                           |
| TC-11-06 | SkillAnalysisView ローディング表示  | B      | `isAnalyzing` / `isImproving` に応じて busy UI が表示される |
| TC-11-07 | SkillAnalysisView 初期表示（light） | B      | light theme でも情報欠落や崩れがない                        |
| TC-11-08 | SkillAnalysisView モバイル表示      | C      | 狭幅でも主要操作が継続可能                                  |
| TC-11-09 | SkillCreateWizard Step1 初期表示    | A      | 説明入力と次ステップ導線が表示される                        |
| TC-11-10 | SkillCreateWizard Step2 設定表示    | A      | 設定トグルと generate 導線が動作する                        |
| TC-11-11 | SkillCreateWizard 完了表示          | A      | 作成完了後に完了 UI と一覧同期が確認できる                  |

## 画面カバレッジマトリクス

| テストケース | 画面/状態               | 証跡ファイル候補                                     | 備考                 |
| ------------ | ----------------------- | ---------------------------------------------------- | -------------------- |
| TC-11-01     | Analysis default dark   | `screenshots/TC-01-analysis-default-dark.png`        | dark baseline        |
| TC-11-02     | Analysis selection      | `screenshots/TC-02-analysis-selection-dark.png`      | suggestion selection |
| TC-11-03     | Analysis apply improved | `screenshots/TC-03-analysis-apply-improved-dark.png` | selected apply       |
| TC-11-04     | Analysis auto improved  | `screenshots/TC-04-analysis-auto-improved-dark.png`  | auto improve         |
| TC-11-05     | Analysis error          | `screenshots/TC-05-analysis-error-dark.png`          | error UI             |
| TC-11-06     | Analysis loading        | `screenshots/TC-06-analysis-loading-dark.png`        | busy state           |
| TC-11-07     | Analysis default light  | `screenshots/TC-07-analysis-default-light.png`       | light baseline       |
| TC-11-08     | Analysis mobile         | `screenshots/TC-08-analysis-default-mobile-dark.png` | narrow width         |
| TC-11-09     | Create step1            | `screenshots/TC-09-create-step1-dark.png`            | wizard start         |
| TC-11-10     | Create step2            | `screenshots/TC-10-create-step2-dark.png`            | wizard config        |
| TC-11-11     | Create complete         | `screenshots/TC-11-create-complete-dark.png`         | wizard complete      |

## 参照資料

| 資料名            | パス                                                                                    | 説明                                      |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 1 要件定義  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`   | 直接IPC排除要件と AC の確認               |
| Phase 2 設計      | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`         | state 遷移と P31/P48 ルールの確認         |
| Phase 5 実装      | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md` | 実装境界と selector/action 使用箇所の確認 |
| Phase 10 レビュー | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-10-final-review.md`  | Phase 11 開始条件の確認                   |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                                        | 使用目的                                          |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| UI機能仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Analysis/Create の UI 状態と completed 実績の確認 |
| UIアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | SkillManagementPanel 配下の view 境界確認         |
| 状態管理仕様     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store state/action の正当性確認                   |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26 直接IPC→Store 個別セレクタ移行パターンの確認  |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | Phase 11 文書名・TC証跡同期の再発防止             |

### 前提Phase成果物

| 資料名          | パス                | 用途                               |
| --------------- | ------------------- | ---------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | 要件と AC を照合する               |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計とテストケースを照合する       |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装境界の確認に使う               |
| Phase 6 成果物  | `outputs/phase-6/`  | 追加テストと未カバー観点を参照する |
| Phase 7 成果物  | `outputs/phase-7/`  | coverage 基準充足を参照する        |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタ結果を参照する           |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質ゲート通過結果を参照する       |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビュー結果を参照する         |

## 実行手順

### ステップ 1: preflight と自動テスト確認

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/desktop exec playwright install chromium
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/
pnpm --filter @repo/desktop preview
curl -I http://127.0.0.1:4173/advanced/skill-center?skipAuth=true
```

- build または preview 疎通に失敗した場合は、Phase 11 を継続せず `outputs/phase-12/unassigned-task-detection.md` へ記録する
- `@rollup/rollup-*` や Playwright browser が不足している場合は、上記 preflight を完了してから再撮影する
- 実画面確認前に `phase-11-manual-test.md` / `manual-test-result.md` / screenshot 実体の命名規則を確認する

### ステップ 2: `screenshot-plan.json` を作成

UI/UX 対象タスクのため、`outputs/phase-11/screenshot-plan.json` に TC-ID と状態を記録する。

```bash
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui \
  --plan outputs/phase-11/screenshot-plan.json --dry-run
```

### ステップ 3: テストケース実行と証跡取得

```bash
pnpm --filter @repo/desktop exec node scripts/capture-skill-analysis-view-screenshots.mjs \
  --output-dir ../../docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots

pnpm --filter @repo/desktop exec node scripts/capture-skill-create-wizard-screenshots.mjs \
  --output-dir ../../.tmp/task-10a-f-wizard-screenshots

cp ../../.tmp/task-10a-f-wizard-screenshots/TC-01-step1-initial-dark.png \
  ../../docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots/TC-09-create-step1-dark.png
cp ../../.tmp/task-10a-f-wizard-screenshots/TC-03-step2-configure-dark.png \
  ../../docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots/TC-10-create-step2-dark.png
cp ../../.tmp/task-10a-f-wizard-screenshots/TC-05-step4-complete-dark.png \
  ../../docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots/TC-11-create-complete-dark.png
```

- TC-11-01〜11 を上表どおりに実行する
- `SkillCreateWizard` / `SkillAnalysisView` / `SkillManagementPanel` から `window.electronAPI.skill.*` を直接叩いていないことを `rg` とコード確認で検証する
- `VIS-*` 補助証跡を追加する場合も、TC 本体の `.png` 証跡を先に確保する

### ステップ 4: 結果を `manual-test-result.md` / `discovered-issues.md` に記録

- `outputs/phase-11/manual-test-result.md` に `テストケース` 列と証跡列を持つ結果表を作成する
- `outputs/phase-11/discovered-issues.md` は 0 件でも出力する
- 再撮影した場合は screenshot 実ファイルの `stat` 時刻と文書記録を同期する

### ステップ 5: スクリーンショット網羅性 validator を実行

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui
```

## 統合テスト連携

- 手動テストで発見された問題は Phase 6 の追加テスト観点へ還元する
- `manual-test-result.md` の state 遷移結果を Phase 12 `implementation-guide.md` と同期する
- 直接 IPC 呼び出しが発見された場合は Phase 5 に戻し、Store action 経由へ是正する

## 多角的チェック観点

| 観点                | 確認内容                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| 機能正当性          | 作成・分析・改善の主要フローが store action 経由で完結する                        |
| 状態一貫性          | `currentAnalysis` / `isAnalyzing` / `isImproving` / `skillError` と UI が一致する |
| エラー回復性        | エラー後に loading が解除され、再試行が可能になる                                 |
| IPC排除検証         | Renderer から `window.electronAPI.skill.*` を直接呼び出していない                 |
| P31/P48再発防止     | 個別セレクタ由来の参照安定性と派生 selector ルールが維持されている                |
| テーマ/レスポンシブ | dark / light / mobile の主要状態が確認できる                                      |

## 成果物

| 成果物             | パス                                                                                                 | 説明                   |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| 手動テスト仕様書   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-11-manual-test.md`                | 本ドキュメント         |
| 手動テスト結果     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/manual-test-result.md` | TC別の結果と証跡紐付け |
| 発見課題           | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/discovered-issues.md`  | 修正済み/未修正課題    |
| スクリーンショット | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots/`          | `.png` 証跡            |
| 撮影計画           | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshot-plan.json`  | TC-ID と状態一覧       |

## 完了条件

- [x] `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` が存在する
- [x] `outputs/phase-11/screenshot-plan.json` が作成されている
- [x] `outputs/phase-11/manual-test-result.md` が作成されている
- [x] `outputs/phase-11/discovered-issues.md` が 0 件でも作成されている
- [x] TC-11-01〜11 の各テストケースに最低 1 枚の `.png` 証跡が紐付いている
- [x] `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui` が PASS している
- [x] `SkillCreateWizard` / `SkillAnalysisView` から `window.electronAPI.skill.*` の直接呼び出しが 0 件であることを確認済み
- [x] dark / light / mobile の必要状態が確認済みである
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
