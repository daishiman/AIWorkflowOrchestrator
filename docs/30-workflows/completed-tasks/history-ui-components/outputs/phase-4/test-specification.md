# テスト仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 4                             |

---

## テスト戦略

### テストピラミッド

```
         △ E2Eテスト
        ／ ＼ (Phase 11で実施)
       ／   ＼
      △△△△ 統合テスト
     ／      ＼ (IPC通信、データフロー)
    ／        ＼
   △△△△△△△ ユニットテスト
  ／            ＼ (コンポーネント、フック)
 ／              ＼
━━━━━━━━━━━━━━━━━
```

### カバレッジ目標

| メトリクス        | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 80%+   |
| Branch Coverage   | 75%+   |
| Function Coverage | 85%+   |

---

## テスト対象

### コンポーネント

| コンポーネント     | テストファイル              | 優先度 |
| ------------------ | --------------------------- | ------ |
| VersionHistory     | VersionHistory.test.tsx     | Must   |
| VersionDetail      | VersionDetail.test.tsx      | Must   |
| ConversionLogs     | ConversionLogs.test.tsx     | Must   |
| RestoreDialog      | RestoreDialog.test.tsx      | Must   |
| VersionHistoryItem | VersionHistoryItem.test.tsx | Should |
| LogEntry           | LogEntry.test.tsx           | Should |

### カスタムフック

| フック            | テストファイル            | 優先度 |
| ----------------- | ------------------------- | ------ |
| useVersionHistory | useVersionHistory.test.ts | Must   |
| useVersionDetail  | useVersionDetail.test.ts  | Must   |
| useConversionLogs | useConversionLogs.test.ts | Must   |
| useRestore        | useRestore.test.ts        | Must   |

---

## テスト環境

### テストフレームワーク

| ツール                      | 用途                 |
| --------------------------- | -------------------- |
| Vitest                      | テストランナー       |
| @testing-library/react      | コンポーネントテスト |
| @testing-library/user-event | ユーザーイベント     |
| @testing-library/jest-dom   | DOMアサーション      |

### モック戦略

#### window.historyAPI

```typescript
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

vi.stubGlobal("window", {
  historyAPI: mockHistoryAPI,
});
```

#### モックデータファクトリ

```typescript
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-10T00:00:00Z",
  size: 1024,
  mimeType: "text/markdown",
  hash: "abc123",
  isLatest: false,
  ...overrides,
});

const createMockConversionLog = (
  overrides?: Partial<ConversionLog>,
): ConversionLog => ({
  id: "log-001",
  fileId: "file-123",
  level: "info",
  message: "Test log message",
  timestamp: "2026-01-10T00:00:00Z",
  ...overrides,
});
```

---

## テスト命名規則

### 形式

```
describe("コンポーネント/フック名", () => {
  describe("機能カテゴリ", () => {
    it("期待される動作を日本語で記述する", () => {
      // Given: 前提条件
      // When: 操作
      // Then: 期待結果
    });
  });
});
```

### 例

```typescript
describe("VersionHistory", () => {
  describe("履歴一覧表示", () => {
    it("ファイルIDを指定して履歴一覧を表示する", async () => {
      // ...
    });
  });
});
```

---

## テストカテゴリ

### 1. 正常系テスト

- 基本的なUIレンダリング
- ユーザー操作（クリック、入力）
- データ表示

### 2. エラー系テスト

- API呼び出しエラー
- ネットワークエラー
- バリデーションエラー

### 3. エッジケーステスト

- 空データ
- 大量データ
- 境界値

### 4. アクセシビリティテスト

- キーボード操作
- ARIA属性
- フォーカス管理

---

## 依存関係

### テスト実行順序

1. ユニットテスト（フック）
2. ユニットテスト（コンポーネント）
3. 統合テスト（Phase 6以降）

### モック依存

```
コンポーネント
    │
    └── カスタムフック（モック不要、実際のフックを使用）
          │
          └── window.historyAPI（モック）
```

---

## 関連ドキュメント

| 資料名           | パス                                         |
| ---------------- | -------------------------------------------- |
| テストケース一覧 | `outputs/phase-4/test-cases.md`              |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md` |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     |
