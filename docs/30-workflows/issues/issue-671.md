# [#671] [task-imp-vitest-e2e-config-001] Vitest+Playwright E2Eテスト型設定追加

## メタ情報

```yaml
issue_number: 671
title: [task-imp-vitest-e2e-config-001] Vitest+Playwright E2Eテスト型設定追加
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-02-02
updated_date: 2026-02-02
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/671
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Vitest+Playwright E2Eテスト型設定追加

## 関連タスク仕様書

- `docs/30-workflows/unassigned-task/task-imp-vitest-e2e-config-001.md`

## 背景

TASK-8C-CのE2Eテストファイル（`skillImportExecution.e2e.ts`）は、Vitest形式で記述されているが、PlaywrightのLocatorメソッドを使用。現在の設定では型チェック時にエラーが発生する。

## 問題点

- Vitest `expect` と Playwright `expect` の型不整合（TypeScript型チェックエラー16件）
- `@vitest/playwright` 型拡張が未設定

## 達成目標

- [ ] 型チェックエラーの解消（`pnpm typecheck` でエラー0件）
- [ ] E2Eテスト用の型拡張設定
- [ ] 開発者体験の向上（IDEでの型補完・エラー検出）

## 成果物

- `apps/desktop/vitest.e2e.config.ts` 新規作成
- `apps/desktop/tsconfig.json` 更新（必要時）

## 発見元

TASK-8C-C Phase 10（最終レビュー）
