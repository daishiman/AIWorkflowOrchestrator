# アクセシビリティテストガイド

## 概要

効果的なアクセシビリティテストの手法とツールをまとめています。

---

## テストの種類

### 1. 自動テスト

機械的に検出可能な問題を発見。全体の30-40%程度。

### 2. 手動テスト

キーボード操作、スクリーンリーダーなど実際の体験を確認。

### 3. ユーザーテスト

実際の障害を持つユーザーによる検証。

---

## 自動テストツール

### Jest + jest-axe

```bash
npm install jest-axe @types/jest-axe --save-dev
```

```tsx
// __tests__/Button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('アクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled状態でも違反がないこと', async () => {
    const { container } = render(<Button disabled>無効</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Testing Library

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Form', () => {
  it('ラベルとフィールドが関連付けられていること', () => {
    render(
      <form>
        <label htmlFor="email">メール</label>
        <input id="email" type="email" />
      </form>
    );

    // ラベルテキストで要素を取得できる
    const input = screen.getByLabelText('メール');
    expect(input).toBeInTheDocument();
  });

  it('キーボードでフォームを操作できること', async () => {
    const handleSubmit = jest.fn();
    render(
      <form onSubmit={handleSubmit}>
        <input type="text" />
        <button type="submit">送信</button>
      </form>
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    // Tabでフォーカス移動
    await userEvent.tab();
    expect(input).toHaveFocus();

    await userEvent.tab();
    expect(button).toHaveFocus();

    // Enterで送信
    await userEvent.keyboard('{Enter}');
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

### Playwright

```tsx
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('アクセシビリティ', () => {
  test('ホームページに違反がないこと', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('特定のルールをチェック', async ({ page }) => {
    await page.goto('/form');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');

    // Tabでナビゲーション
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(firstFocused).toBe('A');

    // スキップリンクのテスト
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });
});
```

### Storybook + addon-a11y

```tsx
// .storybook/main.js
module.exports = {
  addons: ['@storybook/addon-a11y'],
};

// Button.stories.tsx
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: {
      // axeの設定をカスタマイズ
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'ボタン',
  },
};
```

---

## 手動テスト

### キーボードテスト

| 操作 | 確認項目 |
|------|----------|
| Tab | すべてのインタラクティブ要素に到達できるか |
| Shift+Tab | 逆順に移動できるか |
| Enter/Space | 要素を操作できるか |
| Escape | モーダルやドロップダウンを閉じられるか |
| 矢印キー | メニューやタブを操作できるか |

```tsx
// キーボードテスト用チェックリスト
const keyboardTestCases = [
  { key: 'Tab', expected: 'フォーカスが次の要素に移動' },
  { key: 'Shift+Tab', expected: 'フォーカスが前の要素に移動' },
  { key: 'Enter', expected: 'リンク/ボタンが活性化' },
  { key: 'Space', expected: 'ボタン/チェックボックスが活性化' },
  { key: 'Escape', expected: 'モーダル/ドロップダウンが閉じる' },
  { key: 'ArrowDown', expected: 'メニュー内で次の項目に移動' },
  { key: 'ArrowUp', expected: 'メニュー内で前の項目に移動' },
];
```

### スクリーンリーダーテスト

#### VoiceOver（Mac）

```
起動: Cmd + F5
停止: Cmd + F5
次の要素: VO + 右矢印 (VO = Ctrl + Option)
前の要素: VO + 左矢印
操作: VO + Space
見出しリスト: VO + U
```

#### NVDA（Windows）

```
起動: Ctrl + Alt + N
停止: Insert + Q
次の要素: Tab または 下矢印
前の要素: Shift + Tab または 上矢印
操作: Enter または Space
見出しリスト: Insert + F7
```

### 確認項目

```markdown
## スクリーンリーダーチェックリスト

### 基本
- [ ] ページタイトルが読み上げられる
- [ ] 見出し構造を辿れる
- [ ] リンクの目的がわかる
- [ ] 画像の代替テキストが読まれる

### フォーム
- [ ] ラベルが読み上げられる
- [ ] 必須フィールドがわかる
- [ ] エラーメッセージが通知される
- [ ] ヘルプテキストが読まれる

### インタラクション
- [ ] ボタンの目的がわかる
- [ ] 状態の変化が通知される
- [ ] モーダルの開閉がわかる
- [ ] 動的更新が通知される
```

---

## ブラウザツール

### Chrome DevTools

```
1. F12でDevToolsを開く
2. Elementsタブ → Accessibilityパネル
3. 要素を選択してARIAツリーを確認
```

### Lighthouse

```
1. F12でDevToolsを開く
2. Lighthouseタブを選択
3. "Accessibility"をチェック
4. "Analyze page load"をクリック
```

### axe DevTools

```
1. Chrome拡張をインストール
2. F12でDevToolsを開く
3. axe DevToolsタブを選択
4. "Scan ALL of my page"をクリック
```

---

## CI/CDへの統合

### GitHub Actions

```yaml
# .github/workflows/a11y.yml
name: Accessibility

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Run Playwright a11y tests
        run: npx playwright test e2e/accessibility.spec.ts
```

### Pre-commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:a11y"
    }
  }
}
```

---

## テスト戦略

### レベル別アプローチ

| レベル | 方法 | カバレッジ |
|--------|------|------------|
| ユニット | jest-axe | 各コンポーネント |
| 統合 | Testing Library | ユーザーフロー |
| E2E | Playwright + axe | 全ページ |
| 手動 | キーボード + SR | 重要な機能 |

### 優先度

1. **高**: フォーム、ナビゲーション、モーダル
2. **中**: カード、リスト、テーブル
3. **低**: 装飾的要素、静的コンテンツ

---

## チェックリスト

### 開発時
- [ ] コンポーネントにjest-axeテストを追加
- [ ] キーボード操作テストを追加
- [ ] Storybookでa11yアドオンを確認

### PR時
- [ ] CI/CDのa11yテストが通過
- [ ] 新機能に手動テストを実施
- [ ] スクリーンリーダーで確認（重要な機能）

### リリース前
- [ ] 全ページのLighthouseスコアを確認
- [ ] axe DevToolsで全体スキャン
- [ ] 主要フローの手動テスト
