# Phase 4 成果物: Test Matrix

## テスト方針

docs-only タスクのため、コード向けユニットテストは追加しない。grep / validator / diff を統合ゲートとして使用する。

## 検証コマンドと期待値

### grep 検証

| 検証観点                                 | コマンド                                                                                                                                                                           | pass 条件 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AC-9: 旧 SDK-04 path 残存                | `rg "skill-creator-agent-sdk-lane.*step-03" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/`                                    | 0件       |
| AC-9 補足: step-04-par-task-04 残存      | `rg "step-04-par-task-04-user-interaction-bridge" .claude/skills/aiworkflow-requirements/`                                                                                         | 0件       |
| AC-8: 未完了表現残存                     | `rg "更新予定\|後でやる\|後続判断待ち\|仕様策定のみ\|実行予定\|保留として記録" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/` | 0件       |
| AC-1/2/3: future 表現残存（SDK-02 対象） | `rg "future\|将来的には\|実装予定" .claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                                                                | 0件       |
| AC-10: コード変更なし                    | `git diff --name-only \| grep -v "^\\.claude\|^docs"`                                                                                                                              | 0件       |

### validator matrix

| 検証対象                          | コマンド                                                                                                                                                     | pass 条件     | 実行タイミング |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | -------------- |
| `task-specification-creator` 構造 | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                      | error 0       | Phase 9        |
| `aiworkflow-requirements` 構造    | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                         | error 0       | Phase 9        |
| `task-specification-creator` 全体 | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                        | error 0       | Phase 9        |
| `aiworkflow-requirements` 全体    | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`                                                           | error 0       | Phase 9        |
| workflow 構造                     | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/step11-par-docs-sdk-spec-sync --json`               | error 0       | Phase 9        |
| workflow phase 出力               | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/step11-par-docs-sdk-spec-sync`                            | error 0       | Phase 9        |
| implementation guide              | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step11-par-docs-sdk-spec-sync` | Part 1/2 PASS | Phase 12 前提  |
| mirror parity (task-spec)         | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                               | diff 0        | Phase 9        |
| mirror parity (aiworkflow)        | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                     | diff 0        | Phase 9        |

## リンク有効性確認

修正後の `task-workflow-completed.md` L300 パスが実在することを確認する:

```bash
ls docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/
# 期待値: ディレクトリが存在すること
```

## no-op ファイルの確認

以下ファイルは SDK-04 関連 stale path が存在しないため変更なし:

- `resource-map.md`: `step-03-par-task-04-user-interaction-bridge` 不在
- `quick-reference.md`: 同上
- `topic-map.md`: 同上
