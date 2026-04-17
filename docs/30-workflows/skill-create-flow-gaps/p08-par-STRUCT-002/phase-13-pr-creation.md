# Phase 13: PR作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 対象機能   | TASK-SW-STRUCT-002          |
| 前提Phase  | Phase 12: ドキュメント更新  |
| 次Phase    | -                           |
| ステータス | blocked（ユーザー承認待ち） |
| 作成日     | 2026-04-16                  |

## 目的

ユーザー承認がある場合のみ change summary とローカルチェック結果をまとめ、PR を作成する。
ユーザー指示があるまで commit / push / PR を実行しない。

## 実行タスク

### Task 1: 変更要約準備

**変更ファイル一覧**:

| ファイル                                                                     | 変更内容                                                                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `void structurePlan;` 削除・`logger` 追加・`generateSkillMd` 新規実装・SKILL.md 生成フロー変更 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | `generateSkillMd` 関連テスト 12 件追加（計 82 件 PASS）                                        |

**修正内容サマリ**:

- `:126` の `void structurePlan;` を削除（意図的な未実装プレースホルダーの解消）
- `logger` プライベートフィールドを追加（`warn` / `error` ラッパー）
- `generateSkillMd(skillDir, structurePlan)` プライベートメソッドを新規実装
  - `StructurePlanJson` → `generate_skill_md.js` 用 `plan` オブジェクトへの変換
  - `purpose` → `trigger.description` への正規化変換
  - tmp ファイル経由での `generate_skill_md.js` 呼び出し
  - 3段階フォールバック（スクリプト失敗 / ファイル未生成 / 例外）
- SKILL.md 生成フローを `structurePlan` 有無による分岐に変更

**validator 結果・テスト結果**（実施時に記録）:

- lint: `pnpm --filter @repo/desktop lint` → TBD（Phase 9 で確認済み）
- typecheck: `pnpm --filter @repo/desktop typecheck` → TBD（Phase 9 で確認済み）
- test: `pnpm --filter @repo/desktop test` → TBD（Phase 9 で確認済み）

### Task 2: TASK-SW-STRUCT-001 とのバンドル PR 検討

**検討事項**:

- 本タスクと TASK-SW-STRUCT-001 は同一ファイル（`SkillCreatorService.ts`）を変更する
- 本タスクは TASK-SW-STRUCT-001 の後続タスクであり、両タスクで機能が完結する
- コミット `c21cc553c` は両タスクの変更をまとめて実装済みであるため、バンドル PR として扱う

**方針**（ユーザー判断による）:

- バンドル PR: TASK-SW-STRUCT-001 + TASK-SW-STRUCT-002 をまとめて一度にマージ（推奨）
- 個別 PR: TASK-SW-STRUCT-001 → TASK-SW-STRUCT-002 の順でマージ

### Task 3: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- 実装コミット `c21cc553c` は main ブランチにマージ済み
- 現時点ではユーザー指示により blocked 扱いとする

## 参照資料

| 資料名               | パス                                                         |
| -------------------- | ------------------------------------------------------------ |
| 設計書               | `outputs/phase-2/TASK-SW-STRUCT-002-design.md`               |
| 実装計画             | `outputs/phase-5/TASK-SW-STRUCT-002-implementation-plan.md`  |
| テスト拡充記録       | `outputs/phase-6/TASK-SW-STRUCT-002-extended-test-record.md` |
| カバレッジレポート   | `outputs/phase-7/TASK-SW-STRUCT-002-coverage-report.md`      |
| リファクタリング記録 | `outputs/phase-8/TASK-SW-STRUCT-002-refactoring-record.md`   |
| 品質保証レポート     | `outputs/phase-9/TASK-SW-STRUCT-002-quality-report.md`       |
| 最終レビュー結果     | `outputs/phase-10/TASK-SW-STRUCT-002-final-review-result.md` |
| 手動テスト結果       | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md`  |
| ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)     |

## 成果物

| 成果物                                   | パス                                                        | 説明          |
| ---------------------------------------- | ----------------------------------------------------------- | ------------- |
| TASK-SW-STRUCT-002-change-summary.md     | `outputs/phase-13/TASK-SW-STRUCT-002-change-summary.md`     | PR 説明の素案 |
| TASK-SW-STRUCT-002-local-check-result.md | `outputs/phase-13/TASK-SW-STRUCT-002-local-check-result.md` | 実行ログ要約  |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-SW-STRUCT-001 とのバンドル PR 検討が記録されている
- [ ] 承認後に必要な成果物が定義されている

## タスク100%実行確認【必須】

- [ ] Task 1（変更要約準備）を100%実行した
- [ ] Task 2（バンドル PR 検討）を100%実行した
- [ ] Task 3（PR 実行条件の確認）を100%実行した
- [ ] 成果物が定義されている
- [ ] artifacts.json が更新されている

## 次 Phase

- blocked: ユーザー承認待ち
- 実装コミット `c21cc553c` は main ブランチにマージ済みのため、PR 方針はユーザーが判断する
