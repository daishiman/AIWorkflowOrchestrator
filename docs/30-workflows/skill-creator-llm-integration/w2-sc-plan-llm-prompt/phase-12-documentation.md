# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 12                         |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

実装ガイド（プロンプト設計の解説含む）・API ドキュメント・システム仕様書更新・未タスク検出を行い、Phase 12 チェックリストの全項目を完了する。

## 実行タスク

### Task 1: 実装ガイド作成

1. `implementation-guide-part1.md` を作成する（中学生レベルの概念説明）
   - 「LLM プロンプトは料理レシピのようなもの」などの日常例えを使用する
   - agent 仕様書が「材料」、user 入力が「作りたい料理」である例えを説明する
2. `implementation-guide-part2.md` を作成する（開発者向け実装詳細）
   - `buildPlanSystemPrompt()` の動作詳細
   - `parsePlanResponse()` の型ガードロジック詳細
   - DI 配線方法（コンストラクタ注入）の説明
3. `api-documentation.md` を作成する
   - `RuntimeSkillCreatorFacade.plan()` のシグネチャ・パラメータ・戻り値を記述する
   - `RuntimeSkillCreatorPlanResult` の全フィールドを記述する

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当する仕様書にタスク完了記録を追加する
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（2ファイル両方: P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する（P29 対策）
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-SC-03-PLAN-LLM-PROMPT" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新する

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成する（P2/P27 対策）

#### Step 2: システム仕様更新

- [ ] `RuntimeSkillCreatorFacade` のインターフェース変更を該当仕様書に反映する
- [ ] `RuntimeSkillCreatorPlanResult` の型変更を `interfaces-*.md` に記録する

#### Step 3: IPC 契約検証（IPC 修正がある場合のみ）

- IPC チャンネルの変更がある場合は ipc-contract-checklist.md を実施する

### Task 3: documentation-changelog.md 記録

- [ ] 全 Step の完了後に `documentation-changelog.md` を更新する（P4/P51 対策: 全 Step 完了前に「完了」と書かない）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` を作成する（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了する: (1) `unassigned-task/` に指示書作成 (2) `task-workflow.md` 残課題テーブルに登録 (3) 関連仕様書にリンク追加（P3/P38/P58 対策）
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新する
- [ ] `artifacts.json` の Phase 12 ステータスを更新する

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 チェックリスト）
- `.claude/rules/06-known-pitfalls.md`（P1-P4, P25, P27, P29, P38, P43, P51, P56-P59）
- `docs/30-workflows/skill-creator-llm-integration/03-phase-11-manual-testing.md`

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/03-implementation-guide-part1.md`
- `docs/30-workflows/skill-creator-llm-integration/03-implementation-guide-part2.md`
- `docs/30-workflows/skill-creator-llm-integration/03-api-documentation.md`
- `docs/30-workflows/skill-creator-llm-integration/03-unassigned-task-report.md`
- `docs/30-workflows/skill-creator-llm-integration/03-documentation-changelog.md`

## 完了条件

- [ ] Task 1: 実装ガイド Part 1/2 と API ドキュメントを作成した
- [ ] Step 1-A: LOGS.md を2ファイル両方更新した（P1/P25 対策）
- [ ] Step 1-A: SKILL.md を2ファイル両方更新した（P29 対策）
- [ ] Step 1-C: 関連仕様書を grep で検索し更新した
- [ ] Step 1-D: topic-map.md を再生成した（P2/P27 対策）
- [ ] Step 2: インターフェース変更を仕様書に反映した
- [ ] Task 3: documentation-changelog.md を全 Step 完了後に更新した（P4 対策）
- [ ] Task 4: unassigned-task-report.md を作成した（0件でも必須）
- [ ] 再評価クローズした未タスクの GitHub Issue を Close した（P56 対策）

## 次のPhase

Phase 13: PR 作成
