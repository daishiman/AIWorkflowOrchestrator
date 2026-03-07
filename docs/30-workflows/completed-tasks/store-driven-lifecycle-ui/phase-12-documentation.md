# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| 機能名     | store-driven-lifecycle-ui             |
| タスクID   | TASK-10A-F                            |
| タスク名   | スキルライフサイクルUIのStore駆動統合 |
| 作成日     | 2026-03-07                            |
| ステータス | completed                             |

## 目的

TASK-10A-F の実装成果を文書化し、システム仕様書を最新状態に同期する。未タスクの検出とスキル改善提案を行い、知見を資産化する。

## 修正対象ファイル

| ファイル                                                               | 変更内容                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | `window.electronAPI` 直接呼び出しを agentSlice アクション経由に変更 |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | `window.electronAPI` 直接呼び出しを agentSlice アクション経由に変更 |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | Store駆動に統一された API 呼び出しパターンへの整合                  |

## 実行タスク

### Task 1: 実装ガイド作成

`outputs/phase-12/implementation-guide.md` を以下の2パート構成で作成する。

#### Part 1: 概念説明（中学生レベル）

- **日常の例え話**: 「お店の注文システム」に例えて説明する
  - 変更前（直接呼び出し）: お客さん（画面）が注文係（Store）を通さずに直接厨房（electronAPI）に行って「カレー作って！」と言う。他の店員（他の画面）はお客さんが何を注文したか分からない
  - 変更後（Store経由）: お客さん（画面）が注文係（Store）に「カレーお願い」と伝え、注文係が厨房（electronAPI）に伝達する。注文票（Store状態）に全注文が記録されるので、全店員が状況を把握できる
- **なぜ必要か**: 全画面で同じ情報を共有するため。1つの画面でスキルを作成したら、他の画面にも自動で反映される
- **何をするか**: SkillCreateWizard と SkillAnalysisView の2つの画面で、注文係（Store）を通すように変更する
- 専門用語は使わず、「なぜ必要か → 何をするか」の順で説明する

#### Part 2: 技術者向け実装詳細

以下の項目を記述する:

- **TypeScript型定義**: `CreateSkillAction`, `AnalyzeSkillAction`, `ImproveSkillAction`, `AutoImproveSkillAction` の型シグネチャ
- **APIシグネチャと使用例**:
  - agentSlice に追加されたアクション関数のシグネチャ
  - 各アクションの呼び出し例（Before/After コード比較）
  - 個別セレクタ（`useCreateSkill()`, `useAnalyzeSkill()` 等）の使用方法
- **エラーハンドリング**:
  - Store アクション内でのエラーキャッチとstate更新パターン
  - Renderer側でのerror状態の表示方法
  - リトライ可能なエラーと不可能なエラーの区別
- **設定可能なパラメータ一覧**:
  - スキル作成時のパラメータ（スキル名、説明、設定オブジェクト）
  - 分析実行時のパラメータ（対象スキルID、分析オプション）
  - 改善適用時のパラメータ（改善提案ID、適用オプション）

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

以下のファイルを全て更新する:

| 更新対象ファイル                                     | 更新内容                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| 該当する `ui-ux-*.md` 仕様書                         | TASK-10A-F の完了タスクセクションを追加する                            |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | TASK-10A-F の完了記録を追加する                                        |
| `.claude/skills/task-specification-creator/LOGS.md`  | TASK-10A-F の完了記録を追加する（**P1/P25対策: 2ファイル両方を更新**） |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに TASK-10A-F のエントリを追加する                     |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルに TASK-10A-F のエントリを追加する                     |

#### Step 1-B: 実装状況テーブル更新

- `arch-state-management.md` の agentSlice アクション一覧に、新規追加されたスキルライフサイクル系アクションのステータスを「実装済み」に更新する

#### Step 1-C: 関連タスクテーブル更新

- `grep -rn "TASK-10A-F" references/` を実行し、TASK-10A-F に言及している全仕様書のステータスを更新する
- `grep -rn "TASK-10A" references/` を実行し、TASK-10A シリーズの進捗テーブルで TASK-10A-F を「完了」に更新する

#### Step 1-D: topic-map.md 再生成

- `node generate-index.js` を実行して `topic-map.md` を再生成する（**P2/P27対策: 仕様書に変更があれば必ず再生成**）

#### Step 2: システム仕様更新

Store に新規アクションを追加したため、以下のシステム仕様を更新する:

| 更新対象ファイル                        | 更新内容                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `arch-state-management.md`              | agentSlice のアクション定義にスキルライフサイクル系アクション（createSkill, analyzeSkill, improveSkill, autoImproveSkill）を追加する |
| `ui-ux-skill-center.md`（該当する場合） | SkillCreateWizard と SkillAnalysisView の状態管理方式を「Store駆動」に更新する                                                       |

### Task 3: documentation-changelog.md 作成

`outputs/phase-12/documentation-changelog.md` を作成し、以下を記録する:

- 更新した全仕様書のファイルパスと変更内容
- Step 1-A の完了結果（2つのLOGS.md、2つのSKILL.md、ui-ux仕様書の更新内容）
- Step 1-B の完了結果（実装状況テーブルの変更箇所）
- Step 1-C の完了結果（grep結果と更新した関連タスクテーブル）
- Step 1-D の完了結果（topic-map.md 再生成の実行結果）
- Step 2 の完了結果（システム仕様の変更箇所）
- **P4対策: 全Stepの確認が完了するまで「完了」と記載しない**

### Task 4: 未タスク検出レポート作成

`outputs/phase-12/unassigned-task-detection.md` を作成する。検出件数が0件でも必ず出力する。

検出した未タスクがある場合は、以下の3ステップを全て完了する（**P3対策**）:

| ステップ | 作業内容                                                                                        | 成果物                                  |
| -------- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1        | `tasks/unassigned-task/` に指示書を作成する                                                     | `tasks/unassigned-task/UT-10A-F-XXX.md` |
| 2        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する | task-workflow.md の該当テーブル行       |
| 3        | 関連仕様書に参照リンクを追加する                                                                | 該当仕様書内のリンク                    |

### Task 5: スキルフィードバックレポート作成

`outputs/phase-12/skill-feedback-report.md` を作成する。改善点がない場合でも「改善点なし」として出力する（**P28対策**）。

以下の観点でフィードバックを記録する:

| 観点                       | 確認内容                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------- |
| task-specification-creator | Phase 仕様書のテンプレートに Store 駆動統合パターンの記述例を追加すべきか               |
| aiworkflow-requirements    | agentSlice の設計パターンドキュメントに「直接呼び出し排除」のガイドラインを追加すべきか |
| 既知の落とし穴             | 新たに発見された pitfall パターンがあるか                                               |

## 参照資料

### 実装・証跡

| 資料名               | パス                                                                   | 用途                            |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| SkillCreateWizard    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | Before/After コード比較の参照先 |
| useSkillAnalysis     | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | Before/After コード比較の参照先 |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | 統合パターンの参照先            |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 | Store アクション定義の参照先    |
| Phase 11 成果物      | `outputs/phase-11/`                                                    | 手動テスト結果の参照先          |

### システム仕様

| 資料名                     | パス                                                                                 | 用途                                     |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`            | Phase 文書の構造を揃える                 |
| spec-update-workflow       | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`          | 仕様書更新の手順を確認する               |
| unassigned task guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク検出のルールを確認する           |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Store 構成と agentSlice の設計を確認する |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | Phase 12 の記録先を確認する              |
| task-workflow-rules        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`           | 未タスク化する判定基準を確認する         |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 再発防止カードを確認する                 |

### 前提Phase成果物

| 資料名          | パス                | 用途                           |
| --------------- | ------------------- | ------------------------------ |
| Phase 1 成果物  | `outputs/phase-1/`  | 要件定義の出力を参照する       |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計の出力を参照する           |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装の出力を参照する           |
| Phase 6 成果物  | `outputs/phase-6/`  | テスト拡充の出力を参照する     |
| Phase 7 成果物  | `outputs/phase-7/`  | カバレッジ確認の出力を参照する |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタリング出力を参照する |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質保証の出力を参照する       |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビューの出力を参照する   |
| Phase 11 成果物 | `outputs/phase-11/` | 手動テスト結果を参照する       |

## 実行手順

1. Task 1: `outputs/phase-12/implementation-guide.md` を Part 1（概念説明）→ Part 2（技術詳細）の順で作成する
2. Task 2: Step 1-A → Step 1-B → Step 1-C → Step 1-D → Step 2 の順でシステム仕様書を更新する
3. Task 3: `outputs/phase-12/documentation-changelog.md` に全 Step の結果を記録する。**全 Step 完了前に「完了」と記載しない**
4. Task 4: `outputs/phase-12/unassigned-task-detection.md` を作成する。検出された未タスクがある場合は3ステップ全てを完了する
5. Task 5: `outputs/phase-12/skill-feedback-report.md` を作成する

## Phase 12 漏れパターン対策チェックリスト

| 対策ID | 対象Pitfall | チェック内容                                                                                                                      | 確認 |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ---- |
| L-01   | P1/P25      | `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の2ファイルを両方更新した | [x]  |
| L-02   | P2/P27      | `node generate-index.js` を実行して `topic-map.md` を再生成した                                                                   | [x]  |
| L-03   | P3          | 未タスクの3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）を全て完了した                                       | [x]  |
| L-04   | P4          | documentation-changelog に全 Step の確認結果を記録してから「完了」と記載した                                                      | [x]  |
| L-05   | P26         | システム仕様書を Phase 12 完了時点で更新した（PRマージを待たない）                                                                | [x]  |
| L-06   | P28         | スキルフィードバックレポートを作成した（改善点なしでも出力）                                                                      | [x]  |
| L-07   | P29         | SKILL.md の変更履歴テーブルを2ファイル両方更新した                                                                                | [x]  |
| L-08   | P43         | 仕様書更新は3ファイル以下/エージェントに分割した                                                                                  | [x]  |

## 統合テスト連携

- Task 1 の実装ガイドが Phase 5 の実装内容と整合していることを確認する
- Task 2 のシステム仕様更新が Phase 10 のレビュー指摘を反映していることを確認する
- Task 4 の未タスク検出が Phase 10 の MINOR 指摘を全て未タスク仕様書に変換していることを確認する

## 成果物

| 成果物               | パス                                            | 説明                                   |
| -------------------- | ----------------------------------------------- | -------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（概念説明）/ Part 2（技術詳細） |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 全仕様書の変更内容記録                 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスクの検出結果（0件でも出力）      |
| スキル改善レポート   | `outputs/phase-12/skill-feedback-report.md`     | task-spec / aiworkflow への改善提案    |
| 仕様更新サマリ       | `outputs/phase-12/spec-update-summary.md`       | Step 1-A 〜 Step 2 の更新結果サマリ    |

## 完了条件

- [x] implementation-guide.md が Part 1（中学生レベル概念説明、日常例え話含む）/ Part 2（技術詳細）の2構成で作成されている
- [x] documentation-changelog.md に全 Step（1-A, 1-B, 1-C, 1-D, 2）の完了結果が記録されている
- [x] LOGS.md が `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の2ファイル両方で更新されている
- [x] SKILL.md が `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の2ファイル両方で更新されている
- [x] `topic-map.md` が `node generate-index.js` で再生成されている
- [x] unassigned-task-detection.md が作成されている（0件でも出力）
- [x] 検出された未タスクがある場合、3ステップ（指示書・残課題テーブル・関連仕様書リンク）が全て完了している
- [x] skill-feedback-report.md が作成されている（改善点なしでも出力）
- [x] aiworkflow 正本へ反映する更新先が具体ファイル名で記述されている
- [x] Phase 12 漏れパターン対策チェックリスト（L-01 〜 L-08）が全項目チェック済みである
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 1: 実装ガイド作成
3. Task 2: システム仕様書更新（Step 1-A → 1-B → 1-C → 1-D → Step 2）
4. Task 3: documentation-changelog.md 作成
5. Task 4: 未タスク検出レポート作成
6. Task 5: スキルフィードバックレポート作成
7. Phase 12 漏れパターン対策チェックリストの全項目確認
8. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 13: PR作成
