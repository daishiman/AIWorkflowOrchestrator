# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 教訓（2026-03-12）

### 2026-03-10 TASK-10A-G 再監査追補

- `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow ... --regenerate` 実行後は、`index.md` の機能名が `undefined` になっていないか、Phase 1〜13 が全て `未実施` に崩れていないかを即確認する
- workflow `artifacts.json` の Phase キー形式が generator 想定と異なる場合は、current task 内では `index.md` を手動で正規化し、汎用改善は未タスクへ切り出す
- `verify-all-specs --strict` と `validate-phase-output` を再実行し、手動復旧後の workflow 正本が崩れていないことを確認して閉じる
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
| 2026-03-05 | 1.29.21 | TASK-UI-01-A-STORE-SLICE-BASELINE の Phase 12準拠再確認を追補。`audit-unassigned-tasks --target-file` の適用境界（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配下限定）と、`current`/`baseline` 判定分離の実運用手順を追加。baseline負債削減用未タスク `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001` を関連登録 |
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
| 2026-03-02 | 1.28.4 | TASK-10A-B 追補: 苦戦箇所3件を未タスク化（UT-TASK-10A-B-006〜008）。Phase 11必須節検証、画面証跡鮮度確認、未タスク件数再計算同期のガード指示書を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に追加し、再発防止導線を固定 |
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
| 2026-03-05 | 1.29.21    | TASK-UI-01-A-STORE-SLICE-BASELINE の Phase 12準拠再確認を追補。`audit-unassigned-tasks --target-file` の適用境界（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配下限定）と、`current`/`baseline` 判定分離の実運用手順を追加。baseline負債削減用未タスク `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001` を関連登録 |
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
| 2026-03-02 | 1.28.4     | TASK-10A-B 追補: 苦戦箇所3件を未タスク化（UT-TASK-10A-B-006〜008）。Phase 11必須節検証、画面証跡鮮度確認、未タスク件数再計算同期のガード指示書を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に追加し、再発防止導線を固定                                                                                             |
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

## TASK-10A-F: Store駆動ライフサイクルUI統合 再確認（2026-03-07）

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
| 課題 | TASK-10A-F 由来 3 件は `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に正しく配置されていても、repo-wide baseline 違反が残るため「指定ディレクトリは完全準拠」とは言えなかった |
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

