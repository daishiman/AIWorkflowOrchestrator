# TASK-9B-A: skill-creator SKILL.md 作成

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| タスクID   | TASK-9B-A                   |
| Tier       | 2                           |
| タイトル   | skill-creator SKILL.md 作成 |
| Phase      | 9                           |
| 依存先     | TASK-7D                     |
| 並列対象   | TASK-9B-B                   |
| ブロック   | TASK-9B-C, TASK-9B-D        |
| ステータス | pending                     |
| 優先度     | critical                    |
| 複雑度     | medium                      |

## 概要

skill-creator スキルの SKILL.md を作成する。
このファイルはメタスキルの中核であり、全機能の定義を含む。

## 出力

- `~/.aiworkflow/skills/skill-creator/SKILL.md`

## Phase一覧

| Phase | 名称                   | ファイル                                                 |
| ----- | ---------------------- | -------------------------------------------------------- |
| 1     | 要件定義               | [phase-1-requirements.md](./phase-1-requirements.md)     |
| 2     | 設計                   | [phase-2-design.md](./phase-2-design.md)                 |
| 3     | 設計レビューゲート     | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 4     | テスト作成（TDD: Red） | [phase-4-test-red.md](./phase-4-test-red.md)             |
| 5     | 実装（TDD: Green）     | [phase-5-implementation.md](./phase-5-implementation.md) |
| 6     | テスト拡充             | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| 7     | テストカバレッジ確認   | [phase-7-coverage.md](./phase-7-coverage.md)             |
| 8     | リファクタリング       | [phase-8-refactor.md](./phase-8-refactor.md)             |
| 9     | 品質保証               | [phase-9-quality.md](./phase-9-quality.md)               |
| 10    | 最終レビューゲート     | [phase-10-final-review.md](./phase-10-final-review.md)   |
| 11    | 手動テスト検証         | [phase-11-manual-test.md](./phase-11-manual-test.md)     |
| 12    | ドキュメント更新       | [phase-12-documentation.md](./phase-12-documentation.md) |
| 13    | PR作成                 | [phase-13-pr.md](./phase-13-pr.md)                       |

## 完了条件

- [ ] SKILL.md が作成されている
- [ ] allowed-tools が適切に設定されている（9ツール）
- [ ] 全機能が記述されている（12機能）
- [ ] サブエージェント・参照資料のパスが正しい

## 関連タスク

| タスク    | 関係     | 内容                             |
| --------- | -------- | -------------------------------- |
| TASK-7D   | 依存先   | ChatPanel統合済みのUI            |
| TASK-9B-B | 並列     | hearing-facilitator エージェント |
| TASK-9B-C | ブロック | task-generator エージェント      |
| TASK-9B-D | ブロック | code-generator エージェント      |
| TASK-9B-E | ブロック | validator エージェント           |
| TASK-9B-F | ブロック | 参照資料                         |
| TASK-9B-G | ブロック | SkillCreatorService              |

## 参照

- [元タスク仕様](../task-9b-a-skill-md.md)
- [親タスク仕様](../task-020-task-9b-skill-creator.md)
- [スキル構造仕様](aiworkflow-requirements: claude-code-skills-structure.md)
