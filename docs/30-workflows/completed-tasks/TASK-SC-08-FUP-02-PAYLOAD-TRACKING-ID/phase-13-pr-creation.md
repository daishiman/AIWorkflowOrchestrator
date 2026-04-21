# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 13                                                     |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| タスク種別 | NON_VISUAL code task                                   |
| ステータス | **pending（user 承認待ち）**                           |
| 前Phase    | [phase-12-documentation.md](phase-12-documentation.md) |
| 次Phase    | なし（最終 Phase）                                     |

## 目的

Phase 12 までで確定した変更内容を PR として公開するための前工程（local check / change summary / pr-info 下書き）を整備する。**`gh pr create` 実行は user からの明示的な承認があるまで blocked とする**。

## ルール【必須】

1. **user 承認があるまで commit / push / `gh pr create` を一切実行しない（本 spec は draft 状態のまま据え置く）**
2. Phase 12 成果物が全て揃い `phase12-task-spec-compliance-check.md` が PASS であることを前提とする
3. Issue #2300 は closed 状態を維持する（再 open しない）
4. 承認後に実施する場合でも `--no-verify` 系オプションは使用禁止（プロジェクト CLAUDE.md 準拠）
5. PR 本文テンプレートは `.github/pull_request_template.md` に従う

## pending 記録

- 理由: 本 spec 作成時点で user から PR 作成承認を受領していない
- 現状: Phase 13 の 4 成果物のうち `local-check-result.md` と `change-summary.md` と `pr-info.md` は draft まで可、`pr-creation-result.md` は承認後に作成する
- 解除条件: user から「PR を作成してよい」旨の明示指示を受領した時点

## 実行タスク（承認前に実施可能な範囲）

| Task      | 内容                                        | 成果物                                   | 承認要否 |
| --------- | ------------------------------------------- | ---------------------------------------- | -------- |
| Task 13-1 | local check（typecheck / lint / test 実行） | `outputs/phase-13/local-check-result.md` | 不要     |
| Task 13-2 | 変更サマリ作成（4 ファイル差分の要約）      | `outputs/phase-13/change-summary.md`     | 不要     |
| Task 13-3 | PR タイトル / 本文の draft 作成             | `outputs/phase-13/pr-info.md`            | 不要     |
| Task 13-4 | `gh pr create` 実行と結果記録               | `outputs/phase-13/pr-creation-result.md` | **必要** |

- Task 13-1: local check の結果を記録する
- Task 13-2: 変更サマリを整理する
- Task 13-3: PR 情報の draft を作る
- Task 13-4: user 承認後のみ PR を作成して結果を残す

## Task 13-1: ローカルチェック

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop lint`
- `pnpm --filter @repo/desktop test -- --run useStreamingProgress`
- `pnpm --filter @repo/desktop test -- --run skill-creator`
- 全て PASS を確認し `local-check-result.md` に記録

## Task 13-2: 変更サマリ

- 変更ファイル 4 件の diff 要約
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- 新規テストシナリオ 4 件（match / miss / legacy / no-options）の追加箇所
- AC-1 〜 AC-9 充足状況と参照 artifact

## Task 13-3: pr-info draft

- タイトル案: `feat: TASK-SC-08-FUP-02 progress payload への planId/requestId 付与による混線防止`
- 本文セクション:
  - `## Summary` 箇条書き 2 〜 3 行
  - `## Test plan` チェックボックス（typecheck / lint / unit test / dev server smoke）
  - `## その他` に Phase 12 実装ガイドへのリンク
- Closes: `#2300`（closed 状態だが参照として付与）

## Task 13-4: PR 作成（**pending** ）

- user 承認受領後に以下を実施:
  1. 必要ブランチを push（初回時 `-u` 付き）
  2. `gh pr create --title ... --body ...` を HEREDOC で実行
  3. PR 番号 / URL / CI ステータスを `pr-creation-result.md` に記録
- 承認を受領していない段階では **一切実行しない**

## 成果物

| 成果物                                   | 条件                                                 |
| ---------------------------------------- | ---------------------------------------------------- |
| `outputs/phase-13/local-check-result.md` | 承認前に作成可（draft）                              |
| `outputs/phase-13/change-summary.md`     | 承認前に作成可（draft）                              |
| `outputs/phase-13/pr-info.md`            | 承認前に draft。承認後に確定                         |
| `outputs/phase-13/pr-creation-result.md` | **承認後のみ作成**。承認なしの場合は空のまま据え置く |

## 参照資料

- `.github/pull_request_template.md`
- `phase-12-documentation.md` の実装ガイド
- Issue #2300（closed 状態を維持）
- プロジェクト CLAUDE.md の Git 操作禁止事項（`--no-verify` 禁止）

## 完了条件

- [ ] `status: pending` として user 承認待ちであることが明記されている
- [ ] 承認前に実施可能なタスク（13-1 / 13-2 / 13-3）と承認必須タスク（13-4）が分離されている
- [ ] `gh pr create` 実行条件（user 明示承認）が明記されている
- [ ] Issue #2300 を closed 状態で維持する方針が明記されている
- [ ] `--no-verify` 禁止が明記されている
- [ ] 成果物定義が `artifacts.json` と `index.md` と一致している
