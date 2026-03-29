# タスク実行仕様書生成ガイド / completed records (agent view / line budget)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records
> 分割元: `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`（500行超のため分割）
> 対象タスク: TASK-UI-03-AGENT-VIEW, TASK-IMP-LIGHT-THEME, TASK-07-SETTINGS-PERSIST, TASK-FIX-SAFEINVOKE（再監査）, TASK-IMP-AIWORKFLOW-LINE-BUDGET

## TASK-UI-03-AGENT-VIEW-ENHANCEMENT current workflow 再監査記録（2026-03-10）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-03-AGENT-VIEW-ENHANCEMENT |
| 対象workflow | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/` |
| 目的 | current workflow / outputs / `.claude/skills/...` 正本のドリフトを再確認し、実行コマンドと仕様同期漏れを解消する |

### 再監査で反映した内容

- `ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` を current workflow 導線、`types.ts`、Phase 11 dedicated harness、136 tests に同期
- `architecture-implementation-patterns.md` に dedicated harness + review scope 分離パターンを追加し、UI再監査での state 固定と token 由来所見の切り分けを標準化
- `.claude/skills/task-specification-creator` 正本と current workflow の task-spec script 参照を `.agents/skills/task-specification-creator/scripts/` に統一
- `AgentView/index.tsx` / `phase11-agent-view.tsx` の `as unknown as Skill[]` を adapter helper (`toViewSkill` / `toImportedSkill`) へ置換し、型アサーション残存を解消

### 検証証跡

| 種別 | 結果 | 証跡 |
| --- | --- | --- |
| workflow 構造検証 | PASS | `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --strict` |
| workflow phase 検証 | PASS | `node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement` |
| Phase 11 coverage | PASS | `node .agents/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --allow-non-visual-tc TC-10 --json` |
| Phase 12 implementation guide | PASS | `node .agents/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --json` |
| 未タスクリンク | PASS | `node .agents/skills/task-specification-creator/scripts/verify-unassigned-links.js` |

### 残課題

- `UT-UI-03-TYPE-ASSERTION-001` は 2026-03-10 の再監査で解消済み。completed unassigned 側へ正規化した
- light theme の副次テキスト所見は global token scope の改善余地として `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` を新規作成し、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に配置した
- `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` の未タスク仕様書には、親タスクで苦戦した component/token 切り分け、dedicated harness 前提、`audit --diff-from HEAD --target-file` による品質判定を追補した

---

## TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 1-12 実行記録（2026-03-12 JST）

- 対象: `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/`
- 実装: `light-theme-contrast-guard.config.mjs` / `light-theme-contrast-guard.mjs` / `capture-light-theme-contrast-regression-guard-phase11.mjs` / `phase11-light-theme-contrast-guard.tsx` を追加
- 補助変更: `GlassPanel` props 透過、`ThemeSelector` / `AuthView` への `data-testid` 追加、renderer build input への harness HTML 登録、4173 未起動時の auto static serve fallback を追加
- テスト: targeted vitest 48件 PASS、typecheck PASS、build PASS
- Phase 11: current build static serve から screenshot 5件を取得し、`phase11-capture-metadata.json` に asset hash を記録
- Phase 12: `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` / `ui-ux-design-system.md` と `LOGS.md` / `SKILL.md` 6ファイルを `.claude` 正本へ同期し、Task 5 の再利用パターンは `skill-creator` へも反映

### audit summary

| 項目 | 値 |
| --- | --- |
| currentViolations | 0 |
| baselineViolations | 64 |
| baseline hot spot | `WorkspaceSearchPanel.tsx` 54、`ThemeSelector/index.tsx` 6、`AuthView/index.tsx` 4 |

### global unassigned-task directory audit

| 項目 | 値 |
| --- | --- |
| 今回 task 由来の新規未タスク | 0 |
| `verify-unassigned-links` | existing 214 / missing 0 |
| `audit-unassigned-tasks --json --diff-from HEAD` | currentViolations 0 |
| `audit-unassigned-tasks --json` | baselineViolations 134 |
| legacy normalization task | `task-imp-unassigned-task-format-normalization-001`, `task-imp-unassigned-task-legacy-normalization-001`, `task-imp-phase12-unassigned-baseline-remediation-002` |

### Phase 11 発見事項

| 区分 | 内容 | 証跡 |
| --- | --- | --- |
| baseline backlog | ThemeSelector の白系 utility が light shell で薄い | `outputs/phase-11/screenshots/TC-11-01-settings-light.png` |
| baseline backlog | Auth helper text が light panel 上で弱い | `outputs/phase-11/screenshots/TC-11-03-auth-light.png` |
| baseline backlog | WorkspaceSearchPanel が light 指定でも dark slate surface を保持する | `outputs/phase-11/screenshots/TC-11-04-workspace-search-light.png` |

### routing

- remediation task: `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md`
- guard 自体: `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/`

### 関連未タスク

| 未タスクID | 目的 | 参照 |
| --- | --- | --- |
| UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 | current build capture の native dependency / build / harness / baseUrl preflight を 1 コマンド化し、同種タスクの初動を短縮する | `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |
| TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 | ThemeSelector / AuthView / WorkspaceSearchPanel の baseline contrast remediation を継続する | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |

### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| worktree の `esbuild` アーキ差分で build だけ失敗する | test は通るため build preflight を後回しにする | `pnpm install --force` 後に build を再実行し、current build artifact を正本に固定した |
| harness HTML を build input に登録し忘れる | dev server 前提のまま Phase 11 を進める | `electron.vite.config.ts` に harness HTML を追加した |
| screenshot script が localhost server 未起動で即失敗する | current build static serve を人手 preflight のみに依存する | loopback baseUrl のときは `out/renderer` を auto static serve する fallback を capture script に追加した |
| light capture の不具合を current failure と誤読する | baseline backlog と current diff を同じ表で扱う | `current=0 / baseline=64` を別欄に分離し、remediation task へ routing した |

### 同種課題の簡潔解決手順（5ステップ）

1. audit script と screenshot harness を別 concern として切り出す。
2. build を先に通し、current build artifact を static serve する。
3. selector-based capture のために最小限の `data-testid` を追加する。
4. Phase 11 では Apple UI/UX 観点で hierarchy / contrast / spacing を別々に記録する。
5. Phase 12 では `.claude` 正本の system spec / LOGS / SKILL を同一ターンで更新し、global `unassigned-task/` の current/baseline を分離記録する。

## 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 完了記録（2026-03-08）

- 実装: `navigationSlice.ts` / `store/index.ts` に iterable/type guard を追加
- テスト: `navigationSlice.test.ts` に破損 persist 再現ケースを追加
- Phase 11: `outputs/phase-11/screenshots/TC-11-01..03` を取得して画面検証を実施
- Phase 12: 実装ガイド・changelog・未タスク検出・スキル改善レポートを更新

### 関連未タスク

- `docs/30-workflows/unassigned-task/task-persist-migration-versioning.md`
- `docs/30-workflows/unassigned-task/task-persist-field-validation-guard.md`

### 苦戦箇所（TASK-07）

| 項目 | 内容 | 対処 |
| --- | --- | --- |
| Phase 12 Task 1 不足 | `implementation-guide.md` が見出しのみで内容要件不足 | `validate-phase12-implementation-guide` を通るまで補完 |
| worktree 依存欠損 | `@rollup/rollup-darwin-x64` 欠損で vitest/screenshot 失敗 | `pnpm install --frozen-lockfile` で復旧後に再実行 |
| テスト対象の誤実行 | `test:run --` で全体実行になりやすい | `cd apps/desktop && pnpm exec vitest run <target>` に固定 |

## TASK-FIX-SAFEINVOKE-TIMEOUT-001 再監査同期（2026-03-10）

- 対象: `apps/desktop/src/preload/index.ts` の safeInvoke timeout、Phase 11 screenshot、Phase 12 仕様同期
- branch diff: `origin/main...HEAD` は 0 件
- current worktree diff: `git diff HEAD` では safeInvoke 実装差分あり
- Phase 11: dedicated harness で `TC-11-01/02` を再取得
- Phase 12: workflow / system spec / skill refs / 未タスク 4件を同期

### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| branch diff と current worktree diff を混同しやすい | `origin/main...HEAD` だけで completed / spec_created を判定する | `origin/main...HEAD` と `git diff HEAD` を分離記録した |
| representative screenshot が scope 外不具合を露出する | screenshot を current task の合否判定だけに使う | `discovered-issues.md` に記録し、未タスクへ formalize した |
| safeInvoke rollout scope を helper 名だけで言い切りやすい | 同名 helper の派生実装を洗わずに「preload 全体対応済み」と書く | `skill-api.ts` / `skill-creator-api.ts` を別 backlog として切り出した |

### 同種課題の4ステップ解決カード

1. `origin/main...HEAD` と `git diff HEAD` を分離し、branch と current worktree の結論を別々に固定する。
2. representative screenshot を light/dark で取得し、画面不具合と console warning の両方を backlog 判定する。
3. 共通 helper 改修は「どのファイルの helper か」を仕様書へ明記し、派生 helper は未タスクへ分離する。
4. `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` を同一ターンで実行し、`missing=0` と `currentViolations=0` を両方確認する。

### 検証証跡

- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001` → PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001` → PASS
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` → existing 221 / missing 0
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` → currentViolations 0 / baselineViolations 130

### 関連未タスク

- `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-preload-skill-api-safeinvoke-timeout-001.md`
- `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-preload-skill-creator-api-safeinvoke-timeout-001.md`
- `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md`
- `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-accountsection-linked-provider-key-warning-001.md`

## TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001

- ステータス: `進行中`（Phase 1-12 completed、`currentPhase=13`、Phase 13 blocked）
- 目的: aiworkflow skill line-budget reform の実装・検証・system spec sync・follow-up formalize を 1 つの workflow として閉じる。
- 実施内容:
  - manual over-limit docs 34件を family split で再編し、`.claude` 正本と `.agents` mirror を同期。
  - `generate-index.js` を再実行し、`quick-reference.md` / `resource-map.md` / `topic-map.md` / `keywords.json` を再生成。
  - workflow `outputs/phase-4` から `outputs/phase-12` までを実体化し、branch-level dashboard screenshot sanity を `outputs/phase-11/screenshots-app-sanity/` に再取得。
  - `SKILL.md` / `LOGS.md` / `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` / `lessons-learned-workflow-quality-line-budget-reform.md` / `phase-12-documentation-retrospective.md` を最終状態へ再同期。
  - `implementation-guide.md` を Part 1 / Part 2 + `たとえば` + 型/API/エッジケース/設定項目まで補強し、`phase12-task-spec-compliance-check.md` を root evidence へ再編。
  - `task-imp-aiworkflow-requirements-generated-index-sharding-001.md` を 10見出しへ正規化し、`verify-unassigned-links` の split 親 + sibling 監査を task-spec skill 改善として還元。
- 検証結果:
  - `validate-structure.js` PASS、`validate-phase12-implementation-guide` PASS、`verify-unassigned-links` は `existing=222 / missing=0`。
  - `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` と `--diff-from HEAD` はともに `currentViolations=0 / baselineViolations=134`。
  - manual docs over-limit は 0、manual max は `SKILL.md` 499行、`topic-map.md` は 500行超の blocked dependency として継続管理。
  - Phase 11 branch-level screenshot sanity は TC-11-01〜05 を再取得し、Apple UI/UX 観点で blocker なし。
- 課題・苦戦ポイント:
  - 中間段階の documentation shell を最終状態へ昇格し忘れると、`SKILL.md` / `LOGS.md` / `task-workflow` に stale state が残る。
  - shallow PASS 表では implementation guide の型/API不足や active 未タスクの10見出し欠落を見逃す。
  - split 後の `task-workflow.md` 親だけでは backlog child の未タスクリンクを拾えない。
  - `verify-unassigned-links` と Phase成果物存在チェック、skill validator の3系統を分けて見ないと drift を見落とす。
  - docs-only task でも user が要求した branch-level visual sanity は workflow 側 evidence と system spec 側記録を両方揃える必要がある。

### 仕様書別SubAgent分担

| SubAgent | 担当仕様書 / 成果物 | 主担当作業 |
| --- | --- | --- |
| A | `workflow-aiworkflow-requirements-line-budget-reform.md` | family-wave 実装内容、SubAgent 分担、5分解決カードの集約 |
| B | `indexes/quick-reference.md`, `indexes/resource-map.md` | 同種課題の逆引き入口を追加 |
| C | `spec-splitting-guidelines.md` | parent / child / history / archive / discovery の標準形を追記 |
| D | `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`, `task-workflow-backlog.md` | 完了記録、blocked dependency、follow-up の台帳同期 |
| E | `lessons-learned-workflow-quality-line-budget-reform.md`, `phase-12-documentation-retrospective.md` | 苦戦箇所、close-out drift、再利用手順の整理 |
| Lead | `LOGS.md`, `SKILL.md`, generated indexes, `.agents` mirror | 変更履歴、trigger、mirror parity、generated artifact を最終同期 |

### 同種課題の5分解決カード

1. family を先に定義し、1 wave で parent / child / history / archive / discovery を閉じる。
2. `.claude` 正本だけを patch し、`generate-index.js` 後に `.agents` mirror を同期する。
3. manual docs と generated artifact を別監査に分け、`topic-map.md` の oversized は未タスク化する。
4. `phase12-task-spec-compliance-check.md` を root evidence にし、Task 12-1〜12-5、implementation guide 品質、未タスク10見出し、current / baseline を 1 ファイルへ集約する。
5. `current` / `baseline`、`links` / `phase outputs` / `validator` を別表で記録し、workflow outputs、`SKILL.md`、`LOGS.md`、`task-workflow`、`lessons-learned` を final state へ一括再同期する。

- 未完了サブタスク連携:
  - `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md`
    - generated `topic-map.md` の 500行超問題に対する恒久対応を follow-up として継続。10見出しフォーマットと `currentViolations=0` を確認済み。
  - `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md`
    - `generate-index.js` 後の実測値が current system spec / unassigned task へ stale のまま残らないよう、metric sync guard を追加する。
  - `docs/30-workflows/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md`
    - current canonical set / inventory / register / parent docs / ledger / mirror を 1 wave で閉じる guard を follow-up として継続する。
  - `docs/30-workflows/unassigned-task/task-imp-aiworkflow-req-phase12-phase-12-artifacts-missing-001.md`
    - phase12 artifact drift は outputs 実体化と verification rerun で解消済みの履歴扱い。

- 補助ドキュメント:
  - [AIWorkflow Requirements Line Budget Reform Workflow](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/workflow-aiworkflow-requirements-line-budget-reform.md)
  - [Phase 12 Documentation Retrospective](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/phase-12-documentation-retrospective.md)
  - `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json`
