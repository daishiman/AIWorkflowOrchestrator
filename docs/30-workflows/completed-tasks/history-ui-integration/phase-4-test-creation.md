# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成             |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。TDD原則に従い、テストファーストで開発を進める。

## 背景

Phase 3のレビューを通過した設計に基づき、統合テストとユニットテストを作成する。既存のUIコンポーネント（VersionHistory等）のテストは完了済み（カバレッジ94.43%）なので、統合部分のテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストシナリオ設計

**目的**: 受け入れ基準からテストシナリオを導出

**実行手順**:

1. Phase 1の受け入れ基準を確認
2. 各機能に対するテストシナリオを設計
3. 正常系・異常系・境界値を網羅

**期待される成果物**:

- テストシナリオ一覧

**テストシナリオ**:

| シナリオID | カテゴリ | シナリオ                               | 期待結果                                 |
| ---------- | -------- | -------------------------------------- | ---------------------------------------- |
| TS-01      | 正常系   | HistoryPageが正しくレンダリングされる  | VersionHistoryコンポーネントが表示される |
| TS-02      | 正常系   | バージョン選択で詳細パネルが表示される | VersionDetailコンポーネントが表示される  |
| TS-03      | 正常系   | 復元ボタンでダイアログが表示される     | RestoreDialogが表示される                |
| TS-04      | 正常系   | 復元確認でrestoreVersionが呼ばれる     | IPCが正しく呼び出される                  |
| TS-05      | 異常系   | historyAPI未定義時にエラー表示         | エラーメッセージが表示される             |
| TS-06      | 異常系   | IPC通信エラー時にエラー表示            | エラーメッセージが表示される             |

---

### タスク2: HistoryPage統合テスト作成

**目的**: HistoryPageコンポーネントのテストを作成

**実行手順**:

1. テストファイルを作成
2. historyAPIのモックを設定
3. レンダリングテストを作成
4. インタラクションテストを作成

**期待される成果物**:

- HistoryPage.test.tsx

**テストコード**:

```typescript
// apps/desktop/src/renderer/pages/__tests__/HistoryPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryPage } from '../HistoryPage';

// historyAPIのモック
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.historyAPI = mockHistoryAPI;
  });

  describe('レンダリング', () => {
    it('VersionHistoryコンポーネントが表示される', async () => {
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
    });
  });

  describe('バージョン選択', () => {
    it('バージョン選択で詳細パネルが表示される', async () => {
      const mockVersion = {
        conversionId: 'conv-1',
        fileId: 'file-1',
        version: 1,
        createdAt: '2026-01-10T00:00:00Z',
        size: 1024,
        mimeType: 'text/plain',
        hash: 'abc123',
        isLatest: true,
      };

      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [mockVersion], total: 1, hasMore: false },
      });

      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: { ...mockVersion, logs: [] },
      });

      render(<HistoryPage />);

      await waitFor(() => {
        const versionItem = screen.getByText(/v1/);
        fireEvent.click(versionItem);
      });

      await waitFor(() => {
        expect(mockHistoryAPI.getVersionDetail).toHaveBeenCalledWith('conv-1');
      });
    });
  });

  describe('復元機能', () => {
    it('復元ボタンでダイアログが表示される', async () => {
      // テスト実装
    });

    it('復元確認でrestoreVersionが呼ばれる', async () => {
      // テスト実装
    });
  });

  describe('エラーハンドリング', () => {
    it('historyAPI未定義時にエラー表示', async () => {
      window.historyAPI = undefined as any;
      render(<HistoryPage />);
      expect(screen.getByText(/History API not available/)).toBeInTheDocument();
    });

    it('IPC通信エラー時にエラー表示', async () => {
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: false,
        error: { message: '通信エラー' },
      });

      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
```

---

### タスク3: IPCハンドラーユニットテスト作成

**目的**: historyHandlersのユニットテストを作成

**実行手順**:

1. テストファイルを作成
2. HistoryServiceのモックを設定
3. 各ハンドラーの正常系・異常系テストを作成

**期待される成果物**:

- historyHandlers.test.ts

**テストコード**:

```typescript
// apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { registerHistoryHandlers } from "../historyHandlers";
import type { HistoryService } from "../../services/HistoryService";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("historyHandlers", () => {
  let mockHistoryService: HistoryService;
  let handlers: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    (ipcMain.handle as any).mockImplementation(
      (channel: string, handler: Function) => {
        handlers.set(channel, handler);
      },
    );

    mockHistoryService = {
      getFileHistory: vi.fn(),
      getVersionDetail: vi.fn(),
      getConversionLogs: vi.fn(),
      restoreVersion: vi.fn(),
    } as any;

    registerHistoryHandlers(mockHistoryService);
  });

  describe("history:getFileHistory", () => {
    it("正常系: 履歴一覧を返す", async () => {
      const mockResult = { items: [], total: 0, hasMore: false };
      (mockHistoryService.getFileHistory as any).mockResolvedValue(mockResult);

      const handler = handlers.get("history:getFileHistory");
      const result = await handler({}, "file-1", { limit: 20 });

      expect(result).toEqual({ success: true, data: mockResult });
      expect(mockHistoryService.getFileHistory).toHaveBeenCalledWith("file-1", {
        limit: 20,
      });
    });

    it("異常系: エラー時はerrorを返す", async () => {
      (mockHistoryService.getFileHistory as any).mockRejectedValue(
        new Error("DB Error"),
      );

      const handler = handlers.get("history:getFileHistory");
      const result = await handler({}, "file-1", {});

      expect(result).toEqual({
        success: false,
        error: { message: "DB Error" },
      });
    });
  });

  describe("history:getVersionDetail", () => {
    it("正常系: バージョン詳細を返す", async () => {
      // テスト実装
    });
  });

  describe("history:getConversionLogs", () => {
    it("正常系: 変換ログを返す", async () => {
      // テスト実装
    });
  });

  describe("history:restoreVersion", () => {
    it("正常系: 復元結果を返す", async () => {
      // テスト実装
    });
  });
});
```

---

### タスク4: 統合テストシナリオ作成

**目的**: フロント→API→DB→API→フロントの統合テストを設計

**実行手順**:

1. 統合テストシナリオを設計
2. テストファイルを作成（Red状態）
3. MSWまたはモックを使用した統合テストを作成

**期待される成果物**:

- 統合テスト仕様書
- 統合テストファイル

---

## 参照資料

| 参照資料                 | パス                                                                       | 内容           |
| ------------------------ | -------------------------------------------------------------------------- | -------------- |
| 設計レビュー結果         | `outputs/phase-3/design-review-result.md`                                  | Phase 3成果物  |
| 履歴UI仕様               | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | テスト仕様参考 |
| 既存コンポーネントテスト | `apps/desktop/src/renderer/components/history/__tests__/`                  | テスト実装参考 |

---

## 成果物

| 成果物              | パス                                                             | 内容               |
| ------------------- | ---------------------------------------------------------------- | ------------------ |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                          | テスト設計         |
| テストケース        | `outputs/phase-4/test-cases.md`                                  | ケース一覧         |
| 統合テスト設計      | `outputs/phase-4/integration-test-design.md`                     | 統合テスト設計     |
| HistoryPageテスト   | `apps/desktop/src/renderer/pages/__tests__/HistoryPage.test.tsx` | 実際のテストコード |
| IPCハンドラーテスト | `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts`    | 実際のテストコード |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                | テストファイル    |
| ------------------ | --------------------------------------- | ----------------- |
| IPC接続テスト      | 4チャンネルの疎通・レスポンス形式       | `*.ipc.test.ts`   |
| データフローテスト | Renderer→preload→Main→Service→DBの往復  | `*.flow.test.ts`  |
| エラーハンドリング | IPC障害時のフロントエンド表示・リトライ | `*.error.test.ts` |
| 状態同期テスト     | 復元後のUI更新                          | `*.sync.test.ts`  |

---

## 完了条件

- [ ] テストシナリオが設計されている
- [ ] HistoryPageのテストが作成されている
- [ ] IPCハンドラーのテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. テストシナリオ設計
2. HistoryPage統合テスト作成
3. IPCハンドラーユニットテスト作成
4. 統合テストシナリオ作成
5. テストが失敗状態（Red）であることを確認
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 4
```

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-5-implementation.md`
