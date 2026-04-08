# Phase 7: カバレッジ計画 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## 計測対象（変更ブロック限定）

### 対象: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**対象ブロック**:

1. `canExecuteSkill` の条件式（`executionPrompt.trim().length > 0` 削除）
2. `handleExecute` 関数（`defaultExecutionPrompt` を直接使用）
3. `handlePlanImprovement` 関数（`runtimeFeedback` の代入式変更）

**目標**: line 90%以上 / branch 80%以上（変更ブロック限定）

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/
```

## 変更ブロックのカバレッジ手動分析

### `canExecuteSkill`

| ブランチ                                 | カバーするテスト | 状態 |
| ---------------------------------------- | ---------------- | ---- |
| `!createdSkillName` → false              | TC-EX-01         | 済   |
| `isExecuting` → false                    | TC-EX-05         | 済   |
| `skillExecutionStatus === "review"`      | TC-EX-06         | 済   |
| `skillExecutionStatus === "reuse_ready"` | TC-EX-07         | 済   |
| 全条件クリア → true                      | TC-EX-02         | 済   |

### `handleExecute`

| ブランチ                        | カバーするテスト | 状態 |
| ------------------------------- | ---------------- | ---- |
| `!createdSkillName` 早期 return | 既存テスト       | 済   |
| 通常実行パス（`executeSkill`）  | 既存テスト       | 済   |
| `improve_ready` 分岐            | 既存テスト       | 済   |

### `handlePlanImprovement`

| ブランチ                                   | カバーするテスト | 状態 |
| ------------------------------------------ | ---------------- | ---- |
| `runtimeFeedback = defaultExecutionPrompt` | 既存テスト       | 済   |

## カバレッジ達成状況

| 対象ブロック                        | line 目標 | 達成状況 | branch 目標 | 達成状況 |
| ----------------------------------- | --------- | -------- | ----------- | -------- |
| `canExecuteSkill`                   | 100%      | 100%     | 100%        | 100%     |
| `handleExecute`（変更部分）         | 100%      | 100%     | 100%        | 100%     |
| `handlePlanImprovement`（変更部分） | 100%      | 100%     | -           | -        |

## 判定

変更ブロック全体のカバレッジ目標達成。
