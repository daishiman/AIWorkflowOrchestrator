# Phase 7: カバレッジ確認

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 7                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.25h                              |

## 目的

`onWorkflowStateChanged` コールバック全体のカバレッジ目標（90% 以上）を確認し、不足している場合はテストを追加する。

## 実行タスク

1. カバレッジレポートを生成する
2. `onWorkflowStateChanged` コールバックの行・ブランチカバレッジを確認する
3. 目標（90% 以上）未達の場合はテストを追加する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 5 の修正結果を前提に、`onWorkflowStateChanged` コールバック全体の分岐をカバーする。

## 実行手順

### ステップ 1: カバレッジレポートの生成

```bash
# カバレッジ付きでテストを実行する
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

### ステップ 2: カバレッジ目標の確認

| 対象                                              | 目標値   | 確認ポイント                                                            |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `onWorkflowStateChanged` コールバック（行）       | 90% 以上 | `if (snapshot.currentPhase !== 'handoff')` 分岐の両辺が実行されているか |
| `onWorkflowStateChanged` コールバック（ブランチ） | 90% 以上 | `true`/`false` の両ブランチがカバーされているか                         |
| `handoffBundle` の `if` 分岐                      | 100%     | `truthy`/`falsy` の両パスがカバーされているか                           |

### ステップ 3: ブランチカバレッジの確認ポイント

本修正で追加されたブランチは以下の 2 つ:

| ブランチ                                                | カバーするテストケース |
| ------------------------------------------------------- | ---------------------- |
| `snapshot.currentPhase !== 'handoff'` が `true` の場合  | TC-EP-02, TC-EP-03     |
| `snapshot.currentPhase !== 'handoff'` が `false` の場合 | TC-EP-01, TC-EP-04     |

既存の `handoffBundle` 分岐:

| ブランチ                         | カバーするテストケース                 |
| -------------------------------- | -------------------------------------- |
| `handoffBundle` が truthy の場合 | TC-EP-04, TC-EP-09                     |
| `handoffBundle` が falsy の場合  | TC-EP-01, TC-EP-02, TC-EP-03, TC-EP-05 |

### ステップ 4: カバレッジ不足の場合の対処

カバレッジが 90% 未満の場合は、不足しているブランチを特定して Phase 6 のテストに追記する。

```bash
# 全テストを含めてカバレッジを確認する
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/renderer/components/skill/__tests__/
```

## 多角的チェック観点

- `onWorkflowStateChanged` コールバック全体（531〜544 行）のカバレッジを確認したか（コールバック内の全分岐）
- `skillCreatorApi?.onWorkflowStateChanged` が `undefined` の場合の早期 `return` パスのカバレッジも確認したか（コールバック外の分岐）
- カバレッジ目標未達の場合、テスト追加ではなく実装の過剰な複雑さが原因ではないか確認したか

## 成果物

| 成果物             | パス                                 | 説明                            |
| ------------------ | ------------------------------------ | ------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ数値と達成/未達の記録 |

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] `onWorkflowStateChanged` コールバックの行カバレッジが 90% 以上
- [ ] `onWorkflowStateChanged` コールバックのブランチカバレッジが 90% 以上
- [ ] `if (snapshot.currentPhase !== 'handoff')` の `true`/`false` 両ブランチがカバーされている
- [ ] `handoffBundle` の `truthy`/`falsy` 両パスがカバーされている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-7/coverage-report.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 8: リファクタリング へ進む（カバレッジ目標達成の場合のみ）
