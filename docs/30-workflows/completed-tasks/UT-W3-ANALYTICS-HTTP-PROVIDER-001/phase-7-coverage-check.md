# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 7                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 6                                              |
| 後続Phase  | Phase 8                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

変更した関数・ブロックのカバレッジを可視化し、保護されていない分岐がないことを確認する。

## 背景

Phase 5〜6 の実装・テスト拡充が完了した。本 Phase では `sendToAnalyticsProvider` に関連する line/branch カバレッジを確認する。

## 実行タスク

- Phase 6 の追加テストを coverage 対象へ反映する
- concern / command / dependency edge の到達率を確認する
- 未到達箇所を Phase 8 以降の改善対象へ送る
- 完了条件と traceability を記録する

## カバレッジ対象

| 対象ファイル                                    | 対象関数                    | 目標 line | 目標 branch |
| ----------------------------------------------- | --------------------------- | --------- | ----------- |
| `apps/desktop/src/main/ipc/analyticsHandler.ts` | `sendToAnalyticsProvider`   | 100%      | 100%        |
| `apps/desktop/src/main/ipc/analyticsHandler.ts` | `registerAnalyticsHandlers` | 90%+      | 80%+        |

## 重要: カバレッジの焦点

Phase 7 のカバレッジ目標は **変更したブロック（`sendToAnalyticsProvider`）** に焦点を当てる。全ファイル一律指定は避け、変更行の保護を優先する。

## 分岐カバレッジ確認項目

| 分岐                            | テストケース        |
| ------------------------------- | ------------------- |
| `ANALYTICS_ENDPOINT_URL` 未設定 | TC-02 で確認        |
| `NODE_ENV !== "production"`     | TC-03 で確認        |
| fetch 成功                      | TC-01, TC-04 で確認 |
| fetch 例外                      | TC-05 で確認        |
| fetch タイムアウト              | TC-06 で確認        |

## 統合テスト連携【必須】

coverage の結果を前後 Phase の契約へ結び付ける:

| 統合ポイント              | 確認内容                                                    |
| ------------------------- | ----------------------------------------------------------- |
| Phase 4 / 6 テスト        | `analytics:send` の主要分岐が全てカバーされている           |
| `sendToAnalyticsProvider` | success:true / swallow-error の経路が網羅されている         |
| dependency edge           | `analyticsHandler.ts` とテストファイルの関係が trace できる |

## 実行コマンド

```bash
pnpm --filter @repo/desktop test --coverage \
  --coverage.include="apps/desktop/src/main/ipc/analyticsHandler.ts"
```

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | Phase 6 成果物 |

## 成果物

| 成果物                 | パス                                              | 説明               |
| ---------------------- | ------------------------------------------------- | ------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 対象と目標設定     |
| 未到達分析             | `outputs/phase-7/unreached-analysis.md`           | 未カバー箇所の分析 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC との対応確認    |

## 完了条件

- [ ] `sendToAnalyticsProvider` の line カバレッジが 100% であること
- [ ] `sendToAnalyticsProvider` の branch カバレッジが 100% であること
- [ ] 未カバー箇所がある場合は理由が明記されていること
- [ ] トレーサビリティ（AC-01〜AC-07 と テストの対応）が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計画作成
2. カバレッジ実行と結果記録
3. 未到達分析
4. トレーサビリティ確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] カバレッジ目標達成を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 8: リファクタリング
