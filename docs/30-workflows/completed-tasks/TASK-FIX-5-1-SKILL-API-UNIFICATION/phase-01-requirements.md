# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 1                                  |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| タスク名 | SkillAPI二重定義の解消             |
| 分類     | リファクタリング                   |
| 対象機能 | Preload SkillAPI                   |
| 作成日   | 2026-02-08                         |

## 目的

`window.skillAPI` と `window.electronAPI.skill` の二重定義を解消し、`window.electronAPI.skill` に統一することで、コードベースの保守性と一貫性を向上させる。

## 実行タスク

### Task 1: API差異分析

2つのAPIエントリポイントの現状を分析し、差異を明確化する。

#### 1.1 現状の構造

| ファイル               | 定義内容                                      | 公開方法                          |
| ---------------------- | --------------------------------------------- | --------------------------------- |
| `preload/skill-api.ts` | `SkillAPI` インターフェース + `skillAPI` 実装 | `export` のみ                     |
| `preload/index.ts`     | `electronAPI.skill` として参照                | `contextBridge.exposeInMainWorld` |
| `preload/types.d.ts`   | `window.skillAPI: SkillAPI` 宣言              | グローバル型宣言                  |

#### 1.2 問題点

1. **型宣言の不整合**: `types.d.ts` で `window.skillAPI` が宣言されているが、実際には `contextBridge` で公開されていない
2. **混乱を招く設計**: 開発者が `window.skillAPI` を使用できると誤解する可能性
3. **死んだコード**: `window.skillAPI` の型宣言は使用されていない

### Task 2: 統一対象APIの確認

統一対象の13メソッドを確認し、各メソッドの役割を明確化する。

#### 2.1 一覧・管理系（5メソッド）

| メソッド      | 用途                     | IPCチャンネル       |
| ------------- | ------------------------ | ------------------- |
| `list`        | 利用可能スキル一覧取得   | `skill:list`        |
| `getImported` | インポート済みスキル取得 | `skill:getImported` |
| `import`      | スキルインポート         | `skill:import`      |
| `remove`      | スキル削除               | `skill:remove`      |
| `rescan`      | スキル再スキャン         | `skill:scan`        |

#### 2.2 実行系（3メソッド）

| メソッド             | 用途           | IPCチャンネル     |
| -------------------- | -------------- | ----------------- |
| `execute`            | スキル実行開始 | `skill:execute`   |
| `abort`              | 実行中断       | `skill:abort`     |
| `getExecutionStatus` | 実行状態取得   | `skill:getStatus` |

#### 2.3 イベント系（3メソッド）

| メソッド     | 用途                     | IPCチャンネル    |
| ------------ | ------------------------ | ---------------- |
| `onStream`   | ストリームメッセージ購読 | `skill:stream`   |
| `onComplete` | 完了イベント購読         | `skill:complete` |
| `onError`    | エラーイベント購読       | `skill:error`    |

#### 2.4 権限系（2メソッド）

| メソッド                 | 用途               | IPCチャンネル              |
| ------------------------ | ------------------ | -------------------------- |
| `onPermissionRequest`    | 権限リクエスト購読 | `skill:permissionRequest`  |
| `sendPermissionResponse` | 権限応答送信       | `skill:permissionResponse` |

### Task 3: 呼び出し元の特定

移行対象の呼び出し元を特定し、影響範囲を明確化する。

#### 3.1 Renderer Hooks

| ファイル                 | 使用API                      | 影響     |
| ------------------------ | ---------------------------- | -------- |
| `useSkillExecution.ts`   | `window.electronAPI.skill.*` | 変更不要 |
| `useSkillPermission.ts`  | `window.electronAPI.skill.*` | 変更不要 |
| `usePermissionDialog.ts` | `window.electronAPI.skill.*` | 変更不要 |

#### 3.2 Store Slices

| ファイル                 | 使用API                      | 影響     |
| ------------------------ | ---------------------------- | -------- |
| `skillSlice.ts`          | `window.electronAPI.skill.*` | 変更不要 |
| `setupSkillListeners.ts` | `window.electronAPI.skill.*` | 変更不要 |

#### 3.3 テストファイル

| ファイル                       | 使用API    | 影響     |
| ------------------------------ | ---------- | -------- |
| `skill-api.test.ts`            | モック経由 | 変更不要 |
| `skill-api.permission.test.ts` | モック経由 | 変更不要 |
| 各種統合テスト                 | モック経由 | 変更不要 |

### Task 4: 受け入れ基準の定義

| #   | 受け入れ基準                                                   | 検証方法         |
| --- | -------------------------------------------------------------- | ---------------- |
| AC1 | `types.d.ts` から `window.skillAPI` 宣言が削除されている       | コードレビュー   |
| AC2 | すべての呼び出し元が `window.electronAPI.skill` を使用している | grep検索         |
| AC3 | TypeScript型チェックがエラーなく通過する                       | `pnpm typecheck` |
| AC4 | 既存テストがすべて成功する                                     | `pnpm test`      |
| AC5 | Preload APIの動作が変更前と同一である                          | 手動テスト       |

## 参照資料

| 資料名           | パス                                    | 説明              |
| ---------------- | --------------------------------------- | ----------------- |
| Preload SkillAPI | `apps/desktop/src/preload/skill-api.ts` | 現行API実装       |
| Preload Index    | `apps/desktop/src/preload/index.ts`     | contextBridge公開 |
| 型宣言           | `apps/desktop/src/preload/types.d.ts`   | グローバル型宣言  |
| セキュリティ仕様 | `.claude/rules/04-electron-security.md` | Electron IPC原則  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                    | パス                                                                              | 内容                                            |
| --------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| スキルAPI仕様（13メソッド） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Preload API仕様（window.electronAPI.skill）     |
| IPCセキュリティパターン     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | safeInvoke/safeOnパターン、ホワイトリスト       |
| Electronセキュリティ原則    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | contextBridge、nodeIntegration: false           |
| セキュリティ設計原則        | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 最小権限、contextIsolation、nodeIntegration設定 |

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| API接続          | Preload → IPC → Main の通信経路は変更なし                    |
| 認証フロー       | N/A（本タスクでは認証は対象外）                              |
| データフロー     | Renderer → Preload(electronAPI.skill) → IPC → Main → Service |

## アーキテクチャ層別要件

| 層                         | 確認観点                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | `window.electronAPI.skill` を一貫して使用                                                                                                                                        |
| バックエンド（Main）       | 変更なし                                                                                                                                                                         |
| IPC通信                    | チャンネル定義は変更なし                                                                                                                                                         |
| Preload/セキュリティ       | `contextBridge` で公開するAPIを `electronAPI.skill` に統一。BrowserWindow必須設定（contextIsolation: true, nodeIntegration: false, sandbox: true）は`security-principles.md`参照 |
| データ                     | 変更なし                                                                                                                                                                         |

## 成果物

| 成果物               | パス                                         | 説明                   |
| -------------------- | -------------------------------------------- | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 本ドキュメント         |
| API比較表            | `outputs/phase-1/api-comparison.md`          | 2つのAPIの差異分析     |
| 呼び出し元マッピング | `outputs/phase-1/caller-mapping.md`          | 移行対象一覧           |
| 仕様整合性確認       | `outputs/phase-1/spec-alignment.md`          | システム仕様との整合性 |

## 完了条件

- [x] 2つのAPI（skill-api.ts vs preload/index.ts）の差異が分析されている
- [x] 統一対象の13メソッドが特定されている
- [x] 移行対象の呼び出し元が特定されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 接続要件（API/認証/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
