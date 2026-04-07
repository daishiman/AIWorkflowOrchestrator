# TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## 概要

APPROVAL / EXECUTION 系の IPC チャンネル定義を shared canonical path へ統一する follow-up。

## 背景

- `packages/shared` と `apps/desktop` の IPC 参照が散在すると、preload / main / docs の契約がずれる。
- shared channels を正本に寄せることで、`skillCreatorAPI` などの surface からの参照を一元化できる。

## 実行タスク

1. shared の IPC チャンネル定義を正本として確認する。
2. preload / main / renderer 側の参照先を shared 正本へ寄せる。
3. system spec と workflow documentation の channel table を同一表記へ統一する。
4. 既存テストで channel 名・allowlist・handler 登録が一致することを確認する。

## 完了条件

- IPC チャンネル参照が single source of truth になっている。
- docs とコードの channel 名が一致している。
- follow-up の未タスク化が不要な状態になっている。
