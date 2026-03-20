# [#1324] [UT-CHATPANEL-COV-003] useStreamingChat 専用テストファイル作成

## メタ情報

```yaml
issue_number: 1324
title: [UT-CHATPANEL-COV-003] useStreamingChat 専用テストファイル作成
state: CLOSED
priority: 高
scale: 中規模
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1324
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

useStreamingChat.ts は ChatPanel のリアルチャット機能の IPC 統合フックであり、Coverage が 0% で専用テストファイルが未作成。IPC 統合の正常系・異常系をカバーする専用テストファイルを作成する。

## 背景

- 親タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001（ChatPanel の実 AI チャット配線）
- 検出元: Phase 7 カバレッジチェック
- IPC 統合フックのテスト不在は、Preload/Main 間の契約変更時にリグレッションを検出できないリスクが高い
- P44（IPC インターフェース不整合）/ P60（IPC レスポンス wrapper 形式）パターンの再発リスクあり

## 対象ファイル

- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingChat.test.ts`（新規作成）

## 完了条件

- [ ] useStreamingChat.test.ts が作成されている
- [ ] startStream 正常系テストが存在する
- [ ] API 未存在時のフォールバックテストが存在する
- [ ] エラーレスポンスのハンドリングテストが存在する
- [ ] useStreamingChat.ts の Lines Coverage が 80% 以上
- [ ] P39 準拠: happy-dom 環境では fireEvent を使用

## 実装方針

1. `renderHook` で useStreamingChat をテスト
2. `window.electronAPI` のモック化（P48 準拠: `Array.isArray` で実行時検証）
3. IPC レスポンスの wrapper 形式（P60 準拠: `{ success, data?, error? }`）を正しくテスト
4. ストリーミングイベントリスナーの登録・解除テスト

## 注意事項

- IPC モック戦略が複雑。P44（IPC インターフェース不整合）と P60（IPC レスポンス wrapper 形式）の両方に準拠する必要がある
- `window.electronAPI` のモック化時に P48 準拠（Array.isArray で実行時型検証）を忘れないこと
- happy-dom 環境では P39 準拠で fireEvent のみ使用すること

## 仕様書

`docs/30-workflows/completed-tasks/task-usestreamingchat-test-creation.md`
