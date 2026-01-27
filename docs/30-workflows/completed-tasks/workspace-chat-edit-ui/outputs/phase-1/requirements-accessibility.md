# アクセシビリティ要件定義

## 1. 概要

WCAG 2.1 AA準拠のアクセシビリティ要件。workspace-chat-edit UIコンポーネント全体に適用。

## 2. 基準

### 適用基準

- WCAG 2.1 Level AA
- WAI-ARIA 1.2 Authoring Practices

### 対象コンポーネント

- FileAttachmentButton（新規）
- FileContextList（新規）
- FileContextBadge（既存・検証）
- FileContextDropZone（既存・検証）
- ApplyControls（既存・検証）
- DiffEditor（既存・検証）
- DiffPreview（既存・検証）
- EditCommandInput（既存・検証）

## 3. キーボードナビゲーション要件

### A11Y-KB-001: Tabフォーカス移動

| コンポーネント       | 動作                                |
| -------------------- | ----------------------------------- |
| FileAttachmentButton | Tab でフォーカス可能                |
| FileContextList      | Tab で各バッジに順次フォーカス移動  |
| FileContextBadge     | Tab でバッジ本体→削除ボタン順に移動 |

### A11Y-KB-002: キーボード操作

| コンポーネント       | キー      | 動作                       |
| -------------------- | --------- | -------------------------- |
| FileAttachmentButton | Enter     | ファイルダイアログを開く   |
| FileAttachmentButton | Space     | ファイルダイアログを開く   |
| FileContextList      | Tab       | 次のバッジにフォーカス     |
| FileContextList      | Shift+Tab | 前のバッジにフォーカス     |
| FileContextBadge     | Enter     | ファイルを選択             |
| FileContextBadge     | Space     | ファイルを選択             |
| FileContextBadge     | Delete    | ファイルを削除             |
| FileContextBadge     | Backspace | ファイルを削除             |
| FileContextBadge     | Escape    | 選択解除（フォーカス維持） |

### A11Y-KB-003: フォーカス可視化

- フォーカス時に明確なアウトライン表示
- Tailwind: `focus:ring-2 focus:ring-blue-500`
- 色コントラスト比 3:1 以上

## 4. スクリーンリーダー対応要件

### A11Y-SR-001: FileAttachmentButton

| 属性          | 値                 |
| ------------- | ------------------ |
| role          | `button`           |
| aria-label    | `"ファイルを添付"` |
| aria-disabled | 無効時 `true`      |

読み上げ例: 「ファイルを添付、ボタン」

### A11Y-SR-002: FileContextList

| 属性       | 値                   |
| ---------- | -------------------- |
| role       | `list`               |
| aria-label | `"添付ファイル一覧"` |

読み上げ例: 「添付ファイル一覧、3項目」

### A11Y-SR-003: FileContextBadge

| 属性          | 値                             |
| ------------- | ------------------------------ |
| role          | `listitem`                     |
| aria-selected | 選択状態 `true/false`          |
| aria-label    | `"{ファイル名}、添付ファイル"` |

削除ボタン:
| 属性 | 値 |
| ---------- | ------------------------ |
| aria-label | `"{ファイル名}を削除"` |

読み上げ例: 「index.ts、添付ファイル、選択済み」

### A11Y-SR-004: 状態通知

| 状況         | 通知方法                                            |
| ------------ | --------------------------------------------------- |
| ファイル追加 | aria-live="polite" で「{ファイル名}を追加」         |
| ファイル削除 | aria-live="polite" で「{ファイル名}を削除」         |
| エラー発生   | aria-live="assertive" でエラーメッセージ            |
| 最大数到達   | aria-live="polite" で「最大ファイル数に達しました」 |

## 5. カラーコントラスト要件

### A11Y-CC-001: テキストコントラスト

- 本文テキスト: 4.5:1 以上
- ラージテキスト（18px以上）: 3:1 以上
- プレースホルダー: 3:1 以上

### A11Y-CC-002: UI要素コントラスト

- ボタン境界: 3:1 以上
- フォーカスインジケーター: 3:1 以上
- アイコン: 3:1 以上

### A11Y-CC-003: ダークモード対応

- ライトモード/ダークモードの両方で基準を満たす
- Tailwind `dark:` 修飾子で色を適切に切り替え

## 6. フォーカス管理要件

### A11Y-FM-001: フォーカストラップ

- モーダルダイアログ（DiffPreview）内でフォーカストラップ
- Tab でモーダル外に出ない
- Escape でモーダルを閉じてフォーカスを元に戻す

### A11Y-FM-002: フォーカス復帰

- ファイル削除後は次のバッジまたは前のバッジにフォーカス移動
- 全削除後は FileAttachmentButton にフォーカス移動
- モーダル閉じ後はトリガー要素にフォーカス復帰

## 7. 実装パターン

### ボタンコンポーネント

```tsx
<button
  type="button"
  role="button"
  aria-label="ファイルを添付"
  aria-disabled={disabled}
  tabIndex={disabled ? -1 : 0}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  {children}
</button>
```

### リストコンポーネント

```tsx
<ul role="list" aria-label="添付ファイル一覧" className="...">
  {items.map((item) => (
    <li
      key={item.id}
      role="listitem"
      aria-selected={selectedId === item.id}
      tabIndex={0}
    >
      ...
    </li>
  ))}
</ul>
```

### ライブリージョン

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

## 8. 検証方法

### 自動テスト

- axe-core / vitest-axe でアクセシビリティ違反検出
- Storybook a11y アドオンで各ストーリーを検証

### 手動テスト

1. キーボードのみで全操作を実行
2. VoiceOver (macOS) / NVDA (Windows) で読み上げ確認
3. 色覚特性シミュレーターでコントラスト確認

## 9. 完了条件

- [ ] 全操作がキーボードのみで可能
- [ ] Tab キーでフォーカス移動可能
- [ ] Enter/Space でボタン操作可能
- [ ] Delete/Backspace でファイル削除可能
- [ ] スクリーンリーダーで操作内容が読み上げられる
- [ ] フォーカス状態が視覚的に明確
- [ ] 色コントラスト比が WCAG AA 基準を満たす
- [ ] axe-core で重大な違反が 0 件
