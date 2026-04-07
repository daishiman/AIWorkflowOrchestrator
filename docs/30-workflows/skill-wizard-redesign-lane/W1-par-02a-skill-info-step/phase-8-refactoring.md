# Phase 8: リファクタリング

## メタ情報

- Phase: 8
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

動作するテストを GREEN に保ちながら、`SkillInfoStep.tsx` のコード品質を向上させる。可読性・保守性・再利用性の観点でリファクタリングを行う。

## 実行タスク

- [ ] コンポーネント内の重複コードを排除する
- [ ] 定数・ユーティリティを適切に整理する
- [ ] クラス名の条件分岐を整理する
- [ ] 不要なコメントを削除する
- [ ] 型の不要な `as` キャストを排除する
- [ ] リファクタリング後にテストが全て GREEN であることを確認する

## 参照資料

| 資料名         | パス                                                                                 | 説明                 |
| -------------- | ------------------------------------------------------------------------------------ | -------------------- |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | リファクタリング対象 |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | グリーン維持確認用   |

## 実行手順

### Step 1: clsx / cn ユーティリティの活用

条件付きクラス名を `cn`（または `clsx`）で整理する。

```typescript
// Before
className={`rounded border px-3 py-2 text-sm focus:outline-none ${
  showPurposeError
    ? "border-red-500 focus:border-red-500"
    : "border-gray-300 focus:border-blue-500"
}`}

// After（cn ユーティリティ使用）
className={cn(
  "rounded border px-3 py-2 text-sm focus:outline-none",
  showPurposeError
    ? "border-red-500 focus:border-red-500"
    : "border-gray-300 focus:border-blue-500"
)}
```

### Step 2: カスタムフックの抽出（必要に応じて）

バリデーションロジックが複雑になった場合、`useSkillInfoForm` フックへの抽出を検討する。

```typescript
// hooks/useSkillInfoForm.ts（必要な場合のみ）
function useSkillInfoForm(
  formData: SkillInfoFormData,
  onFormDataChange: (data: SkillInfoFormData) => void,
) {
  const [purposeTouched, setPurposeTouched] = useState(false);
  const isNextEnabled = formData.purpose.trim().length >= 10;
  const showPurposeError =
    purposeTouched && formData.purpose.trim().length < 10;
  // ...
  return {
    isNextEnabled,
    showPurposeError,
    setPurposeTouched,
    handleCategoryClick,
  };
}
```

注意: 単純な実装の場合はフック抽出不要。複雑化した場合のみ検討する。

### Step 3: CATEGORY_OPTIONS の定数整理

`CATEGORY_OPTIONS` がコンポーネントファイルのトップレベルに定義されていることを確認する。レンダリングごとに再生成されないよう、コンポーネント外に配置する。

### Step 4: Props インターフェースのエクスポート確認

`SkillInfoStepProps` が必要に応じてエクスポートされているか確認する（テストや親コンポーネントから参照される場合）。

### Step 5: lint / typecheck の実行

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### Step 6: テスト再実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

## 成果物

- リファクタリング済み `SkillInfoStep.tsx`
- lint / typecheck エラーなしの確認結果

## 完了条件

- [ ] クラス名の条件分岐が整理されている
- [ ] `CATEGORY_OPTIONS` がコンポーネント外のトップレベルに配置されている
- [ ] 不要なコメント・デッドコードが除去されている
- [ ] lint / typecheck エラーがない
- [ ] リファクタリング後も全テストが GREEN になっている
