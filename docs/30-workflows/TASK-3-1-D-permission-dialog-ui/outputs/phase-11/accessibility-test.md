# Phase 11: Accessibility Test Checklist

## Test Environment

| 項目          | 要件                               |
| ------------- | ---------------------------------- |
| OS            | macOS / Windows / Linux            |
| Electron      | v33+                               |
| Screen Reader | VoiceOver (macOS) / NVDA (Windows) |

## Test Cases

### TC-A11Y-001: Keyboard Navigation

**手順**:

1. Permission要求が表示されるまで待つ
2. Tabキーで要素間を移動

**確認項目**:

- [ ] Tabキーでフォーカスが次の要素に移動する
- [ ] Shift+Tabキーでフォーカスが前の要素に移動する
- [ ] フォーカス可能な要素: チェックボックス → Denyボタン → Allowボタン
- [ ] フォーカスがダイアログ内でループする

### TC-A11Y-002: Keyboard Activation

**確認項目**:

- [ ] Enterキーでフォーカス中のボタンを押せる
- [ ] Spaceキーでチェックボックスを切り替えられる
- [ ] （オプション）Escapeキーでダイアログを閉じられる

### TC-A11Y-003: Focus Trap

**手順**:

1. ダイアログ表示後、Tab/Shift+Tabを連続で押す

**確認項目**:

- [ ] フォーカスがダイアログ外に移動しない
- [ ] 最後の要素からTabで最初の要素に戻る
- [ ] 最初の要素からShift+Tabで最後の要素に戻る

### TC-A11Y-004: Initial Focus

**確認項目**:

- [ ] ダイアログ表示時に自動的にフォーカスが当たる
- [ ] 最初のフォーカスはDenyボタン（安全側）またはダイアログ自体

### TC-A11Y-005: ARIA Attributes (DevTools確認)

**確認項目（開発者ツールで確認）**:

- [ ] `role="alertdialog"`が設定されている
- [ ] `aria-modal="true"`が設定されている
- [ ] `aria-labelledby`または`aria-label`が設定されている
- [ ] ボタンに適切な`aria-label`が設定されている

### TC-A11Y-006: Screen Reader (VoiceOver/NVDA)

**確認項目**:

- [ ] ダイアログ表示時にアナウンスされる
- [ ] ツール名と引数が読み上げられる
- [ ] ボタンラベルが読み上げられる
- [ ] チェックボックスの状態が読み上げられる

### TC-A11Y-007: Color Contrast

**確認項目（Lighthouse監査）**:

- [ ] テキストと背景のコントラスト比が4.5:1以上
- [ ] ボタンテキストと背景のコントラスト比が4.5:1以上

## Test Result

| テストケース | 結果 | 備考 |
| ------------ | ---- | ---- |
| TC-A11Y-001  | TBD  |      |
| TC-A11Y-002  | TBD  |      |
| TC-A11Y-003  | TBD  |      |
| TC-A11Y-004  | TBD  |      |
| TC-A11Y-005  | TBD  |      |
| TC-A11Y-006  | TBD  |      |
| TC-A11Y-007  | TBD  |      |

## Status: PENDING MANUAL EXECUTION

手動テスト実行待ち。

## Date

2026-01-26
