# UT-SKILL-LIFECYCLE-08-IPC-TEST 統合テスト実装

## メタ情報

```yaml
issue_number: 1347
```

## メタ情報

| 項目           | 内容                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| タスクID       | UT-SKILL-LIFECYCLE-08-IPC-TEST                                               |
| タイトル       | skill:publishing / skill:distribution 統合テスト実装                         |
| ステータス     | 未実施                                                                       |
| 優先度         | 中                                                                           |
| 発見元         | TASK-SKILL-LIFECYCLE-08 Phase 12 未タスク検出                                |
| 発見日         | 2026-03-17                                                                   |
| 関連タスク     | TASK-SKILL-LIFECYCLE-08                                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` |
| 担当想定       | IPC / Test                                                                   |

## 1. なぜこのタスクが必要か（Why）

11チャネル分の publishing / distribution 契約は実装量に対して回帰リスクが高い。統合テストがないと drift を見逃しやすい。

## 2. 何を達成するか（What）

関連 IPC チャネルに対して統合テストを整備し、P42 / P60 / P61 の回帰を防ぐ。

## 3. どのように実行するか（How）

- 対象チャネル一覧を固定する
- request / response / error の期待値を定義する
- 正常系と異常系の統合テストを実装する

## 4. 実行手順

1. 対象 11 チャネルを一覧化する。
2. 各チャネルの契約を整理する。
3. テストマトリクスを作る。
4. 統合テストを実装し、回帰ガードを追加する。

## 5. 完了条件チェックリスト

- 11チャネルが少なくとも 1 回は統合テストされる
- 契約違反時の failure path が検証される
- P42 / P60 / P61 の主要観点がカバーされる

## 6. 検証方法

- 統合テストを実行する
- 意図的な契約差分で failure を確認する

## 7. リスクと対策

- テストが重くなりすぎる: 共通 helper を使う
- 契約整理前に実装すると brittle になる: 契約一覧を先に固定する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

型だけでなく IPC 実体の回帰を防ぐためのテストタスクである。
