# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 4                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。preload APIの存在確認とIPC呼び出しテストを作成する。

---

## 実行タスク

| タスク            | 責務                                             |
| ----------------- | ------------------------------------------------ |
| API存在テスト作成 | window.historyAPIの各メソッド存在確認テスト      |
| IPC呼び出しテスト | ipcRenderer.invokeが正しく呼び出されるかのテスト |
| 型チェックテスト  | TypeScript型定義の整合性テスト                   |

---

## 参照資料

| 資料名       | パス                                      | 説明          |
| ------------ | ----------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md`  | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> テスト設計時に必ず以下のシステム仕様を確認してください。

| 参照資料                  | パス                                                                         | 内容                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "historyAPI"`

---

## 実行手順

### 1. テストシナリオ設計

#### API存在確認テスト

```typescript
// apps/desktop/src/preload/__tests__/historyAPI.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("historyAPI", () => {
  describe("API existence", () => {
    it("should expose historyAPI on window object", () => {
      expect(window.historyAPI).toBeDefined();
    });

    it("should have getFileHistory method", () => {
      expect(typeof window.historyAPI?.getFileHistory).toBe("function");
    });

    it("should have getVersionDetail method", () => {
      expect(typeof window.historyAPI?.getVersionDetail).toBe("function");
    });

    it("should have getConversionLogs method", () => {
      expect(typeof window.historyAPI?.getConversionLogs).toBe("function");
    });

    it("should have restoreVersion method", () => {
      expect(typeof window.historyAPI?.restoreVersion).toBe("function");
    });
  });
});
```

### 2. IPC呼び出しテスト

```typescript
describe("historyAPI IPC calls", () => {
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // ipcRenderer.invokeをモック
    vi.mock("electron", () => ({
      ipcRenderer: {
        invoke: mockInvoke,
      },
      contextBridge: {
        exposeInMainWorld: vi.fn(),
      },
    }));
  });

  it("should call ipcRenderer.invoke with correct channel for getFileHistory", async () => {
    const fileId = "test-file-id";
    const options = { limit: 10, offset: 0 };

    await window.historyAPI?.getFileHistory(fileId, options);

    expect(mockInvoke).toHaveBeenCalledWith(
      "history:getFileHistory",
      fileId,
      options,
    );
  });

  it("should call ipcRenderer.invoke with correct channel for getVersionDetail", async () => {
    const conversionId = "test-conversion-id";

    await window.historyAPI?.getVersionDetail(conversionId);

    expect(mockInvoke).toHaveBeenCalledWith(
      "history:getVersionDetail",
      conversionId,
    );
  });

  it("should call ipcRenderer.invoke with correct channel for getConversionLogs", async () => {
    const conversionId = "test-conversion-id";
    const options = { level: "error" as const };

    await window.historyAPI?.getConversionLogs(conversionId, options);

    expect(mockInvoke).toHaveBeenCalledWith(
      "history:getConversionLogs",
      conversionId,
      options,
    );
  });

  it("should call ipcRenderer.invoke with correct channel for restoreVersion", async () => {
    const fileId = "test-file-id";
    const conversionId = "test-conversion-id";

    await window.historyAPI?.restoreVersion(fileId, conversionId);

    expect(mockInvoke).toHaveBeenCalledWith(
      "history:restoreVersion",
      fileId,
      conversionId,
    );
  });
});
```

### 3. 型チェックテスト

```typescript
describe("historyAPI type safety", () => {
  it("should return Promise from getFileHistory", () => {
    const result = window.historyAPI?.getFileHistory("file-id");
    expect(result).toBeInstanceOf(Promise);
  });

  it("should accept optional pagination options", async () => {
    // オプションなしで呼び出し可能
    await window.historyAPI?.getFileHistory("file-id");

    // オプションありで呼び出し可能
    await window.historyAPI?.getFileHistory("file-id", { limit: 20 });
  });
});
```

---

## 統合テストシナリオ設計【必須】

preload API存在確認テストシナリオを5カテゴリで設計:

| シナリオカテゴリ   | 検証内容                                                    | テストファイル       |
| ------------------ | ----------------------------------------------------------- | -------------------- |
| API接続テスト      | window.historyAPI存在・メソッド存在確認・ipcRenderer.invoke | `historyAPI.test.ts` |
| データフローテスト | Renderer → preload → ipcRenderer.invoke → IPCハンドラー     | `historyAPI.test.ts` |
| エラーハンドリング | IPC失敗時のResult<T>エラー返却・タイムアウト処理            | `historyAPI.test.ts` |
| 認証連携テスト     | N/A（履歴APIは認証不要）                                    | -                    |
| 状態同期テスト     | N/A（履歴APIは同期的リクエスト/レスポンス）                 | -                    |

---

## 統合テスト連携【必須】

preload API存在確認テストシナリオを作成:

| シナリオカテゴリ  | 検証内容                                | テストファイル       |
| ----------------- | --------------------------------------- | -------------------- |
| API接続テスト     | window.historyAPI存在・メソッド存在確認 | `historyAPI.test.ts` |
| IPC呼び出しテスト | ipcRenderer.invokeの正しい呼び出し      | `historyAPI.test.ts` |
| 型チェックテスト  | TypeScript型の整合性                    | `historyAPI.test.ts` |

---

## 成果物

| 成果物         | パス                                                    | 説明         |
| -------------- | ------------------------------------------------------- | ------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                 | テスト設計   |
| テストケース   | `outputs/phase-4/test-cases.md`                         | ケース一覧   |
| テストファイル | `apps/desktop/src/preload/__tests__/historyAPI.test.ts` | テストコード |

---

## 完了条件

- [ ] API存在確認テスト（5ケース）が作成されている
- [ ] IPC呼び出しテスト（4ケース）が作成されている
- [ ] 型チェックテスト（2ケース）が作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
