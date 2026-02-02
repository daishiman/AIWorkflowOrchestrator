# 統合テスト設計書 - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## 1. テストファイル構造設計

### 1.1 describe/it 構造

```
describe("Skill IPC Integration")
  ├── describe("Handler Registration")
  │   └── it("should register all skill handlers via ipcMain.handle")
  ├── describe("skill:list-available")
  │   ├── it("TC-01: should return available skills from SkillService.scanAvailableSkills")
  │   ├── it("TC-02: should return error when scan fails")
  │   └── it("TC-12: should trigger rescan with forceRefresh and return updated list")
  ├── describe("skill:list-imported")
  │   └── it("TC-03: should return imported skills from SkillService.getImportedSkills")
  ├── describe("skill:import")
  │   ├── it("TC-04: should import skill and return ImportResult")
  │   ├── it("TC-05: should return error result if skill already imported")
  │   └── it("TC-06: should return error if skill not found")
  ├── describe("skill:remove")
  │   ├── it("TC-07: should remove skill and return success")
  │   └── it("TC-08: should return error if skill not imported")
  ├── describe("skill:execute")
  │   └── it("TC-09: should start execution and return execution ID")
  ├── describe("skill:abort")
  │   └── it("TC-10: should abort execution and return boolean")
  ├── describe("skill:permission:response")
  │   └── it("TC-11: should forward permission response to executor")
  ├── describe("skill:settings")
  │   ├── it("TC-13: should get skill settings")
  │   ├── it("TC-14: should return error for non-existent skill settings")
  │   ├── it("TC-15: should update skill settings")
  │   └── it("TC-16: should return validation error for invalid settings")
  ├── describe("skill:permissions")
  │   ├── it("TC-17: should get skill permissions")
  │   ├── it("TC-18: should grant permission")
  │   └── it("TC-19: should revoke permission")
  └── describe("skill:cache")
      ├── it("TC-20: should get cached data")
      ├── it("TC-21: should set cache data")
      └── it("TC-22: should invalidate cache")
```

### 1.2 beforeEach/afterEach スコープ

```
describe("Skill IPC Integration")
  beforeEach: handlers Map初期化、ipcMain.handle Mock設定、
              SkillService Mock作成、registerSkillHandlers呼び出し
  afterEach: vi.clearAllMocks()

  describe("skill:list-available")
    （親の beforeEach を継承、追加設定なし）
  ...
```

---

## 2. Mock戦略設計

### 2.1 Electron Mock

```typescript
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => ({
      webContents: { send: vi.fn(), id: 1 },
    })),
  },
}));
```

- `ipcMain.handle` のモック実装で `handlers` Map に `(channel, handler)` を格納
- `BrowserWindow.getFocusedWindow` でダミー webContents を返却

### 2.2 SkillService Mock

```typescript
const createMockSkillService = (overrides?: Partial<SkillService>) => ({
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  executeSkill: vi.fn(),
  clearCache: vi.fn(),
  // IMP-002 追加メソッド
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getPermissions: vi.fn(),
  grantPermission: vi.fn(),
  revokePermission: vi.fn(),
  getCache: vi.fn(),
  setCache: vi.fn(),
  invalidateCache: vi.fn(),
  ...overrides,
});
```

正常系/異常系パターン:

| メソッド            | 正常系戻り値                                                                     | 異常系戻り値                                                         |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| scanAvailableSkills | `{ skills: [{ id: "s1", name: "skill-a" }], errors: [], scannedAt: new Date() }` | `throw new Error("Scan failed")`                                     |
| getImportedSkills   | `[{ id: "s1", name: "imported-skill" }]`                                         | （異常系なし）                                                       |
| importSkills        | `{ success: true, importedCount: 1, errors: [] }`                                | `{ success: false, importedCount: 0, errors: ["Already imported"] }` |
| removeSkill         | `{ success: true, removed: true }`                                               | `throw new Error("Not imported")`                                    |
| getSkillById        | `{ id: "s1", name: "test-skill", ... }`                                          | `null`                                                               |
| executeSkill        | `{ executionId: "exec-123", status: "success", ... }`                            | `throw new Error("Execution failed")`                                |

### 2.3 validateIpcSender Mock

```typescript
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn((validation) => ({
    success: false,
    error: `IPC_UNAUTHORIZED: ${validation.reason || "Invalid sender"}`,
  })),
}));
```

### 2.4 SkillExecutor Mock

```typescript
// モジュールレベルの SkillExecutor をモック
const mockSkillExecutor = {
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  handlePermissionResponse: vi.fn(),
};
```

---

## 3. テストヘルパー関数設計

| 関数名                   | 引数                                               | 戻り値                  | 用途                        |
| ------------------------ | -------------------------------------------------- | ----------------------- | --------------------------- |
| `createMockSkillService` | `overrides?: Partial<MockSkillService>`            | `MockSkillService`      | SkillService Mock生成       |
| `getRegisteredHandler`   | `channel: string`                                  | `Function \| undefined` | 登録済みハンドラー取得      |
| `createMockIpcEvent`     | `senderId?: number`                                | `IpcMainInvokeEvent`    | IPCイベントオブジェクト生成 |
| `expectOperationSuccess` | `result: unknown, expectedData?: unknown`          | `void (assertion)`      | OperationResult正常系検証   |
| `expectOperationError`   | `result: unknown, errorPattern?: string \| RegExp` | `void (assertion)`      | OperationResult異常系検証   |

### シグネチャ詳細

```typescript
function createMockSkillService(
  overrides?: Partial<Record<string, ReturnType<typeof vi.fn>>>,
): Record<string, ReturnType<typeof vi.fn>>;

function getRegisteredHandler(
  channel: string,
): ((...args: unknown[]) => unknown) | undefined;

function createMockIpcEvent(senderId?: number): {
  sender: { id: number };
  senderFrame: { url: string };
};

function expectOperationSuccess<T>(
  result: { success: boolean; data?: T },
  expectedData?: T,
): void;

function expectOperationError(
  result: { success: boolean; error?: string },
  errorPattern?: string | RegExp,
): void;
```

---

## 4. テストデータ設計

### 4.1 テストデータ定数

| 定数名                       | 型                | 値                                                                                                                                                                                 |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MOCK_SKILL_A`               | `Partial<Skill>`  | `{ id: "skill-a-id", name: "skill-a", slug: "skill-a", description: "Test skill A", path: "/skills/skill-a/SKILL.md", triggers: ["test"], anchors: [], lastModified: new Date() }` |
| `MOCK_SKILL_B`               | `Partial<Skill>`  | `{ id: "skill-b-id", name: "skill-b", ... }`                                                                                                                                       |
| `MOCK_SCAN_RESULT`           | `SkillScanResult` | `{ skills: [MOCK_SKILL_A, MOCK_SKILL_B], errors: [], scannedAt: new Date() }`                                                                                                      |
| `MOCK_IMPORTED_SKILLS`       | `Skill[]`         | `[MOCK_SKILL_A]`                                                                                                                                                                   |
| `MOCK_IMPORT_RESULT_SUCCESS` | `ImportResult`    | `{ success: true, importedCount: 1, errors: [] }`                                                                                                                                  |
| `MOCK_IMPORT_RESULT_ERROR`   | `ImportResult`    | `{ success: false, importedCount: 0, errors: ["Already imported"] }`                                                                                                               |
| `MOCK_REMOVE_RESULT`         | `RemoveResult`    | `{ success: true, removed: true }`                                                                                                                                                 |
| `MOCK_EXECUTION_RESULT`      | `SkillRunResult`  | `{ executionId: "exec-test-001", status: "success", startedAt: new Date(), completedAt: new Date() }`                                                                              |
| `MOCK_EXECUTION_ID`          | `string`          | `"exec-test-001"`                                                                                                                                                                  |
| `MOCK_SKILL_NAME`            | `string`          | `"test-skill"`                                                                                                                                                                     |
| `MOCK_PERMISSION_RESPONSE`   | `object`          | `{ requestId: "req-001", approved: true }`                                                                                                                                         |
| `MOCK_SETTINGS`              | `object`          | `{ autoUpdate: true, timeout: 30000 }`                                                                                                                                             |
| `MOCK_PERMISSIONS`           | `object`          | `{ read: true, write: false, execute: true }`                                                                                                                                      |
| `MOCK_CACHE_DATA`            | `object`          | `{ key: "test-key", value: "cached-value", ttl: 3600 }`                                                                                                                            |

---

## 5. 統合ポイント設計

| 統合パス           | テスト対象                                  | 検証方法                                             |
| ------------------ | ------------------------------------------- | ---------------------------------------------------- |
| IPC登録            | `registerSkillHandlers` → `ipcMain.handle`  | `handlers.get(channel)` が関数であること             |
| ハンドラー→Service | ハンドラー内で正しいServiceメソッド呼び出し | `mockSkillService.method.toHaveBeenCalledWith(args)` |
| エラー変換         | Service例外 → OperationResult               | `expectOperationError(result, errorPattern)`         |
| セキュリティ       | validateIpcSender呼び出し                   | `expect(validateIpcSender).toHaveBeenCalled()`       |
| M→R通知            | skill:stream/permission:request             | `mainWindow.webContents.send` 呼び出し検証           |
