# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の system spec 同期     |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

実装ガイド、system spec 更新、更新履歴、未タスク検出、skill feedback を揃え、contract alignment の変更点を aiworkflow 正本仕様へ同期する。

## 背景

このタスクは interface change を含むため、Phase 12 Task 2 Step 2 は必須になる。加えて `task-specification-creator` の最新運用に合わせ、Step 1-D（index 再生成）、Step 1-E（未タスク登録とリンク検証）、Step 1-G（検証コマンド順次実行）も仕様書に明記する。

## SubAgentチーム編成

| SubAgent                      | 担当関心                                 | 実行形態     | Phase 12 の責務                                                                                                             |
| ----------------------------- | ---------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| SpecAgent-InterfacesAuth      | `interfaces-auth.md` 専任                | Batch A 並列 | DTO / error union / changed event の正本記述を更新する                                                                      |
| SpecAgent-ApiIpcSystem        | `api-ipc-system.md` 専任                 | Batch A 並列 | `auth-mode:get/set/status/validate/changed` の request / response / event を更新する                                        |
| SpecAgent-SecurityElectronIPC | `security-electron-ipc.md` 専任          | Batch A 並列 | sender 検証順序、safeInvoke / safeOn、error envelope を更新する                                                             |
| SpecAgent-ArchStateManagement | `arch-state-management.md` 専任          | Batch B 並列 | 削除済み `apps/desktop/src/renderer/store/hooks/useAuthModeStore.ts` と旧 `useRef` guard 記述を現行 selector 実装へ補正する |
| SpecAgent-ErrorHandling       | `error-handling.md` 専任                 | Batch B 並列 | `message`, `errorCode`, `guidance`, `lastCheckedAt` の表現を更新する                                                        |
| SpecAgent-DevGuidelines       | `development-guidelines.md` 専任         | Batch B 並列 | 個別 selector と `useEffect([initializeAuthMode])` 規約を更新する                                                           |
| SpecAgent-Patterns            | `patterns.md` 専任                       | Batch C 並列 | `useAuthModeStore` 非推奨、横断 grep、移行パターンを更新する                                                                |
| SpecAgent-TestingPatterns     | `testing-component-patterns.md` 専任     | Batch C 並列 | `window.electronAPI.authMode` mock、renderHook、happy-dom 前提を更新する                                                    |
| SpecAgent-WorkflowLessons     | `task-workflow.md`, `lessons-learned.md` | Batch C 並列 | 完了記録、関連未タスク、教訓を同期する                                                                                      |
| SpecAgent-LogsIndex           | `LOGS.md` 2ファイル、`topic-map.md`      | 直列終端     | 変更履歴と見出し行番号を同期する                                                                                            |
| SpecAgent-Integrator          | Phase 12 出力群                          | 直列終端     | `spec-update-summary`, `documentation-changelog`, `phase12-task2-step-log` を確定する                                       |

`evidence-sync-rules.md` に合わせ、1 SpecAgent あたり 3 ファイル以下、1 バッチあたり 2〜3 Agent を上限に並列実行し、各バッチ完了後に直列で統合する。

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1 は中学生向け説明、Part 2 は技術者向け仕様を書く。
- Task 12-2 system spec 更新: Step 1-A、1-B、1-C、Step 2 を全て実行する。
- Task 12-3 更新履歴作成: 変更した references、LOGS、topic-map を `documentation-changelog.md` に記録する。
- Task 12-4 未タスク検出: 0 件でも `unassigned-task-detection.md` を作る。
- Task 12-5 skill feedback: 改善点が 0 件でも `skill-feedback-report.md` を作る。

## 参照資料

### 実装・コード

| 資料名                         | パス                                             | 用途                                             |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| Phase 1 仕様                   | `phase-1-requirements.md`                        | 要件を再確認する                                 |
| Phase 2 仕様                   | `phase-2-design.md`                              | canonical DTO を再確認する                       |
| Phase 5 仕様                   | `phase-5-implementation.md`                      | 実装対象を再確認する                             |
| Phase 6 仕様                   | `phase-6-test-expansion.md`                      | regression 方針を再確認する                      |
| Phase 7 仕様                   | `phase-7-coverage-check.md`                      | coverage 結果を再確認する                        |
| Phase 8 仕様                   | `phase-8-refactoring.md`                         | refactor 後の owner を再確認する                 |
| Phase 9 仕様                   | `phase-9-quality-assurance.md`                   | security / error 監査を再確認する                |
| Phase 10 仕様                  | `phase-10-final-review.md`                       | final gate を再確認する                          |
| Phase 11 仕様                  | `phase-11-manual-test.md`                        | 手動検証結果を再確認する                         |
| Phase 1 成果物                 | `outputs/phase-1/`                               | AC と drift inventory を確認する                 |
| Phase 2 成果物                 | `outputs/phase-2/`                               | canonical contract と migration order を確認する |
| Phase 5 成果物                 | `outputs/phase-5/`                               | 実装差分を確認する                               |
| Phase 6 成果物                 | `outputs/phase-6/`                               | regression result を確認する                     |
| Phase 7 成果物                 | `outputs/phase-7/`                               | coverage と gap を確認する                       |
| Phase 8 成果物                 | `outputs/phase-8/`                               | refactor 結果を確認する                          |
| Phase 9 成果物                 | `outputs/phase-9/`                               | quality と risk を確認する                       |
| Phase 10 成果物                | `outputs/phase-10/`                              | gate decision を確認する                         |
| Phase 11 成果物                | `outputs/phase-11/`                              | 手動テスト証跡を確認する                         |
| 要件定義書                     | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物                                   |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物                                   |
| 契約ドリフト台帳               | `outputs/phase-1/drift-inventory.md`             | Phase 1 成果物                                   |
| 公開型正本マップ               | `outputs/phase-1/source-of-truth-map.md`         | Phase 1 成果物                                   |
| スコープ境界                   | `outputs/phase-1/scope-boundary.md`              | Phase 1 成果物                                   |
| canonical contract設計         | `outputs/phase-2/canonical-contract-design.md`   | Phase 2 成果物                                   |
| 層責務マトリクス               | `outputs/phase-2/layer-responsibility-matrix.md` | Phase 2 成果物                                   |
| error envelope設計             | `outputs/phase-2/error-envelope-design.md`       | Phase 2 成果物                                   |
| shared型移行計画               | `outputs/phase-2/shared-type-migration-plan.md`  | Phase 2 成果物                                   |
| テスト戦略                     | `outputs/phase-2/test-strategy.md`               | Phase 2 成果物                                   |
| 実装計画                       | `outputs/phase-5/implementation-plan.md`         | Phase 5 成果物                                   |
| 変更ファイル計画               | `outputs/phase-5/changed-files-plan.md`          | Phase 5 成果物                                   |
| 移行順序                       | `outputs/phase-5/migration-order.md`             | Phase 5 成果物                                   |
| ロールバック計画               | `outputs/phase-5/rollback-plan.md`               | Phase 5 成果物                                   |
| リファクタリング計画           | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物                                   |
| 型正本集約                     | `outputs/phase-8/type-source-consolidation.md`   | Phase 8 成果物                                   |
| adapter review                 | `outputs/phase-8/adapter-review.md`              | Phase 8 成果物                                   |
| post-refactor checklist        | `outputs/phase-8/post-refactor-checklist.md`     | Phase 8 成果物                                   |
| 品質レポート                   | `outputs/phase-9/quality-report.md`              | Phase 9 成果物                                   |
| セキュリティ監査チェックリスト | `outputs/phase-9/security-audit-checklist.md`    | Phase 9 成果物                                   |
| リスク登録簿                   | `outputs/phase-9/risk-register.md`               | Phase 9 成果物                                   |
| error code整合監査             | `outputs/phase-9/error-code-alignment-audit.md`  | Phase 9 成果物                                   |
| 最終レビュー結果               | `outputs/phase-10/final-review-result.md`        | Phase 10 成果物                                  |
| リリースリスクチェックリスト   | `outputs/phase-10/release-risk-checklist.md`     | Phase 10 成果物                                  |
| ゲート判定                     | `outputs/phase-10/gate-decision.md`              | Phase 10 成果物                                  |
| 手動テスト結果                 | `outputs/phase-11/manual-test-result.md`         | Phase 11 成果物                                  |
| 証跡マトリクス                 | `outputs/phase-11/evidence-matrix.md`            | Phase 11 成果物                                  |
| スクリーンショット計画         | `outputs/phase-11/screenshot-plan.md`            | Phase 11 成果物                                  |
| 発見事項一覧                   | `outputs/phase-11/discovered-issues.md`          | Phase 11 成果物                                  |

### システム仕様（aiworkflow-requirements）

| 資料名                        | パス                                                                                                  | 用途                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| spec update workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | Step 1-A / 1-B / 1-C / Step 2 の実行順を確認する                                |
| Phase 12 checklist            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                | Task 12-1 / 12-3 / 12-4 / 12-5 の最低要件を確認する                             |
| evidence sync rules           | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`                         | LOGS、topic-map、未タスク同期、SpecAgent 上限を確認する                         |
| unassigned task guidelines    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  | raw 検出と精査後判定、`--target-file` 監査条件を確認する                        |
| technical documentation guide | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`               | `implementation-guide.md` と changelog の書き方を確認する                       |
| 認証仕様                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                | AuthMode transport DTO を更新する                                               |
| システム IPC                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                 | auth-mode channel を更新する                                                    |
| IPC セキュリティ              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                          | sender 順序、channel 名据え置き前提、error transport を更新する                 |
| 状態管理                      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                          | authModeSlice の public contract と SettingsView の現行 selector 実装へ更新する |
| エラーハンドリング            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | error code と guidance 方針を更新する                                           |
| 開発ガイドライン              | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                         | 個別 selector / `useEffect` ガイドを現実装へ合わせる                            |
| 実装パターン                  | `.claude/skills/aiworkflow-requirements/references/patterns.md`                                       | `useAuthModeStore` 非推奨化、横断 grep、P31 再発防止を同期する                  |
| コンポーネントテスト          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                     | `electronAPI.authMode` mock と renderHook パターンを同期する                    |
| task workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | 完了タスク記録を更新する                                                        |
| lessons learned               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 再発条件と対処手順を更新する                                                    |
| update-spec agent             | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                                        | 小さな差分で更新する手順を確認する                                              |
| validate-spec agent           | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                                      | 更新後検証観点を確認する                                                        |
| LOGS                          | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md` | 変更履歴と使用履歴を更新する                                                    |
| topic-map                     | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                         | 見出し行番号を再同期する                                                        |

## 実行手順

1. Task 12-1 として `technical-documentation-guide.md` を使い、`implementation-guide.md` を Part 1 / Part 2 の 2 部構成で作成する。
2. Task 12-2 Step 1-A として `task-workflow.md`, `lessons-learned.md`, LOGS 2 ファイルの更新対象を確定する。
3. Task 12-2 Step 1-B として実装状況テーブルを `completed` または `spec_created` に更新する。
4. Task 12-2 Step 1-C として関連タスクテーブルと未タスク表のステータスを更新する。
5. Task 12-2 Step 1-D として `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 --regenerate` を実行し、index / topic-map を再同期する。
6. Task 12-2 Step 1-E として未タスク候補を `detect-unassigned-tasks.js` で `apps/desktop/src` と `packages/shared/src` から個別抽出し、raw 結果を手動精査する。精査後 1 件以上なら `docs/30-workflows/unassigned-task/` へ登録したうえで `verify-unassigned-links.js`、`audit-unassigned-tasks.js --json --diff-from HEAD`、および新規作成した各未タスク指示書に対する `audit-unassigned-tasks.js --json --target-file <new-unassigned-task>` を実行する。
7. Task 12-2 Step 2 として `interfaces-auth.md`, `api-ipc-system.md`, `security-electron-ipc.md`, `arch-state-management.md`, `error-handling.md`, `development-guidelines.md`, `patterns.md`, `testing-component-patterns.md` を仕様書ごとの SpecAgent で更新する。`arch-state-management.md` では削除済み hook path と旧 `useRef` guard 記述を現行 `store/index.ts` 個別 selector + `SettingsView` 実装に補正し、`ui-ux-settings.md` は auth-mode 正本ではないため今回の Step 2 対象外とする。
8. Task 12-3 として `generate-documentation-changelog.js` で `documentation-changelog.md` の初稿を作り、`technical-documentation-guide.md` と `evidence-sync-rules.md` に従って変更理由、苦戦箇所、同期先を補完する。
9. Task 12-4、12-5 として `unassigned-task-detection.md`, `skill-feedback-report.md`, `phase12-task2-step-log.md` を出力し、`verify-all-specs.js`, `validate-phase-output.js`, `validate-phase11-screenshot-coverage.js` の結果、artifacts 台帳同期判断、LOGS 2 ファイル更新結果、今回 `.claude/skills/aiworkflow-requirements/SKILL.md` または `.claude/skills/task-specification-creator/SKILL.md` を変更した場合の change history 同期結果も残す。

## Phase 12 Task 2 実行表

| Step     | 必須         | このタスクでの扱い                                                                                                             | 出力                                                        |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Step 1-A | 必須         | 完了タスク記録、LOGS 2 ファイル更新                                                                                            | `spec-update-summary.md`, `phase12-task2-step-log.md`       |
| Step 1-B | 必須         | 実装完了時は `completed`、仕様書のみ完了時は `spec_created`                                                                    | `spec-update-summary.md`                                    |
| Step 1-C | 必須         | 関連タスク表と未タスク表の status を更新                                                                                       | `spec-update-summary.md`                                    |
| Step 1-D | 必須         | aiworkflow / workflow の index を再生成し、topic-map 行番号を同期                                                              | `phase12-task2-step-log.md`, `documentation-changelog.md`   |
| Step 1-E | 条件付き必須 | 未タスクが 1 件以上なら作成・登録・リンク検証・audit を実施                                                                    | `unassigned-task-detection.md`, `phase12-task2-step-log.md` |
| Step 1-G | 必須         | `verify-all-specs`, `validate-phase-output`, `validate-phase11-screenshot-coverage` を順に実行し、artifacts 台帳同期判断を記録 | `phase12-task2-step-log.md`, `spec-update-summary.md`       |
| Step 2   | 必須         | interface change を含むため必ず実施                                                                                            | `spec-update-summary.md`, `documentation-changelog.md`      |

## 並列実行バッチ

| Batch    | 並列SpecAgent                                                                         | 直列統合条件                                                  |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Batch A  | `SpecAgent-InterfacesAuth`, `SpecAgent-ApiIpcSystem`, `SpecAgent-SecurityElectronIPC` | 3 仕様の DTO / channel / security 文言が揃ってから次へ進む    |
| Batch B  | `SpecAgent-ArchStateManagement`, `SpecAgent-ErrorHandling`, `SpecAgent-DevGuidelines` | selector / guidance / stale spec 補正が揃ってから次へ進む     |
| Batch C  | `SpecAgent-Patterns`, `SpecAgent-TestingPatterns`, `SpecAgent-WorkflowLessons`        | 移行指針、テスト指針、workflow 記録が揃ってから終端統合へ進む |
| 終端統合 | `SpecAgent-LogsIndex`, `SpecAgent-Integrator`                                         | LOGS、topic-map、Phase 12 成果物を最終確定する                |

## Phase 12 自動化コマンド

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001

node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src \
  --output docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/.tmp-unassigned-desktop.json

node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src \
  --output docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/.tmp-unassigned-shared.json

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001

node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001

node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 \
  --regenerate

node .claude/skills/task-specification-creator/scripts/log-usage.js \
  --result success \
  --phase "Phase 12" \
  --agent "generate-task-specs" \
  --notes "auth-mode contract alignment spec sync"
```

## Phase 12 実装ガイド要件

- Part 1 は日常の例えから始める。
- Part 1 は `なぜ必要か` を先に書く。
- Part 1 は専門用語を書いた直後に意味を説明する。
- Part 2 は TypeScript 型、request / response / event、error case、設定値を含める。
- Part 2 は `get`, `status`, `validate`, `changed` の使用例を含める。

## 多角的チェック観点

| 観点          | 確認内容                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------- |
| 正本同期      | references の更新先が漏れていないか                                                           |
| 変更履歴      | files、version、理由を記録しているか                                                          |
| 実装ガイド    | Part 1 と Part 2 の要件を満たしているか                                                       |
| 未タスク管理  | 0 件でもレポートが存在するか                                                                  |
| 仕様書別分業  | 1 SpecAgent 3 ファイル以下、2〜3 Agent 並列バッチを守っているか                               |
| 正本選別      | `ui-ux-settings.md` を auth-mode 正本と誤認せず、正しい references のみ更新対象にしたか       |
| 古い仕様補修  | `arch-state-management.md` の削除済み hook path と旧 `useRef` 記述を是正対象に含めたか        |
| Selector 指針 | `patterns.md` と `development-guidelines.md` に P31 防止条件を反映したか                      |
| テスト指針    | `testing-component-patterns.md` に `electronAPI.authMode` mock と renderHook 前提を反映したか |
| skill 改善    | 改善点 0 件でも feedback を残しているか                                                       |

## 成果物

| 成果物           | パス                                                     | 説明                                                   |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 の 2 部構成                            |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`                | Step 1-A / 1-B / 1-C / 1-D / 1-E / 1-G / Step 2 の結果 |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイルと記録日時                                 |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも作成する                                       |
| skill feedback   | `outputs/phase-12/skill-feedback-report.md`              | 改善点 0 件でも作成する                                |
| Task 2 実行ログ  | `outputs/phase-12/phase12-task2-step-log.md`             | Step 別の実施内容と結果                                |
| 準拠監査         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の証跡と検証値を集約する推奨成果物     |

## 完了条件

- [x] `implementation-guide.md` に Part 1 と Part 2 の両方がある
- [x] `spec-update-summary.md` に Step 1-A、1-B、1-C、1-D、1-E、1-G、Step 2 の 7 項目がある
- [x] `documentation-changelog.md` に更新した references、LOGS、topic-map を記録する
- [x] `unassigned-task-detection.md` を 0 件でも作成する
- [x] `skill-feedback-report.md` を改善点 0 件でも作成する
- [x] `phase12-task2-step-log.md` に `completed` または `spec_created` の判断を記録する
- [x] `phase12-task-spec-compliance-check.md` に Task 12-1〜12-5、未タスク監査、skill-creator 検証の再確認結果を集約した
- [x] `verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD` の結果を Phase 12 成果物へ記録する
- [x] 未タスクを実登録した場合は `audit-unassigned-tasks.js --json --target-file <new-unassigned-task>` の結果も記録する
- [x] `verify-all-specs.js` と `validate-phase-output.js` の PASS を Phase 12 成果物へ記録する
- [x] `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` の結果を Phase 12 成果物へ引き継ぐ
- [x] aiworkflow / workflow の `generate-index.js` を実行して行番号と index を再同期する
- [x] Phase 実行時は `artifacts.json` と `outputs/artifacts.json` の同期要否を判断し、実施した場合は両方の整合を記録する
- [x] `arch-state-management.md` の削除済み hook path と旧 `useRef` guard 記述を更新対象に含め、`ui-ux-settings.md` を誤って Step 2 対象に入れない
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装ガイド作成
2. Step 1-A / 1-B / 1-C 記録
3. Step 2 system spec 更新
4. 更新履歴作成
5. 未タスク / skill feedback 作成

## タスク100%実行確認【必須】

- [x] Task 12-1 から 12-5 を全て成果物化した
- [x] Step 2 を必須として扱った
- [x] references、LOGS、topic-map、index 再生成、リンク監査の更新対象を列挙した
- [x] 仕様書ごとに SpecAgent を分け、2〜3 Agent 単位の並列バッチと直列統合条件を書いた
- [x] 0 件レポートを省略しないと明記した

## 次のPhase

Phase 13: PR作成
