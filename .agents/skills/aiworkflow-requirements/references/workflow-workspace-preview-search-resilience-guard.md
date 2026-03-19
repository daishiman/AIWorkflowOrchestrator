# Workspace preview/search resilience guard ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`
> テンプレート: `skill-creator/assets/phase12-system-spec-retrospective-template.md`、`phase12-spec-sync-subagent-template.md`、`phase12-integrated-workflow-spec-template.md` を元に再編

---

## 概要

`UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` で実装した Workspace Preview / QuickFileSearch resilience ガードの統合正本。
今回の実装内容、苦戦箇所、SubAgent 分担、検証値、再利用手順、最適なファイル形成を 1 ファイルへ集約し、次回の同種課題で `task-workflow.md` / `ui-ux-search-panel.md` / `arch-state-management.md` / `error-handling.md` を横断検索しなくて済むようにする。

**トリガー**: `score=0` 候補混入を止めたい、`file.read` hang で preview loading が固着する、parse failure と transport failure を分けたい、Phase 11 screenshot を `external-dev-server` で再取得したい、standalone completed spec を `audit --target-file` で監査したい
**実行環境**: current worktree、`apps/desktop`、`docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/`、Phase 11 screenshot 5件、Phase 12 workflow / system spec / mirror sync
**検索キーワード**: `workspace preview/search resilience guard`, `quickFileSearchResilience`, `previewResilience`, `score=0`, `external-dev-server`, `audit --target-file`, `conversationIdRef`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 実装 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | search utility / dialog contract | `quickFileSearchResilience.ts`, `useQuickFileSearch.ts`, `QuickFileSearch.tsx`, `ui-ux-search-panel.md` | `score=0` 除外、stable sort、idle / no-match / results 契約を固定する |
| SubAgent-B | preview read resilience | `previewResilience.ts`, `WorkspaceView/index.tsx`, `PreviewPanel.tsx`, `PreviewErrorBoundary.tsx`, `architecture-implementation-patterns.md` | renderer local timeout + retry、typed taxonomy、fallback surface を固定する |
| SubAgent-C | state / visual polish | `arch-state-management.md`, `ui-ux-components.md`, `error-handling.md` | preview reset 順序、empty state / retry action、recoverable / fatal 境界を current 実装へ同期する |
| SubAgent-D | workflow / audit / skill sync | `task-workflow.md`, `lessons-learned.md`, workflow `outputs/phase-11`, `outputs/phase-12`, `skill-creator` templates | completed path、exact count、screenshot source、テンプレート改善を同一ターンで閉じる |
| Lead | integrated spec / lookup | `workflow-workspace-preview-search-resilience-guard.md`, `indexes/resource-map.md`, `indexes/quick-reference.md`, `SKILL.md` | 次回の初動を 1 入口へまとめる |

---

## 今回実装・更新した内容（2026-03-13）

| 観点 | 内容 | 主要ファイル |
| --- | --- | --- |
| search helper 抽出 | `buildSearchResults()` と `resolveQuickFileSearchViewState()` を抽出し、`score=0` 除外、stable sort、top 10、idle / no-match / results 文言を pure rule に切り出した | `apps/desktop/src/renderer/views/WorkspaceView/utils/quickFileSearchResilience.ts`, `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`, `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx` |
| preview helper 抽出 | `readPreviewFileWithResilience()` を新設し、`5s timeout + 1s delay + 3 retries`、API unavailable、read failure、timeout を typed transport error へ正規化した | `apps/desktop/src/renderer/views/WorkspaceView/utils/previewResilience.ts`, `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` |
| taxonomy / fallback UI | `PreviewSurfaceError` の category/code/summary/detail を導入し、parse failure は banner + source fallback、crash は boundary reset、transport は retry action を持つ surface に整理した | `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewPanel.tsx`, `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewErrorBoundary.tsx` |
| state reset 順序 | file 切替時に `content` / `size` / `extension` / `error` を先に reset してから read helper を実行し、stale preview の見え残りを防いだ | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`, `references/arch-state-management.md` |
| empty state / visual polish | Quick Search の empty state helper text、retry action、alert heading、status bar 文言を taxonomy に沿って磨き直した | `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx`, `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewPanel.tsx`, `references/ui-ux-components.md` |
| screenshot / audit fallback | Phase 11 screenshot は `sourceKind=external-dev-server` を正本にし、standalone completed spec 監査は `audit --target-file` を canonical にした | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-11/*`, `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/*`, `task-specification-creator` audit script |
| 再監査中の副次修正 | `conversationIdRef.current` の即時同期漏れで assistant message 保存 race が起きたため、state setter 前に ref を同期する補助修正を入れた | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` |

### 実測サマリー

| 項目 | 値 |
| --- | --- |
| targeted vitest | 7 files / 39 tests PASS |
| typecheck | PASS |
| eslint | PASS |
| screenshot coverage | expected TC 5 / covered TC 5 |
| screenshot source | `external-dev-server` |
| phase output validation | 28項目 PASS |
| workflow spec validation | 13 / 13 phase PASS |
| unassigned link validation | total 218 / existing 218 / missing 0 |
| current audit | `audit --target-file` で current violations 0 |

---

## 苦戦箇所と標準ルール

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| fuzzy boost が非一致候補にまで乗る | subsequence score 0 を gate せずに filename/path boost を足す | `hasSubsequenceMatch()` を先に通し、`buildSearchResults()` で `score > 0` 候補だけを採用した | fuzzy ranking は「一致判定」と「順位補正」を別責務にする |
| `file.read` hang で loading が解除されない | Main 応答待ちだけに依存し、renderer 側で timeout を持たない | `Promise.race` + retry helper を renderer local に閉じ、失敗時も `PreviewSurfaceError` を返して loading を閉じた | preview / inspector 系 invoke は renderer timeout + retry helper を標準にする |
| parse failure を transport fatal と同列に扱う | JSON/YAML 整形失敗を throw のまま surface へ流し、raw source fallback を失う | `createStructuredPreviewParseError()` を設け、banner + source fallback に分離した | parse failure は recoverable、transport failure は retryable / fatal の別 taxon にする |
| current build screenshot が branch 環境で不安定 | `esbuild` binary mismatch で current build capture を正本にできない | `external-dev-server` capture を正本化し、metadata と screenshot coverage を workflow に固定した | screenshot source が branch 依存で揺れる場合は `sourceKind` を必ず明記し、正本を 1 つ決める |
| standalone completed spec が `--diff-from HEAD` に乗らない | 旧 unassigned path の削除しか diff に出ず、untracked completed spec を current 監査できない | `audit-unassigned-tasks.js --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` を正本にした | completed path 移動直後の current 監査は `audit --target-file` を優先する |
| 再監査中に ref/state 同期差で保存 race が露出する | `setState()` 完了前に別 effect / save 処理が同じ値を参照する | `conversationIdRef.current = response.data.id` を state setter の前に入れた | ref を持つ非同期 controller は、同ターン参照される値を state だけに依存させない |
| Phase 12 outputs の exact count が summary / checklist / detection / report でずれる | follow-up 未タスク formalize や mirror sync 後に 4 成果物を別ターンで更新する | current task では 4 成果物を再同期し、`UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001` を追加した | exact count は再同期手順だけでなく、4成果物の横断 validator で stale 値を検知する |

---

## 同種課題の 5 分解決カード

1. `references/workflow-workspace-preview-search-resilience-guard.md` を起点に、search / state / pattern / error / task の分担を先に決める。
2. Quick Search は `buildSearchResults()` と `resolveQuickFileSearchViewState()` へ寄せ、`score > 0` gate と stable sort を先に固定する。
3. Preview は `readPreviewFileWithResilience()` を経由し、reset を先に行ってから read する。
4. error surface は `PreviewSurfaceError` に正規化し、parse fallback と transport retry を同じ alert に混ぜない。
5. Phase 11/12 再監査は `sourceKind`、`audit --target-file`、`verify-unassigned-links`、mirror sync を同一ターンで閉じ、Phase 12 outputs 4成果物の exact count を同値化する。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 理由 |
| --- | --- | --- |
| 実装全体像、SubAgent 編成、苦戦箇所、5分解決カード | `workflow-workspace-preview-search-resilience-guard.md` | Quick Search / Preview / audit / screenshot source を 1 入口で再現できる |
| ranking / no-match / shortcut / top N | `ui-ux-search-panel.md` | search dialog 契約として再利用しやすい |
| reset 順序、helper 抽出、state ownership | `arch-state-management.md` | local state と read helper の責務境界を固定できる |
| empty state / retry action / visual polish | `ui-ux-components.md` | UI カタログとして一覧から辿りやすい |
| renderer timeout / retry / parse fallback | `architecture-implementation-patterns.md` | 他画面へ横展開しやすい resilience pattern として残せる |
| recoverable / retryable / fatal taxonomy | `error-handling.md` | UI 応答の粒度を共通化できる |
| completed path、検証値、workflow 証跡 | `task-workflow.md` | 台帳と evidence を追跡しやすい |
| 再発条件、短手順、失敗パターン | `lessons-learned.md` | 次回の初動短縮に直結する |

> cross-cutting UI guard を複数仕様書へ分散追記しただけで終えず、統合正本を 1 つ持つ。

---

## 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `pnpm --filter @repo/desktop typecheck` | 型整合確認 | PASS |
| `pnpm --filter @repo/desktop exec eslint src/renderer/views/WorkspaceView/index.tsx src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewPanel.tsx src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewErrorBoundary.tsx src/renderer/views/WorkspaceView/utils/quickFileSearchResilience.ts src/renderer/views/WorkspaceView/utils/previewResilience.ts src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx src/renderer/views/WorkspaceView/WorkspaceView.test.tsx src/renderer/views/WorkspaceView/__tests__/quickFileSearchResilience.test.ts src/renderer/views/WorkspaceView/__tests__/previewResilience.test.ts` | 変更ファイル lint | PASS |
| `pnpm exec vitest run src/renderer/views/WorkspaceView/__tests__/quickFileSearchResilience.test.ts src/renderer/views/WorkspaceView/__tests__/previewResilience.test.ts src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx src/renderer/views/WorkspaceView/WorkspaceView.test.tsx --config vitest.config.ts --maxWorkers 1` | search / preview / UI 回帰 | PASS（7 files / 39 tests） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard` | Phase 11 画面証跡確認 | PASS（TC 5 / 5） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard` | implementation-guide 監査 | PASS（10 / 10） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard` | workflow 出力構造確認 | PASS（28項目） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard --json` | workflow 仕様整合 | PASS（13 / 13 phase） |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスク参照整合 | PASS（220 / 220 / 0） |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md` | follow-up 未タスクの current 監査 | PASS（current violations 0 / baseline 134） |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` | standalone completed spec の current 監査 | PASS（current violations 0 / baseline 134） |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | mirror sync 確認 | 差分なし |

---

## 関連未タスク

| 未タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001 | `spec-update-summary` / `system-spec-sync-checklist` / `unassigned-task-detection` / `verification-report` の exact count と current/baseline bucket を横断比較し、Phase 12 follow-up の stale 値を機械検出する | [../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md) |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [ui-ux-search-panel.md](./ui-ux-search-panel.md) | Quick Search 契約 |
| [arch-state-management.md](./arch-state-management.md) | preview reset 順序と helper 抽出 |
| [ui-ux-components.md](./ui-ux-components.md) | visual polish と UI カタログ |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | renderer local resilience pattern |
| [error-handling.md](./error-handling.md) | typed taxonomy と UI 応答 |
| [task-workflow.md](./task-workflow.md) | completed 台帳と検証証跡 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と短手順 |
| [../../../docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/implementation-guide.md](../../../docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/implementation-guide.md) | 実装詳細 |
| [../../../docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/verification-report.md](../../../docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/verification-report.md) | 検証値と補足 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-13 | 1.0.1 | `UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001` を関連未タスクとして追加し、Phase 12 outputs 4成果物の exact count drift を苦戦箇所と標準ルールへ昇格した |
| 2026-03-13 | 1.0.0 | `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` の統合正本を新規作成し、実装内容、苦戦箇所、5分解決カード、仕様書別 SubAgent 編成、最適なファイル形成、検証コマンドを集約した |
