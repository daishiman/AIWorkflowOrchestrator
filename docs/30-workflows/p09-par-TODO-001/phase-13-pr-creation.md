# Phase 13: PR作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 対象機能   | TASK-SW-TODO-001            |
| 前提Phase  | Phase 12: ドキュメント更新  |
| 次Phase    | -                           |
| ステータス | pending（ユーザー承認待ち） |
| 作成日     | 2026-04-16                  |

## 目的

ユーザー承認がある場合のみ change summary とローカルチェック結果をまとめ、PR を作成する。
ユーザー指示があるまで commit / push / PR を実行しない。

## 実行タスク

### Task 1: 変更要約準備

**変更ファイル一覧**:

| ファイル                                                                      | 変更内容                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 行 456-489 のTODOコメント整理（削除または書き換え） |

オプション A-1 採用時は追加で:

| ファイル                                                                      | 変更内容                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | `MAIN_TOOL_BADGE_ENABLED` フラグ削除・直接 `true` に置き換え（行 116 付近） |

**修正内容サマリ（オプション A 採用時）**:

- 行 456-489 のTODOコメント（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 参照）を削除
- バッジを恒久的に表示する旨のコメントに変更
- `MAIN_TOOL_BADGE_ENABLED` フラグを削除して直接 `true` を使用（方針 A-1 採用時のみ）

**修正内容サマリ（オプション B 採用時）**:

- 行 456-489 のTODOコメントを具体的な条件・参照先を含む内容に書き換え
- トレーサビリティを確保した上でTODOを維持

**validator 結果・テスト結果**（実施時に記録）:

- lint: `pnpm --filter @repo/desktop lint` → TBD（Phase 9 で確認済み）
- typecheck: `pnpm --filter @repo/desktop typecheck` → TBD（Phase 9 で確認済み）
- test: `pnpm --filter @repo/desktop test` → TBD（Phase 9 で確認済み）

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- 本タスクは極小規模（コメント整理のみ）のため、単独 PR または他の小規模タスクとのバンドルを検討する
- 現時点ではユーザー指示により pending 扱いとする

### Task 3: PR 作成（承認後）

ユーザー承認後に以下を実行する。

```bash
# ブランチ確認
git status

# コミット
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git commit -m "chore: ConversationRoundStep 主ツールバッジTODOコメント整理 (TASK-SW-TODO-001)"

# PR 作成
gh pr create \
  --title "chore: 主ツールバッジTODOコメント整理 (TASK-SW-TODO-001)" \
  --body "..."
```

## 参照資料

| 資料名               | パス                                                       |
| -------------------- | ---------------------------------------------------------- |
| 設計書               | `outputs/phase-2/TASK-SW-TODO-001-design.md`               |
| 実装計画             | `outputs/phase-5/TASK-SW-TODO-001-implementation-plan.md`  |
| テスト拡充記録       | `outputs/phase-6/TASK-SW-TODO-001-extended-test-record.md` |
| カバレッジレポート   | `outputs/phase-7/TASK-SW-TODO-001-coverage-report.md`      |
| リファクタリング記録 | `outputs/phase-8/TASK-SW-TODO-001-refactoring-record.md`   |
| 品質保証レポート     | `outputs/phase-9/TASK-SW-TODO-001-quality-report.md`       |
| 最終レビュー結果     | `outputs/phase-10/TASK-SW-TODO-001-final-review-result.md` |
| 手動テスト結果       | `outputs/phase-11/TASK-SW-TODO-001-manual-test-result.md`  |
| ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)   |

## 成果物

| 成果物                                 | パス                                                      | 説明          |
| -------------------------------------- | --------------------------------------------------------- | ------------- |
| TASK-SW-TODO-001-change-summary.md     | `outputs/phase-13/TASK-SW-TODO-001-change-summary.md`     | PR 説明の素案 |
| TASK-SW-TODO-001-local-check-result.md | `outputs/phase-13/TASK-SW-TODO-001-local-check-result.md` | 実行ログ要約  |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] pending 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] 承認後に必要な成果物が定義されている

## タスク100%実行確認【必須】

- [ ] Task 1（変更要約準備）を100%実行した
- [ ] Task 2（PR 実行条件の確認）を100%実行した
- [ ] Task 3（PR 作成手順）が定義されている
- [ ] 成果物が定義されている
- [ ] artifacts.json が更新されている

## 次 Phase

- pending: ユーザー承認待ち
- 承認後に commit / push / PR を実行する
