# 完了タスク記録 — 2026-03-19〜2026-03-21
> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

## 完了タスク

### タスク: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 RuntimePolicyResolver capability bridge（2026-03-21）

| 項目       | 値                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                                                          |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                         |
| タイプ     | implementation                                                                                         |
| 優先度     | 中                                                                                                     |
| 完了日     | 2026-03-21                                                                                             |
| 対象       | RuntimePolicyResolver / RuntimeSkillCreatorFacade / creatorHandlers の direct caller capability bridge |
| 成果物     | `docs/30-workflows/completed-tasks/runtime-policy-resolver-4state/`                                    |

#### 実施内容

- `RuntimeSkillCreatorFacade.execute()` が `decision.capability` を実消費し、`terminalSurface` で handoff bundle を返し `SkillExecutor` を呼ばないよう是正した
- `creatorHandlers.ts` に `ExecutionCapabilityInput` 正規化を導入し、`creatorHandlers.test.ts` で IPC boundary の raw args 変換と terminal handoff 透過を検証した
- workflow / system spec / skills / lessons を same-wave sync し、manual evidence の `not_run` 矛盾と artifact parity drift を解消した
- Phase 13 は user approval 未取得のため blocked とした

#### 発見元

- TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 direct caller lane 分解（2026-03-21）

#### 検証証跡

| コマンド                                                                                                                                                                                                    | 結果                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                     | PASS（378ファイル分類、`indexes/topic-map.md` / `indexes/keywords.json` 再生成） |
| `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-policy-resolver-4state --regenerate`                                                         | PASS（13/13 phase files）                                                        |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/runtime-policy-resolver-4state`                                                                          | PASS（31項目, 0エラー, 0警告）                                                   |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-policy-resolver-4state --strict`                                                           | PASS（13/13, errors 0, warnings 0）                                              |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/runtime-policy-resolver-4state`                                               | PASS（10/10）                                                                    |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/runtime-policy-resolver-4state/outputs/phase-12/unassigned-task-detection.md` | PASS（2/2, missing 0）                                                           |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                                      | PASS                                                                             |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                     | PASS                                                                             |
| `diff -qr .claude/skills/ .agents/skills/`                                                                                                                                                                  | PASS（差分なし）                                                                 |

#### Phase 12 未タスク

| 未タスクID                                                   | 概要                                                                                                     | 優先度 | タスク仕様書                                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001`                | internal `creatorHandlers.ts` capability bridge と public `skill-creator:*` IPC / preload surface の統合 | 高     | `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md`                                |
| `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001` | `RuntimePolicyResolver.resolveFromServices()` への subscription 判定 service 統合                        | 中     | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001.md` |

#### 苦戦箇所

| 苦戦箇所                                                         | 再発条件                                                   | 対処                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `manual-test-result.md` が `not_run` のまま completed を宣言する | non-visual task の manual evidence を後回しにする          | `NON_VISUAL_FALLBACK`、blocker、代替 evidence を同時記録した  |
| internal adapter と public preload 契約を同じ「IPC更新」とみなす | `ipcMain.handle()` 追加だけで system spec を更新済みと書く | internal/public の到達面を分離し、follow-up へ formalize した |
| `index.md` / `phase-*.md` / `artifacts*` を別ターンで更新する    | workflow 本文だけ completed にする                         | 4点同期を Phase 12 完了条件として固定した                     |

#### 同種課題の簡潔解決手順

1. `manual-test-result.md` が `not_run` でないことを確認し、fallback 時は blocker と evidence を残す。
2. internal adapter と public preload / registration の到達面を分離して記録する。
3. workflow 本文、phase 本文、`artifacts.json`、`outputs/artifacts.json` を同一ターンで同期する。

### タスク: TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 runtime-policy-centralization（2026-03-21）

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                     |
| ステータス | **仕様書作成完了（`spec_created` / workflow root `implementation_ready` / Phase 13 blocked）** |
| タイプ     | design                                                                                         |
| 優先度     | 高                                                                                             |
| 完了日     | 2026-03-21                                                                                     |
| 対象       | surface 横断 runtime policy / health route / handoff contract centralization                   |
| 成果物     | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/`         |

#### 実施内容

- RuntimePolicy / Health DTO / HandoffGuidance の consumption contract を Phase 1〜12 で確定した
- `index.md` / `artifacts.json` / `outputs/artifacts.json` / `phase-1..13` の status を整合化し、workflow root を `implementation_ready` に正規化した
- `outputs/phase-12/skill-feedback-report.md` を追加し、Phase 12 必須 6成果物をそろえた
- current code 再監査で actual centralization gap を確認し、follow-up 4件を formalize した

#### 検証証跡

| コマンド                                                                                                                                                                                                                       | 結果                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                                        | PASS（topic-map.md / keywords.json 再生成）           |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                                                                                                                                                    | PASS with warnings 5（500行超ファイルの既存警告のみ） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization --json`                                             | PASS（13/13, errors 0, warnings 0, info 1）           |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization --json`                        | PASS（10/10）                                         |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-12/unassigned-task-detection.md` | PASS（4/4, missing 0）                                |
| `diff -qr .claude/skills/ .agents/skills/`                                                                                                                                                                                     | PASS（差分なし）                                      |

#### Phase 12 未タスク

| 未タスクID                                                          | 概要                                                                                | 優先度 | タスク仕様書                                                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` | current code に残る centralization 未完了箇所を実装・共有契約・テストまで収束させる | 高     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| `UT-CLEANUP-AI-CHECK-CONNECTION-001`                                | legacy health route cleanup                                                         | 低     | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md`                                                |
| `UT-CLEANUP-RUNTIME-RESOLVER-001`                                   | deprecated resolver cleanup                                                         | 低     | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md`                                                   |
| `UT-DESIGN-SANITIZE-PLACEMENT-001`                                  | sanitize 配置判断の固定                                                             | 中     | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md`                                                  |

#### 苦戦箇所

| 苦戦箇所                                                 | 再発条件                                             | 対処                                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| design close-out を feature 完了と誤読しやすい           | workflow root と completed ledger の意味を分離しない | workflow root=`implementation_ready`、completed=`spec_created` を明記した                            |
| docs だけ見て final re-audit を閉じると実装 gap を見逃す | `outputs/` と台帳だけで判断し、current code を見ない | main IPC consumer / facade / shared transport / tests まで sweep し、高優先度 task を formalize した |

#### 同種課題の簡潔解決手順

1. design task の close-out では workflow root と completed ledger の意味を分離する。
2. Phase 12 最終再監査で current code の主要 consumer と tests を確認する。
3. 実装 gap は未タスクへ昇格し、backlog / workflow / lessons / completed を同一ターンで同期する。

### タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 execution-responsibility-contract-foundation（2026-03-20）

| 項目       | 値                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                             |
| ステータス | **仕様書作成完了（`spec_created` / Phase 1-12 completed / Phase 13 blocked）**                        |
| タイプ     | design                                                                                                |
| 優先度     | 高                                                                                                    |
| 完了日     | 2026-03-20                                                                                            |
| 対象       | execution responsibility / access capability / CTA contract foundation                                |
| 成果物     | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/` |

#### 実施内容

- `integratedRuntime` / `terminalSurface` / `both` / `none` の capability 語彙と `ready` / `blocked` / `unavailable` の UI 状態語彙を固定した
- primary CTA 1件 + secondary CTA 1件、`none` では実行 CTA を DOM に含めない、silent fallback / auto-send / hidden prompt injection 禁止を foundation 契約として明文化した
- current canonical workflow として `workflow-ai-runtime-execution-responsibility-realignment.md` を追加し、`task-workflow.md` / `resource-map.md` / `lessons-learned-current.md` と same-wave sync した
- Phase 12 再監査で planned wording 残存と worktree 先送りパターンを教訓化し、両 skill のガイドを是正した

#### 検証証跡

| コマンド                                                                                                                                                                                                               | 結果                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                                | PASS（topic-map.md / keywords.json 再生成）           |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                                                                                                                                            | PASS with warnings 5（500行超ファイルの既存警告のみ） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation --json`                      | PASS（13/13, errors 0, warnings 12）                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation --json` | PASS（10/10）                                         |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                               | PASS（差分なし）                                      |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                         | PASS（差分なし）                                      |

#### 苦戦箇所

| 苦戦箇所                                                                                              | 再発条件                                                      | 対処                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| current workflow の canonical entrypoint が task-workflow から辿れず、旧 authmode pack だけが見つかる | workflow 名変更後も旧 parent pack だけを参照し続ける          | `workflow-ai-runtime-execution-responsibility-realignment.md` を追加し、resource-map / task-workflow から到達可能にした |
| Phase 12 実更新後も `計画済み` / `更新予定` が成果物に残る                                            | docs-only task で実ファイル更新と成果物更新を別ターンに分ける | planned wording を不完了として扱うルールを skill 正本へ追記し、成果物を実績ベースへ書き換える                           |

#### 同種課題の簡潔解決手順

1. current workflow 名を canonical workflow spec と task-workflow の両方へ同時登録する。
2. Phase 12 では `.claude` 正本更新、workflow 成果物更新、mirror sync を同一ターンで閉じる。
3. `計画済み` / `更新予定` / `PRマージ後` が残っていたら未完了として扱い、実績文へ置換する。

### タスク: TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 slide-ai-runtime-alignment（2026-03-19）

| 項目       | 値                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                             |
| ステータス | **仕様書作成完了（`spec_created` / Phase 1-12 完了）**                              |
| タイプ     | design                                                                              |
| 優先度     | 高                                                                                  |
| 完了日     | 2026-03-19                                                                          |
| 対象       | Slide / Modifier / Legacy Agent 経路の runtime/auth-mode alignment                  |
| 成果物     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/` |

#### 実施内容

- slide runtime/auth-mode alignment の正本仕様を IPC / RuntimeResolver / UI / state / security へ同期した
- Phase 11 は screenshot 5件を取得し、current UI と正本仕様の drift を visual audit として記録した
- live preview は esbuild native binary mismatch で停止したため、current code 由来の static fallback capture を metadata 付きで保存した
- `UT-SLIDE-IMPL-001` / `UT-SLIDE-UI-001` / `UT-SLIDE-P31-001` / `UT-SLIDE-HANDOFF-DUP-001` を formalize し、backlog へ登録した
- 2026-03-21 current branch で `UT-SLIDE-UI-001` は完了、`UT-SLIDE-P31-001` は吸収済みへ更新した

#### 検証証跡

| コマンド                                                                                                                                                                       | 結果                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `node .../verify-all-specs.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment --json`                                                                             | PASS（13/13, warnings 0）       |
| `node .../validate-phase-output.js ...step-04-par-task-09-slide-ai-runtime-alignment`                                                                                          | PASS                            |
| `node apps/desktop/scripts/capture-slide-ai-runtime-alignment-phase11.mjs`                                                                                                     | PASS（fallback screenshot 5件） |
| `node .../validate-phase11-screenshot-coverage.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment`                                                                | PASS                            |
| `node .../validate-phase12-implementation-guide.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment`                                                               | PASS                            |
| `node .../verify-unassigned-links.js --source .../outputs/phase-12/unassigned-task-detection.md`                                                                               | PASS                            |
| `node .../audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                   | PASS（currentViolations=0）     |
| `diff -qr .claude/skills/{aiworkflow-requirements,task-specification-creator,skill-creator} .agents/skills/{aiworkflow-requirements,task-specification-creator,skill-creator}` | PASS                            |

#### follow-up 状況（2026-03-21）

| 種別      | ID                         | 概要                                                            | タスク仕様書                                                                                                                        |
| --------- | -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| pending   | `UT-SLIDE-IMPL-001`        | slide runtime/auth-mode 実装収束                                | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-impl-001.md`        |
| pending   | `UT-SLIDE-HANDOFF-DUP-001` | `HandoffGuidance` 重複定義解消                                  | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-handoff-dup-001.md` |
| completed | `UT-SLIDE-UI-001`          | SlideWorkspace UI 4領域実装                                     | `docs/30-workflows/completed-tasks/task-ut-slide-ui-001.md`                                                                         |
| resolved  | `UT-SLIDE-P31-001`         | `useSlideProject()` selector migration を current branch で吸収 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-p31-001.md`         |

#### 苦戦箇所

| 苦戦箇所                                                                        | 再発条件                                              | 対処                                                                                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| live preview が `esbuild` mismatch で停止し、current build の直接撮影ができない | worktree の native binary と preview 実行環境が不整合 | harness + static fallback に切り替え、`phase11-capture-metadata.json` と `manual-test-result.md` に理由を固定した |
| repo-wide `verify-unassigned-links` と task-scope link 監査が混ざる             | global コマンドだけで完了判定する                     | `--source outputs/phase-12/unassigned-task-detection.md` を current 判定に使い、repo baseline 6 件は別管理にした  |
| `spec_created` が計画記述のまま残りやすい                                       | docs-heavy task で `.claude` 正本更新を後回しにする   | system spec / lessons / backlog / skill / mirror parity を同ターンで実更新した                                    |

#### 同種課題の簡潔解決手順

1. Phase 11 は live preview が不安定なら無理に続行せず、fallback capture と metadata を current workflow へ先に固定する。
2. link 監査は `verify-unassigned-links --source .../unassigned-task-detection.md` を task 判定にし、repo-wide FAIL は baseline として分離する。
3. `spec_created` でも `.claude` 正本、lessons、backlog、skill、mirror parity を同ターンで閉じる。

### タスク: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 skill-docs-runtime-integration（2026-03-16）

| 項目       | 値                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                            |
| ステータス | **完了（Phase 1-12 完了）**                                                                                   |
| タイプ     | implementation                                                                                                |
| 優先度     | 中                                                                                                            |
| 完了日     | 2026-03-16                                                                                                    |
| 対象       | Skill Docs 生成の AI runtime 統合（LLMDocQueryAdapter / SkillDocsCapabilityResolver / DocOperationResult 型） |
| 成果物     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/` |

#### 実施内容

- `LLMDocQueryAdapter` を実装し、SkillDocGenerator の stubQueryFn を差し替えた
- `SkillDocsCapabilityResolver` で integrated-api / guidance-only / terminal-handoff の3パス判定を実装
- `DocOperationResult<T>` 型を追加し、エラーハンドリングを統一
- 実装完了時点の証跡として 97テスト ALL PASS、カバレッジ基準充足（LLMDocQueryAdapter 98.58%、CapabilityResolver 100%）を保持
- 2026-03-16 再監査で Phase 11 screenshot/Phase 12 guide/workflow 構造を再検証し、契約ドリフト（証跡ファイル名・implementation-guide要件）を是正
- 未タスク1件検出: UT-SKILL-DOCS-TERMINAL-HANDOFF-001（terminal-handoff 実パス実装）

#### 検証証跡

| コマンド                                                                                                                    | 結果                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop test`                                                                                          | 97テスト ALL PASS                                                                                                                |
| `LLMDocQueryAdapter` カバレッジ                                                                                             | 98.58%                                                                                                                           |
| `SkillDocsCapabilityResolver` カバレッジ                                                                                    | 100%                                                                                                                             |
| `pnpm --filter @repo/desktop typecheck`                                                                                     | PASS（再監査 2026-03-16）                                                                                                        |
| `pnpm --filter @repo/shared typecheck`                                                                                      | PASS（再監査 2026-03-16）                                                                                                        |
| `node .../verify-all-specs.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json`                      | PASS（13/13, warning 0）                                                                                                         |
| `node .../validate-phase-output.js ...step-03-par-task-04-skill-docs-runtime-integration --phase 12 --json`                 | PASS（28項目）                                                                                                                   |
| `node .../validate-phase11-screenshot-coverage.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json`  | PASS（5/5）                                                                                                                      |
| `node .../validate-phase12-implementation-guide.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json` | PASS（10/10）                                                                                                                    |
| `pnpm --filter @repo/desktop exec vitest run ...`                                                                           | 環境依存で再実行不可（esbuild darwin-x64/arm64 mismatch）。実装完了時の PASS 証跡を保持し、今回は typecheck + validator で再監査 |

### タスク: TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 task-specification-creator 大規模 Markdown 責務分離（2026-03-12）

| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                                 |
| ステータス | **進行中（Phase 1-12 完了 / Phase 13 blocked）**                                           |
| タイプ     | improvement                                                                                |
| 優先度     | 高                                                                                         |
| 完了日     | 2026-03-12                                                                                 |
| 対象       | `.claude/skills/task-specification-creator/` の 500 行超 markdown 6 concern                |
| 成果物     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/` |

#### 実施内容

- `SKILL.md` を 227 行の入口専用ドキュメントへ slim 化した
- `patterns`、`phase-templates`、`spec-update-workflow`、`phase-11-12-guide` を family file へ分割した
- `LOGS.md` を rolling 化し、`logs-archive-index.md` と月次 archive を追加した
- `.claude` 正本を `.agents` mirror へ同期し、`quick_validate.js` / `validate_all.js` / `diff -qr` を PASS させた

#### 検証証跡

| コマンド                                                                                                                                                                       | 結果                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose`                                                              | PASS                         |
| `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose`                                                                | PASS                         |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                 | PASS                         |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform`              | Phase outputs 更新後に再実行 |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform --json` | Phase outputs 更新後に再実行 |

