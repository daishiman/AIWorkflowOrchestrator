# [#1400] [UT-FIX-SKILLIMPORT-ARIA-LABEL-001] SkillImportDialog インポートボタン aria-label 未設定修正

## メタ情報

```yaml
issue_number: 1400
title: [UT-FIX-SKILLIMPORT-ARIA-LABEL-001] SkillImportDialog インポートボタン aria-label 未設定修正
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1400
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

SkillImportDialog の「インポート」ボタンに `aria-label` が未設定。WCAG 2.1 AA 準拠のアクセシビリティを確保するため修正が必要。

## 背景

Phase 10/11 レビューにて検出。スクリーンリーダーが「インポート」ボタンの意味を正確に読み上げられない状態。

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

## 対応内容

「インポート」ボタンに `aria-label="スキルをインポートする"` を追加する。

## 完了条件

- [ ] 「インポート」ボタンに `aria-label` が設定されている
- [ ] `getByRole('button', { name: 'スキルをインポートする' })` でテストから特定できる
- [ ] 関連テスト PASS

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-skillimport-aria-label.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連ルール: `.claude/rules/01-architecture.md`（アクセシビリティ WCAG 2.1 AA 基準）
