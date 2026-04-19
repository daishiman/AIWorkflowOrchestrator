# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

`NON_VISUAL` タスクとして、`.gitattributes` のパターン精緻化と `setup-merge-drivers.sh` 実行結果が「設計通りに Git のマージ挙動へ反映されているか」を、隔離した一時 Git リポジトリ上の手動シミュレーションで検証する。docs-only Phase 11 の正本は `manual-test-result.md` とし、Git 挙動の実測ログ・判定・仕様判断根拠をここへ集約する。

## 背景

本タスクは UI/UX 変更を一切伴わない設定ファイル修正タスクであるため、スクリーンショットによる視覚証跡は採取しない。代替として、`merge=union`、`merge=ours`、デフォルトマージの挙動を独立した一時リポジトリで再現し、`git check-attr` の出力と並列ブランチのマージ結果ログを `manual-test-result.md` に集約する。`manual-test-checklist.md` と `discovered-issues.md` は補助成果物として保持し、発見事項は HIGH / MEDIUM / LOW で分類する。

## 実行タスク

### タスク0: マニュアルテストチェックリスト作成と実行

**目的**: Git 挙動の手動シミュレーション 5 観点（MT-01〜MT-05）を網羅し、設計通りの分類が反映されていることを検証する。

**実行手順**:

1. `manual-test-checklist.md` に MT-01〜MT-05 の観点を列挙する。
2. 一時ディレクトリ（`/tmp/gitattributes-mt-XXX`）に検証用 git リポジトリを初期化する。
3. 検証対象の `.gitattributes` を Phase 5 の実装版に揃え、各 MT を順に実行する。
4. 各 MT の入力・期待結果・実測結果・判定を `manual-test-result.md` に記録する。

**MT 一覧**:

- **MT-01**: `setup-merge-drivers.sh` を新規環境（`git config --local --unset merge.ours.driver` 後）で実行し、`git config merge.ours.driver` が `true` を返すこと。
- **MT-02**: 構造化ドキュメント想定の `references/task-workflow.md` 相当ファイルを 2 ブランチで並列に変更し、マージしてコンフリクトマーカー（`<<<<<<<` / `=======` / `>>>>>>>`）が期待通り出力されること（`merge=union` 適用外の確認）。
- **MT-03**: append-only 想定の `LOGS.md` を 2 ブランチで並列に追記し、マージ後に両方の追記行が残ること（`merge=union` 動作確認）。
- **MT-04**: `indexes/*.json` を 2 ブランチで並列変更し、マージ後に現ブランチの内容が優先される（`merge=ours`）こと。続けて `node .claude/skills/<skill>/scripts/generate-index.js` 相当の再生成手順で復旧可能なことを確認する。
- **MT-05**: macOS（darwin）での動作を確認する。Linux / CI 環境での実測は未実施として、`manual-test-result.md` に「CI 上での動作は CI ログに委ねる」旨を明記する。

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`

### タスク1: 視覚証跡の記述（NON_VISUAL 明記）

**目的**: 視覚証跡セクションを NON_VISUAL ポリシーに沿って明示し、後続 Phase / レビュアの混乱を防ぐ。

**実行手順**:

1. `manual-test-result.md` の `## 視覚証跡` セクションに **「UI/UX変更なしのため Phase 11 スクリーンショット不要」** を明記する。
2. `screenshots/.gitkeep` は作成しない。
3. 代替証跡として以下 2 ファイルを参照リンクとして列挙する。
   - `outputs/phase-10/final-review-result.md`
   - `outputs/phase-11/manual-test-result.md`
4. `git check-attr merge` の実行ログ（対象ファイル例: `task-workflow.md` / `LOGS.md` / `indexes/x.json`）をテキストログとして添付する。

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md` 内 `## 視覚証跡` セクション

### タスク2: 発見事項の記録と分類

**目的**: 手動シミュレーション中の発見事項を HIGH / MEDIUM / LOW に分類し、後続アクションに振り分ける。

**実行手順**:

1. 発見事項を `discovered-issues.md` に列挙する。
2. HIGH（マージ破損リスクが残っている等）が検出された場合は、`unassigned-task/` 配下への自動起票候補として記録する。
3. LOW は `manual-test-result.md` の補足セクションに追記して閉じる。
4. MEDIUM は Phase 12 の未タスク検出（Task 4）への候補として申し送る。

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

## 参照資料

| 参照資料                  | パス                                                                             | 内容                                       |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 11 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | NON_VISUAL 運用                            |
| Phase 2 設計              | `outputs/phase-2/merge-strategy-design.md`                                       | パターン精緻化方針                         |
| Phase 5 実装サマリー      | `outputs/phase-5/implementation-summary.md`                                      | `.gitattributes` 修正版                    |
| Phase 9 品質保証          | `outputs/phase-9/quality-report.md`                                              | line budget / mirror parity                |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                        | walkthrough 入力 / 判定根拠                |
| `.gitattributes`          | `.gitattributes`                                                                 | 検証対象本体                               |
| マージドライバ登録        | `.claude/scripts/setup-merge-drivers.sh`                                         | MT-01 対象スクリプト                       |
| 元タスク Issue            | <https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281>                | 問題定義（`merge=union` 長期リスク再評価） |

## 成果物

| 成果物                   | パス                                        | 内容                                    |
| ------------------------ | ------------------------------------------- | --------------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | primary evidence、MT-01〜MT-05 実測ログ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | MT-01〜MT-05 のチェック項目と判定欄     |
| 発見事項一覧             | `outputs/phase-11/discovered-issues.md`     | HIGH / MEDIUM / LOW 分類と申し送り先    |

## 統合テスト連携【必須】

| 判定項目                                                        | 基準 | 結果    |
| --------------------------------------------------------------- | ---- | ------- |
| `NON_VISUAL` 方針が `manual-test-result.md` に明記されている    | 完了 | pending |
| MT-01〜MT-05 が全て実行され実測ログが残っている                 | 完了 | pending |
| `git check-attr merge` 出力ログが添付されている                 | 完了 | pending |
| HIGH 発見事項は `unassigned-task/` 起票候補として記録されている | 完了 | pending |
| `screenshots/.gitkeep` を作成していない                         | 完了 | pending |

## 完了条件

- [ ] MT-01〜MT-05 を全て実行し、実測ログを `manual-test-result.md` に記録している
- [ ] `## 視覚証跡` セクションに「UI/UX変更なしのため Phase 11 スクリーンショット不要」を明記している
- [ ] 代替証跡として `phase-10/final-review-result.md` と `phase-11/manual-test-result.md` を参照リンク化している
- [ ] `manual-test-checklist.md` を作成している
- [ ] `discovered-issues.md` を作成し、HIGH / MEDIUM / LOW に分類している
- [ ] HIGH 課題は `unassigned-task/` への起票候補としてフラグ化している
- [ ] `screenshots/.gitkeep` を作成していない
