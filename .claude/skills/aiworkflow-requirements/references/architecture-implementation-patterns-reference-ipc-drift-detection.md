# 実装パターン / IPC契約ドリフト自動検出 (S-IPC-AUTO)

> 親仕様書: [architecture-implementation-patterns-reference-ipc-contract-audits.md](architecture-implementation-patterns-reference-ipc-contract-audits.md)
> タスク: UT-TASK06-007

## 概要

grepベースの静的解析で Main Process ハンドラ（`ipcMain.handle`）と Preload API（`safeInvoke`）の契約ドリフトを自動検出するパターン。

## スクリプト

`apps/desktop/scripts/check-ipc-contracts.ts`

## 検出ルール

| ルールID | ルール名 | 重大度 | 対応P |
| --- | --- | --- | --- |
| R-01 | チャンネル孤児（Main/Preload片方のみ） | warning | - |
| R-02 | 引数形式不一致（object vs primitive） | error | P44 |
| R-03 | チャンネル名ハードコード | warning | P27 |
| R-04 | 未登録チャンネル（Preloadのみ） | error | - |

## 実行方法

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
```

## 抽出パターン

- Mainハンドラ: `ipcMain.(handle|on)` + マルチライン結合（次5行まで）
- Preload: `safe(Invoke|On)` パターン
- チャンネル解決: `IPC_CHANNELS.XXX` → `channels.ts` の定数マッピングで実値に変換

## 既知の制約

- タプル配列経由登録（`[IPC_CHANNELS.XXX, handler]`）は未抽出（約108件）
- `CHAT_EDIT_CHANNELS` 等の別定数オブジェクトは未対応
- ブロックコメント内のコードは `inBlockComment` フラグでスキップ

## 苦戦箇所と教訓

1. **マルチラインipcMain.handle**: コードフォーマッターによる改行挿入を考慮し、次行結合が必須
2. **tsx環境のパス解決**: `require.main === module` が動作しないため `process.argv[1]` ベースで判定
3. **P57再発**: worktree環境を理由にした仕様書更新の先送りは10件の漏れを生む

## 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| UT-TASK06-007 | IPC契約ドリフト自動検出スクリプト | 完了（2026-03-18） |
| UT-TASK06-007-EXT-001 | タプル配列経由ハンドラ抽出拡張 | 未着手 |
| UT-TASK06-007-EXT-002 | 別定数オブジェクトチャンネル解決 | 未着手 |
| UT-TASK06-007-EXT-003 | ipcMain.onパターン検証強化 | 未着手 |
