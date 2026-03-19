# UT-TASK06-004 AI_CHECK_CONNECTION legacy 整理と後方互換テスト

## メタ情報

```yaml
issue_number: 1354
```

## メタ情報

| 項目           | 内容                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| タスクID       | UT-TASK06-004                                                                  |
| タイトル       | AI_CHECK_CONNECTION legacy 整理と後方互換テスト                                |
| ステータス     | 未実施                                                                         |
| 優先度         | 中                                                                             |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 GAP-02 / DRIFT-4 / Phase 11 DI-0001 |
| 発見日         | 2026-03-17                                                                     |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                     |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   |
| 担当想定       | Main / IPC / Compatibility                                                     |

## 1. なぜこのタスクが必要か（Why）

legacy な AI_CHECK_CONNECTION 経路が残ると、後方互換と現行実装の責務が混線する。整理と後方互換テストが必要である。

## 2. 何を達成するか（What）

legacy 経路を整理しつつ、必要な後方互換をテストで保証する。

## 3. どのように実行するか（How）

- legacy 経路の残存箇所を洗い出す
- 現行契約に統一できる部分を整理する
- 必要な互換レイヤーだけを残す

## 4. 実行手順

1. legacy 経路の呼び出し元を列挙する。
2. 現行契約との差分を整理する。
3. 残す互換レイヤーと削除対象を決める。
4. 後方互換テストを追加する。

## 5. 完了条件チェックリスト

- legacy 経路の扱い方針が明文化されている
- 不要な経路が整理されている
- 後方互換テストがある

## 6. 検証方法

- legacy / current 両経路のテスト結果を確認する
- 呼び出し元が想定どおりの契約へ寄っているか確認する

## 7. リスクと対策

- 削除しすぎて既存利用を壊す: 互換利用箇所を先に棚卸しする
- 互換レイヤーが恒久化する: 削除条件を明文化する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

cleanup と互換保証を同時に扱うため、整理順序が重要である。
