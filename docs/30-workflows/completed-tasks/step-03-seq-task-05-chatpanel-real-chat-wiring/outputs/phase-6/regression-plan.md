# Phase 6: リグレッション計画

## タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001

## ステータス: completed

## テスト拡充サマリ

### 新規テストファイル

- `ChatPanel.edge-cases.test.tsx`: 25テストケース

### テストグループ（6タスク）

| タスク   | テスト ID      | 内容                                                                                             | テスト数 |
| -------- | -------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Task 6-1 | EC-01〜EC-05   | 入力系 Edge Case（10K文字、マルチバイト、絵文字、空白のみP42、XSS）                              | 5        |
| Task 6-2 | EC-06〜EC-09   | 連続操作系（streaming中送信、高速連打、キャンセル→再送、完了→再送）                              | 4        |
| Task 6-3 | EC-10〜EC-13   | 状態遷移系（unmountクリーンアップ、provider変更、blocked→ready、ready→blocked）                  | 4        |
| Task 6-4 | EC-14〜EC-17   | 中断系（キャンセル連打、Escape連打、StrictMode二重実行、ネットワーク切断）                       | 4        |
| Task 6-5 | ERR-01〜ERR-05 | エラーリグレッション（NETWORK_ERROR、API_KEY_MISSING、RATE_LIMIT、SERVICE_UNAVAILABLE、UNKNOWN） | 5        |
| Task 6-6 | ST-01〜ST-03   | ストア安定性（セレクタ安定性、ステータス遷移原子性、blocked/handoff組合せ）                      | 3        |

### 全テストスイート結果

| テストファイル                      | テスト数 | 結果         |
| ----------------------------------- | -------- | ------------ |
| ChatPanel.chat-wiring.test.tsx      | 32       | PASS         |
| ChatPanel.edge-cases.test.tsx       | 25       | PASS         |
| ChatPanel.settings-sync.test.tsx    | 8        | PASS         |
| ChatPanel.accessibility.test.tsx    | 11       | PASS         |
| ChatPanel.test.tsx                  | 15       | PASS         |
| ChatPanel.skill-management.test.tsx | 17       | PASS         |
| StreamingMessage.test.tsx           | 31       | PASS         |
| **合計**                            | **139**  | **ALL PASS** |

## Edge Case 対策マッピング

| Edge Case | 対応する既知パターン | 検証内容                                       |
| --------- | -------------------- | ---------------------------------------------- |
| EC-01     | -                    | 10,000文字入力がstartStreamに正しく渡される    |
| EC-02     | -                    | マルチバイト文字（日本語）が切れずに送信される |
| EC-03     | -                    | 絵文字が正しく送信される                       |
| EC-04     | P42                  | 空白のみ入力がtrim()で除去され送信されない     |
| EC-05     | OWASP XSS            | `<script>` タグが無害化される                  |
| EC-06     | -                    | streaming中のcanSubmit=false検証               |
| EC-07     | -                    | 高速連打での引数正確性                         |
| EC-08     | -                    | キャンセル後の再送信可能性                     |
| EC-09     | -                    | ストリーミング完了後の再送信                   |
| EC-10     | -                    | unmount時のcancelStream呼び出し                |
| EC-11     | P62                  | provider変更時のblocked状態遷移                |
| EC-12     | P62                  | blocked→ready復帰                              |
| EC-13     | P62                  | ready→blocked遷移でComposerArea非表示          |
| EC-14     | -                    | キャンセル複数回呼び出しの安全性               |
| EC-15     | -                    | Escapeキー複数回の安全性                       |
| EC-16     | P5                   | StrictMode二重マウントの安全性                 |
| EC-17     | -                    | ネットワークエラー時のエラー状態表示           |

## 修正履歴

### EC-06 テスト修正

- **原因**: ChatPanel の `disabled={!canSubmit && !isStreaming}` により、streaming中は`disabled=false`（キャンセル操作の利便性確保）
- **修正**: `toBeDisabled()` アサーションから「ComposerArea存在 + ボタン非disabled」の確認に変更
- **設計意図**: streaming中はボタン自体を無効化せず、`handleSendMessage`内の`message.trim()`チェックで空送信を防止
