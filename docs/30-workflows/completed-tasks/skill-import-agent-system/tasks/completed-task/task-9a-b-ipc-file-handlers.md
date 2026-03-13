---
id: TASK-9A-B
tier: 2
title: ファイル編集IPCハンドラー追加
phase: 9
depends_on: [TASK-9A-A]
parallel_with: []
blocks: [TASK-9A-C]
status: completed
priority: high
estimated_complexity: small
tags: [backend, main-process, ipc]
completed_at: 2026-02-19
---

# ファイル編集IPCハンドラー追加

## 概要

`SkillFileManager` を利用するファイル操作IPCハンドラーを実装し、`electronAPI.skill` 経由で Renderer から利用可能にした。

## 入力

- TASK-9A-A: SkillFileManager

## 出力

- `apps/desktop/src/main/ipc/skillFileHandlers.ts`（新規）
- `apps/desktop/src/main/ipc/index.ts`（登録処理追加）
- `apps/desktop/src/preload/skill-api.ts`（skill API 拡張）
- `apps/desktop/src/preload/channels.ts`（チャンネル追加）
- `packages/shared/src/ipc/channels.ts`（共有定数追加）
- テスト3ファイル（65テスト、全PASS）

## 実装内容

- 6チャンネルを追加
  - `skill:readFile`
  - `skill:writeFile`
  - `skill:createFile`
  - `skill:deleteFile`
  - `skill:listBackups`
  - `skill:restoreBackup`
- 全ハンドラーに `validateIpcSender` を適用
- 引数バリデーション（`typeof` + `trim`）を適用
- 既知エラーは `isKnownSkillFileError` で判別し、未知エラーは `Internal error` に統一
- `writeFile` 後に `skillService.scanAvailableSkills()` を実行

## 関連成果物

- タスク本体: `docs/30-workflows/TASK-9A-B-ipc-file-handlers/index.md`
- 実装ガイド: `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md`
- ドキュメント更新履歴: `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/documentation-changelog.md`

## 完了条件

- [x] ファイル読み込みIPCが機能する
- [x] ファイル書き込みIPCが機能する
- [x] ファイル作成IPCが機能する
- [x] ファイル削除IPCが機能する
- [x] バックアップ一覧IPCが機能する
- [x] バックアップ復元IPCが機能する
- [x] Preload APIが追加されている
- [x] 65テスト全PASS
