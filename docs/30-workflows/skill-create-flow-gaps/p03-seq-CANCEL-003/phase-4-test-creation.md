# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 3                           |
| 後続Phase  | Phase 5                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

`cancelCurrentOperation()` と `SKILL_CREATOR_CANCEL` ハンドラーを検証するテストを TDD RED 段階で作成する。2つのテストファイルを作成する。

## テストケース一覧

### SkillCreatorService テスト

| ID    | テストケース名                                                                 | 期待結果                           |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------- |
| TC-01 | cancelCurrentOperation が存在する                                              | メソッドが定義されている           |
| TC-02 | cancelCurrentOperation が currentAbortController.abort() を呼び出す            | abort() が呼ばれる                 |
| TC-03 | cancelCurrentOperation が currentAbortController を null にリセットする        | 呼び出し後に内部状態が null になる |
| TC-04 | currentAbortController が null の場合、cancelCurrentOperation が安全に動作する | 例外が発生しない                   |

### skillCreatorHandlers テスト

| ID    | テストケース名                                                      | 期待結果                                              |
| ----- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| TC-05 | SKILL_CREATOR_CANCEL ハンドラーが登録されている                     | `ipcMain.handle` が `SKILL_CREATOR_CANCEL` で呼ばれる |
| TC-06 | SKILL_CREATOR_CANCEL ハンドラーが cancelCurrentOperation を呼び出す | サービスの cancelCurrentOperation が実行される        |
| TC-07 | unregisterSkillCreatorHandlers が SKILL_CREATOR_CANCEL を解除する   | `ipcMain.removeHandler` が呼ばれる                    |

## 実行手順

### 1. SkillCreatorService テストファイル

**パス**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`

```typescript
import { SkillCreatorService } from "../SkillCreatorService";

describe("SkillCreatorService キャンセル機能", () => {
  let service: SkillCreatorService;

  beforeEach(() => {
    service = new SkillCreatorService(/* 必要な依存関係をモック */);
  });

  it("TC-01: cancelCurrentOperation メソッドが存在する", () => {
    expect(typeof service.cancelCurrentOperation).toBe("function");
  });

  it("TC-02: cancelCurrentOperation が abort() を呼び出す", () => {
    const abortSpy = vi.fn();
    // currentAbortController を設定するために createSkill を開始するか、
    // テスト用にプロパティを直接設定する
    (service as any).currentAbortController = { abort: abortSpy };
    service.cancelCurrentOperation();
    expect(abortSpy).toHaveBeenCalledOnce();
  });

  it("TC-03: cancelCurrentOperation 後に currentAbortController が null になる", () => {
    (service as any).currentAbortController = new AbortController();
    service.cancelCurrentOperation();
    expect((service as any).currentAbortController).toBeNull();
  });

  it("TC-04: currentAbortController が null の場合に安全に動作する", () => {
    expect(() => service.cancelCurrentOperation()).not.toThrow();
  });
});
```

### 2. skillCreatorHandlers テストファイル

**パス**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`

```typescript
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "@repo/shared/ipc/channels";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "../skillCreatorHandlers";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

describe("SKILL_CREATOR_CANCEL ハンドラー", () => {
  it("TC-05: SKILL_CREATOR_CANCEL ハンドラーが登録される", () => {
    registerSkillCreatorHandlers(/* 必要な引数 */);
    expect(ipcMain.handle).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
      expect.any(Function),
    );
  });

  it("TC-06: ハンドラーが cancelCurrentOperation を呼び出す", async () => {
    // cancelCurrentOperation のモック確認
  });

  it("TC-07: unregisterSkillCreatorHandlers が SKILL_CREATOR_CANCEL を解除する", () => {
    unregisterSkillCreatorHandlers();
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
    );
  });
});
```

### 3. RED 確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts
# 期待: TC-01〜TC-07 が全て FAIL
```

## 統合テスト連携【必須】

| 判定項目              | 基準 | 結果    |
| --------------------- | ---- | ------- |
| TC-01〜TC-07 作成完了 | 完了 | pending |
| RED 確認実施済み      | FAIL | pending |

## 多角的チェック観点（AIが判断）

- [ ] `SkillCreatorService` の依存関係（コンストラクタ引数）が確認されているか
- [ ] `ipcMain` のモック方法が既存テストのパターンと一致しているか
- [ ] `cancelCurrentOperation` が `public` メソッドとして設計されているか（テストから直接呼べるか）

## サブタスク管理

1. SkillCreatorService テストファイル作成（TC-01〜TC-04）
2. skillCreatorHandlers テストファイル作成（TC-05〜TC-07）
3. RED 確認実施
4. 完了条件の判定

## 成果物

| 成果物                      | パス                                                                                | 説明                |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------- |
| SkillCreatorService テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | TC-01〜TC-04（RED） |
| skillCreatorHandlers テスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | TC-05〜TC-07（RED） |

## 完了条件

- [ ] TC-01〜TC-07 が作成されている
- [ ] 実装前に全テストが FAIL（RED）することを確認済み
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
