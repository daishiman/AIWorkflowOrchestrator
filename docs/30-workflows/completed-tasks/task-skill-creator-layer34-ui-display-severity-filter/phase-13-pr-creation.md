# Phase 13: PR作成 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 13                                                    |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 12                                              |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### タスク1: ローカル動作確認依頼

**目的**: ユーザーにローカルでの動作確認を依頼する。

**手順**:

1. 変更サマリーを提示する
2. ユーザーにローカル環境での動作確認を依頼する

### タスク2: 変更サマリー提示と許可確認

**目的**: PR作成の許可をユーザーから得る。

**変更サマリー項目**:

- 変更ファイル一覧
- テスト結果サマリー（TC数、PASS/FAIL）
- カバレッジサマリー
- スクリーンショット（Phase 11）
- Phase 11補助成果物（manual-test-checklist）
- Phase 12 root evidence（phase12-task-spec-compliance-check）

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### タスク3: PR作成

**目的**: ユーザーの許可後に `/ai:diff-to-pr` を実行する。

**PR本文セクション連携ルール**:

- Phase 11/12 成果物パスは `docs/30-workflows/task-skill-creator-layer34-ui-display-severity-filter/` 配下のみ参照
- PR本文 `## その他` に Phase 12 実装ガイド反映元パスと要点を記載
- PR本文 `## その他` に `phase12-task-spec-compliance-check.md` の要点を記載
- `implementation-guide.md` の全文を PRコメントとして投稿
- UI/UX変更のため `## スクリーンショット` に画像リンクを挿入

### タスク4: CI確認

**目的**: CIが通過したことを確認する。

## 参照資料

| 資料名             | パス                                                     | 説明                 |
| ------------------ | -------------------------------------------------------- | -------------------- |
| Phase 10成果物     | `outputs/phase-10/final-review-result.md`                | 最終レビュー         |
| Phase 11補助成果物 | `outputs/phase-11/manual-test-checklist.md`              | 手動テスト前提条件   |
| Phase 11成果物     | `outputs/phase-11/manual-test-result.md`                 | 手動テスト結果       |
| Phase 12成果物     | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴 |
| Phase 12準拠確認   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence        |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全作業を100%完了**

## タスク完了処理【必須】

PRが作成され、CIが通過した後:

```bash
mv docs/30-workflows/task-skill-creator-layer34-ui-display-severity-filter/ docs/30-workflows/completed-tasks/
```
