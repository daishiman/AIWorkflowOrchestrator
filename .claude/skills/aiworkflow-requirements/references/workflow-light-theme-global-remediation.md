# ライトモード全画面 white/black 再是正ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

Light Mode を Apple UI/UX 基準の `white background / black text` へ全画面共通で戻しつつ、renderer 側に残る hardcoded neutral class、CI shard failure、Phase 11 screenshot stale を同一ターンで解消する標準ワークフローを定義する。

**トリガー**: light mode で文字が白いまま残る、背景が off-white / gray に寄る、desktop CI の 1 shard だけ fail する、light theme screenshot が旧実装のまま残る
**実行環境**: ローカル worktree + Phase 11 screenshot 再撮影 + Phase 12 仕様同期

---

## フェーズ構造

### フェーズ一覧

| Phase | 名称 | 入力 | 出力 |
| --- | --- | --- | --- |
| Phase 1 | drift 抽出 | `tokens.css` / renderer class / current screenshot | token・bridge・component の責務分離 |
| Phase 2 | 実装修正 | tokens / globals / primitives / dashboard | white/black 基準に揃った light mode |
| Phase 3 | 証跡更新 | targeted tests / shard 再現 / screenshot capture | PASS した検証値と再取得 screenshot |
| Phase 4 | 仕様同期 | design-system / task-workflow / lessons / logs | 再利用可能な system spec |

### フロー図

1. `tokens.css` の light baseline を `#ffffff / #000000` に固定する。
2. `rg` で renderer 全域の hardcoded neutral class を棚卸しし、compatibility bridge の必要性を判定する。
3. `globals.css` の compatibility bridge と共通 primitives の token 移行で全画面 drift を止める。
4. CI fail shard を local で再現し、局所原因を修正する。
5. screenshot を再取得し、Phase 11 / Phase 12 / system spec を同一ターンで同期する。

### SubAgent 編成（関心ごと分離）

| SubAgent | 主責務 | 入力 | 出力 |
| --- | --- | --- | --- |
| SubAgent-A | token / design-system | `tokens.css`, `ui-ux-design-system.md` | white/black baseline と token 契約 |
| SubAgent-B | renderer compatibility | `globals.css`, primitives, dashboard | compatibility bridge と component migration 方針 |
| SubAgent-C | 視覚証跡 / CI | targeted tests, shard failure, screenshot script | PASS した shard 再現結果と screenshot |
| SubAgent-D | 台帳同期 | `task-workflow.md` | 実装内容・検証証跡・継続 backlog |
| SubAgent-E | 教訓化 | `lessons-learned.md` | 再発条件付きの短手順 |
| Lead | 統合検証 | A-E 成果物 | 変更履歴・ログ・index 再生成 |

---

## 今回実装内容（2026-03-11）

| 観点 | 実装内容 |
| --- | --- |
| Token baseline | `tokens.css` の light palette を `#ffffff / #000000` 基準へ是正し、`--accent-primary` / `--border-primary` を正式契約へ固定 |
| Renderer 全画面整合 | `globals.css` に compatibility bridge を追加し、`text-white` / `text-gray-*` / `bg-gray-*` / `border-white/*` 由来の light drift を吸収 |
| Primitive 移行 | `Button` / `Input` / `TextArea` / `Checkbox` / `SettingsCard` を token 基準へ寄せ、inverse text は accent surface のみに限定 |
| CI 回復 | `DashboardView` の `--accent` を `--accent-primary` に統一し、desktop test shard 11 の fail を解消 |
| 視覚証跡更新 | Phase 11 screenshot 5件を completed workflow 側パスで再取得し、coverage validator を PASS へ戻した |
| 継続 backlog | shared color migration は completed workflow `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/` へ移管済みで、contrast regression guard も completed workflow として完了した |

---

## 追補: shared component semantic token migration（2026-03-12）

| 観点 | 内容 |
| --- | --- |
| 対象 surface | `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` / `SettingsView` |
| 実装方針 | light theme で hardcoded `green/amber/red/blue/slate/white` class に頼っていた shared surface を semantic token 基準へ移行し、selector / status / dialog / error banner / search highlight を横断的に揃える |
| blind spot 是正 | Phase 2 で verification-only 扱いだった `SettingsView` status panel に residual hardcode が残っていたため、Phase 12 再監査で発見して current task 内で修正した |
| 証跡 | completed workflow Phase 11 screenshot 13件、Apple UI/UX engineer 観点レビュー、guard test、targeted tests、typecheck、build |
| canonical workflow | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/` |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| token 修正だけでは全画面 drift が止まらない | renderer 全域の hardcoded neutral class を監査しない | compatibility bridge を先に入れ、後続で primitives を token へ寄せた | Light Mode 全画面是正は token 修正と component migration の間に bridge 判定を入れる |
| CI fail shard の根因が broad rerun で埋もれる | local で同じ shard 番号を再現しない | `pnpm --filter @repo/desktop exec vitest run --shard=11/16` で再現し、Dashboard の `--accent` drift を局所修正した | desktop CI が shard 単位で落ちたら同じ shard を local で再現する |
| screenshot 証跡が completed workflow 移管で stale になる | capture script の workflow root を旧パスのまま残す | capture script を completed path に直し、再撮影 + coverage validator を実行した | workflow 完了移管後の screenshot script / validator path は必ず再点検する |
| 実装済みでも Phase 台帳が stale のまま残る | outputs / artifacts / index / phase 本文の同期を後回しにする | `outputs/phase-5..12` と `artifacts/index` を同ターンで補完した | 実装完了判定前に outputs・registry・index を同時確認する |

---

## 同種課題の5分解決カード

1. light token baseline を `#ffffff / #000000` に固定する。
2. `rg -n "text-white|bg-white/|border-white/|text-gray-|bg-gray-|border-gray-" apps/desktop/src/renderer` で renderer 全域の drift を棚卸しする。
3. compatibility bridge で全画面 drift を止め、共通 primitives を token へ寄せる。
4. CI fail が shard 単位なら `pnpm --filter @repo/desktop exec vitest run --shard=<n>/16` で再現し、light screenshot を撮り直す。
5. `ui-ux-design-system` / `task-workflow` / `lessons-learned` / `SKILL` / `LOGS` を同一ターンで同期する。

---

## 最適なファイル形成（責務マトリクス）

| 関心ごと | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| token baseline / contrast rule | `ui-ux-design-system.md` | theme 正本として再利用しやすい |
| 実装結果 / 継続 backlog / 検証証跡 | `task-workflow.md` | 台帳として追跡できる |
| 苦戦箇所 / 5分解決カード | `lessons-learned.md` | 次回の初動短縮に直結する |
| 類題の統合手順 | `workflow-light-theme-global-remediation.md` | design-system だけでは持ちづらい横断手順を 1 ファイルへ集約できる |

---

## 検証コマンド（最小セット）

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `rg -n "text-white|bg-white/|border-white/|text-gray-|bg-gray-|border-gray-" apps/desktop/src/renderer` | renderer 全域の hardcoded neutral class 棚卸し | 修正対象が列挙される |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts` | token 契約確認 | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/components/atoms/Button/Button.test.tsx` | primitive 回帰確認 | PASS |
| `pnpm --filter @repo/desktop exec vitest run --shard=11/16` | CI fail shard の local 再現 | PASS |
| `pnpm --filter @repo/desktop typecheck` | renderer 型整合 | PASS |
| `pnpm --filter @repo/desktop build` | build 整合 | PASS |
| `pnpm lint` | lint 整合 | error 0 |
| `node apps/desktop/scripts/capture-light-theme-token-foundation-phase11.mjs` | screenshot 再取得 | 5件再生成 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-token-foundation` | TC と証跡整合 | PASS |

---

## 関連改善タスク

| タスクID | ステータス | 概要 | 参照 |
| --- | --- | --- | --- |
| TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 | 完了（2026-03-12 / Phase 1-12、completed-tasks移管済み） | shared component の hardcoded color を semantic token へ段階移行し、light theme shared surface を completed workflow で再監査した | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/` |
| UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001 | 未実施 | `spec_created` UI workflow の root/index/artifacts/inventory/system spec extraction drift を同時に guard する | `docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md` |
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 | 完了（2026-03-12 / Phase 1-12、completed workflow 移管済み） | light contrast の screenshot / audit / Phase 11 checklist を恒久化し、current build static serve fallback を標準手順化した | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |

---

## 関連ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [ui-ux-design-system.md](./ui-ux-design-system.md) | token / contrast / theme 正本 |
| [task-workflow.md](./task-workflow.md) | 完了台帳と検証証跡 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と再利用手順 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-12 | 1.1.3 | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 を追補。shared selector / status / dialog / error/search surface の semantic token 移行、verification-only blind spot 吸収、completed workflow Phase 11 screenshot 13件、canonical workflow 導線を追加し、shared color migration を backlog から完了状態へ更新 |
| 2026-03-12 | 1.1.2 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の completed workflow 同期を反映。関連改善タスクの参照先を `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` へ切り替え、guard と remediation の責務分離を正本へ固定 |
| 2026-03-12 | 1.1.1 | `UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001` を追加。shared color migration 仕様作成で露出した current inventory correction、verification-only lane、cross-cutting system spec 抽出、root registry sync を、light-theme follow-up の関連改善タスクとして formalize |
| 2026-03-12 | 1.1.0 | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 の `spec_created` 追補を追加。current workflow、inventory correction、verification-only lane、必要 system spec 抽出セット、Phase 1-3 gate を workflow-light-theme-global-remediation 正本へ同期 |
| 2026-03-11 | 1.0.0 | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の global light remediation を横断ワークフローとして新規作成 |
