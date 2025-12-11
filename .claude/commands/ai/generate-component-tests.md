---
description: |
  コンポーネントテスト自動生成（Vitest + React Testing Library）
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
argument-hint: <component-path>
model: sonnet
---

# コンポーネントテスト自動生成コマンド

## 目的

指定したReactコンポーネントに対して、Vitest + React Testing Libraryを使用したテストファイルを自動生成します。

## 使用方法

```bash
/ai:generate-component-tests <component-path>
```

### 引数

- `component-path` (必須): テスト対象コンポーネントのパス
  - 例: `packages/shared/ui/primitives/Button/Button.tsx`
  - 例: `src/components/Header.tsx`

## 実行フロー

### Phase 1: コンポーネント分析

1. コンポーネントファイルを読み込み
2. Props インターフェースの抽出
3. バリアント、サイズ、状態の特定
4. イベントハンドラーの特定

### Phase 2: テストケース設計

1. レンダリングテスト
   - デフォルトProps でのレンダリング
   - 各バリアントのレンダリング
   - 各サイズのレンダリング
   - children の正常表示

2. インタラクションテスト
   - onClick イベント
   - onChange イベント
   - フォーカス/ブラー
   - キーボード操作

3. Props テスト
   - 必須Props
   - オプショナルProps
   - デフォルト値
   - エッジケース

4. アクセシビリティテスト
   - jest-axe による自動検証
   - ARIA属性の確認
   - disabled 状態

### Phase 3: テストファイル生成

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(<ComponentName onClick={handleClick} />);
      await userEvent.click(screen.getByRole('...'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<ComponentName />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

## エージェント起動

Task ツールで `@frontend-tester` エージェントを起動し、以下を依頼:

コンテキスト:

- 対象コンポーネント: "$ARGUMENTS"

@frontend-tester エージェントに以下を依頼:

- Phase 1: コンポーネント分析（Props、バリアント、イベント）
- Phase 2: テストケース設計（レンダリング、インタラクション、a11y）
- Phase 3: テストファイル生成

期待される成果物:

- `{component-path}.test.tsx`
- テストケース一覧（正常系、異常系、エッジケース）

品質基準:

- すべてのバリアントがテストされている
- インタラクションテストが網羅されている
- アクセシビリティテストが含まれている

## 成果物

- `{component-path}.test.tsx` - コンポーネントテストファイル

## 使用例

```bash
# Button コンポーネントのテスト生成
/ai:generate-component-tests packages/shared/ui/primitives/Button/Button.tsx

# Header コンポーネントのテスト生成
/ai:generate-component-tests src/components/Header.tsx
```

## 注意事項

- 既存のテストファイルがある場合は上書き確認
- テスト実行後の結果確認を推奨
- カバレッジレポートの確認を推奨

## 参照

- `.claude/agents/frontend-tester.md`
- `.claude/skills/frontend-testing/SKILL.md`
