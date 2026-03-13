# AI Runtime / Access Surface 設計監査マトリクス

## 概要

本書は、今回の task pack がエレガントかどうかを多角的に確認した監査結果である。抽象が正しいか、責務が混線していないか、UI/UX が実装可能な粒度か、依存順が壊れていないかを確認する。

## 監査結果

| 思考観点             | 監査質問                                          | 結論                                                                                                 |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 水平思考             | toggle 以外の構造で解けないか                     | `access matrix + terminal surface` へ置換した                                                        |
| 逆説思考             | 「両対応」を目指すほど複雑化していないか          | auto と manual を分けることで単純化した                                                              |
| システム思考         | Settings、Chat、Skill、RAG が同じ語彙でつながるか | capability / handoff / guidance を共通語彙化した                                                     |
| 垂直思考             | source of truth はどこか                          | runtime 判定は Main、表示は Renderer と固定した                                                      |
| 類推思考             | terminal は何に似ているか                         | API engine ではなく IDE 内 terminal と同じ扱いに寄せた                                               |
| if 思考              | API key がない場合でも壊れないか                  | fail-fast と handoff に分岐し、見かけ成功を禁止した                                                  |
| 素人思考             | 初見ユーザーは今何が起きるか分かるか              | capability card と runtime banner を必須にした                                                       |
| トレードオン思考     | compliance と利便性を両立できるか                 | in-app auto 実行は API、Claude Code は manual terminal で両立した                                    |
| プラスサム思考       | 個人利用の terminal 需要を捨てずに整えられるか    | terminal surface を first-class 扱いにした                                                           |
| 2軸思考              | 設定軸は何か                                      | `runtime access` と `provider/model` を別軸にした                                                    |
| 価値提案思考         | ユーザー価値は何か                                | 「今すぐ使える」「次に何をすべきか分かる」を中心にした                                               |
| why 思考             | なぜ旧 auth toggle が悪いか                       | 実行責任と資格情報種別を混同していたため                                                             |
| 改善思考             | どこを最小変更で直せるか                          | parent pack 正本 + surface task への責務配分にした                                                   |
| 戦略的思考           | 後続 task の手戻りをどう減らすか                  | Task01 / Task02 を gate にして下流 task を並列化した                                                 |
| ダブル・ループ思考   | 失敗の原因は実装不足か、前提の誤りか              | 前提である toggle モデル自体が誤りだったと修正した                                                   |
| 抽象化思考           | 再利用できる抽象は何か                            | capability card / handoff card / transcript panel を共通化した                                       |
| プロセス思考         | どの順序なら破綻しないか                          | foundation → terminal → surface integration の順に固定した                                           |
| 仮説思考             | 一番危ない箇所はどこか                            | terminal を自動化レーンとして再混入させることと判断した                                              |
| 論点思考             | この task pack の主要論点は何か                   | 実行責任、UI説明責任、依存順、fallback 禁止の 4 点に絞った                                           |
| 因果関係ループ       | 設定が分かりづらいと何が起こるか                  | silent fallback が増え、trust が落ち、task が肥大化するため分離した                                  |
| ユーザーレビュー思考 | 設定画面の実画面レビューで何を先に直すべきか      | 認証方式カード / SDK APIキー / Provider一覧 の3ブロック整合を Task01+Task06 の必須改善対象に固定した |

## エレガンス判定

| 判定軸       | 判定                                      |
| ------------ | ----------------------------------------- |
| 抽象の正しさ | 良好                                      |
| 責務分離     | 良好                                      |
| UI/UX 実体化 | 改善反映後に良好                          |
| 依存順       | 良好                                      |
| タスク粒度   | UI cross-cutting を親正本へ寄せたため適正 |

## 今回の結論

- UI/UX を別巨大 task にすると cross-cutting 調整 task になりやすく、責務が崩れる
- そのため、親パックで UI/UX 正本を持ち、各 surface task はその実装責務だけを受け取る構造が最もエレガントである
- `subscription/api-key toggle` へ戻さず、`Integrated API Runtime` と `Claude Code Terminal Surface` の 2 系統を維持する
