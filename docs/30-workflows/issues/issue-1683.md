# [#1683] [UT] Skill Creator approval request surface 接続

## メタ情報

```yaml
issue_number: 1683
title: [UT] Skill Creator approval request surface 接続
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-27
updated_date: 2026-03-27
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1683
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 目的

Skill Creator の preload / renderer に `approval:request` surface を追加し、disclosure と同水準で approval flow を public surface に接続する。

## 対象ファイル

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- approval request 関連の test files

## 完了条件

- Skill Creator が approval request を購読できる
- approval / disclosure の UI surface が対称な責務で確認できる
- renderer テストで approval request 経路が固定される

## 発生元

TASK-SDK-07 Phase 12 再監査
