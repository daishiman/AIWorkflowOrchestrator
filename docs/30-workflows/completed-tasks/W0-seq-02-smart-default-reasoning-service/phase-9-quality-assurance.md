# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

lint・typecheck・テスト・セキュリティ・リスクの全方位チェックを行い、Phase 10 への通過判定を行う。

## 実行タスク

1. 静的解析（lint / typecheck）を実行する。
2. テスト全件 PASS を確認する。
3. セキュリティ・リスクを評価する。

## 統合テスト連携

- Phase 10 の最終レビューに必要な全品質証跡を揃える。

## 品質チェックリスト

### 機能検証

- [ ] Phase 4 定義の全テスト（TC-01〜TC-15）が PASS
- [ ] Phase 6 追加テスト（TC-16〜TC-20）が PASS
- [ ] `pnpm --filter @repo/shared test:run` が全件 PASS

### コード品質

- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなし
- [ ] `any` 型の使用なし（NFR-02 準拠）

### カバレッジ

- [ ] `smartDefaultReasoningService.ts` の Line Coverage: 90%+
- [ ] `smartDefaultReasoningService.ts` の Branch Coverage: 80%+
- [ ] Function Coverage: 100%

### セキュリティ

- [ ] 外部ライブラリへの依存なし（NFR-03 準拠）
- [ ] 入力値の null/undefined ガードが存在する
- [ ] 推論ロジックに SQL インジェクション・XSS のリスクがない（純粋関数）

### barrel 整合

- [ ] `packages/shared/src/services/skillCreator/index.ts` が `inferSmartDefaults` を export している
- [ ] `packages/shared/index.ts` が root export に `inferSmartDefaults` を再 export している

## 因果ループ監査

| ループ               | 強化/バランス | 確認内容                                            |
| -------------------- | ------------- | --------------------------------------------------- |
| 推論精度向上ループ   | 強化          | inferenceLog の記録 → 将来の推論改善に活用可能      |
| フォールバック安全性 | バランス      | null フォールバックが過剰すぎると UI が空表示になる |

## 実行コマンド

```bash
# 全品質チェック
pnpm lint
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared test:run
```

## 参照資料

| 資料名               | パス                                              | 用途           |
| -------------------- | ------------------------------------------------- | -------------- |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物 |
| トレーサビリティ     | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 実行手順

1. lint / typecheck を実行し、エラーがないことを確認する。
2. 全テストを実行し、PASS を確認する。
3. セキュリティリスク評価を行う。
4. 品質レポートを作成する。

## 成果物

| 成果物         | パス                                   | 説明                     |
| -------------- | -------------------------------------- | ------------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 全チェック結果サマリー   |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | セキュリティ・リスク評価 |
| 因果ループ確認 | `outputs/phase-9/causal-loop-check.md` | 因果ループ監査結果       |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 品質チェックリストの全項目が PASS
- [ ] リスク台帳が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
