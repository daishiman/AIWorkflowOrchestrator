# TASK-SW-STREAM-001 テスト設計書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 4                                                                 |
| Phase名    | テスト作成                                                        |
| 対象タスク | TASK-SW-STREAM-001                                                |
| 対象機能   | SkillCreatorService.createSkill() onProgress コールバック引数追加 |
| 作成日     | 2026-04-17                                                        |
| 状態       | 完了                                                              |
| 担当       | AIエージェント（ポストモーテム記録）                              |

## 概要

本ドキュメントは TDD Red フェーズ用のテストケース設計書である。  
`createSkill()` に `onProgress?` コールバック引数を追加する実装（TASK-SW-STREAM-001）に対し、
実装前に失敗するテストケース（TC-01〜TC-06）と回帰テスト計画（TC-R01〜TC-R02）を定義する。

なお、本タスクは実装がメインブランチに先行マージ済みであるため、
本書は「実装前に設計すべきだったテスト仕様」のポストモーテム記録として作成されている。

---

## 新規テストケース（TC-01〜TC-06）: TDD Red フェーズ設計

### テスト対象ファイル

```
apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
```

実際には `SkillCreatorService.progress.test.ts` として別ファイルに追加された（本 Phase 時点では未追加の想定）。

### テストケース一覧

| TC ID | 対応AC     | テストタイトル                                                    | 期待結果                                                                    | Redフェーズ失敗理由（実装前）             |
| ----- | ---------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| TC-01 | AC-1, AC-2 | createモードで planning フェーズのコールバックが発火する          | `onProgress` が `{ phase: "planning", percentage: 10 }` で呼ばれる          | `onProgress` 引数が存在しないため型エラー |
| TC-02 | AC-3       | createモードで generating-skill フェーズのコールバックが発火する  | `onProgress` が `{ phase: "generating-skill", percentage: 40 }` で呼ばれる  | `emitProgress` 呼び出しが未実装のため     |
| TC-03 | AC-4       | createモードで generating-agents フェーズのコールバックが発火する | `onProgress` が `{ phase: "generating-agents", percentage: 70 }` で呼ばれる | `emitProgress` 呼び出しが未実装のため     |
| TC-04 | AC-5       | createモードで validating フェーズのコールバックが発火する        | `onProgress` が `{ phase: "validating", percentage: 90 }` で呼ばれる        | `emitProgress` 呼び出しが未実装のため     |
| TC-05 | AC-6       | createモードで done フェーズのコールバックが発火する              | `onProgress` が `{ phase: "done", percentage: 100 }` で呼ばれる             | `emitProgress` 呼び出しが未実装のため     |
| TC-06 | AC-7       | onProgress を渡さない場合も createSkill() は正常に完了する        | 例外なし、戻り値がスキルパス文字列                                          | 引数なし呼び出しで型エラーになるため      |

---

## 回帰テスト計画（TC-R01〜TC-R02）

### 目的

`onProgress?` はオプショナル引数であるため、既存の呼び出し元（引数なし）は変更不要。
しかし念のため既存テストが全て Green を維持することを確認する。

### テストケース一覧

| TC ID  | 対応AC | テストタイトル                                                    | 期待結果              | テストファイル              |
| ------ | ------ | ----------------------------------------------------------------- | --------------------- | --------------------------- |
| TC-R01 | AC-8   | collaborative モード: 有効な interviewResult でスキルが作成される | 既存動作と同一・Green | SkillCreatorService.test.ts |
| TC-R02 | AC-8   | collaborative モード: runCollaborativeWorkflow が正常に実行される | 既存動作と同一・Green | SkillCreatorService.test.ts |

---

## テストコードスケルトン

以下は Phase 4 時点で `SkillCreatorService.test.ts` に追加する予定だったスケルトン。  
実際には `SkillCreatorService.progress.test.ts` として独立ファイルに追加されたが、
本設計書はスケルトンとして記録する。

```typescript
/**
 * SkillCreatorService - 進捗コールバック ユニットテスト（スケルトン）
 * TASK-SW-STREAM-001: createSkill() onProgress コールバック
 *
 * ※ このスケルトンは Phase 4 TDD Red フェーズ用設計。
 *    実装前に全て失敗することを確認してから実装に進む。
 */

import { describe, expect, it, vi } from "vitest";
import { SkillCreatorService } from "../SkillCreatorService";
import type { CreateSkillOptions } from "@repo/shared/types";

// モック設定は省略（既存テストの beforeEach を参照）

describe("createSkill() - onProgress コールバック (TASK-SW-STREAM-001)", () => {
  // TC-01: planning フェーズ / 10% でコールバックが呼ばれる
  it("create モードで createSkill() を呼ぶと planning フェーズのコールバックが発火する", async () => {
    const service = new SkillCreatorService();
    const onProgress = vi.fn();
    await service.createSkill(
      { mode: "create", name: "test-skill", description: "テスト" },
      onProgress,
    );
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ phase: "planning", percentage: 10 }),
    );
  });

  // TC-02: generating-skill フェーズ / 40%
  it("create モードで createSkill() を呼ぶと generating-skill フェーズのコールバックが発火する", async () => {
    // generating-skill / 40% で呼び出されることを確認
    // expect(onProgress).toHaveBeenCalledWith(
    //   expect.objectContaining({ phase: "generating-skill", percentage: 40 })
    // );
  });

  // TC-03: generating-agents フェーズ / 70%
  it("create モードで createSkill() を呼ぶと generating-agents フェーズのコールバックが発火する", async () => {
    // generating-agents / 70% で呼び出されることを確認
  });

  // TC-04: validating フェーズ / 90%
  it("create モードで createSkill() を呼ぶと validating フェーズのコールバックが発火する", async () => {
    // validating / 90% で呼び出されることを確認
  });

  // TC-05: done フェーズ / 100%
  it("create モードで createSkill() を呼ぶと done フェーズのコールバックが発火する", async () => {
    // done / 100% で呼び出されることを確認
  });

  // TC-06: onProgress が undefined でもエラーなし（AC-7）
  it("onProgress を渡さない場合も createSkill() は正常に完了する", async () => {
    const service = new SkillCreatorService();
    await expect(
      service.createSkill({
        mode: "create",
        name: "test-skill",
        description: "テスト",
      }),
    ).resolves.not.toThrow();
  });
});
```

---

## TDD 確認コマンド

### Red フェーズ（実装前）

実装前にテストが全て失敗することを確認するコマンド:

```bash
# onProgress 関連テストのみ実行（全件 FAIL であることを確認）
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService" \
  --grep "onProgress|progress|callback"
```

### Green フェーズ（実装後）

実装後に全件 PASS することを確認するコマンド:

```bash
# 新規テスト Green 確認
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService" \
  --grep "onProgress|progress|callback"

# 回帰テスト Green 確認
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService" \
  --grep "collaborative"

# 全テスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService"
```

---

## 現状記録（ポストモーテム）

本タスクは実装がメインブランチに先行マージ（コミット `36ed8ad03`）されたため、
TDD Red フェーズの実行順序が逆転している。以下に実際の状態を記録する。

| 項目                              | 状態                                               |
| --------------------------------- | -------------------------------------------------- |
| TC-01〜TC-06 テストコード追加     | 追加済み（`SkillCreatorService.progress.test.ts`） |
| TC-01〜TC-06 テスト実行結果       | Green（実装後に追加されたため初回から Green）      |
| TC-R01〜TC-R02 回帰テスト実行結果 | Green（既存テスト影響なし）                        |
| TDD Red フェーズ確認              | 未実施（設計上のポストモーテム記録）               |

---

## 参照資料

- `docs/30-workflows/p02-par-STREAM-001/phase-4-test-creation.md` — Phase 4 実行計画書
- `docs/30-workflows/p02-par-STREAM-001/outputs/phase-5/TASK-SW-STREAM-001-implementation-plan.md` — 実装計画書
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` — 実際のテストコード
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` — 既存テストコード（TC-R01〜TC-R02 含む）

---

## 完了チェックリスト

- [x] TC-01〜TC-06 のテストケース設計が完了している
- [x] TC-R01〜TC-R02 の回帰テスト計画が完了している
- [x] テストコードスケルトンが記録されている
- [x] TDD 確認コマンドが明記されている
- [x] 現状（ポストモーテム）記録が完了している
- [x] 参照資料へのリンクが整備されている
