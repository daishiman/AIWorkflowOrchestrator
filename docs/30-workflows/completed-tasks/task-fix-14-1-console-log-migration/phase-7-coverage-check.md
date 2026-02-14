# Phase 7: テストカバレッジ確認 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 7                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

テストカバレッジが基準値を満たしていることを確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

### Task 1: カバレッジ基準確認

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 2: ファイル別カバレッジ測定

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/
```

対象ファイル:

- SkillScanner.ts
- PermissionStore.ts
- SkillImportManager.ts
- SkillAnalyzer.ts

### Task 3: カバレッジ判定

| 判定 | 条件                         | アクション               |
| ---- | ---------------------------- | ------------------------ |
| PASS | 全ファイルが最低基準を満たす | Phase 8 へ               |
| FAIL | いずれかのファイルが基準未達 | Phase 6 へ戻りテスト追加 |

## 参照資料

| 資料               | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | phase-6-test-enhancement.md                                                |
| カバレッジ基準     | .claude/skills/task-specification-creator/references/coverage-standards.md |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| カバレッジ確認レポート | outputs/phase-7/coverage-verification.md |

## 完了条件

- [ ] 全対象ファイルのカバレッジを測定した
- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] カバレッジ確認レポートを作成した

## 次Phase

→ Phase 8: リファクタリング（カバレッジ基準を満たした場合）
→ Phase 6: テスト拡充（カバレッジ基準未達の場合）
