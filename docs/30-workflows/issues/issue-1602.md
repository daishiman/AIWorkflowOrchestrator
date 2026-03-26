# [#1602] [UT-SC-05-UT-2] track()/safeRegister async対応（対応不要判定）

## メタ情報

```yaml
task_id: UT-SC-05-UT-2
task_name: UT
category: -
target_feature: -
priority: LOW
scale: -
status: 未実施
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/ut-sc-05-ut-2-track-async-callback.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | LOW    |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`track()` 関数のコールバック型が `() => void` で非同期コールバックを公式にサポートしていない。`async () => {...}` を渡すと戻り値の `Promise` が無視される。

## 判定理由

Phase 3 設計レビューおよび Phase 12 未タスク検出において、以下の理由で「対応不要」と判定:

1. 現在の IIFE パターン（`void (async () => { ... })()`）で非同期処理は安全に内包されている
2. `track()` の型変更は他の全ハンドラ登録箇所に影響するため、変更コストが高い
3. Electron の起動シーケンス上、ハンドラ登録完了前に Renderer が IPC 呼び出しを行うリスクは低い

## 再評価条件

- `track()` 内の非同期処理で初期化順序問題が発生した場合
- 新規ハンドラで `async` コールバックが多用されるようになった場合
