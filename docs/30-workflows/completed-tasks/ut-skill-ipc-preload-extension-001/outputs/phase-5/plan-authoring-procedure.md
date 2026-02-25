# Phase 5 計画書作成手順

## 前提

- 本Phaseは仕様書更新手順の確定のみを対象とし、実装コードは変更しない。

## 手順（Task 5-1）

1. task-9D〜9JのIPCチャネルを抽出し、30チャネル表を確定する。
2. `channels.ts` / `skill-api.ts` / `preload/types.ts` の3点同期チェック表を作成する。
3. 30チャネル × 3ファイル = 90チェック項目のP32チェックリストを作成する。
4. 実装順序を `9D→9E→9F→9G→9H→9I→9J` で固定する。
5. `docs/30-workflows/skill-import-agent-system/tasks/ipc-extension-plan.md` 作成時の章立てを固定する。

## IPC拡張計画書の章立て

- 1. 30チャネル定義表
- 2. channels拡張方針
- 3. skillAPI拡張方針
- 4. shared型配置方針
- 5. P32チェックリスト
- 6. task-9更新順

## SubAgent分担

- SubAgent-A: チャネル表・契約定義
- SubAgent-B: Preload API章
- SubAgent-C: 型配置章
- SubAgent-D: 全体統合・順序固定

## 完了状態

- Phase 5 Task 5-1: Completed
