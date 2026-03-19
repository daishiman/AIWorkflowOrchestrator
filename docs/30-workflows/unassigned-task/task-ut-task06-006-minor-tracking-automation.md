# UT-TASK06-006 Phase 3 MINOR 指摘→未タスク自動追跡フロー整備

## メタ情報

```yaml
issue_number: 1356
```

## メタ情報

| 項目           | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| タスクID       | UT-TASK06-006                                                           |
| タイトル       | Phase 3 MINOR 指摘→未タスク自動追跡フロー整備                           |
| ステータス     | 未実施                                                                  |
| 優先度         | 中                                                                      |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback T-01 |
| 発見日         | 2026-03-17                                                              |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                              |
| 関連仕様リンク | `.claude/skills/task-specification-creator/references/patterns.md`      |
| 担当想定       | Workflow / Tooling                                                      |

## 1. なぜこのタスクが必要か（Why）

MINOR 指摘が人手依存で未タスク化されると、指摘漏れと追跡抜けが発生する。自動追跡フローを整備する必要がある。

## 2. 何を達成するか（What）

Phase 3 / Phase 10 などの MINOR 指摘が、決めたルールで backlog と unassigned-task に流れる仕組みを用意する。

## 3. どのように実行するか（How）

- MINOR 指摘の検出条件を定義する
- backlog 追加と unassigned-task 生成のルールを整える
- スクリプト化できる部分を自動化する

## 4. 実行手順

1. 現行の MINOR 記録形式を棚卸しする。
2. 自動化に必要なメタ情報を定義する。
3. backlog / unassigned-task 反映フローをスクリプト化する。
4. 失敗時の手動フォールバックを決める。

## 5. 完了条件チェックリスト

- MINOR 指摘の追跡ルールが明文化されている
- backlog 反映が再現可能である
- 未タスク生成の抜けを検出できる

## 6. 検証方法

- サンプル MINOR 指摘から backlog / unassigned-task を生成して確認する
- Phase 12 レポートで要作成止まりが発生しないことを確認する

## 7. リスクと対策

- 指摘表現が自由すぎて自動化できない: 記録フォーマットを先に固定する
- 自動化で誤起票が増える: 手動レビュー手順を残す

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/patterns.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

Phase 12 実績化の質を上げる横断改善タスクである。
