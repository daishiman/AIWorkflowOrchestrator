# TASK-8B 実装ガイド: コンポーネントテスト

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 12                           |
| タスク | TASK-8B コンポーネントテスト |
| 作成日 | 2026-02-02                   |

---

# Part 1: 概念編（コンポーネントテストとは？）

## テストって何？

テストとは、プログラムの「部品」が正しく動いているかを自動でチェックする仕組みです。

身近な例で考えてみましょう。自動販売機を使うとき、こんなことを期待しますよね:

- ボタンを押したら、正しい飲み物が出てくる
- お金が足りないときは「金額不足」と表示される
- 売り切れの商品のボタンは押せなくなる

プログラムの「コンポーネントテスト」も同じです。画面の部品（ボタン、メニュー、ダイアログなど）が、ユーザーの操作に対して正しく反応するかを、人間の代わりにコンピューターが毎回自動で確認してくれます。

## なぜテストが必要なの？

プログラムを変更するたびに、今まで動いていた部分が壊れる可能性があります。テストがあれば:

1. **壊れたらすぐ分かる** - テストが失敗して教えてくれる
2. **安心して変更できる** - テストが守ってくれるので怖くない
3. **品質が保たれる** - 毎回同じチェックを自動で行える

## 今回テストした4つの部品

| 部品の名前         | 日常の例え                       | 役割                           |
| ------------------ | -------------------------------- | ------------------------------ |
| SkillSelector      | 自動販売機の商品ボタン           | スキル（機能）を選ぶメニュー   |
| SkillImportDialog  | 「この商品を購入しますか？」画面 | スキルを取り込む確認画面       |
| PermissionDialog   | 「本当に実行しますか？」画面     | 操作の許可を求める画面         |
| SkillStreamingView | 進捗表示の画面                   | スキル実行中の状態を見せる画面 |

## テストの結果

- **280個のテスト**を作成し、**全て合格**
- テストにかかる時間は**約3秒**（毎回自動で実行）
- コードの**99.7%**をカバー（ほぼ全ての行をチェック済み）

---

# Part 2: 技術詳細編

## アーキテクチャ編: テスト構成

### テストスタック

| 技術                        | 用途                         |
| --------------------------- | ---------------------------- |
| Vitest 2.1.9                | テストランナー               |
| @testing-library/react      | DOMテスト                    |
| @testing-library/user-event | ユーザー操作シミュレーション |
| happy-dom                   | DOM環境                      |
| v8 coverage                 | カバレッジ計測               |

### テストファイル構成

```
apps/desktop/src/renderer/components/skill/__tests__/
├── SkillSelector.test.tsx           # 28テスト（仕様15 + 追加13）
├── SkillImportDialog.test.tsx       # 31テスト（仕様12 + 追加19）（注: 56はdocカウント、実際31がファイル内）
├── PermissionDialog.test.tsx        # 57テスト（仕様12 + 追加45）
├── PermissionDialog.metadata.test.tsx # 19テスト
├── PermissionDialog.readable.test.tsx # 19テスト
├── SkillStreamingView.test.tsx      # 33テスト（仕様16 + 追加17）
├── permissionDescriptions.test.ts   # 34テスト
├── toolMetadata.test.ts             # 37テスト
└── permissionHistory.test.ts        # 22テスト
```

### コンポーネント間関係

```
ChatPanel
├── SkillSelector (ヘッダー内、常時表示)
│   └── useSkillStore() → availableSkills, importedSkills, selectedSkillName
├── SkillStreamingView (条件付き表示)
│   └── useAppStore() → streamingMessages, executionStatus, abortExecution
├── SkillImportDialog (ローカルstate制御)
│   └── useAppStore() → importSkill, isImporting
└── PermissionDialog (常時マウント)
    └── useAppStore() → pendingPermission, respondToSkillPermission
```

## 技術詳細編: 実装パターン

### Storeモック戦略

#### パターン1: useSkillStore直接モック（SkillSelector）

```typescript
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
});
```

#### パターン2: useAppStoreセレクタモック（PermissionDialog, SkillImportDialog）

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      pendingPermission: mockPendingPermission,
      respondToSkillPermission: mockRespondToPermission,
    };
    return selector ? selector(state) : state;
  }),
}));
```

#### パターン3: セレクタ関数モック（SkillStreamingView）

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (state: any) => any) => {
    return selector(mockStoreState);
  }),
}));
```

### アサーション戦略

| アサーション種別 | 使用方法                         | 用途                           |
| ---------------- | -------------------------------- | ------------------------------ |
| DOM存在確認      | `screen.getByRole/getByText`     | コンポーネントの表示確認       |
| DOM非存在確認    | `screen.queryByRole/queryByText` | 非表示/未レンダリング確認      |
| 属性確認         | `toHaveAttribute`                | ARIA属性の検証                 |
| 関数呼び出し確認 | `toHaveBeenCalledWith`           | Storeアクションの呼び出し検証  |
| 状態変化確認     | `waitFor` + assertion            | 非同期状態変化の検証           |
| フォーカス確認   | `document.activeElement`         | キーボードナビゲーションの検証 |

### テストデータファクトリ

```typescript
// SkillMetadata ファクトリ
function createMockSkillMetadata(overrides?: Partial<SkillMetadata>): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill description",
    allowedTools: ["Bash", "Read", "Write"],
    path: "/test/path",
    updatedAt: new Date("2026-01-01"),
    agents: [{ filename: "agent1.md", relativePath: "agents/agent1.md", size: 100 }],
    references: [{ filename: "ref1.md", relativePath: "references/ref1.md", size: 200 }],
    scripts: [], assets: [], schemas: [], indexes: [], otherFiles: [],
    ...overrides,
  };
}

// PermissionRequest ファクトリ
function createMockPermissionRequest(overrides?: Partial<SkillPermissionRequest>) {
  return {
    executionId: "exec-1", requestId: "req-1",
    toolName: "Bash", args: { command: "ls -la" }, reason: "List files",
    ...overrides,
  };
}

// StreamMessage ファクトリ（SkillStreamingView）
function createAssistantMessage(text: string, isPartial = false): SkillStreamMessage { ... }
function createToolUseMessage(toolName: string): SkillStreamMessage { ... }
function createToolResultMessage(success: boolean, output: string): SkillStreamMessage { ... }
function createErrorMessage(message: string): SkillStreamMessage { ... }
function createStatusMessage(status: string): SkillStreamMessage { ... }
```

### カバレッジ結果サマリー

| コンポーネント            | Lines      | Branches   | Functions  | Statements |
| ------------------------- | ---------- | ---------- | ---------- | ---------- |
| PermissionDialog.tsx      | 100%       | 95.34%     | 100%       | 100%       |
| SkillImportDialog.tsx     | 100%       | 100%       | 100%       | 100%       |
| SkillSelector.tsx         | 100%       | 93.15%     | 87.5%      | 100%       |
| SkillStreamingView.tsx    | 99.31%     | 93.75%     | 100%       | 99.31%     |
| permissionDescriptions.ts | 97.75%     | 97.91%     | 100%       | 97.75%     |
| permissionHistory.ts      | 100%       | 100%       | 100%       | 100%       |
| toolMetadata.ts           | 100%       | 100%       | 100%       | 100%       |
| **合計**                  | **99.71%** | **95.85%** | **97.61%** | **99.71%** |

## 実装判断の理由編

### なぜStoreレベルでモックするのか？

コンポーネントテストの目的はUI部品の動作検証。IPC通信やバックエンドのテストは別タスク（E2Eテスト）で行う。Storeレベルでモックすることで:

- テストが高速に実行できる（IPC通信不要）
- テスト対象が明確（UIの動作のみ）
- テスト間の独立性が保証される

### なぜカバレッジ80%を目標にしたのか？

- 80%は業界標準の目標値で、テスト工数と品質のバランスが良い
- 100%を目指すと、到達困難な分岐パスへの対応でテストが複雑化する
- 結果的に99.71%を達成（既存テスト225件が充実していたため）

### なぜhappy-domを使うのか？

- jsdomより軽量で高速（テスト実行時間の短縮）
- 基本的なDOM APIをサポート
- Vitest公式がサポートする環境

## 用語集

### テスト関連用語

| 用語             | 説明                                                   |
| ---------------- | ------------------------------------------------------ |
| Vitest           | JavaScriptのテスト実行ツール。Viteベースで高速         |
| happy-dom        | ブラウザなしでHTMLを扱えるシミュレーション環境         |
| カバレッジ       | テストがコードのどれだけを通ったかの割合               |
| モック           | テスト用の「偽物」データや関数                         |
| フレイキーテスト | 同じコードなのに成功したり失敗したりする不安定なテスト |

### コンポーネント関連用語

| 用語               | 説明                                              |
| ------------------ | ------------------------------------------------- |
| Store              | アプリ全体の状態を管理する仕組み（Zustand）       |
| ARIA               | 画面読み上げソフト向けの属性（アクセシビリティ）  |
| Listbox            | キーボードで選択できるリストのUIパターン          |
| フォーカストラップ | ダイアログ内でTabキーが外に出ないようにする仕組み |
| IPC                | Electronのメインプロセスとの通信手段              |

### テスト手法用語

| 用語      | 説明                                       |
| --------- | ------------------------------------------ |
| getByRole | ARIA ロールでHTML要素を探すクエリ（推奨）  |
| getByText | テキスト内容でHTML要素を探すクエリ         |
| userEvent | ユーザーの操作をシミュレーションするツール |
| fireEvent | DOM イベントを直接発火させるツール         |
| waitFor   | 非同期の変化を待つヘルパー関数             |

## トラブルシューティング

### よくあるテスト失敗パターン

| 症状                                       | 原因                                       | 対処法                                              |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------------- |
| `Invalid Chai property: toBeInTheDocument` | `apps/desktop`ディレクトリからの実行が必要 | `cd apps/desktop && npx vitest run ...`             |
| `document is not defined`                  | happy-dom環境が読み込まれていない          | vitest.config.tsが正しく参照されているか確認        |
| モックが効かない                           | `vi.clearAllMocks()`が呼ばれていない       | beforeEachでのリセットを確認                        |
| 非同期テストの失敗                         | `waitFor`が不足                            | 状態変更後のアサーションを`waitFor`で囲む           |
| `@repo/shared`モジュールエラー             | 共有パッケージ未ビルド                     | `pnpm install` → `pnpm --filter @repo/shared build` |
