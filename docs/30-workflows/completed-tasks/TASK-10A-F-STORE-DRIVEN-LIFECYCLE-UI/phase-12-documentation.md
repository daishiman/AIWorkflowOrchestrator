# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase      | 12                                                  |
| 機能名     | task-10a-f-store-driven-lifecycle-ui                |
| 作成日     | 2026-03-09                                          |
| 使用スキル | aiworkflow-requirements, task-specification-creator |

## 目的

TASK-10A-F の正しい責務、必要な正本仕様、未タスク、教訓、入口導線を漏れなく同期する。

## 実行タスク

- 実装ガイド作成: Part 1 / Part 2 の両方を記述する
- システム仕様更新: Step 1-A〜1-G / Step 2 を記録する
- 更新履歴作成: 更新あり / 更新なしの根拠を残す
- 未タスク検出: 新規未タスクの有無と既存後続タスク集約を記録する
- フィードバック作成: 再発防止の改善点を記録する

| Task | 名称                             | 必須 | 本workflowでの扱い                |
| ---- | -------------------------------- | ---- | --------------------------------- |
| 12-1 | 実装ガイド作成                   | 必須 | Part 1 / Part 2 の両方を明記する  |
| 12-2 | システム仕様更新                 | 必須 | Step 1-A〜1-G / Step 2 を明記する |
| 12-3 | ドキュメント更新履歴作成         | 必須 | 更新あり / 更新なしの根拠を残す   |
| 12-4 | 未タスク検出レポート作成         | 必須 | 0件でも出力形式を固定する         |
| 12-5 | スキルフィードバックレポート作成 | 必須 | 改善点なしでも出力する            |

## 参照資料

| 資料名                        | パス                                                                                        | 説明               |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 2                       | `phase-2-design.md`                                                                         | state / 責務境界   |
| Phase 5                       | `phase-5-implementation.md`                                                                 | 実装確認結果       |
| Phase 6                       | `phase-6-test-expansion.md`                                                                 | error / 再分析観点 |
| Phase 7                       | `phase-7-coverage-check.md`                                                                 | カバレッジ結果     |
| Phase 8                       | `phase-8-refactoring.md`                                                                    | 責務整理結果       |
| Phase 9                       | `phase-9-quality-assurance.md`                                                              | 品質ゲート         |
| Phase 10                      | `phase-10-final-review.md`                                                                  | 最終判定           |
| Phase 11/12ガイド             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 12 必須事項  |
| spec update workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | 正本同期           |
| technical documentation guide | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     | 実装ガイド         |
| unassigned guidelines         | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 未タスク           |
| arch state                    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理正本       |
| implementation patterns       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | パターン正本       |
| task workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳正本           |
| lessons learned               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 教訓正本           |
| ui feature components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | UI正本             |
| interfaces skill              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型/契約            |
| error handling                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー方針         |
| quality requirements          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準           |

## aiworkflow-requirements 必須仕様の抽出

| 区分     | 参照先                                                                                      | 抽出理由                                    |
| -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 必須     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | TASK-10A-F の責務、Case B、state境界        |
| 必須     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | direct IPC → Store selector/action          |
| 必須     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了台帳、後続 TASK-10A-G 導線              |
| 必須     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | mock標準化、screenshot再発防止              |
| 必須     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skillError`, `createSkill` 契約            |
| 必須     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UIエラー方針の確認                          |
| 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ・品質ゲート                      |
| 条件付き | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView / CreateWizard の UI 記録 |

## 抽出手順

### ステップ1: 入口から読む

1. `resource-map.md` で Store駆動UI / selector migration を引く
2. `quick-reference.md` で direct IPC removal パターンを引く
3. `search-spec.js` は 1概念1クエリで分割する

### ステップ2: 正本を読む

- `TASK-10A-F`
- `useSkillAnalysis`
- `SkillCreateWizard`
- `SkillAnalysisView`
- `skillError`

### ステップ3: 変更先を同期する

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- UI責務の記録が不足している場合は `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### Task 12-1: 実装ガイド作成【必須】

#### 実装ガイド Part 1: 中学生レベル概念説明

- 日常の例え話を必ず入れる
- 先に「なぜ必要か」を説明し、その後に「何をするか」を説明する
- 専門用語を使う場合は、その場で短く説明する

本workflowで扱う例え:

- `useSkillAnalysis` は「窓口担当」で、裏側の処理を直接呼ばずに受付票を Store へ渡す
- `agentSlice` は「共通受付台帳」で、分析中か、改善中か、エラーかを全員が同じ紙で確認する
- `SkillAnalysisView` は「掲示板」で、台帳の内容を見やすく表示する役目だけを持つ

#### 実装ガイド Part 2: 技術的詳細

- `useSkillAnalysis.ts` が使う selector / action を列挙する
- `SkillCreateWizard.tsx` が `useCreateSkill()` を使う理由を明記する
- `skillError` の伝播、`selectedSuggestions` / `improvementResult` の local 維持理由を明記する
- `validate-phase12-implementation-guide.js` で検証できる構造にする

### Task 12-2: システム仕様更新【必須】

#### Step 1-A: タスク完了記録

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に TASK-10A-F の完了根拠と後続 TASK-10A-G 境界を記録する
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` に `useSkillAnalysis` / `SkillCreateWizard` / `SkillAnalysisView` の責務境界を記録する
- 今回は skill 本体よりも入口導線改善が主目的のため、LOGS.md / SKILL.md 更新は N/A 理由を `spec-update-summary.md` に明記する

#### Step 1-B: 実装状況テーブル更新

- Store駆動UI / selector migration の入口を `resource-map.md` と `quick-reference.md` に反映する
- 実装状況は「誤った TASK-10A-F 認識を修正済み」として要約する

#### Step 1-C: 関連タスクテーブル更新

- TASK-10A-E-C を import lifecycle 側、TASK-10A-G を残存 direct IPC 側として分離する
- `SkillImportDialog` を TASK-10A-F 本体から外した理由を台帳と整合させる

#### Step 1-D: index / topic map 再生成判断

- `.agents/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`

#### Step 1-E: 未タスク指示書判断

- `SkillEditor.tsx` の direct IPC 残存は今回の未解決候補として扱う
- ただし既存の TASK-10A-G が受け皿なら、新規未タスクは作らず「既存後続タスクへ集約」と記録する

#### Step 1-F: DevOps関連ファイル更新

- 本workflowでは DevOps 更新は発生しない
- `spec-update-summary.md` に `N/A: Renderer/Docs only` と記録する

#### Step 1-G: 検証コマンド順次実行

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI
```

- `quick_validate.js` は aiworkflow 入口更新をしたため、再実行対象として `spec-update-summary.md` に残す
- `verify-unassigned-links.js` は新規未タスクを作成した場合のみ必須、未作成なら N/A 理由を残す

#### Step 2: システム仕様更新判断

| 判定                                                                                        | 結論     | 理由                                                |
| ------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 更新必要 | TASK-10A-F の実責務を state境界として残す必要がある |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 更新必要 | direct IPC → Store action の検索導線が必要          |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 更新必要 | 完了台帳と後続タスク境界の修正が必要                |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 更新不要 | 契約自体は変更していない                            |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 更新不要 | エラー契約変更はない。抽出対象として参照するだけ    |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 更新不要 | 品質基準変更はない。抽出対象として参照するだけ      |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 条件付き | UI責務の説明補強が必要な場合のみ更新する            |

### Task 12-3: ドキュメント更新履歴作成【必須】

- `documentation-changelog.md` に「旧仕様の誤認修正」と「aiworkflow 入口導線改善」を別項目で記録する
- 「更新なし」のファイルも、判断根拠を 1 行で残す

### Task 12-3.5: 実行証跡整合ガード【必須】

- `phase-12-documentation.md` の記述内容
- `artifacts.json` の phase 状態
- `outputs/phase-12/` の成果物一覧

上記3点が同じ結論を示すことを確認する。

### Task 12-4: 未タスク検出レポート作成【0件でも必須】

| ソース     | 本workflowでの確認内容                                           |
| ---------- | ---------------------------------------------------------------- |
| Phase 11   | screenshot / discovered issues に未解決が残るか                  |
| コード監査 | `SkillEditor.tsx` の残存 direct IPC が既存後続タスクで管理済みか |
| 正本仕様   | TASK-10A-G に渡すべき事項が漏れていないか                        |

0件時の出力ルール:

- `検出タスクなし` と明記する
- 「既存後続タスクへ集約済み」の場合は 0件ではなく「新規未タスク 0件、既存後続タスクへ集約 1件」と書き分ける

### Task 12-5: スキルフィードバックレポート作成【改善点なしでも必須】

今回の改善対象:

- `task-specification-creator` 側: Phase 12 の粒度を落とすと誤同期を招く点
- `aiworkflow-requirements` 側: broad query では探せず、1概念1クエリが必要な点
- workflow 側: `SkillImportDialog` と `useSkillAnalysis` の責務を混同しやすい点

## 統合テスト連携

- Phase 11 の 11 screenshot と Phase 12 の changelog / unassigned detection を 1 セットで残す
- コミット / PR は実行しない

## 多角的チェック観点

| 観点           | 確認内容                                                         |
| -------------- | ---------------------------------------------------------------- |
| システム思考   | 正本仕様、workflow、コード、未タスクが循環矛盾を起こしていないか |
| 垂直思考       | phaseごとの必須成果物が欠けていないか                            |
| 水平思考       | 入口導線不足を quick-reference / resource-map で補えるか         |
| ダブル・ループ | 今回の漏れ原因自体を skill 側へ反映できているか                  |

## 成果物

| 成果物                | パス                                                                                                                            | 説明                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 実装ガイド            | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/implementation-guide.md`               | Part 1/2               |
| コンポーネント文書    | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/component-documentation.md`            | hook/view/wizard       |
| 仕様更新サマリー      | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/spec-update-summary.md`                | Step 1-A〜1-G / Step 2 |
| 更新履歴              | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/documentation-changelog.md`            | 更新内容               |
| 未タスク検出          | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/unassigned-task-detection.md`          | 検出結果               |
| スキルフィードバック  | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/skill-feedback-report.md`              | 再発防止               |
| Phase 12 準拠チェック | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 検証   |

## 完了条件

- [ ] Task 12-1〜12-5 が本文に記載されている
- [ ] 実装ガイド Part 1 / Part 2 の要件が本文に記載されている
- [ ] Step 1-A〜1-G / Step 2 の判断が本文に記載されている
- [ ] 必須仕様の抽出表がある
- [ ] 1概念1クエリの抽出手順がある
- [ ] 0件時 / 改善点なし時の出力ルールがある
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 実装ガイド
2. 正本仕様更新
3. changelog
4. 未タスク検出
5. フィードバック
6. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 13: 完了・PR準備
