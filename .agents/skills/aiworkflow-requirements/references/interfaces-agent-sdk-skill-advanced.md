# Agent SDK Skill 仕様 / advanced specification

> 親仕様書: [interfaces-agent-sdk-skill.md](interfaces-agent-sdk-skill.md)
> 役割: advanced specification

## SkillSlice型定義（TASK-6-1）

Renderer Process側のスキル機能状態管理。Zustand StateCreatorパターンで実装。

### 実装ファイル

| ファイル                 | パス                                                     | 説明            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| `skillSlice.ts`          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | Slice定義       |
| `setupSkillListeners.ts` | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | IPCリスナー設定 |

### SkillSliceインターフェース

SkillSliceは状態（14項目）、アクション（10項目）、内部ハンドラー（4項目）で構成される。

#### 状態プロパティ

| プロパティ           | 型                               | 説明                     |
| -------------------- | -------------------------------- | ------------------------ |
| `availableSkills`    | `SkillMetadata[]`                | 利用可能なスキル一覧     |
| `importedSkills`     | `ImportedSkill[]`                | インポート済みスキル一覧 |
| `selectedSkillName`  | `string \| null`                 | 選択中のスキル名         |
| `isExecuting`        | `boolean`                        | 実行中フラグ             |
| `executionId`        | `string \| null`                 | 現在の実行ID             |
| `executionStatus`    | `SkillExecutionStatus \| null`   | 実行ステータス           |
| `streamingMessages`  | `SkillStreamMessage[]`           | ストリーミングメッセージ |
| `pendingPermission`  | `SkillPermissionRequest \| null` | 保留中の権限リクエスト   |
| `skillError`         | `string \| null`                 | エラー情報               |
| `isLoadingSkills`    | `boolean`                        | スキル一覧読み込み中     |
| `isScanning`         | `boolean`                        | スキルスキャン中         |
| `isImporting`        | `boolean`                        | スキルインポート中       |
| `importingSkillName` | `string \| null`                 | インポート中のスキル名   |

#### アクション

| アクション               | シグネチャ                                        | 説明                           |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| `fetchSkills`            | `() => Promise<void>`                             | スキル一覧取得                 |
| `rescanSkills`           | `() => Promise<void>`                             | スキル再スキャン               |
| `importSkill`            | `(skillName: string) => Promise<void>`            | スキルインポート               |
| `removeSkill`            | `(skillName: string) => Promise<void>`            | スキル削除                     |
| `selectSkill`            | `(skillName: string \| null) => void`             | スキル選択                     |
| `executeSkill`           | `(prompt: string) => Promise<void>`               | スキル実行                     |
| `abortExecution`         | `() => void`                                      | 実行中断                       |
| `respondToPermission`    | `(approved: boolean, remember?: boolean) => void` | 権限リクエスト応答             |
| `clearError`             | `() => void`                                      | エラークリア                   |
| `clearStreamingMessages` | `() => void`                                      | ストリーミングメッセージクリア |

#### 内部ハンドラー

IPCイベントを受信して状態を更新する。`_`プレフィックスは内部用を示す。

| ハンドラー                 | シグネチャ                                     | 用途               |
| -------------------------- | ---------------------------------------------- | ------------------ |
| `_handleStreamMessage`     | `(msg: SkillStreamMessage) => void`            | ストリーム受信処理 |
| `_handleComplete`          | `(executionId: string) => void`                | 実行完了処理       |
| `_handleError`             | `(executionId: string, error: string) => void` | エラー処理         |
| `_handlePermissionRequest` | `(req: SkillPermissionRequest) => void`        | 権限リクエスト受信 |

### 関連型定義

SkillSliceで使用する型は`packages/shared/src/types/skill.ts`で定義。

| 型                       | 説明                     |
| ------------------------ | ------------------------ |
| `SkillMetadata`          | スキルメタデータ         |
| `ImportedSkill`          | インポート済みスキル情報 |
| `SkillExecutionStatus`   | 実行ステータス列挙型     |
| `SkillStreamMessage`     | ストリーミングメッセージ |
| `SkillPermissionRequest` | 権限リクエスト           |

### セレクター

useAppStoreから専用セレクターを提供。

| セレクター      | 説明                                |
| --------------- | ----------------------------------- |
| `useSkillStore` | SkillSlice全体を取得（shallow比較） |

### テストカバレッジ

| カテゴリ     | テスト数 | ファイル                              |
| ------------ | -------- | ------------------------------------- |
| 基本機能     | 59       | `skillSlice.test.ts`                  |
| エッジケース | 16       | `skillSlice.edge-cases.test.ts`       |
| 状態遷移     | 17       | `skillSlice.state-transition.test.ts` |
| IPC連携      | 14       | `skillSlice.ipc.test.ts`              |
| 統合テスト   | 7        | `skillSlice.integration.test.ts`      |
| **合計**     | **113**  |                                       |

---

## ModifierSkill（スライド逆同期機能）

### 概要

スライドプレゼンテーション機能において、Reveal.js HTML（index.html）の変更をstructure.md（構造定義ファイル）に逆同期する機能。

**実装ファイル**:

- `apps/desktop/src/main/slide/modifier-skill.ts` - ModifierSkill実行ロジック
- `apps/desktop/src/main/slide/agent-client.ts` - Agent SDK通信クライアント
- `apps/desktop/src/main/slide/skill-executor.ts` - スキル実行オーケストレーション
- `apps/desktop/src/main/slide/sync-manager.ts` - 同期管理

### 型定義

| 型                    | 説明       |
| --------------------- | ---------- |
| `ModifierSkillInput`  | スキル入力 |
| `ModifierSkillOutput` | スキル出力 |
| `StructureChange`     | 変更情報   |
| `SyncStatus`          | 同期状態   |
| `SyncDirection`       | 同期方向   |

### IPC チャンネル（スライド同期）

| チャンネル            | 方向            | 説明               |
| --------------------- | --------------- | ------------------ |
| `slide:sync-status`   | Main → Renderer | 同期状態通知       |
| `slide:sync-progress` | Main → Renderer | 同期進捗通知       |
| `slide:reverse-sync`  | Renderer → Main | 逆同期手動トリガー |
| `slide:sync-error`    | Main → Renderer | 同期エラー通知     |

---

## ChatPanel統合（TASK-7D）

### 概要

ChatPanelは、既存チャット機能にスキル関連コンポーネントを統合する統括コンポーネントである。

### 統合コンポーネント一覧

| コンポーネント     | ファイルパス                              | 統合方式             |
| ------------------ | ----------------------------------------- | -------------------- |
| SkillSelector      | `components/skill/SkillSelector.tsx`      | 直接レンダー         |
| SkillStreamingView | `components/skill/SkillStreamingView.tsx` | 条件付きレンダー     |
| SkillImportDialog  | `components/skill/SkillImportDialog.tsx`  | ローカルstate制御    |
| PermissionDialog   | `components/skill/PermissionDialog.tsx`   | Store-directパターン |

### ChatPanel公開インターフェース

| 名前              | 種別      | 説明                                                      |
| ----------------- | --------- | --------------------------------------------------------- |
| `ChatPanelProps`  | type      | `{ onImportRequest?: (skill: SkillMetadata) => void }`    |
| `ChatPanelHandle` | type      | `{ handleImportRequest: (skill: SkillMetadata) => void }` |
| `ChatPanel`       | component | `forwardRef<ChatPanelHandle, ChatPanelProps>`             |

### Store依存（useAppStore）

| セレクタ               | 用途                     |
| ---------------------- | ------------------------ |
| `selectedSkillName`    | 選択中スキル名           |
| `streamingMessages`    | ストリーミングメッセージ |
| `isExecuting`          | 実行中フラグ             |
| `skillExecutionStatus` | 実行ステータス           |
| `fetchSkills`          | スキル一覧取得アクション |

---

## SkillFileManager（TASK-9A-A）

### 概要

スキルファイルのCRUD操作を提供するサービスクラス。スキルディレクトリ内のファイル読み書き、バックアップ、復元機能を実装する。

**実装ファイル**:

- Service: `apps/desktop/src/main/services/skill/SkillFileManager.ts`
- Errors: `apps/desktop/src/main/services/skill/errors.ts`
- Tests: `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.*.test.ts`

### 対応ディレクトリ

| ディレクトリ            | 権限         | 説明               |
| ----------------------- | ------------ | ------------------ |
| `~/.aiworkflow/skills/` | 読み書き可   | ユーザー作成スキル |
| `~/.claude/skills/`     | 読み取り専用 | Claude公式スキル   |

### 型定義

#### SkillFileManagerOptions

| プロパティ            | 型       | 必須 | 説明                                                      |
| --------------------- | -------- | ---- | --------------------------------------------------------- |
| `aiworkflowSkillsDir` | `string` | -    | カスタムディレクトリ（デフォルト: ~/.aiworkflow/skills/） |
| `claudeSkillsDir`     | `string` | -    | カスタムディレクトリ（デフォルト: ~/.claude/skills/）     |

#### BackupInfo

| プロパティ     | 型                      | 説明                             |
| -------------- | ----------------------- | -------------------------------- |
| `filename`     | `string`                | バックアップファイル名           |
| `relativePath` | `string`                | スキルディレクトリからの相対パス |
| `originalPath` | `string`                | 元ファイルのパス                 |
| `type`         | `'backup' \| 'deleted'` | バックアップ種別                 |
| `timestamp`    | `number`                | タイムスタンプ（ミリ秒）         |
| `createdAt`    | `Date`                  | 作成日時                         |

### API

| メソッド        | シグネチャ                                                                    | 説明             |
| --------------- | ----------------------------------------------------------------------------- | ---------------- |
| `readFile`      | `(skillName: string, relativePath: string) => Promise<string>`                | ファイル読み込み |
| `writeFile`     | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル書き込み |
| `createFile`    | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル作成     |
| `deleteFile`    | `(skillName: string, relativePath: string) => Promise<void>`                  | ファイル削除     |
| `listBackups`   | `(skillName: string) => Promise<BackupInfo[]>`                                | バックアップ一覧 |
| `restoreBackup` | `(skillName: string, backupPath: string) => Promise<void>`                    | バックアップ復元 |
| `getFileTree`   | `(skillName: string) => Promise<SkillFileTreeNode[]>`                         | ファイルツリー取得 |
| `isReadonly`    | `(skillName: string) => Promise<boolean>`                                     | 読み取り専用判定 |

#### SkillFileTreeNode

| プロパティ | 型 | 説明 |
| ---------- | --- | --- |
| `name` | `string` | ノード名（ファイル名/ディレクトリ名） |
| `path` | `string` | スキルルートからの相対パス（POSIX） |
| `type` | `"file" \| "directory"` | ノード種別 |
| `children` | `SkillFileTreeNode[]` | `type: "directory"` のときのみ存在 |

### エラークラス

| エラークラス         | エラーコード              | 発生条件                       |
| -------------------- | ------------------------- | ------------------------------ |
| `SkillNotFoundError` | `SKILL_NOT_FOUND`         | スキルディレクトリが存在しない |
| `ReadonlySkillError` | `READONLY_SKILL`          | 読み取り専用スキルへの書き込み |
| `PathTraversalError` | `PATH_TRAVERSAL_DETECTED` | パストラバーサル検出           |
| `FileExistsError`    | `FILE_ALREADY_EXISTS`     | createFile で既存ファイルあり  |
| `FileNotFoundError`  | `FILE_NOT_FOUND`          | 操作対象ファイルが存在しない   |

### バックアップ形式

| 操作     | ファイル名形式                   | 例                               |
| -------- | -------------------------------- | -------------------------------- |
| 書き込み | `{filename}.backup.{timestamp}`  | `guide.md.backup.1738500000000`  |
| 削除     | `{filename}.deleted.{timestamp}` | `guide.md.deleted.1738500000000` |

### セキュリティ

| 対策                 | 実装                                           |
| -------------------- | ---------------------------------------------- |
| パストラバーサル防止 | `validatePath()` で `../` パターンを検出・拒否 |
| 読み取り専用保護     | `~/.claude/skills/` への書き込みを全て拒否     |
| Nullバイト検証       | Nullバイトを含むパスは安全に処理               |

### テストカバレッジ

| カテゴリ           | テスト数 | ファイル                               |
| ------------------ | -------- | -------------------------------------- |
| ユニットテスト     | 50       | `SkillFileManager.test.ts`             |
| 統合テスト         | 21       | `SkillFileManager.integration.test.ts` |
| セキュリティテスト | 25       | `SkillFileManager.security.test.ts`    |
| エッジケーステスト | 41       | `SkillFileManager.edge.test.ts`        |
| **合計**           | **137**  |                                        |

---

## テストアーキテクチャ（TASK-8C-A）

### 概要

skillHandlers.ts の IPC統合テストは、Handler Map方式を採用し、Electron プロセスを起動せずにハンドラーロジックをテストする。テストファイルは `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` に配置される。

### テスト構成

| カテゴリ            | テスト数 | 検証対象                                                           |
| ------------------- | -------- | ------------------------------------------------------------------ |
| ハンドラー登録/解除 | 1        | registerSkillHandlers / unregisterSkillHandlers                    |
| 基本チャネルテスト  | 12       | list, getImported, import, remove, get-detail, execute             |
| 拡張チャネルテスト  | 2        | abort, get-status                                                  |
| エラーハンドリング  | 10       | 各チャネルの異常系                                                 |
| セキュリティ検証    | 2        | validateIpcSender失敗パス（abort, get-status）                     |
| エッジケース        | 4        | undefined引数、空配列、不正イベント等                              |
| IMP-002チャネル     | 10       | settings/permissions/cache（未実装パス）                           |

### 適用テストパターン

| パターン                  | 参照先                                                                                                     | 用途                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Handler Map方式           | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) IPC通信テストパターン | ハンドラー関数の直接テスト            |
| SkillService Partial Mock | 同上                                                                                                       | 依存サービスの部分モック              |
| invokeOptionalHandler     | 同上                                                                                                       | IMP-002未実装チャネルの条件付きテスト |
| validateIpcSender失敗検証 | 同上                                                                                                       | セキュリティレイヤーの検証            |

### ヘルパー関数

テストファイル内に定義された再利用可能ヘルパー。

| 関数                                                  | 用途                              |
| ----------------------------------------------------- | --------------------------------- |
| `createMockIpcEvent(senderId?)`                       | モックIPCイベントオブジェクト生成 |
| `expectOperationSuccess(result, expectedData?)`       | OperationResult成功検証           |
| `expectOperationError(result, errorPattern?)`         | OperationResultエラー検証         |
| `invokeOptionalHandler(handlerMap, channel, ...args)` | 未実装チャネルの条件付き呼び出し  |

### テストデータ定数

| 定数                            | 型               | 用途                           |
| ------------------------------- | ---------------- | ------------------------------ |
| `EXPECTED_CHANNELS`             | `string[]`       | 登録されるべき全8チャネル名    |
| `MOCK_SKILL_A` / `MOCK_SKILL_B` | `Skill`          | スキルデータのFixture          |
| `MOCK_SCAN_RESULT`              | `ScanResult`     | スキャン結果Fixture            |
| `MOCK_EXECUTION_RESULT`         | `SkillRunResult` | 実行結果Fixture                |
| `MOCK_SETTINGS`                 | `object`         | IMP-002設定データFixture       |
| `MOCK_PERMISSIONS`              | `object`         | IMP-002権限データFixture       |
| `MOCK_CACHE_DATA`               | `object`         | IMP-002キャッシュデータFixture |

---

