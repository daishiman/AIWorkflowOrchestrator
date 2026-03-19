# UT-SKILL-LIFECYCLE-08-UI-IMPL 公開導線 UI 実装

## メタ情報

```yaml
issue_number: 1350
```

## メタ情報

| 項目           | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| タスクID       | UT-SKILL-LIFECYCLE-08-UI-IMPL                                                        |
| タイトル       | 公開導線UI（VisibilityBadge / PublishFlowDialog / CompatibilityResultView 等）を実装 |
| ステータス     | 未実施                                                                               |
| 優先度         | 中                                                                                   |
| 発見元         | TASK-SKILL-LIFECYCLE-08 Phase 12 未タスク検出                                        |
| 発見日         | 2026-03-17                                                                           |
| 関連タスク     | TASK-SKILL-LIFECYCLE-08                                                              |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`         |
| 担当想定       | Renderer / Skill UI                                                                  |

## 1. なぜこのタスクが必要か（Why）

公開機能のドメイン設計があっても UI 導線がなければ、利用者は機能に到達できない。公開導線 UI の実装が必要である。

## 2. 何を達成するか（What）

可視性表示、公開フロー、互換性結果表示など、公開に必要な UI 群を利用可能にする。

## 3. どのように実行するか（How）

- 画面導線を設計する
- 既存 UI パターンへ馴染む component を実装する
- IPC / domain 結果を UI に反映する

## 4. 実行手順

1. 導線と画面責務を整理する。
2. UI component を分割設計する。
3. 状態管理と IPC 接続を実装する。
4. 表示状態ごとの確認を行う。

## 5. 完了条件チェックリスト

- 公開導線に到達できる
- 互換性結果が UI で確認できる
- 主要状態で表示崩れがない

## 6. 検証方法

- 公開フローを手動確認する
- compatibility 結果表示の状態遷移を確認する

## 7. リスクと対策

- UI だけ先に作って契約が固まらない: IPC / domain 契約を先に確認する
- 画面責務が広がりすぎる: component 分割を先に決める

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

公開体験の最終到達点となるため、UX と契約整合を両立する必要がある。
