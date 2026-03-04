# [#771] [UT-STORE-HOOKS-REFACTOR-001] Store Hooksを個別セレクタベースに再設計

## メタ情報

```yaml
issue_number: 771
title: [UT-STORE-HOOKS-REFACTOR-001] Store Hooksを個別セレクタベースに再設計
state: CLOSED
priority: 中
scale: 中規模
category: リファクタリング
status: 未実施
created_date: 2026-02-10
updated_date: 2026-02-11
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/771
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

Zustand Store Hooksの無限ループ問題（P31）の抜本的解決として、合成Store Hooksを個別セレクタベースに再設計する。

## 背景

現在の合成Store Hooks（useAuthModeStore()等）は毎回新しいオブジェクトを返すため、useEffectの依存配列に含めると無限ループが発生する。

## 対象ファイル

- apps/desktop/src/renderer/store/authModeStore.ts
- apps/desktop/src/renderer/store/slices/llmSlice.ts
- apps/desktop/src/renderer/store/slices/skillSlice.ts

## 推奨アプローチ

1. 個別セレクタHookを作成（useAuthMode(), useSetAuthMode()等）
2. 既存コンポーネントを段階的に移行
3. 合成Hooksは後方互換のため残し、非推奨マークを付与

## 関連

- P31: 06-known-pitfalls.md
- 親タスク: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

---

📋 仕様書: docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor.md
