# Frontend Testing Skill

フロントエンドテスト戦略の体系化と実践パターン

## スキルメタデータ

- **名前**: .claude/skills/frontend-testing/SKILL.md
- **バージョン**: 1.0.0
- **作成日**: 2025-12-02
- **使用エージェント**: .claude/agents/frontend-tester.md

---

## 概要

このスキルは、フロントエンドアプリケーションのテスト戦略を体系化します。コンポーネントテスト、ビジュアルリグレッションテスト、アクセシビリティテスト、E2Eテストを統合的に扱い、高品質なフロントエンド開発を支援します。

### いつ使うか

- UIコンポーネントのテストを自動生成したい時
- ビジュアルリグレッションテストを導入したい時
- アクセシビリティテストを自動化したい時
- フロントエンドのテスト戦略を設計したい時
- テストカバレッジを向上させたい時

### トリガーキーワード

- コンポーネントテスト、ユニットテスト、フロントエンドテスト
- Vitest、React Testing Library、Jest
- ビジュアルテスト、Chromatic、Percy、Storybook
- アクセシビリティテスト、axe-core、WCAG
- E2Eテスト、Playwright、Cypress

---

## テストピラミッド

フロントエンドテストは以下の階層で設計します：

```
                    ┌─────────────┐
                    │   E2E テスト  │  5%
                    │  (Playwright) │  - 重要なユーザーフロー
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │   統合テスト               │  15%
              │  (Component + Context)    │  - コンポーネント間連携
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │        コンポーネントテスト           │  40%
         │     (Vitest + React Testing Library) │  - 個別コンポーネント
         └─────────────────┬─────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │              ユニットテスト                    │  40%
    │           (Hooks, Utils, Services)           │  - ロジック単体
    └─────────────────────────────────────────────┘
```

---

## コンポーネントテスト

### 技術スタック

- **テストフレームワーク**: Vitest
- **レンダリング**: React Testing Library
- **モック**: MSW (Mock Service Worker)

### テストパターン

#### 1. レンダリングテスト

```typescript
// packages/shared/ui/primitives/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });
});
```

#### 2. インタラクションテスト

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button interactions', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### 3. Props テスト

```typescript
describe('Button props', () => {
  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['danger', 'bg-red-500'],
  ])('variant "%s" applies class "%s"', (variant, expectedClass) => {
    render(<Button variant={variant}>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it.each(['sm', 'md', 'lg'])('size "%s" renders correctly', (size) => {
    render(<Button size={size}>Test</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### カスタムフックテスト

```typescript
// packages/shared/ui/hooks/useLocalStorage.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial value when no stored value exists", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("updates stored value when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("key")).toBe(JSON.stringify("updated"));
  });
});
```

---

## ビジュアルリグレッションテスト

### 技術スタック

- **スナップショット管理**: Chromatic / Percy
- **ストーリー管理**: Storybook 8+

### Storybook設定

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../packages/shared/ui/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "@storybook/addon-viewport",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
```

### Storyファイルパターン

```typescript
// packages/shared/ui/primitives/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 基本ストーリー
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

// 全バリアントマトリクス
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

// 全サイズマトリクス
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ダークモード
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark p-4">
      <Button variant="primary">Dark Mode Button</Button>
    </div>
  ),
};
```

### Chromatic設定

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: storybook:build
```

---

## アクセシビリティテスト

### 技術スタック

- **自動スキャン**: axe-core
- **Storybook統合**: @storybook/addon-a11y
- **E2E統合**: Playwright axe-core

### axe-coreスキャン

```typescript
// tests/a11y/accessibility.test.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("home page should not have a11y violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("components should meet WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/storybook/iframe.html?id=primitives-button--primary");

    const results = await new AxeBuilder({ page })
      .include("#storybook-root")
      .analyze();

    // 違反がある場合は詳細を出力
    if (results.violations.length > 0) {
      console.log("Violations:", JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
});
```

### コンポーネントレベルa11yテスト

```typescript
// packages/shared/ui/primitives/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled button should have aria-disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('loading button should have aria-busy', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

---

## E2Eテスト

### 技術スタック

- **フレームワーク**: Playwright
- **対象**: Web / Electron

### Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // モバイルテスト
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2Eテストパターン

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    // フォーム入力
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");

    // ログインボタンクリック
    await page.getByRole("button", { name: "ログイン" }).click();

    // ダッシュボードにリダイレクト
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "ダッシュボード" }),
    ).toBeVisible();
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page.getByRole("alert")).toContainText("認証に失敗しました");
  });
});
```

---

## モック戦略

### MSW (Mock Service Worker)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Doe", email: "jane@example.com" },
    ]);
  }),

  http.post("/api/login", async ({ request }) => {
    const body = await request.json();

    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({ token: "mock-token" });
    }

    return HttpResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }),
];

// tests/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### テストセットアップ

```typescript
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## テストカバレッジ

### 目標カバレッジ

| カテゴリ           | 目標 | 現状目安         |
| ------------------ | ---- | ---------------- |
| **全体**           | 80%+ | -                |
| **コンポーネント** | 90%+ | 重要UI要素       |
| **カスタムフック** | 95%+ | すべてのロジック |
| **ユーティリティ** | 100% | すべての関数     |

### Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.stories.tsx",
        "**/*.test.tsx",
        "**/index.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

---

## ベストプラクティス

### テスト命名規則

```typescript
// 良い例
describe("Button", () => {
  it("renders children correctly", () => {});
  it("applies variant styles when variant prop is provided", () => {});
  it("calls onClick handler when clicked", () => {});
  it("does not call onClick when disabled", () => {});
});

// 悪い例
describe("Button", () => {
  it("test1", () => {});
  it("works", () => {});
  it("should work correctly", () => {});
});
```

### テストの独立性

- 各テストは独立して実行可能
- テスト間で状態を共有しない
- beforeEach/afterEachで適切にクリーンアップ

### アサーションの質

```typescript
// 良い例：具体的なアサーション
expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
expect(result.current.value).toBe(42);

// 悪い例：曖昧なアサーション
expect(component).toBeDefined();
expect(result).toBeTruthy();
```

---

## 関連リソース

- `resources/vitest-react-testing-library.md` - Vitest + RTL詳細パターン
- `resources/visual-regression-testing.md` - ビジュアルテスト詳細
- `resources/accessibility-testing.md` - アクセシビリティテスト詳細
- `resources/e2e-testing-patterns.md` - E2Eテスト詳細
- `templates/component-test-template.md` - コンポーネントテストテンプレート

---

## 参照エージェント

- `.claude/agents/frontend-tester.md` - フロントエンドテスト専門エージェント
- `.claude/agents/ui-designer.md` - UIコンポーネント設計
- `@quality-assurance` - 全体品質保証
