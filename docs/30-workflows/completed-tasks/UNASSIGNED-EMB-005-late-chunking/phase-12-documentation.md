# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 12                                      |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 11                                |
| 後続Phase  | Phase 13                                |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

Phase 12必須6タスクを完了可能な形で固定する。Late Chunking実装の current contract / target delta / NON_VISUAL 証跡 / system spec同期を、漏れなく閉じる。

## 背景

UNASSIGNED-EMB-005 は embedding-generation-pipeline への機能追加であり、Late Chunkingという新しいアルゴリズムを `packages/shared/` に実装する。この実装の背景・仕組み・使い方を多角的に文書化することで、チームの理解と継続的な保守を支援する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                     |
| ---------- | ------------------ | ------------------------------------------ |
| SubAgent-A | アルゴリズム責務   | Late Chunking ロジック正確性・境界条件     |
| SubAgent-B | パフォーマンス契約 | 処理速度・メモリ消費・スループット         |
| SubAgent-C | API/型契約         | 公開インターフェース・型安全性・後方互換性 |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合・依存判定                 |

## 実行タスク（6タスク必須）

| Task | 内容                                                           | 主成果物                                                 |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------- |
| 12-1 | 実装ガイド作成（Part 1/Part 2 + NON_VISUAL視覚証跡セクション） | `outputs/phase-12/implementation-guide.md`               |
| 12-2 | システム仕様更新（Step 1-A/1-B/1-C/1-D + Step 2判定）          | `outputs/phase-12/system-spec-update-summary.md`         |
| 12-3 | 更新履歴作成                                                   | `outputs/phase-12/documentation-changelog.md`            |
| 12-4 | 未タスク検出                                                   | `outputs/phase-12/unassigned-task-detection.md`          |
| 12-5 | スキルフィードバック作成                                       | `outputs/phase-12/skill-feedback-report.md`              |
| 12-6 | Task仕様準拠チェック                                           | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: implementation-guide.md を Part 1/Part 2 で作成する
- Task 12-2: Step 1-A/1-B/1-C/1-D を必須で実行し、Step 2は要否判定を記録する
- Task 12-3: documentation-changelog を生成し current/baseline を区別して記録する
- Task 12-4: 0件でも unassigned-task-detection を出力する
- Task 12-5: 改善点が0件でも skill-feedback-report を出力する
- Task 12-6: Phase 12成果物6件と artifacts parity を最終確認する

## 参照資料

| 参照資料               | パス                                                         | 説明            |
| ---------------------- | ------------------------------------------------------------ | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物  |
| 仕様抽出結果           | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物  |
| 差分カバレッジ         | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物  |
| トレーサビリティ行列   | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物  |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物  |
| 依存整合マトリクス     | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                  | Phase 5 成果物  |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                           | Phase 5 成果物  |
| 契約差分               | `outputs/phase-5/contract-diff.md`                           | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`                     | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`                  | Phase 6 成果物  |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`                        | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                           | Phase 7 成果物  |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`                 | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`            | Phase 7 成果物  |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                        | Phase 8 成果物  |
| 再テスト計画           | `outputs/phase-8/post-refactor-test-plan.md`                 | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`             | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`                          | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                           | Phase 9 成果物  |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`                       | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                    | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`                 | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md`            | Phase 10 成果物 |
| 手動テスト結果         | `outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md`  | Phase 11 成果物 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`                         | Phase 11 成果物 |
| ベンチマーク結果       | `outputs/phase-11/benchmark-results.md`                      | Phase 11 成果物 |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成し、`## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定文言で明記する。
2. Task 12-2 Step 1-A: 完了タスク記録、関連リンク、LOGS.md（2ファイル）、SKILL.md（2ファイル）を更新する。
3. Task 12-2 Step 1-B: 実装状況テーブルを `completed` または `spec_created` へ更新する。
4. Task 12-2 Step 1-C: 関連タスクテーブルのステータスを更新する。
5. Task 12-2 Step 1-D: `generate-index.js` を実行し、topic-map / keyword / resource系索引を再生成する。
6. Task 12-2 Step 2: 新規I/F追加有無を判定し、必要時だけ仕様更新を実施する。不要時も理由を残す。
7. Task 12-3/12-4/12-5: changelog、未タスク検出、skill-feedback を出力する。
8. Task 12-6: Phase 12成果物6件、`artifacts.json` / `outputs/artifacts.json` parity、planned wording 0件、Phase 11 evidence 参照整合を確認する。

## Task 12-1 実装ガイド要件

### Part 1（中学生レベル）

日常の例え話を用いて Late Chunking を説明すること。

- **例え話**: 図書館の本を読む方法の比較
  - 従来のチャンキング: 本の各章を独立して読み、それぞれの要約を作る（章をまたぐ文脈が失われる）
  - Late Chunking: 本全体を先に通読してから、各章の要約を作る（全体の文脈を保持した要約になる）
- 専門用語は登場した瞬間に即時説明すること
- 中学生が理解できる語彙を使用すること

### Part 2（技術者レベル）

- TypeScript型定義の全件記載
- 公開APIシグネチャの説明
- エラーハンドリングのパターン
- 設定値一覧（デフォルト値・上限値を含む）
- パフォーマンス特性（時間計算量・空間計算量）
- `## 視覚証跡` セクションを必ず設け、`UI/UX変更なしのため Phase 11 スクリーンショット不要` と `outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md` / `outputs/phase-11/benchmark-results.md` を明記する

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                                  |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                        |
| 整合性   | Late Chunking API・型定義・パイプライン契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する                       |

## 成果物

| 成果物                  | パス                                                     | 説明                                |
| ----------------------- | -------------------------------------------------------- | ----------------------------------- |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`               | Part1（中学生）/Part2（技術者）構成 |
| system spec更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/1-D/Step 2記録     |
| 更新履歴                | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）             |
| スキルフィードバック    | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）               |
| Phase 12準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終自己監査とvalidator記録         |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 の実装ガイドが Part 1（中学生レベル）と Part 2（技術者レベル）の2部構成で作成されていること
- [ ] Task 12-2 の Step 1-A/1-B/1-C/1-D が全件実行されていること
- [ ] Task 12-3 の更新履歴が作成されていること
- [ ] Task 12-4 の未タスク検出レポートが作成されていること（0件でも必須）
- [ ] Task 12-5 のスキルフィードバックレポートが作成されていること（改善点0件でも必須）
- [ ] Task 12-6 の Phase 12準拠チェックが作成されていること
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が確認されていること
- [ ] planned wording（`計画` / `予定` / `TODO`）が Phase 12成果物に残っていないこと
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド（Part 1/Part 2）作成
3. Task 12-2: システム仕様更新（Step 1-A/1-B/1-C/1-D/Step 2）
4. Task 12-3: 更新履歴作成
5. Task 12-4: 未タスク検出レポート出力
6. Task 12-5: スキルフィードバックレポート出力
7. Task 12-6: Phase 12準拠チェック
8. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                       | 完了条件                                        |
| -------- | ------------------------------ | ----------------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + LOGS.md（2）+ SKILL.md（2）更新      |
| Step 1-B | 全タスクで必須                 | 実装状況を completed または spec_created へ更新 |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新                      |
| Step 1-D | 仕様書変更がある場合は必須     | generate-index.js 実行 + 索引再生成             |
| Step 2   | 新規I/F追加がある場合          | 対象仕様を更新し変更履歴へ記録                  |

## 次のPhase

Phase 13: PR作成
