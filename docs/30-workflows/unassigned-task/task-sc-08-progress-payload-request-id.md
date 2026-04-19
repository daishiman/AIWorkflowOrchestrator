# 未タスク: progress payload への planId / requestId 付与による混線防止

## メタ情報

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| ID     | U-02（TASK-SC-08 由来）                                   |
| 検出元 | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE Phase 12 close-out |
| 優先度 | 中                                                        |
| 分類   | 機能改善                                                  |
| 登録日 | 2026-04-19                                                |
| 依存   | TASK-SC-08（完了）                                        |

## 概要

progress payload に `planId` / `requestId` を付与し、複数セッションが同時実行された際の進捗イベント混線を防止する。

## 背景

現在の progress payload は `{ phase, percentage, message }` のみで、リクエスト識別子を持たない。
複数のスキル生成が並行して走る（または前のリクエストのイベントが遅延して届く）場合、
Renderer 側でどのセッションの進捗かを判別できない。

## スコープ

- Main 側（`SkillCreatorService.onProgress`）で `planId` または `requestId` を payload に付与
- IPC プロトコル（`SKILL_CREATOR_PROGRESS` チャンネル）の payload 型拡張
- Renderer 側（`useStreamingProgress.ts`）で自セッションのイベントのみ処理するフィルタリング
- preload API 型定義更新

## 除外

- UI 側の複数セッション表示（別タスク）

## 完了基準

- progress payload に識別子が含まれる
- 異なる `planId` のイベントは Renderer 側でフィルタリングされる
- 既存テストが全て PASS する
