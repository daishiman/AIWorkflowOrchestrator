# 未タスク: FUP-01 / SkillCreatorProgressData を shared へ移動

## タスク概要

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | FUP-SW-STREAM-001-shared-type-move      |
| 優先度     | Low                                     |
| 関連タスク | TASK-SW-STREAM-001 / TASK-SW-STREAM-002 |
| 検出日     | 2026-04-16                              |
| 検出Phase  | Phase 12（unassigned-task-detection）   |

## 概要

`SkillCreatorService.ts` 内にローカル定義している `SkillCreatorProgressData` 型を
`packages/shared/` へ移動する。

## 理由

- `TASK-SW-STREAM-002` で `skillCreatorHandlers.ts` が IPC 経由で進捗を送信する際、
  renderer 側でも同じ型が必要になる可能性がある。
- main / renderer 間で同じ型を共有する準備としての移動。

## 対象ファイル

- 移動元: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 移動先: `packages/shared/src/types/skillCreatorProgress.ts`（例）

## 実施タイミング

`TASK-SW-STREAM-002`（IPC 配線）完了後が適切。
IPC 接続前の先行移動は破壊範囲を広げるため避ける。
