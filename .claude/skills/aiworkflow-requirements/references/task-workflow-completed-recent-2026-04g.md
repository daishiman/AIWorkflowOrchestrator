# 完了タスク記録 — 2026-04-15

# 完了タスク記録 — 2026-04-15

# 完了タスク台帳 — 2026-04 (g)

# 完了タスク記録 — 2026-04-15

# 完了タスク記録 — 2026-04-14

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応（2026-04-15）

| 項目       | 値                                                                                     |
| ---------- | -------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001                                               |
| 完了日     | 2026-04-15                                                                             |
| タスク種別 | implementation（NON_VISUAL / renderer-local helper / multi-tool parallel integration） |
| 関連Issue  | [#2069](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2069)（CLOSED）     |
| Phase 13   | blocked（ユーザー承認待ち）                                                            |

#### 実施内容

- `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts` を新規追加し、Slack / GitHub / Notion の統合情報取得ロジックを `SkillCreateWizard.tsx` から独立化した
- `SkillCreateWizard.tsx` の `resolveExternalIntegration()` を `string[]` 受け取りに変更し、`Promise.all` で複数ツールを並列処理・`mergeIntegrations()` で結果を統合するようにした
- `ConversationRoundStep.tsx` から `MAIN_TOOL_BADGE_ENABLED` / `shouldShowMainToolBadge` / aria-describedby 付きバッジ JSX を削除した
- `ConversationRoundStep.test.tsx` からバッジ関連テストを削除し、`resolveExternalIntegration.test.ts` を追加した（TC-1〜TC-12 + mergeIntegrations TC-12/13: 合計 14 テスト全 PASS）
- `answers.q5.selectedOptions` が Step 0 直後に空になり得るため `smartDefaults.tool` を fallback 候補とする renderer-local ルールを `system-spec-update-summary.md` に明記した
- Phase 12 必須 6 成果物を `outputs/phase-12/` に作成し、`artifacts.json` / `outputs/artifacts.json` parity を確認した

#### Phase 11/12 成果物

| 成果物                              | パス                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| Q5 single select スクリーンショット | `outputs/phase-11/screenshots/q5-single-select-no-badge.png` |
| Q5 multi select スクリーンショット  | `outputs/phase-11/screenshots/q5-multi-select-no-badge.png`  |
| 手動テスト結果                      | `outputs/phase-11/manual-test-result.md`                     |
| 実装ガイド                          | `outputs/phase-12/implementation-guide.md`                   |
| システム仕様書更新サマリー          | `outputs/phase-12/system-spec-update-summary.md`             |
| ドキュメント更新履歴                | `outputs/phase-12/documentation-changelog.md`                |
| 未タスク検出レポート                | `outputs/phase-12/unassigned-task-detection.md`              |
| スキルフィードバックレポート        | `outputs/phase-12/skill-feedback-report.md`                  |
| Phase 12 準拠チェック               | `outputs/phase-12/phase12-task-spec-compliance-check.md`     |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts`: PASS（14 tests）
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`: PASS（回帰維持）
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop lint`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS（NON_VISUAL / screenshot は Phase-11 PNG 2 枚を証跡として扱う）

#### 苦戦箇所

| #   | 苦戦箇所                                                              | 解決策                                                                                        |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | `Promise.all` 内で個別ツールが失敗したとき全件失敗になりやすい        | `allSettled` 相当の try/catch を各 `map` 内に入れ、成功分のみ `mergeIntegrations` へ渡した    |
| 2   | 空白・大小文字混在のツール名正規化と canonical label マッピングが複雑 | `trim` + `Set` で重複除去、既知ツール名は `CANONICAL_LABEL_MAP` で正規化する 2 段階処理にした |
| 3   | `mergeIntegrations` の重複排除を `Set` で行うと型推論が崩れる         | `[...new Set(arr)]` で型を保ったまま重複除去できることを確認した                              |

#### lessons-learned

- `Promise.all` に全件失敗リスクがある場合は、map 内で try/catch して `null` を返し、後段で `filter(Boolean)` するパターンが堅牢
- 正規化は「表示」と「検索」で分離する：canonical label は表示用、lowercase 比較は lookup 用
- helper を独立ファイルに切り出すと `vi.mock` が簡潔になり、テストの見通しが大幅に改善する

---

### タスク: TASK-SW-FIX-FEEDBACK-008 fetchSkills() 非ブロッキック化（follow-up）（2026-04-15）

### タスク: TASK-SC-IMP-CREATE-WORKFLOW-001 createモード構造計画生成（2026-04-15）

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001                       |
| 完了日     | 2026-04-15                                            |
| タスク種別 | implementation（NON_VISUAL / skill-creator workflow） |
| 関連Issue  | -                                                     |
| Phase 13   | blocked（ユーザー承認待ち）                           |

#### 実施内容

- `SkillCreatorService.ts` の `runCreateWorkflow` を `Promise<StructurePlanJson | null>` に変更し、`extract-purpose` / `plan-structure` を読み込んで構造計画を組み立てるようにした
- `createSkill()` では `structurePlan` を local variable として受け取り、hidden property を使わない handoff に整理した
- `SkillCreatorService.test.ts` の `TC-04` を更新し、`runCreateWorkflow` の戻り値に `description` が入ることを直接検証するようにした
- `outputs/phase-12/` の 6 成果物を current facts として固定し、`outputs/artifacts.json` を追加して root と parity を揃えた

#### Phase 11/12 成果物

| 成果物                       | パス                                                     |
| ---------------------------- | -------------------------------------------------------- |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                 |
| 手動テストチェックリスト     | `outputs/phase-11/manual-test-checklist.md`              |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| システム仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md`         |
| 変更履歴                     | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| parity copy                  | `outputs/artifacts.json`                                 |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`: PASS（63 tests）
- `outputs/phase-11/manual-test-result.md`: PASS（UI/UX変更なしのため screenshot N/A）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS

#### 苦戦箇所

| #   | 苦戦箇所                                          | 解決策                                                                   |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `description` の edge case が型契約と衝突しやすい | 型上必須の `string` として整理し、`undefined` は入力破損として切り分けた |
| 2   | 接続待ちと完了を同じ文脈で書くと誤読されやすい    | `generate_skill_md.js` 接続はタスクA、構造計画生成は本タスクと分離した   |

#### lessons-learned

- Phase 12 は「できたこと」と「依存待ち」を同じファイルで混ぜずに書くとレビューしやすい
- `runCreateWorkflow` の観測可能性は、private method を直接検証すると高まる
- screenshot N/A は UI 変更なしのときだけでなく、根拠を `manual-test-result.md` に固定しておくと運用しやすい

### タスク: TASK-SW-FIX-STATE-DETAIL-001 GenerateStep template cancel / answers reset / generationLockRef release（2026-04-14）

### 修正問題

### タスク: TASK-SW-FIX-FEEDBACK-008 fetchSkills() 非ブロッキング化（follow-up）（2026-04-15）

### タスク: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 notion-freetext-special-case-eliminate（2026-04-15）

| 項目       | 値                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                                                                                                       |
| ステータス | **完了（実装 + Phase 12 仕様同期 / Phase 13 blocked）**                                                                        |
| タイプ     | bug-fix / error-handling / non-blocking / follow-up                                                                            |
| 優先度     | 中                                                                                                                             |
| 完了日     | 2026-04-15                                                                                                                     |
| 親タスク   | TASK-SW-FIX-FEEDBACK-001（Wave B 完了済み）                                                                                    |
| 対象       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` / `__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| 成果物     | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/outputs/phase-12/`                                                                 |
| Issue      | #2176（CLOSED）                                                                                                                |
| PR         | #2179（マージ済み）/ Phase 13 blocked（仕様書状態）                                                                            |
| 項目       | 値                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------                                     |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                                                              |
| 完了日     | 2026-04-15                                                                                                                     |
| タスク種別 | implementation（NON_VISUAL / semantic-default special-case elimination）                                                       |
| 関連Issue  | [#2089](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2089)                                                       |
| Phase 13   | blocked（ユーザー承認待ち）                                                                                                    |

#### 実施内容

- `SkillLifecyclePanel.tsx` に `refreshSkillsInBackground` helper を追加し、`fetchSkills()` の失敗を `console.warn` に閉じ込め `setGenerationError` へ昇格させないようにした
- `processWorkflowOutcome` / `handleExecutePlan` 両方の `fetchSkills()` try-catch ブロックを `refreshSkillsInBackground()` 呼び出しに置き換え、選択処理（`selectSkillByName` / `loadVerifyDetail`）が `fetchSkills` 失敗の影響を受けなくなった
- `workflowSnapshot` を監視する effect を追加し、`executePlan` ack 後に遅れて到着した snapshot に対しても `processWorkflowOutcome` を再適用するようにした（`processedWorkflowOutcomePlanIdRef` で冪等ガード）
- `SkillLifecyclePanel.llm-generation.test.tsx` に U-8 / U-NEW-1 / U-NEW-2 / U-NEW-3 / U-NEW-5 / U-NEW-6 の回帰テストを追加・更新した（合計 42 tests）
- `packages/shared/src/types/skill-wizard-label-map.ts` に `SemanticLabelEntry` / `SemanticLabelResult` / `resolveLabelEntry()` を追加し、semantic default の変換を shared 側へ集約した
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` から `notion` 専用のハードコード特別ケースを削除した
- `resolveLabelEntry()` のフォールバックで raw 値の表記を保持するように修正し、`Jira` / `Markdown` / `JSON` の原表記が壊れないようにした
- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts` を拡張し、`notion` / `Jira` / `Markdown` の回帰を固定した
- `outputs/phase-11/manual-test-result.md` と `outputs/phase-12/*.md` を current facts に合わせて作成・更新した

#### 検証証跡

#### Phase 11/12 成果物

| コマンド                                                                                      | 結果                                                                 |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                       | PASS（エラー 0）                                                     |
| `pnpm --filter @repo/desktop lint`                                                            | PASS（エラー 0、warnings 8件は既存箇所）                             |
| `pnpm --filter @repo/desktop exec vitest run .../SkillLifecyclePanel.llm-generation.test.tsx` | PASS（42 tests \| 13 skipped）                                       |
| `outputs/phase-11/manual-test-result.md`                                                      | NON_VISUAL PASS（手動テスト + metadata）                             |
| 成果物                                                                                        | パス                                                                 |
| ---------------------------------------                                                       | -------------------------------------------------------------------- |
| 手動テスト結果                                                                                | `outputs/phase-11/manual-test-result.md`                             |
| 手動テストレポート                                                                            | `outputs/phase-11/manual-test-report.md`                             |
| 実装ガイド                                                                                    | `outputs/phase-12/implementation-guide.md`                           |
| システム仕様更新サマリー                                                                      | `outputs/phase-12/system-spec-update-summary.md`                     |
| ドキュメント更新履歴                                                                          | `outputs/phase-12/documentation-changelog.md`                        |
| 未タスク検出レポート                                                                          | `outputs/phase-12/unassigned-task-detection.md`                      |
| スキルフィードバックレポート                                                                  | `outputs/phase-12/skill-feedback-report.md`                          |
| Phase 12 準拠チェック                                                                         | `outputs/phase-12/phase12-task-spec-compliance-check.md`             |

#### 苦戦箇所

#### 検証証跡

| 苦戦箇所                                                          | 解決策                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `fetchSkills().catch()` は `no-floating-promises` に抵触しないか  | `.catch()` チェーンで rejection をキャッチするため floating promise にならない。Phase 3 設計レビューで確認済み |
| `handleExecutePlan` の outer catch と non-blocking 化の干渉       | `refreshSkillsInBackground` で内部 catch するため outer catch への再伝播は起きない                             |
| `workflowSnapshot` 遅延再処理と `processWorkflowOutcome` の冪等性 | `processedWorkflowOutcomePlanIdRef.current === workflowSnapshot.planId` ガードで二重処理を防止した             |
| Phase 11 が NON_VISUAL で証跡をどう閉じるか                       | `manual-test-result.md` + `phase11-capture-metadata.json` を正本証跡として扱う方針を事前確立した               |

- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts`: PASS（16 tests）
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --maxWorkers 1`: PASS（93 tests）
- `pnpm --filter @repo/shared typecheck`: PASS
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/shared build`: PASS
- `pnpm --filter @repo/desktop build`: PASS
- `grep -n "normalizedKey.*notion\\|notion.*その他\\|特別ケース" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`: 出力なし

#### lessons-learned

#### 苦戦箇所

- `fetchSkills` のような補助的な非同期処理は `fire-and-forget + console.warn` パターンで主処理と切り離す
- 遅延 snapshot 再処理は `useEffect` + ref ガード（`processedWorkflowOutcomePlanIdRef`）で冪等に実現できる
- NON_VISUAL タスクでは `manual-test-result.md` + `phase11-capture-metadata.json` を正本証跡とし、スクリーンショット不要の判断をタスク開始前に明示する
- 詳細: `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/outputs/phase-12/implementation-guide.md`
- raw 値を正規化した後の fallback で小文字化してしまうと、`Jira` / `Markdown` / `JSON` の元表記が壊れる
- `resolveLabelEntry()` を shared に寄せたあとも、renderer 側の special case を残してしまうと source of truth が二重化する

#### lessons-learned

- `SemanticLabelEntry` のような union で「表示ラベル + 補足情報」を同時に持たせると、special case を shared に閉じやすい
- raw 値の fallback は原表記を優先し、正規化は lookup のためだけに使う
- 互換 wrapper を残すと、既存契約を壊さずに内部実装だけを改善できる

### タスク: TASK-SW-FIX-STATE-DETAIL-001 GenerateStep template cancel / answers reset / generationLockRef release（2026-04-14）

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-SW-FIX-STATE-DETAIL-001                     |
| 完了日     | 2026-04-14                                       |
| タスク種別 | implementation（VISUAL / state-detail recovery） |
| 関連Issue  | -                                                |
| Phase 13   | blocked（ユーザー承認待ち）                      |

#### 実施内容

- `SkillCreateWizard.tsx` の `catch` に stale guard を追加し、キャンセル後の遅延 reject が error を再表示しないようにした
- `SkillCreateWizard.tsx` の `finally` で `generationLockRef` を必ず解放するようにした
- `GenerateStep.tsx` に template mode recovery を接続し、`最初からやり直す` を template error 専用導線として固定した
- `ConversationRoundStep.tsx` で `answers` prop 変更時に `internalAnswers` を再初期化し、Step 1 の local state を親 state に再同期した
- `outputs/phase-11/` に screenshot bundle と metadata を保存し、template error cancel / step0 return / normal error no cancel の 3 状態を visual evidence として閉じた
- `outputs/phase-12/` の implementation guide / system-spec / changelog / unassigned-task / skill-feedback / compliance を current facts に同期した

#### Phase 11/12 成果物

| 成果物                                 | パス                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| スクリーンショット計画                 | `outputs/phase-11/screenshot-plan.json`                                                |
| キャプチャメタデータ                   | `outputs/phase-11/phase11-capture-metadata.json`                                       |
| 画面証跡 1                             | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png`  |
| 画面証跡 2                             | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png`   |
| 画面証跡 3                             | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png` |
| 手動テスト結果                         | `outputs/phase-11/manual-test-result.md`                                               |
| 手動テストレポート                     | `outputs/phase-11/manual-test-report.md`                                               |
| 発見事項記録                           | `outputs/phase-11/discovered-issues.md`                                                |
| UI サニティレビュー                    | `outputs/phase-11/ui-sanity-visual-review.md`                                          |
| スクリーンショットカバレッジ           | `outputs/phase-11/screenshot-coverage.md`                                              |
| 実装ガイド                             | `outputs/phase-12/implementation-guide.md`                                             |
| システム仕様書更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`                                       |
| 変更履歴                               | `outputs/phase-12/documentation-changelog.md`                                          |
| 未タスク検出レポート                   | `outputs/phase-12/unassigned-task-detection.md`                                        |
| スキルフィードバックレポート           | `outputs/phase-12/skill-feedback-report.md`                                            |
| Phase 12 準拠チェック（root evidence） | `outputs/phase-12/phase12-task-spec-compliance-check.md`                               |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx --maxWorkers 1`: PASS（172 tests）
- `node apps/desktop/scripts/capture-task-sw-fix-state-detail-phase11.mjs`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png`: PASS
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS

#### 苦戦箇所

| #   | 苦戦箇所                                            | 解決策                                                                    |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | キャンセル後の遅延 reject が error 表示を復活させる | `catch` 側に stale guard を入れ、`finally` で lock 解除を確実にした       |
| 2   | template 失敗時の復帰導線が曖昧になりやすい         | `mode="template"` のときだけ `最初からやり直す` を出すように固定した      |
| 3   | `answers` の local state が親 state とずれる        | `ConversationRoundStep` で prop 変更時に `internalAnswers` を再初期化した |

#### lessons-learned

- 生成キャンセル後の UI は「エラーを消す」だけでなく「古い結果を再表示しない」ことまで含めて設計する
- template recovery は通常 error と分け、`retry` と `start over` の意味を UI で明確に分離する
- Step 1 の local state は親 state の再同期点を持たせると、再開・戻る・再生成の 3 経路で破綻しにくい
- `null` → 空配列への移行は null チェックを一掃する機会として活用する（L-UI-001）
- 複数選択トグルは `includes/filter` の 1 パターンで境界値まで処理できる（L-UI-002）
- ProgressBar の初期値は `Math.max(1, count)` で最小表示を保証する（L-UI-003）
- CSS変数統一は subpath export に閉じ、ルート barrel への影響を最小化する（L-UI-004）
- 詳細: `lessons-learned-current-2026-04.md`（L-UI-001〜004）
| #   | 苦戦箇所                                               | 解決策                                                                 |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | キャンセル後の遅延 reject が error 表示を復活させる    | `catch` 側に stale guard を入れ、`finally` で lock 解除を確実にした     |
| 2   | template 失敗時の復帰導線が曖昧になりやすい            | `mode="template"` のときだけ `最初からやり直す` を出すように固定した   |
| 3   | `answers` の local state が親 state とずれる            | `ConversationRoundStep` で prop 変更時に `internalAnswers` を再初期化した |

#### lessons-learned

- 生成キャンセル後の UI は「エラーを消す」だけでなく「古い結果を再表示しない」ことまで含めて設計する
- template recovery は通常 error と分け、`retry` と `start over` の意味を UI で明確に分離する
- Step 1 の local state は親 state の再同期点を持たせると、再開・戻る・再生成の 3 経路で破綻しにくい

---

### タスク: TASK-CI-FUTURE-002 test-web シャード化（2026-04-15）

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-CI-FUTURE-002                                                    |
| 完了日     | 2026-04-15                                                            |
| タスク種別 | docs-only（CI 設定変更 + 仕様書整備）                                 |
| 関連Issue  | #2168                                                                 |
| Phase 13   | blocked（ユーザー承認待ち）                                           |
| 親タスク   | TASK-CI-OPT-001（#2174）                                              |

#### 実施内容

- `.github/workflows/ci.yml` の `test-web` ジョブへ `strategy.matrix.shard` を追加し、シャード 2 並列を実現した
- `test-desktop` のシャード数を 17 → 15 に削減し、GitHub Free Tier 上限 20 に収まるよう調整した
- `apps/backend/vitest.config.ts` の修正不要を確認（`--shard` オプションのみで対応）
- `docs/30-workflows/task-ci-future-002-test-web-sharding/` に Phase 1〜12 の全成果物を作成
- `outputs/phase-12/` の implementation guide（2 パート構成）/ system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check を完備

#### Phase 11/12 成果物

| 成果物                             | パス                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| 実装ガイド（中学生向け + 技術者向け） | `outputs/phase-12/implementation-guide.md`                                 |
| システム仕様書更新サマリー         | `outputs/phase-12/system-spec-update-summary.md`                              |
| ドキュメント更新履歴               | `outputs/phase-12/documentation-changelog.md`                                 |
| 未タスク検出レポート               | `outputs/phase-12/unassigned-task-detection.md`                               |
| スキルフィードバックレポート       | `outputs/phase-12/skill-feedback-report.md`                                   |
| Phase 12 準拠チェック              | `outputs/phase-12/phase12-task-spec-compliance-check.md`                      |
| 手動テスト結果                     | `outputs/phase-11/manual-test-result.md`                                      |

#### 検証証跡

- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS（Phase 1〜12 全完了）
- `artifacts.json` Phase 12 status: `completed`
- `index.md` Phase 1〜12 再生成: PASS
- API / IPC 契約更新: N/A（CI 設定のみの変更）

#### 苦戦箇所

| #   | 苦戦箇所                                                               | 解決策                                                                     |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `apps/web` と `apps/backend` のパッケージ名乖離（仕様書と実体の差）   | Phase 1 P50 チェックで `apps/backend` が実体であると確認し設計を修正       |
| 2   | GitHub Free Tier 並列上限 20 内での最適シャード数算出                  | `既存ジョブ並列数（18）+ 追加分（2）= 20` で計算根拠をコメントに明記      |
| 3   | test-desktop 削減（17 → 15）と test-web 追加（+2）のバランス調整       | desktop-shard-impact.md で影響評価後、削減幅 2 がリスク最小と判断          |

#### lessons-learned

- `apps/web` というディレクトリ名でも実体パッケージが `@repo/backend` の場合がある。P50 チェックで必ず実体確認
- GitHub Free Tier 上限に近いジョブ追加は「削減 + 追加」で合計を固定する方針が安全
- CI 設定変更は API / IPC 契約に触れないため、system spec 更新は N/A 確認のみでよい
