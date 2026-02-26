# [#782] [UT-STORE-HOOKS-REFACTOR-002] 状態セレクタのJSDoc追加

## メタ情報

```yaml
issue_number: 782
title: [UT-STORE-HOOKS-REFACTOR-002] 状態セレクタのJSDoc追加
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-02-11
updated_date: 2026-02-11
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/782
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-STORE-HOOKS-REFACTOR-002                          |
| 分類         | 改善                                                 |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | Phase 10（UT-STORE-HOOKS-REFACTOR-001 最終レビュー） |
| 依存タスク   | なし（単独で実行可能）                               |

## 概要

全53個の個別セレクタにJSDocコメントを追加し、IDEでの補完体験と開発者の理解を向上させる。

## 背景

UT-STORE-HOOKS-REFACTOR-001で53個の個別セレクタ（`useAuthMode()`, `useSetAuthMode()`, `useSelectedLLMId()` 等）を追加した。これらのセレクタはP31（無限ループ問題）を解決するための重要なAPIだが、現状ではJSDocコメントが不足しており、各セレクタの用途や戻り値の型がIDEで確認しづらい。

## 問題点

- IDEのホバー表示で関数の目的が分からない
- 戻り値の型が`() => unknown`のように表示される場合がある
- 新規開発者が適切なセレクタを選択するのに時間がかかる
- `use*` プレフィックスのセレクタが多く、命名だけでは区別しにくい

## スコープ

- **対象ファイル**: `apps/desktop/src/renderer/store/index.ts` の53個の個別セレクタ
  - AuthMode関連セレクタ（12個）
  - LLM関連セレクタ（16個）
  - Agent関連セレクタ（25個）
- **含まないもの**: Slice内部の関数、既存の合成Hook、テストファイルへのJSDoc追加

## 完了条件

- [ ] 53個全ての個別セレクタにJSDocが追加されている
- [ ] 各JSDocに `@returns` が含まれている
- [ ] 戻り値の型説明が正確である
- [ ] TypeScript型チェックが通る
- [ ] ESLintエラーがない
- [ ] 全テストがPASS
- [ ] JSDocフォーマットが一貫している
- [ ] カテゴリ別のセクションコメントがある

## 関連

- UT-STORE-HOOKS-REFACTOR-001 (#771)
- タスク仕様書: `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-002-jsdoc.md`
