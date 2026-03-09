# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 13                                             |
| Phase名    | PR作成                                         |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | なし                                           |

## 目的

成果物の最終確認を行い、PR準備を完了する。

## 実行タスク

- タスク1: 全Phaseの成果物と Phase 12 必須成果物5件の揃いを最終確認する
- タスク2: PRタイトル・本文・変更ファイル一覧を整理する
- タスク3: `artifacts.json` の最終状態を確認する
- タスク4: Lint / 型チェック / テスト / ビルドの最終品質チェックを実行する

### タスク1: 成果物最終確認

**目的**: 全Phaseの成果物が揃っていることを確認する

**チェックリスト**:

| Phase    | 成果物                                                                         | 確認 |
| -------- | ------------------------------------------------------------------------------ | ---- |
| Phase 1  | 要件定義書                                                                     | □    |
| Phase 2  | 設計書                                                                         | □    |
| Phase 3  | 設計レビュー結果                                                               | □    |
| Phase 4  | テストコード（5ファイル）                                                      | □    |
| Phase 5  | 実装コード（6ファイル）                                                        | □    |
| Phase 6  | 追加テスト + カバレッジレポート                                                | □    |
| Phase 7  | カバレッジ確認結果                                                             | □    |
| Phase 8  | リファクタリング済みコード                                                     | □    |
| Phase 9  | 品質検証結果                                                                   | □    |
| Phase 10 | 最終レビュー結果                                                               | □    |
| Phase 11 | 手動テスト結果                                                                 | □    |
| Phase 12 | 実装ガイド + 仕様更新サマリー + 更新履歴 + 未タスク検出 + スキルフィードバック | □    |

### タスク2: PR 準備

**目的**: PR 作成に必要な情報を整理する

**ブランチ名**: `fix/authguard-timeout-settings-bypass`

**PR タイトル**: `fix(auth): AuthGuardタイムアウトフォールバック + Settings state-based bypass`

**PR 本文テンプレート**:

```markdown
## Summary

- AuthGuardに10秒タイムアウト付きフォールバックUIを追加（リトライ + Settings遷移ボタン）
- Settings画面を `currentView === "settings"` の shell bypass で表示可能に
- AuthGuardDisplayState型に"timed-out"を追加し、状態遷移を型安全に管理

## Test Plan

- [ ] getAuthState の全状態パターンテスト（6ケース）PASS
- [ ] useAuthState のタイムアウトロジックテスト（6ケース）PASS
- [ ] AuthGuard のフォールバックUI表示テスト（5ケース）PASS
- [ ] AuthTimeoutFallback のコンポーネントテスト（6ケース）PASS
- [ ] Settings bypass テスト（3ケース）PASS
- [ ] 既存テスト全PASS（回帰なし）
- [ ] ESLint エラー0件
- [ ] TypeScript 型エラー0件
- [ ] ビルド成功
```

**変更ファイル一覧**:

| ファイル                                                                 | 変更種別  |
| ------------------------------------------------------------------------ | --------- |
| `apps/desktop/src/renderer/components/AuthGuard/types.ts`                | 修正      |
| `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`   | 修正      |
| `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`   | 修正      |
| `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx` | 新規      |
| `apps/desktop/src/renderer/components/AuthGuard/index.tsx`               | 修正      |
| `apps/desktop/src/renderer/App.tsx`                                      | 修正      |
| テストファイル（5ファイル）                                              | 新規/修正 |
| Phase 1-13 仕様書                                                        | 新規      |

### タスク3: artifacts.json 最終更新

**目的**: 全Phaseのステータスを completed に更新する

### タスク4: 最終品質チェック

**目的**: PR 作成前の最終確認

**手順**:

```bash
# Lint
pnpm lint

# TypeScript 型チェック
pnpm typecheck

# 全テスト実行
cd apps/desktop && pnpm vitest run

# ビルド確認
pnpm --filter @repo/shared build && pnpm --filter @repo/desktop build
```

## 参照資料

| 参照資料                 | パス                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-8-refactoring.md`       |
| Phase 9 品質検証         | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-10-final-review.md`     |
| Phase 11 手動テスト      | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-11-manual-test.md`      |
| Phase 12 ドキュメント    | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-12-documentation.md`    |
| PR 作成ルール            | `.claude/rules/07-git-and-tooling.md`                                                                           |

### システム仕様（aiworkflow-requirements）

> 完了前にシステム仕様との最終整合性を確認してください。

| 参照資料           | パス                                                                 | 内容                           |
| ------------------ | -------------------------------------------------------------------- | ------------------------------ |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了条件・PR準備チェックリスト |

## 統合テスト連携

- 最終品質チェックが全 PASS であること

## 成果物

| 成果物         | パス                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| PR             | GitHub PR（作成後にURLを記録）                                                                    |
| artifacts.json | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/artifacts.json` |

## 完了条件

- [ ] 全Phaseの成果物が揃っていること
- [ ] PR本文が作成されていること
- [ ] artifacts.json が最終更新されていること
- [ ] 最終品質チェック（Lint/TypeCheck/Test/Build）が全PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 完了

本タスク（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001）は完了です。
