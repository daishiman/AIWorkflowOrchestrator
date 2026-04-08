# Phase 6: 拡充テストケース一覧 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## TC-16〜TC-20：エッジケース追加テストケース

Phase 4 の TC-01〜TC-15 に加え、Phase 6 でエッジケースを追加した。

### TC-16：先勝ちルール（ツール）

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| TC ID  | TC-16                                                                          |
| 説明   | purpose に 'Slack' と 'GitHub' 両方含む場合、先に一致した 'slack' が採用される |
| 入力   | purpose: "Slack と GitHub を使う", category: null                              |
| 期待値 | tool = "slack"                                                                 |
| 根拠   | TOOL_KEYWORDS は先頭から順に評価する先勝ちルール                               |

### TC-17：大文字小文字区別

| 項目   | 内容                                                           |
| ------ | -------------------------------------------------------------- |
| TC ID  | TC-17                                                          |
| 説明   | purpose に 'slack'（小文字）が含まれる場合、tool = null を返す |
| 入力   | purpose: "slack通知を送る", category: null                     |
| 期待値 | tool = null                                                    |
| 根拠   | `String.includes()` は大文字小文字を区別する                   |

### TC-18：部分一致

| 項目   | 内容                                                        |
| ------ | ----------------------------------------------------------- |
| TC ID  | TC-18                                                       |
| 説明   | purpose に 'SlackBot' が含まれる場合、tool = 'slack' を返す |
| 入力   | purpose: "SlackBotを作成する", category: null               |
| 期待値 | tool = "slack"                                              |
| 根拠   | `String.includes()` は部分一致で判定する                    |

### TC-19：purpose が null（エラーなし確認）

| 項目   | 内容                                                           |
| ------ | -------------------------------------------------------------- |
| TC ID  | TC-19                                                          |
| 説明   | purpose が null の場合、tool = null を返す（エラーにならない） |
| 入力   | purpose: null as unknown as string, category: null             |
| 期待値 | tool = null（例外なし）                                        |
| 根拠   | `normalizePurpose` が null を空文字に変換する                  |

### TC-20：先勝ちルール（タイミング）

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| TC ID  | TC-20                                                                      |
| 説明   | purpose に '毎日' と 'リアルタイム' 両方含む場合、'scheduled' が採用される |
| 入力   | purpose: "毎日リアルタイムで処理する", category: null                      |
| 期待値 | timing = "scheduled"                                                       |
| 根拠   | SCHEDULED_PATTERN を先に評価するため scheduled が先勝ち                    |

## 追加対象ファイル

- `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx`

---

## TC-APPR-11〜13（skill-creator-api.approval.test.ts に追加）

### TC-APPR-11: 多重購読（両コールバックが呼ばれる）

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| ID     | TC-APPR-11                                                                       |
| 目的   | onApprovalRequest を二重購読した場合、両コールバックが独立して呼ばれることを確認 |
| 前提   | ipcRenderer.on がモック化されている                                              |
| 手順   | callback1, callback2 を別々に onApprovalRequest に渡し、各リスナーを発火する     |
| 期待値 | callback1, callback2 それぞれが payload を受け取る                               |
| 結果   | PASS                                                                             |

### TC-APPR-12: アンサブスクライブ後の再購読

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| ID     | TC-APPR-12                                                       |
| 目的   | unsubscribe 後に再購読すると新しいリスナーが登録されることを確認 |
| 前提   | ipcRenderer.on / removeListener がモック化されている             |
| 手順   | 1回目購読 → unsubscribe → 2回目購読                              |
| 期待値 | ipcRenderer.on が2回、removeListener が1回呼ばれる               |
| 結果   | PASS                                                             |

### TC-APPR-13: ALLOWED_ON_CHANNELS 外チャンネルへの safeOn（console.error が呼ばれ空関数が返る）

| 項目   | 内容                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| ID     | TC-APPR-13                                                                                                           |
| 目的   | APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれており console.error が呼ばれないことを確認（safeOn の正常経路確認） |
| 前提   | console.error をスパイ                                                                                               |
| 手順   | onApprovalRequest を呼び出す                                                                                         |
| 期待値 | console.error が呼ばれない、ipcRenderer.on が APPROVAL_REQUEST で呼ばれる                                            |
| 結果   | PASS                                                                                                                 |

---

## TC-APPR-14〜18（SkillLifecyclePanel.approval.test.tsx に追加）

### TC-APPR-14: respondToApproval 非影響確認（回帰ガード）

| 項目   | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| ID     | TC-APPR-14                                                                   |
| 目的   | approval request が未発火の状態では respondToApproval が呼ばれないことを確認 |
| 手順   | render のみ、approval callback 未発火                                        |
| 期待値 | mockRespondToApproval が呼ばれない                                           |
| 結果   | PASS                                                                         |

### TC-APPR-15: getDisclosureInfo 非影響確認（回帰ガード）

| 項目   | 内容                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| ID     | TC-APPR-15                                                                    |
| 目的   | onApprovalRequest 購読フローが getDisclosureInfo に影響しないことを確認       |
| 手順   | render → approval callback 発火                                               |
| 期待値 | approval-sheet が表示される。getDisclosureInfo は approval フローで呼ばれない |
| 結果   | PASS                                                                          |

### TC-APPR-16: approval payload が null の場合（UI が表示されない）

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| ID     | TC-APPR-16                                                                     |
| 目的   | onApprovalRequest が呼ばれない状態では approval-sheet が非表示であることを確認 |
| 手順   | render のみ、approval callback 未発火                                          |
| 期待値 | approval-sheet が DOM に存在しない                                             |
| 結果   | PASS                                                                           |

### TC-APPR-17: approve 後に pendingApproval がクリア（UI 非表示）

| 項目   | 内容                                                           |
| ------ | -------------------------------------------------------------- |
| ID     | TC-APPR-17                                                     |
| 目的   | approve ボタン押下後に approval-sheet が非表示になることを確認 |
| 手順   | approval 発火 → approval-sheet 確認 → approve ボタンクリック   |
| 期待値 | approval-sheet が DOM から消える                               |
| 結果   | PASS                                                           |

### TC-APPR-18: reject 後に pendingApproval がクリア（UI 非表示）

| 項目   | 内容                                                          |
| ------ | ------------------------------------------------------------- |
| ID     | TC-APPR-18                                                    |
| 目的   | reject ボタン押下後に approval-sheet が非表示になることを確認 |
| 手順   | approval 発火 → approval-sheet 確認 → reject ボタンクリック   |
| 期待値 | approval-sheet が DOM から消える                              |
| 結果   | PASS                                                          |

---

## テスト実行結果サマリ

```
Test Files  2 passed (2)
     Tests  19 passed (19)
  Start at  21:24:35
  Duration  2.62s
```

TC-APPR-01〜18 全件 PASS
