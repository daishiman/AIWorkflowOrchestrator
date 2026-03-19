# UT-SKILL-LIFECYCLE-08-TYPE-IMPL ランタイム実装移行

## メタ情報

```yaml
issue_number: 1349
```

## メタ情報

| 項目           | 内容                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| タスクID       | UT-SKILL-LIFECYCLE-08-TYPE-IMPL                                              |
| タイトル       | TASK-SKILL-LIFECYCLE-08 で設計済みの型定義をランタイム実装へ移行             |
| ステータス     | 未実施                                                                       |
| 優先度         | 中                                                                           |
| 発見元         | TASK-SKILL-LIFECYCLE-08 Phase 12 未タスク検出                                |
| 発見日         | 2026-03-17                                                                   |
| 関連タスク     | TASK-SKILL-LIFECYCLE-08                                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` |
| 担当想定       | Skill Lifecycle / Domain                                                     |

## 1. なぜこのタスクが必要か（Why）

型定義だけが先行し、ランタイム実装が追いつかないと、仕様と実装が分離したまま残る。型と実体を揃える必要がある。

## 2. 何を達成するか（What）

SkillVisibility、PublishReadiness などの設計済み型を、実行時ロジックへ落とし込む。

## 3. どのように実行するか（How）

- 型ごとの利用箇所を整理する
- ランタイム判定ロジックを設計する
- shared types と実装の整合を取る

## 4. 実行手順

1. 設計済み型の一覧を作る。
2. 各型に対応する実装責務を割り当てる。
3. 実装と型定義を同期する。
4. 回帰テストを追加する。

## 5. 完了条件チェックリスト

- 型だけ残っている要素が減っている
- ランタイム実装と shared types が一致する
- 利用箇所で仮実装が不要になる

## 6. 検証方法

- 型定義と実装コードの差分を確認する
- 関連ユースケースで挙動を確認する

## 7. リスクと対策

- 型の意図を誤って実装する: 設計書を起点に責務を確認する
- 実装だけ進み型がずれる: shared types を同時更新する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

設計済み資産を実際に使える機能へ変えるタスクである。
