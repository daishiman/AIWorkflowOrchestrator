# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 7                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 6                                      |
| 後続Phase  | Phase 8                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 5〜6 で追加したテストが対象コンポーネント（`SkillLifecyclePanel.tsx`）の
エラー表示経路を適切にカバーしていることを確認する。

**注意（[Feedback BEFORE-QUIT-002] / [Feedback 5]）**: カバレッジ目標を「全体 X%」のような広域指定ではなく、
変更した関数・ブロックの line/branch カバレッジの実測値を証跡に残す。

## カバレッジ対象（変更箇所のみ）

| 対象箇所                                                     | line coverage 目標 | branch coverage 目標 |
| ------------------------------------------------------------ | ------------------ | -------------------- |
| `onWorkflowStateChanged` コールバック内 errorMessage 処理    | 100%               | 100%                 |
| `currentSurfaceError` の null 判定分岐                       | 100%               | 100%                 |
| `data-testid="skill-lifecycle-error"` 条件分岐               | 100%               | 100%                 |
| `applyWorkflowSnapshot` の `setWorkflowError(null)` 呼び出し | 100%               | 100%                 |

**スコープ外**: `SkillLifecyclePanel.tsx` 全体のカバレッジは対象外。
変更・追加した箇所のみを対象とする。

## カバレッジ計測コマンド

```bash
# エラー表示経路の対象ファイルのみカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx \
  --coverage \
  --coverage.include="apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx"

# カバレッジレポートの確認
cat coverage/lcov.info | grep -A 5 "onWorkflowStateChanged"
```

## トレーサビリティ確認

| テストケース | 対応する受け入れ基準 | カバーする経路                        |
| ------------ | -------------------- | ------------------------------------- |
| UT-01        | TC-01                | onWorkflowStateChanged → alert 表示   |
| UT-02        | TC-02                | skillExecutionStatus → sessionEntries |
| UT-03        | TC-03                | getWorkflowState → failure 反映       |
| UT-04        | TC-04                | localError 優先順位                   |
| UT-05        | -                    | errorMessage undefined → alert 非表示 |
| UT-06〜UT-11 | -                    | fail path・回帰ガード                 |

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |

## 成果物

| 成果物                 | パス                                              | 説明                     |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 対象範囲・目標値の定義   |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未カバー箇所の分析・対応 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | 受け入れ基準との対応確認 |

## 完了条件

- [ ] 対象箇所の line coverage 100% が確認されている
- [ ] 対象箇所の branch coverage 100% が確認されている
- [ ] トレーサビリティ（TC-01〜TC-04 と UT-01〜UT-04）の対応が記録されている
- [ ] 未カバー箇所（あれば）の理由が記録されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] カバレッジ実測値が記録されている
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
