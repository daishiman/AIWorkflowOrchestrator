# TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001

## メタ情報

| 項目                   | 値                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| タスクID               | TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001                                                                                          |
| 責務                   | create ステップの制約条件入力UI実装（ConstraintChip / ConstraintChipList コンポーネント新規作成と SkillLifecyclePanel への統合） |
| ステータス             | 未着手                                                                                                                           |
| 優先度                 | medium                                                                                                                           |
| 作成日                 | 2026-03-17                                                                                                                       |
| 依存タスク             | TASK-10A-D（完了済み）                                                                                                           |
| 既存依存コンポーネント | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`（UIパターン参照元）                                            |

## 目的

`ui-ux-realization.md` L34–38 に定義された create ステップの必須UI要件「constraint chips」を実装する。
現在の `SkillLifecyclePanel.tsx` には chip/constraint UI 要素が存在しない（C-04 GAP）。
本タスクでは Atomic Design に従い atom（ConstraintChip）→ molecule（ConstraintChipList）の順で新規コンポーネントを作成し、`SkillLifecyclePanel` の create ステップ内の goal input 下部に統合する。

## 背景・根拠

| 根拠資料                  | 行     | 記載内容                                                                            |
| ------------------------- | ------ | ----------------------------------------------------------------------------------- |
| `ui-ux-realization.md`    | L34–38 | create ステップの必須UI: `goal input`、`constraint chips`、`generate CTA`           |
| `ui-ux-diagrams.md`       | L61    | Core Journey 必要マイコンポーネント: `ConstraintChips`                              |
| `ui-ux-diagrams.md`       | L139   | Skill Lifecycle Panel 必要マイコンポーネント: `ConstraintChipList`                  |
| `SkillLifecyclePanel.tsx` | 全体   | `chip` / `constraint` UI 要素が存在しない（C-04 GAP）                               |
| `FilterChip/index.tsx`    | L5–11  | 類似 chip UI パターン（`label`, `isSelected`, `onClick`, `disabled` の Props 設計） |
| `SkillChip.tsx`           | L5–12  | 類似 chip UI パターン（`onSelect`, `isDisabled`, aria 属性の設計）                  |

## 前提条件

- `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx` が存在し、型定義とスタイルが参照可能であること
- `SkillLifecyclePanel.tsx` の create フロー（`request` state、`handlePrepare` 関数）が変更なく動作していること
- `@repo/shared` の型定義に `SkillConstraint` を追加するか、`SkillLifecyclePanel.tsx` のローカル型として定義するかを Phase 2 設計で決定すること

## Phase 一覧

| Phase | 名称             | 仕様書パス                 | ステータス |
| ----- | ---------------- | -------------------------- | ---------- |
| 1     | 要件定義         | `phase-1-requirements.md`  | 未着手     |
| 2     | 設計             | `phase-2-design.md`        | 未着手     |
| 3     | 設計レビュー     | `phase-3-design-review.md` | 未着手     |
| 4     | テスト作成       | （Phase 3 PASS 後に作成）  | 未着手     |
| 5     | 実装             | （Phase 3 PASS 後に作成）  | 未着手     |
| 6     | テスト拡充       | （Phase 5 完了後に作成）   | 未着手     |
| 7     | カバレッジ確認   | （Phase 6 完了後に作成）   | 未着手     |
| 8     | リファクタリング | （Phase 7 完了後に作成）   | 未着手     |
| 9     | 品質検証         | （Phase 8 完了後に作成）   | 未着手     |
| 10    | 最終レビュー     | （Phase 9 完了後に作成）   | 未着手     |
| 11    | 手動テスト       | （Phase 10 PASS 後に作成） | 未着手     |
| 12    | ドキュメント     | （Phase 11 完了後に作成）  | 未着手     |
| 13    | 完了             | （Phase 12 完了後に作成）  | 未着手     |

## 成果物パス

```
docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-10-constraint-chips-create-ui/
  index.md                    # 本ファイル
  phase-1-requirements.md
  phase-2-design.md
  phase-3-design-review.md
  artifacts.json
  outputs/
    phase-1/requirements-analysis.md   # Phase 1 実行後に生成
    phase-2/design-document.md         # Phase 2 実行後に生成
    phase-3/design-review-report.md    # Phase 3 実行後に生成
```

## 参照資料

| 資料                 | パス                                                                     | 備考                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX 正本           | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`     |                                                                                                                                                                             |
| UI/UX 図解           | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`        |                                                                                                                                                                             |
| FilterChip atom      | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`        |                                                                                                                                                                             |
| SkillChip organism   | `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx` |                                                                                                                                                                             |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`     | feature ディレクトリ配置（Atomic Design の organisms/ 外）。新規コンポーネント ConstraintChip / ConstraintChipList は Atomic Design 準拠で atoms/ / molecules/ に配置する。 |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                       |                                                                                                                                                                             |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                       |                                                                                                                                                                             |
