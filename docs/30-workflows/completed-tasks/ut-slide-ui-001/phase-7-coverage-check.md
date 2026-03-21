# Phase 7: カバレッジ確認 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 7 - カバレッジ確認           |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Phase 6 で拡充されたテストのカバレッジを最終測定し、プロジェクト基準（Line 80%+, Branch 60%+, Function 80%+）の充足を確認する。未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

| #   | タスク名               | 目的                                            |
| --- | ---------------------- | ----------------------------------------------- |
| T1  | カバレッジ測定実行     | 全対象ファイルのカバレッジを測定する            |
| T2  | 基準との照合           | 各ファイルのカバレッジ値を基準と比較する        |
| T3  | 未達判定・Phase 6 戻り | 基準未達の場合、不足箇所を特定し Phase 6 に戻る |
| T4  | カバレッジレポート生成 | 最終カバレッジ結果を文書化する                  |

- カバレッジ確認: 測定、基準照合、必要時の Phase 6 巻き戻し、最終レポート生成を行う。

## 参照資料

| 資料                                                          | 用途                          |
| ------------------------------------------------------------- | ----------------------------- |
| `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md` | 実装対象ファイルと差分の確認  |
| `docs/30-workflows/ut-slide-ui-001/phase-6-test-expansion.md` | テスト拡充内容の確認          |
| `.claude/rules/02-code-quality.md`                            | カバレッジ基準値              |
| `.claude/rules/06-known-pitfalls.md` P41                      | v8 カバレッジのインライン関数 |
| `.claude/rules/06-known-pitfalls.md` P40                      | テスト実行ディレクトリ準拠    |

## 実行手順

### Task 1: カバレッジ測定実行

1. 対象ディレクトリの全テストに対してカバレッジ測定を実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --coverage --reporter=verbose
   ```
2. カバレッジ結果を以下の形式で記録する:

   | ファイル                          | Line | Branch | Function |
   | --------------------------------- | ---- | ------ | -------- |
   | types.ts                          | ?%   | ?%     | ?%       |
   | selectors.ts                      | ?%   | ?%     | ?%       |
   | components/SlideSyncCard.tsx      | ?%   | ?%     | ?%       |
   | components/SlideProgressRow.tsx   | ?%   | ?%     | ?%       |
   | components/SlideWatchStatus.tsx   | ?%   | ?%     | ?%       |
   | components/SlideGuidanceBlock.tsx | ?%   | ?%     | ?%       |
   | components/TerminalLauncher.tsx   | ?%   | ?%     | ?%       |
   | SlideWorkspace.tsx                | ?%   | ?%     | ?%       |

3. P41 注意: v8 カバレッジプロバイダのインライン関数カウントに留意し、variantStyles の Record 定義内のコールバックも Function Coverage にカウントされる可能性を考慮する

### Task 2: 基準との照合

1. 各ファイルのカバレッジ値を基準と照合する:

   | 指標              | 最低基準 | 推奨基準 |
   | ----------------- | -------- | -------- |
   | Line Coverage     | 80%      | 90%      |
   | Branch Coverage   | 60%      | 70%      |
   | Function Coverage | 80%      | 90%      |

2. 判定基準:
   - **全ファイルが最低基準を満たす** → PASS → Task 4 へ
   - **1ファイルでも最低基準未達** → FAIL → Task 3 へ

3. 推奨基準に達していない場合は、追加テストの必要性をコメントとして記録する（ただし Phase 6 への戻りは最低基準未達の場合のみ）

### Task 3: 未達判定・Phase 6 戻り

**最低基準未達の場合のみ実行**

1. 未達ファイルの未カバー行を特定する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --coverage --reporter=verbose 2>&1 | grep -A 5 "Uncovered"
   ```
2. 未カバー行の分析:
   - **Line 未達**: どの行が未実行か、テストケースで到達可能か
   - **Branch 未達**: どの条件分岐の片側が未テストか
   - **Function 未達**: どの関数が未呼び出しか（P41 のインライン関数含む）
3. 不足箇所を Phase 6 の追加テストリストとして記録する
4. Phase 6 に戻り、不足テストを追加する
5. 追加後、再度 Task 1 からカバレッジ測定を繰り返す

### Task 4: カバレッジレポート生成

**全ファイルが最低基準を満たした場合に実行**

1. `outputs/phase-7/coverage-report.md` を作成する
2. レポートに以下を含める:
   - 測定日時
   - 測定コマンド
   - 全ファイルのカバレッジ結果テーブル
   - 全体の合計カバレッジ
   - 推奨基準に達していないファイルのリスト（該当する場合）
   - Phase 6 への戻り回数（0回の場合はその旨記録）
3. 最終テスト実行結果（全件 PASS）を記録する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```

## 統合テスト連携

- カバレッジ測定は `cd apps/desktop` から実行する（P40 準拠）
- カバレッジ測定と同時にテスト PASS も確認する（テスト失敗時はカバレッジデータが不正確になるため）
- Phase 6 への戻りループは最大3回とし、3回で基準未達の場合は原因を分析してレポートに記録する

## 多角的チェック観点

| 観点              | チェック内容                                             | 対応 Task |
| ----------------- | -------------------------------------------------------- | --------- |
| Line Coverage     | 全ファイルで 80% 以上であること                          | T1, T2    |
| Branch Coverage   | 全ファイルで 60% 以上であること                          | T1, T2    |
| Function Coverage | 全ファイルで 80% 以上であること                          | T1, T2    |
| P41 考慮          | v8 インライン関数カウントが考慮されていること            | T1        |
| P40 準拠          | テスト実行が `cd apps/desktop` から行われていること      | T1, T3    |
| テスト PASS       | カバレッジ測定時に全テストが Green であること            | T1        |
| レポート完全性    | カバレッジレポートに全ファイルの結果が記録されていること | T4        |
| 戻りループ制限    | Phase 6 への戻りが最大3回以内であること                  | T3        |

## 成果物

| ファイル                                                               | 説明               |
| ---------------------------------------------------------------------- | ------------------ |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-7/coverage-report.md` | カバレッジレポート |

## 完了条件

- [ ] カバレッジ測定が実行されていること
- [ ] 全ファイルの Line Coverage が 80% 以上であること
- [ ] 全ファイルの Branch Coverage が 60% 以上であること
- [ ] 全ファイルの Function Coverage が 80% 以上であること
- [ ] カバレッジ測定時に全テストが PASS であること
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成されていること
- [ ] 推奨基準（Line 90%, Branch 70%, Function 90%）未達ファイルが記録されていること

## サブタスク管理

- [ ] T1: カバレッジ測定実行
- [ ] T2: 基準との照合（PASS/FAIL 判定）
- [ ] T3: 未達の場合 Phase 6 戻り（該当する場合のみ）
- [ ] T4: カバレッジレポート生成
- [ ] 全テスト PASS 確認

## タスク 100% 実行確認

Phase 7 の全タスクが完了したことを以下で確認する:

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/ --coverage --reporter=verbose` の結果が全基準を充足
2. `outputs/phase-7/coverage-report.md` が存在し、全ファイルの結果が記録されていること
3. カバレッジレポートの各値が最低基準を満たしていること:
   - Line >= 80%
   - Branch >= 60%
   - Function >= 80%

## 次の Phase

Phase 8: リファクタリング（`phase-8-refactoring.md`）に進む。コード品質の改善（重複排除、命名改善、パフォーマンス最適化）が目標である。
