# [#770] [UT-FIX-APP-INITAUTH-CHECK-001] App.tsx initializeAuth 確認

## メタ情報

```yaml
issue_number: 770
title: [UT-FIX-APP-INITAUTH-CHECK-001] App.tsx initializeAuth 確認
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-02-10
updated_date: 2026-02-10
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/770
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

App.tsxのinitializeAuth呼び出しでも、Zustand Store Hooks無限ループ問題（P31）と同様のパターンが発生していないか確認する。

## 背景

Phase 10レビューでMINOR指摘として検出。initializeAuthとinitializeAuthModeの責務分担が不明確な可能性がある。

## 確認対象

- apps/desktop/src/renderer/App.tsx
- apps/desktop/src/renderer/store/slices/authSlice.ts
- apps/desktop/src/renderer/store/authModeStore.ts

## 確認項目

1. initializeAuthの呼び出しパターン確認
2. useEffectの依存配列チェック
3. 無限ループリスクの有無判定

## 関連

- P31: 06-known-pitfalls.md
- 親タスク: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

---

📋 仕様書: docs/30-workflows/completed-tasks/task-ut-fix-app-initauth-check.md
