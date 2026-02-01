# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 12         |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（2パート構成）
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。

| パート | 対象読者         | 内容                                                         |
| ------ | ---------------- | ------------------------------------------------------------ |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                           |
| Part 2 | 開発者・技術者   | 技術的な詳細（フィクスチャ構造・テストケース・ヘルパー関数） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を含める（例: 「境界値テストは制限速度ギリギリで走る車のテスト」のようなたとえ）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 2（技術者レベル）の必須要件**:

- 6種類の新規フィクスチャのディレクトリ構造と内容
- 34件のテストケース一覧（TC-063～TC-096）
- テストヘルパー関数のAPI仕様
- ギャップカバレッジマトリクス

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録【必須】

- [ ] `quality-e2e-testing.md` に TASK-8C-G 完了記録を追加（テスト件数、PASS結果）
- [ ] `claude-code-skills-overview.md` の skill-fixture-runner 情報更新（テスト拡張反映）
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加
- [ ] topic-map.md に新規セクションエントリを追加（該当する場合）

#### Step 1-B: 実装状況テーブル更新

本タスクはテストフィクスチャ追加のため、実装状況テーブルの更新は不要。

#### Step 1-C: 関連タスクテーブル更新

TASK-8C-F の関連ドキュメント内で、TASK-8C-G がリンクされている場合はステータスを更新する。

#### Step 2: システム仕様更新【条件付き】

本タスクはテストフィクスチャ追加のみのため、新規インターフェース/型の追加はない。

| 更新判断 | 結果     | 理由                                   |
| -------- | -------- | -------------------------------------- |
| Step 2   | **不要** | テストフィクスチャ追加のみ、IF変更なし |

`documentation-changelog.md` に「Step 2: 更新なし - テストフィクスチャ追加のみ」と記録すること。

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-8C-G

# Step 2: Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-8C-G \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

**0件の場合でも「検出された未タスク: 0件」として出力必須。**

## 参照資料

| 資料名                        | パス                                                                                | 説明                 |
| ----------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計書                | `outputs/phase-02/fixture-design.md`                                                | フィクスチャ設計     |
| Phase 5 実装サマリ            | `outputs/phase-05/implementation-summary.md`                                        | 実装済みフィクスチャ |
| Phase 6 テスト拡充            | `outputs/phase-06/test-expansion-result.md`                                         | 追加テスト一覧       |
| Phase 7 カバレッジ            | `outputs/phase-07/coverage-report.md`                                               | カバレッジ結果       |
| Phase 8 リファクタ            | `outputs/phase-08/refactoring-log.md`                                               | リファクタ内容       |
| Phase 9 品質レポート          | `outputs/phase-09/quality-report.md`                                                | 品質検証結果         |
| Phase 10 最終レビュー         | `outputs/phase-10/final-review-result.md`                                           | レビュー判定         |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                            | 手動テスト結果       |
| spec-update-workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | 仕様更新手順         |
| implementation-guide-template | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | ガイドテンプレート   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                               | 内容                     |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`         | 完了タスクテーブル更新   |
| スキル一覧    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md` | skill-fixture-runner更新 |

## 成果物

| 成果物               | パス                                          | 必須 | 説明                      |
| -------------------- | --------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 必須 | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 必須 | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 必須 | 検出結果（なしでも出力）  |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】quality-e2e-testing.md に完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.md にタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
