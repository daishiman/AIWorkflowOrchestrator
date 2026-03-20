# [#1267] [UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001] Main Process index.ts トップレベル副作用モジュール分離ガード

## メタ情報

```yaml
issue_number: 1267
title: [UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001] Main Process index.ts トップレベル副作用モジュール分離ガード
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1267
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## タスク概要

**タスクID**: UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001
**分類**: 改善
**対象機能**: Electron Main Process
**優先度**: 中
**規模**: 中規模
**発見元**: Phase 12（スキルフィードバックレポート）
**発見日**: 2026-03-16

## 目的

TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の実装で `apps/desktop/src/main/index.ts` にトップレベル副作用（`app.whenReady()`, `createWindow()`, Electronモジュールインポート等）があり、index.ts から import されるモジュールのユニットテストが Vitest 環境で実行不可能だった。`menu.ts` は分離済みだが、他にも分離すべきモジュールが残っている。本タスクでは index.ts のトップレベル副作用を監査し、独立テスト可能なモジュールへの分離計画を策定・実行する。

## 問題点

- index.ts のトップレベルで `app.whenReady()`, `app.on('activate', ...)`, `createWindow()` 等の Electron API 呼び出しが実行される
- index.ts から他のモジュールを直接 import すると、Electron API の副作用が走り Vitest 環境でテストできない
- 現状、index.ts が起動エントリポイントとビジネスロジックの両方を担っており、単一責務原則に違反している

## 最終ゴール

1. index.ts が100行以内の薄い起動エントリポイントのみになっている
2. 各機能モジュール（menu.ts, optimizer.ts, security.ts 等）が個別にユニットテスト可能になっている
3. 分離した全モジュールにユニットテストが存在し、全て PASS している
4. Phase 12 仕様同期が完了している

## 受入基準

- [ ] index.ts が100行以内の起動エントリポイントのみになっている
- [ ] 分離した各モジュールにユニットテストが存在する
- [ ] 全テストが PASS している
- [ ] 起動シーケンスにリグレッションがない
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] Line Coverage 80% 以上
- [ ] ESLint `import/no-cycle` で循環依存なし

## 依存タスク

- TASK-FIX-ELECTRON-APP-MENU-ZOOM-001（完了済み — menu.ts 分離の成功パターン）

## 仕様書パス

`docs/30-workflows/completed-tasks/TASK-FIX-ELECTRON-APP-MENU-ZOOM-001/unassigned-task/task-imp-main-process-module-extraction-guard-001.md`
