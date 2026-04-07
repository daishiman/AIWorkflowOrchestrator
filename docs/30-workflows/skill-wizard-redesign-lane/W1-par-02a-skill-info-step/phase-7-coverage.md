# Phase 7: カバレッジ確認

## メタ情報

- Phase: 7
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

テストカバレッジを計測し、未カバーのコードパスを特定する。カバレッジ目標（80%以上）を達成するために追加テストを実施する。

## 実行タスク

- [ ] カバレッジレポートを生成する
- [ ] 未カバー箇所を特定する
- [ ] 不足テストを追加する
- [ ] カバレッジ目標（80%以上）を達成する

## 参照資料

| 資料名             | パス                                                                  | 説明           |
| ------------------ | --------------------------------------------------------------------- | -------------- |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                           | 拡充済みテスト |
| Vitest 設定        | `apps/desktop/vitest.config.ts`                                       | カバレッジ設定 |
| 実装ファイル       | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | カバレッジ対象 |

## 実行手順

### Step 1: カバレッジレポート生成

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

### Step 2: カバレッジ結果確認

確認すべき指標:

| 指標       | 目標値   |
| ---------- | -------- |
| Statements | 80% 以上 |
| Branches   | 80% 以上 |
| Functions  | 80% 以上 |
| Lines      | 80% 以上 |

### Step 3: 未カバー箇所の特定と対応

想定される未カバー箇所:

| コードパス                                                  | 対応テスト                       |
| ----------------------------------------------------------- | -------------------------------- |
| `purposeTouched=false` かつ「次へ」クリック時のエラー非表示 | 「次へ」押下後のエラー表示テスト |
| スキル名の長い入力                                          | 長文入力テスト                   |
| 全カテゴリを順番に選択                                      | カテゴリ順次選択テスト           |

### Step 4: 追加テスト例

```typescript
describe("カバレッジ補完テスト", () => {
  it("目的フィールドを入力してから削除するとエラーが表示される", async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={defaultFormData}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />
    );
    const textarea = screen.getByLabelText(/目的・背景/);
    await user.click(textarea);
    await user.tab();
    // purposeTouched=true になったのでエラーが出るはず
    expect(screen.getByText(/10文字以上/)).toBeInTheDocument();
  });

  it("全5カテゴリを順番に選択できる", async () => {
    const user = userEvent.setup();
    const categories = ["自動化", "外部連携", "データ分析", "コードサポート", "その他"];
    for (const label of categories) {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: label }));
      expect(onFormDataChange).toHaveBeenCalled();
    }
  });
});
```

### Step 5: 最終カバレッジ確認

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

カバレッジ結果をスクリーンショットまたはテキストで記録する。

## 成果物

- カバレッジレポート（コンソール出力）
- 追加テストコード（不足箇所対応分）

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] Statements / Branches / Functions / Lines が全て 80% 以上
- [ ] 未カバー箇所に対するテストが追加されている
- [ ] 全テストが GREEN になっている
