# TASK-SW-STREAM-FUP-01: SkillCreatorProgressData の shared 移動

## 概要

`SkillCreatorProgressData` 型を `packages/shared/src/types/` へ移動する。
IPC 通信で main/renderer 間で型を共有するため。
TASK-SW-STREAM-002（IPC 配線）完了後のタイミングで実施推奨。

## 背景

TASK-SW-STREAM-001 で onProgress コールバックを実装した際、`SkillCreatorProgressData` 型をローカル定義した。
TASK-SW-STREAM-002 で IPC 配線を行うと、renderer でも同型が必要になる。
現状ローカル定義のままだと型の重複定義が発生する。

## 変更対象ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（型定義削除・import 追加）
- `packages/shared/src/types/index.ts`（型定義追加・export）

## 受入基準

- `SkillCreatorProgressData` が `@repo/shared/types` から import 可能
- 既存の型参照が全て shared の import に切り替わっている
- typecheck/test が全て pass

## 苦戦箇所（実装知見）

| 苦戦箇所              | 問題                                              | 解決策                              |
| --------------------- | ------------------------------------------------- | ----------------------------------- |
| shared 移動タイミング | IPC 接続前に shared に移動すると死コードになる    | TASK-SW-STREAM-002 完了後に実施する |
| 型のバレル export     | shared/types の index.ts への追加漏れが起きやすい | 移動時は export を先に確認          |

## 参照

- TASK-SW-STREAM-001（型の初出）
- TASK-SW-STREAM-002（IPC 配線タスク）
- `packages/shared/src/types/index.ts`（移動先）
