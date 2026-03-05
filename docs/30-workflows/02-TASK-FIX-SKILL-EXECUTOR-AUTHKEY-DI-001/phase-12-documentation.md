# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| 機能名     | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001        |
| タスク名   | SkillExecutorへのAuthKeyService注入経路の統一 |
| 前提Phase  | Phase 11                                      |
| 後続Phase  | Phase 13                                      |
| 作成日     | 2026-03-05                                    |
| ステータス | pending                                       |

## 目的

Phase 12必須5タスクを完了可能な形で固定する。

## 背景

SkillExecutorの認証キー取得経路が注入あり・なしで分岐し、判定基準が分裂する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1(中学生向け)とPart 2(技術者向け)の2部構成を定義する
- Task 12-2 システム仕様更新: Step 1-A/1-B/1-C を必須で実行し、Step 2は条件判定を記録する
- Task 12-3 更新履歴作成: documentation-changelogを生成し全Step結果を記録する
- Task 12-4 未タスク検出: 0件でも unassigned-task-detection を出力する
- Task 12-5 フィードバック作成: 改善点が0件でも skill-feedback-report を出力する

## 参照資料

### 実装・コード

| 資料名             | パス                                                                        | 用途                      |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| Skill IPCハンドラ  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                | SkillExecutor生成DIを確認 |
| SkillExecutor      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | getApiKey判定順序を確認   |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`                      | execute委譲境界を確認     |
| Auth連携テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | DI有無差分を確認          |
| Renderer preflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`            | 事前検知との整合を確認    |

### システム仕様（aiworkflow-requirements）

| 資料名              | パス                                                                                 | 用途                     |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| Executor仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行時認証仕様           |
| Skill I/F           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | skill:execute契約        |
| Agent IPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 失敗契約経路             |
| システムIPC仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                | auth-key契約             |
| 認証I/F             | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 認証状態型               |
| 認証アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`    | 認証責務分離             |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | 境界防御                 |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Error.code伝搬境界       |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | AUTHENTICATION_ERROR運用 |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | 回帰検証基準             |
| タスク運用          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 台帳同期                 |
| 教訓                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | DI導入時の回帰教訓       |
| リソースマップ      | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                     | 抽出漏れ防止             |
| 検索スクリプト      | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                      | 仕様抽出コマンド         |

### 依存Phase

| 資料名              | パス                           | 用途             |
| ------------------- | ------------------------------ | ---------------- |
| 依存Phase 1 仕様    | `phase-1-requirements.md`      | 依存入力を確認   |
| 依存Phase 1 成果物  | `outputs/phase-1/`             | 依存成果物を確認 |
| 依存Phase 2 仕様    | `phase-2-design.md`            | 依存入力を確認   |
| 依存Phase 2 成果物  | `outputs/phase-2/`             | 依存成果物を確認 |
| 依存Phase 5 仕様    | `phase-5-implementation.md`    | 依存入力を確認   |
| 依存Phase 5 成果物  | `outputs/phase-5/`             | 依存成果物を確認 |
| 依存Phase 6 仕様    | `phase-6-test-expansion.md`    | 依存入力を確認   |
| 依存Phase 6 成果物  | `outputs/phase-6/`             | 依存成果物を確認 |
| 依存Phase 7 仕様    | `phase-7-coverage-check.md`    | 依存入力を確認   |
| 依存Phase 7 成果物  | `outputs/phase-7/`             | 依存成果物を確認 |
| 依存Phase 8 仕様    | `phase-8-refactoring.md`       | 依存入力を確認   |
| 依存Phase 8 成果物  | `outputs/phase-8/`             | 依存成果物を確認 |
| 依存Phase 9 仕様    | `phase-9-quality-assurance.md` | 依存入力を確認   |
| 依存Phase 9 成果物  | `outputs/phase-9/`             | 依存成果物を確認 |
| 依存Phase 10 仕様   | `phase-10-final-review.md`     | 依存入力を確認   |
| 依存Phase 10 成果物 | `outputs/phase-10/`            | 依存成果物を確認 |
| 依存Phase 11 仕様   | `phase-11-manual-test.md`      | 依存入力を確認   |
| 依存Phase 11 成果物 | `outputs/phase-11/`            | 依存成果物を確認 |

## 実行手順

1. Task 12-1: implementation-guide.md を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録、関連リンク、LOGS.md(2ファイル)、topic-map.md を更新する。
3. Task 12-2 Step 1-B: 実装状況テーブルを `completed` または `spec_created` へ更新する。
4. Task 12-2 Step 1-C: 関連タスクテーブルのステータスを更新する。
5. Task 12-2 Step 2: 新規I/F追加有無を判定し、必要時だけ仕様更新を実施する。
6. Task 12-3/12-4/12-5: changelog、未タスク検出、skill-feedback を出力する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物               | パス                                            | 説明                        |
| -------------------- | ----------------------------------------------- | --------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part1/Part2構成             |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A/1-B/1-C/Step 2記録 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴        |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 検出結果(0件でも作成)       |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点(0件でも作成)         |
| Task2実行ログ        | `outputs/phase-12/phase12-task2-step-log.md`    | Step 1-A/1-B/1-C/Step 2記録 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001
```

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                       | 完了条件                                        |
| -------- | ------------------------------ | ----------------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + LOGS.md(2) + topic-map 更新          |
| Step 1-B | 全タスクで必須                 | 実装状況を completed または spec_created へ更新 |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新                      |
| Step 2   | 新規I/F追加がある場合          | 対象仕様を更新し変更履歴へ記録                  |

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明、日常例、専門用語の即時説明。
- Part 2: TypeScript型、APIシグネチャ、エッジケース、設定値一覧。
- 未タスク検出レポートは0件でも必ず出力する。
- スキルフィードバックは改善点0件でも必ず出力する。

## 次のPhase

Phase 13: PR作成
