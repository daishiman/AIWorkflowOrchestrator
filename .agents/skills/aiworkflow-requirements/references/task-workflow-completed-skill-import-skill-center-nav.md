# タスク実行仕様書生成ガイド / completed records

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records

## 完了タスク

### タスク: TASK-FIX-SKILL-IMPORT 3連続是正（2026-03-04）

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 対象タスク | `01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001` / `02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` / `03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` |
| 完了日     | 2026-03-04                                                                                                                                                         |
| ステータス | **完了（Phase 1-12 出力 + 仕様同期 + 画面検証）**                                                                                                                  |
| 目的       | `skill:getImported` の互換復元、`skill:import` の冪等契約、SkillCenter 欠損メタデータ防御を一体で是正                                                              |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                                      | 主担当作業                                          | 完了条件                                               |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| SubAgent-A | `references/api-ipc-agent.md`                                   | `skill:import` 成功判定と冪等返却契約の同期         | `errors.length===0` 基準と既存ケース返却が明文化される |
| SubAgent-B | `references/interfaces-agent-sdk-skill.md`                      | `getImported` 互換キー/SkillCenter防御契約の同期    | id/name 互換と nullish 防御が契約化される              |
| SubAgent-C | `references/arch-state-management.md`                           | `agentSlice.importSkill` 事前ガードの状態管理契約化 | 既存インポート時 IPC スキップが仕様化される            |
| SubAgent-D | `references/ui-ux-feature-components.md`                        | 欠損メタデータ防御と画面証跡（TC-01〜04）同期       | UIクラッシュ防止契約と証跡リンクが揃う                 |
| SubAgent-E | `references/task-workflow.md` / `references/lessons-learned.md` | 完了台帳・苦戦箇所・再利用手順の固定化              | 実装内容 + 苦戦箇所 + 検証証跡を同一ターン反映         |

#### 実装反映（要点）

- `SkillService.getImportedSkills()` を id/name 両対応へ更新し、旧保存データ互換を回復。
- `skill:import` は `importedCount` 依存を廃止し、`errors.length===0` を成功判定に統一。
- `agentSlice.importSkill` へ冪等早期終了を追加し、重複インポートで IPC を呼ばない構成へ変更。
- SkillCenter（`useSkillCenter` / `useFeaturedSkills` / `SkillCard` / `SkillDetailPanel`）で nullish 防御を追加し、欠損メタデータでも描画を維持。

#### 今回実装で抽出した必須仕様（aiworkflow-requirements）

| 仕様書                                                          | 抽出した必須要件                                                              | 反映先                                                                     | 検証                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `references/api-ipc-agent.md`                                   | `skill:import` の成功判定はエラー有無を正本化し、冪等ケースでも成功応答を返す | `apps/desktop/src/main/ipc/skillHandlers.ts`                               | `skillHandlers.test.ts` + `verify-all-specs`  |
| `references/interfaces-agent-sdk-skill.md`                      | `getImported` は id/name 互換を維持し、UI入力は nullish 許容                  | `apps/desktop/src/main/services/skill/SkillService.ts` / SkillCenter hooks | `SkillService.test.ts` + UI hook tests        |
| `references/arch-state-management.md`                           | 既存インポート時は状態層で早期終了し IPC を再呼び出ししない                   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                     | `agentSlice.skill-integration.test.ts`        |
| `references/ui-ux-feature-components.md`                        | 欠損メタデータでもクラッシュしない描画防御（TC-01〜04）                       | `SkillCard.tsx` / `SkillDetailPanel.tsx` / hooks                           | `validate-phase11-screenshot-coverage`（4/4） |
| `references/task-workflow.md` / `references/lessons-learned.md` | 実装内容 + 苦戦箇所 + 検証証跡を同一ターン同期                                | 本仕様更新                                                                 | `verify-unassigned-links` + `audit(current)`  |

#### 検証証跡（2026-03-04）

| コマンド                                                                                                                                  | 結果                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001 --json`                | PASS（13/13, error=0, warning=0）                         |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 --json`                     | PASS（13/13, error=0, warning=0）                         |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 --json`              | PASS（13/13, error=0, warning=0）                         |
| `validate-phase-output <workflow-dir>`（3workflow）                                                                                       | PASS（28項目 x 3）                                        |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` | PASS（expected=4 / covered=4）                            |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                                                          | PASS（currentViolations=0, baselineは既存負債として分離） |

#### Phase 12再確認（ブランチ再監査, 2026-03-04）

| 観点                     | 実行内容                                                                                                                                                                                                                     | 結果                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Phase 12 実行整合        | `verify-all-specs --workflow`（`01/02/03` の3workflow）                                                                                                                                                                      | PASS（13/13 x 3, error=0, warning=0）                      |
| Phase 12 出力整合        | `validate-phase-output <workflow-dir>`（`01/02/03`）                                                                                                                                                                         | PASS（28項目 x 3）                                         |
| 画面証跡（UI workflow）  | `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001`                                                                                    | PASS（expected=4 / covered=4）                             |
| 未タスク参照整合         | `verify-unassigned-links`                                                                                                                                                                                                    | PASS（existing=88, missing=0）                             |
| 未タスク差分判定         | `audit-unassigned-tasks --json --diff-from HEAD`                                                                                                                                                                             | PASS（currentViolations=0, baselineViolations=94）         |
| 未タスク個別フォーマット | `audit-unassigned-tasks --json --target-file ...`（`task-imp-phase12-subagent-artifact-guard-001.md` / `task-imp-phase12-system-spec-extraction-guard-001.md` / `task-imp-phase12-three-workflow-audit-scope-guard-001.md`） | 3件とも `scope.currentFiles` で一致、`currentViolations=0` |

- `docs/30-workflows/completed-tasks/unassigned-task/` 配下の今回対象未タスク3件は、配置先・参照・フォーマットの3点で再確認済み。
- 全体 `baselineViolations=94` は既存負債として分離し、今回差分の合否は `currentViolations=0` で固定した。

#### 追加追補: UI再撮影 preflight 不足（2026-03-04）

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-center-phase11.mjs` 再実行時に preview 起動失敗（`ERR_CONNECTION_REFUSED` / `Rollup failed to resolve import "@repo/shared/types/skill"`）を事前検知できず、再撮影フローが停止した |
| 再発条件   | スクリーンショット再取得前に `preview` build 成否と `127.0.0.1:4173` 疎通を確認しない場合                                                                                                         |
| 対処       | 証跡を 2026-03-04 16:50 JST に再取得して Apple UI/UX 観点で再確認し、運用ギャップは `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` で管理後に完了移管                                              |
| 標準ルール | UI再撮影は「preview preflight（build + 疎通）→撮影→coverage検証→記録」の順で固定する                                                                                                              |

| 追加未タスク                                          | 概要                                                                                                                                  | 参照                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001~~       | ~~SkillCenter Phase 11再撮影の preflight ガード（失敗時の未タスク化/代替証跡記録を標準化）~~ **完了: 2026-03-04（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md` |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 | SkillCenter hotfix 対象カバレッジの include path ガード（実在パス検証 + `3 files / 30 tests` 固定）                                   | `docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md`       |

#### 再追補: Phase 12テンプレート最適化の実装反映（2026-03-04）

| 項目             | 内容                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 今回実装した内容 | `skill-creator` の Phase 12テンプレート2種（`phase12-system-spec-retrospective` / `phase12-spec-sync-subagent`）へ preview preflight（build + `127.0.0.1:4173` 疎通）と失敗時未タスク化分岐を追加し、さらに未タスク配置先判定（未完了=`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` / 完了移管=`docs/30-workflows/completed-tasks/unassigned-task/`）を標準化した |
| 反映対象         | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` / `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md` / `.claude/skills/skill-creator/references/resource-map.md` / `.claude/skills/skill-creator/references/patterns.md`                                                                   |
| 今回苦戦した箇所 | 成功/失敗パターンには preflight 教訓がある一方で、テンプレート本体の完了チェックに同条件が欠け、さらに未タスク参照先が未完了/完了移管で分岐する点が明示されておらず、仕様更新時に転記漏れが起きやすかった                                                                                                                                                |
| 解決策           | 「簡潔手順」「検証コマンド」「完了チェック」を同時更新し、preflight 失敗時は撮影継続せず未タスク化する運用を明文化。加えて `rg` による配置先判定コマンドをテンプレートへ組み込み、参照先ドリフトを抑止した                                                                                                                                               |
| 再利用ルール     | UIタスクは preflight 成否を証跡化し、`task-workflow.md` と `lessons-learned.md` へ同一ターン転記する                                                                                                                                                                                                                                                     |

#### 同種課題の簡潔解決手順（5ステップ）

1. IPC/型/状態/UI の4責務を最初に分離し、仕様書ごとにSubAgent担当を固定する。
2. `skill:import` は `errors.length===0` 判定を契約正本にし、`importedCount` を成功条件から外す。
3. Renderer 側で既存インポート判定を行い、冪等時は IPC 呼び出しをスキップする。
4. UIは `String(value ?? "")` と `Array.isArray` 防御を標準化し、欠損メタデータを許容する。
5. UI再撮影がある場合は preview preflight（build + `127.0.0.1:4173` 疎通）を先に通し、未タスク配置先（未完了/完了移管）を判定した上で `verify` / `validate` / `screenshot-coverage` / `audit(current)` を同一ターンで実行して証跡を固定する。

#### 追補: UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001（2026-03-04）

| 項目     | 内容                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| タスクID | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001                                                                                                                                                    |
| 対象     | workflow02 の Phase 11/12 UI証跡再取得コマンド運用                                                                                                                                                          |
| 実装     | `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` を追加                                                                                                                           |
| 文書同期 | workflow02 の `outputs/phase-11/manual-test-result.md` と `outputs/phase-12/spec-update-summary.md` の実行コマンド表記を `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` に統一 |
| 検証     | `run                                                                                                                                                                                                        | rg screenshot` で露出確認、screenshot再取得、coverage validator PASS（4/4） |

#### 追補検証証跡（2026-03-04）

| コマンド                                                                                                                                                                                     | 結果                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `lsof -nP -iTCP:5174 -sTCP:LISTEN                                                                                                                                                            |                                                               | true`                                                      | WARN（既存プロセス占有あり。`Port 5174 is already in use` を再現） |
| `pnpm --filter @repo/desktop run                                                                                                                                                             | rg screenshot`                                                | PASS（`screenshot:skill-import-idempotency-guard` を検出） |
| `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`                                                                                                                  | PASS（`TC-01..04` + `import-call-diagnostics.json` を再取得） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` | PASS（expected=4 / covered=4）                                |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`                     | PASS（13/13, error=0, warning=0）                             |

#### 追補課題（再確認で判明）

| 項目         | 内容                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 苦戦箇所     | screenshot 再取得は成功しても `Port 5174 is already in use` が混在し、失敗判定との切り分けが人依存になりやすい                                               |
| 対処         | 実行前ポート検査（`lsof`）を証跡へ固定し、競合時の分岐（停止/再利用）を未タスク化                                                                            |
| 関連未タスク | `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001`                                                                                                          |
| 参照         | `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md`                                                                   |
| 苦戦箇所     | `validate-phase11-screenshot-coverage` が PASS でも、`phase-11-manual-test.md` に画面カバレッジマトリクスがなく warning が残り、レビュー観点が人依存になった |
| 対処         | 画面カバレッジマトリクスの必須化（視覚TC/非視覚TC区分 + 期待証跡）を未タスク化し、Phase 11 設計意図を固定する方針へ分離                                      |
| 関連未タスク | `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001`                                                                                                        |
| 参照         | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md`                                                                 |

#### 追補2: UT workflow 証跡正規化（2026-03-04）

| 項目             | 内容                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 今回実装した内容 | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` の `outputs/phase-11/screenshots/` を正規配置し、`manual-test-result.md` の TC-01〜TC-04 をローカル `.png` 参照へ統一。TC-05/06 は `NON_VISUAL:` で明示して coverage validator の判定軸を固定した |
| 苦戦箇所         | 手動テスト結果が workflow02 側の証跡パスのみを参照しており、UT workflow 自体の `outputs/phase-11/screenshots` が空で `validate-phase11-screenshot-coverage` が失敗した                                                                                       |
| 対処             | screenshot を UT workflow 配下へ複製し、証跡表を `screenshots/*.png` 形式へ修正。非視覚TCは `NON_VISUAL:` 記法へ統一して `expected=6 / covered=4`（非視覚2件許容）で PASS を確認                                                                             |
| 標準ルール       | UI証跡は「対象workflow配下の証跡実体」と「TC証跡表記」の両方が揃って初めて完了扱いにする                                                                                                                                                                     |

#### 追補2の検証証跡（2026-03-04）

| コマンド                                                                                                                                                                                               | 結果                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` | PASS（expected=6 / covered=4、非視覚TC2件許容） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 --json`              | PASS（13/13, error=0, warning=0）               |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                    | PASS（total=93, missing=0）                     |

#### 同種課題の簡潔解決手順（4ステップ・証跡配置版）

1. `validate-phase11-screenshot-coverage` を対象workflowで先に実行し、証跡欠落を検知する。
2. `outputs/phase-11/screenshots/` が空なら、再取得または同一証跡を対象workflow配下へ正規配置する。
3. `manual-test-result.md` の視覚TCは `screenshots/*.png` を記載し、非視覚TCは `NON_VISUAL:` を必須化する。
4. `coverage PASS` 後に `task-workflow.md` と `lessons-learned.md` へ同一ターンで転記する。

---

### タスク: TASK-UI-05A-SKILL-EDITOR-VIEW SkillEditorView（ツールエディター）仕様書作成（2026-03-01）

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-05A-SKILL-EDITOR-VIEW                                                                                                 |
| 完了日     | 2026-03-01                                                                                                                    |
| ステータス | **spec_created（再監査済み）**（Phase 1-13 仕様書作成完了。`views/SkillEditorView` は実装ファイル実在、導線/IPC連携は未完了） |
| タスク種別 | UI仕様書作成 + 実装実体再監査（画面検証証跡・未タスク再整理を含む）                                                           |
| Phase      | 仕様書フェーズ完了（index + phase-1..13 + 抽出マトリクス）/ 実体再監査完了                                                    |

#### 反映内容（要点）

- `docs/30-workflows/skill-editor-view/` に TASK-UI-05A のワークフロー仕様（Phase 1-13）を作成。
- `aiworkflow-requirements` 正本へ `spec_created` として同期（`ui-ux-components` / `ui-ux-feature-components` / `task-workflow`）。
- 画面検証はスクリーンショットで実施し、現行 UI（Dashboard / Editor）と未実装ギャップを記録。
- 再監査で `views/SkillEditorView` 実装ファイル実在と 99 テスト PASS を確認し、未タスク台帳を正規配置（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ是正。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                                              | 主担当作業                               | 完了条件                                                       |
| ---------- | ------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| SubAgent-A | `references/ui-ux-components.md`                        | 主要UI一覧と spec_created 台帳追加       | SkillEditorView が「実装ファイル実在・統合未完了」で明記される |
| SubAgent-B | `references/ui-ux-feature-components.md`                | 機能別仕様へ spec_created セクション追加 | 実装ギャップと証跡導線が追跡可能                               |
| SubAgent-C | `references/task-workflow.md`                           | 完了台帳・残課題・履歴の同期             | spec_created 記録と残課題行が一致                              |
| SubAgent-D | `docs/30-workflows/skill-editor-view/outputs/phase-11/` | スクリーンショット検証と手動検証記録     | 画面証跡 + 発見課題が出力済み                                  |

#### 画面検証証跡（2026-03-01）

| 証跡                | パス                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| 現行 Dashboard 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-01-current-dashboard.png`   |
| 現行 Editor 画面    | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-02-current-editor-view.png` |
| 手動検証結果        | `docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md`                        |
| 発見課題            | `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md`                         |

#### 実装ギャップ（次フェーズの論点）

| 観点                         | 現状                             | 根拠                                                                                     |
| ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `views/SkillEditorView` 本体 | 実装ファイルは存在（統合未完了） | `apps/desktop/src/renderer/views/SkillEditorView/` 配下に component/hook/test 一式が存在 |
| ナビゲーション導線           | 未配線                           | `ViewType` / `AppDock` / `App.tsx` に専用遷移なし                                        |
| 既存 EditorView 影響         | なし                             | 現行 Editor は表示可能（画面証跡あり）                                                   |

#### Phase 12仕様準拠の再確認（2026-03-02）

| 観点                               | 実行内容                                                                                                                                     | 結果                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| TASK-UI-05A ワークフロー構造       | `verify-all-specs --workflow docs/30-workflows/skill-editor-view`                                                                            | PASS（13/13, error=0, warning=0）             |
| TASK-UI-05A Phase出力整合          | `validate-phase-output docs/30-workflows/skill-editor-view`                                                                                  | PASS（28項目）                                |
| TASK-UI-05 ワークフロー構造        | `verify-all-specs --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`                                                 | PASS（13/13, error=0, warning=0）             |
| TASK-UI-05 Phase出力整合           | `validate-phase-output docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`                                                       | PASS（28項目）                                |
| Phase 12必須成果物（Task 1/3/4/5） | `implementation-guide.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` 実体確認（2workflow） | すべて存在                                    |
| 実装ガイド2パート要件              | `implementation-guide.md` の `Part 1` / `Part 2` 見出し確認（2workflow）                                                                     | 準拠                                          |
| 未タスクリンク整合                 | `verify-unassigned-links`                                                                                                                    | PASS（92/92, missing=0）                      |
| 未タスク差分監査                   | `audit-unassigned-tasks --json --diff-from HEAD`                                                                                             | `currentViolations=0`（`baseline=75` は既存） |

#### 今回の苦戦箇所と解決策（再利用用）

| 苦戦箇所                                                                               | 再発条件                                         | 解決策                                                                                                                    | 今後の標準ルール                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `phase-12-documentation.md` の完了状態と成果物実体の同期確認がタスク単位で分散しやすい | spec_created系と完了系workflowを同時監査する場合 | 監査対象workflowを先に2本へ固定し、同一ターンで `verify-all-specs` / `validate-phase-output` を対で実行して証跡を一括確定 | Phase 12再確認は「workflow単位ペア検証（構造+出力）」を最初に実行する      |
| 未タスク監査で baseline違反を今回起因と誤認しやすい                                    | repo全体に既存違反が多い状態で差分監査する場合   | 合否を `currentViolations` のみに固定し、baselineは監視値として記録                                                       | 未タスク監査の判定は「`current=0` 合格、baselineは改善 backlog」に統一する |

#### 同種課題の簡潔解決手順（4ステップ）

1. 監査対象workflowを明示（spec_created系/完了系）し、`verify-all-specs` を先に2本実行する。
2. `validate-phase-output` を同じ2workflowに実行し、Phase 12の必須成果物実体（Task 1/3/4/5）を手動突合する。
3. 未タスクは `verify-unassigned-links` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合格基準にする。
4. 実装内容と苦戦箇所を `task-workflow.md` / `lessons-learned.md` に同一ターン転記して終了する。

---

### タスク: TASK-UI-02-GLOBAL-NAV-CORE グローバルナビゲーション基盤（2026-03-06）

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-02-GLOBAL-NAV-CORE                                                            |
| 完了日     | 2026-03-06                                                                            |
| ステータス | **completed（Step 1/2 実装・テスト・画面検証完了、Step 3 は readiness 記録済み）**    |
| タスク種別 | UI基盤実装（GlobalNavStrip / MobileNavBar / AppLayout / Shortcut / State / Rollback） |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                                                    |

#### 反映内容（要点）

- `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` に Phase 1〜12 の成果物を出力。
- `GlobalNavStrip` / `MobileNavBar` / `MoreMenu` / `AppLayout` / `ComingSoonView` / `useNavShortcuts` を実装。
- `navigation/navContract.ts` に `mobileLabel` を追加し、mobile 下部バーの表示ラベルとアクセシビリティ名を分離した。
- `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` を追加し、store hook を個別 selector 化。
- `App.tsx` に `VITE_USE_GLOBAL_NAV_STRIP` 分岐を追加し、rollback path を保持した。
- `phase-1..11` 本文仕様書に残っていた `pending` / 未チェック完了条件 / `実行タスク結果=pending` を completed 実態へ同期した。

#### 仕様書別 SubAgent 分担

| SubAgent   | 担当仕様書                                    | 主担当作業                 | 完了条件                                    |
| ---------- | --------------------------------------------- | -------------------------- | ------------------------------------------- |
| SubAgent-A | `phase-1..4` / `phase-10`                     | 要件・設計・Gate 統合      | Step 1/2 の Go/No-Go を明文化               |
| SubAgent-B | `ui-ux-navigation.md` / `ui-ux-components.md` | UI実装と正本同期           | Global Navigation の正式構成が反映される    |
| SubAgent-C | `arch-state-management.md` / Phase 6〜9       | state/coverage/QA          | task scope coverage と P31 境界が確認できる |
| SubAgent-D | Phase 11/12 / `lessons-learned.md`            | screenshot・教訓・文書同期 | 画面証跡と再利用手順が残る                  |

#### 検証証跡

| 観点                 | 実行内容                                                      | 結果                                                                                                                   |
| -------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- |
| targeted tests       | `pnpm --dir apps/desktop test:run ...7 files...`              | PASS（100 tests）                                                                                                      |
| typecheck            | `pnpm --dir apps/desktop typecheck`                           | PASS                                                                                                                   |
| coverage             | `pnpm --dir apps/desktop test:coverage ...` + task scope 抽出 | PASS（min branch 79.17%）                                                                                              |
| screenshot review    | `outputs/phase-11/screenshots/TC-11-01..04`                   | PASS                                                                                                                   |
| preflight            | build + preview + `curl` + `lsof`                             | PASS                                                                                                                   |
| screenshot coverage  | `validate-phase11-screenshot-coverage`                        | PASS                                                                                                                   |
| workflow spec        | `verify-all-specs` / `validate-phase-output`                  | PASS（13/13, 28項目）                                                                                                  |
| workflow stale guard | `rg -n 'ステータス\\s\*\\                                     | \\s*pending' docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-{1,2,3,4,5,6,7,8,9,10,11,12}-*.md` | PASS（0件） |
| unassigned audit     | `verify-unassigned-links` / `audit --diff-from HEAD`          | PASS（103/103, current=0, baseline=93）                                                                                |

#### 苦戦箇所と解決策

| 苦戦箇所                                                                                                              | 解決策                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| rollback path を残すと責務が `App.tsx` に戻りやすい                                                                   | `AppLayout` / nav / hook / slice を分離した                                                    |
| repo-wide coverage fail が task scope 品質 fail に見える                                                              | `coverage-final.json` 抽出値を正本化した                                                       |
| mobile overlay の品質が自動テストだけでは見えない                                                                     | Phase 11 screenshot と Apple HIG レビューを追加した                                            |
| mobile tab bar の正式ラベルが小画面で切れやすい                                                                       | `mobileLabel` で表示名を短縮し、`aria-label` は正式名称を維持した                              |
| Phase 12 完了後も `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` がズレやすい | 4ファイルを同一ターンで同期し、`generate-index.js --workflow ... --regenerate` を標準化した    |
| `artifacts.json` / `index.md` は完了でも workflow 本文 `phase-1..11` が `pending` のまま残りやすい                    | completed 扱いの Phase 本文は `ステータス` / 完了条件 / 実行タスク結果まで同一ターンで同期した |

#### 関連未タスク（2026-03-06 追補）

| 未タスクID                                   | 概要                                                                             | 優先度 | 仕様書                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | UIタスクの Phase 12 で「基本6仕様書 + domain UI spec」まで同期対象を広げるガード | 中     | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | `artifacts/index` 完了後も workflow 本文に残る `pending` を検出する同期ガード    | 中     | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

---

### タスク: TASK-UI-05-SKILL-CENTER-VIEW SkillCenterView（ツールを探す）実装（2026-03-01）

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-UI-05-SKILL-CENTER-VIEW                                            |
| 完了日     | 2026-03-01                                                              |
| ステータス | **完了**                                                                |
| タスク種別 | UI機能実装（Renderer View / Hooks / Components / Tests / Phase 12同期） |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                                      |

#### 反映内容（要点）

- `SkillCenterView` を新規追加（検索、カテゴリ切替、おすすめ、カードグリッド、詳細パネル）。
- `useSkillCenter` / `useFeaturedSkills` の2 Hookで状態・推薦ロジックを分離。
- コンポーネント実装 7ファイル、Hook 実装 2ファイル、テスト 10ファイル（132テストケース）を整備。
- IPC契約は既存チャネル（`skill:list`, `skill:import`, `skill:remove`）を再利用し、新規チャネル追加なし。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                                                                | 主担当作業                                 | 完了条件                                   |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| SubAgent-A | `references/ui-ux-components.md`                                          | 主要UI一覧・完了タスク・関連導線の同期     | TASK-UI-05 が UI正本へ登録済み             |
| SubAgent-B | `references/ui-ux-feature-components.md`                                  | SkillCenterView 仕様セクション追加         | コンポーネント/状態/IPC/未タスクが追跡可能 |
| SubAgent-C | `references/arch-ui-components.md`, `references/arch-state-management.md` | Viewアーキテクチャと状態管理パターンの同期 | レイヤー・データフロー・Store境界が整合    |
| SubAgent-D | `references/task-workflow.md`                                             | 完了台帳・残課題・変更履歴の同期           | 完了記録と未タスク7件が同一ターンで反映    |

#### Phase 12で検出した未タスク

| 未タスクID   | 概要                                      | 優先度 | 仕様書                                                                                                                                   |
| ------------ | ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一         | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離       | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md`         |
| UT-UI-05-003 | ローディングスケルトン実装                | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md`           |
| UT-UI-05-004 | モバイルスワイプ閉じ実装                  | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md`           |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング       | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md`             |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善    | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md`     |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md`                |

#### 検証証跡（2026-03-02）

| コマンド                                                                                                                                                      | 結果                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --json` | PASS（13/13, error=0, warning=0）                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`              | PASS（28項目, error=0, warning=0）                      |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                           | ALL_LINKS_EXIST                                         |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                    | currentViolations=0（baselineViolations=71 は既存課題） |

#### 追補（2026-03-04）: 削除ボタン不具合ホットフィックス

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 不具合     | SkillCenter 詳細パネルで「ツールを削除」を押下しても削除されない                                                                   |
| 原因       | `useSkillCenter.handleRequestDelete` は動作していたが、`isDeleteConfirmOpen` を描画する確認ダイアログが `SkillCenterView` に未実装 |
| 修正内容   | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`handleConfirmDelete` / `handleCancelDelete` / `Escape` キー導線を接続   |
| 追加テスト | `SkillCenterView.delete-confirm.test.tsx` を追加（表示/確認/キャンセル）                                                           |
| 再検証     | `vitest run`（3 files / 30 tests）PASS、対象範囲カバレッジ `Stmts/Lines 86.89`, `Branch 84.61`, `Functions 88.88`（全指標80%以上） |

#### 苦戦箇所と解決策（再利用用）

| 苦戦箇所                                                                   | 再発条件                                                        | 原因                                                                                 | 解決策                                                                                                                                       | 今後の標準ルール                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `CategoryId` と `SkillCategory` の型境界が分散し、カテゴリ比較が揺れやすい | View/Hook/テストでカテゴリ型を個別定義した場合                  | ID層（表示順や "all" を含む）とドメイン層（実Skillカテゴリ）が同じ意味として扱われた | 未タスク `UT-UI-05-001` として分離し、現行は `categoryOrderMap` と `all` 特例を明文化して回帰テストを固定した                                | UIカテゴリ系は「表示ID層」と「ドメインカテゴリ層」を分離し、変換点を1箇所に集約する |
| `SkillDetailPanel` に責務が集中し、表示改善を同時投入しづらい              | 詳細表示（説明・操作・メタ表示）を1コンポーネントで拡張した場合 | Molecule単位の分離前に機能優先で実装し、拡張余地を後段に回した                       | `UT-UI-05-002` として分離し、Phase 12で責務境界を先に未タスク化して追跡可能にした                                                            | 大型UIは「完了時に未タスク化して責務分離」を必須運用にする                          |
| Phase 12で成果物実体・台帳・チェックリストの同期がズレやすい               | `outputs/phase-12` 生成と仕様書更新を別ターンで進める場合       | 実装記録（workflow）と教訓記録（lessons）の同時更新ルールが曖昧だった                | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を同一ターンで再実行し、証跡値を固定した | Phase 12 は「成果物実体 + 台帳 + 苦戦箇所」の同時更新を完了条件にする               |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` で Phase 12 の前提整合を先に固定する。
2. `task-workflow.md` に実装要点・未タスク・検証証跡を先に記録し、参照IDを固定する。
3. `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ未タスク指示書を配置し、`audit-unassigned-tasks --target-file` で各ファイル形式を確認する。
4. `verify-unassigned-links` と `audit --diff-from HEAD` を実行し、`currentViolations=0` を合否基準にする。
5. 同一ターンで `lessons-learned.md` に苦戦箇所を転記し、再発条件と標準ルールをペアで残す。

---

