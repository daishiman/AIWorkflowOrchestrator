# UIコンポーネントパターン（Desktop Renderer）

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [arch-ui-components-core.md](arch-ui-components-core.md) | core specification | Monaco Diff Editor統合パターン |
| [arch-ui-components-details.md](arch-ui-components-details.md) | detail specification | SkillSelector コンポーネントパターン / ChatPanel統合パターン（TASK-7D） / SkillCenterView アーキテクチャパターン（TASK-UI-05） / Skill Advanced Views アーキテクチャパターン（TASK-UI-05B / completed） |
| [arch-ui-components-advanced.md](arch-ui-components-advanced.md) | advanced specification | SkillManagementPanel アーキテクチャパターン（TASK-10A-A / completed） / SkillManagementPanel ビュー統合アーキテクチャパターン（TASK-10A-D / completed） / SkillManagementPanel Import List アーキテクチャパターン（TASK-043B / completed） / TASK-UI-00-ORGANISMS アーキテクチャ記録 |
| [arch-ui-components-history.md](arch-ui-components-history.md) | history bundle | 変更履歴 / 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
