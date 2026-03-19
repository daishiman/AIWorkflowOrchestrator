# Phase 12: ドキュメント

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| Phase名    | ドキュメント                          |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 11（手動テスト）                |
| 後続Phase  | Phase 13（PR作成）                    |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

実装ガイド・システム仕様書更新・変更ログ・未タスク検出・スキルフィードバックの5タスクを全て完了する。漏れが最も発生しやすい Phase であるため、チェックリストを逐次確認する（P1〜P4, P25〜P28, P43, P51対策）。

## 参照資料

- `.claude/rules/05-task-execution.md` — Phase 12 必須チェックリスト
- `.claude/rules/06-known-pitfalls.md` — P1-P4, P25-P28, P43, P51, P56, P57, P58, P59
- `aiworkflow-requirements/references/spec-update-workflow.md` — 仕様書更新手順

> **重要**: P4 対策として、全 Task 完了前に documentation-changelog.md に「完了」と記載しない。

## 実行手順

## 実行タスク

| Task   | 内容                                                | 主成果物                                                 |
| ------ | --------------------------------------------------- | -------------------------------------------------------- |
| Task 1 | 技術ドキュメント作成（実装ガイド作成）              | `outputs/phase-12/implementation-guide.md`               |
| Task 2 | システムドキュメント更新（aiworkflow-requirements） | documentation-changelog 内に記録                         |
| Task 3 | ドキュメント更新履歴作成                            | `outputs/phase-12/documentation-changelog.md`            |
| Task 4 | 未タスク検出（残課題の検出と記録）                  | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 5 | スキルフィードバックレポート作成                    | `outputs/phase-12/skill-feedback-report.md`              |
| Task 6 | 仕様書遵守チェックリスト                            | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 1: 技術ドキュメント作成（実装ガイド作成）
- Task 2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 4: 未タスク検出（残課題の検出と記録）
- Task 5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 6: 仕様書遵守チェックリスト

### Task 1: 実装ガイド作成

#### 1-A: implementation-guide.md Part 1（中学生向け説明）

`outputs/phase-12/implementation-guide.md` Part 1 に以下を記載する:

- 「+ 新しいツールを作る」ボタンとは何か（日常のアナロジー: お店の「新しい商品を登録する」ボタン）
- ボタンをクリックすると何が起きるか（画面が切り替わる仕組みの例え）
- JourneyPanel のステップカードとは何か

#### 1-B: implementation-guide.md Part 2（開発者向け詳細）

以下を記載する:

- `useSkillCenter` フックの3つのナビゲーションアクション定義と引数
- `SkillCenterView` ヘッダーへの CTA 組み込み方法
- `JourneyPanel` ステップカードへの CTA 組み込み方法
- Apple HIG systemBlue CSS変数の参照方法

#### 1-C: component-documentation.md

`outputs/phase-12/component-documentation.md` に以下を記載する:

- `useSkillCenter` フックの Props/戻り値型定義
- `SkillCenterView` の CTA 関連 Props
- `JourneyPanel` の CTA 関連 Props

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> P43 対策: 3ファイル以下/エージェントに分割する。

#### Step 1-A: タスク完了記録（2ファイル必須、P1/P25対策）

- [ ] 該当仕様書（`ui-ux-skillcenter.md` 等）にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` に完了記録を追加
- [ ] `task-specification-creator/LOGS.md` に完了記録を追加（**2ファイル両方**、P1対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新（P29対策）

#### Step 1-B: 実装状況テーブル更新

- [ ] スキルセンター関連の実装ステータステーブルを「完了」に更新（該当ファイルがある場合）

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-IMP-SKILLCENTER-CREATE-ROUTE-001" .claude/skills/aiworkflow-requirements/references/
```

検索結果の全ファイルの関連タスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

仕様書にセクションの追加・削除・変更がある場合は必ず再生成する。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、`git diff --stat -- .claude/skills/` で変更ファイルを確認する（P51対策）。

#### mirror sync（worktree 環境対応）

```bash
# .claude/ → .agents/ への一方向同期
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
# 差分確認（0差分であること）
diff -qr ./.claude/skills/ ./.agents/skills/
```

#### Step 2: システム仕様更新

新規 CTA コンポーネント・ナビゲーションアクションのインターフェースが追加された場合:

- [ ] `ui-ux-skillcenter.md` に CTA 設計仕様を追記
- [ ] `interfaces-skillcenter.md` に `useSkillCenter` 型定義を追記（該当ファイルがある場合）

### Task 3: documentation-changelog.md 作成

> P4/P59対策: 全 Task 完了後にまとめて記録する。並列エージェントを使用した場合はメインエージェントが統合する。

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

- Task 1: 実装ガイドの作成内容
- Task 2 Step 1-A: 更新した LOGS.md 2ファイルのパスと内容要約
- Task 2 Step 1-B: 更新したステータステーブル
- Task 2 Step 1-C: 検索で見つかった関連仕様書と更新内容
- Task 2 Step 1-D: topic-map.md 再生成結果（`git diff --stat` 出力）
- Task 2 Step 2: システム仕様更新内容
- Task 3: 本ファイル自体の作成記録
- Task 4: 未タスク検出件数（unassigned-task-detection.md と照合済み）
- Task 5: スキルフィードバック有無

### Task 4: 未タスク検出（P3/P38/P58対策）

`outputs/phase-12/unassigned-task-detection.md` を作成する（0件でも必須）。

検出観点:

- Phase 10 で MINOR 判定となった指摘
- Phase 8 で「将来の分離候補」として記録されたコンポーネント
- AC-7 以外の追加デザイン改善余地
- Phase 11 で発見された表示問題

検出した未タスクは3ステップで処理する（P3対策）:

1. `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

- [ ] `unassigned-task-detection.md` の件数・ステータスを更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` でクローズ（P56対策）

### Task 6: 仕様書遵守チェックリスト

- `phase12-task-spec-compliance-check.md` を作成する
- Task 1〜5 の全完了を確認し、各タスクの完了証跡（成果物パス・検証結果）を記録する
- 成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### Task 5: スキルフィードバックレポート（P28対策）

`outputs/phase-12/skill-feedback-report.md` を作成する（改善点なしでも「改善点なし」として記録）。

確認観点:

- ワークフロー改善点（Phase 間の引き継ぎで不明確な点）
- テスト設計パターンの改善余地
- CTA コンポーネント設計で学んだパターンの汎用化

## 成果物

| 成果物名                   | パス                                                     | 説明                                       |
| -------------------------- | -------------------------------------------------------- | ------------------------------------------ |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生向け）+ Part 2（開発者向け） |
| コンポーネントドキュメント | `outputs/phase-12/component-documentation.md`            | コンポーネント API ドキュメント            |
| ドキュメント変更ログ       | `outputs/phase-12/documentation-changelog.md`            | 変更ログ（全 Step 完了後に作成）           |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク一覧（0件でも必須）                |
| スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック                       |
| 仕様書遵守チェックリスト   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 の完了証跡                       |

## 統合テスト連携

Phase 11 までの手動テスト結果と Phase 9 の品質検証結果を documentation-changelog に集約する。未タスク検出結果は Phase 10 MINOR 指摘と合わせて検証する。

## 苦戦箇所の記録

タスク実行中に苦戦した箇所があれば記録する。0件の場合は「苦戦箇所なし（0件）」と記載する。

| 項目    | 内容                                |
| ------- | ----------------------------------- |
| 症状    | 発生した問題の具体的な症状          |
| 原因    | 問題の根本原因                      |
| 解決策  | 採用した解決策                      |
| 学び    | 将来のタスクへの教訓                |
| Pitfall | 該当する場合はPitfall ID（例: P31） |

## 完了条件

- [ ] `implementation-guide.md` Part 1（中学生向け説明）が作成されている
- [ ] `implementation-guide.md` Part 2（開発者向け詳細）が作成されている
- [ ] `component-documentation.md` が作成されている
- [ ] `aiworkflow-requirements/LOGS.md` が更新されている
- [ ] `task-specification-creator/LOGS.md` が更新されている（P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴が更新されている
- [ ] `task-specification-creator/SKILL.md` の変更履歴が更新されている（P29対策）
- [ ] topic-map.md が再生成されている（`git diff --stat` で確認済み）
- [ ] `documentation-changelog.md` が全 Task 完了後に作成されている（P4対策）
- [ ] `documentation-changelog.md` の未タスク件数が `unassigned-task-detection.md` と一致している（P59対策）
- [ ] `unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] 検出した未タスクの3ステップ（指示書・テーブル登録・リンク追加）が全て完了している
- [ ] `skill-feedback-report.md` が作成されている
- [ ] `phase12-task-spec-compliance-check.md` が作成されている（Task 1〜5 の完了証跡あり）
- [ ] mirror sync が完了している（`diff -qr` で0差分確認済み）
- [ ] 苦戦箇所セクションが記録されている（0件でも明記）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
