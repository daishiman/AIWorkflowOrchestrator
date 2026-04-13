# Phase 6 拡充テストケース一覧

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 6 — テスト拡充

## 作成日: 2026-04-13

---

## 概要

Phase 5 の Green 確認後、エッジケース（TC-E01〜TC-E05）と回帰 guard（TC-R01〜TC-R03）を追加した。

---

## エッジケーステスト（TC-E01〜TC-E05）

### TC-E01: payload が空オブジェクトの場合でも fetch を呼び出すこと

| 項目      | 内容                                                        |
| --------- | ----------------------------------------------------------- |
| テスト ID | TC-E01                                                      |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                         |
| 入力      | `{ eventName: "empty_payload", payload: {}, timestamp: 0 }` |
| 期待結果  | `fetch` が 1 回呼ばれ、body に `payload: {}` が含まれること |
| 検証観点  | 空オブジェクトでも処理が中断されないこと                    |

---

### TC-E02: eventName に特殊文字が含まれる場合でも動作すること

| 項目      | 内容                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| テスト ID | TC-E02                                                                         |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                                            |
| 入力      | `{ eventName: "event/with-special_chars.test", payload: {}, timestamp: 1000 }` |
| 期待結果  | `fetch` が 1 回呼ばれ、`success: true` が返ること                              |
| 検証観点  | 記号や区切り文字を含む eventName でも送信できること                            |

---

### TC-E03: HTTP 4xx レスポンスを受け取っても success: true を返すこと

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-E03                                                                |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                                   |
| 入力      | `{ eventName: "skill_wizard_started", payload: {}, timestamp: 1000 }` |
| 期待結果  | `fetch` が 1 回呼ばれても `success: true` が返ること                  |
| 検証観点  | サーバーが 4xx を返しても IPC 応答を壊さないこと                      |

---

### TC-E04: HTTP 5xx レスポンスを受け取っても success: true を返すこと

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-E04                                                                |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                                   |
| 入力      | `{ eventName: "skill_wizard_started", payload: {}, timestamp: 1000 }` |
| 期待結果  | `fetch` が 1 回呼ばれても `success: true` が返ること                  |
| 検証観点  | サーバーが 5xx を返しても IPC 応答を壊さないこと                      |

---

### TC-E05: タイムアウト後に fetch が再試行されないこと

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-E05                                                                |
| 前提条件  | `NODE_ENV=production`, URL 設定済み, fetch が AbortError を返す       |
| 入力      | `{ eventName: "skill_wizard_started", payload: {}, timestamp: 1000 }` |
| 期待結果  | `fetch` の呼び出し回数が 1 回のまま維持されること                     |
| 検証観点  | timeout 後の再試行が発生しないこと                                    |

---

## 回帰 guard テスト（TC-R01〜TC-R03）

### TC-R01: 既存の analytics:send IPC ハンドラーが正常に応答すること

| 項目      | 内容                                                                   |
| --------- | ---------------------------------------------------------------------- |
| テスト ID | TC-R01                                                                 |
| 前提条件  | 通常の IPC 呼び出し環境                                                |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }`                     |
| 期待結果  | `{ success: true }` が返ること                                         |
| 検証観点  | `sendToAnalyticsProvider` 追加後も既存ハンドラー動作が壊れていないこと |

---

### TC-R02: URL 未設定 / 空文字でも validateRequest と送信スキップが正常動作すること

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-R02                                                                |
| 前提条件  | `NODE_ENV=production`, URL 未設定または空文字                         |
| 入力      | `{ eventName: "skill_wizard_started", payload: {}, timestamp: 1000 }` |
| 期待結果  | IPC ハンドラーが `{ success: true }` を返し、`fetch` を呼ばないこと   |
| 検証観点  | `!url` ガードと validation の両方が安全側で機能すること               |

---

### TC-R03: NODE_ENV=test 環境で fetch が呼ばれないこと（CI 保護）

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| テスト ID | TC-R03                                             |
| 前提条件  | `NODE_ENV=test`（Vitest のデフォルト環境）         |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }` |
| 期待結果  | `fetch` が呼ばれないこと                           |
| 検証観点  | CI 環境で誤って外部エンドポイントを呼ばないこと    |
