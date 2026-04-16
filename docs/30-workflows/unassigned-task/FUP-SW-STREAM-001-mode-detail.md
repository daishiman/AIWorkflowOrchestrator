# 未タスク: FUP-03 / mode 別に progress の詳細を変える

## タスク概要

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | FUP-SW-STREAM-001-mode-detail         |
| 優先度     | Medium                                |
| 関連タスク | TASK-SW-STREAM-001                    |
| 検出日     | 2026-04-16                            |
| 検出Phase  | Phase 12（unassigned-task-detection） |

## 概要

現状は `create` モードと同じ5段階進捗を全モードで使用しているが、
モード別（`collaborative` / `orchestrate` / `update` / `improve-prompt`）に
progress の詳細（メッセージや段階）を変える。

## 理由

- `create` / `collaborative` / `orchestrate` / `update` / `improve-prompt` の
  各モードで実際の処理フローが異なる可能性がある。
- 現状は同一の5段階だが、モードごとに適切なメッセージを表示することで
  ユーザー体験が向上する。

## 対象ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 実施方針案

- `onProgress` コールバックの発火箇所を helper 関数に切り出す。
- モードに応じて異なるメッセージセットを選択する設計にする。

## 実施タイミング

`TASK-SW-STREAM-002`（IPC 配線）完了後、実際のモード別フローが確定してから着手が望ましい。
現時点ではフロー詳細が未確定のため Medium 優先度とする。
