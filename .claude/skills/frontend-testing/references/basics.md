# Frontend Testing Basics

## テストピラミッド

フロントエンドテストは以下の層で構成される：

| 層          | 比率 | 速度 | コスト | 用途                 |
| ----------- | ---- | ---- | ------ | -------------------- |
| Unit        | 60%  | 速   | 低     | 関数、ユーティリティ |
| Component   | 25%  | 中   | 中     | UIコンポーネント     |
| Integration | 10%  | 遅   | 高     | ページ、フロー       |
| E2E         | 5%   | 最遅 | 最高   | クリティカルパス     |

## Testing Library クエリ優先順位

1. **getByRole** - アクセシビリティ属性（推奨）
2. **getByLabelText** - フォーム要素
3. **getByPlaceholderText** - 入力フィールド
4. **getByText** - テキストコンテンツ
5. **getByAltText** - 画像
6. **getByTestId** - 最終手段

## 基本テスト構造

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // クリーンアップ
  })

  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<ComponentName />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('clicked')).toBeVisible()
  })
})
```

## 非同期処理のテスト

```typescript
// findBy* - Promise を返す、デフォルト1秒待機
await screen.findByText("loaded");

// waitFor - カスタム待機
await waitFor(() => {
  expect(screen.getByText("ready")).toBeVisible();
});

// waitForElementToBeRemoved - 要素の消滅を待機
await waitForElementToBeRemoved(() => screen.queryByText("loading"));
```

## MSW（Mock Service Worker）基本

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: 1, name: "User" }]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## カバレッジ目標

| 対象           | 目標 | 必須 |
| -------------- | ---- | ---- |
| ユーティリティ | 100% | Yes  |
| カスタムフック | 95%+ | Yes  |
| コンポーネント | 90%+ | Yes  |
| ページ         | 80%+ | No   |
