# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 9                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

Phase 8 の正規化結果に対して、最終的な品質保証を行う。validator と grep の実測値を記録し、完了条件を機械検証可能な形で確定する。

## 実行タスク

- 全検証コマンドを実行し、実測値を記録する
- validator 実行記録を outputs に保存する
- 受入基準 AC-1〜AC-10 の達成状況を最終確認する
- QA サマリーを作成する

### validator replay

| 検証対象                                   | コマンド                                                                                                                                                                                                                      | pass 条件                   | 記録先                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------- |
| `task-specification-creator` 構造          | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                                                                                       | error 0                     | `outputs/phase-9/qa-summary.md` |
| `task-specification-creator` 全体          | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                                                                                         | error 0                     | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` 構造             | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                                                                                          | error 0                     | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` 全体             | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`                                                                                                                            | error 0                     | `outputs/phase-9/qa-summary.md` |
| workflow 構造                              | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync --json`                                             | error 0                     | `outputs/phase-9/qa-summary.md` |
| workflow phase 出力                        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync`                                                          | error 0                     | `outputs/phase-9/qa-summary.md` |
| implementation guide                       | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync`                               | Part 1 / Part 2 全項目 PASS | `outputs/phase-9/qa-summary.md` |
| `task-specification-creator` mirror parity | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                                | diff 0                      | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` mirror parity    | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                                      | diff 0                      | `outputs/phase-9/qa-summary.md` |
| unassigned link integrity                  | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync/outputs/phase-12/unassigned-task-detection.md` | missing 0 / ALL_LINKS_EXIST | `outputs/phase-9/qa-summary.md` |
| unassigned audit                           | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                    | currentViolations=0         | `outputs/phase-9/qa-summary.md` |

## QA チェックリスト

### grep 検証（0 件であることを確認）

```bash
# 旧 path パターンの残存確認
rg "skill-creator-agent-sdk-lane.*step-03" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/

# 未完了表現の残存確認
rg "更新予定|後でやる|後続判断待ち|仕様策定のみ|実行予定|保留として記録" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/

# future / 予定表現の残存確認（SDK-02 対象ファイル）
rg "future|将来的には|実装予定" .claude/skills/aiworkflow-requirements/references/architecture-overview-core.md
```

### コード変更なし確認

```bash
# docs 以外のファイルが変更されていないことを確認
git diff --name-only | grep -v "^\.claude\|^docs"
```

### リンク有効性確認

- `resource-map.md`、`quick-reference.md`、`topic-map.md` の修正後リンクが実在するパスを指していることを目視確認する

## 参照資料

| 資料名              | パス                                     | 説明               |
| ------------------- | ---------------------------------------- | ------------------ |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`         | 検証コマンドの定義 |
| Phase 7 カバレッジ  | `outputs/phase-7/coverage-summary.md`    | AC 達成状況        |
| Phase 8 正規化結果  | `outputs/phase-8/refactoring-summary.md` | 正規化後の状態     |

## 成果物

| 成果物     | パス                            | 説明                       |
| ---------- | ------------------------------- | -------------------------- |
| QA 書      | `phase-9-quality-assurance.md`  | QA 観点と実測値の定義      |
| QA summary | `outputs/phase-9/qa-summary.md` | 実測値と AC 達成確認の記録 |

## 完了条件

- [ ] 全 grep 検証コマンドの実測値が 0 件であることが記録されている
- [ ] AC-1〜AC-10 の達成状況が最終確認されている
- [ ] コード変更なし（docs-only）が再確認されている
- [ ] Phase 10（最終レビュー）へ渡せる QA サマリーが揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. grep 検証コマンドの実行と結果記録
3. コード変更なし確認
4. AC-1〜AC-10 最終確認
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 10 で再利用する QA 結果が固定されている
