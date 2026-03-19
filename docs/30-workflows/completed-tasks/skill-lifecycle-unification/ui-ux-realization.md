# Skill Lifecycle UI/UX Realization

## 概要

本書は、`作る` `実行する` `改善する` `再利用する` を単一導線として見せるための UI/UX 正本である。`Atent Team` `SubAgent` `Codex` は内部オーケストレーションであり、ユーザーに見せる主語は常に「やりたい仕事」とする。

> 注記: index.md（L8）では「ユーザージョブは `作る` `使う` `改善する` の3本」と定義しているが、本書の一次導線テーブルは `Reuse`（再利用する）を加えた4フェーズで構成する。`使う` は `Execute` と `Reuse` の両フェーズを包括した表現として対応する。

詳細図解は [ui-ux-diagrams.md](./ui-ux-diagrams.md) を参照する。

## 一次導線

| フェーズ | ユーザーの問い           | 表示する主画面                  | Primary CTA  | Secondary CTA      |
| -------- | ------------------------ | ------------------------------- | ------------ | ------------------ |
| Create   | まずスキルを作りたい     | Skill Lifecycle Panel           | スキルを作る | テンプレートを見る |
| Execute  | 作ったスキルを動かしたい | Skill / Agent Execution Surface | 実行する     | terminal で続ける  |
| Improve  | 結果を見て改善したい     | Improvement Summary             | 改善案を作る | 前回との差分を見る |
| Reuse    | 後でもう一度使いたい     | Created Skill Usage Journey     | もう一度使う | 履歴を見る         |

## 画面責務

| 画面                         | 持つ責務                                        | 持たない責務             |
| ---------------------------- | ----------------------------------------------- | ------------------------ |
| Skill Lifecycle Panel        | create / execute / improve の現在位置を示す     | internal role の露出     |
| Chat 系 supporting surface   | 文脈説明、補助会話、handoff                     | 主導線の置き換え         |
| Terminal Transcript          | user-operated Claude Code の transcript 表示    | 自動実行                 |
| Evaluation / Score           | 次の改善判断を支える                            | 一次導線の乗っ取り       |
| Persistent Terminal Launcher | どの lifecycle surface からでも terminal を開く | 主導線そのものの置き換え |

> 注記: Terminal Transcript と Evaluation / Score は Core Journey と Skill Lifecycle Panel の図解内に統合して扱う。独立 surface の図解は設けない。

## create / execute / improve の UI 契約

| ステップ | 必須 UI                                         | 説明                                |
| -------- | ----------------------------------------------- | ----------------------------------- |
| create   | goal input、constraint chips、generate CTA      | 何を作るかを最初に固定する          |
| execute  | runtime banner、permission、result summary      | 実行経路と trust 境界を同時に見せる |
| improve  | before / after summary、quality gate、retry CTA | 改善理由を先に見せる                |

> 注記: runtime banner は現在 StatusBadge コンポーネント（SkillStreamingView 内）として暫定実装されている。Task11（TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001）で RuntimeBanner コンポーネントへ昇格し、StatusBadge を置き換える。

## terminal handoff の扱い

| 場面                               | UI ルール                                                         |
| ---------------------------------- | ----------------------------------------------------------------- |
| create を terminal へ渡す          | prompt bundle、context summary、open terminal を 1 card に置く    |
| execute を terminal へ渡す         | この画面では自動実行しないことを明記する                          |
| improve を terminal へ渡す         | 前回結果と改善観点を要約して渡す                                  |
| どの画面でも terminal を開く       | header か panel action に固定 `Terminal` ボタンを置く             |
| terminal transcript を chat へ戻す | supporting chat へは明示操作でのみ戻し、autopilot bridge にしない |

## 状態マトリクス

| 状態       | 表示ルール                                    |
| ---------- | --------------------------------------------- |
| ready      | いま何ができるかを 1 文で示す                 |
| permission | 危険操作かどうかと理由を同じ面で示す          |
| running    | 進行中と停止導線を同時に出す                  |
| handoff    | terminal へ渡す理由、渡す内容、次の操作を出す |
| review     | quality gate と改善余地を出す                 |

> 注記: ready は各フェーズの待機状態（CreateReady / ExecuteReady / ImproveReady / ReuseReady）に展開される。
> permission と handoff は任意のフェーズで遷移しうる直交状態として扱う。

## UX の禁止事項

- Planner / Executor / Improver を mode switch として露出しない
- create / execute / improve を別アプリのように分断しない
- chat surface が主導線を食い潰す構造にしない
- terminal transcript を hidden panel に閉じ込めない
- terminal 入口を画面ごとに別名へばらさない

## Screenshot 契約

| ID       | 対象                  | 必須状態                                     |
| -------- | --------------------- | -------------------------------------------- |
| LC-UX-01 | Skill Lifecycle Panel | create ready / next step visible             |
| LC-UX-02 | Execution Surface     | integrated execute / permission visible      |
| LC-UX-03 | Improvement Surface   | before / after / improve CTA                 |
| LC-UX-04 | Terminal Handoff      | prompt bundle / open terminal / no auto-send |
| LC-UX-05 | Any Lifecycle Surface | persistent terminal launcher visible         |

## 接続先

- `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`
- `ui-ux-feature-components.md`
- `ui-ux-navigation.md`
- `interfaces-agent-sdk-skill.md`
