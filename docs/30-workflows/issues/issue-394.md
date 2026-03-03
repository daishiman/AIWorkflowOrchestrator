# [#394] [UT-005] Drizzle ORM Repository実装

## メタ情報

```yaml
issue_number: 394
title: [UT-005] Drizzle ORM Repository実装
state: CLOSED
priority: 高
scale: -
category: リファクタリング
status: -
created_date: 2026-01-21
updated_date: 2026-01-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/394
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 高   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

Clean Architectureで定義されたリポジトリインターフェース（`IChatSessionRepository`, `IChatMessageRepository`）を、Drizzle ORMを使用して実装する。

## タスク情報

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-005                                                                        |
| 優先度       | 高                                                                            |
| 見積もり規模 | 中規模                                                                        |
| 依存タスク   | ARCH-001 (完了)                                                               |
| 仕様書       | `docs/30-workflows/unassigned-task/task-drizzle-repository-implementation.md` |

## 成果物

- `DrizzleChatSessionRepository.ts`
- `DrizzleChatMessageRepository.ts`
- 対応するユニットテスト

## 完了条件

- [ ] `DrizzleChatSessionRepository`の全メソッドが実装されている
- [ ] `DrizzleChatMessageRepository`の全メソッドが実装されている
- [ ] FTS5全文検索が動作する
- [ ] CRUD操作が正常に動作する
- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

## 関連

- 関連タスク: ARCH-001 Clean Architecture Refactoring
- 次タスク: UT-006 React Context DI実装

---

📋 Generated from task specification
