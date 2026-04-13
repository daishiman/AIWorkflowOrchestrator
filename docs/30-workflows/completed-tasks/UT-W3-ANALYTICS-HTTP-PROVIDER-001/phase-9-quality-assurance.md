# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 9                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 8                                              |
| 後続Phase  | Phase 10                                             |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

リファクタリング後の品質を総合的に評価し、Phase 10 レビューゲートへ進める状態であることを確認する。

## 背景

Phase 8 のリファクタリングが完了した。本 Phase では品質指標の最終チェック、リスク評価、因果ループ監査を行う。

## 実行タスク

1. 変更後の品質チェックリストをレビューする。
2. `pnpm typecheck && pnpm lint && pnpm test` の結果を確認する。
3. リスク台帳と因果ループ監査を更新する。
4. 回帰ポイントを `quality-report.md` に集約する。
5. Phase 10 へ渡す blocker / 非 blocker を整理する。

## SubAgentチーム編成

| SubAgent   | 関心ごと     | 主担当                               |
| ---------- | ------------ | ------------------------------------ |
| SubAgent-A | テスト品質   | 全テスト実行・カバレッジ再確認       |
| SubAgent-B | 静的解析     | typecheck / lint / 型安全性確認      |
| SubAgent-C | セキュリティ | 環境変数漏洩リスク・fetch 安全性確認 |
| SubAgent-D | 統合判定     | リスク台帳・因果ループ整合確認       |

## 品質チェックリスト

### 機能品質

| チェック項目                                      | 確認方法              |
| ------------------------------------------------- | --------------------- |
| AC-01〜AC-07 が全件 PASS                          | Unit Test             |
| 全テスト（Phase 4, 6 のテストケース含む）が Green | `pnpm test`           |
| `pnpm typecheck` が PASS                          | TypeScript コンパイル |
| `pnpm lint` が PASS                               | ESLint                |

### セキュリティ品質

| チェック項目                                         | 確認方法       |
| ---------------------------------------------------- | -------------- |
| `ANALYTICS_ENDPOINT_URL` がログに出力されないこと    | コードレビュー |
| fetch に送信するデータが `AnalyticsSendRequest` のみ | コードレビュー |
| HTTP ヘッダに機密情報が含まれないこと                | コードレビュー |

### アーキテクチャ品質

| チェック項目                                                    | 確認方法       |
| --------------------------------------------------------------- | -------------- |
| IPC チャネル定義への変更なし                                    | git diff 確認  |
| `AnalyticsSendRequest` / `AnalyticsSendResponse` 型変更なし     | git diff 確認  |
| `sendToAnalyticsProvider` が `analyticsHandler.ts` に閉じている | コードレビュー |

## 統合テスト連携【必須】

| 確認項目   | 確認内容                                 | 期待結果 |
| ---------- | ---------------------------------------- | -------- |
| 回帰テスト | Phase 4/6 で定義したケースを再実行       | PASS     |
| 静的解析   | `pnpm typecheck` / `pnpm lint`           | PASS     |
| 実行テスト | `pnpm test`                              | PASS     |
| 依存整合   | IPC / env / fetch の契約が変わっていない | PASS     |

## 因果ループ監査

| ループ種別     | 説明                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| 強化ループ     | analytics データが蓄積されるほど、分析精度が向上し、製品改善サイクルが加速する         |
| バランスループ | HTTP 送信失敗が増えても、エラー握り潰し設計により IPC フロー全体への影響をゼロに抑える |

## リスク台帳

| リスク                          | 影響度 | 発生確率 | 対策                                 |
| ------------------------------- | ------ | -------- | ------------------------------------ |
| `ANALYTICS_ENDPOINT_URL` 未設定 | 低     | 高       | 未設定時は静かにスキップ（設計済み） |
| HTTP タイムアウト               | 中     | 中       | AbortController 5000ms（設計済み）   |
| 外部エンドポイント障害          | 低     | 中       | エラー握り潰し設計により影響なし     |
| 環境変数漏洩                    | 高     | 低       | URL のみ使用、認証情報は含まない設計 |

## 参照資料

| 参照資料         | パス                                             | 説明           |
| ---------------- | ------------------------------------------------ | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画     | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ   | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`               | Phase 5 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`               | Phase 5 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                 |
| -------------- | -------------------------------------- | -------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質チェック結果総括 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスクと対策の一覧   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 因果ループの記録     |

## 完了条件

- [ ] 品質チェックリストの全項目が PASS または N/A であること
- [ ] リスク台帳が完成していること
- [ ] 因果ループ（強化・バランス各1本以上）が記録されていること
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列品質確認
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全品質基準が PASS であることを確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 10: 最終レビューゲート
