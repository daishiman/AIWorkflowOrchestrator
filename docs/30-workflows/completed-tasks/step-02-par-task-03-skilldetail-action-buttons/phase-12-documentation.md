# Phase 12: ドキュメント

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001        |
| 機能名     | skilldetail-action-buttons                     |
| Phase      | 12                                             |
| 作成日     | 2026-03-17                                     |
| 依存 Phase | Phase 2 / 5 / 6 / 7 / 8 / 9 / 10 / 11 の成果物 |

## 目的

実装ガイド、system spec 同期、更新履歴、未タスク検出、スキル改善記録を完了し、Phase 12 root evidence を揃える。

> 重要:
>
> - worktree 環境でも `.claude/skills/` の実更新を先送りしない。
> - `documentation-changelog.md` に「計画」「予定」「TODO」「will be」を残したまま完了扱いにしない。
> - 正本は `.claude/skills/...`、`.agents/skills/...` は mirror として同ターンで整合を確認する。

## SubAgent 分担

| SubAgent | 関心ごと         | 主担当                                                   | 完了条件                                          |
| -------- | ---------------- | -------------------------------------------------------- | ------------------------------------------------- |
| A        | workflow 状態    | `phase-12-documentation.md` と `outputs/phase-12` の突合 | 6成果物と完了条件が一致                           |
| B        | system spec sync | aiworkflow-requirements の更新対象抽出と Step 1/2 実施   | canonical spec が漏れなく更新対象化される         |
| C        | 未タスク監査     | `unassigned-task-detection.md` と formalize              | current/baseline を分離記録する                   |
| D        | validator        | verify / validate / quick-validate / parity              | 実測値が changelog と compliance check に一致する |

## 参照資料

| 参照資料              | パス                                                                                                                                | 用途                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 2 成果物        | `outputs/phase-2/` / `phase-2-design.md`                                                                                            | 設計前提と既存 routing foundation の再利用方針を確認する             |
| Phase 5 成果物        | `outputs/phase-5/`                                                                                                                  | 実装結果と変更範囲を確認する                                         |
| Phase 6 成果物        | `outputs/phase-6/`                                                                                                                  | テスト拡充結果と fail path を確認する                                |
| Phase 7 成果物        | `outputs/phase-7/`                                                                                                                  | coverage 結果と gap を確認する                                       |
| Phase 8 成果物        | `outputs/phase-8/`                                                                                                                  | リファクタリング結果を確認する                                       |
| Phase 9 成果物        | `outputs/phase-9/`                                                                                                                  | lint / typecheck / test の品質結果を確認する                         |
| Phase 10 成果物       | `outputs/phase-10/`                                                                                                                 | MINOR / MAJOR 判定と未タスク候補を確認する                           |
| Phase 11 成果物       | `outputs/phase-11/`                                                                                                                 | 手動テスト所見と視覚証跡を確認する                                   |
| workflow root sync    | `artifacts.json` / `outputs/artifacts.json` / `index.md`                                                                            | workflow 台帳、mirror registry、Phase 状態の整合を確認する           |
| Phase 12 ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                              | 6成果物と planned wording 禁止を確認する                             |
| Phase 11/12 ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                         | workflow root と `outputs/artifacts.json` の同一ターン同期を確認する |
| spec-update-workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                      | Step 1 / Step 2 / validation を確認する                              |
| Step 1 詳細           | `.claude/skills/task-specification-creator/references/spec-update-step1-detailed-checklist.md`                                      | Step 1-A〜1-F の詳細を確認する                                       |
| Step 1-G 検証         | `.claude/skills/task-specification-creator/references/spec-update-step1-validation-commands.md`                                     | validator 実行順序を確認する                                         |
| renderView foundation | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`                      | `skillAnalysis` / `renderView()` / close 導線の正本                  |
| UI ナビゲーション     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                             | `skillCenter` / `skillAnalysis` / `skill-editor` の導線正本          |
| SkillCenter 参照      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                                           | `SkillCenterView` / `SkillDetailPanel` / `useSkillCenter` の現行契約 |
| SkillEditor 参照      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md`                                            | edit 導線が接続する `SkillEditor` 側契約                             |
| state core            | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                   | ViewType / state handoff の core 契約                                |
| state reference       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md`                 | SkillCenter の P31 個別セレクタ運用                                  |
| selector migration    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-agent-view-selector-migration.md` | P31/P48 の具体パターン                                               |
| 完了台帳              | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`                                      | skill lifecycle 完了記録の同期先                                     |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`                                         | ViewType / renderView / Phase 12 命名揺れの教訓同期先                |
| 台帳入口              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                | 未タスクと completed ledger の入口                                   |
| lessons 入口          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                                      | child companion への入口                                             |

## 実行タスク

- タスク 1: `implementation-guide.md` を Part 1 / Part 2 準拠で作成する
- タスク 2: `system-spec-update-summary.md` を軸に Step 1-A〜1-G / Step 2 を完了する
- タスク 3: `documentation-changelog.md` に実更新結果と validator 実測値を記録する
- タスク 4: `unassigned-task-detection.md` を 0件でも作成し、新規未タスクが 1 件以上なら formalize する
- タスク 5: `skill-feedback-report.md` を改善点なしでも作成する
- 最終確認: `phase12-task-spec-compliance-check.md` を root evidence として作成する

## Task 1: 実装ガイド作成

### 必須成果物

| ファイル                                   | 内容                                         |
| ------------------------------------------ | -------------------------------------------- |
| `outputs/phase-12/implementation-guide.md` | Part 1（中学生レベル）+ Part 2（技術者向け） |

### Part 1 必須要件

- `なぜ必要か` を先に書く
- 日常の例えを入れ、本文中に `たとえば` を最低1回入れる
- 専門用語はその場で言い換える
- edit / analyze の2導線を「詳細パネルから次の部屋へ進むためのボタン」として説明する

### Part 2 必須要件

- `SkillDetailPanelProps` の型定義
- `handleEditSkill` / `handleAnalyzeSkill` のシグネチャと使用例
- `isImported && onEdit && onAnalyze` の表示条件
- `setCurrentSkillName` → `setCurrentView` → `handleCloseDetail` の順序
- edge case: `skillName === null`、`onEdit/onAnalyze` 未指定、既存 `skillAnalysis` / `renderView()` 契約との競合なし
- 設定/定数: Button variant、spacing、data-testid

### 完了チェック

- [ ] `implementation-guide.md` に `## Part 1` と `## Part 2` がある
- [ ] Part 1 に `たとえば` を含む
- [ ] Part 2 に TypeScript コードブロック、使用例、edge case、設定項目がある
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons` が PASS する

## Task 2: system spec 更新

### 必須成果物

| ファイル                                         | 内容                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜1-G / Step 2 の結果、更新ファイル、validator 実測値 |

### Step 1-A: タスク完了記録

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する
- [ ] 更新した canonical spec に完了記録、関連ドキュメント、変更履歴を追記する

### Step 1-B: 実装状況テーブル更新

- [ ] `ui-ux-feature-components-core.md` / `ui-ux-components-core.md` / 該当 companion に status 行がある場合、今回の実装状態へ更新する
- [ ] top-level 行がない場合は、新規 row を無理に作らず、該当セクションに completed note と実装要点を追記する

### Step 1-C: 関連タスクテーブル更新

```bash
grep -rl "TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001\\|SkillDetailPanel\\|skillAnalysis\\|skill-editor\\|useSkillCenter" \
  .claude/skills/aiworkflow-requirements/references/
```

- [ ] grep でヒットした files の関連タスク / completed note / backlog 参照を更新する
- [ ] `task-workflow-completed-skill-lifecycle.md` と必要な companion の記述を同ターンで同期する

### Step 1-D: index 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
cp docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/artifacts.json \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/artifacts.json
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons --regenerate
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

- [ ] `topic-map.md` と `keywords.json` の再生成結果を確認する
- [ ] `artifacts.json` と `outputs/artifacts.json` を同期し、`index.md` の Phase 状態を再生成する

### Step 1-E: 未タスク formalize / 登録

- [ ] 0件でも `unassigned-task-detection.md` に current/baseline の結果を記録する
- [ ] 1件以上なら `docs/30-workflows/unassigned-task/` に指示書を作成する
- [ ] 1件以上なら `task-workflow.md` と関連 spec に参照リンクを追加する
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行する
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` と `--json --diff-from HEAD` を記録する
- [ ] scope なし `audit-unassigned-tasks.js --json` は baseline として分離記録する

### Step 1-F: DevOps 更新

- [ ] 本タスクは DevOps 変更なしとして `N/A` 理由を `system-spec-update-summary.md` に記録する

### Step 1-G: 検証コマンド順次実行

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons --regenerate
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons
```

- [ ] 更新対象 file ごとに `.claude` と `.agents` の mirror parity を `diff -u` で確認する
- [ ] validator 実測値を `system-spec-update-summary.md` と `documentation-changelog.md` の両方へ転記する

### Step 2: domain spec sync

> 今回は UI contract / hook contract / navigation contract が変わるため Step 2 を **実施必須** とする。

| 優先度 | 更新対象                                                                                                            | 理由                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 必須   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `skillAnalysis` 依存、current canonical set、follow-up backlog を同期する |
| 必須   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             | `skillCenter` → `skill-editor` / `skillAnalysis` の導線を同期する         |
| 必須   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                           | `SkillDetailPanel` / `useSkillCenter` / SkillCenter surface を同期する    |
| 必須   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md`                            | edit 導線が接続する SkillEditor 側の期待契約を同期する                    |
| 必須   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                   | ViewType / state handoff / new slice 不要の判断を同期する                 |
| 必須   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | `useSkillCenter` の個別セレクタ運用と状態境界を同期する                   |
| 必須   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`                      | lifecycle 完了台帳を同期する                                              |
| 必須   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`                         | renderView / Phase 12 命名揺れの教訓を同期する                            |
| 補助   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                | backlog / completed 入口を同期する                                        |
| 補助   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                      | lessons child companion 入口を同期する                                    |

## Task 3: documentation-changelog 作成

### 必須成果物

| ファイル                                      | 内容                                                              |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `outputs/phase-12/documentation-changelog.md` | 更新ファイル一覧、Step 1-A〜1-G / Step 2 の結果、validator 実測値 |

### 記載要件

- [ ] 更新した file を canonical path で列挙する
- [ ] Step 1-A〜1-G / Step 2 を「実施済み / N/A / 未実施」で事後記録する
- [ ] `planned wording` を含まない
- [ ] `artifacts.json` / `outputs/artifacts.json` / `index.md` の同期結果を記録する
- [ ] `system-spec-update-summary.md` / `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` と件数や判定を一致させる

### planned wording 確認

```bash
grep -n "計画\\|予定\\|TODO\\|will be\\|を予定" \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/phase-12/documentation-changelog.md
```

## Task 4: 未タスク検出

### 必須成果物

| ファイル                                        | 内容                                             |
| ----------------------------------------------- | ------------------------------------------------ |
| `outputs/phase-12/unassigned-task-detection.md` | 0件でも必須。current/baseline を分離して記録する |

### 検出ソース

- Phase 3 / Phase 10 の MINOR 指摘
- Phase 11 の発見事項
- 実装ファイル / テストファイルの `TODO|FIXME|HACK|XXX`
- `renderView` foundation の follow-up backlog

### 検出コマンド例

```bash
grep -rn "TODO\\|FIXME\\|HACK\\|XXX" \
  apps/desktop/src/renderer/views/SkillCenterView \
  apps/desktop/src/renderer/App.tsx
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/views/SkillCenterView \
  --output docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/phase-12/.tmp-unassigned-candidates.json
```

### ルール

- [ ] 0件でも「current=0 / baseline=N」を記録する
- [ ] 1件以上なら `docs/30-workflows/unassigned-task/` に formalize する
- [ ] 新規未タスクの件数は `documentation-changelog.md` と一致させる

## Task 5: スキルフィードバック記録

### 必須成果物

| ファイル                                    | 内容                             |
| ------------------------------------------- | -------------------------------- |
| `outputs/phase-12/skill-feedback-report.md` | 改善点または「改善点なし」と理由 |

### 観点

- template の曖昧さ
- resource-map から child companion まで降りる導線の分かりにくさ
- Phase 12 の命名揺れ (`unassigned-task-report` / `component-documentation` / `phase12-task-spec-compliance-check`) を再発させない改善
- mirror parity / worktree 運用の改善

## 最終確認: Phase 12 準拠チェック

### 必須成果物

| ファイル                                                 | 内容                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 と Step 1-A〜1-G / Step 2 の root evidence |

### 確認項目

- [ ] `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が揃っている
- [ ] `phase12-task-spec-compliance-check.md` が上記5成果物の存在と validator 実測値をまとめている
- [ ] `documentation-changelog.md` に planned wording が残っていない
- [ ] current/baseline を分離して記録している
- [ ] `artifacts.json` / `outputs/artifacts.json` / `index.md` の同期結果を残している
- [ ] mirror parity の確認結果を残している

## 成果物一覧

| ファイル                                                 | 内容                              |
| -------------------------------------------------------- | --------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 / Part 2）     |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 の実施結果 |
| `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validator 実測値       |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果（0件でも必須）   |
| `outputs/phase-12/skill-feedback-report.md`              | スキル改善点または改善点なし      |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 root evidence            |

## 完了条件

- [ ] 6成果物がすべて存在する
- [ ] Step 1-A〜1-G / Step 2 の結果が `system-spec-update-summary.md` に記録されている
- [ ] `verify-all-specs` / `validate-phase-output` / `validate-phase12-implementation-guide` / `verify-unassigned-links` / `quick_validate` の結果が記録されている
- [ ] `documentation-changelog.md` に planned wording が残っていない
- [ ] new follow-up がある場合は `docs/30-workflows/unassigned-task/` に formalize 済み
- [ ] `artifacts.json` / `outputs/artifacts.json` / `index.md` が同一ターンで同期している
- [ ] `.claude` canonical と `.agents` mirror の更新対象 file が整合している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次 Phase

Phase 13（PR 作成準備）へ進む。
