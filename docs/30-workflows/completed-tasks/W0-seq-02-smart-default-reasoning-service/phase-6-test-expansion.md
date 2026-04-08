# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 5                                        |
| 後続Phase  | Phase 7                                        |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

Phase 5 で Green にしたテストに加え、エッジケース・回帰ガード・組み合わせテストを追加する。

## 実行タスク

1. エッジケーステスト（複数ツール名・空文字・null）を追加する。
2. 回帰ガードテスト（既存 TC が壊れないことを確認）を追加する。
3. フォーマット推論の独立評価テストを追加する。

## 統合テスト連携

- Phase 7 の coverage 対象に新規テストを含める。
- Phase 8 のリファクタリング後も全テストが Green であることを確認する。

## 追加テストケース

| TC-ID | 説明                                                                    | 期待値                            |
| ----- | ----------------------------------------------------------------------- | --------------------------------- |
| TC-16 | purpose = '' かつ category = 'code-support' → format = 'code'           | `result.format === "code"`        |
| TC-17 | purpose = 'Slack毎日通知' → tool = 'slack', timing = 'scheduled'        | 両フィールドが正しく推論される    |
| TC-18 | purpose に 'GitHub' と 'Notion' が両方ある場合 → GitHub 優先            | `result.tool === "github"`        |
| TC-19 | purpose = null（nullable）→ tool = null, timing = null                  | フォールバック動作                |
| TC-20 | 全入力が有効 → inferenceLog に3件（tool/timing/format）すべて記録される | `result.inferenceLog.length >= 3` |

## 検証コマンド

```bash
# 拡充テスト実行
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# 全テスト確認
pnpm --filter @repo/shared test:run
```

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |

## 実行手順

1. Phase 5 の実装済みファイルを確認する。
2. TC-16〜TC-20 のテストを追加する。
3. 全テストを実行し、TC-01〜TC-20 が全て Green であることを確認する。

## 成果物

| 成果物           | パス                                        | 説明                     |
| ---------------- | ------------------------------------------- | ------------------------ |
| 拡充テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテストケース一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 既存テスト継続 PASS 確認 |
| エッジケース結果 | `outputs/phase-6/edge-case-result.md`       | エッジケーステスト結果   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-01〜TC-20 の全テストが Green であること
- [ ] エッジケーステスト（TC-16〜TC-20）が全て PASS であること
- [ ] 回帰ガードが機能していること（既存テスト変更なし）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
