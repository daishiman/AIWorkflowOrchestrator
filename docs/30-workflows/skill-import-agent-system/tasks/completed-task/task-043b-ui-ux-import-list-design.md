---
id: TASK-10A-E-B
phase: 10
tier: 3
title: TASK-10A-E UI/UX インポート一覧設計
depends_on: [TASK-10A-E]
parallel_with: [TASK-10A-E-A, TASK-10A-E-C]
blocks: [TASK-10A-E-D]
status: completed
priority: high
estimated_complexity: small
tags: [docs, ui, ux, accessibility]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/index.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-1-requirements.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-2-design.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-3-design-review.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-4-test-creation.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-5-implementation.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-6-test-expansion.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-7-coverage-check.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-8-refactoring.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-9-quality-assurance.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-10-final-review.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-11-manual-test.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-12-documentation.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/phase-13-pr-creation.md
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/artifacts.json
    - docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design.md
  modifies:
    - apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
    - apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx
    - apps/desktop/scripts/capture-task-043b-ui-ux-import-list-design-screenshots.mjs
---

# TASK-10A-E-B: UI/UX インポート一覧設計仕様

## 概要

`SkillManagementPanel` の list view に「インポート済み」と「利用可能」の2セクションを同居させ、検索・空状態・エラー状態・追加確認ダイアログ・アクセシビリティを一貫した仕様へ固定する。現ワークツリーでは仕様化に加えて、実装、テスト、画面検証、Phase 12 成果物出力まで完了している。コミットと PR は本タスク範囲外のままとする。

## 入力

- `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design.md`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`
- `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`

## 出力

- `task-043b-ui-ux-import-list-design/`: Phase 1〜13 のタスク仕様書一式
- `task-043b-ui-ux-import-list-design/index.md`: 実行インデックス
- `task-043b-ui-ux-import-list-design/artifacts.json`: Phase成果物レジストリ
- `task-043b-ui-ux-import-list-design/outputs/verification-report.md`: 仕様検証レポート

## Atent Team 編成（SubAgent-B 内）

| SubAgent | 関心ごと         | 主責務                                               | 実行方式        |
| -------- | ---------------- | ---------------------------------------------------- | --------------- |
| B1       | 情報設計         | 2セクション構成、件数表示、検索適用範囲              | 並列            |
| B2       | 状態と文言       | loading/empty/no-result/error/success の表示優先順位 | 並列            |
| B3       | アクセシビリティ | aria属性、Tab順、ダイアログ復帰フォーカス            | 並列            |
| B4       | テスト引き渡し   | Phase 4〜11 へ渡す自動/手動検証観点の統合            | 直列（B1-B3後） |

## 仕様書作成ステータス

- [x] ブランチ作成完了（`task/task-043b-ui-ux-import-list-design-specs`）
- [x] `task-043b-ui-ux-import-list-design/` ディレクトリ作成
- [x] Phase 1〜13 仕様書作成
- [x] `generate-index.js` 実行完了
- [x] `validate-phase-output.js` PASS（28項目、0エラー、0警告）
- [x] `verify-all-specs.js` PASS（13/13、0エラー、0警告）
- [x] `task-specification-creator` の必須セクション構成を反映
- [x] `aiworkflow-requirements` の正本参照を反映
- [x] 再監査で `多角的チェック観点`、Phase 11 の TC/画面カバレッジ、Phase 12 の Step 1-A〜1-G を補正
- [x] 実装、テスト、画面検証、Phase 12 成果物出力まで完了
- [x] コミット、PRは未実施

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                                                         | 反映ポイント                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| resource-map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                             | UI実装、コンポーネントテスト、アクセシビリティテストの読込範囲    |
| quick-reference        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                          | P31対策、Result、IPC境界の先行パターン                            |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                      | empty/loading/error、CardGrid、SearchFilterList の再利用指針      |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                               | 文言方針、ライブリージョン、フォーカス移動、44px タッチターゲット |
| UIデザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                                   | 状態色、余白、出現/失敗アニメーション                             |
| 機能別UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                              | SearchFilterList / CardGrid / SkillCreateWizard との整合          |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                    | SkillManagementPanel の責務境界と再利用単位                       |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                 | 個別selector、idempotent import、available/imported の整合        |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                  | `skill.id/name` 混同防止と境界変換1箇所固定                       |
| Skill I/F              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                            | `skill:list` / `skill:getImported` / `skill:import` 契約          |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                        | エラー表示と再試行導線                                            |
| テスト設計             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                            | テスト粒度、fixture、異常系分類                                   |
| テストfixture          | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                                                      | builder / fixture パターン再利用                                  |
| A11yテスト             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                 | `aria-live` / `role="alert"` / dialog focus trap                  |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                  | coverage、jest-axe、spec verify                                   |
| タスク運用             | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                                   | Phase品質ゲートと差戻し条件                                       |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                                 | `currentView` と `skill:*` channel の全体境界                     |
| SkillCenter UI仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` の `SkillCenterView UI` 節                   | 探索UIの成功パターンと nullish 防御                               |
| SkillCenter state 契約 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の `Skill Import / SkillCenter 防御状態管理` 節 | idempotent import、nullish 防御、擬似失敗防止                     |

`search-spec.js` による再探索では task-043b 専用の直接正本は見つからなかったため、`SkillManagementPanel` / `SkillImportDialog` / `availableSkillsMetadata` に紐づく既存正本として `arch-ui-components.md`、`arch-state-management.md`、`architecture-implementation-patterns.md`、`testing-component-patterns.md` を採用した。

## 抽出した直接根拠

| 根拠                          | パス                                                                                                                                       | task-043b へ抽出した必須仕様                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| SkillCenterView 防御UI        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` の `TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` 節 | `description nullish`、配列 nullish、`normalizeSearchText`、検索/おすすめ防御を list view へ横展開する                        |
| Skill import 防御状態管理     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の `TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` 節           | `addingSkills.has(skillName)` 型の二重実行防止、既存 imported 同期、擬似失敗防止、`skillError: null` 維持を成功条件へ反映する |
| SkillManagementPanel 既存統合 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md` の `SkillManagementPanel` 節                                     | list branch だけを拡張し、既存 `currentView` による editor / analysis / create 統合を侵食しない                               |
| P31 個別selector 原則         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の個別selector節                                              | 新規 Store slice / global 合成 hook を避け、既存個別selector + ローカル state のみで閉じる                                    |

## エレガント解決方針

| 判断軸             | 採用方針                                                                                                         | 理由                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 最小変更           | 新規IPC、Preload API、Store state、`currentView` 分岐を増やさない                                                | UI設計タスクを Renderer list view に閉じ、依存影響を最小化する |
| 既存パターン再利用 | `SkillSelector`、`SkillImportDialog`、`SearchFilterList`、`CardGrid`、`SkillCenterView` の成功パターンを流用する | 新規UI語彙や状態モデルを増やさず、学習済み導線を維持できる     |
| 境界防御           | `skill.id/name` 混同、`importedCount` 依存の偽失敗、欠損メタデータ、duplicate import を先に潰す                  | 後から見つかると UI/Store/IPC の責務境界が一気に崩れる         |
| 情報量最適化       | 検索入力は1つ、表示は2セクション、成功通知は live region で補助する                                              | 発見性を上げつつ操作コストを増やさない                         |
| 責務分離           | 永続データは既存 Store、UI一時状態はローカル state、仕様同期は Phase 12 に集約する                               | Renderer / Store / IPC / 文書の責務を混線させない              |

## 再監査の判断軸

| 思考観点                         | 今回の判断                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 水平思考 / 類推思考              | `SkillSelector`、`SkillImportDialog`、`SkillCenterView`、`SearchFilterList`、`CardGrid` の成功パターンを横展開した        |
| 逆説思考 / if思考                | 「成功しない条件」から逆算し、`skill.id/name` 混同、`importedCount` 依存、nullish metadata、duplicate import を先に防いだ |
| システム思考 / 因果関係ループ    | UIの偽失敗が Store 契約誤読と IPC 境界のドリフトに連鎖する前提で、Renderer / Store / IPC の責務を固定した                 |
| 垂直思考 / why思考               | なぜ task-043b が UI task に留まるべきかを確認し、新規IPC / Store state を非スコープに固定した                            |
| 2軸思考 / トレードオン思考       | 発見性と複雑性、再利用性と変更量の2軸で比較し、「1検索入力 + 2セクション + dialog confirm」を採用した                     |
| 価値提案思考 / プラスサム思考    | 追加導線の見つけやすさを上げつつ、既存 currentView 遷移や idempotent import を壊さない方針にした                          |
| ダブル・ループ思考 / 改善思考    | 実装方針だけでなく、Phase 11 / 12 / lessons / task-workflow に再発防止条件を戻した                                        |
| 抽象化思考 / プロセス思考        | 「検索」「表示」「確認」「同期」「証跡」の5責務に分解し、各 Phase に対応付けた                                            |
| 仮説思考 / 論点思考 / 戦略的思考 | 主要論点を「状態・境界・A11y・証跡」に絞り、non-scope を明確化して仕様の肥大化を防いだ                                    |

## 破棄した代替案

| 代替案                                        | 破棄理由                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| imported / available で検索入力を分ける       | 学習コストと視線移動が増え、件数・状態通知も二重管理になる                 |
| import 一覧専用の新規 Store slice を追加する  | task-043b は既存 `agentSlice` 契約で成立し、Store 境界を広げる利益がない   |
| 一覧の `追加する` で即 `importSkill()` を呼ぶ | 確認ダイアログ、focus return、誤操作防止、A11y 契約が崩れる                |
| 成功判定を `importedCount > 0` のみで判定する | idempotent import では成功同期と新規件数が一致しないため、偽失敗が再発する |
| 欠損メタデータを正常入力前提で扱う            | `description` や配列欠損で検索・描画が落ちる既知再発パターンがある         |

## 実装対象の最小集合

| 区分         | ファイル                                                                                         | 方針                                                              |
| ------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 主変更対象   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                            | 2セクション、検索、状態表示、dialog 導線、focus return を追加する |
| 主変更対象   | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`             | 状態表示、文言、nullish 防御、A11y を追加する                     |
| 主変更対象   | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | dialog、success、duplicate guard、currentView 回帰を追加する      |
| 条件付き変更 | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                               | 現行 props で focus / copy 契約を満たせない場合だけ更新する       |
| 条件付き変更 | `apps/desktop/src/renderer/store/index.ts`                                                       | 既存 selector 名だけで不足する場合だけ公開 hook を追加する        |
| 原則非変更   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                           | 新規 state 追加は非スコープ。既存契約再利用を原則とする           |

## 依存関係整合性

| 依存先         | 所有責務                                                                  | task-043b が守る境界                                                            | 崩した場合の破綻                                             |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `TASK-10A-E-A` | `skill:list` / `skill:getImported` / `skill:import` の IPC / Preload 契約 | 既存 channel と戻り値契約を消費するだけに留める                                 | UI task なのに API task を巻き込み、契約ドリフトを起こす     |
| `TASK-10A-E-C` | `agentSlice` の selector / action / idempotent import 契約                | 新規 Store state を足さず、既存 selector と action の組み合わせだけで成立させる | imported / available 整合と duplicate guard が二重管理になる |
| `TASK-10A-D`   | `currentView` による list / editor / analysis / create 統合               | list branch のみを拡張し、他 view 分岐を変更しない                              | 既存画面遷移と回帰テストが壊れる                             |
| Phase 12       | system spec / lessons / workflow 台帳の同期                               | UI設計中に仕様正本を先走って更新せず、実行時にまとめて同期する                  | 設計途中の仮説が正本化され、仕様と実体が逆転する             |

## 不変条件

| 項目      | 固定する条件                                                                            |
| --------- | --------------------------------------------------------------------------------------- |
| IPC境界   | 新規IPC、Preload API、Main service を追加しない                                         |
| Store境界 | 新規 Store slice と global 合成 hook は追加しない                                       |
| View境界  | `currentView` の既存 branch を変更せず、list branch 内で閉じる                          |
| 成功条件  | `importedCount` 単独判定を禁止し、imported 一覧反映 + error 未残置で判定する            |
| 防御条件  | `description ?? ""`、配列 nullish 吸収、duplicate import 防止、擬似失敗防止を必須にする |
| A11y      | dialog confirm、focus return、`aria-live`、`role=\"alert\"` を崩さない                  |

## 実行手順

1. B1/B2/B3 を並列で進め、セクション構成、状態優先順位、アクセシビリティ契約を分離して確定する。
2. `SkillSelector` の 2セクション表示と `SkillImportDialog` の確認導線を再利用元として固定する。
3. `SkillManagementPanel` 現行仕様との差分を `availableSkillsMetadata` / `importSkill` / `isImporting` の観点で整理する。
4. B4 で自動テスト、手動テスト、Phase 12 更新先を単一仕様へ統合する。
5. 仕様検証だけを実施し、実装、コミット、PRへ進まない。

## UI 決定事項

| 項目           | 決定内容                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------- |
| セクション順   | `インポート済み` を先頭、`利用可能なスキル` を後段に配置する                                |
| 検索適用範囲   | 1つの検索入力で imported / available の両方を同時に絞り込む                                 |
| CTA文言        | 見出しはドメイン語を維持し、主ボタンはやさしい日本語 `追加する` を使う                      |
| 追加導線       | 一覧の `追加する` は確認ダイアログを開き、確定時だけ `importSkill` を呼ぶ                   |
| 成功時遷移     | 追加済みカードへフォーカスを戻し、`aria-live="polite"` で成功を通知する                     |
| 成功判定       | 成功は `imported` セクション反映と error 未残置で判定し、`importedCount` 単独判定を使わない |
| 欠損メタデータ | `description` や配列欠損があっても一覧表示と検索が継続する                                  |
| エラー表示     | 画面継続表示を優先し、`role="alert"` で再試行案内を提示する                                 |
| 非スコープ     | 新規IPC、Preload API追加、Store state追加、PR作成は扱わない                                 |

## 検証条件

- [x] `task-043b-ui-ux-import-list-design/` 配下に `phase-1`〜`phase-13` と `artifacts.json` が存在する
- [x] 2セクション、検索、状態表示、A11y、Phase 12 更新先が Phase 仕様書へ展開されている
- [x] `aiworkflow-requirements` の UI / state / interface / test / quality 参照が反映されている
- [x] `task-specification-creator` の検証スクリプトが PASS する構成になっている
- [x] 実装、コミット、PRを実施していない
