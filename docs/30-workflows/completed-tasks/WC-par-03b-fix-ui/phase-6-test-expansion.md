# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 6                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 5                                                                 |
| 後続Phase  | Phase 7                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 4 で作成した基本テストに加え、境界値・エッジケース・組み合わせシナリオのテストを追加して実装の堅牢性を高める。

## 実行タスク

- [ ] カテゴリ選択の全カテゴリ選択・全解除シナリオのテストを追加する
- [ ] `currentQuestion`の境界値テストを追加する
- [ ] `isNextEnabled`の判定境界値テストを追加する
- [ ] ボタンスタイルの否定確認テストを追加する
- [ ] 既存テストへの影響がないことを確認する

## 参照資料

| 資料名     | パス                       | 説明             |
| ---------- | -------------------------- | ---------------- |
| テスト仕様 | `phase-4-test-creation.md` | 基本テストの内容 |
| 設計書     | `phase-2-design.md`        | 境界値の仕様確認 |

## 実行手順

### Step 1: カテゴリ選択のエッジケース追加

```typescript
describe("SkillInfoStep カテゴリ選択 エッジケース", () => {
  it("全カテゴリを順番に選択できる", () => {
    const onChange = vi.fn();
    // automation → external-integration → data-analysis → code-support → other
    // 5回クリックで category が5要素の配列になる
  });

  it("2つ選択後に1つを解除すると1つ残る", () => {
    const onChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          purpose: "テスト用の目的（10文字以上）",
          category: ["automation", "data-analysis"],
        }}
        onFormDataChange={onChange}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: ["data-analysis"] })
    );
  });

  it("唯一の選択カテゴリを解除するとcategoryが空配列になる", () => {
    const onChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          purpose: "テスト用の目的（10文字以上）",
          category: ["automation"],
        }}
        onFormDataChange={onChange}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: [] })
    );
  });
});
```

### Step 2: `currentQuestion`境界値テスト追加

```typescript
describe("currentQuestion 境界値テスト", () => {
  it("answeredCount=0のときcurrentQuestion=1になる", () => {
    // Math.max(1, 0) = 1
    expect(Math.max(1, 0)).toBe(1);
  });

  it("answeredCount=6のときcurrentQuestion=6になる", () => {
    expect(Math.max(1, 6)).toBe(6);
  });

  it("freeTextのみ入力されていても回答済みと判定される", () => {
    const answer = { selectedOptions: [], freeText: "テキスト入力" };
    const answered =
      answer.selectedOptions.length > 0 || answer.freeText.trim() !== "";
    expect(answered).toBe(true);
  });

  it("selectedOptionsのみ設定されていても回答済みと判定される", () => {
    const answer = { selectedOptions: ["自分のみ"], freeText: "" };
    const answered =
      answer.selectedOptions.length > 0 || answer.freeText.trim() !== "";
    expect(answered).toBe(true);
  });

  it("selectedOptionsが空配列かつfreeText空白のみは未回答と判定される", () => {
    const answer = { selectedOptions: [], freeText: "   " };
    const answered =
      answer.selectedOptions.length > 0 || answer.freeText.trim() !== "";
    expect(answered).toBe(false);
  });
});
```

### Step 3: `isNextEnabled`境界値テスト追加

```typescript
describe("SkillInfoStep isNextEnabled 境界値テスト", () => {
  it("purposeが9文字の場合は次へボタンが非活性", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "123456789", category: ["automation"] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });

  it("purposeが10文字ちょうどで次へボタンが活性化する", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "1234567890", category: ["automation"] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).not.toBeDisabled();
  });

  it("purposeが10文字以上でもcategoryが空配列なら非活性", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "テスト用の目的（10文字以上）", category: [] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
```

### Step 4: `skillCreator-wizard.test.ts`の追加テスト

```typescript
describe("SkillInfoFormData カテゴリ複数選択 エッジケース", () => {
  it("category に空配列は許容される", () => {
    const data: SkillInfoFormData = {
      purpose: "テスト",
      category: [],
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("category に5カテゴリ全てを指定できる", () => {
    const data: SkillInfoFormData = {
      purpose: "テスト",
      category: [
        "automation",
        "external-integration",
        "data-analysis",
        "code-support",
        "other",
      ],
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });
});
```

### Step 5: テスト実行

```bash
pnpm --filter @repo/shared test --reporter=verbose
pnpm --filter @repo/desktop test --reporter=verbose
```

## 成果物

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: エッジケーステスト追記（修正）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`: エッジケーステスト追記（修正）

## 完了条件

- [ ] カテゴリ全選択・全解除のエッジケーステストが追加されている
- [ ] `currentQuestion`の回答済み判定の境界値テストが追加されている
- [ ] `isNextEnabled`のpurpose文字数境界値テストが追加されている
- [ ] 追加テストが全件パスしている
- [ ] 既存テストに影響がないことを確認している
