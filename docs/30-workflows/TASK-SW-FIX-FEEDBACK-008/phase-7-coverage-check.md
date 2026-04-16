# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008  |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | completed                 |
| 作成日     | 2026-04-15                |

## 目的

`fetchSkills()` 非ブロッキング化の修正箇所（`processWorkflowOutcome` / `handleExecutePlan`）の
全実行パス（success / fail の両方）がテストによってカバーされていることを確認する。

カバレッジレポートを用いて未カバー行がないことを検証し、
Phase 4〜6 で追加したテスト群が修正箇所を網羅していることを定量的に確認する。

## 実行タスク

### Task 1: カバレッジレポートの生成

- `pnpm --filter @repo/desktop test -- --coverage` を実行してカバレッジレポートを生成する
- HTML レポートと文字ベースのサマリーレポートを確認する
- `SkillLifecyclePanel.tsx` のカバレッジ数値（行・関数・分岐）を記録する

### Task 2: 修正箇所のカバレッジ確認

- L769-784（`processWorkflowOutcome` 内の `.catch()` ブロック）がカバーされていることを確認する
- L1110-1113（`handleExecutePlan` 内の `.catch()` ブロック）がカバーされていることを確認する
- `.catch()` のコールバック（success パス・fail パスの両方）が実行されるテストが存在することを確認する

### Task 3: 未カバー箇所の対応判断

- カバレッジレポートで未カバーの行がある場合、それが修正対象外の箇所であるか確認する
- 修正対象箇所（L769-784 / L1110-1113）に未カバー行がある場合は Phase 6 にフィードバックしてテストを追加する
- カバレッジ数値の目標（line coverage 80% 以上）を確認する

## カバレッジ確認コマンド

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop test -- --coverage

# 特定ファイルのみカバレッジ確認
pnpm --filter @repo/desktop test -- --coverage --coverage.include="**/SkillLifecyclePanel.tsx"

# カバレッジレポートの確認（HTML）
open apps/desktop/coverage/index.html
```

## 対象パスの確認観点

| 対象箇所                                     | 確認パス                              | カバーするテスト             |
| -------------------------------------------- | ------------------------------------- | ---------------------------- |
| processWorkflowOutcome - 成功パス            | fetchSkills が resolve                | TC-F8-03, TC-F8-05(U-8)      |
| processWorkflowOutcome - 失敗パス            | fetchSkills が reject → .catch() 実行 | TC-F8-01, TC-F8-04, TC-F8-06 |
| handleExecutePlan - 成功パス                 | fetchSkills が resolve                | TC-F8-03, TC-F8-05(U-13)     |
| handleExecutePlan - 失敗パス                 | fetchSkills が reject → .catch() 実行 | TC-F8-02, TC-F8-07           |
| skillName あり → selectSkillByName呼び出し   | skillName が truthy                   | TC-F8-01〜03                 |
| skillName なし → selectSkillByName非呼び出し | skillName が null/undefined           | TC-F8-08〜10                 |

## 参照資料

| 資料名                 | パス                                                                                               | 説明                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| 修正済みコンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113 |
| テストファイル         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 全テストケース        |
| Phase 4 テスト仕様書   | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-4-test-creation.md`                              | TC-F8-01〜05          |
| Phase 6 テスト拡充     | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-6-test-expansion.md`                             | TC-F8-06〜10          |

## 実行手順

```bash
# 1. 全テスト実行（PASS 確認）
pnpm --filter @repo/desktop test

# 2. カバレッジレポート生成
pnpm --filter @repo/desktop test -- --coverage

# 3. SkillLifecyclePanel.tsx のカバレッジサマリー確認
# レポート内の SkillLifecyclePanel.tsx 行を確認する

# 4. HTML レポートで未カバー行を視覚的に確認
open apps/desktop/coverage/index.html
```

## 統合テスト連携

- カバレッジ確認で問題が見つかった場合は Phase 6 にフィードバックしてテストを追加する
- 全パスがカバーされていることを確認後、タスク完了とする
- カバレッジ数値は `outputs/phase-7/coverage-summary.md` に記録する

## 多角的チェック観点（AIが判断）

- `.catch()` コールバック内の `console.warn` が分岐としてカバレッジに計上されているか確認する
- Vitest のカバレッジプロバイダー（v8 / istanbul）の設定によってカバレッジ数値の計算方法が異なる点を考慮する
- 条件分岐（`if (executeResult.skillName)`）の true/false 両方のブランチがカバーされているか確認する

## サブタスク管理

| サブタスクID | 内容                                            | ステータス |
| ------------ | ----------------------------------------------- | ---------- |
| ST-F8-7-01   | カバレッジレポート生成                          | completed  |
| ST-F8-7-02   | processWorkflowOutcome 修正箇所のカバレッジ確認 | completed  |
| ST-F8-7-03   | handleExecutePlan 修正箇所のカバレッジ確認      | completed  |
| ST-F8-7-04   | 未カバー箇所の対応判断・記録                    | completed  |
| ST-F8-7-05   | カバレッジサマリーの記録                        | completed  |

## 成果物

| 成果物             | パス                                                                   | 説明                              |
| ------------------ | ---------------------------------------------------------------------- | --------------------------------- |
| カバレッジサマリー | `apps/desktop/coverage/index.html`                                     | HTML カバレッジレポート（生成物） |
| カバレッジ記録     | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-7-coverage-check.md` | 本ファイル（確認観点・結果記録）  |

## 完了条件

- [x] `pnpm --filter @repo/desktop test -- --coverage` が正常に実行される
- [x] `SkillLifecyclePanel.tsx` の修正箇所（L769-784 / L1110-1113）がカバーされている
- [x] fetchSkills 成功パス・失敗パスの両方がテストでカバーされている
- [x] `selectSkillByName` の呼び出し条件（skillName あり/なし）の両方がカバーされている
- [x] カバレッジ数値（line coverage）が目標値（80%以上）を達成している
- [x] 未カバー箇所が修正対象外の箇所であることが確認されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
