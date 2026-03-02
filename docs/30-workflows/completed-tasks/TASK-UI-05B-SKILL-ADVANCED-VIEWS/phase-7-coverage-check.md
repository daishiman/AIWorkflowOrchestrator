# Phase 7: カバレッジ確認 — TASK-UI-05B

## メタ情報

| 項目             | 値                                                                                |
| ---------------- | --------------------------------------------------------------------------------- |
| タスク ID        | TASK-UI-05B                                                                       |
| Phase            | 7 — カバレッジ確認                                                                |
| 前提 Phase       | Phase 6（テスト拡充）完了                                                         |
| 作成日           | 2026-03-01                                                                        |
| 対象ビュー       | 3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard |
| カバレッジツール | Vitest + v8 カバレッジプロバイダ                                                  |

## 目的

4 ビューのコードカバレッジを測定し、プロジェクト基準（Line 80%+, Branch 60%+, Function 80%+）を満たしていることを確認する。未達の場合は不足箇所を特定し、Phase 6 へ戻って追加テストを作成する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 未達時の対応   |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | Phase 6 へ戻る |
| Branch Coverage   | 60%      | 70%      | Phase 6 へ戻る |
| Function Coverage | 80%      | 90%      | Phase 6 へ戻る |

## 実行タスク

- 測定実行: ビュー別/統合のカバレッジ測定を実行する
- 基準判定: Line/Branch/Function の閾値達成可否を判定する
- 未達分析: 未カバー行・分岐・関数を特定する
- 追加改善: 未達時は Phase 6 に戻るための不足テストを定義する
- 再測定: 追加後の再測定で閾値到達を確認する
- 記録固定: 監査可能なカバレッジレポートを作成する

### Task 1: カバレッジ測定コマンド実行

**目的**: 各ビューのカバレッジを測定する。

**実行コマンド**:

```bash
# 3A: SkillChainBuilder
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillChainBuilder/

# 3B: ScheduleManager
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/ScheduleManager/

# 3C: DebugPanel
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/DebugPanel/

# 3D: AnalyticsDashboard
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/AnalyticsDashboard/

# 全ビュー統合
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillChainBuilder/ src/renderer/views/ScheduleManager/ src/renderer/views/DebugPanel/ src/renderer/views/AnalyticsDashboard/
```

**注意事項**:

- テスト実行は `cd apps/desktop` から行う（P40 対策）
- v8 カバレッジプロバイダのインライン関数カウントに注意する（P41 対策）

### Task 2: カバレッジレポート分析

**目的**: 測定結果を分析し、基準充足状況を判定する。

**記録テンプレート**:

#### 3A: SkillChainBuilder カバレッジ

| ファイル              | Line   | Branch | Function | 判定  |
| --------------------- | ------ | ------ | -------- | ----- |
| SkillChainBuilder.tsx | —%     | —%     | —%       | —     |
| ChainCardGrid.tsx     | —%     | —%     | —%       | —     |
| ChainEditor.tsx       | —%     | —%     | —%       | —     |
| StepCard.tsx          | —%     | —%     | —%       | —     |
| StepConnector.tsx     | —%     | —%     | —%       | —     |
| StepEditor.tsx        | —%     | —%     | —%       | —     |
| CreateChainDialog.tsx | —%     | —%     | —%       | —     |
| useChainList.ts       | —%     | —%     | —%       | —     |
| useChainEditor.ts     | —%     | —%     | —%       | —     |
| **合計**              | **—%** | **—%** | **—%**   | **—** |

#### 3B: ScheduleManager カバレッジ

| ファイル                | Line   | Branch | Function | 判定  |
| ----------------------- | ------ | ------ | -------- | ----- |
| ScheduleManager.tsx     | —%     | —%     | —%       | —     |
| ScheduleTable.tsx       | —%     | —%     | —%       | —     |
| ScheduleRow.tsx         | —%     | —%     | —%       | —     |
| ScheduleDetailPanel.tsx | —%     | —%     | —%       | —     |
| ScheduleDialog.tsx      | —%     | —%     | —%       | —     |
| CronEditor.tsx          | —%     | —%     | —%       | —     |
| CronPresetList.tsx      | —%     | —%     | —%       | —     |
| RunHistoryList.tsx      | —%     | —%     | —%       | —     |
| useScheduleList.ts      | —%     | —%     | —%       | —     |
| useScheduleEditor.ts    | —%     | —%     | —%       | —     |
| **合計**                | **—%** | **—%** | **—%**   | **—** |

#### 3C: DebugPanel カバレッジ

| ファイル             | Line   | Branch | Function | 判定  |
| -------------------- | ------ | ------ | -------- | ----- |
| DebugPanel.tsx       | —%     | —%     | —%       | —     |
| DebugControls.tsx    | —%     | —%     | —%       | —     |
| CallStackView.tsx    | —%     | —%     | —%       | —     |
| StepHistoryList.tsx  | —%     | —%     | —%       | —     |
| OutputConsole.tsx    | —%     | —%     | —%       | —     |
| VariableWatch.tsx    | —%     | —%     | —%       | —     |
| VariableNode.tsx     | —%     | —%     | —%       | —     |
| BreakpointEditor.tsx | —%     | —%     | —%       | —     |
| BreakpointRow.tsx    | —%     | —%     | —%       | —     |
| StartDebugDialog.tsx | —%     | —%     | —%       | —     |
| useDebugSession.ts   | —%     | —%     | —%       | —     |
| useBreakpoints.ts    | —%     | —%     | —%       | —     |
| **合計**             | **—%** | **—%** | **—%**   | **—** |

#### 3D: AnalyticsDashboard カバレッジ

| ファイル               | Line   | Branch | Function | 判定  |
| ---------------------- | ------ | ------ | -------- | ----- |
| AnalyticsDashboard.tsx | —%     | —%     | —%       | —     |
| SummaryCards.tsx       | —%     | —%     | —%       | —     |
| SummaryCard.tsx        | —%     | —%     | —%       | —     |
| UsageChart.tsx         | —%     | —%     | —%       | —     |
| ChartTooltip.tsx       | —%     | —%     | —%       | —     |
| SkillRanking.tsx       | —%     | —%     | —%       | —     |
| PeriodSelector.tsx     | —%     | —%     | —%       | —     |
| ExportButton.tsx       | —%     | —%     | —%       | —     |
| useAnalyticsSummary.ts | —%     | —%     | —%       | —     |
| useUsageTrend.ts       | —%     | —%     | —%       | —     |
| **合計**               | **—%** | **—%** | **—%**   | **—** |

#### 全体サマリー

| ビュー             | Line   | Branch | Function | 全指標基準達成 |
| ------------------ | ------ | ------ | -------- | -------------- |
| SkillChainBuilder  | —%     | —%     | —%       | —              |
| ScheduleManager    | —%     | —%     | —%       | —              |
| DebugPanel         | —%     | —%     | —%       | —              |
| AnalyticsDashboard | —%     | —%     | —%       | —              |
| **全体平均**       | **—%** | **—%** | **—%**   | **—**          |

### Task 3: 未達箇所の特定と追加テスト作成

**目的**: カバレッジ未達の場合に不足箇所を特定し、テストを追加する。

**判定フロー**:

```
全ビューの全指標が最低基準以上か？
  ├── YES → Task 4（最終確認）へ
  └── NO  → 未達箇所を特定
              ├── 未カバー行のリスト作成
              ├── テスト追加（Phase 6 と同じルール）
              └── Task 1 へ戻りカバレッジ再測定
```

**未達時の対応手順**:

1. カバレッジレポートから未カバー行を特定する
2. 未カバー行がどの分岐・関数に属するかを分析する
3. 不足テストを既存テストファイルに追加する
4. 追加テストが Green であることを確認する
5. カバレッジを再測定し、基準達成を確認する

**P41 対策**: v8 カバレッジプロバイダではインライン arrow function が独立した関数としてカウントされる。Function Coverage が低い場合はインライン関数の呼び出しテストを追加する。

### Task 4: 最終カバレッジ確認

**目的**: 全ビューが全指標で最低基準以上であることを最終確認する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillChainBuilder/ src/renderer/views/ScheduleManager/ src/renderer/views/DebugPanel/ src/renderer/views/AnalyticsDashboard/
```

**最終判定基準**:

- 全 4 ビューの Line Coverage が 80% 以上である
- 全 4 ビューの Branch Coverage が 60% 以上である
- 全 4 ビューの Function Coverage が 80% 以上である
- 上記 3 条件を全て満たす場合、Phase 8 へ進む

## 参照資料

| 資料                       | パス / 参照先                                                                     |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 5 実装サマリー       | `phase-5-implementation.md`                                                       |
| Phase 6 テスト拡充レポート | `phase-6-test-expansion.md`                                                       |
| コード品質ルール           | `.claude/rules/02-code-quality.md#カバレッジ基準`                                 |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`（P40, P41）                                  |
| Vitest カバレッジ設定      | `apps/desktop/vitest.config.ts`                                                   |
| aiworkflow 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| aiworkflow テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

## 実行手順

### Step 1: 初回カバレッジ測定

1. Task 1 のコマンドを 4 ビューそれぞれに対して実行する
2. 測定結果を Task 2 のテンプレートに記録する

### Step 2: 基準判定

1. 全ビューの全指標を最低基準と比較する
2. 全指標が基準以上であれば Step 4 へ進む
3. 1 つでも未達があれば Step 3 へ進む

### Step 3: 追加テスト作成（未達時のみ）

1. 未カバー行・関数・分岐を特定する
2. テストを追加する
3. Step 1 に戻りカバレッジを再測定する
4. 最大 3 回の繰り返しで基準未達の場合、未達箇所と理由を `outputs/phase-7/coverage-report.md` に記録し、Phase 8 へ進む（推奨基準未達は許容、最低基準未達は要記録）

### Step 4: 最終確認・レポート作成

1. Task 4 のコマンドで最終カバレッジを測定する
2. `outputs/phase-7/coverage-report.md` を作成する
3. 全テストが Green であることを確認する

## 統合テスト連携【必須】

| 連携観点                 | 実施内容                           | 出力先                                    |
| ------------------------ | ---------------------------------- | ----------------------------------------- |
| Phase 5 実装             | 実装差分の未カバー分岐を可視化する | `outputs/phase-7/coverage-report.md`      |
| Phase 6 テスト           | 追加テストの効果を定量確認する     | `outputs/phase-7/coverage-report.md`      |
| Phase 8 リファクタリング | リファクタ前ベースラインを固定する | `outputs/phase-8/refactoring-report.md`   |
| Phase 10 最終レビュー    | テスト品質指標として提出する       | `outputs/phase-10/final-review-result.md` |

## 成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] 4 ビューすべてのカバレッジが測定されている
- [ ] Line Coverage が全ビューで 80% 以上である（推奨: 90%）
- [ ] Branch Coverage が全ビューで 60% 以上である（推奨: 70%）
- [ ] Function Coverage が全ビューで 80% 以上である（推奨: 90%）
- [ ] カバレッジレポート `outputs/phase-7/coverage-report.md` が作成されている
- [ ] レポートにビュー別・ファイル別のカバレッジ数値が記載されている
- [ ] 未達箇所がある場合は理由と対応方針が記載されている
- [ ] 全テストが Green 状態である
- [ ] テスト実行は `cd apps/desktop` から行っている（P40 対策）

## 次 Phase

Phase 8（リファクタリング）へ進む。テストが全て Green、カバレッジ基準達成の状態で安全にリファクタリングを行う。
