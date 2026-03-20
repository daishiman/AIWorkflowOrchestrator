# [#1268] [UT-IMP-SMALL-SCALE-WORKFLOW-OPTIMIZATION-001] 小規模修正向け軽量ワークフローバリアント定義

## メタ情報

```yaml
issue_number: 1268
title: [UT-IMP-SMALL-SCALE-WORKFLOW-OPTIMIZATION-001] 小規模修正向け軽量ワークフローバリアント定義
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1268
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

**タスクID**: UT-IMP-SMALL-SCALE-WORKFLOW-OPTIMIZATION-001
**分類**: 改善
**対象機能**: タスク仕様書作成ワークフロー
**優先度**: 低
**規模**: 小規模
**発見元**: Phase 12（スキルフィードバックレポート）
**発見日**: 2026-03-16

## 目的

TASK-FIX-ELECTRON-APP-MENU-ZOOM-001（83行の新規ファイル + 2行の既存ファイル変更）に13フェーズの完全ワークフローを適用したところ、Phase 6（テスト拡充）と Phase 8（リファクタリング）が実質不要だった。小規模修正（200行以下の変更）向けの軽量ワークフローバリアント（7フェーズ構成）を定義し、task-specification-creator スキルに組み込む。

## 問題点

- 200行以下の小規模修正に13フェーズを適用すると、Phase 6（テスト拡充）や Phase 8（リファクタリング）が形式的にスキップされるケースが多い
- 13フェーズのワークフロー仕様書を全て生成・管理するコストが修正の規模に見合わない
- フルワークフローを省略するか適用するかの判断基準が属人化している

## 最終ゴール

- 修正規模に応じてフルワークフロー（13フェーズ）と軽量ワークフロー（7フェーズ）を選択できる明確な判断基準が確立されている
- 軽量ワークフローのフェーズテンプレートが `.claude/skills/task-specification-creator/` に配置されている
- task-specification-creator の SKILL.md に軽量ワークフローの使用条件と選択ロジックが記載されている

## 提案する軽量ワークフロー（7フェーズ）

| Phase | 名称         | フルワークフロー対応 |
| ----- | ------------ | -------------------- |
| L1    | 要件・設計   | Phase 1-3 統合       |
| L2    | テスト作成   | Phase 4              |
| L3    | 実装         | Phase 5              |
| L4    | 品質検証     | Phase 7+9 統合       |
| L5    | 最終レビュー | Phase 10             |
| L6    | 手動テスト   | Phase 11             |
| L7    | ドキュメント | Phase 12             |

## 受入基準

- [ ] 軽量ワークフロー（7フェーズ: L1-L7）が定義されている
- [ ] 各フェーズに目的・実行タスク・成果物・完了条件が記載されている
- [ ] フル/軽量の判断基準が4条件以上で定義されている
- [ ] 判断基準の閾値が過去タスクで検証されている
- [ ] 統合フェーズ（L1, L4）が元フェーズの完了条件を全て含んでいる
- [ ] `phase-templates-light.md` が task-specification-creator/references/ に配置されている
- [ ] `workflow-selection-guide.md` が task-specification-creator/references/ に配置されている
- [ ] SKILL.md の変更履歴が更新されている

## 成果物パス

- `.claude/skills/task-specification-creator/references/phase-templates-light.md`
- `.claude/skills/task-specification-creator/references/workflow-selection-guide.md`
- `.claude/skills/task-specification-creator/SKILL.md`

## 仕様書パス

`docs/30-workflows/completed-tasks/TASK-FIX-ELECTRON-APP-MENU-ZOOM-001/unassigned-task/task-imp-small-scale-workflow-optimization-001.md`
