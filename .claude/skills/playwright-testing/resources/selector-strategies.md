# セレクタ戦略詳細ガイド

## セレクタの種類と優先順位

### 1. Role-based Selectors (最優先)

アクセシビリティロールに基づくセレクタ。最も安定で、セマンティックに意味がある。

```typescript
// ボタン
await page.getByRole("button", { name: "Submit" });
await page.getByRole("button", { name: /submit/i }); // 大文字小文字無視

// テキストボックス
await page.getByRole("textbox", { name: "Email" });

// チェックボックス
await page.getByRole("checkbox", { name: "I agree" });

// リンク
await page.getByRole("link", { name: "Home" });

// 見出し
await page.getByRole("heading", { name: "Welcome", level: 1 });
```

**利点**:

- UIの意味的な役割に基づく
- アクセシビリティ準拠を促進
- CSSクラス変更に強い

**欠点**:

- ARIA roleが適切に設定されていない場合は使用不可

### 2. Label-based Selectors

フォーム要素に関連付けられたラベルに基づく。

```typescript
await page.getByLabel("Email address");
await page.getByLabel("Password");
await page.getByLabel(/email/i); // 正規表現
```

**利点**:

- フォーム要素に最適
- ユーザーが見る情報に基づく
- アクセシビリティ向上

**欠点**:

- フォーム要素以外には使用不可
- ラベルテキスト変更で壊れる

### 3. Test ID Selectors

`data-testid`属性に基づく。テスト専用の安定したセレクタ。

```typescript
// HTML
<button data-testid="submit-button">Submit</button>

// テスト
await page.getByTestId('submit-button');
```

**利点**:

- UI変更に最も強い
- テスト専用で明確
- 国際化の影響を受けない

**欠点**:

- HTMLにテスト用属性を追加する必要がある
- プロダクションコードへの追加が必要

### 4. Placeholder-based Selectors

プレースホルダーテキストに基づく。

```typescript
await page.getByPlaceholder("Enter your email");
```

**利点**:

- フォーム要素で使いやすい

**欠点**:

- プレースホルダー変更で壊れる
- 国際化の影響を受ける

### 5. Text-based Selectors

表示テキストに基づく。

```typescript
await page.getByText("Click here");
await page.getByText(/submit/i); // 正規表現
await page.getByText("Click here", { exact: true }); // 完全一致
```

**利点**:

- 実際のユーザー体験に近い

**欠点**:

- テキスト変更で壊れる
- 国際化の影響を受ける
- 重複テキストがある場合に曖昧

### 6. CSS Selectors (最終手段)

CSSセレクタ。最も脆弱で、避けるべき。

```typescript
await page.locator(".btn-primary");
await page.locator("#submit-button");
await page.locator("button.btn.btn-primary");
```

**利点**:

- 柔軟性が高い
- 複雑なDOM構造にも対応

**欠点**:

- UI変更に非常に脆弱
- 保守性が低い
- CSSクラス変更で壊れる

## セレクタ選択のフローチャート

```
要素を選択する必要がある
  ↓
フォーム要素？
  YES → Label-based selector使用
  NO ↓

アクセシビリティロールがある？
  YES → Role-based selector使用
  NO ↓

テキストが一意？
  YES → Text-based selector使用
  NO ↓

data-testid追加可能？
  YES → Test ID selector使用
  NO ↓

CSS selector使用（最終手段）
```

## 複雑なセレクタパターン

### 組み合わせセレクタ

```typescript
// ロールとテキストの組み合わせ
await page
  .getByRole("button", { name: "Submit" })
  .and(page.getByText("Click here"));

// 親子関係
await page.locator("form").getByRole("button", { name: "Submit" });

// フィルタリング
await page.getByRole("listitem").filter({ hasText: "Product 1" });
```

### nth要素の選択

```typescript
// 最初の要素
await page.getByRole("button").first();

// 最後の要素
await page.getByRole("button").last();

// n番目の要素
await page.getByRole("button").nth(2);
```

### 条件付きセレクタ

```typescript
// 特定の属性を持つ要素
await page.locator('[data-active="true"]');

// 特定のクラスを持つ要素
await page.locator(".active");

// 複数条件
await page.locator('[data-testid="item"]').filter({ hasText: "Active" });
```

## セレクタのデバッグ

### Playwright Inspector

```bash
npx playwright test --debug
```

### セレクタの検証

```typescript
// 要素数の確認
const count = await page.getByRole("button").count();
console.log(`Found ${count} buttons`);

// 要素の存在確認
const exists = await page.getByTestId("submit").isVisible();
console.log(`Submit button visible: ${exists}`);

// セレクタのハイライト
await page.getByRole("button", { name: "Submit" }).highlight();
```

### CodeGen活用

```bash
npx playwright codegen https://example.com
```

## セレクタのベストプラクティス

### DO（推奨）

1. **Role-basedを優先**:

```typescript
await page.getByRole("button", { name: "Submit" });
```

2. **data-testidを活用**:

```typescript
<button data-testid="submit-btn">Submit</button>
await page.getByTestId('submit-btn');
```

3. **明確な名前を使用**:

```typescript
// ✅
await page.getByRole("button", { name: "Submit Form" });

// ❌
await page.getByRole("button", { name: "btn" });
```

4. **スコープを限定**:

```typescript
await page.locator("form#login").getByRole("button", { name: "Submit" });
```

### DON'T（非推奨）

1. **CSSセレクタに依存しない**:

```typescript
// ❌
await page.locator(".btn.btn-primary.mt-3");
```

2. **XPathを避ける**:

```typescript
// ❌
await page.locator('xpath=//button[@class="submit"]');
```

3. **脆弱なテキストマッチを避ける**:

```typescript
// ❌
await page.getByText("Click"); // 部分一致で複数マッチの可能性
```

## 国際化対応のセレクタ

### data-testid使用（推奨）

```typescript
// 言語に依存しない
<button data-testid="submit-button">
  {t('submit')}
</button>

await page.getByTestId('submit-button');
```

### ARIA label使用

```typescript
// 言語に依存しない
<button aria-label="submit-form">
  {t('submit')}
</button>

await page.getByRole('button', { name: 'submit-form' });
```

## パフォーマンス考慮

### 効率的なセレクタ

```typescript
// ✅ 効率的
await page.getByTestId("submit");

// ❌ 非効率
await page.locator("div > div > div > button.submit");
```

### セレクタのキャッシング

```typescript
// セレクタを再利用
const submitButton = page.getByRole("button", { name: "Submit" });

await submitButton.click();
await submitButton.waitFor({ state: "disabled" });
await submitButton.waitFor({ state: "enabled" });
```

## まとめ

**セレクタ選択の優先順位**:

1. Role-based selectors (アクセシビリティロールに基づく)
2. Label-based selectors (フォーム要素のラベルに基づく)
3. Test ID selectors (data-testid属性に基づく)
4. Placeholder-based selectors (プレースホルダーに基づく)
5. Text-based selectors (表示テキストに基づく)
6. CSS selectors (最終手段)

**重要な原則**:

- UI変更に強いセレクタを選ぶ
- セマンティックな意味を持つセレクタを優先
- 国際化の影響を考慮
- 保守性を重視
