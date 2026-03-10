# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 4                               |
| Phase名    | テスト作成                      |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |

## 目的

Phase 2 の設計に基づき、`safeInvoke` タイムアウト機能のテストケースを TDD（テストファースト）で作成する。P13 準拠のタイマーテスト方針に従う。

## 実行タスク

- タスク1: helper 単体テストと wrapper 回帰テストの配置を決める
- タスク2: AC と重複実装解消を同時に検証できるケースを設計する
- タスク3: fake timer を使った Red テストを作成する
- タスク4: 実装前に失敗することを確認する

### タスク1: テストファイルの特定・準備

**目的**: 既存の `safeInvoke` テストファイルを特定し、テスト追加の準備を行う

**手順**:

1. `grep -rn "safeInvoke" apps/desktop/src/**/*.test.ts` で既存テストを特定
2. 既存テストの構造・モック方法を確認
3. helper を直接テスト可能にする新規テストファイルと、既存 wrapper 契約テストの回帰対象を決定

**期待される成果物**:

- テストファイルパスの特定
- 既存テスト構造の理解

### タスク2: テストケース設計

**目的**: AC-1〜AC-6 をカバーするテストケースを設計する

**テストケース一覧**:

#### グループ1: タイムアウト動作（AC-1, AC-2, AC-5）

| #   | テストケース                     | 検証内容                                                  |
| --- | -------------------------------- | --------------------------------------------------------- |
| T1  | helper タイムアウト発動テスト    | IPC が応答しない場合、IPC_TIMEOUT_MS 後に reject          |
| T2  | タイムアウトエラーメッセージ検証 | エラーメッセージに channel 名と IPC_TIMEOUT_MS が含まれる |
| T3  | IPC_TIMEOUT_MS 定数の存在確認    | 定数として定義されていることを検証                        |

#### グループ2: 正常動作（AC-3, AC-4）

| #    | テストケース               | 検証内容                                                                      |
| ---- | -------------------------- | ----------------------------------------------------------------------------- |
| T4   | helper 正常応答テスト      | IPC が即座に応答 → タイムアウトなしで resolve                                 |
| T5   | タイムアウト直前応答テスト | IPC_TIMEOUT_MS - 1ms で応答 → 正常 resolve                                    |
| T6   | チャンネル拒否テスト       | ALLOWED_INVOKE_CHANNELS 外 → 即座に reject                                    |
| T6-1 | wrapper 回帰テスト         | `index.ts` / `skill-api.ts` / `skill-creator-api.ts` が同じ helper 契約を使う |

#### グループ3: エッジケース

| #   | テストケース           | 検証内容                                                               |
| --- | ---------------------- | ---------------------------------------------------------------------- |
| T7  | IPC エラー応答テスト   | Main Process がエラーで reject → タイムアウトではなく IPC エラーが返る |
| T8  | 複数同時呼び出しテスト | 2つの safeInvoke を同時に呼び出し、各々独立してタイムアウトする        |

### タスク3: テストコード作成

**目的**: テストケースを実装する

**テスト実装方針**:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// P13準拠: fake timers を使用
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("safeInvoke timeout", () => {
  // T1: タイムアウト発動
  it("should reject with timeout error when IPC does not respond within IPC_TIMEOUT_MS", async () => {
    // ipcRenderer.invoke を never-resolving Promise でモック
    // vi.advanceTimersByTime(IPC_TIMEOUT_MS) でタイマーを進める
    // reject されることを検証
  });

  // T2: エラーメッセージ検証
  it("should include channel name in timeout error message", async () => {
    // タイムアウト発動後のエラーメッセージを検証
  });

  // T4: 正常応答
  it("should resolve normally when IPC responds before timeout", async () => {
    // ipcRenderer.invoke を即座に resolve するモック
    // 正常な戻り値を検証
  });

  // T5: タイムアウト直前応答
  it("should resolve when IPC responds just before timeout", async () => {
    // IPC_TIMEOUT_MS - 1ms で resolve するモック
    // vi.advanceTimersByTime(IPC_TIMEOUT_MS - 1) で進める
    // 正常 resolve を検証
  });

  // T7: IPC エラー応答
  it("should reject with IPC error when Main Process rejects", async () => {
    // ipcRenderer.invoke を reject するモック
    // IPC エラーが返ることを検証（タイムアウトエラーではない）
  });
});
```

**重要な注意点（P13 準拠）**:

- `vi.runAllTimers()` は**使用禁止** → `vi.advanceTimersByTime()` を使用
- `setTimeout` + `Promise` + 再スケジュールのパターンではないが、念のため `advanceTimersByTime` で1ステップずつ進める
- テスト間で状態をリセット（`beforeEach` / `afterEach`）

### タスク4: テスト実行（Red 確認）

**目的**: テストが失敗する（Red）ことを確認する

**手順**:

1. テストを実行: `cd apps/desktop && pnpm vitest run <テストファイルパス>`
2. 全テストが FAIL することを確認（まだ実装していないため）
3. 既存テストへの影響がないことを確認

## 参照資料

| 参照資料                    | パス                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Phase 1 要件定義            | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md`  |
| Phase 2 設計書              | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`        |
| Phase 3 設計レビュー        | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-3-design-review.md` |
| P13: タイマーテスト         | `.claude/rules/06-known-pitfalls.md#P13`                                                     |
| P40: テスト実行ディレクトリ | `.claude/rules/06-known-pitfalls.md#P40`                                                     |
| テスト設計ルール            | `.claude/rules/02-code-quality.md#テスト設計の注意`                                          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD実践、テストカバレッジ基準                |
| 実装パターン集            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テスト設計パターン（fake timer、モック戦略） |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload層テストのセキュリティ境界考慮        |

## 統合テスト連携

- Phase 5 で実装後、全テストが PASS（Green）になることを確認
- Phase 6 でカバレッジ不足箇所のテストを追加

## 成果物

| 成果物       | パス                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| テストコード | `apps/desktop/src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts` と既存 wrapper 契約テスト |

## 完了条件

- [ ] 既存の safeInvoke テストファイルを特定
- [ ] テストケース T1〜T8 を設計
- [ ] テストコードを実装
- [ ] テストが FAIL（Red）することを確認
- [ ] 既存テストへの影響がないことを確認
- [ ] P13 準拠（`advanceTimersByTime` 使用）を確認
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装へ進む。テストを PASS（Green）にする最小限の実装を行う。
