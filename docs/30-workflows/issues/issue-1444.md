# [#1444] [UT-FIX-LLM-PERSIST-ENCRYPT-001] persist storage暗号化の検討

## メタ情報

```yaml
issue_number: 1444
title: [UT-FIX-LLM-PERSIST-ENCRYPT-001] persist storage暗号化の検討
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-21
updated_date: 2026-03-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1444
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

現在のpersist storageはlocalStorageに平文で保存されている。将来的にpersist対象フィールドが増えた場合のセキュリティ強化として暗号化の検討が必要。

## 背景

TASK-FIX-LLM-CONFIG-PERSISTENCE で `selectedProviderId` / `selectedModelId` をpersist対象に追加した。これらは機密情報ではないが、persist対象フィールドの増加に伴い、暗号化の必要性を評価すべき。

## 受入基準

- [ ] persist storageの暗号化要否を評価する
- [ ] 暗号化が必要な場合、electron-storeの暗号化オプションまたはカスタム暗号化の設計を行う

## 関連

- TASK-FIX-LLM-CONFIG-PERSISTENCE
- arch-state-management.md

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-FIX-LLM-PERSIST-ENCRYPT-001.md`
