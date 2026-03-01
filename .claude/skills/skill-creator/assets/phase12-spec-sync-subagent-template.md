# Phase 12 仕様書別SubAgent同期テンプレート

## 1. 対象タスク

| 項目 | 記入内容 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| 実装対象 | `<実装ファイル/機能>` |
| 反映対象仕様書 | `interfaces / api-ipc / security / task-workflow / lessons` |
| 実行日 | `<YYYY-MM-DD>` |

## 2. SubAgent分担（仕様書単位）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `references/interfaces-*.md` | 契約定義の同期 | 新旧契約・境界変換が明記されている |
| SubAgent-B | `references/api-ipc-*.md` | IPCチャネル契約同期 | request/response/validationが実装準拠で記録されている |
| SubAgent-C | `references/security-*.md` | 検証要件の同期 | sender/入力検証/path境界の責務分離が明記されている |
| SubAgent-D | `references/task-workflow.md` | 完了記録と証跡の同期 | 検証コマンドと結果、残課題が記録されている |
| SubAgent-E | `references/lessons-learned.md` | 苦戦箇所の教訓化 | 再利用可能な解決手順が追記されている |

## 3. 各仕様書の必須記載

| 仕様書 | 必須記載 |
| --- | --- |
| interfaces | 実装内容、契約差分、後方互換方針 |
| api-ipc | チャネル契約、バリデーション、実装状況 |
| security | 検証要件、責務分離、苦戦箇所 |
| task-workflow | 完了記録、検証証跡、未タスク監査結果、タスクID一意性 |
| lessons-learned | 苦戦箇所、原因、解決策、簡潔手順 |

## 4. 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
awk -F'|' 'BEGIN{flag=0} /^## 残課題（未タスク）/ {flag=1; next} /^## / && flag {flag=0} flag && /^\|/ { id=$2; gsub(/^[[:space:]]+|[[:space:]]+$/, "", id); gsub(/^~~|~~$/, "", id); if (id ~ /^(UT|TASK|task)-/) print id }' .claude/skills/aiworkflow-requirements/references/task-workflow.md | sort | uniq -d
```

## 5. 完了チェック

- [ ] 5仕様書が同一ターンで更新されている
- [ ] 変更履歴が各仕様書で更新されている
- [ ] 検証コマンド結果が台帳に記録されている
- [ ] 苦戦箇所と再利用手順が lessons に反映されている
- [ ] Phase 12成果物5点（implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report）が出力されている
