# Phase 2: 基本設計 — severity フィルタ追加

## コンポーネント設計

### 変更対象

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 新規型定義

```typescript
type SeverityFilterLevel = "all" | "warning+" | "error";
```

### State 追加

```typescript
const [severityFilter, setSeverityFilter] =
  useState<SeverityFilterLevel>("all");
```

### データフロー

```
verifyDetail.checks
  → checksByLayer (layer grouping)  // 既存
  → filteredChecksByLayer (severity filter)  // 新規
  → VerifyLayerGroup (UI 表示)
```

### フィルタロジック

- `all`: そのまま通す
- `warning+`: `check.severity !== "info"` でフィルタ
- `error`: `check.severity === "error"` でフィルタ
- 空になった layer はレンダリングからスキップ（既存の `.filter(layer => checks.length > 0)` で対応済み）

### UI 配置

- verify detail ヘッダーの「再検証を要求する」ボタンの左側、
  既存の Status/Phase/Evidence/Route グリッドの上にセグメントボタンを配置
- 各ボタンに `(件数)` を添える

### reverify 時の挙動

- `severityFilter` state は reverify でリセットしない
- `expandedLayers` と同様に `activeWorkflowId` 変更時のみリセット
