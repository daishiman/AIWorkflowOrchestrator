# 機能別 UI コンポーネント

## 概要
この親仕様書は UI/UX surface の入口であり、機能別詳細と履歴は child companion へ分離した。
旧連番 suffix の reference child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [ui-ux-feature-components-core.md](ui-ux-feature-components-core.md) | core specification | 概要 / Community Visualization UI コンポーネント（CONV-08-05） / Custom Execution Environment UI コンポーネント（AGENT-006） / workspace-chat-edit-ui コンポーネント（Issue #468, #494） |
| [ui-ux-feature-components-details.md](ui-ux-feature-components-details.md) | detail specification | Workspace Layout Foundation（TASK-UI-04A-WORKSPACE-LAYOUT） / Workspace Chat Panel（TASK-UI-04B-WORKSPACE-CHAT） / Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW） / Light Theme Contrast Regression Guard（TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001） |
| [ui-ux-feature-components-advanced.md](ui-ux-feature-components-advanced.md) | advanced specification | コピー履歴機能（TASK-3-2-D） / アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA） / SkillStreamingView コンポーネント（TASK-7D） / SkillEditor UI（TASK-9A / 完了） |
| [ui-ux-feature-components-reference.md](ui-ux-feature-components-reference.md) | reference bundle | SkillCenterView UI（TASK-UI-05 / 完了） / Skill Advanced Views UI（TASK-UI-05B / completed） / SkillAnalysisView UI（TASK-10A-B / completed） / SkillCreateWizard UI（TASK-10A-C / completed） |
| [ui-ux-feature-components-reference-organisms-history-surfaces.md](ui-ux-feature-components-reference-organisms-history-surfaces.md) | reference bundle (organisms foundation / history-notification surfaces) | Organisms Foundation（TASK-UI-00-ORGANISMS / completed） / Foundation Reflection Audit（TASK-UI-00-FOUNDATION-REFLECTION-AUDIT / completed） / Notification / History Domain（TASK-UI-01-C / completed） / History Timeline Refresh（TASK-UI-06-HISTORY-SEARCH-VIEW / completed） |
| [ui-ux-feature-components-history.md](ui-ux-feature-components-history.md) | history bundle | 完了タスク / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
