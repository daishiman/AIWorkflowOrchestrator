# 実装ガイド - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

# Part 1: 概念説明（初学者向け）

## IPC通信とは？

**学校の連絡帳**を思い浮かべてください。

生徒（画面＝Renderer Process）が「スキルの一覧を見せて」というお願いを連絡帳（IPC通信）に書いて、先生（Main Process）に渡します。先生はお願いの内容を確認して、結果を書いて返してくれます。

このアプリでは、画面に表示するボタンやリストは「生徒」の世界にいます。でも、ファイルを読んだり、スキルを実行したりする「実際の作業」は「先生」の世界でしかできません。だから、この連絡帳（IPC）がとても大切なのです。

## 統合テストとは？

**リレーの練習**のようなものです。

一人ひとりが走る練習（ユニットテスト）も大事ですが、本番ではバトンの受け渡しが大事です。統合テストは、チーム全体で通しで走ってみて、バトンパスがうまくいくか確認する練習です。

IPC統合テストでは、次の流れを一気にテストします：

1. 生徒が連絡帳を出す（IPCリクエスト）
2. 先生が受け取る（ハンドラー登録）
3. 先生がお願いの内容を確認する（バリデーション）
4. 先生が作業を依頼する（SkillService呼び出し）
5. 先生が結果を連絡帳に書いて返す（レスポンス）

## Mockとは？

**練習試合で味方が相手チームの代わりをすること**です。

本当のSkillService（スキル管理の仕組み）を使うと、実際にファイルを読んだり、外部サービスと通信したりして大変です。そこで、「スキルの一覧を聞かれたら、こういう結果を返す」と事前に決めた「代役」を使います。

この代役がMockです。結果をコントロールできるので、「成功した場合」「失敗した場合」「変なデータが来た場合」それぞれをテストできます。

## なぜIPCテストが必要か？

連絡帳が途中で失くなったり、間違った先生に届いたり、書き方が間違っていたりしないか確認する仕組みです。

具体的には：

- 全8種類の連絡帳（チャネル）が正しく届くか
- お願いの書き方が間違っている場合に、ちゃんとエラーを返すか
- 不正な人が連絡帳を出そうとした場合に、拒否できるか

---

# Part 2: 技術的詳細（開発者向け）

## テストアーキテクチャ

### Handler Map方式

テストの核となるパターンは `ipcMain.handle` のモック化です。

```typescript
handlers = new Map();
(ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
  (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
    handlers.set(channel, handler);
  },
);
```

`registerSkillHandlers()` を呼び出すと、全ハンドラーが `handlers` Map に格納されます。テストでは `handlers.get("skill:list-available")` のように直接ハンドラーを取得して呼び出します。

### SkillService Partial Mock

SkillServiceの全15メソッドを `vi.fn()` でモック化：

```typescript
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  executeSkill: vi.fn(),
  clearCache: vi.fn(),
  // IMP-002 extension methods
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getPermissions: vi.fn(),
  grantPermission: vi.fn(),
  revokePermission: vi.fn(),
  getCache: vi.fn(),
  setCache: vi.fn(),
  invalidateCache: vi.fn(),
};
```

## インターフェース定義

### OperationResult<T>

```typescript
type SuccessResult<T = unknown> = { success: boolean; data?: T };
type ErrorResult = {
  success: boolean;
  error?: string | { code: string; message: string };
};
```

ほとんどのハンドラーは `{ success: true, data: ... }` または `{ success: false, error: "..." }` を返します。例外: `skill:abort` は `boolean`、`skill:get-status` は `null | ExecutionStatus` を返します。

## チャネル一覧

| チャネル             | SkillServiceメソッド    | レスポンス型               |
| -------------------- | ----------------------- | -------------------------- |
| skill:list-available | scanAvailableSkills     | OperationResult<Skill[]>   |
| skill:list-imported  | getImportedSkills       | OperationResult<Skill[]>   |
| skill:import         | importSkills            | ImportResult (success直接) |
| skill:remove         | removeSkill             | RemoveResult (success直接) |
| skill:get-detail     | getSkillById            | OperationResult<Skill>     |
| skill:execute        | executeSkill            | OperationResult<RunResult> |
| skill:abort          | SkillExecutor.abort     | boolean                    |
| skill:get-status     | SkillExecutor.getStatus | ExecutionStatus \| null    |

## Mock設計

### Electron Mock

```typescript
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));
```

### validateIpcSender Mock

```typescript
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

## テストヘルパー

| ヘルパー関数                | シグネチャ                                                                           | 用途                      |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `createMockIpcEvent`        | `(senderId?: number) => IpcEvent`                                                    | IPC呼び出しイベント生成   |
| `expectOperationSuccess<T>` | `(result: SuccessResult<T>, expectedData?: T) => void`                               | 成功レスポンス検証        |
| `expectOperationError`      | `(result: ErrorResult, errorPattern?: string \| RegExp) => void`                     | エラーレスポンス検証      |
| `invokeOptionalHandler`     | `(handlers: Map, channel: string, ...args) => Promise<{exists, result} \| {exists}>` | IMP-002未実装チャネル対応 |

## エラーパターン

| パターン             | 例                                      | テストケース              |
| -------------------- | --------------------------------------- | ------------------------- |
| Service例外          | `mockFn.mockRejectedValue(new Error())` | TC-02, TC-06, TC-08       |
| バリデーションエラー | `throw { code: "VALIDATION_ERROR" }`    | import/remove validation  |
| 型バリデーション     | `typeof args.skillId !== "string"`      | get-detail, execute edges |
| セキュリティ拒否     | `validateIpcSender → { valid: false }`  | Security tests            |

## テストデータ定数

| 定数名                | 型/構造                                            | 用途                    |
| --------------------- | -------------------------------------------------- | ----------------------- |
| MOCK_SKILL_A          | `{ id, name, slug, description, path, triggers }`  | スキルオブジェクト      |
| MOCK_SKILL_B          | 同上                                               | 複数スキルテスト用      |
| MOCK_SCAN_RESULT      | `{ skills: Skill[], errors: [], scannedAt: Date }` | スキャン結果            |
| MOCK_IMPORT_SUCCESS   | `{ success: true, importedCount: 1, errors: [] }`  | インポート成功結果      |
| MOCK_REMOVE_SUCCESS   | `{ success: true, removed: true }`                 | 削除成功結果            |
| MOCK_EXECUTION_RESULT | `{ executionId, status, output, startedAt, ... }`  | 実行結果                |
| MOCK_SETTINGS         | `{ autoUpdate: true, timeout: 30000 }`             | IMP-002設定データ       |
| MOCK_PERMISSIONS      | `{ read: true, write: false, execute: true }`      | IMP-002権限データ       |
| MOCK_CACHE_DATA       | `{ key, value, ttl }`                              | IMP-002キャッシュデータ |
