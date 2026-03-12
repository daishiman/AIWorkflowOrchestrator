# Refactoring Log

## before

- Workspace request / title / attachment 生成が controller 内に散在していた。
- lifecycle handoff は導線契約だけで、chat payload の型が明示されていなかった。
- streaming overlay の reset 条件が revive 仕様と分離されていた。

## after

- shared types と renderer helper に責務を抽出した。
- entry surface と execution surface の境界を helper 名で表現できるようにした。
- reset ロジックを shared helper 基準で説明できるようにした。
