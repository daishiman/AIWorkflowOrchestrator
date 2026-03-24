# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 7 - カバレッジ確認                      |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Phase 4-6 で作成したテストのカバレッジが品質基準を満たしていることを確認する。未達の場合は Phase 6 へ戻り、不足箇所のテストを追加する。

## 前提成果物

| Phase | 成果物     | パス               |
| ----- | ---------- | ------------------ |
| 5     | 実装       | `outputs/phase-5/` |
| 6     | テスト拡充 | `outputs/phase-6/` |

## 参照資料

| 資料名                       | パス / 説明                                       |
| ---------------------------- | ------------------------------------------------- |
| カバレッジ基準               | `.claude/rules/02-code-quality.md#カバレッジ基準` |
| P41 v8 カバレッジ注意        | `.claude/rules/06-known-pitfalls.md#P41`          |
| P40 モノレポ実行ディレクトリ | `.claude/rules/06-known-pitfalls.md#P40`          |

## 実行タスク

### Task 1: カバレッジ計測の実行

以下のコマンドでカバレッジを計測する:

```bash
cd packages/shared
pnpm vitest run --coverage src/types/__tests__/uistate-resolve.test.ts src/types/__tests__/contract-matrix.test.ts src/types/__tests__/cta-contract.test.ts
```

P40 準拠: 必ず対象パッケージディレクトリ（`packages/shared`）から実行する。

### Task 2: カバレッジ基準の確認

対象ファイル `packages/shared/src/types/execution-capability.ts` のカバレッジが以下の基準を満たすことを確認する。

| 指標              | 最低基準 | 推奨基準 | 備考                                                 |
| ----------------- | -------- | -------- | ---------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | 全実装行が対象                                       |
| Branch Coverage   | 60%      | 70%      | 8 分岐 x 4 capability の全パスが対象                 |
| Function Coverage | 80%      | 90%      | P41 注意: インライン arrow function もカウントされる |

### Task 3: 未カバー箇所の特定

カバレッジレポートから未カバー行・未カバーブランチを特定する。

確認ポイント:

- resolveUiState() の 8 分岐が全て通過しているか
- resolveCtaContract() の全 8 状態マッピングがテストされているか
- Guard 関数の正常系・異常系の両方がカバーされているか
- 到達不能セルのガードロジックがカバーされているか

### Task 4: 判定

| 条件                         | 判定 | 次ステップ               |
| ---------------------------- | ---- | ------------------------ |
| 全基準を最低基準以上で達成   | PASS | Phase 8 へ進む           |
| いずれかの基準が最低基準未達 | FAIL | Phase 6 へ戻りテスト追加 |

## 成果物

| 成果物               | パス                                 |
| -------------------- | ------------------------------------ |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` |
| Phase 7 完了レポート | `outputs/phase-7/`                   |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] Line Coverage >= 80%（対象: `execution-capability.ts`）
- [ ] Branch Coverage >= 60%（対象: 8 分岐 x 4 capability の全パス）
- [ ] Function Coverage >= 80%（対象: resolveUiState, resolveCtaContract, Guard 関数）
- [ ] 未カバー箇所が特定され、意図的な除外である場合は理由が記録されている
- [ ] カバレッジレポートが `outputs/phase-7/` に保存されている

## 次Phase

[Phase 8: リファクタリング](./phase-8-refactoring.md)

## 未達の場合

[Phase 6: テスト拡充](./phase-6-test-augmentation.md) へ戻る
