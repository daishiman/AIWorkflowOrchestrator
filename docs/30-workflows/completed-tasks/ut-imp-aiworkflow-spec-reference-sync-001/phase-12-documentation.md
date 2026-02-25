# Phase 12: ドキュメント更新 — UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001

## メタ情報

| 項目               | 値                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001                                                     |
| Phase              | 12（ドキュメント更新）                                                                        |
| 機能名             | ut-imp-aiworkflow-spec-reference-sync-001                                                     |
| 作成日             | 2026-02-25                                                                                    |
| 前提Phase          | phase-11-manual-test.md                                                                       |
| 目的               | Phase 12 必須5タスクを満たし、更新履歴と未タスク検出を完了させる。                            |
| 成果物ディレクトリ | docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-12/ |

## 目的

Phase 12 必須5タスクを満たし、更新履歴と未タスク検出を完了させる。本タスクは仕様書修正のみ（コード変更なし）のため、API/IPC/コンポーネントドキュメントは不要。実装ガイドは同期ルール・チェックリスト・検証コマンドの運用手順を対象とする。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。
- **P4対策**: documentation-changelog.md への「完了」記載は全Step確認後の最終ステップとする。
- **P43対策**: サブエージェントへの委譲は3ファイル以下/エージェントに分割する。

### Task 12-1: 実装ガイド作成（2パート）

#### Part 1: 中学生レベル概念説明

- 「Phase 12の仕様更新で参照リンクがずれる問題」を日常生活の例え話で説明する
- 例: 「図書館の本棚の整理番号カードが、本を移動したのにカードだけ元の場所に残ってしまう問題」
- 3点同期（task-workflow.md / SKILL.md / LOGS.md）の必要性を日常例で説明する
- baseline（もともとの状態）と current（今回変えた部分）の区別を日常例で説明する

#### Part 2: 技術者レベル詳細

- 検証コマンド3種の実行手順と期待出力を記載する
  - `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` → `ALL_LINKS_EXIST`
  - `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` / `node .claude/skills/task-specification-creator/scripts/generate-index.js` → topic-map.md / keywords.json 更新
  - `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements` / `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator` → `Skill is valid!`
- 3点同期チェックリストの使い方を記載する
- 更新対象ファイル一覧（本タスクで変更した全仕様書パス）を記載する
- P1/P2/P3/P4/P25/P27/P29 の再発防止策を記載する

### Task 12-2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- 該当仕様書（task-workflow.md）にタスク完了記録を追加する
- `aiworkflow-requirements/LOGS.md` を更新する（P1/P25対策: 2ファイル更新の1つ目）
- `task-specification-creator/LOGS.md` を更新する（P1/P25対策: 2ファイル更新の2つ目）
- `aiworkflow-requirements/SKILL.md` の変更履歴を更新する（P29対策）
- `task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

#### Step 1-B: 実装状況テーブル更新

- 本タスクは仕様書修正のみのため、ステータスを `spec_created` へ更新する（`completed` は使用しない）

#### Step 1-C: 関連タスクテーブル更新

- `grep -rn "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" .claude/skills/*/references/` で関連仕様書を検索する
- 検出された全仕様書の関連タスクテーブルを更新する

#### Step 1-D: topic-map.md 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js` を実行して topic-map.md を再生成する（P2/P27対策）
- 仕様書に変更があれば必ず再生成を実行する（セクション追加だけでなく、削除・更新も再生成トリガーに含める）

#### Step 2: システム仕様更新

- 本タスクでは仕様書の同期ルール自体が更新対象のため、以下を更新する:
  - task-workflow.md: 未タスク参照同期ルール強化内容の反映
  - spec-update-workflow.md: 3点同期チェックリストの追加（該当する場合）
  - lessons-learned.md: 本タスクで得た教訓の追加（該当する場合）

### Task 12-3: ドキュメント更新履歴 & artifacts.json 更新

- documentation-changelog.md を作成する
- 更新した全仕様書の変更内容を記録する
- 各Step の完了結果を詳細に記録する（P4対策: 漏れの可視化）
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れ0件を記録する
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` を実行し、baseline/current を分離記録する
- artifacts.json / outputs/artifacts.json の双方で Phase 12 ステータスを同期更新する
- **P4対策**: 全Step確認完了後に初めて「完了」と記載する。全Step確認前に「完了」と記載しない

### Task 12-4: 未タスク検出

- `unassigned-task-detection.md` を作成する（**0件でも必須**）
- 検出した未タスクがある場合は3ステップ全てを完了する（P3/P38対策）:
  1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下ではない）
  2. task-workflow.md の残課題テーブルに登録する
  3. 関連仕様書に参照リンクを追加する
- 未タスクが0件の場合も「0件」としてレポートを出力する

### Task 12-5: スキルフィードバックレポート

- skill-feedback-report.md を作成する（**改善点0件でも必須**）
- Phase 12 運用での改善提案を記録する
- 改善提案がない場合も「改善点なし」としてレポートを出力する

## SubAgent分担

| SubAgent   | 担当                                                  |
| ---------- | ----------------------------------------------------- |
| SubAgent-D | Task 12-1, 12-3, 12-5（実装ガイド・更新履歴・FB）     |
| SubAgent-A | Task 12-2 Step 1-A 〜 1-C（タスク完了記録・テーブル） |
| SubAgent-B | Task 12-2 Step 1-D, Step 2（topic-map・仕様更新）     |
| SubAgent-C | Task 12-4（未タスク検出）                             |

**P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。

## 参照資料

### システム仕様（aiworkflow-requirements + task-specification-creator）

| 参照資料                  | パス                                                                               | 内容                             |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| リソースマップ            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                   | 必要仕様の探索起点               |
| トピックマップ            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                      | セクション単位の参照位置特定     |
| タスクワークフロー        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`               | 未タスク参照同期ルール           |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`             | 同種タスク失敗例と予防策         |
| パターン集                | `.claude/skills/aiworkflow-requirements/references/patterns.md`                    | Phase 12漏れの再発防止パターン   |
| 品質基準                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`        | 品質ゲートとテスト要件           |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`     | Step 1-A/1-B/1-C/Step 2 要件     |
| 未タスクガイドライン      | .claude/skills/task-specification-creator/references/unassigned-task-guidelines.md | 未タスク管理3ステップ            |
| Phase 11/12ガイド         | .claude/skills/task-specification-creator/references/phase-11-12-guide.md          | Phase 11/12 実行ガイド           |
| LOGS.md（requirements）   | .claude/skills/aiworkflow-requirements/LOGS.md                                     | タスク完了記録（requirements側） |
| LOGS.md（creator）        | .claude/skills/task-specification-creator/LOGS.md                                  | タスク完了記録（creator側）      |
| SKILL.md（requirements）  | .claude/skills/aiworkflow-requirements/SKILL.md                                    | スキル変更履歴（requirements側） |
| SKILL.md（creator）       | .claude/skills/task-specification-creator/SKILL.md                                 | スキル変更履歴（creator側）      |
| acceptance-criteria       | `outputs/phase-1/acceptance-criteria.md`                                           | Phase 1 成果物                   |
| requirements-definition   | `outputs/phase-1/requirements-definition.md`                                       | Phase 1 成果物                   |
| scope-definition          | `outputs/phase-1/scope-definition.md`                                              | Phase 1 成果物                   |
| architecture-design       | `outputs/phase-2/architecture-design.md`                                           | Phase 2 成果物                   |
| sync-rule-design          | `outputs/phase-2/sync-rule-design.md`                                              | Phase 2 成果物                   |
| baseline-current-template | `outputs/phase-5/baseline-current-template.md`                                     | Phase 5 成果物                   |
| design-deviation-record   | `outputs/phase-5/design-deviation-record.md`                                       | Phase 5 成果物                   |
| operation-checklist       | `outputs/phase-5/operation-checklist.md`                                           | Phase 5 成果物                   |
| specification-updates     | `outputs/phase-5/specification-updates.md`                                         | Phase 5 成果物                   |
| refactoring-report        | `outputs/phase-8/refactoring-report.md`                                            | Phase 8 成果物                   |
| quality-report            | `outputs/phase-9/quality-report.md`                                                | Phase 9 成果物                   |
| final-review-result       | `outputs/phase-10/final-review-result.md`                                          | Phase 10 成果物                  |
| manual-test-result        | `outputs/phase-11/manual-test-result.md`                                           | Phase 11 成果物                  |

### aiworkflow-requirements 抽出ログ（Progressive Disclosure）

1. `indexes/resource-map.md` で「ガイドライン」「タスクワークフロー」を起点に対象仕様を選定。
2. `indexes/topic-map.md` で `task-workflow.md` / `lessons-learned.md` / `patterns.md` の参照位置を特定。
3. Phase 12 で必須となる仕様抽出結果を `spec-update-summary.md` へ転記する。

### aiworkflow-requirements 抽出完全性チェック

| カテゴリ                   | 参照仕様                                                                                               | 判定   | 反映先                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| タスク運用ルール           | `references/task-workflow.md`                                                                          | 必須   | Task 12-2 Step 1-A/1-C         |
| 教訓・再発防止             | `references/lessons-learned.md`, `references/patterns.md`                                              | 必須   | Task 12-1, Task 12-3           |
| 品質ゲート                 | `references/quality-requirements.md`                                                                   | 必須   | 完了条件, 統合テスト連携       |
| 探索インデックス           | `indexes/resource-map.md`, `indexes/topic-map.md`                                                      | 必須   | 参照資料, 抽出ログ             |
| 仕様作成規約               | `references/spec-guidelines.md`                                                                        | 必須   | Task 12-2 Step 2               |
| API/UI/DB/セキュリティ個別 | `references/api-*.md`, `references/ui-ux-*.md`, `references/database-*.md`, `references/security-*.md` | 非該当 | コード変更なし（仕様書タスク） |

### タスク固有参照

| 参照資料               | パス                                                                             | 内容               |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------ |
| Phase 11成果物         | phase-11-manual-test.md                                                          | 手動テスト検証結果 |
| Phase 10成果物         | phase-10-final-review.md                                                         | 最終判定結果       |
| Phase 9成果物          | phase-9-quality-assurance.md                                                     | 品質検証結果       |
| Phase 8成果物          | phase-8-refactoring.md                                                           | リファクタ結果     |
| Phase 7成果物          | phase-7-coverage-check.md                                                        | ゲート判定結果     |
| Phase 6成果物          | phase-6-test-expansion.md                                                        | 検証拡充結果       |
| Phase 5成果物          | phase-5-implementation.md                                                        | 仕様書更新手順     |
| Phase 2成果物          | phase-2-design.md                                                                | 設計基準           |
| Phase 1成果物          | phase-1-requirements.md                                                          | 要件定義           |
| 未タスク指示書（原本） | docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md | 元の未タスク指示書 |
| 完了タスク（発見元）   | docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md          | 教訓の発見元タスク |

## 統合テスト連携

- Phase 11 の手動テスト結果を implementation-guide.md Part 2 に反映する
- 検証コマンド実行結果を spec-update-summary.md に記録する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                 | 仕様参照先                                       |
| ------------------ | ------------------------ | ------------------------------------------------ |
| セキュリティ       | 非該当（コード変更なし） | aiworkflow-requirements: security-\*.md          |
| UI/UX              | 非該当（仕様書タスク）   | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | 非該当（コード変更なし） | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 非該当（コード変更なし） | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 非該当（DB変更なし）     | aiworkflow-requirements: database-\*.md          |
| エラーハンドリング | 非該当（コード変更なし） | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 非該当（コード変更なし） | aiworkflow-requirements: quality-requirements.md |
| アクセシビリティ   | 非該当（UI実装なし）     | aiworkflow-requirements: ui-ux-\*.md             |
| テスタビリティ     | 必須（手順の実行可能性） | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                 | 仕様参照先 |
| -------------------------- | ------------------------ | ---------- |
| フロントエンド（Renderer） | 非該当（コード変更なし） | -          |
| バックエンド（Main）       | 非該当（コード変更なし） | -          |
| IPC通信                    | 非該当（コード変更なし） | -          |
| Preload/セキュリティ       | 非該当（コード変更なし） | -          |
| ローカルストレージ         | 非該当（DB変更なし）     | -          |

## 実行手順

### Step 1: 実装ガイド作成（Task 12-1）

1. `outputs/phase-12/implementation-guide.md` を作成する
2. Part 1（中学生レベル）を記述する — 日常例え必須
3. Part 2（技術者レベル）を記述する — 検証コマンド実行手順、チェックリスト使用方法、更新対象ファイル一覧を含む
4. P1/P2/P3/P4/P25/P27/P29 の再発防止策を Part 2 に記載する

### Step 2: システム仕様書更新（Task 12-2）

1. **Step 1-A**: 以下の5ファイルを順に更新する
   - 該当仕様書（task-workflow.md）にタスク完了記録を追加する
   - `aiworkflow-requirements/LOGS.md` を更新する
   - `task-specification-creator/LOGS.md` を更新する
   - `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
   - `task-specification-creator/SKILL.md` の変更履歴を更新する
2. **Step 1-B**: 実装状況テーブルを `spec_created` へ更新する（仕様書修正のみタスク）
3. **Step 1-C**: `grep -rn "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" .claude/skills/*/references/` で関連仕様書を検索し、全て更新する
4. **Step 1-D**: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js` を実行して topic-map.md を再生成する
5. **Step 2**: task-workflow.md / spec-update-workflow.md / lessons-learned.md を更新する（該当箇所のみ）

### Step 3: ドキュメント更新履歴作成（Task 12-3）

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 更新した全仕様書の変更内容を1ファイルずつ記録する
3. 各Step の完了結果を詳細に記録する
4. `outputs/phase-12/spec-update-summary.md` を作成する
5. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する
6. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` を実行し、baseline/current を記録する
7. artifacts.json / outputs/artifacts.json の Phase 12 ステータスを同期更新する
8. **P4対策**: 全Step完了を確認してから「完了」と記載する

### Step 4: 未タスク検出（Task 12-4）

1. 本タスク実行中に検出した未タスクを一覧化する
2. `outputs/phase-12/unassigned-task-detection.md` を作成する（0件でも必須）
3. 未タスクがある場合は3ステップを全て完了する:
   - `docs/30-workflows/unassigned-task/` に指示書を作成する
   - task-workflow.md の残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する

### Step 5: スキルフィードバック（Task 12-5）

1. `outputs/phase-12/skill-feedback-report.md` を作成する（改善点0件でも必須）
2. Phase 12 運用プロセスの改善提案を記録する

## 成果物

| 成果物               | パス                                          | 説明                                   | 必須 |
| -------------------- | --------------------------------------------- | -------------------------------------- | ---- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md      | Part 1（日常例え）+ Part 2（技術詳細） | ✅   |
| ドキュメント更新履歴 | outputs/phase-12/documentation-changelog.md   | Step別更新記録                         | ✅   |
| 未タスク検出レポート | outputs/phase-12/unassigned-task-detection.md | 未タスク件数と詳細（0件でも出力）      | ✅   |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md     | 改善提案（0件でも出力）                | ✅   |
| 仕様更新サマリー     | outputs/phase-12/spec-update-summary.md       | 検証コマンド結果と更新概要             | ✅   |

## 完了条件

### Task 12-1 完了条件

- [ ] implementation-guide.md Part 1 に日常例えによる概念説明が記載されている
- [ ] implementation-guide.md Part 2 に検証コマンド3種の実行手順が記載されている
- [ ] implementation-guide.md Part 2 に3点同期チェックリストの使い方が記載されている
- [ ] implementation-guide.md Part 2 に更新対象ファイル一覧が記載されている

### Task 12-2 完了条件

- [ ] Step 1-A: LOGS.md が2ファイル（aiworkflow-requirements + task-specification-creator）とも更新されている（P1/P25対策）
- [ ] Step 1-A: SKILL.md が2ファイル（aiworkflow-requirements + task-specification-creator）とも変更履歴が更新されている（P29対策）
- [ ] Step 1-A: task-workflow.md にタスク完了記録が追加されている
- [ ] Step 1-B: 実装状況テーブルのステータスが `spec_created` へ更新されている
- [ ] Step 1-C: `grep` で検出された全仕様書の関連タスクテーブルが更新されている
- [ ] Step 1-D: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js` が実行され topic-map.md が再生成されている（P2/P27対策）
- [ ] Step 2: 本タスクで変更した仕様書の同期ルールが反映されている
- [ ] `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements` が `Skill is valid!` を返している
- [ ] `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator` が `Skill is valid!` を返している

### Task 12-3 完了条件

- [ ] documentation-changelog.md に更新した全仕様書の変更内容が記録されている
- [ ] documentation-changelog.md に各Step の完了結果が詳細に記録されている
- [ ] spec-update-summary.md に検証コマンド実行結果が記録されている
- [ ] `verify-unassigned-links.js` の結果（`ALL_LINKS_EXIST`）が記録されている
- [ ] `audit-unassigned-tasks.js` の baseline/current 分離結果が記録されている
- [ ] artifacts.json / outputs/artifacts.json の Phase 12 ステータスが同期更新されている
- [ ] 「完了」記載は全Step確認後に行われている（P4対策）

### Task 12-4 完了条件

- [ ] unassigned-task-detection.md が作成されている（0件でも必須）
- [ ] 検出した未タスクは3ステップ（指示書 → 残課題テーブル → 参照リンク）が全て完了している（P3/P38対策）
- [ ] 未タスク指示書は `docs/30-workflows/unassigned-task/` に配置されている（`tasks/` 直下ではない）（P38対策）

### Task 12-5 完了条件

- [ ] skill-feedback-report.md が作成されている（改善点0件でも必須）

### 全体完了条件

- [ ] 成果物5件が全て生成されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認
2. 実行タスク実施（Task 12-1 〜 12-5）
3. 成果物作成
4. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で完了状態を明記している

## 次Phase

Phase 13（PR作成）へ進む。
