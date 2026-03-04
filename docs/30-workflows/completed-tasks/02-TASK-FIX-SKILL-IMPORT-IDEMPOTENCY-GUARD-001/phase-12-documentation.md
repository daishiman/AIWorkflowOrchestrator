# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 12                                                |
| 機能名     | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001       |
| タスク名   | 重複インポート時の冪等性保証と不要IPC呼び出し抑止 |
| 前提Phase  | Phase 11                                          |
| 後続Phase  | PR作成                                            |
| 作成日     | 2026-03-04                                        |
| ステータス | completed                                         |

## 目的

実装内容・苦戦箇所・未タスクを仕様と成果物へ反映する。

## 背景

既存実装では再インポート要求が繰り返し Main に到達し、冪等成功であっても無駄なIPC/ログ発生が残っていた。

## SubAgent分担

| SubAgent | 担当                                   |
| -------- | -------------------------------------- |
| A        | IPC Handler（`skill:import` 冪等契約） |
| B        | Renderer Store（再インポート抑止）     |
| C        | 回帰テスト設計・Phase 12仕様同期       |

## 実行タスク

- 実装ガイド作成: Part 1（中学生向け）/ Part 2（技術者向け）を作成する
- システム仕様更新: aiworkflow-requirements 正本へ反映する
- 苦戦箇所記録: 再発防止の簡潔手順を記録する
- 未タスク抽出: 0件でも検出レポートを作成する
- フィードバック作成: スキル改善案を成果物化する

## 参照資料

| 参照資料               | パス                                         | 説明               |
| ---------------------- | -------------------------------------------- | ------------------ |
| 要件定義書             | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物     |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物     |
| スコープ定義           | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物     |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物     |
| API仕様                | `outputs/phase-2/api-specification.md`       | Phase 2 成果物     |
| 状態設計               | `outputs/phase-2/state-design.md`            | Phase 2 成果物     |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物     |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`           | Phase 5 成果物     |
| リファクタリングログ   | `outputs/phase-8/refactoring-log.md`         | Phase 8 成果物     |
| 互換性チェック         | `outputs/phase-8/compatibility-check.md`     | Phase 8 成果物     |
| 品質レポート           | `outputs/phase-9/quality-report.md`          | Phase 9 成果物     |
| リスク登録簿           | `outputs/phase-9/risk-register.md`           | Phase 9 成果物     |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`    | Phase 10 成果物    |
| 修正指示               | `outputs/phase-10/fix-instructions.md`       | Phase 10 成果物    |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`     | Phase 11 成果物    |
| スクリーンショット索引 | `outputs/phase-11/screenshot-index.md`       | Phase 11 成果物    |
| 依存Phase 6 成果物     | `outputs/phase-6/`                           | Phase 6 依存成果物 |
| 依存Phase 7 成果物     | `outputs/phase-7/`                           | Phase 7 依存成果物 |

## システム仕様（aiworkflow-requirements）

> 実装・検証の前に以下の正本仕様を確認し、仕様差分があれば Phase 12 で必ず同期すること。

| 参照資料         | パス                                                                            | 内容                                                      |
| ---------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 参照起点         | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                  | タスク種別から必要仕様を絞り込む                          |
| API/IPC 正本     | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | `skill:import` 契約と成功判定の整合を確認                 |
| Interface 正本   | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | `ImportedSkill` の型契約を確認                            |
| 状態管理正本     | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | 冪等ガードと Store 同期契約を確認                         |
| UI仕様正本       | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | Skill Center 表示契約と導線を確認                         |
| セキュリティ正本 | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | IPC 境界防御（sender 検証・入力境界保護・権限境界）を確認 |
| Electron API防御 | .claude/skills/aiworkflow-requirements/references/security-api-electron.md      | Preload公開面の境界防御を確認                             |
| エラー処理正本   | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 冪等早期終了時のエラー状態を確認                          |
| タスク運用正本   | .claude/skills/aiworkflow-requirements/references/task-workflow.md              | `completed` 更新運用を確認                                |
| 抽出網羅性監査   | outputs/phase-2/aiworkflow-requirements-extraction-audit.md                     | 必須仕様と条件付き仕様の判定結果を確認                    |

## 実行手順

### Step 0: 参照固定

1. `spec-update-workflow.md` を開き、Step 1-A〜1-E と Step 2 の実行順を固定する。
2. `resource-map.md` と依存Phase成果物を照合し、更新対象仕様を絞る。

### Step 1-A: タスク完了記録（必須）

- 完了タスクセクションと関連ドキュメント導線を更新する。
- `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` を同一ターンで更新する。

### Step 1-B: 実装状況テーブル更新（必須）

- 実装完了タスクは `completed`、仕様書作成のみは `spec_created` に更新する。
- 対象仕様に実装状況テーブルがある場合は必ず反映する。

### Step 1-C: 関連タスクテーブル更新（必須）

- `task-workflow.md` と関連仕様の「関連タスク」「未タスク候補」を更新する。
- `grep -rl "TASK_ID_OR_NAME" .claude/skills/aiworkflow-requirements/references/` で見落としを防止する。

### Step 1-D: インデックス再生成（必須）

- 仕様更新後に `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する。
- 必要時は task-specification-creator 側の index も再生成する。

### Step 1-E: 未タスク検出・リンク整合（条件付き必須）

- 未タスク候補が1件以上なら `docs/30-workflows/unassigned-task/` へ指示書を作成する。
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認する。

### Step 2: システム仕様更新（条件付き）

- 新規インターフェース/型/API契約変更がある場合のみ `references/*.md` を更新する。
- 変更がない場合は `documentation-changelog.md` に「更新なし」と根拠を記録する。

### Step 3: 成果物検証

1. `implementation-guide.md` の Part 1/Part 2 要件を満たすことを確認する。
2. `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を作成する（0件・改善なしでも出力）。
3. 完了条件を検証して Phase 13 へ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物               | パス                                            | 内容         |
| -------------------- | ----------------------------------------------- | ------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part1/Part2  |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | 仕様反映内容 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 更新履歴     |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残課題一覧   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善提案     |

## 完了条件

- [x] Task 1: `outputs/phase-12/implementation-guide.md` に Part 1（中学生向け）/ Part 2（技術者向け）を作成した
- [x] Step 1-A: 完了タスク記録、関連ドキュメント導線、LOGS.md 2ファイル更新を実施した
- [x] Step 1-B: 実装状況テーブルを `completed` または `spec_created` に更新した
- [x] Step 1-C: 関連タスク/未タスク候補テーブルを更新した
- [x] Step 1-D: index 再生成（topic-map/keywords同期）を実施した
- [x] Step 1-E: 未タスク検出結果を反映し、`verify-unassigned-links` で整合を確認した
- [x] Step 2: 仕様更新の実施有無と根拠を `documentation-changelog.md` に記録した
- [x] 必須5成果物（implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report）を揃えた
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに `completed` に更新すること。

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

## Phase実行記録

| 項目         | 記録                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 実行タスク   | 完了（Task 1〜5 実施）                                                                       |
| 発見事項     | Phase 11 はTC表 + カバレッジマトリクスが無いと機械検証で失敗するため、テンプレート補強が必要 |
| 引き継ぎ事項 | Phase 13 は未実施（コミット/PR禁止要件により保留）                                           |

## 次のPhase

Phase 13 PR作成
