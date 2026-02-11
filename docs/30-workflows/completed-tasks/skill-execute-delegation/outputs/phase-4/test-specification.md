# Phase 4: テスト仕様書

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 4                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-11                            |

## テスト対象

### 変更対象ファイル

| ファイル                                               | 変更内容                                       |
| ------------------------------------------------------ | ---------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillService.ts` | setSkillExecutor()追加、executeSkill()委譲実装 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | SkillExecutorをSkillServiceに注入              |

### テストファイル

| ファイル                                                                       | 内容                    |
| ------------------------------------------------------------------------------ | ----------------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` | SkillService委譲テスト  |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`           | skillHandlers統合テスト |

## ユニットテストシナリオ

### UT-001: SkillExecutor.execute() が呼び出されること

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| テストID | UT-001                                                   |
| 対象     | SkillService.executeSkill()                              |
| 前提条件 | setSkillExecutor()でSkillExecutorが注入されている        |
| 入力     | skillId="test-skill", params={ prompt: "Test" }          |
| 期待結果 | SkillExecutor.execute()がSkillExecutionRequestで呼ばれる |
| 優先度   | P0                                                       |

### UT-002: スキル未インポート時のエラー処理

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| テストID | UT-002                                          |
| 対象     | SkillService.executeSkill()                     |
| 前提条件 | スキルが存在するがインポートされていない        |
| 入力     | skillId="not-imported-skill"                    |
| 期待結果 | "スキルがインポートされていません" エラースロー |
| 優先度   | P0                                              |

### UT-003: スキル未存在時のエラー処理

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| テストID | UT-003                                |
| 対象     | SkillService.executeSkill()           |
| 前提条件 | 指定されたskillIdが存在しない         |
| 入力     | skillId="non-existent-skill"          |
| 期待結果 | "スキルが見つかりません" エラースロー |
| 優先度   | P0                                    |

### UT-004: SkillExecutor未初期化時のエラー処理

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| テストID | UT-004                                        |
| 対象     | SkillService.executeSkill()                   |
| 前提条件 | setSkillExecutor()が呼ばれていない            |
| 入力     | skillId="test-skill"                          |
| 期待結果 | "SkillExecutor が初期化されていません" エラー |
| 優先度   | P0                                            |

### UT-005: setSkillExecutor() が正常に動作すること

| 項目     | 内容                            |
| -------- | ------------------------------- |
| テストID | UT-005                          |
| 対象     | SkillService.setSkillExecutor() |
| 前提条件 | なし                            |
| 入力     | SkillExecutorインスタンス       |
| 期待結果 | SkillExecutorが内部に保持される |
| 優先度   | P0                              |

## 統合テストシナリオ

### IT-001: registerSkillHandlers でSkillExecutor注入

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| テストID | IT-001                                    |
| 対象     | skillHandlers.registerSkillHandlers()     |
| 前提条件 | BrowserWindow, SkillServiceが存在         |
| 入力     | mainWindow, skillService                  |
| 期待結果 | skillService.setSkillExecutor()が呼ばれる |
| 優先度   | P0                                        |

### IT-002: skill:execute経由でSkillExecutor.execute()呼び出し

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| テストID | IT-002                                                |
| 対象     | skill:execute IPCハンドラー                           |
| 前提条件 | registerSkillHandlers完了、スキルがインポート済み     |
| 入力     | { skillId: "test-skill", params: { prompt: "Test" } } |
| 期待結果 | SkillExecutionResponseが返される                      |
| 優先度   | P0                                                    |

## テストカバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |

## テスト実行コマンド

```bash
# ユニットテスト
pnpm --filter @repo/desktop test -- --grep "SkillService.delegate"

# 統合テスト
pnpm --filter @repo/desktop test -- --grep "skillHandlers.delegate"

# 全テスト
pnpm --filter @repo/desktop test
```
