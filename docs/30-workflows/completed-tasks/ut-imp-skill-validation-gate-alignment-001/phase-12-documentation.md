# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                 |
| Phase     | 12                                                                                         |
| 名称      | ドキュメント更新                                                                           |
| 目的      | 実装内容をシステム要件ドキュメントに反映し、技術理解を促進し、未完了タスクを検出・記録する |
| 前提Phase | Phase 11（手動テスト検証）完了                                                             |
| 次Phase   | Phase 13（PR作成）                                                                         |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。Phase 12 は最も漏れが発生しやすい Phase であるため、事前チェックと完了確認を徹底する。

## 事前チェック【必須】

Phase 12 実行前に `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する:

| ID  | 落とし穴                                     | 対策                                                                   |
| --- | -------------------------------------------- | ---------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements と task-specification-creator の両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                      | `generate-index.js` を実行                                             |
| P3  | 未タスク管理の3ステップ不完全                | (1)指示書作成 → (2)残課題テーブル登録 → (3)関連仕様書リンク追加        |
| P4  | documentation-changelog への早期「完了」記載 | 全 Step 確認後に記載                                                   |
| P25 | LOGS.md 2ファイル更新漏れ（P1再発）          | Phase 12 チェックリストで明示的にチェック                              |
| P27 | topic-map.md 再生成トリガーの判断ミス        | 仕様書に変更があれば必ず再生成を実行（追加・削除・更新いずれも対象）   |
| P28 | スキルフィードバックレポート未作成           | 改善点がなくても作成必須                                               |
| P29 | SKILL.md 変更履歴の更新漏れ                  | LOGS.md とは別に SKILL.md も更新                                       |
| P43 | サブエージェントの rate limit 中断           | 仕様書更新は3ファイル以下/エージェントに分割                           |

## 実行タスク

- Task 1: 実装ガイド作成【必須】
- Task 2: システムドキュメント更新【必須】
- Task 3: ドキュメント更新履歴と artifacts.json 更新【必須】
- Task 4: 未タスク検出【必須】
- Task 5: スキルフィードバックレポート作成【必須】

## 参照資料

| 参照資料                     | パス                                                                                                  | 内容                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義             | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md`                | 受入基準（AC-001〜AC-006）     |
| Phase 2 設計                 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-2-design.md`                      | 検証経路統一設計               |
| Phase 3 設計レビュー結果     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-3/`                       | 設計レビュー判定・MINOR指摘    |
| Phase 4 テスト成果物         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/`                       | テスト観点・テストケース設計   |
| Phase 5 実装成果物           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                       | 統一ルール・運用ルール定義     |
| Phase 6 テスト拡充成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/`                       | 拡充テストと回帰結果           |
| Phase 7 カバレッジ成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                       | カバレッジ判定結果             |
| Phase 8 リファクタ成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/`                       | 重複排除・表現統一結果         |
| Phase 9 品質保証成果物       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/`                       | 品質ゲート結果                 |
| Phase 10 最終レビュー結果    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/`                      | Go/No-Go判定結果               |
| Phase 11 手動テスト結果      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md` | 手動検証の実行結果             |
| Phase 11 ウォークスルーログ  | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/walkthrough-log.md`    | 手順書ウォークスルーの記録     |
| spec-update-workflow.md      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | 検証コマンド運用の正本         |
| phase-11-12-guide.md         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                           | Phase 11/12 ガイド             |
| LOGS.md (aiworkflow)         | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                      | タスク完了記録（1箇所目）      |
| LOGS.md (task-spec-creator)  | `.claude/skills/task-specification-creator/LOGS.md`                                                   | タスク完了記録（2箇所目）      |
| SKILL.md (aiworkflow)        | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                     | 変更履歴（1箇所目）            |
| SKILL.md (task-spec-creator) | `.claude/skills/task-specification-creator/SKILL.md`                                                  | 変更履歴（2箇所目）            |
| task-workflow.md             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | 残課題台帳の登録先             |
| lessons-learned.md           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 苦戦箇所の反映先               |
| skills-process.md            | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                     | `quick_validate.js` 運用基準   |
| implementation-patterns.md   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | Phase 12 検証チェーン基準      |
| 教訓集（ルール）             | `.claude/rules/06-known-pitfalls.md`                                                                  | P1/P2/P3/P4/P25/P27/P28/P29    |
| generate-index.js            | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                    | topic-map.md 再生成スクリプト  |
| generate-doc-changelog.js    | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js`               | 更新履歴生成スクリプト         |
| unassigned-task-guidelines   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  | 未タスク指示書フォーマット基準 |

## 実行手順

### Task 1: 実装ガイド作成【必須】

**成果物**: `outputs/phase-12/implementation-guide.md`

2パート構成で実装ガイドを作成する。

#### Part 1: 概念説明（初学者・中学生レベル）

1. 以下の日常例え（必須）を使って概念を説明する:

   > **「テストの採点基準が先生によって違う問題を、共通ルールブックで解決する」**
   >
   > - 今まではA先生（`.py` スクリプト）とB先生（`.js` スクリプト）がそれぞれ独自の採点基準で採点していた
   > - 同じテスト答案なのに、先生によって点数が変わることがあった
   > - 共通の採点基準表（`quick_validate.js` に統一）を作って、誰が採点しても同じ点数になるようにした
   > - さらに、減点（Error = 必ず直す）と注意（Warning = 条件該当時に対応）の違いを明確にした

2. 以下の概念を専門用語を使わずに説明する:
   - **検証コマンドの統一**: 「同じ入力なら同じ結果」が常に成り立つ仕組み
   - **Warning と Error の違い**: 「直さないと不合格（Error）」と「知っておくべき注意点（Warning）」の区別
   - **Warning の3段階分類**: 「気にしなくてよい（許容）」「見守る（要監視）」「すぐ直す（要対応）」
   - **実行経路の統一**: 検証の入口を1つにまとめることで混乱を防ぐ

#### Part 2: 技術者向け実装詳細

3. 以下の構成で技術詳細を作成する:
   - **検証コマンド一覧**: `quick_validate.js`, `verify-unassigned-links.js`, `audit-unassigned-tasks.js` の仕様（入力・出力・判定ロジック）
   - **判定基準**: Error / Warning / Info の分類基準と対応方針
   - **Warning 分類ロジック**: 許容 / 要監視 / 要対応の条件定義
   - **実行経路統一ルール**: `.py` と `.js` の使い分けルール（Phase 5 成果物から転記）
   - **Phase 12 への統合方法**: テンプレートのコマンド列と統合手順
   - **運用ルール変更時の更新手順**: 運用ルールを変更する場合に更新すべきファイル一覧

4. Phase 5 の成果物から実際のルール内容を引用・転記する
5. Phase 11 の手動テスト結果から実データ（Warning 件数、分類結果）を引用する

### Task 2: システムドキュメント更新【必須】

`spec-update-workflow.md` 準拠で実施する。

#### Step 1-A: タスク完了記録

1. **該当仕様書にタスク完了記録を追加する**:
   - `spec-update-workflow.md` のタスク完了セクションに UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 の記録を追加する
   - `phase-11-12-guide.md` のタスク完了セクションに UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 の記録を追加する

2. **LOGS.md を2ファイル同時に更新する（P1/P25対策）**:

   ```bash
   # 更新対象（2ファイル両方を同時更新すること）
   .claude/skills/aiworkflow-requirements/LOGS.md
   .claude/skills/task-specification-creator/LOGS.md
   ```

   記載内容:

   ```markdown
   | 2026-02-26 | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 | skill-creator検証ゲート整合化 | 完了 |
   ```

   確認コマンド:

   ```bash
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/aiworkflow-requirements/LOGS.md
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/task-specification-creator/LOGS.md
   ```

3. **SKILL.md を2ファイル同時に更新する（P29対策）**:

   ```bash
   # 更新対象（2ファイル両方を同時更新すること）
   .claude/skills/aiworkflow-requirements/SKILL.md
   .claude/skills/task-specification-creator/SKILL.md
   ```

   確認コマンド:

   ```bash
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/aiworkflow-requirements/SKILL.md
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/task-specification-creator/SKILL.md
   ```

#### Step 1-C: 関連タスクテーブル更新

4. 関連仕様書を検索し、タスク完了を反映する:

   ```bash
   grep -rn "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/*/references/
   ```

5. 検索で見つかった仕様書のうち、タスクステータステーブルを持つファイルのステータスを「完了」に更新する
6. `task-workflow.md` の残課題テーブルに本タスクが登録されている場合、ステータスを「完了」に更新する

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

7. 仕様書に変更があったため topic-map.md を再生成する:

   ```bash
   node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
   ```

   - セクションの追加・削除・更新のいずれかがあれば再生成が必要（P27対策）
   - 本タスクでは `spec-update-workflow.md` と `phase-11-12-guide.md` に変更があるため、再生成必須

8. 再生成後、`git diff` で topic-map.md の変更差分を確認し、期待どおりの更新が行われたことを検証する

#### Step 2: システム仕様更新（条件付き）

9. 検証経路統一ルールは新規運用ルール追加に該当するため、以下のシステム仕様書の更新を検討する:
   - `spec-update-workflow.md` に Phase 5 で定義した実行経路統一ルールが反映済みであることを確認する
   - `phase-11-12-guide.md` に Phase 5 で定義した検証コマンド優先順位が反映済みであることを確認する

10. `lessons-learned.md` に本タスクの苦戦箇所を追記する:
    - 苦戦箇所 1: `quick_validate.py`（.codex配下）と `quick_validate.js`（repo配下）の実行経路の違いにより、検証結果が異なった
    - 苦戦箇所 2: aiworkflow-requirements の Warning 大量発生により Error の検出が困難だった
    - 対策: 実行経路を `quick_validate.js` に統一し、Error 優先表示ルールを導入した

11. 更新要否の判断結果を `documentation-changelog.md` に記録する

### Task 3: ドキュメント更新履歴 & artifacts.json 更新【必須】

**成果物**: `outputs/phase-12/documentation-changelog.md`

1. 更新履歴生成スクリプトを実行する:

   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/ut-imp-skill-validation-gate-alignment-001
   ```

2. スクリプト出力をベースに、以下の情報を手動で補完する:
   - 各仕様書の変更理由（「なぜ変更が必要だったか」）
   - 変更の証跡（「どの Phase の成果物に基づく変更か」）

3. 以下の Step ごとに完了結果を記録する:

   ```markdown
   ## Step別完了結果

   ### Step 1-A: タスク完了記録

   - [ ] 該当仕様書更新: (完了 / 未完了)
   - [ ] LOGS.md (aiworkflow-requirements): (完了 / 未完了)
   - [ ] LOGS.md (task-specification-creator): (完了 / 未完了)
   - [ ] SKILL.md (aiworkflow-requirements): (完了 / 未完了)
   - [ ] SKILL.md (task-specification-creator): (完了 / 未完了)

   ### Step 1-C: 関連タスクテーブル

   - [ ] grep 検索実行: (完了 / 未完了)
   - [ ] 該当ファイル更新: (完了 / 未完了 / 該当なし)

   ### Step 1-D: topic-map.md 再生成

   - [ ] generate-index.js 実行: (完了 / 未完了)

   ### Step 2: システム仕様更新

   - [ ] 更新要否判断: (必要 / 不要)
   - [ ] 更新実施: (完了 / 未完了 / 該当なし)
   - [ ] lessons-learned.md 追記: (完了 / 未完了)
   ```

4. **P4対策**: 全 Step の完了結果が記録されるまで、documentation-changelog.md に「Phase 12 完了」と記載しない

5. `artifacts.json` の全 Phase ステータスを実際の状態に更新する:
   - Phase 1-11: `completed`
   - Phase 12: `in_progress` → 全タスク完了後に `completed`
   - Phase 13: `pending`

### Task 4: 未タスク検出【必須】

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

1. 以下のソースから未タスク候補を収集する:
   - Phase 3（設計レビュー）の MINOR 指摘事項
   - Phase 10（最終レビュー）の MINOR 指摘事項
   - Phase 11（手動テスト）で発見された改善候補
   - コードコメント内の TODO / FIXME / HACK / XXX:

     ```bash
     grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/skill-creator/scripts/quick_validate.js
     grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/task-specification-creator/references/spec-update-workflow.md
     grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/task-specification-creator/references/phase-11-12-guide.md
     ```

2. 未タスク検出レポートを作成する（**0件の場合も「未タスク: 0件」と明記する**）

3. 未タスクが検出された場合、以下の3ステップを **全て** 完了する（P3対策）:

   | ステップ | 内容                                                        | 確認方法                  |
   | -------- | ----------------------------------------------------------- | ------------------------- |
   | 1        | `docs/30-workflows/unassigned-task/` に未タスク指示書を作成 | ファイルの存在確認        |
   | 2        | `task-workflow.md` の残課題テーブルに登録                   | `grep` で登録を確認       |
   | 3        | 関連仕様書に未タスク指示書への参照リンクを追加              | `grep` で参照リンクを確認 |

4. 検出件数と処理結果をレポートに記録する

5. 0件の場合のテンプレート:

   ```markdown
   # 未タスク検出レポート

   ## タスクID

   UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001

   ## 検出結果: 0件

   ### 確認した情報源

   - Phase 3 MINOR 指摘: 0件
   - Phase 10 MINOR 指摘: 0件
   - Phase 11 発見事項: 0件
   - コードコメント（TODO/FIXME/HACK/XXX）: 0件

   ### 結論

   未完了タスクは検出されなかった。
   ```

### Task 5: スキルフィードバックレポート作成【必須】

**成果物**: `outputs/phase-12/skill-feedback-report.md`

P28 対策: 改善点がなくても省略不可。

1. 本タスクの実行を通じて得られたスキル改善点を収集する:
   - `skill-creator` スキルの `quick_validate.js` に関する改善提案
   - `task-specification-creator` スキルの検証手順に関する改善提案
   - `aiworkflow-requirements` スキルの大量 Warning 対策に関する改善提案
   - ワークフロー全体（Phase 1-12 の実行プロセス）に関する改善提案

2. 以下のフォーマットで記録する:

   ```markdown
   # スキルフィードバックレポート

   ## タスクID

   UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001

   ## 対象スキル

   - skill-creator
   - task-specification-creator
   - aiworkflow-requirements

   ## 改善提案

   | No  | 対象スキル | カテゴリ | 提案内容 | 優先度   |
   | --- | ---------- | -------- | -------- | -------- |
   | 1   | （対象）   | （分類） | （内容） | 高/中/低 |

   ## 改善提案がない場合

   「今回の実行を通じて、追加の改善点は検出されなかった」と記載する

   ## 総評

   (タスク実行を通じた所感を記載)
   ```

## 統合テスト連携

- Task 1 の実装ガイドは Phase 11 の手動テスト結果を実データとして引用する
- Task 2 の仕様更新は Phase 5 の実装成果物に基づく
- Task 3 の更新履歴は Task 1-2 の完了結果を記録する（全 Step 完了後に記載）
- Task 4 の未タスク検出は Phase 3/10/11 のレビュー結果をソースとする
- Task 5 のスキル改善は Phase 1-11 の全体的な実行経験をソースとする

## 成果物

| 成果物                     | パス                                                                                                         | 必須 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ---- |
| 実装ガイド                 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md`      | YES  |
| ドキュメント更新履歴       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/documentation-changelog.md`   | YES  |
| 未タスク検出レポート       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/unassigned-task-detection.md` | YES  |
| スキルフィードバック       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/skill-feedback-report.md`     | YES  |
| 未タスク指示書（条件付き） | `docs/30-workflows/unassigned-task/*.md`                                                                     | 条件 |

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（初学者・非技術者向け）が作成されている
  - [ ] 日常例え（「テストの採点基準が先生によって違う問題」）が含まれている
  - [ ] 中学生レベルで理解可能な説明になっている
- [ ] Part 2（開発者・技術者向け）が作成されている
  - [ ] `quick_validate.js` の仕様（入力・出力・判定ロジック）が記載されている
  - [ ] Warning 分類ロジック（許容 / 要監視 / 要対応の条件）が記載されている
  - [ ] Phase 12 への統合方法（テンプレートのコマンド列）が記載されている
- [ ] Phase 11 の手動テスト結果から実データが引用されている

### Task 2: システムドキュメント更新

- [ ] Step 1-A: 該当仕様書にタスク完了記録が追加されている
- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` が更新されている
- [ ] Step 1-A: `task-specification-creator/LOGS.md` が更新されている（**P1, P25 対策: 2ファイル両方**）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴が更新されている
- [ ] Step 1-A: `task-specification-creator/SKILL.md` 変更履歴が更新されている（**P29 対策**）
- [ ] Step 1-C: `grep -rn` で関連仕様書を検索し、該当箇所を更新している
- [ ] Step 1-D: `generate-index.js` を実行して topic-map.md を再生成している（**P2, P27 対策**）
- [ ] Step 2: システム仕様更新の要否判断が記録されている
- [ ] Step 2: `lessons-learned.md` に苦戦箇所が追記されている

### Task 3: ドキュメント更新履歴 & artifacts.json

- [ ] `documentation-changelog.md` が作成されている
- [ ] 各 Step の完了結果が詳細に記録されている（**P4 対策: 全 Step 確認後に記載**）
- [ ] `artifacts.json` の全 Phase ステータスが更新されている

### Task 4: 未タスク検出

- [ ] `unassigned-task-detection.md` が作成されている（**0件でも必須**）
- [ ] Phase 3/10/11 のレビュー結果とコードコメントから未タスク候補が収集されている
- [ ] 検出件数が記録されている（0件の場合も明記）
- [ ] 未タスクが検出された場合、3ステップが全完了している（**P3 対策**）:
  - [ ] (1) `docs/30-workflows/unassigned-task/` に指示書作成
  - [ ] (2) `task-workflow.md` 残課題テーブルに登録
  - [ ] (3) 関連仕様書に参照リンク追加

### Task 5: スキルフィードバック

- [ ] `skill-feedback-report.md` が作成されている（**P28 対策: 改善点がなくても省略不可**）
- [ ] 対象スキル（skill-creator, task-specification-creator, aiworkflow-requirements）が明記されている

### 全体

- [ ] 必須成果物4件（実装ガイド、更新履歴、未タスク検出、スキルフィードバック）が全て作成されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている

## 漏れやすいポイント表

| ID  | ポイント                  | 対策                                                                   | チェック |
| --- | ------------------------- | ---------------------------------------------------------------------- | -------- |
| P1  | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements と task-specification-creator の両方を同時更新 | [ ]      |
| P2  | topic-map.md 再生成忘れ   | `generate-index.js` を実行                                             | [ ]      |
| P3  | 未タスク3ステップ不完全   | (1)指示書 → (2)台帳 → (3)リンク                                        | [ ]      |
| P4  | 早期「完了」記載          | 全 Step 確認後に記載                                                   | [ ]      |
| P29 | SKILL.md 変更履歴漏れ     | LOGS.md とは別に SKILL.md も更新                                       | [ ]      |

## 実行結果（2026-02-26）

| Task                    | 結果                           | 証跡                                            |
| ----------------------- | ------------------------------ | ----------------------------------------------- |
| Task 1 実装ガイド       | 完了（Part 1/Part 2作成）      | `outputs/phase-12/implementation-guide.md`      |
| Task 2 システム仕様更新 | 完了（Step 1-A〜1-D / Step 2） | `outputs/phase-12/spec-update-summary.md`       |
| Task 3 更新履歴作成     | 完了                           | `outputs/phase-12/documentation-changelog.md`   |
| Task 4 未タスク検出     | 完了                           | `outputs/phase-12/unassigned-task-detection.md` |
| Task 5 フィードバック   | 完了                           | `outputs/phase-12/skill-feedback-report.md`     |

補足:

- `artifacts.json` は Phase 11/12 を `completed` へ更新済み。
- Phase 10 MINOR由来の未タスク2件は `unassigned-task/` に配置され、target-file監査で `current=0` を確認済み。

## 次のPhase

Phase 13: PR作成（`phase-13-pr-creation.md`）に進む。
