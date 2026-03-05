# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| 機能名     | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001        |
| タスク名   | SkillExecutorへのAuthKeyService注入経路の統一 |
| 前提Phase  | Phase 10                                      |
| 後続Phase  | Phase 12                                      |
| 作成日     | 2026-03-05                                    |
| ステータス | pending                                       |

## 目的

手動検証と証跡で実利用品質を確認する。

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

- 手動シナリオ設計: ユーザー操作シナリオを固定する
- 証跡取得計画: スクリーンショットとログ採取手順を固定する
- 判定記録: Pass/Fail判定と原因を記録する

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

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-N/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- skill:execute の AUTHENTICATION_ERROR 伝搬を統合対象に固定する。
- AuthKeyService注入経路と env fallback 経路の優先順位を固定する。
- Renderer preflight と Main最終防衛の判定不一致を0件にする。
- 統合ログは `outputs/phase-11/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物                 | パス                                     | 説明         |
| ---------------------- | ---------------------------------------- | ------------ |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 手動検証結果 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | 証跡一覧     |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | 撮影計画     |

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

## 次のPhase

Phase 12: ドキュメント更新
