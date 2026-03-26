# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 4                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 1, Phase 2, Phase 3                          |
| 後続Phase  | Phase 5                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

failure append regression を先にテスト観点として固定し、実装の抜け漏れを防ぐ。

## 実行タスク

- engine failure test の期待値を定義する
- facade failure test の期待値を定義する
- repeated failure 時の artifact 件数増加ケースを定義する
- artifact 順序、payload parity、resume consumer 観点を matrix へ入れる
- targeted vitest command を固定する

## 参照資料

| 参照資料    | パス                             | 内容             |
| ----------- | -------------------------------- | ---------------- |
| Phase 2     | `phase-2-design.md`              | append ルール    |
| test matrix | `outputs/phase-4/test-matrix.md` | テストケース一覧 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                       | 内容                          |
| ----------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| runtime public contract | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md` | failure response 読み取り根拠 |

## 統合テスト連携

| 観点   | 連携内容                                                              |
| ------ | --------------------------------------------------------------------- |
| engine | `SkillCreatorWorkflowEngine.test.ts` に反映する                       |
| facade | `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` に反映する |

## 成果物

| 成果物      | パス                             | 説明           |
| ----------- | -------------------------------- | -------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | ケースと期待値 |

## 完了条件

- [ ] engine / facade / repeated failure の3系統がケース化されている
- [ ] artifact kind と件数が期待値へ含まれている
- [ ] targeted vitest command が固定されている
- [ ] state だけでなく artifact 正本を確認する観点が入っている
