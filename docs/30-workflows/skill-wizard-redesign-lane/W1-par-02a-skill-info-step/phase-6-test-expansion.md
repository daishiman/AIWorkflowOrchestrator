# Phase 6: テスト拡充

## メタ情報

- Phase: 6
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・境界値・アクセシビリティ・統合シナリオのテストを追加し、テストスイートを充実させる。

## 実行タスク

- [ ] 境界値テストを追加する
- [ ] エッジケーステストを追加する
- [ ] アクセシビリティテストを追加する
- [ ] `external-integration` カテゴリの伝達テストを追加する
- [ ] フォームデータ変更の連鎖テストを追加する
- [ ] テストが全て GREEN であることを確認する

## 参照資料

| 資料名         | パス                                                                                 | 説明       |
| -------------- | ------------------------------------------------------------------------------------ | ---------- |
| Phase 4 テスト | `phase-4-test-creation.md`                                                           | 基本テスト |
| Phase 5 実装   | `phase-5-implementation.md`                                                          | 実装仕様   |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | 拡充対象   |

## 実行手順

### Step 1: 境界値テスト追加

```typescript
describe("目的フィールドの境界値", () => {
  it("目的がちょうど10文字のとき「次へ」ボタンは有効", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, purpose: "あいうえおかきくけこ" }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
  });

  it("目的が空白のみ10文字のとき「次へ」ボタンは無効", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, purpose: "          " }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
```

### Step 2: エッジケーステスト追加

```typescript
describe("エッジケース", () => {
  it("スキル名が空のままでも目的が10文字以上なら「次へ」は有効", () => {
    render(
      <SkillInfoStep
        formData={{ skillName: "", purpose: "1234567890", category: "automation" }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
  });

  it("カテゴリが external-integration のとき選択状態が正しく表示される", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: "external-integration" }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const categoryLabels = [
      "自動化",
      "外部連携",
      "データ分析",
      "コードサポート",
      "その他",
    ];
    categoryLabels.forEach((label) => {
      const button = screen.getByRole("button", { name: label });
      if (label === "外部連携") {
        expect(button).toHaveAttribute("aria-pressed", "true");
      } else {
        expect(button).toHaveAttribute("aria-pressed", "false");
      }
    });
  });

  it("スキル名変更時に onFormDataChange が呼ばれる", async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={defaultFormData}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />
    );
    await user.type(screen.getByLabelText(/スキル名/), "テスト");
    expect(onFormDataChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ skillName: "テスト" })
    );
  });
});
```

### Step 3: アクセシビリティテスト追加

```typescript
describe("アクセシビリティ", () => {
  it("カテゴリグループに role=group と aria-label が付与されている", () => {
    render(
      <SkillInfoStep
        formData={defaultFormData}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(
      screen.getByRole("group", { name: "カテゴリを選択" })
    ).toBeInTheDocument();
  });

  it("選択中カテゴリタグの aria-pressed が true になる", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: "automation" }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: "自動化" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("未選択カテゴリタグの aria-pressed が false になる", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: "automation" }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: "外部連携" })
    ).toHaveAttribute("aria-pressed", "false");
  });
});
```

### Step 4: external-integration 伝達テスト追加

```typescript
describe("external-integration カテゴリの伝達", () => {
  it("external-integration を選択すると formData.category が更新される", async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={defaultFormData}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: "外部連携" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "external-integration" })
    );
  });
});
```

### Step 5: テスト実行（全GREEN確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

## 成果物

- 拡充済みテストファイル（境界値・エッジケース・アクセシビリティ・伝達テスト追加）

## 完了条件

- [ ] 境界値テスト（10文字ちょうど・空白のみ）が追加されている
- [ ] エッジケーステストが追加されている
- [ ] アクセシビリティテスト（role・aria-pressed）が追加されている
- [ ] `external-integration` カテゴリの伝達テストが追加されている
- [ ] 全テストが GREEN になっている
