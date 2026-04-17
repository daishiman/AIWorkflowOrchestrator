# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 13                                          |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 12 完了 + ユーザーの明示承認          |
| 後続Phase  | -（完了）                                   |
| 作成日     | 2026-04-17                                  |
| ステータス | blocked / pending                           |

## 重要: user approval がない限り blocked

- ユーザーの明示承認がない限り PR 作成は行わない
- ローカル確認を省略しない
- commit / PR を自動で作らない

## 目的

変更内容をローカルで最終確認し、変更サマリーを提示してユーザーの承認を得た後にのみ PR 作成へ進む。

## 実行タスク

1. ローカル動作確認を依頼する
2. 変更サマリーを提示して PR 作成許可を確認する
3. 許可後に PR 作成を実施する
4. CI が通過していることを確認する

## 参照資料

| 資料名           | パス                                                     | 説明           |
| ---------------- | -------------------------------------------------------- | -------------- |
| 最終レビュー     | `outputs/phase-10/final-review-result.md`                | Phase 10成果物 |
| 手動テスト       | `outputs/phase-11/manual-test-result.md`                 | Phase 11成果物 |
| ドキュメント     | `outputs/phase-12/documentation-changelog.md`            | Phase 12成果物 |
| 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12成果物 |
| コンプライアンス | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実施しないこと。

### 3. PR 作成準備

許可後にのみ PR 作成へ進む。`/ai:diff-to-pr` を実行する前に、以下を確認する。

**実施前の確認対象**:

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

PR 作成時は `/ai:diff-to-pr` を使い、ユーザー承認前に commit / PR を進めない。

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること

### 5. フォールバック（必要時）

必要に応じて GitHub app / CLI を使って手動対応する。

## 成果物

| 成果物           | パス                                     | 説明               |
| ---------------- | ---------------------------------------- | ------------------ |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL等           |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 実施した確認の要約 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR説明の下書き     |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md` | PR 作成後の記録    |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] PR 作成準備の記録が残っている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが completed-tasks に移動されている

## タスク100%実行確認【必須】

- [ ] ローカル確認結果が出力されている
- [ ] 変更サマリーが出力されている
- [ ] PR情報が出力されている
- [ ] PR作成結果が出力されている
- [ ] Phase 12 の成果物参照が正しい

## タスク全体完了

Phase 13 の完了後、本タスク（UT-9I-001）は完了。

- UT-9I-001 ステータスを「完了」に更新する
- `task-workflow.md` の残課題テーブルからエントリを削除する
- Phase 12 の `unassigned-task-detection.md` に記録された未タスクを後続タスクとして登録する
