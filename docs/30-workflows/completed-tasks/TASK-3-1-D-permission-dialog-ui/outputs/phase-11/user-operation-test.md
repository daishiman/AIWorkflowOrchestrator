# Phase 11: User Operation Test Checklist

## Test Environment

| 項目     | 要件                    |
| -------- | ----------------------- |
| OS       | macOS / Windows / Linux |
| Electron | v33+                    |
| Node.js  | v22+                    |

## Test Cases

### TC-OP-001: Allow Button Click

**手順**:

1. Permission要求が表示されるまで待つ
2. 「Allow」ボタンをクリック

**確認項目**:

- [ ] ダイアログが閉じる
- [ ] スキル実行が継続する
- [ ] コンソールにエラーが出力されない
- [ ] Main Processに`approved: true`が送信される

### TC-OP-002: Deny Button Click

**手順**:

1. Permission要求が表示されるまで待つ
2. 「Deny」ボタンをクリック

**確認項目**:

- [ ] ダイアログが閉じる
- [ ] スキル実行が適切にハンドリングされる
- [ ] コンソールにエラーが出力されない
- [ ] Main Processに`approved: false`が送信される

### TC-OP-003: Remember Choice with Allow

**手順**:

1. 「Remember my choice」チェックボックスをON
2. 「Allow」ボタンをクリック
3. 同じツールで再度Permission要求を発生させる

**確認項目**:

- [ ] チェックボックスがONの状態で送信される
- [ ] `rememberChoice: true`がMain Processに送信される
- [ ] （オプション）次回同じツールで自動許可されることを確認

### TC-OP-004: Remember Choice with Deny

**手順**:

1. 「Remember my choice」チェックボックスをON
2. 「Deny」ボタンをクリック

**確認項目**:

- [ ] チェックボックスがONの状態で送信される
- [ ] `rememberChoice: true`がMain Processに送信される

### TC-OP-005: Multiple Sequential Requests

**手順**:

1. 複数のPermission要求が連続で発生するスキルを実行
2. 各ダイアログを順番に処理

**確認項目**:

- [ ] 各リクエストが順番に表示される
- [ ] 先のリクエストを処理後、次のリクエストが表示される
- [ ] 状態が正しくリセットされる

## Test Result

| テストケース | 結果 | 備考 |
| ------------ | ---- | ---- |
| TC-OP-001    | TBD  |      |
| TC-OP-002    | TBD  |      |
| TC-OP-003    | TBD  |      |
| TC-OP-004    | TBD  |      |
| TC-OP-005    | TBD  |      |

## Status: PENDING MANUAL EXECUTION

手動テスト実行待ち。

## Date

2026-01-26
