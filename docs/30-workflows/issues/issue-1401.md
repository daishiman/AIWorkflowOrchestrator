# [#1401] [UT-FIX-APP-CONSOLE-LOG-001] App.tsx プロダクションコード console.log 残存修正

## メタ情報

```yaml
issue_number: 1401
title: [UT-FIX-APP-CONSOLE-LOG-001] App.tsx プロダクションコード console.log 残存修正
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1401
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`App.tsx` にプロダクションコードとして `console.log` が残存している。ESLint の `no-console` ルール違反であり、セキュリティ上の情報漏洩リスクがある（P20 パターン）。

## 背景

Phase 10/11 レビューにて検出。デバッグ用の `console.log` がエンドユーザーの DevTools に露出する状態。

## 対象ファイル

- `apps/desktop/src/renderer/App.tsx`

## 対応内容

1. `grep -n "console.log" apps/desktop/src/renderer/App.tsx` で残存箇所を特定
2. デバッグ目的のログを削除
3. 必要なロギングは `process.env.NODE_ENV !== 'production'` でガードするか `electron-log` に移行

## 完了条件

- [ ] `App.tsx` から全ての `console.log` が除去されている
- [ ] `pnpm --filter @repo/desktop lint` が PASS

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-app-console-log-cleanup.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連パターン: P20（テスト環境でのログ出力汚染）
