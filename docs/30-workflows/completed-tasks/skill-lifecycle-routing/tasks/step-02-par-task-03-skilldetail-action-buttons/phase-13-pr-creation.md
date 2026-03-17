# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 13                                      |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 12 成果物（`outputs/phase-12/`）  |

## 目的

Phase 1〜12 の全成果物を最終確認し、Pull Request を作成してレビュー依頼を行う。

> **重要**: PR 作成はユーザーの許可を得てから実施する。本フェーズは許可取得前の準備作業のみ自動実行する。

## 参照資料

- Git & ツーリングルール: `.claude/rules/07-git-and-tooling.md`
- Phase 12 成果物: `outputs/phase-12/`

## 実行タスク

- タスク 1: 事前確認チェックリストを完了し、品質ゲート結果を固定する
- タスク 2: PR タイトル・本文・テスト計画を最終化する
- タスク 3: ユーザー許可取得後のみ `gh pr create` を実行する
- タスク 4: PR URL と最終チェックリストを成果物に記録する

## 事前確認チェックリスト

### コミット前チェック

- [ ] `pnpm lint` がエラーゼロで通過している
- [ ] `pnpm typecheck` がエラーゼロで通過している
- [ ] 関連テストが全件 PASS している
- [ ] `--no-verify` を使用していない

### 成果物確認

- [ ] Phase 7: カバレッジ基準を充足している
- [ ] Phase 8: リファクタリングが完了している
- [ ] Phase 9: Lint・型チェック・テストが全て PASS している
- [ ] Phase 10: 最終レビューが PASS / MINOR 判定である
- [ ] Phase 11: 手動テストシナリオ 1〜6 が全て確認済みである
- [ ] Phase 12: 5つの必須タスクが全て完了している

## PR 準備

### ブランチ名

```
feature/skilldetail-action-buttons
```

### PR タイトル（70文字以内）

```
feat(skilldetail): SkillDetailPanel にアクションボタン追加
```

### PR 本文テンプレート

```markdown
## Summary

- `SkillDetailPanel` に「エディタで開く」「分析する」ボタンを追加
- `isImported === true` のスキルのみボタンを表示する条件分岐を実装
- `useSkillCenter` に `handleEditSkill` / `handleAnalyzeSkill` を追加

## Test Plan

- [ ] TC-01: isImported=true 時にボタンが表示される
- [ ] TC-02: isImported=false 時にボタンが非表示になる
- [ ] TC-03: 「エディタで開く」クリックで handleEditSkill が呼ばれる
- [ ] TC-04: 「分析する」クリックで handleAnalyzeSkill が呼ばれる
- [ ] TC-05: isImported=undefined 時に安全に処理される
- [ ] TC-06: handleEditSkill が正しいルート遷移を実行する
- [ ] TC-07: handleAnalyzeSkill が正しいルート遷移を実行する
- [ ] TC-08: aria-label・キーボード操作のアクセシビリティ要件を充足する
```

## PR 作成コマンド（ユーザー許可後に実行）

```bash
gh pr create \
  --title "feat(skilldetail): SkillDetailPanel にアクションボタン追加" \
  --body "$(cat <<'EOF'
## Summary

- `SkillDetailPanel` に「エディタで開く」「分析する」ボタンを追加
- `isImported === true` のスキルのみボタンを表示する条件分岐を実装
- `useSkillCenter` に `handleEditSkill` / `handleAnalyzeSkill` を追加

## Test Plan

- [ ] TC-01: isImported=true 時にボタンが表示される
- [ ] TC-02: isImported=false 時にボタンが非表示になる
- [ ] TC-03: 「エディタで開く」クリックで handleEditSkill が呼ばれる
- [ ] TC-04: 「分析する」クリックで handleAnalyzeSkill が呼ばれる
- [ ] TC-05: isImported=undefined 時に安全に処理される
- [ ] TC-06: handleEditSkill が正しいルート遷移を実行する
- [ ] TC-07: handleAnalyzeSkill が正しいルート遷移を実行する
- [ ] TC-08: aria-label・キーボード操作のアクセシビリティ要件を充足する
EOF
)"
```

## 禁止事項

- `git push --force` を main/master に実行しない
- `git commit --no-verify` を使用しない
- main ブランチに直接 push しない

## 成果物

| ファイル                              | 内容                        |
| ------------------------------------- | --------------------------- |
| `outputs/phase-13/pr-url.txt`         | 作成した PR の URL          |
| `outputs/phase-13/final-checklist.md` | 全 Phase の完了確認チェック |

## 完了条件

- [ ] ユーザーから PR 作成の許可を得ている
- [ ] 事前確認チェックリストが全て完了している
- [ ] ブランチ名が `feature/skilldetail-action-buttons` である
- [ ] PR タイトルが 70 文字以内である
- [ ] PR 本文に Summary（3箇条）と Test Plan（TC-01〜TC-08）が含まれている
- [ ] `gh pr create` コマンドが正常終了している
- [ ] `outputs/phase-13/pr-url.txt` に PR URL が記録されている

**本Phase内の全タスクを100%実行完了** して TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 を完了とする。
