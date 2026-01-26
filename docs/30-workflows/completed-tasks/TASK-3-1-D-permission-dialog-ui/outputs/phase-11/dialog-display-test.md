# Phase 11: Dialog Display Test Checklist

## Test Environment

| 項目     | 要件                    |
| -------- | ----------------------- |
| OS       | macOS / Windows / Linux |
| Electron | v33+                    |
| Node.js  | v22+                    |

## Prerequisites

```bash
# 開発サーバー起動
pnpm --filter @repo/desktop dev
```

## Test Cases

### TC-DISP-001: Modal Display

**手順**:

1. スキル選択画面でテスト用スキルを選択
2. 実行ボタンをクリック
3. Permission要求発生を待つ

**確認項目**:

- [ ] ダイアログがモーダル表示される
- [ ] 背景がグレーアウトされる
- [ ] ダイアログが画面中央に表示される
- [ ] 背景クリックでダイアログが閉じない

### TC-DISP-002: Dialog Content

**確認項目**:

- [ ] ダイアログタイトルが表示される
- [ ] ツール名（toolName）が正しく表示される
- [ ] 引数情報（args）がJSON形式で表示される
- [ ] 理由（reason）が表示される（存在する場合）
- [ ] 「Allow」ボタンが表示される
- [ ] 「Deny」ボタンが表示される
- [ ] 「Remember my choice」チェックボックスが表示される

### TC-DISP-003: Visual Appearance

**確認項目**:

- [ ] ボタンのホバー効果が動作する
- [ ] フォーカス状態のスタイルが適用される
- [ ] テキストが読みやすいフォントサイズ
- [ ] コントラスト比が十分（4.5:1以上）

## Test Result

| テストケース | 結果 | 備考 |
| ------------ | ---- | ---- |
| TC-DISP-001  | TBD  |      |
| TC-DISP-002  | TBD  |      |
| TC-DISP-003  | TBD  |      |

## Status: PENDING MANUAL EXECUTION

手動テスト実行待ち。本番環境またはステージング環境での確認が必要。

## Date

2026-01-26
