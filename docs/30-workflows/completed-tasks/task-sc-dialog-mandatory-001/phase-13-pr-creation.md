# Phase 13: PR 作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 13                           |
| 機能名 | task-sc-dialog-mandatory-001 |
| 作成日 | 2026-04-01                   |

## 目的

Phase 1〜12 の全成果物をまとめ、GitHub PR を作成する。
**ユーザー承認が得られるまで、commit / PR 作成 / push は実行禁止。**

## 実行タスク

- PR 情報の確認（タイトル・ブランチ・ラベル）
- PR ボディの確認（Summary・変更ファイル・テスト方法・未タスクリンク）
- ユーザー承認を得る
- git add → git commit → git push → gh pr create の順に実行

## 参照資料

| 資料名          | パス                                            | 説明                          |
| --------------- | ----------------------------------------------- | ----------------------------- |
| Phase 12 成果物 | `outputs/phase-12/documentation-changelog.md`   | 変更ファイル一覧              |
| Phase 11 成果物 | `outputs/phase-11/manual-test-result.md`        | テスト結果（PR ボディに記載） |
| Phase 12 成果物 | `outputs/phase-12/unassigned-task-detection.md` | 未タスクリンク情報            |

## PR 情報

| 項目           | 値                                                                               |
| -------------- | -------------------------------------------------------------------------------- |
| PR タイトル    | `feat(skill-creator): 対話強制 — AskUserQuestion を最初のアクションとして必須化` |
| ブランチ名     | `feat/task-sc-dialog-mandatory-001`                                              |
| ベースブランチ | `main`                                                                           |
| ラベル         | `skill-update`, `docs-only`, `priority:high`                                     |

## PR ボディの構成

### Summary

- **問題**: `/skill-creator` 呼び出し時に対話なしでスキル生成が始まってしまう
- **変更内容**: SKILL.md / discover-problem.md / interview-user.md の 3 ファイルに対話強制の記述を追加
- **受入基準**: AC-001〜AC-006 の全項目を満たす（Phase 11 手動テストで全 PASS 確認済み）

### 変更ファイル一覧

| ファイル                                                  | 変更種別 | 変更内容                                                 |
| --------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `.claude/skills/skill-creator/SKILL.md`                   | 追加     | `## 必須：最初の実行ステップ` ブロック追加               |
| `.claude/skills/skill-creator/agents/discover-problem.md` | 追加     | 実行ゲートブロック追加                                   |
| `.claude/skills/skill-creator/agents/interview-user.md`   | 変更     | `problem-definition.json` 欠損時のフォールバック処理変更 |

### テスト方法（手動ウォークスルー TC-001〜TC-010）

Phase 11 の手動テスト手順に従い、以下を確認する。

1. TC-001: `/skill-creator` を最小入力で呼び出し → AskUserQuestion が最初に来ることを確認
2. TC-002: 詳細な要件を書いて呼び出し → 確認質問が来ることを確認
3. TC-003: 深度回答後の discover-problem.md 読み込みタイミング確認
4. TC-004: `problem-definition.json` 不在状態でのフォールバック確認
5. TC-005〜TC-010: collaborative フロー全体・エッジケースの確認

### 未タスクへのリンク

今回の変更から派生する未タスク（低優先度）を検出済み。

- UNASSIGNED-001: 自動化スクリプト対応（`--skip-dialog` フラグ追加）
  - 詳細: `outputs/phase-12/unassigned-task-detection.md` を参照

## 実行手順

### ステップ1: ユーザー承認を得る（Phase 12 完了後）

**重要: 以下のステップはユーザーの明示的な承認があるまで実行禁止。**

### ステップ2: ブランチの確認・作成

```bash
# 現在のブランチを確認
git branch

# feat/task-sc-dialog-mandatory-001 ブランチを作成（未作成の場合）
git checkout -b feat/task-sc-dialog-mandatory-001
```

### ステップ3: 変更ファイルのステージング

```bash
# 3 ファイルのみをステージング
git add .claude/skills/skill-creator/SKILL.md
git add .claude/skills/skill-creator/agents/discover-problem.md
git add .claude/skills/skill-creator/agents/interview-user.md
```

### ステップ4: コミット

```bash
git commit -m "feat(skill-creator): 対話強制 — AskUserQuestion を最初のアクションとして必須化

- SKILL.md に '## 必須：最初の実行ステップ' ブロックを追加
- discover-problem.md に実行ゲートブロックを追加（Phase 0-0-1 質問の強制実行）
- interview-user.md の problem-definition.json フォールバック処理を変更

受入基準 AC-001〜AC-006 を全て満たす（Phase 11 手動テスト全 PASS 確認済み）
関連タスク: TASK-SC-DIALOG-MANDATORY-001"
```

### ステップ5: リモートへプッシュ

```bash
git push -u origin feat/task-sc-dialog-mandatory-001
```

### ステップ6: PR 作成

```bash
gh pr create \
  --title "feat(skill-creator): 対話強制 — AskUserQuestion を最初のアクションとして必須化" \
  --body "..." \
  --base main \
  --label "skill-update,docs-only,priority:high"
```

## 制約事項

| 制約             | 内容                                                           |
| ---------------- | -------------------------------------------------------------- |
| 承認前の実行禁止 | commit / PR 作成 / push はユーザーの明示的な承認があるまで禁止 |
| ステージング対象 | 3 ファイルのみ（コードファイルを誤ってステージングしないこと） |
| --no-verify 禁止 | git commit に `--no-verify` オプションを使用しないこと         |
| force push 禁止  | `git push --force` を使用しないこと                            |

## 統合テスト連携

コード変更なし。PR 作成後、CI は docs ファイルのみの変更を検出し、テストはスキップまたは pass。

## 多角的チェック観点

| 観点     | 判断     | 確認内容                                                                   |
| -------- | -------- | -------------------------------------------------------------------------- |
| 正確性   | **必須** | ステージングが 3 ファイルのみであることを git status で確認                |
| 完全性   | **必須** | PR ボディに Summary / 変更ファイル / テスト方法 / 未タスクが含まれているか |
| 承認制御 | **必須** | ユーザー承認なしに commit / push / PR 作成を実行していないか               |

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] `feat/task-sc-dialog-mandatory-001` ブランチに 3 ファイルのみがステージングされていることを確認した
- [ ] コミットが作成された
- [ ] リモートにプッシュされた
- [ ] PR が作成され、URL が記録されている

## 成果物

| 成果物    | 配置先                        |
| --------- | ----------------------------- |
| GitHub PR | `outputs/phase-13/pr-url.txt` |
