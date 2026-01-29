# TASK-7A SkillSelector アクセシビリティ設計書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 2          |
| 作成日 | 2026-01-30 |

## ARIA属性設計

### トリガーボタン

```html
<button
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded="{isOpen}"
  aria-controls="skill-listbox"
  aria-activedescendant="{focusedIndex"
>
  = 0 ? `skill-option-${focusedIndex}` : undefined} aria-label="スキルを選択" />
</button>
```

### ドロップダウン

```html
<div id="skill-listbox" role="listbox" aria-label="スキル一覧" />
```

### 各オプション

```html
<div
  id="{`skill-option-${index}`}"
  role="option"
  aria-selected="{isSelected}"
/>
```

### セクションヘッダー

```html
<div role="presentation" aria-hidden="true">インポート済み (N)</div>
```

## WAI-ARIA Listbox パターン準拠

- `combobox` ロール: トリガーボタンに設定
- `listbox` ロール: ドロップダウンパネルに設定
- `option` ロール: 各選択可能アイテムに設定
- `aria-expanded`: ドロップダウンの開閉状態を反映
- `aria-selected`: 選択状態を反映
- `aria-activedescendant`: フォーカス中のオプションIDを設定

## キーボードナビゲーション

| キー      | ドロップダウン閉じ時 | ドロップダウン開き時             |
| --------- | -------------------- | -------------------------------- |
| Enter     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Space     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Escape    | なし                 | ドロップダウンを閉じる           |
| ArrowDown | ドロップダウンを開く | 次のオプションにフォーカス移動   |
| ArrowUp   | なし                 | 前のオプションにフォーカス移動   |
| Home      | なし                 | 最初のオプションにフォーカス移動 |
| End       | なし                 | 最後のオプションにフォーカス移動 |
| Tab       | 通常タブ移動         | ドロップダウンを閉じる           |

## フォーカス管理

- `focusedIndex` で現在フォーカス中のオプションを管理
- `aria-activedescendant` でスクリーンリーダーにフォーカス位置を通知
- ドロップダウン展開時は最初のオプション or 選択中のオプションにフォーカス
- ドロップダウン閉じ後はトリガーボタンにフォーカスを戻す

## コントラスト比

- テキスト（小）: 最小4.5:1 → `text-gray-900 dark:text-gray-100`
- テキスト（大）: 最小3:1 → `text-gray-700 dark:text-gray-300`
- 説明テキスト: `text-gray-500 dark:text-gray-400`（補助テキスト）
