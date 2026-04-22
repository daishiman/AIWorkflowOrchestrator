# Phase 2: 統一設計

## 設計判断

| 項目        | 決定                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| 正本方言    | `snake_case v1`                                                                  |
| 正本root    | `.claude/skills`                                                                 |
| mirror root | `.agents/skills`                                                                 |
| 実装順序    | writer(template) → fixture(EVALS.json) → reader(scripts) → test(検証)            |
| validator   | 本タスクでは導入しない。後続タスク `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` へ委譲 |
| rollback    | git revert で対応可能（各ファイルの変更は独立した置換のみ）                      |

## 3組6フィールドの変換定義

| camelCase (旧)            | snake_case v1 (正本)        | 型               |
| ------------------------- | --------------------------- | ---------------- |
| `currentLevel`            | `current_level`             | integer (1..4)   |
| `metrics.totalUsageCount` | `metrics.total_usage_count` | number           |
| `metrics.lastEvaluated`   | `metrics.last_evaluated`    | ISO-8601 \| null |

## 変更対象ファイル一覧

### `.claude/skills` 正本（優先更新）

| ファイル                                                            | 変更内容                                 |
| ------------------------------------------------------------------- | ---------------------------------------- |
| `skill-creator/assets/evals-template.json`                          | 3フィールドを snake_case へ              |
| `skill-creator/scripts/init_skill.js`                               | 初期化キーを snake_case へ               |
| `task-specification-creator/EVALS.json`                             | 3フィールドを snake_case へ              |
| `task-specification-creator/scripts/log-usage.js`                   | read / write キーを snake_case へ        |
| `int-test-skill/EVALS.json`                                         | 3フィールドを snake_case へ              |
| `github-issue-manager/EVALS.json`                                   | 3フィールドを snake_case へ              |
| `skill-creator/scripts/collect_feedback.js`                         | reader/writer を snake_case へ           |
| `skill-creator/schemas/feedback-record.json`                        | JSON Schema プロパティ名を snake_case へ |
| `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | fixture assertion を現行契約へ揃える     |

### `.agents/skills` mirror（正本更新後に同期）

| ファイル                                          | 変更内容                |
| ------------------------------------------------- | ----------------------- |
| `skill-creator/assets/evals-template.json`        | 正本と bit-for-bit 一致 |
| `skill-creator/scripts/init_skill.js`             | 正本と bit-for-bit 一致 |
| `task-specification-creator/EVALS.json`           | 正本と bit-for-bit 一致 |
| `task-specification-creator/scripts/log-usage.js` | 正本と bit-for-bit 一致 |
| `int-test-skill/EVALS.json`                       | 正本と bit-for-bit 一致 |
| `github-issue-manager/EVALS.json`                 | 正本と bit-for-bit 一致 |
| `skill-creator/scripts/collect_feedback.js`       | 正本と bit-for-bit 一致 |
| `skill-creator/schemas/feedback-record.json`      | 正本と bit-for-bit 一致 |

## 変更しないファイル（対象外）

- `automation-30/EVALS.json` (.claude / .agents) — 対象スキル外。全体 grep の期待値に含めない
- `claude-agent-sdk/EVALS.json` (.claude / .agents) — 対象スキル外
- `evals-schema-spec.md` — 移行対応表として camelCase 記述が正しい（仕様書）
- `log_usage.js` (aiworkflow-requirements, skill-creator) — 既に snake_case 済み
- `apps/backend`, `packages/shared` — 当該 3 組 6 フィールドの直接 consumer は現時点で見当たらない

## root 同期手順

```
Step 1: .claude/skills 側 writer / initializer / fixture を更新
Step 2: .claude/skills 側 reader を更新
Step 3: task-specification-creator の camelCase consumer を更新
Step 4: apps/desktop fixture / test の期待値を合わせる
Step 5: .agents/skills へ対象ファイルのみ同期
Step 6: 変更対象ペア限定 diff で parity を確認
```
