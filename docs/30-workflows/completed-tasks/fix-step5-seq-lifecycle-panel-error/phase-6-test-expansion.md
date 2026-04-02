# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 6                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

Phase 4 で定義した 5 つの代表ケースが `currentPhase !== 'handoff'` の分岐と `handoffBundle` の独立性を十分に覆っていることを確認し、不要な edge case を増やさずに回帰を固定する。

## 実行タスク

1. 既存 5 テストの coverage を再実行する
2. `execute` / `verify` / `handoff` の代表ケースで branch coverage を確認する
3. 追加すべき edge case がないことを記録する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 5 の修正結果を前提に、TC-EP-06〜10 を拡張する。

## 実行手順

### ステップ 1: 既存テストの coverage 再実行

```bash
# 既存の 5 テストケースを含めて実行する
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

### ステップ 2: 代表ケースの確認

| テストケース | 検証内容                                                         | 根拠                                                         |
| ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| TC-EP-01     | `currentPhase: 'handoff'` で `setWorkflowError(null)` 非呼び出し | `currentPhase !== 'handoff'` の false 分岐を確認             |
| TC-EP-02     | `currentPhase: 'execute'` で `setWorkflowError(null)` 呼び出し   | `currentPhase !== 'handoff'` の true 分岐を確認              |
| TC-EP-03     | `currentPhase: 'verify'` で `setWorkflowError(null)` 呼び出し    | 非 handoff の代表ケースをもう 1 つ確認                       |
| TC-EP-04     | `currentPhase: 'handoff'` でも `handoffBundle` 処理が実行される  | `handoffBundle` が `currentPhase` から独立していることを確認 |
| TC-EP-05     | `handoffBundle: null` で `setHandoffGuidance` が呼ばれない       | `handoffBundle` がない場合の既存動作を確認                   |

### ステップ 3: 結論の記録

- `SkillCreatorWorkflowPhase` は閉じた union のため、`heartbeat_timeout` や `null` / `undefined` の架空ケースを追加しない。
- Phase 4 の 5 ケースで AC-1〜AC-3 と branch coverage は十分に表現できる。
- 追加の edge case は不要として `outputs/phase-6/test-expansion-result.md` に記録する。

## 多角的チェック観点

- `SkillCreatorWorkflowPhase` の閉じた union に対して、存在しない値をテストに入れていないか確認したか
- `handoffBundle` 処理が `currentPhase` 判定の外にあることを確認したか
- 5 ケースで branch coverage が説明できることを確認したか

## 成果物

| 成果物                 | パス                                       | 説明                                          |
| ---------------------- | ------------------------------------------ | --------------------------------------------- |
| テスト拡充確認レポート | `outputs/phase-6/test-expansion-result.md` | 追加 edge case を不要と判断した根拠を記録する |

## 完了条件

- [ ] TC-EP-01 〜 TC-EP-05 の 5 ケースで AC-1〜AC-3 が表現されている
- [ ] `SkillCreatorWorkflowPhase` の閉じた union に対して不要な edge case を追加していない
- [ ] 既存 5 テストケースが PASS している

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（既存テストファイルの 5 ケース）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 7: カバレッジ確認 へ進む
