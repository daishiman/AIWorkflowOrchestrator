# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 13                                                           |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 12                                                     |
| 後続Phase  | 完了                                                         |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

**重要**: PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼する
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認する
- PR 作成: ユーザーの許可後に `/ai:diff-to-pr` を実行する
- CI 確認: CI が通過したことを確認する

## 参照資料

| 資料名                | パス                                                                             | 説明            |
| --------------------- | -------------------------------------------------------------------------------- | --------------- |
| 最終レビュー          | `outputs/phase-10/final-review-result.md`                                        | Phase 10 成果物 |
| 手動テスト            | `outputs/phase-11/manual-test-result.md`                                         | Phase 11 成果物 |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`                                       | Phase 12 成果物 |
| 更新履歴              | `outputs/phase-12/documentation-changelog.md`                                    | Phase 12 成果物 |
| 準拠チェック          | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | Phase 12 成果物 |
| Phase 13 テンプレート | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | PR 作成ルール   |

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                                              |
| ------------ | --------------------------------------------------------------------- |
| 承認条件     | ユーザーの明示的な許可がない限り PR / commit を実行しない             |
| ローカル確認 | `vitest` と `typecheck` の結果が `local-check-result.md` に記録される |
| 変更要約     | 変更ファイル・PR タイトル候補・関連 Issue が整合している              |
| 進行制御     | `change-summary.md` を提示した後にのみ PR 作成フェーズへ進む          |
| 最終証跡     | `pr-creation-result.md` と `pr-info.md` が PR URL / CI 状況と一致する |

## サブタスク管理

- Lane A: ローカル確認依頼と結果記録を行う
- Lane B: 変更サマリーと許可確認を行う
- Lane C: 許可後に PR 作成と CI 確認を行う
- Lane D: PR 後の completed-tasks 移動と最終記録を行う
- A/B は並列、C/D はユーザー許可と CI の後に直列

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認内容:

- `pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` が全件 PASS
- `pnpm --filter @repo/desktop typecheck` が PASS

### 2. 変更サマリーの提示と許可確認【必須】

| 変更項目        | 内容                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| 変更ファイル    | `SkillCreatorWorkflowEngine.ts`（`createVerificationReviewRequest()` の kind 変更） |
| テスト変更      | `SkillCreatorWorkflowEngine.test.ts`（textValue → selectedOptionId + 新規 TC 追加） |
| 関連 Issue      | #1693                                                                               |
| PR タイトル候補 | `fix(runtime): verification_review request を single_select kind に変更`            |

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後のみ実行する。

```
/ai:diff-to-pr
```

### 4. タスクディレクトリの移動

PR が作成され CI が通過した後、タスクディレクトリを completed-tasks に移動する。

```bash
mv docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select/ \
   docs/30-workflows/completed-tasks/

git add docs/30-workflows/
git commit -m "docs(workflows): TASK-SDK-04-U1-F1 を completed-tasks に移動"
```

## 成果物

| 成果物           | パス                                     | 説明                          |
| ---------------- | ---------------------------------------- | ----------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 自動確認結果と typecheck 結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 許可前に提示する変更要約   |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md` | PR 作成・CI 確認の結果        |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL 等                     |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼した
- [ ] `local-check-result.md` を作成した
- [ ] 変更サマリーを提示し PR 作成の許可を得た
- [ ] `change-summary.md` を作成した
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] `pr-creation-result.md` を作成した
- [ ] CI が通過している
- [ ] `pr-info.md` を作成した
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] 本Phase内の全作業を100%完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 13
```

## 次のPhase

完了
