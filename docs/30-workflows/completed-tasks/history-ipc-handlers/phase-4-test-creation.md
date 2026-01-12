# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 4                    |
| Phase名    | テスト作成           |
| 前提Phase  | Phase 3              |
| 後続Phase  | Phase 5              |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

TDDのRedフェーズとして、期待される動作を検証するテストを実装より先に作成する。
テストは全て失敗状態（Red）であることを確認する。

## 背景

Test-Driven Development（TDD）の原則に従い、実装前にテストを作成する。
これにより、明確な目標を持って実装に取り組むことができる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイルの作成

**目的**: IPCハンドラーのテストファイルを作成する。

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts` を作成する
2. テストの基本構造（describe/it）を設定する
3. 必要なモック設定を準備する

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts`（テストファイル）

---

### タスク2: ユニットテストの作成

**目的**: 各IPCハンドラーのユニットテストを作成する。

**実行手順**:

1. `history:getFileHistory` ハンドラーのテストを作成する
   - 正常系: 履歴データを正しく返却する
   - 異常系: エラー時にResult型でエラーを返却する
2. `history:getVersionDetail` ハンドラーのテストを作成する
   - 正常系: バージョン詳細を正しく返却する
   - 異常系: 存在しないIDでエラーを返却する
3. `history:getConversionLogs` ハンドラーのテストを作成する
   - 正常系: ログデータを正しく返却する
   - 正常系: フィルタオプションが正しく適用される
4. `history:restoreVersion` ハンドラーのテストを作成する
   - 正常系: バージョン復元が成功する
   - 異常系: 復元失敗時にエラーを返却する

**期待される成果物**:

- ユニットテストコード（上記ハンドラー各4〜6ケース）

---

### タスク3: 統合テストシナリオの作成

**目的**: IPC統合テストのシナリオを作成する。

**実行手順**:

1. API接続テストシナリオを作成する
   - IPCチャンネルの疎通確認
   - レスポンス形式の検証
2. データフローテストシナリオを作成する
   - Renderer → Main → HistoryService の流れ
3. エラーハンドリングテストシナリオを作成する
   - HistoryService障害時のエラー伝播
4. 境界値テストシナリオを作成する
   - 空のfileId、無効なconversionId
5. `outputs/phase-4/integration-test-scenarios.md` に記録する

**期待される成果物**:

- `outputs/phase-4/integration-test-scenarios.md`（統合テストシナリオ）

---

### タスク4: テスト失敗の確認（Red状態）

**目的**: 全てのテストが失敗することを確認する。

**実行手順**:

1. `pnpm --filter @repo/desktop test` を実行する
2. 全てのテストが失敗（Red）であることを確認する
3. 失敗理由が「実装がない」ことを確認する
4. `outputs/phase-4/red-state-confirmation.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-4/red-state-confirmation.md`（Red状態確認結果）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                          |
| ------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`  | IPCチャンネル名・データ型定義 |
| テスト戦略          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト方針                    |

---

## 成果物

| 成果物             | パス                                                          | 内容                |
| ------------------ | ------------------------------------------------------------- | ------------------- |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts` | IPCハンドラーテスト |
| 統合テストシナリオ | `outputs/phase-4/integration-test-scenarios.md`               | 統合テストの設計    |
| Red状態確認結果    | `outputs/phase-4/red-state-confirmation.md`                   | テスト失敗の確認    |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 4での統合テスト連携アクション

IPC統合テストシナリオを作成すること（正常系/異常系/タイムアウト）。

| テストカテゴリ     | 検証項目                                |
| ------------------ | --------------------------------------- |
| API接続テスト      | IPCチャンネル疎通・レスポンス形式       |
| データフローテスト | Renderer → Main → HistoryService の往復 |
| エラーハンドリング | HistoryService障害時のエラー伝播        |
| 境界値テスト       | 空文字列・null・undefined の処理        |

---

## 完了条件

- [ ] テストファイルが作成された
- [ ] 4つのIPCハンドラーのユニットテストが作成された
- [ ] 統合テストシナリオが定義された
- [ ] 全てのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定された
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## テストコード例（参考）

```typescript
// historyHandlers.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { registerHistoryHandlers } from "../historyHandlers";

// Mock
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("historyHandlers", () => {
  const mockHistoryService = {
    getFileHistory: vi.fn(),
    getVersionDetail: vi.fn(),
    getConversionLogs: vi.fn(),
    restoreVersion: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerHistoryHandlers", () => {
    it("should register 4 IPC handlers", () => {
      registerHistoryHandlers(mockHistoryService);
      expect(ipcMain.handle).toHaveBeenCalledTimes(4);
    });
  });

  describe("history:getFileHistory", () => {
    it("should return file history successfully", async () => {
      // テスト実装
    });

    it("should return error result on failure", async () => {
      // テスト実装
    });
  });

  // ... 他のハンドラーのテスト
});
```

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1（テストファイルの作成）: [結果を記入]
- タスク2（ユニットテストの作成）: [結果を記入]
- タスク3（統合テストシナリオの作成）: [結果を記入]
- タスク4（テスト失敗の確認）: [結果を記入]

### TDD状態

- Red状態: [確認済み/未確認]
- テストケース数: [N]件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ipc-handlers/phase-5-implementation.md`
