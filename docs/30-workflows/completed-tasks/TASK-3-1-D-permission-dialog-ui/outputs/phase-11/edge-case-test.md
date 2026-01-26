# Phase 11: Edge Case Test Checklist

## Test Environment

| 項目     | 要件                    |
| -------- | ----------------------- |
| OS       | macOS / Windows / Linux |
| Electron | v33+                    |
| Node.js  | v22+                    |

## Test Cases

### TC-EDGE-001: Long Text Display

**手順**:

1. 長いツール名を持つPermission要求を発生させる
2. 長い引数データを持つPermission要求を発生させる
3. 長い理由（reason）を持つPermission要求を発生させる

**確認項目**:

- [ ] 長いツール名が適切に折り返しまたは省略される
- [ ] 長い引数データがスクロール可能または省略表示される
- [ ] 長い理由テキストが適切に表示される
- [ ] ダイアログがはみ出さない

### TC-EDGE-002: Rapid Sequential Requests

**手順**:

1. 高速で連続するPermission要求を発生させる
2. 各ダイアログを素早く処理

**確認項目**:

- [ ] 最新のリクエストのみが表示される（または順番に表示される）
- [ ] 状態の不整合が発生しない
- [ ] UIがフリーズしない

### TC-EDGE-003: Abort During Permission Wait

**手順**:

1. Permission要求が表示されている状態でスキル実行を中断
2. ダイアログの挙動を確認

**確認項目**:

- [ ] ダイアログが適切に閉じる
- [ ] 状態がリセットされる
- [ ] エラーが発生しない

### TC-EDGE-004: Empty or Minimal Args

**手順**:

1. 空の引数を持つPermission要求を発生させる
2. 最小限の引数を持つPermission要求を発生させる

**確認項目**:

- [ ] 空の引数でも正常に表示される
- [ ] `{}`や単純な引数でもダイアログが正常に機能する

### TC-EDGE-005: Special Characters in Args

**手順**:

1. 特殊文字（日本語、絵文字、HTMLタグ様文字列）を含む引数でPermission要求を発生させる

**確認項目**:

- [ ] 特殊文字が正しく表示される
- [ ] HTMLタグ様の文字列がエスケープされる（XSS防止）
- [ ] 絵文字が正しく表示される

### TC-EDGE-006: Component Unmount During Permission

**手順**:

1. Permission要求が表示されている状態でコンポーネントがアンマウントされる状況を作る
   （例: 画面遷移、コンポーネントの条件付きレンダリング）

**確認項目**:

- [ ] リスナーがクリーンアップされる
- [ ] メモリリークが発生しない
- [ ] コンソールに警告・エラーが出ない

### TC-EDGE-007: Network/IPC Delay

**手順**:

1. IPC通信に遅延がある状況をシミュレート

**確認項目**:

- [ ] ユーザー操作後にUIが適切に応答する
- [ ] ローディング状態が必要に応じて表示される
- [ ] タイムアウト時に適切にハンドリングされる

## Test Result

| テストケース | 結果 | 備考 |
| ------------ | ---- | ---- |
| TC-EDGE-001  | TBD  |      |
| TC-EDGE-002  | TBD  |      |
| TC-EDGE-003  | TBD  |      |
| TC-EDGE-004  | TBD  |      |
| TC-EDGE-005  | TBD  |      |
| TC-EDGE-006  | TBD  |      |
| TC-EDGE-007  | TBD  |      |

## Status: PENDING MANUAL EXECUTION

手動テスト実行待ち。

## Date

2026-01-26
