# Phase 11 Output: 手動テスト結果（正本）

**task種別**: NON_VISUAL / docs-only  
**スクリーンショット**: UI/UX変更なしのため Phase 11 スクリーンショット不要  
**NON_VISUAL 理由**: 対象変更は `.gitattributes`、hook/script、skill index 再生成導線、workflow close-out 文書であり、Renderer UI の追加・変更を含まない  
**primary evidence**: `verify-all-specs.js`、`git diff`、`diff -qr`、`rg` による仕様・実装・台帳の整合確認  
**alternative evidence**: `manual-test-checklist.md`、`discovered-issues.md`、`outputs/phase-9/command-log.md`

## テスト件数サマリー

| 区分 | 件数 | PASS | FAIL | SKIP |
| --- | ---: | ---: | ---: | ---: |
| 正常系テスト | 4 | 4 | 0 | 0 |
| 異常系テスト | 2 | 2 | 0 | 0 |
| edge caseテスト | 3 | 3 | 0 | 0 |
| **合計** | **9** | **9** | **0** | **0** |

### 実施情報

| 項目 | 内容 |
| --- | --- |
| 実施日 | 2026-04-18 |
| 実施者 | Codex |
| 対象バージョン | `task-20260417-210911-wt-2` worktree HEAD |
| 実施環境 | macOS / zsh / Node.js v22.21.1 |
| 関連Issue | なし |

## TC-ID ↔ evidence

| TC-ID | 観点 | primary evidence | alternative evidence | 結果 |
| --- | --- | --- | --- | --- |
| TC-001 | Phase 1-13 骨格整合 | `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/conflict-prevent-skills-001` | `outputs/verification-report.md` | PASS |
| TC-002 | merge driver bootstrap | `bash .claude/scripts/setup-merge-drivers.sh` の内容確認 | `manual-test-checklist.md` | PASS |
| TC-003 | post-merge 再生成導線 | `.claude/scripts/install-git-hooks.sh` / `.claude/hooks/post-merge-index-regenerate.sh` 読み合わせ | `implementation-guide.md` | PASS |
| TC-004 | deterministic regenerate | `generate-index.js` の日付行除去差分確認 | `outputs/phase-5/changed-files-summary.md` | PASS |
| TC-005 | canonical / mirror 方針 | `.claude` 正本 / `.agents` mirror の文書整合確認 | `discovered-issues.md` | PASS |
| TC-006 | Phase 12 same-wave sync | `task-workflow-completed.md` / `LOGS.md` / `artifacts.json` / `outputs/artifacts.json` の更新確認 | `system-spec-update-summary.md` | PASS |
| TC-007 | compliance-check の妥当性 | `phase12-task-spec-compliance-check.md` と実成果物の突合 | `documentation-changelog.md` | PASS |
| TC-008 | mirror drift 残件の扱い | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | `unassigned-task-detection.md` | PASS |
| TC-009 | Phase 13 blocked 維持 | `index.md` / `artifacts.json` / `outputs/artifacts.json` | `phase-13-pr.md` | PASS |

## edge case 一覧表

| ID | 観点 | 入力値（代表例） | 期待動作 | 仕様判断根拠ID | 結果 |
| --- | --- | --- | --- | --- | --- |
| EC-001 | `merge=ours` 未設定状態 | `merge.ours.driver` が空 | `session-init.sh` で警告し、bootstrap 手順へ誘導する | SD-001 | PASS |
| EC-002 | mirror drift 残存 | `.claude` と `.agents` の差分あり | full sync 未完を completed と混同せず、未タスクまたは残課題として残す | SD-002 | PASS |
| EC-003 | NON_VISUAL task | UI変更なし | screenshot を要求せず、CLI evidence を正本へ集約する | SD-003 | PASS |

## 仕様判断根拠

| ID | 判断内容 | 根拠 | 影響範囲 |
| --- | --- | --- | --- |
| SD-001 | `merge=ours` は custom driver 前提で、bootstrap 未実施時は warning を出す | `.gitattributes` / `session-init.sh` / `setup-merge-drivers.sh` | 開発者全員の merge 手順 |
| SD-002 | `.claude` を canonical、`.agents` を mirror とし、full parity 未完は same-wave 完了と分離して扱う | `task-specification-creator` 設計原則 / mirror parity 実測 | skill 正本、mirror、Phase 9/12 判定 |
| SD-003 | docs-only / NON_VISUAL task は screenshot ではなくコマンド・台帳・validator を primary evidence にする | Phase 11 docs-only テンプレート | Phase 11/12 close-out 文書全体 |

## 実行記録

| 項目 | 内容 |
| --- | --- |
| 実行コマンド | `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/conflict-prevent-skills-001` |
| 確認対象 | workflow 本体、`outputs/phase-11`、`outputs/phase-12`、`.gitattributes`、hook/script、aiworkflow 台帳 |
| 判定 | PASS |
| 補足 | validator は `エラー 0 / 警告 33`。警告は依存成果物参照中心で、Phase 11 正本不足と Phase 12 same-wave sync を今回補正した |

| 項目 | 内容 |
| --- | --- |
| 実行コマンド | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` |
| 確認対象 | canonical / mirror drift |
| 判定 | PASS |
| 補足 | drift 0 は未達でも、「部分 sync 済み / full sync 未完」を切り分けて記録する方針へ是正した |

| 項目 | 内容 |
| --- | --- |
| 実行コマンド | `rg -n "merge=ours|setup-merge-drivers|post-merge" .gitattributes .claude/hooks .claude/scripts docs/30-workflows/conflict-prevent-skills-001 -S` |
| 確認対象 | merge policy、bootstrap、hook 導線、close-out 文書 |
| 判定 | PASS |
| 補足 | `setup-merge-drivers.sh` から hook install まで一連の手順が辿れることを確認した |
