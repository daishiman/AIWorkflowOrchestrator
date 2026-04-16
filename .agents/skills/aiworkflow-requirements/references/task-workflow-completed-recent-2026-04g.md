# 完了タスク台帳 — 2026-04 (g)
# 完了タスク記録 — 2026-04-15
# 完了タスク記録 — 2026-04-15
# 完了タスク記録 — 2026-04-15
# 完了タスク台帳 — 2026-04 (g)
# 完了タスク記録 — 2026-04-15
# 完了タスク記録 — 2026-04-14

## TASK-CI-FUTURE-007: @repo/backend Codecov カバレッジアップロード対応（2026-04-16）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-CI-FUTURE-007                                                                                        |
| ステータス | **完了（phase12_completed / NON_VISUAL / Phase 13 blocked）**                                            |
| タイプ     | docs-only / CI 改善 / ledger-sync                                                                         |
| 優先度     | 低                                                                                                        |
| 完了日     | 2026-04-16                                                                                                |
| 対象       | `docs/30-workflows/task-ci-future-007-backend-codecov-upload/` / `task-workflow.md` / `task-workflow-completed.md` / `LOGS.md` / `indexes/topic-map.md` / `indexes/keywords.json` |
| 成果物     | `outputs/phase-11/manual-test-result.md` / `outputs/artifacts.json` / `task-workflow-completed-recent-2026-04g.md` |

#### 実施内容

- `task-workflow.md` の current facts に `TASK-CI-FUTURE-007` の close-out を追加し、`phase12_completed` / `phase 11 non-visual` / `backend codecov flag` / `artifacts parity` / `outputs/artifacts.json sync` を反映した
- `task-workflow-completed.md` / `task-workflow-completed-recent-2026-04g.md` に completed record を追加した
- `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` を 2026-04-16 同波で更新し、`.agents` mirror も同期した
- `indexes/topic-map.md` と `indexes/keywords.json` を再生成した

#### 検証証跡

- `task-workflow.md` current facts: `TASK-CI-FUTURE-007` / `phase12_completed` / `phase 11 non-visual` / `backend codecov flag` / `artifacts parity` / `outputs/artifacts.json sync`
- `task-workflow-completed.md` / `task-workflow-completed-recent-2026-04g.md`: 完了記録追加
- `task-specification-creator/LOGS.md` / `aiworkflow-requirements/LOGS.md`: 2026-04-16 同期
- `indexes/topic-map.md` / `indexes/keywords.json`: regenerate PASS

#### lessons-learned

- ledger と index は task-workflow 本文と同波で更新すると、current facts の齟齬を早く潰せる
- NON_VISUAL の CI タスクでも、phase 11 の証跡型と backend codecov flag のような確認観点を文言化すると再監査しやすい
- `outputs/artifacts.json sync` を明記すると、root と outputs の parity をレビューで追いやすい

## TASK-SW-FIX-UI-001: UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar修正）

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SW-FIX-UI-001                                                                                                          |
| ステータス | **完了（docs-only / Phase 12 close-out）**                                                                                  |
| タイプ     | bug-fix / UI整合性 / type-migration                                                                                         |
| 優先度     | 中                                                                                                                          |
| 完了日     | 2026-04-14                                                                                                                  |
| Wave       | C（WC-par-03b-fix-ui）                                                                                                      |
| 対象       | `packages/shared/src/types/skillCreator.ts` / `wizard/SkillInfoStep.tsx` / `wizard/ConversationRoundStep.tsx` / `SkillCreateWizard.tsx` |
| 成果物     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/outputs/phase-12/`                                            |

### 修正問題
### タスク: TASK-SW-FIX-FEEDBACK-008 fetchSkills() 非ブロッキング化（follow-up）（2026-04-15）
### タスク: TASK-SW-FIX-FEEDBACK-008 fetchSkills() 非ブロッキング化（follow-up）（2026-04-15）
### タスク: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 runCreateWorkflow戻り値をgenerateSkillMdへ接続（2026-04-16）

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001                |
| 完了日     | 2026-04-16                                                |
| タスク種別 | implementation（NON_VISUAL / skill-creator service）      |
| 関連Issue  | -                                                         |
| Phase 13   | blocked（ユーザー承認待ち）                               |

#### 実施内容

- `SkillCreatorService.ts` に `generateSkillMd()` プライベートメソッドを追加し、`runCreateWorkflow()` が返す `StructurePlanJson` を `generate_skill_md.js --plan` に渡してSKILL.mdを生成するようにした
- `createSkill()` で `structurePlan` を local variable として受け取り、`init_skill.js` 完了後に `generateSkillMd()` を呼ぶ順序を確立した
- `structurePlan` が null の場合は `ensureSkillMdExists` にフォールバックするレジリエンスパターンを実装した
- `SkillCreatorService.test.ts` に 12 件のテストを追加し合計82件全PASS

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts`: PASS（82 tests）
- `pnpm --filter @repo/desktop typecheck`: PASS
- Phase 12 PASS（system spec no-op）

#### 苦戦箇所

| #   | 苦戦箇所                                          | 解決策                                                        |
| --- | ------------------------------------------------- | ------------------------------------------------------------- |
| 1   | tmp file パスとSKILL.md生成パスの2段階検証        | `fs.access(skillMdPath)` で生成確認、失敗時フォールバック     |
| 2   | `StructurePlanJson` → workflow形式への変換が必要  | `plan.workflow.trigger.description` にpurposeを組み込む変換層 |

#### lessons-learned

- `generate_skill_md.js` は直接 `StructurePlanJson` を受け取らず `workflow` 形式に変換が必要
- tmp file cleanup は finally + `.catch(() => {})` パターンでnon-fatalにする

---

### タスク: TASK-SC-IMP-CREATE-WORKFLOW-001 createモード構造計画生成（2026-04-15）

| 項目       | 値                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001                                                             |
| 完了日     | 2026-04-15                                                                                  |
| タスク種別 | implementation（NON_VISUAL / skill-creator workflow）                                      |
| 関連Issue  | -                                                                                           |
| Phase 13   | blocked（ユーザー承認待ち）                                                                |

#### 実施内容

- `SkillCreatorService.ts` の `runCreateWorkflow` を `Promise<StructurePlanJson | null>` に変更し、`purpose = options.description` / `agents = ["extract-purpose", "plan-structure"]` / `features = []` の current facts を返すようにした
- `createSkill()` では `structurePlan` を local variable として受け取り、hidden property を使わない handoff に整理した
- `SkillCreatorService.test.ts` の `TC-04` を更新し、`runCreateWorkflow` の戻り値に `description` が入ることを直接検証するようにした
- `docs/30-workflows/p01-par-STRUCT-001/artifacts.json` を canonical manifest として current facts に固定し、`outputs/artifacts.json` は別 workflow の ledger として扱うようにした

#### Phase 11/12 成果物

| 成果物                         | パス                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| 手動テスト結果                 | `outputs/phase-11/manual-test-result.md`                          |
| 手動テストチェックリスト       | `outputs/phase-11/manual-test-checklist.md`                       |
| 実装ガイド                     | `outputs/phase-12/implementation-guide.md`                        |
| システム仕様書更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                  |
| 変更履歴                       | `outputs/phase-12/documentation-changelog.md`                     |
| 未タスク検出レポート           | `outputs/phase-12/unassigned-task-detection.md`                   |
| スキルフィードバックレポート   | `outputs/phase-12/skill-feedback-report.md`                       |
| Phase 12 準拠チェック          | `outputs/phase-12/phase12-task-spec-compliance-check.md`         |
| parity copy                    | `outputs/artifacts.json`                                          |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`: PASS（63 tests）
- `outputs/phase-11/manual-test-result.md`: PASS（UI/UX変更なしのため screenshot N/A）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS

#### 苦戦箇所

| # | 苦戦箇所 | 解決策 |
| --- | --- | --- |
| 1 | `description` の edge case が型契約と衝突しやすい | 型上必須の `string` として整理し、`undefined` は入力破損として切り分けた |
| 2 | 接続待ちと完了を同じ文脈で書くと誤読されやすい | `generate_skill_md.js` 接続はタスクA、構造計画生成は本タスクと分離した |

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
| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                          |
| 完了日     | 2026-04-15                                                                                 |
| タスク種別 | implementation（NON_VISUAL / semantic-default special-case elimination）                   |
| 関連Issue  | [#2089](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2089)                  |
| Phase 13   | blocked（ユーザー承認待ち）                                                               |

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

| コマンド                                                                                      | 結果                                     |
| --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                       | PASS（エラー 0）                         |
| `pnpm --filter @repo/desktop lint`                                                            | PASS（エラー 0、warnings 8件は既存箇所） |
| `pnpm --filter @repo/desktop exec vitest run .../SkillLifecyclePanel.llm-generation.test.tsx` | PASS（42 tests \| 13 skipped）           |
| `outputs/phase-11/manual-test-result.md`                                                      | NON_VISUAL PASS（手動テスト + metadata） |
| 成果物                                  | パス                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| 手動テスト結果                          | `outputs/phase-11/manual-test-result.md`                             |
| 手動テストレポート                      | `outputs/phase-11/manual-test-report.md`                             |
| 実装ガイド                              | `outputs/phase-12/implementation-guide.md`                           |
| システム仕様更新サマリー                | `outputs/phase-12/system-spec-update-summary.md`                     |
| ドキュメント更新履歴                    | `outputs/phase-12/documentation-changelog.md`                        |
| 未タスク検出レポート                    | `outputs/phase-12/unassigned-task-detection.md`                     |
| スキルフィードバックレポート            | `outputs/phase-12/skill-feedback-report.md`                         |
| Phase 12 準拠チェック                   | `outputs/phase-12/phase12-task-spec-compliance-check.md`            |

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

| 問題番号 | 内容 | 修正ファイル |
| -------- | ---- | ------------ |
| 問題2    | カテゴリ複数選択不可 | `skillCreator.ts`（`SkillCategory\|null` → `SkillCategory[]`） |
| 問題3    | ボタンスタイル不統一 | `SkillInfoStep.tsx` / `SkillCreateWizard.tsx`（`bg-blue-600` → CSS変数） |
| 問題11   | ProgressBar固定値   | `ConversationRoundStep.tsx`（動的計算 `Math.max(1, answeredCount)`） |
| 問題15   | カテゴリ解除不可    | `SkillInfoStep.tsx`（`handleCategoryClick` トグル実装） |
| 問題16   | ProgressBarカウント不正 | `ConversationRoundStep.tsx`（`isQuestionAnswered` 利用） |

### 実施内容

- `SkillInfoFormData.category` を `SkillCategory | null` → `SkillCategory[]` に型変更し、未選択を空配列で表現
- `handleCategoryClick` を `includes/filter` ベースのトグルロジックに変更し、複数選択・解除に対応
- `currentQuestion` を `Math.max(1, answeredCount)` で動的計算し、実際の回答状況を反映
- `SkillInfoStep.tsx` と `SkillCreateWizard.tsx` のボタン CSS を `var(--status-primary)` / `var(--text-inverse)` に統一
- Phase-12 成果物 6 ファイルを `outputs/phase-12/` 配下に作成

### 検証証跡

| 項目 | 結果 |
| ---- | ---- |
| typecheck | PASS |
| lint | PASS |
| vitest | PASS |
| Phase-11 手動テスト | 目視確認済み |
| phase12-task-spec-compliance-check.md | **PASS** |

### 苦戦箇所

| 苦戦箇所 | 解決策 |
| -------- | ------ |
| `category` 型変更の影響範囲（subpath export スコープ内に限定） | ルート barrel に変更を波及させず `@repo/shared/skill-creator` に閉じる方針を明示 |
| `handleCategoryClick` の境界値（空配列への遷移） | `includes/filter` パターンで条件分岐なし・空配列移行を自動的に処理 |
| `currentQuestion` の Page 2 遷移直後の表示（3/6 になる場合） | 「回答済み数の反映」として仕様書に明記し、テストで期待値として定義 |
| `hover:bg-blue-700` の除去による hover 体験の維持 | CSS変数側でホバー状態を定義し、opacity での代替を採用 |

### lessons-learned

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
