# Phase 2 成果物: DisplayableStatus 影響分析

## 影響範囲

### DisplayableStatus 型

```typescript
type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;
```

3値追加後、DisplayableStatus は自動的に以下の8値に拡張される:

- running, permission_pending, completed, cancelled, error（既存5値）
- **review, improve_ready, reuse_ready**（新規3値）

### 影響ファイル

| ファイル                                     | 行  | 現在の記載                                     | 影響                                                                                                            |
| -------------------------------------------- | --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ui-ux-feature-components-advanced.md         | 151 | `Exclude<SkillExecutionStatus, 'idle'>` の定義 | 定義自体は変更不要（自動拡張）。ただしStatusBadge のマッピングテーブルに新値の色/ラベル定義が必要かの確認が必要 |
| architecture-implementation-patterns-core.md | 106 | パターン例として記載                           | パターン例のため更新不要                                                                                        |

### exhaustive check への影響

switch文で `SkillExecutionStatus` を網羅チェック（never型）しているコードは、新3値に対応する case が必要。ただし本タスクは仕様書同期であり、コード変更は Task12 のスコープ。

仕様書観点では:

- StatusBadge の色/ラベルマッピング仕様に新値の追加が**未タスク候補**

## 判定

| 項目                         | 判定         | 理由                                                   |
| ---------------------------- | ------------ | ------------------------------------------------------ |
| DisplayableStatus 定義の更新 | 不要         | Exclude パターンにより自動拡張                         |
| StatusBadge マッピング仕様   | 未タスク候補 | 新3値の色/ラベル定義が必要（Phase 12 Task 4 で記録）   |
| exhaustive check 仕様        | 情報記載     | interfaces 仕様書の9値テーブルで網羅的に記載済みとなる |
