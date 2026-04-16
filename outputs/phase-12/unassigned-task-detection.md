# Phase 12 成果物: 未タスク検出レポート

## タスクID: TASK-SW-STREAM-001

## 検出された未タスク・フォローアップ

| 項目   | 優先度 | 内容                                                  | 理由                                                                                              |
| ------ | ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FUP-01 | Low    | `SkillCreatorProgressData` を shared へ移動する       | main / renderer 間で同じ進捗型を使う準備になるが、現時点では local 定義で十分                     |
| FUP-02 | Low    | progress の phase / percentage / message を定数化する | magic string / number を減らし、テストの期待値を一元化する                                        |
| FUP-03 | Medium | mode 別に progress の詳細を変える                     | `create` / `collaborative` / `orchestrate` / `update` / `improve-prompt` の違いを後続で明示したい |

## スコープ外

- `SkillCreatorService.createSkill` への callback 追加は完了済み
- `skillCreatorHandlers.ts` の IPC 配線は TASK-SW-STREAM-002 側
- progress の共有型化は今回の破壊範囲を広げるため未実施

## 備考

- `Low` / `Low` / `Medium` の優先度で記録した
- 3 件とも独立して着手可能だが、IPC 接続前は shared 移動を急がなくてよい
