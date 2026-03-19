# Workspace parent reference sweep guard ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

`UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001` で実施した docs-only parent workflow 再監査の正本。
`task-060` parent pointer、completed-task pointer docs、legacy index、`interfaces-*`、capture root、`.claude` / `.agents` mirror、そして user 指示で追加した representative visual re-audit を 1 ファイルへ集約し、次回の同種 task で台帳・feature spec・lessons を横断検索しなくて済むようにする。

**トリガー**: `task-060` の completed root drift、pointer docs stale path、legacy index stale status、Workspace 親導線の mirror drift、docs-heavy task なのに screenshot 再監査を要求された  
**実行環境**: current worktree、`docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/`、same-day child workflow screenshot evidence  
**検索キーワード**: `workspace parent reference sweep guard`, `task-060`, `pointer docs`, `legacy index`, `mirror drift`, `representative visual re-audit`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 実装 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | pointer / index inventory | `task-060`, completed-task pointer docs, `task-000`, `task-090` | 親導線の stale path / status を閉じる |
| SubAgent-B | spec / interfaces | `task-workflow.md`, `ui-ux-feature-components.md`, `interfaces-llm.md`, `interfaces-chat-history.md` | system spec の completed root を揃える |
| SubAgent-C | guard / mirror | `scripts/validate-workspace-parent-reference-sweep.mjs`, `.claude`, `.agents` | path / status / mirror drift を機械検証する |
| SubAgent-D | visual re-audit | `capture-workspace-parent-reference-sweep-guard-review-board.mjs`, 04A / 04B / 04C screenshot | docs-heavy task の representative UI review を completed workflow へ集約する |
| Lead | integrated spec | `workflow-workspace-parent-reference-sweep-guard.md`, `resource-map.md`, `quick-reference.md`, LOGS | 初動導線を 1 つへまとめる |

---

## 今回実装・更新した内容（2026-03-12）

| 観点 | 内容 | 主要ファイル |
| --- | --- | --- |
| drift guard | pointer / index / interfaces / capture / mirror を 1 manifest で検証する validator を追加 | `scripts/validate-workspace-parent-reference-sweep.mjs`, `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` |
| workflow sync | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/` の Phase 1-12、`artifacts.json`、Phase 11/12 outputs を completed 実績へ揃えた | completed workflow 一式 |
| system spec sync | `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `interfaces-*` を completed root と実績へ同期した | `references/task-workflow.md`, `references/ui-ux-feature-components.md`, `references/lessons-learned.md`, `references/interfaces-*.md` |
| unassigned cleanup | 元の未タスク仕様書を `未実施` のまま残さず、workflow 実行済み表記へ是正した | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` |
| visual re-audit | 04A / 04B / 04C / mobile overlay の same-day screenshot を completed workflow へ集約し、review board を新規 capture した | `apps/desktop/scripts/capture-workspace-parent-reference-sweep-guard-review-board.mjs`, `outputs/phase-11/screenshots/` |
| phase12 recheck | Task 12-1〜12-5、未タスク配置、exact counts、skill 改善を branch 最新状態で再確認し、stale 記録を是正した | `outputs/phase-12/*.md`, `task-specification-creator`, `skill-creator` |
| follow-up formalization | related UT row 移動後の exact count 再同期を別未タスクとして formalize し、current count を再確認した | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md`, `outputs/phase-12/unassigned-task-detection.md` |

### 実測サマリー

| 項目 | 値 |
| --- | --- |
| validator drift | `path=0 / status=0 / mirror=0` |
| targeted tests | 4 PASS |
| link audit | `220 / 220` |
| unassigned audit | `targeted current=0 / scoped baseline=96`, `global current=0 / baseline=134` |
| visual review | PASS（blocking regression なし） |

---

## 苦戦箇所と標準ルール

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| parent pointer だけ直しても導線が閉じない | `task-060` 単体修正で完了扱いにする | pointer docs / task-000 / task-090 / `interfaces-*` / capture / mirror を同一 sweep で閉じた | docs-only parent workflow は pointer/index/spec/script/mirror を 1 セットで監査する |
| 元未タスク仕様書が `未実施` のまま残る | workflow 実行と unassigned spec の状態更新を別ターンにする | 元 spec の status を workflow 実績へ更新し、台帳の related UT から completed 記録へ移した | unassigned spec を起点に実行した task は source spec の status も同一ターンで更新する |
| docs-heavy task でも screenshot 要求が来る | UI 実装変更がないので `N/A` と決め打ちする | same-day child workflow screenshot を completed workflow へ集約し、review board を新規 capture した | representative visual re-audit は current build 再撮影だけに限定しない |
| build 環境問題を screenshot blocker にしやすい | current build 以外をすべて無効と扱う | `esbuild` arch mismatch は補足記録に留め、docs-heavy task では source evidence board へ切り替えた | UI差分がない docs-heavy task は source evidence 集約で関心分離する |
| related unassigned row を completed 実績へ移した後に件数が stale になる | `verify-unassigned-links` の exact counts を先に転記し、その後で台帳を動かす | row 移動直後は `219 / 219` へ是正し、その後 follow-up UT formalize まで含めて current count `220 / 220` を workflow outputs / task-workflow / workflow spec へ再同期した | related UT を completed 実績へ移したら exact counts を再取得し、follow-up UT 追加後も current count を再転記する |

---

## 同種課題の5分解決カード

1. `task-060` / pointer docs / `task-000` / `task-090` を 1 セットで確認する。
2. `task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-*` の completed root を横断確認する。
3. `validate-workspace-parent-reference-sweep.mjs --json` と `diff -qr` を同一ターンで実行する。
4. user が screenshot を要求したら、04A / 04B / 04C の same-day evidence を completed workflow へ集約し review board を作る。
5. 元 unassigned spec の status、exact counts、workflow outputs、system spec、LOGS を同一ターンで同期する。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 理由 |
| --- | --- | --- |
| docs-only parent workflow 再監査の統合入口 | `workflow-workspace-parent-reference-sweep-guard.md` | pointer / mirror / visual re-audit を 1 か所で再現できる |
| 完了台帳、検証値、検証コマンド | `task-workflow.md` | task 実績と検証結果を追いやすい |
| Workspace surface と visual review | `ui-ux-feature-components.md` | 04A / 04B / 04C の surface 文脈で参照しやすい |
| 苦戦箇所と短手順 | `lessons-learned.md` | 次回の初動短縮に直結する |
| completed workflow の証跡 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11` / `phase-12` | 手元の worktree で確認しやすい |

---

## 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `node scripts/validate-workspace-parent-reference-sweep.mjs --json` | path / status / mirror drift 検出 | すべて 0 |
| `pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` | guard 回帰確認 | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard --output docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/verification-report.md` | workflow 仕様整合 | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 参照整合 | `220 / 220` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --completed-unassigned-dir docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task --target-file docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` | current 差分監査 | `current=0 / scoped baseline=96` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | repo 全体差分監査 | `current=0 / baseline=134` |
| `node apps/desktop/scripts/capture-workspace-parent-reference-sweep-guard-review-board.mjs` | representative visual re-audit board 生成 | PNG + metadata 出力 |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [task-workflow.md](./task-workflow.md) | 実績台帳 |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | Workspace surface 側の記録 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と短手順 |
| [interfaces-llm.md](./interfaces-llm.md) | Workspace evidence path |
| [interfaces-chat-history.md](./interfaces-chat-history.md) | Workspace evidence path |
| [../../../docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md](../../../docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md) | 元 unassigned spec の配置 / フォーマット確認 |
| [../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md) | related UT moved/closed 後の exact count 再同期ガード |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-12 | 1.0.2 | related UT exact count 再同期ガードを follow-up 未タスクとして formalize し、current `verify-unassigned-links=220 / 220`、new detection report 1件、current count 再転記ルールを追補した |
| 2026-03-12 | 1.0.1 | Phase 12 再確認を追補し、`verify-unassigned-links=219 / 219` への再同期、元 unassigned spec の配置確認、docs-heavy review board fallback と stale count 再発防止ルールを追加した |
| 2026-03-12 | 1.0.0 | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001 の統合正本を新規作成し、docs-only parent workflow の drift guard と representative visual re-audit を集約した |
