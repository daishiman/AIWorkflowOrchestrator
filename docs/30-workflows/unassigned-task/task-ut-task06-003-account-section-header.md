# UT-TASK06-003 AccountSection header 統合完全実装

## メタ情報

```yaml
issue_number: 1353
```

## メタ情報

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | UT-TASK06-003                                                                   |
| タイトル       | AccountSection header 統合完全実装                                              |
| ステータス     | 未実施                                                                          |
| 優先度         | 低                                                                              |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-03 / Phase 11 DI-0004 |
| 発見日         | 2026-03-17                                                                      |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`    |
| 担当想定       | Renderer / UI                                                                   |

## 1. なぜこのタスクが必要か（Why）

AccountSection の header 実装が部分統合のままだと、UI 一貫性と保守性が下がる。見出し構造を完全統合し、状態差分を減らす必要がある。

## 2. 何を達成するか（What）

AccountSection header の構造・文言・レイアウトを統一し、重複や分岐を減らす。

## 3. どのように実行するか（How）

- 現行 header 実装の重複を整理する
- 共通 component / prop 設計へ寄せる
- 状態別表示の一貫性を確認する

## 4. 実行手順

1. 現行の header 差分を棚卸しする。
2. 共通化可能な構造を抽出する。
3. 統合後の表示条件を整理する。
4. 実装とスクリーン差分を確認する。

## 5. 完了条件チェックリスト

- header 実装が 1 系統に統合されている
- 状態別の表示が一貫している
- UI 上の回帰がない

## 6. 検証方法

- AccountSection の各状態で header 表示を確認する
- 重複した header 実装が残っていないことを確認する

## 7. リスクと対策

- 共通化で例外ケースが失われる: 状態一覧を先に固定する
- 見た目だけ揃って責務が散る: props と責務境界を明示する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

低優先度だが、UI 統一と保守性の観点で早めに閉じる価値がある。
