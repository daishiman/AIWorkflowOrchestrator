# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 4                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 2 の設計に基づき、TDD の Red フェーズとして `safeRegister` ヘルパー関数と `registerAllIpcHandlers` の Graceful Degradation 動作を検証するテストコードを作成する。

## 実行タスク

- テストケース設計: 正常系・異常系・境界値のテストケースを設計する
- テストコード作成: Vitest でテストファイルを作成する
- モック設計: `registerXxxHandlers` 関数群のモックを設計する

## 参照資料

| 資料名                     | パス                                         | 説明           |
| -------------------------- | -------------------------------------------- | -------------- |
| 設計書                     | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| IPC index                  | `apps/desktop/src/main/ipc/index.ts`         | テスト対象     |
| 落とし穴                   | `.claude/rules/06-known-pitfalls.md`         | P9, P13, P40   |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義               | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| 型定義設計                 | `outputs/phase-2/type-definitions.md`        | Phase 2 成果物 |
| シーケンス図               | `outputs/phase-2/sequence-diagram.md`        | Phase 2 成果物 |
| レビュー結果               | `outputs/phase-3/design-review.md`           | Phase 3 成果物 |
| トレーサビリティマトリクス | `outputs/phase-3/traceability-matrix.md`     | Phase 3 成果物 |

### システム仕様（aiworkflow-requirements）

- `error-handling.md`: エラーカテゴリ定義（テストの期待値として使用）
- `api-ipc-system.md`: IPC チャンネル一覧（モック対象の確認）

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: テストケース設計

| テストID | カテゴリ | テスト名                                               | 検証内容                                      |
| -------- | -------- | ------------------------------------------------------ | --------------------------------------------- |
| T-01     | 正常系   | 全ハンドラが正常に登録される                           | successCount が全ハンドラ数と一致             |
| T-02     | 正常系   | 戻り値の failures が空配列                             | failures.length === 0                         |
| T-03     | 異常系   | 1つのハンドラが例外を投げても後続が登録される          | 後続ハンドラの呼び出しが確認できる            |
| T-04     | 異常系   | 失敗情報が戻り値に含まれる                             | failures にハンドラ名とエラーメッセージがある |
| T-05     | 異常系   | 複数のハンドラが失敗した場合に全て記録される           | failures.length が失敗数と一致                |
| T-06     | 異常系   | Error 以外の例外（文字列）が投げられた場合も捕捉される | "Unknown error" がフォールバック              |
| T-07     | 境界値   | 先頭のハンドラが失敗した場合                           | 2番目以降が全て登録される                     |
| T-08     | 境界値   | 末尾のハンドラが失敗した場合                           | 先行ハンドラは全て登録済み                    |
| T-09     | 境界値   | 全ハンドラが失敗した場合                               | failureCount が全ハンドラ数と一致             |
| T-10     | ログ     | 失敗時に console.error が呼ばれる                      | console.error のモック検証                    |
| T-11     | ログ     | 全成功時に warn が呼ばれない                           | console.warn が未呼び出し                     |
| T-12     | 結合     | unregister → register の再登録フローが動作する         | 2回目の register で成功する                   |

### ステップ2: テストファイル作成

テストファイルのパス: `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`

```typescript
// テスト構造（スケルトン）
import { describe, it, expect, vi, beforeEach } from "vitest";

// 全 registerXxxHandlers をモック化
vi.mock("../fileHandlers", () => ({ registerFileHandlers: vi.fn() }));
vi.mock("../storeHandlers", () => ({ registerStoreHandlers: vi.fn() }));
// ... 約30個のモジュールモック

describe("registerAllIpcHandlers - Graceful Degradation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("T-01: 全ハンドラが正常に登録される", () => {
      /* ... */
    });
    it("T-02: 戻り値の failures が空配列", () => {
      /* ... */
    });
  });

  describe("異常系", () => {
    it("T-03: 1つのハンドラが例外を投げても後続が登録される", () => {
      /* ... */
    });
    it("T-04: 失敗情報が戻り値に含まれる", () => {
      /* ... */
    });
    it("T-05: 複数のハンドラが失敗した場合に全て記録される", () => {
      /* ... */
    });
    it("T-06: Error以外の例外も捕捉される", () => {
      /* ... */
    });
  });

  describe("境界値", () => {
    it("T-07: 先頭のハンドラが失敗した場合", () => {
      /* ... */
    });
    it("T-08: 末尾のハンドラが失敗した場合", () => {
      /* ... */
    });
    it("T-09: 全ハンドラが失敗した場合", () => {
      /* ... */
    });
  });

  describe("ログ出力", () => {
    it("T-10: 失敗時にconsole.errorが呼ばれる", () => {
      /* ... */
    });
    it("T-11: 全成功時にwarnが呼ばれない", () => {
      /* ... */
    });
  });

  describe("再登録フロー", () => {
    it("T-12: unregister → register の再登録が動作する", () => {
      /* ... */
    });
  });
});
```

### ステップ3: safeRegister 単体テスト

テストファイルのパス: `apps/desktop/src/main/ipc/__tests__/safe-register.test.ts`

```typescript
describe("safeRegister", () => {
  it("正常な関数を実行して true を返す", () => {
    /* ... */
  });
  it("例外を投げる関数を実行して false を返し、failures に追加する", () => {
    /* ... */
  });
  it("Error オブジェクトの message を使用する", () => {
    /* ... */
  });
  it("文字列例外の場合 'Unknown error' を使用する", () => {
    /* ... */
  });
  it("errorCode が 4001 である", () => {
    /* ... */
  });
});
```

## 統合テスト連携

- T-12（再登録フロー）で `unregisterAllIpcHandlers` → `registerAllIpcHandlers` の統合動作を検証する
- モックの設計で `ipcMain.handle` / `ipcMain.removeHandler` の呼び出し回数を検証する

## 多角的チェック観点

| 観点               | チェック内容                                          |
| ------------------ | ----------------------------------------------------- |
| エラーハンドリング | Error 以外の例外型（string, undefined）への対応テスト |
| アーキテクチャ     | モック設計が実際の依存関係を正確に反映しているか      |

## 成果物

| 成果物                      | パス                                                                   | 説明                 |
| --------------------------- | ---------------------------------------------------------------------- | -------------------- |
| Graceful Degradation テスト | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | メインテストファイル |
| safeRegister テスト         | `apps/desktop/src/main/ipc/__tests__/safe-register.test.ts`            | ヘルパー関数テスト   |
| テスト設計書                | `outputs/phase-4/test-design.md`                                       | テストケース一覧     |

## 完了条件

- [ ] テストケース T-01〜T-12 が設計されている
- [ ] `ipc-graceful-degradation.test.ts` が作成されている
- [ ] `safe-register.test.ts` が作成されている
- [ ] 全テストが Red（実装前のため失敗）の状態であることを確認
- [ ] モック設計が約30個の `registerXxxHandlers` をカバーしている
- [ ] P9（テスト間リーク）対策として `beforeEach` で状態リセットしている
- [ ] P40対策として `apps/desktop` ディレクトリからのテスト実行を確認
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
