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
| ステータス | pending                                       |

## 目的

実装ガイドの作成・システム仕様の更新・ドキュメント変更履歴の記録・未タスク検出を行い、
本タスクの知見を次の開発者・AIへ引き継げる状態にする。

## 実行タスク

- 実装ガイドの作成（中学生レベルの概念説明を含む）
- システム仕様更新サマリーの作成
- ドキュメント変更履歴の記録
- 未タスク検出レポートの作成

## 実行手順

### 1. 実装ガイドの作成

`outputs/phase-12/implementation-guide.md` に以下を記述する:

**中学生レベルの概念説明**:

> スキルを作るとき、「どんなスキルを作るか」を事前に計画します（`structurePlan`）。
> この計画には「スキルの名前」「何のためのスキルか（purpose）」「どんな機能か（description）」が入っています。
>
> 以前は、計画を立てても「計画を捨てる」コード（`void structurePlan`）があったので、
> 実際に作られるスキルの説明書（SKILL.md）にユーザーが入力した内容が反映されませんでした。
>
> 今回の修正で「計画を捨てる」コードを削除し、計画の内容を SKILL.md の生成に使うようにしました。

**技術者向け説明**:

- `SkillCreatorService.ts` の行 126 `void structurePlan` を削除
- `plan` オブジェクト生成ロジック（:180-194）を `structurePlan !== null` による分岐に変更
- `create` モード時は `structurePlan.skillName` / `structurePlan.purpose` / `structurePlan.description` を使用
- `collaborative` / `orchestrate` モードはフォールバック（`options.name` / `options.description`）を継続使用
- `anchors ?? []` による null 安全な処理

### 2. システム仕様更新サマリー

`outputs/phase-12/system-spec-update-summary.md` に以下を記述する:

- 変更されたシステム仕様: `SkillCreatorService.createSkill()` の `create` モード動作
- current facts:
  - `create` モード: `structurePlan` の内容を `plan` に反映して `generate_skill_md.js` に渡す
  - 他モード: `options.name` / `options.description` のフォールバック `plan` を使用
- baseline との差分:
  - 変更前: `void structurePlan` でデータを破棄し、固定値 `plan` を使用
  - 変更後: `structurePlan !== null` の場合に内容を `plan` に反映

### 3. ドキュメント変更履歴

`outputs/phase-12/documentation-changelog.md` に以下を記述する:

- 変更日: 2026-04-15
- 変更内容: `SkillCreatorService.ts` の `void structurePlan` 削除・`plan` 分岐実装
- 依存関係: TASK-SW-STRUCT-001（前提）→ TASK-SW-STRUCT-002（本タスク）

### 4. 未タスク検出レポート

`outputs/phase-12/unassigned-task-detection.md` に以下を記録する:

- `structurePlan.purpose` の LLM 統合（現状は `options.description` の固定値、将来タスク）
- `structurePlan.features` の実装（現状は未使用、将来タスク）
- `plan.workflow.phases` / `plan.workflow.tasks` の詳細実装（現状は空配列）
- SKILL.md のより詳細なカスタマイズ（`generate_skill_md.js` スクリプトへのさらなる情報提供）

## 統合テスト連携【必須】

| 確認項目       | 参照先                                   |
| -------------- | ---------------------------------------- |
| 品質 PASS 確認 | `outputs/phase-9/quality-report.md`      |
| 手動テスト確認 | `outputs/phase-11/manual-test-result.md` |

## 多角的チェック観点

| 観点         | チェック内容                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| 引き継ぎ品質 | 次の開発者が実装内容を理解できる説明になっているか                                 |
| 未タスク検出 | LLM 統合・features 実装等のフォローアップが未タスクとして記録されているか          |
| 仕様更新     | `create` モードと他モードの動作の違いが current facts として正確に記述されているか |

## 成果物

| 成果物                   | パス                                             | 説明                             |
| ------------------------ | ------------------------------------------------ | -------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`       | 中学生レベル・技術者レベルの説明 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` | current facts・baseline 差分     |
| ドキュメント変更履歴     | `outputs/phase-12/documentation-changelog.md`    | 変更内容・依存関係記録           |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`  | フォローアップ必要な観点         |

## 完了条件

- [ ] 実装ガイド（中学生レベル概念説明を含む）が作成済み
- [ ] システム仕様更新サマリーが作成済み
- [ ] ドキュメント変更履歴が記録済み
- [ ] 未タスク検出レポートが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装ガイド作成（中学生レベル説明）
2. システム仕様更新サマリー作成
3. ドキュメント変更履歴記録
4. 未タスク検出レポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 13: PR作成（blocked）
