# テストフィクスチャパターン

> **バージョン**: 1.0.0
> **更新日**: 2026-02-02
> **関連タスク**: TASK-8B, TASK-8C-G

---

## 概要

テストデータ生成のためのファクトリ関数・フィクスチャ設計パターン。
型安全性を維持しながら、テストごとに必要なデータを効率的に生成する。

---

## 1. ファクトリ関数パターン

### 基本構造

```typescript
// Type-safe factory with defaults and overrides
export function createEntity<T>(
  defaults: T,
  overrides: Partial<T> = {}
): T {
  return { ...defaults, ...overrides };
}
```

### コンポーネントProps

```typescript
// SkillMetadata factory
export function createSkillMetadata(
  overrides: Partial<SkillMetadata> = {}
): SkillMetadata {
  return {
    name: "test-skill",
    description: "テスト用スキル説明",
    allowedTools: ["Bash", "Read", "Write"],
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}

// PermissionRequest factory
export function createPermissionRequest(
  overrides: Partial<SkillPermissionRequest> = {}
): SkillPermissionRequest {
  return {
    executionId: `exec-${Date.now()}`,
    requestId: `req-${Date.now()}`,
    toolName: "Bash",
    args: { command: "echo test" },
    ...overrides,
  };
}
```

### ストリーミングメッセージ

```typescript
export function createAssistantMessage(
  text: string,
  options: { isPartial?: boolean; timestamp?: number } = {}
): SkillStreamMessage {
  return {
    type: "assistant",
    content: { type: "text", text },
    timestamp: options.timestamp ?? Date.now(),
    isPartial: options.isPartial ?? false,
  };
}

export function createToolUseMessage(
  toolName: string,
  args: Record<string, unknown> = {}
): SkillStreamMessage {
  return {
    type: "tool_use",
    content: {
      type: "tool_use",
      name: toolName,
      id: `tool-${Date.now()}`,
      input: args,
    },
    timestamp: Date.now(),
  };
}

export function createErrorMessage(message: string): SkillStreamMessage {
  return {
    type: "error",
    content: { type: "text", text: message },
    timestamp: Date.now(),
  };
}
```

---

## 2. 境界値フィクスチャ

### 設計マトリクス

| カテゴリ | 目的 | 例 |
|----------|------|-----|
| A: エラーパターン | バリデーション失敗 | missing-fields, invalid-schema |
| B: 境界値 | 最小/最大値 | 64文字名、空配列 |
| C: 組み合わせ | 複合条件 | 全リソース同時 |
| D: データバリアント | 特殊文字・形式 | Unicode、マルチライン |

### 実装例

```typescript
// 空データ境界
export const emptySkillMetadata: SkillMetadata = {
  name: "",
  description: "",
  allowedTools: [],
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
};

// 最大値境界
export const maxSkillMetadata: SkillMetadata = {
  name: "a".repeat(64),  // 64文字（最大）
  description: "x".repeat(1024),  // 1024文字（最大）
  allowedTools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep"],
  agents: Array.from({ length: 10 }, (_, i) => ({
    filename: `agent-${i}.md`,
    relativePath: "agents/",
    size: 1024,
  })),
  // ... 他も同様
};

// 特殊文字
export const specialCharSkillMetadata: SkillMetadata = {
  ...createSkillMetadata(),
  name: "test-日本語-émoji-🚀",
  description: "Line1\nLine2\n\t<script>alert('xss')</script>",
};
```

---

## 3. Storeモック構築

### デフォルトStore状態

```typescript
// defaults/storeState.ts
export const defaultAppStoreState = {
  // Skill関連
  skills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,

  // Permission関連
  pendingPermission: null,
  permissionHistory: [],

  // Streaming関連
  streamingMessages: [],
  streamingStatus: "idle" as const,
};

export function createAppStoreState(
  overrides: Partial<typeof defaultAppStoreState> = {}
) {
  return { ...defaultAppStoreState, ...overrides };
}
```

### セレクタモック

```typescript
// モックStore作成ヘルパー
export function createMockAppStore(
  state: Partial<typeof defaultAppStoreState> = {}
) {
  const fullState = createAppStoreState(state);

  return vi.fn((selector: (s: typeof fullState) => unknown) => {
    return selector(fullState);
  });
}

// 使用例
vi.mock("../../../store", () => ({
  useAppStore: createMockAppStore({
    selectedSkillName: "test-skill",
    isExecuting: true,
  }),
}));
```

---

## 4. Propsビルダー

### ビルダーパターン

```typescript
class SkillImportDialogPropsBuilder {
  private props: SkillImportDialogProps = {
    isOpen: true,
    onClose: vi.fn(),
    skillMetadata: createSkillMetadata(),
    onImport: vi.fn(),
  };

  withClosed(): this {
    this.props.isOpen = false;
    return this;
  }

  withSkill(metadata: Partial<SkillMetadata>): this {
    this.props.skillMetadata = createSkillMetadata(metadata);
    return this;
  }

  withOnClose(fn: () => void): this {
    this.props.onClose = fn;
    return this;
  }

  build(): SkillImportDialogProps {
    return { ...this.props };
  }
}

// 使用例
const props = new SkillImportDialogPropsBuilder()
  .withSkill({ name: "custom-skill" })
  .withClosed()
  .build();
```

---

## 5. Providerラッパー

### 共通ラッパー

```typescript
// test/providers/TestProviders.tsx
export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <I18nProvider locale="ja">
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

// カスタムrender関数
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  });
}
```

### Storeプロバイダー

```typescript
export function createTestStore(initialState: Partial<AppState> = {}) {
  return createStore<AppState>((set) => ({
    ...defaultAppStoreState,
    ...initialState,
    // アクション
    setSelectedSkill: (name) => set({ selectedSkillName: name }),
  }));
}

export function StoreProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: ReturnType<typeof createTestStore>;
}) {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}
```

---

## 6. フィクスチャファイル構成

### 推奨ディレクトリ構造

```
apps/desktop/src/
├── test/
│   ├── factories/
│   │   ├── index.ts                    # 全ファクトリをre-export
│   │   ├── skillMetadata.factory.ts
│   │   ├── permissionRequest.factory.ts
│   │   ├── streamMessage.factory.ts
│   │   └── storeState.factory.ts
│   ├── fixtures/
│   │   ├── boundaries/                 # 境界値データ
│   │   │   ├── emptyData.ts
│   │   │   └── maxData.ts
│   │   └── mocks/                      # モックデータセット
│   │       ├── skills.ts
│   │       └── permissions.ts
│   ├── providers/
│   │   └── TestProviders.tsx
│   └── setup.ts                        # Vitest setup
```

### index.ts（エントリポイント）

```typescript
// test/factories/index.ts
export * from "./skillMetadata.factory";
export * from "./permissionRequest.factory";
export * from "./streamMessage.factory";
export * from "./storeState.factory";

// 便利なプリセット
export { emptySkillMetadata, maxSkillMetadata } from "../fixtures/boundaries/";
export { mockSkills, mockPermissions } from "../fixtures/mocks/";
```

---

## 7. ベストプラクティス

### Do's

| プラクティス | 理由 |
|-------------|------|
| 型安全なファクトリ | コンパイル時エラー検出 |
| デフォルト値＋オーバーライド | テスト意図の明確化 |
| 境界値の事前定義 | 漏れのない境界テスト |
| 不変のフィクスチャ | テスト間の独立性 |

### Don'ts

| アンチパターン | 問題 |
|----------------|------|
| テストファイル内でデータ定義 | 重複、保守性低下 |
| `any`型でのオーバーライド | 型安全性喪失 |
| 共有ミュータブル状態 | テスト間干渉 |
| ハードコードID | デバッグ困難 |

---

## 8. electronAPI Mock ファクトリ

### F-ELECTRON-01: electronAPI Mock ファクトリ

#### 概要

`window.electronAPI` を `Object.defineProperty` でテスト環境に注入するファクトリ関数。contextBridge 経由の IPC 通信をモックし、Renderer コンポーネントのテストを可能にする。

#### コード例

```typescript
export interface MockElectronApiKey {
  list: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  validate: ReturnType<typeof vi.fn>;
}

export const createDefaultElectronApiKey = (
  overrides: Partial<MockElectronApiKey> = {},
  listResult?: unknown,
): MockElectronApiKey => ({
  list: vi.fn().mockResolvedValue(listResult ?? {
    success: true,
    data: {
      providers: [
        { provider: "openai", displayName: "OpenAI", status: "registered", lastValidatedAt: "2026-03-01T00:00:00Z" },
        { provider: "anthropic", displayName: "Anthropic", status: "not_registered", lastValidatedAt: null },
      ],
    },
  }),
  save: vi.fn().mockResolvedValue({ success: true }),
  delete: vi.fn().mockResolvedValue({ success: true }),
  validate: vi.fn().mockResolvedValue({ success: true, data: { status: "valid", errorMessage: null } }),
  ...overrides,
});

// テスト内での使用
const setupElectronApi = (apiKey: MockElectronApiKey) => {
  Object.defineProperty(window, "electronAPI", {
    value: { apiKey },
    writable: true,
    configurable: true,
  });
};
```

#### 適用基準

- Renderer コンポーネントが `window.electronAPI` 経由で IPC 通信を行う場合
- ApiKeysSection 等の electronAPI 依存コンポーネントのテスト

#### 注意事項

- `Object.defineProperty` で `writable: true, configurable: true` を設定し、テスト間でのリセットを可能にする
- P48（non-null assertion）対策: `result.data!.providers` ではなく `Array.isArray(result.data?.providers)` で実行時型検証すること

#### 実装例

- `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`

#### 関連タスク

- 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001

---

## 参照

- **テストパターン**: [testing-component-patterns.md](testing-component-patterns.md)
- **E2Eフィクスチャ**: [quality-e2e-testing.md](quality-e2e-testing.md)
- **品質要件**: [quality-requirements.md](quality-requirements.md)

---

## 変更履歴

| Version | Date       | Changes                                    |
|---------|------------|--------------------------------------------|
| 1.0.0   | 2026-02-02 | TASK-8B/8C-Gフィクスチャパターンから初版作成 |
