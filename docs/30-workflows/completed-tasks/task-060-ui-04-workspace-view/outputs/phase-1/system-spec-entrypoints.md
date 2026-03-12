# Phase 1 System Spec Entrypoints

## 読み始める順番

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
2. `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
3. 必要な domain spec

## 抽出対象

| 関心ごと          | 正本                                                                        | 使う理由                                  |
| ----------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| parent entrypoint | `indexes/resource-map.md`, `indexes/quick-reference.md`                     | 読む順序の固定                            |
| workspace 機能    | `references/ui-ux-feature-components.md`                                    | 04A / 04B / 04C の feature 正本           |
| navigation        | `references/ui-ux-navigation.md`                                            | `workspace` ViewType と Quick Search 契約 |
| state             | `references/arch-state-management.md`                                       | ownership 境界                            |
| IPC/security      | `references/api-ipc-system.md`, `references/security-electron-ipc.md`       | 参照境界の確認                            |
| quality/a11y      | `references/quality-requirements.md`, `references/testing-accessibility.md` | Phase 4-11 の品質ゲート                   |
| completion ledger | `references/task-workflow.md`                                               | 完了台帳と成果物の正本                    |
| lessons           | `references/lessons-learned.md`                                             | path drift / evidence 継承の再発防止      |

## Phase 12 同期先

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`

## 結論

Phase 1 時点で、system spec を読む入口と Phase 12 で更新すべき出口の両方を固定した。
