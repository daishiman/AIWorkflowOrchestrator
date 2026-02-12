# Phase 8: コードスメルレポート

## タスクID: TASK-9B-H

## 対象ファイル

| ファイル                                            | 行数  | 役割                 |
| --------------------------------------------------- | ----- | -------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 279行 | Main IPC ハンドラー  |
| `apps/desktop/src/preload/skill-creator-api.ts`     | 158行 | Preload API ブリッジ |

## カテゴリ別検出結果

### 1. 重複ハンドラーパターン

**検出**: 5つのinvokeハンドラーで `validateIpcSender + try/catch + IpcResult` パターンが繰り返されている。

**判定**: 見送り（一貫性維持）

**理由**:

- 既存の `skillHandlers.ts`（300行以上）も同じインラインパターンを使用
- `authModeHandlers.ts` も同じパターンを採用
- `ipc-validator.ts` に `withValidation` ラッパー関数が存在するが、プロジェクト全体で使用されていない
- 現在のパターンを変更すると、他のハンドラーファイルとの一貫性が損なわれる
- 各ハンドラーの引数バリデーションが個別に異なるため、共通化の効果が限定的

### 2. 命名不統一

**検出**: 0件

- `skillCreatorHandlers.ts` の命名は `skillHandlers.ts` と一貫している
  - 関数名: `registerSkillCreatorHandlers` / `unregisterSkillCreatorHandlers` - `register/unregister` パターン準拠
  - ファイル名: `{feature}Handlers.ts` パターン準拠
  - チャンネル名: `IPC_CHANNELS.SKILL_CREATOR_*` - 定数参照
- `skill-creator-api.ts` の命名は `skill-api.ts` と一貫している
  - export名: `skillCreatorAPI` - `{feature}API` パターン準拠

### 3. 型アサーション（as キーワード）

**検出**: 0件

- `skillCreatorHandlers.ts`: `as` キーワード使用なし
- `skill-creator-api.ts`: `as` キーワード使用なし
- 全ての型が明示的な型注釈で定義されている

### 4. 未使用import

**検出**: 0件

- `skillCreatorHandlers.ts`: 全importが使用されている
  - `ipcMain`, `BrowserWindow`, `IpcMainInvokeEvent`: ハンドラー登録・型注釈
  - `IPC_CHANNELS`: チャンネル定数参照
  - `SkillCreatorService`: サービス型参照
  - `validateIpcSender`, `toIPCValidationError`: セキュリティ検証
  - `CreateSkillOptions`, `ExecuteTasksOptions`, `SkillCreatorMode`, `ExecutionReport`: 共有型
- `skill-creator-api.ts`: 全importが使用されている
  - `ipcRenderer`, `IpcRendererEvent`: IPC通信
  - `IPC_CHANNELS`, `ALLOWED_ON_CHANNELS`, `ALLOWED_INVOKE_CHANNELS`: ホワイトリスト
  - 共有型: API引数・戻り値で使用

### 5. 追加発見: preload/index.ts への統合漏れ

**検出**: 1件（修正済み）

- `preload/index.ts` で `skillCreatorAPI` が `ElectronAPI` オブジェクトに未登録
- `contextBridge.exposeInMainWorld` への登録も未実施
- `ElectronAPI` 型定義（`types.ts`）には `skillCreator` プロパティが定義済み
- 型定義と実装の不整合により TypeScript エラー（TS2741）が発生

**修正内容**:

1. `skillCreatorAPI` と `SkillCreatorAPI` 型のimport追加
2. `ElectronAPI` オブジェクトに `skillCreator: skillCreatorAPI` プロパティ追加
3. `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` 追加
4. fallback の `window` 代入に `skillCreatorAPI` 追加

## IpcResult型の重複定義

**検出**: `IpcResult<T>` が2箇所で個別に定義されている

- `skillCreatorHandlers.ts` (L27-31): Main側
- `skill-creator-api.ts` (L26-30): Preload側

**判定**: 見送り（設計意図による分離）

**理由**:

- Main/Preload間は意図的にインターフェースを分離する設計（セキュリティ原則: 完全仲介）
- `@repo/shared` に配置すると、両プロセスが同一型に依存し、セキュリティ境界が曖昧になる
- 他のハンドラー（`authModeHandlers.ts` の `IPCResponse<T>` 等）も同様のパターンで個別定義している

## 総合判定

| カテゴリ               | スメル数 | 対応                 |
| ---------------------- | -------- | -------------------- |
| 重複ハンドラーパターン | 5箇所    | 見送り（一貫性維持） |
| 命名不統一             | 0件      | -                    |
| 型アサーション         | 0件      | -                    |
| 未使用import           | 0件      | -                    |
| preload統合漏れ        | 1件      | 修正済み             |
| IpcResult型重複        | 2箇所    | 見送り（設計意図）   |
