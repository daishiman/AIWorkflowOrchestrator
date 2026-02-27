# TASK-9G ドキュメント更新履歴

## 作成日

2026-02-27

---

## Phase 別ドキュメント一覧

### Phase 1: 要件定義

| ファイル                                                                                              | 変更種別 | 内容                                                                    |
| ----------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-1-requirements.md`                    | 新規     | Phase 1 仕様書（FR-01~FR-10, NFR-01~NFR-11, AC-01~AC-10, スコープ定義） |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-1/requirements-definition.md` | 新規     | 要件定義書                                                              |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-1/acceptance-criteria.md`     | 新規     | 受け入れ基準（Gherkin形式）                                             |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-1/scope-definition.md`        | 新規     | スコープ定義（含むもの / 含まないもの）                                 |

### Phase 2: 設計

| ファイル                                                                                          | 変更種別 | 内容                                                                            |
| ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-2-design.md`                      | 新規     | Phase 2 仕様書（クラス設計, IPC設計, 永続化設計, タイマー管理, DI設計, 型定義） |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-2/architecture-design.md` | 新規     | アーキテクチャ設計書                                                            |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-2/api-specification.md`   | 新規     | IPC API 仕様書                                                                  |

### Phase 3: 設計レビュー

| ファイル                                                                                           | 変更種別 | 内容             |
| -------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-3-design-review.md`                | 新規     | Phase 3 仕様書   |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-3/design-review-result.md` | 新規     | 設計レビュー結果 |

### Phase 4: テスト作成

| ファイル                                                                                              | 変更種別 | 内容                                     |
| ----------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-4-test-creation.md`                   | 新規     | Phase 4 仕様書                           |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-4/test-specification.md`      | 新規     | テスト仕様書                             |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-4/test-cases.md`              | 新規     | テストケース一覧（D-01~D-15, T-01~T-05） |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-4/integration-test-design.md` | 新規     | 統合テスト設計                           |

### Phase 5: 実装

| ファイル                                                                                             | 変更種別 | 内容           |
| ---------------------------------------------------------------------------------------------------- | -------- | -------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-5-implementation.md`                 | 新規     | Phase 5 仕様書 |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-5/implementation-summary.md` | 新規     | 実装サマリー   |

### Phase 6: テスト拡充

| ファイル                                                                                      | 変更種別 | 内容               |
| --------------------------------------------------------------------------------------------- | -------- | ------------------ |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-6-test-expansion.md`          | 新規     | Phase 6 仕様書     |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-6/coverage-report.md` | 新規     | カバレッジレポート |

### Phase 7: カバレッジ確認

| ファイル                                                                                      | 変更種別 | 内容                   |
| --------------------------------------------------------------------------------------------- | -------- | ---------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-7-coverage-check.md`          | 新規     | Phase 7 仕様書         |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-7/coverage-report.md` | 新規     | カバレッジ確認レポート |

### Phase 8: リファクタリング

| ファイル                                                                                                            | 変更種別 | 内容                                |
| ------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-8-refactoring.md`                                   | 新規     | Phase 8 仕様書                      |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-8/skillscheduler-refactoring-analysis.md`   | 新規     | SkillScheduler リファクタリング分析 |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-8/schedulestore-validation-extraction.md`   | 新規     | ScheduleStore バリデーション抽出    |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-8/ipc-schedule-validation-commonization.md` | 新規     | IPC バリデーション共通化            |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-8/naming-type-unification.md`               | 新規     | 命名・型統一                        |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-8/refactoring-log.md`                       | 新規     | リファクタリングログ                |

### Phase 9: 品質検証

| ファイル                                                                                           | 変更種別 | 内容                     |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------ |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-9-quality-assurance.md`            | 新規     | Phase 9 仕様書           |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/lint-report.md`          | 新規     | ESLint レポート          |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/typecheck-report.md`     | 新規     | TypeScript 型チェック    |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/security-report.md`      | 新規     | セキュリティレポート     |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/test-coverage-report.md` | 新規     | テストカバレッジレポート |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/quality-gate-result.md`  | 新規     | 品質ゲート結果           |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-9/quality-report.md`       | 新規     | 品質レポート             |

### Phase 10: 最終レビュー

| ファイル                                                                                                      | 変更種別 | 内容                             |
| ------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-10-final-review.md`                           | 新規     | Phase 10 仕様書                  |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-10/final-review-result.md`            | 新規     | 最終レビュー結果                 |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-10/security-review.md`                | 新規     | セキュリティレビュー             |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-10/type-ipc-contract-review.md`       | 新規     | 型・IPC契約レビュー              |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-10/architecture-dependency-review.md` | 新規     | アーキテクチャ・依存関係レビュー |

### Phase 11: 手動テスト

| ファイル                                                                                                      | 変更種別 | 内容                         |
| ------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-11-manual-test.md`                            | 新規     | Phase 11 仕様書              |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/manual-test-result.md`             | 新規     | 手動テスト結果               |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/auto-test-result.md`               | 新規     | 自動テスト結果               |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/schedule-add-test-result.md`       | 新規     | スケジュール追加テスト結果   |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/schedule-crud-test-result.md`      | 新規     | スケジュールCRUDテスト結果   |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/schedule-toggle-test-result.md`    | 新規     | スケジュールトグルテスト結果 |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/persistence-test-result.md`        | 新規     | 永続化テスト結果             |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/validation-test-result.md`         | 新規     | バリデーションテスト結果     |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/event-notification-test-result.md` | 新規     | イベント・通知テスト結果     |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-11/discovered-issues.md`              | 新規     | 発見された課題               |

### Phase 12: ドキュメント

| ファイル                                                                                                 | 変更種別 | 内容                                                         |
| -------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-12-documentation.md`                     | 新規     | Phase 12 仕様書                                              |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/implementation-guide.md`      | 新規     | Part 1（中学生レベル概念説明）+ Part 2（技術者向け実装詳細） |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/spec-update-summary.md`       | 新規     | 仕様更新サマリー（Phase 1/2 からの変更点9件、変更テーブル）  |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/documentation-changelog.md`   | 新規     | 本ファイル                                                   |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/unassigned-task-detection.md` | 新規     | 未タスク検出レポート（5件検出）                              |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/skill-feedback-report.md`     | 新規     | スキルフィードバックレポート                                 |

### Phase 13: 完了

| ファイル                                                                                              | 変更種別 | 内容                 |
| ----------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-13-pr-creation.md`                    | 新規     | Phase 13 仕様書      |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-13/local-check-result.md`     | 新規     | ローカルチェック結果 |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-13/change-summary.md`         | 新規     | 変更サマリー         |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-13/pr-creation-result.md`     | 新規     | PR作成結果           |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-13/ci-result.md`              | 新規     | CI結果               |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-13/merge-readiness-report.md` | 新規     | マージ準備レポート   |

### その他

| ファイル                                                                                  | 変更種別 | 内容                   |
| ----------------------------------------------------------------------------------------- | -------- | ---------------------- |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/index.md`                       | 新規     | TASK-9G インデックス   |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/verification-report.md` | 新規     | 検証レポート           |
| `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/artifacts.json`         | 新規     | 成果物台帳の同期コピー |

---

## 実装コード（Phase 5 で追加 / 変更済み）

| ファイル                                                 | 変更種別 | 内容                                                                                |
| -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | 新規     | スケジューラサービス: cron/interval/once/event の4方式でスケジュール実行を管理      |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | 新規     | electron-store ベースの永続化ストア: CRUD + runHistory管理（最大100件）             |
| `packages/shared/src/types/skill-schedule.ts`            | 新規     | 共有型定義: ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | 修正     | 5ハンドラー追加（registerSkillScheduleHandlers / unregisterSkillScheduleHandlers）  |
| `apps/desktop/src/preload/channels.ts`                   | 修正     | 5チャンネル定数追加（IPC_CHANNELS + ALLOWED_INVOKE_CHANNELS）                       |
| `apps/desktop/src/preload/skill-api.ts`                  | 修正     | SkillAPI インターフェースと skillAPI 実装に5メソッド追加                            |
| `packages/shared/src/types/index.ts`                     | 修正     | `export * from "./skill-schedule"` re-export追加                                    |
| `apps/desktop/package.json`                              | 修正     | node-cron, @types/node-cron 依存関係追加                                            |

## テストコード（Phase 4 で追加、Phase 6 で拡充）

| ファイル                                                               | 変更種別 | 内容                                                                                                                         |
| ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts` | 新規     | ScheduleStore ユニットテスト: 20テストケース（CRUD D-01~D-10, 実行履歴 D-11~D-13, 永続化復元 D-14~D-15, 境界値 DB-01~DB-05） |
| `packages/shared/src/types/__tests__/skill-schedule.test.ts`           | 新規     | 型定義コンパイルテスト: 5テストケース（T-01~T-05）                                                                           |

---

## 変更種別集計

| 種別                                 | 件数   |
| ------------------------------------ | ------ |
| 新規実装ファイル                     | 3      |
| 修正実装ファイル                     | 5      |
| 新規テストファイル                   | 2      |
| Phase 仕様書（phase-\*.md）          | 13     |
| Phase 出力物（outputs/phase-\*/）    | 44     |
| index.md / verification-report       | 2      |
| その他出力（outputs/artifacts.json） | 1      |
| **合計**                             | **70** |

---

## テストカバレッジ結果

| テストファイル           | テストケース数               | 全PASS  |
| ------------------------ | ---------------------------- | ------- |
| `ScheduleStore.test.ts`  | 20 (D-01~D-15 + DB-01~DB-05) | Yes     |
| `skill-schedule.test.ts` | 5 (T-01~T-05)                | Yes     |
| **合計**                 | **25**                       | **Yes** |

---

## 未タスク登録結果（Step 1-E）

`unassigned-task-detection.md` で検出した 5 件を、`docs/30-workflows/unassigned-task/` に正式登録した。

| タスクID  | 指示書                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| UT-9G-001 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-cron-next-run-accuracy.md`   |
| UT-9G-002 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-event-trigger-completion.md` |
| UT-9G-003 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-notification-dispatch.md`    |
| UT-9G-004 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-graceful-shutdown.md`        |
| UT-9G-005 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-execution-push-event.md`     |

関連反映:

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルへ 5 件追加
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` の関連未タスクへ 5 件追加
