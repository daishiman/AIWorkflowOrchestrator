# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| Phase名    | PR作成                                |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 12（ドキュメント）              |
| 後続Phase  | なし（完了）                          |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

全成果物の最終確認を行い、ユーザーの許可を得てから PR を作成する。CI が全て PASS していることを確認して完了とする。

## 参照資料

- `phase-1-requirements.md` — 受入基準 AC-1〜AC-8
- `phase-12-documentation.md` — 成果物リスト
- `.claude/rules/07-git-and-tooling.md` — PR 作成ルール

## 実行手順

## 統合テスト連携

Phase 11 手動テスト結果・Phase 12 ドキュメント成果物・Phase 9 品質検証結果の全てが揃っていることを Task 1 で確認してから PR を作成する。CI が全チェック PASS であることを確認して完了とする。

## 実行タスク

### Task 1: 成果物最終確認

Phase 4〜12 の成果物が全て揃っていることをチェックする。

| Phase    | 成果物                                                                                                                                                                                     | 確認 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| Phase 4  | テストファイル（SkillCenterView, useSkillCenter, JourneyPanel）                                                                                                                            | -    |
| Phase 5  | 実装ファイル（SkillCenterView/index.tsx, useSkillCenter.ts, JourneyPanel/index.tsx）                                                                                                       | -    |
| Phase 6  | テスト拡充ファイル                                                                                                                                                                         | -    |
| Phase 7  | `outputs/phase-7/coverage-report.txt`                                                                                                                                                      | -    |
| Phase 8  | `outputs/phase-8/refactoring-summary.md`                                                                                                                                                   | -    |
| Phase 9  | `outputs/phase-9/qa-summary.md`                                                                                                                                                            | -    |
| Phase 10 | `outputs/phase-10/final-review-report.md`                                                                                                                                                  | -    |
| Phase 11 | スクリーンショット7件 + `manual-test-report.md`                                                                                                                                            | -    |
| Phase 12 | `implementation-guide.md`, `component-documentation.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`, `phase12-task-spec-compliance-check.md` | -    |

### Task 2: git status 確認

```bash
git status
git diff --stat
```

コミット対象ファイルが意図したファイルのみであることを確認する。

- 機密ファイル（`.env`, APIキー等）が含まれていないことを確認
- `outputs/` ディレクトリ内のファイルが `.gitignore` で除外されていない場合は意図的にコミットするか確認

### Task 3: PR 作成（ユーザー許可待ち）

> **重要**: PR 作成はユーザーの明示的な許可を得てから実行する。

ブランチ名規約: `feature/skillcenter-create-route-cta`

ユーザーの許可を得た後、`/ai:diff-to-pr` を実行する。

`/ai:diff-to-pr` が使えない場合のフォールバック:

```bash
git checkout -b feature/skillcenter-create-route-cta
git add <対象ファイル>
git commit -m "feat(skillcenter): SkillCenterViewヘッダーとJourneyPanelにCTAを追加"
git push -u origin feature/skillcenter-create-route-cta
```

### Task 4: CI 確認

PR 作成後、以下を確認する:

```bash
gh pr checks <PR番号>
```

確認項目:

- Lint が PASS
- TypeScript 型チェックが PASS
- 全ユニットテストが PASS
- E2E テスト（存在する場合）が PASS

CI が FAIL した場合: エラーログを確認し、Phase 5/8/9 で修正後に再プッシュする。

### Task 5: 完了記録

`outputs/phase-13/completion-report.md` に以下を記録する:

- PR URL
- CI ステータス
- 完了日時
- 残存する未タスクの一覧（task-workflow.md との整合確認）

## 成果物

| 成果物名 | パス                                    | 説明                              |
| -------- | --------------------------------------- | --------------------------------- |
| 完了記録 | `outputs/phase-13/completion-report.md` | PR URL・CI ステータス・完了日時等 |

## タスク完了処理

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-lifecycle-routing/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep skill-lifecycle-routing

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): skill-lifecycle-routingをcompleted-tasksに移動"
```

## 完了条件

- [ ] 全 Phase（4〜12）の成果物が揃っていることが確認されている
- [ ] git status で意図しないファイルが含まれていないことが確認されている
- [ ] **PR 作成はユーザーの明示的な許可を得てから実行している**
- [ ] PR タイトルが70文字以内である
- [ ] PR 本文に Summary（3箇条書き以上）と Test Plan が含まれている
- [ ] CI の全チェックが PASS している
- [ ] `outputs/phase-13/completion-report.md` が作成されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全タスクを100%実行完了**
