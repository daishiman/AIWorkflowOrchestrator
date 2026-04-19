# 未タスク: executePlan 起点 onProgress 本番配線統合テスト

## メタ情報

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| ID     | U-01（TASK-SC-08 由来）                                   |
| 検出元 | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE Phase 12 close-out |
| 優先度 | 中                                                        |
| 分類   | テスト追加                                                |
| 登録日 | 2026-04-19                                                |
| 依存   | TASK-SC-08（完了）                                        |

## 概要

`executePlan` 起点で `onProgress` から `GenerateStep` まで通す本番配線統合テストを追加する。

## 背景

TASK-SC-08 で `useStreamingProgress.ts` の `PHASE_TO_STAGE` マッピングと `api.onProgress()` 接続は実装済み。
しかし `executePlan` → `SkillCreatorService.onProgress` → IPC → Renderer 全体を通す E2E 統合テストは未作成。

## スコープ

- `executePlan` 呼び出し後に `onProgress` コールバックが Renderer まで到達することを確認
- 各 mode（create / collaborative / update / orchestrate / improve-prompt）で phase が正しく stage にマッピングされることを確認
- リスナーのクリーンアップ（コンポーネントアンマウント後に受信しない）を確認

## 除外

- UI の見た目の検証（別タスク）
- 既存の unit test の変更

## 完了基準

- 統合テストが CI で PASS する
- 全 mode の phase → stage マッピングがテストで網羅される
