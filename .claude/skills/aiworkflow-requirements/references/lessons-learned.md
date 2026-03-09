# Lessons Learned（教訓集）

> **相対パス**: `references/lessons-learned.md`
> **読み込み条件**: 実装タスク開始時、または類似課題に遭遇した場合

---

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
| 2026-03-06 | 1.29.42 | UT-TASK-10A-B-008 の追補4を追加。repo 内 `skill-creator/SKILL.md` が `resource-map.md` 依存に偏って warning 26件を残した苦戦箇所を追記し、`SKILL.md` と `resource-map.md` の二重導線 + `quick_validate` warning=0 を標準ルール化 |
| 2026-03-06 | 1.29.41 | UT-TASK-10A-B-008 の Phase 12 Task 1 再確認を追補。実装ガイドが Part 1/2 構造だけ満たしても内容不足のまま通り得る苦戦箇所を追加し、`validate-phase12-implementation-guide.js` による内容検証を標準ルール化 |
| 2026-03-06 | 1.29.40 | UT-TASK-10A-B-008 再監査追補を反映。ユーザー明示の screenshot 要求で `useSkillAnalysis` の StrictMode ローディング固着と light-theme mock 不整合を検出し、`SCREENSHOT + Apple review` 優先ルールを追加 |
| 2026-03-06 | 1.29.39 | UT-TASK-10A-B-008 完了を反映。SkillAnalysisView の current active set を `002 / 004 / 005 / 006 / 007 / 009` に再計算し、completed 集合 `001 / 003 / 008` を別管理へ分離。`validate-task10ab-ledger-sync` による canonical/derived 同期検証を再利用ルールへ追加 |
| 2026-03-06 | 1.29.38 | TASK-UI-02 完了移管を反映。workflow を `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` へ移動し、派生未タスク 2 件を同 workflow の `unassigned-task/` 配下へ移管した状態へ教訓導線を同期 |
| 2026-03-06 | 1.29.37 | lessons 既存リンク欠落を是正。completed へ移管済みの `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` / `UT-IMP-PHASE11-WORKTREE-PROTOCOL-001` の参照先を実体パスへ更新し、ワイルドカード表現による `verify-unassigned-links` の false fail を避ける文言へ修正 |
| 2026-03-06 | 1.29.36 | TASK-UI-02 派生未タスクを追加。domain UI spec 同期漏れと workflow 本文 stale を `UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001` / `UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001` として登録し、教訓節から直接たどれるようにした |
| 2026-03-06 | 1.29.35 | TASK-UI-02-GLOBAL-NAV-CORE 再々監査追補。`artifacts.json` / `index.md` が completed でも workflow 本文 `phase-1..11` に `pending` が残る stale を苦戦箇所へ追加し、Phase 12 の三層同期（成果物 / 台帳 / 本文仕様書）を標準手順へ拡張 |
| 2026-03-06 | 1.29.34 | TASK-UI-02-GLOBAL-NAV-CORE 再監査追補。mobile tab bar のラベル切れを `mobileLabel` + `aria-label` 分離で解消する指針と、`phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` の四点同期ルールを追加 |
| 2026-03-06 | 1.29.33 | TASK-UI-02-GLOBAL-NAV-CORE の教訓を追加。段階移行で rollback path を維持したまま SoC を守る方法、repo-wide coverage threshold の誤読防止、mobile overlay の画面検証必須化を再利用手順付きで追記 |
| 2026-03-06 | 1.29.32 | `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の Phase 12 完了移管を追補。workflow本体を `completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` へ移動し、関連未タスク2件（selector drift / skillHandlers DI boundary）を `completed-tasks/unassigned-task` へ移管した状態に同期 |
| 2026-03-06 | 1.29.31 | `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001` を追補。`TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の再確認で残った `skillHandlers.ts` の責務肥大化を苦戦箇所として追加し、DI境界整理（composition root集約）を未タスク導線へ固定 |
| 2026-03-06 | 1.29.30 | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の教訓セクションを新設。実装内容（AuthKeyService 単一生成 + SkillExecutor DI統一）と苦戦箇所（DIシグネチャドリフト、Phase 12台帳ドリフト、教訓反映漏れ）を再発条件付きで固定し、4ステップ再利用手順を追加 |
| 2026-03-05 | 1.29.29 | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の Phase 12再確認を追補。成果物実体は完了しているのに `phase-12-documentation.md` が `pending` のまま残る台帳ドリフトを苦戦箇所として追加し、`verify-all-specs` / `validate-phase-output` / Task 12-1〜12-5実在チェックの3点突合で同期する手順を標準化 |
| 2026-03-05 | 1.29.28 | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査追補。`SkillExecutor` DIコード例の旧シグネチャ（`new SkillExecutor(mainWindow)`）を現行実装（`new SkillExecutor(mainWindow, undefined, authKeyService)`）へ同期し、文書内の実装ドリフトを解消 |
| 2026-03-06 | 1.29.30 | UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 を関連未タスクとして追加。5分解決カードの3仕様書同期（存在/順序/検証ゲート）を機械検証する改善導線を TASK-INVESTIGATE 教訓セクションへ反映 |
| 2026-03-06 | 1.29.29 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補2: 教訓セクションへ「同種課題の5分解決カード（契約境界 + 画面証跡）」を追加し、症状/根本原因/最短5手順/検証ゲート/同期先3点を固定 |
| 2026-03-06 | 1.29.28 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 の教訓を追加。`AUTH_STATE_CHANGED.user` shape 混在、`linkedProviders` 契約崩れ、`NON_VISUAL` 証跡残置の3課題を再発条件付きで整理し、同種課題向け4ステップ手順を標準化 |
| 2026-03-05 | 1.29.27 | TASK-UI-01-C および UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 の完了移管を反映。workflow を `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` へ移動し、同UTを `completed-tasks/unassigned-task/` へ移管したため、関連導線を完了表記へ更新 |
| 2026-03-05 | 1.29.26 | UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 を追加。TASK-UI-01-C 再監査で再発した `pnpm run test:run --` の全体テスト誤起動リスクと、監査スクリプト所在誤認（`scripts/` 直下想定）を未タスク化し、`pnpm exec vitest run` 直指定 + `test -f` preflight を標準手順として固定 |
| 2026-03-05 | 1.29.25 | TASK-UI-01-C の Phase 12準拠再確認を追補。`validate-phase-output --phase 12` と未タスク差分監査（`current=0` / `baseline=92`）を同時実行する運用、ならびに `pnpm run test:run --` による全体テスト誤起動リスクを苦戦箇所へ追加 |
| 2026-03-05 | 1.29.24 | TASK-UI-01-C 再監査追補。`artifacts.json` と `index/phase` の状態不一致（completed vs pending）を同一ターンで是正する運用と、Phase 11 スクリーンショット灰色化（初期化リロード競合）を回避する preflight（`debug-clear-storage` / `dev-skip-auth` 固定）を追加 |
| 2026-03-05 | 1.29.23 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 教訓を追加。Notification/HistorySearch 実装で発生しやすい「Main/Preload/型定義の3層同期漏れ」「更新系IPCの認証ゲート漏れ」「UI変更なし時のPhase 11証跡曖昧化」を再発条件付きで整理し、4ステップの再利用手順を固定 |
| 2026-03-05 | 1.29.25 | `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を追補。`apps/desktop test:run` の `SIGTERM` 中断時フォールバック（失敗ログ固定 + 分割実行 + 3仕様同期）を未タスク導線として追加 |
| 2026-03-05 | 1.29.24 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 の追補。`apps/desktop test:run` が `SIGTERM` で中断した苦戦箇所を追加し、長時間fixtureテストの分割実行ガードを同種課題の手順へ統合 |
| 2026-03-05 | 1.29.23 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 の教訓を追加。auth-key 既存チャネルで発生した runtime 登録漏れと unregister 非対称更新の苦戦箇所を整理し、再利用4ステップ手順を標準化 |
| 2026-03-05 | 1.29.22 | TASK-UI-01-A-STORE-SLICE-BASELINE の再監査追補。workflow 実体パスの取り違え（`docs/30-workflows/task-056a-a-store-slice-baseline` と他パス混在）を苦戦箇所へ追加し、preflight（`test -d` + `rg --files`）を標準化。関連未タスク `UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001` を登録 |
| 2026-03-05 | 1.29.21 | TASK-UI-01-A-STORE-SLICE-BASELINE の Phase 12準拠再確認を追補。`audit-unassigned-tasks --target-file` の適用境界（`docs/30-workflows/unassigned-task/` 配下限定）と、`current`/`baseline` 判定分離の実運用手順を追加。baseline負債削減用未タスク `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001` を関連登録 |
| 2026-03-05 | 1.29.20 | TASK-UI-01-A-STORE-SLICE-BASELINE 再監査の教訓を追加。Phase 11でTC-ID欠落により証跡検証が失敗した課題、slice件数の基準ドリフト（17→16）、Step 2「更新不要」誤判定を解消する4ステップ手順を標準化 |
| 2026-03-05 | 1.29.19 | UT-TASK-10A-B-009 を追加登録。完了済みUT配置ルールの文書間ドリフトと `audit --target-file` 適用境界誤用を未タスク化し、配置3分類（未実施/完了済みUT/legacy）と `current/baseline` 分離判定を再利用ルールとして固定 |
| 2026-03-05 | 1.29.18 | UT-TASK-10A-B-001 の簡潔解決カードを追補。配置先の3分類（未実施/完了済み/legacy）と `target-file` 適用境界、画面証跡5/5基準、`current/baseline` 分離判定を同一セクションへ固定し、同種課題を短手順で再現できるよう最適化 |
| 2026-03-05 | 1.29.17 | UT-TASK-10A-B-001 の最終再監査追補を追加。完了済み指示書（001）と未実施指示書（002〜008）の配置混在を苦戦箇所として記録し、`completed-tasks`/`unassigned-task` 分離配置 + 参照一括同期 + 監査2軸（current/baseline）で解消する手順を標準化。画面証跡は 11:00 JST 再取得で再確認 |
| 2026-03-05 | 1.29.16 | UT-TASK-10A-B-001 再監査追補を追加。Phase 11 の light検証証跡がテーマモック固定値でdark化する苦戦箇所を記録し、`prefers-color-scheme` 連動モック + 再撮影 + coverage validator（5/5）で整合を回復する手順を標準化 |
| 2026-03-05 | 1.29.15 | UT-TASK-10A-B-001 完了教訓を追加。`SuggestionList` のUI導線追加と `useSkillAnalysis` の状態ロジック追加を分離して実装すると回帰を最小化できる点、Red→Greenで導線未実装を先に固定する有効性、Phase 11 の視覚検証を dark/light/mobile で同時確認する運用を標準化 |
| 2026-03-04 | 1.29.14 | `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加。`validate-phase11-screenshot-coverage` が PASS でも `phase-11-manual-test.md` の画面カバレッジマトリクス未記載 warning が残る苦戦箇所を記録し、視覚/非視覚TCの設計意図を固定する4ステップ手順を標準化 |
| 2026-03-04 | 1.29.13 | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` 追補を追加。Phase 11証跡を別workflow参照のまま残したことで coverage validator が失敗した苦戦箇所を記録し、対象workflow配下への証跡正規配置 + `NON_VISUAL:` 記法固定の4ステップ手順を標準化 |
| 2026-03-04 | 1.29.12 | `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001` の教訓を追加。screenshot再取得時の `Port 5174 is already in use` 混在を再発条件付きで記録し、実行前ポート検査（`lsof`）と競合分岐記録を標準化 |
| 2026-03-04 | 1.29.11 | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` の教訓を追加。screenshot再取得スクリプトの実体と `pnpm run screenshot:*` 公開経路の不一致を再発条件付きで記録し、文書同期・検証ログ固定手順を標準化 |
| 2026-03-04 | 1.29.10 | `UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001` を追加。`--coverage.include` パス誤指定で回帰判定が揺れる苦戦箇所を未タスク化し、`task-workflow.md` 残課題テーブル/追加未タスク表と同期 |
| 2026-03-04 | 1.29.9 | SkillCenter削除導線ホットフィックスの再計測値を確定。対象テストを `delete-confirm/useSkillCenter/useFeaturedSkills` の3ファイルに固定し、`3 files / 30 tests`・coverage `86.89/84.61/88.88` を仕様書へ同期。あわせて Phase 12テンプレート最適化へ未タスク配置先判定（未完了/完了移管）を追補 |
| 2026-03-04 | 1.29.8 | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 の第2回再確認を追加。Phase 11 証跡を 16:50 JST へ更新し、`verify-unassigned-links`（88/88）/ `audit --diff-from HEAD`（baseline=94）へ同期。`UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` の参照先を `completed-tasks/unassigned-task/` へ統一 |
| 2026-03-04 | 1.29.7 | SkillCenter 削除導線ホットフィックスの教訓を追加。`handleRequestDelete` と確認ダイアログ描画の分離で起きる「押せるが削除されない」不具合を再発条件付きで追記し、5ステップ復旧手順（UI状態→描画→操作→回帰→カバレッジ確認）を標準化 |
| 2026-03-04 | 1.29.6 | Phase 12テンプレート最適化の教訓を追加。`skill-creator` のテンプレート本体に preview preflight（build + 疎通）と失敗時未タスク化分岐を同期し、テンプレートと運用パターンのドリフトを解消する5ステップを追記 |
| 2026-03-04 | 1.29.5 | TASK-FIX-SKILL-IMPORT 3連続是正の再監査追補を追加。UI再撮影で `preview` preflight が欠落した苦戦箇所（`ERR_CONNECTION_REFUSED` / module resolve fail）を明記し、未タスク `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` を関連導線へ追加 |
| 2026-03-04 | 1.29.4 | TASK-FIX-SKILL-IMPORT 3連続是正の完了移管を反映。関連未タスク3件の参照を `completed-tasks/unassigned-task/` へ更新し、完了日（2026-03-04）を明記 |
| 2026-03-04 | 1.29.3 | TASK-FIX-SKILL-IMPORT 3連続是正の未タスク追補を追加。`UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001` / `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001` / `UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001` の関連導線を追加し、3workflow再監査の証跡集約・`scope.currentFiles` 判定固定を再利用可能化 |
| 2026-03-04 | 1.29.2 | TASK-FIX-SKILL-IMPORT 3連続是正のPhase 12再確認追補を追加。3workflow同時監査時の証跡ドリフト防止、`audit-unassigned-tasks --target-file` の判定軸誤読防止（`scope.currentFiles` + `currentViolations` 固定）の苦戦箇所と4ステップ手順を追記 |
| 2026-03-04 | 1.29.1 | TASK-FIX-SKILL-IMPORT 3連続是正の教訓を追加。`skill:getImported` 互換復元（id/name混在）、`skill:import` 成功判定（`importedCount`依存の誤り）、SkillCenter欠損メタデータ防御（nullishクラッシュ）を再発条件付きで標準化 |
| 2026-03-04 | 1.29.0 | TASK-10A-D 追補: 再確認で抽出した運用課題を未タスク2件として分離（SubAgent実行ログ必須化 / 画面証跡の状態名+検証目的分離）。`task-workflow` / `ui-ux-feature-components` / `lessons-learned` 同期を前提にした再利用手順を更新 |
| 2026-03-04 | 1.28.9 | TASK-10A-D を仕様書別SubAgent運用へ再編。実装内容サマリー・仕様書別SubAgent分担（task-workflow/ui-ux-feature/lessons/skill-creator）・同種課題向け5ステップを追加し、実装内容と苦戦箇所の同時記録を標準化 |
| 2026-03-04 | 1.28.8 | TASK-10A-D 再確認追補を追加。`audit-unassigned-tasks` の current/baseline 判定分離、TC-02/TC-05 スクリーンショット解釈の曖昧さ解消、再確認5ステップ（verify/validate/links/audit/目視）を標準化 |
| 2026-03-03 | 1.28.7 | TASK-10A-D 教訓を追加。IPC境界の型定義不整合（`unknown[]` vs `Suggestion`型）、P40テスト実行ディレクトリ依存の再発、P11フック起因のEdit失敗の3課題と5ステップ手順を標準化 |
| 2026-03-03 | 1.28.6 | TASK-10A-C 追補: 苦戦箇所を未タスク2件へ分離（UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001, UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001）。5仕様書同時同期ガードとUI証跡3点セット（再撮影/TCカバレッジ/鮮度確認）を再利用導線として固定 |
| 2026-03-02 | 1.28.5 | TASK-10A-C 教訓を追加。UI再撮影後のTC紐付け検証不足、`skill:create` 契約の4仕様書同期漏れ、Phase 11/12 依存成果物参照漏れを防ぐ5ステップ手順を標準化 |
| 2026-03-02 | 1.28.4 | TASK-10A-B 追補: 苦戦箇所3件を未タスク化（UT-TASK-10A-B-006〜008）。Phase 11必須節検証、画面証跡鮮度確認、未タスク件数再計算同期のガード指示書を `docs/30-workflows/unassigned-task/` に追加し、再発防止導線を固定 |
| 2026-03-02 | 1.28.3 | TASK-10A-B 再監査教訓を追加。Phase 11 のコード分析ベース残置、`phase-11-manual-test.md` 必須節欠落、未タスク件数ドリフト（7→5）を解消する5ステップ手順を標準化 |
| 2026-03-02 | 1.28.2 | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 を追加。2workflow同時監査の証跡集約、Task 1/3/4/5 実体突合、UI画面証跡鮮度確認、current/baseline 分離判定を未タスク化し再利用導線を固定 |
| 2026-03-02 | 1.28.1 | Phase 12準拠再確認（TASK-UI-05A/TASK-UI-05）を追加。2workflow同時監査時の証跡分散、baseline/current誤判定、成果物実体突合漏れを防ぐ4ステップ手順を標準化 |
| 2026-03-02 | 1.28.0 | TASK-UI-05A 再監査教訓を追加。`spec_created` 台帳と実装実体（未追跡ファイル含む）の乖離、未タスクの非正規配置（workflow配下）、画面証跡の鮮度不足を同時に解消する運用を標準化 |
| 2026-03-01 | 1.27.9 | completed-tasks 移管後の参照整合を補正。`UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` と `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` の仕様書リンクを実体パスへ更新 |
| 2026-03-02 | 1.27.10 | TASK-UI-05B 追補: 仕様書ごとSubAgent分割（6責務）を教訓手順へ組み込み、再利用手順を5ステップへ拡張 |
| 2026-03-02 | 1.27.9 | TASK-UI-05B の再確認教訓を追加。Phase 12 参照不足による warning ドリフト、画面証跡の再撮影運用、未タスク監査の current/baseline 分離記録を標準化 |
| 2026-03-01 | 1.27.8 | TASK-UI-05 の教訓を追加。型境界（CategoryId/SkillCategory）、詳細パネル責務集中、Phase 12 三点同期の3課題と5ステップ再利用手順を標準化 |
| 2026-02-28 | 1.27.7 | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の派生未タスク `UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` を記録。仕様書別SubAgent運用での N/A 判定ログ固定と三点突合運用の継続改善タスク化を追記 |
| 2026-02-28 | 1.27.6 | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 追補教訓を追加。仕様書単位SubAgent分離時の N/A 記録漏れを新規課題として追記し、解決手順を5ステップに更新 |
| 2026-02-28 | 1.27.5 | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の Phase 12 実行監査教訓を追加。成果物実体と `artifacts.json` ステータス不一致、`audit-unassigned-tasks` の current/baseline 誤読、チェックリスト未同期の3課題と4ステップ解決手順を標準化 |
| 2026-02-28 | 1.27.2 | TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 教訓追加。`waitForCallback` と `stop` の責務分離、timeout時の副作用排除、呼び出し側明示停止の再発防止手順（4ステップ）を反映 |
| 2026-02-27 | 1.27.1 | TASK-9H 教訓を追加。苦戦箇所3件（IPC配線漏れ、Phase 12成果物不足、phase-12仕様書ステータス未同期）と同種課題向け簡潔解決手順（4ステップ）を反映。task-workflow/spec-update-summary/lessons の三点同期を標準化 |
| 2026-02-28 | 1.27.4 | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 の教訓を追加。未タスクリンクのワイルドカード参照による false fail、`--target-file` の current/baseline 誤読、再確認証跡値ドリフトを防ぐ5ステップ手順を標準化 |
| 2026-02-28 | 1.27.3 | TASK-9I Phase 12再確認の再利用性を最適化。4ステップ手順に加えて「即時実行コマンドセット（verify/validate/links/target監査/diff監査）」を追加し、同種課題の初動を短縮 |
| 2026-02-28 | 1.27.2 | TASK-9I Phase 12再確認の教訓を追加。`--target-file` 監査の current/baseline 誤読、再確認証跡の分散、未タスクの存在確認止まりを解消する4ステップ手順を標準化 |
| 2026-02-28 | 1.27.3 | TASK-9J 教訓セクションをテンプレート準拠へ再整形。仕様書別SubAgent分担（interfaces/api-ipc/security/task-workflow/lessons）と5仕様書同期マトリクスを追加し、再利用導線を強化 |
| 2026-02-28 | 1.27.2 | TASK-9J Phase 12再確認の教訓を追加。IPC登録配線漏れ・責務重複・Preload API命名ドリフトの3課題と、同種課題向け簡潔解決手順（4ステップ）を標準化 |
| 2026-02-27 | 1.27.1 | TASK-9G Phase 12再確認の教訓を追加。検証スクリプト実体探索、`currentViolations`基準判定、UT-9G未タスク5件の配置/フォーマット同時検証を標準手順化 |
| 2026-02-27 | 1.26.3 | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 の教訓セクションをテンプレート準拠へ最適化。各苦戦箇所に「再発条件」「今後の標準ルール」を追加し、再利用性を向上 |
| 2026-02-27 | 1.26.2 | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 の再監査教訓を追加。苦戦箇所3件（Phase 12チェック同期漏れ、完了移管後の親証跡旧参照、検証スクリプト所在誤認）と同種課題向け簡潔解決手順（5ステップ）を反映 |
| 2026-02-27 | 1.27.0 | TASK-9F 再監査追補: 仕様書別SubAgent分担（interfaces/api-ipc/security/task/lessons）と検証証跡（13/13, 28項目, 95/95, current=0）を追加。`spec-update-summary.md` を成果物に追加して再利用手順を強化 |
| 2026-02-26 | 1.26.1 | TASK-9B SkillCreator IPC拡張同期の再監査教訓を追加。苦戦箇所3件（13チャンネル仕様ドリフト、P42 create未完了、current/baseline監査誤読）と同種課題向け簡潔解決手順（5ステップ）を反映 |
| 2026-02-26 | 1.26.3 | TASK-9A-skill-editor Phase 12 再確認の教訓を追加: 実装ガイド2パート要件不足、`audit-unassigned-tasks --target-file` の current/baseline 誤読、未タスク指示書メタ情報重複を再発防止する4ステップ手順を追記 |
| 2026-02-26 | 1.26.2 | TASK-9A 完了同期の教訓を反映: `spec_created` 表記の残存と未タスク台帳の状態ドリフト（実装済みなのに未実施表示）が再発しやすいため、Phase 12で「仕様状態・台帳状態・実装状態」の3点同時照合を必須化 |
| 2026-02-26 | 1.26.1 | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 教訓追加: `quick_validate.js` 実行経路統一後でも Phase 11 でリンク整合と曖昧語検出が詰まりポイントになる事例を追記。`verify-unassigned-links` と grep 判定を先行実行する4ステップ手順を追加 |
| 2026-02-25 | 1.25.9 | UT-UI-THEME-DYNAMIC-SWITCH-001 の再利用性を強化: 同種課題向け「転記テンプレート（5分版）」を追加し、苦戦箇所を再発条件ベースで記録する運用を標準化 |
| 2026-02-25 | 1.25.8 | UT-UI-THEME-DYNAMIC-SWITCH-001 教訓追加: テーマ動的切替実装での苦戦箇所3件（`themeMode`/`resolvedTheme`責務分離、Store Hook再実行ループ、Phase 12証跡同期漏れ）と同種課題向け簡潔解決手順（4ステップ）を追加 |
| 日付       | バージョン | 変更内容                                                                                                                                                                                                                                                                                                       |
| ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-07 | 1.29.45    | TASK-10A-F の教訓を追加。Store移行時のテストmock統一パターン、handleAnalyze try/catch欠落によるUnhandled Rejection、improvementResult Store化見送りの設計判断、グローバルカバレッジ閾値の誤読防止を再発条件付きで記録し、4ステップ再利用手順を標準化                                                           |
| 2026-03-07 | 1.29.44    | TASK-UI-03-AGENT-VIEW-ENHANCEMENT の教訓を追加。z-index事前設計の有効性、CSS変数ベース定数抽出タイミング（P47派生）、アクセシビリティ属性の段階的検出パターンの3課題と再利用手順を追記                                                                                                                         |
| 2026-03-06 | 1.29.43    | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 を追加。`aiworkflow-requirements` が 145 warning を残す理由を「大規模 reference スキルの入口設計と validator 前提の不整合」として分離し、`SKILL.md` / `quick-reference.md` / `resource-map.md` の三層入口と validator 整合を未タスク化した               |
| 2026-03-06 | 1.29.42    | UT-TASK-10A-B-008 の追補4を追加。repo 内 `skill-creator/SKILL.md` が `resource-map.md` 依存に偏って warning 26件を残した苦戦箇所を追記し、`SKILL.md` と `resource-map.md` の二重導線 + `quick_validate` warning=0 を標準ルール化                                                                               |
| 2026-03-06 | 1.29.41    | UT-TASK-10A-B-008 の Phase 12 Task 1 再確認を追補。実装ガイドが Part 1/2 構造だけ満たしても内容不足のまま通り得る苦戦箇所を追加し、`validate-phase12-implementation-guide.js` による内容検証を標準ルール化                                                                                                     |
| 2026-03-06 | 1.29.40    | UT-TASK-10A-B-008 再監査追補を反映。ユーザー明示の screenshot 要求で `useSkillAnalysis` の StrictMode ローディング固着と light-theme mock 不整合を検出し、`SCREENSHOT + Apple review` 優先ルールを追加                                                                                                         |
| 2026-03-06 | 1.29.39    | UT-TASK-10A-B-008 完了を反映。SkillAnalysisView の current active set を `002 / 004 / 005 / 006 / 007 / 009` に再計算し、completed 集合 `001 / 003 / 008` を別管理へ分離。`validate-task10ab-ledger-sync` による canonical/derived 同期検証を再利用ルールへ追加                                                |
| 2026-03-06 | 1.29.38    | TASK-UI-02 完了移管を反映。workflow を `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` へ移動し、派生未タスク 2 件を同 workflow の `unassigned-task/` 配下へ移管した状態へ教訓導線を同期                                                                                                   |
| 2026-03-06 | 1.29.37    | lessons 既存リンク欠落を是正。completed へ移管済みの `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` / `UT-IMP-PHASE11-WORKTREE-PROTOCOL-001` の参照先を実体パスへ更新し、ワイルドカード表現による `verify-unassigned-links` の false fail を避ける文言へ修正                            |
| 2026-03-06 | 1.29.36    | TASK-UI-02 派生未タスクを追加。domain UI spec 同期漏れと workflow 本文 stale を `UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001` / `UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001` として登録し、教訓節から直接たどれるようにした                                                                                 |
| 2026-03-06 | 1.29.35    | TASK-UI-02-GLOBAL-NAV-CORE 再々監査追補。`artifacts.json` / `index.md` が completed でも workflow 本文 `phase-1..11` に `pending` が残る stale を苦戦箇所へ追加し、Phase 12 の三層同期（成果物 / 台帳 / 本文仕様書）を標準手順へ拡張                                                                           |
| 2026-03-06 | 1.29.34    | TASK-UI-02-GLOBAL-NAV-CORE 再監査追補。mobile tab bar のラベル切れを `mobileLabel` + `aria-label` 分離で解消する指針と、`phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` の四点同期ルールを追加                                                                          |
| 2026-03-06 | 1.29.33    | TASK-UI-02-GLOBAL-NAV-CORE の教訓を追加。段階移行で rollback path を維持したまま SoC を守る方法、repo-wide coverage threshold の誤読防止、mobile overlay の画面検証必須化を再利用手順付きで追記                                                                                                                |
| 2026-03-06 | 1.29.32    | `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の Phase 12 完了移管を追補。workflow本体を `completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` へ移動し、関連未タスク2件（selector drift / skillHandlers DI boundary）を `completed-tasks/unassigned-task` へ移管した状態に同期                               |
| 2026-03-06 | 1.29.31    | `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001` を追補。`TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の再確認で残った `skillHandlers.ts` の責務肥大化を苦戦箇所として追加し、DI境界整理（composition root集約）を未タスク導線へ固定                                                                           |
| 2026-03-06 | 1.29.30    | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の教訓セクションを新設。実装内容（AuthKeyService 単一生成 + SkillExecutor DI統一）と苦戦箇所（DIシグネチャドリフト、Phase 12台帳ドリフト、教訓反映漏れ）を再発条件付きで固定し、4ステップ再利用手順を追加                                                               |
| 2026-03-05 | 1.29.29    | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の Phase 12再確認を追補。成果物実体は完了しているのに `phase-12-documentation.md` が `pending` のまま残る台帳ドリフトを苦戦箇所として追加し、`verify-all-specs` / `validate-phase-output` / Task 12-1〜12-5実在チェックの3点突合で同期する手順を標準化                  |
| 2026-03-05 | 1.29.28    | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査追補。`SkillExecutor` DIコード例の旧シグネチャ（`new SkillExecutor(mainWindow)`）を現行実装（`new SkillExecutor(mainWindow, undefined, authKeyService)`）へ同期し、文書内の実装ドリフトを解消                                                                     |
| 2026-03-06 | 1.29.30    | UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 を関連未タスクとして追加。5分解決カードの3仕様書同期（存在/順序/検証ゲート）を機械検証する改善導線を TASK-INVESTIGATE 教訓セクションへ反映                                                                                                 |
| 2026-03-06 | 1.29.29    | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補2: 教訓セクションへ「同種課題の5分解決カード（契約境界 + 画面証跡）」を追加し、症状/根本原因/最短5手順/検証ゲート/同期先3点を固定                                                                                                                     |
| 2026-03-06 | 1.29.28    | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 の教訓を追加。`AUTH_STATE_CHANGED.user` shape 混在、`linkedProviders` 契約崩れ、`NON_VISUAL` 証跡残置の3課題を再発条件付きで整理し、同種課題向け4ステップ手順を標準化                                                                                     |
| 2026-03-05 | 1.29.27    | TASK-UI-01-C および UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 の完了移管を反映。workflow を `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` へ移動し、同UTを `completed-tasks/unassigned-task/` へ移管したため、関連導線を完了表記へ更新                                         |
| 2026-03-05 | 1.29.26    | UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 を追加。TASK-UI-01-C 再監査で再発した `pnpm run test:run --` の全体テスト誤起動リスクと、監査スクリプト所在誤認（`scripts/` 直下想定）を未タスク化し、`pnpm exec vitest run` 直指定 + `test -f` preflight を標準手順として固定                                    |
| 2026-03-05 | 1.29.25    | TASK-UI-01-C の Phase 12準拠再確認を追補。`validate-phase-output --phase 12` と未タスク差分監査（`current=0` / `baseline=92`）を同時実行する運用、ならびに `pnpm run test:run --` による全体テスト誤起動リスクを苦戦箇所へ追加                                                                                 |
| 2026-03-05 | 1.29.24    | TASK-UI-01-C 再監査追補。`artifacts.json` と `index/phase` の状態不一致（completed vs pending）を同一ターンで是正する運用と、Phase 11 スクリーンショット灰色化（初期化リロード競合）を回避する preflight（`debug-clear-storage` / `dev-skip-auth` 固定）を追加                                                 |
| 2026-03-05 | 1.29.23    | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 教訓を追加。Notification/HistorySearch 実装で発生しやすい「Main/Preload/型定義の3層同期漏れ」「更新系IPCの認証ゲート漏れ」「UI変更なし時のPhase 11証跡曖昧化」を再発条件付きで整理し、4ステップの再利用手順を固定                                                     |
| 2026-03-05 | 1.29.25    | `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を追補。`apps/desktop test:run` の `SIGTERM` 中断時フォールバック（失敗ログ固定 + 分割実行 + 3仕様同期）を未タスク導線として追加                                                                                                                           |
| 2026-03-05 | 1.29.24    | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 の追補。`apps/desktop test:run` が `SIGTERM` で中断した苦戦箇所を追加し、長時間fixtureテストの分割実行ガードを同種課題の手順へ統合                                                                                                                                  |
| 2026-03-05 | 1.29.23    | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 の教訓を追加。auth-key 既存チャネルで発生した runtime 登録漏れと unregister 非対称更新の苦戦箇所を整理し、再利用4ステップ手順を標準化                                                                                                                               |
| 2026-03-05 | 1.29.22    | TASK-UI-01-A-STORE-SLICE-BASELINE の再監査追補。workflow 実体パスの取り違え（`docs/30-workflows/task-056a-a-store-slice-baseline` と他パス混在）を苦戦箇所へ追加し、preflight（`test -d` + `rg --files`）を標準化。関連未タスク `UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001` を登録                     |
| 2026-03-05 | 1.29.21    | TASK-UI-01-A-STORE-SLICE-BASELINE の Phase 12準拠再確認を追補。`audit-unassigned-tasks --target-file` の適用境界（`docs/30-workflows/unassigned-task/` 配下限定）と、`current`/`baseline` 判定分離の実運用手順を追加。baseline負債削減用未タスク `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001` を関連登録 |
| 2026-03-05 | 1.29.20    | TASK-UI-01-A-STORE-SLICE-BASELINE 再監査の教訓を追加。Phase 11でTC-ID欠落により証跡検証が失敗した課題、slice件数の基準ドリフト（17→16）、Step 2「更新不要」誤判定を解消する4ステップ手順を標準化                                                                                                               |
| 2026-03-05 | 1.29.19    | UT-TASK-10A-B-009 を追加登録。完了済みUT配置ルールの文書間ドリフトと `audit --target-file` 適用境界誤用を未タスク化し、配置3分類（未実施/完了済みUT/legacy）と `current/baseline` 分離判定を再利用ルールとして固定                                                                                             |
| 2026-03-05 | 1.29.18    | UT-TASK-10A-B-001 の簡潔解決カードを追補。配置先の3分類（未実施/完了済み/legacy）と `target-file` 適用境界、画面証跡5/5基準、`current/baseline` 分離判定を同一セクションへ固定し、同種課題を短手順で再現できるよう最適化                                                                                       |
| 2026-03-05 | 1.29.17    | UT-TASK-10A-B-001 の最終再監査追補を追加。完了済み指示書（001）と未実施指示書（002〜008）の配置混在を苦戦箇所として記録し、`completed-tasks`/`unassigned-task` 分離配置 + 参照一括同期 + 監査2軸（current/baseline）で解消する手順を標準化。画面証跡は 11:00 JST 再取得で再確認                                |
| 2026-03-05 | 1.29.16    | UT-TASK-10A-B-001 再監査追補を追加。Phase 11 の light検証証跡がテーマモック固定値でdark化する苦戦箇所を記録し、`prefers-color-scheme` 連動モック + 再撮影 + coverage validator（5/5）で整合を回復する手順を標準化                                                                                              |
| 2026-03-05 | 1.29.15    | UT-TASK-10A-B-001 完了教訓を追加。`SuggestionList` のUI導線追加と `useSkillAnalysis` の状態ロジック追加を分離して実装すると回帰を最小化できる点、Red→Greenで導線未実装を先に固定する有効性、Phase 11 の視覚検証を dark/light/mobile で同時確認する運用を標準化                                                 |
| 2026-03-04 | 1.29.14    | `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加。`validate-phase11-screenshot-coverage` が PASS でも `phase-11-manual-test.md` の画面カバレッジマトリクス未記載 warning が残る苦戦箇所を記録し、視覚/非視覚TCの設計意図を固定する4ステップ手順を標準化                                            |
| 2026-03-04 | 1.29.13    | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` 追補を追加。Phase 11証跡を別workflow参照のまま残したことで coverage validator が失敗した苦戦箇所を記録し、対象workflow配下への証跡正規配置 + `NON_VISUAL:` 記法固定の4ステップ手順を標準化                                                          |
| 2026-03-04 | 1.29.12    | `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001` の教訓を追加。screenshot再取得時の `Port 5174 is already in use` 混在を再発条件付きで記録し、実行前ポート検査（`lsof`）と競合分岐記録を標準化                                                                                                              |
| 2026-03-04 | 1.29.11    | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` の教訓を追加。screenshot再取得スクリプトの実体と `pnpm run screenshot:*` 公開経路の不一致を再発条件付きで記録し、文書同期・検証ログ固定手順を標準化                                                                                                 |
| 2026-03-04 | 1.29.10    | `UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001` を追加。`--coverage.include` パス誤指定で回帰判定が揺れる苦戦箇所を未タスク化し、`task-workflow.md` 残課題テーブル/追加未タスク表と同期                                                                                                                |
| 2026-03-04 | 1.29.9     | SkillCenter削除導線ホットフィックスの再計測値を確定。対象テストを `delete-confirm/useSkillCenter/useFeaturedSkills` の3ファイルに固定し、`3 files / 30 tests`・coverage `86.89/84.61/88.88` を仕様書へ同期。あわせて Phase 12テンプレート最適化へ未タスク配置先判定（未完了/完了移管）を追補                   |
| 2026-03-04 | 1.29.8     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 の第2回再確認を追加。Phase 11 証跡を 16:50 JST へ更新し、`verify-unassigned-links`（88/88）/ `audit --diff-from HEAD`（baseline=94）へ同期。`UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` の参照先を `completed-tasks/unassigned-task/` へ統一              |
| 2026-03-04 | 1.29.7     | SkillCenter 削除導線ホットフィックスの教訓を追加。`handleRequestDelete` と確認ダイアログ描画の分離で起きる「押せるが削除されない」不具合を再発条件付きで追記し、5ステップ復旧手順（UI状態→描画→操作→回帰→カバレッジ確認）を標準化                                                                              |
| 2026-03-04 | 1.29.6     | Phase 12テンプレート最適化の教訓を追加。`skill-creator` のテンプレート本体に preview preflight（build + 疎通）と失敗時未タスク化分岐を同期し、テンプレートと運用パターンのドリフトを解消する5ステップを追記                                                                                                    |
| 2026-03-04 | 1.29.5     | TASK-FIX-SKILL-IMPORT 3連続是正の再監査追補を追加。UI再撮影で `preview` preflight が欠落した苦戦箇所（`ERR_CONNECTION_REFUSED` / module resolve fail）を明記し、未タスク `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` を関連導線へ追加                                                                        |
| 2026-03-04 | 1.29.4     | TASK-FIX-SKILL-IMPORT 3連続是正の完了移管を反映。関連未タスク3件の参照を `completed-tasks/unassigned-task/` へ更新し、完了日（2026-03-04）を明記                                                                                                                                                               |
| 2026-03-04 | 1.29.3     | TASK-FIX-SKILL-IMPORT 3連続是正の未タスク追補を追加。`UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001` / `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001` / `UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001` の関連導線を追加し、3workflow再監査の証跡集約・`scope.currentFiles` 判定固定を再利用可能化       |
| 2026-03-04 | 1.29.2     | TASK-FIX-SKILL-IMPORT 3連続是正のPhase 12再確認追補を追加。3workflow同時監査時の証跡ドリフト防止、`audit-unassigned-tasks --target-file` の判定軸誤読防止（`scope.currentFiles` + `currentViolations` 固定）の苦戦箇所と4ステップ手順を追記                                                                    |
| 2026-03-04 | 1.29.1     | TASK-FIX-SKILL-IMPORT 3連続是正の教訓を追加。`skill:getImported` 互換復元（id/name混在）、`skill:import` 成功判定（`importedCount`依存の誤り）、SkillCenter欠損メタデータ防御（nullishクラッシュ）を再発条件付きで標準化                                                                                       |
| 2026-03-04 | 1.29.0     | TASK-10A-D 追補: 再確認で抽出した運用課題を未タスク2件として分離（SubAgent実行ログ必須化 / 画面証跡の状態名+検証目的分離）。`task-workflow` / `ui-ux-feature-components` / `lessons-learned` 同期を前提にした再利用手順を更新                                                                                  |
| 2026-03-04 | 1.28.9     | TASK-10A-D を仕様書別SubAgent運用へ再編。実装内容サマリー・仕様書別SubAgent分担（task-workflow/ui-ux-feature/lessons/skill-creator）・同種課題向け5ステップを追加し、実装内容と苦戦箇所の同時記録を標準化                                                                                                      |
| 2026-03-04 | 1.28.8     | TASK-10A-D 再確認追補を追加。`audit-unassigned-tasks` の current/baseline 判定分離、TC-02/TC-05 スクリーンショット解釈の曖昧さ解消、再確認5ステップ（verify/validate/links/audit/目視）を標準化                                                                                                                |
| 2026-03-03 | 1.28.7     | TASK-10A-D 教訓を追加。IPC境界の型定義不整合（`unknown[]` vs `Suggestion`型）、P40テスト実行ディレクトリ依存の再発、P11フック起因のEdit失敗の3課題と5ステップ手順を標準化                                                                                                                                      |
| 2026-03-03 | 1.28.6     | TASK-10A-C 追補: 苦戦箇所を未タスク2件へ分離（UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001, UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001）。5仕様書同時同期ガードとUI証跡3点セット（再撮影/TCカバレッジ/鮮度確認）を再利用導線として固定                                                                |
| 2026-03-02 | 1.28.5     | TASK-10A-C 教訓を追加。UI再撮影後のTC紐付け検証不足、`skill:create` 契約の4仕様書同期漏れ、Phase 11/12 依存成果物参照漏れを防ぐ5ステップ手順を標準化                                                                                                                                                           |
| 2026-03-02 | 1.28.4     | TASK-10A-B 追補: 苦戦箇所3件を未タスク化（UT-TASK-10A-B-006〜008）。Phase 11必須節検証、画面証跡鮮度確認、未タスク件数再計算同期のガード指示書を `docs/30-workflows/unassigned-task/` に追加し、再発防止導線を固定                                                                                             |
| 2026-03-02 | 1.28.3     | TASK-10A-B 再監査教訓を追加。Phase 11 のコード分析ベース残置、`phase-11-manual-test.md` 必須節欠落、未タスク件数ドリフト（7→5）を解消する5ステップ手順を標準化                                                                                                                                                 |
| 2026-03-02 | 1.28.2     | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 を追加。2workflow同時監査の証跡集約、Task 1/3/4/5 実体突合、UI画面証跡鮮度確認、current/baseline 分離判定を未タスク化し再利用導線を固定                                                                                                                        |
| 2026-03-02 | 1.28.1     | Phase 12準拠再確認（TASK-UI-05A/TASK-UI-05）を追加。2workflow同時監査時の証跡分散、baseline/current誤判定、成果物実体突合漏れを防ぐ4ステップ手順を標準化                                                                                                                                                       |
| 2026-03-02 | 1.28.0     | TASK-UI-05A 再監査教訓を追加。`spec_created` 台帳と実装実体（未追跡ファイル含む）の乖離、未タスクの非正規配置（workflow配下）、画面証跡の鮮度不足を同時に解消する運用を標準化                                                                                                                                  |
| 2026-03-01 | 1.27.9     | completed-tasks 移管後の参照整合を補正。`UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` と `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` の仕様書リンクを実体パスへ更新                                                                                                                                                |
| 2026-03-02 | 1.27.10    | TASK-UI-05B 追補: 仕様書ごとSubAgent分割（6責務）を教訓手順へ組み込み、再利用手順を5ステップへ拡張                                                                                                                                                                                                             |
| 2026-03-02 | 1.27.9     | TASK-UI-05B の再確認教訓を追加。Phase 12 参照不足による warning ドリフト、画面証跡の再撮影運用、未タスク監査の current/baseline 分離記録を標準化                                                                                                                                                               |
| 2026-03-01 | 1.27.8     | TASK-UI-05 の教訓を追加。型境界（CategoryId/SkillCategory）、詳細パネル責務集中、Phase 12 三点同期の3課題と5ステップ再利用手順を標準化                                                                                                                                                                         |
| 2026-02-28 | 1.27.7     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の派生未タスク `UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` を記録。仕様書別SubAgent運用での N/A 判定ログ固定と三点突合運用の継続改善タスク化を追記                                                                                                                    |
| 2026-02-28 | 1.27.6     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 追補教訓を追加。仕様書単位SubAgent分離時の N/A 記録漏れを新規課題として追記し、解決手順を5ステップに更新                                                                                                                                                             |
| 2026-02-28 | 1.27.5     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の Phase 12 実行監査教訓を追加。成果物実体と `artifacts.json` ステータス不一致、`audit-unassigned-tasks` の current/baseline 誤読、チェックリスト未同期の3課題と4ステップ解決手順を標準化                                                                            |
| 2026-02-28 | 1.27.2     | TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 教訓追加。`waitForCallback` と `stop` の責務分離、timeout時の副作用排除、呼び出し側明示停止の再発防止手順（4ステップ）を反映                                                                                                                                     |
| 2026-02-27 | 1.27.1     | TASK-9H 教訓を追加。苦戦箇所3件（IPC配線漏れ、Phase 12成果物不足、phase-12仕様書ステータス未同期）と同種課題向け簡潔解決手順（4ステップ）を反映。task-workflow/spec-update-summary/lessons の三点同期を標準化                                                                                                  |
| 2026-02-28 | 1.27.4     | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 の教訓を追加。未タスクリンクのワイルドカード参照による false fail、`--target-file` の current/baseline 誤読、再確認証跡値ドリフトを防ぐ5ステップ手順を標準化                                                                                                            |
| 2026-02-28 | 1.27.3     | TASK-9I Phase 12再確認の再利用性を最適化。4ステップ手順に加えて「即時実行コマンドセット（verify/validate/links/target監査/diff監査）」を追加し、同種課題の初動を短縮                                                                                                                                           |
| 2026-02-28 | 1.27.2     | TASK-9I Phase 12再確認の教訓を追加。`--target-file` 監査の current/baseline 誤読、再確認証跡の分散、未タスクの存在確認止まりを解消する4ステップ手順を標準化                                                                                                                                                    |
| 2026-02-28 | 1.27.3     | TASK-9J 教訓セクションをテンプレート準拠へ再整形。仕様書別SubAgent分担（interfaces/api-ipc/security/task-workflow/lessons）と5仕様書同期マトリクスを追加し、再利用導線を強化                                                                                                                                   |
| 2026-02-28 | 1.27.2     | TASK-9J Phase 12再確認の教訓を追加。IPC登録配線漏れ・責務重複・Preload API命名ドリフトの3課題と、同種課題向け簡潔解決手順（4ステップ）を標準化                                                                                                                                                                 |
| 2026-02-27 | 1.27.1     | TASK-9G Phase 12再確認の教訓を追加。検証スクリプト実体探索、`currentViolations`基準判定、UT-9G未タスク5件の配置/フォーマット同時検証を標準手順化                                                                                                                                                               |
| 2026-02-27 | 1.26.3     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 の教訓セクションをテンプレート準拠へ最適化。各苦戦箇所に「再発条件」「今後の標準ルール」を追加し、再利用性を向上                                                                                                                                                   |
| 2026-02-27 | 1.26.2     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 の再監査教訓を追加。苦戦箇所3件（Phase 12チェック同期漏れ、完了移管後の親証跡旧参照、検証スクリプト所在誤認）と同種課題向け簡潔解決手順（5ステップ）を反映                                                                                                         |
| 2026-02-27 | 1.27.0     | TASK-9F 再監査追補: 仕様書別SubAgent分担（interfaces/api-ipc/security/task/lessons）と検証証跡（13/13, 28項目, 95/95, current=0）を追加。`spec-update-summary.md` を成果物に追加して再利用手順を強化                                                                                                           |
| 2026-02-26 | 1.26.1     | TASK-9B SkillCreator IPC拡張同期の再監査教訓を追加。苦戦箇所3件（13チャンネル仕様ドリフト、P42 create未完了、current/baseline監査誤読）と同種課題向け簡潔解決手順（5ステップ）を反映                                                                                                                           |
| 2026-02-26 | 1.26.3     | TASK-9A-skill-editor Phase 12 再確認の教訓を追加: 実装ガイド2パート要件不足、`audit-unassigned-tasks --target-file` の current/baseline 誤読、未タスク指示書メタ情報重複を再発防止する4ステップ手順を追記                                                                                                      |
| 2026-02-26 | 1.26.2     | TASK-9A 完了同期の教訓を反映: `spec_created` 表記の残存と未タスク台帳の状態ドリフト（実装済みなのに未実施表示）が再発しやすいため、Phase 12で「仕様状態・台帳状態・実装状態」の3点同時照合を必須化                                                                                                             |
| 2026-02-26 | 1.26.1     | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 教訓追加: `quick_validate.js` 実行経路統一後でも Phase 11 でリンク整合と曖昧語検出が詰まりポイントになる事例を追記。`verify-unassigned-links` と grep 判定を先行実行する4ステップ手順を追加                                                                         |
| 2026-02-25 | 1.25.9     | UT-UI-THEME-DYNAMIC-SWITCH-001 の再利用性を強化: 同種課題向け「転記テンプレート（5分版）」を追加し、苦戦箇所を再発条件ベースで記録する運用を標準化                                                                                                                                                             |
| 2026-02-25 | 1.25.8     | UT-UI-THEME-DYNAMIC-SWITCH-001 教訓追加: テーマ動的切替実装での苦戦箇所3件（`themeMode`/`resolvedTheme`責務分離、Store Hook再実行ループ、Phase 12証跡同期漏れ）と同種課題向け簡潔解決手順（4ステップ）を追加                                                                                                   |

| 2026-02-25 | 1.26.0 | UT-FIX-SKILL-EXECUTE-INTERFACE-001 追補: 仕様書別SubAgent分担で同期した際の苦戦箇所（責務境界・同期順序）を追加し、再利用手順を強化 |
| 2026-02-25 | 1.25.9 | UT-FIX-SKILL-EXECUTE-INTERFACE-001 再確認追補: `audit-unassigned-tasks --target-file` の解釈（current/baseline分離）と `validate-phase-output` 位置引数ルールを苦戦箇所へ追加。再確認手順を7ステップへ更新 |
| 2026-02-25 | 1.25.8 | UT-FIX-SKILL-EXECUTE-INTERFACE-001 教訓追加: `skillName` 正式契約と `skillId` 後方互換を同時維持する際の苦戦箇所（契約差分、name->id変換、テスト二重化）と4ステップ解決手順を追加 |
| 2026-02-25 | 1.25.7 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 最終追補: `verify-all-specs.js` の `--workflow` 必須条件を苦戦箇所に追加。再検証コマンドを `quick_validate.js` + `verify-all-specs --workflow` に統一 |
| 2026-02-25 | 1.25.6 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 追補: `quick_validate` 実行経路を `/Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` に統一。検証コマンドの重複記載を整理し、再利用時の経路混同を防止 |
| 2026-02-25 | 1.25.5 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再確認追補: Phase 12準拠確認で発生した苦戦箇所（証跡同期漏れリスク、quick_validate実行経路の混同）を追加。`target→full→validate→sync` の4ステップを標準手順化 |
| 2026-02-25 | 1.25.4 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 教訓追加: `audit-unassigned-tasks.js` の `--target-file`/`--diff-from` による current 判定と、scope未指定の baseline 監視を分離する運用を追加。完了済み未タスク指示書の移管漏れ防止手順を明文化 |
| 2026-02-25 | 1.24.0 | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 教訓追加: task-9D〜9J 仕様差分是正で発生した苦戦箇所3件（旧パス混在、artifacts必須項目漏れ、Date型方針ドリフト）と同種課題向け簡潔解決手順（5ステップ）を追加 |
| 2026-02-25 | 1.25.3 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 の簡潔解決テンプレートを追加。目的/前提/4ステップ/検証/失敗時対処を1ページ化し、同種課題の初動時間短縮を明文化 |
| 2026-02-25 | 1.25.2 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 再監査教訓を追記。全体監査FAILと今回差分FAILの混同、完了移管後リンク更新漏れの2課題を追加し、4ステップ是正手順を明文化 |
| 2026-02-25 | 1.25.1 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 の参照整合を補正。成果物テーブルの未タスク指示書リンクを `completed-tasks/task-ipc-auth-handle-duplicate-001.md` へ更新 |
| 2026-02-25 | 1.25.0 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 教訓追加: AUTH IPC登録一元化で「通常経路とfallback経路を同時に宣言化しないと監査ノイズが残る」点を記録。再発防止として「登録配列化 + fallback回帰テスト + rg監査0件確認」の3ステップを追加 |
| 2026-02-25 | 1.24.0 | UT-IPC-CHANNEL-NAMING-AUDIT-001 教訓追加: 対象外ノイズ（AUTH重複式）を未タスク分離しない場合に完了判定が曖昧化する問題を記録。再発防止として「対象内/対象外分離→未タスク3ステップ→リンク機械検証」の運用手順を追加 |
| 2026-02-24 | 1.23.0 | UT-IPC-DATA-FLOW-TYPE-GAPS-001 実装固有の苦戦箇所4件追加（仕様書修正タスクPhaseテンプレート適用、6ギャップ横断分析、Date型シリアライズ方針統一、positional→object引数移行設計）+ 同種課題向け簡潔解決手順5ステップ追加 |
| 2026-02-24 | 1.22.0 | UT-IPC-DATA-FLOW-TYPE-GAPS-001 教訓追加: Phase 12再監査で判明した苦戦箇所3件（成果物不足、artifacts.json二重管理非同期、未タスク指示書フォーマット不一致）と同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-24 | 1.21.1 | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 教訓追加: Phase 12再監査で判明した苦戦箇所3件（検出ソース網羅漏れ、検証スクリプト終端依存、全体監査と差分判定の混同）と簡潔解決手順（5ステップ）を追加 |
| 2026-02-24 | 1.21.0 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 実装固有の苦戦箇所3件追加（6ハンドラ引数形式の違い、return→throwマイグレーション影響分析、コンテキスト枯渇による3セッション分割）+ 実装面解決手順5ステップ追加 |
| 2026-02-24 | 1.20.0 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 教訓追加: P42準拠バリデーション統一時の苦戦箇所3件（補完タスクと元未タスクの二重管理、Phase 12ステータス同期、未タスクraw検出の既存TODO混在）と同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-24 | 1.20.0 | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 教訓追加: 仕様書修正のみタスクでの反映漏れ（完了台帳未反映、旧参照パス残存、`{outputs` ゴーストディレクトリ）を記録。同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-23 | 1.19.0 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追加: CIガードスクリプト実装の苦戦箇所4件（正規表現パース、キー変換設計、typesVersionsスキップ、process.exitCodeテスタビリティ）。実装内容・成果物・関連ドキュメント更新テーブル追加 |
| 2026-02-22 | 1.18.3 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 の苦戦箇所3件を追加（Phase 10 MINOR残置、Phase 12証跡同期、未タスク監査のベースライン混同）。同種課題向け簡潔解決手順（5ステップ）を追加 |
| 2026-02-22 | 1.18.2 | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 の苦戦箇所3件を追加（同名コンポーネント特定、`skill.id`/`skill.name`混同、偽成功ログの誤読）。同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-21 | 1.18.1 | UT-FIX-SKILL-IMPORT-INTERFACE-001 苦戦箇所2件追加（並列エージェント実行時のコンテキスト分離、completed-task配下のファイル移動時ステータス不整合） |
| 2026-02-21 | 1.18.0 | UT-FIX-SKILL-IMPORT-INTERFACE-001 教訓追加（Phase 12ステータス未同期、旧参照パス残存、Vitest実行ディレクトリ差異）。同種課題向け簡潔解決手順を追加 |
| 2026-02-21 | 1.17.4 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に関連未タスク5件テーブルを追加。苦戦箇所から派生した UT-IMP-PHASE11-WORKTREE-PROTOCOL-001、UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001、UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001 の3件と既存2件を統合 |
| 2026-02-21 | 1.17.3 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に苦戦箇所5-7を追加（マルチエージェントPhase実行の依存順序違反、worktree環境でのPhase 11手動テスト制約、カバレッジ閾値のスコープ解釈） |
| 2026-02-21 | 1.17.2 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に苦戦箇所4を追加（worktree環境でのStep 1-A先送り誤判断）。未実施タスク誤配置（completed-tasks/unassigned-task混在）の再発防止手順を追記 |
| 2026-02-20 | 1.17.1 | UT-FIX-SKILL-REMOVE-INTERFACE-001 セクション品質向上: Before/Afterコード例追加、同種課題解決手順をチェックリスト形式に変更、予防策セクション追加、関連パターン相互参照テーブル追加（P23/P32/P42/P44/P3/P40） |
| 2026-02-20 | 1.17.1 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 を強化: 苦戦箇所4,5追加（paths定義順序、4ファイル同期）、既存3件にコード例追加、「同種課題の簡潔解決手順（5ステップ）」セクション追加 |
| 2026-02-20 | 1.17.0 | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所3件を追加（`skillId/skillName` 契約ドリフト、未タスク配置ドリフト、Vitest実行コンテキスト差異）。同種課題向け簡潔解決手順を追加 |
| 2026-02-20 | 1.17.0 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の苦戦箇所3件を追加（三層整合の同期漏れ、補助型宣言取り込み漏れ、未タスクリンクの既存参照切れ） |
| 2026-02-19 | 1.16.0 | TASK-9A-C 仕様書作成フェーズの苦戦箇所4件を追加（並列エージェントAPIレートリミット、スキルスクリプトパス解決、大規模仕様書コンテキスト管理、Pitfall事前組み込みの有効性） |
| 2026-02-19 | 1.16.0 | TASK-9A-B 技術的苦戦箇所4件追加（handlerMap ESMモック、v8カバレッジ関数カウント、.trim()境界値、isKnownSkillFileError型ガード） |
| 2026-02-19 | 1.15.0 | TASK-9A-C Phase 12準拠監査の苦戦箇所4件を追加（参照パス混在、phase-09/phase-9表記ゆれ、spec_created判定曖昧、未タスクリンク実体不足） |
| 2026-02-19 | 1.15.0 | TASK-9A-B 実装苦戦箇所3件を追加（仕様書の実装事実ドリフト、Preload公開先パス取り違え、未タスクraw検出の誤読防止） |
| 2026-02-19 | 1.15.0 | TASK-FIX-10-1 教訓追加（Step 2要否判定、未タスク検出範囲、Vitest alias運用）。同種課題向けに「簡潔解決手順（5ステップ）」を追加 |
| 2026-02-14 | 1.14.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 実装苦戦箇所4件追加（TypeScript type erasure、ハンドラ応答形式不統一、テストモック波及修正、safeInvokeUnwrap設計判断） |
| 2026-02-14 | 1.13.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 教訓3件追加（仕様書参照正本の不一致、MINOR未タスク化漏れ、完了移管時のリンク不整合） |
| 2026-02-14 | 1.12.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の苦戦箇所を2件追記（IPC_CHANNELS全走査の前提確認、IPC外リスナー解除漏れの防止） |
| 2026-02-14 | 1.12.0 | TASK-FIX-14-1 実装面の技術教訓4件追加（大量テストモック更新、debug後方互換判断、カバレッジ計測注意点、条件ガード削除による簡素化） |
| 2026-02-14 | 1.11.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 教訓追加（ipcMain.handle()二重登録例外、macOS activateライフサイクル） |
| 2026-02-14 | 1.11.0 | TASK-FIX-14-1 教訓追加（Phase 12成果物の実変更ファイル名照合、Step 1-A/1-C/1-D先送り誤判定防止、未タスク登録3ステップ同時完了） |
| 2026-02-13 | 1.10.0 | TASK-FIX-13-1 追加教訓2件（ドキュメント偏重による実装検証省略、並列エージェント成果物品質保証） |
| 2026-02-13 | 1.9.0 | TASK-FIX-13-1 苦戦箇所3件追加（deprecated削除範囲境界、`name`参照誤検出、Phase 12仕様同期漏れ防止） |
| 2026-02-13 | 1.8.0 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 テスト環境教訓3件追加（happy-dom/userEvent非互換、テスト実行ディレクトリ依存、jsdom切替副作用） |
| 2026-02-13 | 1.7.0 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT 教訓追加（Phase 12 Step 1-A/1-D誤判定、未タスクraw検出の誤検知、Vitestモック再初期化の注意点） |
| 2026-02-13 | 1.6.1 | UT-9B-H-003: SkillCreator IPCセキュリティ強化の教訓追加（TDDセキュリティ開発、正規表現パターン検証、YAGNI判断、Phase 12並列エージェント管理） |
| 2026-02-13 | 1.6.0 | UT-9B-H-003 追補教訓を追加（返却仕様の文言不整合、完了済み未タスク残置、Phase 12成果物レジストリ更新漏れ） |
| 2026-02-12 | 1.5.1 | UT-STORE-HOOKS-TEST-REFACTOR-001 苦戦箇所5・6追加（Phase 12 Step 2誤判定、実装ガイドテストカテゴリテーブル不整合） |
| 2026-02-12 | 1.5.0 | UT-STORE-HOOKS-TEST-REFACTOR-001 教訓追加（renderHookパターン移行、テストヘルパー共通化、electronAPIモック統一） |
| 2026-02-12 | 1.4.0 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 教訓追加（個別セレクタ移行、Phase 12チェックリスト管理） |
| 2026-02-12 | 1.3.1 | TASK-9B-H: 苦戦箇所の教訓5-8を追加（Phase 12暗黙的要件、artifacts.json全Phase更新、設計書-実装乖離管理、複数エージェント並列時の仕様書更新漏れ） |
| 2026-02-12 | 1.3.0 | 苦戦箇所1・3のコード例を実際の実装と整合するよう修正（架空のversion/authorフィールド削除、executeSkillシグネチャ修正） |
| 2026-02-12 | 1.2.1 | TASK-9B-H: SkillCreatorService IPCハンドラー登録の教訓追加（Preload統合漏れ、並列Phase実行、IPC型定義配置、artifacts.jsonステータス管理） |
| 2026-02-12 | 1.2.0 | TASK-FIX-7-1 追加苦戦箇所2件記録（Phase間テスト数整合性問題、未タスク指示書作成漏れ） |
| 2026-02-11 | 1.1.0 | テンプレート準拠、目次・コード例追加 |
| 2026-02-11 | 1.0.0 | 初版作成（TASK-FIX-7-1 苦戦箇所記録） |

---

## TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 再監査（2026-03-08）

### 苦戦箇所: Phase 1 正本と outputs の FR がずれていると、未タスク判定まで連鎖して壊れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-1-requirements.md` では FR-04 が unregister 安全性なのに、`outputs/phase-1/requirements-definition.md` では成功ログ要件へ変質していた |
| 影響 | Phase 10 の MINOR 判定、未タスク起票、Phase 12 レポート、security spec の残課題リンクまで誤誘導された |
| 解決策 | Phase 1 正本を基準に outputs/Phase 10/Phase 12/system spec を再同期し、success log 候補は close、ログサニタイズだけを親タスク内で解消した |
| 標準ルール | 仕様ずれを見つけたら、要件正本 → レビュー結果 → 未タスク → system spec の順で連鎖確認する |

### 苦戦箇所: ユーザーが画面検証を要求したのに Phase 11 が CLI代替検証のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` がなく、`manual-test-result.md` も `TC-ID + 証跡` 形式でなかった |
| 影響 | `validate-phase11-screenshot-coverage` が失敗し、画面検証要求に対して実証跡を返せなかった |
| 解決策 | current workflow 配下へ専用 screenshot script を追加し、Dashboard / Settings / Skill Center の代表 surface 3件を再取得した |
| 標準ルール | 画面検証要求がある場合、UI差分の有無に関わらず `TC-ID + SCREENSHOT + S-1〜S-4` を current workflow 配下へ残す |

### 苦戦箇所: `skipAuth=true` が persist bug の再現経路を殺して false negative になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `skipAuth=true` は screenshot 取得を安定化できる一方、auth / App shell 初期化順序由来の bug path を bypass し、`localStorage.clear()` や forced reload の再発確認には使えない場合がある |
| 影響 | screenshot が PASS でも、通常ルートでは debug side effect が残っている可能性を見落とす |
| 解決策 | bug path の確認は通常ルートで `navigation.type` / debug log absence / persist snapshot を metadata 記録し、画面証跡だけ dedicated harness へ分離した |
| 標準ルール | 「bug path 検証」と「screenshot path」は分離して設計する。`skipAuth=true` は screenshot 安定化の補助手段であり、唯一の検証経路にしない |

### 苦戦箇所: `validate-phase-output` の呼び方がテンプレートと正本でずれていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `references/commands.md` は位置引数指定なのに、テンプレートと一部 task doc は `--phase 12` を付けた誤った例を残していた |
| 影響 | branch横断監査表や task doc に誤検証の前提が残り、実態と違う FAIL 記録が残った |
| 解決策 | task-specification-creator の template / agent / phase-template を canonical call に統一し、current task と task-workflow の現行表記も修正した |
| 標準ルール | 検証コマンドは `references/commands.md` を唯一の正本とし、テンプレート側の例も同一ターンで更新する |

### 同種課題の簡潔解決手順（4ステップ）

1. 要件正本と outputs の FR/AC/NFR を最初に突合し、ドリフトを先に潰す。
2. Phase 11 は `TC-ID` / `画面カバレッジマトリクス` / `manual-test-result` / `screenshots/` の4点を current workflow 配下へ揃える。
3. `artifacts.json` / `index.md` / Phase 12 changelog を同一ターンで同期する。
4. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行し、結果を system spec へ反映する。

### 関連未タスク（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 から派生）

| タスクID | 概要 | 指示書パス |
|---|---|---|
| UT-IMP-PHASE11-HARNESS-LIFECYCLE-001 | Phase 11 harness ファイルのライフサイクル管理（作成・削除・本番混入防止） | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-phase11-harness-lifecycle-001.md` |
| UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001 | App.tsx テスト共有モックファクトリ集約（テスト間の重複モック排除） | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-app-test-mock-centralization-001.md` |

---

## TASK-10A-F: Store駆動ライフサイクルUI統合 再確認（2026-03-07）

## 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001: SettingsView 統合回帰強化（2026-03-08）

### 実装内容

- `SettingsView.integration.test.tsx` を 18 テストへ拡張し、auth-mode 切替・provider fallback・status 表示条件・保存導線を回帰対象へ統合
- `settings-test-harness.ts` で store mock と `window.electronAPI` mock を一本化し、ケース差分を options で注入
- Phase 11 実画面検証として `TC-11-03-settings-shell.png` / `TC-11-04-authmode-apikey.png` を取得し、manual test 証跡へ同期

### 苦戦箇所

#### 1. screenshot 検証の初回失敗（ポート競合 + 操作タイムアウト）

- **再発条件**: 既存 dev サーバーが残った状態で Playwright を直接実行する場合
- **症状**: 画面遷移前に timeout し、証跡が欠落する
- **解決策**: 専用 E2E spec を用意し、スクリーンショット取得責務を分離して再実行

#### 2. `act()` warning の残存

- **再発条件**: `apiKey.list()` の非同期更新完了を待たずに assertion を終える場合
- **症状**: テストは PASS でも warning が混在し、ノイズになる
- **解決策**: warning 0件化を未タスク（UT-08-001）へ切り出し、待機パターン標準化を継続

#### 3. Phase 12 changelog に「予定」表現が残る

- **再発条件**: 作業前に changelog を先行記述する場合
- **症状**: 実績と文書が乖離し、完了判定が曖昧化
- **解決策**: 完了済み変更のみ記載し、予定は排除する運用へ統一

### 同種課題の簡潔解決手順（4ステップ）

1. UI証跡が必要なタスクは専用 screenshot spec を先に用意する。
2. 統合テストは harness で state/API 境界を集約し、子コンポーネントの過剰モックを避ける。
3. `act()` warning は「既知」として放置せず未タスク化し、解消期限を管理する。
4. Phase 12 changelog は実績ベースで更新し、`verify-all-specs` で最終突合する。

---

## TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Profile / Avatar fallback ハンドラ追加（2026-03-08）

### 苦戦箇所: Profile / Avatar fallback の追加漏れで `No handler registered` が再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | Auth fallback があっても `profile:*` / `avatar:*` が未登録だと Renderer 側で runtime 例外が続く |
| 再発条件 | Supabase 依存チャネル追加時に Auth だけを fallback 化し、Profile / Avatar の群登録を後回しにする |
| 対処 | `channels.ts` の件数を正本にし、Profile 11 / Avatar 3 を `ReadonlyArray` + `for...of` で宣言的登録して integration test で固定する |
| 標準ルール | Supabase 依存 handler の追加は Auth / Profile / Avatar の fallback 群を同一ターンで点検する |

### 苦戦箇所: transport message と UI localized message の責務が混ざる

| 項目 | 内容 |
| --- | --- |
| 課題 | fallback 実装は正しくても、Renderer が `error.message` をそのまま表示すると日本語 UI の中で英語 message が露出する |
| 再発条件 | state や component props で `error.code` を捨て、文字列 message だけを保持する |
| 対処 | Main は `code + message` を返す transport に徹し、Renderer は `error.code` を正本として localized message を決定する。未実装分は未タスク化する |
| 標準ルール | error envelope の `message` は transport default、最終 UI 文言は Renderer の責務と明記する |

### 苦戦箇所: App shell 起点の screenshot が不安定

| 項目 | 内容 |
| --- | --- |
| 課題 | 画面検証時に App shell の初期化ノイズで対象 view に安定到達できず、契約差分の確認が難しい |
| 再発条件 | ナビゲーション経路全体を毎回通し、対象 view の直描画 harness を持たない |
| 対処 | 本番コンポーネント / Store / 公開 contract を保った `phase11-auth-mode` harness で対象状態を注入し、証跡を取得する |
| 標準ルール | 画面契約の確認は「contract を壊さない最短導線」の harness route を優先する |

### 同種課題の簡潔解決手順（4ステップ）

1. `channels.ts` から対象チャネル件数を確定し、fallback 登録配列と突合する。
2. `registerAllIpcHandlers()` を通常経路 / fallback 経路の if/else 排他へ揃える。
3. `error.code` を正本にする UI 責務線を仕様へ書き、足りない分は未タスク化する。
4. 専用 harness で screenshot を取り、validator / tests / 未タスク監査を同一ターンで回す。

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| fallback 件数ずれ | `rg -n \"PROFILE_|AVATAR_\" apps/desktop/src/preload/channels.ts` で定義数を確認し、fallback 配列件数と揃える |
| runtime 登録漏れ | `pnpm vitest run apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` |
| UI 文言責務混同 | `error.code` を保持し、localized message は Renderer で決定する。未対応は未タスクへ切り出す |
| 画面証跡の不安定化 | App shell ではなく harness route で再現し、`validate-phase11-screenshot-coverage` まで実行する |

---

## TASK-10A-F: スキルライフサイクルUI Store移行（2026-03-07）
### 実装内容
`useSkillAnalysis.ts` の直接IPC呼び出し3箇所（analyze/applyImprovements/autoImprove）をZustand Store個別セレクタ経由に移行。`SkillCreateWizard.tsx` はTASK-10A-Cで移行済みのため変更不要だった。
### 苦戦箇所（実装系）
#### 1. Store移行後のテストmockパターン不統一
- **再発条件**: `vi.mock("../../../store")` でStore個別セレクタをmockする際、State用とAction用で戻り値構造が異なる
- **症状**: テストファイル間でmockパターンが不一致になり、テスト追加時に混乱
- **解決策**: 以下の標準パターンを確立
  - State用: `useSelectorName: () => mockValue`（値を直接返す）
  - Action用: `useActionName: () => mockFunction`（関数を返す）
  - `beforeEach` で `mockFunction.mockReset()` を実行
```typescript
// ✅ 標準Store mockパターン
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
vi.mock("../../../store", () => ({
  // State selectors - return values
  useCurrentAnalysis: () => null,
  useIsAnalyzingSkill: () => false,
  useIsImprovingSkill: () => false,
  useSkillError: () => null,
  // Action selectors - return functions
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => vi.fn(),
}));
```
#### 2. handleAnalyze の try/catch 欠落
- **再発条件**: Store action に処理を委譲した後、Hook側の try/catch を省略
- **症状**: Store action が例外をthrowした場合、Unhandled Promise Rejection が発生し、テストで2件の warning
- **解決策**: Store側でerror処理済みでも、Hook側は必ず try/catch で包む（UIクラッシュ防止の防御コード）
- **ルール**: Store action 呼び出しは常に `try { await storeAction(); } catch { /* Store handles error */ }` パターンで包む
#### 3. improvementResult のStore化見送り判断
- **再発条件**: Store action の戻り値をコンポーネント側で利用したい場合
- **症状**: `applySkillImprovements` Store action はPromise<void>を返すが、実際の改善結果（ImprovementResult）はStore stateに含まれていない
- **解決策**: 設計判断として Case B 方式（ローカルstate維持）を採用。将来必要になれば agentSlice に state を追加
- **教訓**: Store移行時は「何をStoreに入れ、何をローカルに残すか」を明示的に設計書に記録すること
#### 4. グローバルカバレッジ閾値の誤読
- **再発条件**: `pnpm vitest run --coverage` でディレクトリ全体を対象にした場合
- **症状**: 変更対象外のファイル（SkillCenterView等）が0%カバレッジのため、グローバル閾値（Line 80%）が不合格に見える
- **解決策**: 対象ファイルの個別カバレッジを確認（grep で該当行を抽出）。グローバル閾値エラーは変更範囲外のファイルが原因
#### 5. テスト変数名のタイポ（mockCreateSkillSkill）
- **再発条件**: vi.mock内の変数定義と、テスト本文の変数参照で名前が不一致
- **症状**: `ReferenceError: mockCreateSkill is not defined` で11テストが一斉失敗
- **解決策**: mock変数名は `mock{ActionName}` で統一。定義後すぐにテスト本文で参照確認
### 苦戦箇所（ワークフロー系）
#### 6. current workflow の stale 化

| 項目 | 内容 |
| --- | --- |
| 課題 | current workflow の `manual-test-result.md` / `implementation-guide.md` が completed workflow 参照だけで済まされ、validator が落ちる状態でも「仕様は揃っている」と誤認しやすい |
| 再発条件 | `spec_created` workflow を「調査専用」と解釈し、current 側 outputs を実体更新しない場合 |
| 対処 | current workflow 配下に screenshot 11件、`manual-test-result.md`、`capture-results.json`、`implementation-guide.md` を実体として再同期し、Phase 11/12 validator を current へ向けて再実行した |
| 標準ルール | `spec_created` workflow でも `outputs/phase-11` / `outputs/phase-12` は current 正本として更新し、completed workflow は比較対象に留める |

#### 7. completed workflow の legacy drift

| 項目 | 内容 |
| --- | --- |
| 課題 | completed workflow に `phase-7-coverage-verification.md`、`phase-11-manual-testing.md`、古い artifact registry が残っていると、current workflow が正しくても baseline 側 warning が監査ノイズになる |
| 再発条件 | current workflow だけを直し、comparison baseline の completed workflow を「履歴だから」と放置する場合 |
| 対処 | completed workflow も同ターンで `phase-7-coverage-check.md` / `phase-11-manual-test.md` / `screenshot-plan.json` / `discovered-issues.md` / artifact registry まで正規化し、`verify-all-specs --strict` と `validate-phase-output` を PASS に揃えた |
| 標準ルール | current と completed の 2workflow 監査を採る場合、baseline 側も validator PASS まで正規化してから比較結果を記録する |

#### 8. screenshot harness のUI文言依存

| 項目 | 内容 |
| --- | --- |
| 課題 | wizard capture script が内部例外 `スクリーンショット検証用エラー` を待って失敗したが、実UIは store action 側で例外を吸収し `スキル生成に失敗しました` を表示していた |
| 再発条件 | screenshot script が内部実装の error message に依存し、UI表示文言や `data-testid` を待機条件に使わない場合 |
| 対処 | wizard 側は `スキル生成に失敗しました`、analysis 側は `data-testid="skill-analysis-view"` を ready 条件として採用し、scenario 単位の failure diagnostics を追加した |
| 標準ルール | screenshot harness の待機条件は UI 実文言か `data-testid` を正本にし、内部例外 message には依存しない |

#### 9. 未タスク指示書のメタ情報重複

| 項目 | 内容 |
| --- | --- |
| 課題 | legacy 正規化ガード指示書に `## メタ情報` 重複が残っていると、TASK-10A-F 由来 backlog が正しくても directory 全体の監査説明がぶれる |
| 再発条件 | YAML ブロックとテーブルを別見出しに分けて記述する場合 |
| 対処 | `task-imp-unassigned-task-legacy-normalization-001.md` の `## メタ情報` を1つに統合し、TASK-10A-F 由来 3件は canonical backlog として別に管理した |
| 標準ルール | 未タスク指示書は `## メタ情報` 1回、canonical ID で管理し、TASK 由来 backlog と legacy 正規化タスクを混同しない |

#### 10. TC紐付け不足

| 項目 | 内容 |
| --- | --- |
| 課題 | 11枚撮影済みでも、TC-11-08〜11 が文書に未記載で warning が出た |
| 再発条件 | 画面撮影後に manual test 文書の TC テーブル更新を後回しにする場合 |
| 対処 | `phase-11-manual-test.md` に TC-11-01〜11 と証跡マトリクスを追加して一致させた |
| 標準ルール | 「撮影完了→TCテーブル更新→coverage validator 実行」を1セットで運用する |

#### 11. Phase 12 changelog の計画表現偏重

| 項目 | 内容 |
| --- | --- |
| 課題 | 実更新の有無が不明瞭で Step 完了判定が曖昧化した |
| 再発条件 | 実作業前に changelog を先行記述する場合 |
| 対処 | Step 1-A/1-B/1-C/1-D/Step 2 を完了ベースで書き直し、実更新対象へ限定した |
| 標準ルール | `documentation-changelog.md` は「完了済み変更のみ」記述し、予定は記載しない |

#### 12. Phase 11 文書名が validator 期待値と不一致

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-11-manual-testing.md` のみ存在し、validator は `phase-11-manual-test.md` を参照して失敗した |
| 再発条件 | workflow ごとに Phase 11 文書名が揺れる場合 |
| 対処 | `phase-11-manual-test.md` を正本として追加し、TC一覧と証跡リンクを明示した |
| 標準ルール | Phase 11 は `phase-11-manual-test.md` + `manual-test-result.md` の2ファイルを必須にする |

#### 13. comparison baseline を未正規化のまま branch 判定してしまう

| 項目 | 内容 |
| --- | --- |
| 課題 | current workflow が PASS でも、comparison baseline の completed workflow に legacy 名称や欠落成果物が残っていると、Phase 12 の結論が branch 全体で安定しない |
| 再発条件 | `spec_created` workflow だけ修正し、completed workflow を「履歴だから」と放置したまま比較結果を書く |
| 対処 | completed workflow も同ターンで `verify-all-specs --strict` / `validate-phase-output` PASS まで正規化し、current と baseline を別行で記録した |
| 標準ルール | 2workflow 比較を採る場合は `current=実行対象`、`completed=comparison baseline` の両方を validator PASS に揃えてから判定する |

#### 14. 未タスク置き場の current 合格と directory 全体の健全化を混同する

| 項目 | 内容 |
| --- | --- |
| 課題 | TASK-10A-F 由来 3 件は `docs/30-workflows/unassigned-task/` に正しく配置されていても、repo-wide baseline 違反が残るため「指定ディレクトリは完全準拠」とは言えなかった |
| 再発条件 | `audit-unassigned-tasks --diff-from HEAD` の `currentViolations=0` だけを見て、`baselineViolations` を読まずに結論を書く |
| 対処 | レポートに「今回差分合格」と「legacy 負債残存」を分離記録し、legacy 正規化ガード未タスクを参照させた |
| 標準ルール | 未タスク確認は「今回差分の配置・形式」「ディレクトリ全体の legacy 負債」の2軸で報告する |

#### 15. Phase 11 placeholder を current workflow に残してしまう

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` / `screenshots/README.md` に `P53` / `代替` / `スクリーンショット不可` が残ったままだと、system spec が正しくても current workflow は stale のままになる |
| 再発条件 | screenshot 必須へ昇格した後も、初回 docs-only 前提の文言を削除しない場合 |
| 対処 | 実スクリーンショット 11 件へ置換し、`テストケース` / `証跡` 列を持つ validator 互換表へ統一した |
| 標準ルール | current workflow に実証跡が入った時点で placeholder 文言は除去し、`TC-ID ↔ png` のみを残す |

#### 16. implementation-guide は構造があっても validator literal が足りない

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1/Part 2 の2部構成でも、`APIシグネチャ` / `エラーハンドリング` / `設定項目と定数一覧` が無いと validator が落ちる |
| 再発条件 | 実装ガイドを自由記述中心で作り、validator が要求する見出し語をテンプレートへ戻さない場合 |
| 対処 | 実成果物を修正すると同時に `implementation-guide-template.md` 側へ validator 最小骨格を追加した |
| 標準ルール | Phase 12 テンプレート段階で validator 必須見出しを先置きし、空欄でも骨格は削らない |

### 簡潔解決カード
| 項目           | 内容                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **症状**       | Store移行後にテストが大量失敗、または Unhandled Rejection                                                                                       |
| **根本原因**   | mockパターン不統一 / try/catch欠落 / 変数名タイポ                                                                                               |
| **最短手順**   | 1. `vi.mock` の State/Action パターン確認 → 2. 全ハンドラに try/catch 追加 → 3. mock変数名の定義-参照一致確認 → 4. `pnpm vitest run` で回帰確認 |
| **検証ゲート** | テスト全PASS + Unhandled Rejection 0件                                                                                                          |
| **同期先**     | `arch-state-management.md` / `task-workflow.md` / `architecture-implementation-patterns.md`                                                     |
### 再利用手順（Store移行タスク共通）
1. **対象特定**: `grep -rn "window.electronAPI" src/renderer/components/<対象>/` で直接IPC呼び出しを列挙
2. **状態分類**: 各useStateをStore移行/ローカル維持に分類し、設計書に記録
3. **テストmock統一**: State用（値返却）/ Action用（関数返却）の標準パターンで `vi.mock` を作成
4. **防御コード**: 全Store action呼び出しに try/catch を追加（Store側error処理済みでも必須）
### 再利用手順（2workflow監査共通）
1. current/completed 両方の validator を先に PASS 化する
2. screenshot harness は `data-testid` を ready 条件にする
3. screenshot 必須へ昇格したら current workflow から placeholder 文言を除去する
4. 未タスクは `## メタ情報` 1回 + canonical ID で管理し、current/baseline を分離報告する
5. changelog は完了済み変更のみ記述し、`更新済みを確認` と `今回更新` を書き分ける

---

## TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AgentView Enhancement（2026-03-07）

### 苦戦箇所: z-index 事前設計の必要性

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UIコンポーネント追加時に GlobalNavStrip（z-20）、AdvancedSettingsPanel（z-40）、FloatingExecutionBar（z-50）の z-index が衝突するリスクがあった                                           |
| 再発条件   | 複数のオーバーレイ・フローティング要素を持つ画面に新規コンポーネントを追加する場合                                                                                                        |
| 対処       | Phase 2 のアーキテクチャ設計で「z-index 管理テーブル」を事前定義し、全コンポーネントの積層順序を確定させた。結果として Phase 5 実装時に z-index 衝突 0 件を達成                           |
| 標準ルール | UI追加タスクの Phase 2 テンプレートに z-index 管理テーブルを必須欄として含める。新規コンポーネント追加時は既存の z-index 割り当てを `grep -rn 'z-[0-9]' apps/desktop/src/` で事前調査する |

### 苦戦箇所: CSS変数ベースの定数抽出タイミング（P47派生）

| 項目       | 内容                                                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Tailwind arbitrary values（`bg-[var(--status-primary)]`）を使用した場合、テストで長い className 文字列をハードコードしていた。P47 と同様のパターンだが、定数抽出のタイミングが遅れたことで修正コストが増加した |
| 再発条件   | CSS変数ベースのスタイリングを採用し、Phase 5 実装時に定数抽出を行わず、Phase 8 リファクタリングまで先送りする場合                                                                                              |
| 対処       | Phase 8 で `styles.ts` と `animations.ts` を抽出し定数管理に統一。テスト側も定数を import して期待値を生成するパターンに移行した                                                                               |
| 標準ルール | UIコンポーネント追加時は Phase 5 実装直後に CSS変数ベースのスタイル定数抽出を検討する。Phase 8 時点ではテストが多く修正コストが増加するため、早期抽出を推奨する                                                |

**関連パターン**: [06-known-pitfalls.md#P47](../../rules/06-known-pitfalls.md) — CSS変数ベースのスタイルテストアサーション戦略

```typescript
// ❌ Phase 5 でハードコード（修正コスト増）
expect(element).toHaveClass("bg-[var(--status-primary)]");

// ✅ Phase 5 で早期に定数抽出
// styles.ts
export const statusStyles = {
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
};

// テスト側
import { statusStyles } from "./styles";
expect(element.className).toContain(statusStyles.primary);
```

### 苦戦箇所: アクセシビリティ属性の段階的検出パターン

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Phase 5 実装時点で `role="radiogroup"`、`role="dialog"`、`aria-label` 不整合などのアクセシビリティ属性が不足していた                                                                 |
| 再発条件   | UIコンポーネント実装時にアクセシビリティを「後から追加する」前提で進め、Phase 4 テスト設計に WCAG 準拠テストケースを含めない場合                                                     |
| 対処       | Phase 10 最終レビューで MINOR 指摘 3 件として検出し、未タスク化（UT-UI-03-A11Y-DIALOG-001、UT-UI-03-A11Y-LABEL-001、UT-UI-03-A11Y-RADIOGROUP-001）                                   |
| 標準ルール | Phase 4 テスト設計時に WCAG 2.1 AA 準拠のテストケースを含める。具体的には `role` 属性、`aria-label`/`aria-labelledby`、キーボード操作、コントラスト比の4項目を必須チェック対象とする |

**参照**: [01-architecture.md#アクセシビリティ](../../rules/01-architecture.md) — WCAG 2.1 AA 準拠要件

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 2 設計時に z-index 管理テーブルを作成し、既存コンポーネントの z-index を `grep -rn 'z-[0-9]' apps/desktop/src/` で調査する。
2. Phase 4 テスト設計時に WCAG 2.1 AA 準拠テストケース（role、aria-label、キーボード操作、コントラスト比）を含める。
3. Phase 5 実装直後に CSS変数ベースのスタイル定数を `styles.ts` / `animations.ts` に抽出し、テストは定数を import して期待値を生成する。
4. Phase 9 品質検証で `aria-label` / `role` 属性の網羅性を確認し、不足があれば Phase 10 前に修正する。
5. Phase 10 MINOR 指摘はアクセシビリティ関連を含め全て未タスク仕様書に変換し、3ステップ（指示書作成 → 残課題テーブル → 関連仕様書リンク）を完了する。

---

## TASK-UI-02-GLOBAL-NAV-CORE: Global Navigation 基盤移行（2026-03-06）

### 苦戦箇所: rollback path を残したまま新ナビへ責務を寄せると境界が崩れやすい

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `AppDock` を即削除せず feature flag で共存させるため、`App.tsx` と UIコンポーネントの責務が再び肥大化しやすい                                     |
| 再発条件   | 「新UI導入」と「旧UI退避」を同一コンポーネント内で抱え込む場合                                                                                    |
| 対処       | `AppLayout`、`GlobalNavStrip`、`MobileNavBar`、`useNavShortcuts`、`uiSlice` に責務を分離し、`App.tsx` は feature flag と view wiring のみに絞った |
| 標準ルール | 段階移行では「rollback 分岐」と「新機能本体」を別コンポーネントへ分離してから統合する                                                             |

### 苦戦箇所: repo-wide coverage threshold fail が task scope 品質の失敗に見えやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | `vitest --coverage` の終了コードが 1 だと、対象差分が悪いのか全体閾値が高いだけなのか区別しづらい |
| 再発条件   | 大規模アプリで対象ファイルだけを実行しても全体thresholdが掛かる場合                               |
| 対処       | `coverage-final.json` から task scope の実測値を抽出し、repo-wide 値は環境情報として別記した      |
| 標準ルール | coverage は「task scope 実測」と「repo-wide 閾値」を必ず分離して記録する                          |

### 苦戦箇所: mobile overlay の品質は自動テストだけでは確定できない

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 課題       | `MoreMenu` は role/close/focus を自動テストで確認できても、積層感や混雑回避の品質までは見えない            |
| 再発条件   | portal 系 UI を screenshot なしで完了扱いにする場合                                                        |
| 対処       | preview build + Playwright capture で `TC-11-03-mobile-more-menu.png` を取得し、Apple HIG 観点で再確認した |
| 標準ルール | overlay / sheet / menu を含む UIタスクは Phase 11 で必ず実画面証跡を残す                                   |

### 苦戦箇所: mobile tab bar の全文ラベルは小画面で切れやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | 正式名称をそのまま表示すると、mobile 下部バーで文字が詰まり視認性が落ちる                         |
| 再発条件   | desktop / accessibility 用の正式ラベルを mobile 表示にもそのまま流用する場合                      |
| 対処       | `navContract.ts` に `mobileLabel` を追加し、可視ラベルだけ短縮、`aria-label` は正式名称を維持した |
| 標準ルール | mobile 下部ナビは「表示名」と「支援技術向け名称」を分離して設計する                               |

### 苦戦箇所: Phase 12 完了後も workflow 台帳が stale になりやすい

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `outputs/phase-12` が揃っていても、`phase-12-documentation.md` や `index.md` だけでなく workflow 本文 `phase-1..11` に `pending` が残ると監査上は未完了に見える                                              |
| 再発条件   | `complete-phase.js` 実行後に `outputs/artifacts.json` / workflow `index.md` / completed 扱いの Phase 本文を再同期しない場合                                                                                  |
| 対処       | `phase-1..11` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同一ターンで更新し、`generate-index.js --workflow ... --regenerate` と pending 検出 `rg` を実行した |
| 標準ルール | Phase 12 完了判定は「成果物実体 + 台帳同期 + 本文仕様書同期」で閉じる                                                                                                                                        |

### 同種課題の簡潔解決手順（7ステップ）

1. nav 契約を `navContract.ts` へ集約し、UI側は参照だけにする。
2. layout、desktop/tablet nav、mobile nav、shortcut、state を別コンポーネント/Hook/Slice に切り分ける。
3. rollback path は feature flag へ隔離し、削除完了とは別ゲートで扱う。
4. mobile 下部ナビは `mobileLabel` と `aria-label` を分離し、可読性はスクリーンショットで最終確認する。
5. coverage は task scope 抽出値と repo-wide threshold を分離記録する。
6. Phase 12 は `phase-1..11` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同一ターンで同期する。
7. 最後に `rg -n 'ステータス\\s*\\|\\s*pending' <workflow>/phase-{1..12}-*.md` を実行し、本文 stale が 0 件であることを固定する。

### 関連未タスク（2026-03-06 追補）

| 未タスクID                                   | 要旨                                                                | 参照先                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | UIタスクの Phase 12 で domain 正本まで同期するガード                | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | `artifacts/index` 完了後も残る workflow 本文 stale を検出するガード | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

---

## TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN: Notification/HistorySearch 実装（2026-03-05）

### 苦戦箇所: IPC追加時に Main / Preload / 型定義の3層同期が崩れやすい

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 課題       | チャネル定数だけ更新しても、Preload API定義・型契約が追従せず実行時/型検査でドリフトが発生しやすい      |
| 再発条件   | `ipcMain.handle` 追加後に `channels.ts` / `types.ts` / `preload/index.ts` を同一ターンで更新しない場合  |
| 対処       | Notification 5チャネル + HistorySearch 2チャネルを 3層同時に追加し、`channels.test.ts` で公開境界を固定 |
| 標準ルール | 新規IPCは「Main定義→Preload定数→Preload型→公開API→テスト」の順で1セット更新する                         |

### 苦戦箇所: 更新系IPCの認証ゲートが読み取り系と混在しやすい

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 課題       | Notification更新系（mark/delete）と取得系（history/getUnreadCount）で認証要件が異なり、ガード漏れが起きやすい          |
| 再発条件   | `safeHandle` 登録時に「読み取り/更新」の区分を明示せず、共通実装で処理する場合                                         |
| 対処       | 更新系のみ `validateIpcSenderAndContext(..., { requireAuth: true })` を必須化し、異常系テストで `AUTH_REQUIRED` を固定 |
| 標準ルール | IPC設計時に「認証要否」をチャネル単位で先にテーブル化してから実装する                                                  |

### 苦戦箇所: Phase 11 スクリーンショット採取で初期化リロードが干渉し灰色画像になりやすい

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 認証初期化と `window.location.reload()` が競合すると、実画面ではなく灰色単色の証跡が生成される                                  |
| 再発条件   | キャプチャ前に `sessionStorage.debug-clear-storage` と `localStorage.dev-skip-auth` を固定しない場合                            |
| 対処       | `capture-task-056c-notification-history-screenshots.mjs` で init script を注入し、`SCREENSHOT` 3件 + `NON_VISUAL` 3件を分離記録 |
| 標準ルール | Phase 11 は「UI導線=SCREENSHOT」「契約検証=NON_VISUAL」を分離し、同じTC表で管理する                                             |

### 苦戦箇所: `pnpm run test:run --` で全体テストが起動し、対象再確認が遅延しやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | 対象5ファイルだけ再検証する意図でも、`run test:run --` 経由だと設定によって全体テストへ展開される |
| 再発条件   | npm script経由で引数の透過先を確認せず、`--` を使ってテストを絞り込む場合                         |
| 対処       | `pnpm exec vitest run <対象ファイル>` を直接実行し、`5 files / 37 tests` を固定値で再確認した     |
| 標準ルール | 再監査時の対象テスト実行は script ラッパーを使わず、`pnpm exec vitest run` で明示ファイル指定する |

### 同種課題の簡潔解決手順（4ステップ）

1. 追加するIPCを「読み取り/更新」に先に分類し、認証要件テーブルを作る。
2. 実装は Main→Preload定数→Preload型→公開API の順で連続実施し、途中で止めない。
3. 異常系テストで `VALIDATION_ERROR` / `INVALID_SENDER` / `AUTH_REQUIRED` を最低1件ずつ固定する。
4. Phase 11 は `SCREENSHOT` と `NON_VISUAL` を混在運用し、証跡の種類と根拠を同一テーブルで固定する。

### 関連タスク（2026-03-05 追補・完了移管）

| タスクID                                         | 概要                                                                                                                                                         | 参照                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~ | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md` |

---

## TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001: auth-key IPCハンドラ登録漏れ修正（2026-03-05）

### タスク概要

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                                              |
| 目的       | `auth-key:exists` の `No handler registered` を解消し、auth-key 4チャネルのライフサイクル整合を回復する |
| 完了日     | 2026-03-05                                                                                              |
| ステータス | **完了**                                                                                                |

### 苦戦箇所: 既存チャネルと誤認して runtime 配線確認を後回しにしやすい

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | `auth-key:set/exists/validate/delete` の型・契約は存在していたため、`ipc/index.ts` 配線漏れの検出が遅れた |
| 再発条件   | 「チャネル定義がある=実行可能」と解釈し、`registerAllIpcHandlers` を確認しない場合                        |
| 対処       | `registerAuthKeyHandlers(mainWindow, authKeyService)` を `registerAllIpcHandlers` に追加                  |
| 標準ルール | IPC修正は `channels/handlers` だけでなく `register` までを完了条件に含める                                |

### 苦戦箇所: register 側のみ修正して unregister 側が取り残されやすい

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 課題       | 起動直後は動作しても、再初期化サイクルで古いハンドラ状態が残るリスクがあった                       |
| 再発条件   | register のみ更新し、終了・再登録シナリオの検証を省略する場合                                      |
| 対処       | `unregisterAuthKeyHandlers()` を `unregisterAllIpcHandlers` に追加し、複数サイクル回帰テストを実施 |
| 標準ルール | lifecycle 系変更は register/unregister を対称更新し、同一ターンで回帰テストを追加する              |

### 苦戦箇所: 完了台帳は更新したのに教訓化が漏れやすい

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| 課題       | 実装内容だけを `task-workflow.md` へ反映し、再利用可能な苦戦箇所が残りにくい         |
| 再発条件   | Phase 12 Step 2 を「仕様同期のみ」と解釈して `lessons-learned.md` を後回しにする場合 |
| 対処       | 本セクションを追加し、課題/再発条件/対処/標準ルールを固定                            |
| 標準ルール | Phase 12 完了判定は「実装同期 + 教訓同期 + 検証証跡」の三点同時成立に限定する        |

### 苦戦箇所: 成果物が揃っていても `phase-12-documentation.md` が `pending` のまま残りやすい

| 項目       | 内容                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `outputs/phase-12` の成果物が全件存在していても、Phase仕様書本体のステータス/チェックリスト更新が後回しになりやすい                  |
| 再発条件   | 成果物生成を完了条件と誤認し、`phase-12-documentation.md` のメタ情報と完了チェックリストを最終突合しない場合                         |
| 対処       | Task 12-1〜12-5 の成果物実在を確認後、`verify-all-specs`/`validate-phase-output` を再実行し、仕様書本体を `completed` + `[x]` へ同期 |
| 標準ルール | Phase 12完了判定は「成果物実在 + 機械検証PASS + phase-12-documentation同期」の3点が揃うまで確定しない                                |

### 苦戦箇所: `apps/desktop test:run` が `SIGTERM` で中断し、回帰証跡が不安定になる

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator.fixture.test.ts` を含む全量実行でプロセスが `SIGTERM` 終了し、成功/失敗判定が確定しない  |
| 再発条件   | 長時間 fixture テストを常に1コマンド全量実行し、失敗時の分割実行ルールを持たない場合                    |
| 対処       | 失敗ログを証跡化し、`pnpm --filter @repo/desktop exec vitest run <対象>` で分割回帰を実施して合否を確定 |
| 標準ルール | 回帰運用は「全量1本 + 失敗時の分割実行」をセットで定義し、どちらの結果も台帳に残す                      |

### 同種課題の簡潔解決手順（5ステップ）

1. 変更対象IPCの `register/unregister` 呼び出し有無を `ipc/index.ts` で最初に棚卸しする。
2. runtime 配線修正と lifecycle 回帰テスト追加を同一ターンで実施する。
3. `pnpm --filter @repo/desktop test:run` が `SIGTERM` の場合は失敗ログを保存し、`vitest run <対象>` 分割実行で回帰範囲を確定する。
4. Phase 11 の TC証跡を確認し、`validate-phase11-screenshot-coverage` を PASS させる。
5. `task-workflow.md` と `lessons-learned.md` と `api-ipc-system.md` に同じ苦戦箇所を同期して完了判定する。

### 関連未タスク

| 未タスクID                                        | 概要                                                                                                         | 参照                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | `apps/desktop test:run` の `SIGTERM` 中断時フォールバック運用（失敗ログ固定 + 分割実行 + 3仕様同期）を標準化 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |

---

## TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001: SkillExecutor AuthKeyService DI経路統一（2026-03-05）

### 実装内容

| 項目     | 内容                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 目的     | `AuthKeyService` の生成責務と注入責務を1経路へ統一し、preflight判定と実行時判定の差分を排除する                                                                                                        |
| 実装範囲 | `apps/desktop/src/main/ipc/index.ts` / `apps/desktop/src/main/ipc/skillHandlers.ts` / `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                                            |
| 実装要点 | `registerAllIpcHandlers` で `AuthKeyService` を単一生成し、`registerSkillHandlers(mainWindow, skillService, authKeyService)` で注入。`new SkillExecutor(mainWindow, undefined, authKeyService)` へ統一 |
| 完了根拠 | `verify-all-specs` 13/13 PASS、`validate-phase-output` 28項目 PASS、Task 12-1〜12-5成果物実在確認、`phase-12-documentation.md` completed 同期                                                          |

### 苦戦箇所と解決策

#### 苦戦箇所: DIシグネチャの更新漏れで仕様と実装が乖離しやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillExecutor` 生成シグネチャが旧記法のまま文書へ残り、実装と転記内容がずれやすかった                                  |
| 再発条件   | Main配線変更時に `interfaces` と `task-workflow` のコード例を同一ターンで更新しない場合                                 |
| 対処       | `registerSkillHandlers(..., authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を正本へ同期 |
| 標準ルール | DI変更は「Main配線 + 実装コード例 + 型契約」の3点同時更新を必須化する                                                   |

#### 苦戦箇所: 成果物完了後も `phase-12-documentation.md` が `pending` 残置しやすい

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `outputs/phase-12` が揃っていても、仕様書本体のステータス/チェック更新が後回しになりやすい                                          |
| 再発条件   | 成果物実体確認のみで完了判定し、Task 12-1〜12-5 と `phase-12-documentation.md` の相互突合を省略する場合                             |
| 対処       | Task 12-1〜12-5 実在チェック → `verify-all-specs`/`validate-phase-output` 再実行 → `phase-12-documentation.md` completed 同期を固定 |
| 標準ルール | Phase 12完了は「成果物実体 + 機械検証PASS + 仕様書ステータス同期」の3点セットで判定する                                             |

#### 苦戦箇所: 実装内容だけ先に反映され、教訓化が遅延しやすい

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 課題       | 完了台帳には反映済みでも、再発条件付きの教訓が不足し再利用性が下がった             |
| 再発条件   | `task-workflow` 更新を完了扱いにし、`lessons-learned` 反映を別ターンへ持ち越す場合 |
| 対処       | 本セクションを追加し、課題/再発条件/対処/標準ルールを固定した                      |
| 標準ルール | 仕様同期タスクは `task-workflow` と `lessons-learned` を同一ターンで更新する       |

#### 苦戦箇所: `skillHandlers.ts` の責務肥大化でDI境界調整コストが上がる

| 項目       | 内容                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | DI統一後も `skillHandlers.ts` 内に実行器生成責務が残り、handler登録責務との境界が曖昧で差分追跡が重くなる                             |
| 再発条件   | DI改善を「注入引数追加」で止め、composition root への責務集約を後回しにする場合                                                       |
| 対処       | `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001` として未タスク化し、責務分離 + 回帰テスト固定 + 仕様同期を同時実施する導線を作成 |
| 標準ルール | DI修正は「注入経路統一」と「責務境界整理」をセットで計画し、未対応分は即時未タスク登録する                                            |

### 同種課題の簡潔解決手順（4ステップ）

1. Main composition root で依存生成責務を固定し、注入先シグネチャを先に確定する。
2. `ipc/index.ts` / `skillHandlers.ts` / `interfaces` の3点を同一ターンで同期する。
3. `verify-all-specs` と `validate-phase-output` を再実行し、Task 12-1〜12-5 実体を突合する。
4. `phase-12-documentation.md` を `completed` へ同期し、台帳と教訓を同時更新して完了判定する。

### 関連未タスク

| 未タスクID                                                     | 概要                                                                                                                          | 参照                                                                                                                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止~~ **完了: 2026-03-06（Phase 12完了移管）**         | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~         | ~~`skillHandlers.ts` の DI境界整理ガード（composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`         |

---

## TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001: OAuth後 sandbox iterable エラー原因分離（2026-03-06追補）

### タスク概要

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                  |
| 目的       | `AUTH_STATE_CHANGED` payload と `linkedProviders` 契約崩れによる `is not iterable` 障害を再発防止する |
| 完了日     | 2026-03-05（再監査追補: 2026-03-06）                                                                  |
| ステータス | **完了**                                                                                              |

### 苦戦箇所: Main通知 shape と Renderer state shape の境界が揺れやすい

| 項目       | 内容                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 課題       | unlink 後通知で `AUTH_STATE_CHANGED.user` が profile shape のまま流れ、Renderer 側の前提とずれた |
| 再発条件   | Main 側の通知 payload を既存オブジェクトのまま通過させる場合                                     |
| 対処       | Main 通知直前に `toAuthUser(updatedUser)` を適用し、AuthUser 形状へ正規化                        |
| 標準ルール | 認証イベント payload は送信境界で正規化してから IPC 通知する                                     |

### 苦戦箇所: `linkedProviders` の契約崩れが UI 層まで伝播しやすい

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 課題       | `response.data` が配列以外の場合に `is not iterable` を誘発し、画面が停止する            |
| 再発条件   | Renderer 側で API 応答を信頼し、配列・要素検証を省略する場合                             |
| 対処       | `isLinkedProvider` / `normalizeLinkedProviders` を導入し、非配列は `[]` へフォールバック |
| 標準ルール | 外部境界入力は `type guard + normalize` を必須化する                                     |

### 苦戦箇所: 非視覚タスクでもユーザー要求があると画面証跡不足になる

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| 課題       | 初回 Phase 11 が `NON_VISUAL` 記録中心で、UI検証要求に対して証跡不足となった                |
| 再発条件   | 「契約修正中心タスクだから画面証跡は不要」と固定運用する場合                                |
| 対処       | `TC-11-UI-01..03` の実画面証跡を再取得し、`validate-phase11-screenshot-coverage` 3/3 を固定 |
| 標準ルール | ユーザーが UI 検証を要求した時点で `NON_VISUAL` から `SCREENSHOT` へ昇格する                |

### 同種課題の簡潔解決手順（4ステップ）

1. Main 通知 payload と Renderer state の契約境界を先に切り分け、どちらが不整形でも崩れない設計にする。
2. 送信側正規化（Main）と受信側正規化（Renderer）を同時実装し、片側だけで完了扱いにしない。
3. 回帰は対象テストを明示実行し、`3 files / 169 tests` のように件数を証跡化する。
4. Phase 11/12 は `TC-ID ↔ png` の機械検証を通し、`task-workflow` / `api-ipc-system` / `lessons-learned` を同時同期する。

### 同種課題の5分解決カード（契約境界 + 画面証跡）

| 項目       | 内容                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | OAuth後に `is not iterable` が発生し、同時に画面証跡不足で再監査が必要になる                                                                                                                                                                    |
| 根本原因   | Main/Renderer の契約境界が片側のみ修正され、`NON_VISUAL` 固定で証跡昇格が遅れる                                                                                                                                                                 |
| 最短5手順  | 1) Main送信 shape を正規化 2) Renderer受信 shape を `type guard + normalize` で防御 3) 対象テストを件数付きで固定実行 4) UI要求時は `SCREENSHOT` 昇格で TC証跡を再取得 5) `task-workflow`/`api-ipc-system`/`lessons-learned` を同一ターンで同期 |
| 検証ゲート | `verify-all-specs` PASS（13/13）、`validate-phase-output` PASS（28項目）、`validate-phase11-screenshot-coverage` PASS（3/3）、対象テスト PASS（3 files / 169 tests）                                                                            |
| 同期先3点  | `references/task-workflow.md` / `references/api-ipc-system.md` / `references/lessons-learned.md`                                                                                                                                                |

### 関連未タスク

| 未タスクID                                                          | 概要                                                                                     | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/手順順序/検証ゲート）を機械検証する運用ガードを追加する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

---

## TASK-UI-01-A-STORE-SLICE-BASELINE: Store境界基準化の再監査（2026-03-05）

### 苦戦箇所: Phase 11 で TC-ID がなく証跡バリデータが失敗

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | `manual-test-result.md` が `MT-xx` 形式で、`validate-phase11-screenshot-coverage` が TC抽出できず失敗した |
| 再発条件   | 手動テスト結果をシナリオIDのみで管理し、`TC-xx` と証跡列を紐付けない場合                                  |
| 対処       | `phase-11-manual-test.md` に `テストケース` と `画面カバレッジマトリクス` を追加し、`TC-11-01〜03` へ統一 |
| 標準ルール | UI検証は `TC-xx` 必須。`manual-test-result.md` には `テストケース` と `証跡(.png)` 列を必ず置く           |

### 苦戦箇所: Slice件数の基準ドリフト（17 vs 16）

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 課題       | 文書とテストで baseline件数の前提が不一致だった                                  |
| 再発条件   | `store/index.ts` の実体と台帳件数を同一ターンで突合しない場合                    |
| 対処       | 「15 Slice + `ChatEditSlice` = 16行」に統一し、Phase 1/2/4文書とテストを同時修正 |
| 標準ルール | 件数を扱う仕様は「実装grep値 + テスト期待値 + Phase文書」の3点同時更新を必須化   |

### 苦戦箇所: Step 2 を「更新不要」と誤判定しやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | 新規の公開型・基準定数を追加したにもかかわらず、システム仕様更新が未実施になりやすい                                    |
| 再発条件   | 「IPC変更がない」ことだけで Step 2 不要と判断する場合                                                                   |
| 対処       | `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` へ baseline契約を同期し、Step 2 を実施済みに修正 |
| 標準ルール | 新規 public 型/定数を追加した時点で Step 2 対象。IPC有無だけで判定しない                                                |

### 苦戦箇所: `audit --target-file` の適用境界を誤認しやすい

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `outputs/phase-12/*.md` を `--target-file` に渡して監査し、コマンドエラーになった                                                  |
| 再発条件   | `--target-file` が「任意ファイル監査」と誤解される場合                                                                             |
| 対処       | `--target-file` は `docs/30-workflows/unassigned-task/` 配下のみ適用可能と定義し、再監査コマンドを `--diff-from HEAD` へ切り替えた |
| 標準ルール | `--target-file` は未タスク指示書の個別監査専用。成果物監査は `--diff-from HEAD` を使う                                             |

### 苦戦箇所: `current=0` と `baseline>0` の解釈が混在しやすい

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 課題       | repo全体の既存違反（baseline）を今回差分の失敗と誤認しやすい                                          |
| 再発条件   | `audit-unassigned-tasks --json` のみで合否判定する場合                                                |
| 対処       | 合否は `--diff-from HEAD` の `currentViolations` に固定し、baselineは別タスクで段階削減する運用へ分離 |
| 標準ルール | 判定は「current=合否」「baseline=健全性メトリクス」で二軸管理する                                     |

### 苦戦箇所: workflow 実体パスの取り違えが起きやすい

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 同一タスクでも workflow 参照候補が複数見え、`No such file or directory` の手戻りが発生しやすい                                  |
| 再発条件   | 検証コマンド実行前に対象 workflow の実体確認を行わない場合                                                                      |
| 対処       | preflight として `test -d <workflow-path>` と `rg --files docs/30-workflows \| rg '<task-id>'` を実行し、採用パスを先に固定した |
| 標準ルール | Phase 12 再監査は「workflow実体確認 → verify/validate → links/audit」の順序を厳守する                                           |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 11 のTCを `TC-xx` で定義し、証跡列に `.png` を明記する。
2. baseline件数は実装実体（import/create/const）を `rg` で先に確定し、文書とテストへ同時反映する。
3. Step 2判定は「新規 public 型/定数/契約の有無」で行い、仕様正本へ必ず反映する。
4. 最後に `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` を連続実行し、証跡を台帳へ固定する。

### 同種課題の簡潔解決手順（未タスク監査運用 4ステップ）

1. `audit-unassigned-tasks --json --diff-from HEAD` を先に実行し、`currentViolations` を合否に使う。
2. `--target-file` は `docs/30-workflows/unassigned-task/` 配下の実体 `.md` ファイルだけに使い、ワイルドカード表記は残さない。
3. `baselineViolations` は即時修正対象にせず、別未タスク（段階削減）へ分離する。
4. 監査結果を `task-workflow.md` / `unassigned-task-detection.md` / `lessons-learned.md` の3点へ同時反映する。

### 関連タスク（2026-03-05 追補・完了済み移管）

| タスクID                                          | 概要                                                                                                      | 参照                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001  | baseline 負債削減の段階実行（format/naming/misplaced のカテゴリ別是正、完了済み移管）                     | `docs/30-workflows/completed-tasks/task-imp-phase12-unassigned-baseline-reduction-001.md`  |
| UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001 | Phase 12 workflowパス正規化ガード（workflow実体確認 + 監査境界固定 + current/baseline分離、完了済み移管） | `docs/30-workflows/completed-tasks/task-imp-phase12-workflow-path-canonicalization-001.md` |

---

## TASK-UI-05A-SKILL-EDITOR-VIEW: 再監査（2026-03-02）

### 苦戦箇所: `spec_created` 記述と実装実体の状態ドリフト

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 仕様台帳では「実装未着手」と記録されていたが、`views/SkillEditorView` の実装ファイルとテストは存在していた                                      |
| 再発条件   | worktree で仕様更新を後回しにし、台帳と実装の観測タイミングがズレる場合                                                                         |
| 対処       | `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` を同一ターンで再同期し、状態を「実装ファイル実在・統合未完了」に修正 |
| 標準ルール | Phase 12再監査では「コード実体確認（`rg --files`）→ 仕様台帳更新 → 証跡更新」を必須チェーン化する                                               |

### 苦戦箇所: 未タスク指示書の正本配置漏れ

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 課題       | `UT-UI-05A-GETFILETREE-001` が workflow ローカル配下のみで管理され、正規監査対象から外れていた  |
| 再発条件   | Phase 12で検出レポートのみ更新し、`docs/30-workflows/unassigned-task/` への正本化を省略する場合 |
| 対処       | 正規テンプレート準拠で未タスク3件を作成し、`task-workflow.md` 残課題テーブルと同期した          |
| 標準ルール | 未タスクは必ず「正本配置 → 残課題登録 → 関連仕様リンク」の3点を同一ターンで完了させる           |

### 同種課題の簡潔解決手順（4ステップ）

1. `git status --short` と `rg --files` で実装実体の有無を先に確定する。
2. 画面証跡を再取得し、証跡ファイル名を更新履歴へ反映する。
3. 未タスクを `docs/30-workflows/unassigned-task/` に正規作成し、台帳リンクを置換する。
4. `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` で current=0 を確認する。

### Phase 12準拠再確認での苦戦箇所（2026-03-02）

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 課題       | `spec_created` workflow（TASK-UI-05A）と完了workflow（TASK-UI-05）を同時監査した際、証跡の記録先が分散しやすい |
| 再発条件   | 複数workflowを個別に検証してから後で転記する運用                                                               |
| 対処       | 対象workflowを先に固定し、`verify-all-specs` → `validate-phase-output` を2workflow分まとめて実行・記録した     |
| 標準ルール | Phase 12再確認は「対象workflow固定→構造検証→出力検証→成果物突合」を1セットで実施する                           |

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 課題       | `audit-unassigned-tasks` の baseline違反を今回差分違反と誤認しやすい                |
| 再発条件   | repo全体に既存フォーマット違反が残った状態で `--diff-from HEAD` を実行する場合      |
| 対処       | 合否を `currentViolations` のみに固定し、baselineは監視値として分離記録した         |
| 標準ルール | 未タスク監査の合否基準は `currentViolations=0` 固定。baselineは別途改善タスクで扱う |

#### 同種課題の簡潔解決手順（4ステップ）

1. 対象workflowを先に列挙し、`verify-all-specs --workflow <dir>` を全対象へ実行する。
2. `validate-phase-output <dir>` を同じ対象へ実行し、Phase 12必須成果物（Task 1/3/4/5）の実体を突合する。
3. `verify-unassigned-links` と `audit-unassigned-tasks --json --diff-from HEAD` を連続実行し、`currentViolations=0` を判定基準にする。
4. 結果を `task-workflow.md` と `lessons-learned.md` に同一ターンで反映し、次ターンへの持ち越しを禁止する。

### 関連未タスク（2026-03-02 追補）

| タスクID                                        | 概要                                                                                            | 参照                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 | 2workflow同時監査時の証跡集約ガード（Task 1/3/4/5 実体突合 + 画面証跡 + current/baseline 分離） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md` |

---

## TASK-FIX-SKILL-IMPORT 3連続是正（2026-03-04）

### 苦戦箇所: `skill:getImported` の保存キー互換（id/name）を前提にしていなかった

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 課題       | 旧保存データが `skill.name` キーの場合、`cache.get(id)` 前提の復元ロジックだと imported 状態を失う  |
| 再発条件   | 保存形式を `id` へ移行した後に、過去ストレージ互換を仕様へ反映しない場合                            |
| 対処       | `SkillService.getImportedSkills()` で `id` 解決を優先し、未一致時は `name` フォールバック探索を追加 |
| 標準ルール | 永続データのキー移行時は「新形式優先 + 旧形式フォールバック」を明文化する                           |

### 苦戦箇所: `skill:import` 成功判定を `importedCount` に依存していた

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 課題       | 既にインポート済みの正常系で `importedCount=0` となり、失敗扱いされる契約ドリフトが発生した                      |
| 再発条件   | idempotent 操作で「新規件数」を成功条件に使う場合                                                                |
| 対処       | Main IPC の成功判定を `result.success && result.errors.length===0` へ統一し、既存ケースも `ImportedSkill` を返却 |
| 標準ルール | 冪等操作の成功判定は「エラーなし」を基準にし、件数は監視値として扱う                                             |

### 苦戦箇所: SkillCenter で欠損メタデータを想定していなかった

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `description.toLowerCase()` や `agents.length` などが nullish データで例外を起こし、画面が不安定化した                      |
| 再発条件   | 外部生成データ/旧データを UI 入力に含むのに、nullish 防御を入れない場合                                                     |
| 対処       | `String(value ?? "")` / `Array.isArray(value)` の防御関数を Hook+Component 両方へ適用し、TC-01〜04 スクリーンショットで確認 |
| 標準ルール | UIは「文字列正規化」「配列正規化」を境界で必ず実施する                                                                      |

### 同種課題の簡潔解決手順（5ステップ）

1. 契約を IPC/型/状態/UI の4層に分離し、各層で成功条件を明文化する。
2. 永続データ互換は `current` 形式だけでなく `legacy` 形式の復元経路を先に実装する。
3. 冪等APIは「件数」ではなく「エラーなし」を成功判定に固定する。
4. UIは nullish 入力を前提に `String`/`Array` 正規化関数を共通化する。
5. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `audit(current)` を同一ターンで記録する。

### Phase 12再確認追補（2026-03-04）

### 苦戦箇所: 3workflow 同時再監査で証跡転記がドリフトしやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | `verify-all-specs` / `validate-phase-output` を workflow ごとに個別転記すると、件数・実行時刻・判定が台帳間でずれやすい |
| 再発条件   | 複数workflowの再監査結果を別ターンで `task-workflow` と `lessons` に反映する場合                                        |
| 対処       | 3workflow を同一ターンで再実行し、`13/13` と `28項目` をバンドル値として固定してから台帳へ同期                          |
| 標準ルール | 複数workflow再監査は「実行 → 集約表作成 → 台帳/教訓同時転記」の順で完了させる                                           |

### 苦戦箇所: `audit-unassigned-tasks --target-file` の判定軸を誤読しやすい

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 課題       | 出力に baseline 情報が含まれるため、対象ファイルが失敗したように誤解しやすい                               |
| 再発条件   | `target-file` 実行結果を `current` と `baseline` に分けずに読む場合                                        |
| 対処       | `scope.currentFiles` が対象ファイルと一致することを先に確認し、合否は `currentViolations=0` のみで判定     |
| 標準ルール | 未タスク個別監査は `scope.currentFiles` / `currentViolations` / `baselineViolations` を3点セットで記録する |

### 苦戦箇所: UI再撮影の前に preview preflight を固定していなかった

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-center-phase11.mjs` 実行時に `ERR_CONNECTION_REFUSED` が発生し、`Rollup failed to resolve import "@repo/shared/types/skill"` で再撮影が停止した |
| 再発条件   | `pnpm --filter @repo/desktop preview` の build成否と `127.0.0.1:4173` 疎通確認を省略して撮影を開始する場合                                                     |
| 対処       | TC-01〜TC-04 証跡を 2026-03-04 16:50 JST に再取得して視覚検証を継続し、運用ギャップは `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` で管理後に完了移管した     |
| 標準ルール | UI再撮影は「preview preflight（build + 疎通）→再撮影→TCカバレッジ→台帳同期」の4段を必須化する                                                                  |

### 同種課題向け簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` を対象workflow分まとめて実行する。
2. `validate-phase11-screenshot-coverage`（UI workflow）と `verify-unassigned-links` を同ターンで実行する。
3. `audit-unassigned-tasks --diff-from HEAD` で全体合否を `currentViolations=0` で確定する。
4. UI再撮影前に `preview` preflight（build成功 + `127.0.0.1:4173` 疎通）を実行し、失敗時は未タスク化する。
5. `audit-unassigned-tasks --target-file` は `scope.currentFiles` 一致を確認してから記録し、`task-workflow.md` と同時反映する。

### 関連未タスク（2026-03-04 追補）

| タスクID                                              | 概要                                                                                                                   | 参照                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 | SkillCenter hotfix 対象カバレッジの include path ガード（実在パス検証 + `3 files / 30 tests` 固定）                    | `docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md`               |
| UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001            | 3workflow再監査のSubAgent成果物突合を固定し、仕様書別実行ログの欠落を防ぐ（完了: 2026-03-04）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md`          |
| UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001       | `aiworkflow-requirements` からの必要仕様抽出と台帳同期を同一ターンで固定する（完了: 2026-03-04）                       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md`     |
| UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001   | 3workflow再監査で `scope.currentFiles` / `currentViolations` / `baselineViolations` を分離記録する（完了: 2026-03-04） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-three-workflow-audit-scope-guard-001.md` |
| UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001           | SkillCenter 再撮影前の preview preflight と失敗時未タスク化を標準化する（完了: 2026-03-04）                            | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md`         |

### 苦戦箇所: 削除リクエスト状態と確認ダイアログ描画が分離し、削除が実行されなかった

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `handleRequestDelete` で状態は更新されるのに、確認ダイアログ未描画のため `handleConfirmDelete` が呼ばれず削除できなかった |
| 再発条件   | 「削除要求状態（isDeleteConfirmOpen）」を持つ Hook と、実際の確認UI描画コンポーネントが別責務なのに結線確認を省略した場合 |
| 対処       | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`confirm/cancel/Escape` を `useSkillCenter` アクションへ接続    |
| 標準ルール | 「request 系 state を持つなら、対応する confirm UI と confirm action 呼び出しテストを必須化」する                         |

### 同種課題向け簡潔解決手順（5ステップ）

1. 不具合を UI層/Hook層/Store層で分解し、「どの層まで呼ばれているか」をログ/テストで切り分ける。
2. request state（例: `isDeleteConfirmOpen`）を持つHookは、対応する描画UIの存在を先に確認する。
3. confirm action（例: `handleConfirmDelete`）が呼ばれる経路をテストで固定する。
4. 既存回帰（関連ビュー + hook）を再実行し、導線追加での退行を確認する。
5. 対象範囲カバレッジを再計測し、80%以上を維持できていることを記録する。

### 苦戦箇所: 対象カバレッジの include path を誤指定すると実測値が歪む

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | カバレッジ再計測で `--coverage.include` の対象パスを誤ると、想定3ファイルのうち一部しか計測されず、回帰判断が不安定になった                                                         |
| 再発条件   | `views/SkillCenterView/hooks/*` を `src/renderer/hooks/*` として指定するようなパス取り違えがある場合                                                                                |
| 対処       | `--coverage.include` を `index.tsx` / `hooks/useSkillCenter.ts` / `hooks/useFeaturedSkills.ts` の実在3パスへ固定し、`3 files / 30 tests`・coverage `86.89/84.61/88.88` を再確定した |
| 標準ルール | 対象カバレッジ計測の前に `rg --files` で include パス実在を確認し、計測対象ファイル数をログへ明記する                                                                               |

### 今回実装した内容（Phase 12テンプレート最適化）

- `skill-creator` の `phase12-system-spec-retrospective-template.md` に preview preflight と失敗時未タスク化を追加。
- `phase12-spec-sync-subagent-template.md` に preflight と screenshot coverage 検証の必須化を追加。
- 未タスク配置先判定（未完了=`docs/30-workflows/unassigned-task/` / 完了移管=`docs/30-workflows/completed-tasks/unassigned-task/`）をテンプレートへ追補。
- `resource-map.md` と `patterns.md` の説明をテンプレート更新に合わせて同期。

### 苦戦箇所: パターンとテンプレート本体が同期しないと再利用時に漏れが出る

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 成功/失敗パターンには preflight 失敗時の対処があるのに、テンプレート本体のチェック項目に同条件と未タスク配置先判定がなく、仕様更新時に転記漏れが発生しやすかった |
| 再発条件   | `patterns.md` のみ更新して `assets/phase12-*.md` のコマンド・完了チェックを更新しない場合                                                                        |
| 対処       | template本体（2ファイル） + resource-map + patterns を同一ターンで更新し、UI再撮影の前提条件と未タスク配置先判定を一貫化した                                     |
| 標準ルール | 「パターン更新時はテンプレート本体と資源マップも同時更新」を必須にする                                                                                           |

### 同種課題向け簡潔解決手順（5ステップ・テンプレート同期版）

1. まず `patterns.md` の成功/失敗パターンから再発条件を抽出する。
2. `assets/phase12-system-spec-retrospective-template.md` と `assets/phase12-spec-sync-subagent-template.md` の「手順・コマンド・完了チェック（未タスク配置先判定を含む）」を同時更新する。
3. `resource-map.md` のテンプレート説明を同一ターンで同期し、参照面のドリフトを防ぐ。
4. `task-workflow.md` と `lessons-learned.md` に「実装内容 + 苦戦箇所 + 再利用手順」を同時転記する。
5. `quick_validate` で `aiworkflow-requirements` と `skill-creator` の両方を検証し、失敗時は未タスクへ分離する。

### 苦戦箇所: screenshot再取得スクリプトが `run` 一覧へ公開されていないと運用が人依存になる

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-import-idempotency-guard-screenshots.mjs` は存在していたが、`apps/desktop/package.json` scripts 未登録のため実行経路が統一されていなかった |
| 再発条件   | 「スクリプト実体がある」ことのみを完了扱いにして、`pnpm run screenshot:*` 公開を省略した場合                                                              |
| 対処       | `screenshot:skill-import-idempotency-guard` を scripts へ追加し、workflow02 Phase 11/12 文書の実行コマンドを同一表記へ統一した                            |
| 標準ルール | UI証跡運用は「スクリプト実体 + run公開 + 文書同期 + coverage検証」の4点が揃って初めて完了扱いにする                                                       |

### 同種課題向け簡潔解決手順（4ステップ・screenshot公開版）

1. `pnpm --filter @repo/desktop run | rg screenshot` で公開コマンド有無を先に確認する。
2. 未公開なら `package.json` scripts に `screenshot:<feature>` を追加して実体スクリプトへ接続する。
3. Phase 11/12 文書の実行例を `pnpm --filter @repo/desktop run screenshot:<feature>` へ統一し、旧コマンド残存を `rg` で検査する。
4. `validate-phase11-screenshot-coverage` と `verify-all-specs` を同一ターンで実行して結果を台帳へ転記する。

### 苦戦箇所: screenshot 実行時の `Port 5174` 競合で成功/警告が混在する

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `screenshot:skill-import-idempotency-guard` 実行で証跡は取得できるが、`Port 5174 is already in use` が同時出力され判定が揺れた |
| 再発条件   | 並列作業で既存 dev server が残った状態で screenshot コマンドを再実行する場合                                                   |
| 対処       | 実行前に `lsof -nP -iTCP:5174 -sTCP:LISTEN` を固定実行し、競合時は停止/再利用の分岐結果を `spec-update-summary.md` へ記録した  |
| 標準ルール | UI再撮影は「ポート検査→再撮影→coverage検証→台帳同期」を1セットで完了する                                                       |

### 同種課題向け簡潔解決手順（4ステップ・port競合版）

1. `lsof -nP -iTCP:5174 -sTCP:LISTEN || true` で占有有無を先に確定する。
2. 競合ありの場合は「既存プロセス停止」か「既存サーバー再利用」のどちらかに分岐し、選択理由を記録する。
3. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` 実行後に `validate-phase11-screenshot-coverage` を実施する。
4. 実行結果を `task-workflow.md` と `spec-update-summary.md` へ同一ターンで転記し、未解決なら未タスク化する。

### 苦戦箇所: Phase 11 証跡を別workflow参照のまま残すと coverage validator が失敗する

| 項目       | 内容                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `manual-test-result.md` の証跡列が別workflowのパスのみを参照し、対象workflow配下に `outputs/phase-11/screenshots` が存在しなかったため、`validate-phase11-screenshot-coverage` が `covered=0` で失敗した |
| 再発条件   | 画面証跡を「参照文字列の更新のみ」で完了扱いにし、対象workflow配下へ証跡実体を配置しない場合                                                                                                             |
| 対処       | 対象workflow配下へ screenshot 証跡を正規配置し、視覚TCは `screenshots/*.png` で明示。非視覚TCは `NON_VISUAL:` 記法へ統一して validator の許容条件を固定した                                              |
| 標準ルール | UI証跡は「対象workflow配下の実体 + TC証跡記法 + validator PASS」の3点を同時に満たして完了判定する                                                                                                        |

### 同種課題向け簡潔解決手順（4ステップ・証跡配置版）

1. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>` を先に実行して欠落を検知する。
2. `outputs/phase-11/screenshots` が空なら、再取得または同一証跡を対象workflow配下へ正規配置する。
3. `manual-test-result.md` の視覚TCは `screenshots/*.png`、非視覚TCは `NON_VISUAL:` を必須化する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` と合わせて結果を `task-workflow.md` と `spec-update-summary.md` へ同一ターンで転記する。

### 苦戦箇所: `phase-11-manual-test.md` の画面カバレッジマトリクス欠落 warning が残る

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `validate-phase11-screenshot-coverage` の判定は PASS でも、`phase-11-manual-test.md` に画面カバレッジマトリクスがなく warning が継続し、設計意図の確認が人依存になった |
| 再発条件   | `manual-test-result.md` の証跡記法のみ更新し、Phase 11 仕様書側へ TC設計（視覚/非視覚区分）を記録しない場合                                                            |
| 対処       | 未タスク `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加し、matrix 必須列（TC-ID/区分/期待証跡/理由）の標準化を分離して管理する方針へ変更                 |
| 標準ルール | UI証跡は「画像実体」「証跡記法」「カバレッジマトリクス」の3層を同時に満たして完了判定する                                                                              |

### 同種課題向け簡潔解決手順（4ステップ・matrix版）

1. `phase-11-manual-test.md` に「画面カバレッジマトリクス」節があるか `rg` で機械確認する。
2. matrix へ `TC-ID` / `視覚or非視覚` / `期待証跡` / `理由` を必須列として記録する。
3. `manual-test-result.md` の `screenshots/*.png` / `NON_VISUAL:` 記法と matrix の行対応を突合する。
4. `validate-phase11-screenshot-coverage` の結果と合わせて `task-workflow.md` / `ui-ux-feature-components.md` に同一ターンで同期する。

---

## TASK-UI-05-SKILL-CENTER-VIEW: SkillCenterView 実装（2026-03-01）

### 苦戦箇所: `CategoryId` と `SkillCategory` の境界が混在しやすい

| 項目             | 内容                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題             | カテゴリ選択・フィルタ・表示順の責務が同じ型として扱われ、比較条件が増えるほど読み解きコストが上がる                     |
| 再発条件         | UI都合の `all` などをドメインカテゴリと同じ層で扱う場合                                                                  |
| 原因             | 表示ID層とドメインカテゴリ層の責務分離が途中段階だった                                                                   |
| 対処             | `UT-UI-05-001` として型統一を未タスク化し、現時点は変換点（`all` と `categoryOrderMap`）を局所化して回帰テストで固定した |
| 今後の標準ルール | カテゴリは「表示ID層」「ドメイン層」「変換層」を明示的に分離する                                                         |

### 苦戦箇所: `SkillDetailPanel` への責務集中

| 項目             | 内容                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| 課題             | 詳細表示の拡張（Markdown描画、モバイル操作、Skeleton）を同時に進めると差分が肥大化し、レビュー観点が拡散する   |
| 再発条件         | 1コンポーネントに表示/操作/状態切替を集約したまま機能追加する場合                                              |
| 原因             | 実装速度を優先して Molecule 分離を後段にした                                                                   |
| 対処             | `UT-UI-05-002` / `UT-UI-05-003` / `UT-UI-05-004` / `UT-UI-05-005` として課題を分解し、Phase 12で追跡可能化した |
| 今後の標準ルール | 大型UIは「完了時に責務分離未タスクを先に切る」を必須化する                                                     |

### 苦戦箇所: Phase 12 証跡値の同期漏れ

| 項目             | 内容                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 検証コマンドはPASSでも、`task-workflow.md` / `lessons-learned.md` / 未タスク参照の同期順がずれると再確認工数が増える                         |
| 再発条件         | 成果物生成と仕様書転記を別ターンで進める場合                                                                                                 |
| 原因             | 同一ターン同期ルールが作業手順に固定されていなかった                                                                                         |
| 対処             | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を同一ターンで台帳・教訓へ転記した |
| 今後の標準ルール | Phase 12 は「検証値確定→台帳反映→教訓反映」を連続実行し、途中保存を完了扱いにしない                                                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` を先に実行し、構造要件を確定する。
2. 実装要点・未タスク・検証証跡を `task-workflow.md` に先行記録する。
3. 未タスクは `docs/30-workflows/unassigned-task/` へ作成し、`--target-file` 監査で形式を確定する。
4. `verify-unassigned-links` と `audit --diff-from HEAD` でリンクと差分違反を確定する。
5. 同一ターンで `lessons-learned.md` に苦戦箇所と再発条件を転記し、標準ルールを固定する。

---

## TASK-UI-05B-SKILL-ADVANCED-VIEWS: 高度管理ビュー群再確認（2026-03-02）

### 苦戦箇所: `verify-all-specs` warning 値がドリフトする

| 項目             | 内容                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| 課題             | `verify-all-specs` は PASS でも warning が残り、再確認時に「反映漏れか既知差分か」の判定が揺れる |
| 再発条件         | `phase-12-documentation.md` の参照資料に依存Phase成果物を列挙しない場合                          |
| 原因             | Phase 12 文書を Task 1〜5 最小記述で閉じ、依存成果物参照を省略していた                           |
| 対処             | 参照資料へ Phase 2/5/6/7/8/9/10 の成果物を追加し、warning 原因を明示した                         |
| 今後の標準ルール | Phase 12 再確認では「依存成果物参照の補完 → verify実行」の順序を固定する                         |

### 苦戦箇所: 画面証跡が古いまま残りやすい

| 項目             | 内容                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| 課題             | 画面証跡ファイルが存在していても、再確認時点の実装状態を示していない可能性がある                       |
| 再発条件         | 既存スクリーンショットの存在確認だけで完了判定する場合                                                 |
| 原因             | 再撮影手順が完了条件に固定されていなかった                                                             |
| 対処             | `capture-skill-advanced-views-screenshots.mjs` を実行し、TC-04〜TC-07 を再取得して更新時刻で証跡化した |
| 今後の標準ルール | UIタスクの再確認は「再撮影 + 更新時刻確認」を必須化する                                                |

### 苦戦箇所: 未タスク監査の baseline を今回差分と誤読する

| 項目             | 内容                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 課題             | `audit --diff-from HEAD` の結果で baseline 件数を見て誤って失敗扱いしやすい |
| 再発条件         | `currentViolations` と `baselineViolations` を分離せず記録する場合          |
| 原因             | 合否指標（current）と改善バックログ指標（baseline）の運用目的が混在         |
| 対処             | 合否は `currentViolations=0` 固定、baseline は別管理として記録した          |
| 今後の標準ルール | 未タスク監査は `current/baseline` を必ず併記し、判定軸を固定する            |

### 同種課題の簡潔解決手順（5ステップ）

1. 更新対象仕様書を 1仕様書=1SubAgent（ui-ux-components / ui-ux-feature-components / arch-ui-components / arch-state-management / task-workflow / lessons-learned）で分割する。
2. `verify-all-specs` / `validate-phase-output` を実行し、warning/error の根拠を抽出する。
3. `phase-12-documentation.md` に依存Phase成果物の参照を追加して再検証する。
4. UI画面はスクリーンショットを再撮影し、更新時刻を証跡化する。
5. 未タスク監査は `current` を合否、`baseline` を改善バックログとして分離記録し、`task-workflow.md` と同時同期する。

---

## TASK-10A-B: SkillAnalysisView 再監査（2026-03-02）

### 苦戦箇所: Phase 11 がコード分析ベースのまま残る

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | `manual-test-result.md` が実画面証跡ではなくコード読解結果中心で記録され、UI検証の再現性が低下した |
| 再発条件         | Electron起動制約を理由に、スクリーンショット再取得を省略する場合                                   |
| 原因             | Phase 11 完了条件の「画面証跡必須」が運用で弱かった                                                |
| 対処             | 専用スクリプトで `TC-01`〜`TC-04` を再撮影し、手動テスト結果を実証跡ベースへ更新                   |
| 今後の標準ルール | UIタスクのPhase 11は「実画面スクリーンショット + 結果文書」の2点同時成立を必須化する               |

### 苦戦箇所: `phase-11-manual-test.md` の必須節不足で検証落ち

| 項目             | 内容                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 課題             | `validate-phase-output` で「統合テスト連携」節不足がエラー化した                      |
| 再発条件         | 既存文書を簡略更新し、テンプレート必須章の確認を省略する場合                          |
| 原因             | 画面証跡更新に寄り、Phase仕様テンプレートの章立て検証が後回しになった                 |
| 対処             | 「統合テスト連携」を追記して再検証し、28項目PASSへ復帰                                |
| 今後の標準ルール | Phase 11/12 文書更新後は `validate-phase-output` を即実行し、章不足をその場で解消する |

### 苦戦箇所: 未タスク件数が 7 件のまま残るドリフト

| 項目             | 内容                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題             | 修正済み D1/D2（aria-label、text token）が未タスクとして残り、台帳が実態と不一致になった                                                   |
| 再発条件         | 修正実施後に `unassigned-task-detection.md` と `task-workflow.md` を同時更新しない場合                                                     |
| 原因             | Phase 11修正と Phase 12台帳更新が別ターンで進みやすい                                                                                      |
| 対処             | 修正完了後の completed 集合（001/003/008）と current active set（002/004/005/006/007/009）を分離し、台帳・仕様書・成果物を同一ターンで更新 |
| 今後の標準ルール | 未タスクは fixed range でなく canonical ledger から active/completed を再計算し、検出レポートと台帳を同時更新する                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `capture-*.mjs` などで画面証跡を再取得し、状態別ファイルを確定する。
2. `manual-test-result.md` と `discovered-issues.md` を実証跡ベースへ更新する。
3. `verify-all-specs` と `validate-phase-output` を連続実行し、warning/error をゼロ化する。
4. 未タスク件数を再計算し、`unassigned-task-detection.md` と `task-workflow.md` を同一ターン同期する。
5. 苦戦箇所を `lessons-learned.md` に再発条件付きで残し、次回の初動手順を固定する。

### 関連未タスク（再発防止ガード）

| 未タスクID        | 目的                                                         | タスク仕様書                                                                                 |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | `docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認）         | `docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md`         |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界）   | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`        |

### 追補: UT-TASK-10A-B-001 完了（2026-03-05）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| タスク           | 自動修正可能フィルタボタン実装                                                   |
| 実装分離         | UI責務（`SuggestionList`）と状態責務（`useSkillAnalysis`）を分離して変更         |
| 有効だった進め方 | Phase 4 で Red テストを先に追加し、導線未実装を明示してから Phase 5 で Green 化  |
| UI検証学び       | dark/light/mobile の3観点を同一ターンで撮影すると、見落としが減る                |
| 成果物           | `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/` |

### 再監査追補（2026-03-05 11:00 JST）

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 課題       | TC-11-04（light想定）の証跡がdark表示で保存されていた                                           |
| 原因       | 撮影スクリプトの theme mock が `dark` 固定値を返していた                                        |
| 対処       | `capture-ut-task-10a-b-001-screenshots.mjs` を `prefers-color-scheme` 連動へ修正し、5枚を再取得 |
| 検証       | `validate-phase11-screenshot-coverage --workflow ...ut-task-10a-b-001...` で 5/5 PASS           |
| 標準ルール | テーマ検証は「ブラウザ配色設定」と「モックテーマ応答」の整合をセットで確認する                  |

### 最終再監査追補（2026-03-05）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 完了済み `UT-TASK-10A-B-001` 指示書と未実施 `UT-TASK-10A-B-002〜008` 指示書が `completed-tasks/unassigned-task` に混在し、未タスク管理の配置規則とドリフトした                                                  |
| 原因       | 完了移管と未実施管理の境界をファイル配置ルールで固定せず、参照更新だけで完了判定した                                                                                                                            |
| 対処       | `UT-TASK-10A-B-001` は `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` へ移管し、`UT-TASK-10A-B-002〜008` の7件を `docs/30-workflows/unassigned-task/` へ再配置。関連参照を一括修正 |
| 検証       | `verify-unassigned-links` = 102/102、`audit --json --diff-from HEAD` = `currentViolations=0`, `baselineViolations=90`                                                                                           |
| 標準ルール | 指示書運用は「完了=completed-tasks」「未実施=unassigned-task」で物理分離し、監査は `current` と `baseline` を分けて記録する                                                                                     |

#### クイック解決カード（UT-TASK-10A-B-001）

1. 配置判定を先に確定する。未実施UTは `docs/30-workflows/unassigned-task/`、完了済みUT指示書は `docs/30-workflows/completed-tasks/` 直下へ置く。`completed-tasks/unassigned-task` は legacy のみを許容する。
2. `audit-unassigned-tasks --target-file` は未実施UTにのみ適用し、完了済みUT指示書には適用しない。
3. UI証跡は `TC-11-01`〜`TC-11-05` を同時刻で再取得し、`validate-phase11-screenshot-coverage` を 5/5 PASS で固定する。
4. 監査結果は `verify-unassigned-links`（参照整合）と `audit --diff-from HEAD`（`current`=合否 / `baseline`=監視）を分離して記録する。

固定コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD | jq '{current: .totals.currentViolations, baseline: .totals.baselineViolations}'
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button
test -f docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md
find docs/30-workflows/unassigned-task -maxdepth 1 -name 'task-10a-b-*.md' | wc -l
```

#### 追加未タスク化（UT-TASK-10A-B-009）

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 課題       | 配置先ルール（完了済みUT/未実施UT/legacy）が資料ごとに揺れ、`target-file` 適用境界が誤解される           |
| 未タスク化 | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`                    |
| 目的       | 配置先3分類と監査境界を1つの運用ガードへ統合し、再監査の手戻りを削減する                                 |
| 完了判定   | `verify-unassigned-links` PASS + `audit --target-file`/`audit --diff-from HEAD` の `currentViolations=0` |

### 追補: UT-TASK-10A-B-008 完了（2026-03-06）

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `task-workflow` / `ui-ux-feature-components` / parent `unassigned-task-detection` の active/completed 集合が日付更新ごとにずれ、固定レンジ参照が混入した                               |
| 原因       | canonical（task-workflow）と derived（ui-ux / detection）の責務分離が弱く、completed 集合を active 集合から除外しきれていなかった                                                      |
| 対処       | completed 集合を `001 / 003 / 008`、current active set を `002 / 004 / 005 / 006 / 007 / 009` として再確定し、3台帳を同一ターンで同期。あわせて `validate-task10ab-ledger-sync` を追加 |
| 標準ルール | active/completed は固定レンジでなく canonical ledger 起点で求め、derived ledger は必ず機械検証で整合確認する                                                                           |

#### 追補2: 明示 screenshot 要求時の再監査（2026-03-06）

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 「ドキュメント修正中心だから UI差分なし」と判断して `NON_VISUAL` のまま閉じると、関連UIの実不具合を取りこぼす                                      |
| 原因       | ユーザーの明示要求よりタスク種別判定を優先し、Phase 11 証跡方式の切替が遅れた                                                                      |
| 対処       | SkillAnalysisView の実スクリーンショット 8 ケースを再取得し、`useSkillAnalysis` の StrictMode ローディング固着と light-theme mock 不整合を修正した |
| 標準ルール | ユーザーがスクリーンショット検証を明示要求したら、UI差分の大小に関係なく `SCREENSHOT + Apple review` を優先する                                    |

#### 追補3: Phase 12 実装ガイドの内容不足是正（2026-03-06）

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `implementation-guide.md` が Part 1/Part 2 の見出しだけ満たし、TypeScript 型・API/CLI シグネチャ・設定一覧など Task 12-1 の必須内容が薄いまま完了扱いになりやすい                                                       |
| 原因       | `validate-phase-output` は構造中心で、Task 12-1 の内容要件までは直接検証していなかった                                                                                                                                  |
| 対処       | `outputs/phase-12/implementation-guide.md` を補強し、`validate-phase12-implementation-guide.js` を追加して理由先行 / 日常例え / 型 / API・CLI / 使用例 / エラー処理 / エッジケース / 設定一覧の 10 項目を機械検証化した |
| 標準ルール | Phase 12 Task 1 は「Part 1/2 がある」ではなく「内容要件 validator が PASS」で完了判定する                                                                                                                               |

#### 追補4: skill-creator の参照導線不足是正（2026-03-06）

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator` の reference 群が `resource-map.md` には載っていても `SKILL.md` から直接辿れず、`quick_validate` warning 26件が残っていた                                         |
| 原因       | 詳細台帳を `resource-map.md` へ寄せた一方で、日常運用の入口である `SKILL.md` の導線更新を同じターンで実施していなかった                                                           |
| 対処       | `SKILL.md` を「基礎設計・更新導線 / ヒアリング・抽象化 / 実装・ランタイム / 統合・オーケストレーション / 品質・運用」の5カテゴリで再編し、未リンク reference を直接参照可能にした |
| 標準ルール | reference を追加・増補したら `resource-map.md` と `SKILL.md` の両方から辿れることを `quick_validate` warning=0 で確認する                                                         |

#### 追補5: aiworkflow-requirements の入口導線未整備（2026-03-06）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `aiworkflow-requirements` は `quick_validate` で warning 145件が残るが、これを `SKILL.md` への全 reference 直列挙だけで解消すると 500行制限と Progressive Disclosure を壊しやすい          |
| 原因       | `quick_validate.js` が `SKILL.md` 内の直接リンク文字列だけを見ており、`indexes/quick-reference.md` や `indexes/resource-map.md` を入口とする大規模仕様スキルの設計を評価できない           |
| 対処       | 未タスク `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` を作成し、`SKILL.md` / `quick-reference.md` / `resource-map.md` の三層入口と validator 整合を一体で見直す方針を切り出した |
| 標準ルール | 大規模 reference スキルでは「warning 0」だけを目的に直列挙せず、入口設計と validator 前提を同時に設計する                                                                                  |

#### クイック解決カード（UT-TASK-10A-B-008）

1. `task-workflow.md` の残課題表を canonical として active/completed 集合を切り出す。
2. `ui-ux-feature-components.md` と parent `unassigned-task-detection.md` を同じ集合へ同期する。
3. 完了済み指示書は `completed-tasks/`、継続UTは `unassigned-task/` へ物理配置を揃える。
4. `validate-task10ab-ledger-sync` と `verify-unassigned-links` と `audit --diff-from HEAD` を順に実行し、`currentViolations=0` だけを合否に使う。
5. `validate-phase12-implementation-guide.js` で Task 12-1 の内容要件を確認する。
6. ユーザーが画面検証を要求した場合は `outputs/phase-11/screenshots` を再生成し、targeted UI test と Appleレビューを同一ターンで記録する。
7. `resource-map.md` だけでなく `skill-creator/SKILL.md` からも関連 reference が辿れるか、`quick_validate .claude/skills/skill-creator` の warning=0 で閉じる。
8. 大規模仕様スキルで warning が残る場合は、`SKILL.md` 全列挙で押し切らず、入口設計と validator 整合を独立未タスクとして切り出す。

### 関連未タスク（2026-03-06 追補）

| 未タスクID                                            | 目的                                                                                                                        | タスク仕様書                                                                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | `aiworkflow-requirements` の入口三層（`SKILL.md` / `quick-reference` / `resource-map`）と `quick_validate` 判定を両立させる | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md` |

---

## TASK-10A-C: SkillCreateWizard 実装再監査（2026-03-02）

### 苦戦箇所: UI再撮影後の TC 紐付け検証漏れ

| 項目             | 内容                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 課題             | スクリーンショットを再取得しても、TCと画像の対応検証を省略すると証跡の追跡性が下がる                                                 |
| 再発条件         | `ls` で画像存在のみ確認し、coverage validator を実行しない場合                                                                       |
| 原因             | 「再撮影」と「TC紐付け確認」を別工程として扱っていた                                                                                 |
| 対処             | `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard` を実行し、8/8 PASS を固定 |
| 今後の標準ルール | UIタスクの証跡判定は「再撮影 + coverage validator + 更新時刻確認」を必須3点セットにする                                              |

### 苦戦箇所: `skill:create` 契約の仕様同期漏れリスク

| 項目             | 内容                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題             | UI/Preload 実装を先行すると API/IF/Security/台帳の契約同期が遅れやすい                                                    |
| 再発条件         | 実装完了後に仕様更新を後段タスクとして分離する場合                                                                        |
| 原因             | 仕様更新対象の責務分割が作業開始時点で固定されていなかった                                                                |
| 対処             | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` / `task-workflow.md` を同一ターンで更新 |
| 今後の標準ルール | 新規 `skill:*` 追加時は 4仕様書同時更新を完了条件へ明示する                                                               |

### 苦戦箇所: Phase 11/12 依存成果物参照の抜け

| 項目             | 内容                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 課題             | `phase-11-manual-test.md` / `phase-12-documentation.md` の参照資料が最小化されると warning 判定が揺れる     |
| 再発条件         | 直近Phaseのみ参照し、依存Phase（2/5/6/7/8/9/10）の成果物を列挙しない場合                                    |
| 原因             | 参照資料テーブルの更新が検証コマンド実行後に回りやすい                                                      |
| 対処             | 依存Phase成果物を参照表へ追補し、`verify-all-specs` / `validate-phase-output` を再実行して warning=0 を確認 |
| 今後の標準ルール | Phase 11/12 文書は依存Phase成果物を参照表で明示してから検証を実行する                                       |

### 同種課題の簡潔解決手順（5ステップ）

1. 新規 `skill:*` チャネルを追加したら、`channels/preload/handler/tests` を同一ターンで同期する。
2. `verify-all-specs` と `validate-phase-output` を実行し、文書構造の warning/error を先に固定する。
3. UIタスクは `screenshot:<feature>` を再実行し、`validate-phase11-screenshot-coverage` で TC 紐付けを検証する。
4. `verify-unassigned-links` と `audit-unassigned-tasks --json --diff-from HEAD` を連続実行し、`currentViolations=0` を確認する。
5. 検証値と苦戦箇所を `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` に同一ターンで反映する。

### 関連未タスク（再発防止ガード）

| 未タスクID                                             | 目的                                                                                       | タスク仕様書                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001              | 5仕様書（api-ipc/interfaces/security/task-workflow/lessons）同時同期の完了ゲートを固定する | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md`              |
| UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001 | UI証跡3点セット（再撮影 + TCカバレッジ + 鮮度確認）を必須化する                            | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md` |

---

## TASK-10A-D スキルライフサイクルUI統合（2026-03-03）

### 実装内容サマリー

| 観点               | 内容                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装要点           | SkillManagementPanel の `list/editor/analysis/create` 統合、ChatPanel導線追加、agentSliceの分析/改善状態拡張                                |
| 検証要点           | `verify-all-specs` 13/13、`validate-phase-output` 28項目、`validate-phase11-screenshot-coverage` TC 5/5、`audit --diff-from HEAD` current=0 |
| 再確認で補強した点 | TC-02/TC-05 の証跡意図分離、未タスク監査の `current/baseline` 判定分離                                                                      |

### 仕様書別SubAgent分担（再確認）

| SubAgent  | 担当仕様書                    | 実装内容の反映                         | 苦戦箇所の反映                      | 完了条件                                     |
| --------- | ----------------------------- | -------------------------------------- | ----------------------------------- | -------------------------------------------- |
| SG-TW-01  | `task-workflow.md`            | TASK-10A-D 再確認証跡を台帳へ集約      | 監査誤読防止と証跡意図分離を追記    | 13/13, 28項目, TC 5/5, current=0 が記録済み  |
| SG-UIF-01 | `ui-ux-feature-components.md` | UI統合仕様（ビュー/導線/Store）を同期  | UI証跡の状態名+検証目的ルールを追記 | 機能仕様と再確認ルールが同時記録済み         |
| SG-LL-01  | `lessons-learned.md`          | 教訓の再利用導線を整理                 | 再発条件付きで苦戦箇所を整理        | 同種課題の簡潔手順が5ステップで記録済み      |
| SG-SC-01  | `skill-creator` テンプレート  | SubAgent実行ログ欄をテンプレートに追加 | 「仕様書単位の記録漏れ」を予防      | 次回タスクで再利用可能なテンプレート更新完了 |

### 苦戦箇所

| #   | 苦戦箇所                                                                                                                                  | 解決策                                                                                                              | 再利用性                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `applySkillImprovements`の引数型を`unknown[]`で仮定義したところ、Preload APIの`Suggestion`型と不整合が発生                                | `@repo/shared/types/skill-improver`から正しい型をインポート。IPC境界を跨ぐ型は必ず`@repo/shared`の共有型を使用      | HIGH: IPC境界の型定義は全タスクで適用可能 |
| 2   | P40（テスト実行ディレクトリ依存）が再発。モノレポルートからテスト実行すると`@testing-library/jest-dom`のmatcherが読み込まれず全テスト失敗 | テストコマンドに常に`cd apps/desktop &&`プレフィックスを含める                                                      | HIGH: 全desktopテストで適用必須           |
| 3   | PostToolUseフック（Prettier/ESLint自動修正）がファイル変更し、後続のEdit文字列マッチが失敗（P11パターン）                                 | 大量編集後は`git diff --stat`で変更数を検証                                                                         | MEDIUM: Claude Code Hooks環境固有         |
| 4   | Phase 12 再確認で `audit-unassigned-tasks` の全体監査値を今回差分失敗と誤読しやすい                                                       | `--diff-from HEAD` の `currentViolations` を合否、`--json` 単体の `currentViolations` は baseline監視として分離記録 | HIGH: 未タスク監査全般で再発しやすい      |
| 5   | TC-02（analysis遷移）と TC-05（エラー状態）の画像がどちらもエラー表示に見え、証跡意図が伝わりにくい                                       | `manual-test-result.md` に「TC-02=API未接続フォールバック」「TC-05=意図的エラー検証」を注記し、証跡表の状態名を補正 | MEDIUM: UI証跡レビュー全般で有効          |

### 同種課題の簡潔解決手順（5ステップ）

1. 仕様書を `task-workflow` / `ui-ux-feature-components` / `lessons-learned` に分け、1仕様書=1SubAgentで担当固定する。
2. 各仕様書で「実装内容」と「苦戦箇所」を同時に追記し、片側のみ更新を禁止する。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行して数値を確定する。
4. UIタスクはスクリーンショット目視確認を行い、証跡に「状態名 + 検証目的」を追記する。
5. `task-workflow.md` と `lessons-learned.md` の両方へ再発防止ルールを同一ターンで転記する。

### 関連未タスク

| 未タスクID                                                   | 目的                                                                                                    | タスク仕様書                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001            | Phase 12 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）を必須化し、仕様同期の説明責任を固定する | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md`            |
| UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001 | Phase 11 画面証跡で状態名+検証目的を分離し、TC意図混同（TC-02/TC-05）を防ぐ                             | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md` |

---

## TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001: authCallbackServer timeout/stop 責務分離

### 苦戦箇所: timeout時に待機APIが停止責務まで持っていた

| 項目             | 内容                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題             | `waitForCallback()` timeout 内で `instance.stop()` を呼ぶと、待機失敗と停止処理が結合しワーカー終了時の不安定要因になる |
| 再発条件         | timeout ハンドラ内で stop/close を直接呼ぶ実装を採用する場合                                                            |
| 原因             | 待機APIとライフサイクルAPIの責務境界が曖昧だった                                                                        |
| 対処             | timeout はエラー返却のみへ変更し、停止は呼び出し側の `stop()` 明示実行へ分離した                                        |
| 今後の標準ルール | timeout系APIは副作用を持たせず、停止責務を分離する                                                                      |

### 苦戦箇所: `stop()` の多重実行で終了経路が揺れる

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------- |
| 課題             | 停止済みサーバーへの `stop()` で例外経路が混入するとクリーンアップが不安定になる |
| 再発条件         | `!server` 判定のみで `server.listening` 状態を見ない場合                         |
| 原因             | `!server` のみ判定で `server.listening` 状態を見ていなかった                     |
| 対処             | `!server                                                                         |     | !server.listening` で早期returnし、`server.close`エラーは握りつぶして`Promise<void>` を解決する設計へ統一した |
| 今後の標準ルール | 停止APIは idempotent を第一要件にし、終了時の best-effort 方針を明文化する       |

### 同種課題の簡潔解決手順（4ステップ）

1. timeout 系APIから停止/破棄などの副作用を分離する。
2. 停止APIに「未起動」「停止済み」の両ガードを実装する。
3. timeout テストに `finally` 相当の明示 `stop()` を必ず追加する。
4. `security-implementation.md` と `task-workflow.md` を同一ターンで同期し、仕様ドリフトを残さない。

---

## TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001: Phase 12実行監査（2026-02-28）

### 苦戦箇所: 成果物が存在しても `artifacts.json` ステータスが未同期になりやすい

| 項目             | 内容                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題             | `outputs/phase-12` の必須成果物5件が存在していても、`artifacts.json` の `phases.12.status` が `pending` のまま残りやすい |
| 再発条件         | ファイル存在確認だけで Phase 12 の完了判定を行う場合                                                                     |
| 原因             | 「成果物実体」と「台帳ステータス」を別工程で管理し、同時突合していなかった                                               |
| 対処             | 監査時に `outputs/phase-12` と `artifacts.json` を同時確認し、乖離を明示記録した                                         |
| 今後の標準ルール | 完了判定は `成果物実体 + artifacts status + チェックリスト同期` の三点セットを必須化する                                 |

### 苦戦箇所: `audit-unassigned-tasks` の baseline と current を混同しやすい

| 項目             | 内容                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| 課題             | `--json` 単体実行の違反件数（baseline）を、今回差分の違反件数と誤認しやすい     |
| 再発条件         | `--diff-from` を使わずに合否を判定した場合                                      |
| 原因             | 監視目的（baseline）と合否目的（current）の使い分けが曖昧だった                 |
| 対処             | `--diff-from HEAD` を併用し、`currentViolations.total` を合否基準として固定した |
| 今後の標準ルール | 監査結果は `current`（合否）と `baseline`（監視）を必ず分離して記録する         |

### 苦戦箇所: `phase-12-documentation.md` のチェックリスト未同期

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 課題             | 検証コマンドがPASSでも、実行仕様書のチェック項目が未チェックのまま残りやすい |
| 再発条件         | 成果物作成と仕様書更新を別ターンで進める場合                                 |
| 原因             | 実体証跡の更新後に、手順書側の完了状態を同期する運用が固定されていなかった   |
| 対処             | 検証証跡を `task-workflow.md` と `lessons-learned.md` に同一ターン反映した   |
| 今後の標準ルール | Phase 12 は「実体証跡・仕様書チェック・教訓記録」の同時更新で完了とする      |

### 苦戦箇所: 仕様書別SubAgent分担で非対象仕様の扱いが揺れる

| 項目             | 内容                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 仕様書別に担当を切っても、更新不要な仕様書（interfaces/api-ipc/securityなど）の省略理由が残らず、再確認時に漏れと区別しづらい |
| 再発条件         | 仕様書別SubAgent分担を適用したが、非対象仕様の記録欄がないテンプレートを使う場合                                              |
| 原因             | 「担当あり/更新なし」の判断を文章でしか残しておらず、機械的な確認軸がなかった                                                 |
| 対処             | `phase12-system-spec-retrospective-template.md` に N/A判定ログ（対象/非対象/理由/代替証跡）を追加した                         |
| 今後の標準ルール | SubAgent分担では全仕様書の判定（更新 or N/A）を必ず表形式で残す                                                               |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs` と `validate-phase-output` で Phase 構造を先に確定する。
2. `outputs/phase-12` の必須成果物5件と `artifacts.json` ステータスを同時に確認する。
3. `audit-unassigned-tasks --diff-from HEAD` で `currentViolations` を合否基準に固定し、baselineは別管理する。
4. 仕様書別SubAgent分担を作成し、更新不要な仕様書は `N/A + 理由 + 代替証跡` を記録する。
5. 実装内容と苦戦箇所を `task-workflow.md` と `lessons-learned.md` へ同一ターンで同期する。

### 派生未タスク（継続改善）

| タスクID                                 | 目的                                                                 | 配置先                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 | Phase 12 での N/A 判定ログ固定と三点突合運用を機械確認まで引き上げる | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md` |

---

## UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001: quick_validate 空フィールドガード

### 苦戦箇所: Phase 12 実行済みでもチェックリスト同期が漏れる

| 項目             | 内容                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `outputs/phase-12` の成果物は揃っているのに、`phase-12-documentation.md` の完了条件が未チェックで残り、実行状況が不明瞭になる |
| 再発条件         | 成果物作成と実行仕様書更新を別ターンで進める場合                                                                              |
| 原因             | 成果物作成と手順書更新を別ターンで扱い、「実体」と「宣言」を同時同期していなかった                                            |
| 対処             | 完了判定時に `phase-12-documentation.md` の Task 1-5 / Task 100% 実行確認チェックを一括同期した                               |
| 今後の標準ルール | Phase 12 は「成果物実体 + 実行仕様書チェック」の2条件を同時に満たして完了とする                                               |

### 苦戦箇所: 完了移管後に親タスク証跡へ旧 `unassigned-task` 参照が残る

| 項目             | 内容                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 子タスクの未タスク指示書を `completed-tasks/` へ移しても、親タスク配下の `artifacts.json` / `minor-issues.md` に旧参照が残る |
| 再発条件         | 子タスクのみを更新対象にして親タスク証跡を再確認しない場合                                                                   |
| 原因             | 完了移管の対象を「該当タスク本人」だけに限定し、親タスク証跡の追従更新を忘れやすい                                           |
| 対処             | 旧参照文字列をキーに `rg` で横断検索し、親タスク証跡3ファイルを同時更新した                                                  |
| 今後の標準ルール | 完了移管は「子タスク移動 + 親タスク証跡更新 + リンク監査」を同一ターンで実施する                                             |

### 苦戦箇所: 検証スクリプトの所在誤認

| 項目             | 内容                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| 課題             | `verify-all-specs.js` などを `aiworkflow-requirements/scripts` で実行しようとして失敗する |
| 再発条件         | コマンド実行前にスクリプト実体を確認しない場合                                            |
| 原因             | 監査系スクリプトが `task-specification-creator/scripts` に集約されている前提が曖昧だった  |
| 対処             | 先に `rg --files` でスクリプト実体を解決し、正しいパスで再実行した                        |
| 今後の標準ルール | Phase 12 の検証は「実体探索 → 実行」の順序を固定し、実行コマンドを証跡へ残す              |

### 同種課題の簡潔解決手順（5ステップ）

1. `phase-12-documentation.md` と `outputs/phase-12/*` を突合し、完了チェック未同期を解消する。
2. 完了移管した未タスクIDで `rg -n "task-imp-<id>.md"` を実行し、親タスク証跡の旧参照を一括更新する。
3. 監査スクリプトは `task-specification-creator/scripts` を正本として `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行する。
4. `task-workflow.md` と `lessons-learned.md` に実装内容・苦戦箇所・再利用手順を同時追記する。
5. 最終確認として `quick_validate.js` と `verify-unassigned-links.js` を再実行し、構造/リンク整合を確定する。

---

## TASK-9J-skill-analytics: Phase 12再確認（2026-02-28）

### 仕様書別SubAgent分担（5仕様書同期）

| SubAgent | 担当仕様書                                 | 主担当作業                                       | 完了条件                               |
| -------- | ------------------------------------------ | ------------------------------------------------ | -------------------------------------- |
| A        | `references/interfaces-agent-sdk-skill.md` | 型定義8種 + Preload API 5メソッドの契約同期      | API名/型/戻り値が実装一致              |
| B        | `references/api-ipc-agent.md`              | IPC 5チャネルの request/response/validation 同期 | チャネル表と実装状況が一致             |
| C        | `references/security-electron-ipc.md`      | sender/P42/許可値リスト/エラー正規化を同期       | セキュリティ要件の欠落ゼロ             |
| D        | `references/task-workflow.md`              | 完了台帳・成果物・検証証跡・苦戦箇所を同期       | 実装内容 + 教訓 + 証跡を同一ターン更新 |
| E        | `references/lessons-learned.md`            | 再発条件付き教訓と簡潔解決手順を固定化           | 同種課題で再利用できる手順が明記       |

### 仕様反映先（5点セット）

| 仕様書                                     | TASK-9Jで反映した内容                                 |
| ------------------------------------------ | ----------------------------------------------------- |
| `references/interfaces-agent-sdk-skill.md` | 型定義8種、Preload API 5メソッド、完了記録            |
| `references/api-ipc-agent.md`              | 5チャネル契約、実装状況、完了記録                     |
| `references/security-electron-ipc.md`      | validateIpcSender / P42 / 許可値リスト / エラー正規化 |
| `references/task-workflow.md`              | 完了台帳、成果物、苦戦箇所、検証証跡                  |
| `references/lessons-learned.md`            | 再発条件付き苦戦箇所、簡潔解決手順                    |

### 苦戦箇所: IPCハンドラ実装後の登録配線漏れ

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | `skillAnalyticsHandlers.ts` を実装しても、`ipc/index.ts` 側の登録が漏れると機能が起動しない        |
| 再発条件         | 新規IPC追加時に「ハンドラ実装」と「登録配線」を別作業として扱う場合                                |
| 原因             | 実装完了をハンドラファイル単体で判定し、起動経路まで確認していなかった                             |
| 対処             | `registerSkillAnalyticsHandlers` を `ipc/index.ts` に追加し、DI初期化（Store/Service）と同時に接続 |
| 今後の標準ルール | IPC追加時は `handler` / `register` / `preload` の3点を完了条件に固定する                           |

### 苦戦箇所: analytics責務の重複実装

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 課題             | `skillHandlers.ts` と `skillAnalyticsHandlers.ts` に analytics 実装が分散し、契約差分が発生しやすい |
| 再発条件         | 段階導入で旧ハンドラを残したまま新ハンドラを追加した場合                                            |
| 原因             | 責務境界（どのファイルを正本にするか）が未固定                                                      |
| 対処             | analytics責務を `skillAnalyticsHandlers.ts` に一本化し、重複コードを削除                            |
| 今後の標準ルール | 同一チャネル群の実装は1ファイル1責務に統一し、重複実装を残さない                                    |

### 苦戦箇所: Preload API名の仕様ドリフト

| 項目             | 内容                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 課題             | 文書の `recordAnalytics` 記述と実装の `analyticsRecord` が混在し、利用側が誤実装しやすい                          |
| 再発条件         | 実装後に仕様書更新を段階分割し、命名確認を後回しにした場合                                                        |
| 原因             | 命名の正本（Preload API実装）に対する最終突合が不足                                                               |
| 対処             | `skill-api.ts` を正本として `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / Phase 12成果物を同一ターン同期 |
| 今後の標準ルール | IPC命名は「実装正本→仕様書同期」の一方向で管理し、逆方向編集を禁止する                                            |

### 同種課題の簡潔解決手順（4ステップ）

1. 新規IPCは `handler`・`register(index.ts)`・`preload` を同時確認し、1つでも未反映なら未完了と判定する。
2. 重複ハンドラを検出したら責務を1ファイルに集約し、古い経路を削除して契約の正本を固定する。
3. 命名は `skill-api.ts` を正本にして仕様書へ一括同期し、用語ドリフトを残さない。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を通してから完了とする。

---

## TASK-9G-skill-schedule: Phase 12再確認（2026-02-27）

### 苦戦箇所: 監査スクリプトを誤ディレクトリで実行しやすい

| 項目             | 内容                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `scripts/verify-all-specs.js` などをプロジェクト直下で実行し、`MODULE_NOT_FOUND` になる                                                                   |
| 再発条件         | 実行前にスクリプト実体パスを確認しない場合                                                                                                                |
| 原因             | 監査系スクリプトが `task-specification-creator/scripts` に集約されている運用が浸透していない                                                              |
| 対処             | `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` で正本パスを確定してから実行 |
| 今後の標準ルール | Phase 12再確認は「実体探索 → 検証実行」を固定順序にする                                                                                                   |

### 苦戦箇所: `audit-unassigned-tasks` の baseline と current を混同しやすい

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 課題             | baseline違反件数が多いと、今回差分の合否が不明瞭になる                                              |
| 再発条件         | `currentViolations` を見ずに total件数で判定した場合                                                |
| 原因             | 全体監査と差分監査の目的を分離せずに結果を解釈した                                                  |
| 対処             | 合否判定を `currentViolations` 固定にし、`baselineViolations` は既存課題として別管理                |
| 今後の標準ルール | `audit-unassigned-tasks.js --json --diff-from HEAD` の出力は `currentViolations` のみで完了判定する |

### 苦戦箇所: 未タスクは「存在」だけ確認して「形式」を見落としやすい

| 項目             | 内容                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 課題             | `docs/30-workflows/unassigned-task/` に配置されていても、テンプレート見出し不足で品質が落ちる |
| 再発条件         | リンク存在チェックだけで完了判定した場合                                                      |
| 原因             | 配置検証とフォーマット検証を別タスクとして扱っていた                                          |
| 対処             | UT-9G-001〜005 を対象に `## メタ情報` + `## 1..9` の10見出しを機械確認                        |
| 今後の標準ルール | 未タスク確認は「配置 + 見出しフォーマット」を同時にPASSさせる                                 |

### 同種課題の簡潔解決手順（4ステップ）

1. 監査コマンド前に `rg --files` で実体パスを確定する。
2. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を順に実行する。
3. 監査合否は `currentViolations` を正本にし、baselineは改善バックログとして分離する。
4. 未タスクは `docs/30-workflows/unassigned-task/` 配置確認と `## メタ情報 + ## 1..9` 見出し確認を同時に実行する。

---

## TASK-9I-skill-docs: Phase 12再確認（2026-02-28）

### 苦戦箇所: `audit-unassigned-tasks --target-file` の結果が過剰にfailへ見える

| 項目             | 内容                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| 課題             | 対象ファイルは準拠でも baseline 違反件数が同時出力され、今回差分が fail に見えやすい                     |
| 再発条件         | `currentViolations` を確認せず、全体件数のみで判定した場合                                               |
| 原因             | scoped監査（current判定）と全体監査（baseline監視）を分離せずに報告した                                  |
| 対処             | `--target-file` 出力は `currentViolations.total` を合否基準に固定し、baseline は既存課題として別記録した |
| 今後の標準ルール | 監査結果は必ず `current/baseline` を2列で記録し、今回差分判定を先に確定する                              |

### 苦戦箇所: Phase 12再確認の証跡が散在しやすい

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | 検証結果が `documentation-changelog` / コマンドログ / 口頭報告に分散し、再確認時に追跡コストが高い |
| 再発条件         | 検証コマンドの実行順と記録先を固定しない場合                                                       |
| 原因             | 証跡を「実行都度追記」に任せ、台帳側の集約ルールを先に決めていなかった                             |
| 対処             | `task-workflow.md` に「再確認結果テーブル」を設け、verify/validate/links/audit を1表に集約した     |
| 今後の標準ルール | Phase 12再確認は「1表で証跡化」を完了条件にする                                                    |

### 苦戦箇所: 未タスクは存在確認のみで形式確認が漏れやすい

| 項目             | 内容                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 課題             | `docs/30-workflows/unassigned-task/` にファイルがあっても、9セクション形式崩れを見落としやすい |
| 再発条件         | `ls` による存在確認だけで完了判定した場合                                                      |
| 原因             | 配置検証・見出し検証・監査判定を別工程として扱った                                             |
| 対処             | UT-9I-001/002 で `10見出し（メタ情報 + 1..9）` と `メタ情報見出し件数=1` を機械確認した        |
| 今後の標準ルール | 未タスク確認は「配置 + 見出し + current判定」の3点セットで完了判定する                         |

### 同種課題の簡潔解決手順（4ステップ）

1. `verify-all-specs` と `validate-phase-output` を先に実行し、Phase整合を固定する。
2. `verify-unassigned-links` で台帳リンク切れを排除してから未タスク監査に進む。
3. `audit --target-file` は `currentViolations.total` で合否判定し、baseline は別枠で記録する。
4. `task-workflow.md` と `lessons-learned.md` に「実装内容 + 苦戦箇所 + 再利用手順」を同一ターンで同期する。

### 同種課題の即時実行コマンドセット（TASK-9I再利用）

```bash
# 1) Phase仕様・成果物整合
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9I-skill-docs --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9I-skill-docs

# 2) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 3) 対象未タスク監査（移管前のみ）
# 注: completed-tasks/<task>/unassigned-task へ移管後は --target-file の対象外運用とし、
#     今回差分判定は Step 4（--diff-from HEAD）で実施する

# 4) 差分監査（今回変更のみ）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001: Phase 12 再確認証跡・未タスクリンク整合ガード（2026-02-28）

### 苦戦箇所: 未タスクリンクのワイルドカード参照が false fail を生む

| 項目             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 課題             | 未タスクディレクトリ配下を指すワイルドカード参照は、実体があってもリンク監査で missing 扱いになる |
| 再発条件         | 台帳にワイルドカード参照を残したまま `verify-unassigned-links` を実行した場合                     |
| 原因             | 監査は実体ファイルパス判定であり、ワイルドカード展開を前提にしていない                            |
| 対処             | 台帳参照を実体ファイル参照へ置換し、`verify-unassigned-links` を再実行して missing 0 を確認       |
| 今後の標準ルール | 未タスクリンクはワイルドカード禁止、実体パスのみ許可する                                          |

### 苦戦箇所: `--target-file` 監査の baseline を今回差分と誤読しやすい

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 課題             | `current=0` でも baseline 併記により fail と誤判定しやすい                   |
| 再発条件         | `currentViolations.total` を見ずに総件数で判定した場合                       |
| 原因             | scoped監査（今回差分）と baseline（既存負債）の判定軸が分離されていなかった  |
| 対処             | 合否は `currentViolations.total` 固定、baseline は監視値として別列管理に統一 |
| 今後の標準ルール | 監査記録は必ず `current/baseline` 2列で保存する                              |

### 苦戦箇所: 再確認テーブル値が更新後にドリフトしやすい

| 項目             | 内容                                                  |
| ---------------- | ----------------------------------------------------- |
| 課題             | links件数などの証跡値が最新コマンド結果とずれる       |
| 再発条件         | 検証実行と台帳更新を別ターンで実施した場合            |
| 原因             | コマンド結果転記が完了条件に含まれていなかった        |
| 対処             | 検証実行→台帳転記→差分監査を同一ターンで連続実行      |
| 今後の標準ルール | Phase 12 は「実行結果の転記完了」までを完了条件にする |

### 同種課題の簡潔解決手順（5ステップ）

1. `rg -n "docs/30-workflows/unassigned-task/\\*\\.md"` でワイルドカード参照を検出し、実体パスへ置換する。
2. `verify-all-specs` と `validate-phase-output` を実行して Phase 構造を先に固定する。
3. `verify-unassigned-links` で missing を 0 にする。
4. `audit --target-file` / `audit --diff-from HEAD` を実行し、合否は `currentViolations.total` で判定する。
5. `task-workflow.md` と `lessons-learned.md` に検証値・苦戦箇所・再利用手順を同一ターンで同期する。

---

## UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ

### 苦戦箇所: 正式契約（skillName）と後方互換（skillId）の同時維持

| 項目 | 内容                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| 課題 | shared/preload は `skillName`、Main は `skillId` で処理しており、片側だけ直すと既存呼び出しを壊す |
| 原因 | 契約変更を「単一正解への即時置換」で進め、移行期間の両立設計を先に定義していなかった              |
| 対処 | Mainハンドラで union受理し、`skillName` は正式経路・`skillId` は後方互換経路として分岐実装        |
| 教訓 | IPC契約修正は「正式契約 + 互換契約 + 廃止条件」を同時に仕様化しないと再発する                     |

### 苦戦箇所: `skillName -> skillId` 変換の責務配置

| 項目 | 内容                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 課題 | `SkillService.executeSkill()` が `skillId` 前提のため、Preload契約をそのまま渡すと検索失敗リスクがある |
| 原因 | 境界変換（Adapter）をどの層で行うか未確定のまま修正を開始した                                          |
| 対処 | Mainハンドラ境界で `scanAvailableSkills()` により `name -> id` を解決し、Service APIは据え置き         |
| 教訓 | 既存Serviceを維持する段階移行では「境界での変換」が最小リスクになる                                    |

### 苦戦箇所: 新旧契約テストの取りこぼし

| 項目 | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 課題 | 新契約テストを追加すると、旧契約回帰が欠落しやすい                            |
| 原因 | 正常系の1経路のみで検証し、互換経路の異常系を同時設計していなかった           |
| 対処 | `execute` / `validation` / `delegate` の3テストで新旧両契約を同時検証         |
| 教訓 | 互換維持タスクは「新旧2経路 x 正常/異常」の最小マトリクスを完了条件に固定する |

### 苦戦箇所: 仕様書同期を単独進行すると更新漏れが発生

| 項目 | 内容                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 課題 | `interfaces` 更新後に `security`/`task-workflow`/`lessons` の追記順序がずれ、証跡同期が遅延した            |
| 原因 | 仕様書ごとの責務分担を先に固定せず、単一担当で順次更新した                                                 |
| 対処 | 仕様書別 SubAgent（A: interfaces / B: security / C: task-workflow / D: lessons）を固定し、同一ターンで同期 |
| 教訓 | IPC契約修正は「コード更新」ではなく「仕様同期オーケストレーション」として扱うと漏れが減る                  |

### 同種課題の簡潔解決手順（4ステップ）

1. shared/preload/Main の引数契約を一覧化し、正式契約と互換契約を明示する。
2. 境界層に `name -> id` などの変換Adapterを置き、ドメイン層APIは段階的に移行する。
3. 新旧契約の正常系/異常系テストを同じターンで追加する。
4. `interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `task-workflow.md` を同時更新する。

---

## UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化

### 苦戦箇所: 通常経路とfallback経路の片側のみを整理すると監査ノイズが残る

| 項目 | 内容                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| 課題 | `authHandlers.ts` のみ一元化すると `ipc/index.ts` fallback側に同型重複が残る |
| 原因 | 監査観点を通常経路に限定し、非Supabase経路を同時対象化していなかった         |
| 対処 | 通常経路・fallback経路の両方を宣言的登録へ統一し、同時に回帰テストを追加     |
| 教訓 | AUTH系は「通常 + fallback」を1セットで扱わないと再発監査でノイズが残る       |

### 同種課題の簡潔解決手順（3ステップ）

1. `AUTH_*` の登録点を通常経路とfallback経路で同時列挙する
2. 両経路を配列/マップ化し、`ipcMain.handle` 直接重複を排除する
3. `rg -n \"ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_\"` が0件であることを回帰テストと合わせて確認する

### 苦戦箇所: 全体監査FAILと今回差分FAILの混同

| 項目 | 内容                                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| 課題 | `audit-unassigned-tasks.js` の既存baseline違反を、今回変更差分の失敗と誤認しやすい        |
| 原因 | 全体監査（資産健全性）と対象監査（今回差分）を同じ判定軸で扱っていた                      |
| 対処 | `detect-unassigned-tasks --scan <変更ディレクトリ>` を併用し、current/baseline を分離判定 |
| 教訓 | Phase 12 では「全体監査結果」と「今回差分起因」の両方を同時記録する                       |

### 同種課題の簡潔解決手順（4ステップ・再監査版）

1. `audit-unassigned-tasks.js` で baseline 健全性を確認する
2. `detect-unassigned-tasks --scan <変更範囲>` で current 差分を抽出する
3. `unassigned-task-detection.md` に baseline/current を分けて記録する
4. 完了移管した未タスク参照は `completed-tasks/` 側へ同期更新する

### 同種課題の即時実行テンプレート（20分版）

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 目的     | AUTH系IPCの重複登録と監査誤判定を1回の修正サイクルで解消する |
| 前提     | 通常経路とfallback経路を同時に編集対象へ含める               |
| 成功条件 | 実装重複0件、回帰テストPASS、仕様/台帳/リンク整合PASS        |

| Step | 実施内容                                 | 成果物/証跡                                       |
| ---- | ---------------------------------------- | ------------------------------------------------- |
| 1    | 通常/fallbackのAUTH 5チャネルを同時列挙  | 変更対象リスト                                    |
| 2    | 共通登録ヘルパー + 配列/ループ登録へ統一 | 差分（`authHandlers.ts`, `index.ts`）             |
| 3    | baseline/current監査を分離して記録       | `unassigned-task-detection.md`                    |
| 4    | 仕様書/台帳/リンクを同一ターンで同期     | `task-workflow.md`, `verify-unassigned-links.log` |

| 失敗しやすい点                                          | 回避策                                               |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `audit-unassigned-tasks` のFAILだけで差分FAILと判断する | `detect-unassigned-tasks --scan` を必ず併記して判定  |
| 参照更新を後回しにしてリンク切れを残す                  | 完了移管と同時に `verify-unassigned-links.js` を実行 |
| 通常経路のみ修正してfallback経路を見落とす              | Step 1で対象チャネルを2経路で明示チェック            |

## UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離

### 苦戦箇所: 全体監査結果を今回差分の失敗と誤読しやすい

| 項目 | 内容                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 課題 | `audit-unassigned-tasks.js --json` は既存違反を含むため、今回変更が無違反でも fail になる        |
| 原因 | current（今回差分）と baseline（既存資産）を同一判定軸で扱っていた                               |
| 対処 | `--target-file` / `--diff-from` で current を抽出し、scope未指定実行は baseline 監視として別記録 |
| 教訓 | Phase 12 は「対象監査 → 全体監査」の順序を固定すると誤判定が減る                                 |

### 苦戦箇所: 完了済み未タスク指示書の移管漏れ

| 項目 | 内容                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| 課題 | 完了後も `docs/30-workflows/unassigned-task/` に残置すると台帳と実体がずれる         |
| 原因 | 完了記録（task-workflow更新）と物理移管（completed-tasks移動）が別ターンになりやすい |
| 対処 | 完了反映時に「行更新・物理移動・リンク検証」を同一ターンで実施                       |
| 教訓 | Step 1-B/1-E は台帳更新だけでなくファイル配置整合まで含めて完了判定する              |

### 同種課題の簡潔解決手順（5ステップ）

1. `audit-unassigned-tasks.js --json --target-file <path>` で current 合否を先に確定する
2. `audit-unassigned-tasks.js --json --diff-from <ref>` で差分対象を再確認する
3. `audit-unassigned-tasks.js --json` を実行し baseline 健全性を別記録する
4. 完了した未タスク指示書を `completed-tasks/unassigned-task/` に移管し、`task-workflow.md` を同期更新する
5. `verify-unassigned-links.js` で参照整合を機械検証する

### 苦戦箇所: Phase 12 証跡はPASSでも台帳未同期が残りやすい

| 項目 | 内容                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------- |
| 課題 | rerunログが増えると、`artifacts.json` と `outputs/artifacts.json` の更新漏れが再発しやすい         |
| 原因 | 検証PASSで完了した気になり、台帳同期と index 再生成を後回しにしやすい                              |
| 対処 | `complete-phase` 実行後に `generate-index --regenerate` と `artifacts.json` 同期を同一ターンで固定 |
| 教訓 | Phase 12 の完了判定は「検証PASS + 台帳同期 + index同期」の3点セットで扱う                          |

### 苦戦箇所: quick_validate 実行経路の混同

| 項目 | 内容                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 課題 | リポジトリ側スクリプトと system skill 側スクリプトを混同し、検証手順がぶれやすい  |
| 原因 | 呼び出し経路（ローカル相対パス / 外部スキル絶対パス）を統一していなかった         |
| 対処 | Phase 12 の構造検証は `skill-creator` の `quick_validate.js` を正本手順として固定 |
| 教訓 | 「どのスキルのどのスクリプトを使うか」を仕様書に絶対パスで明記する                |

### 苦戦箇所: verify-all-specs の `--workflow` 引数漏れ

| 項目 | 内容                                                                  |
| ---- | --------------------------------------------------------------------- |
| 課題 | `verify-all-specs.js --strict` だけを実行すると必須引数不足で失敗する |
| 原因 | workflow対象を暗黙解決できる前提でコマンドを短縮していた              |
| 対処 | `--workflow docs/30-workflows/<task-id>` を必須で付与する形に統一     |
| 教訓 | strict検証は「対象指定 + strict」の2要素を1セットで記述する           |

### 苦戦箇所: `audit-unassigned-tasks --target-file` の出力解釈ミス

| 項目 | 内容                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 課題 | `--target-file` を指定しても baseline 一覧が同時に出るため、「対象ファイルにも違反がある」と誤読しやすい |
| 原因 | この監査は「対象だけ表示」ではなく「対象=current、その他=baseline」に分類する仕様だった                  |
| 対処 | `scope.currentFiles` と `currentViolations.total` を判定の正本に固定し、baseline は別管理として記録      |
| 教訓 | scoped監査は「表示件数」ではなく「current件数」で合否判定する                                            |

### 苦戦箇所: `validate-phase-output` の引数誤用

| 項目 | 内容                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| 課題 | `--phase` オプション形式を想定し、コマンド実行に失敗しやすい                    |
| 原因 | `verify-all-specs` と同じ引数形式だと誤認していた                               |
| 対処 | `validate-phase-output.js <workflow-dir>` の位置引数形式に統一                  |
| 教訓 | Phase検証コマンドは「ファイルごとの引数仕様差分」をテンプレート化して再利用する |

### 同種課題の簡潔解決手順（7ステップ・再確認版）

1. `audit-unassigned-tasks.js --json --target-file <path>` で current 合否を先に確定する
2. `audit-unassigned-tasks.js --json` を実行し baseline 健全性を分離記録する
3. `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` を実行する
4. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` を実行する
5. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` を位置引数で実行する
6. `--target-file` 結果は `currentViolations.total` を正本に判定し、baseline と混同しない
7. `complete-phase` 後に `generate-index --regenerate` と `artifacts.json` 同期を同一ターンで完了する

## UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応

### 苦戦箇所: `themeMode` と `resolvedTheme` の責務分離

| 項目 | 内容                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題 | `system` モード時に保存値（`themeMode`）と適用値（`resolvedTheme`）を同じ状態として扱うと、OS追従と手動切替が競合しやすい |
| 原因 | 「ユーザー選択値」と「実解決テーマ」の責務分離が設計上明文化されていなかった                                              |
| 対処 | stateを2軸化し、SSOTを `themeMode` に固定。`resolvedTheme` は `system` 時の解決値としてのみ更新                           |
| 教訓 | テーマ設計は「選択モード」と「適用テーマ」を分離しないと競合バグが再発する                                                |

### 苦戦箇所: Store Hook依存による再実行ループ

| 項目 | 内容                                                                                         |
| ---- | -------------------------------------------------------------------------------------------- |
| 課題 | テーマ反映の `useEffect` が依存参照の不安定性で再実行され続けるリスクがあった                |
| 原因 | 合成Store Hookの返す参照が毎回変わる構造で依存配列に乗っていた                               |
| 対処 | `useThemeMode` / `useResolvedTheme` / `useSetThemeMode` の個別セレクタへ分離して参照を安定化 |
| 教訓 | Zustand連携のUI副作用は合成Hookを避け、個別セレクタを前提に設計する                          |

### 苦戦箇所: Phase 12成果物と仕様書本体の同期漏れ

| 項目 | 内容                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| 課題 | `outputs/phase-12` が揃っていても `phase-12-documentation.md` のチェック欄が未更新で残り、監査で不整合になりやすい |
| 原因 | 実体成果物の存在確認で完了扱いにし、仕様書本体の実行記録更新が後回しになっていた                                   |
| 対処 | Task 1〜5の証跡を `phase12-task-spec-compliance-check.md` で突合し、同一ターンでチェック欄同期                     |
| 教訓 | Phase 12完了判定は「成果物実体 + 実行記録更新」をセットで扱う                                                      |

### 同種課題の簡潔解決手順（4ステップ）

1. `themeMode`（選択値）と `resolvedTheme`（解決値）を状態設計で明示分離する
2. UI副作用を持つ箇所は個別セレクタHookで依存を安定化する
3. Phase 12では `outputs/phase-12/*` と `phase-12-documentation.md` を1対1で突合する
4. `verify-all-specs --workflow --strict` と `verify-unassigned-links.js` の結果を同一レポートに固定する

### 同種課題向け転記テンプレート（5分版）

| 項目       | 書き方                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| 実装内容   | 「何を」「どこを」「なぜ」を2行以内で記載                                              |
| 苦戦箇所   | 「課題」「原因」「対処」「再発条件」を1行ずつ記載                                      |
| 再利用手順 | 4ステップ以内で、そのまま次タスクで実行できる粒度にする                                |
| 仕様反映先 | `task-workflow.md` / `ui-ux-design-system.md` / `lessons-learned.md` を同時更新する    |
| 検証       | `verify-all-specs --workflow --strict` / `verify-unassigned-links.js` の結果を記録する |

---

## TASK-9A-skill-editor: Phase 12再確認（2026-02-26）

### 苦戦箇所1: 実装ガイドのPart 1/Part 2要件不足

| 項目 | 内容                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題 | `implementation-guide.md` が短すぎて、Part 1（理由先行・日常例え）と Part 2（型/API/エラー/境界条件）の必須要件を満たしきれなかった |
| 原因 | 実装事実の要約を優先し、読者別要件チェックを後回しにした                                                                            |
| 対処 | Part 1/Part 2 の固定テンプレートを適用し、必須要件を項目ごとに再点検した                                                            |
| 教訓 | Phase 12 Task 1 は「文章量」ではなく「要件カバレッジ」で判定する                                                                    |

### 苦戦箇所2: `audit-unassigned-tasks --target-file` の出力誤読

| 項目 | 内容                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------- |
| 課題 | `--target-file` でも baseline が同時出力されるため、対象違反があるように見えて判断がぶれた         |
| 原因 | 表示結果をフィルタ出力と誤認し、分類出力（current/baseline）として読めていなかった                 |
| 対処 | 合否を `currentViolations.total` 固定に変更し、`baselineViolations.total` は監視値として別記録した |
| 教訓 | 未タスク監査は「current判定」と「baseline監視」を常に分離する                                      |

### 苦戦箇所3: 未タスク指示書のメタ情報重複

| 項目 | 内容                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 課題 | `task-9a-c-syntax-highlighting.md` と `task-9a-c-code-editor-migration.md` で `## メタ情報` が二重になった |
| 原因 | YAMLブロックと表ブロックを別セクションで追記した                                                           |
| 対処 | `## メタ情報` を1回に統一し、同一セクション内で管理する形に修正した                                        |
| 教訓 | 未タスク指示書はメタ情報の重複定義を禁止し、1セクション原則で運用する                                      |

### 同種課題の簡潔解決手順（4ステップ）

1. 実装ガイドを Part 1/Part 2 の必須要件チェックでレビューしてから完了扱いにする。
2. `audit-unassigned-tasks` は `current` と `baseline` を分離して記録する。
3. 未タスク指示書のメタ情報は1セクション運用に固定する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を同ターンで再実行する。

---

## 目次

0. [TASK-9H: スキルデバッグモード実装（2026-02-27）](#task-9h-スキルデバッグモード実装2026-02-27)
   - [苦戦箇所1: `registerAllIpcHandlers` への登録漏れ](#苦戦箇所1-registerallipchandlers-への登録漏れ)
   - [苦戦箇所2: Phase 12 必須成果物の不足](#苦戦箇所2-phase-12-必須成果物の不足)
   - [苦戦箇所3: `phase-12-documentation.md` のステータス未同期](#苦戦箇所3-phase-12-documentationmd-のステータス未同期)
   - [同種課題向け簡潔解決手順（4ステップ）](#同種課題向け簡潔解決手順4ステップ)

1. [TASK-9A-skill-editor: Phase 12再確認（2026-02-26）](#task-9a-skill-editor-phase-12再確認2026-02-26)
   - [苦戦箇所1: 実装ガイドのPart 1/Part 2要件不足](#苦戦箇所1-実装ガイドのpart-1part-2要件不足)
   - [苦戦箇所2: `audit-unassigned-tasks --target-file` の出力誤読](#苦戦箇所2-audit-unassigned-tasks---target-file-の出力誤読)
   - [苦戦箇所3: 未タスク指示書のメタ情報重複](#苦戦箇所3-未タスク指示書のメタ情報重複)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)

2. [UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応](#ut-ui-theme-dynamic-switch-001-settingsslice-テーマ動的切替対応)
   - [苦戦箇所: `themeMode` と `resolvedTheme` の責務分離](#苦戦箇所-themeMode-と-resolvedtheme-の責務分離)
   - [苦戦箇所: Store Hook依存による再実行ループ](#苦戦箇所-store-hook依存による再実行ループ)
   - [苦戦箇所: Phase 12成果物と仕様書本体の同期漏れ](#苦戦箇所-phase-12成果物と仕様書本体の同期漏れ)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
   - [同種課題向け転記テンプレート（5分版）](#同種課題向け転記テンプレート5分版)

3. [UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ](#ut-fix-skill-execute-interface-001-skillexecute-ipc契約ブリッジ)
   - [苦戦箇所: 正式契約（skillName）と後方互換（skillId）の同時維持](#苦戦箇所-正式契約skillnameと後方互換skillidの同時維持)
   - [苦戦箇所: `skillName -> skillId` 変換の責務配置](#苦戦箇所-skillname---skillid-変換の責務配置)
   - [苦戦箇所: 新旧契約テストの取りこぼし](#苦戦箇所-新旧契約テストの取りこぼし)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
4. [UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離](#ut-imp-unassigned-audit-scope-control-001-未タスク監査の-scope-分離)
   - [苦戦箇所: 全体監査結果を今回差分の失敗と誤読しやすい](#苦戦箇所-全体監査結果を今回差分の失敗と誤読しやすい)
   - [苦戦箇所: 完了済み未タスク指示書の移管漏れ](#苦戦箇所-完了済み未タスク指示書の移管漏れ)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
5. [UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正](#ut-imp-ipc-preload-extension-spec-alignment-001-task-9d9j-仕様差分の統合是正)
   - [苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化](#苦戦箇所1-旧パスが文書内で混在し正本が不明瞭化)
   - [苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生](#苦戦箇所2-artifacts必須項目の漏れがtaskごとに発生)
   - [苦戦箇所3: Date型方針がtask-9Iのみドリフト](#苦戦箇所3-date型方針がtask-9iのみドリフト)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-2)

6. [UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）](#ut-ipc-data-flow-type-gaps-001-phase-12再監査仕様書修正タスク)
   - [苦戦箇所1: Phase 12成果物の不足](#苦戦箇所1-phase-12成果物の不足)
   - [苦戦箇所2: artifactsjson 二重管理の非同期](#苦戦箇所2-artifactsjson-二重管理の非同期)
   - [苦戦箇所3: 未タスク指示書フォーマット不一致](#苦戦箇所3-未タスク指示書フォーマット不一致)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
   - [苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難](#苦戦箇所4-仕様書修正タスクのphaseテンプレート適用困難)
   - [苦戦箇所5: 6ギャップの横断的分析の複雑性](#苦戦箇所5-6ギャップの横断的分析の複雑性)
   - [苦戦箇所6: Date型シリアライズ方針の統一判断](#苦戦箇所6-date型シリアライズ方針の統一判断)
   - [苦戦箇所7: positional→object形式のIPC引数移行設計](#苦戦箇所7-positionalobject形式のipc引数移行設計)
   - [同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け](#同種課題の簡潔解決手順5ステップ-仕様書修正タスク向け)

7. [UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化](#ut-fix-ts-vitest-tsconfig-paths-001-vitest-alias-と-tsconfig-paths-の同期自動化)
   - [苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ](#苦戦箇所1-phase-12未タスク検出ソースの網羅漏れ)
   - [苦戦箇所2: validate-phase-output のセクション終端依存](#苦戦箇所2-validate-phase-output-のセクション終端依存)
   - [苦戦箇所3: 全体監査結果と今回差分の混同](#苦戦箇所3-全体監査結果と今回差分の混同)
   - [同種課題の簡潔解決手順（5ステップ・再監査版）](#同種課題の簡潔解決手順5ステップ再監査版)
8. [TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード](#task-imp-module-resolution-ci-guard-001-reposhared-4設定ファイル整合ciガード)
   - [苦戦箇所1: Phase 10 MINORの残置（レポート仕様ドリフト）](#1-phase-10-minorの残置レポート仕様ドリフト)
   - [苦戦箇所2: Phase 12証跡と仕様書本体状態の同期漏れリスク](#2-phase-12証跡と仕様書本体状態の同期漏れリスク)
   - [苦戦箇所3: 未タスク監査結果のベースライン混同](#3-未タスク監査結果のベースライン混同)
   - [苦戦箇所4: vitest.config.ts の正規表現パース](#4-vitestconfigts-の正規表現パース)
   - [苦戦箇所5: キー形式の相互変換設計](#5-キー形式の相互変換設計)
   - [苦戦箇所6: typesVersions の "." エントリスキップロジック](#6-typesversions-の--エントリスキップロジック)
   - [苦戦箇所7: process.exitCode vs process.exit() のテスタビリティ](#7-processexitcode-vs-processexit-のテスタビリティ)
   - [同種課題の簡潔解決手順（5ステップ・CIガード版）](#同種課題の簡潔解決手順5ステップciガード版)
9. [UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正](#ut-fix-skill-import-id-mismatch-001-skillimportdialog-の-idname-契約不整合修正)
   - [苦戦箇所1: 同名コンポーネントの誤調査](#1-同名コンポーネントの誤調査)
   - [苦戦箇所2: `skill.id`/`skill.name` の文字列型混同](#2-skillidskillname-の文字列型混同)
   - [苦戦箇所3: インポート処理の偽成功ログの誤読](#3-インポート処理の偽成功ログの誤読)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
10. [UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正](#ut-fix-skill-import-interface-001-skillimport-インターフェース整合修正)
    - [苦戦箇所1: Phase 12成果物と仕様書本体ステータスの不一致](#1-phase-12成果物と仕様書本体ステータスの不一致)
    - [苦戦箇所2: ワークフロー移動後の旧参照パス残存](#2-ワークフロー移動後の旧参照パス残存)
    - [苦戦箇所3: Vitest実行ディレクトリ差異による偽失敗](#3-vitest実行ディレクトリ差異による偽失敗)
    - [同種課題の簡潔解決手順（5ステップ・import版）](#同種課題の簡潔解決手順5ステップimport版)
11. [UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正](#ut-fix-skill-remove-interface-001-skillremove-インターフェース整合修正)
    - [苦戦箇所1: `skillId` / `skillName` 契約ドリフト](#1-skillid--skillname-契約ドリフト)
    - [苦戦箇所2: 未タスク配置ディレクトリのドリフト](#2-未タスク配置ディレクトリのドリフト)
    - [苦戦箇所3: Vitest実行コンテキスト差異](#3-vitest実行コンテキスト差異)
    - [苦戦箇所4: worktree環境でのStep 1-A先送り誤判断](#4-worktree環境でのstep-1-a先送り誤判断)
    - [苦戦箇所5: マルチエージェントPhase実行の依存順序違反](#5-マルチエージェントphase実行の依存順序違反)
    - [苦戦箇所6: worktree環境でのPhase 11手動テスト制約](#6-worktree環境でのphase-11手動テスト制約)
    - [苦戦箇所7: カバレッジ閾値のスコープ解釈](#7-カバレッジ閾値のスコープ解釈)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
12. [UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一](#ut-fix-skill-validation-consistency-001-skillハンドラp42準拠バリデーション形式統一)
    - [苦戦箇所1: 補完タスクと元未タスクの二重管理](#1-補完タスクと元未タスクの二重管理)
    - [苦戦箇所2: Phase 12成果物と仕様書本体ステータスの同期漏れ](#2-phase-12成果物と仕様書本体ステータスの同期漏れ)
    - [苦戦箇所3: 未タスクraw検出に既存TODOが混在](#3-未タスクraw検出に既存todoが混在)
    - [苦戦箇所4: 6ハンドラの引数形式の違い（オブジェクト型 vs 直接引数型）](#4-6ハンドラの引数形式の違いオブジェクト型-vs-直接引数型)
    - [苦戦箇所5: return → throw マイグレーション時のRenderer側影響分析](#5-return--throw-マイグレーション時のrenderer側影響分析)
    - [苦戦箇所6: コンテキスト枯渇による3セッション分割](#6-コンテキスト枯渇による3セッション分割)
    - [同種課題の簡潔解決手順（プロセス面4ステップ + 実装面5ステップ）](#同種課題の簡潔解決手順プロセス面4ステップ--実装面5ステップ)
13. [TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）](#task-9a-c-skilleditor-仕様書再監査phase-12準拠)
    - [苦戦箇所1: tasks/completed-task 参照混在](#1-taskscompleted-task-参照混在)
    - [苦戦箇所2: phase-09 と phase-9 の表記ゆれ](#2-phase-09-と-phase-9-の表記ゆれ)
    - [苦戦箇所3: Step 1-B の状態判定の曖昧さ](#3-step-1-b-の状態判定の曖昧さ)
    - [苦戦箇所4: 未タスク参照の実体不足](#4-未タスク参照の実体不足)
    - [苦戦箇所5: 並列エージェント実行時のAPIレートリミット](#5-並列エージェント実行時のapiレートリミット)
    - [苦戦箇所6: スキルスクリプトのパス解決](#6-スキルスクリプトのパス解決)
    - [苦戦箇所7: 大規模仕様書のコンテキスト管理](#7-大規模仕様書のコンテキスト管理)
    - [苦戦箇所8: 仕様書へのPitfall事前組み込みの有効性](#8-仕様書へのpitfall事前組み込みの有効性)
14. [TASK-9A-B: スキルファイル操作IPCハンドラー実装](#task-9a-b-スキルファイル操作ipcハンドラー実装)
    - [苦戦箇所1: 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）](#1-仕様書の実装事実ドリフトテスト件数エラーメッセージ)
    - [苦戦箇所2: Preload公開先パスの取り違え](#2-preload公開先パスの取り違え)
    - [苦戦箇所3: 未タスク検出raw件数の誤読防止](#3-未タスク検出raw件数の誤読防止)
    - [苦戦箇所4: handlerMap ESMモックパターン](#4-handlermap-esmモックパターン)
    - [苦戦箇所5: v8カバレッジの関数定義行カウント問題](#5-v8カバレッジの関数定義行カウント問題)
    - [苦戦箇所6: .trim()境界値バリデーション漏れ](#6-trim境界値バリデーション漏れ)
    - [苦戦箇所7: isKnownSkillFileError型ガードによるエラーサニタイズ設計](#7-isknownskillfileerror型ガードによるエラーサニタイズ設計)
15. [TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元](#task-fix-10-1-vitest未処理promise拒否検知の復元)
    - [苦戦箇所1: Step 2要否判定の誤り](#1-step-2要否判定の誤り)
    - [苦戦箇所2: 未タスク検出範囲の不足](#2-未タスク検出範囲の不足)
    - [苦戦箇所3: alias運用の継続性不足](#3-alias運用の継続性不足)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
16. [TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: @repo/shared モジュール解決エラー修正](#task-fix-ts-shared-module-resolution-001-reposhared-モジュール解決エラー修正)
    - [苦戦箇所1: exports/paths/alias 三層整合の同期漏れ](#1-exportspathsalias-三層整合の同期漏れ)
    - [苦戦箇所2: source直接参照時の補助型宣言取り込み漏れ](#2-source直接参照時の補助型宣言取り込み漏れ)
    - [苦戦箇所3: 未タスクリンク整合の既存崩れ](#3-未タスクリンク整合の既存崩れ)
    - [苦戦箇所4: TypeScript paths 定義順序の重要性](#4-typescript-paths-定義順序の重要性)
    - [苦戦箇所5: 4ファイル同期の必要性](#5-4ファイル同期の必要性packagejson--tsconfig--vitestconfig--typesversions)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-1)
17. [UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正](#ut-fix-ipc-response-unwrap-001-ipcレスポンスラッパー未展開修正)
    - [苦戦箇所1: 仕様書の正本参照が不一致](#1-仕様書の正本参照が不一致)
    - [苦戦箇所2: Phase 10 MINORの未タスク化漏れ](#2-phase-10-minorの未タスク化漏れ)
    - [苦戦箇所3: 完了移管後のリンク不整合](#3-完了移管後のリンク不整合)
    - [苦戦箇所4: TypeScript ジェネリクスの type erasure によるバグ根本原因](#4-typescript-ジェネリクスの-type-erasure-によるバグ根本原因)
    - [苦戦箇所5: ハンドラ応答形式の不統一](#5-ハンドラ応答形式の不統一safeinvoke-vs-safeinvokeunwrap-選択)
    - [苦戦箇所6: テストモック値の波及修正（19箇所）](#6-テストモック値の波及修正19箇所)
    - [苦戦箇所7: Phase 10 仕様書テーブルと実装の乖離](#7-phase-10-仕様書テーブルと実装の乖離)
18. [TASK-FIX-14-1: console → electron-log 移行](#task-fix-14-1-console--electron-log-移行)
    - [苦戦箇所1: 実変更ファイル名との乖離](#1-実変更ファイル名との乖離)
    - [苦戦箇所2: Phase 12 Step 1-A/1-C/1-D の先送り誤判定](#2-phase-12-step-1-a1-c1-d-の先送り誤判定)
    - [苦戦箇所3: 未タスク検出後の登録漏れ](#3-未タスク検出後の登録漏れ)
    - [苦戦箇所4: 大量テストファイルへのモック一括追加](#4-大量テストファイルへのモック一括追加)
    - [苦戦箇所5: debug プロパティの後方互換性判断](#5-debug-プロパティの後方互換性判断)
    - [苦戦箇所6: カバレッジ計測コマンドの引数誤り](#6-カバレッジ計測コマンドの引数誤り)
    - [苦戦箇所7: 条件ガード削除による予想外の簡素化効果](#7-条件ガード削除による予想外の簡素化効果)
19. [TASK-FIX-13-1: deprecatedプロパティ正式移行](#task-fix-13-1-deprecatedプロパティ正式移行)
    - [苦戦箇所1: 削除対象の境界判定](#1-削除対象の境界判定)
    - [苦戦箇所2: 汎用プロパティ参照の誤検出回避](#2-汎用プロパティ参照の誤検出回避)
    - [苦戦箇所3: Phase-12仕様同期漏れの防止](#3-phase-12仕様同期漏れの防止)
    - [苦戦箇所4: ドキュメント偏重による実装検証の省略](#4-ドキュメント偏重による実装検証の省略)
    - [苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)
20. [TASK-FIX-11-1: SDK統合テスト有効化](#task-fix-11-1-sdk統合テスト有効化)
    - [苦戦箇所1: Phase 12 Step 1-A/1-D の誤判定](#1-phase-12-step-1-a1-d-の該当なし誤判定)
    - [苦戦箇所2: 未タスク検出 raw 結果の誤読](#2-未タスク検出の-raw-結果をそのまま採用)
    - [苦戦箇所3: Vitest モック初期化の挙動差異](#3-vitest-モック初期化の挙動差異)
21. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
    - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
    - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
    - [苦戦箇所3: 型変換](#3-skill-から-skillmetadata-への型変換)
    - [苦戦箇所4: Phase間テスト数整合性問題](#4-phase間テスト数整合性問題)
    - [苦戦箇所5: 未タスク指示書の作成漏れ](#5-未タスク指示書の作成漏れ)
22. [UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行](#ut-store-hooks-component-migration-001-個別セレクタhook移行)
    - [苦戦箇所1: useStoreの参照安定性](#1-usestoreの参照安定性)
    - [苦戦箇所2: Phase 12チェックリスト管理](#2-phase-12チェックリスト管理)
23. [TASK-9B-H: SkillCreatorService IPCハンドラー登録](#task-9b-h-skillcreatorservice-ipcハンドラー登録)
    - [教訓1: Preload統合の漏れ防止](#1-preload統合の漏れ防止)
    - [教訓2: 並列Phase実行時のレビュータイミング](#2-並列phase実行時のレビュータイミング)
    - [教訓3: IPC型定義の配置戦略](#3-ipc型定義の配置戦略)
    - [教訓4: artifacts.jsonのPhaseステータス管理](#4-artifactsjsonのphaseステータス管理)
    - [教訓5: Phase 12の暗黙的要件の見落とし](#5-phase-12の暗黙的要件の見落とし)
    - [教訓6: artifacts.jsonのPhase別ステータス更新忘れ](#6-artifactsjsonのphase別ステータス更新忘れ)
    - [教訓7: 設計書と実装の乖離管理](#7-設計書と実装の乖離管理)
    - [教訓8: 複数エージェント並列実行時のシステム仕様書更新漏れ](#8-複数エージェント並列実行時のシステム仕様書更新漏れ)
    - [教訓9: 返却仕様文言・完了済み未タスク配置・artifacts最終整合](#9-返却仕様文言完了済み未タスク配置artifacts最終整合)
24. [UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行](#ut-store-hooks-test-refactor-001-renderhookパターン移行)
    - [苦戦箇所1: renderHookへの移行効果](#1-renderhookへの移行効果)
    - [苦戦箇所2: テストヘルパー関数の共通化](#2-テストヘルパー関数の共通化)
    - [苦戦箇所3: electronAPIモックの統一](#3-electronapiモックの統一)
    - [苦戦箇所4: 移行中のテスト数増加](#4-移行中のテスト数増加)
    - [苦戦箇所5: Phase 12 Step 2 の「該当なし」誤判定](#5-phase-12-step-2-の該当なし誤判定)
    - [苦戦箇所6: 実装ガイドのテストカテゴリテーブル不整合](#6-実装ガイドのテストカテゴリテーブル不整合)
25. [UT-9B-H-003: SkillCreator IPCセキュリティ強化](#ut-9b-h-003-skillcreator-ipcセキュリティ強化)
    - [苦戦箇所1: TDDでのセキュリティテスト先行設計の難しさ](#1-tddでのセキュリティテスト先行設計の難しさ)
    - [苦戦箇所2: 正規表現パターンのPrettier干渉](#2-正規表現パターンのprettier干渉)
    - [苦戦箇所3: YAGNI判断での共通化見送りの根拠付け](#3-yagni判断での共通化見送りの根拠付け)
    - [苦戦箇所4: Phase 11のCLI環境での手動テスト不可](#4-phase-11のcli環境での手動テスト不可)
    - [苦戦箇所5: 複数セッション間でのPhase 12成果物整合性](#5-複数セッション間でのphase-12成果物整合性)
26. [UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト](#ut-fix-agentview-infinite-loop-001-agentview無限ループ修正テスト)
    - [苦戦箇所1: happy-dom環境でのuserEvent非互換](#1-happy-dom環境でのuserevent非互換)
    - [苦戦箇所2: テスト実行ディレクトリ依存問題](#2-テスト実行ディレクトリ依存問題)
    - [苦戦箇所3: jsdom切り替え時の副作用](#3-jsdom切り替え時の副作用)
27. [UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止](#ut-fix-ipc-handler-double-reg-001-ipcハンドラ二重登録防止)
    - [教訓1: ipcMain.handle()の二重登録は例外送出](#1-ipcmainhandleの二重登録は例外送出)
    - [教訓2: IPC_CHANNELS 全走査の前提を先に検証する](#2-ipc_channels-全走査の前提を先に検証する)
    - [教訓3: IPC外リスナーの解除漏れを同時に防ぐ](#3-ipc外リスナーの解除漏れを同時に防ぐ)
28. [UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消](#ut-skill-import-channel-conflict-001-skillimport-ipcチャネル名競合の予防的解消)
    - [苦戦箇所1: 仕様書修正のみタスクの完了反映が台帳から漏れた](#1-仕様書修正のみタスクの完了反映が台帳から漏れた)
    - [苦戦箇所2: workflow移管後の旧参照パス残存](#2-workflow移管後の旧参照パス残存)
    - [苦戦箇所3: 生成ミスによる-outputs-ゴーストディレクトリ](#3-生成ミスによる-outputs-ゴーストディレクトリ)
    - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ-1)
29. [TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26）](#task-9b-skillcreator-ipc拡張同期-再監査2026-02-26)
    - [苦戦箇所1: IPCチャンネル契約数（6/13）の混在](#1-ipcチャンネル契約数613の混在)
    - [苦戦箇所2: createハンドラーのP42 3段バリデーション未完了](#2-createハンドラーのp42-3段バリデーション未完了)
    - [苦戦箇所3: 未タスク監査のcurrent/baseline混同](#3-未タスク監査のcurrentbaseline混同)
30. [関連ドキュメント](#関連ドキュメント)
31. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

---

## UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）

### タスク概要

| 項目        | 内容                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| タスクID    | UT-IPC-DATA-FLOW-TYPE-GAPS-001                                                        |
| 目的        | IPCデータフロー型ギャップ修正タスクの Phase 12 成果物・システム仕様反映を完全同期する |
| 完了日      | 2026-02-24                                                                            |
| ステータス  | **完了**                                                                              |
| 関連Pitfall | P1, P2, P3, P4, P29                                                                   |

### 苦戦箇所1: Phase 12成果物の不足

| 項目 | 内容                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| 課題 | `phase-12-documentation.md` で必須の `spec-update-summary.md` が未生成のまま進行していた |
| 原因 | `documentation-changelog.md` 更新時に成果物一覧との突合が後手になった                    |
| 対処 | `outputs/phase-12/` 実体と成果物表を1対1で突合し、不足成果物を即時作成した               |
| 教訓 | Phase 12 は「文書更新完了」ではなく「成果物セット完了」で判定する                        |

### 苦戦箇所2: artifactsjson 二重管理の非同期

| 項目 | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 課題 | `artifacts.json` と `outputs/artifacts.json` の状態・成果物パスが分岐していた |
| 原因 | 片方のみ更新され、Phase 6/11/12 の成果物名が旧状態で残存した                  |
| 対処 | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実施した          |
| 教訓 | 進捗台帳は同期手順を完了条件に組み込まないと再発する                          |

### 苦戦箇所3: 未タスク指示書フォーマット不一致

| 項目 | 内容                                                                       |
| ---- | -------------------------------------------------------------------------- |
| 課題 | 未タスク指示書が旧テンプレート見出し（`## 1. メタ情報`）で監査違反になった |
| 原因 | Why/What/How 必須見出しへの追従不足                                        |
| 対処 | 指示書を最新テンプレート（`## メタ情報` + 1〜9セクション）へ全面整形した   |
| 教訓 | 未タスク作成直後に `audit-unassigned-tasks.js` 単体監査を実行する          |

### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` と `spec-update-summary.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` で単体監査し、必須見出し不足を解消してから完了扱いにする

### 苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: タスク管理・ワークフロー
- **症状**: コード変更なしの仕様書修正タスクでは、Phase 4（テスト作成）、Phase 7（カバレッジ確認）、Phase 11（手動テスト）が本来の意味（ユニットテスト、カバレッジ率、UI操作確認）と合致しない
- **原因**: Phase 1-13テンプレートはコード実装タスクを前提としており、仕様書修正のみタスクに対する簡略化Phaseガイドが存在しなかった
- **解決策**:
  - Phase 4 = grep検証基準設計（49検証項目を正規表現パターンとして定義）
  - Phase 5 = 仕様書修正実行（7ファイル、28修正項目）
  - Phase 6-7 = grepベース整合性検証（24項目）+ 網羅性確認（49項目）
  - Phase 11 = 実装者視点レビュー（3視点×3ケース = 9テスト）
- **教訓**: 仕様書修正タスクでは、各Phaseの「N/A」判定ではなく、同等の品質保証を別手段で実現する代替アプローチを設計すべき

### 苦戦箇所5: 6ギャップの横断的分析の複雑性

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 分析・設計
- **症状**: 7ファイル×6ギャップ = 42交差ポイントの検証で、Gap別に修正すると1ファイル内の整合性が崩れ、ファイル別に修正するとGap間の一貫性が失われる
- **原因**: 型ギャップは複数ファイルに跨る横断的な問題であり、単一ファイルのスコープでは完全な検証ができない
- **解決策**:
  1. Phase 1でGap別に問題を分類し、影響範囲マトリクス（Gap×ファイル）を作成
  2. Phase 5ではGap別に修正を実行し、各Gap完了時にファイル間整合性を確認
  3. Phase 6で横断的整合性検証（24項目）、Phase 7で網羅性確認（49項目）を分離
- **教訓**: 横断的な型ギャップ修正では「Gap別修正→ファイル間検証」のサイクルが効果的。ファイル別に修正すると、後から別Gapの修正で先の修正と矛盾するリスクがある

### 苦戦箇所6: Date型シリアライズ方針の統一判断

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断
- **症状**: 4ファイル（task-9f, 9g, 9h, 9j）に散在する14個のDate型フィールドに対し、IPC境界でのシリアライズ方針が未定義だった。`Date`型のままIPCで送信するとJSONシリアライズでタイムゾーン情報が失われるリスクがあった
- **原因**: 仕様書作成時にIPC境界での型変換を考慮していなかった。バックエンド側の`Date`型とフロントエンド側の`string`型の間のギャップが暗黙的だった
- **解決策**:
  - ISO 8601文字列（`string; // ISO 8601`）を統一基準として採用
  - Main Processハンドラの戻り値で`.toISOString()`に変換するパターンを標準化
  - Renderer側では`new Date(isoString)`で復元するパターンを明記
  - 14フィールド全てに型注記を一括追加

```typescript
// ❌ IPC境界でDate型を直接使用（シリアライズで情報欠落リスク）
interface SkillSchedule {
  nextRun: Date; // JSONシリアライズで文字列化されるが形式が不定
  lastRun: Date | null;
}

// ✅ ISO 8601文字列で統一
interface SkillSchedule {
  nextRun: string; // ISO 8601
  lastRun: string | null; // ISO 8601
}

// Main Process側の変換
return {
  nextRun: schedule.nextRun.toISOString(),
  lastRun: schedule.lastRun?.toISOString() ?? null,
};

// Renderer側の復元
const nextRun = new Date(schedule.nextRun);
```

- **教訓**: IPC境界を越えるDate型は必ずISO 8601文字列に変換する方針を仕様書段階で定義すべき。後からの一括修正は14フィールド×4ファイルと影響範囲が大きい

### 苦戦箇所7: positional→object形式のIPC引数移行設計

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断・IPC
- **症状**: task-9a（Skill Editor）の6ハンドラがpositional形式（`safeInvoke(channel, arg1, arg2)`）で定義されていたが、P44/P45の教訓からobject形式（`safeInvoke(channel, { key1: val1, key2: val2 })`）への統一が必要だった
- **原因**: task-9aの仕様書はP44発見前に作成されており、旧パターンのpositional引数が使用されていた
- **解決策**:
  1. 6ハンドラ分のArgs型定義を新規追加（`SkillEditorReadArgs`, `SkillEditorWriteArgs`等）
  2. P42準拠の3段バリデーション（型チェック→空文字列→trim空文字列）をobject内の各フィールドに適用
  3. Before/Afterコード例を仕様書に記載し、後続実装者が迷わないようにする
  4. 既存のpositional形式のsafeInvoke呼び出しも、Preload側でobjectに変換する中間層パターンを設計

```typescript
// ❌ positional形式（旧パターン、P44リスク）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, skillName, relativePath);

// ✅ object形式（P44/P45準拠）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, { skillName, relativePath });

// Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}

// ハンドラ側バリデーション（P42準拠）
ipcMain.handle(
  "skill:editor:read",
  async (event, args: SkillEditorReadArgs) => {
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (
      typeof args?.relativePath !== "string" ||
      args.relativePath.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "relativePath must be a non-empty string",
      };
    }
    // ...
  },
);
```

- **教訓**: 仕様書段階でIPC引数形式を統一しておくことで、実装時のP44/P45再発リスクを完全に排除できる。6ハンドラ分のArgs型定義は手間だが、型安全性と保守性の向上に大きく寄与する

### 同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け

仕様書間のデータフロー型ギャップを検出・解消するタスクに遭遇した場合：

1. **ギャップマトリクス作成**: 全対象ファイルを横軸、全ギャップを縦軸とした影響範囲マトリクスを作成し、各セルに「修正要/不要/該当なし」を記入
2. **grepベースの検証基準設計**: 各ギャップの修正完了を判定する正規表現パターンを事前定義（例: `grep -c "string; // ISO 8601" task-9*.md` で Date型フィールド数を検証）
3. **Gap別修正→ファイル間検証のサイクル**: Gap単位で全ファイルを修正し、修正完了後にファイル間の整合性をgrepで横断検証
4. **Phase対応表の事前定義**: コード変更なしタスクの場合、各Phaseで何を代替実施するかを Phase 1 で事前定義（Phase 4=検証基準設計、Phase 6-7=grep検証 等）
5. **Phase 12の成果物を先に定義**: spec-update-summary.md、documentation-changelog.md、unassigned-task-report.md の3成果物を Phase 12 開始時に空ファイルで作成し、完了時に内容を埋める

---

## UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正

### タスク概要

| 項目        | 内容                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| タスクID    | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001                                   |
| 目的        | task-9D〜9J の参照差分・artifacts差分を統合是正し、実装前の契約ドリフトを防止する |
| 完了日      | 2026-02-25                                                                        |
| ステータス  | **完了**                                                                          |
| 関連Pitfall | P32, P44, P45                                                                     |

### 苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化

| 項目 | 内容                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| 課題 | `preload/skillAPI.ts` と `preload/skill-api.ts`、`main/ipc/channels.ts` と `preload/channels.ts` が混在していた |
| 原因 | 移行前後の記述が task ごとに異なる時期で更新され、統一ルールが未適用だった                                      |
| 対処 | 旧パス検出条件を固定し、対象7仕様書で0件になるまで一括是正                                                      |
| 教訓 | 参照差分はファイル単位ではなく「対象群一括」で潰すほうが再発しにくい                                            |

### 苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生

| 項目 | 内容                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 課題 | `modifies` / `creates` の記載粒度が task ごとにズレ、実装時の変更対象が不明瞭だった                         |
| 原因 | task-9D〜9J で共通必須項目のテンプレート化がされていなかった                                                |
| 対処 | 必須4項目（`channels.ts`, `skill-api.ts`, `types.ts`, `skill/index.ts`）を共通化し、domain型を task別に補完 |
| 教訓 | artifacts は「共通セット + domain差分」の2層で設計すると漏れを抑制できる                                    |

### 苦戦箇所3: Date型方針がtask-9Iのみドリフト

| 項目 | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| 課題 | task-9I の `GeneratedDoc.generatedAt` のみ `Date` 記述が残り、IPC境界方針と矛盾した |
| 原因 | Dateシリアライズ方針の追記が一部タスクへ未展開だった                                |
| 対処 | `string (ISO 8601)` へ統一し、IPCシリアライズ方針セクションを追記                   |
| 教訓 | Date型を含む仕様は「型定義修正」と「方針文章追記」をセットで実施する                |

### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task 群へ限定し、全体ベースライン違反と分離する。
2. 参照差分（oldPaths）と台帳差分（missingArtifacts）を別指標で収集する。
3. 旧参照パスを一括置換し、再監査で0件化する。
4. artifacts を共通セット + domain差分で補完し、7/7一致を確認する。
5. `task-workflow.md` 完了記録・残課題状態・`LOGS.md` を同一タイミングで同期する。

---

## UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化

### タスク概要

| 項目        | 内容                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| タスクID    | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001                                                       |
| 目的        | `vite-tsconfig-paths` 導入で Vitest alias 手動同期を廃止し、4設定整合チェック運用を安定化 |
| 完了日      | 2026-02-24                                                                                |
| ステータス  | **完了**                                                                                  |
| 関連Pitfall | P3, P4, P43                                                                               |

### 苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ

| 項目 | 内容                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------- |
| 課題 | `unassigned-task-report.md` が5検出ソース前提に対し、4ソース中心の記述になり監査観点が欠落した      |
| 原因 | TODO/FIXME・`.skip`・Phase 10中心に確認し、Phase 3/11の明示記録が弱かった                           |
| 対処 | レポートを5ソース固定（Phase 3/10/11 + TODO/FIXME + `.skip`）へ再構成し、各ソースの判定根拠を明文化 |
| 教訓 | Phase 12 Task 4は「検出件数」より先に「検出ソース網羅」をチェックする                               |

### 苦戦箇所2: validate-phase-output のセクション終端依存

| 項目 | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| 課題 | `validate-phase-output.js` のセクション抽出が終端依存実装で誤判定リスクを持っていた |
| 原因 | JavaScript環境で終端表現に依存した実装を使っていた                                  |
| 対処 | `content + sentinel heading` 方式へ変更し、見出し境界のみで抽出する実装へ修正       |
| 教訓 | Markdown抽出は「終端文字」ではなく「次見出し」を境界にする                          |

### 苦戦箇所3: 全体監査結果と今回差分の混同

| 項目 | 内容                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| 課題 | `audit-unassigned-tasks` の既存違反（67件/5件）を今回タスク起因と誤認しやすかった                             |
| 原因 | 全体健全性監査と変更差分監査を同じ文脈で扱った                                                                |
| 対処 | 全体監査結果はベースラインとして分離記録し、今回差分は `verify-unassigned-links` と対象ファイル個別確認で判定 |
| 教訓 | 「repo全体」と「今回対象」の判定軸を分離しないと優先順位が崩れる                                              |

### 同種課題の簡潔解決手順（5ステップ・再監査版）

1. Phase 12 Task 4の5検出ソースをチェックリスト化し、漏れなく実行記録する
2. 検証スクリプトの抽出ロジックは見出し境界ベースで実装し、終端依存を避ける
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` をセットで実行する
4. `audit-unassigned-tasks` は全体ベースラインとして扱い、今回差分判定を別で記録する
5. lessons/LOGS/SKILL/Phase成果物を同一タスクIDで同日同期し、追跡可能性を閉じる

---

## TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード

### タスク概要

| 項目        | 内容                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001                                                                                          |
| 目的        | @repo/shared パッケージの4設定ファイル（exports, paths, alias, typesVersions）間の整合性をCIで自動検証するガードスクリプトの実装 |
| 完了日      | 2026-02-22                                                                                                                       |
| ステータス  | **完了**                                                                                                                         |
| 関連Pitfall | P3, P4, P43                                                                                                                      |
| テスト      | `scripts/__tests__/check-shared-module-sync.test.ts` 43件PASS                                                                    |

### 実装内容

| 変更内容           | ファイル                                             | 説明                                                                                                               |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CIガードスクリプト | `scripts/check-shared-module-sync.ts`                | 4パーサー + 5チェッカー + 3ヘルパー + 2レポーター = 14関数                                                         |
| テストスイート     | `scripts/__tests__/check-shared-module-sync.test.ts` | 43テスト（8セクション: パーサー/チェッカー/レポーター/統合/ロバスト性/複合不整合/エッジケース/エラーハンドリング） |
| CI設定             | `.github/workflows/ci.yml`                           | `check-module-sync` ジョブ追加（buildの前提条件の1つ）                                                             |

### 苦戦箇所と解決策

#### 1. Phase 10 MINORの残置（レポート仕様ドリフト）

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | コア検証は完了していたが、レポート仕様（修正ガイダンス/件数サマリー/`printSummary`シグネチャ）がPhase 2設計と一致しなかった               |
| **原因**   | 検出ロジックとCI統合を優先し、出力フォーマット整備を後段に回した                                                                          |
| **解決策** | MINOR 3件を `TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001` に統合し、`docs/30-workflows/unassigned-task/` に起票してP3 3ステップを完了した |
| **教訓**   | Phase 10のMINORは「次回対応メモ」ではなく、同日中に未タスク化して追跡可能な状態にする                                                     |

#### 2. Phase 12証跡と仕様書本体状態の同期漏れリスク

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **課題**   | 成果物が存在しても `phase-12-documentation.md` や関連台帳の状態同期が漏れるリスクがあった               |
| **原因**   | 成果物作成と仕様更新が別工程で進み、最終同期チェックが弱かった                                          |
| **解決策** | `verify-all-specs` / `validate-phase-output` を同時実行し、成果物・仕様書本体・台帳の整合を機械検証した |
| **教訓**   | Phase 12は「成果物がある」だけでは不十分で、状態同期までを完了条件に含める必要がある                    |

#### 3. 未タスク監査結果のベースライン混同

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **課題**   | `audit-unassigned-tasks.js` で全体違反（既存68件）が出るため、今回対象の未タスク品質判定と混同しやすかった        |
| **原因**   | 全件監査結果をそのまま「今回不備」と解釈しやすい出力形式だった                                                    |
| **解決策** | 全体監査と対象ファイル個別確認を分離し、`task-imp-module-sync-report-enhancement.md` のテンプレ準拠を個別確認した |
| **教訓**   | 監査は「全体健全性」と「今回差分」を分けて報告しないと、是正優先順位が崩れる                                      |

#### 4. vitest.config.ts の正規表現パース

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | vitest.config.ts はTypeScriptファイルであり、JSON.parse()できない。alias定義を正規表現で抽出する必要がある                                                                                             |
| **原因**   | `resolve(__dirname, "../../packages/shared/src/utils/index.ts")` のような関数呼び出しが値に含まれ、構造化パースが困難                                                                                  |
| **解決策** | `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g` の正規表現で「キー: resolve(\_\_dirname, "パス")」パターンのみ抽出。タブ/スペース混在、マルチライン、コメント挿入をテストで検証 |
| **教訓**   | TypeScript設定ファイルのパースでは、完全なAST解析ではなく正規表現による部分マッチが現実的。ただしダブルクォート前提・コメント非対応など制約を明文化し、テスト（#29-32）で境界条件を網羅する            |

**コード例**:

```typescript
const ALIAS_PATTERN =
  /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g;

export function parseAliases(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const aliases = new Map<string, string>();
  let match: RegExpExecArray | null;
  while ((match = ALIAS_PATTERN.exec(content)) !== null) {
    aliases.set(match[1], match[2]);
  }
  // 0件パース警告（alias キーワード存在時のみ）
  if (aliases.size === 0 && content.includes("alias")) {
    console.warn(
      `Warning: ${filePath} contains alias but no @repo/shared aliases were parsed`,
    );
  }
  return aliases;
}
```

#### 5. キー形式の相互変換設計

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 4設定ファイル間でキー形式が異なる: exports(`./utils`), paths(`@repo/shared/utils`), aliases(`@repo/shared/utils`), typesVersions(`utils`)                                                                         |
| **原因**   | npm (exports), TypeScript (paths), Vitest (alias), npm typesVersions がそれぞれ独自のキー命名規則を採用                                                                                                           |
| **解決策** | 3つのヘルパー関数を作成: `toModuleKey`(exports→paths/alias形式), `toSubpath`(paths/alias→exports形式), `toTypesVersionsKey`(exports→typesVersions形式)。変換ロジックはプレフィックス付加/除去のみでシンプルに保つ |
| **教訓**   | 異なるシステム間のキー変換は、双方向変換関数を対で定義し、チェッカー関数はこれらを通して比較する設計が拡張性を維持しやすい                                                                                        |

**コード例**:

```typescript
// exports "./utils" → paths/alias "@repo/shared/utils"
function toModuleKey(subpath: string): string {
  return subpath === "." ? "@repo/shared" : `@repo/shared/${subpath.slice(2)}`;
}

// paths "@repo/shared/utils" → exports "./utils"
function toSubpath(moduleKey: string): string {
  return moduleKey === "@repo/shared"
    ? "."
    : `./${moduleKey.replace("@repo/shared/", "")}`;
}

// exports "./utils" → typesVersions "utils"（"." はスキップ対象）
function toTypesVersionsKey(subpath: string): string {
  return subpath.slice(2); // "./utils" → "utils"
}
```

#### 6. typesVersions の "." エントリスキップロジック

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | exports のメインエントリ（"."）は typesVersions に登録不要だが、サブパス（"./utils", "./errors" 等）は必須。この判定ロジックの正確な実装                                              |
| **原因**   | package.json の typesVersions はサブパス用の型解決にのみ使用され、メインエントリの型は `types` フィールドで指定するため                                                               |
| **解決策** | `checkExportsVsTypesVersions` 内で `if (subpath === ".") continue;` でメインエントリをスキップ。テスト（#22-23）で「.」スキップ動作を明示的に検証                                     |
| **教訓**   | npm パッケージ設定には「暗黙のルール」（メインエントリの型は types フィールドが担当）が存在する。チェッカー設計時にこれらの例外規則を先にリストアップし、テストで固定化することが重要 |

#### 7. process.exitCode vs process.exit() のテスタビリティ

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `process.exit(1)` を使うとテストプロセス自体が終了してしまい、テスト不可能                                                                                                |
| **原因**   | `process.exit()` はプロセスを即座に終了させるため、Vitest のテストランナーごと終了する                                                                                    |
| **解決策** | `process.exitCode = 1` を使用し、プロセスは正常終了させる。テストでは `expect(process.exitCode).toBe(1)` で検証。`afterEach` で `process.exitCode = undefined` にリセット |
| **教訓**   | CIスクリプトの終了コードテストでは、`process.exit()` ではなく `process.exitCode` プロパティを使用する。これによりmain関数の呼び出し後も制御がテストに戻る                 |

**コード例**:

```typescript
// ❌ テスト不可能
if (hasFailures) process.exit(1);

// ✅ テスト可能
if (hasFailures) process.exitCode = 1;

// テストでの検証
it("不整合がある場合 process.exitCode は 1", () => {
  main();
  expect(process.exitCode).toBe(1);
});
afterEach(() => {
  process.exitCode = undefined;
});
```

### 同種課題の簡潔解決手順（5ステップ・CIガード版）

1. Phase 10レビュー直後にMINORを分類し、同一責務なら1つの未タスクへ統合する。
2. 未タスクは `docs/30-workflows/unassigned-task/` に作成し、`task-workflow.md` と関連仕様書への参照を同時更新する。
3. Phase 12では成果物作成後に `verify-all-specs` と `validate-phase-output` を連続実行して、仕様書本体状態まで同期確認する。
4. 未タスク監査は「全体ベースライン（既存違反）」と「今回対象ファイル」の2段で記録する。
5. `lessons-learned.md` と完了タスク仕様書に苦戦箇所を即日反映し、再発防止手順を固定化する。

### 成果物

| 成果物             | パス                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| CIガードスクリプト | `scripts/check-shared-module-sync.ts`                                                                |
| テスト（43件）     | `scripts/__tests__/check-shared-module-sync.test.ts`                                                 |
| CI設定             | `.github/workflows/ci.yml`                                                                           |
| 実装ガイド         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/implementation-guide.md` |
| 未タスク指示書     | `docs/30-workflows/unassigned-task/task-imp-module-sync-report-enhancement.md`                       |

### 関連ドキュメント更新

| ドキュメント             | 更新内容                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| quality-requirements.md  | 完了タスクセクション追加、派生未タスク参照リンク追加 (v1.9.0)                    |
| architecture-monorepo.md | 完了タスクセクション追加、ステータス列追加 (v1.3.0)                              |
| technology-devops.md     | CIジョブテーブルに check-module-sync 追加                                        |
| task-workflow.md         | 残課題テーブル完了化、TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001 登録 (v1.52.0) |
| LOGS.md (x2)             | 完了ログ追加                                                                     |
| SKILL.md (x2)            | 変更履歴追加 (v8.59.0 / v9.81.0)                                                 |
| topic-map.md             | 再生成 (148ファイル, 1233キーワード)                                             |

---

## UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正

### タスク概要

| 項目        | 内容                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                    |
| 目的        | Renderer層で `skill.id` を渡していた誤りを `skill.name` 契約へ修正する |
| 完了日      | 2026-02-22                                                             |
| ステータス  | **完了**                                                               |
| 関連Pitfall | P44, P45                                                               |
| テスト      | SkillImportDialog 49件 + AgentView統合3件 PASS                         |

### 苦戦箇所と解決策

#### 1. 同名コンポーネントの誤調査

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **課題**   | `SkillImportDialog` が複数配置されており、修正対象コンポーネントの特定に時間を要した                 |
| **原因**   | ファイル名検索だけで作業を開始し、実際の import 経路を先に固定しなかった                             |
| **解決策** | `AgentView` 側の import 文から逆引きし、`organisms/SkillImportDialog/index.tsx` を対象として固定した |
| **教訓**   | UI不具合は「利用箇所 → import 先 → 実装本体」の順で特定すると迷走しにくい                            |

#### 2. `skill.id`/`skill.name` の文字列型混同

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **課題**   | `skill.id` と `skill.name` がどちらも `string` のため、コンパイル時に契約違反が検出されない |
| **原因**   | 型では区別できない識別子を、変数名と実装規約で分離していなかった                            |
| **解決策** | `onImport` を `skillNames` 命名に統一し、`selectedIds` から `name` へ明示変換を追加した     |
| **教訓**   | 文字列識別子は「名前」「変換点」「否定条件テスト」の3点セットで守る                         |

#### 3. インポート処理の偽成功ログの誤読

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| **課題**   | `importSkills` の成功ログに引きずられ、障害点を見誤りやすかった          |
| **原因**   | 関数単位のログだけ確認し、IPCハンドラの最終戻り値まで追跡しなかった      |
| **解決策** | Renderer入力値 → IPC引数 → `getSkillByName()` の照合結果を一連で確認した |
| **教訓**   | IPC系は「途中成功ログ」より「最終レスポンス契約」を真実源として扱う      |

### 同種課題の簡潔解決手順（4ステップ）

1. 呼び出し元コンポーネントから import 先を逆引きして、修正対象を1ファイルに固定する。
2. IPCで期待する識別子（`name` か `id` か）を先に宣言し、実装境界に変換処理を1箇所だけ置く。
3. 変数名を `skillNames` のように契約準拠へ統一し、曖昧な `skills` 命名を避ける。
4. テストで「期待値（nameが渡る）」と「否定条件（idが渡らない）」を同時に検証する。

---

## UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正

### タスク概要

| 項目        | 内容                                                             |
| ----------- | ---------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-INTERFACE-001                                |
| 目的        | `skill:import` の IPC 契約を Main / Preload / 仕様書で一致させる |
| 完了日      | 2026-02-21                                                       |
| ステータス  | **完了**                                                         |
| 関連Pitfall | P23, P42, P44, P40                                               |
| テスト      | `skillHandlers.test.ts` 52件PASS                                 |

### 苦戦箇所と解決策

#### 1. Phase 12成果物と仕様書本体ステータスの不一致

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| **課題**   | `outputs/phase-12/` が揃っていても `phase-12-documentation.md` が「未実施」のまま残った |
| **原因**   | 成果物作成を優先し、仕様書本体のステータス同期を後段に回した                            |
| **解決策** | 成果物監査と同時に、`phase-12-documentation.md` のステータスと完了チェックリストを同期  |
| **教訓**   | Phase完了判定は「成果物」と「仕様書本体状態」を同時に満たす必要がある                   |

#### 2. ワークフロー移動後の旧参照パス残存

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| **課題**   | `skill-import-agent-system/tasks/00-...` 旧パスが Phase 1/2 に残存                         |
| **原因**   | タスク指示書を `completed-task/` に移動後、参照一括更新が漏れた                            |
| **解決策** | `rg` で旧パスを横断検出し、`completed-task/00-ut-fix-skill-import-interface-001.md` に統一 |
| **教訓**   | タスク移動時はリンク修正と `verify-all-specs` 再実行を同一ターンで実施する                 |

#### 3. Vitest実行ディレクトリ差異による偽失敗

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **課題**   | ルートからのVitest実行で alias 解決が崩れ、`handler not registered` の偽失敗が発生                      |
| **原因**   | `apps/desktop` 前提の設定をルート実行で評価したため                                                     |
| **解決策** | `apps/desktop` 作業ディレクトリで `pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts` に統一 |
| **教訓**   | テストの実行場所は再現性要件。コマンドと実行ディレクトリを必ず記録する                                  |

#### 4. 並列エージェント実行時のコンテキスト分離

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 7エージェント並列実行では各エージェントが独立したコンテキストを持つため、Agent 4（コード変更）の結果をAgent 5-7（成果物生成）に自動伝達する仕組みがない   |
| **原因**   | 並列エージェントはそれぞれ独立したプロンプトで起動されるため、先行エージェントの出力をリアルタイムに参照できない                                          |
| **解決策** | Agent 4（Phase 4-5: テスト+実装）完了後にAgent 5-7を起動し、Agent 4の変更内容（修正ファイルパス、テスト結果、主要な実装差分）をプロンプトに明示的に含める |
| **教訓**   | 並列エージェント設計では「コンテキスト伝達の境界」を事前に定義する。全並列投入ではなく、依存関係に基づいた段階的投入が品質を維持する                      |

#### 5. completed-task配下のファイル移動時ステータス不整合

| 項目       | 内容                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | タスク指示書を `tasks/` から `completed-task/` に `mv` コマンドで移動した際、ファイル内のフロントマター `status` フィールドが `pending` のまま残った |
| **原因**   | `mv` コマンドはファイル内容を変更しないため、ディレクトリ構造上は「完了」配下にあるがメタデータは「未完了」という不整合が発生                        |
| **解決策** | ファイル移動時にフロントマターの `status` を `completed` に更新する。移動とステータス更新を同一ターンで実施する                                      |
| **教訓**   | ファイル配置とメタデータは独立した情報源であるため、両方を同時に更新する必要がある。`mv` 後に `verify-all-specs` でフロントマターの整合性を検証する  |

### 同種課題の簡潔解決手順（5ステップ・import版）

1. `git diff` で実装差分と Phase 成果物の対象を先に固定する。
2. Phase仕様書本体のステータス/完了条件を成果物と同時に同期する。
3. `rg` で旧参照パスを横断検出し、移管先へ統一する。
4. テストは対象パッケージディレクトリで `vitest run` を実行し、実行場所を証跡化する。
5. `verify-all-specs` と `verify-unassigned-links` を連続実行し、リンク・整合を最終確認する。

---

## UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正

### タスク概要

| 項目        | 内容                                                             |
| ----------- | ---------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001                                |
| 目的        | `skill:remove` の IPC 契約を Main / Service / 仕様書で一貫させる |
| 完了日      | 2026-02-20                                                       |
| ステータス  | **完了**                                                         |
| 関連Pitfall | P23, P32, P42, P44                                               |
| テスト      | SH-RM-01〜SH-RM-11（11件追加）                                   |

### 苦戦箇所と解決策

#### 1. `skillId` / `skillName` 契約ドリフト

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | MainハンドラーとService層で同じ文字列引数を扱っているのに、命名が `skillId` / `skillName` で混在し、仕様書ともズレた                                                      |
| **原因**   | 実装先行で命名統一ルールを適用しきれず、Step 2更新時に契約差分が残った                                                                                                    |
| **解決策** | `skill:remove` を `skillName: string` に統一。Mainハンドラーで `.trim()` を含む3段バリデーションを実施し、関連仕様書4件（interfaces/api/security/architecture）を同時更新 |
| **教訓**   | 引数名は型と同等の契約。コード修正時に仕様書を1ファイルでも後回しにすると再ドリフトする                                                                                   |

**コード例（Before → After）**:

```typescript
// ❌ Before: 3ファイルで命名が混在
// skillHandlers.ts — skillId を使用
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    // args.skillId でアクセス
    return skillService.removeSkill(args.skillId);
  }
);

// SkillService.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> { ... }
```

```typescript
// ✅ After: 全3ファイルで skillName に統一 + P42準拠3段バリデーション
// skillHandlers.ts
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    return skillService.removeSkill(skillName);
  }
);

// SkillService.ts — 同じ skillName を透過
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — 同じ skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  log.debug("[SkillImportManager] removeSkill called with:", skillName);
  const removed = this.importedIds.has(skillName);
  // ...
}
```

**同時更新が必要な箇所の一覧**（P23/P32パターン）:

| 更新対象                 | ファイル                        | 変更内容                     |
| ------------------------ | ------------------------------- | ---------------------------- |
| Mainハンドラー           | `skillHandlers.ts`              | 引数型・バリデーション・命名 |
| Service層                | `SkillService.ts`               | メソッドシグネチャの引数名   |
| Import Manager           | `SkillImportManager.ts`         | メソッドシグネチャの引数名   |
| テスト                   | `skillHandlers.test.ts`         | モック・アサーション全件     |
| 仕様書（interfaces）     | `interfaces-agent-sdk-skill.md` | 契約定義                     |
| 仕様書（API）            | `api-ipc-agent.md`              | エンドポイント定義           |
| 仕様書（セキュリティ）   | `security-skill-ipc.md`         | バリデーションルール         |
| 仕様書（アーキテクチャ） | `arch-electron-services.md`     | Service契約                  |

#### 2. 未タスク配置ディレクトリのドリフト

| 項目       | 内容                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 未実施タスク指示書が `docs/30-workflows/completed-tasks/unassigned-task/` に残り、`unassigned-task/` 参照と不整合になった                                   |
| **原因**   | 既存の移管運用（完了済み未タスクのアーカイブ）と、未実施タスク配置ルールが混在していた                                                                      |
| **解決策** | 未実施指示書を `docs/30-workflows/unassigned-task/` に補完し、`task-workflow.md` / `api-ipc-agent.md` の参照を統一。`verify-unassigned-links.js` で全件検証 |
| **教訓**   | 「未実施」と「完了済み」をディレクトリ境界で分離し、参照修正と物理配置を同じターンで完了させる                                                              |

**ディレクトリ構造の正しい配置**:

```
docs/30-workflows/
├── unassigned-task/                    # ✅ 未実施タスク指示書の正しい配置先
│   ├── task-xxx.md
│   └── task-yyy.md
├── completed-tasks/
│   ├── feature-a/                      # 完了タスクのアーカイブ
│   └── feature-b/
└── skill-import-agent-system/
    └── tasks/
        └── completed-task/             # ❌ ここに未実施指示書を置かない
```

**類似パターン**: P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い）

#### 3. Vitest実行コンテキスト差異

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| **課題**   | ルート実行と `apps/desktop` 実行で Vitest 設定解決が異なり、watch設定由来の失敗が発生した      |
| **原因**   | モノレポ構成で package 単位の設定（alias / environment）を前提にしたテストをルートから実行した |
| **解決策** | 検証コマンドを `apps/desktop` コンテキストに固定し、`vitest run` で非watch実行に統一           |
| **教訓**   | 「どこでコマンドを打つか」も再現性要件。Phase 11/12の証跡には実行ディレクトリを明記する        |

**コマンド例（正しい実行方法 / 間違い例）**:

```bash
# ❌ プロジェクトルートから直接実行 → vitest.config.ts が解決されない
cd /path/to/AIWorkflowOrchestrator
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts

# ❌ watchモード（デフォルト）→ CI/自動実行で停止しない
cd apps/desktop
pnpm vitest src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 対象パッケージディレクトリから vitest run で実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ pnpm --filter を使用（ディレクトリ移動不要）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 特定テストIDのみ実行
cd apps/desktop
pnpm vitest run -t "SH-RM" src/main/ipc/__tests__/skillHandlers.test.ts
```

**類似パターン**: P40（テスト実行ディレクトリ依存）

#### 4. worktree環境でのStep 1-A先送り誤判断

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | worktreeで作業中という理由で、Phase 12 Task 2 Step 1-A（LOGS/SKILL/関連仕様更新）を「マージ後対応」に先送りし、仕様同期が不完全なまま残った                                                        |
| **原因**   | 「worktreeではスキル仕様書を更新しない」という誤った運用を採用し、spec-update-workflowの必須条件よりローカル判断を優先した                                                                         |
| **解決策** | worktreeでもStep 1-Aを通常通り実施。未実施タスク誤配置（`completed-tasks/unassigned-task/`）を是正し、`task-workflow.md` 参照を `unassigned-task/` へ同期。`verify-unassigned-links.js` で機械検証 |
| **教訓**   | 「作業場所（worktree）」はStep 1-A省略理由にならない。省略ではなく、同一ブランチで仕様更新まで完結させることが再発防止に直結する                                                                   |

**実行コマンド（再発防止用）**:

```bash
# 未実施タスクの誤配置を検出（completed配下に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"

# task-workflow.md の参照整合を検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 5. マルチエージェントPhase実行の依存順序違反

| 項目       | 内容                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 1-12を5エージェントに分割して全て並列ディスパッチした結果、Phase 4-7エージェントがPhase 1-3エージェントより先に完了した                                                                         |
| **原因**   | 要件定義（Phase 1）→ 設計（Phase 2）→ レビュー（Phase 3）の成果物が、後続Phaseの前提条件として参照されるべきだった                                                                                    |
| **解決策** | Phase依存チェーンを尊重し、ゲートPhase（Phase 3設計レビュー、Phase 10最終レビュー）の前後で並列化区間を分離する。推奨構成: [Phase 1→2→3] → [Phase 4→5→6→7] → [Phase 8→9→10] → [Phase 11] → [Phase 12] |
| **教訓**   | エージェントディスパッチ前にPhase依存チェーンを確認し、ゲートPhaseを跨ぐ並列化を禁止する                                                                                                              |

#### 6. worktree環境でのPhase 11手動テスト制約

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Git worktree環境ではElectronアプリを起動できないため、Phase 11（手動テスト）のUI操作テストが実行不可                 |
| **原因**   | Phase 11仕様書が「Electronアプリ起動 → DevTools → 操作確認」を前提としている                                         |
| **解決策** | worktree環境では自動テスト（vitest）で代替し、制約を成果物に明記する。Electron起動テストはmainブランチマージ後に実施 |
| **教訓**   | Phase 11仕様書にworktree環境用の代替手順を明記する                                                                   |

#### 7. カバレッジ閾値のスコープ解釈

| 項目       | 内容                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `skillHandlers.ts` 全体のLine Coverage 45.14%（最低基準80%未満）だが、skill:remove固有のコード（行140-159）は全分岐カバー        |
| **原因**   | Phase 7（カバレッジ確認）の判定基準が「ファイル全体」か「修正対象ハンドラ」かが仕様書上あいまい                                  |
| **解決策** | バグ修正タスクのカバレッジはファイル全体ではなく修正対象関数の分岐カバー率で判定する。ファイル全体のカバレッジは参考値として記録 |
| **教訓**   | Phase 7仕様書に「修正対象関数のBranch Coverage 100%」を必須条件として明記する                                                    |

### 同種課題の簡潔解決手順（チェックリスト形式）

IPCインターフェース契約修正を行う場合、以下を順に実行する:

#### Step 1: 契約語彙の横断検出と統一判定

```bash
# 命名の混在を検出
rg -n "skillId|skillName" apps/desktop/src/main/ --type ts
rg -n "skillId|skillName" .claude/skills/aiworkflow-requirements/references/ --type md
```

- [ ] 実装コード内の命名混在を全件リストアップ
- [ ] 仕様書内の命名混在を全件リストアップ
- [ ] 統一先の命名を1つ決定（Preload側に合わせるのが原則）

#### Step 2: 実装と仕様書を同一ターンで更新

- [ ] Mainハンドラー（`skillHandlers.ts`）を更新
- [ ] Service層（`SkillService.ts`）を更新
- [ ] Import Manager / 下位層を更新
- [ ] テストファイル（`skillHandlers.test.ts`）を更新
- [ ] 仕様書 interfaces を更新
- [ ] 仕様書 api を更新
- [ ] 仕様書 security を更新
- [ ] 仕様書 architecture を更新

#### Step 3: 未実施タスク指示書の配置検証

```bash
# 配置先の確認
ls docs/30-workflows/unassigned-task/
# 検証スクリプト実行
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- [ ] 未実施タスク指示書が `docs/30-workflows/unassigned-task/` にある
- [ ] `task-workflow.md` の参照パスが正しい
- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST` を返す

#### Step 4: テスト実行と結果記録

```bash
# 対象パッケージディレクトリから実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

- [ ] 全テストがPASS
- [ ] 実行ディレクトリをPhase成果物に明記
- [ ] `vitest run`（非watchモード）で実行

#### Step 5: 型チェックと最終検証

```bash
pnpm --filter @repo/shared build && pnpm typecheck
```

- [ ] 型チェックPASS
- [ ] `git diff --stat` で変更ファイル数を確認

### 予防策

今後同様の契約ドリフトを防止するための具体的手順:

| 予防策                         | 実施タイミング           | 具体的なアクション                                       |
| ------------------------------ | ------------------------ | -------------------------------------------------------- |
| **命名規約の事前確認**         | Phase 2（設計）          | Preload側の既存命名をgrepで確認し、ハンドラ設計に反映    |
| **P23準拠の同時更新**          | Phase 5（実装）          | ハンドラ・Service・Preload・テストを1コミットで更新      |
| **P42準拠のバリデーション**    | Phase 5（実装）          | 全文字列引数に `.trim() === ""` チェックを追加           |
| **仕様書の即時更新**           | Phase 12（ドキュメント） | 実装完了後、PRマージを待たず仕様書を更新（P26対策）      |
| **未タスク3ステップ検証**      | Phase 12（ドキュメント） | ①指示書作成 → ②残課題テーブル → ③参照リンク → verify実行 |
| **テスト実行コンテキスト明記** | Phase 11（手動テスト）   | 実行ディレクトリとコマンドを証跡に記録                   |

### 関連ドキュメント更新

| ドキュメント                  | 更新内容                                                |
| ----------------------------- | ------------------------------------------------------- |
| task-workflow.md              | 未タスク参照パスを `unassigned-task/` に統一            |
| api-ipc-agent.md              | UT-9A-B派生未タスク参照パスを `unassigned-task/` に統一 |
| interfaces-agent-sdk-skill.md | `skill:remove` 契約の完了記録を反映                     |
| arch-electron-services.md     | Service層の引数契約を `skillName` として明記            |

### 関連パターン相互参照

| パターン                                                                            | 関連性                                        | 本タスクでの教訓                                        |
| ----------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| [P23: API二重定義の型管理](../../../rules/06-known-pitfalls.md#p23)                 | ハンドラ・Service・Preloadの3層同時更新が必要 | 命名の統一も型と同等の「契約」として扱う                |
| [P32: 型定義の二箇所同時更新](../../../rules/06-known-pitfalls.md#p32)              | 実装ファイル + 仕様書の同時更新パターン       | 仕様書4件の同時更新が漏れやすい                         |
| [P42: .trim()バリデーション漏れ](../../../rules/06-known-pitfalls.md#p42)           | 3段バリデーション標準化                       | `skillName` にも `.trim()` チェック適用                 |
| [P44: skill:import インターフェース不整合](../../../rules/06-known-pitfalls.md#p44) | 同一チャンネル群の姉妹タスク                  | `skill:import` と `skill:remove` で同じドリフトパターン |
| [P3: 未タスク管理の3ステップ不完全](../../../rules/06-known-pitfalls.md#p3)         | 未タスク配置ドリフト                          | ディレクトリ境界での分離が不十分だった                  |
| [P40: テスト実行ディレクトリ依存](../../../rules/06-known-pitfalls.md#p40)          | Vitest実行コンテキスト                        | `apps/desktop` からの実行が必須                         |

> **統合チェックリスト**: 上記パターンを統合したIPC修正時の品質ゲートは [ipc-contract-checklist.md](./ipc-contract-checklist.md) を参照。

### 関連未タスク

| タスクID                                   | タスク名                                              | 優先度 | 仕様書                                                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~        | ~~skillHandlers P42準拠バリデーション横展開~~         | ~~中~~ | **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）**                                                                                                                 |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001        | skillHandlers IPCバリデーションエラー応答パターン統一 | 中     | [`docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md`](../../../docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md)           |
| UT-IMP-PHASE11-WORKTREE-PROTOCOL-001       | Phase 11 Worktree環境手動テスト実行プロトコル策定     | 中     | [`docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md`](../../../docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md) |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001   | IPCハンドラ粒度カバレッジ計測インフラ構築             | 中     | [`docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md`](../../../docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md)         |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001 | マルチエージェントPhase依存順序ガード                 | 中     | [`docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md)     |

---

## UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一

### タスク概要

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                                     |
| 目的       | skillHandlers 6ハンドラのバリデーションを P42 準拠（`typeof` + `trim()` + throw形式）に統一 |
| 完了日     | 2026-02-24                                                                                  |
| ステータス | **完了**                                                                                    |
| 関連Issue  | #874                                                                                        |

### 苦戦箇所と解決策

#### 1. 補完タスクと元未タスクの二重管理

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `UT-FIX-SKILL-VALIDATION-P42-001`（元未タスク）と `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001`（補完タスク）が併存し、一部仕様書で「未実施」が残った |
| **原因**   | 補完タスク完了時に、残課題テーブル側の元タスク状態を同時更新していなかった                                                                        |
| **解決策** | `task-workflow.md` / `security-skill-ipc.md` の該当行を完了同期し、補完タスクで実施済みであることを明記                                           |
| **教訓**   | 補完タスクを完了したら、元未タスクを「完了または置換済み」に同時更新しないと重複管理になる                                                        |

#### 2. Phase 12成果物と仕様書本体ステータスの同期漏れ

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | `artifacts.json` は `phase_12_completed` でも、`phase-12-documentation.md` のメタ情報が `pending` のまま残る不整合が発生 |
| **原因**   | 成果物生成と仕様書本体更新を別工程で進めたため、最終同期が漏れた                                                         |
| **解決策** | Phase 12終了時に `artifacts.json` と `phase-12-documentation.md` のステータスを必ず突合し、差分を同一ターンで修正        |
| **教訓**   | 「成果物作成完了」と「仕様書本体の状態更新」は同一完了条件として扱う                                                     |

#### 3. 未タスクraw検出に既存TODOが混在

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| **課題**   | `detect-unassigned-tasks` が既存TODOを検出し、新規未タスクがあるように見える誤読が発生しやすい |
| **原因**   | raw件数（候補）と精査後件数（新規起票対象）を分けずに扱うと、今回差分と既存負債が混在する      |
| **解決策** | `raw件数` と `精査後件数` を分離記録し、既存管理済みTODOは新規起票対象から除外して判定         |
| **教訓**   | 未タスク監査は「全体ベースライン」と「今回対象差分」を必ず分離報告する                         |

#### 4. 6ハンドラの引数形式の違い（オブジェクト型 vs 直接引数型）

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 6ハンドラ中4つがオブジェクト型（`args.skillId`, `args.skillName`）、2つが直接引数型（`executionId: string`）で、共通バリデーション関数の抽出が困難                                                            |
| **原因**   | ハンドラ設計時に引数形式の統一規約がなく、skill:abort/get-statusは直接引数型、他はオブジェクト型で設計された                                                                                                  |
| **解決策** | 共通関数抽出を断念し、各ハンドラにインラインでP42準拠3段バリデーション（typeof + .trim() === "" + throw）を適用。YAGNI原則に従い、引数形式統一は別タスク（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001等）に委ねた |
| **教訓**   | 引数形式が異なるハンドラ群のバリデーション統一では、「バリデーションパターン」と「引数形式」を分離して考える。パターンのみ統一し、形式統一は別スコープにする                                                  |

```typescript
// オブジェクト型（4ハンドラ: skill:import, skill:remove, skill:execute, skill:getDetail）
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// 直接引数型（2ハンドラ: skill:abort, skill:get-status）
if (typeof executionId !== "string" || executionId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "executionId must be a non-empty string",
  };
}
```

#### 5. return → throw マイグレーション時のRenderer側影響分析

| 項目       | 内容                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | バリデーションエラーの応答形式を return（各種形式）から throw に変更すると、Renderer側でエラーハンドリングが変わる可能性があった                                                                                                           |
| **原因**   | 6ハンドラで return false / return null / return { success: false } / throw の4種類の応答形式が混在しており、throw統一の影響範囲が不明確                                                                                                    |
| **解決策** | Preload層の `safeInvoke` 実装を確認し、`ipcRenderer.invoke()` が Main Process の throw を自動的に reject に変換し、safeInvoke がそれをキャッチして `{ success: false, error: message }` 形式で返すことを確認。Renderer側の修正は不要と判断 |
| **教訓**   | IPC throw 移行前に Preload 層の safeInvoke/safeInvokeUnwrap の例外処理パスを必ず確認する。Electron の ipcRenderer.invoke() は Main Process の throw を Promise rejection に変換する                                                        |

```typescript
// safeInvoke の例外処理（preload/ipc-utils.ts）
export async function safeInvoke<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    // Main Process の throw はここでキャッチされる
    return { success: false, error: error.message } as T;
  }
}
```

#### 6. コンテキスト枯渇による3セッション分割

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 1-12の全実行に3セッションが必要となり、セッション間でのコンテキスト引き継ぎに苦労した                                                                                                                 |
| **原因**   | Phase 12（ドキュメント更新）が最もコンテキストを消費する。8ファイルの仕様書更新 + topic-map再生成 + IPC契約検証 + documentation-changelog + unassigned-task-report の5タスクを1セッションで完了できなかった |
| **解決策** | セッション引き継ぎ時のサマリーに「残タスクリスト」「完了済みタスクの成果物パス」「次のアクション」を明示的に含める                                                                                          |
| **教訓**   | Phase 12は仕様書更新を3ファイル以下/バッチに分割する（P43対策）。特に LOGS.md×2 + SKILL.md×2 の「4ファイル同時更新」はバッチ分割必須                                                                        |

### 同種課題の簡潔解決手順（プロセス面4ステップ + 実装面5ステップ）

#### プロセス面（4ステップ）

1. 補完タスク完了時に、元未タスクの状態を `task-workflow.md` とドメイン仕様書で同時更新する
2. `artifacts.json` と `phase-12-documentation.md` のステータスを突合し、差分を即時修正する
3. 未タスク監査は `raw件数` と `精査後件数` を分けて記録し、既存TODOを除外判定する
4. `lessons-learned.md` と `skill-creator/references/patterns.md` に再発防止パターンを同期する

#### 実装面（5ステップ）

1. **引数形式の分類**: `grep -n "ipcMain.handle" skillHandlers.ts` で全ハンドラの引数パターンを分類（オブジェクト型/直接引数型）
2. **Preload層の確認**: `grep -n "safeInvoke\|safeInvokeUnwrap" preload/skill-api.ts` で各ハンドラの呼び出しパターンとエラーハンドリングを確認
3. **P42パターンの適用**: 各ハンドラに `typeof arg !== "string" || arg.trim() === ""` + `throw { code: "VALIDATION_ERROR" }` を適用
4. **テストの作成**: `describe.each` で全ハンドラ × 入力パターン（null/undefined/空文字列/スペースのみ/正常値）のマトリクステストを作成
5. **後方互換性の検証**: 既存テストが全PASS することを確認（`cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers`）

---

## TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）

### タスク概要

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-9A-C                                             |
| 目的       | SkillEditor の Phase 12成果物・参照・仕様反映の整合化 |
| 完了日     | 2026-02-19                                            |
| ステータス | **仕様書作成済み（spec_created）**                    |

### 苦戦箇所と解決策

#### 1. tasks/completed-task 参照混在

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| **課題**   | `tasks/` と `tasks/completed-task/` が混在し、タスク参照が一貫しない |
| **原因**   | 仕様書更新時に参照先変更が一部ファイルへしか反映されなかった         |
| **解決策** | `TASK-9A-C` 参照を `completed-task/` へ統一し、旧参照ファイルを削除  |
| **教訓**   | タスク状態変更時は `rg "TASK-ID"` で全参照を横断確認し、一括更新する |

#### 2. phase-09 と phase-9 の表記ゆれ

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| **課題**   | Phase 9成果物の参照が `phase-09` と `phase-9` で混在 |
| **原因**   | 過去テンプレート由来の命名が残存していた             |
| **解決策** | 実ディレクトリに合わせて `phase-9` に統一            |
| **教訓**   | 監査時に `rg "phase-09"` を定常チェックに入れる      |

#### 3. Step 1-B の状態判定の曖昧さ

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| **課題**   | 実装未着手タスクでも Step 1-B を `completed` と誤判定しやすい               |
| **原因**   | Step 1-B の説明が「未実装→完了」に偏っていた                                |
| **解決策** | 本件は `spec_created` を正として記録し、運用ガイドへ判定ルールを追記        |
| **教訓**   | 仕様書作成タスクは `completed` ではなく `spec_created` を許容する分岐が必要 |

#### 4. 未タスク参照の実体不足

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| **課題**   | `task-workflow.md` の未タスクリンクに実体ファイル欠落が1件あった                             |
| **原因**   | 参照登録時の物理ファイル作成が漏れた                                                         |
| **解決策** | `docs/30-workflows/unassigned-task/` に指示書を配置し、`verify-unassigned-links.js` で再検証 |
| **教訓**   | 未タスク登録は「作成→配置→検証（ALL_LINKS_EXIST）」を同一ターンで完了する                    |

---

#### 5. 並列エージェント実行時のAPIレートリミット

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 1の4タスクを4つのSubAgentで並列実行したところ、3/4のエージェントがAPIレートリミット（"You've hit your limit"）に到達し、完了レポートが不完全になった |
| **原因**   | 4エージェント同時実行によりAPIリクエストが集中し、レートリミットに到達。ファイル書き込みは処理最終段階に集中していたため、途中結果が失われるリスクがあった |
| **解決策** | 並列エージェント数を2-3に制限し、重要度の高いタスクを優先実行。ファイル書き込みを処理途中でも行うインクリメンタル設計にする                                |
| **教訓**   | SubAgent並列実行は2-3が安全目安。4以上はレートリミットリスクが高い。重要度順にエージェントを割り当て、中間成果物のファイル書き込みを早期に行う設計が必要   |

**並列エージェント数の安全基準**:

| 並列数 | リスク | 推奨用途                                                           |
| ------ | ------ | ------------------------------------------------------------------ |
| 1-2    | 低     | 標準作業、長時間タスク                                             |
| 3      | 中     | 独立性の高い短時間タスク                                           |
| 4以上  | 高     | レートリミットに到達しやすい。回避策（優先実行・段階的起動）が必須 |

**カテゴリ**: エージェント実行・リソース管理

**相互参照**: [TASK-FIX-13-1 苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)

---

#### 6. スキルスクリプトのパス解決

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `node scripts/complete-phase.js` でMODULE_NOT_FOUNDエラーが発生                                                                                    |
| **原因**   | スクリプトはプロジェクトルートの `scripts/` ではなく `.claude/skills/task-specification-creator/scripts/` に配置されているが、相対パスで誤参照した |
| **解決策** | スキル内スクリプトは `.claude/skills/{skill-name}/scripts/` の絶対パスから参照する                                                                 |
| **教訓**   | スキル関連スクリプトの実行時は、プロジェクトルートの `scripts/` と混同しないよう、必ず `.claude/skills/{skill-name}/scripts/` パスを使用する       |

```bash
# ❌ プロジェクトルートのscripts/を参照（MODULE_NOT_FOUND）
node scripts/complete-phase.js

# ✅ スキルディレクトリ内のscripts/を参照
node .claude/skills/task-specification-creator/scripts/complete-phase.js
```

**カテゴリ**: ツーリング・環境

---

#### 7. 大規模仕様書のコンテキスト管理

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 4（テスト作成）が1005行/43KB、Phase 6（テスト拡充）が1065行/42KBの大規模仕様書になり、1回のエージェント実行で全内容を処理するのが困難だった                  |
| **原因**   | SkillEditorの機能範囲が広く（9コンポーネント、テストデータファクトリ、ユーティリティ関数テスト等）、仕様書が肥大化。エージェントのコンテキストウィンドウを圧迫した |
| **解決策** | 仕様書を複数のサブタスクに分割し、各サブタスク内でコンテキストを限定。Progressive Disclosure原則に従い、必要な部分のみ読み込む設計にした                           |
| **教訓**   | 仕様書は1ファイル800行以下を目安とし、超過する場合はファイル単位（テストデータファクトリ / ユーティリティ関数テスト / コンポーネントテスト）で分割記述する         |

**仕様書サイズの目安**:

| サイズ    | 処理可能性                   | 推奨対応             |
| --------- | ---------------------------- | -------------------- |
| 500行以下 | 1エージェントで問題なし      | 分割不要             |
| 500-800行 | 処理可能だがコンテキスト圧迫 | サブタスク分割推奨   |
| 800行以上 | コンテキスト超過リスク       | ファイル単位分割必須 |

**カテゴリ**: 仕様書設計・コンテキスト管理

---

#### 8. 仕様書へのPitfall事前組み込みの有効性

| 項目     | 内容                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題** | （成功事例）過去の苦戦箇所が実装時に再発するリスクがあった                                                                                                                                       |
| **成果** | `06-known-pitfalls.md` の P31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を Phase 仕様書に「⚠️ 既知の Pitfall 注意事項」テーブルとして事前記載した |
| **効果** | 実装者が仕様書を読んだ時点で既知の落とし穴を認知でき、テスト環境の設定忘れや非互換APIの使用を防止。SkillEditorの全内部状態を`useState`のみで管理する設計判断もP31対策から導出された              |
| **教訓** | 今後の仕様書作成時は、関連するPitfallを仕様書の冒頭に「注意事項テーブル」として必ず記載し、既知の落とし穴を実装前に可視化する                                                                    |

**Pitfall注意事項テーブルの記載例**:

| Pitfall ID | 概要                          | 本タスクでの影響                           | 対策                               |
| ---------- | ----------------------------- | ------------------------------------------ | ---------------------------------- |
| P31        | Zustand Store Hooks無限ループ | SkillEditorで合成Hook使用すると無限ループ  | 全内部状態を`useState`で管理       |
| P39        | happy-dom userEvent非互換     | テストで`userEvent`使用不可                | `fireEvent`を使用                  |
| P40        | テスト実行ディレクトリ依存    | `apps/desktop/`以外から実行するとDOM未定義 | 対象パッケージディレクトリから実行 |

**カテゴリ**: 仕様書品質・知識の再利用

**相互参照**: [06-known-pitfalls.md - P31, P39, P40](../../../rules/06-known-pitfalls.md)

---

## 関連ドキュメント

| ドキュメント                            | 目的                               | パス                                                                                   |
| --------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| architecture-implementation-patterns.md | 実装パターン集（DIパターン等）     | [./architecture-implementation-patterns.md](./architecture-implementation-patterns.md) |
| interfaces-agent-sdk-executor.md        | SkillExecutor インターフェース仕様 | [./interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md)               |
| 06-known-pitfalls.md                    | 既知の落とし穴と防止策             | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)             |

---

## TASK-9A-B: スキルファイル操作IPCハンドラー実装

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-9A-B                                                       |
| 目的       | SkillFileManager の6操作を IPC 経由で安全に実行できる状態にする |
| 完了日     | 2026-02-19                                                      |
| ステータス | **完了**                                                        |

### 実装内容

| 変更内容           | ファイル                                         | 説明                                                                                           |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| IPCハンドラー追加  | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup` の6チャンネルを実装 |
| Preload API公開    | `apps/desktop/src/preload/skill-api.ts`          | `electronAPI.skill` から file 操作 API を公開                                                  |
| チャンネル定義拡張 | `packages/shared/src/ipc/channels.ts`            | 6チャンネルを型安全に追加                                                                      |
| セキュリティ検証   | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `validateIpcSender` + 引数バリデーション + `isKnownSkillFileError` でサニタイズ                |

### 苦戦箇所と解決策

#### 1. 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **課題**   | 仕様書の一部にテスト件数（47）やエラーメッセージ表記の旧値が残り、実装（65テスト、実コード文言）と不一致になった  |
| **原因**   | Phase 12の更新時に「前回レビューのメモ」を再利用し、再実行結果との差分確認を省略した                              |
| **解決策** | IPCテストを再実行して実測値を基準化し、`api-ipc-agent.md` / `security-electron-ipc.md` / `LOGS.md` を一括修正した |
| **教訓**   | 仕様更新は必ず「実行ログと実装コード」を一次情報にし、数値・文言の転記は最後にクロスチェックする                  |

#### 2. Preload公開先パスの取り違え

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 仕様書内に `skill-file-api.ts` という非実在パスが残り、実際の公開先（`skill-api.ts`）と乖離した                                   |
| **原因**   | ファイル名変更後の旧参照が複数仕様書に残存し、横断検索をせずに局所更新で完了扱いにした                                            |
| **解決策** | `rg` で誤パスを全件検出し、`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` を同ターンで修正した |
| **教訓**   | IPC系の仕様更新は単一ファイルで閉じず、Preload/Shared/Main を束ねた横断検索を必須工程にする                                       |

#### 3. 未タスク検出raw件数の誤読防止

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | TODO/FIXME の raw 検出4件を新規未タスクと誤認しやすく、不要な指示書作成リスクがあった                                           |
| **原因**   | 検出スクリプト出力の「候補」と「確定課題」の区別が不明確になりやすい                                                            |
| **解決策** | raw 4件を既存未タスクとの対応で精査し、`task-imp-community-dashboard-handlers-001.md` で管理済みと確認して新規起票0件を明記した |
| **教訓**   | 未タスク検出は raw 件数だけで判断せず、既存台帳との突合結果まで記録して完了判定する                                             |

**コード例**:

```bash
# 実装事実ドリフトを防ぐ最小検証セット
pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/skillFileHandlers*.test.ts
rg -n "skill-file-api\\.ts|TASK-9A-B|65テスト|47" .claude/skills/aiworkflow-requirements/references/
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 4. handlerMap ESMモックパターン

| 項目       | 内容                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Vitest + ESM環境で `require("electron")` が使用不可。ipcMain.handle() で登録されたハンドラー関数をテスト側から直接呼び出す方法が必要だった                                                       |
| **原因**   | Electron の ESM サポートが不完全で、CommonJS スタイルの `require` を使ったモジュール取得ができない                                                                                               |
| **解決策** | `vi.mock("electron")` で ipcMain.handle をモック化し、`Map<string, Function>` (handlerMap) にハンドラーを格納。テスト側から `handlerMap.get(channelName)!(event, args)` で直接呼び出す方式を採用 |
| **教訓**   | Electron IPC テストでは、ランタイム依存を排除した handlerMap キャプチャ方式が最も安定する。TASK-8C-A で確立されたパターンを TASK-9A-B でも踏襲できた                                             |

**コード例**:

```typescript
const handlerMap = new Map<string, Function>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: { fromWebContents: vi.fn() },
}));

// テスト内でハンドラー直接呼び出し
const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
const result = await handler!(mockEvent, {
  skillName: "test",
  relativePath: "SKILL.md",
});
```

#### 5. v8カバレッジの関数定義行カウント問題

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Function Coverage が 44.44% に急落。コールバック内のインライン arrow function `() => [mainWindow]` が v8 カバレッジプロバイダにより独立した関数としてカウントされた                    |
| **原因**   | Vitest の v8 カバレッジプロバイダは V8 エンジンのネイティブカバレッジを使用するため、ソースコード上のアロー関数（`getAllowedWindows: () => [mainWindow]`）を個別関数としてカウントする |
| **解決策** | セキュリティテスト S-03 で `getAllowedWindows()` コールバックの戻り値を明示的に検証するテストを追加し、各ハンドラー内のインライン arrow function が実行されるようにした                |
| **教訓**   | v8 カバレッジでは、validateIpcSender のオプション内 arrow function も関数カウント対象。Function Coverage 低下時は、未実行のインライン関数を grep で特定し、テストで明示的に呼び出す    |

**コード例**:

```typescript
// S-03: getAllowedWindows コールバックの実行を確認
for (let i = 0; i < 6; i++) {
  const options = mockValidateIpcSender.mock.calls[i][2];
  expect(options.getAllowedWindows()).toEqual([mainWindow]);
}
```

#### 6. .trim()境界値バリデーション漏れ

| 項目       | 内容                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 4（テスト作成）で `typeof args?.skillName !== "string"` の型チェックのみ設計したが、Phase 6（テスト拡充）でスペースのみ入力 `"   "` がバリデーションを通過する問題を発見 |
| **原因**   | 初期設計で空文字列チェック `=== ""` を入れたが、空白のみの文字列（`"   "`）は空文字列ではないため通過。SkillFileManager側でパスエラーとなる前に IPC 層で拒否すべきだった       |
| **解決策** | `args.skillName.trim() === ""` を全6ハンドラーの引数バリデーションに追加。backupPath にも同様の `.trim()` チェックを適用                                                       |
| **教訓**   | 文字列バリデーションでは `typeof` + `=== ""` だけでなく `.trim() === ""` の3段チェックを標準化すべき。境界値テスト（B-01, B-02）の追加により発見できた                         |

**コード例**:

```typescript
// ❌ 不十分 — スペースのみの入力を見逃す
if (typeof args?.skillName !== "string" || args.skillName === "") { ... }

// ✅ 完全 — .trim() でホワイトスペースのみも検出
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
```

#### 7. isKnownSkillFileError型ガードによるエラーサニタイズ設計

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 5種類のカスタムエラー（SkillNotFoundError, ReadonlySkillError, PathTraversalError, FileExistsError, FileNotFoundError）の判別を各ハンドラーで個別に行うと、DRY 違反とエラー種別追加時の変更漏れリスクがあった |
| **原因**   | 初期設計で catch ブロック内に直接 instanceof チェーンを記述するプランだったが、6ハンドラー × 5エラー種別 = 30箇所の重複が発生                                                                                 |
| **解決策** | `isKnownSkillFileError(error): error is A                                                                                                                                                                     | B   | C   | D   | E`型ガード関数を共通化。既知エラーは`error.message`をそのまま返し、未知エラーは`"Internal error"` で内部情報を遮断する2分岐に集約 |
| **教訓**   | TypeScript の type guard + union type は、エラーサニタイズの DRY 化に最適。新しいエラークラス追加時も型ガード関数1箇所の修正で済む                                                                            |

**コード例**:

```typescript
function isKnownSkillFileError(
  error: unknown,
): error is SkillNotFoundError | ReadonlySkillError | PathTraversalError | FileExistsError | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

// 各ハンドラーの catch ブロック（DRY）
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

### 参照

- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-11/auto-test-result.md`

### 成果物

| 成果物               | パス                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/`                             |
| 完了タスク記録       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         |
| IPC仕様更新          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         |
| セキュリティ仕様更新 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |

---

## TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元

### タスク概要

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING                                                                  |
| 目的       | `dangerouslyIgnoreUnhandledErrors` を廃止し、未処理Promise拒否をテスト失敗として検知できる状態に戻す |
| 完了日     | 2026-02-19                                                                                           |
| ステータス | **完了**                                                                                             |

### 苦戦箇所と解決策

#### 1. Step 2要否判定の誤り

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| **課題**   | 「設定削除のみ」と見なしてシステム仕様更新不要と誤判定しやすかった                              |
| **原因**   | インターフェース変更の有無だけで判断し、テスト戦略変更を仕様変更として扱っていなかった          |
| **解決策** | 未処理Promise拒否の検知ルール変更を「品質仕様の変更」と定義し、`quality-requirements.md` を更新 |
| **教訓**   | プロダクトコード変更がなくても、テスト戦略変更は Step 2 更新対象になる                          |

#### 2. 未タスク検出範囲の不足

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| **課題**   | 変更ファイル中心の確認では、Phase成果物に書かれた将来課題を見落としやすい                 |
| **原因**   | Task 4で `outputs/phase-*` まで横断確認する運用が徹底されていなかった                     |
| **解決策** | Phase成果物まで含めて再監査し、`task-imp-vitest-alias-sync-automation-001` を未タスク登録 |
| **教訓**   | 未タスク検出は「コード差分 + 成果物記述」の両輪で実施する                                 |

#### 3. alias運用の継続性不足

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| **課題**   | `@repo/shared` alias は手動追従で、export更新時に再発リスクが残る                         |
| **原因**   | alias整合の機械検証がなく、発覚がテスト実行時に後ろ倒しになる                             |
| **解決策** | 未タスク `task-imp-vitest-alias-sync-automation-001` を起票し、CIで差分検知する方針を定義 |
| **教訓**   | 設定修正完了時点で「再発防止の自動検証」まで分離タスク化して残す                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `dangerouslyIgnoreUnhandledErrors` を未設定に戻し、対象テストを最小実行して失敗原因を観測する。
2. 失敗が未処理Promise拒否であることを確認し、設定で隠蔽せずテスト/実装側を修正する。
3. `@repo/shared` の解決エラーが出る場合は、具体サブパスを先にしたalias順序で補正する。
4. Phase 12では `task-workflow.md` と `quality-requirements.md` を同時更新し、苦戦箇所を記録する。
5. 将来再発要因は未タスク化し、`verify-unassigned-links.js` で参照整合を確認する。

### 関連仕様書

| 仕様書                     | 反映内容                                     |
| -------------------------- | -------------------------------------------- |
| task-workflow.md           | 完了タスク・苦戦箇所・未タスク登録           |
| quality-requirements.md    | 未処理Promise拒否検知ルール、alias管理ルール |
| lessons-learned.md（本書） | 同種課題向けの再利用手順                     |

---

## TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決エラー修正

### タスク概要

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001                       |
| 目的       | `@repo/shared` サブパス解決を TypeScript / Vitest で一貫させる |
| 完了日     | 2026-02-20                                                     |
| ステータス | **完了**                                                       |

### 苦戦箇所と解決策

#### 1. exports/paths/alias 三層整合の同期漏れ

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| **課題**   | `package.json exports` だけ更新しても `tsc`/`vitest` の解決が一致しない |
| **原因**   | 正本と実行系設定が分離しており、手動同期漏れが起きやすい                |
| **解決策** | `exports`/`paths`/`alias` を同一変更で更新し、3テストで整合を固定化     |
| **教訓**   | サブパス追加は「3層同時更新 + テスト更新」を1セットで扱う               |

**三層設定の対応例**（`@repo/shared/types/rag` を追加する場合）:

```jsonc
// 1. package.json exports（正本）
"./types/rag": {
  "types": "./dist/src/types/rag/index.d.ts",
  "import": "./dist/src/types/rag/index.js"
}

// 2. tsconfig.json paths（tsc 解決用）
"@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]

// 3. vitest.config.ts alias（テスト実行用）
"@repo/shared/types/rag": resolve(__dirname, "../../packages/shared/src/types/rag/index.ts")
```

**注意**: `exports` は `dist/` 配下を指すが、`paths` と `alias` は **ソースファイル直接参照**（`src/`）を指す。この「参照先の二重性」が同期漏れの原因となる。

#### 2. source直接参照時の補助型宣言取り込み漏れ

| 項目       | 内容                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| **課題**   | `apps/desktop` から shared ソースを直接参照すると、一部型宣言が欠落する                |
| **原因**   | shared 側補助宣言ファイルが `tsconfig` の `include` 対象外だった                       |
| **解決策** | `apps/desktop/tsconfig.json` `include` に `@anthropic-ai-claude-agent-sdk.d.ts` を追加 |
| **教訓**   | workspace source 直参照時は、コードだけでなく補助宣言ファイルの取り込み確認が必要      |

```jsonc
// ❌ Before: 補助型宣言が include 対象外
// apps/desktop/tsconfig.json
{
  "include": ["src/**/*"]
}
// → shared 内の @anthropic-ai-claude-agent-sdk.d.ts が認識されず TS2307

// ✅ After: 補助型宣言を明示的に include
{
  "include": [
    "src/**/*",
    "../../packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts"
  ]
}
```

#### 3. 未タスクリンク整合の既存崩れ

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| **課題**   | 本タスクの検証中に、既存未タスク参照4件のリンク切れが発覚                          |
| **原因**   | `task-workflow.md` 登録済みタスクの指示書ファイルが未作成のまま残存                |
| **解決策** | 欠落4ファイルを `unassigned-task/` に作成し、`verify-unassigned-links.js` を再実行 |
| **教訓**   | 新規未タスク登録時は、自タスク分だけでなく既存台帳全体のリンク健全性も確認する     |

```bash
# リンク切れ検証コマンド
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 手動で未タスク参照を一括確認する場合
grep -rn "unassigned-task/" docs/30-workflows/ .claude/skills/ | \
  sed 's/.*(\(.*\)).*/\1/' | sort -u | \
  while read f; do [ ! -f "$f" ] && echo "MISSING: $f"; done
```

#### 4. TypeScript paths 定義順序の重要性

| 項目       | 内容                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `@repo/shared/types` が `@repo/shared/types/llm/schemas` より先に定義されると、後者のパスが解決されない                                                                    |
| **原因**   | TypeScript は paths マッピングを上から順に評価し、最初にマッチしたパスを使用する。`@repo/shared/types` が先にマッチすると、`@repo/shared/types/llm/schemas` は評価されない |
| **解決策** | paths 定義順序を「具体的（長いパス）→ 汎用的（短いパス）」に並べる。vitest alias も同じ順序で定義する                                                                      |
| **教訓**   | TypeScript paths のマッチングは「最長一致」ではなく「先行一致」。定義順序がパス解決の正否を直接決定する                                                                    |

```jsonc
// ❌ 誤った順序: 汎用パスが先にマッチし、具体パスが無効化
{
  "paths": {
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]
  }
}
// → "@repo/shared/types/llm/schemas" は "@repo/shared/types" にマッチして解決失敗

// ✅ 正しい順序: 具体パスを先に定義
{
  "paths": {
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"],
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"]
  }
}
```

#### 5. 4ファイル同期の必要性（package.json / tsconfig / vitest.config / typesVersions）

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `package.json exports` のみ更新しても、tsc と vitest が異なるパスに解決し整合しない                                  |
| **原因**   | モノレポの「ソース直接参照」方式では、正本（exports）と実行系設定（paths, alias, typesVersions）が完全に分離している |
| **解決策** | サブパス追加時は以下4ファイルを同一コミットで更新する                                                                |
| **教訓**   | 設定変更の影響範囲を事前にチェックリストで固定化し、1ファイルでも漏れたらテストが落ちる構造にする                    |

**4ファイル同期チェックリスト**:

| #   | ファイル                                     | 更新内容                                      | 用途                      |
| --- | -------------------------------------------- | --------------------------------------------- | ------------------------- |
| 1   | `packages/shared/package.json` exports       | サブパスと `dist/` 参照先を追加               | ランタイム（Node.js解決） |
| 2   | `apps/desktop/tsconfig.json` paths           | サブパスとソース直参照先を追加                | tsc 型チェック            |
| 3   | `apps/desktop/vitest.config.ts` alias        | サブパスとソース直参照先を追加（具体→汎用順） | Vitest テスト実行         |
| 4   | `packages/shared/package.json` typesVersions | `*` 条件で型解決パスを追加                    | 型解決フォールバック      |

### 同種課題の簡潔解決手順（5ステップ）

1. **エラー分析**: `pnpm typecheck 2>&1 | grep "TS2307" | sort -u` でモジュール未検出パスを特定する
2. **exports 確認**: `package.json` の `exports` エントリと実ファイルパスの 1:1 対応を確認する
3. **paths 追加**: `tsconfig.json` に paths マッピングを追加する（具体的→汎用の順序で定義）
4. **alias 同期**: `vitest.config.ts` の `resolve.alias` に同じエントリを追加する（同じく具体→汎用順）
5. **テスト実行**: `pnpm typecheck && cd apps/desktop && pnpm vitest run src/__tests__/*module-resolution*` で整合性を検証する

---

## TASK-FIX-14-1: console → electron-log 移行

### タスク概要

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION                                    |
| 目的       | Skill系Main Processのログ出力を `console.*` から `electron-log` に統一 |
| 完了日     | 2026-02-14                                                             |
| ステータス | **完了**                                                               |

### 苦戦箇所と解決策

#### 1. 実変更ファイル名との乖離

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| **課題**   | Phase 12成果物（implementation-guide/final-review）に、実装対象と異なるファイル名が混入  |
| **原因**   | 文書更新時に `git diff` ではなく過去メモを基準に記述したため                             |
| **解決策** | `git diff --name-only` と実ファイル参照を正として、成果物内の対象ファイル名を全件修正    |
| **教訓**   | Phase 12の技術文書は「実装事実（差分）」を一次情報として記述し、推測ベース記述を禁止する |

#### 2. Phase 12 Step 1-A/1-C/1-D の先送り誤判定

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **課題**   | `documentation-changelog.md` に Step 1-A/1-C/1-D が「PR時対応」相当で記録され、完了条件と不整合         |
| **原因**   | Step 1（必須）とPhase 13（PR作成）の責務境界が曖昧だった                                                |
| **解決策** | Step 1-A/1-C/1-Dを同ターン内で完了させ、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行結果を反映 |
| **教訓**   | Phase 12では「後続Phaseで対応予定」という記述を許容せず、必須ステップは即時完了で記録する               |

#### 3. 未タスク検出後の登録漏れ

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| **課題**   | `SkillExecutor.ts` 残存 `console` を検出後、検出レポートのみで完了扱いになりやすかった         |
| **原因**   | 「検出」と「未タスク登録（指示書 + 仕様書テーブル更新）」の工程が分離されていた                |
| **解決策** | 3ステップを同一ターンで実施（指示書作成 → `task-workflow.md` 登録 → 関連仕様書残課題更新）     |
| **教訓**   | 未タスク検出はレポート作成で終わらせず、追跡可能な台帳登録まで完了して初めてPhase 12完了とする |

#### 4. 大量テストファイルへのモック一括追加

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 本番コード4ファイルの electron-log 移行に伴い、関連テスト9ファイルに `vi.mock("electron-log")` を追加する必要があった                                                  |
| **原因**   | electron-log はデフォルトで stdout に出力するため、モック未定義のテストではログがテスト出力に混入する（P20パターン）                                                   |
| **解決策** | `grep -rn "from.*SkillImportManager\|PermissionStore\|SkillScanner\|SkillAnalyzer" __tests__/` で影響テストを特定し、バックグラウンドエージェントで9ファイルに一括追加 |
| **教訓**   | ログライブラリ移行では、本番コード修正量よりテストモック追加の影響範囲の方が大きい。事前に影響テストファイル数を見積もり、並列エージェントで効率化すべき               |

```typescript
// 標準モックパターン（全9ファイルに統一適用）
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

#### 5. debug プロパティの後方互換性判断

| 項目       | 内容                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `SkillImportManager.ts` の `this.debug` プロパティは移行後に読み取られなくなったが、5テストファイル25箇所で参照されていた                                                               |
| **原因**   | `if (this.debug) console.log(...)` が `log.debug(...)` に置換されたことで、`this.debug` の読み取り箇所が消滅                                                                            |
| **解決策** | 後方互換性を優先し、`this.debug` プロパティは設定のみ残して維持。テスト側の `{ debug: true }` オプション渡しは既存のまま                                                                |
| **教訓**   | 「未使用プロパティの即時削除」vs「テスト影響の最小化」のトレードオフでは、テスト変更量が25箇所を超える場合は後方互換維持が合理的。後続タスク（TASK-FIX-14-2完了後）で段階的に削除を検討 |

#### 6. カバレッジ計測コマンドの引数誤り

| 項目       | 内容                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `vitest run --coverage src/main/services/skill/SkillScanner.ts` でカバレッジが 0% と表示された                                                                              |
| **原因**   | vitest の引数にはテストファイルパスを指定すべきだが、ソースファイルパスを指定していた                                                                                       |
| **解決策** | `vitest run --coverage src/main/services/skill/` のようにテストファイルが含まれるディレクトリを指定し、出力から対象ソースファイルを grep で抽出                             |
| **教訓**   | vitest のカバレッジ計測では引数がテストファイルのフィルタとして機能する。ソースファイル単位のカバレッジが必要な場合は、テストディレクトリを指定して出力をフィルタリングする |

```bash
# ❌ カバレッジ0%になる（ソースファイルパスを引数に指定）
vitest run --coverage src/main/services/skill/SkillScanner.ts

# ✅ 正しい方法（テストディレクトリを指定してgrepで抽出）
vitest run --coverage src/main/services/skill/ 2>&1 | grep "SkillScanner"
```

#### 7. 条件ガード削除による予想外の簡素化効果

| 項目     | 内容                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題** | 当初は `console.log` → `log.debug` の単純置換のみと想定していた                                                                                                     |
| **発見** | `if (this.debug)` ガード（3箇所）と `process.env.NODE_ENV !== "test"` ガード（2箇所）が同時に削除可能だった                                                         |
| **効果** | 条件分岐の削除によりコードの循環的複雑度が低下し、SkillImportManager.ts のコード行数が約10%削減                                                                     |
| **教訓** | ログライブラリ移行は単なるAPI置換ではなく、環境判定ロジックの簡素化という副次効果がある。移行計画時にこの効果を見積もることで、リファクタリングの価値を正当化できる |

### 関連未タスク

| タスクID                                          | タスク名                                            | 優先度 | 仕様書                                                                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION | SkillExecutor の console ログを electron-log に移行 | 低     | [`docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md`](../../../docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md) |

---

## TASK-FIX-11-1: SDK統合テスト有効化

### タスク概要

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                             |
| 目的       | TODOプレースホルダ17件を実テスト化し、SDK統合後の検証を有効化 |
| 完了日     | 2026-02-13                                                    |
| ステータス | **完了**                                                      |

### 苦戦箇所と解決策

#### 1. Phase 12 Step 1-A/1-D の「該当なし」誤判定

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| **課題**   | 「テストコードのみ変更」を理由に LOGS/SKILL 更新と index 再生成を初回で省略                              |
| **原因**   | Step 1-A（必須）と Step 2（条件付き）の区別を混同                                                        |
| **解決策** | Step 1-A〜1-Dを必須チェックとして再実行し、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行を固定化 |
| **教訓**   | 検証系・テスト系タスクでも Step 1-A/1-D は常に必須                                                       |

#### 2. 未タスク検出の raw 結果をそのまま採用

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| **課題**   | `detect-unassigned-tasks.js` で 51件検出されたが、多くが仕様書本文中の説明用 TODO だった |
| **原因**   | 実装ディレクトリとドキュメントディレクトリを同一ルールで評価                             |
| **解決策** | 2段階判定を採用（1: 実装ディレクトリ優先スキャン、2: raw検出の手動精査）                 |
| **教訓**   | raw件数は候補であり、未タスク確定件数とは分離して記録する                                |

#### 3. Vitest モック初期化の挙動差異

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **課題**   | 一部テストで `vi.clearAllMocks()` 後も前テストのモック実装が残存                            |
| **原因**   | `clearAllMocks` は call history を消すのみで実装は保持される                                |
| **解決策** | `beforeEach` で `mockResolvedValue` を毎回再設定し、失敗系は `mockRejectedValueOnce` を使用 |
| **教訓**   | 「履歴クリア」と「実装リセット」は別操作として扱う                                          |

**Vitest モックリセット API 比較**:

| API                    | 呼び出し履歴 | mockImplementation | mockReturnValue | mockResolvedValue |
| ---------------------- | :----------: | :----------------: | :-------------: | :---------------: |
| `vi.clearAllMocks()`   |    クリア    |        保持        |      保持       |       保持        |
| `vi.resetAllMocks()`   |    クリア    |      リセット      |    リセット     |     リセット      |
| `vi.restoreAllMocks()` |    クリア    |      元に戻す      |    元に戻す     |     元に戻す      |

**SDK テスト有効化で発生した具体例**:

```typescript
// ❌ 問題パターン: mockRejectedValue が後続テストに漏洩
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValue(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ mockRejectedValue は "永続的" なため、次のテストにも影響する

  it("正常系テスト", async () => {
    // ← mockRejectedValue が残存し、このテストも失敗する
  });
});

// ✅ 解決パターン: "Once" サフィックスで1回限りのモック
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ "Once" なので消費後に元の実装に戻る

  it("正常系テスト", async () => {
    // ← 前テストの影響を受けない
  });
});
```

#### 3b. モジュールレベルモックによるタイムアウトテスト不可問題

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | `vi.mock("../agent-client")` でモジュール全体をモック化すると、内部の `setTimeout` + `AbortController` によるタイムアウトロジックが消失し、`vi.advanceTimersByTimeAsync(30000)` でタイムアウトを再現できない |
| **原因**   | `vi.mock()` はモジュール内の全エクスポートをモック関数に置換するため、元の実装内部のタイマーロジックは実行されない                                                                                           |
| **解決策** | タイムアウトを内部ロジックで再現するのではなく、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する                                                                                 |
| **教訓**   | モジュールレベルモックでは「内部実装の再現」ではなく「外部インターフェースでのシミュレーション」が正しいアプローチ                                                                                           |

**コード例**:

```typescript
// ❌ 失敗パターン: モジュールモック下でタイマーを進めてもタイムアウトしない
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モジュール内のsetTimeoutが存在しないため、何も起きない

// ✅ 成功パターン: エラーを直接注入
mockAgentAPI.query.mockImplementation(
  () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000);
    }),
);
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モック内のsetTimeoutがfake timerで制御され、タイムアウトエラーが発生
```

#### 3c. beforeEach での明示的モック再設定パターン

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `vi.clearAllMocks()` だけでは `mockImplementation()` で設定した「応答しない Promise」が残り続け、後続の正常系テストが全て失敗する |
| **原因**   | `clearAllMocks` は呼び出し回数（`.mock.calls`）をリセットするのみで、`mockImplementation()` の関数置換はリセットしない            |
| **解決策** | `beforeEach` で `mockAgentAPI.query.mockResolvedValue(...)` を毎回呼び出し、「デフォルト正常応答」を明示的に再設定する            |
| **教訓**   | テスト基盤の `beforeEach` は「呼び出し履歴クリア」と「デフォルト応答再設定」の2段構えで設計する                                   |

**推奨パターン**:

```typescript
beforeEach(() => {
  // 段階1: 呼び出し履歴をクリア
  vi.clearAllMocks();

  // 段階2: デフォルト応答を明示的に再設定
  mockAgentAPI.query.mockResolvedValue({
    response: "default mock response",
    tokenUsage: { input: 100, output: 50 },
  });

  // 段階3: 他のモックのデフォルトも設定
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "response" }],
  });
});
```

### 関連未タスク

| タスクID                               | タスク名                                                    | 優先度 | 仕様書                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task-imp-vitest-mock-reset-utility-001 | Vitest モック2段階リセットユーティリティ共通化              | 中     | [`docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md) |
| task-ref-vitest-module-mock-audit-001  | Vitest モジュールレベルモック監査・使い分けガイドライン策定 | 低     | [`docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`](../../../docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md)   |

---

## TASK-FIX-13-1: deprecatedプロパティ正式移行

### タスク概要

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION                                  |
| 目的       | `Anchor.name` / `Skill.lastUpdated` のdeprecated定義を正式撤去し、参照を移行 |
| 完了日     | 2026-02-13                                                                   |
| ステータス | **完了**                                                                     |

### 苦戦箇所と解決策

#### 1. 削除対象の境界判定

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| **課題**   | `lastUpdated` が複数型に存在し、全削除すると永続化互換を壊す可能性があった |
| **解決策** | `Skill.lastUpdated` のみ削除し、`SkillImportConfig.lastUpdated` は据え置き |
| **教訓**   | deprecated除去時は「公開型」「永続化型」を先に分離して判定する             |

#### 2. 汎用プロパティ参照の誤検出回避

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| **課題**   | `name` は汎用キーのため単純置換で誤修正リスクが高かった           |
| **解決策** | `Anchor` 型スコープで参照箇所を限定し、`anchor.source` へ段階移行 |
| **教訓**   | 文字列置換ではなく「型スコープ + 参照ファイル限定」で移行する     |

#### 3. Phase-12仕様同期漏れの防止

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **課題**   | コード修正完了時点で仕様書更新・教訓記録が漏れやすい                          |
| **解決策** | `interfaces-agent-sdk-skill.md` / `task-workflow.md` / 本書を同一ターンで更新 |
| **教訓**   | Phase 12では「コード + 仕様 + 教訓」を1セットで完了判定する                   |

#### 4. ドキュメント偏重による実装検証の省略

| 項目       | 内容                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 1-12の成果物ドキュメントを並列エージェントで大量生成したが、実際のコード変更が完了しているかの検証（grep調査・テスト実行・型チェック）が不十分だった。ドキュメント作成が「実装完了」と誤認されるリスクがあった           |
| **解決策** | 再検証セッションで3つの調査エージェントを並列起動し、Anchor型・Skill型の全参照箇所を網羅的にgrepした結果、実装自体は完了済みであることを確認。テスト（8/8 PASS）、TypeScript型チェック（エラー0件）、ESLint（エラー0件）で証明 |
| **教訓**   | **ドキュメント生成とコード検証は分離すべき**。並列エージェントでドキュメントを生成する場合でも、必ず先に「コードの実装完了」を品質ゲート（テスト・型チェック・grep）で確認してからドキュメント作成に移行する                   |

#### 5. 並列エージェント実行時の成果物品質保証

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 5つのバックグラウンドエージェントで Phase 1-11 のドキュメントを同時生成したが、各エージェントの出力品質を個別に検証する手段が不足していた                                           |
| **解決策** | 全エージェント完了後に outputs/ 配下の12ファイル存在確認、ファイルサイズ確認、内容の一貫性チェックを実施                                                                            |
| **教訓**   | 並列エージェント実行後は「全成果物の一覧確認」と「内容の整合性チェック」を必ず実施する。特にPhase間の依存関係がある場合、先行Phaseの結果を後続Phaseが正しく参照しているか確認が必要 |

---

## TASK-FIX-7-1: SkillService executeSkill 委譲実装

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION                           |
| 目的       | SkillService.executeSkill() が SkillExecutor に委譲するよう変更 |
| 完了日     | 2026-02-11                                                      |
| ステータス | **完了**                                                        |

### 実装内容

| 変更内容                | ファイル           | 説明                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| executeSkill() 委譲実装 | `SkillService.ts`  | 内部で skillExecutor.execute() を呼び出し        |
| setSkillExecutor() 追加 | `SkillService.ts`  | Setter Injection パターンで SkillExecutor を注入 |
| DI 設定                 | `skillHandlers.ts` | SkillExecutor を生成して SkillService に注入     |

### 苦戦箇所と解決策

#### 1. Setter Injection vs Constructor Injection の選択

| 項目               | 内容                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **課題**           | SkillService のコンストラクタ時点では SkillExecutor を生成できない      |
| **原因**           | SkillExecutor は BrowserWindow を必要とし、アプリ起動後でないと生成不可 |
| **検討した選択肢** | Constructor Injection / Setter Injection / Factory Pattern              |
| **採用した解決策** | Setter Injection パターン                                               |
| **選択理由**       | 遅延初期化が必要な依存オブジェクトに適切、テスタビリティも確保可能      |

**DIパターン使い分け基準**:

| パターン              | 適用場面                                   | 例                            |
| --------------------- | ------------------------------------------ | ----------------------------- |
| Constructor Injection | 依存オブジェクトが生成時点で利用可能       | DB接続、設定オブジェクト      |
| Setter Injection      | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern       | 依存オブジェクトを動的に生成する必要がある | プラグインシステム            |

**コード例（Setter Injection パターン）**:

```typescript
// SkillService.ts
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  // Setter Injection: 遅延初期化用
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(
    skillId: string,
    params?: {
      prompt?: string;
      timeout?: number;
      sessionId?: string;
      retryConfig?: SkillExecutionRequest["retryConfig"];
    },
  ): Promise<SkillExecutionResponse> {
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor が初期化されていません");
    }
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }
    // SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? "",
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };
    // Skill → SkillMetadata のインライン変換
    const metadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
      category: skill.category,
    };
    return this.skillExecutor.execute(request, metadata);
  }
}

// skillHandlers.ts（DI設定）
function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
  authKeyService?: IAuthKeyService,
): void {
  const skillExecutor = new SkillExecutor(
    mainWindow,
    undefined,
    authKeyService,
  );
  skillService.setSkillExecutor(skillExecutor);
  // ハンドラー登録...
}
```

**参照**: [architecture-implementation-patterns.md - Setter Injection](./architecture-implementation-patterns.md)

---

#### 2. テストモックの大規模修正

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**     | 既存の5つのテストファイルに mockSkillExecutor を追加する必要があった                                                                              |
| **影響範囲** | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策**   | 各テストファイルに mockSkillExecutor を定義し、beforeEach でリセット                                                                              |
| **教訓**     | DI 追加時は影響範囲を事前に調査すべき                                                                                                             |

**mockSkillExecutor の標準構成**:

| メソッド            | モック定義                    | 説明               |
| ------------------- | ----------------------------- | ------------------ |
| execute             | `vi.fn()`                     | スキル実行         |
| abort               | `vi.fn()`                     | 実行中断           |
| getActiveExecutions | `vi.fn().mockReturnValue([])` | アクティブ実行一覧 |
| getExecutionStatus  | `vi.fn()`                     | 実行状態取得       |

**コード例（mockSkillExecutor）**:

```typescript
// テストファイルでの mockSkillExecutor 定義
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  getExecutionStatus: vi.fn(),
};

describe("SkillService executeSkill委譲", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockSkillExecutor をリセット
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      output: "test output",
    });
  });

  it("executeSkill が SkillExecutor に委譲する", async () => {
    skillService.setSkillExecutor(mockSkillExecutor);

    await skillService.executeSkill(testSkill, "test args");

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: testSkill.name }),
      "test args",
    );
  });
});
```

**参照**: [06-known-pitfalls.md - P21](../../../rules/06-known-pitfalls.md)

---

#### 3. Skill から SkillMetadata への型変換

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Skill 型から SkillMetadata 型への変換が必要                                                                                                           |
| **原因**   | SkillService は Skill 型（`lastModified` を含む）を保持するが、SkillExecutor.execute() は SkillMetadata 型（`Omit<Skill, "lastModified">`）を期待する |
| **解決策** | executeSkill() 内でインライン変換を実装（専用メソッドは不要）                                                                                         |
| **教訓**   | 使用箇所が1箇所のみの型変換は、専用メソッドに抽出せずインラインで記述する方が可読性が高い。過剰な抽象化を避けるべき                                   |

**型変換の対応関係（9フィールド）**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されており、`lastModified` を除くすべての Skill プロパティを含む。実際の変換では、以下の9フィールドを明示的にマッピングしている。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容                           |
| ---------------- | ------------------------ | ---------------------------------- |
| id               | id                       | スキル一意識別子（パスのハッシュ） |
| name             | name                     | スキル名                           |
| slug             | slug                     | ディレクトリ名                     |
| description      | description              | 概要説明                           |
| path             | path                     | SKILL.md のファイルパス            |
| triggers         | triggers                 | Trigger キーワード配列             |
| anchors          | anchors                  | Anchor 一覧                        |
| allowedTools     | allowedTools             | 許可されたツール配列（任意）       |
| category         | category                 | カテゴリ（任意）                   |

**コード例（インライン変換）**:

```typescript
// SkillService.ts - executeSkill() 内でインライン変換
// 使用箇所が1箇所のため、専用メソッドへの抽出は過剰な抽象化と判断
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
return this.skillExecutor.execute(request, metadata);
```

**参照**: [interfaces-agent-sdk-executor.md - 型変換パターン](./interfaces-agent-sdk-executor.md)

---

#### 4. Phase間テスト数整合性問題

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 7/8/9/10 でテスト数が不整合（Phase 7: 38, Phase 8: 33, Phase 9: 39, Phase 10: 53）                                      |
| **原因**   | 各Phaseの成果物を独立に作成した際に、実際のテスト実行結果ではなく推定値を記載した                                             |
| **解決策** | テスト数は必ず `pnpm vitest run -- --grep "対象" --reporter=verbose` の実行結果から取得する                                   |
| **教訓**   | テスト数等の定量データは推定ではなく実測値を使用すべき。Phase間で数値が不整合な場合は、最新のテスト実行結果を正として更新する |

**不整合が発生するパターン**:

| パターン                         | 原因                                             | 防止策                                               |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Phase間の推定値ズレ              | 各Phaseを異なるセッションで作成                  | Phase完了時に毎回 `pnpm test` を実行して実測値を記録 |
| テスト追加/削除の未反映          | Phase 6でテスト追加後にPhase 7の数値を更新し忘れ | Phase 7（カバレッジ確認）で必ずテスト総数を再計測    |
| リファクタリングによるテスト統合 | Phase 8でテスト統合後に数値が減少                | リファクタリング後のテスト数を明示的に記録           |

**推奨ワークフロー**:

| ステップ | 処理                                                 | 成果物             |
| -------- | ---------------------------------------------------- | ------------------ |
| 1        | `pnpm vitest run --reporter=verbose 2>&1 \| tail -5` | テスト総数の実測値 |
| 2        | 実測値を Phase 成果物に記録                          | 正確なテスト数     |
| 3        | 前Phase の数値と比較し差異を説明                     | テスト数増減の根拠 |

---

#### 5. 未タスク指示書の作成漏れ

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `unassigned-task-report.md` に「指示書作成済み」と記載しながら、実際の指示書ファイルを未作成                           |
| **原因**   | レポート作成と指示書作成を別々のエージェントが担当し、指示書作成が実行されなかった                                     |
| **解決策** | 未タスク管理の3ステップ（(1)指示書作成 (2)残課題テーブル登録 (3)関連仕様書リンク追加）は単一エージェントで一括実行する |
| **教訓**   | P3（未タスク管理の3ステップ不完全）の再発。チェックリストを使った物理的ファイル存在確認が必要                          |

**未タスク管理の3ステップ検証方法**:

| ステップ                  | 検証コマンド                                     | 期待結果                               |
| ------------------------- | ------------------------------------------------ | -------------------------------------- |
| 1. 指示書ファイル存在確認 | `ls docs/30-workflows/unassigned-task/task-*.md` | 対象ファイルが存在すること             |
| 2. 残課題テーブル登録確認 | `grep "タスクID" task-workflow.md`               | 残課題テーブルにエントリが存在すること |
| 3. 関連仕様書リンク確認   | `grep "タスクID" references/*.md`                | 関連仕様書に参照リンクが存在すること   |

**再発防止策**:

| 対策                   | 説明                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| 単一エージェント実行   | 3ステップを分割せず、1つのエージェントが一括で実行                                            |
| ファイル存在確認       | 各ステップ完了後に `ls` でファイル存在を物理的に検証                                          |
| Phase 12チェックリスト | [05-task-execution.md#Task 4](../../../rules/05-task-execution.md) のチェックリストを逐次確認 |

**参照**: [06-known-pitfalls.md - P3](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物                  | パス                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| SkillService 実装       | `apps/desktop/src/main/services/skill/SkillService.ts`                         |
| skillHandlers DI 設定   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   |
| 委譲テスト              | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`           |
| SkillService 委譲テスト | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` |

### 関連ドキュメント更新

| ドキュメント                                                                         | 更新内容                                            |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン追加                       |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md)               | SkillService 統合セクション追加、型変換パターン追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                          | P32 追加（遅延初期化パターン選択の教訓）            |

---

## UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行

### タスク概要

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001                                   |
| 目的       | Zustand合成Store Hookを個別セレクタHookに移行し、P31無限ループを根本解決 |
| 完了日     | 2026-02-12                                                               |
| ステータス | **完了**                                                                 |

### 実装内容

| 変更内容                  | ファイル                                                        | 説明                                                                                |
| ------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 個別セレクタHook 30個追加 | `apps/desktop/src/renderer/store/index.ts`                      | LLM系12個 + Skill系15個 + AuthMode系3個                                             |
| LLMSelectorPanel移行      | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useLLMStore() → useLLMProviders(), useLLMFetchProviders() 等                        |
| SkillSelector移行         | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | useSkillStore() → useAvailableSkillsMetadata(), useRescanSkills() 等                |
| SettingsView移行          | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | useAuthModeStore() → useSetAuthMode(), useInitializeAuthMode() 等。useRefガード削除 |

### 苦戦箇所と解決策

#### 1. useStoreの参照安定性

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | ZustandのuseStore(selector)で返されるオブジェクトや関数の参照安定性を保証する必要があった                                 |
| **原因**   | `useAppStore(state => ({ a: state.a, b: state.b }))` は毎回新しいオブジェクトを返すため、依存配列に入れると無限ループ発生 |
| **解決策** | 各フィールドを個別のセレクタで取得し、プリミティブ値やZustandが内部的に安定させる関数参照を返すようにした                 |
| **教訓**   | Zustand Storeからの取得は「1セレクタ=1フィールド」が最も安全。オブジェクトをまとめて返すパターンは避ける                  |

**コード例（個別セレクタパターン）**:

```typescript
// store/index.ts - 個別セレクタHook（参照安定）
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);

// コンポーネントでの使用（useRefガード不要）
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  // fetchProvidersはZustandが内部的に安定させた参照のため、依存配列に含めても安全
  fetchProviders();
}, [fetchProviders]);
```

**参照**: [arch-state-management.md - P31対策](./arch-state-management.md), [06-known-pitfalls.md - P31](../../../rules/06-known-pitfalls.md)

---

#### 2. Phase 12チェックリスト管理

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| **課題**   | Phase 12で12項目もの更新が必要で、複数の更新漏れが発生した                           |
| **原因**   | Step 1-A〜1-D + Step 2の各サブステップを並列に管理しようとして、一部をスキップした   |
| **解決策** | documentation-changelog.mdに各Step欄を事前に空欄状態で作成し、逐次消化する方式に変更 |
| **教訓**   | Phase 12は「全Step確認前に完了と記載しない」ルールを厳守。チェックリスト駆動が必須   |

**参照**: [spec-update-workflow.md](../../task-specification-creator/references/spec-update-workflow.md), [06-known-pitfalls.md - P1, P4](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物                       | パス                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| 個別セレクタHook（30個）     | `apps/desktop/src/renderer/store/index.ts`                              |
| 参照安定性テスト（31件）     | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           |
| 無限ループ防止テスト（40件） | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |
| LLMSelectorPanel             | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`         |
| SkillSelector                | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`          |
| SettingsView                 | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                |

### 関連ドキュメント更新

| ドキュメント                                                                     | 更新内容                                      |
| -------------------------------------------------------------------------------- | --------------------------------------------- |
| [arch-state-management.md](./arch-state-management.md)                           | P31対策セクションに個別セレクタ実装完了記録   |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                      | P31解決策に個別セレクタ実装完了を反映         |
| [task-workflow.md](../../task-specification-creator/references/task-workflow.md) | 完了タスクセクション追加                      |
| [patterns.md](./patterns.md)                                                     | P31対策パターンに個別セレクタ移行パターン追加 |
| [03-state-management.md](../../../rules/03-state-management.md)                  | 個別セレクタDOルール追加                      |

---

## TASK-9B-H: SkillCreatorService IPCハンドラー登録

> **このセクションの役割**: プロセス面の教訓（何が問題だったか、どう防止するか）を記録する。実装パターン（どう実装するか）については [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md) を参照。

### タスク概要

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | TASK-9B-H-SKILL-CREATOR-IPC                                                       |
| 目的       | SkillCreatorService の IPC ハンドラー登録・Preload API 公開・セキュリティ層を実装 |
| 完了日     | 2026-02-12                                                                        |
| ステータス | **完了**                                                                          |

### 実装内容

| 変更内容           | ファイル                  | 説明                                                     |
| ------------------ | ------------------------- | -------------------------------------------------------- |
| IPCハンドラー登録  | `skillCreatorHandlers.ts` | ipcMain.handle で5チャンネル + 進捗通知1チャンネルを登録 |
| Preload API実装    | `skill-creator-api.ts`    | safeInvoke/safeOn でホワイトリスト検証付きAPI公開        |
| contextBridge統合  | `preload/index.ts`        | electronAPI.skillCreator として統合公開                  |
| ホワイトリスト更新 | `channels.ts`             | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に追加     |

### 苦戦箇所と解決策

#### 1. Preload統合の漏れ防止

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **課題**   | skill-creator-api.ts で skillCreatorAPI を実装したが、preload/index.ts への contextBridge 統合を忘れた |
| **原因**   | Preload API の新規追加時に必要な更新箇所が4箇所に分散しており、チェックリスト化されていなかった        |
| **解決策** | Phase 8-9 で発見・修正。新規Preload API追加時の4箇所更新チェックリストを策定                           |
| **教訓**   | 新規 Preload API 追加時は以下の4箇所を必ず更新する                                                     |

**新規Preload API追加時の必須更新箇所**:

| 更新箇所                           | ファイル           | 内容                                             |
| ---------------------------------- | ------------------ | ------------------------------------------------ |
| 1. import追加                      | `preload/index.ts` | API実装モジュールのimport                        |
| 2. electronAPIオブジェクト追加     | `preload/index.ts` | electronAPIオブジェクトに新APIを追加             |
| 3. contextBridge.exposeInMainWorld | `preload/index.ts` | contextBridge経由でRendererに公開                |
| 4. non-isolatedフォールバック      | `preload/index.ts` | contextIsolation無効時のwindow直下フォールバック |

**参照**: [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md)

**相互参照**: [06-known-pitfalls.md#P23 API二重定義の型管理](../../rules/06-known-pitfalls.md)（Preload API追加時の更新箇所分散に関する教訓）

---

#### 2. 並列Phase実行時のレビュータイミング

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 10（読み取り専用レビュー）が Phase 8-9（コード修正）と並列実行され、修正前のコードをレビューして MAJOR 判定を出した |
| **原因**   | コード修正を伴う Phase とコード読み取りの Phase を並列実行した                                                            |
| **解決策** | コード修正を伴う Phase と読み取りレビュー Phase の並列実行を避ける                                                        |
| **教訓**   | 並列実行する場合は修正前コードの可能性をレビュー結果に明記する                                                            |

**Phase並列実行の安全な組み合わせ**:

| 組み合わせ                            | 安全性 | 理由                                                           |
| ------------------------------------- | ------ | -------------------------------------------------------------- |
| Phase 1-3（要件・設計・レビュー）     | 安全   | 読み取り専用の仕様書作業                                       |
| Phase 4-7（テスト・実装・カバレッジ） | 注意   | コード変更あり、依存関係確認必須                               |
| Phase 8-9 + Phase 10                  | 危険   | リファクタリング中にレビューすると修正前コードを評価してしまう |
| Phase 11 + Phase 12                   | 安全   | 手動テストとドキュメントは独立                                 |

---

#### 3. IPC型定義の配置戦略

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| **課題**   | IpcResult<T> 型が Main 側（skillCreatorHandlers.ts）と Preload 側（skill-creator-api.ts）で重複定義された |
| **原因**   | IPC 通信の両端で同じ型を使用するが、共有パッケージに配置する判断が後回しになった                          |
| **解決策** | 未タスク UT-9B-H-001 として登録し、@repo/shared/types に型を配置する後日対応を計画                        |
| **教訓**   | IPC通信で両側から参照される型は最初から @repo/shared に配置すべき                                         |

**IPC型の配置判断基準**:

| 型の参照元                | 配置先                         | 例                             |
| ------------------------- | ------------------------------ | ------------------------------ |
| Main側のみ                | `apps/desktop/src/main/` 内    | 内部サービス型                 |
| Preload側のみ             | `apps/desktop/src/preload/` 内 | UI固有型                       |
| Main + Preload両方        | `packages/shared/src/`         | IpcResult<T>、共有レスポンス型 |
| Main + Preload + Renderer | `packages/shared/src/`         | ドメイン型（Skill、Agent等）   |

---

#### 4. artifacts.jsonのPhaseステータス管理

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase完了時に artifacts.json のステータスが自動更新されず、Phase 12 のみ completed で残りが pending だった |
| **原因**   | 各 Phase 完了時に artifacts.json のステータス更新が完了条件に含まれていなかった                            |
| **解決策** | 各 Phase 完了時に artifacts.json のステータス更新を完了条件チェックリストに追加                            |
| **教訓**   | Phase 完了時は成果物の作成だけでなく、artifacts.json のステータス更新も必須アクションとする                |

**相互参照**: [06-known-pitfalls.md#P4 documentation-changelogへの早期完了記載](../../rules/06-known-pitfalls.md)（ステータス管理の早期完了判定に関する教訓）

---

#### 5. Phase 12の暗黙的要件の見落とし

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 12の成果物として仕様書に明示されていないが、P28対策としてスキルフィードバックレポートが必要だった。仕様書のチェックリストを完了しても、`.claude/rules/06-known-pitfalls.md` に記載されたP28への対処が漏れた |
| **原因**   | Phase 12仕様書のチェックリストが `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を参照していなかった                                                                                                  |
| **解決策** | Phase 12実行前に `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を全て確認するチェックステップを追加する。P28は仕様書テンプレートにTask 5として明示化すべき                                           |
| **教訓**   | Phase 12のチェックリストだけでなく、`06-known-pitfalls.md` のPhase 12関連Pitfallも完了条件に含める必要がある                                                                                                      |

**参照**: [06-known-pitfalls.md - P28](../../../rules/06-known-pitfalls.md)

**相互参照**: [06-known-pitfalls.md#P28 スキルフィードバックレポート未作成](../../rules/06-known-pitfalls.md)（Phase 12の暗黙的成果物に関する教訓）

---

#### 6. artifacts.jsonのPhase別ステータス更新忘れ

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 12エージェントがPhase 12のステータスのみをcompletedに更新し、Phase 1-11はpendingのまま放置された                         |
| **原因**   | 各Phaseの完了時にartifacts.jsonを更新する運用が確立されておらず、Phase 12エージェントが自Phase以外のステータスを確認しなかった |
| **解決策** | Phase 12仕様書の完了条件に「artifacts.jsonの全Phase（1-12）のステータスがcompletedであること」を明示する                       |
| **教訓**   | Phase 12はプロジェクト全体のステータス整合性を確認する最終チェックポイントとして機能させる                                     |

---

#### 7. 設計書と実装の乖離管理

| 項目       | 内容                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 2設計書で詳細に定義されたZodスキーマ、sanitizeError関数、handleWithErrorBoundaryラッパーが実装されなかった。Phase 5で実装をシンプル化したが、設計書を更新しなかったため、最終レビューで「設計-実装乖離」として検出された |
| **原因**   | Phase 5（実装）で設計書の仕様を変更する判断をしたが、設計書（Phase 2成果物）を同時に更新しなかった                                                                                                                             |
| **解決策** | Phase 5（実装）で設計書の仕様を変更する場合は、同Phase内で設計書（Phase 2成果物）も更新する。「意図的なシンプル化」と「実装漏れ」を区別するため、変更理由をPhase 5成果物に記録する                                             |
| **教訓**   | 設計と実装の乖離は「意図的」であっても、設計書を更新しなければ後続レビューで「実装漏れ」と区別できない                                                                                                                         |

**設計変更時の記録フォーマット**:

| 項目           | 記載内容                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| 変更対象       | 設計書のどの仕様を変更したか                                             |
| 変更理由       | シンプル化、パフォーマンス最適化、スコープ縮小 等                        |
| 変更種別       | 「意図的なシンプル化」「スコープ外として後日対応」「不要と判断して削除」 |
| 未タスク化要否 | 後日対応が必要な場合は未タスクとして登録                                 |

**相互参照**: 将来 06-known-pitfalls.md に P33（設計-実装乖離管理）として追加予定。現時点では本教訓が正本。

---

#### 8. 複数エージェント並列実行時のシステム仕様書更新漏れ

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 12エージェントが一部のシステム仕様書（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md）への更新を漏らした。後続の品質レビューで発見・追加修正が必要になった |
| **原因**   | IPC機能開発時に更新すべきシステム仕様書の一覧が明示されておらず、エージェントが一部ファイルの存在を認識していなかった                                                                  |
| **解決策** | Phase 12仕様書に「IPC機能開発時の更新対象ファイル一覧」を追加する。最低限の更新対象として以下を明記する                                                                                |
| **教訓**   | IPC機能開発では影響範囲が広く、更新対象ファイルが多い。チェックリストによる漏れ防止が必須                                                                                              |

**IPC機能開発時の最低限の更新対象ファイル一覧**:

| ファイル                                  | 更新内容                                               |
| ----------------------------------------- | ------------------------------------------------------ |
| `api-ipc-agent.md`                        | IPCチャンネル定義、ハンドラー仕様の追加・更新          |
| `security-electron-ipc.md`                | セキュリティ層（ホワイトリスト、バリデーション）の記録 |
| `architecture-overview.md`                | アーキテクチャ図、コンポーネント構成の更新             |
| `interfaces-agent-sdk-skill.md`           | 型定義、インターフェース変更の記録                     |
| `task-workflow.md`                        | 完了タスク記録、残課題テーブル更新                     |
| `lessons-learned.md`                      | 苦戦箇所と教訓の記録                                   |
| `architecture-implementation-patterns.md` | 新規実装パターンの追加                                 |

---

#### 9. 返却仕様文言・完了済み未タスク配置・artifacts最終整合

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | UT-9B-H-003完了後、(1) 仕様書のエラーメッセージ文言が実装と不一致、(2) 完了済み未タスク指示書が `unassigned-task/` に残置、(3) `artifacts.json` のPhase完了状態の更新漏れが発生した        |
| **原因**   | Phase 12で「仕様記述」「未タスク管理」「成果物レジストリ管理」を別管理していたため、最終突合が弱かった                                                                                     |
| **解決策** | 1) `security-electron-ipc.md` / `api-ipc-agent.md` を実装準拠に更新、2) 完了済み指示書を `completed-tasks/unassigned-task/` へ移管、3) `artifacts.json` の phase-1〜12 を completed に統一 |
| **教訓**   | Phase 12の完了判定は「ドキュメント更新」「未タスク配置整合」「artifacts整合」の3点を必須同時チェックにする                                                                                 |

**最終整合チェック（再発防止）**:

| チェック項目     | 確認内容                                               |
| ---------------- | ------------------------------------------------------ |
| 返却仕様文言整合 | 仕様書のエラー文言が実装値と一致しているか             |
| 未タスク配置整合 | 完了済み未タスクが `unassigned-task/` に残っていないか |
| artifacts整合    | phase-1〜12 の status が `completed` か                |

**関連更新**:

| ファイル                   | 更新内容                                  |
| -------------------------- | ----------------------------------------- |
| `security-electron-ipc.md` | v1.3.1: 返却仕様を実装準拠へ更新          |
| `api-ipc-agent.md`         | v1.7.0: セキュリティ強化仕様追記          |
| `task-workflow.md`         | v1.30.2: 完了済み未タスク指示書の移管反映 |

---

### 成果物

| 成果物             | パス                                                               |
| ------------------ | ------------------------------------------------------------------ |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                |
| Preload API        | `apps/desktop/src/preload/skill-creator-api.ts`                    |
| ホワイトリスト更新 | `apps/desktop/src/preload/channels.ts`                             |
| Preload統合        | `apps/desktop/src/preload/index.ts`                                |
| ハンドラーテスト   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Preload APIテスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`     |

### 関連ドキュメント更新

| ドキュメント                                                                         | 更新内容                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------- |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | IPC ハンドラー登録パターン（Pattern 3）追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                          | Preload統合漏れ、並列Phase実行の教訓        |

---

## UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行

### タスク概要

| 項目       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001                                                                                   |
| 目的       | Store Hooksテストを getState() パターンから renderHook パターンに移行し、Reactサブスクリプション経由のテストを実現 |
| 完了日     | 2026-02-12                                                                                                         |
| ステータス | **完了**                                                                                                           |

### 実装内容

| 変更内容                       | ファイル                                                              | 説明                                             |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------ |
| AuthModeテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| LLMテストのrenderHook移行      | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts`      | getState()パターンをrenderHook + act()に全面移行 |
| AgentテストのrenderHook移行    | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts`    | getState()パターンをrenderHook + act()に全面移行 |

### 苦戦箇所と解決策

#### 1. renderHookへの移行効果

| 項目       | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **課題**   | getState()パターンはZustandの内部APIを直接テストするため、Reactサブスクリプション経由の実際の動作と乖離する         |
| **原因**   | getState()はReactの再レンダリングサイクルを経由しないため、コンポーネントでの使用時と異なる結果を返す可能性がある   |
| **解決策** | renderHookパターンにより、コンポーネントが実際に使用する経路（Reactサブスクリプション）でテスト                     |
| **教訓**   | Zustand Hookのテストでは、getState()直接呼び出しではなく、renderHookを通じてReactサブスクリプション経路を検証すべき |

---

#### 2. テストヘルパー関数の共通化

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 3つのテストファイルで同一のヘルパー関数（`assertNoInfiniteLoop()`, `assertStableReference()`, `assertNoUnrelatedRerender()`）が重複定義されている |
| **原因**   | 各テストファイルを独立に作成した際に、共通ヘルパーの抽出を後回しにした                                                                            |
| **解決策** | 3つのヘルパー関数を各ファイル内に定義。将来の共通化候補としてタスク化                                                                             |
| **教訓**   | テストヘルパーが3ファイル以上で重複する場合は、共通テストユーティリティファイルへの抽出を検討すべき                                               |

**テストヘルパー関数一覧**:

| ヘルパー関数                  | 目的                         | 検証内容                                               |
| ----------------------------- | ---------------------------- | ------------------------------------------------------ |
| `assertNoInfiniteLoop()`      | 無限ループ防止検証           | renderCountが閾値（通常5回）以下であることを確認       |
| `assertStableReference()`     | 参照安定性検証               | 状態変更後もアクション関数の参照が同一であることを確認 |
| `assertNoUnrelatedRerender()` | 不要な再レンダリング防止検証 | 無関係な状態変更で再レンダリングが発生しないことを確認 |

---

#### 3. electronAPIモックの統一

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **課題**   | authMode、LLM、skillの3セクションでelectronAPIモックの構造が異なり、テスト間で不整合が発生                            |
| **原因**   | 各テストファイルで個別にwindow.electronAPIモックを定義していたため、必要なプロパティの漏れが発生                      |
| **解決策** | `createMockElectronAPI()` パターンで、authMode + llm + skill の3セクション全体を統一的にモック                        |
| **教訓**   | electronAPIモックはテストファイルごとに部分的に定義するのではなく、全セクションを含む統一モックファクトリを使用すべき |

---

#### 4. 移行中のテスト数増加

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | テスト数が大幅に増加（getState()パターン48件 → renderHookパターン114件 + export検証23件）                                                                                                          |
| **原因**   | renderHookパターンでは参照安定性・無限ループ防止・不要再レンダリング防止のテストカテゴリ（CAT-01〜CAT-09）を体系的に追加した                                                                       |
| **解決策** | テストカテゴリの体系的分類により、網羅性を確保しつつテスト構造を可読に維持                                                                                                                         |
| **教訓**   | テスト数の増加自体は問題ではなく、カテゴリ分類（CAT-01: 初期値, CAT-02: アクション実行, CAT-03: 参照安定性, CAT-04: 無限ループ防止, CAT-05: 不要再レンダリング防止等）で構造化されていることが重要 |

---

#### 5. Phase 12 Step 2 の「該当なし」誤判定

| 項目       | 内容                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | テストリファクタリングのため Step 2（システム仕様更新）を「該当なし」と判定したが、後から6ファイルの仕様書更新が必要になった                                                                                       |
| **原因**   | 「テストのみの変更 = システム仕様に影響なし」と短絡的に判断した。しかし renderHook パターンへの移行はテスト戦略・テスト方法論の変更であり、開発ガイドラインや実装パターン仕様書に記録すべき内容だった              |
| **解決策** | Phase 12 Step 2 の判定基準を拡張し、以下の変更は「該当あり」として仕様書更新を行う: (1) テスト方法論・戦略の変更（テストパターン移行等） (2) テストヘルパー・ユーティリティの新規追加 (3) テストカテゴリ体系の変更 |
| **教訓**   | テストのみの変更でも、テスト方法論・戦略の変更はシステム仕様書の更新対象となる。「プロダクションコード変更なし = 仕様書更新不要」という判断は誤り                                                                  |

**更新が必要だった仕様書一覧**:

| 仕様書                      | 更新内容                                                   |
| --------------------------- | ---------------------------------------------------------- |
| `development-guidelines.md` | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| `patterns.md`               | Store Hookテスト実装パターン（renderHook方式）追加         |
| `arch-state-management.md`  | テスト戦略セクション更新                                   |
| `task-workflow.md`          | 完了タスクセクション追加、残課題テーブル更新               |
| `LOGS.md`（2ファイル）      | タスク完了記録追加                                         |

**Phase 12 Step 2 判定フローチャート**:

| 変更種別                                       | Step 2 判定  | 理由                                     |
| ---------------------------------------------- | ------------ | ---------------------------------------- |
| プロダクションコード変更                       | 該当あり     | アーキテクチャ・インターフェースへの影響 |
| テスト方法論・戦略変更                         | **該当あり** | 開発ガイドライン・パターン仕様書への影響 |
| テストケース追加（既存パターン）               | 該当なし     | 既存のテスト方法論内の変更               |
| テストコードのリファクタリング（パターン不変） | 該当なし     | 構造変更のみ、方法論は不変               |

---

#### 6. 実装ガイドのテストカテゴリテーブル不整合

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 5 で作成した実装ガイドのテストカテゴリテーブルが、Phase 6 のテスト拡充後に更新されなかった                                                                             |
| **原因**   | Phase 6 でテストを大幅に拡充（CAT-07 が 3 テストから 19 テストに増加、CAT-10〜CAT-16 が新規追加）したが、実装ガイドのテーブルを再確認しなかった                              |
| **解決策** | Phase 6 完了後に実装ガイドのテストカテゴリテーブルを再確認し、テスト数とカテゴリを最新の実測値に更新する                                                                     |
| **教訓**   | Phase 6（テスト拡充）完了後は、必ず実装ガイドのテストカテゴリテーブルを再確認する。テーブルは Phase 5 時点のスナップショットであり、Phase 6 以降の変更が自動反映されないため |

**不整合の具体例**:

| カテゴリ             | Phase 5 時点の記載 | Phase 6 後の実測値 | 差異                         |
| -------------------- | ------------------ | ------------------ | ---------------------------- |
| CAT-07（export検証） | 3テスト            | 19テスト           | +16テスト（大幅増）          |
| CAT-10〜CAT-16       | 未記載             | 新規追加           | Phase 6 で新設されたカテゴリ |

**再発防止策**:

| Phase                       | テストカテゴリテーブル確認 | 理由                               |
| --------------------------- | -------------------------- | ---------------------------------- |
| Phase 5（実装）             | 初版作成                   | 実装時点のテスト構造を記録         |
| Phase 6（テスト拡充）       | **必須更新**               | テスト数・カテゴリが変化するため   |
| Phase 7（カバレッジ確認）   | 確認推奨                   | カバレッジ不足でテスト追加した場合 |
| Phase 8（リファクタリング） | 確認推奨                   | テスト統合・分割した場合           |

---

### 成果物

| 成果物                 | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| AuthModeセレクタテスト | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` |
| LLMセレクタテスト      | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts`      |
| Agentセレクタテスト    | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts`    |

### 関連ドキュメント更新

| ドキュメント                                              | 更新内容                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| [development-guidelines.md](./development-guidelines.md)  | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| [patterns.md](../../skill-creator/references/patterns.md) | Store Hookテスト実装パターン（renderHook方式）追加         |

---

## UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト

### タスク概要

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                        |
| 目的       | AgentViewコンポーネントの個別セレクタHook移行とテスト作成 |
| 完了日     | 2026-02-12                                                |
| ステータス | **完了**                                                  |

### 1. happy-dom環境でのuserEvent非互換

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 難易度   | 高                                           |
| 影響範囲 | テストファイル全体（53テスト中49テスト失敗） |
| 解決時間 | 中程度（原因特定に時間を要した）             |

**問題**: Phase 6で追加されたテストが`@testing-library/user-event`の`userEvent.setup()`を使用しており、happy-dom環境でSymbol操作エラーが発生。

```
TypeError: Symbol(Node prepared with document state workarounds)
```

**原因分析**:

- プロジェクトのデフォルトテスト環境は`happy-dom`（`vitest.config.ts`で設定）
- `userEvent.setup()`はjsdomのDOM APIに依存するSymbol操作を内部的に実行
- happy-domはこのSymbol操作を完全にはサポートしていない

**解決策**: `userEvent`を全て`fireEvent`に置換

```typescript
// ❌ happy-domで失敗するパターン
const { userEvent } = await import("@testing-library/user-event");
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定するパターン
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合（Promise microtask flush）
import { act } from "@testing-library/react";
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**:

- happy-dom環境では`fireEvent`を使用する（プロジェクト標準）
- `userEvent`が必要な場合は`// @vitest-environment jsdom`ディレクティブを追加
- テスト追加時は必ずCI/ローカルで実行確認

### 2. テスト実行ディレクトリ依存問題

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 難易度   | 中                             |
| 影響範囲 | テスト実行全体                 |
| 解決時間 | 短い（パターン認識後は即解決） |

**問題**: プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると、`document is not defined`エラーが発生。

**原因分析**:

- プロジェクトルートの`vitest.config.ts`と`apps/desktop/vitest.config.ts`は別ファイル
- ルートから実行すると`apps/desktop/vitest.config.ts`の`environment: "happy-dom"`と`setupFiles: ["./src/test/setup.ts"]`が読み込まれない
- 結果、テスト環境がデフォルト（node）となり、DOM APIが利用不可

**解決策**:

```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ apps/desktop/から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ pnpm --filter を使用（成功）
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

**再発防止**: `apps/desktop/`配下のテストは必ず同ディレクトリから実行

### 3. jsdom切り替え時の副作用

| 項目     | 内容                   |
| -------- | ---------------------- |
| 難易度   | 中                     |
| 影響範囲 | テストファイル全体     |
| 解決時間 | 短い（切り戻しで対応） |

**問題**: happy-domでの`userEvent`エラーを回避するため`// @vitest-environment jsdom`ディレクティブを追加したところ、別の問題が発生。

**症状**:

1. `toBeInTheDocument()`マッチャーが動作しない
2. DOM要素が重複して表示される（`getAllByRole`で期待以上の要素が返る）

**原因分析**:

- jsdom環境では`setup.ts`のロード順序が異なり、`@testing-library/jest-dom`の拡張が正しく適用されない場合がある
- jsdom独自のDOM実装による要素重複

**解決策**: jsdomへの切り替えを断念し、happy-dom + fireEventの組み合わせに統一

**教訓**: テスト環境の切り替えは、単一テストの問題解決を目的としない。環境を変更する場合は、テストファイル全体への影響を事前に検証する。

---

## UT-9B-H-003: SkillCreator IPCセキュリティ強化

### タスク概要

| 項目       | 値                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-9B-H-003                                                                                                            |
| 目的       | skillCreatorHandlers.ts のIPC L3ドメイン検証（パストラバーサル防止、エラーサニタイズ、スキーマ名ホワイトリスト）を追加 |
| 完了日     | 2026-02-12                                                                                                             |
| ステータス | ✅ 完了                                                                                                                |
| テスト結果 | 116テスト全PASS（セキュリティ45 + 統合71）                                                                             |

### 苦戦箇所

| #   | 課題                                      | 原因                                                                                                                          | 解決策                                                                                                                                                                               | 教訓                                                                                                                                                                                    |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TDDでのセキュリティテスト先行設計の難しさ | セキュリティテストは攻撃ベクトルの網羅が必要で、実装前に全パターンを想定するのが困難                                          | 攻撃カテゴリ別にテストを分類（SEC-01〜SEC-07g）し、受入基準（AC-01〜AC-10）にマッピング。カテゴリ:パストラバーサル・エラーサニタイズ・ホワイトリスト・境界値・検証優先順序           | セキュリティテストは攻撃パターンの分類体系（SEC-XX）を先に設計し、受入基準にマップすることでTDDが機能する                                                                               |
| 2   | 正規表現パターンのPrettier干渉            | Markdownコードブロック内の正規表現表記をPrettierが自動フォーマットし、`readonly["task-spec", ...]` のように壊れた表記になった | バックグラウンドエージェントで修正を実施。ドキュメント内の型表記はPrettierの影響を受けることを前提に、修正ステップを組み込む                                                         | Phase 12の実装ガイド作成時、コードブロック内のTypeScript表記がPrettierで変形される可能性を考慮し、PostToolUseフック後に検証を行う                                                       |
| 3   | YAGNI判断での共通化見送りの根拠付け       | `validatePath`と`sanitizeErrorMessage`を共通パッケージに移動するか、現在のファイル内に留めるかの判断                          | Phase 8で3つの共通化候補（validatePath共通化、sanitizeErrorMessage全ハンドラー横展開、IpcResult型統一）を検討し、全てYAGNI原則により「現状維持」と判断。理由を未タスク候補として記録 | リファクタリングPhaseでの共通化判断は、（1）現在の使用箇所数、（2）変更頻度、（3）独立性を評価し、YAGNI原則を適用。共通化しない判断も未タスクとして記録することで、将来の判断材料を残す |
| 4   | Phase 11のCLI環境での手動テスト不可       | CLI環境（Claude Code）ではElectronアプリを起動してDevToolsで手動テストができない                                              | 自動テスト（Vitest 116テスト）で代替検証を実施。DevToolsコマンドを開発者向けリファレンスとして手動テストレポートに記載                                                               | CLI環境でのPhase 11は、自動テストでの代替検証 + DevToolsコマンドのドキュメント化で対応する。手動テストが必要な場合は明示的にその旨を記録                                                |
| 5   | 複数セッション間でのPhase 12成果物整合性  | コンテキスト制限によりセッションが分割され、前セッションの成果物状態の追跡が困難になった                                      | セッション開始時にoutputs/配下のファイル一覧を確認し、前セッションの進捗を復元。バックグラウンドエージェントの完了通知を待ってから最終整合性チェックを実施                           | コンテキスト継続時は、成果物ディレクトリの `Glob` で前セッションの状態を即座に把握する。バックグラウンドエージェントは `TaskOutput` で完了確認してから次ステップに進む                  |

### コード例

#### セキュリティテスト分類体系（TDD先行設計）

```typescript
// テストID体系: SEC-[カテゴリ番号][テスト文字]
// SEC-01a〜SEC-03c: パストラバーサル攻撃テスト
// SEC-04a〜SEC-05b: ホワイトリスト検証テスト
// SEC-06a〜SEC-06c: 正常系回帰テスト
// SEC-07a〜SEC-07g: 境界値テスト

// 受入基準マッピング: AC-01 → SEC-01*, AC-02 → SEC-02* ...
describe("パストラバーサル攻撃テスト", () => {
  it.each([
    ["../etc/passwd", "Unixパストラバーサル"],
    ["..\\Windows\\System32", "Windowsパストラバーサル"],
    ["path\x00.txt", "NULLバイトインジェクション"],
    ["\\\\server\\share", "UNCパス"],
  ])("SEC-01: %s を検出してエラーを返す", async (maliciousPath) => {
    // 検証失敗 → サービス層に到達しないことを確認
  });
});
```

#### YAGNI判断の記録パターン

```markdown
| 検討項目                      | 判定     | 理由                             | 未タスク    |
| ----------------------------- | -------- | -------------------------------- | ----------- |
| validatePath を shared に移動 | 現状維持 | 使用箇所1ファイルのみ            | UT-9B-H-002 |
| sanitizeErrorMessage 横展開   | 現状維持 | 他ハンドラーとの統一は別スコープ | UT-9B-H-001 |
```

### 成果物

| 成果物               | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ関数実装 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                         |
| セキュリティテスト   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                 |
| 実装ガイド           | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md` |
| IPCドキュメント      | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md`    |

### 関連ドキュメント更新

| ドキュメント                            | 更新内容                                                   |
| --------------------------------------- | ---------------------------------------------------------- |
| security-electron-ipc.md                | v1.3.0: L3ドメイン検証パターン完了記録                     |
| architecture-implementation-patterns.md | IPC L3セキュリティハードニングパターン追加                 |
| 06-known-pitfalls.md                    | P11関連: PostToolUseフックによるMarkdownコードブロック変形 |

---

## UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正

### タスク概要

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001                                              |
| 目的       | Preload層でIPC `{ success, data }` ラッパーを展開し、Rendererへ直接型を返す |
| 完了日     | 2026-02-14                                                                  |
| ステータス | ✅ 完了                                                                     |
| テスト結果 | 25件追加、既存回帰テストPASS                                                |

### 苦戦箇所

| #   | 課題                                                            | 原因                                                                                    | 解決策                                                               | 教訓                                                                                                        |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | 仕様書の正本参照が不一致                                        | `api-ipc-skill.md` という非実在ファイル参照が複数ドキュメントに残存                     | 参照先を `interfaces-agent-sdk-skill.md` に統一し、index再生成で追従 | 仕様更新前に参照パスの物理存在確認を必須化する                                                              |
| 2   | Phase 10 MINORの未タスク化漏れ                                  | 「軽微なので不要」という判断が先行し、未タスク管理が不完全化                            | M-1/M-2を `UT-FIX-IPC-RESPONSE-UNWRAP-002/003` として正式起票        | MINOR判定は影響度に関わらず追跡タスク化し、判断理由を残す                                                   |
| 3   | 完了移管後のリンク不整合                                        | 元タスク指示書を移動後、`unassigned-task` 参照が残る                                    | `completed-tasks` 側へ参照更新し、リンク整合を機械検証               | 完了移管時は「移動・参照更新・検証」を1セットで実施する                                                     |
| 4   | TypeScript ジェネリクスの type erasure によるバグ根本原因       | `safeInvoke<T>` の型注釈はコンパイル時に消去され、実行時は IPC レスポンスがそのまま透過 | `safeInvokeUnwrap<T>()` で実行時にラッパーを展開                     | TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行う（P19 の拡張） |
| 5   | ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択） | Main Process のハンドラが全て同じレスポンス形式を使うわけではない                       | 各ハンドラの return 文を確認し、応答形式に応じて使い分け             | IPC チャンネル修正時は必ずハンドラファイルの return 文を確認する                                            |
| 6   | テストモック値の波及修正（19箇所）                              | `safeInvokeUnwrap` は `{ success, data }` 形式を期待するため既存モックが全て失敗        | grep で全モック箇所を特定し一括修正                                  | P21/P35 と同パターン。事前に影響範囲調査（grep）を実施してから一括修正すべき                                |
| 7   | Phase 10 仕様書テーブルと実装の乖離                             | Phase 2 設計時のテーブルが Phase 5 実装結果を反映していなかった                         | Phase 10 レビューで MINOR 判定として記録                             | Phase 10 レビュー時にテーブルの記載と実装を突合すべき                                                       |

### コード例

```typescript
// PreloadでIPCラッパーを展開する共通関数
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

### 苦戦箇所詳細（実装固有）

#### 4. TypeScript ジェネリクスの type erasure によるバグ根本原因

- **問題**: `safeInvoke<ImportedSkill[]>(channel)` と型注釈しても、TypeScript のジェネリクスはコンパイル時に消去（type erasure）される。実行時には `ipcRenderer.invoke()` が返す値がそのまま透過するため、Main Process が `{ success: true, data: skills }` ラッパーを返すと、Renderer 層が `{ success, data }` オブジェクトを `ImportedSkill[]` として受け取ってしまう
- **症状**: AgentView で `importedSkills.forEach is not a function` ランタイムエラー
- **解決策**: `safeInvokeUnwrap<T>()` 関数を追加し、実行時にラッパーを展開。`result.success` を検証し、`result.data` のみを返却する
- **教訓**: TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行うこと（P19 の拡張）
- **コード例**:

```typescript
// ❌ 型注釈だけでは実行時の値は変わらない
function safeInvoke<T>(channel: string): Promise<T> {
  return ipcRenderer.invoke(channel); // Main が { success, data } を返しても T として透過
}

// ✅ 実行時にラッパーを展開する
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 5. ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択）

- **問題**: Main Process の IPC ハンドラが全て同じレスポンス形式を使うわけではない。`SKILL_LIST`, `SKILL_SCAN`, `SKILL_GET_IMPORTED` は `{ success, data }` ラッパーで返すが、`SKILL_IMPORT` は `skillService.importSkills()` の戻り値を直接返す（ラッパーなし）
- **影響**: `import()` に `safeInvokeUnwrap` を適用すると、ラッパーなし応答に対して `result.success` が `undefined`（falsy）となり、正常なレスポンスでもエラーがスローされる
- **解決策**: 各ハンドラの実装（`skillHandlers.ts`）を確認し、応答形式に応じて `safeInvoke`（ラッパーなし）/ `safeInvokeUnwrap`（ラッパーあり）を選択する
- **判断基準**:

| ハンドラの return 文                  | Preload メソッド   |
| ------------------------------------- | ------------------ |
| `return { success: true, data: ... }` | `safeInvokeUnwrap` |
| `return service.method()` (直接返却)  | `safeInvoke`       |

- **教訓**: IPC チャンネルの修正時は、必ず `skillHandlers.ts` (または対応するハンドラファイル) の return 文を確認すること。ハンドラ応答形式のドキュメント化（テーブル形式）が将来的に必要

#### 6. テストモック値の波及修正（19箇所）

- **問題**: `safeInvoke` → `safeInvokeUnwrap` に変更すると、`mockInvoke.mockResolvedValue([...])` で直接値を返していた既存テストが全て失敗する。`safeInvokeUnwrap` は `{ success, data }` 形式のレスポンスを期待するため
- **影響範囲**: 3ファイル・計19箇所のモック値更新が必要
  - `skill-api.test.ts`: 11箇所
  - `skill-api.unification.test.ts`: 8箇所
  - `skill-api.permission.test.ts`: 0箇所（Permission API は未変更のため影響なし）
- **解決策**: `grep -n "mockResolvedValue\|mockResolvedValueOnce" *.test.ts` で全モック箇所を特定し、`list()`, `getImported()`, `rescan()` を呼ぶテストのモック値を `{ success: true, data: [...] }` 形式に更新
- **教訓**: P21/P35（DI追加時のテストモック大規模修正）と同パターン。内部実装の変更がテスト層に波及する場合は、事前に影響範囲調査（`grep`）を実施し、修正箇所リストを作成してから一括修正すべき

#### 7. Phase 10 仕様書テーブルと実装の乖離

- **問題**: Phase 10 仕様書の Task 1 テーブル（行83）に `import()` が `safeInvokeUnwrap` を使用すると記載されていたが、実装では正しく `safeInvoke` を使用している。仕様書のテーブルが Phase 2 設計時の初期想定のまま更新されていなかった
- **解決策**: Phase 10 レビューで MINOR 判定として記録。仕様書は Phase 5 実装結果を反映すべきだが、Phase 10 仕様書自体の修正はスコープ外
- **教訓**: タスク仕様書のテーブル・チェックリストは Phase 2 設計時に作成されるため、Phase 5 実装で判明した特殊ケース（SKILL_IMPORT の直接返却）が反映されない可能性がある。Phase 10 レビュー時にテーブルの記載と実装を突合すべき

### 成果物

| 成果物               | パス                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md`  |

### 関連ドキュメント更新

| ドキュメント                  | 更新内容                            |
| ----------------------------- | ----------------------------------- |
| interfaces-agent-sdk-skill.md | 完了タスク記録・苦戦箇所追記        |
| task-workflow.md              | 完了反映 + MINOR由来未タスク2件登録 |
| phase-12-documentation.md     | 参照パス修正・Step結果確定化        |

---

## UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001                               |
| 目的       | macOS ドックアイコンクリック時の IPC ハンドラ二重登録例外を防止 |
| 完了日     | 2026-02-14                                                      |
| ステータス | **完了**                                                        |

### 苦戦箇所と解決策

#### 1. ipcMain.handle()の二重登録は例外送出

| 項目         | 内容                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `ipcMain.handle()` は同一チャンネルに2回登録すると `Error: Attempted to register a second handler for ...` 例外を送出する。`ipcMain.on()` は暗黙的にリスナーを追加する動作とは根本的に異なる |
| 発生条件     | macOS で全ウィンドウを閉じた後、ドックアイコンをクリック → `activate` イベント発火 → `registerAllIpcHandlers()` が再実行される                                                               |
| 原因         | `ipcMain.handle()` はプロセスレベルで登録されるため、BrowserWindow の破棄では解除されない。macOS ではアプリプロセスは終了しないため、ハンドラが残存する                                      |
| 解決策       | `unregisterAllIpcHandlers()` 関数を新設し、activate ハンドラ内で unregister → createWindow → register の順序で実行する                                                                       |
| 教訓         | Electron の IPC API は `handle`/`on` で二重登録時の動作が異なることを理解し、ライフサイクルに応じたハンドラ管理が必要                                                                        |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md)                                                                      |
| 関連 Pitfall | [06-known-pitfalls.md - P5: リスナー二重登録](../../../rules/06-known-pitfalls.md)                                                                                                           |

#### 2. IPC_CHANNELS 全走査の前提を先に検証する

| 項目         | 内容                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `Object.values(IPC_CHANNELS)` で全解除する方針は有効だが、`IPC_CHANNELS` がネスト構造の場合はチャンネル漏れが発生する可能性がある |
| 発生条件     | ライフサイクル修正を急いで実装する際に、チャンネル定数の構造確認を省略する                                                        |
| 原因         | ハンドラ解除ロジックを先に実装し、チャンネル定義のデータ構造検証を後回しにした                                                    |
| 解決策       | `channels.ts` の構造を先に確認し、フラット配列化される前提を明文化してから `unregisterAllIpcHandlers()` を実装する                |
| 教訓         | 「全走査で安全」は前提条件つき。定数構造の確認を先行することで解除漏れと誤検知を防げる                                            |
| 関連パターン | [security-electron-ipc.md - IPC ハンドラライフサイクル管理](./security-electron-ipc.md#ipc-ハンドラライフサイクル管理)            |

#### 3. IPC外リスナーの解除漏れを同時に防ぐ

| 項目         | 内容                                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `IPC_CHANNELS` の全解除だけでは `setupThemeWatcher()` の `nativeTheme` リスナーは解除されず、再登録で監視が重複する                                                                                      |
| 発生条件     | IPC ハンドラ二重登録の修正に集中し、IPCチャネル以外のイベントリスナーを同一ライフサイクルで見落とす                                                                                                      |
| 原因         | 解除対象を「ipcMain のみ」と誤って限定し、モジュールスコープの unsubscribe 管理を設計に含めなかった                                                                                                      |
| 解決策       | `themeWatcherUnsubscribe` を保持し、`unregisterAllIpcHandlers()` で IPC 解除と同時に `setupThemeWatcher` の解除処理を実行する                                                                            |
| 教訓         | Main Process のライフサイクル修正は「IPC + 非IPCリスナー」を1セットで扱うと再発を防ぎやすい                                                                                                              |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md#ipc-ハンドラ二重登録防止パターンut-fix-ipc-handler-double-reg-001-2026-02-14実装) |

---

## UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消

### タスク概要

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                                            |
| 目的       | 仕様書段階で `skill:import`（ローカル用）と外部インポート用チャネルの命名競合を解消し、実装時のP5/P44再発を予防 |
| 完了日     | 2026-02-24                                                                                                      |
| ステータス | **完了（仕様書修正のみ）**                                                                                      |
| 変更対象   | `task-022-task-9f-skill-share.md`, `task-030-ui-05-skill-center-view.md`                                        |

### 苦戦箇所と解決策

#### 1. 仕様書修正のみタスクの完了反映が台帳から漏れた

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `SKILL.md` / `LOGS.md` は更新されていたが、`task-workflow.md` の完了タスクセクションに本タスクの記録がなく、実装内容の追跡性が不足した                          |
| **原因**   | 「コード変更なし」のため、完了反映をログ系ファイルだけで完結した誤判断                                                                                          |
| **解決策** | `task-workflow.md` の完了タスクへ `spec_created` として登録し、成果物リンク（implementation-guide / documentation-changelog / unassigned-task-detection）を明示 |
| **教訓**   | 仕様書修正のみでも「完了台帳（task-workflow）」への反映は必須。ログだけでは再利用できる知識にならない                                                           |

#### 2. workflow移管後の旧参照パス残存

| 項目       | 内容                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `task-ui-00-atoms` 配下に旧パス `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md` が残存し、参照切れ状態だった                                                     |
| **原因**   | ワークフローを `completed-tasks/` へ移管した際に、Phase 1-13 / index / Phase 12仕様書内の固定パスを一括更新しきれていなかった                                                                             |
| **解決策** | 参照を `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` に統一し、関連する `00-1-design-tokens.md` / `task-050-ui-00-ui-design-foundation.md` も実在パスへ補正 |
| **教訓**   | ワークフロー移管時は「単一ファイル修正」ではなく、同一ワークフロー配下の全Phase・indexを横断置換して参照実在チェックを行う                                                                                |

#### 3. 生成ミスによる `{outputs` ゴーストディレクトリ

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/{outputs` という空ディレクトリが生成され、成果物ディレクトリ構造のノイズとなった |
| **原因**   | ディレクトリ名テンプレートの展開時に `{` が残存したまま作成された                                                                                        |
| **解決策** | 空ディレクトリを削除し、`outputs/` 配下のみを正規成果物ディレクトリとして維持                                                                            |
| **教訓**   | 仕様書生成タスク後は `find <workflow> -maxdepth 2 -type d` でディレクトリ名を監査し、テンプレート展開漏れを早期に除去する                                |

#### 4. IPC チャネル命名規則の体系化

- **課題**: 既存の `skill:import` と TASK-9F の外部ソースインポートが同名チャネルを使用する設計だった。P5（`ipcMain.handle()` 二重登録例外）により実装段階で100%失敗する
- **原因**: 仕様書設計段階でチャネル名の一意性検証が行われていなかった。複数タスク（TASK-9F, UT-FIX-SKILL-IMPORT-INTERFACE-001）が独立して進行し、名前空間の衝突を事前検出する仕組みがなかった
- **解決策**: チャネル命名規則を3パターンに体系化
  | パターン | 用途 | 例 |
  |---------|------|-----|
  | `skill:{動詞}` | 既存ローカル操作 | `skill:import` |
  | `skill:{動詞}FromSource` | 外部ソース操作 | `skill:importFromSource` |
  | `skill:{動詞}Source` | ソース自体への操作 | `skill:validateSource` |
- **教訓**: 新規 IPC チャネル追加時は `grep -rn "チャネル名" apps/desktop/src/` で既存チャネルとの名前衝突を事前検証する。仕様書レベルでの横断検索（`grep -rn "skill:import" docs/30-workflows/`）も必須

#### 5. grep ベース仕様書 TDD の有効性

- **課題**: コード変更がないため、Vitest 等の標準テストツールが使えない
- **原因**: 仕様書修正のみタスクに対するテスト手法が確立されていなかった
- **解決策**: Phase 4 で grep 検証コマンドを「テストケース」として10項目設計し、Phase 5 実装後に全実行。Phase 9 品質ゲートでも同じ grep コマンドを再利用
  - 旧チャネル名残存検出: `grep -rn "skill:import" | grep -v "importFromSource"` = 0件
  - 新チャネル名件数検証: `grep -c "importFromSource"` >= 5件
  - 既存互換性検証: ローカル用 `skill:import` が残存していること
- **教訓**: 仕様書修正タスクでは grep ベースのTDDが効果的。Red（設計）→ Green（修正）→ Refactor（品質ゲート）の3フェーズで品質担保できる

#### 6. Phase 4 の修正箇所数見積もり精度

- **課題**: Phase 4 仕様書で task-022 の修正箇所を「3箇所」と記載したが、実際は1箇所のみ
- **原因**: Phase 4 テスト設計時にファイル内容を `grep` で事前検証しなかった（P37パターン: ドキュメント数値の早期固定）
- **解決策**: grep 検証の期待値を「1件以上」と柔軟に設計し直した。実行結果は2件で PASS
- **教訓**: Phase 4 の期待値設計は、対象ファイルの `grep -c` 実行結果に基づくべき。概算ではなく実測値ベースで設計する

### 同種課題の簡潔解決手順（4ステップ）

1. **対象を固定**: `git diff --name-status` で今回対象ワークフローと仕様書更新対象（workflow / aiworkflow-requirements）を先に確定する。
2. **参照を一括監査**: `rg -n "ui-overhaul|completed-task|../00-" <workflow-dir>` で旧パスを抽出し、実在パスへまとめて置換する。
3. **台帳を同期**: 仕様書修正のみでも `task-workflow.md` 完了タスクと `lessons-learned.md` 苦戦箇所を同時更新する。
4. **機械検証で締める**: `verify-unassigned-links.js`・`audit-unassigned-tasks.js`・`generate-index.js` を実行し、リンク・フォーマット・索引を同期する。

#### IPC チャネル名競合の検出・解消手順（5ステップ）

1. `grep -rn "新チャネル名" apps/desktop/src/main/ipc/` で既存チャネルとの名前衝突を検出
2. 衝突がある場合: `skill:{動詞}FromSource` パターンで新チャネル名を決定
3. `grep -rn "旧チャネル名" docs/30-workflows/` で仕様書内の全使用箇所を特定
4. 仕様書修正（チャネル名変更 + artifacts.modifies 追加 + 注記追加）
5. `grep -rn "旧チャネル名" | grep -v "新チャネル名"` で残存検証（0件 = 完了）

### 成果物

| 成果物           | パス                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/`                                              |
| 実装ガイド       | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md`      |
| 更新履歴         | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md` |

### 関連ドキュメント更新

| ドキュメント                                           | 更新内容                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `task-workflow.md`                                     | 完了タスク2件（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 / TASK-UI-00-ATOMS）を追記 |
| `lessons-learned.md`                                   | 本教訓セクション追加（苦戦箇所3件 + 4ステップ手順）                            |
| `docs/30-workflows/completed-tasks/task-ui-00-atoms/*` | 旧参照パスを `tasks/completed-task` 正本へ統一                                 |

---

## UT-IPC-CHANNEL-NAMING-AUDIT-001: IPCチャネル命名監査の台帳同期（2026-02-25）

### タスク概要

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001                                                       |
| 目的       | IPCチャネル命名規則の横断監査結果を台帳・仕様へ同期し、対象外ノイズを未タスク分離する |
| 完了日     | 2026-02-25                                                                            |
| ステータス | **spec_created（Phase 1-12完了）**                                                    |

### 苦戦箇所と解決策

#### 1. 対象内完了と対象外ノイズの混同

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 課題   | Skill命名監査は完了しているのに、`AUTH_*` 重複式が残っているため完了判定が曖昧になった          |
| 原因   | 監査結果を「対象内/対象外」で分離せず、単一件数で扱っていた                                     |
| 解決策 | `UT-IPC-AUTH-HANDLE-DUPLICATE-001` を未タスクとして切り出し、主タスクは `spec_created` で完了化 |
| 教訓   | 監査タスクは「対象内を完了」「対象外は未タスク化」で同時に閉じる                                |

#### 2. 参照パス移管時のリンク切れ

| 項目   | 内容                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| 課題   | `unassigned-task` から `completed-tasks` へ移管したタスクの旧パスが残りやすい |
| 原因   | 台帳更新と成果物更新が分離され、先送りが発生                                  |
| 解決策 | `task-workflow.md` 更新と `verify-unassigned-links.js` 実行を同一ターンで実施 |
| 教訓   | 未タスク/完了タスクの移管は必ず「更新 + 機械検証」をワンセットで行う          |

#### 3. Phase 12 成果物台帳の二重管理

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 課題   | `artifacts.json` と `outputs/artifacts.json` の同期漏れが発生しやすい |
| 原因   | 出力作成後に片方だけ更新して完了扱いにしてしまう                      |
| 解決策 | Phase 12 で両ファイルを同時更新し、差分確認を必須化                   |
| 教訓   | 仕様書修正のみタスクでも成果物台帳は二重同期を前提にする              |

### 同種課題向け簡潔解決手順（5ステップ）

1. 監査結果を「対象内/対象外」に分離して記録する。
2. 対象外の未解決事項がある場合は未タスク指示書を作成する。
3. `task-workflow.md` に完了化と未タスク追加を同時反映する。
4. `verify-unassigned-links.js` を実行し、参照切れ0件を確認する。
5. `artifacts.json` と `outputs/artifacts.json` を同期してから完了判定する。

### 成果物

| 成果物                           | パス                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| 監査ワークフロー                 | `docs/30-workflows/ut-ipc-channel-naming-audit-001/`                                              |
| 元タスク指示書（移管先）         | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                          |
| 新規未タスク指示書（完了移管先） | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`                         |
| Phase 12 未タスク検出レポート    | `docs/30-workflows/ut-ipc-channel-naming-audit-001/outputs/phase-12/unassigned-task-detection.md` |

---

## TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26）

### タスク概要

| 項目       | 内容                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-9B                                                                                                      |
| 目的       | SkillCreator IPC拡張実装（13チャンネル）とシステム仕様書のドリフトを解消し、再利用可能な運用知見へ落とし込む |
| 完了日     | 2026-02-26                                                                                                   |
| ステータス | **完了**                                                                                                     |

### 苦戦箇所と解決策

#### 1. IPCチャンネル契約数（6/13）の混在

| 項目   | 内容                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| 課題   | 基盤実装の6チャンネル記述と拡張実装の13チャンネル実体が混在し、仕様書ごとに記述がずれた        |
| 原因   | TASK-9B-H（基盤）とTASK-9B（拡張）の仕様同期を同一ターンで束ねていなかった                     |
| 解決策 | `channels.ts` を正本にして `interfaces/security/task/lessons` を一括更新し、13チャンネルへ統一 |
| 教訓   | IPC拡張は「実装完了」より先に「契約数の正本確定」を行うとドリフトを抑制できる                  |

#### 2. createハンドラーのP42 3段バリデーション未完了

| 項目   | 内容                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 課題   | `create` だけ `trim()` 空白検証が欠落し、P42運用に穴があった                           |
| 原因   | 既存ハンドラー改修の水平展開時に、チェック項目の統一基準が暗黙運用だった               |
| 解決策 | `skillCreatorHandlers.ts` に型/空文字/trim空文字を実装し、空文字・空白回帰テストを追加 |
| 教訓   | P42は「実装 + 回帰テスト」までを1セットで完了判定しないと再発する                      |

#### 3. 未タスク監査のcurrent/baseline混同

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 課題   | 全体監査の違反数を今回差分違反と誤認し、不要な是正作業に流れやすい                              |
| 原因   | `audit-unassigned-tasks --json` と `--diff-from HEAD` の役割差を明示していなかった              |
| 解決策 | 合否判定は `--diff-from HEAD` の `currentViolations` に固定し、全体監査値は監視値として分離記録 |
| 教訓   | 監査値は「current=合否」「baseline=既存負債」の2軸で扱うと判断が安定する                        |

### 同種課題向け簡潔解決手順（5ステップ）

1. `channels.ts` を正本にして契約数・型・方向（invoke/on）を確定する。
2. IPCハンドラーは全invokeで `validateIpcSender` + P42 3段バリデーションを適用する。
3. 仕様同期は `interfaces/security/task/lessons` を SubAgent 分担で同時に更新する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. `spec-update-summary.md` と `unassigned-task-detection.md` に最終数値・時刻を記録して完了判定する。

### 成果物

| 成果物               | パス                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/`                                              |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/unassigned-task-detection.md` |
| 整合性監査台帳       | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/elegant-solution-audit.md`    |

---

## UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001: 検証ゲート整合化（2026-02-26）

### タスク概要

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                         |
| 目的       | `quick_validate.js` を正規経路に統一し、Phase 11/12 で同一入力・同一判定を保証する |
| 完了日     | 2026-02-26                                                                         |
| ステータス | **完了**                                                                           |

### 苦戦箇所と解決策

#### 1. 参照リンクの既存ドリフトが手動テストを阻害

| 項目   | 内容                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 課題   | `verify-unassigned-links.js` が `task-workflow.md` の2リンク欠落で FAIL し、Phase 11 が完了不可になった |
| 原因   | 未タスクから完了タスクへ移管済みなのに、`unassigned-task/` 側の旧パスが残存していた                     |
| 解決策 | `task-workflow.md` の2リンクを `completed-tasks` の実在パスへ修正し、直後に再検証                       |
| 教訓   | 仕様更新前に `verify-unassigned-links.js` を先行実行し、リンク整合を早期に回収する                      |

#### 2. 曖昧語の機械判定が通らない

| 項目   | 内容                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| 課題   | 指定grep（`基準どおりに/条件該当時に/等/...`）で `spec-update-workflow.md` がヒットし、完了条件を満たせなかった |
| 原因   | 例示文に `等` が残存し、運用上は問題なくても機械判定が FAIL になる                                              |
| 解決策 | `等` を `など` に置換し、判定コマンドを再実行してヒット0件を確認                                                |
| 教訓   | Phase 12仕様に「grep判定語彙の禁止リスト」を維持し、更新時に自動検査する                                        |

#### 3. baseline違反とcurrent違反の誤読リスク

| 項目   | 内容                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 課題   | `audit-unassigned-tasks --json` 全体実行は既存baseline違反で exit 1 となり、今回差分失敗と誤認しやすい |
| 原因   | `--target-file` / `--diff-from` と scope未指定実行の役割差が曖昧になりやすい                           |
| 解決策 | current判定は `--target-file` / `--diff-from` で実施し、全体実行は baseline監視として別記録            |
| 教訓   | Phase 11/12 のレポートには `currentViolations` と `baselineViolations` を必ず並記する                  |

### 同種課題向け簡潔解決手順（4ステップ）

1. `verify-unassigned-links.js` を最初に実行し、参照切れを先に解消する。
2. 曖昧語grepを実行し、ヒット語（特に `等`）を修正する。
3. `audit-unassigned-tasks` は `target/diff` で current 判定し、全体実行は baseline 監視として分離する。
4. 修正後に `quick_validate.js` 3スキル実行 + 再現性diff確認を行い、Phase 11 完了判定へ進む。

### 成果物

| 成果物                      | パス                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md`   |
| Phase 11 ウォークスルーログ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/walkthrough-log.md`      |
| Phase 12 実装ガイド         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md` |

---

## TASK-9F: スキル共有・インポート機能 再監査（2026-02-27）

### タスク概要

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-9F                                                                               |
| 目的       | 実装/仕様/未タスク管理のドリフトを除去し、Phase 12 実行証跡を再利用可能な形で固定する |
| 完了日     | 2026-02-27                                                                            |
| ステータス | **完了**                                                                              |

### 仕様書別SubAgent分担（再監査時）

| SubAgent | 担当仕様書                      | 主担当作業                                       |
| -------- | ------------------------------- | ------------------------------------------------ |
| A        | `interfaces-agent-sdk-skill.md` | 共有型10種 + Preload API 3メソッド契約の同期     |
| B        | `api-ipc-agent.md`              | 3チャネルの request/response/validation 契約同期 |
| C        | `security-electron-ipc.md`      | sender検証 + P42 + 許可値チェックの4層防御同期   |
| D        | `task-workflow.md`              | 完了台帳・UT-9F残課題・検証証跡の固定化          |
| E        | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順の再利用化                 |

### 苦戦箇所と解決策

#### 1. IPC ハンドラ実装と起動配線の乖離

| 項目   | 内容                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| 課題   | `skillHandlers.share.ts` が存在しても `registerAllIpcHandlers` に登録されておらず、実行時に機能しない状態が残った |
| 原因   | 実装タスクと起動配線タスクを分離し、統合チェックを後回しにした                                                    |
| 解決策 | `index.ts` に `registerSkillShareHandlers` と DI 配線、`createGitHubClient` 型注釈を追加して起動経路を固定        |
| 教訓   | IPC機能は「ハンドラ実装」だけで完了判定しない。`channels + preload + register + tests` を1セットで閉じる          |

#### 2. 型パスの正本ドリフト（`skill/<domain>.ts` vs `skill-<domain>.ts`）

| 項目   | 内容                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 課題   | 仕様書・監査スクリプト・未完了タスクで旧パス記述が混在し、監査が誤検知した                                                  |
| 原因   | `packages/shared/src/types` のフラット化後に、監査ロジック更新が追従していなかった                                          |
| 解決策 | `task-workflow.md` / `ipc-preload-spec-sync-guardian` / task-023a〜f を一括で `types/index.ts` + `skill-<domain>.ts` に統一 |
| 教訓   | 構成変更時は「実装→仕様→監査スクリプト」の順で同期しないと、監査結果自体が信頼できなくなる                                  |

#### 3. 未タスク配置先の混同とフォーマット不足

| 項目   | 内容                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 課題   | UT-9F 系6件が `docs/30-workflows/completed-tasks/skill-share/unassigned-task/` に配置され、正本ディレクトリと不一致だった             |
| 原因   | 親ワークフロー配下配置と共通 `docs/30-workflows/unassigned-task/` の運用ルールを混同した                                              |
| 解決策 | 6件を `docs/30-workflows/unassigned-task/` に9セクション形式で再作成し、`unassigned-task-report.md` / `task-workflow.md` の参照を同期 |
| 教訓   | 未タスク作成は「配置先確認 + 形式監査 + 台帳登録」を同一ターンで完了させる                                                            |

### 同種課題向け簡潔解決手順（5ステップ）

1. 追加機能の完了判定は「実装 + 起動配線 + 契約 + テスト」で固定する。
2. 仕様同期は `task-workflow.md` を起点に、関連仕様書と監査スクリプトを同時更新する。
3. 未タスクは `docs/30-workflows/unassigned-task/` に9セクション形式で作成する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. 検証値を `documentation-changelog` と `lessons-learned` に転記して終了する。

### 検証結果（2026-02-27 15:39 JST）

| 検証項目                                                                           | 結果                                           |
| ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/skill-share --json` | PASS（13/13、errors=0、warnings=0）            |
| `validate-phase-output docs/30-workflows/completed-tasks/skill-share`              | PASS（28項目、error=0、warning=0）             |
| `verify-unassigned-links`                                                          | PASS（95/95 existing、missing=0）              |
| `audit-unassigned-tasks --json --diff-from HEAD`                                   | `currentViolations=0`, `baselineViolations=71` |

### 成果物

| 成果物                | パス                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| 実行ワークフロー      | `docs/30-workflows/completed-tasks/skill-share/`                                            |
| 仕様更新サマリー      | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント変更ログ  | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート  | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/unassigned-task-report.md`  |
| 未タスク指示書（6件） | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-*.md`                |
| 完了台帳              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        |

---

## TASK-9H: スキルデバッグモード実装（2026-02-27）

### タスク概要

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-9H                                                                                                          |
| 目的       | スキルデバッグ機能（7ch IPC + DebugSession/SkillDebugger）の実装内容と苦戦箇所を、再利用可能な手順として固定する |
| 完了日     | 2026-02-27                                                                                                       |
| ステータス | **完了**                                                                                                         |

### 苦戦箇所と解決策

#### 苦戦箇所1: `registerAllIpcHandlers` への登録漏れ

| 項目   | 内容                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| 課題   | `skillDebugHandlers.ts` を実装しても、起動配線が漏れて機能が有効化されなかった                |
| 原因   | ハンドラ実装と `apps/desktop/src/main/ipc/index.ts` の登録作業を別タイミングで進めた          |
| 解決策 | `registerSkillDebugHandlers(mainWindow)` を `registerAllIpcHandlers` に追加し、起動経路を固定 |
| 教訓   | IPC機能は「channels + preload + handlers + register」を1セットで更新する                      |

#### 苦戦箇所2: Phase 12 必須成果物の不足

| 項目   | 内容                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 課題   | `implementation-guide.md` 以外の必須成果物が欠落し、監査証跡が不完全になった                                                     |
| 原因   | Task 1 の作成後に Task 2-5 成果物を一括確認する手順が不足していた                                                                |
| 解決策 | `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を追加作成 |
| 教訓   | Phase 12は Task 1〜5 を成果物名で突合してから完了判定する                                                                        |

#### 苦戦箇所3: `phase-12-documentation.md` のステータス未同期

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| 課題   | 成果物と検証は完了しているのに、実行仕様書のステータスが `未実施` のまま残った |
| 原因   | 成果物更新と手順書チェック更新が分離し、二重台帳が不一致になった               |
| 解決策 | ステータスを `完了` に更新し、完了条件チェックを成果物実体に合わせて同期       |
| 教訓   | Phase 12完了判定は「成果物実体 + 仕様書チェック + 検証証跡」の三点一致で行う   |

### 同種課題向け簡潔解決手順（4ステップ）

1. 追加IPCは `channels.ts` / `skill-api.ts` / `skillDebugHandlers.ts` / `ipc/index.ts` を同ターンで更新する。
2. Phase 12 成果物5件（`implementation-guide`, `spec-update-summary`, `documentation-changelog`, `unassigned-task-detection`, `skill-feedback-report`）をファイル名で突合する。
3. `verify-all-specs` → `validate-phase-output` → `verify-unassigned-links` → `audit --diff-from HEAD` を固定順で実行する。
4. `task-workflow.md` と `lessons-learned.md` と `phase-12-documentation.md` を同時同期し、台帳不一致を残さない。

### 成果物

| 成果物               | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/spec-update-summary.md`       |
| 更新履歴             | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出         | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/skill-feedback-report.md`     |

---

## テンプレート（新規教訓追加用）

以下は将来のタスク記録用テンプレートです。

### 記入ガイドライン

| 項目     | 説明                                     | 必須 |
| -------- | ---------------------------------------- | :--: |
| タスクID | 一意のタスク識別子（例: TASK-FIX-XX-X）  | Yes  |
| 目的     | タスクの目的を1文で記述                  | Yes  |
| 完了日   | YYYY-MM-DD 形式                          | Yes  |
| 苦戦箇所 | 課題・原因・解決策・教訓をテーブルで記述 | Yes  |
| コード例 | 解決策を示す具体的なコード（TypeScript） | 推奨 |
| 参照     | 関連ドキュメントへのリンク               | 推奨 |
| 成果物   | 変更/追加されたファイルのパス            | Yes  |

### テンプレート本文

````markdown
## TASK-XXX: タスク名（YYYY-MM-DD）

### タスク概要

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-XXX     |
| 目的       | タスクの目的 |
| 完了日     | YYYY-MM-DD   |
| ステータス | **完了**     |

### 実装内容

| 変更内容 | ファイル     | 説明 |
| -------- | ------------ | ---- |
| 変更1    | ファイルパス | 説明 |

### 苦戦箇所と解決策

#### 1. [苦戦箇所のタイトル]

| 項目       | 内容         |
| ---------- | ------------ |
| **課題**   | 課題の説明   |
| **原因**   | 原因の説明   |
| **解決策** | 解決策の説明 |
| **教訓**   | 今後の教訓   |

**コード例**:

```typescript
// 解決策を示すコード例
```
````

**参照**: [関連ドキュメント](./path/to/doc.md)

---

### 成果物

| 成果物   | パス         |
| -------- | ------------ |
| 成果物名 | ファイルパス |

### 関連ドキュメント更新

| ドキュメント   | 更新内容 |
| -------------- | -------- |
| ドキュメント名 | 更新内容 |

```

---

## 品質チェックリスト

新規教訓を追加する際は、以下を確認してください。

| チェック項目 | 基準 |
|-------------|------|
| [ ] タスク概要が完全 | タスクID、目的、完了日、ステータスがすべて記載 |
| [ ] 苦戦箇所が構造化 | 課題・原因・解決策・教訓の4項目がテーブルで記載 |
| [ ] コード例が具体的 | 解決策を再現可能なコード例が含まれる |
| [ ] 参照リンクが有効 | 関連ドキュメントへのリンクが正しい |
| [ ] 06-known-pitfalls.md と整合 | 汎用的な教訓は pitfalls にも追加 |
| [ ] 変更履歴を更新 | 本ドキュメント上部の変更履歴テーブルを更新 |
| [ ] 目次を更新 | 新規タスクを目次に追加 |

## TASK-10A-E-C: Store駆動ライフサイクル統合設計（2026-03-06）

### 苦戦箇所: Phase 12成果物の「計画」記述が残りやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `spec-update-summary.md` を更新しても `documentation-changelog.md` が「仕様策定のみ」のまま残存しやすい |
| 再発条件 | 複数成果物の同期を分離実行し、最終突合を省略する |
| 対処 | Phase 12の最終段で `documentation-changelog` を正本として再生成し、Task 1〜5 を明示記録 |
| 標準ルール | 「計画」文言（予定/実行待ち/仕様策定のみ）を完了前に `rg` で全件排除する |

### 苦戦箇所: 未タスク指示書のフォーマット逸脱

| 項目 | 内容 |
| --- | --- |
| 課題 | 最小構成で作成すると `unassigned-task` 監査で必須見出し不足が発生 |
| 再発条件 | `## 1..9` セクションを省略して作成する |
| 対処 | `assets/unassigned-task-template.md` を必ず適用し、Why/What/How/検証/リスクを明示 |
| 標準ルール | 未タスク作成後に `audit-unassigned-tasks --target-file` で個別検証する |

### 苦戦箇所: P31派生パターン（useShallow未適用による無限ループ）

| 項目 | 内容 |
| --- | --- |
| 課題 | `.filter()` を使う派生selectorがZustandの `Object.is` 比較で毎回新参照と判定され、`renderHook` テストで無限ループ発生 |
| 再発条件 | 配列を返す派生セレクタに `useShallow` を適用しない |
| 対処 | `zustand/react/shallow` の `useShallow` でセレクタをラップし、shallow比較で内容同一時の再レンダリングを抑制 |
| 標準ルール | `.filter()` / `.map()` / スプレッド構文で新しい参照を返すセレクタには `useShallow` を必ず適用する |

### 苦戦箇所: worktree環境でのrollup native module不足

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree環境で `Cannot find module @rollup/rollup-darwin-x64` が発生し vitest 実行不可 |
| 再発条件 | worktreeの `node_modules` がシンボリックリンクではなく実体コピーされた場合、native moduleが欠落する |
| 対処 | worktreeディレクトリで `pnpm install --frozen-lockfile` を実行し、native moduleを再生成 |
| 標準ルール | worktreeでのテスト実行前に必ず `pnpm install --frozen-lockfile` を実行する |

### 苦戦箇所: 既存実装が設計の大半を満たしていた場合の差分分析

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 2で設計した要件の大半が既存の `agentSlice` に実装済みだったため、新規実装範囲が派生セレクタ2件のみに縮小 |
| 再発条件 | 仕様策定タスクで既存コードの事前調査なしに設計を開始する |
| 対処 | Phase 1-2の初期段階で既存実装をコードレベルで確認し、差分（未実装部分）のみを設計対象とする |
| 標準ルール | 仕様策定タスクでは必ず既存コードの `grep` / `Read` を先行し、設計前に差分分析を完了させる |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12の必須成果物5件を先に作成し、`Task 1〜5` の実施ログを埋める。
2. `phase-12-documentation.md` のチェックボックスを実績に合わせて同期する。
3. 未タスクはテンプレート準拠で `docs/30-workflows/unassigned-task/` に作成する。
4. `verify-all-specs` / `validate-phase11-screenshot-coverage` / `verify-unassigned-links` を再実行し、結果を changelog に固定する。

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| 派生selectorで無限ループ | `import { useShallow } from "zustand/react/shallow"` → セレクタを `useShallow()` でラップ |
| worktreeでnative module不足 | `cd <worktree-dir> && pnpm install --frozen-lockfile` |
| Phase 12の「計画」文言残存 | `rg "予定\|実行待ち\|仕様策定のみ" outputs/phase-12/` で全件排除 |
| 未タスク9見出し不足 | `audit-unassigned-tasks --target-file <path>` で個別検証 |

---

## 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### コンテキスト
- 対象: ApiKeysSection `apiKey.list()` 戻り値の契約防御
- 期間: 2026-03-07
- カテゴリ: Renderer 境界防御 / Main バリデーション / パターン統一

### 実装内容
1. **Renderer 層（ApiKeysSection/index.tsx）**: `normalizeProviders` type predicate フィルタ追加。`result.data?.providers` の nullish チェック + 要素 shape 検証（`provider`/`status` フィールド必須）
2. **Main 層（apiKeyHandlers.ts）**: `apiKey:list` ハンドラのレスポンス生成前に `Array.isArray(result?.providers)` バリデーション追加
3. **パターン統一（profileHandlers.ts）**: 3箇所の `identities ?? []` → `Array.isArray(user.identities) ? user.identities : []` に統一
4. **テスト**: 20件追加（Renderer 7件 + apiKeyHandlers 7件 + profileHandlers 6件）、全122件 PASS
5. **カバレッジ**: Statements 93.17% / Branches 86.23% / Functions 91.66%

### 苦戦箇所

#### S1: type predicate 内での型キャスト vs in 演算子
- **症状**: `normalizeProviders` 内で `(item as Record<string, unknown>).provider` を使用したが、Phase 8 で P19（型キャストバイパス）違反と判定
- **根本原因**: `as Record<string, unknown>` は実行時検証をバイパスする型アサーション。`in` 演算子は実行時チェックを伴う型ナロイング
- **解決策**: `"provider" in item && typeof item.provider === "string"` に変更。`in` 演算子で TypeScript の型ナロイングと実行時検証を同時に実現
- **再発条件**: type predicate でオブジェクトプロパティの存在を検証する場合
- **再利用手順**:
  1. `as` キャストの代わりに `in` 演算子を使用
  2. `in` 演算子の後に `typeof` で型検証
  3. P19 準拠を ESLint rule で強制（将来）

#### S2: Main ハンドラの直接テスト困難性
- **症状**: `apiKeyHandlers.ts` の list ハンドラは `ipcMain.handle` + `withValidation` でラップされており、ハンドラ関数を直接テストできない
- **根本原因**: ハンドラ登録が `registerApiKeyHandlers()` 関数内にカプセル化されており、個別のハンドラ関数をエクスポートしていない
- **解決策**: `ipcMain.handle` をモックし、登録時のコールバック関数を取得してテストする間接テストパターンを採用
- **再発条件**: `withValidation` ラッパーを使う IPC ハンドラの新規テスト作成時
- **再利用手順**:
  1. `vi.mock("electron")` で ipcMain をモック
  2. `registerXxxHandlers()` を呼び出し
  3. `ipcMain.handle.mock.calls` から対象チャネルのコールバックを取得
  4. コールバックを直接呼び出してバリデーションロジックをテスト

#### S3: `?? []` vs `Array.isArray` の防御力の差
- **症状**: `profileHandlers.ts` で `identities ?? []` が使われていたが、`identities` が文字列やオブジェクト等の非配列値の場合に防御できない
- **根本原因**: Nullish coalescing (`??`) は `null`/`undefined` のみ防御。P48 では全型に対する実行時検証が求められる
- **解決策**: `Array.isArray(user.identities) ? user.identities : []` に統一
- **再発条件**: 外部データ（IPC レスポンス、DB クエリ結果）から配列を取得する場合
- **再利用手順**:
  1. `grep -rn "?? \[\]" apps/desktop/src/` で全箇所を検出
  2. 外部データ由来の箇所を `Array.isArray` に置換
  3. 内部コード由来（確実に null/undefined のみ）は `?? []` を維持

#### S4: IPC契約ドリフト（仕様表の旧値残存）
- **症状**: API仕様書は更新済みだが、実装変更後に戻り値型テーブルだけ旧値が残るドリフトが発生
- **根本原因**: 「実装コード」と「仕様表」の両方を同時に検証する手順を固定していなかった
- **解決策**: `api-ipc-system.md` の `apiKey:list` を `IPCResponse<ProviderListResult>` へ更新し、フィールド表 (`providers/registeredCount/totalCount`) を追加
- **標準ルール**: IPC契約変更時は「型名 + フィールド表 + 完了タスク台帳」を同一コミット単位で更新する

#### S5: Phase 11 実画面証跡不足
- **症状**: Phase 11 が自動テスト代替に寄り、実画面証跡が不足しやすい
- **根本原因**: UI構造変更なしという前提で screenshot を省略する運用が残っていた
- **解決策**: `capture-task-06-settings-apikey-contract-guard-phase11.mjs` を追加し、TC-11-01〜03 を取得して manual-test-result へ証跡リンクを記録
- **標準ルール**: ユーザーが画面検証を要求した場合、`SCREENSHOT` を必須に切り替える

#### S6: Phase 11 証跡表ヘッダの validator 不一致
- **症状**: `validate-phase11-screenshot-coverage` が `manual-test-result.md` の証跡列を抽出できず失敗
- **根本原因**: 証跡テーブルが validator 期待ヘッダ（`テストケース` / `証跡`）を満たしていなかった
- **解決策**: Phase 11成果物に validator互換テーブルを追加し、TC-11-01〜03 の `.png` を1:1で紐付け
- **再発条件**: 手動テスト結果の表形式を独自変更した場合
- **標準ルール**: Phase 11完了前に `validate-phase11-screenshot-coverage` を必ず実行し、表形式を機械検証で固定

#### S7: screenshot 再取得時の依存欠落（Rollup optional dependency）
- **症状**: capture script 実行時に `Cannot find module @rollup/rollup-darwin-x64` で停止
- **根本原因**: worktree の optional dependency が欠落したまま Vite 起動を試行した
- **解決策**: `pnpm install` 後に capture script を再実行し、`phase11-capture-metadata.json` を更新
- **再発条件**: worktree切替直後や node_modules 再構成後に preview/capture を即実行する場合
- **標準ルール**: screenshot 再取得前に依存解決（`pnpm install`）と preflight（preview疎通）を先に実施

### 同種課題の5分解決カード

| ステップ | 操作 | 目的 |
|----------|------|------|
| 1 | `grep -rn "result.data\." apps/desktop/src/renderer/` で Renderer 側の data アクセスを検索 | 未防御の shape アクセスを発見 |
| 2 | `result?.data` + `Array.isArray(result.data.xxx)` の2段チェックを追加 | nullish + 非配列を同時に防御 |
| 3 | type predicate フィルタで要素 shape を検証（`in` 演算子 + `typeof`） | malformed 要素を安全に除外 |
| 4 | Main ハンドラ側にも `Array.isArray` バリデーションを追加 | 多層防御の実現 |
| 5 | テスト追加（undefined/null/空配列/malformed/reject の5パターン） | 回帰防止 |

### 検証ゲート
- `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/`
- `cd apps/desktop && pnpm exec tsc --noEmit`

### 同期先
- `references/security-electron-ipc.md`: apiKeyAPI セクション追加
- `references/ui-ux-settings.md`: ApiKeysSection 異常系表示仕様
- `.claude/rules/06-known-pitfalls.md`: P49 候補（type predicate の `as` vs `in`）

## persist iterable ハードニングでの教訓（2026-03-08）

| 項目 | 内容 |
| --- | --- |
| 課題 | `viewHistory` / `expandedFolders` を永続化データとして信頼しすぎると、復元時に iterable 例外で画面遷移が停止する |
| 再発条件 | `Array.isArray` / `instanceof Set` の境界検証をせずに spread / `new Set(raw)` を実行する |
| 対処 | hydrate と action の両方で防御し、非期待型は空配列/空Setへフォールバックする |
| 標準ルール | UI変更が小さくても、ユーザーが画面検証を要求した場合は Phase 11 のスクリーンショット証跡を必須にする |

### 5分解決カード

1. 破損 persist を localStorage に注入して再現する。
2. hydrate 側（復元）で型ガード + フォールバックを入れる。
3. action 側（更新）でも同じガードを入れて二重防御にする。
4. 破損ケースのユニットテストを固定する。
5. Phase 11 の TC-ID とスクリーンショットを `manual-test-result.md` に同期する。

## TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 教訓

### 実装内容サマリー

`registerAllIpcHandlers()` の個別ハンドラ登録が例外を投げた場合でも、後続のハンドラ登録を継続する Graceful Degradation パターンを導入。`safeRegister()` 内部ヘルパーで個別 try-catch を行い、失敗情報を `IpcHandlerRegistrationResult` として構造化して返却する。

| 変更ファイル | 変更内容 |
|---|---|
| `apps/desktop/src/main/ipc/index.ts` | `safeRegister()`, `sanitizeRegistrationErrorMessage()`, `track()` 追加。戻り値を `IpcHandlerRegistrationResult` に変更 |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | 19テスト新規作成（全PASS） |

### 苦戦箇所

#### S-GD-1: setupThemeWatcher が safeRegister パターンに適合しない

- **再発条件**: ハンドラ登録関数の戻り値（unsubscribe function 等）をモジュールスコープ変数に保持する必要がある場合
- **症状**: `safeRegister()` は戻り値を破棄するため、`setupThemeWatcher` の unsubscribe 関数をキャプチャできない
- **解決策**: `setupThemeWatcher` は個別の try-catch で囲み、戻り値を `themeWatcherUnsubscribe` に代入する。`safeRegister` との使い分けを設計書で明示する
- **再利用**: 戻り値が必要なハンドラ登録は `safeRegister` ではなく個別 try-catch を使用する。設計時に戻り値の要否を明確にする

#### S-GD-2: track() クロージャの成功カウント管理

- **再発条件**: 複数のハンドラを一括で登録する関数（例: `registerSkillHandlers` 1関数で複数チャネルを登録）の成功カウント
- **症状**: `safeRegister` 呼び出し元で成功数を手動管理するとカウント漏れが発生しやすい
- **解決策**: `track()` 内部クロージャで `safeRegister` の成功/失敗を自動追跡し、最終的に `IpcHandlerRegistrationResult` として集約する
- **再利用**: 複数の独立操作の成功/失敗を集約する場合、クロージャで状態を閉じ込めるパターンを適用する

#### S-GD-3: sanitizeRegistrationErrorMessage でのパスマスク

- **再発条件**: エラーメッセージにユーザーのホームディレクトリパスが含まれる場合（NFR-02 プライバシー保護）
- **症状**: `os.homedir()` が `/Users/username` を返すが、エラーメッセージ中のパスは正規表現のメタ文字を含む可能性がある
- **解決策**: `escapeRegExp()` でホームディレクトリパスをエスケープしてから `RegExp` で置換。`~` にマスクする
- **再利用**: ログ出力にファイルパスが含まれる場合は必ず `sanitize` 処理を適用する。P20（テスト環境ログ汚染）と組み合わせて運用する

#### S-GD-4: agentHandlers.test.ts の既存テスト失敗との分離

- **再発条件**: IPC テストスイート全体実行時に、変更と無関係なテストファイルが Vite 依存解決エラーで失敗する
- **症状**: `agentHandlers.test.ts` の 16 テストが `resolvePackageEntry` エラーで失敗。Graceful Degradation 変更とは無関係
- **解決策**: 変更対象のテストファイルを `--testPathPattern` で絞って実行し、無関係な失敗を分離する。全体テスト失敗はベースブランチでも再現することを確認し、変更起因でないことを証明する
- **再利用**: IPC テスト追加時は対象テストファイルのみを先に実行し、全体テスト失敗との混同を避ける

### 同種課題向け再利用手順

1. **設計時**: 各ハンドラ登録関数の「戻り値の要否」と「失敗時の影響範囲」を明確にする
2. **実装時**: 戻り値不要 → `safeRegister`、戻り値必要 → 個別 try-catch の使い分けを適用
3. **テスト時**: `vi.hoisted()` でモック変数を宣言し、30+ のハンドラ登録関数を網羅的にモック化
4. **検証時**: 対象テストファイルのみを先に実行し、既存テスト失敗との混同を回避
5. **ログ検証**: `sanitizeRegistrationErrorMessage` のパスマスク動作を専用テスト（T-18相当）で確認

### 関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |
| UT-IMP-WORKFLOW-STALE-VALIDATOR-001 | index.md / artifacts.json / phase-*.md stale 状態一括検出バリデータ | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-workflow-stale-validator.md` |
| UT-IMP-SKILL-CONFLICT-MARKER-LINT-001 | SKILL.md / LOGS.md conflict marker 検出 lint | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-skill-conflict-marker-lint.md` |

---

## TASK-10A-F ワークフロー教訓（2026-03-09 P50検証実行）

### 苦戦箇所テーブル

| # | 苦戦箇所 | 再発条件 | 対処 |
|---|---|---|---|
| 1 | P50モード判定の遅延 | 実装済みタスクのPhase仕様書がP50を前提としていない場合、Phase 4-5で初めて「既存テストが全て存在する」と気付く | Phase 1のStep 0でgit log + コード確認を必須化。既実装発見時はPhase全体を「検証・補完」モードに切り替え |
| 2 | カバレッジ計測のP40再発 | `pnpm vitest run --coverage` をプロジェクトルートから実行するとhappy-dom設定が読み込まれない | `cd apps/desktop && pnpm vitest run --coverage` で必ずパッケージディレクトリから実行 |
| 3 | SkillImportDialogとuseSkillAnalysisの責務混同 | 仕様書がSkillImportDialogのSelector移行をTASK-10A-Fの責務として誤記 | API系統（ライフサイクル系 vs ファイル操作系 vs インポート系）で明確にスコープを分離 |
| 4 | Phase 12の仕様書更新が「既に完了済み」のケース | completed-tasks workflowに成果物が集約済みで、current workflowのoutputs/が空 | Phase 12開始前にcompleted-tasks workflowの存在を確認し、差分更新のみ実施 |
| 5 | グローバルカバレッジ閾値の誤判定 | --coverage実行時にグローバル閾値が全ファイルに適用され、対象外ファイルの0%でERRORになる | 対象ファイル個別のカバレッジ行を確認し、グローバル閾値のERRORは対象外ファイル由来として判定 |

### 再利用手順

1. **P50チェック**: `rg -n 'window\.electronAPI' 対象ディレクトリ` で移行済みか確認
2. **テスト棚卸し**: `ls */__tests__/*.test.{ts,tsx}` + `grep -c 'it(' *.test.*` でテスト数を把握
3. **カバレッジ計測**: `cd apps/desktop && pnpm vitest run --coverage` でパッケージ内から実行
4. **Store移行確認**: `grep -n 'use[A-Z].*Skill' store/index.ts` で個別セレクタの公開を確認

### 関連パターン

- [S26: 直接IPC→Store個別セレクタ移行パターン](./architecture-implementation-patterns.md#s26)
- P31: Zustand Store Hooks 無限ループ（06-known-pitfalls.md）
- P40: テスト実行ディレクトリ依存（06-known-pitfalls.md）
- P42: 文字列引数の .trim() バリデーション漏れ（06-known-pitfalls.md）
- P48: useShallow未適用による派生セレクタ無限ループ（06-known-pitfalls.md）
- P50: 既実装防御の発見による Phase 転換（06-known-pitfalls.md）

---

## TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001

### 実装内容

- `agentSlice.executeSkill` に `if (isExecuting) return;` ガードを追加（2行の変更）
- Store層ガード + 既存UIガード面3箇所の二重防御アーキテクチャ
- テスト9件（T-01〜T-05, T-09〜T-12）作成、全PASS

### 苦戦箇所

#### 1. テスト実行ディレクトリ依存（P40再発）

- **症状**: プロジェクトルートから `pnpm vitest run --coverage` を実行すると `ReferenceError: window is not defined` で全テスト失敗
- **原因**: `apps/desktop/vitest.config.ts` の `environment: "happy-dom"` 設定がカレントディレクトリの config を優先読み込みするため適用されない
- **解決**: `cd apps/desktop && pnpm vitest run` で対象パッケージのディレクトリから実行
- **再発条件**: モノレポ環境でサブエージェントにテスト実行を委譲する際に発生しやすい

#### 2. flushMicrotasks によるタイミング制御

- **症状**: `executeSkill` 内の `await preflightSkillExecutionAuth()` を通過させないと `isExecuting = true` に到達しない
- **原因**: `executeSkill` は async 関数で、preflight auth の await 前に `isExecuting` を set する前にガードチェックが必要
- **解決**: `flushMicrotasks()` ヘルパー（`setTimeout(resolve, 0)`）で microtask を1つ進め、preflight 通過後の `set({ isExecuting: true })` に到達させてからガードをテスト
- **再発条件**: Zustand Store の async アクション内で複数の await がある場合のテスト設計時

```typescript
// flushMicrotasks パターン
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, 0); });
}

// 使用例: preflight を通過させてから isExecuting をテスト
const firstCall = getState().executeSkill("first");
await flushMicrotasks(); // preflight 通過
expect(getState().isExecuting).toBe(true); // ガード有効
```

#### 3. createStore パターンでの Zustand set/get 再現

- **症状**: `createAgentSlice(set, get, store)` でテスト用 Store を作成する際、`set` の型と動作の再現が難しい
- **原因**: Zustand の `set` は関数とオブジェクトの両方を受け付け、且つ shallow merge する。テスト用の `set` 実装でこの動作を正確に再現する必要がある
- **解決**: `Object.assign(state, partial)` + `store = { ...store, ...state }` で shallow merge を再現

```typescript
function createStore(): { getState: () => AgentSlice } {
  let store = {} as AgentSlice;
  const state = {} as Partial<AgentSlice>;
  const set = (fn: ((current: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>) => {
    const partial = typeof fn === "function" ? fn(store) : fn;
    Object.assign(state, partial);
    store = { ...store, ...state } as AgentSlice;
  };
  const get = () => store;
  store = createAgentSlice(set as never, get as never, {} as never);
  return { getState: () => store };
}
```

#### 4. 既存テストファイルの環境依存エラー

- **症状**: agentSlice の18テストファイル中13ファイルが `window is not defined` または `Failed to load @repo/shared/types/auth-mode` で失敗
- **原因**: 既存テストの一部が happy-dom 環境やモノレポの shared パッケージビルドに依存
- **解決**: 新規テストは `createStore()` + `mockElectronAPI()` パターンで環境依存を最小化。既存テスト失敗は本タスクのスコープ外として切り分け

### 同種課題の5分解決カード

| ステップ | アクション |
|----------|-----------|
| 1 | `agentSlice.ts` の対象 async アクション冒頭で `get().isExecuting` チェックを追加 |
| 2 | `_handleComplete` / `_handleError` で `isExecuting: false` 復元を確認 |
| 3 | テストは `createStore()` + `mockElectronAPI()` + `flushMicrotasks()` パターンで作成 |
| 4 | `cd apps/desktop && pnpm vitest run` で実行（P40準拠） |
| 5 | UIガード面3箇所（ExecuteButton / AgentExecutionView / ChatPanel）の回帰確認 |

### 検証ゲート

- [ ] T-01〜T-12 全PASS
- [ ] Line Coverage ≥ 80%
- [ ] UIガード面3箇所の `isExecuting` 参照が props または個別セレクタHook で安定している

### 再監査追補

#### 5. 未タスク指示書の9セクション逸脱

- **症状**: `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001` を作成した時点では、メタ情報と短い要約だけがあり、`Why/What/How/実行手順/検証方法` が欠落していた
- **原因**: `unassigned-task-detection.md` の3ステップ完了を、指示書品質そのものと混同した
- **解決**: `unassigned-task-template.md` を正本として 9セクションへ書き直し、`audit-unassigned-tasks --json --diff-from HEAD --target-file <file>` で `currentViolations=0` を確認する

#### 6. `validate-phase-output --phase` のドキュメント drift

- **症状**: workflow 本文や template は `--phase 12` 付きの例を残していたが、実スクリプトは workflow path の位置引数のみを受け付ける
- **原因**: validator 実装変更後に template / system spec / workflow 本文が同時更新されていなかった
- **解決**: `validate-phase-output.js <workflow-dir>` を正本コマンドとして統一し、skill / system spec / outputs を同一ターンで修正する

#### 7. BrowserRouter 配下の screenshot harness で Router を二重化

- **症状**: review harness 内に `MemoryRouter` を重ねたため、対象 view が描画前に落ちて screenshot 取得が止まった
- **原因**: 「isolated harness を作る」意図が「Router を再定義する」に置き換わった
- **解決**: 既存 Router の descendant route として harness を追加し、pageerror ログで route 崩れを早期検知する

### 同種課題の簡潔解決手順（4ステップ）

1. current workflow の成果物実体と未タスク指示書を確認し、配置済みとテンプレート準拠を分けて判定する。
2. `validate-phase-output.js <workflow-dir>`、`validate-phase12-implementation-guide.js --workflow <workflow-dir>`、`audit-unassigned-tasks --diff-from HEAD --target-file <file>` を実行する。
3. review harness を使う場合は既存 Router 配下で描画し、画面証跡を撮ってから system spec を更新する。
4. system spec、skill docs、workflow 本文、未タスク台帳を同一ターンで同期する。
---

## TASK-10A-G: ライフサイクルテストハードニング（2026-03-09）

### タスク概要

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | TASK-10A-G                                                           |
| 目的       | `skillHandlers.ts` の `skill:create` ハンドラに対する3層テスト構成の追加 |
| 完了日     | 2026-03-09                                                           |
| ステータス | **完了**                                                             |

### 苦戦箇所と解決策

#### 1. テスト専用タスクにおける Phase 4/5 境界の曖昧さ

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | TASK-10A-G はテストコードのみの追加タスクで、Phase 4（テスト作成/Red）と Phase 5（実装/Green）の区分が通常の実装タスクと異なる |
| **原因**   | テスト対象のプロダクションコードは TASK-10A-E/F で既に実装済みで、Phase 4 で書いたテストが最初から Green になり得る |
| **解決策** | Phase 4-5 を統合実行し、テスト作成とモック調整で Green 確認までを一続きの工程として扱った |
| **教訓**   | テスト専用タスクでは Phase 4-5 を「テスト作成 + Green 確認」の統合ステップとして運用してよい |

- **再発条件**: 既実装コードに対するテスト追加タスク
- **関連Pitfall**: P50（既実装防御の発見による Phase 転換）

#### 2. skillHandlers.ts の巨大ファイルによるカバレッジ計測の誤解

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Layer 1 テストは `skill:create` のみが対象なのに、coverage は `skillHandlers.ts` 全体の未実行コードにも引きずられる |
| **原因**   | v8 coverage はファイル単位で集計され、他ハンドラが Line/Function Coverage を押し下げる |
| **解決策** | workflow / system spec に `handler-scope coverage` を明記し、対象範囲付きで記録した |
| **教訓**   | coverage 数値を残すときは「対象範囲」と「ファイル全体」を分けて書く |

- **再発条件**: 巨大ファイルの一部ハンドラのみを対象とするテストタスク

#### 3. 3層テスト構成における Layer 間のモック整合性維持

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Layer 1/2/3 で異なるモック戦略を使うため、一方の変更が他方を壊しやすい |
| **原因**   | Main IPC、Store 統合、既存 UI テスト拡張で前提と責務が異なる |
| **解決策** | 各テストファイルでモックを自己完結させ、Layer 3 は既存 `describe` ブロック末尾へ追記するだけに留めた |
| **教訓**   | 多層テストでは Layer ごとにモック責務を明示し、グローバルモック汚染を避ける |

#### 4. 並列エージェントによる Phase 12 仕様書更新の分割戦略

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Phase 12 で更新対象ファイルが多く、1エージェントに集約すると中断リスクが高い |
| **原因**   | LOGS/SKILL 4ファイル同時更新や supporting artifact 群の同期が必要だった |
| **解決策** | 実装ガイド、仕様書更新、レポート群の 3 系統に分け、依存するファイルだけ同一担当へ集約した |
| **教訓**   | Phase 12 は「3ファイル以下/エージェント」を目安に分割し、相互依存ファイルは同一エージェントへ集約する |

#### 5. テスト独立性検証（`--sequence.shuffle`）の有効性

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | テスト追加後、Store 状態やモジュールスコープ変数の依存が混入していないか確認が必要だった |
| **原因**   | Layer 2 / Layer 3 は状態保持や既存モックに依存しやすい |
| **解決策** | `beforeEach` のモック初期化に加え、`--sequence.shuffle` と単独実行でランダム順序を確認した |
| **教訓**   | 状態を扱うテスト追加後は、shuffle 実行で順序依存を必ず検証する |

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| テスト専用タスクの Phase 4-5 境界 | Phase 4-5 を統合実行し、テスト作成→モック調整→Green 確認を 1 ステップで閉じる |
| 巨大ファイルの handler-scope coverage | `pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create` |
| Layer 間モック汚染の防止 | 各テストファイルでモックを自己完結させ、Layer 3 は既存 `describe` 末尾へ追加する |
| Phase 12 並列分割 | 3ファイル以下/エージェント + 相互依存ファイルは同一エージェントに集約 |
| テスト独立性検証 | `pnpm exec vitest run --sequence.shuffle <test-file>` でランダム順序を確認する |

---

## TASK-10A-G 再監査教訓（2026-03-09）

### 苦戦箇所: feature 全体 coverage と handler-scope coverage の混同

| 項目 | 内容 |
| --- | --- |
| 課題 | `96.9 / 88.9 / 100` を TASK-10A-G 全体の coverage と読める記述が残った |
| 再発条件 | 大規模ファイルの一部だけを gating 対象にしたのに、scope 注記を省略する |
| 対処 | `handler-scope coverage` を workflow / system spec に明記した |
| 標準ルール | coverage 数値は対象範囲付きで記録する |

### 苦戦箇所: Phase 12 成果物に「実行予定」表現が残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `spec-update-summary.md` に完了後も `予定` 文言が残った |
| 再発条件 | 実施前の叩き台をそのまま Phase 12 最終成果物へ残す |
| 対処 | `予定` 表現を除去し、実更新したファイル名と結果へ置換した |
| 標準ルール | `rg "予定|実行待ち|後続タスク" docs/30-workflows/<task>/outputs/phase-12/` を最終チェックに入れる |

### 苦戦箇所: screenshot harness の固定ポート競合

| 項目 | 内容 |
| --- | --- |
| 課題 | create / analysis / management panel の capture script を完全並列で回すと `5173` が競合した |
| 再発条件 | port 指定なしの screenshot harness を同時起動する |
| 対処 | 直列再実行へ切り替え、analysis mock を追加して証跡を再取得した |
| 標準ルール | `--port` がない screenshot harness は直列実行し、取得時刻も記録する |

### 苦戦箇所: supporting artifact の件数が summary 文書とずれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `test-documentation.md` だけが旧件数 `43` のまま残った |
| 再発条件 | summary 文書だけを補正し、supporting artifact を横断確認しない |
| 対処 | Layer 3 を `16`、合計を `55 tests` へ補正した |
| 標準ルール | `rg -n "43件|55 tests|合計" docs/30-workflows/<task>/outputs/phase-12/` を実行して実測値を揃える |

### 苦戦箇所: open backlog の canonical path がタスク状態とズレる

| 項目 | 内容 |
| --- | --- |
| 課題 | `UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION` の参照先が、Phase 12 中の配置と archive 後の配置でずれやすかった |
| 再発条件 | Phase 12 中の root 配置と、完了移管後の completed workflow 配下配置を同じルールで扱う |
| 対処 | completed workflow 配下 `unassigned-task/` へ再配置し、関連参照を同一ターンで張り替えた |
| 標準ルール | Phase 12 中は root `unassigned-task/`、完了移管後は `completed-tasks/<task>/unassigned-task/` を canonical path とする |

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| worktree で Rollup optional dependency 欠落 | `pnpm install --frozen-lockfile` |
| Phase 12 の planned wording 残存 | `rg "予定|実行待ち|後続タスク" docs/30-workflows/<task>/outputs/phase-12/` |
| feature coverage の scope 誤読 | `pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create` |
| supporting artifact の件数ドリフト | `rg -n "43件|55 tests|合計" docs/30-workflows/<task>/outputs/phase-12/` |
| open backlog の canonical path ドリフト | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` と `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/<task>/unassigned-task/<task>.md` |

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装教訓（2026-03-10）

### 概要

AuthGuard タイムアウトフォールバック + Settings 認証除外の実装。認証初期化がハングした場合に10秒タイムアウトでフォールバック UI を表示し、Settings 画面は AuthGuard をバイパスしてアクセス可能にする。

### 苦戦箇所

#### 1. App.tsx の AuthGuard 構造変換の複雑さ

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存の `<AuthGuard>` が全ルートを一括ラップしていたため、Settings だけをバイパスするにはルート構造全体のリファクタリングが必要だった |
| 再発条件 | 認証除外ビューを追加する際に、catch-all route の構造を変更する必要がある場合 |
| 解決策 | catch-all route の `renderCatchAllElement()` を抽出し、`currentView === "settings"` の条件分岐で AuthGuard バイパスを実現。直接 URL ルート（`/agent`, `/chat/*`, `/advanced/*`）は個別に `<AuthGuard>` でラップ |
| 標準ルール | 認証除外ビューを追加するときは、catch-all route と直接 URL route の両方で AuthGuard の適用範囲を確認する |

```typescript
// catch-all route での条件分岐パターン
if (currentView === "settings") {
  return viewContent; // AuthGuard バイパス
}
return <AuthGuard>{viewContent}</AuthGuard>;
```

#### 2. useAuthState タイマー管理と P13 準拠

| 項目 | 内容 |
| --- | --- |
| 課題 | setTimeout + Promise + 再スケジュールパターンでテストが無限ループする P13 問題。`vi.runAllTimers()` を使うと無限ループする |
| 再発条件 | タイムアウト機構をテストする際に `vi.runAllTimers()` 系の API を使用する場合 |
| 解決策 | `vi.advanceTimersByTime(10_000)` で1ステップずつ進める。useEffect のクリーンアップで `clearTimeout` を確実に呼ぶ |
| 標準ルール | タイマーテストでは `vi.advanceTimersByTime()` を使用し、`vi.runAllTimers()` は避ける（P13 準拠） |

```typescript
// P13 準拠のタイマーテストパターン
vi.useFakeTimers();
act(() => {
  vi.advanceTimersByTime(10_000);
});
// タイムアウト後の状態を検証
expect(result.current.authState).toBe("timed-out");
```

#### 3. getAuthState の判定優先順位設計

| 項目 | 内容 |
| --- | --- |
| 課題 | `isTimedOut` と `isLoading` の組み合わせ条件の優先順位を間違えると、タイムアウト後に認証完了しても自動遷移しない |
| 再発条件 | 複数の boolean フラグの組み合わせで状態を決定するロジックを設計する場合 |
| 解決策 | `isTimedOut && isLoading` を最優先に判定。`isLoading=false` になれば自動的に `authenticated` or `unauthenticated` に遷移 |
| 標準ルール | 状態判定は「最も特殊な条件」から順に評価する。タイムアウトは「ローディング中のみ有効」という制約を明示する |

```typescript
// 判定優先順位（上から順に評価）
function getAuthState(isTimedOut: boolean, isLoading: boolean, isAuthenticated: boolean): AuthState {
  if (isTimedOut && isLoading) return "timed-out";   // (1) 最優先: タイムアウト中
  if (isLoading) return "checking";                   // (2) ローディング中
  if (isAuthenticated) return "authenticated";         // (3) 認証済み
  return "unauthenticated";                            // (4) 未認証
}
```

#### 4. Settings bypass のセキュリティ境界

| 項目 | 内容 |
| --- | --- |
| 課題 | Settings を AuthGuard 外に出すと、未認証状態で API キー設定画面にアクセス可能になるセキュリティ考慮が必要 |
| 再発条件 | 認証ガードから特定ビューを除外する設計判断を行う場合 |
| 解決策 | API キー操作はすべて IPC 経由で Main Process 管理。Renderer 側に機密データは直接保持されない。direct URL routes は全て AuthGuard 配下に維持 |
| 標準ルール | 最小権限（Settings shell のみバイパス）+ 多層防御（IPC + Main Process バリデーション維持）を徹底する |

#### 5. バックグラウンドテスト実行のタイムアウト（exit code 144）

| 項目 | 内容 |
| --- | --- |
| 課題 | サブエージェントで Vitest 実行すると exit code 144（SIGTERM）で中断される |
| 再発条件 | サブエージェントにテスト実行を委譲し、タイムアウトが不十分な場合 |
| 解決策 | メインフローでテスト実行する。サブエージェントにテスト実行を委譲する場合はタイムアウトを十分に確保するか、テスト対象を限定する |
| 標準ルール | 104件以上のテストスイートはサブエージェントではなくメインフローで実行する |

### 同種課題の5分解決カード

```
症状: AuthGuard（または類似のブロッキングコンポーネント）が無限ローディング状態
根本原因: 認証初期化のハング（IPC/ネットワーク）
5手順:
  1. useAuthState にタイムアウト state を追加（useState + useEffect + setTimeout）
  2. getAuthState の判定ロジックに isTimedOut 条件を最優先で追加
  3. フォールバック UI（リトライ + 代替導線）を作成
  4. ブロッキング対象から除外すべきビューを条件分岐で bypass
  5. テスト: vi.advanceTimersByTime() でタイマーを制御（P13準拠）
検証ゲート: 104テスト全PASS、AC-1〜AC-8全達成
同期先: architecture-auth-security.md, ui-ux-navigation.md, arch-state-management.md
```

### 再利用手順（4ステップ）

1. 対象コンポーネントの状態遷移図を作成し、タイムアウト状態を追加する。
2. 純粋関数（getAuthState 相当）で判定ロジックをテスタブルに実装する。
3. bypass 対象のビューを条件分岐で分離する（catch-all route パターン）。
4. P13/P39/P31 準拠でテストを実装する（fake timers + fireEvent + 個別セレクタ）。

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査教訓（2026-03-10）

### 苦戦箇所: Settings bypass と未認証 reset が相殺する

| 項目 | 内容 |
| --- | --- |
| 課題 | `currentView === "settings"` の bypass を入れても、未認証時 `setCurrentView("dashboard")` が残ると Settings へ到達しても即座に戻される |
| 再発条件 | bypass 判定と navigation reset 判定を別々の層で更新する |
| 対処 | `shouldResetUnauthenticatedView` を追加し、公開ビュー配列で `settings` を除外した |
| 標準ルール | 認証除外ビューを追加するときは「描画条件」と「reset 条件」を同時に監査する |

### 苦戦箇所: ユーザー明示の screenshot 要求に P53 代替を残してしまう

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存成果物に「CLI なのでコード検証で代替」と残っていた |
| 再発条件 | screenshot 制約を一般ルールで処理し、ユーザー要求の優先度を下げる |
| 対処 | 専用 harness route と capture script で screenshot 4件を実取得し、Phase 11 文書を差し替えた |
| 標準ルール | ユーザーが screenshot を要求したら `screenshot-plan.json` / capture metadata / coverage validator まで完了させる |

### 苦戦箇所: worktree で optional dependency が欠ける

| 項目 | 内容 |
| --- | --- |
| 課題 | vitest / Playwright 起動前に Rollup optional dependency 欠損で失敗しうる |
| 再発条件 | 新しい worktree で install を省略する |
| 対処 | `pnpm install --frozen-lockfile` を先に実行した |
| 標準ルール | Phase 11/12 の再監査を始める前に install preflight を入れる |

### 同種課題の簡潔解決手順（4ステップ）

1. bypass 対象ビューがあるなら、描画条件と reset 条件を両方 `rg` で洗う。
2. screenshot 要求があるなら、専用 harness と capture metadata を先に作る。
3. worktree では `pnpm install --frozen-lockfile` を preflight として実行する。
4. workflow outputs、system spec、LOGS/SKILL を同一ターンで閉じる。
