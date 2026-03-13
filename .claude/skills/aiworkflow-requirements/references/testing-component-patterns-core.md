# コンポーネントテストパターン / core specification

> 親仕様書: [testing-component-patterns.md](testing-component-patterns.md)
> 役割: core specification

## 概要

UIコンポーネントの単体・統合テストにおける標準パターン集。
Vitest + React Testing Library + happy-dom環境を前提とする。

**対象**: `apps/desktop/src/renderer/components/` 配下のReactコンポーネント

---

## 1. Storeモッキングパターン

### パターン1: 直接返却（シンプルな状態）

```typescript
let currentStoreState = { skills: [], selectedSkillName: null };

vi.mock("../../../store", () => ({
  useSkillStore: () => currentStoreState,
}));

beforeEach(() => {
  currentStoreState = { skills: mockSkills, selectedSkillName: null };
});
```

**使用場面**: 読み取り専用の状態、全状態を一括取得するコンポーネント

### パターン2: セレクタ関数モッキング（Zustandスタイル）

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      pendingPermission: mockPendingPermission,
      respondToSkillPermission: mockRespondToSkillPermission,
    };
    return selector(state);
  }),
}));
```

**使用場面**: Zustandのセレクタパターン使用時、部分的な状態更新

### パターン3: 静的モック＋ミューテーション

```typescript
let mockPendingPermission: SkillPermissionRequest | null = null;
const mockRespondToSkillPermission = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(() => ({
    pendingPermission: mockPendingPermission,
    respondToSkillPermission: mockRespondToSkillPermission,
  })),
}));

beforeEach(() => {
  mockPendingPermission = { executionId: "exec-001", toolName: "Bash" };
  vi.clearAllMocks();
});
```

**使用場面**: テストごとに状態を変更、アクション関数のモック

### 選択基準

| パターン  | 状態変更頻度 | セレクタ使用 | 推奨コンポーネント        |
| --------- | ------------ | ------------ | ------------------------- |
| パターン1 | 低           | なし         | 表示専用コンポーネント    |
| パターン2 | 中           | あり         | Zustand接続コンポーネント |
| パターン3 | 高           | なし/あり    | ダイアログ・フォーム      |

---

## 2. テストデータファクトリ

### 基本構造

```typescript
// factories/skillMetadata.factory.ts
export function createSkillMetadata(
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill description",
    allowedTools: ["Bash", "Read"],
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}

// 境界値バリアント
export const emptySkillMetadata = createSkillMetadata({
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
});

export const fullSkillMetadata = createSkillMetadata({
  agents: [{ filename: "agent1.md", relativePath: "agents/", size: 1024 }],
  references: [
    { filename: "ref1.md", relativePath: "references/", size: 2048 },
  ],
  // ... 全リソース
});
```

### メッセージファクトリ

```typescript
export function createAssistantMessage(
  text: string,
  isPartial = false,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    type: "assistant",
    content: { type: "text", text },
    timestamp,
    isPartial,
  };
}

export function createToolUseMessage(
  toolName: string,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    type: "tool_use",
    content: { type: "tool_use", name: toolName, id: `tool-${timestamp}` },
    timestamp,
  };
}
```

---

## 3. アクセシビリティテスト

### ダイアログ検証

```typescript
describe("アクセシビリティ", () => {
  it("ダイアログロールと属性が正しい", () => {
    render(<PermissionDialog />);
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("フォーカストラップが機能する", async () => {
    render(<PermissionDialog />);
    const dialog = screen.getByRole("dialog");
    const buttons = dialog.querySelectorAll("button");

    // 最後の要素でTabを押すと最初に戻る
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
```

### コンボボックス検証

```typescript
it("コンボボックスのARIA属性が正しい", () => {
  render(<SkillSelector />);
  const trigger = screen.getByRole("combobox");

  expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("aria-controls");
});

it("選択状態でaria-activedescendantが更新される", async () => {
  const user = userEvent.setup();
  render(<SkillSelector />);

  await user.click(screen.getByRole("combobox"));
  await user.keyboard("{ArrowDown}");

  expect(screen.getByRole("combobox"))
    .toHaveAttribute("aria-activedescendant", "skill-option-0");
});
```

---

## 4. キーボードナビゲーション

### 必須テストマトリクス

| キー         | テスト内容     | 検証項目                              |
| ------------ | -------------- | ------------------------------------- |
| ArrowUp/Down | オプション移動 | フォーカス位置、aria-activedescendant |
| Enter        | 選択確定       | 選択値、ダイアログ閉じ                |
| Escape       | キャンセル     | ダイアログ閉じ、フォーカス復帰        |
| Tab          | 順方向トラップ | 最後→最初の循環                       |
| Shift+Tab    | 逆方向トラップ | 最初→最後の循環                       |
| Home/End     | 境界移動       | 最初/最後の要素                       |

### 実装例

```typescript
describe("キーボードナビゲーション", () => {
  it("ArrowDownでリストを開く", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("Escapeでリストを閉じる", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
```

---

## 5. 非同期テスト

### waitForパターン

```typescript
it("インポート成功後にダイアログが閉じる", async () => {
  const onClose = vi.fn();
  render(<SkillImportDialog onClose={onClose} />);

  await user.click(screen.getByRole("button", { name: /インポート/ }));

  await waitFor(() => {
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

### エラーハンドリング

```typescript
it("インポート失敗時はダイアログが開いたまま", async () => {
  mockImportSkill.mockRejectedValue(new Error("import failed"));
  const onClose = vi.fn();

  render(<SkillImportDialog onClose={onClose} />);
  await user.click(screen.getByRole("button", { name: /インポート/ }));

  await waitFor(() => {
    expect(mockImportSkill).toHaveBeenCalled();
  });

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});
```

---

## 6. テスト構成

### describe階層

```typescript
describe("ComponentName", () => {
  describe("表示制御", () => {
    it("TC-001: 初期状態で正しく表示される", () => {});
    it("TC-002: データなし時にプレースホルダーを表示", () => {});
  });

  describe("ユーザーインタラクション", () => {
    it("TC-101: ボタンクリックでアクションが実行される", () => {});
    it("TC-102: 入力変更が状態に反映される", () => {});
  });

  describe("アクセシビリティ", () => {
    it("TC-201: ARIA属性が正しく設定されている", () => {});
    it("TC-202: キーボード操作が可能", () => {});
  });

  describe("エッジケース", () => {
    it("TC-301: 空データで正しく処理される", () => {});
    it("TC-302: 長い文字列が切り詰められる", () => {});
  });
});
```

### 命名規則

- **TC-{カテゴリコード}{番号}**: テストケースID
- カテゴリ: 0xx=表示、1xx=操作、2xx=a11y、3xx=エッジ
- **FR-XX / NFR-XX**: 要件トレーサビリティ参照

---

## 7. userEvent vs fireEvent

### userEvent推奨（デフォルト）

```typescript
const user = userEvent.setup();
await user.click(button); // 実際のクリック動作
await user.type(input, "text"); // 文字入力
await user.keyboard("{Enter}"); // キー操作
```

### fireEvent使用ケース

```typescript
// 直接DOMイベント（userEventで再現困難）
fireEvent.keyDown(document, { key: "Escape" });

// パフォーマンス最適化（大量操作）
fireEvent.change(input, { target: { value: "text" } });
```

---

## 8. テストファイル分離パターン（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）

複雑なサービスクラスのテストは、責務ごとにファイルを分離することで可読性と保守性を向上させる。

### ファイル分類

| ファイル種別 | 命名規則 | テスト内容 |
|-------------|----------|-----------|
| 永続化テスト | `*.persistence.test.ts` | ストア保存・復元、再起動シミュレーション、データ整合性 |
| エラーテスト | `*.error.test.ts` | 異常系、例外処理、フォールバック動作、エラーメッセージ |
| 境界値テスト | `*.boundary.test.ts` | null、空配列、最大長、Unicode、特殊文字 |
| 基本テスト | `*.test.ts` | 正常系、基本的なCRUD操作 |

### 利点

| 利点 | 詳細 |
|------|------|
| 責務の明確化 | 各ファイルが単一の観点に集中 |
| 可読性向上 | テストケースを探しやすい |
| 並列実行 | Vitestでファイル単位の並列実行が容易 |
| 選択的実行 | 特定カテゴリのテストのみ実行可能 |
| チーム分担 | 異なるメンバーが異なるファイルを担当可能 |

### 実行コマンド例

| コマンド | 実行対象 |
|----------|----------|
| `vitest SkillImportManager.test.ts` | 基本テストのみ |
| `vitest SkillImportManager.persistence.test.ts` | 永続化テストのみ |
| `vitest SkillImportManager.*.test.ts` | 全カテゴリ |
| `vitest --grep "boundary"` | 全ファイルの境界値テスト |

### 適用基準

| 条件 | 推奨 |
|------|------|
| テストケースが50件以上 | 分離を強く推奨 |
| テストケースが20-50件 | 分離を検討 |
| テストケースが20件未満 | 単一ファイルで十分 |

### 実装例

SkillImportManagerのテストファイル構成:

| ファイル | ケース数 | 内容 |
|----------|----------|------|
| `SkillImportManager.test.ts` | 基本 | インポート・削除・リスト取得 |
| `SkillImportManager.persistence.test.ts` | 永続化 | ストア保存・復元・アプリ再起動 |
| `SkillImportManager.error.test.ts` | エラー | 無効な値・型エラー・フォールバック |
| `SkillImportManager.boundary.test.ts` | 境界値 | 空配列・大量データ・Unicode |

---

