# Phase 2: 設計 - SkillCreator Layer3/4 verify detail の severity フィルタ追加

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 2                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

Phase 1 で定義した要件に基づき、アーキテクチャ・詳細設計を確定する。

## 参照資料

| 資料名     | パス                      | 内容                    |
| ---------- | ------------------------- | ----------------------- |
| 要件定義   | `phase-1-requirements.md` | FR/NFR/AC 定義          |
| 仕様パック | `index.md`                | 全体概要・タスク分解    |
| 先行タスク | UT-SDK-L34-UI-DISPLAY-001 | Layer grouping 実装済み |

## データフロー設計

```
verifyDetail.checks（元データ）
  │
  ▼
checksByLayer（既存 useMemo: Layer別グルーピング）
  │
  ▼
filteredChecksByLayer（新規 useMemo: severity フィルタ適用）
  │
  ▼
VerifyLayerGroup（既存コンポーネント: Layer別表示）
```

- 既存の `checksByLayer` useMemo はそのまま維持する
- フィルタリングは `checksByLayer` の出力に対して `filteredChecksByLayer` で適用する
- `VerifyLayerGroup` への入力データを `checksByLayer` から `filteredChecksByLayer` に差し替える

## 型設計

### SeverityFilterLevel 型

```typescript
type SeverityFilterLevel = "all" | "warning+" | "error";
```

### SEVERITY_FILTER_OPTIONS 定数

```typescript
const SEVERITY_FILTER_OPTIONS: Array<{
  value: SeverityFilterLevel;
  label: string;
}> = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "警告以上" },
  { value: "error", label: "エラーのみ" },
];
```

### severityFilterButtonStyles

```typescript
// アクティブ/非アクティブのスタイル切り替え用
// Tailwind CSS クラスで実装
```

## 関数設計

### filterChecksBySeverity

```typescript
function filterChecksBySeverity(
  checks: VerifyCheck[],
  filter: SeverityFilterLevel,
): VerifyCheck[] {
  if (filter === "all") return checks;
  if (filter === "warning+") return checks.filter((c) => c.severity !== "info");
  // filter === 'error'
  return checks.filter((c) => c.severity === "error");
}
```

**設計判断**:

| 判断事項                     | 決定                       | 根拠                                     |
| ---------------------------- | -------------------------- | ---------------------------------------- |
| 関数をコンポーネント外に配置 | pure function として定義   | テスタビリティ向上、useMemo の依存最小化 |
| `all` の早期リターン         | `checks` をそのまま返す    | 新規配列生成を避けパフォーマンス確保     |
| フィルタ条件の方向           | 除外ベース（exclude info） | `warning+` は info を除外するのが直感的  |

## State 設計

### severityFilter useState

```typescript
const [severityFilter, setSeverityFilter] =
  useState<SeverityFilterLevel>("all");
```

### filteredChecksByLayer useMemo

```typescript
const filteredChecksByLayer = useMemo(() => {
  const result: Record<string, VerifyCheck[]> = {};
  for (const [layer, checks] of Object.entries(checksByLayer)) {
    const filtered = filterChecksBySeverity(checks, severityFilter);
    if (filtered.length > 0) {
      result[layer] = filtered;
    }
  }
  return result;
}, [checksByLayer, severityFilter]);
```

- 依存: `checksByLayer`（既存）、`severityFilter`（新規）
- フィルタ後に check が 0 件の Layer はエントリごと除外する（FR-04）

### severityTotalCounts useMemo

```typescript
const severityTotalCounts = useMemo(() => {
  const allChecks = Object.values(checksByLayer).flat();
  return {
    all: allChecks.length,
    "warning+": allChecks.filter((c) => c.severity !== "info").length,
    error: allChecks.filter((c) => c.severity === "error").length,
  };
}, [checksByLayer]);
```

- 依存: `checksByLayer`（フィルタ前のデータで計算）
- フィルタボタンのバッジ表示に使用する

## UI 設計

### フィルタバーの配置

```
[verify detail ヘッダー / メッセージ]
[フィルタバー: すべて(N) | 警告以上(N) | エラーのみ(N)]  ← 新規追加
[Layer 3 グループ (accordion)]
[Layer 4 グループ (accordion)]
```

- verify detail のメッセージと Layer グループの間に配置する

### フィルタバー HTML 構造

```tsx
<div role="radiogroup" aria-label="重要度フィルタ">
  {SEVERITY_FILTER_OPTIONS.map((option) => (
    <button
      key={option.value}
      role="radio"
      aria-checked={severityFilter === option.value}
      onClick={() => setSeverityFilter(option.value)}
      className={/* active/inactive styles */}
    >
      {option.label} ({severityTotalCounts[option.value]})
    </button>
  ))}
</div>
```

### スタイリング

- セグメントボタン形式（横並び、角丸グループ）
- アクティブボタン: 背景色付き、太字
- 非アクティブボタン: 背景透明、通常ウェイト
- Tailwind CSS で実装

## State ライフサイクル設計

### activeWorkflowId 変更時のリセット

```typescript
useEffect(() => {
  setSeverityFilter("all");
}, [activeWorkflowId]);
```

- ワークフロー切り替え時にフィルタをデフォルトに戻す
- 既存の `expandedLayers` リセットと同様のパターン

### reverify 時の維持

- reverify 実行時は `activeWorkflowId` が変わらないため、`severityFilter` は自動的に維持される
- 特別な処理は不要（既存の仕組みで自然に実現される）

## タスク実行順序

```
T-01-1: 型定義・定数・フィルタ関数の追加
  │
  ▼
T-01-2: filter state と useMemo の追加
  │
  ├─▶ T-01-3: フィルタバー UI の追加
  └─▶ T-01-4: VerifyLayerGroup への filteredData 適用
  │
  ▼
T-01-5: reverify 時の state 維持（useEffect 追加）
  │
  ▼
T-01-6: コンポーネントテスト SF-01〜SF-09
```

## リスク分析

| リスク                                  | 影響度 | 対策                                                            |
| --------------------------------------- | ------ | --------------------------------------------------------------- |
| Layer grouping との干渉                 | 中     | `filteredChecksByLayer` を `checksByLayer` の下流に配置し分離   |
| expandedLayers と filteredData の不整合 | 低     | フィルタで非表示になった Layer の展開状態はそのまま保持する     |
| フィルタ後に全 check が消える場合       | 低     | 空状態メッセージの表示は将来対応（現時点では Layer 非表示のみ） |
| useMemo 依存配列の漏れ                  | 中     | ESLint exhaustive-deps ルールで検出                             |

## 成果物

| 成果物     | パス                              | 説明               |
| ---------- | --------------------------------- | ------------------ |
| 設計書     | `phase-2-design.md`（本ファイル） | アーキテクチャ設計 |
| 出力コピー | `outputs/phase-2/design.md`       | 設計書の出力       |

## 完了条件

- [ ] データフロー設計が既存の checksByLayer と整合している
- [ ] 型・関数・State の設計詳細が記載されている
- [ ] UI 配置とアクセシビリティ設計が定義されている
- [ ] State ライフサイクル（リセット/維持）が設計されている
- [ ] リスク分析と対策が記載されている

## 次のPhase

Phase 3: 設計レビュー
