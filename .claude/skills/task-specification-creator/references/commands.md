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
| 2026-01-26 | generate-index.jsコマンド追加 |
| 2026-01-26 | SKILL.mdから分離・作成 |
