# Phase 1: 受け入れ基準 — UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                                                                                                 | 検証方法                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| AC-1 | 全 `SkillCategory` 値（5件: automation / external-integration / data-analysis / code-support / other）に対応する日本語ラベルが定義されている | ユニットテスト TC-01〜TC-06                                      |
| AC-2 | `SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数がエクスポートされ、UIコンポーネントから参照可能                                | `grep -n "export.*SKILL_CATEGORY_LABELS\|getSkillCategoryLabel"` |
| AC-3 | 新しい `SkillCategory` 値が追加された場合にTypeScriptの型チェックでラベル未定義を検出できる（`Record<SkillCategory, string>` 型を活用）      | `pnpm --filter @repo/shared typecheck`                           |

## 検証コマンド

```bash
# AC-1 / AC-2: テスト実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts

# AC-3: 型チェック
pnpm --filter @repo/shared typecheck
```
