# [#1323] [UT-CHATPANEL-COV-002] chatSlice streaming系アクション直接テスト追加

## メタ情報

```yaml
issue_number: 1323
title: [UT-CHATPANEL-COV-002] chatSlice streaming系アクション直接テスト追加
state: CLOSED
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1323
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

chatSlice.ts の Lines Coverage が 60.49% で品質基準 80% を下回っている。streaming 系アクション（startStreaming, appendStreamChunk, endStreaming, cancelStreaming 等、L249-376）が直接テストでカバーされていない。これらのアクションに対する直接テストを追加し、Coverage を基準以上にする。

## 背景

- 親タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001（ChatPanel の実 AI チャット配線）
- 検出元: Phase 7 カバレッジチェック / Phase 10 最終レビュー MINOR-2
- streaming 系アクションは ChatPanel のリアルチャット機能の中核ロジックであり、テスト不足はリグレッションリスクが高い

## 対象ファイル

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（L249-376）
- `apps/desktop/src/renderer/store/slices/__tests__/chatSlice.test.ts`（追加先）

## 完了条件

- [ ] startStreaming アクションの直接テストが存在する
- [ ] appendStreamChunk アクションの直接テストが存在する
- [ ] endStreaming アクションの直接テストが存在する
- [ ] cancelStreaming アクションの直接テストが存在する
- [ ] chatSlice.ts の Lines Coverage が 80% 以上
- [ ] 既存テスト 46 件が全て PASS

## 実装方針

1. 各 streaming アクションの状態遷移を直接テスト
2. 正常系: idle -> streaming -> completed の遷移
3. 異常系: streaming 中のエラー、キャンセル
4. 境界値: 空チャンク、連続チャンク

## 注意事項

- TL-1（disabled/canSubmit 二重制御）を理解してからテスト設計すること
- P48（useShallow）準拠で派生セレクタを使用している場合、テストで状態更新の伝播を正しく検証する必要がある

## 仕様書

`docs/30-workflows/completed-tasks/task-chatslice-streaming-actions-test.md`
