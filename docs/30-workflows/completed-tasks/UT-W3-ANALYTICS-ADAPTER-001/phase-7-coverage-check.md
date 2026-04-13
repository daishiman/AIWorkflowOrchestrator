# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 7                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 6                                                      |
| 後続Phase  | Phase 8                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

`analyticsAdapter.ts`（90%+）・`trackEvent.ts`（100%）・IPCハンドラー（90%+）の
カバレッジ目標達成を確認し、変更した関数/ブロックの実測値を証跡として残す。

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 対象ファイルのカバレッジを計測する

**実行手順**:

1. 以下のコマンドでカバレッジを計測する:

```bash
# analyticsAdapter.ts カバレッジ
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/analyticsAdapter.ts

# trackEvent.ts カバレッジ
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/trackEvent.ts

# IPCハンドラー カバレッジ（IPC経由の場合）
pnpm --filter @repo/desktop test:coverage -- src/main/ipc/analyticsHandler.ts
```

2. Line Coverage・Branch Coverage・Function Coverageを記録する
3. 目標未達のファイルを特定する

**期待される成果物**:

- `outputs/phase-7/traceability-coverage-report.md`

### タスク2: カバレッジ目標確認

**目的**: 各ファイルのカバレッジが目標を達成しているか確認する

**実行手順**:

1. 以下の目標値と実測値を比較する:
   - `analyticsAdapter.ts`: Line 90%+, Branch 80%+, Function 90%+
   - `trackEvent.ts`: Line 100%, Branch 100%, Function 100%
   - `analyticsHandler.ts`: Line 90%+, Branch 80%+, Function 90%+
2. 変更した関数/ブロックのline・branch実測値を証跡に残す（[Feedback 5]対策）
3. 目標未達の場合はPhase 6に戻りテストを追加する

**期待される成果物**:

- `outputs/phase-7/traceability-coverage-report.md`（実測値）

### タスク3: 未カバー箇所分析

**目的**: カバレッジ目標未達の場合、未カバー箇所を分析する

**実行手順**:

1. カバレッジレポートの未カバー行・ブランチを特定する
2. 未カバーの理由（テスト困難なパス・意図的スキップ等）を分析する
3. 追加テスト対象と対応方針を記録する
4. 「全体X%」ではなく変更ファイル特定の目標を設定する（[Feedback BEFORE-QUIT-002]対策）

**期待される成果物**:

- `outputs/phase-7/uncovered-analysis-plan.md`
- `outputs/phase-7/coverage-plan.md`

## カバレッジ目標

| 対象ファイル        | Line Coverage | Branch Coverage | Function Coverage | 現状 |
| ------------------- | ------------- | --------------- | ----------------- | ---- |
| analyticsAdapter.ts | 90%+          | 80%+            | 90%+              | TBD  |
| trackEvent.ts       | 100%          | 100%            | 100%              | TBD  |
| analyticsHandler.ts | 90%+          | 80%+            | 90%+              | TBD  |

※ 対象外: `SkillCreateWizard.tsx`（変更なし）・その他未変更ファイル

## 参照資料

| 参照資料                     | パス                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Phase 6 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`             |
| FB-5: カバレッジ実測値必須   | `.claude/skills/task-specification-creator/SKILL.md` |
| FB-BEFORE-QUIT-002: 局所指定 | `.claude/skills/task-specification-creator/SKILL.md` |

## 成果物

| 成果物             | パス                                              | 内容                       |
| ------------------ | ------------------------------------------------- | -------------------------- |
| カバレッジレポート | `outputs/phase-7/traceability-coverage-report.md` | 実測値・目標との比較       |
| 未カバー分析       | `outputs/phase-7/uncovered-analysis-plan.md`      | 未カバー箇所と対応方針     |
| カバレッジ計画     | `outputs/phase-7/coverage-plan.md`                | 目標達成のためのアクション |

## 完了条件

- [ ] `analyticsAdapter.ts` Line 90%+・Branch 80%+・Function 90%+ 達成
- [ ] `trackEvent.ts` Line 100%・Branch 100%・Function 100% 達成
- [ ] IPCハンドラー Line 90%+（IPC経由の場合）達成
- [ ] 変更した関数/ブロックのline/branch実測値を証跡として記録済み
- [ ] 未達の場合はPhase 6へ戻り対応済み
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 8: リファクタリング
