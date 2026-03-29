# Task04: テスト期待値更新

## メタ情報

| 項目         | 値                                                |
| ------------ | ------------------------------------------------- |
| タスクID     | TASK-LLM-MOD-04                                   |
| 責務         | Test lane                                         |
| 実行順序     | step-03-seq（Task01, Task02, Task03 完了後）      |
| 依存先       | TASK-LLM-MOD-01, TASK-LLM-MOD-02, TASK-LLM-MOD-03 |
| ブロック対象 | TASK-LLM-MOD-05                                   |
| ステータス   | completed                                         |
| 完了同期日   | 2026-03-24                                        |
| PR作成       | blocked（ユーザー承認待ち）                       |

## 概要

この task は、LLM provider registry 更新と Adapter 実装更新に対して、
テスト期待値が current facts に追従していることを確定する supporting lane である。

2026-03-24 の完了同期では、Task01〜03 の実装時点で主要テスト更新がすでに取り込まれていることを確認したため、
Task04 自体のコード差分は 0 行だった。今回の改善は、未着手テンプレートを残すのではなく、
完了済み workflow として証跡・outputs・old path 参照を canonical へ揃えることにある。

## current facts

| 観点                   | current fact                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| OpenAI registry        | `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini` を保持 |
| Anthropic health check | `claude-haiku-4-5` を使用                                                        |
| Google adapter         | `system_instruction` を request body へ送信                                      |
| llm handler tests      | `o3` / `o4-mini` の OpenAI 解決テストが存在                                      |
| follow-up              | `UT-LLM-MOD-04-001` を既存 backlog として維持                                    |

## エレガント改善の結論

- 単純な旧パス移設ではなく、completed workflow として再構成する
- `phase-7-coverage-check.md` / `phase-11-manual-test.md` / `phase-13-pr-creation.md` を canonical filename として固定する
- `outputs/phase-12/` の必須 6 成果物と `artifacts.json` / `outputs/artifacts.json` を追加する
- parent workflow と issue の old path 参照も同一 wave で更新する

## 30種思考法の監査

30種の思考法による監査結果は [outputs/phase-10/elegance-thinking-audit.md](./outputs/phase-10/elegance-thinking-audit.md) に集約した。
総合結論は「未着手文書の延命より、完了済み canonical workflow への再構成の方が複雑性が低く、skill 準拠も高い」である。

## 成果物

| Phase    | ステータス | 正本                                                           |
| -------- | ---------- | -------------------------------------------------------------- |
| Phase 1  | completed  | [phase-1-requirements.md](./phase-1-requirements.md)           |
| Phase 2  | completed  | [phase-2-design.md](./phase-2-design.md)                       |
| Phase 3  | completed  | [phase-3-design-review.md](./phase-3-design-review.md)         |
| Phase 4  | completed  | [phase-4-test-creation.md](./phase-4-test-creation.md)         |
| Phase 5  | completed  | [phase-5-implementation.md](./phase-5-implementation.md)       |
| Phase 6  | completed  | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       |
| Phase 7  | completed  | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| Phase 8  | completed  | [phase-8-refactoring.md](./phase-8-refactoring.md)             |
| Phase 9  | completed  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| Phase 10 | completed  | [phase-10-final-review.md](./phase-10-final-review.md)         |
| Phase 11 | completed  | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| Phase 12 | completed  | [phase-12-documentation.md](./phase-12-documentation.md)       |
| Phase 13 | blocked    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           |

## 関連ファイル

- [artifacts.json](./artifacts.json)
- [outputs/artifacts.json](./outputs/artifacts.json)
- [outputs/phase-11/manual-test-result.md](./outputs/phase-11/manual-test-result.md)
- [outputs/phase-12/implementation-guide.md](./outputs/phase-12/implementation-guide.md)
- [outputs/phase-12/system-spec-update-summary.md](./outputs/phase-12/system-spec-update-summary.md)
- [outputs/phase-12/documentation-changelog.md](./outputs/phase-12/documentation-changelog.md)
- [outputs/phase-12/unassigned-task-detection.md](./outputs/phase-12/unassigned-task-detection.md)
- [outputs/phase-12/skill-feedback-report.md](./outputs/phase-12/skill-feedback-report.md)
- [outputs/phase-12/phase12-task-spec-compliance-check.md](./outputs/phase-12/phase12-task-spec-compliance-check.md)
- [../unassigned-task/UT-LLM-MOD-04-001.md](../unassigned-task/UT-LLM-MOD-04-001.md)
- [../issues/issue-1561.md](../issues/issue-1561.md)
