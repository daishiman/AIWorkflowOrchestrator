# Phase 12 Implementation Guide

## Part 1: 中学生向けの説明

### なぜ必要か

検証結果をそのまま全部並べると、「どこが大事なのか」が見えにくくなります。
特に Layer 3 / 4 のチェックが増えると、直す場所を探すのに時間がかかります。

### 何をするか

検証結果（checks）を **Layer 1〜Layer 4 に分けて**見せ、必要なら折りたためる（accordion）表示にします。
これにより「どの層で何が起きているか」を先に掴めます。

### 日常の例え

たとえば **教室**の名簿を、学年ごとに分けて整理するイメージです（例え）。
全部を一列に並べるより、「どこを見ればいいか」がすぐ分かります。

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

### APIシグネチャ

verify detail の取得は、Renderer から `skillCreator.getVerifyDetail(planId)` を呼び出す。

```ts
// APIシグネチャ（概略）
window.electronAPI.skillCreator.getVerifyDetail(planId: string): Promise<{
  success: boolean;
  data?: { checks: RuntimeSkillCreatorVerifyCheck[]; reverifyEligible: boolean };
  error?: string;
}>;
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

### 使用例

```tsx
// 使用例: Layer group -> accordion 表示
{
  (["layer1", "layer2", "layer3", "layer4"] as const).map((layer) => (
    <VerifyLayerGroup
      key={layer}
      layer={layer}
      label={verifyLayerLabels[layer]}
      checks={checksByLayer[layer]}
      isExpanded={expandedLayers[layer] ?? true}
      onToggle={toggleLayer}
    />
  ));
}
```

### エラーハンドリング

- `getVerifyDetail()` が失敗した場合は `verifyDetail` を `null` にし、UI では「verify detail の取得に失敗しました。」のようなメッセージを表示する（エラーハンドリング）。
- verify detail の取得失敗は execution authority を Renderer に移さない（表示の破綻を避ける）。

### エッジケース

- checks が空の場合: Layer group 自体が表示されない（空の Layer は非表示）。
- reverify の直後: UI が再 fetch した checks を表示しつつ、折りたたみ state は維持する（エッジケース）。

### 設定と定数

- 定数一覧:
  - `VERIFY_LAYER_ORDER`: Layer の表示順
  - `verifyLayerLabels`: Layer 表示名
  - `verifyCheckSeverityStyles`: severity 別の badge style
  - `verifyCheckSeverityIcon`: severity 別アイコン
  - `createDefaultExpandedLayers()`: accordion の初期展開状態

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
