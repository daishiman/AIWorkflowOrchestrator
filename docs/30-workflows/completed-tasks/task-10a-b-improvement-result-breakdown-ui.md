# UT-TASK-10A-B-003 改善結果内訳表示実装 - タスク指示書

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| タスクID     | UT-TASK-10A-B-003            |
| タスク名     | 改善結果内訳表示実装         |
| 分類         | 改善                         |
| 対象機能     | SkillAnalysisView            |
| 優先度       | 中                           |
| 見積もり規模 | 中規模                       |
| ステータス   | 完了（2026-03-05）           |
| 発見元       | TASK-10A-B Phase 10 MINOR M3 |
| 発見日       | 2026-03-02                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

改善処理は `ImprovementResult.errors` を返すが、UIで個別の成功/失敗が表示されない。

### 1.2 問題点・課題

部分失敗時にどの提案が失敗したかユーザーが把握できない。

### 1.3 放置した場合の影響

再試行対象の特定が困難になり、運用コストが増える。

## 2. 何を達成するか（What）

### 2.1 目的

改善結果の成功・失敗内訳を明示表示する。

### 2.2 最終ゴール

失敗提案・成功提案・スキップ提案がUI上で識別できる。

### 2.3 スコープ

#### 含むもの

結果パネル表示、失敗理由表示、再分析前の短時間表示。

#### 含まないもの

改善実行アルゴリズムの変更。

### 2.4 成果物

- 結果内訳UI（一覧またはアコーディオン）
- 失敗理由表示
- 対応テスト

## 3. どのように実行するか（How）

### 3.1 前提条件

`ImprovementResult` の `applied/skipped/errors` が取得可能であること。

### 3.2 依存タスク

UT-TASK-10A-B-002（通知導線）と並行可能。

### 3.3 必要な知識

条件レンダリング、アクセシブルなリストUI。

### 3.4 推奨アプローチ

結果表示を独立moleculeとして切り出し、SkillAnalysisViewで条件表示する。

## 4. 実行手順

### Phase構成

表示設計 → 実装 → テスト。

### Phase 1: 実装

#### 目的

部分失敗時の可観測性を向上する。

#### 手順

1. 結果表示コンポーネントを追加する。
2. `errors` と `applied` を種別表示する。
3. 再分析実行との表示タイミングを調整する。

#### 成果物

UI表示とテスト。

#### 完了条件

失敗提案名と理由が画面で確認できる。

## 5. 完了条件チェックリスト

### 機能要件

- [x] 成功/失敗/スキップが区別表示される

### 品質要件

- [x] 失敗ケースのテストが追加される

### ドキュメント要件

- [x] 関連仕様書の表示仕様を更新する

## 6. 検証方法

### テストケース

- `errors` 1件以上
- `applied` のみ
- `skipped` のみ

### 検証手順

1. `pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策               |
| -------------------- | ------ | -------- | ------------------ |
| 結果表示が過密になる | 中     | 中       | 折りたたみUIを採用 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/error-handling.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
FR-5-2: 失敗/成功提案の区別表示が不足
```

### 補足事項

再分析との競合があるため、表示継続時間を設計時に確定する。

## 10. 完了実績

- `ImprovementResultBreakdown` を実装し、成功/スキップ/失敗の3区分表示を追加
- `useSkillAnalysis` と `SkillAnalysisView` を更新し、適用直後の結果内訳表示を統合
- `SkillAnalysisView.test.tsx` を拡張し、mixed/success/skipped/error の表示ケースを検証
- Phase 11 で 5枚のスクリーンショットを再取得し、Apple UI/UX 観点で視覚検証を実施
