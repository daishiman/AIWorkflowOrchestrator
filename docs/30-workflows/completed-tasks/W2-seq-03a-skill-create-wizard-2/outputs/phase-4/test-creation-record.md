# Phase 4: テスト作成記録（Red → Green 確認）

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## 作成テストファイル

| ファイル                                | パス                                                                                         | テスト数 |
| --------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| `SkillCreateWizard.test.tsx`            | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`            | 9        |
| `SkillCreateWizard.W2-seq-03a.test.tsx` | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx` | 10       |

**合計テスト数**: 19

---

## TDD サイクル確認

### Red → Green の経緯

本タスク（W2-seq-03a）では、実装とテストを同時に進め、最終的に全 19 件が Green となった。

### 実行結果

```
✓ SkillCreateWizard.test.tsx (9 tests) 2493ms
✓ SkillCreateWizard.W2-seq-03a.test.tsx (10 tests) 829ms
Test Files  2 passed (2)
Tests       19 passed (19)
```

---

## mock 設計

```typescript
// Store / shared service モック（全テストファイル共通）
vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useClearGenerationState: () => vi.fn(),
  useWorkflowSnapshot: () => mockUseWorkflowSnapshot(),
}));

vi.mock(
  "../../../../../../../packages/shared/src/services/skillCreator/index.ts",
  () => ({
    inferSmartDefaults: (...args: unknown[]) => mockInferSmartDefaults(...args),
  }),
);
```
