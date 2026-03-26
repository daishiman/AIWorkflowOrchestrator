# [#1399] [UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003] SkillAnalysisView アクションボタン aria-label 未設定修正

## メタ情報

```yaml
issue_number: 1399
title: [UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003] SkillAnalysisView アクションボタン aria-label 未設定修正
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1399
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

SkillAnalysisView の3つのアクションボタン（「選択を適用」「全自動改善」「再試行」）に `aria-label` が未設定。WCAG 2.1 AA 準拠のアクセシビリティを確保するため修正が必要。

## 背景

Phase 10/11 レビューにて検出。スクリーンリーダーがボタンの意味を正確に読み上げられない状態。

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

## 対応内容

| ボタン表示テキスト | 推奨 aria-label          |
| ------------------ | ------------------------ |
| 選択を適用         | `選択したスキルを適用`   |
| 全自動改善         | `全スキルを自動改善する` |
| 再試行             | `分析を再試行する`       |

## 完了条件

- [ ] 3つのボタン全てに `aria-label` が設定されている
- [ ] `getByRole('button', { name: '...' })` でテストから特定できる
- [ ] 関連テスト PASS

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-skillanalysis-aria-labels.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連ルール: `.claude/rules/01-architecture.md`（アクセシビリティ WCAG 2.1 AA 基準）
