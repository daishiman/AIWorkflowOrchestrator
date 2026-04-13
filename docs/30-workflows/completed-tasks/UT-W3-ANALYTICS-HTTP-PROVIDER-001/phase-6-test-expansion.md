# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 6                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 5                                              |
| 後続Phase  | Phase 7                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・fail path・回帰 guard を拡充する。

## 背景

Phase 5 で基本実装が完成し、TC-01〜TC-08 がすべて Green になった。本 Phase ではより堅牢なテストカバレッジを確保する。

## 実行タスク

- エッジケース、fail path、回帰 guard を追加する
- 既存テストとの重複を避けつつ異常系を拡充する
- 追加ケースの coverage と命名を整理する
- 完了条件を満たすまで再実行する

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                               |
| ---------- | ------------------ | ------------------------------------ |
| SubAgent-A | エッジケーステスト | 境界値・特殊文字・空ペイロードテスト |
| SubAgent-B | fail path テスト   | ネットワーク断・HTTP 4xx/5xx テスト  |
| SubAgent-C | 回帰 guard         | 既存 IPC フロー回帰テスト            |
| SubAgent-D | 統合判定           | 網羅率・命名整合確認                 |

## 追加テストケース

| ID     | テストケース                                                             | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| TC-E01 | 空 payload `{}` で HTTP POST が成功すること                              | High   |
| TC-E02 | eventName に特殊文字が含まれる場合でも動作すること                       | Medium |
| TC-E03 | HTTP 4xx レスポンスを受け取った場合の動作確認                            | High   |
| TC-E04 | HTTP 5xx レスポンスを受け取った場合の動作確認                            | High   |
| TC-E05 | タイムアウト後に fetch が再試行されないこと                              | High   |
| TC-R01 | オプトアウト状態が変化しても IPC 全体が動作すること                      | High   |
| TC-R02 | URL 未設定 / 空文字でも validateRequest と送信スキップが正常動作すること | Medium |
| TC-R03 | `registerAnalyticsHandlers` を複数回呼んでも重複登録しないこと           | High   |

## 統合テスト連携【必須】

拡張したテストを Phase 4 の契約に結び付ける:

| 統合ポイント | 検証内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| fail path    | HTTP 4xx / 5xx / timeout でも IPC 応答が壊れない                 |
| 回帰 guard   | opt-out / validation / handler registration の既存挙動を維持する |
| coverage     | Phase 7 の網羅率確認で未到達を消す                               |

## 参照資料

| 参照資料           | パス                                        | 説明           |
| ------------------ | ------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| Red 結果           | `outputs/phase-4/red-test-result.md`        | Phase 4 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| HTTP送信モック設計 | `outputs/phase-4/http-mock-design.md`       | Phase 4 成果物 |
| 契約差分           | `outputs/phase-5/contract-diff.md`          | Phase 5 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加テスト一覧と設計   |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 既存テスト回帰確認     |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | エッジケーステスト結果 |

## 完了条件

- [ ] TC-E01〜TC-E05、TC-R01〜TC-R03 のテストが追加されていること
- [ ] 既存テスト（TC-01〜TC-08）が回帰していないこと
- [ ] 全追加テストが Green になっていること
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列テスト追加
3. SubAgent-D の統合判定
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

Phase 7: テストカバレッジ確認
