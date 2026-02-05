# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 5                              |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

### Task 1: IPC_CHANNELS定義の統一

**目的**: 単一のファイルにチャンネル定義を集約する

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

**実装内容**:

| 定数名                    | 値                          |
| ------------------------- | --------------------------- |
| SKILL_LIST                | `skill:list`                |
| SKILL_SCAN                | `skill:scan`                |
| SKILL_GET_IMPORTED        | `skill:getImported`         |
| SKILL_UPDATE              | `skill:update`              |
| SKILL_EXECUTE             | `skill:execute`             |
| SKILL_ABORT               | `skill:abort`               |
| SKILL_GET_STATUS          | `skill:get-status`          |
| SKILL_COMPLETE            | `skill:complete`            |
| SKILL_ERROR               | `skill:error`               |
| SKILL_STREAM              | `skill:stream`              |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` |

### Task 2: ホワイトリスト更新

**目的**: ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELSを更新する

**実装内容**:

| ホワイトリスト          | 含むチャンネル                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | SKILL_LIST, SKILL_SCAN, SKILL_GET_IMPORTED, SKILL_UPDATE, SKILL_EXECUTE, SKILL_ABORT, SKILL_GET_STATUS, SKILL_PERMISSION_RESPONSE |
| ALLOWED_ON_CHANNELS     | SKILL_COMPLETE, SKILL_ERROR, SKILL_STREAM, SKILL_PERMISSION_REQUEST                                                               |

### Task 3: ハードコード文字列の置換

**目的**: `"skill:*" as string`パターンをIPC_CHANNELS定数に置換する

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

**修正例**:

| Before                                 | After                                   |
| -------------------------------------- | --------------------------------------- |
| `"skill:complete" as string`           | `IPC_CHANNELS.SKILL_COMPLETE`           |
| `"skill:error" as string`              | `IPC_CHANNELS.SKILL_ERROR`              |
| `"skill:permission:request" as string` | `IPC_CHANNELS.SKILL_PERMISSION_REQUEST` |

### Task 4: ハンドラーチャンネル名の更新

**目的**: Main Processハンドラーを新チャンネル名に対応させる

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**修正内容**:

- `ipcMain.handle`のチャンネル名をIPC_CHANNELS定数から参照
- 旧チャンネル名（`skill:list-available`等）の削除

### Task 5: 重複定義の削除

**目的**: `packages/shared`側の重複チャンネル定義を削除する

**対象ファイル**: `packages/shared/src/ipc/channels.ts`（存在する場合）

**実装方針**:

- スキル関連チャンネル定義を削除
- `apps/desktop/src/preload/channels.ts`からの再エクスポートに変更

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |

## 統合テスト連携【必須】

フロント/バック接続の実装を確認する:

| 実装項目     | 内容                             |
| ------------ | -------------------------------- |
| IPC通信      | IPC_CHANNELS定数を介した通信実装 |
| セキュリティ | safeInvoke/safeOnパターン維持    |
| 型安全性     | TypeScript型チェック維持         |

## アーキテクチャ層別実装

| 層           | 実装観点                       | 実装ファイル配置                             | 仕様参照先                      |
| ------------ | ------------------------------ | -------------------------------------------- | ------------------------------- |
| Preload      | チャンネル定義、ホワイトリスト | `apps/desktop/src/preload/channels.ts`       | `security-skill-ipc.md`         |
| Preload API  | safeInvoke/safeOnパターン      | `apps/desktop/src/preload/skill-api.ts`      | `security-skill-ipc.md`         |
| Main Process | ハンドラー登録、チャンネル処理 | `apps/desktop/src/main/ipc/skillHandlers.ts` | `interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物     | パス                                         | 説明           |
| ---------- | -------------------------------------------- | -------------- |
| 実装コード | `apps/desktop/src/preload/channels.ts`       | チャンネル定義 |
| 実装コード | `apps/desktop/src/preload/skill-api.ts`      | Preload API    |
| 実装コード | `apps/desktop/src/main/ipc/skillHandlers.ts` | IPCハンドラー  |

## 完了条件

- [ ] IPC_CHANNELS定義が単一ファイルに集約されている
- [ ] ホワイトリストが正しく更新されている
- [ ] ハードコード文字列がIPC_CHANNELS定数に置換されている
- [ ] ハンドラーが新チャンネル名に対応している
- [ ] 重複定義が削除されている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
