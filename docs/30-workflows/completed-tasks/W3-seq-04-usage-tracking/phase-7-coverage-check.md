# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 7                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 6                      |
| 後続Phase  | Phase 8                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

テストカバレッジを計測し、計装ポイントに関する未到達コードを分析する。

## カバレッジ目標

| 対象ファイル                        | 目標カバレッジ | 計測対象                   |
| ----------------------------------- | -------------- | -------------------------- |
| `trackEvent.ts`                     | 100%           | スタブ実装の全分岐         |
| `SkillCreateWizard.tsx`（計装箇所） | 90% 以上       | 5計装ポイントの発火確認    |
| `CompleteStep.tsx`（計装箇所）      | 90% 以上       | ネクストアクション計装確認 |

## カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop test --coverage \
  --coverage.include="**/utils/trackEvent.ts" \
  --coverage.include="**/SkillCreateWizard.tsx" \
  --coverage.include="**/wizard/CompleteStep.tsx"
```

## 未到達分析の観点

### trackEvent スタブの分岐カバレッジ

| 分岐                                 | カバー状況 | 未到達理由（予想） |
| ------------------------------------ | ---------- | ------------------ |
| `NODE_ENV !== "production"` が true  | [ ]        | 開発環境テスト確認 |
| `NODE_ENV !== "production"` が false | [ ]        | 本番環境テスト確認 |

### 計装ポイントの発火カバレッジ

| 計装ポイント                                 | カバー状況 | 未到達理由（予想）                   |
| -------------------------------------------- | ---------- | ------------------------------------ |
| `skill_wizard_started`                       | [ ]        | useEffect マウント + 空 payload 確認 |
| `skill_wizard_step1_completed`（complete）   | [ ]        | 全問回答シナリオ確認                 |
| `skill_wizard_step1_completed`（skip）       | [ ]        | スキップシナリオ確認                 |
| `skill_wizard_generation_completed`          | [ ]        | LLM 生成完了シナリオ確認             |
| `skill_skeleton_quality_feedback`（true）    | [ ]        | 👍 フィードバックシナリオ確認        |
| `skill_skeleton_quality_feedback`（false）   | [ ]        | 👎 フィードバックシナリオ確認        |
| `skill_wizard_next_action`（execute）        | [ ]        | 実行ボタン押下シナリオ確認           |
| `skill_wizard_next_action`（open_editor）    | [ ]        | エディタボタン押下シナリオ確認       |
| `skill_wizard_next_action`（create_another） | [ ]        | 再作成ボタン押下シナリオ確認         |

## トレーサビリティ確認

| 要件 ID | イベント名                          | テストあり | カバー状況 |
| ------- | ----------------------------------- | ---------- | ---------- |
| AC-01   | `skill_wizard_started`              | [ ]        | [ ]        |
| AC-02   | `skill_wizard_step1_completed`      | [ ]        | [ ]        |
| AC-03   | `skill_wizard_generation_completed` | [ ]        | [ ]        |
| AC-04   | `skill_skeleton_quality_feedback`   | [ ]        | [ ]        |
| AC-05   | `skill_wizard_next_action`          | [ ]        | [ ]        |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |

## 実行タスク

1. Phase 6 成果物を確認する。
2. カバレッジ計測コマンドを実行する。
3. trackEvent スタブの分岐カバレッジを確認する。
4. 各計装ポイントの発火カバレッジを確認する。
5. トレーサビリティ確認テーブルを埋める。

## 統合テスト連携

- Phase 1 の AC-01〜AC-05 を Phase 7 の traceability table へそのまま写し込む。
- Phase 4 の TC-01〜TC-09 と Phase 6 の edge case を合わせて coverage gap を確認する。
- Phase 11 は NON_VISUAL なので、screen capture の有無ではなく console / automation evidence を参照する。
- `skill_wizard_started` は source 依存ではなく空オブジェクト一致で十分かを確認する。

## 成果物

| 成果物                 | パス                                              | 説明                     |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 目標・計測方法           |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達計装ポイントの一覧 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | 要件とテストの対応確認   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `trackEvent.ts` のカバレッジ目標 100% を達成していること
- [ ] 5計装ポイント・9発火シナリオが全て確認されていること
- [ ] トレーサビリティ確認が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. カバレッジ計測実行
3. 未到達分析
4. トレーサビリティ確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
