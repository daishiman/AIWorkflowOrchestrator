# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 6                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 5                      |
| 後続Phase  | Phase 7                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

Phase 4 の基本テストを拡充し、計装のエッジケース・回帰テストで品質を高める。

## 拡充テストケース

### skill_wizard_started エッジケース

| ケース                                     | 期待結果                                                   |
| ------------------------------------------ | ---------------------------------------------------------- |
| 空 payload で発火すること                  | `{}` で発火し、余計なキーを持たないこと                    |
| 同一マウントの rerender では重複しないこと | `skill_wizard_started` は 1 回だけ発火すること             |
| StrictMode の dev-only 二重マウント        | テストハーネスで除外し、prod 想定の 1 回発火を確認すること |

### skill_wizard_step1_completed エッジケース

| ケース                                               | 期待結果                                            |
| ---------------------------------------------------- | --------------------------------------------------- |
| Q1 の時点でスキップした場合                          | `skippedAtQuestion: 1` が記録されること             |
| Q6（最終問）回答後に生成した場合                     | `skippedAtQuestion: null` かつ `method: "complete"` |
| skip と complete で trackEvent が1回だけ呼ばれること | 二重発火しないこと                                  |

### skill_wizard_generation_completed エッジケース

| ケース                                       | 期待結果                                               |
| -------------------------------------------- | ------------------------------------------------------ |
| LLM 生成失敗時に trackEvent が呼ばれないこと | エラー時はイベント未発火                               |
| `hasExternalIntegration` が true の場合      | boolean として正しく記録されること                     |
| `hasExternalIntegration` が false の場合     | boolean として正しく記録されること                     |
| 異なる category でのイベント発火             | category フィールドが formData.category と一致すること |

### skill_skeleton_quality_feedback エッジケース

| ケース                                | 期待結果                                          |
| ------------------------------------- | ------------------------------------------------- |
| 複数回フィードバックを送信した場合    | 送信回数分だけ trackEvent が呼ばれること          |
| satisfied=true の後に satisfied=false | 各回のペイロードが正確に記録されること            |
| generationMethod が "skip" の場合     | `generationMethod: "skip"` が正確に記録されること |

### skill_wizard_next_action 回帰テスト

| ケース                                            | 期待結果                                          |
| ------------------------------------------------- | ------------------------------------------------- |
| 3種類のアクションが全て trackEvent を発火すること | execute/open_editor/create_another が全て確認可能 |
| アクション選択後に onNextAction が呼ばれること    | trackEvent の後に onNextAction が呼ばれる順序     |

### trackEvent スタブ回帰テスト

| ケース                                                          | 期待結果                        |
| --------------------------------------------------------------- | ------------------------------- |
| 本番環境（NODE_ENV=production）で console.info が呼ばれないこと | 本番では console 出力がないこと |
| 空 payload の started イベントで例外にならないこと              | `{}` をそのまま受け付けること   |

## 統合テスト連携

- Phase 4 の Red テストに対して edge case を追加し、TC-01〜TC-09 の呼び出し回数を固定する。
- Phase 9 の StrictMode / production 差分は、テストハーネスで dev-only 二重マウントを切り分けて確認する。
- Phase 11 の NON_VISUAL 証跡では、console 出力の回数と payload が一致することを確認する。
- `skill_wizard_started` は source 依存がないため、空オブジェクトの一致だけを確認する。

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |

## 実行タスク

1. Phase 5 成果物を確認する。
2. 各計装ポイントのエッジケーステストを追加する。
3. trackEvent スタブ回帰テストを追加する。
4. 全テストが Green であることを確認する。

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | エッジケース一覧       |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰テスト実行結果     |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | エッジケーステスト結果 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 5計装ポイントのエッジケーステストが追加されていること
- [ ] trackEvent スタブの回帰テストが追加されていること
- [ ] 全テストが Green であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 各計装ポイントのエッジケーステスト追加
3. スタブ回帰テスト追加
4. 全テスト Green 確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
