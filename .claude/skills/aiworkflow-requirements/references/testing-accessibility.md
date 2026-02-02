# アクセシビリティテストガイド

> **バージョン**: 1.0.0
> **更新日**: 2026-02-02
> **関連タスク**: TASK-8B
> **準拠規格**: WCAG 2.1 AA

---

## 概要

UIコンポーネントのアクセシビリティ（a11y）検証パターン。
スクリーンリーダー互換性、キーボード操作、ARIA属性の自動テストを対象とする。

---

## 1. ARIA属性テスト

### ダイアログ/モーダル

```typescript
describe("ダイアログアクセシビリティ", () => {
  it("必須ARIA属性が設定されている", () => {
    render(<PermissionDialog />);
    const dialog = screen.getByRole("dialog");

    // 必須属性
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");

    // ラベル参照先が存在
    const labelId = dialog.getAttribute("aria-labelledby");
    expect(document.getElementById(labelId!)).toBeInTheDocument();
  });
});
```

### コンボボックス/ドロップダウン

```typescript
describe("コンボボックスアクセシビリティ", () => {
  it("トリガーにARIA属性が設定されている", () => {
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls");
  });

  it("展開時にaria-expandedが更新される", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("選択時にaria-activedescendantが設定される", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("combobox"))
      .toHaveAttribute("aria-activedescendant");
  });
});
```

### フォーム要素

```typescript
describe("フォームアクセシビリティ", () => {
  it("入力フィールドにラベルが関連付けられている", () => {
    render(<SearchForm />);
    const input = screen.getByRole("searchbox");

    // ラベル関連付け（いずれかの方法）
    expect(input).toHaveAccessibleName(); // aria-label or <label>
  });

  it("エラー時にaria-invalidとaria-describedbyが設定される", () => {
    render(<SearchForm error="入力エラー" />);
    const input = screen.getByRole("searchbox");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");

    const errorId = input.getAttribute("aria-describedby");
    expect(document.getElementById(errorId!)).toHaveTextContent("入力エラー");
  });
});
```

---

## 2. キーボードナビゲーション

### フォーカストラップ

```typescript
describe("フォーカストラップ", () => {
  it("Tabで最後から最初に循環する", async () => {
    render(<Modal />);
    const modal = screen.getByRole("dialog");
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    lastElement.focus();

    fireEvent.keyDown(modal, { key: "Tab" });

    expect(document.activeElement).toBe(focusableElements[0]);
  });

  it("Shift+Tabで最初から最後に循環する", async () => {
    render(<Modal />);
    const modal = screen.getByRole("dialog");
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    (focusableElements[0] as HTMLElement).focus();

    fireEvent.keyDown(modal, { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
  });
});
```

### キーボードショートカット

```typescript
describe("キーボード操作", () => {
  const keyActions = [
    { key: "ArrowDown", action: "次のオプションに移動" },
    { key: "ArrowUp", action: "前のオプションに移動" },
    { key: "Enter", action: "選択を確定" },
    { key: "Escape", action: "閉じる" },
    { key: "Home", action: "最初のオプションに移動" },
    { key: "End", action: "最後のオプションに移動" },
  ];

  it.each(keyActions)("$key: $action", async ({ key }) => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard(`{${key}}`);

    // キーごとの検証ロジック
  });
});
```

---

## 3. スクリーンリーダー互換性

### ライブリージョン

```typescript
describe("ライブリージョン", () => {
  it("ステータス更新がaria-liveで通知される", () => {
    render(<StatusIndicator status="loading" />);

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("エラーがaria-live='assertive'で通知される", () => {
    render(<ErrorAlert message="エラーが発生しました" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});
```

### 非表示要素

```typescript
describe("スクリーンリーダー非表示", () => {
  it("装飾要素はaria-hiddenで隠される", () => {
    render(<IconButton icon={<Icon />} label="保存" />);

    const icon = screen.getByTestId("decorative-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("視覚的に非表示でもSRには表示される", () => {
    render(<SkipLink />);

    // sr-only クラスでも読み上げ可能
    expect(screen.getByText("メインコンテンツへスキップ"))
      .toBeInTheDocument();
  });
});
```

---

## 4. 色とコントラスト

### 情報伝達

```typescript
describe("色以外の情報伝達", () => {
  it("エラー状態が色以外でも識別可能", () => {
    render(<Input error="必須項目です" />);
    const input = screen.getByRole("textbox");

    // 色だけでなくアイコン/テキストでも識別可能
    expect(screen.getByRole("img", { name: /エラー/i })).toBeInTheDocument();
    expect(screen.getByText("必須項目です")).toBeInTheDocument();

    // ARIA状態も設定
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("必須フィールドがアスタリスク以外でも識別可能", () => {
    render(<FormField required label="名前" />);

    expect(screen.getByText(/必須/i)).toBeInTheDocument();
    // または aria-required
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });
});
```

---

## 5. 検証チェックリスト

### コンポーネント別要件

| コンポーネント | 必須ARIA | キーボード | フォーカス |
|--------------|----------|-----------|----------|
| Dialog/Modal | role, aria-modal, aria-labelledby | Escape閉じ | トラップ |
| Combobox | aria-haspopup, aria-expanded, aria-controls | Arrow, Enter, Escape | activedescendant |
| Button | type, aria-label (icon-only) | Enter, Space | visible |
| Input | aria-label or label | - | visible |
| Alert | role="alert", aria-live | - | - |

### テストカバレッジ目標

```typescript
// a11y テストは全コンポーネントに必須
describe("アクセシビリティ", () => {
  // 最低限のテスト
  it("基本的なARIA属性が設定されている", () => {});
  it("キーボード操作が可能", () => {});
  it("フォーカスが視覚的に識別可能", () => {}); // Storybook等で確認
});
```

---

## 6. 自動テストツール

### jest-axe統合

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("自動アクセシビリティ検証", () => {
  it("axe違反がない", async () => {
    const { container } = render(<PermissionDialog />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

### 設定

```typescript
// vitest.setup.ts
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
```

---

## 7. WCAG 2.1 AAチェックリスト

### 知覚可能

- [ ] 非テキストコンテンツに代替テキスト
- [ ] 色だけで情報を伝達していない
- [ ] コントラスト比4.5:1以上

### 操作可能

- [ ] 全機能がキーボードで操作可能
- [ ] フォーカスが視覚的に識別可能
- [ ] フォーカス順序が論理的

### 理解可能

- [ ] ページ言語が指定されている
- [ ] エラーが特定・説明されている
- [ ] ラベルまたは説明が提供されている

### 堅牢

- [ ] 有効なHTML/ARIA
- [ ] 名前・役割・値がプログラムで決定可能

---

## 参照

- **テストパターン**: [testing-component-patterns.md](testing-component-patterns.md)
- **UI/UX原則**: [ui-ux-design-principles.md](ui-ux-design-principles.md)
- **WCAG 2.1**: https://www.w3.org/TR/WCAG21/

---

## 変更履歴

| Version | Date       | Changes                              |
|---------|------------|--------------------------------------|
| 1.0.0   | 2026-02-02 | TASK-8Bアクセシビリティテストから初版作成 |
