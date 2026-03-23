# Phase 6: 境界ケース一覧

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

各操作（OP-1/2/3）と TranscriptProvenanceChip の境界ケースを表形式で整理する。
各ケースに対して期待動作・テストID・優先度を定義する。

---

## 1. OP-1（選択範囲をチャットへ送る）境界ケース

| ケースID  | 入力条件                                      | 期待動作                                      | テストID | 優先度   |
| --------- | --------------------------------------------- | --------------------------------------------- | -------- | -------- |
| EC-OP1-01 | `content: ""` (空文字)                        | ValidationError を返す（auto-send しない）    | RG-E1    | Critical |
| EC-OP1-02 | `startLine: 0`                                | ValidationError を返す（1始まり制約違反）     | RG-E3    | High     |
| EC-OP1-03 | `startLine: -1`                               | ValidationError を返す（負値禁止）            | RG-E3    | High     |
| EC-OP1-04 | `startLine > endLine` (例: 10 > 5)            | ValidationError を返す（範囲逆転）            | RG-E2    | High     |
| EC-OP1-05 | `startLine === endLine` (1行のみ)             | 正常処理（1行選択は有効）                     | V-C5     | Medium   |
| EC-OP1-06 | `content` が 50,000 文字を超える              | 警告付きで処理（truncation通知）              | RG-E5    | Medium   |
| EC-OP1-07 | `content` に制御文字（\x00 等）を含む         | そのまま格納（hidden parsing 禁止）           | V-C5     | Medium   |
| EC-OP1-08 | `content` に個人情報（email 等）を含む        | そのまま格納・ログ出力しない                  | V-Q1     | Critical |
| EC-OP1-09 | セッションが存在しない（sessionTitle 未取得） | `sessionTitle: ""` で格納（補完しない）       | RG-E6    | Medium   |
| EC-OP1-10 | 操作直後に別の OP-1 を呼ぶ                    | 後勝ちで上書き（二重表示しない）              | RG-D2    | High     |
| EC-OP1-11 | 操作直後に OP-2 を呼ぶ                        | 後勝ちで上書き（OP-1 の Provenance が消える） | RG-D2    | High     |
| EC-OP1-12 | Store 未初期化状態で操作                      | クラッシュしない（graceful degradation）      | RG-B4    | High     |

---

## 2. OP-2（直近出力を添付）境界ケース

| ケースID  | 入力条件                                     | 期待動作                                      | テストID | 優先度   |
| --------- | -------------------------------------------- | --------------------------------------------- | -------- | -------- |
| EC-OP2-01 | `content: ""` (直近出力が空)                 | ValidationError を返す                        | RG-E4    | Critical |
| EC-OP2-02 | 直近出力が存在しない（セッション開始直後）   | ValidationError を返す（空 content）          | RG-E4    | High     |
| EC-OP2-03 | `content` が 50,000 文字を超える             | 警告付きで処理（truncation通知）              | RG-E5    | Medium   |
| EC-OP2-04 | `messageRange` が undefined であること       | 正常（last-output は範囲なし）                | RG-E7    | High     |
| EC-OP2-05 | OP-1 実行済み状態で OP-2 を呼ぶ              | 後勝ちで上書き（OP-1 の Provenance が消える） | RG-D2    | High     |
| EC-OP2-06 | `content` に ANSI エスケープシーケンスを含む | そのまま格納（hidden parsing 禁止）           | V-C6     | Medium   |
| EC-OP2-07 | `content` に PII を含む                      | そのまま格納・ログ出力しない                  | V-Q1     | Critical |
| EC-OP2-08 | `sourceType: "last-output"` であること       | `sourceType` が正しく設定される               | V-C6     | High     |

---

## 3. OP-3（セッションを貼り付ける）境界ケース

| ケースID  | 入力条件                               | 期待動作                           | テストID | 優先度   |
| --------- | -------------------------------------- | ---------------------------------- | -------- | -------- |
| EC-OP3-01 | `content: ""` (セッション内容が空)     | ValidationError を返す             | RG-E4    | Critical |
| EC-OP3-02 | `sessionTitle: ""` (タイトル未設定)    | そのまま空文字で格納（補完しない） | RG-E6    | Medium   |
| EC-OP3-03 | `sessionTitle` が 255 文字を超える     | そのまま格納（truncation しない）  | RG-F3    | Low      |
| EC-OP3-04 | `content` が 100,000 文字を超える      | 警告付きで処理                     | RG-E5    | Medium   |
| EC-OP3-05 | `messageRange` が undefined であること | 正常（session は範囲なし）         | RG-E8    | High     |
| EC-OP3-06 | `sourceType: "session"` であること     | `sourceType` が正しく設定される    | V-C7     | High     |
| EC-OP3-07 | `content` が JSON 形式のテキスト       | そのまま格納（JSON パース禁止）    | V-C7     | High     |
| EC-OP3-08 | 操作後に auto-send が発生しない        | `submitMessage` が呼ばれない       | V-C7     | Critical |
| EC-OP3-09 | Terminal Handoff 中に OP-3 を実行      | Handoff 状態に干渉しない           | RG-H1    | High     |

---

## 4. TranscriptProvenanceChip 境界ケース

### 4-A: Props 入力境界

| ケースID  | 入力条件                                                     | 期待動作                                            | テストID    | 優先度   |
| --------- | ------------------------------------------------------------ | --------------------------------------------------- | ----------- | -------- |
| EC-CHP-01 | `transcriptProvenance: undefined`                            | `null` を返す（何も表示しない）                     | V-C1, RG-F4 | Critical |
| EC-CHP-02 | `sourceType: "range"` + `messageRange: undefined`            | 範囲表示なしで Chip を表示                          | RG-F1       | High     |
| EC-CHP-03 | `sourceType: "range"` + `messageRange.startLine === endLine` | 単一行の表示（例: "L5"）                            | EC-OP1-05   | Medium   |
| EC-CHP-04 | `sessionTitle: ""`                                           | 空文字を表示（デフォルト補完しない）                | RG-F2       | High     |
| EC-CHP-05 | `sessionTitle` が 255 文字                                   | 長いタイトルでもレイアウト崩れしない                | RG-F3       | Low      |
| EC-CHP-06 | `sharedAt` が不正な ISO 文字列                               | 表示エラーにならない（フォールバック表示）          | RG-F3       | Medium   |
| EC-CHP-07 | `originalContent: ""`                                        | Chip は表示する（content 自体は Chip に表示しない） | RG-F5       | Medium   |
| EC-CHP-08 | `onDismiss: undefined`                                       | 削除ボタンが表示されない（または非活性）            | V-M9        | Medium   |

### 4-B: レンダリング境界

| ケースID  | 条件                          | 期待動作                                      | テストID | 優先度 |
| --------- | ----------------------------- | --------------------------------------------- | -------- | ------ |
| EC-CHP-09 | 同じ props で 2 回レンダー    | React.memo により再レンダーしない             | RG-R1    | High   |
| EC-CHP-10 | `sourceType` が変わった場合   | 正しく再レンダーされる                        | RG-R2    | High   |
| EC-CHP-11 | `onDismiss` クリック後        | `clearPendingTranscriptProvenance` が呼ばれる | V-M9     | High   |
| EC-CHP-12 | WCAG 2.1 AA コントラスト比    | 4.5:1 以上を満たす                            | V-Q5     | High   |
| EC-CHP-13 | ARIA ラベルの存在             | `aria-label` または `role` が付与されている   | V-Q6     | High   |
| EC-CHP-14 | キーボード操作（Tab + Enter） | `onDismiss` がキーボードで実行できる          | V-Q5     | Medium |

### 4-C: Chip 非表示の境界

送信済みメッセージ（`ChatMessageItem` 内）の Chip は `onDismiss` を持たない（削除不可）。

| ケースID  | 条件                               | 期待動作                         | テストID | 優先度 |
| --------- | ---------------------------------- | -------------------------------- | -------- | ------ |
| EC-CHP-15 | `ChatMessageItem` 内の Chip        | `onDismiss` なし（読み取り専用） | V-I4     | High   |
| EC-CHP-16 | `ChatInputArea` 内の Chip          | `onDismiss` あり（削除可能）     | V-M9     | High   |
| EC-CHP-17 | 送信後にメッセージ履歴で Chip 確認 | Provenance が履歴に保持される    | V-M5     | Medium |

---

## 5. Store 境界ケース

| ケースID | 条件                                             | 期待動作                               | テストID | 優先度 |
| -------- | ------------------------------------------------ | -------------------------------------- | -------- | ------ |
| EC-ST-01 | `setPendingTranscriptProvenance` を連続 2 回呼ぶ | 後勝ちで上書き                         | RG-D1    | High   |
| EC-ST-02 | `clearPendingTranscriptProvenance` 後に再 set    | 正しくセットされる                     | RG-D3    | High   |
| EC-ST-03 | `pendingTranscriptProvenance: null` の初期状態   | Chip が表示されない                    | V-C1     | High   |
| EC-ST-04 | Provenance を持つメッセージが複数存在する        | 各メッセージに個別の Chip が表示される | V-I4     | Medium |

---

## 6. IPC 境界ケース

| ケースID  | 条件                                                   | 期待動作                                      | テストID | 優先度   |
| --------- | ------------------------------------------------------ | --------------------------------------------- | -------- | -------- |
| EC-IPC-01 | `conversationAPI.appendProvenance` が失敗する          | pending 状態を維持、エラーを UI に伝播        | RG-B1    | High     |
| EC-IPC-02 | IPC 失敗後にリトライを実行                             | auto-send が発生しない                        | RG-B3    | Critical |
| EC-IPC-03 | `TranscriptProvenance` が IPC 経由でシリアライズされる | 型整合が維持される（Date → ISO 文字列）       | V-Q3     | High     |
| EC-IPC-04 | IPC レスポンスが `{ success: false }` 形式             | エラーハンドリングが適切に動作する（P60対策） | RG-B2    | High     |

---

## 7. 責務境界ケース（Task05 との分離）

| ケースID  | 条件                                                                    | 期待動作                                 | テストID | 優先度   |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------- | -------- | -------- |
| EC-SEP-01 | `terminal:handoff` IPC チャンネルを本タスクのコードが参照しない         | コードに `terminal:handoff` が存在しない | V-M8     | Critical |
| EC-SEP-02 | Terminal Handoff 完了後に pending Provenance が維持される               | Handoff が Provenance を消去しない       | RG-H2    | High     |
| EC-SEP-03 | Transcript Copy 実行中に Handoff が発生する                             | Handoff が Provenance に干渉しない       | RG-H3    | High     |
| EC-SEP-04 | `useTerminalHandoff` と `useTranscriptShare` が同一ファイルに混在しない | ファイル責務の分離                       | V-D3     | High     |

---

## 境界ケース統計

| カテゴリ             | ケース数 | Critical | High   | Medium | Low   |
| -------------------- | -------- | -------- | ------ | ------ | ----- |
| OP-1                 | 12       | 3        | 6      | 3      | 0     |
| OP-2                 | 8        | 2        | 5      | 1      | 0     |
| OP-3                 | 9        | 2        | 5      | 2      | 0     |
| Chip（Props）        | 8        | 1        | 4      | 3      | 0     |
| Chip（レンダリング） | 6        | 0        | 5      | 1      | 0     |
| Chip（非表示）       | 3        | 0        | 2      | 1      | 0     |
| Store                | 4        | 0        | 3      | 1      | 0     |
| IPC                  | 4        | 1        | 3      | 0      | 0     |
| 責務境界             | 4        | 1        | 3      | 0      | 0     |
| **合計**             | **58**   | **10**   | **36** | **12** | **0** |
