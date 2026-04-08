# Phase 4: テスト作成（TDD Red）

## メタ情報

- Phase: 4
- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 作成日: 2026-04-08
- ステータス: **completed**

## 目的

実装前にテストを作成し（TDD Red 状態）、テストマトリクスを確定する。
Phase 5 の実装で全テストが Green になることを保証するためのテスト仕様を定義する。

## テストマトリクス

| TC    | 対象             | 入力                                     | 期待出力 / 動作                                            | テストファイル           |
| ----- | ---------------- | ---------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| TC-01 | レンダリング確認 | `formData` に初期値を渡す                | 3フィールドと「次へ」ボタンが描画される                    | `SkillInfoStep.test.tsx` |
| TC-02 | スキル名変更     | スキル名フィールドを変更                 | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-03 | 目的変更         | 目的フィールドを変更                     | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-04 | カテゴリ変更     | カテゴリボタンを選択                     | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-05 | 選択肢列挙確認   | コンポーネントをレンダリング             | `SkillCategory` の全値がボタンとして存在する               | `SkillInfoStep.test.tsx` |
| TC-06 | props 型整合     | `formData` に `SkillInfoFormData` を渡す | TypeScript の型エラーなくコンパイルできる                  | `SkillInfoStep.test.tsx` |
| TC-07 | 現在値の表示確認 | `formData.skillName = "my-skill"` を渡す | スキル名フィールドに `"my-skill"` が表示されている         | `SkillInfoStep.test.tsx` |
| TC-08 | Next の活性条件  | 目的が 10 文字未満またはカテゴリ未選択   | 「次へ」ボタンが無効のままになる                           | `SkillInfoStep.test.tsx` |
| TC-09 | Next の送信      | 目的が 10 文字以上かつカテゴリ選択済み   | 「次へ」クリックで `onNext` が呼ばれる                     | `SkillInfoStep.test.tsx` |

## テストファイル仕様

### ファイルパス

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

### テストフレームワーク

- **テストランナー**: Vitest
- **DOM 環境**: jsdom
- **コンポーネントテスト**: React Testing Library（`@testing-library/react`）
- **イベント発火**: `fireEvent`

### テスト実装の注意点

- カテゴリは button 群なので `fireEvent.click()` を使用する
- `vi.fn()` を使用して `onFormDataChange` と `onNext` をモックする
- `SkillInfoFormData` は `@repo/shared/types/skillCreator` から subpath import する

### テスト雛形（TC-01 の例）

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";
import { SkillInfoStep } from "../SkillInfoStep";

const defaultValue: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: null,
};

describe("SkillInfoStep", () => {
  it("TC-01: スキル名・目的・カテゴリの 3フィールドが描画される", () => {
    render(
      <SkillInfoStep
        formData={defaultValue}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox", { name: /スキル名/i })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /目的/i })).toBeTruthy();
    expect(screen.getByRole("group", { name: /カテゴリを選択/i })).toBeTruthy();
  });
});
```

## 手順

1. `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` を新規作成し、TC-01〜TC-09 を記述する（Red 状態）
2. `pnpm --filter @repo/desktop vitest run` を実行して全テストが FAIL することを確認する（TDD Red 確認）
3. 命名規則が既存の wizard コンポーネントの camelCase / PascalCase と整合しているか確認する

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`（Red → Green 後は Green 状態）
- TDD Red 確認のテスト実行ログ

## 完了条件

- [x] TC-01〜TC-09 がテストファイルとして作成されている
- [x] 全テストが Phase 5 実装後に Green になっている
