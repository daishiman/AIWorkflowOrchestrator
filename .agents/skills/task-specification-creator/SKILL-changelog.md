## 変更履歴

| Version     | Date           | Changes                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v10.09.38** | **2026-04-08** | **UT-SKILL-WIZARD-W1-par-02b skill-feedback 反映**: `patterns-lessons-and-pitfalls.md` に renderer node-only import pitfall を追加。`phase-template-phase11.md` に UI task VISUAL デフォルトガイドを追加。`phase-12-documentation-guide.md` Task 12-6 に identifier consistency check を追加。「よくある漏れ」テーブルに Feedback W1-02b-1〜4 を追記。LOGS.md 2ファイル + SKILL.md 2ファイル同波更新。|
| **6.18.27** | **2026-04-07** | **UT-SKILL-WIZARD-W0-seq-01 Phase 12 close-out sync**: `packages/shared/src/types/skillCreator.ts` に shared contracts 7 型を追加し、`SkillCategory` の root 衝突を避けて `@repo/shared/types/skillCreator` に閉じた。`skillCreator-wizard.test.ts` を新規作成し、`phase-12-docs.md` の出力先を current root に修正。`task-workflow-completed.md` / `interfaces-agent-sdk-skill-reference.md` / `LOGS.md` 2ファイル / `SKILL.md` 2ファイル / topic-map を同波更新。|
| **6.18.19** | **2026-04-06** | **TASK-P0-09-U1 skill-feedback 反映**: Phase 4 仕様書への private method テスト方針明記ルール（キャストと public callback 経由の2択）、Phase 5 仕様書への `improve()` canUseTool 適用範囲・制約明記ルール、小規模タスク outputs tier 分け検討ガイドを追加。「よくある漏れ」テーブルに Feedback P0-09-U1-1/2 を追記。|
| **6.18.18** | **2026-04-06** | **TASK-P0-09-U1 path-scoped-governance-runtime-enforcement Phase 12 close-out**: security fix で path-scoped deny を runtime 実効化。`extractTargetPath()` helper / `createExecuteGovernanceCanUseTool(skillRoot)` / `createImproveGovernanceCanUseTool(skillRoot)` 追加。TC-PATH-01〜06 TDD 完了（101件 PASS）。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新。|
| **6.18.17** | **2026-04-06** | **TASK-P0-08 Phase 12 close-out sync を記録**: `implementation-guide.md` の Part 2 を API/IPC シグネチャ・型定義・使用例まで補強し、Phase 11 screenshot evidence を current fact に固定。`verify-unassigned-links.js` PASS、session resume / cleanup surface の system spec 反映、`task-workflow-completed.md` / `api-ipc-system-core.md` / `interfaces-agent-sdk-skill-reference.md` の same-wave 更新を記録 |
| **6.18.26** | **2026-04-06** | **TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 完了同期**: `RuntimeSkillCreatorFacade.executeAsync()` の structured error / catch パスで `if (!snapshot)` 条件を削除し、`snapshot ?? null` + error message 伝搬へ統一。さらに `creatorHandlers.ts` / `skill-creator-api.ts` / `SkillLifecyclePanel.tsx` で workflow-state changed event を errorMessage 付きで end-to-end 伝搬、`creatorHandlers.test.ts` / `SkillLifecyclePanel.error-persistence.test.tsx` を追加。Phase 11 手動テスト記録と Phase 12 ドキュメント成果物を出力し、`task-workflow-backlog.md` / `task-workflow-completed.md` / `outputs/phase-11/*` / `outputs/phase-12/*` / `artifacts.json` を同期。`pnpm typecheck` / `pnpm lint` / focused vitest（53 tests PASS）を確認。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新 |
| **6.18.25** | **2026-04-06** | **TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決 Phase 12 close-out sync**: `manifestResourceResolver.ts` 新規作成（`buildPhaseResourceRequestsFromManifest()` 純粋関数）。`RuntimeSkillCreatorFacade.ts` の `resolveOperationResources()` に `phaseId` 引数追加し manifest ベースの動的エージェント解決に移行。フォールバック 5 パターン実装。`AGENT_NAMES` ハードコード定数完全削除。`interfaces-agent-sdk-skill.md` にインターフェース仕様追記。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29 対策） |
| **6.18.26** | **2026-04-06** | **UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 validator hardening sync**: `validate-phase-output.js` の Phase 11 docs-only 判定を fail-closed 化し、`index.md` / `artifacts.json` が両方 docs-only / NON_VISUAL 相当で一致した場合のみ non-visual 扱いに変更。Phase 11 evidence に `discovered-issues.md` を必須化。`phase12-task-spec-compliance-template.md` に `task-workflow-completed.md` / `task-workflow-backlog.md` の ledger parity を direct root evidence として追加し、`phase12-task-spec-compliance-check.md` へ反映。LOGS.md 更新済み |
| **6.18.25** | **2026-04-06** | **UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 12 close-out sync**: `assets/phase-spec-template.md` に Task/Step 分離ルール・Phase 11 NON_VISUAL 分岐・Phase 12 記録分離方針を追加。`assets/phase12-task-spec-compliance-template.md` で `task-workflow-completed.md` / `task-workflow-backlog.md` を root evidence に追加し、`validate-phase-output.js` の docs-only 判定を canonical metadata / index 優先へ硬化。`assets/unassigned-task-template.md` の苦戦箇所記載欄を明確化。Phase 1-12 完了（docs-only / NON_VISUAL / spec_created）。`task-workflow-backlog.md` に UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 を spec_created として登録。LOGS.md 更新済み |
| **6.18.24** | **2026-04-04** | **TASK-P0-01 verify 実行エンジン Phase 12 close-out sync**: `SkillCreatorVerificationEngine` Layer 1-4 verify チェック 19 件の実装完了（60 tests PASS）。`interfaces-skill-verify-contract.md` に check ID 体系を反映、`task-workflow-completed.md` に完了記録追記。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29 対策） |
| **6.18.23** | **2026-04-04** | **TASK-SKILL-CENTER-LIFECYCLE-NAV-001 Phase 12 close-out sync**: `docs/30-workflows/skill-center-lifecycle-navigation/` の Phase 12 outputs（implementation-guide / documentation-changelog / system-spec-update-summary / unassigned-task-detection / skill-feedback-report）完成を記録。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新 |
| **6.18.23** | **2026-04-04** | **task-imp-layer12-spec-definition-004 Phase 12 close-out sync を記録**: `interfaces-skill-verify-contract.md` 新規作成（FR-04 verify 契約 check ID 体系 19 件、Layer 命名規則、拡張ガイドライン）。docs-only タスクのため code 変更なし。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29 対策） |
| **6.18.22** | **2026-04-03** | **UT-SDK-L34-UI-DISPLAY-001 タスク仕様書作成（spec_created）を記録**: `SkillLifecyclePanel.tsx` checks をLayer別グルーピング・アコーディオン・severityアイコン表示するUIタスク仕様書を Phase 1〜13 生成。UIタスク分類を Phase 1 で宣言し、TDD 19テストケース（TC-01〜TC-19）設計。`task-workflow-backlog.md` に UT-SDK-L34-UI-DISPLAY-001 を登録。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新 |
| **6.18.21** | **2026-04-02** | **TASK-NOTIFICATION-SERVICE-001 Phase 12 close-out sync を反映**: Electron `Notification` static API のテストパターン（`vi.resetModules()` + `vi.doMock("electron")` + dynamic `import()`）を `patterns-testing.md` に追加し、段階導入時の optional DI `notificationService?: INotificationService` と `activeExecutionCount` + `try/finally`、Vitest coverage コマンドの current facts 記録方針を `patterns-lessons-and-pitfalls.md` / `LOGS.md` に同期 |
| **6.18.20** | **2026-04-01** | **TASK-FIX-ENV-STRIPPING Phase 12 close-out sync を反映**: `fix-step0-seq-env-stripping` の Phase 11 manual-test-result を NON_VISUAL 自動テスト代替 PASS へ更新し、`skill-creator-agent-sdk-lane/index.md` の step0 完了同期、`task-workflow-completed.md` の completed record 追加、UT-RT-06 completed link correction、`verify-unassigned-links.js` / `generate-index.js` 再実行を同波で実施 |
| **6.18.19** | **2026-04-01** | **UT-IMP-SDK-06 Layer3/4 verify 拡張 Phase 12 close-out sync を記録**: Phase 1〜12 全フェーズ完了（`SkillCreatorVerificationEngine` Layer3/4 実装 / 60テスト PASS）。skill-feedback-report にて `extractSectionContent` 正規表現落とし穴を low priority 改善提案として記録（phase-12-documentation-guide.md 更新は today は保留）。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新 |
| **6.18.18** | **2026-03-31** | **TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 Phase 12 close-out sync を記録**: shared path alias 系は build config と test config の parity を同時確認するルールを追加。task-specific duplicate outputs を削除し、`implementation-guide.md` など canonical filename へ統一。`phase12-task-spec-compliance-check` を current facts で補完し、LOGS.md 2ファイル + SKILL.md 2ファイル同時更新 |
| **6.18.17** | **2026-03-31** | **UT-UIUX-PLAYWRIGHT-E2E-001 Phase 12 close-out: スキルフィードバック反映** — (1) UI/UX task Phase 12 ハードゲート5点（screenshot-plan.json / metadata JSON / coverage.md / 実PNG / validate PASS）を `phase-12-completion-checklist.md` と `phase-12-tasks-guide.md` に追加（FB-UT-UIUX-001-A）。(2) `artifacts.json` の Phase 13 先送り wording を validator で弾く検査項目を `phase-12-completion-checklist.md` に追加（FB-UT-UIUX-001-B）。TASK-A11Y-FOCUS-TRAP-001 を unassigned-task フォーマット準拠に修正 |
| **6.18.16** | **2026-03-31** | **TASK-UIUX-FEEDBACK-001 false-green cleanup を反映**: `spec_created` workflow の root / outputs `artifacts.json` を pending current facts へ戻し、Phase 11/12 close-out 文書の phantom path と placeholder-only completion を是正。`.agents` mirror と `aiworkflow-requirements` same-wave sync を完了 |
| **6.18.17** | **2026-03-31** | **TASK-ELECTRON-BUILD-FIX close-out hardening を反映**: NON_VISUAL task で broken placeholder screenshot を残さず、`manual-test-result.md` と `screenshot-plan.json` に理由を明記すること、`system-spec-update-summary.md` を shallow summary で終わらせず Step 1-A〜1-C / Step 2 の実ファイル更新先まで記録すること、packaging hook の enum context を Phase 4 テスト計画へ含めることを変更履歴に追記 |
| **6.18.16** | **2026-03-30** | **TASK-LLM-MOD-05 Phase 12 close-out sync を記録**: `description?` フィールドを全 19 モデルに追加した schema-extension タスクの close-out。ワークフロー再編（13 Phase ファイル → `step-04-seq-task-05-schema-extension/`）・`inferProviderId()` `o3`/`o4` prefix 対応・`TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY` 未タスク formalize。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策）   |
| **6.18.15** | **2026-03-30** | **TASK-P0-05 Phase 12 close-out resync を guide へ反映**: Phase 11 evidence 欠落時は `NON_VISUAL` でも `manual-test-result.md` / `discovered-issues.md` を必須補完すること、Phase 12 local outputs 充足だけで `completed` に上げず canonical same-wave sync 未完了なら `in_progress` を維持すること、edge case 定義（E-14 / E-15）は spec と targeted test を同一ターンで同期することを変更履歴に記録 |
| **6.18.14** | **2026-03-27** | **Phase 12 close-out ルール hardening を反映**: (1) `spec_created` UI task でも Step 1-A〜1-C を N/A にせず same-wave sync で閉じるルール、(2) docs-only task に後から code 実装が入った場合の Step 2 / screenshot 再判定ルール、(3) Phase 12 documentation guide hardening（planned wording 残存 grep 監査、evidence reclassification）を SKILL.md に明示                                            |
| **6.18.13** | **2026-03-27** | **TASK-SDK-05 create-entry-mainline-unification spec sync を guide へ反映**: `spec_created` UI task の Phase 12 でも Step 1-A〜1-C を N/A にしない same-wave sync ルール、`verification-report.md` の workflow root path drift 是正、`.claude` 正本更新後の `.agents` mirror parity 確認を close-out 完了条件へ追加                                                                                   |
| **6.18.12** | **2026-03-26** | **TASK-SDK-01 hardening sync を guide へ反映**: docs-only follow-up に後からコード変更が入った時は source workflow と `outputs/phase-12/*.md` を同一ターンで current facts へ戻すルールを `phase-12-documentation-guide.md` に追加                                                                                                                                                                    |

---

### Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phaseテンプレートの漏れや曖昧さ        |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

出力:

- `outputs/phase-12/skill-feedback-report.md`

---

### Phase 12 実行時によくある漏れ

| 漏れパターン                                                                                           | 防止方法                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Step 1-C（関連タスクテーブル）を未実行                                                                 | spec-update-workflow.md の「確認すべきファイル」表を実行前に必ず読む                                                                             |
| topic-map.md 未更新                                                                                    | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                                                                                 |
| documentation-changelog.md が不完全                                                                    | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）                                                                         |
| `system-spec-update-summary.md` を未作成で完了扱い                                                     | Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは完了前に作成する                                                      |
| LOGS.md が1ファイルのみ更新                                                                            | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方                                                                |
| 完了タスクセクションが簡略形式                                                                         | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う                                                              |
| `artifacts.json` と `outputs/artifacts.json` が不一致                                                  | Phase 12完了前に2ファイルを同期し、completed成果物の参照切れを0件にする                                                                          |
| 設計タスクの workflow root を `completed` にしてしまう                                                 | workflow root は `implementation_ready`、completed ledger は `spec_created` に分離する                                                           |
| Phase 10 MINOR指摘を未タスク化せず進行                                                                 | **Phase 10レビュー前に** unassigned-task-guidelines.md を読み、MINOR判定→未タスク化ルールを確認                                                  |
| 未タスク検出レポートで0件判定のまま未修正                                                              | Phase 10 MINOR指摘は必ず未タスク化の対象。「機能に影響なし」は不要判定の理由にならない                                                           |
| `task-workflow.md` の未タスクリンクが参照切れ                                                          | Step 1-E後に `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する                                                                |
| **[Feedback 2]** Phase 12 着手時に `outputs/artifacts.json` と phase spec の artifact 名が照合されない | Phase 12 の **最初の作業**として `outputs/artifacts.json` と各 `phase-*.md` に記載されたartifact名を1対1で突合し、不一致があれば着手前に修正する |
| **[Feedback 3]** Phase 11 の UI task / docs-only task 判定がずれる                                     | Phase 1 で記録したタスク分類（UI task / docs-only task）を Phase 11 着手時に必ず参照する。分類が変わっていた場合は再判定を明示する               |
| **[Feedback W0-01]** shared 型追加で root `@repo/shared` に再エクスポートすると `SkillCategory` が衝突する | 新しい共有型は subpath export（例: `@repo/shared/types/skillCreator`）に閉じ、既存 root barrel は触らない。`phase-12-docs.md` と system spec の両方で公開経路を明記する |
| **[Feedback P0-09-U1-1]** Phase 4 仕様書に private method テスト方針が未記載                                                 | `(facade as unknown as FacadePrivate)` キャストと public callback 経由テストの2択を Phase 4 仕様書に必ず明記する                                  |
| **[Feedback P0-09-U1-2]** `improve()` フローの canUseTool 配線先（SDK callback vs `applyImprovement()`）が仕様書から読み取れない | Phase 5 仕様書のタスク2に「canUseTool 適用可能範囲と制約」セクションを設け、`llmAdapter.sendChat()` 経由時は SDK callback 非適用と明記する        |
| **[Feedback BEFORE-QUIT-001]** Phase 11 が非 visual task なのに実地操作を要求してしまう                      | Phase 11 では「実地操作不可」を明記し、自動テスト結果 + 既知制限リストを代替記録として残す |
| **[Feedback BEFORE-QUIT-002]** Phase 7 coverage が全ファイル一律指定だと局所検証の意図がぼやける             | Phase 7 では coverage の対象範囲を明示し、変更したファイル/ブロック以外を対象外として書く |
| **[Feedback BEFORE-QUIT-003]** Phase 12 の system-spec update で workflow-local と global sync が混在する | `documentation-changelog.md` で workflow-local 同期と global skill sync を別ブロックで記録する |
| **[Feedback 4]** Phase 11 NON_VISUAL のとき manual-test-result.md の証跡メタが薄い                      | Phase 11 が NON_VISUAL の場合、`manual-test-result.md` のメタ情報に「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」を明記する。空メタでは reviewer が意図を読み取れない |
| **[Feedback 5]** Phase 7 の coverage 目標が広域指定のとき変更行の保護確認が曖昧になる                   | Phase 7 のカバレッジ目標が「全体 X%」など広域指定のとき、変更した関数/ブロックの line カバレッジと branch カバレッジの実測値を証跡に残す（例: `applyWorkflowSnapshot` 付近の line 100% / branch 100%） |
| **[Feedback 6]** ViewType を追加した際に navigation 契約・store 型・既存テストの3点更新が漏れる          | `store/types.ts`（ViewType union）/ `skillLifecycleJourney.ts`（正規化関数・定数）/ renderView テスト を same-wave で更新し、`ui-ux-navigation.md` の ViewType テーブルも同時同期する。Phase 1 設計メモに「追加 ViewType: XYZ」を明示しておくと漏れが防げる |
| **[FB-UI-02-1]** Phase 9 QA で「ファイル削除」を PASS 基準にすると stub 化タスクが FAIL 扱いになる        | Phase 9 の削除確認は「git delete されている OR `export {}` stub 化かつ live import ゼロのいずれか」を PASS とする。たとえば、廃止ファイルを stub 化した場合は `grep -rn "import.*廃止ファイル名" src/` でゼロ件を証跡に残す |
| **[Feedback TASK-UI-04]** 実装完了後に `artifacts.json` status が `spec_created` / `in_progress` のまま放置される | 実装 Phase（Phase 5 or 最終実装 Phase）完了時に `complete-phase.js` を必ず実行し、status を `completed` に更新する。実装完了と仕様書ステータス更新は同一 wave で行う（後回しは乖離蓄積の主因）。有効値: `spec_created` / `in_progress` / `completed` / `phase12_completed` |
| **[FB-SDK-07-2]** Phase 1 で新規 IPC surface を定義する際に Preload API 経由が明記されない                  | Phase 1（要件定義）では新規 IPC surface を定義する場合、「Preload API 経由必須」を明記する。直接 `ipcRenderer.on` は禁止パターンとして記録する |
| **[FB-SDK-07-4]** Phase 1 で既存 API の命名パターンを確認せずに新規 API を命名し、Phase 3 で MINOR 指摘を受ける | Phase 1（要件定義）では既存の `safeOn` / `safeInvoke` 等の命名パターンを確認し、新規 API の命名規則一貫性を担保する。命名ドリフトは Phase 3 レビューゲートの MINOR 指摘の主要因となる |
| **[Feedback W1-02b-1]** UI task の `screenshot-plan.json` が `mode: "NON_VISUAL"` のまま Phase 11 を迎えやすい | UI コンポーネント変更タスクでは `screenshot-plan.json` 生成時に `mode: "VISUAL"` をデフォルトにする。`phase11-capture-metadata.json` の `taskId` が現行タスク ID と一致するか Phase 11 着手前に確認する（`jq '.taskId' outputs/phase-11/phase11-capture-metadata.json`） |
| **[Feedback W1-02b-2]** multi-step wizard 設計で「ステップ間の state ownership と引き渡し項目」が Phase 2 設計書に未記載 | Phase 2（設計）でウィザード / マルチステップ UI を設計する場合、「ステップ間 state 引き渡しテーブル」を必須セクションとして設ける。`smartDefaults` など推論値の反映タイミング（初回のみ / 都度上書き / ユーザー優先）は decision 欄で固定する |
| **[Feedback W1-02b-3]** `implementation-guide.md` の callback 名・props 名が実装と一致していない（identifier drift） | Phase 12 Task 12-6 で `implementation-guide.md` 内の識別子を現行コードで `grep` 確認する。スニペットは型定義・props interface から引用し、手書き snippets を避ける |
| **[Feedback W1-02b-4]** renderer UI コンポーネントで node-only パッケージを直接 import し、Vite browser bundle が runtime error になる | renderer コンポーネントでは node-only パッケージ（`node-cron` 等）を直接 import しない。cron/schedule 検証は browser-safe ユーティリティに切り出す。Phase 11 capture 前に「ブラウザで実際に route を開く smoke test」を必須にする |

### Phase 12 苦戦防止Tips

> UT-STORE-HOOKS-COMPONENT-MIGRATION-001の経験に基づく（2026-02-12）

| Tips                                                     | 説明                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **事前に空欄チェックリストを作成**                       | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する                                                                                                                                                                             |
| **spec-update-workflow.mdを常に参照**                    | Phase 12開始時に必ず [spec-update-workflow.md](references/spec-update-workflow.md) を開き、チェックリストを確認                                                                                                                                                      |
| **「全Step確認前に完了と記載しない」厳守**               | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする                                                                                                                                                                                                   |
| **LOGS.md/SKILL.md は4ファイル更新**                     | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md                                                                                                                           |
| **topic-map.md再生成はセクション変更時も**               | 新規追加だけでなく、セクション更新・削除時も `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行 |
| **worktree環境でも `.claude` 正本を実更新する**          | worktree を理由に LOGS.md / SKILL.md / backlog / workflow の更新を先送りしない。`.agents/skills/` は `rsync` / `diff` で mirror parity を確認する                                                                                                                    |
| **並列エージェント完了後はファイルシステムで検証**       | P43/P59対策。エージェントがコンテキスト制限で応答不能になった場合、`git diff --stat` + `ls outputs/phase-*/` + `artifacts.json` のPhaseステータスで成果物の存在を確認する                                                                                            |
| **NON_VISUAL判定時は `screenshots/.gitkeep` を削除する** | `screenshots/` ディレクトリが空（PNG 0件）のまま残るとvalidator errorになる。NON_VISUAL判定で実スクリーンショットが不要な場合は `screenshots/.gitkeep` を削除してディレクトリごと除外する                                                                            |
| **worktree作成後は `pnpm install` を確認する**           | `esbuild` host/binary version drift により Vitest 起動前に停止することがある。worktree作成後は必ず `pnpm install` を実行してバイナリの整合を確保する                                                                                                                 |

---

## 重要ルール

### Phase完了時の必須アクション

1. **タスク完全実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

### PR作成に関する注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

📖 [references/commands.md](references/commands.md) - コマンド一覧

---

## よく使うコマンド

| Task                       | 責務                              | パターン | 入力         | 出力                   |
| -------------------------- | --------------------------------- | -------- | ------------ | ---------------------- |
| `decompose-task`           | タスクを単一責務に分割            | `seq`    | ユーザー要求 | タスク分解リスト       |
| `identify-scope`           | スコープ、前提、制約を定義        | `seq`    | 分解結果     | スコープ定義           |
| `design-phases`            | phase 構成と gate を設計          | `seq`    | scope        | phase 設計書           |
| `generate-task-specs`      | `index.md` と `phase-*.md` を生成 | `seq`    | phase 設計書 | workflow 仕様一式      |
| `output-phase-files`       | phase ファイルを出力              | `par`    | 仕様データ   | `phase-*.md`           |
| `update-dependencies`      | `artifacts.json` と依存関係を更新 | `par`    | phase 一式   | 依存マップ             |
| `verify-specs`             | workflow 全体をレビュー           | `seq`    | 仕様一式     | PASS/FAIL              |
| `update-system-specs`      | Phase 12 Task 2 を遂行            | `seq`    | 実装結果     | 仕様同期結果           |
| `generate-unassigned-task` | 残課題を task spec 化             | `cond`   | review 指摘  | `unassigned-task/*.md` |

凡例: `seq` = 順次、`par` = 並列、`cond` = 条件分岐。

## agent 導線

- [agents/decompose-task.md](agents/decompose-task.md)
- [agents/identify-scope.md](agents/identify-scope.md)
- [agents/design-phases.md](agents/design-phases.md)
- [agents/generate-task-specs.md](agents/generate-task-specs.md)
- [agents/output-phase-files.md](agents/output-phase-files.md)
- [agents/update-dependencies.md](agents/update-dependencies.md)
- [agents/verify-specs.md](agents/verify-specs.md)
- [agents/update-system-specs.md](agents/update-system-specs.md)
- [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

## Phase 12 と Phase 13 の境界

| Task      | 完了条件                                                                                                              | 詳細                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Task 12-1 | `implementation-guide.md` が Part 1/2 を満たす                                                                        | [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md)   |
| Task 12-2 | Step 1 と Step 2 の判定が記録される                                                                                   | [references/spec-update-workflow.md](references/spec-update-workflow.md)                   |
| Task 12-3 | `documentation-changelog.md` と artifacts が同期される                                                                | [references/spec-update-validation-matrix.md](references/spec-update-validation-matrix.md) |
| Task 12-4 | 0件でも `unassigned-task-detection.md` を出し、`current/baseline` を分離して記録する                                  | [references/unassigned-task-guidelines.md](references/unassigned-task-guidelines.md)       |
| Task 12-5 | 改善点なしでも `skill-feedback-report.md` を出し、`phase12-task-spec-compliance-check.md` を root evidence として残す | [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md)                 |
| Phase 13  | commit と PR は user の明示承認後だけ                                                                                 | [references/review-gate-criteria.md](references/review-gate-criteria.md)                   |

UI/UX 実装を含む task では Phase 11 で screenshot と Apple UI/UX 視覚検証を行う。手順は [references/phase-11-screenshot-guide.md](references/phase-11-screenshot-guide.md) と [references/screenshot-verification-procedure.md](references/screenshot-verification-procedure.md) を使う。

## リソース導線

### core workflow

- [references/resource-map.md](references/resource-map.md)
- [references/create-workflow.md](references/create-workflow.md)
- [references/execute-workflow.md](references/execute-workflow.md)
- [references/commands.md](references/commands.md)
- [references/quality-standards.md](references/quality-standards.md)
- [references/coverage-standards.md](references/coverage-standards.md)
- [references/review-gate-criteria.md](references/review-gate-criteria.md)
- [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md)
- [references/evidence-sync-rules.md](references/evidence-sync-rules.md)
- [references/self-improvement-cycle.md](references/self-improvement-cycle.md)

### phase templates

- [references/phase-templates.md](references/phase-templates.md)
- [references/phase-template-core.md](references/phase-template-core.md)
- [references/phase-template-execution.md](references/phase-template-execution.md)
- [references/phase-template-phase11.md](references/phase-template-phase11.md)
- [references/phase-template-phase12.md](references/phase-template-phase12.md)
- [references/phase-template-phase13.md](references/phase-template-phase13.md)

### Phase 11/12 guides

- [references/phase-11-12-guide.md](references/phase-11-12-guide.md)
- [references/phase-11-screenshot-guide.md](references/phase-11-screenshot-guide.md)
- [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md)
- [references/phase12-checklist-definition.md](references/phase12-checklist-definition.md)
- [references/technical-documentation-guide.md](references/technical-documentation-guide.md)
- [references/screenshot-verification-procedure.md](references/screenshot-verification-procedure.md)
- [assets/phase12-task-spec-compliance-template.md](assets/phase12-task-spec-compliance-template.md)

### spec update

- [references/spec-update-workflow.md](references/spec-update-workflow.md)
- [references/spec-update-step1-completion.md](references/spec-update-step1-completion.md)
- [references/spec-update-step2-domain-sync.md](references/spec-update-step2-domain-sync.md)
- [references/spec-update-validation-matrix.md](references/spec-update-validation-matrix.md)

### pattern family

- [references/patterns.md](references/patterns.md)
- [references/patterns-workflow-generation.md](references/patterns-workflow-generation.md)
- [references/patterns-validation-and-audit.md](references/patterns-validation-and-audit.md)
- [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md)

### logs and archives

- [LOGS.md](LOGS.md)
- [references/logs-archive-index.md](references/logs-archive-index.md)
- [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md)
- [references/logs-archive-2026-feb.md](references/logs-archive-2026-feb.md)
- [references/logs-archive-legacy.md](references/logs-archive-legacy.md)
- [references/changelog-archive.md](references/changelog-archive.md)

## システム観点チェック

| 観点               | aiworkflow-requirements 側の参照先 |
| ------------------ | ---------------------------------- |
| セキュリティ       | `security-*.md`                    |
| UI/UX              | `ui-ux-*.md`                       |
| アーキテクチャ     | `architecture-*.md`                |
| API/IPC            | `api-*.md`                         |
| データ整合性       | `database-*.md`                    |
| エラーハンドリング | `error-handling.md`                |
| インターフェース   | `interfaces-*.md`                  |

Electron desktop task では Renderer、Main、IPC、Preload、ローカルストレージの境界を都度明記する。詳細は [references/quality-standards.md](references/quality-standards.md) を参照。

## 検証コマンド

```bash
node scripts/validate-phase-output.js docs/30-workflows/{{FEATURE_NAME}}
node scripts/verify-all-specs.js --workflow docs/30-workflows/{{FEATURE_NAME}}
node ../skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node ../skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
node scripts/log-usage.js --result success --phase "Phase {{N}}"
```

Phase 12 では追加で `detect-unassigned-tasks.js`、`audit-unassigned-tasks.js`、`verify-unassigned-links.js`、`validate-phase12-implementation-guide.js` を実行する。

## ベストプラクティス

### すべきこと

- 仕様、テスト、実装、検証、同期の順序を崩さない。
- `outputs/phase-N/` を phase ごとに実体化し、`artifacts.json` と同時更新する。
- SubAgent 相当の lane は 3 並列以下に抑え、validation lane は直列で締める。
- detail を増やしたくなったら `references/` へ逃がし、`SKILL.md` は入口に保つ。
- Phase 12 は `implementation-guide`、`system-spec-update-summary`、`documentation-changelog`、`unassigned-task-detection`、`skill-feedback-report` を必ず揃える。
- **[Feedback P0-09-U1-3]** 小規模タスク（Phase 1〜3 で設計が自明）の outputs 必須度は規模（小/中/大）で tier 分けを検討する。ドキュメント作成コストが実装コストを上回るリスクを Phase 1 スコープ固定時に評価する。

### 避けるべきこと

- `.agents` 側だけ先に更新して canonical root を残すこと。
- `outputs/` を後回しにして phase 完了だけ先に付けること。
- `current` と `baseline` の監査結果を混ぜること。
- UI task で screenshot を自動テスト代替として扱うこと。
- user の明示承認なしに commit や PR を作ること。

## 変更履歴

| Version                  | Date                       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v10.09.29**            | **2026-04-06**             | **TASK-P0-09-U1 skill-feedback 反映**: Phase 4 行に private method テスト方針明記ルール追加（Feedback P0-09-U1-1）、Phase 5 行に `improve()` canUseTool 適用範囲・制約明記ルール追加（Feedback P0-09-U1-2）、ベストプラクティス「すべきこと」に小規模タスク outputs tier 分け検討を追加（Feedback P0-09-U1-3）、「よくある漏れ」テーブルに 2 件追記                                                |
| **v10.09.36**            | **2026-04-06**             | **UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 canonical template sync**: `phase-spec-template.md` に Task / Step 分離ルール、Phase 11 `NON_VISUAL` / `VISUAL` 方針、Phase 12 記録分離方針を追加。`phase12-task-spec-compliance-template.md` で `task-workflow-completed.md` / `task-workflow-backlog.md` を root evidence に追加し、`validate-phase-output.js` の docs-only 判定を canonical metadata / index 優先へ硬化。`unassigned-task-template.md` に「苦戦箇所」必須欄を追加し、`task-workflow-completed.md` / `task-workflow-backlog.md` / LOGS.md と同波で同期 |
| **v10.09.35**            | **2026-04-06**             | **TASK-UI-01 impl-spec-to-skill-sync**: `[Feedback 6]` ViewType 追加時の3点同波更新チェックリスト（`store/types.ts` / `skillLifecycleJourney.ts` / renderView テスト + `ui-ux-navigation.md` ViewType テーブル）をピットフォールテーブルに追加 |
| **v10.09.34**            | **2026-04-06**             | **TASK-UI-01 lifecycle-panel-primary-route-promotion close-out sync**: Phase 11 screenshot capture script を追加して 4 枚の visual evidence を保存。Phase 12 implementation-guide に screenshot references を追記し、`system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` を same-wave 同期。targeted vitest 35 tests PASS、`.agents` mirror の LOGS / SKILL history も更新 |
| **v10.09.33**            | **2026-04-03**             | **task-ut-p0-02-001-repeat-feedback-memory close-out sync**: Phase 2 型設計で `RuntimeSkillCreatorVerifyCheck.id` フィールドの実在確認を Phase 3 MINOR として捕捉。module-level 非 export 関数のテスト戦略（統合パス経由の検証）を Phase 4 テスト設計の参考事例として記録。`ImproveFeedbackHistory` 型の shared 配置判断（Phase 1 のスコープ外波及検証）を学習事項として追加 |
| **v10.09.30**            | **2026-03-31**             | **TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 skill-feedback 反映**: branch-level `outputs/` が複数タスクで衝突する場合は workflow spec / `artifacts.json` / close-out 文書を同一ターンで current output path へ揃えるルール、build artifact 監査は `rg -F` / `rg -q` を優先するルール、GUI 非変更 task の Phase 11 は `NON_VISUAL_FALLBACK` と bundle evidence を対で記録するルールを変更履歴に追記 |
| **v10.09.32**            | **2026-04-03**             | **TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 skill-feedback 反映**: Phase 11 非 visual task の代替記録テンプレート、Phase 7 coverage 対象範囲明示ルール、Phase 12 documentation-changelog の workflow-local / global skill sync 分離ルールを current facts へ反映。`generate-index.js` 再実行で indexes を 2026-04-03 時点へ更新 |
| **v10.09.31**            | **2026-04-03**             | **TASK-FIX-LIFECYCLE-PANEL-ERROR-001 close-out sync + skill-feedback 反映**: Phase 7〜12 outputs を `docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/outputs/phase-7〜12/` へ実体化し、`phase-12-documentation.md` / `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4点同期を current facts へ固定。`validate-phase12-implementation-guide` PASS、Phase 11 NON_VISUAL、`task-workflow-completed.md` / backlog path 是正を同一ターンで記録。**[Feedback 4]** Phase 11 NON_VISUAL 時 `manual-test-result.md` 証跡メタ必須化、**[Feedback 5]** Phase 7 広域 coverage 目標時の変更ブロック line/branch 実測根拠必須化をピットフォールテーブルへ追記 |
| **v10.09.29**            | **2026-03-31**             | **TASK-UIUX-FEEDBACK-001 spec_created sync hardening**: Phase 11 を 3層評価（Semantic / Visual / AI UX）として明文化し、`agents/evaluate-ui-ux.md` と `scripts/evaluate-ui-ux*` family を追加。あわせて false green 防止のため `spec_created` workflow では placeholder-only screenshot と local outputs 充足だけで Phase 11/12 completed 扱いしない運用を current facts へ是正                                                                                              |
| **v10.09.28**            | **2026-03-30**             | **TASK-RT-03 skill-feedback 反映**: Phase 5 実装計画に「新規作成/修正」ファイルパス一覧を必須記載ルール追加（Feedback 1-1）、Phase 8 リファクタリング記録に Before/After/理由テーブル形式を義務化（Feedback 1-2）                                                                                                                                                                                                                                                             |
| **v10.09.27**            | **2026-03-29**             | **TASK-UT-SDK-07 skill-feedback 反映**: Feedback1（Phase 1 で既存コードの命名規則 camelCase/kebab-case 等を分析・記録するステップを明示）、Feedback2（Phase 4 の TDD Red 前に Phase 1-3 で確認した命名規則との整合確認を義務化）                                                                                                                                                                                                                                              |
| **v10.09.26**            | **2026-03-28**             | **TASK-SDK-08 skill-feedback 反映**: Feedback1（Phase 1での artifact 命名 canonical 一覧確定ルール追加）、Feedback2（Phase 12着手時の `outputs/artifacts.json` vs phase spec artifact 名 照合を初手チェックへ昇格）、Feedback3（Phase 1 で記録した UI/docs-only 分類を Phase 11 着手時に参照するルール）、pitfall 2件（NON_VISUAL時の screenshots/.gitkeep 削除、worktree作成後の pnpm install 確認）を追加。変更履歴を v10.09.22以前はアーカイブ参照へ圧縮し 478行以内に維持 |
| **v10.09.25**            | **2026-03-26**             | **UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 完了同期**: public IPC shape が不変でも `Facade/Engine` owner 変更、`review/verify` 遷移意味変更、`success:false` / reject の failure lifecycle 変更、artifact append/upsert 方針変更があれば Step 2 必須とする判断を `spec-update-workflow.md` / `spec-update-step2-domain-sync.md` へ反映。重複未タスク防止と wider suite blocker の既存 tracker 優先も明文化                                                        |
| **v10.09.25**            | **2026-03-26**             | **UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 close-out sync を反映**: current workflow 完了時に source unassigned task の status と completed workflow root を同一ターンで整合させ、`recordExecutionFailure()` のような stale method 名を current code sweep で排除するルールを追加。Step 1-A は domain spec no-op でも completed ledger / lessons / LOGS / SKILL history を no-op にしない運用へ是正                                                                 |
| **v10.09.24**            | **2026-03-26**             | **要件レビュー思考法を追加**: task-specification-creator で要件草案を扱う際に、システム系 + 戦略・価値系 + 問題解決系の3系統レビュー、5つの一次出力、4条件評価、因果ループ/状態所有権/価値コスト均衡の確認を必須化                                                                                                                                                                                                                                                            |
| **v10.09.23**            | **2026-03-25**             | **TASK-SC-08-E2E-VALIDATION 完了同期**: Skill Creator LLM統合 E2Eテスト + TerminalHandoff検証。Phase 1-12完了。5シナリオ36テスト全PASS。Lines 89%・Branches 77%・Functions 100%。未タスク0件。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策）                                                                                                                                                                                                                |
| **v10.09.23**            | **2026-03-25**             | **TASK-SC-07-STREAMING-PROGRESS-UI 完了同期**: ストリーミング進捗UI Phase 1-13 完了。generationProgressSlice独立スライス・useStreamingProgress・useCancelGeneration・ErrorCards atoms・個別セレクタ9点。114テスト全PASS。未タスク4件（IPC cancel送信・デバウンス100ms・設定画面遷移・エラーコード構造化）。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策）                                                                                                   |
| **v10.09.23**            | **2026-03-25**             | **TASK-IMP-HEALTH-POLICY-UNIFICATION-001 完了同期**: HealthPolicy 統一インターフェース。health-policy.ts 新規作成（HealthPolicy/HealthPolicyInput/resolveHealthPolicy）。RuntimePolicyResolver DI統合 + mainlineAccess 消費 + HealthIndicator 表示統合。apiKeyDegraded @deprecated v0.8.0。38テスト全PASS。未タスク3件（UT-HEALTH-POLICY-MAINLINE/RUNTIME-INJECTION/DEPRECATED-REMOVAL）backlog登録。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策）         |
| **v10.09.23**            | **2026-03-25**             | **UT-LLM-MOD-01-005 完了同期**: completed-tasks canonical root の Phase 12 close-out を再監査。`implementation-guide.md` の 10/10 validator 要件、`manual-test-checklist.md` / `outputs/artifacts.json` / `phase12-task-spec-compliance-check.md` の補助成果物必須化、未タスク raw メモの full template 昇格、`audit-unassigned-tasks --target-file` による current/baseline 分離記録を reference 群へ反映。                                                                  |
| **v10.09.24**            | **2026-03-26**             | **TASK-SDK-01 Phase 12 compliance sync follow-up formalize**: execution workflow の Phase 12 task 分解を Task 12-6 まで是正し、`.claude` 参照を repo-root 基準の実在相対パスへ統一。`task-workflow.md` / backlog / topic-map / keywords と same-wave で閉じ、今回差分が未タスク formalize と台帳同期のみであるため Step 2 domain spec 更新は no-op とする判断を変更履歴へ追記                                                                                                 |
| **v10.09.22〜v10.08.00** | **2026-03-04〜2026-03-24** | 詳細履歴はアーカイブへ移管済み。内容は [LOGS.md](LOGS.md) / [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md) を参照                                                                                                                                                                                                                                                                                                                             |
| **v10.09.12**            | **2026-03-25**             | **UT-SC-02-005 の close-out を反映**: execute 型更新タスクの workflow で不足していた Phase 3/6/7/8/9/10/11/12 成果物名を仕様書と一致させ、`manual-test-result.md` / `quality-report.md` / `system-spec-update-summary.md` を current facts に同期。Phase 12 は outputs 充足だけでなく古いテスト件数・out-of-scope 記述の残骸除去まで同一ターンで行うルールを変更履歴へ追加                                                                                                    |
| **v10.09.13**            | **2026-03-27**             | **TASK-SDK-04 implementation spec sync を反映**: `references/spec-update-workflow.md` に、`spec_created` task へ code wave が混入した場合の Step 2 再判定と Phase 11 screenshot policy 見直しを追加。`新規未タスク 0件` 固定より current gap formalize を優先する close-out ルールを補強                                                                                                                                                                                      |
| **v10.07.0-v10.03.0**    | **2026-03-03〜2026-03-02** | **Phase 12 再監査・完了同期の標準化**: TASK-10A-D/C/B 再監査、Phase 13 PR本文連携強化、Phase 11 画面カバレッジマトリクス改善、Phase 12 準拠再確認パターン確立。詳細は `LOGS.md` を参照                                                                                                                                                                                                                                                                                        |
| **v10.02.0-v9.90.0**     | **2026-03-02〜2026-02-25** | **Phase 12 完了同期と再監査ルールの整備**: `artifacts.json` / `outputs` 同期、完了ゲート化、unassigned audit scope control、quick_validate 運用標準化。詳細は `LOGS.md` を参照                                                                                                                                                                                                                                                                                                |

> 補足: v9.89.0 以前の履歴は `LOGS.md` に保持（監査証跡を維持）。

詳細な履歴と usage log は [LOGS.md](LOGS.md) と [references/logs-archive-index.md](references/logs-archive-index.md) を参照。
