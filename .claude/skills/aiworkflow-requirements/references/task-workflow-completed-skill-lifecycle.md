# タスク実行仕様書生成ガイド / completed records (skill lifecycle)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records
> 分割元: `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`（500行超のため分割）
> 対象タスク: TASK-10A-C, TASK-10A-D, TASK-SKILL-LIFECYCLE-04, TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, UT-06-005

## UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-005                                                                  |
| 機能         | SkillExecutor の Permission 拒否時 fallback 制御（abort/skip/retry/timeout） |
| 実施日       | 2026-03-16                                                                 |
| ステータス   | completed（Phase 1-12）                                                    |
| ワークフロー | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/`                   |
| テスト       | 23 tests PASS（SkillExecutor.fallback.test.ts）                            |

### 苦戦箇所

| ID     | 内容                                                | 解決策                                                    |
| ------ | --------------------------------------------------- | --------------------------------------------------------- |
| S-PF-1 | 既実装コードの4ステップ abort フロー発見遅延         | Phase 1 で git log + grep で既存実装有無を確認する         |
| S-PF-2 | revokeSessionEntries スタブ実装の設計判断             | UT-06-005-B として未タスク化、Phase 2 に判断根拠記録       |
| S-PF-3 | PERMISSION_MAX_RETRIES デッドコードと Set メモリリーク | 定数参照統一 + セッション単位 clear 機構追加               |

### 派生未タスク（3件）

| タスクID    | 内容                                  | 優先度 |
| ----------- | ------------------------------------- | ------ |
| UT-06-005-A | PreToolUse Hook への fallback 統合    | 高     |
| UT-06-005-B | revokeSessionEntries セッション別実装 | 中     |
| UT-06-005-C | SkillStreamMessageType abort/skip 追加 | 中    |

### 検証証跡

- Phase 12 全 Task PASS（phase12-task-spec-compliance-check.md）
- 未タスク 3件検出、3ステップ完了（指示書 + backlog + 仕様書リンク）
- `workflow-permission-fallback-abort-skip-retry.md` に統合正本を作成

---

## TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02）

### タスク概要

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-10A-C                                               |
| 機能         | SkillCreateWizard（4ステップ作成導線）                   |
| 実施日       | 2026-03-02                                               |
| ステータス   | completed（Phase 1-12）                                  |
| ワークフロー | `docs/30-workflows/completed-tasks/skill-create-wizard/` |

### 反映内容（Phase 12 再監査）

| 観点         | 内容                                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| UI実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` と `hooks/useWizardStep.ts` を追加し、説明入力→設定→生成中→完了/エラーを実装 |
| IPC契約      | `skill:create` を `channels.ts` / `skill-api.ts` / `skillHandlers.ts` / テストへ同期。Preload API `create(description, options)` を追加         |
| サービス委譲 | `SkillService.createSkillFromWizard()` で `SkillCreatorService.createSkill()` に委譲し、`addAgents` / `addReferences` の初期化を実装            |
| 画面検証     | `outputs/phase-11/screenshots/TC-01〜TC-08` を 2026-03-02 に再取得                                                                              |
| 仕様同期     | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` / `task-workflow.md` を `skill:create` 契約に同期             |

### 仕様書別SubAgent分担（関心分離）

| SubAgent   | 担当仕様書                                 | 主担当作業                                                | 完了条件                                           |
| ---------- | ------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------- |
| SubAgent-A | `references/api-ipc-agent.md`              | `skill:create` IPC契約（request/response/validation）同期 | チャネル表・バリデーション表・実装状況が実装と一致 |
| SubAgent-B | `references/interfaces-agent-sdk-skill.md` | Preload API `create` 契約と型定義同期                     | 14メソッド構成・`create` 契約が一致                |
| SubAgent-C | `references/security-electron-ipc.md`      | sender/P42/構造検証/サニタイズのセキュリティ同期          | 4層防御が仕様化され実装箇所が追跡可能              |
| SubAgent-D | `references/task-workflow.md`              | 完了台帳・検証証跡・苦戦箇所の固定化                      | 完了記録 + 検証結果 + 苦戦箇所が同時記録           |
| SubAgent-E | `references/lessons-learned.md`            | 再発条件付きの教訓と簡潔手順の転記                        | 同種課題手順が再利用可能な形で記録                 |

### 検証証跡

| 検証項目            | コマンド / 証跡                                                                                                                                                   | 結果                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 画面証跡再取得      | `pnpm --filter @repo/desktop run screenshot:skill-create-wizard`                                                                                                  | PASS（8枚取得）         |
| 仕様書構造          | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard`                     | PASS（13/13）           |
| Phase出力整合       | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-create-wizard`                           | PASS（28項目）          |
| 未タスクリンク整合  | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                               | PASS（ALL_LINKS_EXIST） |
| Phase 11 証跡紐付け | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard` | PASS（8/8）             |

### 実装時の苦戦箇所と解決策

| 苦戦箇所                         | 再発条件                                 | 解決策                                                                                       | 今後の標準ルール                                                                     |
| -------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 11/12 依存成果物の参照漏れ | 参照資料を最小構成で記述した場合         | `phase-11-manual-test.md` / `phase-12-documentation.md` に Phase 2/5/6/7/8/9/10 成果物を追補 | Phase 11/12 は依存Phaseの成果物を参照表で明示する                                    |
| `skill:create` 契約の更新漏れ    | UI実装を先行し仕様同期を後回しにする場合 | API/IF/Security/Task の4仕様書を同ターン更新                                                 | 新規 `skill:*` 追加時は「api-ipc/interfaces/security/task-workflow」同時更新を必須化 |
| 画面証跡鮮度の不明確化           | 既存スクリーンショットを流用した場合     | 撮影スクリプトを再実行し、TC単位で8枚再生成                                                  | UI完了判定前に `screenshot:*` を必ず再実行する                                       |

#### 同種課題の簡潔解決手順（5ステップ）

1. 新規 `skill:*` チャネル追加時は `channels/preload/handler/tests` を先に同期する。
2. `task-workflow` / `api-ipc` / `interfaces` / `security` の4仕様書を同一ターンで更新する。
3. Phase 11 は TC と画像ファイルを1対1で対応づけ、`validate-phase11-screenshot-coverage` を実行する。
4. Phase 12 は依存Phase成果物を参照資料へ列挙し、`verify-all-specs` warning をゼロ化する。
5. LOGS/SKILL 履歴と index を更新して完了記録を固定する。

### Phase 12で検出した未タスク（TASK-10A-C）

| 未タスクID                                             | 概要                                                                                     | 優先度 | タスク仕様書                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001              | TASK-10A-C の 5仕様書同時同期ガード（api-ipc/interfaces/security/task-workflow/lessons） | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md`              |
| UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001 | TASK-10A-C Phase 11 画面証跡ガード（再撮影 + TCカバレッジ + 鮮度確認）                   | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md` |

---

## TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03）

### タスク概要

| 項目           | 内容                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| タスクID       | TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION                                                             |
| ステータス     | **完了**                                                                                              |
| テスト         | 132テスト全PASS                                                                                       |
| 実装ファイル   | `SkillManagementPanel.tsx` / `ChatPanel.tsx` / `agentSlice.ts` / `store/index.ts`                     |
| テストファイル | `SkillManagementPanel.test.tsx` / `ChatPanel.test.tsx` / `agentSlice.test.ts` / `store/index.test.ts` |
| 参照           | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/`                        |

### 実装内容

1. **SkillManagementPanel ビュー統合**: 「準備中」プレースホルダーをSkillAnalysisView（TASK-10A-B）とSkillCreateWizard（TASK-10A-C）に差替
2. **ChatPanel 導線追加**: スキル管理パネルへのトグルボタン追加（`data-testid="skill-management-toggle"`、`aria-expanded`、`disabled={isExecuting}`）
3. **agentSlice 拡張**: 3状態フィールド（`currentAnalysis`/`isAnalyzing`/`isImproving`）+ 5アクション + 8個別セレクタ

### 苦戦箇所と解決策

| 苦戦箇所                                                                   | 解決策                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Suggestion`型不整合（`unknown[]` → `Suggestion[]`）                       | `@repo/shared/types/skill-improver`から正しい型をインポート                                                                    |
| P40テスト実行ディレクトリ依存                                              | テストコマンドに`cd apps/desktop &&`プレフィックスを含める                                                                     |
| PostToolUseフックによるEdit失敗                                            | 大量編集後は`git diff --stat`で変更確認（P11パターン）                                                                         |
| Phase 11 画面証跡の解釈揺れ（TC-02 と TC-05 が同じ「エラー表示」に見える） | `manual-test-result.md` に「TC-02=analysis遷移+API未接続フォールバック」「TC-05=意図的エラー状態検証」を明記し、証跡意味を分離 |

### 検証証跡

| 検証項目              | 結果                 |
| --------------------- | -------------------- |
| テスト                | 132テスト全PASS      |
| Phase 10 最終レビュー | PASS判定             |
| Phase 11 手動テスト   | 17テストケース全PASS |
| Phase 12 ドキュメント | 6成果物完了          |

### 再確認追補（2026-03-04）

| 観点               | 実施内容                                                                                                                      | 結果                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Phase仕様準拠      | `verify-all-specs --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION`                     | PASS（13/13, error=0, warning=0）                                                                  |
| Phase出力整合      | `validate-phase-output docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION`                           | PASS（28項目）                                                                                     |
| 画面証跡カバレッジ | `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION` | PASS（expected TC=5 / covered TC=5）                                                               |
| 未タスク参照整合   | `verify-unassigned-links`                                                                                                     | PASS（ALL_LINKS_EXIST 89/89）                                                                      |
| 未タスク差分監査   | `audit-unassigned-tasks --json --diff-from HEAD`                                                                              | PASS（currentViolations=0 / baselineViolations=85）                                                |
| 未タスク全体監査   | `audit-unassigned-tasks --json`                                                                                               | FAIL（currentViolations=85）。既存ベースライン負債の監視用途として記録し、今回合否判定には使わない |

### 再確認時の苦戦箇所（2026-03-04）

| 苦戦箇所                                                            | 原因                                                        | 解決策                                                                               | 今後の標準ルール                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `audit-unassigned-tasks` の全体監査結果を今回差分FAILと誤読しやすい | `--json` 単体は baseline 監視であり、差分合否を直接表さない | `--diff-from HEAD` の `currentViolations` を合否判定に固定し、全体監査値は別枠で併記 | 未タスク監査は必ず `current`（合否）と `baseline`（監視）を2軸で記録する |
| Phase 11 証跡で「analysis遷移」と「エラー状態」の意味が混在しやすい | TC名と画像説明だけでは意図差が伝わりにくい                  | `manual-test-result.md` のTC-02/TC-05に目的差を注記し、目視確認ログを残した          | 画面証跡テーブルは「状態名 + 検証目的」をセットで記載する                |

### 再確認で追加した未タスク（2026-03-04）

| 未タスクID                                                   | 概要                                                                    | 優先度 | タスク仕様書                                                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001            | Phase 12 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）の必須化 | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md`            |
| UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001 | Phase 11 画面証跡で状態名+検証目的を分離し、TC意図混同を防ぐ運用ガード  | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md` |

### 仕様書別SubAgent実行ログ（2026-03-04）

| SubAgent  | 担当仕様書                               | 反映した実装内容                                                       | 反映した苦戦箇所                                              | 証跡                                                                                                     |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| SG-TW-01  | `references/task-workflow.md`            | TASK-10A-D の再確認証跡（13/13、28項目、TC 5/5、current=0）を追記      | `current/baseline` 誤読防止、TC-02/TC-05 証跡意図分離を台帳化 | `outputs/phase-12/spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md`                |
| SG-UIF-01 | `references/ui-ux-feature-components.md` | SkillManagementPanel/ChatPanel/agentSlice の統合内容と再確認結果を同期 | 画面証跡の状態名+検証目的の明記を運用ルール化                 | `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/screenshots/*.png`                          |
| SG-LL-01  | `references/lessons-learned.md`          | TASK-10A-D セクションへ再利用用の要点を整理                            | 実装時 + 再確認時の苦戦箇所を再発条件付きで追記               | `references/lessons-learned.md` 該当セクション                                                           |
| SG-SC-01  | `skill-creator` テンプレート             | SubAgent実行ログをテンプレート必須項目へ追加                           | 「仕様書ごとの反映漏れ」をテンプレートで防止                  | `assets/phase12-system-spec-retrospective-template.md` / `assets/phase12-spec-sync-subagent-template.md` |

### 同種課題の簡潔解決手順（SubAgent運用版・5ステップ）

1. 対象仕様書を確定し、`1仕様書=1SubAgent` で担当を固定する（台帳・機能仕様・教訓を最低3分割）。
2. 各SubAgentは「実装内容」と「苦戦箇所」を同一ターンで追記し、未追記列を残さない。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行し、合否は `currentViolations` で判定する。
4. UIタスクではスクリーンショットを目視し、証跡表に「状態名 + 検証目的」を追記する。
5. `task-workflow.md` と `lessons-learned.md` の両方に同じ再発防止ルールを転記して完了とする。

---

## TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合 再監査記録（2026-03-14）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-04 |
| 対象workflow | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/` |
| ステータス | in_progress（Phase 1-12 completed / Phase 13 blocked） |
| 主対象 | 採点ゲート契約（`ScoringGate`）・Δスコア表示・評価API契約・仕様同期 |

### 反映内容（再監査）

| 観点 | 内容 |
| --- | --- |
| 実装不整合是正 | `SkillAnalysisView` → `ScoreDisplay` の `previousAnalysis` 受け渡し漏れを修正し、Δバッジ表示を復旧 |
| 画面検証 | Playwright harness `capture-task-skill-lifecycle-04-phase11.mjs` を追加し、TC-11-01〜04 の実画面証跡を再取得 |
| 仕様同期 | `interfaces-agent-sdk-skill-details.md`（採点ゲート/評価API契約）、`arch-state-management-details.md`（`previousAnalysis` state）を更新 |
| backlog 同期 | Phase 10 MINOR 2件を `task-workflow-backlog.md` と `docs/30-workflows/unassigned-task/` に登録済み |
| 統合正本 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を追加し、current canonical set / artifact inventory / legacy path 互換 / same-wave 手順を一元化 |

### 仕様書別SubAgent分担（関心分離）

| SubAgent | 担当仕様書 / 生成物 | 主担当作業 |
| --- | --- | --- |
| A | `interfaces-agent-sdk-skill-details.md` | `ScoringGate` / `ScoringGateResult` / `evaluatePrompt` 契約同期 |
| B | `arch-state-management-details.md` | `previousAnalysis` snapshot state と action の責務同期 |
| C | `ui-ux-feature-components-reference.md` | SkillAnalysisView 節の現行実装追補（Store駆動 + Δ表示 + 証跡） |
| D | `task-workflow-backlog.md`, `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md`, `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` | MINOR由来未タスクの台帳化 |
| Lead | `task-workflow-completed-*.md`, `indexes/topic-map.md`, `indexes/keywords.json` | 完了記録固定、index再生成、最終検証統合 |

### 検証証跡

| 検証項目 | コマンド | 結果 |
| --- | --- | --- |
| workflow 構造検証 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | PASS（13/13） |
| workflow phase 検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | PASS（28項目） |
| Phase 11 coverage | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | PASS（expected 4 / covered 4） |
| Phase 12 implementation guide | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | PASS（10/10） |
| 未タスクリンク整合 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | PASS（229/229, missing=0） |
| 未タスク差分監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | PASS（current=0, baseline=134） |
| 画面/ロジックUT | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/scoring-gate.test.ts src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts` | PASS（63/63） |
| 型検証 | `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit` | PASS |

### 苦戦箇所と解決策

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| Δ表示ロジックがテストPASSでも実画面に出ない | Hook戻り値を子コンポーネントに渡し忘れる | `SkillAnalysisView` の props 配線を修正し、Phase 11 で実画面再撮影して回帰確認 |
| 旧仕様の文言が現行実装を上書きする | TASK-10A-B 時点の説明を更新せず追記だけで運用する | UI仕様書に「初期実装」と「現行実装」の2層表記を導入 |
| docs-only検証で画面品質の証跡が薄くなる | CLI検証だけで完了判定する | harness 追加 + screenshot coverage validator を Phase 11 完了条件へ固定 |

### 同種課題の簡潔解決手順（5ステップ）

1. 実装差分は「テスト結果」ではなく「画面証跡 + セレクタ配線」で最終確認する。
2. workflow 仕様（Phase）と system spec（references）を同一ターンで更新する。
3. MINOR 指摘は Phase 12 で必ず未タスク化し、backlog と指示書を同時に生成する。
4. index 再生成（`generate-index.js`）を最後に実行し、`topic-map` / `keywords` の検索導線を更新する。
5. `current` と `baseline`（既存負債）を分離して監査結果を記録する。

### 関連未タスク（active）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| TASK-FIX-EVAL-STORE-DISPATCH-001 | `handleEvaluatePrompt` の Store 経由化 | 低 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| TASK-FIX-SCORE-DELTA-DEDUP-001 | `calculateScoreDelta` の重複解消 | 低 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` |

### Phase 12 指定ディレクトリ再確認（2026-03-14 追補）

| 観点 | 実施内容 | 結果 |
| --- | --- | --- |
| 未タスク配置 | workflow ローカル `tasks/unassigned-task/` から root `docs/30-workflows/unassigned-task/` へ正規化 | 完了 |
| 仕様同期 | `interfaces-agent-sdk-skill-details.md` / `task-workflow-backlog.md` / 本完了記録 / workflow Phase 12成果物の参照を一括更新 | 完了 |
| 未タスク品質 | 2件を task-spec 9セクション形式へ再作成し、`3.5 実装課題と解決策` を追記 | 完了 |
| 監査 | `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD --target-file` を再実行 | PASS |

#### 追補時の苦戦箇所と解決策

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| 未タスク配置先の canonical path が曖昧になり、`--target-file` 境界と衝突する | workflow 配下 `unassigned-task` を一時運用したまま参照更新を後回しにする | root canonical path を先に固定し、関連仕様の参照を同ターンで一括更新する |
| `current`/`baseline` 判定と「指定ディレクトリ配置確認」を同じ意味で扱ってしまう | 監査結果を単一数値で報告する | 配置可否・links可否・audit可否を3軸で分離して記録する |

---

## TASK-SKILL-LIFECYCLE-05: 作成済みスキルを使う主導線（設計タスク）完了記録（2026-03-15）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-05 |
| タスク種別 | design |
| 完了日 | 2026-03-15 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物数 | 49ファイル（Phase 1-12） |
| テスト | 30テスト全GREEN（cta-visibility.test.ts） |
| 受入基準 | AC-1〜AC-5 全充足 |

実装コード:
- `packages/shared/src/types/cta-visibility.ts`: ScoringGate x CTA 16パターンマトリクス純粋関数
- `packages/shared/src/types/__tests__/cta-visibility.test.ts`: 30テスト
- `packages/shared/src/types/index.ts`: エクスポート追加

Phase 10 ゲート判定: PASS（MAJOR 0件、MINOR 8件→全て未タスク記録済み）
Phase 11 ウォークスルー: 63項目中61 PASS、2 MINOR

---

## TASK-SKILL-LIFECYCLE-05: 作成済みスキル利用導線 再監査記録（2026-03-15）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-05 |
| 対象workflow | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/` |
| ステータス | in_progress（Phase 1-12 completed / Phase 13 blocked） |
| 主対象 | 作成済みスキル利用導線（Immediate / Deferred / History）・ScoreGate表示・導線再利用性 |

### 反映内容（再監査）

| 観点 | 内容 |
| --- | --- |
| Phase 11 証跡復旧 | `manual-test-checklist.md` / `manual-test-result.md` / `screenshot-plan.json` を作成し、TC-11-01〜05 の `.png` 証跡を current workflow に再集約 |
| 画面検証 | review board capture（`TC-11-00`）を追加し、source screenshot 5件と合わせて Apple UI/UX 観点の再確認を実施 |
| Phase 12 是正 | implementation guide を Part 1/2 要件に再編し、Part 1「なぜ先行」、Part 2「使用例」「エッジケース」を補強 |
| backlog 同期 | Phase 10/11/12 で露出した follow-up 6件を `task-workflow-backlog.md` と root `unassigned-task/` に登録 |
| 統合正本 | `workflow-skill-lifecycle-created-skill-usage-journey.md` を追加し、仕様抽出マップ・Task04依存契約・5分解決カードを一元化 |

### 仕様書別SubAgent分担（関心分離）

| SubAgent | 担当仕様書 / 生成物 | 主担当作業 |
| --- | --- | --- |
| A | workflow phase docs（Phase 1-13） | stale narrative の補正、完了条件の再同期 |
| B | `outputs/phase-11/*` | screenshot plan / checklist / result / evidence board の整備 |
| C | `outputs/phase-12/implementation-guide.md` | Part 1/2 validator 要件の不足補完 |
| D | `task-workflow-backlog.md`, `docs/30-workflows/unassigned-task/` | 未タスク formalize とリンク同期 |
| Lead | `task-workflow.md`, `lessons-learned-current.md`, `indexes/*`, `LOGS.md`, `.agents` mirror | system spec same-wave 同期と最終検証 |

### 検証証跡

| 検証項目 | コマンド | 結果 |
| --- | --- | --- |
| workflow 構造検証 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（13/13, errors=0, warnings=0） |
| workflow phase 検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey` | PASS（28項目） |
| Phase 11 coverage | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（expected 5 / covered 5） |
| Phase 12 implementation guide | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（10/10） |
| 未タスクリンク整合 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md --json` | PASS（229/229, missing=0） |
| 未タスク差分監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | PASS（current=0, baseline=136） |

### 関連未タスク（active）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| TASK-IMP-SKILL-LIFECYCLE-05-CTA-INTERACTION-STATES-001 | CTA hover/active/focus-visible 状態定義の追加 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-cta-interaction-states-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-CUSTOMSTORAGE-VALIDATION-GUARD-001 | customStorage 復元時の runtime validation 強化 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-customstorage-validation-guard-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-FAVORITE-SELECTOR-STABILITY-001 | favorite selector の再レンダー安定性検証 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-favorite-selector-stability-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-AMBIGUITY-CRITERIA-CLARIFICATION-001 | テスト合否基準の曖昧表現除去 | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-ambiguity-criteria-clarification-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-EMPTY-STATE-DETAIL-DESIGN-001 | Skill Center Empty State 詳細設計補完 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-empty-state-detail-design-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-E2E-SCENARIOS-COVERAGE-001 | 3シナリオ導線の E2E カバレッジ固定 | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-e2e-scenarios-coverage-001.md` |

### 同種課題の簡潔解決手順（5ステップ）

1. 先に `validate-phase11-screenshot-coverage` を通し、欠落成果物（checklist/result/plan/screenshot）を機械的に揃える。
2. `implementation-guide` は Part 1「なぜ先行」→ Part 2「型/API/使用例/エッジケース/設定一覧」の順で埋める。
3. 画面再現が環境依存で詰まる場合は、source screenshot 集約 + review board 1件 + metadata で evidence chain を固定する。
4. Phase 10/11/12 で残った論点は即 `unassigned-task/` に formalize し、backlog と同ターン同期する。
5. 最後に `task-workflow` / `lessons` / `indexes` / `LOGS` / mirror を同一 wave で更新し、再監査 drift を防ぐ。

---

## TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-06 |
| タスク種別 | design |
| ステータス | spec_created |
| 完了日 | 2026-03-16 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物ディレクトリ | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/` |

主要設計成果物:
- `outputs/phase-2/` : 型定義設計（ToolRiskLevel / AllowedToolEntryV2 / SafetyGatePort / PERMISSION_HISTORY_MAX_ENTRIES）
- `outputs/phase-12/implementation-guide.md` : Part 1（概念説明）/ Part 2（実装詳細）

Phase 10 ゲート判定: PASS
Phase 11 ウォークスルー: 実施済み

未タスク検出: UT-06-001〜UT-06-008（8件）登録済み
