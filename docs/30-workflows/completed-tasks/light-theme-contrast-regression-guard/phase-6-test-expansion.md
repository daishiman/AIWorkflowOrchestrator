# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 6                                                    |
| Phase名    | テスト拡充                                           |
| ステータス | completed                                            |
| 前提Phase  | Phase 5                                              |
| 後続Phase  | Phase 7                                              |

## 目的

guard の運用パターンを増やし、false positive / false negative / future screen addition の抜けを減らす。

## 実行タスク

- タスク1: current / baseline 2 系統のテストを拡充する
- タスク2: representative screen 追加時の拡張性を確認する
- タスク3: screenshot / checklist / unassigned handoff の境界テストを追加する

## 参照資料

| 参照資料           | パス                                                                                                                | 説明           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 4 テスト仕様 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-4/test-specification.md`     | 拡張元         |
| Phase 5 実装まとめ | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md` | 実装差分の把握 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                      |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage / quality 基準                   |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 拡張テストの書き方                        |
| testing-fixtures           | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`           | 新画面追加時の harness ルール             |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | current build / selector drift の再発防止 |

## 実行手順

### ステップ1: false positive / false negative を増やす

1. hardcoded color の legitimate use と drift を分ける
2. current と baseline backlog の誤分類ケースを追加する
3. screenshot metadata 不足時の failure path を追加する

### ステップ2: 拡張性を確認する

1. fifth screen を追加したときの matrix 更新箇所を確認する
2. manual checklist と Phase 12 spec sync の影響範囲を確認する
3. outputs 追加時の artifacts 更新ルールを確認する

### ステップ3: handoff を補強する

1. discovered issues から unassigned-task-detection への handoff を追加する
2. screenshot coverage validator の warning / error 分岐を追加する
3. Phase 7 coverage gate の入力を確定する

## 統合テスト連携

| 観点                     | 連携内容                                                  |
| ------------------------ | --------------------------------------------------------- |
| Current / baseline split | fail と backlog 分離の両系統を testcase 化する            |
| Extensibility            | 新しい representative screen 追加時の追従コストを見積もる |
| Evidence reuse           | Phase 7 で集計する testcase ID を固定する                 |

## 多角的チェック観点

| 観点             | 適用内容                                                   | 仕様参照先                                                           |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| テスト戦略       | 拡張しても TC-ID / evidence ID が崩れないか                | `testing-component-patterns.md`                                      |
| アクセシビリティ | contrast / helper text のケースが維持されるか              | `testing-accessibility.md`                                           |
| 拡張性           | representative screen 追加時の更新箇所が局所化されているか | `testing-fixtures.md`                                                |
| 運用証跡         | backlog への handoff が自動テスト観点と整合するか          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` |

## 成果物

| 成果物             | パス                                                                                                            | 説明                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| expanded-test-plan | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/expanded-test-plan.md` | false positive / negative / extension case の追加 |

## 完了条件

- [x] false positive / false negative 観点が追加されている
- [x] representative screen 追加時の拡張性観点がある
- [x] screenshot / checklist / unassigned handoff テストがある
- [x] Phase 7 coverage gate の入力が揃う

## サブタスク管理

1. Phase 4 / 5 の成果物を確認する
2. false positive / negative ケースを追加する
3. representative screen 追加ケースを設計する
4. evidence handoff ケースを追加する
5. expanded-test-plan を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 6 登録を更新
- [x] Phase 7 coverage gate の入力が明記されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 6
```

## 次Phase

Phase 7: カバレッジ確認
