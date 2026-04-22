# システム仕様更新サマリー — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## Step 1-A: same-wave sync 実施

| 更新先                                                                      | 内容                                                     |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `.claude/skills/skill-fixture-runner/SKILL.md`                              | 6 scripts、CLI 契約、allowlist-only 除外、変更履歴を反映 |
| `.claude/skills/skill-fixture-runner/LOGS.md`                               | close-out sync 追記                                      |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                           | 変更履歴に本タスクを追記                                 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                            | close-out sync 追記                                      |
| `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`    | validator=1件へ更新                                      |
| `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md` | validator 現況へ更新                                     |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | EVALS validator gate を追加                              |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | L1/L2/L3 分類を追加                                      |

## Step 1-B: 実装状況

本 workflow は `docs-only / NON_VISUAL` の close-out なので、workflow status は `spec_created` として扱う。コード成果物は branch 内に存在するが、この Phase 12 の責務は close-out と current facts 同期である。

## Step 1-C: 関連タスク

| タスク                                              | 状態         |
| --------------------------------------------------- | ------------ |
| UNASSIGNED-EVALS-VALIDATOR-GUARD-001                | spec_created |
| UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 | 未着手       |
| UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001     | 未着手       |
| Issue #2325                                         | CLOSED 維持  |

## Step 1-D: index 再生成

実行コマンド:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

期待結果:

- `.claude/skills/aiworkflow-requirements/topic-map.md` 更新
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json` 更新
- `validate-evals` / `EVALS.json` / `dual root` が検索可能

## Step 1-E: artifacts parity

root `artifacts.json` と `outputs/artifacts.json` を `spec_created` / `completed` / `blocked` の current facts に同期する。

## Step 1-F: mirror parity

`.claude/skills/skill-fixture-runner/` と `.agents/skills/skill-fixture-runner/`、および `.claude/skills/aiworkflow-requirements/` と `.agents/skills/aiworkflow-requirements/` の mirror parity を確認する。

## Step 1-G: final validation

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills --check-dual-root
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js --target .claude/skills/skill-fixture-runner
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
```

## Step 2: domain spec sync

実施した更新:

| ファイル                             | 反映内容                      |
| ------------------------------------ | ----------------------------- |
| `references/evals-schema-spec.md`    | validator=1件 / 残制約整理    |
| `references/claude-code-overview.md` | validator=0件注記を現況へ更新 |
| `references/quality-requirements.md` | EVALS validator gate 追加     |
| `references/error-handling.md`       | L1/L2/L3 / exit 1 の分類追加  |

## NON_VISUAL 判定

UI/UX変更なしのため Phase 11 スクリーンショット不要。代替証跡は `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`。
