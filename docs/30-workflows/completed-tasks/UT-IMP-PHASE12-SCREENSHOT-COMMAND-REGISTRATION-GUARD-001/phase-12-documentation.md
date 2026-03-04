# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| Phase      | 12                                                                                |
| 名称       | ドキュメント更新                                                                  |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001                          |
| 作成日     | 2026-03-04                                                                        |
| 依存       | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| ステータス | Draft                                                                             |

## 目的

本タスクの実装内容と検証結果を仕様・運用文書へ同期し、再利用可能な手順として固定する。あわせて未タスク検出とスキル改善記録を完了する。

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システム仕様書更新（Step 1-A〜1-G + Step 2）
- Task 3: ドキュメント更新履歴作成
- Task 4: 未タスク検出レポート作成
- Task 5: スキルフィードバックレポート作成

## 参照資料

| 資料                 | パス                                                                                    | 用途                 |
| -------------------- | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 11結果         | `outputs/phase-11/manual-test-result.md`                                                | 実行証跡の入力       |
| Phase 11証跡         | `outputs/phase-11/screenshot-index.md`                                                  | screenshot 対応表    |
| Phase 5成果物        | `outputs/phase-5/implementation-summary.md`                                             | 実装内容入力         |
| Phase 6成果物        | `outputs/phase-6/regression-matrix.md`                                                  | 回帰結果入力         |
| Phase 7成果物        | `outputs/phase-7/coverage-report.md`                                                    | 判定結果入力         |
| Phase 2成果物        | `outputs/phase-2/document-sync-matrix.md`                                               | 同期設計入力         |
| Phase 8成果物        | `outputs/phase-8/refactoring-log.md`                                                    | テンプレート入力     |
| Phase 9成果物        | `outputs/phase-9/quality-report.md`                                                     | 品質判定入力         |
| Phase 10成果物       | `outputs/phase-10/final-review-result.md`                                               | 最終ゲート入力       |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | Task 4 実行規約      |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Task 2 手順規約      |
| 技術文書ガイド       | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Task 1 記述規約      |
| 既知落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                    | Phase 12 事故防止    |
| aiworkflow抽出結果   | `outputs/phase-2/aiworkflow-spec-extraction.md`                                         | 必要仕様抽出の再確認 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                            | Phase 1 成果物       |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物       |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                                   | Phase 1 成果物       |
| 設計書               | `outputs/phase-2/architecture-design.md`                                                | Phase 2 成果物       |
| 検証コマンド設計     | `outputs/phase-2/verification-commands.md`                                              | Phase 2 成果物       |
| 変更差分一覧         | `outputs/phase-5/changed-files.md`                                                      | Phase 5 成果物       |
| 実行ログ             | `outputs/phase-5/command-run-log.md`                                                    | Phase 5 成果物       |
| 命名規約表           | `outputs/phase-8/naming-convention.md`                                                  | Phase 8 成果物       |
| 監査テンプレート     | `outputs/phase-8/audit-template.md`                                                     | Phase 8 成果物       |
| リスク評価           | `outputs/phase-9/risk-review.md`                                                        | Phase 9 成果物       |
| 最終レビューコメント | `outputs/phase-10/final-review-comments.md`                                             | Phase 10 成果物      |
| 発見課題             | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11 成果物      |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                                        | 内容                     |
| ------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| タスク台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録と残課題更新     |
| 教訓台帳      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 苦戦箇所と再利用手順更新 |
| 実装パターン  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 検証コマンド順序         |
| UI/UX機能仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | screenshot 証跡運用      |

## 実行手順

### Task 1: 実装ガイド作成（2パート）

#### Part 1: 初学者向け説明

- テーマ1: 「公開されたコマンド」の意味
  - 例え: 家の鍵を決まった場所へ置く運用
  - 説明: 置き場所を固定すると誰が見ても同じ手順で動ける
- テーマ2: 文書と実行の一致
  - 例え: レシピの手順番号と調理順序の一致
  - 説明: レシピと実作業が一致すると再現率が上がる
- テーマ3: 検証ログの役割
  - 例え: 体育祭の得点板
  - 説明: 結果を同じ形式で記録すると比較ができる

#### Part 2: 開発者向け説明

- scripts 追加仕様
  - key: `screenshot:skill-import-idempotency-guard`
  - value: `node scripts/capture-skill-import-idempotency-guard-screenshots.mjs`
- 文書同期仕様
  - 同期対象: workflow02 の Phase 11 / Phase 12
  - 記法: `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`
- エラーハンドリング
  - run 一覧でコマンド非表示の場合は scripts キー未登録を優先確認する
  - 実行失敗の場合は script ファイル存在と実行権限を確認する
  - coverage FAIL の場合は screenshot 欠落ケースを再取得する

### Task 2: システム仕様書更新

#### Step 1-A: 完了記録

- `task-workflow.md` に本タスクの完了記録を追加する。
- `lessons-learned.md` に苦戦箇所と再利用手順を追加する。

#### Step 1-B: 実装状況テーブル

- 本タスクの変更対象を `scripts登録` と `文書同期` の 2 行で追加する。

#### Step 1-C: 関連タスク更新

- unassigned 指示書への参照を完了タスク参照へ更新する。

#### Step 1-D: topic-map / index 更新

- `aiworkflow-requirements` 側インデックスを再生成する。
- 本workflowの `index.md` を再生成する。

#### Step 1-E: 未タスク検出

- `detect-unassigned-tasks` と `audit-unassigned-tasks` を実行する。
- `currentViolations.total` と `baselineViolations.total` を分離記録する。

#### Step 1-F: DevOps更新判定

- CI設定変更の有無を確認し、本タスクでは `該当なし` を記録する。

#### Step 1-G: 検証コマンド実行

1. `verify-all-specs`
2. `validate-phase-output`
3. `verify-unassigned-links`
4. `audit-unassigned-tasks --diff-from HEAD`

#### Step 1-H: 抽出仕様の妥当性確認

- `outputs/phase-2/aiworkflow-spec-extraction.md` に記載した仕様群が、今回の変更対象（scripts 登録・Phase 11/12 文書同期・検証ログ）を網羅しているか確認する。
- 不足仕様がある場合は同ファイルへ追記し、Task 2 の更新対象に追加する。

#### Step 2: スキル更新同期

- `task-specification-creator` と `aiworkflow-requirements` の `SKILL.md` / `LOGS.md` 更新要否を判定して記録する。

### Task 3: ドキュメント更新履歴作成

- 変更日、対象ファイル、変更内容、検証値を `documentation-changelog.md` へ記録する。

### Task 4: 未タスク検出レポート作成

- 未検出でも `0件` を明記する。
- 検出ありの場合は指示書作成、物理存在確認、台帳登録を同ターンで完了する。

### Task 5: スキルフィードバックレポート作成

- 成功点、改善点、次回改善候補を 3 区分で記録する。

### SubAgent分担（Atent Team）

| SubAgent | 担当範囲                   | 実行順序     |
| -------- | -------------------------- | ------------ |
| A        | 実装ガイド Part 1/2        | 並列開始     |
| B        | task-workflow 更新         | 並列開始     |
| C        | lessons-learned 更新       | 並列開始     |
| D        | 未タスク監査と検証ログ     | A/B/C 完了後 |
| E        | changelog と feedback 統合 | D 完了後     |

## 成果物

| 成果物               | パス                                            | 説明                       |
| -------------------- | ----------------------------------------------- | -------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1/2 のガイド          |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step実行結果               |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 更新台帳                   |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 監査結果                   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善記録                   |
| スキル準拠監査       | `outputs/phase-12/skill-compliance-audit.md`    | 2スキル準拠確認結果        |
| エレガント性レビュー | `outputs/phase-12/elegant-solution-review.md`   | 思考軸横断の整合性監査結果 |

## 完了条件

- [ ] Task 1 の Part 1 と Part 2 が作成されている
- [ ] Task 2 の Step 1-A〜1-G と Step 2 の結果が記録されている
- [ ] Task 3 の更新履歴が作成されている
- [ ] Task 4 の未タスク検出結果が記録されている
- [ ] Task 5 のフィードバックが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13 で PR 作成情報を整理する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## 統合テスト連携

| 連携対象      | 内容                                                            |
| ------------- | --------------------------------------------------------------- |
| Phase 11 証跡 | screenshot 実行と coverage 判定を同期して記録する               |
| Phase 12 更新 | 検証結果を task-workflow / lessons-learned へ同一ターン同期する |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
