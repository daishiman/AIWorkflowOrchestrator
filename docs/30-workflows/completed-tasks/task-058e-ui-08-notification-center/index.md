# TASK-058E-UI-08-NOTIFICATION-CENTER: お知らせ workflow

## メタ情報

| 項目       | 値                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-08-NOTIFICATION-CENTER                                                                            |
| 元タスク   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058e-ui-08-notification-center.md` |
| 機能名     | task-058e-ui-08-notification-center                                                                       |
| 作成日     | 2026-03-11                                                                                                |
| ステータス | completed（Phase 1-13 完了、PR #1152 作成済み）                                                           |
| 総Phase数  | 13                                                                                                        |
| 実行方針   | P50 実装・検証完了                                                                                        |
| 依存タスク | TASK-UI-00, TASK-UI-01, TASK-UI-02, TASK-UI-01-C                                                          |
| 直近実体   | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`                             |

## 概要

本workflowは Bell アイコンから開く「お知らせ」体験を、`task-058e` の正本仕様に合わせて再整備した。`NotificationCenter` の文言統一、Portal 化、相対時刻表示、個別削除 IPC、focus trap、responsive overlay、Phase 11 screenshot 検証までを Phase 1-12 で完了している。

## P50 判定

| 項目                       | 判定                 |
| -------------------------- | -------------------- |
| 既存 UI 実装               | あり                 |
| 既存 Store 実装            | あり                 |
| 既存 Preload / Main IPC    | あり                 |
| task-058e 正本との完全一致 | なし                 |
| ワークフロー種別           | P50 検証・補完モード |

## SubAgent Team

| SubAgent   | 担当関心                                                         | 主担当 Phase         |
| ---------- | ---------------------------------------------------------------- | -------------------- |
| SubAgent-A | GlobalNavStrip 連携、Popover UI、Atomic Design 分割              | 1, 2, 4, 5, 11       |
| SubAgent-B | notificationSlice、Preload、IPC、Main service 差分               | 1, 2, 5, 6, 9        |
| SubAgent-C | component test、store test、a11y、coverage gate                  | 2, 3, 4, 6, 7, 10    |
| SubAgent-D | task-spec / aiworkflow-requirements 同期、Phase 12、未タスク監査 | 1, 3, 10, 11, 12, 13 |

## Barrier Plan

| Group   | 対象Phase | 実行順                       | Barrier                                                   |
| ------- | --------- | ---------------------------- | --------------------------------------------------------- |
| Group A | 1-3       | 直列                         | Phase 3 が PASS か MINOR でなければ Group B へ進まない    |
| Group B | 4-7       | Phase 4-5 並列可、6-7 直列   | Phase 7 の coverage gate を通過してから Group C           |
| Group C | 8-10      | 直列                         | Phase 10 が PASS か MINOR でなければ Group D/E へ進まない |
| Group D | 11        | Group E と並列可             | Phase 10 barrier 後に開始                                 |
| Group E | 12-13     | 12 と 11 は並列可、13 は最後 | Phase 12 完了とユーザー判断後に Phase 13                  |

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
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 主要成果物

| 区分               | パス                                              | 用途                                                    |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| トレーサビリティ   | `requirements-traceability-matrix.md`             | 元タスク要求と各 Phase の対応を追跡する                 |
| task-spec 監査台帳 | `task-specification-creator-compliance-matrix.md` | `task-specification-creator` の反映状況を監査する       |
| 仕様抽出台帳       | `aiworkflow-requirements-extraction-matrix.md`    | `aiworkflow-requirements` の抽出根拠を query 単位で残す |
| 差分反映台帳       | `branch-diff-reflection-matrix.md`                | 本ブランチ差分と skill 要件の対応を固定する             |
| 検証レポート       | `outputs/verification-report.md`                  | validator / verifier の実行結果を記録する               |
| 成果物レジストリ   | `artifacts.json`                                  | Phase 成果物名と依存順を固定する                        |

## 058e で固定する差分方針

| 現行実体                            | task-058e 正本                              | 本workflowの扱い                 |
| ----------------------------------- | ------------------------------------------- | -------------------------------- |
| タイトルが「通知履歴」              | タイトルは「お知らせ」                      | 058e を正本にして UI 文言を統一  |
| 一括削除ボタンが存在                | 左スワイプ削除のみ                          | 一括削除は 058e UI から外す      |
| 相対時刻ではなく日時文字列          | 相対時刻表示                                | 相対時刻へ補完                   |
| 単一 component に集約               | Popover / Header / List / Item / Badge 分割 | Atomic Design で分離             |
| onNew / getHistory は実装済み       | 同機能を前提                                | 既存契約を再利用し不足のみ追加   |
| 個別 delete IPC がない              | 個別削除あり                                | `notification:delete` を追加設計 |
| Escape / focus trap / portal が弱い | a11y 完備                                   | 058e で補完                      |

## システム仕様の反映範囲

| 正本仕様                                                                          | 反映内容                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | GlobalNavStrip 配下の導線位置と Renderer / Main / Preload 境界を固定            |
| `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | Notification 系 IPC 一覧を再確認し、既存 channel 再利用を固定                   |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | `notification:get-history` / `mark-read` / `mark-all-read` / `new` の契約を固定 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Notification UI の責務境界と Atomic Design を固定                               |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Notification / History Domain の既存契約を再利用                                |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | Bell 導線と GlobalNavStrip 連携を固定                                           |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`      | Popover の stacking context と Portal 方針を固定                                |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `notificationSlice` 再利用、P31 境界、100件保持契約を固定                       |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証と preload 公開境界を固定                                            |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時メッセージと復旧契約を固定                                                |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom 前提の component test 観点を固定                                      |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | Escape、focus trap、ARIA、live region の試験観点を固定                          |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage gate と TDD の下限を固定                                               |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 11 / 12 証跡と未タスク検出の運用を固定                                    |

抽出根拠の詳細は `aiworkflow-requirements-extraction-matrix.md` を正本台帳として扱う。

## task-spec skill 反映範囲

| task-spec 正本                                                                         | 反映内容                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/create-workflow.md`              | Phase 1-3 先行確定後に後続 Phase を展開する流れを固定            |
| `.claude/skills/task-specification-creator/references/phase-templates.md`              | 全 Phase に共通節、統合テスト連携、100% 実行確認を反映           |
| `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md`  | `outputs/phase-N/*.md` 命名を固定                                |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | Phase 3 / 10 の PASS / MINOR / MAJOR / CRITICAL を固定           |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | screenshot 証跡と Phase 12 必須成果物を固定                      |
| `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | Phase 12 の system spec / lessons / task workflow 同期手順を固定 |
| `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Part 1 / Part 2、Step 1-A / 1-B / 1-C、条件付き Step 2 を固定    |
| `.claude/skills/task-specification-creator/references/commands.md`                     | validator / verifier 実行コマンドを固定                          |

監査の詳細は `task-specification-creator-compliance-matrix.md` を参照する。

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center
```
