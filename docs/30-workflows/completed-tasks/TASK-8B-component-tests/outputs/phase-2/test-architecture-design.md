# TASK-8B テスト設計書

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| タスク | TASK-8B コンポーネントテスト |
| 作成日 | 2026-02-02                   |

## 1. Storeモック戦略

### パターン: vi.mock + モック関数

全テストファイルで統一したStoreモックパターンを使用する。

#### SkillSelector / SkillStreamingView（useSkillStore / useAppStore）

```typescript
// SkillSelector: useSkillStoreをモック
const mockUseSkillStore = vi.fn();

vi.mock("../../../store", () => ({
  useSkillStore: () => mockUseSkillStore(),
}));

beforeEach(() => {
  mockUseSkillStore.mockReturnValue({
    availableSkills: [],
    importedSkills: [],
    selectedSkillName: null,
    isScanning: false,
    selectSkillByName: vi.fn(),
    rescanSkills: vi.fn(),
  });
  vi.clearAllMocks();
});
```

#### SkillImportDialog / PermissionDialog（useAppStore セレクタパターン）

```typescript
// SkillImportDialog: useAppStoreセレクタパターン
const mockImportSkill = vi.fn();
const mockIsImporting = false;

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importSkill: mockImportSkill,
      isImporting: mockIsImporting,
      importingSkillName: null,
    };
    return selector ? selector(state) : state;
  }),
}));
```

### 設計判断

| 判断項目           | 採用方針                               |
| ------------------ | -------------------------------------- |
| モックレベル       | Store層でモック（IPC層はモック不要）   |
| セレクタ対応       | `useAppStore(selector)`パターンに対応  |
| テスト間分離       | `beforeEach`で`vi.clearAllMocks()`     |
| 部分オーバーライド | スプレッド構文で差分のみオーバーライド |

## 2. テストデータファクトリ

### ファクトリ一覧

| ファクトリ名                   | 返却型                   | 用途                 |
| ------------------------------ | ------------------------ | -------------------- |
| `createMockSkillMetadata`      | `SkillMetadata`          | SkillImportDialog用  |
| `createMockImportedSkill`      | `ImportedSkill`          | SkillSelector用      |
| `createMockPermissionRequest`  | `SkillPermissionRequest` | PermissionDialog用   |
| `createMockStreamMessage`      | `SkillStreamMessage`     | SkillStreamingView用 |
| `createDefaultSkillStoreState` | `SkillSliceState`        | 全コンポーネント共通 |

### ファクトリ仕様

```typescript
function createMockSkillMetadata(
  overrides?: Partial<SkillMetadata>,
): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill description",
    allowedTools: ["Bash", "Read", "Write"],
    path: "/test/path",
    updatedAt: new Date("2026-01-01"),
    agents: [
      { filename: "agent1.md", relativePath: "agents/agent1.md", size: 100 },
    ],
    references: [
      { filename: "ref1.md", relativePath: "references/ref1.md", size: 200 },
    ],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
    ...overrides,
  };
}

function createMockPermissionRequest(
  overrides?: Partial<SkillPermissionRequest>,
): SkillPermissionRequest {
  return {
    executionId: "exec-1",
    requestId: "req-1",
    toolName: "Bash",
    args: { command: "ls -la" },
    reason: "List files",
    ...overrides,
  };
}
```

## 3. テストファイル構造

### SkillSelector.test.tsx（15ケース）

```
describe("SkillSelector")
  ├── describe("rendering")          → 3ケース (SS-R-01~03)
  ├── describe("dropdown interaction") → 4ケース (SS-I-04~07)
  ├── describe("skill selection")    → 2ケース (SS-S-08~09)
  ├── describe("keyboard navigation") → 2ケース (SS-K-10~11)
  ├── describe("rescan")             → 2ケース (SS-R-12~13)
  └── describe("accessibility")      → 2ケース (SS-A-14~15)
```

### SkillImportDialog.test.tsx（12ケース）

```
describe("SkillImportDialog")
  ├── describe("rendering")          → 6ケース (SID-R-01~06)
  ├── describe("import action")      → 3ケース (SID-I-07~09)
  └── describe("close action")       → 3ケース (SID-I-10~12)
```

### PermissionDialog.test.tsx（12ケース）

```
describe("PermissionDialog")
  ├── describe("rendering")          → 6ケース (PD-R-01~06)
  ├── describe("deny action")        → 2ケース (PD-I-07~08)
  ├── describe("approve once action") → 1ケース (PD-I-09)
  ├── describe("approve action")     → 2ケース (PD-I-10~11)
  └── describe("remember checkbox")  → 1ケース (PD-I-12)
```

### SkillStreamingView.test.tsx（16ケース）

```
describe("SkillStreamingView")
  ├── describe("rendering")             → 7ケース (SSV-R-01~07)
  ├── describe("status badge")          → 5ケース (SSV-S-08~12)
  ├── describe("abort button")          → 3ケース (SSV-I-13~15)
  └── describe("tool execution history") → 1ケース (SSV-R-16)
```

## 4. アサーション戦略

| アサーション種別 | 使用方法                         | 用途                           |
| ---------------- | -------------------------------- | ------------------------------ |
| DOM存在確認      | `screen.getByRole/getByText`     | コンポーネントの表示確認       |
| DOM非存在確認    | `screen.queryByRole/queryByText` | 非表示/未レンダリング確認      |
| 属性確認         | `toHaveAttribute`                | ARIA属性の検証                 |
| 関数呼び出し確認 | `toHaveBeenCalledWith`           | Store アクションの呼び出し検証 |
| 状態変化確認     | `waitFor` + assertion            | 非同期状態変化の検証           |
| フォーカス確認   | `document.activeElement`         | キーボードナビゲーションの検証 |

## 5. 既存テストとの整合性

既存テストは280テストケースが全てPASSしており、以下のパターンを確認:

| パターン         | 既存実装                                     |
| ---------------- | -------------------------------------------- |
| Storeモック      | `vi.mock` + `vi.fn()`による完全モック        |
| ユーザーイベント | `@testing-library/user-event`の`setup()`使用 |
| 非同期処理       | `waitFor`による非同期検証                    |
| ARIA検証         | `getByRole`, `toHaveAttribute`使用           |
| テスト分離       | `beforeEach`で`vi.clearAllMocks()`           |

## 6. 統合ポイント契約

| 統合ポイント           | 契約定義                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Store → コンポーネント | `useSkillStore` セレクタの返却型に準拠したモックデータ                                |
| Props → コンポーネント | `SkillMetadata`, `SkillPermissionRequest` 型に準拠したProps                           |
| コンポーネント → Store | `selectSkillByName`, `importSkill`, `respondToSkillPermission` 等のアクション呼び出し |
