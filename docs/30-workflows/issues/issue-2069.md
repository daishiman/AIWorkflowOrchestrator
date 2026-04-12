# [#2069] feat(skill-wizard): UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応

## メタ情報

```yaml
issue_number: 2069
title: feat(skill-wizard): UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応
state: OPEN
priority:  low
scale: -
category: -
status: -
created_date: 2026-04-09
updated_date: 2026-04-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2069
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | low  |
| 規模       | -    |
| ステータス | -    |

---

## タスク概要

Q5「どの外部ツールを統合しますか？」で複数ツールが選択可能になったにもかかわらず、現在の `resolveExternalIntegration` は先頭値のみを参照する制約がある。本タスクでは複数ツールを並列で処理できるよう関数シグネチャとロジックを刷新する。

## 背景・なぜ必要か

- `skill-wizard-multi-select-options` タスクにより Q5 の回答型が `selectedOptions: string[]` に変更されたが、`resolveExternalIntegration` は `selectedOptions[0]` のみを参照している（M-01 TODO コメントで記録済み）
- 「GitHub + Slack」「GitHub + Notion」などの複数ツール並列統合が実現できない
- Q5 で複数ツールを選択しても最初の選択しか反映されず、UX と機能の乖離が生じている
- スキル生成プロンプトに複数ツールの情報が渡らず、生成品質が低下する可能性がある

## 受入条件

- AC-1: `resolveExternalIntegration` が `string[]` を受け取り、複数ツールを並列で処理できる
- AC-2: 各ツールの統合情報（API エンドポイント・認証方式・主要操作）がそれぞれ取得・マージされる
- AC-3: 単一ツール選択時は従来と同一の動作を維持する（後方互換性）
- AC-4: 空配列 `[]` や未対応ツールに対して安全にフォールバックする
- AC-5: `SkillCreateWizard.tsx` の `resolveExternalIntegration` 呼び出し箇所が複数ツールを渡すよう更新
- AC-6: `resolveExternalIntegration` のテストカバレッジが 90% 以上
- AC-7: M-01 TODO コメントが削除される（本タスク完了のマーカー）

## 発見元

skill-wizard-multi-select-options Phase 12 未タスク検出（2026-04-09）

## 参照仕様書

`docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001.md`
