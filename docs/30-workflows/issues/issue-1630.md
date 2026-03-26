# [#1630] "[UT-SLIDE-UI-HIG-LEGACY-001] UT"

## メタ情報

```yaml
task_id: UT-SLIDE-UI-HIG-LEGACY-001
task_name: UT
category: -
target_feature: -
priority: 低
scale: -
status: 未着手
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-slide-ui-hig-legacy-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未着手 |

---

## 指摘内容

スコープ外の既存ファイル（`SyncStatusIndicator.tsx`, `SkillPhasePanel.tsx`）に Tailwind gray / green クラスが残存しており、今回追加した Slide UI コンポーネントの Apple HIG 風トーンと一致しない。

## 対応方針

1. `SyncStatusIndicator.tsx` の `bg-green-500` 等を Apple HIG 色に変更
2. `SkillPhasePanel.tsx` の Tailwind gray を Apple HIG 中性灰に変更
3. `SlideWorkspace.tsx` の新規コンポーネントと視覚的に統一

## 関連タスク

- UT-SLIDE-UI-001（起源）
