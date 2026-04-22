# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 13                                       |
| タスクID     | TASK-RALLY-002                           |
| 機能名       | restored-pending-request-clarification   |
| タスク名     | restoredPendingRequest合成ルール明確化   |
| 前提Phase    | Phase 12                                 |
| 後続Phase    | 完了                                     |
| 作成日       | 2026-04-21                               |
| ステータス   | pending                                  |
| 実装モード   | verify_existing                          |
| ブロック状態 | approval-blocked（ユーザー明示承認待ち） |

## 目的

Phase 1〜12 の全作業を PR として提出する準備を整える。本 Phase はユーザーの明示承認があるまで approval-blocked 扱いとし、PR の実際の作成は行わない。ローカルでの最終品質チェックを実施し、PR に必要な情報（変更サマリー・PR タイトル・PR 本文・チェックリスト）を `outputs/phase-13/` に記録する。ユーザーから明示的な承認が得られた時点で、記録した情報をもとに PR を作成する。

## approval-blocked 方針

**本 Phase は approval-blocked 状態で開始する。**

以下のすべてを完了した時点でも、ユーザーの明示承認なしに PR を作成してはならない。

- ローカルチェック（typecheck / lint / test）の完了
- 変更サマリーの作成
- PR 情報（タイトル・本文）の準備

**承認を得る手順**:

1. `outputs/phase-13/pr-info.md` に PR タイトル・本文・チェックリストを記録する
2. ユーザーに承認を求める（「PR を作成してよいですか？」と確認する）
3. ユーザーから明示的に「承認」「作成してください」「OK」のいずれかの応答を得た後に `gh pr create` を実行する
4. `outputs/phase-13/pr-creation-result.md` に作成結果（PR URL・番号・ステータス）を記録する

**ユーザーの承認なしに `gh pr create` を実行することは禁止されている。**

## 実行タスク

1. ローカルで `pnpm typecheck`・`pnpm lint`・`pnpm vitest run` を実行し、すべてエラーなしで通過することを確認して `outputs/phase-13/local-check-result.md` に結果を記録する
2. Phase 1〜12 の全変更内容を集約し、PR タイトル・本文・レビュアーへの説明を `outputs/phase-13/change-summary.md` と `outputs/phase-13/pr-info.md` に記録する
3. ユーザーの明示承認を得た後に `gh pr create` を実行し、作成結果を `outputs/phase-13/pr-creation-result.md` に記録する

## ローカルチェック手順

以下のコマンドを順に実行し、各結果を `outputs/phase-13/local-check-result.md` に記録する。

```bash
# TypeScript 型チェック
pnpm typecheck

# ESLint（exhaustive-deps 警告を含む）
pnpm lint

# Vitest 単体テスト
pnpm vitest run
```

いずれかのコマンドがエラーで終了した場合、Phase 13 の作業を停止し、エラー内容を `local-check-result.md` に記録する。エラーの修正は Phase 5 または該当 Phase に差し戻して対処する。

## change-summary の記録形式

`outputs/phase-13/change-summary.md` には以下の形式で変更内容を記録する。

| 変更ファイル                | 変更種別     | 変更内容の要約                                              |
| --------------------------- | ------------ | ----------------------------------------------------------- |
| ConversationalInterview.tsx | コメント追加 | restoredPendingRequest 優先ルールとクリア条件のコメント明示 |

## PR 情報の記録形式

`outputs/phase-13/pr-info.md` には以下を記録する。

- **PR タイトル**: 変更内容を 70 文字以内で表現する
- **ベースブランチ**: main
- **変更の概要**: 1〜3 行で変更目的を説明する
- **テスト計画**: 手動テスト（シナリオ 1〜3）・自動テスト（typecheck / lint / vitest）の実施状況
- **関連タスク**: TASK-RALLY-002 / RALLY-002
- **レビュアーへの注意点**: verify_existing タスクであり、ロジック変更なくコメント追加による意味固定であることを明記する

## 実行手順

1. `pnpm typecheck` を実行し、結果を `outputs/phase-13/local-check-result.md` に記録する
2. `pnpm lint` を実行し、結果を `outputs/phase-13/local-check-result.md` に追記する
3. `pnpm vitest run` を実行し、結果を `outputs/phase-13/local-check-result.md` に追記する
4. いずれかのチェックが失敗した場合、作業を停止してエラー内容を記録し、該当 Phase に差し戻す
5. 全チェックが通過した場合、Phase 1〜12 の成果物を参照して変更サマリーを作成し、`outputs/phase-13/change-summary.md` に記録する
6. PR タイトル・本文・チェックリストを `outputs/phase-13/pr-info.md` に記録する
7. ユーザーに PR 作成の承認を求める
8. ユーザーの明示承認を得た後に `gh pr create` を実行する
9. PR 作成結果（URL・番号・ステータス）を `outputs/phase-13/pr-creation-result.md` に記録する

## 参照資料

| 資料名                            | パス                                                     | 用途                                           |
| --------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| Phase 12 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | PR 本文の変更説明の起点                        |
| Phase 12 ドキュメント変更ログ     | `outputs/phase-12/documentation-changelog.md`            | change-summary の作成起点                      |
| Phase 12 システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 2 実施状況の PR 本文への反映              |
| Phase 12 未割り当てタスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | PR レビュアーへの注意点の確認                  |
| Phase 12 準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PR 作成前の仕様書準拠確認                      |
| Phase 10 Gate 判定結果            | `outputs/phase-10/gate-decision.md`                      | 最終ゲート PASS の確認（PR 作成前提条件）      |
| Phase 11 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | テスト計画の記述起点                           |
| タスク概要                        | `docs/30-workflows/wave0-par-RALLY-002/index.md`         | approval-blocked 方針・Phase 13 完了条件の確認 |

## 成果物

- `outputs/phase-13/local-check-result.md`（typecheck / lint / vitest の実行結果と通過状況）
- `outputs/phase-13/change-summary.md`（変更ファイル・変更種別・変更内容の一覧）
- `outputs/phase-13/pr-info.md`（PR タイトル・本文・レビュアーへの注意点・テスト計画）
- `outputs/phase-13/pr-creation-result.md`（PR 作成結果：URL・番号・ステータス。承認前は「承認待ち」と記録する）

## 完了条件

- [ ] `pnpm typecheck` がエラーなしで通過し、結果が `outputs/phase-13/local-check-result.md` に記録されている
- [ ] `pnpm lint` がエラーなしで通過し、結果が `outputs/phase-13/local-check-result.md` に記録されている
- [ ] `pnpm vitest run` がエラーなしで通過し、結果が `outputs/phase-13/local-check-result.md` に記録されている
- [ ] 変更サマリーが `outputs/phase-13/change-summary.md` に記録されている
- [ ] PR タイトル・本文・テスト計画が `outputs/phase-13/pr-info.md` に記録されている
- [ ] `outputs/phase-13/pr-creation-result.md` に承認待ち状態または PR 作成結果が記録されている
- [ ] ユーザーの明示承認なしに `gh pr create` が実行されていない
- [ ] 4成果物すべてが `outputs/phase-13/` に定義されている

## タスク100%実行確認【必須】

以下のコマンドで Phase 13 の成果物が正しく生成されていることを確認する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/wave0-par-RALLY-002 --phase 13
```

上記コマンドが正常終了し、以下の4ファイルが存在することを確認する。

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`
- `outputs/phase-13/pr-creation-result.md`

## 次のPhase

完了
