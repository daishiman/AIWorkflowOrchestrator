# [#1402] [UT-FIX-APP-INLINE-SELECTOR-001] App.tsx useAppStore 直接使用を個別セレクタに統一

## メタ情報

```yaml
issue_number: 1402
title: [UT-FIX-APP-INLINE-SELECTOR-001] App.tsx useAppStore 直接使用を個別セレクタに統一
state: OPEN
priority: 中
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1402
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`App.tsx` が `useAppStore` を直接使用しており、プロジェクトの個別セレクタパターン（P31 対策）に準拠していない。将来の `useEffect` 依存配列追加時に無限ループが発生するリスクがある。

## 背景

Phase 10/11 レビューにて検出。`useAppStore()` の合成Hook戻り値を `useEffect` 依存配列に含めると毎回新しいオブジェクトが返るため無限ループが発生するリスクがある（P31 パターン）。

## 対象ファイル

- `apps/desktop/src/renderer/App.tsx`

## 対応内容

1. `grep -n "useAppStore" apps/desktop/src/renderer/App.tsx` で使用箇所を特定
2. 各使用箇所について対応する個別セレクタ（`useXxx()` 形式）に置換
3. 配列を返すセレクタには `useShallow` を適用（P48 対策）

## 完了条件

- [ ] `App.tsx` に `useAppStore` 直接呼び出しが残存しない
- [ ] 全ての状態取得が個別セレクタ経由になっている
- [ ] 全関連テストが PASS
- [ ] TypeScript 型チェックが PASS

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-app-inline-selector-refactor.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連パターン: P31（Zustand Store Hooks 無限ループ）、P48（useShallow 未適用）
- 依存タスク: UT-STORE-HOOKS-REFACTOR-001（完了）
