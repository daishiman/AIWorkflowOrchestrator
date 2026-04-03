# Phase 12 Implementation Guide

## Part 1: 中学生向けの説明

検証結果をそのまま全部並べると、「どこが大事なのか」が見えにくくなります。

今回の変更は、成績表を教科ごとに分けるのと同じです。
Layer 1 〜 Layer 4 に分けて見せることで、直す場所が一目で分かるようにしました。

## Part 2: 技術的詳細

### 実装の要点

- `verifyDetail.checks` を Layer 別にまとめた
- Layer ごとに accordion を付けた
- `info` / `warning` / `error` を `✓` / `⚠` / `✗` に変換した
- Layer ヘッダーに件数バッジを出した
- `reverifyWorkflow` 後も折りたたみ状態を保持した

### 主な型

```ts
type RuntimeSkillCreatorVerifyCheckSeverity = "info" | "warning" | "error";

interface RuntimeSkillCreatorVerifyCheck {
  id: string;
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: RuntimeSkillCreatorVerifyCheckSeverity;
  summary: string;
  passed: boolean;
}
```

### 依存データ

```tsx
const checksByLayer = useMemo(() => {
  const groups: Record<
    RuntimeSkillCreatorVerifyCheck["layer"],
    RuntimeSkillCreatorVerifyCheck[]
  > = {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  };

  for (const check of verifyDetail?.checks ?? []) {
    groups[check.layer].push(check);
  }

  return groups;
}, [verifyDetail?.checks]);
```

### 実装ファイル

| ファイル                                                                                           | 内容                                 |
| -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | Layer 別表示、accordion、badge、icon |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | Layer 表示と reverify 保持の検証     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | fixture 整合                         |

## Part 3: 実行結果

### 検証

- `pnpm --filter @repo/desktop typecheck` は PASS
- `pnpm exec eslint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` は PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` は PASS

### 画面証跡

- `outputs/phase-11/screenshots/TC-01-layer-grouped-light.png`
- `outputs/phase-11/screenshots/TC-02-layer-grouped-dark.png`
- `outputs/phase-11/screenshots/TC-03-layer3-collapsed-light.png`
- `outputs/phase-11/screenshots/TC-04-error-badge-light.png`
- `outputs/phase-11/screenshots/TC-05-error-badge-dark.png`
- `outputs/phase-11/screenshots/TC-06-empty-checks-light.png`

### 備考

- `apps/backend/` と `packages/shared/` は変更していない。
- full test run は環境要因の `EAGAIN` で止まったが、対象機能の検証は完了している。
