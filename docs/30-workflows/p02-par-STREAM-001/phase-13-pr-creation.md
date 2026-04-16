# Phase 13: PR作成

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 対象機能   | TASK-SW-STREAM-001         |
| 前提Phase  | Phase 12: ドキュメント更新 |
| 次Phase    | -                          |
| ステータス | pending（未着手）          |
| 作成日     | 2026-04-16                 |

## 目的

ユーザー承認がある場合のみ change summary とローカルチェック結果をまとめ、PR を作成する。
ユーザー指示があるまで commit / push / PR を実行しない。

## 実行タスク

### Task 1: 変更要約準備

**変更ファイル一覧**:

| ファイル                                                                     | 変更内容                                                                |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `createSkill()` に `onProgress` コールバック引数追加・5節目での呼び出し |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | コールバック呼び出し検証テスト（TC-01〜TC-10）追加                      |

**修正内容サマリ**:

- `SkillCreatorProgress` 型定義を `SkillCreatorService.ts` 内に追加する
- `createSkill()` の第2引数にオプショナルな `onProgress` コールバックを追加する
- 処理の5節目（`planning` / `generating-skill` / `generating-agents` / `validating` / `done`）で
  コールバックを呼び出す
- `onProgress` が未指定の場合でも既存の動作に影響しない（オプショナルチェーン使用）

**validator 結果・テスト結果**（実施時に記録）:

- lint: `pnpm --filter @repo/desktop lint` → TBD（Phase 9 で確認済み）
- typecheck: `pnpm --filter @repo/desktop typecheck` → TBD（Phase 9 で確認済み）
- test: `pnpm --filter @repo/desktop test` → TBD（Phase 9 で確認済み）

### Task 2: TASK-SW-STREAM-002 とのバンドル PR 検討

**検討事項**:

- 本タスクと TASK-SW-STREAM-002 は異なるファイルを変更する
  - 本タスク: `SkillCreatorService.ts`
  - TASK-SW-STREAM-002: `skillCreatorHandlers.ts`
- 機能として意味を成すのは TASK-SW-STREAM-002 完了後（コールバックが実際に接続されたとき）
- バンドル PR にすることでレビュー時の文脈が伝わりやすくなる可能性がある

**方針**（ユーザー判断による）:

- 個別 PR: 本タスク → TASK-SW-STREAM-002 の順でマージ
- バンドル PR: 両タスクをまとめて一度にマージ

### Task 3: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-SW-STREAM-002 の進行状況を確認してから PR 方針を決定する
- 現時点ではユーザー指示があるまで pending 扱いとする

## 参照資料

| 資料名               | パス                                                         |
| -------------------- | ------------------------------------------------------------ |
| 設計書               | `outputs/phase-2/TASK-SW-STREAM-001-design.md`               |
| 実装計画             | `outputs/phase-5/TASK-SW-STREAM-001-implementation-plan.md`  |
| テスト拡充記録       | `outputs/phase-6/TASK-SW-STREAM-001-extended-test-record.md` |
| カバレッジレポート   | `outputs/phase-7/TASK-SW-STREAM-001-coverage-report.md`      |
| リファクタリング記録 | `outputs/phase-8/TASK-SW-STREAM-001-refactoring-record.md`   |
| 品質保証レポート     | `outputs/phase-9/TASK-SW-STREAM-001-quality-report.md`       |
| 最終レビュー結果     | `outputs/phase-10/TASK-SW-STREAM-001-final-review-result.md` |
| 手動テスト結果       | `outputs/phase-11/TASK-SW-STREAM-001-manual-test-result.md`  |
| ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)     |

## 成果物

| 成果物                                   | パス                                                        | 説明          |
| ---------------------------------------- | ----------------------------------------------------------- | ------------- |
| TASK-SW-STREAM-001-change-summary.md     | `outputs/phase-13/TASK-SW-STREAM-001-change-summary.md`     | PR 説明の素案 |
| TASK-SW-STREAM-001-local-check-result.md | `outputs/phase-13/TASK-SW-STREAM-001-local-check-result.md` | 実行ログ要約  |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] pending 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-SW-STREAM-002 とのバンドル PR 検討が記録されている
- [ ] 承認後に必要な成果物が定義されている

## タスク100%実行確認【必須】

- [ ] Task 1（変更要約準備）を100%実行した
- [ ] Task 2（バンドル PR 検討）を100%実行した
- [ ] Task 3（PR 実行条件の確認）を100%実行した
- [ ] 成果物が定義されている
- [ ] artifacts.json が更新されている

## 次 Phase

- pending: ユーザー承認待ち
- TASK-SW-STREAM-002 の進行状況確認後に PR 方針を決定する
