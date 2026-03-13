# Phase 2 UI/UX 実体化

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001                             |
| Phase      | 2                                                                        |
| 成果物種別 | UI/UX 実体化                                                             |
| 作成日     | 2026-03-13                                                               |
| 正本参照   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md` |

---

## 1. Cross-Surface UI パターン

### 1.1 Access Capability Card

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 配置     | Settings 画面                                               |
| 用途     | surface ごとの利用可否を一覧で説明する                      |
| 管理単位 | `integratedRuntime` と `terminalSurface` の dual capability |

構成要素:

| 要素          | 内容                                                | 表示条件     |
| ------------- | --------------------------------------------------- | ------------ |
| Capability 名 | `Integrated API Runtime` / `Claude Code Terminal`   | 常時         |
| 現在値        | `ready` / `missing-key` / `unavailable` / `blocked` | 常時         |
| 理由          | capability が制限されている理由の一文               | `ready` 以外 |
| 次アクション  | 設定ボタン / API key 入力欄 / terminal 起動ボタン   | 常時         |

状態遷移:

| 状態        | 表示                                                  | Primary CTA          | Secondary CTA   |
| ----------- | ----------------------------------------------------- | -------------------- | --------------- |
| ready       | 利用可能であることを緑バッジで表示                    | (なし -- 設定済み)   | 設定を変更      |
| missing-key | API key が未設定であることを黄バッジで表示            | API key を設定       | terminal を開く |
| unavailable | provider が利用不可であることを灰バッジで表示         | 対応 provider を確認 | -               |
| blocked     | 設計上この surface では利用しないことを赤バッジで表示 | 代替 surface へ移動  | -               |

### 1.2 Runtime Banner

| 項目 | 内容                                   |
| ---- | -------------------------------------- |
| 配置 | 各 surface のヘッダ領域                |
| 用途 | 現在の実行経路をリアルタイムで表示する |

バッジ種別:

| バッジ      | 表示文                   | 背景色       | 表示条件              |
| ----------- | ------------------------ | ------------ | --------------------- |
| Integrated  | `Integrated API Runtime` | systemBlue   | API runtime で実行中  |
| Terminal    | `Claude Code Terminal`   | systemGreen  | terminal handoff 可能 |
| Unavailable | `利用不可`               | systemGray   | capability なし       |
| Blocked     | `設定が必要です`         | systemOrange | 設定不足              |

### 1.3 Handoff Card

| 項目 | 内容                                    |
| ---- | --------------------------------------- |
| 配置 | terminal handoff 時に表示               |
| 用途 | terminal へ渡す際の文脈と操作を提供する |

構成要素:

| 要素              | 内容                                            | 操作         |
| ----------------- | ----------------------------------------------- | ------------ |
| Context Summary   | 現在の文脈要約 (選択範囲、ファイル、プロンプト) | 読み取り専用 |
| Suggested Command | 推奨コマンド (`claude "..."` 形式)              | コピーボタン |
| Copy Action       | コマンドをクリップボードにコピー                | ボタン押下   |
| Open Terminal     | terminal を起動する                             | ボタン押下   |
| Handoff Reason    | handoff が必要な理由 (API key 不在など)         | 読み取り専用 |

制約:

| 制約                  | 内容                                                              |
| --------------------- | ----------------------------------------------------------------- |
| Auto-Send 禁止        | terminal 起動後にコマンドを自動送信しない                         |
| Prompt Injection 禁止 | 暗黙のコマンド引数を付与しない                                    |
| 表示タイミング        | fail-fast 発生時、または capability が `terminalSurface` のみの時 |

### 1.4 Guidance Block

| 項目 | 内容                                   |
| ---- | -------------------------------------- |
| 配置 | fail-fast 時に表示                     |
| 用途 | 実行不能時に次にやるべき操作を案内する |

構成要素:

| 要素           | 内容                                   |
| -------------- | -------------------------------------- |
| Failure Reason | なぜ実行できないかの一文               |
| 再設定手順     | Settings 画面への導線と必要な操作      |
| 代替導線       | terminal handoff / 別 surface への移動 |

表示ルール:

| ルール                   | 内容                                         |
| ------------------------ | -------------------------------------------- |
| error と guidance の同居 | エラーと次アクションを同じブロックに表示する |
| blank state 禁止         | `unavailable` でも次の操作を示す             |
| retry だけ見せない       | retry + 設定変更 + 代替の 3 選択肢を示す     |

---

## 2. 共通語彙

### 2.1 Capability 状態語彙

| 語彙          | 意味                        | 表示色       | UI 表現                            |
| ------------- | --------------------------- | ------------ | ---------------------------------- |
| `ready`       | integrated runtime 利用可能 | systemGreen  | 緑バッジ + 「利用可能」            |
| `handoff`     | terminal handoff 可能       | systemBlue   | 青バッジ + 「terminal で実行可能」 |
| `unavailable` | capability なし             | systemGray   | 灰バッジ + 「利用不可」            |
| `blocked`     | 設定不足で利用不可          | systemOrange | 橙バッジ + 「設定が必要です」      |

### 2.2 実行状態語彙

| 語彙        | 意味             | 表示               | 操作                    |
| ----------- | ---------------- | ------------------ | ----------------------- |
| `idle`      | 待機中           | 通常表示           | primary CTA 活性        |
| `running`   | 実行中           | spinner + 経路表示 | cancel/abort            |
| `streaming` | ストリーミング中 | 内容が増加中       | stop / scroll to latest |
| `completed` | 完了             | 結果表示           | 再実行 / クリア         |
| `failed`    | 失敗             | error + guidance   | retry / 設定変更        |
| `cancelled` | キャンセル済み   | キャンセル通知     | 再実行                  |

### 2.3 Surface 固有語彙

| Surface              | 固有状態          | 意味                           |
| -------------------- | ----------------- | ------------------------------ |
| Workspace Chat Edit  | `selection-ready` | 選択範囲が編集可能な状態       |
| Workspace Chat Edit  | `diff-ready`      | 差分プレビューが表示された状態 |
| Skill / Agent        | `preflight`       | 実行前の権限確認中             |
| Skill / Agent        | `permission`      | ユーザーの権限承認待ち         |
| Terminal Surface     | `input-waiting`   | ユーザー入力待ち               |
| Terminal Surface     | `long-output`     | 長い出力の表示中               |
| ChatPanel            | `empty`           | メッセージなしの初期状態       |
| Workspace Chat Panel | `zero`            | 会話開始前の空状態             |
| Workspace Chat Panel | `compact`         | 幅が狭い表示モード             |
| RAG / Embedding      | `queued`          | バックエンド処理キュー待ち     |
| Slide                | `synced`          | reverse-sync 完了状態          |
| Slide                | `degraded`        | 部分的な同期状態               |

---

## 3. マイクロコピー契約

### 3.1 実行経路の表現

| 場面                    | マイクロコピー                               | 禁止表現                                           |
| ----------------------- | -------------------------------------------- | -------------------------------------------------- |
| Integrated runtime 実行 | 「この画面で自動実行する」                   | 「AI が実行する」(主体が曖昧)                      |
| Terminal handoff        | 「terminal で手動実行する」                  | 「続きは terminal で実行します」(自動実行に見える) |
| 両方可能                | 「自動実行する」+「terminal で手動実行する」 | 「どちらでも実行できます」(判断を放棄)             |

### 3.2 状態説明の表現

| 場面                | マイクロコピー                                                            | 禁止表現                                          |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| API key 不足        | 「API key が未設定です。Settings で設定してください。」                   | 「未設定です」(次アクションなし)                  |
| Terminal handoff 時 | 「この画面では自動実行しません。terminal でコマンドを実行してください。」 | 「terminal へ移動します」(自動遷移に見える)       |
| Blocked capability  | 「この画面は guidance のみです。[Surface名] で実行してください。」        | 「未対応」(代替なし)                              |
| 長時間待機          | 「処理中です...」(running) / 「出力を受信中です...」(streaming)           | 「お待ちください」(状態が不明)                    |
| Terminal launcher   | 「terminal を開く」                                                       | 画面ごとの別名 (「CLI を起動」「シェルを開く」等) |

### 3.3 Transcript 連携の表現

| 場面            | マイクロコピー                   | 禁止表現                               |
| --------------- | -------------------------------- | -------------------------------------- |
| 選択範囲共有    | 「選択範囲をチャットへ送る」     | 「コピー」(宛先不明)                   |
| 直近出力添付    | 「直近出力を添付」               | 「出力を送信」(自動送信に見える)       |
| セッション貼付  | 「セッションを貼り付ける」       | 「セッションを共有」(自動共有に見える) |
| Provenance 表示 | 「terminal transcript から添付」 | (ラベルなし -- 出所不明)               |

---

## 4. Surface 別 UI/UX 対応表

| Surface                 | Primary CTA     | Secondary CTA    | Runtime Banner | Handoff Card      | Guidance Block | Terminal Launcher   |
| ----------------------- | --------------- | ---------------- | -------------- | ----------------- | -------------- | ------------------- |
| Settings / Access Card  | API key を設定  | terminal を開く  | -              | -                 | 有             | 有                  |
| Claude Code Terminal    | terminal を開く | コマンドをコピー | Terminal       | -                 | 有             | - (自身が terminal) |
| ChatView / AI_CHAT      | チャットを送信  | terminal を開く  | 有             | 有                | 有             | 有                  |
| ChatPanel               | 送信する        | terminal handoff | 有             | 有                | 有             | 有                  |
| Workspace Chat Edit     | 編集案を生成    | terminal handoff | 有             | 有                | 有             | 有                  |
| Workspace Chat Panel    | 送信する        | terminal handoff | 有             | 有                | 有             | 有                  |
| Skill / Agent / Creator | 実行する        | terminal handoff | 有             | 有                | 有             | 有                  |
| Skill Docs              | docs を生成     | guidance を表示  | 有             | 有                | 有             | 有                  |
| RAG / Embedding         | 実行する        | guidance を確認  | 有             | - (terminal 不可) | 有             | -                   |
| Slide / Modifier        | reverse-sync    | manual fallback  | 有             | - (guidance のみ) | 有             | 有                  |

---

## 5. Terminal 常設ルール

| 場所                              | ルール                                                                      |
| --------------------------------- | --------------------------------------------------------------------------- |
| App Shell Header                  | 右上に `terminal を開く` 固定ボタンを配置する                               |
| Chat / Workspace / Skill 系 panel | header または composer 近傍にも terminal ボタンを重複配置してよい           |
| 表示形態                          | dock / bottom sheet / side panel のいずれかで再利用し、毎回画面遷移させない |
| transcript                        | 閉じても session は保持し、再度開けば続きが見える                           |
| no auto-send                      | dock を開いてもコマンドは自動送信しない                                     |
| transcript share                  | chat への連携は手動選択/手動添付/手動貼付の 3 形態に限定する                |

---

## 6. アクセシビリティ

| 観点           | 方針                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| キーボード操作 | Tab 移動で primary CTA、secondary CTA、abort、copy action に到達できる |
| フォーカス管理 | handoff card / guidance block 出現時に heading へフォーカスを移動する  |
| 色以外の区別   | status badge は色と文言の両方で状態を示す (WCAG 2.1 AA)                |
| コントラスト   | 通常テキスト 4.5:1 以上、大テキスト/UI 部品 3:1 以上                   |
| 幅変化対応     | compact 幅でも CTA と状態説明が折りたたまれ過ぎない                    |
| ARIA           | capability card に `role="status"` と `aria-label` を付与する          |

---

## 7. バッジ色対応表 (Apple HIG System Colors)

| 状態              | Light Mode               | Dark Mode | 用途          |
| ----------------- | ------------------------ | --------- | ------------- |
| ready             | `#34C759` (systemGreen)  | `#30D158` | 利用可能      |
| handoff           | `#007AFF` (systemBlue)   | `#0A84FF` | terminal 可能 |
| running/streaming | `#007AFF` (systemBlue)   | `#0A84FF` | 実行中        |
| unavailable       | `#C6C6C8` (systemGray)   | `#38383A` | 利用不可      |
| blocked           | `#FF9500` (systemOrange) | `#FF9F0A` | 設定不足      |
| failed            | `#FF3B30` (systemRed)    | `#FF453A` | エラー        |

---

## 8. UI 部品の責務分離

| UI 領域                | 持つ責務                            | 持たない責務                      |
| ---------------------- | ----------------------------------- | --------------------------------- |
| Settings / Access Card | capability と next action の説明    | AI 実行                           |
| Chat / Panel Composer  | 入力と送信意図の収集                | runtime 自己判定                  |
| Runtime Banner         | 現在の実行経路の表示                | capability 算出                   |
| Handoff Card           | terminal handoff の文脈と CTA       | auto-send / auto-retry            |
| Guidance Block         | failure reason と next action       | runtime 判定                      |
| Terminal Surface       | transcript 表示、manual action 補助 | hidden prompt injection、自動再送 |
| Main Process           | runtime 判定、error code、fail-fast | 曖昧な説明文の組み立て            |
