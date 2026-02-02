# Phase 2: セレクタ一覧

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 2                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 1. セレクタ定数オブジェクト

```typescript
export const selectors = {
  // ============================================
  // SkillSelector
  // ============================================

  /** スキルセレクター（トリガーボタン） */
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',

  /** ドロップダウン */
  dropdown: '[role="listbox"]',
  dropdownById: "#skill-listbox",

  /** 「なし」オプション */
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',

  /** オプション（動的） */
  option: (text: string) => `[role="option"]:has-text("${text}")`,

  /** オプション（インデックス指定） */
  optionByIndex: (index: number) => `#skill-option-${index}`,

  // ============================================
  // ChatPanel
  // ============================================

  /** ChatPanel本体 */
  chatPanel: '[data-testid="chat-panel"]',

  /** ChatPanelヘッダー */
  chatHeader: '[data-testid="chat-header"]',

  /** メッセージエリア */
  messageArea: '[data-testid="message-area"]',

  // ============================================
  // セクションヘッダー
  // ============================================

  /** インポート済みセクション */
  importedSection: ':has-text("インポート済み")',

  /** 利用可能セクション */
  availableSection: ':has-text("利用可能なスキル")',

  // ============================================
  // 再スキャンボタン
  // ============================================

  /** 再スキャンボタン */
  rescanButton: '[aria-label="再スキャン"]',
} as const;
```

## 2. セレクタ詳細一覧

### 2.1 SkillSelector要素

| 要素               | セレクタ                                     | 用途               | ARIA属性            |
| ------------------ | -------------------------------------------- | ------------------ | ------------------- |
| トリガーボタン     | `[role="combobox"][aria-haspopup="listbox"]` | ドロップダウン開閉 | role, aria-haspopup |
| ドロップダウン     | `[role="listbox"]`                           | オプション一覧表示 | role                |
| ドロップダウン(ID) | `#skill-listbox`                             | 代替セレクタ       | id                  |
| オプション         | `[role="option"]`                            | 選択項目           | role, aria-selected |
| なしオプション     | `[role="option"]:has-text("なし...")`        | 選択解除           | role, aria-selected |

### 2.2 ARIA属性一覧

| 属性                      | 対象要素       | 値                 | 検証タイミング |
| ------------------------- | -------------- | ------------------ | -------------- |
| `role="combobox"`         | トリガーボタン | 固定               | 初期表示       |
| `aria-haspopup="listbox"` | トリガーボタン | 固定               | 初期表示       |
| `aria-expanded`           | トリガーボタン | "true" / "false"   | 開閉時         |
| `aria-controls`           | トリガーボタン | "skill-listbox"    | 初期表示       |
| `aria-activedescendant`   | トリガーボタン | "skill-option-{n}" | フォーカス移動 |
| `role="listbox"`          | ドロップダウン | 固定               | 開いた時       |
| `role="option"`           | オプション     | 固定               | 開いた時       |
| `aria-selected`           | オプション     | "true" / "false"   | 選択変更時     |

### 2.3 data-testid一覧

| 属性                         | 対象要素       | 用途               |
| ---------------------------- | -------------- | ------------------ |
| `data-testid="chat-panel"`   | ChatPanel      | パネル識別         |
| `data-testid="chat-header"`  | ヘッダー       | ヘッダー識別       |
| `data-testid="message-area"` | メッセージ領域 | メッセージ領域識別 |

## 3. セレクタ使用例

### 3.1 基本操作

```typescript
// スキルセレクターをクリック
await page.click(selectors.skillSelector);

// ドロップダウンの表示確認
await expect(page.locator(selectors.dropdown)).toBeVisible();

// スキルを選択
await page.click(selectors.option("test-skill"));

// 選択解除
await page.click(selectors.noneOption);
```

### 3.2 ARIA属性検証

```typescript
// aria-expanded 検証（閉じた状態）
await expect(page.locator(selectors.skillSelector)).toHaveAttribute(
  "aria-expanded",
  "false",
);

// aria-expanded 検証（開いた状態）
await page.click(selectors.skillSelector);
await expect(page.locator(selectors.skillSelector)).toHaveAttribute(
  "aria-expanded",
  "true",
);

// aria-haspopup 検証
await expect(page.locator(selectors.skillSelector)).toHaveAttribute(
  "aria-haspopup",
  "listbox",
);
```

### 3.3 キーボード操作

```typescript
// フォーカス設定
await page.focus(selectors.skillSelector);

// ArrowDownでドロップダウンを開く
await page.keyboard.press("ArrowDown");

// オプション間を移動
await page.keyboard.press("ArrowDown");

// Enterで選択
await page.keyboard.press("Enter");

// Escapeで閉じる
await page.keyboard.press("Escape");
```

## 4. セレクタ選定基準

### 4.1 優先順位

1. **ARIA属性ベース**: `[role="xxx"]`, `[aria-xxx]`
   - セマンティック、アクセシビリティ準拠
   - 実装変更に強い

2. **data-testid**: `[data-testid="xxx"]`
   - テスト専用、UIに依存しない
   - 明示的なテスト意図

3. **テキストベース**: `:has-text("xxx")`
   - 可読性が高い
   - i18n対応時は注意

4. **ID**: `#xxx`
   - 一意性保証
   - ID変更時に影響

### 4.2 避けるべきセレクタ

| セレクタ例            | 理由                               |
| --------------------- | ---------------------------------- |
| `.px-3.py-2`          | スタイルクラス、変更されやすい     |
| `div > div > button`  | 構造依存、脆い                     |
| `button:nth-child(2)` | 順序依存、脆い                     |
| `[style="xxx"]`       | インラインスタイル、変更されやすい |

## 完了チェック

- [x] 全セレクタが定義されている
- [x] ARIA属性一覧が作成されている
- [x] 使用例が記載されている
- [x] セレクタ選定基準が明記されている
