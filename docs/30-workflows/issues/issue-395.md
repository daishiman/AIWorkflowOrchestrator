# [#395] [UT-006] React Context DI実装

## メタ情報

```yaml
issue_number: 395
title: [UT-006] React Context DI実装
state: CLOSED
priority: 高
scale: -
category: リファクタリング
status: -
created_date: 2026-01-21
updated_date: 2026-01-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/395
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 高   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

ReactのContext APIを使用して、Clean ArchitectureのUse CasesとRepositoriesをコンポーネントツリー全体に注入可能にする。

## タスク情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-006                                                                      |
| 優先度       | 高                                                                          |
| 見積もり規模 | 中規模                                                                      |
| 依存タスク   | ARCH-001 (完了), UT-005                                                     |
| 仕様書       | `docs/30-workflows/unassigned-task/task-react-context-di-implementation.md` |

## 成果物

- `ChatHistoryContext.tsx`
- `ChatHistoryProvider.tsx`
- `useChatHistory.ts`
- `MockChatHistoryProvider.tsx`
- 対応するユニットテスト

## 完了条件

- [ ] `ChatHistoryContext`が定義されている
- [ ] `ChatHistoryProvider`が実装されている
- [ ] `useChatHistory`が実装されている
- [ ] 5種類のUse Casesにアクセス可能
- [ ] `MockChatHistoryProvider`が実装されている
- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

## 関連

- 依存タスク: UT-005 Drizzle Repository実装
- 関連タスク: ARCH-001 Clean Architecture Refactoring

---

📋 Generated from task specification
