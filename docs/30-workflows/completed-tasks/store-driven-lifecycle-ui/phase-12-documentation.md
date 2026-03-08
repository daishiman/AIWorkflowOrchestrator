# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 12                        |
| タスクID   | TASK-10A-F                |
| 機能名     | store-driven-lifecycle-ui |
| 作成日     | 2026-03-08                |
| ステータス | 完了                      |

## 目的

実装ガイドを作成し、`aiworkflow-requirements` / `task-specification-creator` / ワークフロー成果物を同期し、未タスクと教訓を漏れなく記録する。特に移管前 2workflow 監査で確定した Phase 11 の証跡整合、Step 1-A〜1-G / Step 2、`spec-update-summary.md`、`unassigned-task-detection.md` を completed 正本へ矛盾なく集約する。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1 + Part 2）
- Task 2: システム仕様書更新（Step 1-A〜1-G / Step 2）
- Task 3: documentation-changelog.md 作成
- Task 4: 未タスク検出レポート作成（0件でも必須）
- Task 5: スキルフィードバックレポート作成（改善点なしでも必須）

## 参照資料

| 資料名                    | パス                                                                                        | 説明                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| 仕様書更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A〜1-G / Step 2 の正本           |
| Phase 11/12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 11/12 の必須成果物と validator    |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | Phase 12 集約監査の補助                 |
| 2workflow証跡テンプレート | `.claude/skills/task-specification-creator/assets/evidence-bundle-template.md`              | 移管前 2workflow 監査観点の確認         |
| コマンド参照              | `.claude/skills/task-specification-creator/references/commands.md`                          | verify / validate / generate 系コマンド |
| 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md`                                                        | P1-P4, P23-P29, P43 対策                |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 更新/確認内容                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 抽出入口               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | 必要仕様の初期抽出                             |
| リソースマップ         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止                                   |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store駆動UIパターン、TASK-10A-D/E-C/F 責務境界 |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26 直接IPC→Store個別セレクタ移行              |
| UI機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Analysis/Create の UI 状態と workflow 導線     |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | SkillManagementPanel 配下の view 境界          |
| Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | create/analyze/apply/autoImprove 契約確認      |
| IPC API 仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC 契約差分の有無判断                         |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | error state / retry / user message             |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録、未タスク、検証証跡の同期             |
| タスク運用ルール       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | Phase 12 判定条件                              |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 文書名ドリフト、TC証跡同期、mock標準化         |

### 前提Phase成果物

| 資料名              | パス                                                                                                  | 用途                        |
| ------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| Index               | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/index.md`                                | 抽出方針と補助成果物の確認  |
| requirements matrix | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/requirements-coverage-matrix.md` | aiworkflow 抽出網羅性の確認 |
| Phase 1 要件        | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`                 | FR/NFR要件の参照            |
| Phase 2 設計        | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                       | 設計方針の参照              |
| Phase 5 実装        | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md`               | 実装内容の参照              |
| Phase 6 テスト      | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md`               | テスト拡充結果の参照        |
| Phase 7 カバレッジ  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-7-coverage-check.md`               | カバレッジ結果の参照        |
| Phase 8 リファクタ  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md`                  | リファクタリング結果の参照  |
| Phase 9 品質        | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-9-quality-assurance.md`            | 品質検証結果の参照          |
| Phase 10 レビュー   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-10-final-review.md`                | レビュー結果の参照          |
| Phase 11 手動テスト | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-11-manual-test.md`                 | 証跡同期の参照              |

## 2Workflow監査と移管結果

| Workflow         | パス                                                           | 役割                                                                               | Phase 12での扱い            |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------- |
| unified workflow | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` | 移管前 current workflow の再監査結果と completed baseline 正規化結果を統合した正本 | Phase 12 完了後の公式参照先 |

- 移管前は current / completed の 2workflow で監査し、完了判定後に本ディレクトリへ統合した

## 仕様書別 SubAgent 分担

| SubAgent   | 担当仕様書                                                            | 主担当作業                                   | 完了条件                                 |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| SubAgent-A | `arch-state-management.md`, `architecture-implementation-patterns.md` | Store責務境界と S26 の同期                   | action/state/selector の責務が競合しない |
| SubAgent-B | `ui-ux-feature-components.md`, `arch-ui-components.md`                | UI完了記録と Phase 11 証跡導線の同期         | workflow と画面証跡が追跡可能            |
| SubAgent-C | `task-workflow.md`, `lessons-learned.md`                              | 完了台帳、未タスク、苦戦箇所、検証証跡の同期 | Step 1-A〜1-G / Step 2 の反映漏れがない  |

## 実行手順

### Task 1: 実装ガイド

**配置先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/implementation-guide.md`

#### Part 1: 概念説明（中学生レベル）

- 日常の例え話を必ず含める
- 専門用語は使わず、「なぜ必要か → 何をするか」の順で説明する
- `SkillCreateWizard` は既に Store 経由で動いていること、`useSkillAnalysis` に残る直接呼び出しを統一することを区別して説明する

例え話の軸:

- 画面 = お客さん
- Store = 注文係
- `window.electronAPI` = 厨房への連絡窓口
- なぜ必要か = 他の店員も注文状況を共有できるようにするため
- 何をするか = 注文係を通さない直通電話をやめる

#### Part 2: 技術詳細（開発者向け）

必須記載項目:

1. 直接IPC排除パターン
2. `useCreateSkill` / `useAnalyzeSkill` / `useApplySkillImprovements` / `useAutoImproveSkill` の API シグネチャ
3. `useCurrentAnalysis` / `useIsAnalyzingSkill` / `useIsImprovingSkill` / `useSkillError` の selector 利用例
4. Before / After コード例
5. try/catch と `skillError` 更新パターン
6. UI ローカル状態と Store 状態の切り分け理由

実装実態に合わせた注意点:

- `SkillCreateWizard.tsx` は TASK-10A-C で Store 経由化済みなので、TASK-10A-F では「契約維持 + 作成後一覧同期確認」の観点で記述する
- `useSkillAnalysis.ts` が今回の直接 IPC 排除の主対象であることを明記する
- `improvementResult` は現行設計ではローカル state 維持であることを明記する

ガイド作成後の必須検証:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui
```

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- `ui-ux-feature-components.md` に TASK-10A-F の完了タスク記録を追加する
- `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` を両方更新する
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を両方更新する

#### Step 1-B: 実装状況テーブル更新

- `arch-state-management.md` / `ui-ux-feature-components.md` / `task-workflow.md` の実装状況または完了テーブルを更新する
- `test -f` で参照パスの実在確認を先に行い、誤パス更新を防ぐ
- 移管前 2workflow 監査で確定した差分を保持しつつ、Phase 12 完了後は completed 正本へ統合する

#### Step 1-C: 関連タスクテーブル更新

```bash
rg -n "TASK-10A-F|store-driven-lifecycle-ui" \
  .claude/skills/aiworkflow-requirements/references \
  .claude/skills/task-specification-creator/references
```

- 関連タスク、未タスク候補、完了記録の全表を検索して同期する

#### Step 1-D: index / topic-map 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --regenerate
```

#### Step 1-E: 未タスク指示書作成・登録

- `unassigned-task-detection.md` で 1 件以上検出した場合、親 workflow 配下 `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/` へ指示書を移管または作成する
- `task-workflow.md` の残課題テーブルへ登録する
- 関連仕様書に参照リンクを追加する

#### Step 1-F: DevOps関連ファイル更新

- 今回の対象は Renderer / Store / docs 中心のため、CI/CD 変更がなければ `N/A` と `spec-update-summary.md` に明記する

#### Step 1-G: 検証コマンド順次実行

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/store-driven-lifecycle-ui
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

- `quick_validate.js` の Warning は `spec-update-summary.md` に `要監視 / 要対応` で記録する
- 2workflow監査を行う場合は、以下を追加で実行し、completed workflow 側の legacy drift を baseline として分離記録する

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/store-driven-lifecycle-ui
```

- 移管前 2workflow 監査で baseline 側に差分があった場合も、統合前に `two-workflow-audit-summary.md` または `spec-update-summary.md` へ根拠を残す

#### Step 2: システム仕様更新判断

- 新規 interface / shared DTO / IPC channel を追加していない場合は `更新なし` を `spec-update-summary.md` と `documentation-changelog.md` の両方に記録する
- 仕様更新が必要な場合は `arch-state-management.md` / `architecture-implementation-patterns.md` / `interfaces-agent-sdk-skill.md` / `task-workflow.md` / `lessons-learned.md` を同一ターンで更新する

### Task 3: documentation-changelog.md

**配置先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/documentation-changelog.md`

- Step 1-A〜1-G / Step 2 の実施結果を完了ベースで記録する
- **計画表現や予定表現を残さない**
- 仕様更新なしの場合も、判断根拠を明記する

### Task 4: 未タスク検出

**配置先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/unassigned-task-detection.md`

- `outputs/phase-12/unassigned-task-detection.md` を 0 件でも必ず作成する
- 未タスクを検出した場合は Step 1-E の 3 ステップを全て完了する

**想定される未タスク候補:**

| 候補                                           | 判断基準                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| SkillManagementPanel の残存直接IPC呼び出し排除 | TASK-10A-F のスコープ外だが同種の直接IPC呼び出しが残存する可能性       |
| Store mock パターン標準化                      | State selector / Action selector の mock 流儀が乱れていないか          |
| improvementResult の Store 統合要否            | 将来 shared state に寄せる必要があるか                                 |
| 他の UI コンポーネントの store 駆動統合        | SkillCreateWizard / SkillAnalysisView 以外のコンポーネントでの同種問題 |

### Task 5: スキルフィードバックレポート

**配置先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/skill-feedback-report.md`

- `task-specification-creator` / `aiworkflow-requirements` / pitfall 運用の 3 観点で記録する
- 改善点がない場合でも `改善点なし` として出力する

### 追加成果物: spec-update-summary.md

**配置先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/spec-update-summary.md`

- Step 1-A〜1-G / Step 2 の結果を 1 ファイルに集約する
- validator / audit / quick_validate の結果もここに集約する

## 多角的チェック観点

| 観点             | 確認内容                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| 抽出網羅性       | `quick-reference` / `resource-map` / `requirements-coverage-matrix` が整合している    |
| LOGS/SKILL 同期  | aiworkflow-requirements と task-specification-creator の両方を更新している            |
| Phase 11証跡整合 | `manual-test-result.md`、`screenshots/`、Phase 12 成果物の記述が一致する              |
| 2workflow移管    | 移管前 2workflow 監査結果と移管後 completed 正本の関係が崩れていない                  |
| P4防止           | `documentation-changelog.md` に予定表現が残っていない                                 |
| Step 1-E 完遂    | 未タスクがある場合、指示書 / 台帳 / 仕様リンクの 3 ステップを完了している             |
| Step 1-G 検証    | validator / audit / quick_validate の結果が `spec-update-summary.md` に集約されている |

## 成果物

| 成果物                  | パス                                                                                                                 | 説明                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| ドキュメント更新仕様書  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-12-documentation.md`                              | 本ドキュメント                  |
| 実装ガイド              | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2                 |
| 仕様更新サマリ          | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/spec-update-summary.md`                | Step 1-A〜1-G / Step 2 集約     |
| 2workflow監査サマリ     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/two-workflow-audit-summary.md`                  | 移管前 2workflow 監査と統合結果 |
| documentation-changelog | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/documentation-changelog.md`            | 変更記録                        |
| 未タスク検出            | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果                |
| スキルフィードバック    | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/skill-feedback-report.md`              | ワークフロー改善点              |
| Phase 12 準拠チェック   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/phase12-task-spec-compliance-check.md` | 任意の集約監査                  |

## 完了条件

- [x] `outputs/phase-12/implementation-guide.md` が Part 1 / Part 2 の 2 部構成で作成されている
- [x] `validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui` が PASS している
- [x] `outputs/phase-12/spec-update-summary.md` が作成されている
- [x] Step 1-A として LOGS.md / SKILL.md の 2 ファイルずつが両方更新されている
- [x] Step 1-B / 1-C / 1-D の結果が `spec-update-summary.md` と `documentation-changelog.md` に記録されている
- [x] 移管前 2workflow 監査と移管後 completed 正本への統合判断が記録されている
- [x] Step 1-E の未タスク 3 ステップが必要時に全完了している
- [x] Step 1-F が実施済みまたは N/A 理由付きで記録されている
- [x] Step 1-G の validator / audit / quick_validate 結果が `spec-update-summary.md` に記録されている
- [x] `outputs/phase-12/documentation-changelog.md` が計画表現なしで記録されている
- [x] `outputs/phase-12/unassigned-task-detection.md` が 0 件でも作成されている
- [x] `outputs/phase-12/skill-feedback-report.md` が改善点なしでも作成されている
- [x] `outputs/phase-11/manual-test-result.md` / `screenshots/` / Phase 12 記録の内容が整合している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
