# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 12                 |
| Phase名    | ドキュメント更新   |
| 前提Phase  | Phase 11           |
| 後続Phase  | Phase 13           |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

実装ガイド作成・システム仕様書更新・ドキュメント更新記録・未タスク検出の4タスクを実行し、ドキュメント整備を完了する。

## 背景

Phase 12は4つの必須タスクで構成される。Task 1の実装ガイドは2パート構成（中学生レベル＋技術者レベル）、Task 2のシステム仕様更新は4サブステップで構成される。

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**目的**: TASK-8A の実装内容を中学生レベルと技術者レベルの2パートで説明する実装ガイドを作成する。

**実行手順**:

#### Part 1: 概念説明（中学生レベル）

1. 以下の構成で概念説明を作成する：
   - **「テスト」とは何か**: 日常生活の例えを使って説明する（例: 料理のレシピを書いたら、実際に作ってみて味見するようなもの）
   - **なぜテストが必要か**: 先に「なぜ」を説明してから「何を」を説明する（例: バグを早く見つけて直すため、新しい機能を追加するときに前の機能が壊れていないことを確認するため）
   - **単体テストとは**: 1つの部品（モジュール）だけを取り出して動作確認すること（例: 自転車のブレーキだけを取り外して動作確認するイメージ）
   - **モックとは**: テストのときに本物の代わりに使うダミー部品（例: お芝居のリハーサルで本番の観客の代わりにぬいぐるみを置くイメージ）
   - **カバレッジとは**: テストがどれくらいのコードをチェックできているかの割合（例: テスト勉強で教科書の何ページまで目を通したかのパーセンテージ）
2. 専門用語を使う場合は即座にカッコ書きで説明を入れる
3. 各セクションに日常の例え話を必ず1つ以上含める

#### Part 2: 技術詳細（開発者レベル）

1. 以下の構成で技術詳細を作成する：
   - **テスト対象モジュール一覧**: 5モジュールの責務・公開APIの概要
   - **テストアーキテクチャ**: モック戦略、フィクスチャ構成、テストヘルパー設計
   - **テストケースID対応表**: SS-01〜SKS-12 の完全な対応表
   - **モック設定の詳細**: 各モジュールの`vi.mock`/`vi.stubGlobal`の設定コード例
   - **カバレッジ結果**: モジュール別のカバレッジ数値（Phase 7の結果を参照）
   - **テスト実行方法**: 個別実行・一括実行・カバレッジ付き実行のコマンド
   - **エラーハンドリング**: テスト失敗時のデバッグ手順
   - **設定可能なパラメータ**: Vitest設定の主要パラメータ（timeout, pool, coverage thresholds）一覧
2. TypeScript のインターフェース/型定義を含める
3. コード例は実際のテストファイルから抽出する

4. Part 1とPart 2を1つのファイルに結合して `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

### Task 2: システム仕様書更新（4サブステップ）

**目的**: システム仕様書にTASK-8Aの完了を記録し、関連する仕様を更新する。

**実行手順**:

#### Step 1-A: タスク完了記録（必須）

1. TASK-8Aの完了を以下のファイルに記録する：
   - 関連するワークフロー仕様書（`docs/30-workflows/skill-import-agent-system/` 内）に「完了タスク」セクションを追加または更新
   - 「関連ドキュメント」セクションに実装ガイドリンクを追加
   - 変更履歴にTASK-8A完了を記録（バージョン番号を追記）
2. 以下のLOGS.mdファイルを**両方**更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md` にTASK-8A完了記録を追加
   - `.claude/skills/task-specification-creator/LOGS.md` にTASK-8A完了記録を追加
3. 以下のSKILL.mdファイルの変更履歴にバージョンを追記する：
   - `.claude/skills/aiworkflow-requirements/SKILL.md`
   - `.claude/skills/task-specification-creator/SKILL.md`
4. `topic-map.md` にエントリが必要な場合は追加する

#### Step 1-B: 実装状況テーブル更新（必須）

1. aiworkflow-requirements配下の関連仕様書で、テスト関連の「未実装」→「完了」のステータス更新を行う
2. 特に以下のファイルを確認する：
   - `quality-e2e-testing.md` のTASK-8A関連ステータス
   - `quality-requirements.md` のテストカバレッジ記録

#### Step 1-C: 関連タスクテーブル更新（必須）

1. 以下のGrepコマンドでTASK-8Aが記載されている仕様書を機械的に検索する：
   ```bash
   grep -rl "TASK-8A\|単体テスト" .claude/skills/aiworkflow-requirements/references/
   ```
2. 検索結果のファイル内にある「関連タスク」「未タスク候補」テーブルのTASK-8Aステータスを「**完了**」に更新する
3. 特に以下のファイルを確認する：
   - `interfaces-agent-sdk-skill.md` の関連タスクテーブル
   - `quality-e2e-testing.md` の関連タスクテーブル

#### Step 2: システム仕様更新（条件付き）

1. 本タスクはテスト追加のみであり、新規インターフェースや型の追加は行わないため、**Step 2は該当なし**と判断する
2. ただし、テストヘルパーの型定義を追加した場合は、関連する型定義仕様を更新する
3. 「該当なし」の理由を `outputs/phase-12/documentation-changelog.md` に記録する

**期待される成果物**:

- 各仕様書ファイル（更新）

### Task 3: ドキュメント更新記録作成

**目的**: Phase 12で行った全ドキュメント更新の記録を作成する。

**実行手順**:

1. 以下のスクリプトでドキュメント更新記録のベースを生成する（推奨）：
   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
     --workflow docs/30-workflows/skill-import-agent-system/TASK-8A
   ```
2. 生成されたファイルに以下の情報を手動で補完する：
   - Task 1（実装ガイド）の作成内容サマリー
   - Task 2の各Step（1-A / 1-B / 1-C / Step 2）の実行結果（「該当なし」も記録）
   - 更新したファイル一覧とその概要
   - テンプレート: `assets/documentation-changelog-template.md` を参照
3. `outputs/phase-12/documentation-changelog.md` に出力する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 本タスクの実装過程で発見された未完了タスク・改善提案を検出し記録する。

**実行手順**:

1. 以下のソースから未タスク候補を収集する：

| ソース                 | 確認項目                           |
| ---------------------- | ---------------------------------- |
| 元タスク仕様書         | 「スコープ外」として明示された項目 |
| Phase 3 レビュー結果   | MINOR判定の指摘事項                |
| Phase 10 レビュー結果  | MINOR判定の指摘事項                |
| Phase 11 手動テスト    | エッジケース追加提案               |
| テストコード内コメント | TODO/FIXME/HACK/XXX                |

2. 以下のコマンドでコード内・成果物内のTODO/FIXMEを検索する：

   ```bash
   # テストコード内の検索
   grep -rn "TODO\|FIXME\|HACK\|XXX" \
     apps/desktop/src/main/services/skill/__tests__/ \
     apps/desktop/src/renderer/store/slices/__tests__/skillSlice*.test.ts

   # Phase成果物内の検索
   grep -rn "TODO\|FIXME\|将来対応\|later\|TBD" outputs/
   ```

3. 検出された未タスク候補を以下の形式で記録する：
   - 未タスク名
   - 発見ソース（Phase番号またはファイルパス）
   - 概要（1-2文）
   - 推奨優先度（P1/P2/P3）
4. **0件の場合も「検出結果: 0件」と明記して出力する**
5. `outputs/phase-12/unassigned-task-detection.md` に出力する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

## 参照資料

| 参照資料                         | パス                                                                    | 説明             |
| -------------------------------- | ----------------------------------------------------------------------- | ---------------- |
| 手動テスト結果                   | `outputs/phase-11/manual-test-result.md`                                | エッジケース提案 |
| カバレッジレポート               | `outputs/phase-7/coverage-report.md`                                    | カバレッジ数値   |
| 品質レポート                     | `outputs/phase-9/quality-report.md`                                     | 品質検証結果     |
| 仕様更新ワークフロー             | task-specification-creator `references/spec-update-workflow.md`         | 更新手順         |
| Phase 12ガイド                   | task-specification-creator `references/phase-11-12-guide.md`            | 詳細ガイド       |
| 未タスクガイドライン             | task-specification-creator `references/unassigned-task-guidelines.md`   | 未タスク形式     |
| ドキュメント更新記録テンプレート | task-specification-creator `assets/documentation-changelog-template.md` | テンプレート     |
| 既存テスト監査結果               | `outputs/phase-1/existing-test-audit.md`                                | Phase 1 成果物   |
| ギャップ分析                     | `outputs/phase-1/gap-analysis.md`                                       | Phase 1 成果物   |
| 受け入れ基準                     | `outputs/phase-1/acceptance-criteria.md`                                | Phase 1 成果物   |
| モジュール分析                   | `outputs/phase-1/module-analysis.md`                                    | Phase 1 成果物   |
| テスト設計書                     | `outputs/phase-2/test-design.md`                                        | Phase 2 成果物   |
| モック戦略                       | `outputs/phase-2/mock-strategy.md`                                      | Phase 2 成果物   |
| フィクスチャ設計                 | `outputs/phase-2/fixture-design.md`                                     | Phase 2 成果物   |
| テストヘルパー設計               | `outputs/phase-2/test-helper-design.md`                                 | Phase 2 成果物   |
| 実装サマリー                     | `outputs/phase-5/implementation-summary.md`                             | Phase 5 成果物   |
| リファクタリング記録             | `outputs/phase-8/refactoring-log.md`                                    | Phase 8 成果物   |
| 最終レビュー結果                 | `outputs/phase-10/final-review-result.md`                               | Phase 10 成果物  |

## 成果物

| 成果物               | パス                                            | 説明                           |
| -------------------- | ----------------------------------------------- | ------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（概念）+ Part 2（技術） |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md`   | 全更新内容の記録               |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク候補（0件含む）        |

## 完了条件

- [ ] 実装ガイドのPart 1が日常の例え話を含む中学生レベルで記述されている
- [ ] 実装ガイドのPart 2がTypeScript型定義・コード例を含む技術者レベルで記述されている
- [ ] Step 1-A: タスク完了記録が関連仕様書に追加されている
- [ ] Step 1-A: LOGS.md が2ファイル（aiworkflow-requirements + task-specification-creator）とも更新されている
- [ ] Step 1-A: SKILL.md が2ファイル（aiworkflow-requirements + task-specification-creator）とも変更履歴が追記されている
- [ ] Step 1-B: 実装状況テーブルが更新されている
- [ ] Step 1-C: `grep -rl` で関連タスクテーブルを機械的に検索し、該当ステータスが更新されている
- [ ] Step 2: 該当有無が判断され、結果が記録されている
- [ ] ドキュメント更新記録に全Step（1-A/1-B/1-C/Step 2）の結果が個別に明記されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力済み）
- [ ] 3つの成果物ファイルが `outputs/phase-12/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新記録,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

## 依存関係

| 項目      | 内容     |
| --------- | -------- |
| 前提Phase | Phase 11 |
| 後続Phase | Phase 13 |

## 次のPhase

→ [phase-13-pr-creation.md](phase-13-pr-creation.md)
