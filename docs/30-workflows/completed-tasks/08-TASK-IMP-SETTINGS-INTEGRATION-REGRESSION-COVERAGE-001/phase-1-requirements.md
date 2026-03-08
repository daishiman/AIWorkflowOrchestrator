# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 1                                                        |
| 機能名     | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| タスク名   | SettingsView 実統合回帰カバレッジ整備                    |
| 作成日     | 2026-03-06                                               |
| ステータス | 未実施                                                   |

## 目的

SettingsView を real composition に近い形で検証する自動テストと manual evidence の仕様を整備し、05 / 06 / 07 の修正を長期的に守れる回帰基盤を設計する。

## 背景

今回の調査では task-03 と task-04 の手動検証が SettingsView 実統合を通っていなかった。`SettingsView.test.tsx` でも `AccountSection` と `ApiKeysSection` と `AuthModeSelector` をモックしており、画面構成のまま落ちる不具合を拾えない。

## Atent Team編成

| SubAgent                 | 関心ごと                      | 実行モード | Phase 1 の責務                                                |
| ------------------------ | ----------------------------- | ---------- | ------------------------------------------------------------- |
| SubAgent-Test-Harness    | integration harness           | 並列       | SettingsView を real composition で動かす test 基盤を設計する |
| SubAgent-Component-Scope | component / integration 境界  | 並列       | mock を残す場所と外す場所を定義する                           |
| SubAgent-Manual-Evidence | manual test / screenshot plan | 並列       | Settings shell を通る証跡条件を定義する                       |
| SubAgent-Lead-Sync       | 仕様統合 / aiworkflow 同期    | 直列統合   | 05 / 06 / 07 の AC を 1 つの回帰行列へ統合する                |

## 実行タスク

- 現象再定義: SettingsView の既存テストが主要セクションをモックしており、実画面構成のまま auth-mode / apiKey / persist 経路を検証できていない。manual evidence も settings shell を通っていない。
- 根拠整理: 調査済みコードと既存仕様書を照合し、実装漏れと再現条件を固定する
- スコープ境界: SettingsView 以外の全画面 E2E 導入 / 外部 test runner の刷新 / visual regression 基盤の新規導入 を非スコープとして固定する
- 受け入れ基準化: `SettingsView.test.tsx` で主要セクションを過剰モックしない統合テスト方針が定義される / manual evidence が Settings shell 到達を必須条件として扱う / 05 / 06 / 07 の受け入れ基準が統合テスト行列へ反映される を Yes/No 条件へ落とす

## 参照資料

### 実装・証跡

| 資料名                | パス                                                                                                                               | 用途                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Settings View Test    | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                                               | 過剰モック解消の主対象                               |
| Settings View         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                                           | real composition の確認先                            |
| AuthModeSelector Test | `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx`                               | mode 切替統合観点の補強先                            |
| ApiKeysSection Test   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`                                  | provider fallback との統合観点                       |
| Integration Test      | `apps/desktop/src/renderer/__tests__/integration/navigation.integration.test.ts`                                                   | settings shell 遷移導線の確認先                      |
| Manual Evidence       | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | 手動証跡の不足箇所を確認する                         |
| task-03 manual        | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-11/manual-test-result.md`            | 専用 harness の限界を確認する                        |
| task-04 manual        | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | settings shell を通らない manual evidence を確認する |
| task-04 index         | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/index.md`                               | Atent Team の index 例を確認する                     |

### システム仕様（aiworkflow-requirements / task-specification-creator）

| 資料名                     | パス                                                                                 | 用途                                                |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| task-spec workflow         | `.claude/skills/task-specification-creator/references/create-workflow.md`            | create モードの直列/並列ルールを確認する            |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`            | Phase 文書の構造を揃える                            |
| unassigned task guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | Phase 12 の残課題検出ルールを揃える                 |
| resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                     | 読むべきシステム正本を固定する                      |
| quick-reference            | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                  | IPC / Store / Electron の既存パターンを再確認する   |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`    | component / integration の境界を確認する            |
| testing-dialog-patterns    | `.claude/skills/aiworkflow-requirements/references/testing-dialog-patterns.md`       | dialog / settings shell の test pattern を確認する  |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                | Settings shell の構成要件を確認する                 |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`       | 実統合テストで守るUX説明順序を確認する              |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`         | 実画面導線のa11y回帰項目を確認する                  |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | store を含む integration harness の組み方を確認する |
| development-guidelines     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`        | test helper の配置規則を確認する                    |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | 回帰基盤の coverage 条件を確認する                  |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | 統合失敗時の診断情報粒度を確認する                  |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | Phase 11/12 の記録先を確認する                      |
| task-workflow-rules        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`           | 回帰不備を未タスク化する判定基準を確認する          |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | settings回帰の再発防止カードを確認する              |
| task-workflow-phases       | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`          | Phase 11 / 12 で残す証跡の粒度を確認する            |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                | settings系IPCのrequest/response契約を確認する       |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`        | Main/Preload/Rendererの契約整合チェックに使う       |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | preload公開境界とIPCライフサイクル安全性を確認する  |
| security-api-electron      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Electron API公開時のセキュリティ要件を確認する      |
| testing-fixtures           | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`              | integration harness/fixture設計ルールを確認する     |
| quality-e2e-testing        | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`           | manual evidenceと統合回帰の証跡品質基準を確認する   |

### 前提Phase成果物

| 資料名 | パス | 用途                            |
| ------ | ---- | ------------------------------- |
| なし   | -    | Phase 1 は前提 Phase を持たない |

## 実行手順

1. 調査済みコード、完了タスク証跡、aiworkflow 正本仕様を読み、現象と根拠を一覧化する。
2. Renderer / Preload / Main / Docs / Tests の責務を分けて影響範囲を整理する。
3. 成功条件、非スコープ、並列/直列ポリシーを `outputs/phase-1/` の成果物に落とす。
4. 05 / 06 / 07 の並列、08 の後続配置が index と一致していることを確認する。

## 統合テスト連携

- Settings shell mount、auth-mode flow、apiKey malformed response、persist recovery を 1 つの回帰行列へ統合する
- `SettingsView.test.tsx` と manual evidence が同じシナリオ名を共有するように設計する
- Phase 11 の screenshot / evidence plan が実際の settings shell 到達を証明できる形にする

## 多角的チェック観点

| 観点       | 確認内容                                                    |
| ---------- | ----------------------------------------------------------- |
| 統合粒度   | component test と integration test の責務が重複していないか |
| 証跡妥当性 | manual evidence が実際の画面構成を通っているか              |
| 保守性     | electronAPI mock と store harness が再利用可能か            |
| 追跡性     | 05 / 06 / 07 の AC が test case ID へ対応付いているか       |

## 成果物

| 成果物       | パス                                         | 説明                            |
| ------------ | -------------------------------------------- | ------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件の固定      |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Yes/No で判定できる受け入れ条件 |
| スコープ境界 | `outputs/phase-1/scope-boundary.md`          | 実施対象と非スコープの明文化    |

## 完了条件

- [ ] 成功条件が 3 件以上 Yes/No 形式で記述されている
- [ ] 非スコープが 3 件以上記述されている
- [ ] 参照資料に調査根拠と aiworkflow 正本の両方が含まれている
- [ ] 並列/直列ポリシーが index と一致している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 2: 設計
