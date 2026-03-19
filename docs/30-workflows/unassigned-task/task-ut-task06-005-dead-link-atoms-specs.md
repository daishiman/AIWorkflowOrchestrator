# UT-TASK06-005 testing-component-patterns-advanced.md デッドリンク修正

## メタ情報

```yaml
issue_number: 1355
```

## メタ情報

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | UT-TASK06-005                                                                   |
| タイトル       | testing-component-patterns-advanced.md デッドリンク修正（ui-ux-atoms-specs.md） |
| ステータス     | 未実施                                                                          |
| 優先度         | 低                                                                              |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 validate-structure.js       |
| 発見日         | 2026-03-17                                                                      |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`    |
| 担当想定       | Docs                                                                            |

## 1. なぜこのタスクが必要か（Why）

デッドリンクは仕様導線を壊し、開発者が正本へ到達できなくなる。ドキュメント品質と探索効率のため修正が必要である。

## 2. 何を達成するか（What）

`testing-component-patterns-advanced.md` から `ui-ux-atoms-specs.md` へのリンク切れを解消し、正しい参照先へ導線を戻す。

## 3. どのように実行するか（How）

- 現行リンク先の正本を特定する
- ドキュメント内リンクを修正する
- validate-structure で再確認する

## 4. 実行手順

1. 実在する正本ファイルを確認する。
2. 参照元リンクを修正する。
3. 必要なら topic-map / resource-map を再生成する。
4. 検証スクリプトで link 切れが消えたことを確認する。

## 5. 完了条件チェックリスト

- 正しいリンク先へ置き換わっている
- validate-structure で該当リンクエラーが消えている
- ドキュメント導線が壊れていない

## 6. 検証方法

- validate-structure.js を実行する
- 修正したリンク先ファイルが開けることを確認する

## 7. リスクと対策

- 別の旧名へ張り替える誤り: 正本ファイルを先に確認する
- 追加の派生リンク切れを見逃す: 関連章も合わせて確認する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

小修正だが、仕様探索の体験を維持するための衛生タスクである。
