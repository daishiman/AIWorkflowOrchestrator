# Frontend Testing Patterns

## コンポーネントテストパターン

### 1. Props バリエーションテスト

```typescript
describe.each([
  { variant: 'primary', expected: 'bg-blue-500' },
  { variant: 'secondary', expected: 'bg-gray-500' },
  { variant: 'danger', expected: 'bg-red-500' },
])('Button with $variant variant', ({ variant, expected }) => {
  it(`should have ${expected} class`, () => {
    render(<Button variant={variant}>Click</Button>)
    expect(screen.getByRole('button')).toHaveClass(expected)
  })
})
```

### 2. フォームテストパターン

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  render(<Form onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

### 3. エラー状態テストパターン

```typescript
it('should display error message on API failure', async () => {
  server.use(
    http.get('/api/data', () => {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 })
    })
  )

  render(<DataComponent />)
  await screen.findByText('Error: Failed')
})
```

## アクセシビリティテストパターン

### axe-core 統合

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### キーボードナビゲーション

```typescript
it('should be navigable with keyboard', async () => {
  const user = userEvent.setup()
  render(<Navigation />)

  await user.tab()
  expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()

  await user.tab()
  expect(screen.getByRole('link', { name: 'About' })).toHaveFocus()
})
```

## E2E テストパターン (Playwright)

### ページオブジェクトモデル

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }
}
```

### Visual Regression

```typescript
it("should match snapshot", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveScreenshot("dashboard.png");
});
```

## モックパターン

### Context モック

```typescript
const mockContext = {
  user: { id: 1, name: 'Test User' },
  logout: vi.fn(),
}

render(
  <UserContext.Provider value={mockContext}>
    <Component />
  </UserContext.Provider>
)
```

### Router モック

```typescript
import { MemoryRouter } from 'react-router-dom'

render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <App />
  </MemoryRouter>
)
```

## アンチパターン

| アンチパターン       | 問題点               | 解決策                |
| -------------------- | -------------------- | --------------------- |
| getByTestId の多用   | アクセシビリティ無視 | getByRole を優先      |
| 実装詳細のテスト     | リファクタで壊れる   | 振る舞いをテスト      |
| スナップショット過多 | 変更追跡困難         | 重要部分のみ          |
| beforeAll で状態共有 | テスト間依存         | beforeEach でリセット |
| waitFor 内で await   | タイムアウトリスク   | findBy\* を使用       |
