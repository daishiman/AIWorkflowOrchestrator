# Phase 13: PR作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 対象機能   | TASK-SW-STRUCT-001          |
| 前提Phase  | Phase 12: ドキュメント更新  |
| 次Phase    | -                           |
| ステータス | blocked（ユーザー承認待ち） |
| 作成日     | 2026-04-15                  |

## 目的

ユーザー承認がある場合のみ change summary とローカルチェック結果をまとめ、PR を作成する。
ユーザー指示があるまで commit / push / PR を実行しない。

## 実行タスク

### Task 1: 変更要約準備

**変更ファイル一覧**:

| ファイル                                                                     | 変更内容                                                   |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `runCreateWorkflow` の `purpose` / `agents` フィールド修正 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | create モードの出力仕様検証テスト追加                      |

**修正内容サマリ**:

- `structurePlan.purpose` をエージェントプロンプト文字列から `options.description` に変更する
- `structurePlan.agents` をプロンプト文字列リストからエージェント名リストに変更する
- `loadAgent` 呼び出しを削除する（戻り値が不要になったため）
- `try/catch` 構造は将来の処理追加に備えて維持する

**validator 結果・テスト結果**（実施時に記録）:

- lint: `pnpm --filter @repo/desktop lint` → TBD（Phase 9 で確認済み）
- typecheck: `pnpm --filter @repo/desktop typecheck` → TBD（Phase 9 で確認済み）
- test: `pnpm --filter @repo/desktop test` → TBD（Phase 9 で確認済み）

### Task 2: TASK-SW-STRUCT-002 とのバンドル PR 検討

**検討事項**:

- 本タスクと TASK-SW-STRUCT-002 は同一ファイル（`SkillCreatorService.ts`）を変更する
- 本タスクの修正は TASK-SW-STRUCT-002 の前提条件である
- バンドル PR にすることでレビュー効率が向上する可能性がある

**方針**（ユーザー判断による）:

- 個別 PR: 本タスク → TASK-SW-STRUCT-002 の順でマージ
- バンドル PR: 両タスクをまとめて一度にマージ

### Task 3: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-SW-STRUCT-002 の進行状況を確認してから PR 方針を決定する
- 現時点ではユーザー指示により blocked 扱いとする

## 参照資料

| 資料名               | パス                                      |
| -------------------- | ----------------------------------------- |
| 設計書               | `outputs/phase-2/design.md`               |
| 実装計画             | `outputs/phase-5/implementation-plan.md`  |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md` |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`      |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`   |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`       |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md` |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`  |
| ドキュメント更新     | `phase-12-documentation.md`               |

## 成果物

| 成果物                | パス                                     | 説明          |
| --------------------- | ---------------------------------------- | ------------- |
| change-summary.md     | `outputs/phase-13/change-summary.md`     | PR 説明の素案 |
| local-check-result.md | `outputs/phase-13/local-check-result.md` | 実行ログ要約  |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-SW-STRUCT-002 とのバンドル PR 検討が記録されている
- [ ] 承認後に必要な成果物が定義されている

## タスク100%実行確認【必須】

- [ ] Task 1（変更要約準備）を100%実行した
- [ ] Task 2（バンドル PR 検討）を100%実行した
- [ ] Task 3（PR 実行条件の確認）を100%実行した
- [ ] 成果物が定義されている
- [ ] artifacts.json が更新されている

## 次 Phase

- blocked: ユーザー承認待ち
- TASK-SW-STRUCT-002 の進行状況確認後に PR 方針を決定する
