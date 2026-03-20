# AI Runtime / Access Surface 設計監査マトリクス

## 概要

本書は、`AI Runtime / Access Surface Realignment` の問題設定と設計抽象が本当に妥当かを、多角的に再監査した結果である。

今回の結論は単純な `auth mode` 見直しではない。
本質は、`認証方式の統一` ではなく **`実行責任の再配線`** である。

- アプリが自動実行する lane は `Integrated API Runtime`
- ユーザーが自分で実行する lane は `Claude Code Terminal Surface`
- Renderer は local 判定を持たず、Main が capability を決める

## 総合判定

| 判定軸           | 結論                 | 補足                                                                                              |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| 問題設定の正しさ | 概ね妥当             | `auth mode toggle` が実行責任と資格情報種別を混同していた、という診断は正しい                     |
| 抽象のエレガンス | 良好だが要純化       | `access matrix` は良いが、移行期語彙と運用追補が混ざると純度が落ちる                              |
| UI/UX 一貫性     | 部分良好             | `ready / blocked / unavailable` は良いが、`toggle`, `handoff`, `terminal-only` の扱いにズレがある |
| 依存順           | 良好                 | `Task01 -> Task02 -> 下流` の順は妥当                                                             |
| 関心ごとの分離   | 良好だが運用混線あり | task 分解はよいが、completed / follow-up / drift 記録の置き場に混線がある                         |
| 実装現実との整合 | 問題設定は正しい     | ただし本線 UI と review harness を同列に扱うと過剰設計になりやすい                                |

## 問題設定の再定義

| 項目                   | 判定                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| 旧問題設定             | `subscription` / `api-key` toggle をどう整えるか                    |
| 再定義後の問題         | どの surface で、誰が、どの lane で AI を実行するかをどう明示するか |
| 正しい主語             | `auth mode` ではなく `execution responsibility`                     |
| 正しい source of truth | Main Process の capability resolver                                 |
| Renderer の責務        | capability を消費し、状態・CTA・guidance を表示する                 |

## 多角的監査結果

| 思考観点             | 主質問                                               | 結論                                                                                              |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 批判的思考           | 問題は本当に `auth mode` か                          | それだけではない。真因は `実行責任` と `認証種別` の混同である                                    |
| 演繹思考             | local 判定禁止なら何が必要か                         | Main に capability 権威を集約し、Renderer は表示専用に寄せる必要がある                            |
| 帰納的思考           | 既存 surface の drift から何が言えるか               | Settings / Terminal / Chat 系で責務が分散しており、問題設定は実在する                             |
| アブダクション       | 一番筋の良い説明は何か                               | `auth mode 統一` より `実行責任の再配線` と捉える方が全体を説明できる                             |
| 要素分解             | 何を分けるべきか                                     | capability、state、CTA、禁止事項、follow-up 運用を分けるべきである                                |
| MECE                 | Task01-10 の分割に漏れや重複はあるか                 | 大枠は網羅的だが、follow-up 配置と一部 path drift に重複/混線がある                               |
| メタ思考             | 監査対象が混ざっていないか                           | 設計評価と運用台帳が同じ文脈に入り始めている                                                      |
| ブレインストーミング | 代替構造はあるか                                     | `toggle 維持`, `provider-first`, `terminal を裏実行 lane 化` が候補だが、現行案が最も事故が少ない |
| 水平思考             | 別の入口の方が自然ではないか                         | `access matrix` を中心に据える方が `toggle` より自然である                                        |
| 逆説思考             | 逆に全部を 1 toggle に戻すとどうなるか               | silent fallback と責務混線が再発する                                                              |
| システム思考         | Settings / Chat / Skill / RAG は同じ語彙でつながるか | `capability / handoff / guidance` を軸にすれば接続できる                                          |
| 垂直思考             | 具体根拠まで落ちるか                                 | 主要論点は docs / workflow / code の 3 層で根拠化できる                                           |
| 類推思考             | terminal は何に似ているか                            | API engine ではなく IDE 内 terminal に近い                                                        |
| if 思考              | API key がない場合でも構造は壊れないか               | `guidance` または `handoff` に落とせば壊れない                                                    |
| 素人思考             | 初見ユーザーが迷わないか                             | `自動実行` と `手動 terminal` を分ける方向は直感的である                                          |
| トレードオン思考     | compliance と利便性は両立するか                      | `API は app`, `terminal は user` に分ければ両立しやすい                                           |
| プラスサム思考       | Claude Code 利用者も API 利用者も救えるか            | terminal を first-class にすれば両方の需要を捨てずに済む                                          |
| 2軸思考              | 何を 2 軸で見るべきか                                | `実行責任(app/user)` と `準備状態(ready/blocked/unavailable)` を分けるべきである                  |
| 価値提案思考         | ユーザー価値は何か                                   | 「今どこで実行されるか分かる」「次の一手が 1 つに絞られる」である                                 |
| why 思考             | なぜ旧 toggle が悪いか                               | 実行責任の説明責任を果たせないからである                                                          |
| 改善思考             | 最小変更でどこを直すべきか                           | 用語正規化、state/CTA 契約の固定、canonical 再正規化が先である                                    |
| 戦略的思考           | 着手順は妥当か                                       | foundation → terminal boundary → mainline UI の順が最も安全である                                 |
| ダブル・ループ思考   | 個別修正ではなく前提まで直せているか                 | `toggle モデル自体が誤り` と再定義した点は妥当である                                              |
| 抽象化思考           | 再利用できる抽象は何か                               | capability card、runtime banner、handoff card、guidance block である                              |
| プロセス思考         | 再現可能な進め方か                                   | Phase gate と parent 正本の構造は再現性が高い                                                     |
| 仮説思考             | まだ危ない点は何か                                   | `terminal-only` の扱い、`toggle` の移行期語彙、follow-up 完了定義である                           |
| 論点思考             | 先に決めるべき問いは何か                             | 「誰が実行するのか」「その画面で何をさせるのか」の 2 問である                                     |
| 因果関係分析         | 分かりにくい設定が何を生むか                         | 誤成功、誤認、surface ごとの差分実装、保守コスト増を生む                                          |
| 因果ループ           | drift はどう増幅するか                               | 用語 drift -> 実装 drift -> follow-up 増加 -> docs 肥大化 -> さらに drift する                    |
| KJ法                 | 情報をどう束ねるべきか                               | `責務境界`, `語彙/状態`, `導線`, `仕様同期` の 4 クラスタに分けるのが自然である                   |

## KJ法クラスタ

| クラスタ    | 内容                                                                         | 判定                   |
| ----------- | ---------------------------------------------------------------------------- | ---------------------- |
| 責務境界    | API runtime と terminal surface の責務分離、Main/Renderer の権威境界         | 良好                   |
| 語彙 / 状態 | `ready / blocked / unavailable`, `handoff`, `terminal-only`, `toggle` の定義 | 要改善                 |
| 導線        | Settings access card、persistent terminal launcher、manual share、CTA 契約   | 良好だが用語統一が必要 |
| 仕様同期    | canonical、bridge、follow-up、completed ledger、legacy API 終了条件          | 要改善                 |

## 矛盾・漏れ・整合性監査

| 項目                   | 判定   | 内容                                                                                           |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| 問題設定と抽象         | 整合   | `toggle` ではなく `access matrix` が正しい抽象という結論は妥当                                 |
| `toggle` の位置づけ    | 不整合 | `toggle を捨てる` と `トグル状態を同期する` が同居している。移行期語彙か恒久語彙かを明記すべき |
| `handoff` の意味       | 要改善 | `terminal へ作業委譲` と `中断後の復帰` が混ざる余地がある                                     |
| `terminal-only` の扱い | 要改善 | 図解側にあるが、状態語彙・CTA 契約への写像が弱い                                               |
| CTA 契約               | 要改善 | 各 state でボタンが増えすぎない制約を明文化した方がよい                                        |
| Step-01 canonical      | 不整合 | foundation bridge が Task05 source report を指しており、概念トレーサビリティが弱い             |
| 運用追補の置き場       | 要改善 | validator 実値や drift 記録が抽象 docs に入り込むと純度が下がる                                |

## 依存関係監査

| 観点                   | 判定   | 内容                                                                                          |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------- |
| foundation 先行        | 妥当   | Task01 を gate に置く構造は正しい                                                             |
| terminal boundary 先行 | 妥当   | Task02 を早めに固定するのは下流の誤配線を防ぐ                                                 |
| mainline UI 優先       | 要明記 | `SettingsView`, `AppLayout`, `ChatView`, `WorkspaceChatPanel` を優先対象と明示した方がよい    |
| review harness の扱い  | 要改善 | production mainline と同じ重みで扱うと過剰設計になる                                          |
| follow-up 完了定義     | 要改善 | `design 完了`, `implementation 完了`, `follow-up open`, `follow-up closed` を分離した方がよい |

## 改善優先順位

1. 問題設定の主語を `auth mode` から `実行責任の再配線` へ明示的に言い換える
2. `toggle` を移行期の互換 UI と定義し、最終形は `capability card` 中心だと固定する
3. `handoff = terminal へ作業委譲`、`cancel = 同一 surface 上の実行中断` と用語を固定する
4. `実行責任(app/user)` × `準備状態(ready/blocked/unavailable)` の 2 軸マトリクスを共通契約にする
5. `primary CTA 1個 + secondary CTA 1個` を原則化し、状態ごとの CTA 衝突を防ぐ
6. Step-01 bridge の canonical を foundation 主題の正本へ張り替える
7. 運用台帳の追補と抽象 docs を分離し、設計資料の純度を保つ

## 最終結論

- この問題設定は **正しい**。ただし名前より中身が重要であり、真のテーマは `auth mode unification` ではなく **`execution responsibility realignment`** である。
- この設計は **エレガント寄り** である。特に `access matrix + manual terminal surface + parent UI/UX 正本` の組み合わせは筋が良い。
- 破綻点は抽象そのものではなく、**用語 drift**, **canonical drift**, **follow-up 完了定義の曖昧さ** に集中している。
- よって改善の中心は、大きな再設計ではなく **語彙の正規化・権威境界の固定・bridge/canonical の整流** である。
