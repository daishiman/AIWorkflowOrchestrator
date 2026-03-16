# TC-F-005〜006: retry 境界値・タイムアウト境界値テスト仕様

## メタ情報

| 項目               | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| テストカテゴリ     | retry 境界値・タイムアウト境界値                                |
| 対象コンポーネント | PermissionDialog retry ロジック、タイムアウト制御、abort フロー |
| Phase              | Phase 6 テスト拡充                                              |
| 関連タスク         | TASK-SKILL-LIFECYCLE-06                                         |
| 作成日             | 2026-03-16                                                      |

---

## 定数定義

| 定数名                       | 値       | 説明                                                                |
| ---------------------------- | -------- | ------------------------------------------------------------------- |
| `MAX_PERMISSION_RETRY_COUNT` | `3`      | 最大 retry 回数（この回数に到達したとき abort フロー①が起動される） |
| `DEFAULT_TIMEOUT_MS`         | `300000` | デフォルトタイムアウト（ミリ秒）= 5分                               |

---

## abort フロー① の4ステップ

retry 上限到達またはタイムアウト発生時に実行される abort フロー①は以下の順序で実行される。

1. PermissionDialog を閉じる
2. session エントリを削除する
3. スキル実行を中断する
4. `skill:execution:aborted` IPC イベントを送信する

---

## TC-F-005: retry 回数の境界値検証

### 目的

`MAX_PERMISSION_RETRY_COUNT = 3` の境界値において、retry カウントが上限に達したときに abort フロー①が正しく起動され、上限未達のときは PermissionDialog が再表示されることを検証する。

---

### TC-F-005a: 1回目の拒否後に PermissionDialog が再表示される

**Given**

- PermissionDialog が表示されている（retry count = 0）
- `MAX_PERMISSION_RETRY_COUNT = 3` が設定されている

**When**

- ユーザーが「別の方法で実行」ボタンを押して拒否する（1回目）

**Then**

- PermissionDialog が閉じた後、新しい PermissionDialog が再表示されること
- 内部 retry count が `1` になっていること
- abort フロー①が起動されないこと（`skill:execution:aborted` イベントが送信されないこと）

---

### TC-F-005b: 2回目の拒否後に PermissionDialog が再表示される

**Given**

- PermissionDialog が表示されている（retry count = 1）
- `MAX_PERMISSION_RETRY_COUNT = 3` が設定されている

**When**

- ユーザーが「別の方法で実行」ボタンを押して拒否する（2回目）

**Then**

- PermissionDialog が閉じた後、新しい PermissionDialog が再表示されること
- 内部 retry count が `2` になっていること
- abort フロー①が起動されないこと（`skill:execution:aborted` イベントが送信されないこと）

---

### TC-F-005c: 3回目の拒否後に abort フロー①が起動される（境界値: MAX_PERMISSION_RETRY_COUNT = 3 到達）

**Given**

- PermissionDialog が表示されている（retry count = 2）
- `MAX_PERMISSION_RETRY_COUNT = 3` が設定されている
- この状態は「すでに2回拒否済み」を意味する

**When**

- ユーザーが「別の方法で実行」ボタンを押して拒否する（3回目、retry count が 3 に到達）

**Then**

- abort フロー①の全4ステップが順序通りに実行されること
  1. PermissionDialog が閉じられること
  2. session エントリが削除されること
  3. スキル実行が中断されること
  4. `skill:execution:aborted` IPC イベントが送信されること
- PermissionDialog が再表示されないこと（abort 後は再表示しない）
- abort イベントには中断理由（`reason: "max_retry_exceeded"` 相当）が含まれること

---

### TC-F-005d: 2回目の拒否後に許可したとき retry count がリセットされる

**Given**

- PermissionDialog が1回拒否されて再表示された状態（retry count = 1）

**When**

- ユーザーが「今回のみ許可」ボタンを押して許可する

**Then**

- スキル実行が許可されること
- 内部 retry count が `0` にリセットされること
- 次回同じツールへのパーミッションリクエストが発生した際、retry count が `1` から始まらず `0` から始まること（リセット確認）

---

## TC-F-006: タイムアウト境界値検証

### 目的

`DEFAULT_TIMEOUT_MS = 300000ms`（5分）の境界値において、タイムアウト直前では abort フロー①が起動されず、タイムアウト到達時点で abort フロー①が自動起動されることを検証する。また、操作によるタイムアウトキャンセルの正確性も検証する。

---

### TC-F-006a: `DEFAULT_TIMEOUT_MS - 1` ms 経過後にタイムアウトが発生しない（境界値: 299999ms）

**Given**

- PermissionDialog が表示されている
- `DEFAULT_TIMEOUT_MS = 300000ms` のタイムアウトタイマーが起動している
- `vi.useFakeTimers()` などのフェイクタイマーが使用されている

**When**

- `299999ms`（`DEFAULT_TIMEOUT_MS - 1`）が経過する（`advanceTimersByTime(299999)` を実行）

**Then**

- abort フロー①が起動されないこと（`skill:execution:aborted` イベントが送信されないこと）
- PermissionDialog が継続して表示されていること
- session エントリが削除されていないこと

---

### TC-F-006b: `DEFAULT_TIMEOUT_MS` ms 経過後に abort フロー①が自動起動される（境界値: 300000ms 到達）

**Given**

- PermissionDialog が表示されている
- `DEFAULT_TIMEOUT_MS = 300000ms` のタイムアウトタイマーが起動している
- `vi.useFakeTimers()` などのフェイクタイマーが使用されている

**When**

- `300000ms`（`DEFAULT_TIMEOUT_MS`ちょうど）が経過する（`advanceTimersByTime(300000)` を実行）

**Then**

- abort フロー①の全4ステップが順序通りに自動実行されること
  1. PermissionDialog が閉じられること
  2. session エントリが削除されること
  3. スキル実行が中断されること
  4. `skill:execution:aborted` IPC イベントが送信されること
- abort イベントには中断理由（`reason: "timeout"` 相当）が含まれること
- ユーザーによる追加操作（ボタンクリック等）が発生していないこと（自動起動の確認）

---

### TC-F-006c: タイムアウト前に許可操作するとタイムアウトタイマーがキャンセルされる

**Given**

- PermissionDialog が表示されており、タイムアウトタイマーが起動している
- まだ `DEFAULT_TIMEOUT_MS` は経過していない

**When**

- ユーザーが「今回のみ許可」ボタンを押して許可する

**Then**

- タイムアウトタイマーがキャンセルされること（`clearTimeout` または同等の処理が呼ばれること）
- 許可後に `DEFAULT_TIMEOUT_MS` が経過しても `skill:execution:aborted` イベントが送信されないこと
- スキル実行が正常に許可されること

---

### TC-F-006d: タイムアウト前に拒否操作するとタイムアウトタイマーがキャンセルされる

**Given**

- PermissionDialog が表示されており、タイムアウトタイマーが起動している
- retry count が 0 の状態（まだ余裕がある）

**When**

- ユーザーが「別の方法で実行」ボタンを押して拒否する

**Then**

- タイムアウトタイマーがキャンセルされること
- 新しい PermissionDialog が表示される際に、新しいタイムアウトタイマーが再起動されること
- 前のタイムアウトタイマーが残存して二重起動にならないこと

---

## 検証観点サマリー

| テストID  | 検証観点                                  | 境界の種類                                         |
| --------- | ----------------------------------------- | -------------------------------------------------- |
| TC-F-005a | 1回目拒否後に再表示（abort 未起動）       | retry count 下限                                   |
| TC-F-005b | 2回目拒否後に再表示（abort 未起動）       | retry count 中間値                                 |
| TC-F-005c | 3回目拒否後に abort フロー①起動           | retry count 上限（MAX_PERMISSION_RETRY_COUNT = 3） |
| TC-F-005d | 途中で許可した場合の retry count リセット | retry count リセット                               |
| TC-F-006a | 299999ms 経過でタイムアウト未発生         | タイムアウト境界 - 1                               |
| TC-F-006b | 300000ms 経過で abort フロー①自動起動     | タイムアウト境界ちょうど                           |
| TC-F-006c | 許可操作でタイムアウトタイマーキャンセル  | タイムアウトキャンセル（許可）                     |
| TC-F-006d | 拒否操作でタイムアウトタイマー再起動      | タイムアウトキャンセルと再起動                     |

---

## 実装上の注意事項

### タイマーテストの実装方針（P13 準拠）

- setTimeout + Promise + 再スケジュールのパターンでは `runAllTimers` 系が無限ループする可能性がある
- タイムアウトテストは `vi.useFakeTimers()` + `vi.advanceTimersByTime(ms)` で1ステップずつ進めること
- `vi.runAllTimers()` は使用禁止（無限ループリスク）

### abort フロー①のテスト検証順序

abort フロー①は4ステップが順序依存のため、各ステップの実行順序をモックの呼び出し順で検証すること。

```typescript
// 検証例（概念コード）
expect(mockCloseDialog).toHaveBeenCalledBefore(mockDeleteSession);
expect(mockDeleteSession).toHaveBeenCalledBefore(mockAbortSkill);
expect(mockAbortSkill).toHaveBeenCalledBefore(mockSendAbortedEvent);
```
