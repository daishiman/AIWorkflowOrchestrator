# Phase 13: PR作成 - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 13                                           |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

Phase 12までの全成果物を確認し、ユーザーの明示承認後にPRを作成する。

**ステータス: BLOCKED** - ユーザーの明示承認がない限り、本Phaseは実行しない。

## 実行タスク

- ローカル確認: 全テストPASS、lint/typecheckクリア、スクリプト動作確認
- PR準備: ブランチ作成、PRタイトル・本文・変更ファイル一覧の準備
- blocked理由の記録

## 参照資料

| 資料名             | パス                                                                           | 説明                 |
| ------------------ | ------------------------------------------------------------------------------ | -------------------- |
| Phase 2設計        | `phase-2-design.md`                                                            | 実装意図の最終確認   |
| Phase 5 Green確認  | `outputs/phase-5/green-confirmation.md`                                        | 実装完了時の検証記録 |
| Phase 6テスト拡充  | `phase-6-test-expansion.md`                                                    | 回帰ガードの確認     |
| Phase 7カバレッジ  | `outputs/phase-7/coverage-report.md`                                           | カバレッジ根拠       |
| Phase 8リファクタ  | `outputs/phase-8/refactoring-report.md`                                        | 品質改善の根拠       |
| Phase 9品質        | `outputs/phase-9/quality-report.md`                                            | 品質ゲート結果       |
| Phase 10レビュー   | `outputs/phase-10/final-review-result.md`                                      | 最終判定             |
| Phase 11手動テスト | `outputs/phase-11/manual-test-result.md`                                       | 手動確認結果         |
| Phase 12成果物     | `outputs/phase-12/`                                                            | 全Phase 12成果物     |
| レビューゲート基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PR作成基準           |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | PR品質基準 |

## 実行手順

### ステップ1: Phase 12完了根拠の確認

| 確認項目        | 確認内容                                                         | 結果       |
| --------------- | ---------------------------------------------------------------- | ---------- |
| Phase 12 Task 1 | implementation-guide.md が Part 1/2 構成で作成されている         | {{RESULT}} |
| Phase 12 Task 2 | system-spec-update-summary.md の全Stepが完了している             | {{RESULT}} |
| Phase 12 Task 3 | documentation-changelog.md が全Step結果を記録している            | {{RESULT}} |
| Phase 12 Task 4 | unassigned-task-detection.md が作成されている（0件でも）         | {{RESULT}} |
| Phase 12 Task 5 | skill-feedback-report.md が作成されている（改善点なしでも）      | {{RESULT}} |
| Phase 12 Task 6 | phase12-task-spec-compliance-check.md が作成されている           | {{RESULT}} |
| LOGS.md x 2     | aiworkflow-requirements と task-specification-creator の両方更新 | {{RESULT}} |
| topic-map.md    | 再生成されている                                                 | {{RESULT}} |
| planned wording | changelog に「予定」「計画」がないこと                           | {{RESULT}} |

### ステップ2: ローカル確認

```bash
# テスト実行
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts

# Lint
pnpm lint

# 型チェック
pnpm typecheck

# スクリプト動作確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

### ステップ3: PR準備（ユーザー承認後のみ実行）

**実行制約ルール（3ルール）**:

1. **user明示承認必須**: ユーザーがPR作成を承認するまで `git commit` / `gh pr create` を実行しない
2. **ローカル確認必須**: ステップ2のテスト・lint・typecheckを必ず実行し、結果を記録してからPR作成に進む
3. **自動commit/PR禁止**: BLOCKEDステータスが解除されるまで、commit/PRは一切自動実行しない

**user approval**:

- [ ] ユーザーがPR作成を承認した

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| ブランチ名 | `feature/UT-TASK06-007-ipc-contract-drift-auto-detect`                    |
| PRタイトル | `feat(scripts): IPC契約ドリフト自動検出スクリプト（Phase 9統合） (#1309)` |
| PRラベル   | `priority:high`, `scale:medium`                                           |

#### PR本文テンプレート

```markdown
## Summary

- IPC契約ドリフト（P44/P45/P60パターン）を自動検出するスクリプトを追加
- Phase 9品質検証チェックリストに統合
- 4つの検出ルール: チャンネル孤児(R-01)、引数形式不一致(R-02)、ハードコード文字列(R-03)、未登録チャンネル(R-04)

## Test Plan

- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が正常実行される
- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict` で不一致検出時にexit 1
- [ ] `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts` が全PASS
- [ ] P44パターン（引数形式不一致）の検出テストがPASS

Closes #1309
```

## 統合テスト連携

Phase 13 では統合テスト連携の確認は不要（Phase 12 で完了済み）。

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                              | 判定 |
| ------------ | ----------------------------------------------------- | ---- |
| PR品質       | PRタイトルが70文字以内、Summary + Test Plan構成である | -    |
| テスト網羅性 | ローカルで全テスト・lint・typecheckがPASS             | -    |
| 承認フロー   | ユーザーの明示承認を取得してからPR作成している        | -    |
| 完了根拠     | Phase 12の全6成果物が存在し、planned wordingがない    | -    |

## 成果物

| 成果物     | パス                           | 説明     |
| ---------- | ------------------------------ | -------- |
| PRドラフト | `outputs/phase-13/pr-draft.md` | PR本文案 |

## 完了条件

- [ ] ユーザーの明示承認を取得している
- [ ] ローカルで全テスト・lint・typecheckがPASS
- [ ] スクリプトの動作確認が完了している
- [ ] PRが作成されている（またはblocked理由が記録されている）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 担当   | ステータス | 備考                             |
| ---------- | ------ | ---------- | -------------------------------- |
| ステップ1  | メイン | 完了       | Phase 12完了根拠の確認           |
| ステップ2  | メイン | BLOCKED    | ユーザー承認待ちのため再実行保留 |
| ステップ3  | メイン | BLOCKED    | ユーザー承認後にPR作成           |

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 13
```

## 現状

Phase 13 はユーザー承認待ちのため BLOCKED。承認後にローカル確認を再実行し、PR作成へ進む。
