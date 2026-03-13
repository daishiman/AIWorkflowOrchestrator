# ドキュメント更新履歴: task-specification-creator-line-budget-reform

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| タスク名   | task-specification-creator 大規模 Markdown 責務分離        |
| 更新日     | 2026-03-12                                                 |
| Phase      | 12                                                         |
| ステータス | completed                                                  |

## 更新対象ファイル一覧

| ファイル                                                                            | 変更内容                                                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                | entrypoint 特化と family file 導線へ再編                                   |
| `.claude/skills/task-specification-creator/LOGS.md`                                 | rolling log + archive index 構成へ再編                                     |
| `.claude/skills/task-specification-creator/references/patterns.md`                  | index 化し、3 family file へ分離                                           |
| `.claude/skills/task-specification-creator/references/phase-templates.md`           | index 化し、5 template family file へ分離                                  |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | index 化し、Step 1 / Step 2 / validation を分離                            |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | index 化し、Phase 11 / 12 detail を分離                                    |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`      | review runner を `codex exec` 既定へ統一し、alias / wrapper 方針を追記     |
| `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | docs-only + explicit visual sanity request の補助 screenshot 方針を追記    |
| `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | large skill docs split pattern を追加                                      |
| `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | family file + archive pattern を追加                                       |
| `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | large skill docs update flow と non-interactive alias / wrapper 方針を追加 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 完了記録を追加                                                             |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | 再発防止の教訓を追加                                                       |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                    | system spec sync log を追加                                                |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                   | change history を追加                                                      |

## Phase 12 Task 2 実行ステップ記録

### Step 1-A: タスク完了記録

- `task-workflow.md` に完了記録を追加
- `aiworkflow-requirements/LOGS.md` を更新
- `task-specification-creator/LOGS.md` を更新
- `aiworkflow-requirements/SKILL.md` を更新
- `task-specification-creator/SKILL.md` を更新

### Step 1-B: 実装状況テーブル更新

- 判定: `completed`
- 理由: 6 concern 再編、mirror sync、validator、workflow outputs の全件を完了した

### Step 1-C: 関連タスクテーブル更新

- 確認コマンド: `grep -RIn "TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001" .claude/skills/aiworkflow-requirements/references .claude/skills/aiworkflow-requirements/LOGS.md .claude/skills/aiworkflow-requirements/SKILL.md`
- 確認対象: `task-workflow.md`、`lessons-learned.md`、`LOGS.md`、`SKILL.md`
- 判定: PASS

### Step 1-D: topic-map / index 更新

- 実行コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- 結果: `topic-map.md`、`keywords.json` を含む index を再生成

### Step 1-E: 未タスク監査

- 新規未タスク: 0 件
- `verify-unassigned-links.js`: `219/219`
- `audit-unassigned-tasks --json --diff-from HEAD`: `currentViolations=0`, `baselineViolations=134`

### Step 1-F: 補助更新

- `claude-code-skills-structure.md`: 大規模 skill docs の分割パターン
- `claude-code-skills-resources.md`: family file + archive 構成
- `claude-code-skills-process.md`: large skill docs update flow と review runner portability
- `review-gate-criteria.md`: Phase 10 標準経路を `codex exec` に揃えた
- `phase-11-screenshot-guide.md`: docs-only task でも明示要求時の screenshot sanity を許可

### Step 1-G: 検証

- `quick_validate.js`: PASS
- `validate_all.js`: PASS
- `validate-phase-output.js`: PASS
- `verify-all-specs.js --json`: PASS
- `validate-phase12-implementation-guide.js`: PASS
- `diff -qr`: PASS

### Step 2: システム仕様更新

- 判定: PASS
- 更新内容:
  - skill docs の大規模 Markdown 分割パターンを再利用ルールとして追加
  - review gate は `codex exec` を task spec review の既定に固定し、`codex review` を補助差分監査へ限定
  - non-interactive zsh alias 非依存の wrapper 方針を system spec へ明記
  - docs-only task でも user request による branch-level visual sanity screenshot を許容
  - rolling `LOGS.md` + archive と family file index を標準パターンに昇格
  - application 本体の API / IPC / UI contract は変更していないため対象外とした

## 変更内容サマリー

### task-specification-creator

- target 6 concern の line budget 超過を解消
- `SKILL.md` を入口、detail を `references/` family に分離
- `LOGS.md` を rolling log と archive に分離
- `.claude` 正本 / `.agents` mirror の同期導線を固定

### aiworkflow-requirements

- large skill docs split の再利用パターンを追加
- 完了台帳と lessons learned を同期
- index を再生成し、mirror に再同期

## 結論

ドキュメント更新、system spec sync、未タスク監査、validator 反映は完了した。Phase 13 は user の明示承認がないため blocked のまま維持する。
