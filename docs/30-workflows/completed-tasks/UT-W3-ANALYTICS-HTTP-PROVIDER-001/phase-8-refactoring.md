# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 8                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 7                                              |
| 後続Phase  | Phase 9                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

動作を変えずに `analyticsHandler.ts` のコード品質を向上させる。重複除去、可読性向上、責務境界の明確化を行う。

## 背景

Phase 7 でカバレッジが確認された。本 Phase では機能を損なわずにコード品質を向上させる。変更は最小限に抑え、テストが通ることを確認する。

## 実行タスク

1. `analyticsHandler.ts` の重複と責務境界を見直す。
2. `sendToAnalyticsProvider` の内部処理を整理し、定数と helper を抽出する。
3. HTTP 送信失敗時も `success: true` と呼び出し元応答を維持する。
4. リファクタ後に回帰テストを実行し、差分が挙動を変えていないことを確認する。
5. `refactoring-plan.md` / `post-refactor-test-plan.md` / `responsibility-boundary-map.md` を更新する。

## リファクタリング観点

| 観点         | 確認内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| 重複除去     | `sendToAnalyticsProvider` に重複ロジックがないか                 |
| 可読性       | 条件分岐が明瞭か（早期 return パターンの活用）                   |
| 定数化       | タイムアウト値（5000ms）を定数に抽出すべきか                     |
| 型安全性     | `any` 型が使用されていないか                                     |
| コメント整理 | TODO コメントが削除されているか                                  |
| JSDoc        | JSDoc コメント内に `*/` が含まれていないか（esbuild エラー回避） |

## 統合テスト連携【必須】

| 確認項目 | 確認内容                                                | 期待結果 |
| -------- | ------------------------------------------------------- | -------- |
| 回帰     | `analytics:send` の返却契約と既存フローが変わっていない | PASS     |
| 非伝播   | HTTP 失敗時でも throw せず、IPC 応答を壊さない          | PASS     |
| 定数化   | タイムアウト値と env 参照が helper 内に閉じている       | PASS     |
| 依存境界 | `sendToAnalyticsProvider` が内部責務から漏れていない    | PASS     |

## 変更記録形式

| 対象                                 | Before               | After                               | 理由               |
| ------------------------------------ | -------------------- | ----------------------------------- | ------------------ |
| タイムアウト値                       | `5000`（インライン） | `const ANALYTICS_TIMEOUT_MS = 5000` | 可読性・変更容易性 |
| ※ 変更がない場合は「変更なし」と明記 | -                    | -                                   | -                  |

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| HTTP送信設計           | `outputs/phase-2/http-send-design.md`             | Phase 2 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`             | Phase 6 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |
| 未到達分析             | `outputs/phase-7/unreached-analysis.md`           | Phase 7 成果物 |

## 成果物

| 成果物         | パス                                             | 説明                      |
| -------------- | ------------------------------------------------ | ------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Before/After テーブル形式 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後テスト手順    |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 責務の境界図              |

## 完了条件

- [ ] リファクタ後も全テストが Green であること
- [ ] `pnpm typecheck && pnpm lint` が PASS すること
- [ ] 変更記録が `対象/Before/After/理由` テーブル形式で記録されていること
- [ ] JSDoc コメント内に `*/` が含まれていないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. リファクタ対象の洗い出し
2. リファクタ実施
3. 再テスト確認
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全テストが Green であることを確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 9: 品質保証
