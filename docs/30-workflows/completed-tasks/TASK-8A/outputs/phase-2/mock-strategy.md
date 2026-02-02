# Phase 2: モック戦略

## 設計日: 2026-02-02

## モジュール別モック戦略

### 1. SkillScanner

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| モック対象 | `fs/promises`                                                                   |
| モック手法 | `vi.mock("fs/promises")` + 実ファイルシステム（New APIテスト）                  |
| 初期化     | `beforeEach` でモック設定、New APIは `beforeAll` でフィクスチャディレクトリ作成 |
| リセット   | `afterEach(() => vi.clearAllMocks())`                                           |
| 戻り値設定 | `mockResolvedValue` / `mockRejectedValue`                                       |

**既存パターン**: Legacy APIテストは`vi.mock("fs/promises")`、New APIテストは実フィクスチャ `__fixtures__/` を使用する2層構造。補強テスト不要。

### 2. SkillImportManager

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| モック対象 | `SkillStore` interface                                        |
| モック手法 | インラインモックオブジェクト `{ get: vi.fn(), set: vi.fn() }` |
| 初期化     | `beforeEach` でモックストア生成                               |
| リセット   | `vi.clearAllMocks()`                                          |
| 戻り値設定 | `mockReturnValue`                                             |

**既存パターン**: SkillStoreインターフェースのモック実装をコンストラクタに注入。補強テスト不要。

### 3. SkillExecutor

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| モック対象 | `@anthropic-ai/claude-agent-sdk`, `electron`, `uuid`, `PermissionResolver`, `PermissionStore` |
| モック手法 | `vi.mock("@anthropic-ai/claude-agent-sdk")`, BrowserWindowモック、PermissionResolverスパイ    |
| 初期化     | `beforeEach` で全モックリセット                                                               |
| リセット   | `vi.clearAllMocks()`                                                                          |
| 戻り値設定 | `mockResolvedValue` / `mockImplementation`                                                    |

**追加設計（SE-07, SE-08）**:

- SE-07: `createHooks`テストでは`permissionResolver`と`permissionStore`の内部インスタンスへのアクセスが必要。`executor["permissionResolver"]`でprivateアクセスするか、テスト用のスパイを事前注入
- SE-08: `handlePermissionResponse`テストでは`permissionResolver.resolveRequest`をスパイ化。`vi.spyOn(executor["permissionResolver"], "resolveRequest")`

### 4. PermissionResolver

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| モック対象 | なし（純粋ロジック）                                                             |
| モック手法 | モック不要                                                                       |
| タイマー   | `vi.useFakeTimers()` / `vi.useRealTimers()`                                      |
| 初期化     | `beforeEach(() => { vi.useFakeTimers(); resolver = new PermissionResolver(); })` |
| リセット   | `afterEach(() => vi.useRealTimers())`                                            |

**追加設計（PR-03）**:

- rememberChoiceフラグを含むSkillPermissionResponseオブジェクトを作成し、resolveRequestに渡すだけ。追加モック不要。

### 5. skillSlice

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| モック対象 | `window.electronAPI.skill`                                                                     |
| モック手法 | テスト内でmockSkillAPIオブジェクトを定義し、`set`/`get`関数パターンでZustandストアを直接テスト |
| 初期化     | `beforeEach`でモックAPI + ストア初期化                                                         |
| リセット   | `vi.clearAllMocks()`                                                                           |
| 戻り値設定 | `mockResolvedValue`                                                                            |

**既存パターン**: `createSkillSlice`を直接呼び出し、`set`/`get`関数を注入するパターン。補強テスト不要。

## モックリセット方針

| タイミング   | 使用するAPI            | 対象                         |
| ------------ | ---------------------- | ---------------------------- |
| `beforeEach` | `vi.clearAllMocks()`   | 呼び出し回数・引数のリセット |
| `afterEach`  | `vi.restoreAllMocks()` | spyOnの復元が必要な場合      |
| `afterAll`   | `vi.useRealTimers()`   | FakeTimers使用時             |

## IPC境界の確認

- 単体テストではIPC通信を越えない
- `window.electronAPI.skill` はRenderer側のスタブで完結
- Main Process側のElectron BrowserWindow.webContents.sendはモックで検証
