# Phase 5: テスト実行結果 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## テスト環境

| 項目           | 値                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| OS             | macOS Darwin 25.3.0                                                                                    |
| Node           | v22.x (arm64)                                                                                          |
| pnpm           | ワークスペース構成                                                                                     |
| vitest         | v2.1.9                                                                                                 |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` |

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec -- npx vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

## 実行結果

```
 RUN  v2.1.9 /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260329-224514-wt-6/apps/desktop

 ✓ src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts (27 tests) 8ms

 Test Files  1 passed (1)
      Tests  27 passed (27)
   Start at  23:26:55
   Duration  2.38s (transform 397ms, setup 203ms, collect 526ms, tests 8ms, environment 238ms, prepare 73ms)
```

## 結果サマリー

| 項目            | 値                  |
| --------------- | ------------------- |
| テストファイル  | 1 passed            |
| テストケース    | 27 passed, 0 failed |
| 実行時間        | 2.38s               |
| Exit code       | 0                   |
| mismatch エラー | なし                |

## 判定

**PASS** — RT-06 対象テストが non-watch で 1 回完走し、esbuild mismatch エラーは発生していない。
