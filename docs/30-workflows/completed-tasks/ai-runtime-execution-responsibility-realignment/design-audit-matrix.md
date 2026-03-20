# AI Runtime Execution Responsibility 設計監査マトリクス

## 概要

本書は、新パック `ai-runtime-execution-responsibility-realignment` の問題設定、task 分解、依存順、UI/UX 抽象が妥当かを多角的に再監査した結果である。

旧パックの結論をそのまま繰り返すのではなく、**spec-only 派生パックとして再タスク化した構造が本当にエレガントか**を見ている。

今回の結論は次のとおりである。

- 主語を `auth mode` から `execution responsibility` に置き換えた点は正しい
- 9 task 分解は概ね MECE で、mainline / review harness / legacy / governance の分離も妥当である
- 破綻しやすいのは task 分解そのものではなく、`用語 drift`、`status drift`、`canonical drift` である
- よって成功条件は「大きな再設計」ではなく、**contract と governance を最後まで閉じ切ること**にある

## 総合判定

| 判定軸           | 結論               | 補足                                                                                           |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| 問題設定の正しさ | 妥当               | 実装漏れの主因を `auth mode 表示` ではなく `execution responsibility` の未整流と見たのは正しい |
| 抽象のエレガンス | 良好               | contract / policy / mainline / legacy / governance の分解は筋が良い                            |
| UI/UX 一貫性     | 良好寄り           | 親 UI/UX 正本を新パックでも持つ構造は有効                                                      |
| 依存順           | 良好               | Task01 -> Task02 -> mainline -> bridge -> harness/legacy -> governance は防御的に正しい        |
| 関心ごとの分離   | 良好               | mainline と review harness を分けた点が特に有効                                                |
| system spec 整合 | 良好だが要継続監視 | `.claude` canonical と workflow docs の二層構造は適切だが drift 余地は残る                     |

## 問題設定の再定義

| 項目              | 判定                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| 旧問題設定        | `auth mode toggle` をどう統一するか                                          |
| 新問題設定        | どの surface で、誰が、どの lane で AI を実行するかをどう固定するか          |
| 正しい主語        | `execution responsibility`                                                   |
| 正しい authority  | Task01 contract + Task02 policy                                              |
| renderer の責務   | policy が返す capability / reason / action を表示する                        |
| governance の責務 | spec_created から completed までの status / bridge / same-wave sync を閉じる |

## 多角的監査結果

| 思考観点             | 主質問                                         | 結論                                                                                                             |
| -------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 批判的思考           | 本当に 9 task 必要か                           | 必要である。1 task に戻すと mainline / legacy / governance が再混線する                                          |
| 演繹思考             | local 判定禁止なら何が必要か                   | Task02 の central policy と DTO 契約が必要である                                                                 |
| 帰納的思考           | 既存漏れはどこに集中していたか                 | Settings、Workspace guidance、Terminal surface、Transcript provenance、ChatPanel、Slide、Governance に偏っていた |
| アブダクション       | 最も説明力が高い構造は何か                     | `auth mode` の整理ではなく `execution responsibility` の再配線が最も自然である                                   |
| 要素分解             | 何を分けるべきか                               | contract、policy、mainline UI、manual terminal、bridge、review harness、legacy、governance                       |
| MECE                 | task 分解に漏れや重複はあるか                  | 大枠は網羅的。Task06 bridge と Task09 governance の分離も妥当                                                    |
| メタ思考             | 設計 task と実装 task を混ぜていないか         | 新パックは spec-only と明示しており整理されている                                                                |
| ブレインストーミング | 代替構造はあるか                               | 旧パックを直接追補する案もあるが、残課題が分散しすぎて再利用性が低い                                             |
| 水平思考             | 別の切り口の方が自然か                         | `surface` 切りより `lane + concern` 切りの方が依存順を説明しやすい                                               |
| 逆説思考             | governance を省くとどうなるか                  | spec_created が増えるほど canonical drift が再発する                                                             |
| システム思考         | Task01-09 は因果でつながるか                   | contract drift -> policy drift -> UI drift -> governance drift の因果連鎖を切る構造になっている                  |
| 垂直思考             | codepath まで落ちるか                          | 各 task index が具体 codepath を持っており実装 handoff に落とせる                                                |
| 類推思考             | terminal lane は何に近いか                     | background AI engine ではなく IDE 内 terminal / manual tool lane に近い                                          |
| if 思考              | mainline 回復前に harness を直したらどうなるか | 補助 panel が主役化し、責務が逆転する                                                                            |
| 素人思考             | 初見ユーザーに説明しやすいか                   | `ここで実行` / `terminal で続ける` / `設定を見る` の三択に寄せたのは直感的である                                 |
| トレードオン思考     | compliance と usability は両立するか           | terminal lane を manual に固定すれば両立しやすい                                                                 |
| プラスサム思考       | API 利用者と terminal 利用者の両方を救えるか   | mainline と manual lane を併存させているため可能                                                                 |
| 2軸思考              | 何を 2 軸で見るべきか                          | `実行責任(app/user)` × `準備状態(ready/blocked/unavailable)`                                                     |
| 価値提案思考         | ユーザー価値は何か                             | 「今どこで動くか分かる」「次の一手が 1 つに絞られる」                                                            |
| why 思考             | なぜ新パックを分けるのか                       | 旧パックの audit 結果を implementation-ready な task 群へ落とすため                                              |
| 改善思考             | 最小変更で何を直せるか                         | root docs の正本化、用語正規化、Task09 の governance 明示                                                        |
| 戦略的思考           | 着手順は妥当か                                 | foundation -> policy -> mainline の順は最も再発が少ない                                                          |
| ダブル・ループ思考   | 前提自体を修正できているか                     | `auth mode` 問題ではなく `execution responsibility` 問題だと再定義した点が重要                                   |
| 抽象化思考           | 再利用可能な抽象は何か                         | capability card、guidance block、handoff card、provenance chip、governance table                                 |
| プロセス思考         | 再現可能な進め方か                             | Phase 1-3 gate と lane 別優先順位が再現性を持つ                                                                  |
| 仮説思考             | まだ危険な点は何か                             | Task09 を後回しにして未完にする運用リスク                                                                        |
| 論点思考             | 最初に固定すべき問いは何か                     | 「誰が実行するか」「この画面で何をさせるか」の 2 問                                                              |
| 因果関係分析         | drift は何を生むか                             | surface ごとの文言差、CTA 差、status 誤認、完了定義の崩壊                                                        |
| 因果ループ           | drift はどう増幅するか                         | root docs 不一致 -> task spec 差分 -> 実装解釈差 -> follow-up 増加 -> governance さらに複雑化                    |
| KJ法                 | 情報はどう束ねるべきか                         | `契約基盤`, `mainline recovery`, `manual lane`, `governance closure` の 4 クラスタが自然                         |

## KJ法クラスタ

| クラスタ           | 内容                                                    | 判定                   |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| 契約基盤           | capability、状態語彙、CTA 契約、policy authority        | 良好                   |
| mainline recovery  | Settings / Shell / Chat / Workspace / Transcript の回復 | 良好                   |
| manual lane        | terminal surface、docs consumer、slide fallback         | 良好だが用語固定が必要 |
| governance closure | bridge、status、backlog、lessons、same-wave sync        | 要重視                 |

## 矛盾・漏れ・整合性監査

| 項目                                    | 判定         | 内容                                                                                      |
| --------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| 問題設定と task 分解                    | 整合         | contract -> policy -> surface -> governance の順に落ちている                              |
| spec-only と task 内容                  | 整合         | 実装を要求せず、implementation-ready までを対象にしている                                 |
| mainline と harness の分離              | 整合         | Task07 を後段に置いた判断は妥当                                                           |
| terminal-only と guidance-only          | 要改善       | UI/UX docs で意味差を固定し続ける必要がある                                               |
| transcript bridge の位置                | 整合         | Task04/05 の後に Task06 を置く順は自然                                                    |
| legacy lane の扱い                      | 整合         | Slide / Modifier を mainline と分けたのは正しい                                           |
| governance lane の optional 化          | 不整合リスク | 実装が始まると Task09 が軽視されやすい。必須出口と明示し続ける必要がある                  |
| system spec と workflow docs の二重管理 | 管理可能     | `.claude` canonical、`docs/30-workflows` parent docs の役割分離が明示されていれば問題ない |

## 依存関係監査

| 観点                   | 判定 | 内容                                                                          |
| ---------------------- | ---- | ----------------------------------------------------------------------------- |
| Task01 先行            | 妥当 | capability と CTA 契約が無いと下流がすべて drift する                         |
| Task02 先行            | 妥当 | local 判定禁止を実体化する中心 task である                                    |
| mainline 並列化        | 妥当 | Task03-05 は policy 固定後なら並列に設計できる                                |
| Task06 の位置          | 妥当 | transcript share は terminal と chat の両方を前提にするため中間に置くのが自然 |
| Task07 / Task08 後段化 | 妥当 | 補助 panel と legacy cleanup を mainline より遅らせるのは正しい               |
| Task09 最終化          | 妥当 | ただし「最後だから未着手でよい」にはしない必要がある                          |

## システム仕様との整合監査

| 観点                         | 判定          | 内容                                                                                                                                                                                                          |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| canonical workflow 参照      | 要改善 → 是正 | current canonical は `workflow-ai-runtime-execution-responsibility-realignment.md` に統一し、`workflow-ai-runtime-authmode-unification.md` は predecessor として扱う方が searchability と責務分離の両面で自然 |
| Settings core 参照           | 妥当          | Task03 に必要な public shell / bypass / health row と整合する                                                                                                                                                 |
| Agent execution core 参照    | 妥当          | Task05 の TerminalHandoffCard / manual lane パターンと接続しやすい                                                                                                                                            |
| task-workflow / lessons 参照 | 必須          | Task09 が same-wave sync を担うため依存は妥当                                                                                                                                                                 |
| 旧パック docs 参照           | 妥当          | 問題設定と UX 語彙の参照元として残す価値がある                                                                                                                                                                |

## 改善優先順位

1. root docs 4 本を Task01-09 と完全対応させる
2. `terminal-only` と `guidance-only` の意味差を UI/UX 正本で固定する
3. `primary CTA 1個 + secondary CTA 1個` を全 surface へ強制する
4. `mainline > review harness > legacy` の優先順位を親 index に明示し続ける
5. Task09 を optional に見せないよう、status 定義と same-wave sync を強く固定する
6. `.claude` canonical と `docs/30-workflows` parent docs の責務境界を毎回明示する

## 最終結論

- この新パックは **正しい**。旧パックの audit 結果を implementation-ready な task 群へ変換する役割として、十分に筋が通っている。
- この設計は **エレガント寄り** である。特に `contract / policy / mainline / bridge / harness / legacy / governance` の分離が効いている。
- 最大のリスクは構造ではなく、**用語 drift / status drift / canonical drift** である。
- したがって改善の中心は、新たな大分解ではなく **親ドキュメントの正本化と Task09 governance の徹底** にある。
