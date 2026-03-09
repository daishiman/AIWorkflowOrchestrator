# Phase 11: 手動テスト - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-10A-G                 |
| Phase    | 11 - 手動テスト            |
| 前Phase  | `phase-10-final-review.md` |
| 次Phase  | Phase 12（ドキュメント）   |

## 目的

本タスクは tests-hardening だが、ユーザー要求に基づき画面証跡を必須で取得し、**TC単位で screenshot を紐付けて回帰状態を確認**する。

## テストケース

| テストケース | 対象画面/状態                          | 検証観点             | 期待結果                                                             |
| ------------ | -------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| TC-11-01     | SkillCreateWizard 初期表示（dark）     | create導線の初期状態 | ステップ表示、入力欄、次へボタンが表示される                         |
| TC-11-02     | SkillCreateWizard エラー表示（dark）   | create失敗時のUI     | エラー文言と再試行導線が表示される                                   |
| TC-11-03     | SkillAnalysisView 既定表示（dark）     | analysis表示基本形   | スコア/カテゴリ/改善候補が表示される                                 |
| TC-11-04     | SkillAnalysisView 改善候補選択（dark） | 選択状態のUI保持     | 選択チェックと優先度表示が正しい                                     |
| TC-11-05     | SkillAnalysisView エラー表示（dark）   | エラー回復前状態     | エラーメッセージが表示される                                         |
| TC-11-06     | SkillAnalysisView ローディング（dark） | `isAnalyzing` 中UI   | 分析中インジケータが表示される                                       |
| TC-11-07     | SkillManagementPanel 一覧表示          | list view 回帰       | imported/available一覧と操作ボタンが表示される                       |
| TC-11-08     | SkillManagementPanel create view       | list→create 遷移     | create wizard が表示される                                           |
| TC-11-09     | ChatPanel 実行中状態                   | 実行中の排他制御     | `skill-management-toggle` が disabled で streaming view が表示される |

## 画面カバレッジマトリクス

| テストケース | 対象コンポーネント   | 状態            | 証跡                                                    |
| ------------ | -------------------- | --------------- | ------------------------------------------------------- |
| TC-11-01     | SkillCreateWizard    | 初期表示        | `screenshots/TC-11-01-create-wizard-initial-dark.png`   |
| TC-11-02     | SkillCreateWizard    | エラー表示      | `screenshots/TC-11-02-create-wizard-error-dark.png`     |
| TC-11-03     | SkillAnalysisView    | 既定表示        | `screenshots/TC-11-03-analysis-default-dark.png`        |
| TC-11-04     | SkillAnalysisView    | 改善候補選択    | `screenshots/TC-11-04-analysis-selection-dark.png`      |
| TC-11-05     | SkillAnalysisView    | エラー表示      | `screenshots/TC-11-05-analysis-error-dark.png`          |
| TC-11-06     | SkillAnalysisView    | ローディング    | `screenshots/TC-11-06-analysis-loading-dark.png`        |
| TC-11-07     | SkillManagementPanel | list view       | `screenshots/TC-11-07-skill-management-list.png`        |
| TC-11-08     | SkillManagementPanel | create view     | `screenshots/TC-11-08-skill-management-create-view.png` |
| TC-11-09     | ChatPanel            | 実行中 disabled | `screenshots/TC-11-09-chat-panel-disabled-toggle.png`   |

## 実施シナリオ

### シナリオ1: preflight

```bash
node -e "require.resolve('@rollup/rollup-darwin-x64')"
```

### シナリオ2: screenshot 再取得

```bash
pnpm --filter @repo/desktop run screenshot:task-045-lifecycle-test-hardening
```

期待値:

- `outputs/phase-11/screenshots/TC-11-01..09` が同一ターンで再生成される
- `outputs/phase-11/screenshots/phase11-capture-metadata.json` に capture 時刻と `pageErrors` が記録される

### シナリオ3: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### シナリオ4: targeted suite

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### シナリオ5: direct IPC 再導入の確認

```bash
rg -n "window\\.electronAPI\\.skill\\." \
  apps/desktop/src/renderer/components/skill \
  apps/desktop/src/renderer/components/chat \
  apps/desktop/src/renderer/store/slices/agentSlice.ts
```

期待値:

- component / hook 側に新規 direct IPC が増えていない
- store 境界の設計を壊していない

## 出力

| 成果物              | パス                                                         |
| ------------------- | ------------------------------------------------------------ |
| 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                     |
| 発見課題            | `outputs/phase-11/discovered-issues.md`                      |
| 画面証跡            | `outputs/phase-11/screenshots/*.png`                         |
| screenshot metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json` |

## 完了条件

- [x] `TC-11-01`〜`TC-11-09` の証跡が取得されている
- [x] screenshot / preflight / typecheck / targeted suite の結果が記録されている
- [x] direct IPC 再導入チェックの結果が記録されている

## テンプレート準拠追補

## 実行タスク

- T1: 画面証跡を TC 単位で取得し、Phase 11 仕様書に紐付ける
- T2: screenshot 再取得後に preflight / typecheck / targeted suite / direct IPC 監査を実施する
- T3: Phase 12 に渡す結果と課題を整理する

## 参照資料

| 参照資料        | パス                                                                        | 用途                  |
| --------------- | --------------------------------------------------------------------------- | --------------------- |
| 依存Phase 1     | `phase-1-requirements.md`                                                   | RT-01〜RT-07 要件確認 |
| 依存Phase 2     | `phase-2-design.md`                                                         | suite割当確認         |
| 依存Phase 5     | `phase-5-implementation.md`                                                 | 実装差分確認          |
| 依存Phase 6     | `phase-6-test-expansion.md`                                                 | 拡充観点確認          |
| 依存Phase 7     | `phase-7-coverage-check.md`                                                 | coverage結果確認      |
| 依存Phase 8     | `phase-8-refactoring.md`                                                    | refactor影響確認      |
| 依存Phase 9     | `phase-9-quality-assurance.md`                                              | quality gate確認      |
| 依存Phase 10    | `phase-10-final-review.md`                                                  | 最終レビュー前提確認  |
| task-spec guide | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11 記録方針     |

## 実行手順

1. `TC-11-01`〜`TC-11-09` の screenshot を取得してマトリクスへ紐付ける
2. screenshot 再取得後に preflight / typecheck / targeted suite / direct IPC 監査を実施する
3. manual-test-result / discovered-issues に結果を記録する

## 統合テスト連携

| 連携面          | 内容                                                    |
| --------------- | ------------------------------------------------------- |
| targeted suite  | Phase 9 と同じ suite 一覧で smoke を行う                |
| direct IPC 監査 | Renderer / Chat / Store の境界逸脱を手動確認する        |
| Phase 12        | manual-test-result / discovered-issues へ証跡を引き渡す |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                             |
| ------------------ | ---- | ---------------------------------------------------- |
| UX/操作            | ✅   | create/list/analysis/chat の主要状態を画面証跡で確認 |
| アーキテクチャ     | ✅   | direct IPC 再導入がないか                            |
| エラーハンドリング | ✅   | preflight 失敗を blocker として切り分ける            |
| ドキュメント       | ✅   | TC ↔ screenshot 対応が欠落していないか               |

## 成果物

| 成果物              | パス                                                         | 説明                             |
| ------------------- | ------------------------------------------------------------ | -------------------------------- |
| 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                     | TC単位の実行結果と証跡           |
| 発見課題            | `outputs/phase-11/discovered-issues.md`                      | blocker / defect / backlog 候補  |
| 画面証跡            | `outputs/phase-11/screenshots/*.png`                         | TC-11-01〜09 の証跡              |
| screenshot metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture時刻 / route / pageErrors |

## サブタスク管理

1. screenshot 判定と撮影
2. screenshot 再取得
3. preflight / typecheck / suite 実行
4. direct IPC 監査
5. 証跡整理

## タスク100%実行確認

- [x] `TC-11-01`〜`TC-11-09` の画面証跡を取得した
- [x] smoke 実行と direct IPC 監査を完了した
- [x] Phase 12 に渡す成果物を固定した

## 次のPhase

Phase 12（ドキュメント）
