# Phase 2 成果物: 設計書

## 1. 状態管理設計

### 新規 state

```typescript
type SeverityFilterValue = "all" | "warning+" | "error";

// SkillLifecyclePanel 内
const [severityFilter, setSeverityFilter] =
  useState<SeverityFilterValue>("all");
```

### state ライフサイクル

| イベント              | 動作                                   |
| --------------------- | -------------------------------------- |
| 初期化                | `'all'`                                |
| ユーザー操作          | セグメントコントロールのクリックで変更 |
| reverify              | **リセットしない**                     |
| activeWorkflowId 変更 | `'all'` にリセット                     |

### 派生 state

```typescript
// フィルタ適用後の checks
const filteredChecksByLayer = useMemo(() => {
  const result = createVerifyChecksByLayer();
  for (const layer of VERIFY_LAYER_ORDER) {
    result[layer] = (checksByLayer[layer] ?? []).filter((check) =>
      shouldShowCheck(check.severity, severityFilter),
    );
  }
  return result;
}, [checksByLayer, severityFilter]);
```

## 2. UI コンポーネント設計

### セグメントコントロール

- 配置: verify detail の Layer アコーディオン一覧の上部
- ラベル: `すべて` / `⚠ Warning+` / `✗ Error`
- 選択中スタイル: `bg-[var(--bg-tertiary)] font-semibold text-[var(--text-primary)]`
- 非選択スタイル: `text-[var(--text-secondary)]`
- ARIA: `role="group"` + `aria-label="severity filter"` + `aria-pressed`

### 表示制御

- `filteredChecksByLayer[layer].length > 0` の Layer のみ `VerifyLayerGroup` をレンダリング
- `VerifyLayerGroup` の `checks` props に `filteredChecksByLayer[layer]` を渡す
- フィルタ適用中（`severityFilter !== 'all'`）のとき「X / Y 件表示中」テキストを表示

## 3. データフロー

```
verifyDetail.checks
  → checksByLayer (既存 useMemo)
  → filteredChecksByLayer (新規 useMemo: severity filter 適用)
  → VERIFY_LAYER_ORDER.filter(layer => filteredChecksByLayer[layer].length > 0)
  → VerifyLayerGroup (filteredChecks)
```

## 4. ファイルパス一覧

| 種別 | ファイルパス                                                                        | 変更内容                           |
| ---- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | severity filter state・UI・useMemo |
| 修正 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | フィルタテストケース追加           |
