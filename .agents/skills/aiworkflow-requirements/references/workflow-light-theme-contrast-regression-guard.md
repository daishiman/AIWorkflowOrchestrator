# ライトテーマ contrast regression guard ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`
> テンプレート: `skill-creator/assets/phase12-system-spec-retrospective-template.md` と `phase12-spec-sync-subagent-template.md` を元に再編

---

## 概要

`TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` で実装した light theme 回帰検知の正本。
今回の実装内容、苦戦箇所、再利用手順、仕様書別の責務分離を 1 ファイルへ集約し、次回の同種課題で `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` を横断検索しなくて済むようにする。

**トリガー**: current build の light screenshot を取りたい、hardcoded color audit を current/baseline で分離したい、Phase 11 capture が `ERR_CONNECTION_REFUSED` で落ちる、Apple UI/UX 観点の contrast review を guard workflow 化したい
**実行環境**: `apps/desktop` build 済み worktree、Phase 11 screenshot、Phase 12 仕様同期
**検索キーワード**: `light theme contrast guard`, `contrast regression guard`, `phase11-static-server`, `current build static serve`, `selector-based capture`, `baselineViolations`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 実装 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | audit / script | `light-theme-contrast-guard.config.mjs`, `light-theme-contrast-guard.mjs` | hardcoded color 検出と `current / baseline` 二層判定を固定する |
| SubAgent-B | harness / build | `phase11-light-theme-contrast-guard.html`, `phase11-light-theme-contrast-guard.tsx`, `electron.vite.config.ts` | current build static serve 前提の capture 面を固定する |
| SubAgent-C | feature readiness | `ThemeSelector`, `AuthView`, `GlassPanel`, `src/test/setup.ts` | selector-based capture と test 実行の安定性を確保する |
| SubAgent-D | workflow ledger | `task-workflow.md`, workflow `outputs/phase-11`, `outputs/phase-12` | 完了記録、検証値、artifacts を同期する |
| SubAgent-E | reuse knowledge | `lessons-learned.md`, `ui-ux-feature-components.md`, `ui-ux-design-system.md` | 苦戦箇所を短手順へ変換し、remediation task と guard task を分離する |
| Lead | integrated spec | `workflow-light-theme-contrast-regression-guard.md`, `indexes/resource-map.md`, `indexes/quick-reference.md` | 同種課題の参照入口を 1 つにまとめる |

---

## 今回実装した内容（2026-03-12）

| 観点 | 実装内容 | 主要ファイル |
| --- | --- | --- |
| audit contract | representative surface と hardcoded color pattern を設定ファイルへ切り出し、`current / baseline` bucket を固定した | `apps/desktop/scripts/light-theme-contrast-guard.config.mjs` |
| audit runner | target file のみを走査し、pattern / file / bucket 集計と screenshot plan を JSON 化できるようにした | `apps/desktop/scripts/light-theme-contrast-guard.mjs` |
| capture fallback | loopback baseUrl が不達なら `out/renderer` を自動 static serve してから screenshot を継続できるようにした | `apps/desktop/scripts/phase11-static-server.mjs`, `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` |
| build harness | Phase 11 専用 HTML / TSX harness を追加し、renderer build input に登録して current build から直接 capture できるようにした | `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.html`, `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.tsx`, `apps/desktop/electron.vite.config.ts` |
| readiness selector | `ThemeSelector` / `AuthView` / `GlassPanel` に `data-testid` と passthrough prop を追加し、selector-based capture を安定化した | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx`, `apps/desktop/src/renderer/views/AuthView/index.tsx`, `apps/desktop/src/renderer/components/organisms/GlassPanel/index.tsx` |
| test environment | local static server と renderer asset を MSW bypass 対象へ追加し、script test と screenshot preflight が衝突しないようにした | `apps/desktop/src/test/setup.ts`, `apps/desktop/scripts/light-theme-contrast-guard.test.ts`, `apps/desktop/scripts/phase11-static-server.test.ts` |
| workflow sync | Phase 1-12 を `completed` へ揃え、`outputs/artifacts.json`、Phase 11 screenshot 5件、`currentViolations=0 / baselineViolations=64` を workflow 正本へ同期した | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |

### 実装結果サマリー

| 項目 | 値 |
| --- | --- |
| representative screenshot | 5件 |
| audit summary | `currentViolations=0`, `baselineViolations=64` |
| targeted tests | 46 PASS |
| routing | remediation は `task-fix-light-theme-shared-color-migration-001`、guard 運用は current workflow に分離 |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| `vitest` は通るのに build だけ native dependency で落ちる | screenshot 作業前に build preflight を省略する | `pnpm install --force` 後に `pnpm --filter @repo/desktop build` を先頭へ固定した | UI screenshot task は `typecheck -> targeted tests -> build` の順で閉じる |
| harness HTML を追加しても build output に出ない | source を置いただけで `rollupOptions.input` を更新しない | `electron.vite.config.ts` に `phase11-light-theme-contrast-guard.html` を追加した | current build capture は HTML の build input 登録確認を先に行う |
| screenshot script 単体実行だと `ERR_CONNECTION_REFUSED` になる | localhost static server を人手起動前提にする | `phase11-static-server.mjs` で loopback 不達時の auto serve を追加した | Phase 11 capture は「既存 server 再利用 -> なければ current build 自走配信」の順で復旧可能にする |
| current failure と baseline backlog を混同しやすい | audit summary を総件数だけで記録する | audit target ごとに `bucket` を持たせ、`current=0 / baseline=64` を別欄へ分離した | light theme guard は必ず二層集計で記録する |
| Apple UI/UX review で helper text の沈みが後追いになる | color token だけを見て hierarchy / border / spacing を別管理しない | Phase 11 所見を `hierarchy / contrast / spacing / materiality` の4軸で記録した | helper text、panel border、card hierarchy は別観点で評価する |

---

## 同種課題の 5 分解決カード

1. `pnpm --filter @repo/desktop typecheck` と targeted tests の後に `build` を必ず通す。
2. `phase11-light-theme-contrast-guard.html` が `out/renderer` に出ていることを確認する。
3. localhost が不達なら `phase11-static-server.mjs` で current build を自走配信してから capture する。
4. audit は `current` と `baseline` を別 bucket で集計し、修正対象と既知 backlog を混ぜない。
5. `workflow-light-theme-contrast-regression-guard.md` を起点に、feature / design-system / task / lessons へ必要最小限だけ降りる。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| 実装全体像、SubAgent 分担、苦戦箇所の統合入口 | `workflow-light-theme-contrast-regression-guard.md` | 今回のような再監査系 task を 1 ファイルで再現できる |
| representative screen、実測値、baseline routing | `ui-ux-feature-components.md` | surface 単位の読み物として使いやすい |
| contrast review 軸、token 側の follow-up 導線 | `ui-ux-design-system.md` | design token と component 側 remediation を分離できる |
| 完了記録、検証コマンド、workflow 状態 | `task-workflow.md` | 台帳として追跡しやすい |
| 苦戦箇所の短手順化 | `lessons-learned.md` | 次回の初動短縮に直結する |

> 同じ段落を複数仕様書へ重複転記せず、このマトリクスで責務を先に決めてから反映する。

---

## 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `pnpm --filter @repo/desktop exec vitest run scripts/light-theme-contrast-guard.test.ts scripts/phase11-static-server.test.ts src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx src/renderer/views/AuthView/AuthView.test.tsx` | script / selector / readiness の回帰確認 | PASS |
| `pnpm --filter @repo/desktop build` | current build harness の出力確認 | PASS |
| `node apps/desktop/scripts/light-theme-contrast-guard.mjs --json --write docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/audit-summary.json` | audit summary 生成 | `current=0 / baseline=64` を出力 |
| `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard` | representative screenshot 取得 | 5件生成 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard` | TC と screenshot の整合確認 | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --strict` | workflow 仕様整合 | PASS |

---

## 関連改善タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 | current build capture の native dependency / build / harness / baseUrl preflight を bundle 化し、同種タスクの初動を 1 コマンドへ寄せる | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |
| TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 | ThemeSelector / AuthView / WorkspaceSearchPanel の baseline contrast remediation を継続する | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [workflow-light-theme-global-remediation.md](./workflow-light-theme-global-remediation.md) | global light remediation 側の正本 |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | representative feature と baseline routing |
| [ui-ux-design-system.md](./ui-ux-design-system.md) | token / contrast / theme 観点 |
| [task-workflow.md](./task-workflow.md) | 完了台帳と検証証跡 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と簡潔解決手順 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-12 | 1.0.0 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の統合正本を新規作成。実装内容、苦戦箇所、5分解決カード、仕様書別 SubAgent 編成、最適なファイル形成を集約した |
