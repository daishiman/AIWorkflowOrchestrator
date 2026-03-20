# [#1385] [UT-IMP-PHASE2-ICON-MAP-VERIFICATION-GUARD-001] Phase 2 設計テンプレートへの Icon map 確認ステップ追加

## メタ情報

```yaml
issue_number: 1385
title: [UT-IMP-PHASE2-ICON-MAP-VERIFICATION-GUARD-001] Phase 2 設計テンプレートへの Icon map 確認ステップ追加
state: OPEN
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-19
updated_date: 2026-03-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1385
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

task-specification-creator の Phase 2 テンプレートに、コンポーネント設計時の Icon name 存在確認チェック項目を追加する。

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 で `leftIcon="edit-2"` / `"bar-chart-2"` を設計書に記載したが、Icon map に未登録だったため Phase 5 で手戻りが発生。設計テンプレートに確認ステップがないことが根本原因。

## 対象ファイル

- `.claude/skills/task-specification-creator/references/phase-templates.md`

## 受入基準

- [ ] Phase 2 テンプレートに Icon map 確認のチェック項目が含まれている
- [ ] 確認コマンド例（grep）がテンプレートに記載されている
- [ ] 未登録アイコンを使う場合の対応方針がテンプレートに記載されている

## 仕様書

`docs/30-workflows/unassigned-task/task-imp-phase2-icon-map-verification-guard-001.md`
