# 未タスク検出レポート - UT-TASK06-007 Phase 12

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK06-007     |
| 作成日   | 2026-03-18        |
| Phase    | 12 - ドキュメント |
| 検出件数 | 3件               |

---

## 検出サマリー

| 未タスクID            | タイトル                                     | 優先度 | ステータス |
| --------------------- | -------------------------------------------- | ------ | ---------- |
| UT-TASK06-007-EXT-001 | タプル配列経由ハンドラ抽出パターン拡張       | Medium | 未着手     |
| UT-TASK06-007-EXT-002 | 別定数オブジェクトのチャンネル解決対応       | Medium | 未着手     |
| UT-TASK06-007-EXT-003 | ipcMain.on パターンの検証強化（第2フェーズ） | Low    | 未着手     |

---

## 検出内容詳細

### UT-TASK06-007-EXT-001: タプル配列経由ハンドラ抽出パターン拡張

**概要**:
`registerAllIpcHandlers` 内でタプル配列形式 `[IPC_CHANNELS.XXX, handler]` を使ってハンドラを一括登録するパターンが、`check-ipc-contracts.ts` の `extractMainHandlers` 関数で未対応。このパターンを使うハンドラは現在の静的解析では検出されず、R-01（存在チェック）でのフォールスポジティブ（Mainにハンドラがないという誤検出）が発生する可能性がある。

**現状のコード例**（検出できないパターン）:

```typescript
// apps/desktop/src/main/handlers/register-all.ts
const handlers: [string, IpcHandler][] = [
  [IPC_CHANNELS.SKILL_IMPORT, handleSkillImport],
  [IPC_CHANNELS.SKILL_REMOVE, handleSkillRemove],
];

for (const [channel, handler] of handlers) {
  ipcMain.handle(channel, handler);
}
```

**対応内容**:

- `extractMainHandlers` にタプル配列パターンの正規表現を追加
- 配列リテラル `[[channel, handler], ...]` の形式を解析してチャンネル名を抽出
- 既存テストに新パターン用ケースを追加

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（主に `extractMainHandlers` 関数）

**関連制約**: C-01（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-002: 別定数オブジェクトのチャンネル解決対応

**概要**:
現在の `resolveChannelMap` は `IPC_CHANNELS` 定数オブジェクトのみを解析対象とするが、プロジェクト内には `CHAT_EDIT_CHANNELS`、`SKILL_LIFECYCLE_CHANNELS` 等の別の定数オブジェクトにチャンネル定義が分散している場合がある。これらのチャンネルは現在の解析では「未定義チャンネル」として R-04（登録漏れ）の誤検出対象になる。

**現状の問題**:

```typescript
// apps/desktop/src/shared/ipc-channels.ts
export const IPC_CHANNELS = { ... };           // 解析済み
export const CHAT_EDIT_CHANNELS = { ... };     // 未解析
export const SKILL_LIFECYCLE_CHANNELS = { ... }; // 未解析
```

**対応内容**:

- `resolveChannelMap` を汎用化し、ファイル内の全 `export const *_CHANNELS` オブジェクトを解析対象に含める
- または、解析対象の定数オブジェクト名をCLIオプション（`--channel-objects`）で指定可能にする
- `check-ipc-contracts.config.json` による設定ファイルサポートも検討

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（主に `resolveChannelMap` 関数）

**関連制約**: C-02（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-003: ipcMain.on パターンの検証強化（第2フェーズ）

**概要**:
現在の実装では `ipcMain.handle()` を主要な検出対象とし、`ipcMain.on()` は第1フェーズとして限定的なサポートのみ。`ipcMain.on()` で登録されたイベントリスナー（一方向通信）と `preload` の `safeOn` の対応検証が不完全。

**現状の制約**:

- `ipcMain.on()` は検出されるが、`removeListener` / `removeAllListeners` のライフサイクルが追跡されない
- `safeOn` と `ipcMain.on` の対称性チェックが R-01 の対象外になっている

**対応内容**:

- `extractMainHandlers` に `ipcMain.on()` パターンの完全サポートを追加
- リスナーのライフサイクル（登録・解除）を追跡する `ListenerEntry` 型を導入
- R-01 の検出範囲を `ipcMain.handle + ipcMain.on` の両方に拡張

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（extractMainHandlers、matchAndValidate）

**関連制約**: C-03（実装ガイド 既知の制約テーブル参照）

---

## P3チェックリスト

**注意（P3/P38/P58対策）**: 3ステップの完了状況を記録する。

| ステップ               | 内容                                                                                        | 実施状況 |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------- |
| ① 指示書作成           | `docs/30-workflows/unassigned-task/` 配下にEXT-001/002/003の指示書を作成                    | 完了     |
| ② task-workflow登録    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに追加 | 完了     |
| ③ 関連仕様書リンク追加 | `ipc-contract-checklist.md` に「拡張課題」セクションとして参照リンクを追加                  | 完了     |

### 指示書配置先

```
1. docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-001-tuple-array-handler-extraction.md
2. docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-002-multi-channel-const-resolution.md
3. docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-003-ipc-on-pattern-enhancement.md
```

- task-workflow.md 残課題テーブル: 登録済み
- 関連仕様書リンク: ipc-contract-checklist.md に追加済み

---

## unassigned-task-detection.md 更新履歴

| 日付       | 件数 | 変更内容                                    |
| ---------- | ---- | ------------------------------------------- |
| 2026-03-18 | 3件  | 初版作成（UT-TASK06-007 Phase 12 完了時点） |
