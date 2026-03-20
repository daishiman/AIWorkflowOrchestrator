# [#1296] [UT-06-005-A-SANITIZE-ARGS-TYPE-SAFETY] sanitizeArgs 内 as string キャスト除去（P49準拠）

## メタ情報

```yaml
issue_number: 1296
title: [UT-06-005-A-SANITIZE-ARGS-TYPE-SAFETY] sanitizeArgs 内 as string キャスト除去（P49準拠）
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1296
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`sanitizeArgs` ヘルパー関数内の `as string` キャスト9箇所を P49 準拠の `in` 演算子パターンに置換する。

## 問題

- `sanitizeArgs` 周辺で `as string` キャストが9箇所以上使用
- P49（type predicate 内での `as` キャスト vs `in` 演算子）違反
- `typeof` チェック後のキャストは実行時安全だが、`in` 演算子パターンが推奨
- 関連 Pitfall: P49、P19（型キャストバイパス）、P42（3段バリデーション）

## 解決策

1. `as string` キャストを `in` 演算子 + `typeof` チェックに置換
2. 共通ユーティリティ関数 `safeStringField()` の抽出を検討
3. 既存テストの期待値は変更不要（振る舞い不変）

## 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（sanitizeArgs 関数付近）

## タスク仕様書

`docs/30-workflows/completed-tasks/UT-06-005-A-hook-fallback-integration/unassigned-task/task-ut-06-005-a-sanitize-args-type-safety.md`

## 発見元

UT-06-005-A Phase 12 コード品質分析（2026-03-17）
