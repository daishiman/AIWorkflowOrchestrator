# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 13                                                         |
| Phase名    | PR作成                                                     |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 12（ドキュメント更新）                               |
| 後続Phase  | なし（タスク完了）                                         |
| ステータス | not_started                                                |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI が通過したことを確認してタスクを完了する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼する
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認する
- PR 作成: ユーザーの明示的な許可後に `/ai:diff-to-pr` を実行する
- CI 確認: CI が通過したことを確認する
- タスク移動: タスクディレクトリを `completed-tasks` に移動する

## 参照資料

| 参照資料                      | パス                                          | 内容                                     |
| ----------------------------- | --------------------------------------------- | ---------------------------------------- |
| Phase 2 設計サマリー          | `outputs/phase-2/design-summary.md`           | Summary の設計背景                       |
| Phase 5 実装サマリー          | `outputs/phase-5/implementation-summary.md`   | 実装差分の要約                           |
| Phase 6 テスト拡充サマリー    | `outputs/phase-6/test-expansion-summary.md`   | 異常系テストの補強内容                   |
| Phase 7 カバレッジ結果        | `outputs/phase-7/coverage-report.md`          | Test Plan の根拠                         |
| Phase 8 リファクタリング結果  | `outputs/phase-8/refactoring-summary.md`      | 品質改善の要点                           |
| Phase 9 品質検証結果          | `outputs/phase-9/quality-report.md`           | 品質ゲートの最終結果                     |
| Phase 10 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | レビュー判定と残課題                     |
| Phase 12 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | PR コメント用実装ガイド                  |
| Phase 12 ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 変更内容のサマリー作成に使用する         |
| Phase 11 スクリーンショット   | `outputs/phase-11/screenshots/`               | PR 本文への UI/UX スクリーンショット添付 |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | PR 本文の Test Plan に記載する           |

## 実行手順

### ステップ1: ローカル動作確認を依頼する（必須）

以下の文言でユーザーに動作確認を依頼する。ユーザーの確認が完了するまでステップ2以降に進まない:

```
ローカルでの動作確認をお願いします。

確認項目:
1. subscription モードで Skill を実行し、TerminalHandoffCard が表示されること
2. api-key モードで Skill を実行し、通常の実行フローで完了すること
3. 既存の chat-edit runtime routing が動作すること

確認が完了したらお知らせください。
```

### ステップ2: 変更サマリーを提示し許可を確認する（必須）

ユーザーのローカル確認後、以下の情報を提示してから PR 作成の明示的な許可を確認する。**ユーザーが「PR を作成してください」等の明示的な許可を与えるまで、ステップ3に進まない**:

変更サマリーの提示項目:

- 変更したファイル一覧（`git diff --name-only main` で取得）
- 変更内容の要約（3点以内の箇条書き）
- テスト結果の概要（Phase 9 品質検証結果・Phase 11 手動テスト結果）
- 影響範囲（既存機能への影響有無）

許可確認の文言例:

```
上記の変更内容で PR を作成してもよいでしょうか？
```

### ステップ3: `/ai:diff-to-pr` を実行する

ユーザーの明示的な許可を得た後、以下の内容で PR を作成する:

PR 本文に含める項目:

- **Summary**: 変更内容の概要（1-3点の箇条書き、70文字以内のタイトル）
  - RuntimeResolver を SkillExecutor / AgentExecutor / SkillCreatorService に拡張した
  - TerminalHandoffCard コンポーネントを新規実装した
  - authMode 分岐を useSkillExecution / useAgent Hook に追加した
- **Test Plan**: Phase 11 手動テスト結果を参照する
- **Screenshots**: TerminalHandoffCard の light / dark モードのスクリーンショットを添付する（`outputs/phase-11/screenshots/` から取得）
- **Related Issues**: `Closes #1218`

PR 作成後に `implementation-guide.md` の内容を PR コメントとして投稿する。

### ステップ4: 実行結果を確認する

1. PR が正常に作成されたことを確認する（URL を `outputs/phase-13/pr-info.md` に記録する）
2. CI が通過したことを確認する（`gh pr checks <PR番号>` で確認する）
3. CI が失敗した場合、失敗の原因を調査し修正する（`--no-verify` は使用禁止）

### ステップ5: タスクディレクトリを completed-tasks に移動する

```bash
# タスクワークフロー仕様書を completed-tasks に移動する
mv docs/30-workflows/runtime-routing-integration-closure/ docs/30-workflows/completed-tasks/runtime-routing-integration-closure/
```

移動後、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` の該当タスクを「完了」に更新する。

## PR 本文セクション連携ルール

| セクション  | 参照元                                        | 備考                                           |
| ----------- | --------------------------------------------- | ---------------------------------------------- |
| Summary     | `outputs/phase-12/documentation-changelog.md` | 変更内容の要約を3点以内に絞る                  |
| Test Plan   | `outputs/phase-11/manual-test-result.md`      | TC-01〜TC-09 の結果を簡潔に記載する            |
| Screenshots | `outputs/phase-11/screenshots/`               | TerminalHandoffCard の light / dark を添付する |
| PR コメント | `outputs/phase-12/implementation-guide.md`    | 全文を PR コメントとして投稿する               |

## 成果物

| 成果物  | パス                          | 内容                              |
| ------- | ----------------------------- | --------------------------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・PR番号・CI 結果を記録する |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼し、確認完了の返答を受けている
- [ ] 変更サマリーを提示し、ユーザーから明示的な PR 作成許可を得ている
- [ ] `/ai:diff-to-pr` を実行して PR が作成されている
- [ ] PR 本文に Summary・Test Plan・Screenshots（TerminalHandoffCard）が含まれている
- [ ] PR 本文に `Closes #1218` が含まれている
- [ ] `implementation-guide.md` の内容が PR コメントとして投稿されている
- [ ] CI が全て通過していることを確認している
- [ ] `outputs/phase-13/pr-info.md` に PR URL と CI 結果が記録されている
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の該当タスクが「完了」に更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

このタスクはこれで完了です。
