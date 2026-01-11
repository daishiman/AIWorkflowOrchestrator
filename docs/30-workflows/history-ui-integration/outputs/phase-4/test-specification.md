# テスト仕様書 - 履歴UIコンポーネント統合

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-11 |
| Phase      | 4          |
| ステータス | 完了       |

---

## 1. テスト対象

### 1.1 新規作成コンポーネント

| コンポーネント  | テストファイル                                                 |
| --------------- | -------------------------------------------------------------- |
| HistoryPage     | apps/desktop/src/renderer/pages/**tests**/HistoryPage.test.tsx |
| historyHandlers | apps/desktop/src/main/ipc/**tests**/historyHandlers.test.ts    |

### 1.2 テスト対象外（既存・変更なし）

| コンポーネント    | 理由                             |
| ----------------- | -------------------------------- |
| VersionHistory    | CONV-05-03でテスト済み（94.43%） |
| VersionDetail     | CONV-05-03でテスト済み           |
| ConversionLogs    | CONV-05-03でテスト済み           |
| RestoreDialog     | CONV-05-03でテスト済み           |
| useVersionHistory | CONV-05-03でテスト済み           |
| useVersionDetail  | CONV-05-03でテスト済み           |
| useConversionLogs | CONV-05-03でテスト済み           |
| useRestore        | CONV-05-03でテスト済み           |

---

## 2. テスト戦略

### 2.1 テストレベル

| レベル   | 対象            | ツール       |
| -------- | --------------- | ------------ |
| ユニット | historyHandlers | Vitest       |
| 統合     | HistoryPage     | Vitest + RTL |
| E2E      | 将来対応        | Playwright   |

### 2.2 モック戦略

| 対象              | モック方法                |
| ----------------- | ------------------------- |
| window.historyAPI | vi.fn()でメソッドをモック |
| HistoryService    | vi.fn()でメソッドをモック |
| ipcMain           | vi.mock('electron')       |
| react-router-dom  | MemoryRouterでラップ      |

---

## 3. カバレッジ目標

### 3.1 Phase 4（Red状態）

- Line: 0%（テストのみ作成、実装なし）
- Branch: 0%
- Function: 0%

### 3.2 Phase 5（Green状態）目標

- Line: 80%以上
- Branch: 60%以上
- Function: 80%以上

### 3.3 Phase 7（最終）目標

- Line: 80%以上
- Branch: 60%以上
- Function: 80%以上

---

## 4. テスト環境

### 4.1 必要なセットアップ

```typescript
// vitest.setup.ts
import { vi } from "vitest";
import "@testing-library/jest-dom";

// window.historyAPIのグローバルモック
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

Object.defineProperty(window, "historyAPI", {
  value: mockHistoryAPI,
  writable: true,
});
```

### 4.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのみ
pnpm --filter @repo/desktop test HistoryPage
pnpm --filter @repo/desktop test historyHandlers
```

---

## 確認結果

- [x] テスト対象が特定されている
- [x] テスト戦略が定義されている
- [x] カバレッジ目標が設定されている
- [x] テスト環境が設計されている

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 4で作成 |
