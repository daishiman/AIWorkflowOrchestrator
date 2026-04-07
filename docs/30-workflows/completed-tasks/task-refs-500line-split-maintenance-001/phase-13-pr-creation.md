# Phase 13: PR作成

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR作成                         |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 12                       |
| 次Phase    | -（最終Phase）                 |
| ステータス | blocked                        |
| 作成日     | 2026-04-07                     |

## 重要

**git commit / PR 作成はユーザーの明示的な許可を得てから実行すること。**

## 目的

ユーザー承認が得られた場合に、Phase 12 までの成果物を git コミットし、PR を作成する。

ユーザー承認が得られていない場合は、Phase 13 を `blocked` のまま維持し、
`outputs/phase-13/pr-creation-record.md` に「blocked 理由」と「承認後に実行するコマンド」を記録して終了する。

## 実行タスク

### Task 0: user approval の確認（必須）

- [ ] ユーザーの明示的な許可がある
  - Yes: Task 1 へ進む
  - No: `outputs/phase-13/pr-creation-record.md` を `blocked` として更新して終了（commit/PR は実行しない）

### Task 1: 最終確認

```bash
git status
git diff --stat
```

### Task 2: コミット（承認後のみ実行）

```bash
git add docs/30-workflows/task-refs-500line-split-maintenance-001/
git add .claude/skills/aiworkflow-requirements/references/
git add .claude/skills/task-specification-creator/references/
git add .claude/skills/aiworkflow-requirements/SKILL.md
git add .claude/skills/task-specification-creator/SKILL.md
git add .agents/skills/aiworkflow-requirements/
git add .agents/skills/task-specification-creator/

git commit -m "chore(refs): TASK-REFS-500LINE-SPLIT-001 References 500行超ファイル分離メンテナンス

- .claude/skills/aiworkflow-requirements/references/ 内 19 件を 500 行未満に分離
- .claude/skills/task-specification-creator/references/ 内 5 件を 500 行未満に分離
- 両スキルの SKILL.md リソース導線・LOGS.md を更新
- .agents/skills/ mirror を同期

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 3: PR 作成（承認後のみ実行）

```bash
gh pr create \
  --title "chore(refs): References 500行超ファイル分離メンテナンス [TASK-REFS-500LINE-SPLIT-001]" \
  --body "$(cat <<'EOF'
## Summary
- `.claude/skills/` 配下の References ファイルで 500 行超のもの（24 件）を全て分離
- Progressive Disclosure の実現と AI コンテキスト効率の改善
- docs のみの変更（コードファイルへの変更ゼロ）

## Test plan
- [x] TC-01: 500 行超ファイルが 0 件であることを確認
- [x] TC-02/03: generate-index.js が正常終了
- [x] TC-04: .claude と .agents の mirror が同期
- [x] TC-05: 内部リンクが全て解決できる
- [x] TC-06: コードファイルへの変更がゼロ

EOF
)"
```

## 成果物

| 成果物      | パス                                     | 説明   |
| ----------- | ---------------------------------------- | ------ |
| PR 作成記録 | `outputs/phase-13/pr-creation-record.md` | PR URL |

## 完了条件

- [ ] ユーザーの明示的な許可を得た
- [ ] git commit が成功している
- [ ] PR が作成されている

## 補足

- ユーザー承認がない場合、Phase 13 を完了扱いにしない（`blocked` を維持する）。
