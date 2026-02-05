# Phase 2: 設計

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 2                              |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

## 目的

IPCチャンネル統一の設計を行い、マッピングテーブルと移行計画を作成する。

## 実行タスク

### Task 1: マッピングテーブル作成

**目的**: 旧チャンネル→新チャンネルの対応表を作成する

**マッピングテーブル案**:

| 旧チャンネル                 | 新チャンネル（仕様準拠）      | 対応方針         |
| ---------------------------- | ----------------------------- | ---------------- |
| `skill:list-available`       | `skill:list`                  | 統一（旧を削除） |
| `skill:list-imported`        | `skill:getImported`           | 統一（新を使用） |
| `"skill:complete" as string` | `IPC_CHANNELS.SKILL_COMPLETE` | 定数置換         |
| `"skill:error" as string`    | `IPC_CHANNELS.SKILL_ERROR`    | 定数置換         |

### Task 2: IPC_CHANNELS定義の集約設計

**目的**: 単一の定義ファイルに集約する設計を行う

**設計方針**:

| 方針                 | 詳細                                              |
| -------------------- | ------------------------------------------------- |
| 正となる定義ファイル | `apps/desktop/src/preload/channels.ts`            |
| 削除対象             | `packages/shared/src/ipc/channels.ts`（重複部分） |
| エクスポート方法     | `as const`アサーションで型安全性確保              |

**IPC_CHANNELS定数構造**:

| グループ        | チャンネル定数名          | チャンネル文字列            |
| --------------- | ------------------------- | --------------------------- |
| スキル管理      | SKILL_LIST                | `skill:list`                |
|                 | SKILL_SCAN                | `skill:scan`                |
|                 | SKILL_GET_IMPORTED        | `skill:getImported`         |
|                 | SKILL_UPDATE              | `skill:update`              |
| スキル実行      | SKILL_EXECUTE             | `skill:execute`             |
|                 | SKILL_ABORT               | `skill:abort`               |
|                 | SKILL_GET_STATUS          | `skill:get-status`          |
| イベント（M→R） | SKILL_COMPLETE            | `skill:complete`            |
|                 | SKILL_ERROR               | `skill:error`               |
|                 | SKILL_STREAM              | `skill:stream`              |
| 権限            | SKILL_PERMISSION_REQUEST  | `skill:permission:request`  |
|                 | SKILL_PERMISSION_RESPONSE | `skill:permission:response` |

### Task 3: ホワイトリスト再構成

**目的**: ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELSを再構成する

**設計**:

| ホワイトリスト          | 含むチャンネル                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ALLOWED_INVOKE_CHANNELS | `skill:list`, `skill:scan`, `skill:getImported`, `skill:update`, `skill:execute`, `skill:abort`, `skill:get-status`, `skill:permission:response` |
| ALLOWED_ON_CHANNELS     | `skill:complete`, `skill:error`, `skill:stream`, `skill:permission:request`                                                                      |

### Task 4: 影響範囲の特定

**目的**: 修正が必要なファイルを特定する

**修正対象ファイル**:

| ファイル                                     | 修正内容                       |
| -------------------------------------------- | ------------------------------ |
| `apps/desktop/src/preload/channels.ts`       | IPC_CHANNELS統一定義           |
| `apps/desktop/src/preload/skill-api.ts`      | ハードコード文字列を定数に置換 |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 新チャンネル名に対応           |
| `packages/shared/src/ipc/channels.ts`        | 重複定義の削除                 |

## 参照資料

| 資料名           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| チャンネル棚卸し | `outputs/phase-1/channel-inventory.md`       | Phase 1成果物 |

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映する:

| 統合ポイント | 契約定義                                          |
| ------------ | ------------------------------------------------- |
| Preload→Main | IPC_CHANNELSの定数を介した通信                    |
| Main→Preload | ALLOWED_ON_CHANNELSに登録されたイベントチャンネル |
| セキュリティ | safeInvoke/safeOnパターンによるホワイトリスト検証 |

## アーキテクチャ層別設計

| 層           | 設計観点                             | 仕様参照先                      |
| ------------ | ------------------------------------ | ------------------------------- |
| Preload      | contextBridge経由API、ホワイトリスト | `security-skill-ipc.md`         |
| IPC通信      | チャンネル定義統一、型安全性         | `interfaces-agent-sdk-skill.md` |
| Main Process | ハンドラー登録、セキュリティ検証     | `security-electron-ipc.md`      |

## 成果物

| 成果物               | パス                                     | 説明                |
| -------------------- | ---------------------------------------- | ------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | システム構造        |
| マッピングテーブル   | `outputs/phase-2/channel-mapping.md`     | 旧→新チャンネル対応 |
| 影響範囲分析         | `outputs/phase-2/impact-analysis.md`     | 修正対象ファイル    |

## 完了条件

- [ ] マッピングテーブルが作成されている
- [ ] IPC_CHANNELS定義の集約設計が完了している
- [ ] ホワイトリスト再構成が設計されている
- [ ] 影響範囲（修正対象ファイル）が特定されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
