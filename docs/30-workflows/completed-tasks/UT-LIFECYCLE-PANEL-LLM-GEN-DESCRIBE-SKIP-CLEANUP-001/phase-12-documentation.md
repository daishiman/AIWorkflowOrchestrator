# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 12                                                             |
| 機能名     | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 11                                                       |
| 後続Phase  | Phase 13（blocked / ユーザー承認待ち）                         |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 12 必須5タスクを完了可能な形で固定する。
aiworkflow-requirements の正本境界に従い、`references/` / `LOGS.md` / `topic-map.md` / task workflow 台帳の更新判定、未タスク検出、苦戦箇所の記録、中学生レベル概念説明を含む実装ガイド作成を行う。

## 背景

`SkillLifecyclePanel.llm-generation.test.tsx` のクリーンアップが完了したことを仕様書・ドキュメントに反映する。
また、クリーンアップ作業中に検出された残課題（もし `describe.skip` が残った場合）を未タスクとして記録し、次の担当者が迷わないよう引き継ぎ情報を整備する。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                                         |
| ---------- | ---------------- | ---------------------------------------------- |
| SubAgent-A | ドキュメント責務 | `references/`・topic-map・LOGS.md 更新判定     |
| SubAgent-B | 未タスク検出責務 | 残存describe.skip・新規課題の検出と記録        |
| SubAgent-C | 実装ガイド責務   | Part 1（中学生向け）・Part 2（技術者向け）作成 |
| SubAgent-D | 統合監査         | 矛盾・漏れ・整合・依存判定                     |

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1（中学生向け）と Part 2（技術者向け）の2部構成を定義する
- Task 12-2 システム仕様更新: Step 1-A/1-B/1-C を必須で実行し、Step 2 は条件判定を記録する
- Task 12-3 更新履歴作成: documentation-changelog を生成し全 Step 結果を記録する
- Task 12-4 未タスク検出: 0件でも `unassigned-task-detection` を出力する
- Task 12-5 フィードバック作成: 改善点が0件でも `skill-feedback-report` を出力する

## 参照資料

| 参照資料                 | パス                                              | 説明            |
| ------------------------ | ------------------------------------------------- | --------------- |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 変更ファイル一覧         | `outputs/phase-5/changed-files.md`                | Phase 5 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 設計書                   | `outputs/phase-2/design.md`                       | Phase 2 成果物  |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 再テスト計画             | `outputs/phase-8/post-refactor-test-plan.md`      | Phase 8 成果物  |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| リスク台帳               | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 因果ループ監査           | `outputs/phase-9/causal-loop-check.md`            | Phase 9 成果物  |
| 是正計画                 | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェックリスト   | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`       | Phase 11 成果物 |
| 検出課題一覧             | `outputs/phase-11/discovered-issues.md`           | Phase 11 成果物 |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`           | Phase 11 成果物 |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録、関連リンク、LOGS.md（2ファイル）、topic-map.md を更新する。
3. Task 12-2 Step 1-B: 実装状況テーブルを `completed` または `spec_created` へ更新する。
4. Task 12-2 Step 1-C: 関連タスクテーブルのステータスを更新する。
5. Task 12-2 Step 2: 新規 I/F 追加有無を判定し、必要時だけ仕様更新を実施する。
6. Task 12-3/12-4/12-5: changelog、未タスク検出、skill-feedback を出力する。

### 具体的なコマンド手順

```bash
# aiworkflow-requirements の正本参照確認
ls .claude/skills/aiworkflow-requirements/references/

# 完了タスク記録の更新
# LOGS.md に本タスク完了を追記する
# topic-map.md の SkillLifecyclePanel テスト関連エントリを更新する

# 未タスク検出（対象ファイル自身を含めた describe.skip 残存確認）
grep -rn "describe.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/ \
  2>/dev/null
```

## 多角的チェック観点

| 観点     | 確認内容                                                 |
| -------- | -------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                       |
| 漏れ     | 要件から成果物への未反映項目がないか確認する             |
| 整合性   | ドキュメント更新内容がタスク実績と一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する            |

## 成果物

| 成果物               | パス                                            | 説明                                       |
| -------------------- | ----------------------------------------------- | ------------------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（中学生向け）/ Part 2（技術者向け） |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A/1-B/1-C/Step 2 記録               |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴                       |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 検出結果（0件でも作成）                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点（0件でも作成）                      |
| Task 2 実行ログ      | `outputs/phase-12/phase12-task2-step-log.md`    | Step 1-A/1-B/1-C/Step 2 記録               |

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                       | 完了条件                                        |
| -------- | ------------------------------ | ----------------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + LOGS.md（2件）+ topic-map 更新       |
| Step 1-B | 全タスクで必須                 | 実装状況を completed または spec_created へ更新 |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新                      |
| Step 2   | 新規 I/F 追加がある場合        | 対象仕様を更新し変更履歴へ記録                  |

## 苦戦箇所の記録テーブル

| 箇所                            | 課題内容                                          | 解決方法                                         | 備考               |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------ | ------------------ |
| describe.skip の判断基準        | 削除・修正・別途判断の3択の判断が難しい           | 現行APIとの対応を確認し、対応APIが存在すれば修正 | Phase 5 で詳細記録 |
| 旧API（planSkill 等）の依存特定 | どのモック宣言が旧APIに依存しているか特定が難しい | grep + 型チェックの組み合わせで特定              | Phase 8 で詳細記録 |
| テスト件数の変化への対応        | skip除去によりテスト件数が変化した場合の管理      | カバレッジレポートで件数変化を追跡               | Phase 7 で詳細記録 |

## 未タスク検出（describe.skip 残課題）

本タスク完了後に `describe.skip` が残存していた場合、以下のフォーマットで未タスクとして記録する。

```markdown
## 残存 describe.skip 一覧

| 件数                               | describe名 | 残存理由 | 対応Issue |
| ---------------------------------- | ---------- | -------- | --------- |
| （記録なし、または該当件数を記載） |
```

残存件数が0件の場合は `outputs/phase-12/unassigned-task-detection.md` に「残存 describe.skip: 0件」と明記する。

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
`implementation-guide.md` の `## 視覚証跡` セクションにも同じ文言を記載し、`screenshots/.gitkeep` を追加しない。

## Phase 12 中学生レベル概念説明

### describe.skip とは何か？

テストコードの中には、「テストのまとまり（グループ）」を作る `describe` という命令があります。

たとえば、こんなイメージです：

```
describe("算数テスト", () => {
  it("たし算ができる", () => { ... })
  it("ひき算ができる", () => { ... })
})
```

この `describe` の後ろに `.skip` をつけると、**そのまとまりの中にあるテストを全部スキップ（飛ばし）する**ことができます。

```
describe.skip("算数テスト", () => {
  // ← このかっこの中のテストは全部実行されない！
  it("たし算ができる", () => { ... })
  it("ひき算ができる", () => { ... })
})
```

#### なぜ describe.skip が問題になるのか？

`describe.skip` を使うと、テストが「スキップされた」状態のまま放置されることがあります。

**問題点**:

1. スキップしたテストは「テストが通っている」には含まれません
2. バグが隠れても気づけません（テスト自体が動いていないため）
3. 時間が経つと「なぜスキップしたのか」がわからなくなります

#### このタスクでやること

`SkillLifecyclePanel.llm-generation.test.tsx` に12件の `describe.skip` があったので、それを整理します：

- **削除できるもの**: もう必要ないテストは削除する
- **修正できるもの**: 新しい API に合わせてテストを書き直す
- **別途判断が必要なもの**: 新しい Issue を作って後で対処する

こうすることで、テストが正直な状態（実際に動いている状態）になり、バグをちゃんと見つけられるようになります！

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明、日常例、専門用語の即時説明（上記「中学生レベル概念説明」を参照）。
- Part 2: TypeScript 型、APIシグネチャ、エッジケース、設定値一覧。
- 未タスク検出レポートは0件でも必ず出力する。
- スキルフィードバックは改善点0件でも必ず出力する。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 中学生レベル概念説明（describe.skip）が `implementation-guide.md` Part 1 に含まれていることを確認
- [ ] 未タスク検出レポートが作成されていることを確認（0件でも可）
- [ ] 苦戦箇所の記録テーブルが作成されていることを確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 13: PR作成（blocked / ユーザー承認待ち）
