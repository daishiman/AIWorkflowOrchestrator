# Phase 4: テスト作成（TDD: Red）— TASK-9A-B ファイル編集IPCハンドラー

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| 機能名     | TASK-9A-B-ipc-file-handlers            |
| 作成日     | 2026-02-19                             |
| 前提Phase  | Phase 1-3（要件定義・設計・レビュー）  |
| 依存タスク | TASK-9A-A（SkillFileManager 実装済み） |

## 目的

ファイル編集IPCハンドラー（6チャンネル）のテストを**実装より先に作成**し、全テストが **Red 状態**（失敗）であることを確認する。TDD の Red フェーズとして、テストが実装の仕様書となる。

## 実行タスク

### Task 1: ユニットテスト作成（`skillFileHandlers.test.ts`）

各IPCハンドラーの個別テストを作成する。

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`

#### 1.1 テスト基盤セットアップ

以下のモック構成を `beforeEach` / `afterEach` で管理する:

```typescript
// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// ipc-validator モック
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));
```

**SkillFileManager モック**:

```typescript
const mockSkillFileManager = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
  listBackups: vi.fn(),
  restoreBackup: vi.fn(),
  isReadonly: vi.fn(),
};
```

**mockMainWindow / mockEvent ファクトリ**:

```typescript
function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId = 1) {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}
```

#### 1.2 テストケース一覧（正常系）

| No   | チャンネル            | テスト項目                                               | 期待結果                                             |
| ---- | --------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| U-01 | `skill:readFile`      | 存在するスキルファイルを読み込む                         | `{ success: true, data: "ファイル内容" }`            |
| U-02 | `skill:writeFile`     | スキルファイルに内容を書き込む                           | `{ success: true }`                                  |
| U-03 | `skill:writeFile`     | 書き込み後に SkillService.scanAvailableSkills が呼ばれる | `skillService.scanAvailableSkills` が1回呼び出される |
| U-04 | `skill:createFile`    | 新規ファイルを作成する                                   | `{ success: true }`                                  |
| U-05 | `skill:deleteFile`    | ファイルを削除する                                       | `{ success: true }`                                  |
| U-06 | `skill:listBackups`   | バックアップ一覧を取得する                               | `{ success: true, data: BackupInfo[] }`              |
| U-07 | `skill:restoreBackup` | バックアップからファイルを復元する                       | `{ success: true }`                                  |

#### 1.3 テストケース一覧（異常系 — バリデーションエラー）

| No   | チャンネル            | テスト項目                                  | 期待結果                                                               |
| ---- | --------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| U-08 | `skill:readFile`      | skillName が空文字列                        | `{ success: false, error: "skillName must be a non-empty string" }`    |
| U-09 | `skill:readFile`      | relativePath が空文字列                     | `{ success: false, error: "relativePath must be a non-empty string" }` |
| U-10 | `skill:readFile`      | skillName が文字列以外（数値）              | `{ success: false, error: "skillName must be a non-empty string" }`    |
| U-11 | `skill:writeFile`     | content が文字列以外（undefined）           | `{ success: false, error: "content must be a string" }`                |
| U-12 | `skill:createFile`    | skillName・relativePath・content 全て未指定 | `{ success: false, error: ... }`（最初のバリデーションエラー）         |
| U-13 | `skill:deleteFile`    | relativePath が未指定                       | `{ success: false, error: "relativePath must be a non-empty string" }` |
| U-14 | `skill:listBackups`   | skillName が未指定                          | `{ success: false, error: "skillName must be a non-empty string" }`    |
| U-15 | `skill:restoreBackup` | backupPath が空文字列                       | `{ success: false, error: "backupPath must be a non-empty string" }`   |

#### 1.4 テストケース一覧（異常系 — SkillFileManager エラー）

| No   | チャンネル            | スロー例外           | 期待結果                                                              |
| ---- | --------------------- | -------------------- | --------------------------------------------------------------------- |
| U-16 | `skill:readFile`      | `SkillNotFoundError` | `{ success: false, error: "Skill not found: test-skill" }`            |
| U-17 | `skill:readFile`      | `FileNotFoundError`  | `{ success: false, error: "File not found: SKILL.md" }`               |
| U-18 | `skill:readFile`      | `PathTraversalError` | `{ success: false, error: "Path traversal detected: ..." }`           |
| U-19 | `skill:writeFile`     | `ReadonlySkillError` | `{ success: false, error: "Cannot modify readonly skill: ..." }`      |
| U-20 | `skill:createFile`    | `FileExistsError`    | `{ success: false, error: "File already exists: ..." }`               |
| U-21 | `skill:deleteFile`    | `FileNotFoundError`  | `{ success: false, error: "File not found: ..." }`                    |
| U-22 | `skill:restoreBackup` | `FileNotFoundError`  | `{ success: false, error: "File not found: ..." }`                    |
| U-23 | 全チャンネル共通      | 予期しない `Error`   | `{ success: false, error: "Internal error" }`（内部情報を漏洩しない） |

#### 1.5 テストケース一覧（登録・解除）

| No   | テスト項目                                                  | 期待結果                                  |
| ---- | ----------------------------------------------------------- | ----------------------------------------- |
| U-24 | `registerSkillFileHandlers` で6チャンネル全てが登録される   | `ipcMain.handle` が6回呼び出される        |
| U-25 | `unregisterSkillFileHandlers` で6チャンネル全てが解除される | `ipcMain.removeHandler` が6回呼び出される |
| U-26 | 登録されるチャンネル名が全て `IPC_CHANNELS` 定数を使用      | ハードコード文字列が存在しない            |

---

### Task 2: セキュリティテスト作成（`skillFileHandlers.security.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`

#### 2.1 テストケース一覧（IPC送信元検証）

| No   | テスト項目                                                          | 期待結果                                             |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| S-01 | validateIpcSender が `{ valid: false }` を返す場合                  | `toIPCValidationError` の結果が throw される         |
| S-02 | 全6チャンネルで validateIpcSender が呼び出される                    | 各ハンドラーで `validateIpcSender` が1回呼び出される |
| S-03 | validateIpcSender に正しい引数（event, channel, options）が渡される | `getAllowedWindows` が `[mainWindow]` を返す         |

#### 2.2 テストケース一覧（パストラバーサル — IPCハンドラー層）

SkillFileManager 内の `validatePath` で検出されるパターンが、IPCレスポンスとして正しくサニタイズされることを検証する。

| No   | チャンネル            | 入力パターン                     | 期待結果                                                    |
| ---- | --------------------- | -------------------------------- | ----------------------------------------------------------- |
| S-04 | `skill:readFile`      | `relativePath: "../etc/passwd"`  | `{ success: false, error: "Path traversal detected: ..." }` |
| S-05 | `skill:writeFile`     | `relativePath: "../../secret"`   | `{ success: false, error: "Path traversal detected: ..." }` |
| S-06 | `skill:createFile`    | `relativePath: "../../../tmp/x"` | `{ success: false, error: "Path traversal detected: ..." }` |
| S-07 | `skill:deleteFile`    | `relativePath: "foo/../../../x"` | `{ success: false, error: "Path traversal detected: ..." }` |
| S-08 | `skill:restoreBackup` | `backupPath: "../../../etc/x"`   | `{ success: false, error: "Path traversal detected: ..." }` |

#### 2.3 テストケース一覧（エラーサニタイズ）

| No   | テスト項目                                                      | 期待結果                                            |
| ---- | --------------------------------------------------------------- | --------------------------------------------------- |
| S-09 | 予期しない Error のスタックトレースが漏洩しない                 | レスポンスの `error` にスタックトレースが含まれない |
| S-10 | 予期しない Error のファイルパス情報が漏洩しない                 | レスポンスの `error` に絶対パスが含まれない         |
| S-11 | 既知のエラー（SkillNotFoundError 等）はメッセージをそのまま返す | エラーの `message` プロパティがレスポンスに含まれる |

---

### Task 3: 統合テスト作成（`skillFileHandlers.integration.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`

#### 3.1 テスト基盤

- electron の `ipcMain` をモック化（handlerMap パターン）
- `validateIpcSender` を `{ valid: true }` でモック化
- **SkillFileManager はモックせず、実インスタンス**を使用
- テスト用一時ディレクトリ（`tmpdir()` + `randomUUID()`）を使用
- テスト用スキルディレクトリ構造を `beforeEach` で作成、`afterEach` で削除

#### 3.2 テストケース一覧

| No   | テスト項目                                                   | 期待結果                                                         |
| ---- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| I-01 | readFile: 実ファイルを読み込む                               | ファイル内容が正しく返される                                     |
| I-02 | writeFile: 実ファイルに書き込み、readFile で内容確認         | 書き込んだ内容と読み込んだ内容が一致                             |
| I-03 | writeFile: 既存ファイル書き込み時にバックアップが作成される  | listBackups で type:"backup" のエントリが存在                    |
| I-04 | createFile → readFile: 新規作成後に読み込む                  | 作成した内容が正しく読み込める                                   |
| I-05 | createFile: 既存ファイルに対して実行するとエラー             | `{ success: false, error: "File already exists: ..." }`          |
| I-06 | deleteFile: ファイル削除後に readFile するとエラー           | `{ success: false, error: "File not found: ..." }`               |
| I-07 | deleteFile → listBackups: 削除後にバックアップが存在する     | listBackups で type:"deleted" のエントリが存在                   |
| I-08 | write → listBackups → restoreBackup → readFile: 完全サイクル | 復元後にオリジナル内容が読み込める                               |
| I-09 | 読み取り専用スキルへの writeFile                             | `{ success: false, error: "Cannot modify readonly skill: ..." }` |

---

## 参照資料

| 資料                                                                        | 用途                            |
| --------------------------------------------------------------------------- | ------------------------------- |
| Phase 1-3 成果物                                                            | 要件・設計・レビュー結果        |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                | 既存IPCハンドラーパターン       |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` | セキュリティテストパターン      |
| `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts`          | 統合テストパターン              |
| `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.test.ts`   | SkillFileManager テストパターン |
| `apps/desktop/src/main/services/skill/errors.ts`                            | エラークラス定義                |
| `.claude/rules/04-electron-security.md`                                     | IPCセキュリティ原則             |

## 統合テスト連携

| 連携先                | 内容                                                          |
| --------------------- | ------------------------------------------------------------- |
| Phase 5（実装）       | Phase 4で定義した26/11/9件のテスト仕様を満たす実装を追加する  |
| Phase 6（テスト拡充） | Phase 4で不足する境界値・エッジケース・組合せテストを拡張する |

## 成果物

| 成果物                                                                      | 説明                           |
| --------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`             | ユニットテスト（26テスト）     |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`    | セキュリティテスト（11テスト） |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts` | 統合テスト（9テスト）          |

## 完了条件

- [ ] 3つのテストファイルが作成されている
- [ ] 全テストケース（46テスト）が記述されている
- [ ] テスト実行時に全テストが **Red 状態**（失敗）である（実装が存在しないため）
- [ ] テストファイル内にハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数を使用）
- [ ] モック構成が既存パターン（`skillCreatorHandlers.security.test.ts`）と一貫している

## 次のPhase

Phase 5（実装）へ進む。テストを通すための最小限のプロダクションコードを実装する。
