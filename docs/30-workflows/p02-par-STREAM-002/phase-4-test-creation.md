# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| 作成日     | 2026-04-15                             |
| ステータス | completed                              |

## 目的

TDD の Red フェーズとして、`SKILL_CREATOR_CREATE` ハンドラーのコールバック接続テストを
実装前に作成する。Phase 5 の実装でこれらが Green になることを目標とする。

## 実行タスク

- テストファイルの作成（新規）: `skillCreatorHandlers.progress.test.ts`
- 正常系テストケースの作成（TC-01〜TC-04）
- 異常系テストケースの作成（TC-05〜TC-06）
- 回帰テストの作成（TC-07〜TC-08）
- TDD Red 確認（実装前に FAIL することを確認）

## 参照資料

| 資料名                  | パス                                                                                  | 用途               |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計書          | `outputs/phase-2/design.md`                                                           | テスト設計の根拠   |
| Phase 1 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`                                              | AC 参照            |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                   | テスト対象ファイル |
| STREAM-001 テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | テストパターン参照 |

## テストケース一覧

### 正常系テストケース

| TC ID | テスト名                                                     | 検証内容                                                                                      | AC         |
| ----- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------- |
| TC-01 | コールバックが呼ばれると sendSkillCreatorProgress が発火する | `onProgress` コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` が呼ばれること | AC-1, AC-2 |
| TC-02 | planning フェーズの進捗が正しく送信される                    | `{ phase: "planning", percentage: 10 }` で `sendSkillCreatorProgress` が呼ばれること          | AC-2       |
| TC-03 | done フェーズの進捗が正しく送信される                        | `{ phase: "done", percentage: 100 }` で `sendSkillCreatorProgress` が呼ばれること             | AC-2       |
| TC-04 | createSkill の結果が正しく返される                           | コールバック接続後も `skillDir` が正しく返ること                                              | AC-1       |

### 異常系テストケース

| TC ID | テスト名                                             | 検証内容                                                            | AC   |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------------- | ---- |
| TC-05 | mainWindow が破壊済みの場合に IPC 送信をスキップする | `mainWindow.isDestroyed()` が true の場合に `send` が呼ばれないこと | AC-2 |
| TC-06 | createSkill がエラーの場合にエラーレスポンスを返す   | `createSkill` が reject した場合にエラーが正しく返ること            | AC-1 |

### 回帰テストケース

| TC ID | テスト名                                       | 検証内容                                                       | AC   |
| ----- | ---------------------------------------------- | -------------------------------------------------------------- | ---- |
| TC-07 | 既存のバリデーションテストが引き続き PASS する | `skillCreatorHandlers.validation.test.ts` の全テストが回帰なし | AC-1 |
| TC-08 | 既存の統合テストが引き続き PASS する           | `skillCreatorIpc.integration.test.ts` の全テストが回帰なし     | AC-1 |

## 実行手順

### 0. TDD Red 確認（テスト作成前の状態確認）

```bash
# 既存テストが PASS していることを確認（baseline）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
```

### 1. テストファイルの作成

**ファイルパス**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
// skillCreatorHandlers のテストセットアップをインポート

describe("SKILL_CREATOR_CREATE ハンドラー - onProgress コールバック配線", () => {
  // モックのセットアップ
  const mockSendSkillCreatorProgress = vi.fn();
  const mockCreateSkill = vi.fn();
  const mockMainWindow = {
    isDestroyed: vi.fn().mockReturnValue(false),
    webContents: { send: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TC-01: コールバックが呼ばれると sendSkillCreatorProgress が発火する", () => {
    it("onProgress コールバック内で sendSkillCreatorProgress が呼ばれること", async () => {
      // onProgress が呼ばれた際に sendSkillCreatorProgress が実行されることを検証
      // 実装: TDD Red フェーズ（現時点では FAIL）
    });
  });

  describe("TC-02: planning フェーズの進捗が正しく送信される", () => {
    it("planning フェーズのデータで sendSkillCreatorProgress が呼ばれること", async () => {
      // { phase: "planning", percentage: 10 } で呼ばれることを検証
    });
  });

  describe("TC-03: done フェーズの進捗が正しく送信される", () => {
    it("done フェーズのデータで sendSkillCreatorProgress が呼ばれること", async () => {
      // { phase: "done", percentage: 100 } で呼ばれることを検証
    });
  });

  describe("TC-04: createSkill の結果が正しく返される", () => {
    it("コールバック接続後も skillDir が正しく返ること", async () => {
      // createSkill の戻り値が変わらないことを検証
    });
  });

  describe("TC-05: mainWindow が破壊済みの場合に IPC 送信をスキップする", () => {
    it("isDestroyed() が true の場合に send が呼ばれないこと", async () => {
      // sendSkillCreatorProgress 内の isDestroyed チェックを検証
    });
  });

  describe("TC-06: createSkill がエラーの場合にエラーレスポンスを返す", () => {
    it("createSkill が reject した場合にエラーレスポンスが返ること", async () => {
      // エラー時の動作が変わらないことを検証
    });
  });
});
```

### 2. TDD Red 確認

```bash
# 作成したテストが FAIL することを確認（Red 状態）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# 期待: FAIL（コールバック未接続のため）

# 既存テストが PASS していることを確認（回帰なし）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: PASS（既存テストは影響なし）
```

## 統合テスト連携【必須】

ハンドラー統合テストシナリオを全カテゴリで作成。

| 判定項目                | 基準               | 結果    |
| ----------------------- | ------------------ | ------- |
| TC-01〜TC-08 の作成完了 | 全TC作成済み       | pending |
| TDD Red 確認            | FAIL を再現済み    | pending |
| 既存テスト PASS 確認    | 回帰なしを確認済み | pending |

## 多角的チェック観点

| 観点       | チェック内容                                                                |
| ---------- | --------------------------------------------------------------------------- |
| TDD 原則   | テストが実装前に作成されており、Red 状態（FAIL）であることを確認済みか      |
| AC 対応    | TC-01〜TC-08 が AC-1〜AC-4 を網羅しているか                                 |
| モック設計 | `sendSkillCreatorProgress` と `mainWindow` が過不足なくモック化されているか |
| 回帰テスト | 既存テスト（TC-07・TC-08）が回帰なしで PASS することを確認しているか        |

## 成果物

| 成果物         | パス                                                                        | 説明                             |
| -------------- | --------------------------------------------------------------------------- | -------------------------------- |
| テストスイート | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | TC-01〜TC-08（TDD Red フェーズ） |

## 完了条件

- [ ] `skillCreatorHandlers.progress.test.ts` が作成済み
- [ ] TC-01〜TC-06 の正常系・異常系テストケースが実装済み
- [ ] TC-07〜TC-08 の回帰テストが実装済み
- [ ] TDD Red 確認済み（作成テストが FAIL すること）
- [ ] 既存テストが PASS していること（baseline 確認）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. baseline 確認（既存テスト PASS）
2. テストファイル作成（`skillCreatorHandlers.progress.test.ts`）
3. TC-01〜TC-04 正常系テスト実装
4. TC-05〜TC-06 異常系テスト実装
5. TC-07〜TC-08 回帰テスト実装
6. TDD Red 確認（FAIL を確認）
7. 成果物確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 5: 実装
