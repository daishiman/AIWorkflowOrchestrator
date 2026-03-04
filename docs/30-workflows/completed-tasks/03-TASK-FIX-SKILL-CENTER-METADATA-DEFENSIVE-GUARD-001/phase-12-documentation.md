# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| 機能名     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 |
| タスク名   | SkillCenter UI の欠損メタデータ耐性強化            |
| 前提Phase  | Phase 11                                           |
| 後続Phase  | PR作成                                             |
| 作成日     | 2026-03-04                                         |
| ステータス | completed                                          |

## 目的

実装内容・苦戦箇所・未タスクを仕様と成果物へ反映する。

## 背景

実データに型期待を満たさない項目が混在し、undefined.length と toLowerCase 例外で画面全体が落ちる事象が発生した。

## SubAgent分担

| SubAgent | 担当                                               |
| -------- | -------------------------------------------------- |
| A        | Hook防御（`useSkillCenter` / `useFeaturedSkills`） |
| B        | Component防御（`SkillCard` / `SkillDetailPanel`）  |
| C        | 欠損入力テスト・Phase 12仕様同期                   |

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

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
```

## Phase実行記録

| 項目         | 記録                               |
| ------------ | ---------------------------------- |
| 実行タスク   | 完了                               |
| 発見事項     | 主要課題は仕様化済み・追加阻害なし |
| 引き継ぎ事項 | 次Phaseへ成果物を引き継ぎ済み      |

## 次のPhase

Phase 13 PR作成
