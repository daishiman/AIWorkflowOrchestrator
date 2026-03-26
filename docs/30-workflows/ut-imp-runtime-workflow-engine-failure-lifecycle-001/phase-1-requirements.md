# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 1                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系 lifecycle の論点を 1 枚に固定し、実装前に reject / `success:false` / verify review の 3 経路で何が保存されるべきかを明確化する。

## 実行タスク

- 失敗系 3 経路の要件を固定する
- facade / engine / downstream UI の責務境界を固定する
- artifact 履歴戦略の決定条件を固定する
- 受入基準をテスト可能な文に落とす

## 参照資料

| 資料名   | パス                                                                                                      | 説明                     |
| -------- | --------------------------------------------------------------------------------------------------------- | ------------------------ |
| 元タスク | `../../unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`                         | 問題定義の正本           |
| 親 task  | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                                | workflow engine 基礎契約 |
| Task04   | `../../skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`    | review UI の前提         |
| Task08   | `../../skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md` | resume 契約              |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                      |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| owner 分離               | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | facade と engine の責務境界               |
| Electron service details | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | runtime service の責務境界                |
| public IPC 境界          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | workflow engine と public contract の接点 |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | state owner とエラー処理の設計原則        |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | failure path テストと gate 観点           |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`              | same-wave sync と drift 防止              |

## 成果物

| 成果物              | パス                                     | 説明                                             |
| ------------------- | ---------------------------------------- | ------------------------------------------------ |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | system spec / parent task / code anchor の対応表 |

## 統合テスト連携

- Phase 1 の時点ではテストを実行しないが、`outputs/phase-1/spec-extraction-map.md` を基準に Phase 4 の test matrix が参照すべき code anchor と system spec を固定する。
- reject / `success:false` / `verification_review` の 3 経路を、Phase 4 以降で別ケースとして必ず分離する。
- Task04 / Task08 の downstream 契約は、この Phase で固定した owner 境界を前提に回帰確認する。

## 完了条件

- [ ] 失敗系 3 経路の要件が区別されている
- [ ] facade と engine の owner 境界が明記されている
- [ ] artifact 履歴戦略の判断基準が定義されている
- [ ] AC-1 から AC-6 へ直接結びつく要件になっている
- [ ] **本Phase内の全タスクを100%実行完了**
