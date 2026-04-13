# Phase 11 Manual Test Checklist

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 11         |
| タスク種別 | docs-only  |
| 証跡種別   | NON_VISUAL |

## チェック項目

| ID    | チェック内容                                                    | 判定 |
| ----- | --------------------------------------------------------------- | ---- |
| MT-01 | `index.md` に `docs-only` のタスク種別が記録されている          | PASS |
| MT-02 | `artifacts.json` の `metadata.taskType` が `docs-only` である   | PASS |
| MT-03 | `SKILL.md` / `LOGS.md` / mirror parity を確認できる             | PASS |
| MT-04 | `validate-phase-output.js` / `verify-all-specs.js` を再実行する | PASS |

## 実施基準

- 画面撮影は行わない。
- 文書証跡と validator 実行結果を正本にする。
- 発見事項は 0 件でも `discovered-issues.md` に残す。
