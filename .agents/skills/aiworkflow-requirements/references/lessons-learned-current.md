# Lessons Learned（教訓集） / current summary

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: current summary

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上           |
| スコープ | 実装過程で遭遇した課題、解決策、コード例                               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-15 | 1.29.92 | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の Phase 12 再確認を追補。repo-wide `test:run` で露出した `@repo/shared` 解決失敗を既存未タスク `task-imp-vitest-alias-sync-automation-001` へ紐付ける判定基準、`docs/30-workflows/unassigned-task/` 配置確認と `audit --diff-from HEAD --target-file` の分離実行手順を追加 |
| 2026-03-15 | 1.29.91 | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 の教訓を追加。workflow 台帳の `not_started` 残置、runtime handoff 契約の Main/Preload/Store 三層同期漏れ、capture fallback 証跡化の抜けを同時に是正する手順を追記 |
| 2026-03-15 | 1.29.91 | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の教訓を追加。P58（同名ファイル二重存在）判定手順、RuntimeResolver mock 戦略（P61派生）、vi.spyOn vs vi.mock のセキュリティテスト向け判断基準の3苦戦箇所と5分解決カードを追記 |
| 2026-03-14 | 1.29.91 | TASK-SKILL-LIFECYCLE-04 の system spec 同一 wave 同期を追補。`workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、current canonical set / artifact inventory / legacy path 互換 / mirror parity 手順を固定 |
| 2026-03-14 | 1.29.88 | TASK-SKILL-LIFECYCLE-04 の Phase 12 再確認を追補。未タスクを workflow ローカル `tasks/unassigned-task/` に置くと監査境界と衝突する課題を是正し、root canonical path（`docs/30-workflows/unassigned-task/`）固定 + 9セクション正規化 + 参照同期の再利用手順を追加 |
| 2026-03-14 | 1.29.90 | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装教訓 P57〜P61 を追加。AuthMode 値乖離、同名ファイル二重存在、Preload API 未公開、サービススコープ制限、動的アダプタ注入の5教訓と5ステップ解決手順を追記 |
| 2026-03-14 | 1.29.89 | TASK-SKILL-LIFECYCLE-04 の Phase 12 再確認を追補。未タスクを workflow ローカル `tasks/unassigned-task/` に置くと監査境界と衝突する課題を是正し、root canonical path（`docs/30-workflows/unassigned-task/`）固定 + 9セクション正規化 + 参照同期の再利用手順を追加 |
| 2026-03-14 | 1.29.89 | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 の Phase 12 再確認追補を反映。再参照既存未タスクが `target-file` 監査で current 違反になり得る点を追加し、`audit-unassigned-tasks --target-file` で是正確認する運用を明文化 |
| 2026-03-14 | 1.29.88 | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 の再監査教訓を追補。`electron-vite dev` の esbuild platform mismatch で実画面 capture が詰まる条件、fallback review board 証跡化、`chatEditAPI` payload 契約（object vs positional）ドリフト是正を追加 |
| 2026-03-14 | 1.29.87 | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 の follow-up 教訓を追補。Phase 4 契約テストと Phase 6 回帰テストの責務混線を `UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001` として未タスク化し、境界定義と重複防止手順を追加 |
| 2026-03-12 | 1.29.83 | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 の教訓を追加。large skill docs は `SKILL.md` を入口に保ち、family file と rolling `LOGS.md` + archive へ責務分離し、`.claude` 正本更新後に `.agents` mirror と validator 3点セットを同期する手順を標準化 |
| 2026-03-12 | 1.29.82 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の Phase 12 再確認を追補。workflow baseline backlog `64` と global `docs/30-workflows/unassigned-task/` legacy `134` を分離して報告するルール、および Task 5 で `skill-creator` まで同期した場合は `skill-feedback-report` / `documentation-changelog` / `spec-update-summary` の3ファイルへ同値転記するルールを追加 |
| 2026-03-12 | 1.29.81 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の再監査追補。Phase 11 screenshot script が localhost static serve 未起動で `ERR_CONNECTION_REFUSED` になる運用漏れを追加し、`out/renderer` の auto static serve fallback を標準手順へ昇格 |
| 2026-03-12 | 1.29.80 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の教訓を追加。worktree の `esbuild` アーキ差分、harness HTML build input 登録漏れ、light capture の baseline 誤読、Apple UI/UX 観点での補助テキスト評価を 5 ステップへ整理 |
| 2026-03-12 | 1.29.79 | `UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001` を追加。`TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` の苦戦箇所を、current inventory correction、verification-only lane、cross-cutting system spec 抽出、root registry sync を同時に固定する未タスクへ formalize し、次回 `spec_created` UI task の初動を短縮 |
| 2026-03-12 | 1.29.78 | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 の教訓を追加。old unassigned inventory drift、token/component/verification-only の責務混線、UI-only 読みでの auth/search/security/portal/state 抽出漏れ、Phase 1-3 gate の破綻を同時に整理し、`spec_created` UI task 向け 5 ステップへ圧縮 |
| 2026-03-11 | 1.29.77 | TASK-UI-04C follow-up として `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` を関連未タスクへ追加。fuzzy no-match、renderer timeout+retry、parse/transport 分離の 3 難所を未タスク指示書へ formalize し、次回 preview/search UI の簡潔解決導線を接続 |
| 2026-03-11 | 1.29.76 | TASK-UI-04C-WORKSPACE-PREVIEW の教訓を追加。fuzzy search false positive、renderer timeout 不足、structured preview fallback 分離、current build screenshot 11件の再利用手順を 5 ステップ化 |
| 2026-03-11 | 1.29.75 | TASK-UI-04B-WORKSPACE-CHAT の教訓を追加。stream chunk/end 競合、Phase 11 screenshot harness の API mock 不足、Phase 12 実装ガイド要件不足を同時是正し、`task-workflow` / `implementation-guide` / `LOGS` / `SKILL` の同一ターン更新を標準化 |
| 2026-03-11 | 1.29.74 | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の global light remediation 追補を反映。renderer-wide hardcoded neutral drift、desktop shard 11 再現、completed workflow 側 screenshot 再取得を苦戦箇所へ追加し、white/black 基準 + compatibility bridge + shard 再現 + screenshot 再検証の 5 ステップへ再編 |
| 2026-03-11 | 1.29.73 | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の completed workflow 同期を反映。Phase成果物不足・Phase 11 必須節不足・follow-up backlog 配置ドリフトの再発条件を整理し、active workflow は `docs/30-workflows/unassigned-task/`、completed workflow 由来は `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` を正本とするルールを追加 |
| 2026-03-11 | 1.29.72 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 の完了移管を反映。関連改善タスクの参照先を `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` へ更新し、親workflowと同時に completed 配置へ揃えた |
| 2026-03-11 | 1.29.71 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 を追加。`cache clear` / Main 同期 / `source` 表示の 3 契約を個別テストの寄せ集めではなく単一回帰マトリクスで guard する改善導線を task-workflow / workflow spec / domain spec へ同期した |
| 2026-03-11 | 1.29.70 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 の Phase 12再確認追補を追加。スクリーンショット再取得、Phase 12 4検証再実行、未タスク監査の `current=0 / baseline=133` 二層判定を同時に固定し、再確認時の誤判定を防止 |
| 2026-03-11 | 1.29.69 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 の教訓を追加。`ai.chat` と `llm` 選択状態の二重管理ドリフト、APIキー更新後の adapter cache stale、`auth-key:exists` の判定根拠不足を同時解消し、`source` 優先表示 + `llm:set-selected-config` + cache clear の三点セットを標準化 |
| 2026-03-11 | 1.29.68 | TASK-UI-07 の派生未タスクを追加。`.claude` / `.agents` の dual skill-root drift を `UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001` として formalize し、canonical root 固定・mirror sync・`diff -qr` 検証を Phase 12 の再利用手順へ昇格 |
| 2026-03-11 | 1.29.67 | TASK-UI-07-DASHBOARD-ENHANCEMENT の再監査追補。表示名「ホーム」と内部 `dashboard` 契約の境界維持、未実施UTの正本配置是正、UI機能仕様への苦戦箇所固定を追加 |
| 2026-03-11 | 1.29.66 | TASK-UI-07-DASHBOARD-ENHANCEMENT の教訓を追加。workflow 本文 stale、Phase 11 validator のソース要求、worktree の esbuild 差分を整理し、4ステップ再利用手順を追記 |
| 2026-03-11 | 1.29.65 | TASK-UI-08-NOTIFICATION-CENTER 再監査の教訓を追加。Bell utility action の仕様同期漏れ、Phase 11 coverage validator の列名依存、delete reveal の実画面証跡不足を同時是正し、`ui-ux-components` / `ui-ux-navigation` / `ui-ux-portal-patterns` / `task-workflow` / `lessons-learned` の同一ターン同期を標準化 |
| 2026-03-11 | 1.29.67 | TASK-SKILL-LIFECYCLE-01 Phase 12 準拠再確認を追補。`unassigned-task-detection.md` の 0件報告でも `current=0 / baseline=133` と既存 backlog 参照を残すルール、および `phase12-task-spec-compliance-check.md` による証跡集約を追加 |
| 2026-03-11 | 1.29.66 | TASK-SKILL-LIFECYCLE-01 再監査追補。representative screenshot は shell 全景より selector-based element capture を優先するルールと、surface ownership board による責務証跡強化を追加 |
| 2026-03-11 | 1.29.65 | TASK-SKILL-LIFECYCLE-01 の教訓を追加。journey contract の実装アンカー化、`skill-center` legacy alias の shell 正規化、Phase 12 で `artifacts.json` / phase 本文 / `.claude` 正本を同時同期する手順を追記 |
| 2026-03-10 | 1.29.64 | UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 を追加。TASK-UI-04A の苦戦箇所から current build static serve、reverse resize、watch callback ref、light theme contrast を未タスク導線へ接続し、次回の Workspace UI 再監査を短手順で再現できるようにした |
| 2026-03-10 | 1.29.63 | TASK-UI-06-HISTORY-SEARCH-VIEW の解決手順を 5 ステップへ最適化し、専用 domain spec / feature spec / task-workflow の同期粒度を揃えた |
| 2026-03-10 | 1.29.62 | TASK-UI-06-HISTORY-SEARCH-VIEW の教訓を追加。worktree 依存補完 preflight、screenshot strict locator 化、`.claude` 正本 / `.agents` mirror の canonical root 固定、timeline UI の state 分離を再利用手順として追記 |
| 2026-03-10 | 1.29.61 | TASK-10A-G 実装知見追補。IPC ハンドラキャプチャパターン、Store 統合テストの Promise 解決タイミング制御、Phase 6 カバレッジ不足の2段階テスト設計、P41 v8 Function Coverage exemption 判断、Phase 12 並列エージェント分割戦略の5苦戦箇所と5分解決カードを追記 |
| 2026-03-10 | 1.29.60 | TASK-10A-G 再監査追補の教訓を追加。`generate-index.js --workflow ... --regenerate` が workflow `artifacts.json` スキーマ差で `index.md` を `undefined` / 全Phase未実施へ崩しうる点、実行直後に `verify-all-specs --strict` / `validate-phase-output` で確認し、必要なら未タスク化する運用を追記 |
| 2026-03-10 | 1.29.59 | TASK-FIX-SAFEINVOKE-TIMEOUT-001 の教訓を補完。Promise.race パターンのシンプルさ、`clearTimeout` cleanup 採用の判断根拠、3ファイル重複 safeInvoke の DRY 統合（ipc-utils.ts）、safeInvokeUnwrap 自動対応、P13 準拠 Fake Timer テスト戦略を追記 |
| 2026-03-10 | 1.29.58 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装教訓を追加。App.tsx AuthGuard構造変換、useAuthState タイマー管理（P13準拠）、getAuthState 判定優先順位設計、Settings bypass セキュリティ境界、サブエージェント exit code 144 の5苦戦箇所と5分解決カード・4ステップ再利用手順を追記 |
| 2026-03-10 | 1.29.57 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査の教訓を追加。Settings bypass と未認証 reset の相殺、明示 screenshot 要求時の P53 代替禁止、worktree の `pnpm install --frozen-lockfile` preflight を 4 ステップ解決手順つきで追記 |
| 2026-03-09 | 1.29.56 | TASK-10A-G の教訓を追加。テスト専用タスクの Phase 4/5 境界曖昧さ、巨大ファイルのカバレッジ計測誤解、3層テスト構成の Layer 間モック整合性、並列エージェントの Phase 12 分割戦略、`--sequence.shuffle` 検証、supporting artifact / open backlog 配置ドリフトを追記 |
| 2026-03-09 | 1.29.56 | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 の教訓を追加。`skipAuth=true` が storage clear bug path を guard して false negative になりうる点、通常ルート metadata 検証と dedicated harness screenshot を分離する運用、repo-wide `debug-clear-storage` 残骸は未タスクへ分離する判断を標準化 |
| 2026-03-09 | 1.29.55 | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査追補。未タスク指示書の9セクション逸脱、`validate-phase-output --phase` ドキュメント drift、BrowserRouter 配下の screenshot harness での Router 二重化を同一系統の苦戦箇所として整理し、4ステップ解決手順を追加 |
| 2026-03-09 | 1.29.54 | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の教訓を追加。executeSkill 並行実行ガードの実装で遭遇した3つの苦戦箇所（テスト実行ディレクトリ依存、flushMicrotasks タイミング制御、createStore パターンでの set/get 再現）と、5分解決カードを追記 |
| 2026-03-09 | 1.29.53 | TASK-10A-F Phase 12 再同期の教訓を追補。Phase 11 placeholder 除去、implementation-guide validator literal 見出し、未タスク current/baseline と directory legacy の二軸報告を同時に固定し、同種課題の再利用手順を更新 |
| 2026-03-08 | 1.29.52 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 の実装教訓を追加。`safeRegister` パターンと戻り値必要ハンドラの使い分け、`track()` クロージャによる成功カウント管理、`sanitizeRegistrationErrorMessage` のパスマスク、既存テスト失敗との分離手法を苦戦箇所として整理し、5ステップの再利用手順を標準化 |
| 2026-03-08 | 1.29.51 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 再監査の教訓を追加。Phase 1 正本と outputs の FR ドリフト、Phase 11 の TC/証跡不足、`validate-phase-output` の引数誤用、`artifacts.json` / `index.md` stale を同時是正し、4ステップの再監査手順を標準化 |
| 2026-03-08 | 1.29.50 | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 の教訓を追加。fallback handler 追加漏れ、transport message と UI localized message の責務混同、App shell 起点 screenshot の不安定さを整理し、4ステップ解決手順と 5分解決カードを追記 |
| 2026-03-08 | 1.29.49 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 の教訓を追加。SettingsView 統合回帰での screenshot 検証失敗（ポート競合）、`act()` warning 残存、Phase 12 の計画記述残置を整理し、4ステップ再利用手順を追記 |
| 2026-03-08 | 1.29.48 | TASK-10A-F Phase 12 タスク仕様再確認の教訓を追補。comparison baseline を validator PASS に揃えずに branch 判定すると結論がぶれる点と、未タスク current/baseline の二層報告を system spec / workflow outputs / skill files に同時同期する必要を追加 |
| 2026-03-08 | 1.29.47 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の再監査教訓を追補。Phase 11証跡表ヘッダ不一致による validator 失敗と、screenshot 再取得時の Rollup optional dependency 欠落を苦戦箇所として追加し、preflight + 機械検証の標準手順を固定 |
| 2026-03-07 | 1.29.46 | TASK-10A-F 再確認の教訓を追加。Phase 11 文書名ドリフト（`manual-testing` vs `manual-test`）、TC証跡の未参照化、Phase 12 changelog の「対象/予定」残置を苦戦箇所として整理し、4ステップの再発防止手順を追記 |
| 2026-03-07 | 1.29.45 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の教訓を追加。`apiKey:list` 契約型の文書ドリフト（`ProviderStatus[]` vs `ProviderListResult`）と、画面検証を自動テスト代替で済ませてしまう運用リスクを同時に是正し、スクリーンショット検証を標準化 |
| 2026-03-07 | 1.29.45 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の教訓を追加。`apiKey:list` 契約型の文書ドリフト（`ProviderStatus[]` vs `ProviderListResult`）と、画面検証を自動テスト代替で済ませてしまう運用リスクを同時に是正し、スクリーンショット検証を標準化 |
| 2026-03-07 | 1.29.44 | TASK-UI-03-AGENT-VIEW-ENHANCEMENT の教訓を追加。z-index事前設計の有効性、CSS変数ベース定数抽出タイミング（P47派生）、アクセシビリティ属性の段階的検出パターンの3課題と再利用手順を追記 |
| 2026-03-06 | 1.29.43 | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 を追加。`aiworkflow-requirements` が 145 warning を残す理由を「大規模 reference スキルの入口設計と validator 前提の不整合」として分離し、`SKILL.md` / `quick-reference.md` / `resource-map.md` の三層入口と validator 整合を未タスク化した |

## 最新教訓

### 2026-03-15 UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001

#### 苦戦箇所1: workflow が実体完了でも `index.md` / `artifacts.json` / `phase本文` が `not_started` のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | outputs と実装差分は揃っていても、workflow 本文台帳の同期が遅れると再監査時に未実施と誤読される |
| 再発条件 | validator PASS のみで Phase close を判断する |
| 解決策 | `artifacts.json`・`index.md`・`phase-1..12` のステータスを同一ターンで completed 同期した |
| 標準ルール | Phase 12 close-out は「成果物・台帳・phase本文」の三層同時更新を必須にする |

#### 苦戦箇所2: runtime handoff 契約を executor 側だけ更新すると UI/state がドリフトする

| 項目 | 内容 |
| --- | --- |
| 課題 | `skill:execute` / `agent:start` の handoff 応答を仕様化しても、`TerminalHandoffCard` と `handoffGuidance` の state 契約が未同期だと実装理解が分断される |
| 再発条件 | interfaces 更新だけで Step 2 を完了扱いにする |
| 解決策 | `arch-electron-services` / `ui-ux-agent-execution` / `arch-state-management` / `task-workflow` / `history` を同時更新した |
| 標準ルール | runtime routing 変更は Main・Preload・UI・Store の4層を最低同期単位にする |

#### 苦戦箇所3: alias import による同名クラス衝突回避

| 項目 | 内容 |
| --- | --- |
| 課題 | `services/chat-edit/RuntimeResolver.ts` と `services/runtime/RuntimeResolver.ts` が同名クラス。`ipc/index.ts` で両方 import すると名前衝突 |
| 再発条件 | 共通化のため同名サービスを新ディレクトリに切り出す |
| 解決策 | `import { RuntimeResolver as ChatEditRuntimeResolver }` で alias 分離。元のパスは型システムで追跡可能 |
| 標準ルール | 同名クラスの共通化では、特化版に alias を付けて共通版を素のまま import する |

#### 苦戦箇所4: replace_all による後方互換テスト破壊

| 項目 | 内容 |
| --- | --- |
| 課題 | Edit ツールで `replace_all: true` を使い `registerSkillHandlers(mockMainWindow, mockSkillService as never)` を全置換したところ、後方互換テスト（RuntimeResolver 未注入ケース）まで書き換わった |
| 再発条件 | テストファイル内に同一パターンが複数箇所あり、一部だけ変更したい場合に `replace_all` を使用 |
| 解決策 | `replace_all: false`（デフォルト）で個別に Edit するか、変更後に後方互換テストを手動で元に戻す |
| 標準ルール | テストファイルの Edit は `replace_all` を避け、対象箇所のコンテキストを十分に含めた個別 Edit を使う |

#### 苦戦箇所5: Linter 自動修正によるテストアサーション型変更

| 項目 | 内容 |
| --- | --- |
| 課題 | PostToolUse Hook の Prettier/ESLint が `skillHandlers.runtime.test.ts` の応答型キャストを変更。`opResult.handoff` → `opResult.data?.handoff` に自動書き換えされた |
| 再発条件 | IPC envelope（`{ success, data }`）をアンラップせずにアサーションすると、Linter が型推論に基づいて修正 |
| 解決策 | テスト側で IPC envelope 構造を正確に反映した型キャスト（`result as { success: boolean; data?: { handoff?: boolean } }`）を使用 |
| 標準ルール | IPC テストのアサーションは実際の応答構造に合わせ、Linter 修正後も意図どおりの検証になっているか確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs --strict` と `validate-phase11-screenshot-coverage` を先に実行し、成果物欠落を先に潰す。
2. `artifacts.json` / `index.md` / `phase-1..12` を completed 同期し、Phase 13 のみ未実施に固定する。
3. Step 2 は executor だけで閉じず、electron-services / ui / state / task-workflow / lessons を同時更新する。
4. screenshot が fallback の場合は metadata に理由・source を残し、coverage validator PASS まで閉じる。
5. テスト Edit 後は PostToolUse Hook の差分を `git diff` で確認し、Linter 自動修正が意図に反していないか検証する。

#### 関連改善タスク

| 未タスクID | 概要 | ステータス |
| --- | --- | --- |
| UT-FIX-AGENT-HANDLERS-WORKTREE-PACKAGE-RESOLUTION-001 | worktree 環境の @repo/shared パッケージ解決修復 | 未実施 |
| UT-IMP-IPC-HANDOFF-ENVELOPE-CONSISTENCY-001 | skill:execute / agent:start の handoff 応答 envelope 統一 | 未実施 |
| UT-IMP-RUNTIME-RESOLVER-CHATEDIT-INTEGRATION-TEST-001 | ChatEditRuntimeResolver パスの統合テスト追加 | 未実施 |

### 2026-03-15 UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001

#### 苦戦箇所1: 同名ファイルの二重存在（P58）

| 項目 | 内容 |
| --- | --- |
| 症状 | `chatEditHandlers.ts` が `ipc/` と `handlers/` の2箇所に存在し、テスト対象の特定に混乱 |
| 原因 | IPC handler 版（`ipc/chatEditHandlers.ts`）と service handler 版（`handlers/chatEditHandlers.ts`）が異なる責務で並存 |
| 解決 | `grep -rn "registerChatEditHandlers"` で export パターンを確認し、IPC 版が正本と判定。テストファイル冒頭にコメントで P58 判定根拠を明記 |

#### 苦戦箇所2: RuntimeResolver mock 戦略（P61 派生）

| 項目 | 内容 |
| --- | --- |
| 症状 | RuntimeResolver が `type: "integrated"` を返すと ChatEditService コンストラクタの mock が必要になり、テスト複雑度が爆発 |
| 原因 | 動的アダプタ注入パターンにより、`resolve()` の戻り値で後続の依存注入先が変わる |
| 解決 | `type: "handoff"` を返すように mock し、ChatEditService の生成を回避。TerminalHandoffBuilder の mock を追加して handoff パスのみテスト |

#### 苦戦箇所3: vi.spyOn vs vi.mock の判断（isAllowedPath）

| 項目 | 内容 |
| --- | --- |
| 症状 | `isAllowedPath` を完全 mock すると TC-WS-04（パストラバーサル）で `path.resolve()` の正規化が動作せず、実際のセキュリティ検証ができない |
| 原因 | `vi.mock` はモジュール全体を差し替えるため、内部ロジック（path.resolve）も失われる |
| 解決 | `vi.spyOn(PathValidatorModule, "isAllowedPath")` で spy のみ設定し、実装を保持。TC-WS-04 ではパストラバーサルの正規化結果を実際に検証 |

#### 再利用手順（5分解決カード）

1. **P58判定**: `grep -rn "export.*register" apps/desktop/src/main/` で同名ファイルの責務を確認
2. **RuntimeResolver mock**: `type: "handoff"` で mock すればサービス層の依存を回避可能
3. **spy vs mock 判断**: セキュリティロジックのテストでは `vi.spyOn` で実装を保持し、実際のバリデーション動作を検証
4. **IPC handler capture パターン**: `vi.mocked(ipcMain.handle).mockImplementation((ch, h) => { map.set(ch, h) })` で handler を Map にキャプチャ
5. **テスト実行**: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`

#### 苦戦箇所4: repo-wide テスト失敗を「新規未タスク」に誤判定しやすい

| 項目 | 内容 |
| --- | --- |
| 症状 | `pnpm --filter @repo/desktop test:run` で agent 系 3 スイートの `@repo/shared` 解決失敗が再発し、今回タスク起因か既存課題かの判定が揺れた |
| 原因 | 差分監査（current）と既存負債（baseline）を分離せずに「失敗=新規未タスク」と扱ってしまう |
| 解決 | 既存未タスク `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md` へ紐付け、`--diff-from HEAD` で current 0 を確認。新規 formalize は見送った |

#### 同種課題の簡潔解決手順（4ステップ）

1. repo-wide 失敗を検出したら、まず既存未タスク台帳（`docs/30-workflows/unassigned-task/`）を照合する。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. 継続課題候補は `audit-unassigned-tasks --json --target-file <file>` で個票品質を確認する。
4. `currentViolations=0` かつ既存未タスクで説明可能なら、新規未タスクは増やさず参照更新だけ行う。

#### 関連未タスク
- [`task-ut-chat-edit-integrated-path-workspace-guard-001`](../../docs/30-workflows/unassigned-task/task-ut-chat-edit-integrated-path-workspace-guard-001.md) — integrated path の workspace 制約テスト（P61 派生）
- [`task-imp-ipc-handler-duplicate-detection-guard-001`](../../docs/30-workflows/unassigned-task/task-imp-ipc-handler-duplicate-detection-guard-001.md) — IPC handler 同名ファイル重複検出ガード（P58）

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

#### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |
### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）

#### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュは避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

### 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

#### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。  
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。  
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。  
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。  
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。  

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

#### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

#### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）

#### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュは避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

### 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

#### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。  
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。  
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。  
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。  
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。  

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

#### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

#### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。

## アーカイブ

- [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) — 2026-03-01〜2026-03-13 の教訓
