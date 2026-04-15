# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 11: 手動テスト              |
| 次Phase    | Phase 13: PR作成                  |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

task-specification-creator の Phase 12 必須 6 成果物を canonical filename で揃え、
skill準拠と aiworkflow-requirements の current facts を documentation に固定する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件              |
| -------- | --------------------------------------- | --------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可            |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可            |
| C        | `system-spec-update-summary.md`         | Part 2 確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可            |
| E        | `unassigned-task-detection.md`          | D と並列可            |
| F        | `skill-feedback-report.md`              | E と並列可            |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行  |

## Task 12-1: 実装ガイド作成（2パート構成）【必須】

### Part 1（初学者・中学生レベル）

**日常生活での例え話**:

> `generate_skill_md.js`は「設計図（plan JSON）」を受け取ってSKILL.mdを書き出すスクリプトです。
> 今回の修正は、設計図を渡し忘れていたのを修正するもので、
> ちょうど「工場に材料を渡し忘れていた」状態を直すようなイメージです。
> これまでは工場（スクリプト）に材料（plan JSON）を渡さずに動かそうとして、
> 毎回エラーになっていました。
> 修正後は正しく材料を渡せるようになり、SKILL.mdが正常に生成されます。

**なぜ必要か**:

`generate_skill_md.js`は`--plan`と`--output`の2引数が必須です。
これまで`SkillCreatorService`は`--path`だけを渡していたため、
スクリプトは常に失敗し、`ensureSkillMdExists`のフォールバックのみが動作していました。
フォールバックはTask一覧セクションやYAMLフロントマターを生成しないため、
SKILL.mdの品質が低下していました。

**何をするか**:

`SkillCreatorService.generateSkillMd`メソッドを修正し、
descriptionから最小JSON（planオブジェクト）を組み立て、
tmpファイルに書き込んでから`--plan`/`--output`引数で渡すようにします。
`finally`節でtmpファイルを必ず削除します。

### Part 2（開発者・技術者レベル）

**必須要素**:

- 変更ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行152-165）
- 変更ファイル: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- planオブジェクトの最小構造: `{ name: string; description: string }` をJSONシリアライズしてtmpファイルへ書き込む
- tmpファイルパスはUUIDを含む一意なパスを使用し、`finally`節で`fs.unlink`により削除する
- `spawnFile`の引数: `["--plan", tmpPath, "--output", path.join(skillDir, "SKILL.md")]`
- `generateResult.success`かつSKILL.mdが存在する場合のみフォールバックをスキップする
- `fs.unlink`の失敗は握りつぶし（non-fatal）、メインの戻り値に影響させない
- 設定可能パラメータ/定数: スクリプト名`"generate_skill_md.js"`、引数名`"--plan"`・`"--output"`の3系統で整理する

成果物: `outputs/phase-12/implementation-guide.md`

## Task 12-2: システム仕様更新（2ステップ）【必須】

### Step 1-A: 完了タスク記録

- `docs/30-workflows/skill-creator-workflow-fix-lane/index.md` に完了記録を追加する
- `artifacts.json` の status を `pending` から `completed` に更新する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に完了タスク記録を追加する
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` を current facts に同期する
- 更新要否の判定理由（current facts / no-op / update）を記録する

### Step 1-B: 実装状況テーブル更新

- `TASK-SC-FIX-GENERATE-SKILL-MD-001` のステータスを `completed` として記録する
- `generate_skill_md.js`への`--plan`/`--output`引数修正完了を記録する

### Step 2: システム仕様更新

- `SkillCreatorService.generateSkillMd`のシグネチャとplan JSON構造を`system-spec-update-summary.md`に記録する
- tmpファイル生成・`--plan`/`--output`渡し・`finally`cleanup の current facts と no-op / update 判定を残す
- `artifacts.json` と `outputs/artifacts.json` の同期結果を final evidence として記録する

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整備したファイルを列挙する
- 修正した2ファイルと追加・更新したPhase文書、current / baseline 区別を記録する
- 変更一覧は current facts と baseline facts を分けて記録する

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に 0件でも結論を残す
- `generate_skill_md.js`の引数仕様修正以外に派生した未解決課題がないことを確認する
- 1件以上の候補が出た場合は、関連ファイル調査結果と formalize path を記録する
- 該当なしの場合も「該当なし」と current facts を明記する

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に改善観点を残す
- スクリプト呼び出し引数の仕様をSkillCreatorService実装者が参照できる場所に明記する提案などを記録する
- 論点→採用思考法→結論の対応表を入れ、30思考法の traceability を残す

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で6成果物の存在、validator結果、artifacts parity、planned wording 0件を束ねる
- PASS / FAIL と不足点を明示し、PASS の断言は根拠が揃った場合のみ行う

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 資料名               | パス                                                                                   | 説明                   |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| 設計書               | `outputs/phase-2/design-document.md`                                                   | 修正方針B案の記録      |
| 実装記録             | `outputs/phase-5/implementation-record.md`                                             | current contractの根拠 |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`                                              | 境界ケース             |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                   | AC対応表               |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                                                | 最小複雑性の判断       |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`                                                    | 準拠根拠               |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                              | 総合判定               |
| Phase 12ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須成果物基準         |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | current facts の基準   |
| ワークフロー正本     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | current facts の基準   |

## 成果物

| 成果物               | パス                                                     | 説明               |
| -------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | 参照仕様と同期判定 |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`            | 変更一覧           |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 残課題有無         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | skill改善案        |
| Phase 12準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物確認        |

## 完了条件

- [ ] 必須6成果物が揃っている
- [ ] 計画系文言が除去されている
- [ ] skill準拠結果が記録されている
- [ ] 中学生レベルの概念説明がimplementation-guideに含まれている
- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 矛盾なし・漏れなし・整合性あり・依存関係整合の4条件をすべて満たしている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
