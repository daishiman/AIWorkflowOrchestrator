# Phase 7: カバレッジ確認 - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目       | 値                                                            |
| ---------- | ------------------------------------------------------------- |
| Phase      | 7                                                             |
| 機能名     | UT-TASK06-007-ipc-contract-drift-auto-detect                  |
| 作成日     | 2026-03-18                                                    |
| タスクID   | UT-TASK06-007                                                 |
| 名称       | カバレッジ確認                                                |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充） |
| 次Phase    | Phase 8（リファクタリング）                                   |
| ステータス | not_started                                                   |

## 目的

`apps/desktop/scripts/check-ipc-contracts.ts` のテストカバレッジ基準を確認し、未達の場合は Phase 6 に戻ってテストを追加する。

## 実行タスク

- Task 1（カバレッジ測定コマンド実行）: v8 プロバイダでカバレッジを測定する
- Task 2（カバレッジレポート生成）: 測定結果をカバレッジ基準テーブルに記録する
- Task 3（基準判定と Phase 6 ループバック）: 全指標が最低基準を満たしているか判定し、未達の場合は Phase 6 に戻る

## 参照資料

| 資料                                              | パス / リンク                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase 5 実装                                      | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-5-implementation.md` |
| Phase 6 テスト拡充                                | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-6-test-expansion.md` |
| テストコード                                      | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                               |
| 実装コード                                        | `apps/desktop/scripts/check-ipc-contracts.ts`                                                              |
| コード品質ルール                                  | `.claude/rules/02-code-quality.md#カバレッジ基準`                                                          |
| 既知の落とし穴（P41: v8カバレッジインライン関数） | `.claude/rules/06-known-pitfalls.md#P41`                                                                   |

### システム仕様（aiworkflow-requirements）

| 資料     | パス                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 5 の実装対象ファイルと Phase 6 のテスト追加内容を確認する。

### ステップ2: カバレッジを測定する

Task 1 のコマンドを実行し、カバレッジレポートを取得する。

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts \
  --coverage \
  --coverage.provider=v8 \
  --coverage.include='scripts/check-ipc-contracts.ts' \
  --reporter=verbose
```

### ステップ3: 基準判定

カバレッジ基準テーブルに測定結果を記入し、全指標が最低基準を満たしているか判定する。

#### カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 測定結果 | 判定 |
| ----------------- | -------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -        | -    |
| Branch Coverage   | 60%      | 70%      | -        | -    |
| Function Coverage | 80%      | 90%      | -        | -    |

#### P41 対策: v8 カバレッジのインライン関数カウント

v8 カバレッジプロバイダは、インライン arrow function（`.filter()`, `.map()` 内のコールバック）を独立した関数としてカウントする。以下の点に注意する:

- `matchAndValidate` 内の filter/map コールバックが全テストで実行されていることを確認する
- `generateReport` 内の条件分岐（markdown/json）が両方テストされていることを確認する
- 未実行のインライン関数がある場合は Phase 6 で対応するテストを追加する

#### 未カバレッジ箇所の分析テンプレート

| 関数名              | 未カバレッジ行 | 原因                  | 対応方針                 |
| ------------------- | -------------- | --------------------- | ------------------------ |
| (例) generateReport | L120-125       | JSON 形式のテスト不足 | Phase 6 で T-4-6b を強化 |
| -                   | -              | -                     | -                        |

### ステップ4: 基準未達の場合

未カバレッジ箇所を分析テンプレートに記入し、Phase 6 に戻ってテストを追加する。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

| 統合対象           | 検証内容                                               |
| ------------------ | ------------------------------------------------------ |
| Phase 4/6 テスト   | 全テストが PASS した状態でカバレッジを測定していること |
| Phase 5 実装       | 対象ファイルが `check-ipc-contracts.ts` のみであること |
| Phase 9 品質ゲート | カバレッジ基準が Phase 9 の品質要件と整合していること  |

## 多角的チェック観点（AIが判断）

| 観点                   | 確認内容                                                    |
| ---------------------- | ----------------------------------------------------------- |
| Line Coverage 達成     | 80% 以上であること                                          |
| Branch Coverage 達成   | 60% 以上であること                                          |
| Function Coverage 達成 | 80% 以上であること                                          |
| P41 対策確認           | インライン arrow function のカバレッジが考慮されていること  |
| ループバック判定       | 基準未達時に Phase 6 へ戻る判断が正しく行われること         |
| 測定精度               | v8 プロバイダの制約を理解した上で測定結果を解釈していること |

## 成果物

| 成果物             | パス                                                                                                                | 内容                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-7/coverage-report.md` | カバレッジ測定結果と基準判定 |

## 完了条件

- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録されている
- [ ] P41 対策（インライン関数カバレッジ）が確認されている
- [ ] 基準未達の場合は Phase 6 へのループバックが実施されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク             | ステータス  | 担当 |
| ---------------------- | ----------- | ---- |
| Task 1: カバレッジ測定 | not_started | -    |
| Task 2: レポート生成   | not_started | -    |
| Task 3: 基準判定       | not_started | -    |

## タスク100%実行確認【必須】

```bash
# Phase 7 成果物の検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  --task-id UT-TASK06-007 \
  --phase 7 \
  --workflow-dir docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect
```

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
- カバレッジ基準未達の場合は [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に戻る
