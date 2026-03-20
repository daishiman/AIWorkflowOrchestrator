# AI Runtime Execution Responsibility UI/UX Realization

## 概要

本書は、`execution responsibility realignment` を UI/UX に落とし込むための親パック正本である。
目的は、各 surface が「ここで integrated 実行されるのか」「terminal へ handoff するのか」「guidance-only なのか」を、同じ語彙と CTA 契約で示すことにある。

本パックは spec-only workflow であるため、実装差分ではなく **状態・導線・責務境界の契約** を固定する。詳細図解は [ui-ux-diagrams.md](./ui-ux-diagrams.md) を参照する。

## 直感性評価

初見ユーザーにとって難しいのは `auth mode` ではなく、「今ここで AI が動くのか、自分で terminal で続けるのか」の判別である。よって UI/UX では次の 4 点を必須にする。

- どの mainline surface でも terminal 入口を同じ名称で見つけられる
- `ready / blocked / unavailable / handoff / guidance-only` の状態を banner / card で即判別できる
- blocked 時の次アクションは 1 つに絞り、no-op CTA を出さない
- transcript を chat へ渡す時は、常にユーザー明示操作と provenance が見える

## 体験原則

| 原則                  | 内容                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- |
| 実行責任の可視化      | app が実行するのか、user が terminal で実行するのかを常に見せる                     |
| 誤成功の禁止          | silent fallback、見かけ上の成功、background auto-send を許容しない                  |
| mainline 優先         | Settings / Shell / Main Chat / Workspace の回復を review harness より先に扱う       |
| 1画面1判断            | その画面で要求する主判断は `実行` `handoff` `設定` のいずれか 1 つに寄せる          |
| 状態語彙の共通化      | `ready` `running` `streaming` `handoff` `blocked` `unavailable` を横断再利用する    |
| terminal の尊重       | terminal surface は user-operated workspace であり、hidden automation lane ではない |
| provenance の明示     | transcript share は copy-based 手動連携に限定し、出所を chip で示す                 |
| governance の不可視化 | governance lane はユーザー UI に露出させず、開発側の完了条件として閉じる            |

## 共通 UI パターン

| パターン                     | 用途                                             | 必須要素                                                               |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Access Capability Card       | その surface で何が可能かを説明する              | capability 名、現在値、理由、次アクション                              |
| Runtime Banner               | 現在の実行 lane を示す                           | `Integrated Runtime` / `Terminal Handoff` / `Guidance Only` バッジ     |
| Guidance Block               | blocked / unavailable の理由と次アクションを示す | reason、primary action、secondary action                               |
| Handoff Card                 | terminal へ作業を委譲する時に使う                | context summary、suggested command、copy action、open terminal         |
| Persistent Terminal Launcher | どの mainline surface からも terminal を開く     | 共通ラベル `terminal を開く`、固定位置、再入可能                       |
| Transcript Panel             | user-operated terminal session を読む            | session title、status、stdout / stderr、copy / abort / retry           |
| Transcript Share Action      | transcript を chat へ手動連携する                | `選択範囲をチャットへ送る`、`直近出力を添付`、`セッションを貼り付ける` |
| Provenance Chip              | 手動 share の出所を示す                          | source、sharedAt、dismiss / inspect action                             |

## 用語正規化

| 用語           | 固定意味                                                             | 含めない意味                  |
| -------------- | -------------------------------------------------------------------- | ----------------------------- |
| handoff        | この surface では自動実行せず、terminal lane へ作業を委譲する        | cancel、エラー一般、idle 復帰 |
| cancel         | 同一 surface 上の実行中 job / stream を止める                        | terminal への委譲             |
| terminal-only  | primary 実行を持たず、terminal launcher を中心 CTA にする capability | blocked / unavailable と同義  |
| guidance-only  | 実行も handoff も持たず、設定や別 lane の説明だけを返す              | terminal-only と同義          |
| access matrix  | capability / health / next action をまとめて見せる親 UI              | 旧 auth toggle の言い換えだけ |
| auth toggle    | 移行期の互換 UI                                                      | 最終的な source of truth      |
| review harness | mainline 契約を検証・再現する補助 panel                              | 本線 UI                       |

## Lane 別 UI 取り扱い

| lane           | UI 方針                                                                                 | 主担当         |
| -------------- | --------------------------------------------------------------------------------------- | -------------- |
| Foundation     | 直接の画面ではなく、語彙と CTA 契約を供給する                                           | Task01, Task02 |
| Mainline       | 日常導線に必要な capability / guidance / launcher / provenance を実装可能な形で定義する | Task03-Task06  |
| Review harness | mainline を模倣するが、mainline の代替主経路にはしない                                  | Task07         |
| Legacy         | 旧 lane の cleanup と manual fallback を明示する                                        | Task08         |
| Governance     | UI surface を持たず、status / bridge / lessons を閉じる                                 | Task09         |

## Surface 別 UI/UX 定義

| Surface                          | 主ジョブ                                              | 主要 UI                                                       | Primary CTA              | Secondary CTA                | 主要状態                                                 | 主担当 |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | ------------------------ | ---------------------------- | -------------------------------------------------------- | ------ |
| Settings / Shell Access Matrix   | 現在の実行責任と準備状態を把握する                    | access cards、health row、provider summary、terminal launcher | API key を設定           | terminal を開く              | ready / missing-key / health-warning / unavailable       | Task03 |
| Main Chat Guidance Surface       | main chat で reason-aware に送信判断する              | runtime banner、composer、guidance block                      | 送信する                 | 設定を見る / terminal を開く | ready / streaming / blocked / handoff                    | Task04 |
| Workspace Guidance Surface       | file context 付き chat を実行または handoff する      | context chips、message log、composer、guidance block          | 送信する                 | file add / terminal を開く   | zero / ready / streaming / blocked / handoff / compact   | Task04 |
| Terminal Handoff Surface         | Claude Code terminal を user-operated lane として使う | terminal dock、transcript、action rail、launcher              | terminal を開く          | suggested command をコピー   | collapsed / idle / input-waiting / running / unavailable | Task05 |
| Guidance-only Docs Consumer      | docs consumer を manual lane と接続する               | guidance block、handoff card、context summary                 | terminal を開く          | docs command をコピー        | guidance-only / handoff / unavailable                    | Task05 |
| Transcript Share Bridge          | terminal transcript を chat へ手動共有する            | transcript toolbar、share actions、provenance chip            | 選択範囲をチャットへ送る | 直近出力を添付               | transcript-visible / selection-ready / share-ready       | Task06 |
| ChatPanel Review Harness         | mainline 契約を再現する補助 panel                     | message list、composer、runtime banner、launcher              | 送信する                 | terminal を開く              | review-empty / review-streaming / handoff / blocked      | Task07 |
| Slide / Modifier Manual Fallback | legacy lane を manual fallback へ寄せる               | progress row、guidance block、fallback card                   | reverse-sync を実行      | manual fallback を開く       | synced / running / degraded / guidance                   | Task08 |

## Settings / Shell 改善要求

Task03 では旧監査で残った mainline IA 漏れを、次の契約として固定する。

| 対象領域                | 改善要求                                                               | 受け入れ条件                                           |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Access capability cards | integrated / terminal / unavailable の責務を card 単位で判別可能にする | card だけで current lane と next action が分かる       |
| Health row              | primary health route を明示し、legacy 健康確認経路を混在させない       | `connection 確認` の結果と card 状態が矛盾しない       |
| Provider summary        | provider / selected config / missing key を同じ責務境界に置く          | selected config が有効でも不足キーが残る矛盾を許さない |
| Public shell            | 未認証・タイムアウトでも設定と terminal launcher に到達できる          | review harness を経由せず mainline のまま復帰できる    |
| Launcher                | shell header から terminal 入口を固定化する                            | 画面ごとに別名ボタンへ散らない                         |

## Terminal 常設ルール

| 場所                            | ルール                                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| App Shell Header                | 右上に `terminal を開く` 固定導線を置く                           |
| Chat / Workspace / Docs surface | header または composer 近傍にも同名ボタンを再配置してよい         |
| 表示形態                        | dock / bottom sheet / side panel のいずれかで再入可能にする       |
| session                         | 閉じても transcript は保持し、再度開けば続きが見える              |
| no auto-send                    | terminal surface を開いてもコマンドは自動送信しない               |
| allowed actions                 | `copy command` `copy context` `open working directory` を許可する |
| forbidden actions               | hidden prompt injection、自動再送、headless execution を禁止する  |

## Transcript -> Chat 手動連携ルール

| 項目        | ルール                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| source      | transcript の選択範囲、直近出力、または session 全体                                     |
| destination | Main Chat / Workspace Chat の composer または attachment area                            |
| 操作        | `選択範囲をチャットへ送る` `直近出力を添付` `セッションを貼り付ける` の 3 系統に限定する |
| provenance  | share 後は `terminal transcript から添付` の chip を表示する                             |
| 禁止        | transcript の自動要約、hidden parsing、自動 message 化をしない                           |
| 監査可能性  | sharedAt、source type、session title など最低限の metadata を持つ                        |

## 画面状態マトリクス

| 状態          | 表示ルール                              | CTA                  | 禁止事項                      |
| ------------- | --------------------------------------- | -------------------- | ----------------------------- |
| ready         | なぜ実行できるかを 1 行で示す           | primary CTA を有効化 | 準備条件を hidden にしない    |
| running       | 実行 lane と中断手段を見せる            | cancel / abort       | progress 不明のまま放置しない |
| streaming     | 出力増加を視覚化する                    | stop / latest へ移動 | spinner だけにしない          |
| handoff       | terminal へ渡す理由と引き継ぎ内容を示す | terminal を開く      | 自動送信しない                |
| terminal-only | terminal が primary lane だと示す       | terminal を開く      | blocked と誤表示しない        |
| guidance-only | 実行不能理由と代替導線を示す            | 設定を見る           | retry を主 CTA にしない       |
| unavailable   | インストール不足や構成不足を一文で示す  | setup / install      | blank state にしない          |
| blocked       | この surface では実行しない理由を示す   | alternative path     | no-op CTA を見せない          |
| degraded      | legacy lane で品質低下を明示する        | manual fallback      | 自動復旧したように見せない    |

## CTA 契約

- 各 state の CTA は `primary 1個 + secondary 1個` を上限とする
- `handoff` の primary は `terminal を開く`、secondary は `command をコピー` に寄せる
- `blocked` / `guidance-only` / `unavailable` で `retry` を primary にしない
- `terminal-only` capability は blocked 扱いにしない
- review harness の CTA は mainline と同名にし、別用語を持ち込まない
- legacy lane の CTA は mainline CTA を奪わず、manual fallback を明示する

## UI 部品の責務分離

| UI 領域                   | 持つ責務                                 | 持たない責務              |
| ------------------------- | ---------------------------------------- | ------------------------- |
| Settings / Shell          | capability と next action の説明         | AI 実行そのもの           |
| Chat / Workspace Composer | 入力意図の収集、送信トリガー             | runtime 自己判定          |
| Guidance Block            | reason と action の提示                  | 実行可否ロジックの決定    |
| Main / shared policy      | capability / health / handoff DTO の決定 | renderer 文言の局所最適化 |
| Terminal Surface          | transcript 表示、manual action 補助      | hidden automation         |
| Provenance Chip           | 手動 share の出所明示                    | transcript 本体の要約     |
| Governance docs           | canonical、status、same-wave sync        | ユーザー UI の操作面      |

## マイクロコピー原則

| 場面              | マイクロコピー方針                                                                      |
| ----------------- | --------------------------------------------------------------------------------------- |
| API key 不足      | 「未設定」だけで終わらせず、設定場所と対象 provider を同じブロックに書く                |
| handoff           | 「続きは terminal」ではなく、「この画面では自動実行せず terminal で手動実行する」と書く |
| guidance-only     | 「未対応」ではなく、「設定を見る」「別 lane で続ける」を示す                            |
| terminal launcher | 画面ごとに別名を使わず `terminal を開く` へ統一する                                     |
| transcript share  | `チャットへ送る` は明示操作であることを文言上でも示す                                   |
| degraded legacy   | 自動成功に見える言い回しを避け、「manual fallback が必要」と書く                        |

## アクセシビリティ / 操作性

| 観点            | 方針                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| キーボード      | `Tab` 移動で primary / secondary CTA、copy action、abort に到達できる           |
| フォーカス      | guidance block、handoff card、provenance chip は出現時に見出しへ移れる          |
| 可読性          | status badge は色だけでなく文言でも区別する                                     |
| コンパクト幅    | Workspace / review harness でも CTA と state explanation が折りたたまれ過ぎない |
| transcript 選択 | マウスとキーボード選択の両方で share action に到達できる                        |

## Screenshot 契約

| ID    | 対象                           | 必須状態                                                                         |
| ----- | ------------------------------ | -------------------------------------------------------------------------------- |
| UX-01 | Settings / Shell Access Matrix | integrated ready / missing key / health warning / terminal launcher              |
| UX-02 | Main Chat Guidance             | ready / blocked with actionable guidance / terminal handoff                      |
| UX-03 | Workspace Guidance             | zero state / streaming / compact / blocked action wiring                         |
| UX-04 | Terminal Handoff Surface       | transcript visible / no auto-send / unavailable guidance / docs consumer handoff |
| UX-05 | Transcript Share Bridge        | 3 share actions visible / provenance chip visible                                |
| UX-06 | ChatPanel Review Harness       | review-only role / no placeholder / launcher visible                             |
| UX-07 | Slide / Modifier               | degraded / manual fallback / reverse-sync guidance                               |
| UX-08 | Any Mainline Surface           | persistent terminal launcher visible                                             |

## 仕様同期先

- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
