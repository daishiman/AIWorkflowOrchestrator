# Phase 13: 完了・PR 作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| 機能名   | w3a-sc-output-persistence     |
| Phase    | 13                            |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

成果物の最終確認を行い、ユーザーの承認を得たうえで PR を作成する。

## 実行タスク

1. **成果物最終確認**
   - Phase 1-12 の全成果物が揃っていることを確認する
   - 変更ファイル一覧を `git diff --stat` で確認する
   - 以下のファイルが成果物に含まれていることを確認する:
     - `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（新規作成）
     - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（execute() 改修）
     - `packages/shared/src/types/skillCreator.ts`（SkillGeneratedContent 型追加）
     - `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts`（テスト）
2. **コミット前チェックリスト実行**
   - [ ] `pnpm lint` が通ること
   - [ ] `pnpm typecheck` が通ること
   - [ ] 関連テストが全て PASS すること
   - [ ] `--no-verify` を使っていないこと
3. **ユーザー承認待機**
   - PR 作成前にユーザーの承認を待つ
   - 承認なしに PR を作成しない
4. **PR 作成（ユーザー承認後のみ）**
   - ブランチ名: `feature/TASK-SC-04-output-persistence` または指定されたブランチ名
   - PR タイトル: 70文字以内
   - PR 本文: Summary（1-3箇条書き）+ Test Plan を含める
   - `gh pr create` で PR を作成する

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-12-documentation.md`
- `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## PR 内容テンプレート

```
## Summary
- SkillFileWriter を新規作成し、LLM 生成スキルコンテンツを .claude/skills/{skillName}/ 配下に永続化する（AC-2 対応）
- アトミック書き込み（失敗時ロールバック）とパストラバーサル防止（path.resolve + basePath プレフィックス確認）を実装した
- RuntimeSkillCreatorFacade.execute() にファイル永続化フローを統合した

## Test Plan
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS することを確認
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了することを確認
- [ ] execute() 実行後に .claude/skills/{skillName}/ 配下にファイルが生成されることを確認
- [ ] 同名スキルの上書き防止が動作することを確認
- [ ] パストラバーサル防止（../malicious 等）が動作することを確認
```

## 完了条件

- [ ] Phase 1-12 の全成果物が揃っていることを確認した
- [ ] SkillFileWriter.ts / RuntimeSkillCreatorFacade.ts / skillCreator.ts の変更が含まれていることを確認した
- [ ] コミット前チェックリスト（lint / typecheck / test）を全て実行した
- [ ] ユーザーの承認を得た
- [ ] PR を作成した（ユーザー承認後のみ）

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/w3a-sc-output-persistence/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep w3a-sc-output-persistence

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): w3a-sc-output-persistenceをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（タスク TASK-SC-04-OUTPUT-PERSISTENCE 完了）
