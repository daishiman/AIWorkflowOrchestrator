# Phase 11: 手動テスト（VISUAL）- チェックリスト

## ステータス: completed

自動テスト・型チェック全合格済み。Phase 11 の目視確認と証跡保存も完了しています。

## 起動コマンド

```bash
pnpm --filter @repo/desktop dev
```

## チェックリスト

### AC-1: カテゴリ複数選択

- [x] カテゴリボタン 5 種が表示される
- [x] 1 つ選択で選択状態（ハイライト）になる
- [x] 2 つ目を選択で両方がハイライト（排他でない）
- [x] 3 つ以上選択可能
- [x] `aria-pressed="true"` が選択ボタンに付与される

### AC-2: カテゴリ解除

- [x] 選択済みカテゴリの再クリックで解除（ハイライト消去）
- [x] 全解除で「次へ」ボタンが非活性化
- [x] 解除後に再選択可能

### AC-3: ボタン外観統一

- [x] Step 0「次へ」: CSS 変数色（`--status-primary`）
- [x] `rounded-lg` に統一
- [x] ダークモードでボタン色がテーマに追従

### AC-4/5: ProgressBar 動的計算

- [x] 初期表示: 「質問 1/6」
- [x] Q1 回答後: 「質問 1/6」（最低値保証）
- [x] Q1+Q2 回答後: 「質問 2/6」
- [x] 次のページ移動（未回答）: 変化なし
- [x] 全問回答後: 「質問 6/6」

### テーマ切り替え

- [x] ライトモード: 選択状態が視認可能
- [x] ダークモード: 選択状態が視認可能
- [x] 両モードでテキスト読みやすい

## 証跡

- `outputs/phase-11/screenshot-manifest.json`
- `outputs/phase-11/devtools-audit.md`
- `outputs/phase-11/screenshots/smart-defaults-applied.png`
- `outputs/phase-11/screenshots/q3-schedule-expanded.png`
- `outputs/phase-11/screenshots/q1-single-select.png`
- `outputs/phase-11/screenshots/q1-multi-select.png`
- `outputs/phase-11/screenshots/q1-all-deselected.png`
- `outputs/phase-11/screenshots/q3-schedule-plus-manual.png`
- `outputs/phase-11/screenshots/q3-schedule-collapsed.png`
- `outputs/phase-11/screenshots/apply-summary-card-defaults.png`
- `outputs/phase-11/screenshots/keyboard-focus-button.png`
