# Phase 3: 詳細設計 — severity フィルタ追加

## 1. 型定義

```typescript
// SkillLifecyclePanel.tsx 内に追加
type SeverityFilterLevel = "all" | "warning+" | "error";

const SEVERITY_FILTER_OPTIONS: readonly {
  value: SeverityFilterLevel;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "Warning+" },
  { value: "error", label: "Error" },
];
```

## 2. フィルタ関数

```typescript
function filterChecksBySeverity(
  checks: RuntimeSkillCreatorVerifyCheck[],
  filter: SeverityFilterLevel,
): RuntimeSkillCreatorVerifyCheck[] {
  if (filter === "all") return checks;
  if (filter === "warning+") return checks.filter((c) => c.severity !== "info");
  return checks.filter((c) => c.severity === "error");
}
```

## 3. useMemo: filteredChecksByLayer

```typescript
const filteredChecksByLayer = useMemo(() => {
  const result: Record<VerifyLayerKey, RuntimeSkillCreatorVerifyCheck[]> =
    createVerifyChecksByLayer();
  for (const layer of VERIFY_LAYER_ORDER) {
    result[layer] = filterChecksBySeverity(
      checksByLayer[layer],
      severityFilter,
    );
  }
  return result;
}, [checksByLayer, severityFilter]);
```

## 4. 総件数計算（フィルタボタン上の件数表示用）

```typescript
const severityTotalCounts = useMemo(() => {
  const allChecks = verifyDetail?.checks ?? [];
  return {
    all: allChecks.length,
    "warning+": allChecks.filter((c) => c.severity !== "info").length,
    error: allChecks.filter((c) => c.severity === "error").length,
  };
}, [verifyDetail?.checks]);
```

## 5. UI コンポーネント: SeverityFilterBar

verify detail セクション内、Status/Phase/Evidence/Route グリッドの前に配置。

```tsx
<div
  className="mt-4 flex gap-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-1"
  role="radiogroup"
  aria-label="severity フィルタ"
  data-testid="severity-filter"
>
  {SEVERITY_FILTER_OPTIONS.map((option) => (
    <button
      key={option.value}
      type="button"
      role="radio"
      aria-checked={severityFilter === option.value}
      onClick={() => setSeverityFilter(option.value)}
      className={...}
      data-testid={`severity-filter-${option.value}`}
    >
      {option.label} ({severityTotalCounts[option.value]})
    </button>
  ))}
</div>
```

## 6. VerifyLayerGroup へ渡すデータの変更

```diff
- checks={checksByLayer[layer]}
+ checks={filteredChecksByLayer[layer]}
```

表示フィルタも変更:

```diff
- (layer) => (checksByLayer[layer]?.length ?? 0) > 0
+ (layer) => (filteredChecksByLayer[layer]?.length ?? 0) > 0
```

## 7. reverify 時の state 維持

`severityFilter` は `handleReverify` 内でリセットしない。
`activeWorkflowId` 変更時に `"all"` にリセットする useEffect を追加:

```typescript
useEffect(() => {
  setSeverityFilter("all");
}, [activeWorkflowId]);
```

## 8. スタイル定数

```typescript
const severityFilterButtonStyles = {
  active:
    "rounded-md bg-[var(--status-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)]",
  inactive:
    "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
} as const;
```

## 9. テスト方針

- `data-testid="severity-filter"` で filter bar を取得
- `data-testid="severity-filter-all"` / `severity-filter-warning+` / `severity-filter-error` で各ボタンを取得
- デフォルト `all` で全件表示を確認
- `warning+` クリックで info が非表示になることを確認
- `error` クリックで warning/info が非表示になることを確認
- 空 layer が非表示になることを確認
- reverify 後に filter state が維持されることを確認
