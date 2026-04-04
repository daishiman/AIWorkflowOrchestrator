# Phase 12 Implementation Guide — UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

## Part 1: 中学生向けの説明

### なぜ必要か

Verify detail には `info`、`warning`、`error` のチェックがたくさん並びます。
全部を同じ重さで見ていると、本当に先に直すべき `error` や `warning` が埋もれてしまいます。
だから、まず「何が大事か」を切り替えられるようにする必要があります。

### 何をするか

`all` / `warning+` / `error` の 3 段階で表示を切り替えます。
`all` は全部表示、`warning+` は `warning` と `error` だけ、`error` は `error` だけを見せます。
Layer ごとのまとまりや accordion の開閉はそのまま残るので、見たい粒度だけを変えられます。

### 日常の例え

教室の掲示板を思い浮かべると分かりやすいです。
最初は全部の連絡が貼ってありますが、「今すぐ読むものだけ見たい」ときは、緊急連絡だけを前に出した方が探しやすいです。
このフィルタは、その掲示板の表示を「全部 / 大事なものだけ / いちばん急ぐものだけ」に切り替えるイメージです。

## Part 2: 技術的詳細

### 実装の要点

- `SeverityFilterLevel` を `"all" | "warning+" | "error"` に定義した
- `SEVERITY_FILTER_OPTIONS` でボタンの選択肢を固定した
- `severityFilterButtonStyles` で active / inactive の見た目を分けた
- `filterChecksBySeverity()` で severity に応じた絞り込みを行った
- `severityFilter` state を追加し、初期値は `all` にした
- `filteredChecksByLayer` を `checksByLayer` の下流に置いて、Layer grouping を壊さずに絞り込んだ
- `severityTotalCounts` はフィルタ前の総数から計算して、各ボタンに件数を出した
- `activeWorkflowId` が変わったらフィルタを `all` に戻すようにした
- 絞り込みで空になった Layer は非表示にした

### 主な型と定数

```ts
type SeverityFilterLevel = "all" | "warning+" | "error";

const SEVERITY_FILTER_OPTIONS: readonly {
  value: SeverityFilterLevel;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "警告以上" },
  { value: "error", label: "エラーのみ" },
];

const severityFilterButtonStyles = {
  active:
    "rounded-md bg-[var(--status-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)]",
  inactive:
    "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
} as const;
```

### データフロー

```text
verifyDetail.checks
  -> checksByLayer
  -> filterChecksBySeverity()
  -> filteredChecksByLayer
  -> VerifyLayerGroup
```

### APIシグネチャ

verify detail と再検証は Renderer から SkillCreator API を呼ぶ。

```ts
window.electronAPI.skillCreator.getVerifyDetail(planId: string): Promise<{
  success: boolean;
  data?: {
    planId: string;
    currentPhase: string;
    status: "pending" | "pass" | "fail";
    message?: string;
    checks: Array<{
      id: string;
      layer: "layer1" | "layer2" | "layer3" | "layer4";
      severity: "info" | "warning" | "error";
      summary: string;
      evidenceSummary?: string;
    }>;
    evidenceCount: number;
    route: { type: "integrated_api" | "terminal_handoff"; summary: string };
    reverifyEligible: boolean;
  };
  error?: string;
}>;

window.electronAPI.skillCreator.reverifyWorkflow(planId: string): Promise<{
  success: boolean;
  data?: { accepted: boolean; disabledReason?: string };
  error?: string;
}>;
```

### 使用例

```tsx
<div
  role="radiogroup"
  aria-label="重要度フィルタ"
  data-testid="severity-filter"
>
  {SEVERITY_FILTER_OPTIONS.map((option) => (
    <button
      key={option.value}
      type="button"
      role="radio"
      aria-checked={severityFilter === option.value}
      onClick={() => setSeverityFilter(option.value)}
    >
      {option.label} ({severityTotalCounts[option.value]})
    </button>
  ))}
</div>;

{
  VERIFY_LAYER_ORDER.filter(
    (layer) => (filteredChecksByLayer[layer]?.length ?? 0) > 0,
  ).map((layer) => (
    <VerifyLayerGroup
      key={layer}
      layer={layer}
      label={verifyLayerLabels[layer]}
      checks={filteredChecksByLayer[layer]}
      isExpanded={expandedLayers[layer] ?? true}
      onToggle={toggleLayer}
    />
  ));
}
```

### エラーハンドリング

- `getVerifyDetail()` が失敗したら `verifyDetailError` に理由を入れて、`skill-lifecycle-error` で見せる
- `reverifyWorkflow()` が失敗したら現在の表示を壊さず、再検証エラーだけを返す
- `getVerifyDetail()` の応答に問題がある場合は `verifyDetail = null` に戻す
- `SkillCreator API` が使えない場合は、UI が壊れないように早めに終了する

### エッジケース

- `warning+` で `info` だけの Layer は消える
- `error` で `error` が 0 件なら、全 Layer が消える
- 空の Layer は最初から出さない
- `activeWorkflowId` が変わったらフィルタは `all` に戻る
- reverify 後も accordion の開閉状態は保持する

### 設定と定数

- `VERIFY_LAYER_ORDER`: Layer の表示順
- `verifyLayerLabels`: Layer の表示名
- `VERIFY_SEVERITY_ORDER`: Layer ヘッダーの severity 表示順
- `SEVERITY_FILTER_OPTIONS`: フィルタの選択肢
- `severityFilterButtonStyles`: フィルタボタンの見た目
- `verifyStatusBadgeStyles`: verify status のバッジ色
- `verifyCheckSeverityStyles`: severity バッジの色
- `verifyCheckSeverityIcon`: severity のアイコン
- `createDefaultExpandedLayers()`: accordion の初期状態
- `getVerifySeverityCounts()`: Layer ごとの件数集計
- `formatSeverityCountLabel()`: 件数ラベルの整形

### 変更ファイル

| ファイル                                                                            | 内容                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | severity フィルタ UI、絞り込み、件数表示、空 Layer 非表示 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | SF-01〜SF-09 の追加                                       |
| `apps/desktop/scripts/capture-task-skill-lifecycle-severity-filter-phase11.mjs`     | phase 11 の visual capture と証跡生成                     |
| `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.tsx`        | 撮影用 harness                                            |
| `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.html`       | 撮影用 entry HTML                                         |

## Part 3: 実行結果と画面証跡

### 検証結果

- `pnpm --dir apps/desktop test:run src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` → 27 tests PASS
- `pnpm --filter @repo/desktop typecheck` → 0 errors
- `node apps/desktop/scripts/capture-task-skill-lifecycle-severity-filter-phase11.mjs` → current build screenshots 4件を取得

### 画面証跡

- `outputs/phase-11/screenshots/TC-11-01-severity-filter-all-light.png`
- `outputs/phase-11/screenshots/TC-11-02-severity-filter-warning-plus-light.png`
- `outputs/phase-11/screenshots/TC-11-03-severity-filter-error-light.png`
- `outputs/phase-11/screenshots/TC-11-04-severity-filter-all-dark.png`

### 備考

- `apps/backend/` と `packages/shared/` には変更を入れていない
- phase 11 の visual capture は current build の `SkillLifecyclePanel` から直接取得した
