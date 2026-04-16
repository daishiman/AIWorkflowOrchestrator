# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 対象機能   | TASK-SW-STREAM-001          |
| 前提Phase  | Phase 3: 設計レビューゲート |
| 次Phase    | Phase 5: 実装               |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

TDD の Red フェーズとして、`createSkill()` コールバック引数追加の実装前に失敗するテストケースを設計する。
AC-1〜AC-8 を網羅するテストケース一覧と、既存テストの回帰確認計画を策定する。

## 実行タスク

### Task 1: 新規テストケース設計（AC-1〜AC-7）

テスト対象: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

- AC-1: `createSkill()` が第2引数 `onProgress` を受け取れることを確認する
- AC-2: `planning` フェーズのコールバックが呼び出されることをアサートする
- AC-3: `generating-skill` フェーズのコールバックが呼び出されることをアサートする
- AC-4: `generating-agents` フェーズのコールバックが呼び出されることをアサートする
- AC-5: `validating` フェーズのコールバックが呼び出されることをアサートする
- AC-6: `done` フェーズのコールバックが呼び出されることをアサートする
- AC-7: `onProgress` が未指定でも `createSkill()` が正常に完了することをアサートする

### Task 2: 回帰テスト計画（AC-8）

- 既存の `collaborative` モード・`orchestrate` モードのテストケースが全てパスすることを確認
- オプショナル引数のため既存テストへの影響はない見込みだが、実行して確認する

### Task 3: テストコードスケルトン作成

```typescript
// TC-01: onProgress コールバックが planning フェーズで呼び出される
it("create モードで createSkill() を呼ぶと planning フェーズのコールバックが発火する", async () => {
  const service = createTestService();
  const onProgress = vi.fn();
  await service.createSkill(
    { mode: "create", name: "test", description: "テスト" },
    onProgress,
  );
  expect(onProgress).toHaveBeenCalledWith(
    expect.objectContaining({ phase: "planning", percentage: 10 }),
  );
});

// TC-02: onProgress コールバックが generating-skill フェーズで呼び出される
it("create モードで createSkill() を呼ぶと generating-skill フェーズのコールバックが発火する", async () => {
  // generating-skill / 40% で呼び出されることを確認
});

// TC-03: onProgress コールバックが generating-agents フェーズで呼び出される
it("create モードで createSkill() を呼ぶと generating-agents フェーズのコールバックが発火する", async () => {
  // generating-agents / 70% で呼び出されることを確認
});

// TC-04: onProgress コールバックが validating フェーズで呼び出される
it("create モードで createSkill() を呼ぶと validating フェーズのコールバックが発火する", async () => {
  // validating / 90% で呼び出されることを確認
});

// TC-05: onProgress コールバックが done フェーズで呼び出される
it("create モードで createSkill() を呼ぶと done フェーズのコールバックが発火する", async () => {
  // done / 100% で呼び出されることを確認
});

// TC-06: onProgress が undefined でもエラーなし
it("onProgress を渡さない場合も createSkill() は正常に完了する", async () => {
  const service = createTestService();
  await expect(
    service.createSkill({
      mode: "create",
      name: "test",
      description: "テスト",
    }),
  ).resolves.not.toThrow();
});
```

## テストケース一覧

### 新規テストケース（TC-01〜TC-06）

| TC ID | 対応AC     | テストタイトル                                                     | 期待結果                                                                    |
| ----- | ---------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| TC-01 | AC-1, AC-2 | create モードで planning フェーズのコールバックが発火する          | `onProgress` が `{ phase: "planning", percentage: 10 }` で呼ばれる          |
| TC-02 | AC-3       | create モードで generating-skill フェーズのコールバックが発火する  | `onProgress` が `{ phase: "generating-skill", percentage: 40 }` で呼ばれる  |
| TC-03 | AC-4       | create モードで generating-agents フェーズのコールバックが発火する | `onProgress` が `{ phase: "generating-agents", percentage: 70 }` で呼ばれる |
| TC-04 | AC-5       | create モードで validating フェーズのコールバックが発火する        | `onProgress` が `{ phase: "validating", percentage: 90 }` で呼ばれる        |
| TC-05 | AC-6       | create モードで done フェーズのコールバックが発火する              | `onProgress` が `{ phase: "done", percentage: 100 }` で呼ばれる             |
| TC-06 | AC-7       | onProgress を渡さない場合も createSkill() は正常に完了する         | 例外なし、戻り値がスキルパス文字列                                          |

### 回帰テストケース（TC-R01〜TC-R02）

| TC ID  | 対応AC | テストタイトル                                                    | 期待結果       |
| ------ | ------ | ----------------------------------------------------------------- | -------------- |
| TC-R01 | AC-8   | collaborative モード: 有効な interviewResult でスキルが作成される | 既存動作と同一 |
| TC-R02 | AC-8   | collaborative モード: runCollaborativeWorkflow が正常に実行される | 既存動作と同一 |

## TDD 確認コマンド

```bash
# Red フェーズ（実装前に TC-01〜TC-06 が失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "onProgress\|progress\|callback"

# 回帰確認（TC-R01〜TC-R02 が Green であることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"
```

## 参照資料

- `outputs/phase-2/TASK-SW-STREAM-001-design.md` — 設計書（コールバック呼び出し仕様）
- `outputs/phase-1/TASK-SW-STREAM-001-requirements.md` — 受入条件（AC-1〜AC-8）

## 統合テスト連携

- 本タスクはユニットテストのみを対象とする
- `createSkill()` の IPC 契約は変更しないため統合テストの変更は不要

## 成果物

| 成果物                            | パス                                                |
| --------------------------------- | --------------------------------------------------- |
| TASK-SW-STREAM-001-test-design.md | `outputs/phase-4/TASK-SW-STREAM-001-test-design.md` |

## 完了条件

- [ ] TC-01〜TC-06 のテストケース設計が完了している
- [ ] TC-R01〜TC-R02 の回帰テスト計画が完了している
- [ ] テストコードスケルトンが作成されている
- [ ] TDD Red フェーズの確認手順が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1（新規テストケース設計）を100%実行した
- [ ] Task 2（回帰テスト計画）を100%実行した
- [ ] Task 3（テストコードスケルトン作成）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-test-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
