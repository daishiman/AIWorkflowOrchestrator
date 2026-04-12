# Phase 4: 統合テスト計画 — UT-SKILL-WIZARD-W2-seq-03b

## 方針

barrel export の変更のため、統合テストは TypeScript 型チェックで代替する。

## 検証コマンド

```bash
# 型チェック（最重要）
pnpm --filter @repo/desktop typecheck

# ユニットテスト
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts
```

## 型チェック検証シナリオ

| シナリオ                                       | 検証内容                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `SkillCreateWizard.tsx` が型チェックを通ること | `import type { GenerationMode } from "./wizard"` が解決できること |
| `SkillInfoStepProps` の型インポートが通ること  | `wizard/index.ts` から型エクスポートが参照できること              |
