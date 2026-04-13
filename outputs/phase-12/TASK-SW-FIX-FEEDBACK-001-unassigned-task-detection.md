# Phase 12: 未タスク検出

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 検出結果

0件。

## スコープ外確認

以下はスコープ外として意図的に対応しない:

- templateモード側の fetchSkills ロジック変更（createSkill 内部が処理）
- skillPath=null になる IPC 側の根本原因修正（Wave A で対処予定）

## 参考メモ

- `skillPath === ""` の表示方針は別論点だが、今回の修正範囲では未タスク化しない
- `fetchSkills` 失敗時の catch 無視は、生成成功後の遷移を阻害しないため現行方針を維持した
