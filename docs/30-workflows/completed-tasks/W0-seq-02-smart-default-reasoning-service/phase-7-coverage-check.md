# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 7                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 6                                        |
| 後続Phase  | Phase 8                                        |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

`smartDefaultReasoningService.ts` の推論分岐・フォールバック分岐の coverage を可視化し、
未到達パスを特定する。

## 実行タスク

1. coverage を計測し、目標値を確認する。
2. 未カバー分岐を分析する。
3. トレーサビリティマトリクスで AC とテストの対応を確認する。

## 統合テスト連携

- Phase 6 の拡充テスト結果を入力にして、coverage 計測の対象分岐が AC-1〜AC-4 に対応していることを確認する。
- Phase 10 の最終レビューでは、本 Phase の coverage / traceability 記録を根拠として PASS 判定を行う。

## カバレッジ目標（対象スコープ）

| 指標              | 目標値 | 対象スコープ                           |
| ----------------- | ------ | -------------------------------------- |
| Line Coverage     | 90%+   | `smartDefaultReasoningService.ts` のみ |
| Branch Coverage   | 80%+   | 推論分岐・フォールバック分岐           |
| Function Coverage | 100%   | `inferSmartDefaults` 関数              |

> **注意**: カバレッジ目標は `smartDefaultReasoningService.ts` ファイルに限定する。
> 広域指定は避け、変更したファイルの実測値を証跡に残す。

## coverage 計測コマンド

```bash
# ファイル指定で coverage 計測
pnpm --filter @repo/shared test:coverage -- \
  src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
```

## トレーサビリティ確認

| AC番号 | 対応テストケース           | カバー状況 |
| ------ | -------------------------- | ---------- |
| AC-1   | TC-01〜TC-04               | [ ]        |
| AC-2   | TC-05〜TC-10               | [ ]        |
| AC-3   | 全TC                       | [ ]        |
| AC-4   | TC-11, TC-12, TC-15, TC-19 | [ ]        |

## 参照資料

| 資料名           | パス                                     | 用途           |
| ---------------- | ---------------------------------------- | -------------- |
| 拡充テストケース | `outputs/phase-6/expanded-test-cases.md` | Phase 6 成果物 |
| エッジケース結果 | `outputs/phase-6/edge-case-result.md`    | Phase 6 成果物 |

## 実行手順

1. coverage 計測コマンドを実行する。
2. `smartDefaultReasoningService.ts` の line/branch/function カバレッジ実測値を記録する。
3. 未カバーパスを特定し、Phase 6 で追加するか判断する。
4. トレーサビリティマトリクスを完成させる。

## 成果物

| 成果物                   | パス                                              | 説明               |
| ------------------------ | ------------------------------------------------- | ------------------ |
| カバレッジ計画           | `outputs/phase-7/coverage-plan.md`                | 計測方針・目標値   |
| 未到達分析               | `outputs/phase-7/uncovered-analysis-plan.md`      | 未カバーパスの分析 |
| トレーサビリティレポート | `outputs/phase-7/traceability-coverage-report.md` | AC↔テスト対応表    |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `smartDefaultReasoningService.ts` の Line Coverage が 90%+ であること
- [ ] `smartDefaultReasoningService.ts` の Branch Coverage が 80%+ であること
- [ ] Function Coverage が 100% であること
- [ ] トレーサビリティマトリクスが完成していること
- [ ] 未到達パスが特定または「なし」と確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
