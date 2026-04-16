# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 3（PASS または MINOR）            |
| 後続Phase  | Phase 5                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

## 目的

TDD の Red 段階として、`createSkill()` のコールバック引数追加に対するテストを先に作成する。
実装前にテストが失敗することを確認し、5段階の進捗通知が正しく呼び出されることの期待値を明確化する。

## 実行タスク

- 事前確認: 既存テストファイルの構造・重複実装の確認
- テストマトリクス定義: TC-01〜TC-08 のテストケース定義
- テストファイルの作成: `SkillCreatorService.progress.test.ts`（新規）
- 既存テストとの共存確認
- Red 確認: 実装前にテストが FAIL することを確認

## 参照資料

| 資料名                 | パス                                                                          | 用途                 |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                                   | インターフェース参照 |
| Phase 3 レビュー結果   | `outputs/phase-3/gate-decision.md`                                            | MINOR 指摘確認       |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                 | 現行実装確認         |
| 既存テスト             | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | 既存回帰テスト確認   |

## 実行手順

### 0. 事前確認: 既存テスト構造の調査（必須）

```bash
# SkillCreatorService の既存テストファイル確認
ls apps/desktop/src/main/services/skill/__tests__/ 2>/dev/null || echo "テストディレクトリなし"

# onProgress / SkillCreatorProgressData の既存実装確認
grep -rn "onProgress\|SkillCreatorProgressData\|SkillCreatorProgressCallback" apps/desktop/src/main/

# createSkill のモックパターン確認
grep -rn "createSkill" apps/desktop/src/main/ipc/__tests__/
```

### 1. テストマトリクス定義

**テストファイルパス**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`（新規作成）

| TC番号 | テスト名                                                       | 対象                                             | 期待値                                                  |
| ------ | -------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| TC-01  | `onProgress が "planning" フェーズで呼ばれること`              | `createSkill` 呼び出し時の `onProgress` 1回目    | `{ phase: "planning", percentage: 10, ... }` で呼ばれる |
| TC-02  | `onProgress が "generating-skill" フェーズで呼ばれること`      | `createSkill` 呼び出し時の `onProgress` 2回目    | `{ phase: "generating-skill", percentage: 40, ... }`    |
| TC-03  | `onProgress が "generating-agents" フェーズで呼ばれること`     | `createSkill` 呼び出し時の `onProgress` 3回目    | `{ phase: "generating-agents", percentage: 70, ... }`   |
| TC-04  | `onProgress が "validating" フェーズで呼ばれること`            | `createSkill` 呼び出し時の `onProgress` 4回目    | `{ phase: "validating", percentage: 90, ... }`          |
| TC-05  | `onProgress が "done" フェーズで呼ばれること`                  | `createSkill` 呼び出し時の `onProgress` 5回目    | `{ phase: "done", percentage: 100, ... }`               |
| TC-06  | `onProgress が合計5回呼ばれること`                             | `createSkill` 完了後の `onProgress` 呼び出し回数 | `expect(onProgress).toHaveBeenCalledTimes(5)`           |
| TC-07  | `onProgress が未指定の場合でも createSkill が正常完了すること` | `onProgress` なしで `createSkill` 呼び出し       | エラーなく完了し戻り値がスキルディレクトリパス          |
| TC-08  | `onProgress のフェーズが planning→done の順序で呼ばれること`   | 呼び出し順序の検証                               | `toHaveBeenNthCalledWith` で順序確認                    |

### 2. テストコードスケルトン

作成先: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SkillCreatorService } from "../SkillCreatorService";

// 依存モジュールのモック（実際のファイルパスに合わせて調整）
vi.mock("../../../infrastructure/ResourceLoader");
vi.mock("../../../infrastructure/ScriptExecutor");

describe("SkillCreatorService.createSkill - 進捗コールバック", () => {
  let service: SkillCreatorService;
  let onProgress: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // service = new SkillCreatorService(...依存モック...);
    onProgress = vi.fn();
  });

  describe("正常系: コールバックが指定された場合", () => {
    it('onProgress が "planning" フェーズで呼ばれること (AC-2)', async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "planning", percentage: 10 }),
      );
    });

    it('onProgress が "generating-skill" フェーズで呼ばれること (AC-3)', async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "generating-skill", percentage: 40 }),
      );
    });

    it('onProgress が "generating-agents" フェーズで呼ばれること (AC-3)', async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: "generating-agents",
          percentage: 70,
        }),
      );
    });

    it('onProgress が "validating" フェーズで呼ばれること (AC-3)', async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "validating", percentage: 90 }),
      );
    });

    it('onProgress が "done" フェーズで呼ばれること (AC-3)', async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "done", percentage: 100 }),
      );
    });

    it("onProgress が合計5回呼ばれること", async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenCalledTimes(5);
    });

    it("onProgress のフェーズが planning→done の順序で呼ばれること", async () => {
      // await service.createSkill(validOptions, onProgress);
      expect(onProgress).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ phase: "planning" }),
      );
      expect(onProgress).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({ phase: "done" }),
      );
    });
  });

  describe("正常系: コールバックが未指定の場合 (AC-4)", () => {
    it("onProgress が未指定でも createSkill が正常完了すること", async () => {
      // const result = await service.createSkill(validOptions);
      // expect(result).toBeTruthy(); // スキルディレクトリパスが返る
    });
  });
});
```

### 3. Red 確認コマンド（実装前にテストが失敗することを確認）

```bash
# 新規テストファイルを実行（実装前なので FAIL が期待される）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
# 期待: FAIL（onProgress コールバック引数が未実装）
```

### 4. 既存テストとの共存確認

```bash
# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
```

## 統合テスト連携【必須】

| 判定項目       | 基準                              | 結果    |
| -------------- | --------------------------------- | ------- |
| Red 確認       | テストが FAIL すること（TDD Red） | pending |
| 既存テスト影響 | 既存テストへの悪影響がないこと    | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                     |
| -------------- | ---------------------------------------------------------------- |
| テスト網羅性   | 5段階の全フェーズ・未指定ケース・呼び出し順序をカバーしているか  |
| モック設計     | `SkillCreatorService` の依存モジュールを適切にモックできているか |
| テストの独立性 | 各テストケースが独立して実行可能か（共有状態に依存していないか） |
| AC 対応        | AC-1〜AC-5 に対応するテストケースが揃っているか                  |

## 成果物

| 成果物         | パス                                                                                  | 説明                        |
| -------------- | ------------------------------------------------------------------------------------- | --------------------------- |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | TC-01〜TC-08 のテストケース |

## 完了条件

- [ ] 既存テスト構造の調査（重複・既存パターン確認）が完了
- [ ] テストマトリクス（TC-01〜TC-08）が定義済み
- [ ] テストファイル `SkillCreatorService.progress.test.ts` が新規作成されている
- [ ] TC-01〜TC-05（5段階の各フェーズ）テストが含まれている
- [ ] TC-07（コールバック未指定ケース）テストが含まれている
- [ ] Red 確認（実装前にテストが FAIL すること）が確認済み
- [ ] 既存テスト（`skillCreatorHandlers.validation.test.ts` 等）への悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（既存テスト構造・重複確認）
2. テストマトリクス定義（TC-01〜TC-08）
3. テストファイル作成（`SkillCreatorService.progress.test.ts`）
4. 既存テストとの共存確認
5. Red 確認
6. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 5: 実装
