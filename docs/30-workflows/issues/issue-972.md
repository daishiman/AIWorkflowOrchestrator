# [#972] "[UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001] Phase 12 スクリーンショット実行時ポート競合ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001
task_name: Phase 12 スクリーンショット実行時ポート競合ガード
category: 改善
target_feature: Phase 11/12 UI証跡再取得運用（apps/desktop scripts）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再検証
created_date: 2026-03-04
dependencies:
  - UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`screenshot:skill-import-idempotency-guard` 実行時に `Port 5174 is already in use` が混在し、再監査の成功判定が揺れる課題を是正する。

詳細仕様は以下を参照:

- `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md`
