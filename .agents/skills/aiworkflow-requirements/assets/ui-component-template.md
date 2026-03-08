# [コンポーネント名] UIコンポーネント仕様

> UIコンポーネントの仕様定義
> カテゴリ: UI/UX
> 読み込み条件: [コンポーネント名] の実装・修正時

---

## メタ情報

| 項目          | 内容                                    |
| ------------- | --------------------------------------- |
| バージョン    | 1.0.0                                   |
| 最終更新      | YYYY-MM-DD                              |
| 実装ファイル  | `apps/desktop/src/renderer/components/` |
| Atomic Design | Molecule / Organism                     |

---

## 1. コンポーネント概要

### 1.1 目的

[コンポーネントの目的と役割を記述]

### 1.2 コンポーネント構成

| コンポーネント  | 階層     | 責務             |
| --------------- | -------- | ---------------- |
| ComponentName   | Organism | 全体制御         |
| ComponentItem   | Molecule | 個別アイテム表示 |
| ComponentAction | Atom     | アクションボタン |

### 1.3 状態管理

| 状態       | 型      | 初期値 | 説明             |
| ---------- | ------- | ------ | ---------------- |
| isLoading  | boolean | false  | ローディング状態 |
| selectedId | string  | null   | 選択中のID       |
| items      | Item[]  | []     | 表示アイテム     |

---

## 2. Props定義

### 2.1 必須Props

| Prop名   | 型           | 説明               |
| -------- | ------------ | ------------------ |
| items    | Item[]       | 表示するアイテム   |
| onSelect | (id) => void | 選択時コールバック |

### 2.2 オプションProps

| Prop名      | 型      | デフォルト | 説明          |
| ----------- | ------- | ---------- | ------------- |
| className   | string  | ""         | 追加CSSクラス |
| placeholder | string  | "..."      | 空時の表示    |
| disabled    | boolean | false      | 無効化        |

### 2.3 型定義

```typescript
export interface ComponentProps {
  items: Item[];
  onSelect: (id: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

---

## 3. 表示仕様

### 3.1 レイアウト

```
┌──────────────────────────────────────┐
│ [Header]                             │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ Item 1                     [>] │   │
│ ├────────────────────────────────┤   │
│ │ Item 2                     [>] │   │
│ ├────────────────────────────────┤   │
│ │ Item 3                     [>] │   │
│ └────────────────────────────────┘   │
├──────────────────────────────────────┤
│ [Footer / Actions]                   │
└──────────────────────────────────────┘
```

### 3.2 状態別表示

| 状態    | 表示内容                    |
| ------- | --------------------------- |
| loading | スケルトン / スピナー       |
| empty   | プレースホルダーメッセージ  |
| error   | エラーメッセージ + リトライ |
| success | アイテムリスト              |

### 3.3 スタイリング

| 要素      | Tailwindクラス                      |
| --------- | ----------------------------------- |
| Container | `flex flex-col gap-2 p-4`           |
| Item      | `rounded-lg border hover:bg-accent` |
| Selected  | `bg-primary/10 border-primary`      |
| Disabled  | `opacity-50 pointer-events-none`    |

---

## 4. インタラクション仕様

### 4.1 イベントハンドリング

| イベント  | トリガー         | 処理                   |
| --------- | ---------------- | ---------------------- |
| onClick   | アイテムクリック | onSelect呼び出し       |
| onKeyDown | Enter/Space      | フォーカスアイテム選択 |
| onHover   | マウスオーバー   | ハイライト表示         |

### 4.2 キーボードナビゲーション

| キー   | 動作                 |
| ------ | -------------------- |
| ↑ / ↓  | フォーカス移動       |
| Enter  | 選択確定             |
| Escape | 選択解除 / 閉じる    |
| Tab    | 次の要素へフォーカス |

---

## 5. アクセシビリティ

### 5.1 ARIA属性

| 属性          | 値           | 用途               |
| ------------- | ------------ | ------------------ |
| role          | listbox/list | セマンティクス     |
| aria-selected | true/false   | 選択状態           |
| aria-disabled | true/false   | 無効状態           |
| aria-label    | string       | スクリーンリーダー |

### 5.2 要件

- [ ] キーボードのみで全操作可能
- [ ] スクリーンリーダー対応
- [ ] フォーカスインジケーター表示
- [ ] 色だけに依存しない状態表示

---

## 6. テスト仕様

### 6.1 テストケース

| テストID | テスト名       | 検証内容                 |
| -------- | -------------- | ------------------------ |
| UI-001   | レンダリング   | 正常に表示される         |
| UI-002   | 選択動作       | onSelectが呼ばれる       |
| UI-003   | 空状態         | プレースホルダー表示     |
| UI-004   | ローディング   | スピナー表示             |
| UI-005   | キーボード操作 | Enter/矢印キーで操作可能 |

### 6.2 テストコード例

```typescript
describe('ComponentName', () => {
  it('renders items correctly', () => {
    render(<Component items={mockItems} onSelect={vi.fn()} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('calls onSelect when item clicked', async () => {
    const onSelect = vi.fn();
    render(<Component items={mockItems} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Item 1'));
    expect(onSelect).toHaveBeenCalledWith('item-1');
  });
});
```

---

## 7. 実装ファイル

| 種別      | パス                                   |
| --------- | -------------------------------------- |
| メイン    | `components/ComponentName/index.tsx`   |
| 型定義    | `components/ComponentName/types.ts`    |
| スタイル  | `components/ComponentName/styles.ts`   |
| テスト    | `components/ComponentName/__tests__/`  |
| Storybook | `components/ComponentName/stories.tsx` |

---

## 関連ドキュメント

| ドキュメント           | 説明               |
| ---------------------- | ------------------ |
| ui-ux-design-system.md | デザインシステム   |
| ui-ux-components.md    | コンポーネント一覧 |
| interfaces-xxx.md      | 関連型定義         |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
