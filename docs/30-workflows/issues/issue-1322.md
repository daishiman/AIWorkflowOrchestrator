# [#1322] [UT-CHATPANEL-COV-001] ChatPanel handleNavigateToSettings テスト追加

## メタ情報

```yaml
issue_number: 1322
title: [UT-CHATPANEL-COV-001] ChatPanel handleNavigateToSettings テスト追加
state: CLOSED
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1322
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

ChatPanel.tsx の `handleNavigateToSettings`（L129-132）がテストでカバーされておらず、Function Coverage が 50% で品質基準 80% を下回っている。このハンドラのテストケースを追加し、Function Coverage を基準以上にする。

## 背景

- 親タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001（ChatPanel の実 AI チャット配線）
- 検出元: Phase 7 カバレッジチェック
- blocked 状態での Settings 誘導 CTA のテスト設計が必要。`handleNavigateToSettings` は `setActiveView('settings')` を呼ぶだけだが、chatPanelStatus が `blocked` の時のみ ErrorGuidance が表示されるため、テスト前提条件の設定が重要

## 対象ファイル

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（L129-132）
- `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.settings-sync.test.tsx`（追加先候補）

## 完了条件

- [ ] handleNavigateToSettings を直接テストするテストケースが存在する
- [ ] ChatPanel.tsx の Function Coverage が 80% 以上
- [ ] 既存テスト 139 件が全て PASS

## 実装方針

1. ErrorGuidance の Settings 遷移 CTA クリック時に `handleNavigateToSettings` が呼ばれるシナリオをテスト
2. `setActiveView('settings')` が呼ばれることを検証

## 仕様書

`docs/30-workflows/completed-tasks/task-chatpanel-function-coverage-handlenavigatetosettings.md`
