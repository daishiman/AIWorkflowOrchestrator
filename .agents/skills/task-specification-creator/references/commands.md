# 実行コマンドリファレンス

> **Progressive Disclosure**
> - 読み込みタイミング: スクリプト実行時
> - 読み込み条件: 検証・完了処理などのスクリプトを実行するとき

---

## 全体整合性検証【Phase 5 - 必須】

```bash
# 13ファイル一括検証（Script Task - 100%精度・自動実行）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}

# 厳格モード（警告もエラーとして扱う）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --strict

# JSON形式で出力
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json
```

**検証結果**: `outputs/verification-report.md` に出力
**判定**: PASS → Phase 6（完了）へ / FAIL → Phase 2へ戻り修正

---

## レビューゲート実行

```bash
# Phase 3 / 10 の task spec review を codex CLI で実行
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/{{FEATURE_NAME}}/phase-3-design-review.md \
  --output-prompt docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-3/review-prompt.txt

# 最終 review task spec を codex exec で実行
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/{{FEATURE_NAME}}/phase-10-final-review.md \
  --output-prompt docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-10/review-prompt.txt

# 差分確認が必要な場合のみ補助的に codex review を追加
codex review --uncommitted "docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-10/review-prompt.txt の指示に従って現在差分をレビューしてください。"

# Claude Code / 他 CLI / AI agent には同じ prompt file を渡す
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner generic-agent \
  --runner-command "{{AGENT_COMMAND}}" \
  --mode exec \
  --task-file docs/30-workflows/{{FEATURE_NAME}}/phase-3-design-review.md \
  --prompt-transport stdin \
  --dry-run
```

補足:

- shared spec では raw `codex` コマンドを前提にし、shell alias には依存しない。
- 環境固有の追加オプションは `codex` 側の wrapper / alias で注入し、task spec 本文へは埋め込まない。
- Claude Code / 他 CLI / AI agent は `review-prompt.txt` を共通入力として流用する。

---

## Phase出力検証

```bash
# Phase出力の検証（Script Task - 100%精度）
# 注: 位置引数でワークフローディレクトリを指定
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/{{FEATURE_NAME}}
```

---

## Phase完了処理

```bash
# Phase完了・成果物登録（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --phase {{PHASE_NUMBER}} \
  --artifacts "outputs/phase-{{PHASE_NUMBER}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 未タスク検出

```bash
# コードベースからTODO/FIXME検出（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src \
  --output .tmp/unassigned-candidates.json
```

### 未タスク配置・フォーマット監査

```bash
# unassigned-task 配置/フォーマット監査（0違反でexit code 0）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js

# JSON出力
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 対象監査（current判定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/{{TASK_FILE}}.md

# standalone 完了指示書の current 判定
node .agents/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/{{TASK_FILE}}.md

# 差分監査（git差分をcurrent判定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD
```

---

## ドキュメント更新履歴生成

```bash
# documentation-changelog.md自動生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

---

## モード検出

```bash
# create/update/execute/detect-unassigned判定
node .claude/skills/task-specification-creator/scripts/detect-mode.js \
  --request "{{USER_REQUEST}}"
```

---

## ワークフロー初期化

```bash
# artifacts.json初期化
node .claude/skills/task-specification-creator/scripts/init-artifacts.js \
  --feature {{FEATURE_NAME}} \
  --output docs/30-workflows/{{FEATURE_NAME}} \
  --type feat
```

---

## スキーマ検証

```bash
# JSON Schema検証
node .claude/skills/task-specification-creator/scripts/validate-schema.js \
  --schema schemas/{{SCHEMA_NAME}}.json \
  --data {{DATA_FILE}}.json
```

---

## 使用ログ記録

```bash
# 成功時
node .claude/skills/task-specification-creator/scripts/log-usage.js \
  --result success \
  --phase "Phase {{N}}"

# 失敗時
node .claude/skills/task-specification-creator/scripts/log-usage.js \
  --result failure \
  --phase "Phase {{N}}" \
  --error "{{ERROR_TYPE}}"
```

---

## インデックス生成

```bash
# ワークフローのindex.md自動生成
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

---

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-03-12 | run-review-task.js と codex review gate 実行例を追加 |
| 2026-02-22 | audit-unassigned-tasks.js コマンドを追加（未タスク配置・フォーマット監査） |
| 2026-01-26 | generate-index.jsコマンド追加 |
| 2026-01-26 | SKILL.mdから分離・作成 |
