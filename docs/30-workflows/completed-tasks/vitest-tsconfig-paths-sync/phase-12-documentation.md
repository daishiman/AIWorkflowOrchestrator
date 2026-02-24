# Phase 12: ドキュメント更新 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 12                                  |
| 機能名    | vitest-tsconfig-paths-sync          |
| 作成日    | 2026-02-24                          |
| タスクID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 関連Issue | #875                                |
| 前Phase   | Phase 11（手動テスト検証）          |

## 目的

実装ガイドの作成、システム仕様書の更新、未タスクの検出を行い、実装成果を組織のナレッジベースに統合する。Phase 12 は漏れが最も発生しやすいPhaseであるため、必須4タスク（Task 1〜4）を軸に逐次確認し、品質改善タスク（Task 5）を含めて完了条件を満たすまで「完了」と記載しない。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 実装ガイド作成（2パート構成）

#### Part 1: 概念説明（中学生レベル）

- **対象読者**: 技術的背景を持たない人
- **必須要素**:
  - 日常の例え話で「なぜ4つの設定ファイルの同期が必要か」を説明する
    - 例: 「4つの連絡先リスト（スマホ・PC・タブレット・クラウド）を持っていて、1つだけ更新すると他が古いままになる。同期チェッカーは『全リストが一致しているか』を自動で確認する係」
  - 専門用語（exports, paths, alias, typesVersions）を使わずに概念を伝える
  - 「何が嬉しいのか」（メリット）を3つ以上列挙する
  - 図やフローチャートを ASCII アートで表現する

#### Part 2: 開発者向け実装詳細

- **対象読者**: TypeScript/Vitest に習熟した開発者
- **必須要素**:
  - `scripts/check-shared-module-sync.ts` の6つのチェック関数のAPI仕様
    - 関数名、引数、戻り値、例外
  - `vitest.config.ts` の変更内容（vitest-tsconfig-paths プラグイン設定）
  - `pnpm check:module-sync` コマンドのオプション一覧
  - エラーメッセージとその対処法（テーブル形式で3件以上）
  - 新しいサブパスを追加する際の手順（ステップバイステップ）
  - TypeScript の型定義・インターフェース（該当する場合）

- **成果物**: `outputs/phase-12/implementation-guide.md`

### Task 2: システム仕様書更新

> **P43対策**: サブエージェントへの委譲は3ファイル以下/エージェントに分割する

#### Step 1-A: タスク完了記録

以下のファイルを**全て**更新する:

| #   | 対象ファイル                                                                 | 更新内容                                                                               |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 完了タスクセクションに UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 を追加                      |
| 2   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 完了タスクセクションに UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 を追加                      |
| 3   | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | CI変更がある場合、完了タスクセクションに追加（CI変更がない場合はスキップし理由を記録） |
| 4   | `.claude/skills/aiworkflow-requirements/LOGS.md`                             | タスク完了ログエントリを追加                                                           |
| 5   | `.claude/skills/task-specification-creator/LOGS.md`                          | タスク完了ログエントリを追加（**P1/P25対策: 2ファイル両方**）                          |
| 6   | `.claude/skills/aiworkflow-requirements/SKILL.md`                            | 変更履歴テーブルに追加                                                                 |
| 7   | `.claude/skills/task-specification-creator/SKILL.md`                         | 変更履歴テーブルに追加                                                                 |

#### Step 1-B: 実装状況テーブル更新

- `architecture-monorepo.md` 内のモジュール同期に関するテーブルがある場合、ステータスを「実装済み」に更新する
- 該当テーブルが存在しない場合はスキップし、スキップ理由を記録する

#### Step 1-C: 関連タスクテーブル更新

- 以下のコマンドで関連仕様書を検索する:
  ```bash
  grep -rn "UT-FIX-TS-VITEST-TSCONFIG-PATHS-001" .claude/skills/*/references/
  ```
- 検索結果に含まれる仕様書の関連タスクテーブルを更新する
- 検索結果が0件の場合はスキップし、「関連タスクテーブル更新対象: 0件」と記録する

#### Step 1-D: topic-map.md 再生成

- **P2/P27対策**: 仕様書に変更があれば必ず実行する
- 実行コマンド:
  ```bash
  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
  ```
- 再生成後、差分を確認する:

  ```bash
  git diff -- .claude/skills/aiworkflow-requirements/indexes/topic-map.md
  ```

- **成果物**: `outputs/phase-12/system-docs-update-log.md`

### Task 3: documentation-changelog.md

- 更新した全仕様書の変更内容を1ファイルずつ記録する
- 各Step（1-A, 1-B, 1-C, 1-D）の完了結果を詳細に記録する
- **P4対策**: 全Step確認前に「完了」と記載しない。最後に全Stepの結果を確認してから「Phase 12 Task 3 完了」と記載する

- **成果物**: `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出

- **0件でも `unassigned-task-report.md` の作成は必須**
- 検出ソース（全て確認する）:
  1. Phase 3（設計レビュー）の指摘事項
  2. Phase 10（最終レビュー）の指摘事項
  3. Phase 11（手動テスト）の結果から判明した課題
  4. コードコメント内の `TODO` / `FIXME`（`grep -rn "TODO\|FIXME" scripts/check-shared-module-sync.ts`）
  5. テストの `.skip` マーカー
- 検出した未タスクは**P3対策で3ステップ全完了**:
  1. `docs/30-workflows/unassigned-task/` に指示書を作成する
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
  3. 関連仕様書に参照リンクを追加する
- 0件の場合: 「検出ソース5件を全て確認した結果、未タスク0件」と記録する

- **成果物**: `outputs/phase-12/unassigned-task-report.md`

### Task 5: スキルフィードバックレポート

- **P28対策**: 改善点がなくても「改善点なし」としてレポートを作成する
- 検討観点:
  - タスク仕様書作成スキルの改善点
  - Phase 1-13 ワークフローの改善点
  - チェックスクリプト開発で得た知見
- 改善点がある場合: 具体的な提案（what / why / how）を記述する
- 改善点がない場合: 「検討した結果、改善点なし」と記述する

- **成果物**: `outputs/phase-12/skill-feedback-report.md`

## 参照資料

| 資料名                          | パス                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| 設計書                          | `outputs/phase-2/design-document.md`                                           |
| 設計レビュー報告書              | `outputs/phase-3/design-review-result.md`                                      |
| 実装サマリー                    | `outputs/phase-5/implementation-summary.md`                                    |
| テスト拡充報告書                | `outputs/phase-6/test-enhancement-report.md`                                   |
| カバレッジ報告書                | `outputs/phase-7/coverage-report.md`                                           |
| リファクタリング報告書          | `outputs/phase-8/refactoring-report.md`                                        |
| 品質報告書                      | `outputs/phase-9/quality-report.md`                                            |
| 最終レビュー報告書              | `outputs/phase-10/final-review-report.md`                                      |
| 手動テスト報告書                | `outputs/phase-11/manual-test-report.md`                                       |
| 仕様書更新ワークフロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |
| 仕様抽出マップ                  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               |
| 仕様トピックマップ              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  |
| P1-P4対策                       | `.claude/rules/06-known-pitfalls.md#P1-P4`                                     |
| P43対策（サブエージェント分割） | `.claude/rules/06-known-pitfalls.md#P43`                                       |
| Phase 12チェックリスト          | `.claude/rules/05-task-execution.md#Phase 12`                                  |

## 実行手順

1. **Task 1** を実行する（Part 1 → Part 2 の順）
2. **Task 2** を実行する（Step 1-A → 1-B → 1-C → 1-D の順）
   - P43対策: サブエージェントに委譲する場合、1回あたり3ファイル以下に分割する
   - LOGS.md の「完了」記録は全ファイル更新後の最終ステップとする
3. **Task 3** を実行する（Task 2の全Step結果を記録してから）
4. **Task 4** を実行する（検出ソース5件を全て確認する）
5. **Task 5** を実行する
6. 全Task完了後、`artifacts.json` の Phase 12 ステータスを `completed` に更新する

## 成果物

| 成果物名                     | パス                                          |
| ---------------------------- | --------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    |
| システム仕様書更新ログ       | `outputs/phase-12/system-docs-update-log.md`  |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md` |
| 未タスク報告書               | `outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   |

## 完了条件

- [ ] Phase 12の最終判定は以下のTask別チェックリストをすべて確認して実施する。

### Task 1: 実装ガイド

- [ ] Part 1 に日常の例え話が1つ以上含まれている
- [ ] Part 1 に専門用語（exports, paths, alias, typesVersions）が使われていない
- [ ] Part 2 に6つのチェック関数のAPI仕様が記載されている
- [ ] Part 2 にエラーメッセージ対処表が3件以上含まれている
- [ ] Part 2 にサブパス追加手順がステップバイステップで記載されている

### Task 2: システム仕様書更新

- [ ] Step 1-A の7ファイルが全て更新済み（スキップの場合は理由を記録）
- [ ] Step 1-B の実装状況テーブルが更新済み（該当なしの場合は理由を記録）
- [ ] Step 1-C の `grep -rn` 結果に基づく関連仕様書が全て更新済み
- [ ] Step 1-D の `topic-map.md` が再生成済み
- [ ] LOGS.md が2ファイル（aiworkflow-requirements / task-specification-creator）とも更新済み

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容が記録されている
- [ ] 各Step（1-A, 1-B, 1-C, 1-D）の完了結果が記録されている
- [ ] 全Step確認後に「完了」と記載されている（P4対策）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）
- [ ] 検出ソース5件が全て確認されている
- [ ] 検出された未タスクが3ステップ全完了している（0件の場合は「0件確認済み」と記録）

### Task 5: スキルフィードバックレポート

- [ ] `skill-feedback-report.md` が作成されている
- [ ] 改善点の有無が明記されている

### 全体

- [ ] `artifacts.json` の Phase 12 ステータスが `completed` に更新されている
- [ ] 5つの成果物ファイルが全て `outputs/phase-12/` に存在する

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 12
```

## 次のPhase

Phase 13（完了・PR準備）へ進む。Phase 12の全成果物が揃っていることを確認してからPhase 13を開始する。
