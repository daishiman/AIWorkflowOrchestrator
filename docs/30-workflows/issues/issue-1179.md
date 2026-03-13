# [#1179] [UT-TASK-10A-B-010] SkillAnalysisView 全自動改善確認ダイアログ UI 実装

## メタ情報

```yaml
task_id: UT-TASK-10A-B-010
task_name: SkillAnalysisView 全自動改善確認ダイアログ UI 実装
category: 改善
target_feature: SkillAnalysisView
priority: 低
scale: 小規模
status: 未実施
source_phase: stale issue #686 の再分解（2026-03-12）
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-b-auto-improve-confirm-dialog.md
```

## 1. Why

現行実装では SkillAnalysisView / SuggestionList / store action は存在するが、全自動改善の確認が `window.confirm` に留まっている。旧 issue #686 は「UI 全体が未実装」という前提で現状と大きくずれているため、残差分だけを再分解して管理する。

## 2. What

- 全自動改善前の確認ダイアログ UI を実装する
- `window.confirm` 依存を廃止する
- キャンセル / 実行の操作をテストで保証する

## 3. Scope

含むもの:

- SkillAnalysisView の確認ダイアログ導線
- 必要な local state / store 連携
- ユニットテスト更新

含まないもの:

- 分析結果表示 UI 全体の再設計
- 改善結果トースト通知
- 成功フィードバック強化

## 4. 完了条件

- `window.confirm` が削除されている
- 全自動改善前に UI ダイアログが表示される
- 確認で autoImprove が実行される
- キャンセルで autoImprove が実行されない
- 関連テストが PASS する
