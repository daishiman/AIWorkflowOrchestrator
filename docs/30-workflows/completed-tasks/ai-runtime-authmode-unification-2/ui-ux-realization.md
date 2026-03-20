# AI Runtime / Access Surface UI/UX Realization

## 概要

本書は `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` を両立させるための UI/UX 正本である。目的は、各 AI surface が「自動実行する場所」「手動 terminal へ渡す場所」「その場では実行せず guidance だけ返す場所」を、ユーザーが迷わず理解できる状態へそろえることにある。

詳細図解は [ui-ux-diagrams.md](./ui-ux-diagrams.md) を参照する。

## 直感性評価

現状の概念だけでは、初見ユーザーにとって `自動実行` と `terminal handoff` の違いはまだ直感的ではない。したがって UI/UX 上は、次の 4 点を必須にする。

- どの画面でも同じ位置から terminal を開ける
- その場で自動実行されるのか、手動 terminal に渡るのかを banner / card で即判別できる
- blocked / unavailable の時も、次に押すべきボタンが 1 つに絞られている
- terminal transcript を chat へ持ち込む時も、ユーザーの明示操作であることが分かる

## 体験原則

| 原則                    | 内容                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| 実行責任の可視化        | アプリが実行するのか、ユーザーが terminal で実行するのかを毎回明示する                  |
| 誤成功の禁止            | silent fallback、見かけ上の成功、背景自動実行を許容しない                               |
| 1画面1判断              | その画面で必要な判断は `実行` `handoff` `保留` のいずれか 1 つに絞る                    |
| 回復導線の同居          | error と guidance は分離せず、次にやる操作を同じ領域に置く                              |
| 状態の共通語彙化        | `ready` `running` `streaming` `handoff` `unavailable` `blocked` を全 surface で使い回す |
| terminal の尊重         | terminal surface は AI 実行エンジンではなく、ユーザー操作の作業場所として扱う           |
| transcript 共有の明示性 | terminal transcript を chat へ渡す時は、ユーザーが明示的に共有操作する                  |

## 共通 UI パターン

| パターン                     | 用途                                | 必須要素                                                               |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| Access Capability Card       | surface ごとの利用可否を説明する    | capability 名、現在値、理由、次アクション                              |
| Runtime Banner               | 実行中の経路を示す                  | `Integrated API Runtime` または `Claude Code Terminal` のバッジ        |
| Handoff Card                 | terminal へ渡すときに使う           | context summary、suggested command、copy action、open terminal         |
| Transcript Panel             | terminal surface の会話を読む       | session title、status、stdout / stderr、abort / retry                  |
| Guidance Block               | 実行不能時の説明                    | failure reason、再設定手順、代替導線                                   |
| Persistent Terminal Launcher | どの画面でも terminal を開ける      | header / panel header / composer 近傍の固定導線、dock toggle           |
| Transcript Share Action      | terminal 出力を chat へ手動連携する | `選択範囲をチャットへ送る`、`直近出力を添付`、`セッションを貼り付ける` |

## 用語正規化

| 用語          | 固定意味                                                             | 含めない意味                     |
| ------------- | -------------------------------------------------------------------- | -------------------------------- |
| handoff       | この surface では自動実行せず、terminal へ作業を委譲する             | cancel、idle 復帰、単なるエラー  |
| cancel        | 同一 surface 上で実行中の job / stream を中断する                    | terminal への委譲                |
| terminal-only | primary 実行を持たず、`terminal を開く` を中心 CTA にする capability | `blocked` / `unavailable` と同義 |
| auth toggle   | 移行期の互換 UI。`access matrix` を補助する表示                      | 最終的な source of truth         |

## Surface 別 UI/UX 定義

| Surface                      | 主ジョブ                         | 主要 UI                                             | Primary CTA         | Secondary CTA                         | 主要状態                                                      | 主担当タスク   |
| ---------------------------- | -------------------------------- | --------------------------------------------------- | ------------------- | ------------------------------------- | ------------------------------------------------------------- | -------------- |
| Settings Access Matrix       | 使える AI surface を把握する     | access capability card 群                           | API key を設定      | terminal を開く                       | ready / missing-key / unavailable / blocked                   | Task01, Task06 |
| Claude Code Terminal Surface | Claude Code を自分で操作する     | terminal pane + transcript + control rail           | terminal を開く     | suggested command をコピー            | idle / input-waiting / running / long-output / unavailable    | Task02         |
| Workspace Chat Edit          | 選択範囲を AI で編集する         | inline action + diff preview + guidance             | 編集案を生成        | terminal handoff を開く               | selection-ready / generating / diff-ready / handoff / blocked | Task03         |
| Skill / Agent / Creator      | スキルを作る、実行する、改善する | lifecycle panel + execution bar + permission dialog | 実行する            | terminal handoff を開く               | preflight / permission / streaming / handoff / failed         | Task04         |
| Skill Docs                   | スキル docs を生成する           | doc generation sheet + result summary               | docs を生成         | guidance を表示                       | ready / generating / timeout / guidance                       | Task05         |
| Main Chat / Settings         | グローバル chat 設定を整える     | selector + access card + health row                 | チャットを使う      | connection を確認 / terminal を開く   | ready / health-warning / model-drift / blocked                | Task06         |
| ChatPanel                    | 単発チャットを行う               | message list + composer + capability banner         | 送信する            | terminal handoff を開く               | empty / streaming / cancelled / handoff / blocked             | Task07         |
| Workspace Chat Panel         | 文脈付き chat を行う             | message log + context chips + composer              | 送信する            | mention / file add / terminal handoff | zero / streaming / cancel / guidance / compact                | Task08         |
| RAG / Embedding / Extraction | backend AI 処理を回す            | status row + fail-fast notice                       | 実行する            | guidance を確認                       | queued / running / failed / blocked                           | Task09         |
| Slide / Modifier             | slide 補助 AI を使う             | sync card + progress row + guidance                 | reverse-sync を実行 | manual fallback を開く                | synced / running / degraded / guidance                        | Task10         |

## 設定画面改善要求（レビュー反映）

2026-03-13 の設定画面レビュー（赤枠 3 領域）を受け、Task01/Task06 の UI 契約へ以下を追加する。

| 対象領域                                    | 改善要求                                                                                                              | 受け入れ条件                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 認証方式カード（Claude Agent SDK 認証方式） | 移行期にトグルを残す場合でも capability ステータス表示を同時更新し、語彙を `ready / blocked / unavailable` に統一する | トグル変更時にカード表示が遅延なく更新され、状態語彙の混在（例: valid/ready）が発生しない                   |
| Claude Agent SDK APIキー セクション         | 保存/削除の成否を access card の guidance と同じ責務境界で表示する                                                    | `保存成功/失敗` と `次アクション` が同一ブロックで表示され、上位カードと矛盾しない                          |
| APIキー設定一覧（Provider rows）            | Provider の `登録/未登録` を上位 capability 判定と整合させ、欠落キーを一目で特定できるようにする                      | 上位カードが `ready` の時に対象 Provider が未登録のまま残らず、欠落時は対象 Provider 名を guidance に含める |

## Terminal 常設ルール

| 場所                              | ルール                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| App Shell Header                  | 右上に `Terminal` 固定ボタンを置く                                                   |
| Chat / Workspace / Skill 系 panel | header か composer 近傍にも `Terminal` ボタンを重複配置してよい                      |
| 表示形態                          | dock / bottom sheet / side panel のいずれかで再利用し、毎回別画面遷移にしない        |
| transcript                        | 閉じても session は保持し、再度開けば続きが見える                                    |
| no auto-send                      | dock を開いてもコマンドは自動送信しない                                              |
| transcript share                  | chat への連携は `手動選択` `手動添付` `手動貼り付け` に限定し、自動 message 化しない |

## Transcript -> Chat 手動連携ルール

| 項目         | ルール                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| source       | terminal transcript からユーザーが選んだ範囲、直近出力、または session 全体              |
| destination  | ChatPanel または Workspace Chat Panel の composer / attachment area                      |
| 操作         | `選択範囲をチャットへ送る` `直近出力を添付` `セッションを貼り付ける` の 3 系統に限定する |
| 禁止         | transcript を自動で chat message 化しない。chat 入力を自動で terminal へ返送しない       |
| 表示         | 共有後は `terminal transcript から添付` の provenance を chip / attachment label で示す  |
| セキュリティ | hidden parsing や silent summarization を行わず、共有前に内容が見える状態を保つ          |

## 画面状態マトリクス

| 状態        | 表示ルール                                         | CTA                          | 禁止事項                      |
| ----------- | -------------------------------------------------- | ---------------------------- | ----------------------------- |
| ready       | 実行可能である理由を短く示す                       | primary CTA を活性           | 補助説明を隠し過ぎない        |
| running     | 現在の実行経路と中断手段を示す                     | cancel / abort               | progress 不明のまま放置しない |
| streaming   | 内容が増えていることを視覚化する                   | stop / scroll to latest      | spinner だけで済ませない      |
| handoff     | terminal へ渡す理由と引き継ぎ内容を示す            | open terminal / copy command | 自動送信しない                |
| unavailable | なぜ使えないかを一文で示す                         | setup / install              | blank state にしない          |
| blocked     | 規約・権限・設計上この画面では実行しないと明示する | alternative path             | retry だけ見せない            |

## CTA 契約

- 各 state は `primary CTA 1個 + secondary CTA 1個` を上限とする
- `handoff` の primary CTA は `terminal を開く`、secondary CTA は `copy command` に寄せる
- `blocked` / `unavailable` では `retry` を primary CTA にしない
- `terminal-only` capability は `blocked` 扱いにせず、terminal 導線を中心に表示する

## UI 部品の責務分離

| UI 領域                | 持つ責務                            | 持たない責務                      |
| ---------------------- | ----------------------------------- | --------------------------------- |
| Settings / Access Card | capability と next action の説明    | 実 AI 実行                        |
| Chat / Panel Composer  | 入力と送信意図の収集                | runtime 自己判定                  |
| Main Process           | runtime 判定、error code、fail-fast | 曖昧な説明文の組み立て            |
| Terminal Surface       | transcript 表示、manual action 補助 | hidden prompt injection、自動再送 |

## マイクロコピー原則

| 場面                | マイクロコピー方針                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| API key 不足        | 「未設定です」だけで終わらせず、「どこで設定するか」を同じブロックに書く                                  |
| terminal handoff    | 「続きは terminal で実行します」ではなく、「この画面では自動実行せず、terminal で手動実行する」を明示する |
| blocked capability  | 「未対応」だけで終わらせず、「この surface は guidance のみ」か「別 surface へ移動」を示す                |
| long-running output | 待機中なのか出力中なのかを語彙で区別する                                                                  |
| terminal launcher   | `terminal を開く` を共通ラベルにし、画面ごとに別名へ散らさない                                            |
| transcript share    | `チャットへ送る` は terminal transcript 起点の明示操作に限定し、自動共有と誤解させない                    |

## アクセシビリティ / 操作性

| 観点       | 方針                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| キーボード | `Tab` 移動だけで primary CTA、secondary CTA、abort、copy action に到達できる  |
| フォーカス | handoff card と guidance block は出現時に heading へフォーカスを移せる        |
| 可読性     | status badge は色だけでなく文言でも区別する                                   |
| 幅変化     | Workspace / Chat panel は compact 幅でも CTA と状態説明が折りたたまれ過ぎない |

## Screenshot 契約

| ID    | 対象                         | 必須状態                                                 |
| ----- | ---------------------------- | -------------------------------------------------------- |
| UX-01 | Settings Access Matrix       | integrated ready / missing key / terminal available      |
| UX-02 | Claude Code Terminal Surface | transcript visible / no auto-send / unavailable guidance |
| UX-03 | ChatPanel                    | empty / streaming / terminal handoff                     |
| UX-04 | Workspace Chat Panel         | zero state / streaming / compact width / guidance        |
| UX-05 | Skill / Agent / Creator      | permission / integrated execute / terminal handoff       |
| UX-06 | Workspace Chat Edit          | selection attached / diff preview / blocked guidance     |
| UX-07 | Any Surface                  | persistent terminal launcher visible                     |
| UX-08 | Terminal + Chat              | transcript manual share visible                          |

## 仕様同期先

- `ui-ux-settings.md`
- `ui-ux-feature-components.md`
- `ui-ux-agent-execution.md`
- `ui-ux-panels.md`
- `task-workflow.md`
- `lessons-learned.md`
