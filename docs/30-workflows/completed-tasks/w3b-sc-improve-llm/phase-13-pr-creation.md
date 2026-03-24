# Phase 13: PR 作成

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 13                     |
| 機能名   | w3b-sc-improve-llm     |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

TASK-SC-05-IMPROVE-LLM の成果物を PR としてまとめ、ユーザー承認後にリポジトリに提出する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

1. 成果物の最終確認
   - 全 Phase の完了条件チェックリストが完了していることを確認
   - `git diff --stat` で変更ファイル一覧を確認
2. コミットの整理（意味のある単位で分かれていない場合に実施する）
   - 意味のある単位でコミットが分かれていることを確認
3. PR タイトルと本文の作成
   - タイトル: 70文字以内
   - Summary: 以下の変更点を1-3箇条書きで含める
     - `RuntimeSkillCreatorFacade.improve()` に LLM 統合を実装し、`section/before/after/reason` を持つ構造化された改善提案（`RuntimeSkillCreatorImproveSuggestion[]`）を返せるようにした
     - `RuntimeSkillCreatorImproveSuggestion` 型を新規追加し、`RuntimeSkillCreatorImproveResult.suggestions` の型を `string[]` から `RuntimeSkillCreatorImproveSuggestion[]` に変更した
     - `RuntimeSkillCreatorFacadeDeps` に `skillFileManager: SkillFileManager` を DI 追加し、SKILL.md の読み取りと反映を可能にした
     - `improvePromptConstants.ts`（`IMPROVE_PROMPT_CONSTANTS` + `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION`）を新規作成した
     - `parseImproveResponse()` / `mapToSuggestion()` / `buildImproveUserPrompt()` / `isValidImproveResponse()` の各ヘルパー関数を実装した
   - Test Plan: 動作確認方法のチェックリスト
4. ユーザーに PR 作成の承認を求める
5. 承認後に PR を作成

## 参照資料

| 資料名           | パス                                          | 説明                           |
| ---------------- | --------------------------------------------- | ------------------------------ |
| 最終レビュー     | `outputs/phase-10/final-review-result.md`     | Phase 10成果物                 |
| 手動テスト       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物                 |
| ドキュメント     | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物                 |
| PR作成ルール     | `.claude/rules/07-git-and-tooling.md`         | ブランチ名・タイトル・本文規約 |
| プロジェクト設定 | `CLAUDE.md`                                   | `--no-verify` 禁止             |

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

**`/ai:diff-to-pr` の使用手順**:

1. ステージされた差分から `TARGET_WORKFLOW_DIR` を1件特定する
2. PR本文を `.github/pull_request_template.md` 準拠で生成する
3. PRコメント1: 実装の詳細・レビュー注意点・テスト方法・参考資料
4. PRコメント2（Phase 12成果物あり時）: implementation-guide.md の全文
5. PRコメント3（Phase 11スクリーンショットあり時）: スクリーンショットギャラリー

**PR本文セクション連携ルール（必須）**:

- PR本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を必ず記載する
- `implementation-guide.md` の全文を PRコメントとして必ず投稿する
- PR本文/PRコメントで画像を埋め込む場合は `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLを使う（相対パス直貼りは禁止）

**`/ai:diff-to-pr` が使えない場合の手動コマンド**:

```bash
gh pr create --title "feat(skill-creator): improve() LLM統合・構造化改善提案生成" \
  --body "..."
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（`/ai:diff-to-pr` が使えない場合）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# 変更をステージ
git add -A

# コミット
git commit -m "feat(skill-creator): improve() LLM統合・構造化改善提案生成"

# プッシュ
git push origin HEAD

# PR作成
gh pr create --title "feat(skill-creator): improve() LLM統合・構造化改善提案生成" \
  --body "## Summary
- RuntimeSkillCreatorFacade.improve()にLLM統合を実装
- RuntimeSkillCreatorImproveSuggestion型を新規追加
- improvePromptConstants.ts、ヘルパー関数群を実装

## Test Plan
- [ ] pnpm test が全てPASS
- [ ] pnpm typecheck がエラーなし
- [ ] pnpm lint がエラーなし"
```

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点         | 適用判断               | 確認内容                               |
| ------------ | ---------------------- | -------------------------------------- |
| コミット品質 | 全PR                   | 意味のある単位でコミットが分かれている |
| タイトル規約 | 全PR                   | 70文字以内                             |
| 本文規約     | 全PR                   | Summary + Test Plan が含まれている     |
| CI通過       | 全PR                   | lint / typecheck / test が全てPASS     |
| セキュリティ | `--no-verify` 使用禁止 | CLAUDE.md の絶対ルール                 |

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
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/w3b-sc-improve-llm/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep w3b-sc-improve-llm

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): w3b-sc-improve-llmをcompleted-tasksに移動"
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 成果物の最終確認（全Phase完了条件チェック）
2. ユーザーへのローカル動作確認依頼
3. 変更サマリー提示と許可確認
4. PR作成（`/ai:diff-to-pr` または手動）
5. CI通過確認
6. タスクディレクトリの移動

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w3b-sc-improve-llm --phase 13
```

## 次のPhase

完了
