# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 2                                                  |
| Phase名    | 設計                                               |
| ステータス | not_started                                        |
| 前提Phase  | Phase 1                                            |
| 後続Phase  | Phase 3                                            |

## 目的

screenshot matrix、grep/audit guard、Phase 11/12 手順を設計する。

## 実行タスク

- タスク1: screenshot capture matrix 設計
- タスク2: hardcoded color audit 設計
- タスク3: current/baseline 分離運用設計

### タスク1: screenshot matrix

| ケース | 画面            | テーマ | 証跡                          |
| ------ | --------------- | ------ | ----------------------------- |
| LT-01  | Settings        | light  | shell + card + selector       |
| LT-02  | Dashboard       | light  | header + glass panel          |
| LT-03  | Auth            | light  | glass panel + primary actions |
| LT-04  | WorkspaceSearch | light  | panel + inputs + result rows  |

### タスク2: audit 設計

1. `rg` ベースの raw audit pattern を定義する
2. 対象ディレクトリと除外ディレクトリを定義する
3. `current` と `baseline` の分離ルールを決める

### タスク3: current/baseline 分離

- 今回差分で fail 判定する指標
- 既存 legacy 違反を baseline として記録する指標
- `unassigned-task` と `workflow evidence` の更新順序

## 参照資料

| 参照資料              | パス                                                                               | 説明                   |
| --------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物        | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/`         | 要件                   |
| Token task            | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md` | token 監査前提         |
| Shared migration task | `docs/30-workflows/light-theme-shared-color-migration/phase-2-design.md`           | representative targets |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                            |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | capture / checklist 運用        |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | current build / screenshot 教訓 |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature 側同期観点              |

## 並列化ポリシー

- Lane B と Lane C は Phase 2 で並列可
- ただし current/baseline 判定ルールは最後に統合レビューする

## 統合テスト連携

| 観点                      | 連携内容                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Screenshot to manual test | screenshot matrix を Phase 11 の representative screen 計画へ接続する               |
| Audit to CI/local         | hardcoded color audit を Phase 4-7 の test case に落とし込む                        |
| Task bridge               | token foundation / shared migration の成果物を guard 判定に必要な入力として固定する |

## 成果物

| 成果物            | パス                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| screenshot-matrix | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/screenshot-matrix.md` |
| audit-spec        | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/audit-spec.md`        |
| evidence-policy   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/evidence-policy.md`   |

## 完了条件

- [ ] screenshot matrix が定義されている
- [ ] audit pattern と対象ディレクトリが定義されている
- [ ] current/baseline 分離ルールが明文化されている
- [ ] future Codex lane への引き渡しが明確である

## 次Phase

Phase 3: 設計レビュー
