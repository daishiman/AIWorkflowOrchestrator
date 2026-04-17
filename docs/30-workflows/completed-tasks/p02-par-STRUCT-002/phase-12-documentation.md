# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 11                                      |
| 後続Phase  | Phase 13                                      |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 目的

実装ガイドの作成・システム仕様の更新・ドキュメント変更履歴の記録・未タスク検出を行い、
本タスクの知見を次の開発者・AIへ引き継げる状態にする。

## 実行タスク

- 実装ガイドの作成（中学生レベルの概念説明を含む）
- システム仕様更新サマリーの作成
- ドキュメント変更履歴の記録
- 未タスク検出レポートの作成
- スキルフィードバックレポートの作成
- Phase 12 準拠チェックの作成

## 実行手順

### 1. 実装ガイドの作成

`outputs/phase-12/TASK-SW-STRUCT-002-implementation-guide.md` に以下を記述する:

## Part 1: 中学生レベルの概念説明

- なぜ必要か: 設計図を最後まで使わないと、作られた SKILL.md に計画の中身が反映されないから
- たとえば: レシピを読んだのに捨てて別の手順で料理すると、味がずれるのと同じ
- 何をするか: `void structurePlan` を削除し、`structurePlan` の内容を SKILL.md 生成へ渡す
- 専門用語を使う場合は、直後に短く言い換える

## Part 2: 技術者向け実装ガイド

- `SkillCreatorService.ts` の行 126 `void structurePlan` を削除
- `plan` オブジェクト生成ロジック（:180-194）を `structurePlan !== null` による分岐に変更
- `generateSkillMd(skillDir: string, structurePlan: StructurePlanJson, signal?: AbortSignal): Promise<void>` のシグネチャと使用例を記述する
- 使用例: `createSkill()` 内で `await this.generateSkillMd(skillDir, structurePlan, operationSignal);` を呼び出し、null 時は `ensureSkillMdExists(...)` にフォールバックする
- `create` モード時は `structurePlan.skillName` / `structurePlan.purpose` / `structurePlan.description` を使用
- `collaborative` / `orchestrate` モードはフォールバック（`options.name` / `options.description`）を継続使用
- `anchors ?? []` による null 安全な処理
- エラーハンドリング: `generate_skill_md.js` 失敗時、SKILL.md 未生成時、例外時の 3 段階フォールバックを説明する
- エッジケース: `structurePlan === null`、`purpose` が空文字、`anchors` が未定義のときの挙動を説明する
- 設定可能なパラメータと定数:

| 項目                        | 内容                                     |
| --------------------------- | ---------------------------------------- |
| `options.name`              | フォールバック時のスキル名               |
| `options.description`       | フォールバック時の概要文                 |
| `structurePlan.skillName`   | create モードで反映するスキル名          |
| `structurePlan.purpose`     | trigger.description の元情報             |
| `structurePlan.description` | workflow.summary の元情報                |
| `anchors ?? []`             | `anchors` が未定義のときのフォールバック |

## 視覚証跡

- UI/UX変更なしのため Phase 11 スクリーンショット不要
- `outputs/phase-11/screenshots/.gitkeep` が存在する場合は削除する

### 2. システム仕様更新サマリー

`outputs/phase-12/TASK-SW-STRUCT-002-system-spec-update-summary.md` に以下を記述する:

#### Step 1-A: 仕様書完了記録

- 該当する仕様書に「完了タスク」セクションを追加
- 関連ドキュメントに Phase 12 の実装ガイドをリンク
- 変更履歴に 2026-04-16 の実装完了記録を追記

#### Step 1-B: 実装状況テーブル更新

- `completed` / `完了` の current facts を各 Phase に反映
- 仕様書作成のみの成果物がある場合は `spec_created` と区別する

#### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスク・未タスク候補のステータスを current facts に合わせる
- `TASK-SW-STRUCT-001` との依存関係を再確認して記録する

#### Step 2: システム仕様更新

- 変更されたシステム仕様: `SkillCreatorService.createSkill()` の `create` モード動作
- current facts:
  - `create` モード: `structurePlan` の内容を `plan` に反映して `generate_skill_md.js` に渡す
  - 他モード: `options.name` / `options.description` のフォールバック `plan` を使用
- baseline との差分:
  - 変更前: `void structurePlan` でデータを破棄し、固定値 `plan` を使用
  - 変更後: `structurePlan !== null` の場合に内容を `plan` に反映
- 新規インターフェース/型追加はないため、外部 API 仕様の更新は不要

### 3. ドキュメント変更履歴

`outputs/phase-12/TASK-SW-STRUCT-002-documentation-changelog.md` に以下を記述する:

- 変更日: 2026-04-16
- 変更内容: `SkillCreatorService.ts` の `void structurePlan` 削除・`plan` 分岐実装
- 依存関係: TASK-SW-STRUCT-001（前提）→ TASK-SW-STRUCT-002（本タスク）

### 4. 未タスク検出レポート

`outputs/phase-12/TASK-SW-STRUCT-002-unassigned-task-detection.md` に以下を記録する:

- `structurePlan.purpose` の LLM 統合（現状は `options.description` の固定値、将来タスク）
- `structurePlan.features` の実装（現状は未使用、将来タスク）
- `plan.workflow.phases` / `plan.workflow.tasks` の詳細実装（現状は空配列）
- SKILL.md のより詳細なカスタマイズ（`generate_skill_md.js` スクリプトへのさらなる情報提供）

### 5. スキルフィードバックレポート

`outputs/phase-12/TASK-SW-STRUCT-002-skill-feedback-report.md` に以下を記録する:

- ワークフロー改善点: Phase 12 の進め方で改善できる点
- 技術的教訓: `structurePlan` 接続、フォールバック、null 安全性で得られた知見
- スキル改善提案: task-specification-creator / aiworkflow-requirements への反映候補
- 改善点がない場合でも「改善点なし」と明記し、省略しない

### 6. 準拠チェック

`outputs/phase-12/TASK-SW-STRUCT-002-phase12-task-spec-compliance-check.md` に以下を記録する:

- Task 1〜6 の完了確認
- 6 成果物が task prefix 付きファイル名で揃っているかの確認
- planned wording（`仕様策定のみ` / `実行予定` 等）が残っていない確認
- Phase 12 の完了条件が全件満たされている確認

## 統合テスト連携【必須】

| 確認項目       | 参照先                                                      |
| -------------- | ----------------------------------------------------------- |
| 品質 PASS 確認 | `outputs/phase-9/TASK-SW-STRUCT-002-quality-report.md`      |
| 手動テスト確認 | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md` |

## 多角的チェック観点

| 観点         | チェック内容                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| 引き継ぎ品質 | 次の開発者が実装内容を理解できる説明になっているか                                 |
| 未タスク検出 | LLM 統合・features 実装等のフォローアップが未タスクとして記録されているか          |
| 仕様更新     | `create` モードと他モードの動作の違いが current facts として正確に記述されているか |

## 成果物

| 成果物                       | パス                                                                        | 説明                             |
| ---------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| 実装ガイド                   | `outputs/phase-12/TASK-SW-STRUCT-002-implementation-guide.md`               | 中学生レベル・技術者レベルの説明 |
| システム仕様更新サマリー     | `outputs/phase-12/TASK-SW-STRUCT-002-system-spec-update-summary.md`         | current facts・baseline 差分     |
| ドキュメント変更履歴         | `outputs/phase-12/TASK-SW-STRUCT-002-documentation-changelog.md`            | 変更内容・依存関係記録           |
| 未タスク検出レポート         | `outputs/phase-12/TASK-SW-STRUCT-002-unassigned-task-detection.md`          | フォローアップ必要な観点         |
| スキルフィードバックレポート | `outputs/phase-12/TASK-SW-STRUCT-002-skill-feedback-report.md`              | スキル使用感・改善提案           |
| Phase 12 準拠チェック        | `outputs/phase-12/TASK-SW-STRUCT-002-phase12-task-spec-compliance-check.md` | 必須要件の検証記録               |

## 完了条件

- [x] 実装ガイド（Part 1 / Part 2、視覚証跡の記載を含む）が作成済み
- [x] システム仕様更新サマリーが作成済み
- [x] ドキュメント変更履歴が記録済み
- [x] 未タスク検出レポートが作成済み（正式な未タスクは UT-001 のみ、その他は観察メモとして整理）
- [x] スキルフィードバックレポートが作成済み
- [x] Phase 12 準拠チェックが作成済み
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装ガイド作成（Part 1 / Part 2）
2. システム仕様更新サマリー作成（Step 1-A/B/C, Step 2）
3. ドキュメント変更履歴記録
4. 未タスク検出レポート作成
5. スキルフィードバックレポート作成
6. Phase 12 準拠チェック作成

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 13: PR作成
