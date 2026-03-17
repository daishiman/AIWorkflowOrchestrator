# Phase 13: 完了

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001         |
| 機能名   | skillcenter-create-route                      |
| Phase    | 13                                            |
| 作成日   | 2026-03-17                                    |
| 依存     | Phase 12（ドキュメント 全 Task 完了）の成果物 |

## 目的

全成果物の最終確認を行い、ユーザーの許可を得てから PR を作成する。CI が全て PASS していることを確認して完了とする。

## 参照資料

- `phase-1-requirements.md` — 受入基準 AC-1〜AC-7
- `phase-12-documentation.md` — 成果物リスト
- `.claude/rules/07-git-and-tooling.md` — PR 作成ルール

## 実行タスク

### Task 1: 成果物最終確認

Phase 4〜12 の成果物が全て揃っていることをチェックする。

| Phase    | 成果物                                                                                                                                         | 確認 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Phase 4  | テストファイル（SkillCenterView, useSkillCenter, JourneyPanel）                                                                                | -    |
| Phase 5  | 実装ファイル（SkillCenterView/index.tsx, useSkillCenter.ts, JourneyPanel/index.tsx）                                                           | -    |
| Phase 6  | テスト拡充ファイル                                                                                                                             | -    |
| Phase 7  | `outputs/phase-7/coverage-report.txt`                                                                                                          | -    |
| Phase 8  | `outputs/phase-8/refactoring-summary.md`                                                                                                       | -    |
| Phase 9  | `outputs/phase-9/qa-summary.md`                                                                                                                | -    |
| Phase 10 | `outputs/phase-10/final-review-report.md`                                                                                                      | -    |
| Phase 11 | スクリーンショット7件 + `manual-test-report.md`                                                                                                | -    |
| Phase 12 | `implementation-guide.md`, `component-documentation.md`, `documentation-changelog.md`, `unassigned-task-report.md`, `skill-feedback-report.md` | -    |

### Task 2: git status 確認

```bash
git status
git diff --stat
```

コミット対象ファイルが意図したファイルのみであることを確認する。

- 機密ファイル（`.env`, APIキー等）が含まれていないことを確認
- `outputs/` ディレクトリ内のファイルが `.gitignore` で除外されていない場合は意図的にコミットするか確認

### Task 3: PR 作成（ユーザー許可待ち）

> **重要**: PR 作成はユーザーの明示的な許可を得てから実行する。以下はユーザー許可後の手順。

ブランチ名規約: `feature/skillcenter-create-route-cta`

```bash
git checkout -b feature/skillcenter-create-route-cta
git add <対象ファイル>
git commit -m "feat(skillcenter): SkillCenterViewヘッダーとJourneyPanelにCTAを追加"
git push -u origin feature/skillcenter-create-route-cta
```

PR 作成:

```bash
gh pr create \
  --title "feat(skillcenter): SkillCenter作成ルートCTA追加（AC-1〜AC-7）" \
  --body "$(cat <<'EOF'
## Summary
- SkillCenterView ヘッダーに「+ 新しいツールを作る」CTA を追加（AC-1, AC-2）
- JourneyPanel ステップカードに CTA ボタンを追加（AC-3, AC-4）
- useSkillCenter フックに3つのナビゲーションアクションを追加（AC-5）
- Apple HIG systemBlue・8pxグリッド準拠（AC-6, AC-7）

## Test plan
- [ ] ユニットテスト全 PASS（SkillCenterView, useSkillCenter, JourneyPanel）
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] Lint・型チェック 0 エラー
- [ ] 手動テスト：ヘッダー CTA 表示・クリック遷移 PASS
- [ ] 手動テスト：JourneyPanel CTA 表示・クリック遷移 PASS
- [ ] 手動テスト：ライト/ダークモード表示 PASS
EOF
)"
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

- `outputs/phase-13/completion-report.md` — 完了記録

## 完了条件

- [ ] 全 Phase（4〜12）の成果物が揃っていることが確認されている
- [ ] git status で意図しないファイルが含まれていないことが確認されている
- [ ] **PR 作成はユーザーの明示的な許可を得てから実行している**
- [ ] PR タイトルが70文字以内である
- [ ] PR 本文に Summary（3箇条書き以上）と Test Plan が含まれている
- [ ] CI の全チェックが PASS している
- [ ] `outputs/phase-13/completion-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**
