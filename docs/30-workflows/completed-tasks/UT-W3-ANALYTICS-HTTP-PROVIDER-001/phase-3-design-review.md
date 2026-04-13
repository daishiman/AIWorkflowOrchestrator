# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 3                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 2                                              |
| 後続Phase  | Phase 4                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

Phase 2 の設計が Phase 4（テスト作成）に進めるか判定する。MAJOR 指摘がある場合は Phase 2 へ差し戻す。

## 背景

HTTP 送信の設計に矛盾・漏れ・整合性問題・依存整合問題がないことを検証する。

## レビュー観点

| 観点             | 確認内容                                                              |
| ---------------- | --------------------------------------------------------------------- |
| 責務境界         | `sendToAnalyticsProvider` が analyticsHandler 内に閉じているか        |
| IPC 契約非破壊性 | 既存チャネル・型定義が変更されていないか                              |
| エラー非伝播     | catch が送信経路の末尾にあり、HTTP 失敗でも呼び出し元応答を壊さないか |
| タイムアウト     | AbortController による 5000ms タイムアウトが設計に含まれているか      |
| 環境変数設計     | `ANALYTICS_ENDPOINT_URL` 未設定時のフォールバックが明記されているか   |
| テスト可能性     | fetch モック戦略が定義されていること                                  |
| 型安全性         | 新規追加部分に any 型がないこと                                       |

## ゲート判定基準

| 判定  | 条件                                     | アクション               |
| ----- | ---------------------------------------- | ------------------------ |
| PASS  | MAJOR 指摘 0 件                          | Phase 4 へ進む           |
| MINOR | 軽微な改善提案のみ                       | Phase 4 継続・未タスク化 |
| MAJOR | 責務境界・型安全性・IPC 破壊性に問題あり | Phase 2 差し戻し         |

## 統合テスト連携【必須】

レビュー結果を後続テストへ接続する:

| 統合観点 | 確認項目                                                    | 結果                 |
| -------- | ----------------------------------------------------------- | -------------------- |
| 応答契約 | HTTP 失敗時も `success: true` を維持する設計か              | PASS / MINOR / MAJOR |
| 設定契約 | `ANALYTICS_ENDPOINT_URL` の追加が設計に反映されているか     | PASS / MINOR / MAJOR |
| 非伝播   | `sendToAnalyticsProvider` の失敗が IPC 呼び出しを壊さないか | PASS / MINOR / MAJOR |

## 実行タスク

- Phase 2 成果物（architecture-design, http-send-design, test-strategy, dependency-consistency-matrix）を全件レビューする
- 矛盾チェック表を作成する
- ゲート判定を実施する

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| HTTP送信設計         | `outputs/phase-2/http-send-design.md`                        | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |

## 成果物

| 成果物           | パス                                         | 説明                        |
| ---------------- | -------------------------------------------- | --------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー結果と指摘事項      |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR の判定根拠 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 全観点の矛盾確認            |

## 完了条件

- [ ] Phase 2 全成果物のレビュー完了
- [ ] 矛盾チェック表が全項目埋まっていること
- [ ] ゲート判定（PASS/MINOR/MAJOR）が明記されていること
- [ ] MAJOR の場合は差し戻し理由が具体的に記載されていること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 2 全成果物の確認
2. レビュー観点ごとの判定
3. 矛盾チェック表作成
4. ゲート判定
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ゲート判定が明確であること
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 4: テスト作成（PASS の場合）
