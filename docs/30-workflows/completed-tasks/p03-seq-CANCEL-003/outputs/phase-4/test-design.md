# テスト設計 - TASK-SW-CANCEL-003

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-003 |
| 作成日   | 2026-04-19         |

## dependency sanity check

| チェック項目                         | 結果                            |
| ------------------------------------ | ------------------------------- |
| pnpm install 済み                    | ✅ node_modules 存在確認        |
| @repo/shared ビルド成果物            | ✅ 確認済み                     |
| desktop パッケージで vitest 実行可能 | ✅ `pnpm vitest run` で動作確認 |

## targeted test matrix

### SkillCreatorService-cancel.test.ts

| TC    | 観点                                                                                             | AC 対応    | ファイル                           |
| ----- | ------------------------------------------------------------------------------------------------ | ---------- | ---------------------------------- |
| TC-01 | cancelCurrentOperation() が public で存在すること                                                | AC-5       | SkillCreatorService-cancel.test.ts |
| TC-02 | cancelCurrentOperation() を 2 回呼んでもクラッシュしないこと（null-safe）                        | AC-4       | SkillCreatorService-cancel.test.ts |
| TC-03 | cancelCurrentOperation() 後に currentAbortController が null になること                          | AC-3       | SkillCreatorService-cancel.test.ts |
| TC-04 | createSkill() 完了後に currentAbortController が null にリセットされること                       | AC-1, AC-3 | SkillCreatorService-cancel.test.ts |
| TC-05 | createSkill() が ScriptExecutor に AbortSignal を渡し、cancelCurrentOperation() で中断されること | AC-1, AC-2 | SkillCreatorService-cancel.test.ts |

### skillCreatorHandlers-cancel.test.ts

| TC       | 観点                                                                              | AC 対応 | ファイル                            |
| -------- | --------------------------------------------------------------------------------- | ------- | ----------------------------------- |
| TC-05(h) | registerSkillCreatorHandlers() が SKILL_CREATOR_CANCEL ハンドラーを登録すること   | AC-5    | skillCreatorHandlers-cancel.test.ts |
| TC-06(h) | SKILL_CREATOR_CANCEL ハンドラーが cancelCurrentOperation() を呼ぶこと             | AC-2    | skillCreatorHandlers-cancel.test.ts |
| TC-07(h) | unregisterSkillCreatorHandlers() が SKILL_CREATOR_CANCEL ハンドラーを解除すること | AC-6    | skillCreatorHandlers-cancel.test.ts |

## private access 方針

private フィールド `currentAbortController` へのアクセスには以下のパターンを使用:

```typescript
(service as unknown as { currentAbortController: AbortController | null })
  .currentAbortController;
```

## command suite

| コマンド                                                                                            | 対象         | PASS 基準      |
| --------------------------------------------------------------------------------------------------- | ------------ | -------------- |
| `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | service test | 5 tests passed |
| `pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | handler test | 3 tests passed |
| `pnpm --filter @repo/desktop typecheck`                                                             | 型チェック   | エラーなし     |
| `pnpm --filter @repo/desktop lint`                                                                  | lint         | エラーなし     |

## mismatch 時の Phase 5 補修条件

- テストが FAIL した場合: Phase 5 で実装を補修
- typecheck エラーが出た場合: Phase 5 で型定義を修正
- lint エラーが出た場合: Phase 8 でリファクタリング対応

## 実行結果

```
✓ SkillCreatorService-cancel.test.ts (5 tests) 39ms
✓ skillCreatorHandlers-cancel.test.ts (3 tests) 20ms

Test Files  2 passed (2)
Tests       8 passed (8)
```

**判定**: 全 AC テスト PASS。Phase 5 補修不要。
