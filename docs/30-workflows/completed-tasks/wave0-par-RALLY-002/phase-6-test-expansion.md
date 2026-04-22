# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

実装後のテスト状況を確認し、異常系・境界値テストを追加する。

## 実行タスク

1. Phase 4 で扱えなかった境界・異常系を追加する
2. 回帰テストを実行し、優先ルールとクリア条件の安定性を確認する
3. 見つかった揺らぎを Phase 7 以降へ引き継ぐ

## テスト拡充方針

Phase 4 で作成した正常系シナリオテストに加え、以下の異常系・境界値ケースを追加する。

| 追加シナリオ                                                           | 期待結果                                                             | 優先度 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| restoredPendingRequest が null の状態で awaitingUserInput が更新された | setRestoredPendingRequest が呼ばれない                               | 高     |
| awaitingUserInput が null → 非 null → null と変化した                  | クリア後に null になっても restoredPendingRequest は再セットされない | 中     |
| requestId が同じ値で awaitingUserInput が更新された                    | useEffect が再実行されない（deps の安定性確認）                      | 中     |

## 回帰テスト確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose

# ConversationalInterviewに関連するテストのみ実行
pnpm --filter @repo/desktop test -- --reporter=verbose ConversationalInterview
```

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |

## 統合テスト連携

- expanded cases は Phase 7 の traceability と coverage 根拠になるよう AC に対応付ける
- エッジケースで判明した仕様差分は Phase 8 の軽微整理対象とする

## 多角的チェック観点（AIが判断）

- if思考: snapshot が遅延・重複・null 往復したら何が起きるか
- 水平思考: hook 単体ではなく UI 観測レベルで false green になっていないか
- 帰納的思考: 境界ケースの挙動から本質的な state 契約を再確認できるか

## サブタスク管理

- X-1: 境界ケース追加
- X-2: 回帰実行
- X-3: 失敗要因整理

## 成果物

| 成果物           | パス                                        | 説明                     |
| ---------------- | ------------------------------------------- | ------------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテストケース一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全テスト実行結果         |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | 境界値・異常系テスト結果 |

## 完了条件

- [ ] 異常系・境界値テストを追加した
- [ ] 全テストが通過していることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 7: テストカバレッジ確認
