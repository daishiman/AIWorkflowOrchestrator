# 統合テスト設計書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 4                             |

---

## 統合テスト戦略

### テスト範囲

```
┌─────────────────────────────────────────────────────────────────┐
│                        統合テスト範囲                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ React Component │───▶│ Custom Hook     │                    │
│  │ (VersionHistory)│    │ (useVersion...)  │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                  │                              │
│                                  ▼                              │
│                    ┌─────────────────────────┐                  │
│                    │ window.historyAPI       │ ← モック境界     │
│                    │ (Preload API)           │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### モック境界

| レイヤー          | 実テスト | モック |
| ----------------- | -------- | ------ |
| React Component   | ✓        | -      |
| Custom Hook       | ✓        | -      |
| window.historyAPI | -        | ✓      |
| IPC Handler       | -        | ✓      |
| HistoryService    | -        | ✓      |

---

## IPC接続テスト

### IT-IPC-001: 履歴一覧取得のIPC呼び出し

```typescript
describe("IPC接続テスト", () => {
  it("履歴一覧取得時にgetFileHistoryが正しいパラメータで呼ばれる", async () => {
    // Given: VersionHistoryコンポーネントがマウントされる
    // When: fileId="file-123"でレンダリング
    // Then: window.historyAPI.getFileHistory("file-123", { limit: 20, offset: 0 })が呼ばれる
  });

  it("ページネーション時にoffsetが正しくインクリメントされる", async () => {
    // Given: 初期データが読み込まれている
    // When: 「さらに読み込む」をクリック
    // Then: getFileHistory("file-123", { limit: 20, offset: 20 })が呼ばれる
  });
});
```

### IT-IPC-002: バージョン詳細取得のIPC呼び出し

```typescript
describe("バージョン詳細IPC", () => {
  it("詳細取得時にgetVersionDetailが正しいIDで呼ばれる", async () => {
    // Given: VersionDetailコンポーネントがマウントされる
    // When: conversionId="conv-456"でレンダリング
    // Then: window.historyAPI.getVersionDetail("conv-456")が呼ばれる
  });
});
```

### IT-IPC-003: 復元処理のIPC呼び出し

```typescript
describe("復元処理IPC", () => {
  it("復元実行時にrestoreVersionが正しいパラメータで呼ばれる", async () => {
    // Given: RestoreDialogが表示されている
    // When: 「復元する」をクリック
    // Then: window.historyAPI.restoreVersion("file-123", "conv-456")が呼ばれる
  });
});
```

---

## データフローテスト

### IT-FLOW-001: 履歴一覧データフロー

```typescript
describe("履歴一覧データフロー", () => {
  it("Renderer→IPC→レスポンス→UIの一連のフローが正しく動作する", async () => {
    // Given: APIが正常レスポンスを返す
    mockHistoryAPI.getFileHistory.mockResolvedValue({
      success: true,
      data: {
        items: [mockVersionHistoryItem],
        total: 1,
        hasMore: false,
      },
    });

    // When: VersionHistoryをレンダリング
    render(<VersionHistory fileId="file-123" />);

    // Then: データがUIに反映される
    await waitFor(() => {
      expect(screen.getByText("v1")).toBeInTheDocument();
    });
  });
});
```

### IT-FLOW-002: 復元後の履歴更新フロー

```typescript
describe("復元後データフロー", () => {
  it("復元完了後に履歴一覧が自動更新される", async () => {
    // Given: 初期履歴が表示されている
    // When: 復元を実行
    // Then: 復元完了後にgetFileHistoryが再度呼ばれる
  });
});
```

### IT-FLOW-003: フィルタ変更データフロー

```typescript
describe("フィルタ変更データフロー", () => {
  it("フィルタ変更時にログが再取得される", async () => {
    // Given: ログ一覧が表示されている
    // When: フィルタを「Error」に変更
    // Then: getConversionLogsが新しいフィルタで呼ばれる
  });
});
```

---

## エラーハンドリングテスト

### IT-ERR-001: IPC通信エラー

```typescript
describe("IPC通信エラー", () => {
  it("IPC通信失敗時にエラーメッセージが表示される", async () => {
    // Given: APIがエラーを返す
    mockHistoryAPI.getFileHistory.mockResolvedValue({
      success: false,
      error: new Error("Network error"),
    });

    // When: VersionHistoryをレンダリング
    render(<VersionHistory fileId="file-123" />);

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/エラー/)).toBeInTheDocument();
    });
  });
});
```

### IT-ERR-002: タイムアウトエラー

```typescript
describe("タイムアウトエラー", () => {
  it("30秒以上の応答遅延でタイムアウトエラーになる", async () => {
    // Given: APIが30秒以上応答しない
    // When: 復元を実行
    // Then: タイムアウトエラーが表示される
  });
});
```

### IT-ERR-003: データ未発見エラー

```typescript
describe("データ未発見エラー", () => {
  it("存在しないファイルIDでNotFoundエラーになる", async () => {
    // Given: 存在しないfileId
    mockHistoryAPI.getFileHistory.mockResolvedValue({
      success: false,
      error: new Error("Not found"),
    });

    // When: VersionHistoryをレンダリング
    // Then: 「データが見つかりません」が表示される
  });
});
```

---

## 状態同期テスト

### IT-SYNC-001: 復元後の状態同期

```typescript
describe("復元後の状態同期", () => {
  it("復元完了後、最新バージョンが更新される", async () => {
    // Given: v2が最新、v1を復元
    // When: 復元を実行
    // Then: v3が最新として表示される（新しいバージョンが作成される）
  });
});
```

### IT-SYNC-002: 選択状態の同期

```typescript
describe("選択状態の同期", () => {
  it("履歴アイテム選択で詳細パネルが更新される", async () => {
    // Given: 履歴一覧が表示されている
    // When: 2番目のアイテムをクリック
    // Then: 詳細パネルに2番目のバージョン情報が表示される
  });
});
```

### IT-SYNC-003: ダイアログ状態の同期

```typescript
describe("ダイアログ状態の同期", () => {
  it("復元ボタンクリックでダイアログが開く", async () => {
    // Given: 履歴詳細が表示されている
    // When: 「このバージョンに復元」をクリック
    // Then: RestoreDialogが表示される
  });

  it("復元完了でダイアログが閉じる", async () => {
    // Given: RestoreDialogが表示されている
    // When: 復元が完了
    // Then: ダイアログが自動的に閉じる
  });
});
```

---

## テストシナリオサマリ

| カテゴリ           | テストケース数 | 説明                           |
| ------------------ | -------------- | ------------------------------ |
| IPC接続テスト      | 4              | API呼び出しの正確性検証        |
| データフローテスト | 5              | エンドツーエンドのデータフロー |
| エラーハンドリング | 4              | 異常系の動作検証               |
| 状態同期テスト     | 4              | コンポーネント間の状態同期     |
| **合計**           | **17**         |                                |

---

## テストファイル構成

```
apps/desktop/src/renderer/
├── components/history/__tests__/
│   ├── VersionHistory.test.tsx     # ユニット + 統合
│   ├── VersionHistory.ipc.test.tsx # IPC統合テスト
│   └── integration/
│       ├── data-flow.test.tsx      # データフローテスト
│       ├── error-handling.test.tsx # エラーハンドリング
│       └── state-sync.test.tsx     # 状態同期テスト
└── hooks/__tests__/
    └── integration/
        └── hooks-integration.test.ts # フック統合テスト
```

---

## モックセットアップ

### テスト共通セットアップ

```typescript
// test-utils/mocks.ts
import { vi } from "vitest";

export const createMockHistoryAPI = () => ({
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
});

export const setupMockHistoryAPI = (mock = createMockHistoryAPI()) => {
  vi.stubGlobal("window", { historyAPI: mock });
  return mock;
};

// デフォルト成功レスポンス
export const mockSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

// デフォルトエラーレスポンス
export const mockErrorResponse = (error: Error) => ({
  success: false as const,
  error,
});
```

### テストユーティリティ

```typescript
// test-utils/render.tsx
import { render, RenderOptions } from "@testing-library/react";

// カスタムレンダー（必要に応じてプロバイダーをラップ）
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { ...options });
};

export * from "@testing-library/react";
export { customRender as render };
```

---

## 関連ドキュメント

| 資料名       | パス                                     |
| ------------ | ---------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  |
| テストケース | `outputs/phase-4/test-cases.md`          |
| データフロー | `outputs/phase-2/data-flow.md`           |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` |
