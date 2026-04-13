# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 11                                             |
| 後続Phase  | Phase 13                                             |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

実装完了を記録し、実装ガイド・仕様書更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・準拠チェックの 6 タスクを完遂する。

## 実行タスク

1. `implementation-guide.md` を Part 1 / Part 2 構成で作成する。
2. `system-spec-update-summary.md` で Step 1-A〜1-G と Step 2 判定を記録する。
3. `documentation-changelog.md` に更新対象・検証結果・parity を記録する。
4. `unassigned-task-detection.md` を 0 件でも出力する。
5. `skill-feedback-report.md` に改善点の有無を記録する。
6. `phase12-task-spec-compliance-check.md` で 6 タスクと validator 結果を突合する。

## Phase 12 の6タスク（全て必須）

| Task      | 名称                                | 必須 | 成果物                                                   |
| --------- | ----------------------------------- | ---- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（Part 1/2）          | ✅   | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システム仕様書更新                  | ✅   | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成            | ✅   | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出レポート（0件でも出力） | ✅   | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート        | ✅   | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Task Spec コンプライアンスチェック  | ✅   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## Task 12-1: 実装ガイド（Part 1/2）

### Part 1（中学生レベル）必須要件

- 日常生活での例え話を必ず含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」→「何をするか」の順で説明
- 例え話: 「レストランの注文票を厨房に届ける係（IPC）は完成している。今回はその注文データを本部のデータセンターに送る郵便係（HTTP 送信）を追加した」

### Part 2（技術者レベル）必須要件

- `sendToAnalyticsProvider` のインターフェース定義
- 環境変数 `ANALYTICS_ENDPOINT_URL` の設定方法
- エラーハンドリングの設計（catch でエラーを握り潰す理由）
- テスト方法（fetch モック）

---

## Task 12-2: システム仕様書更新（4 サブステップ + Step 2 判定）

| Step     | 必須 | 内容                                                                                           |
| -------- | ---- | ---------------------------------------------------------------------------------------------- |
| Step 1-A | ✅   | 完了タスク記録 + 関連ドキュメントリンク + 変更履歴 + LOGS.md x2 + SKILL.md x2 + topic-map 更新 |
| Step 1-B | ✅   | 実装状況テーブルを更新（実装完了は `completed`、仕様書作成のみは `spec_created`）              |
| Step 1-C | ✅   | 関連タスクテーブルを更新（仕様書内の関連タスク・未タスク候補を current facts に同期）          |
| Step 1-D | ✅   | `topic-map.md` を再生成し、行番号とセクション名を同期                                          |
| Step 1-E | ✅   | 未タスク候補を抽出し、`task-workflow.md` と関連仕様書へ登録                                    |
| Step 1-F | 条件 | DevOps / CI 最適化タスクのみ更新（今回のタスクでは N/A になり得る）                            |
| Step 1-G | ✅   | `verify-all-specs.js` / `validate-phase-output.js` / `diff -qr` で parity を検証               |
| Step 2   | 条件 | 新規インターフェース / API / shared contract 追加時のみ更新                                    |

### Step 2 判定基準

- `sendToAnalyticsProvider` が public export された場合は Step 2 を実施する。
- module 内部関数に留まる場合は Step 2 を N/A とする。
- public contract が不変でも、state owner・failure lifecycle・verify 遷移が変わる場合は Step 2 を再判定する。

---

## Task 12-3: ドキュメント更新履歴

- 変更した file 一覧を canonical path で記録する。
- `validate-phase-output.js` と `verify-all-specs.js` の結果を current facts として残す。
- `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` の Phase 11 証跡を Phase 12 参照に持ち込む。
- `artifacts.json` と `outputs/artifacts.json` の parity を書く。
- `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` の更新有無を記録する。
- `計画済み` / `予定` / `TODO` / future wording を残さない。

---

## Task 12-4: 未タスク検出ソース

| ソース                 | 確認項目                            |
| ---------------------- | ----------------------------------- |
| スコープ外明示項目     | 外部分析基盤構築、ダッシュボード UI |
| Phase 10 MINOR 指摘    | 未タスク化済みか確認                |
| Phase 11 手動テスト    | `discovered-issues.md` と整合するか |
| コードコメント         | TODO/FIXME が残存していないか       |
| describe.skip ブロック | 旧参照が残っていないか              |

---

## Task 12-5: スキルフィードバックレポート

- 改善点があれば next action を書く。
- 改善点がなければ「なし」と理由を書く。
- `SKILL.md` / `LOGS.md` / reference template のどれを改善したかを明示する。
- 変更理由は validator 結果または current facts に結びつける。

---

## Task 12-6: Task Spec コンプライアンスチェック

- Task 12-1〜12-5 の全完了を確認してから作成する。
- `outputs/phase-12/*.md` 全体に future wording が残っていないことを確認する。
- `artifacts.json` と `outputs/artifacts.json` の title / type / status / artifact 名 parity を確認する。
- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `artifacts.json` / `outputs/artifacts.json` の same-wave 同期を確認する。
- `validate-phase-output.js` / `verify-all-specs.js` / `verify-unassigned-links.js` の実測値を root evidence に残す。

---

## 参照資料

| 参照資料                 | パス                                                                                   | 説明            |
| ------------------------ | -------------------------------------------------------------------------------------- | --------------- |
| アーキテクチャ設計       | `outputs/phase-2/architecture-design.md`                                               | Phase 2 成果物  |
| HTTP送信設計             | `outputs/phase-2/http-send-design.md`                                                  | Phase 2 成果物  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`                                            | Phase 5 成果物  |
| 異常系結果               | `outputs/phase-6/edge-case-result.md`                                                  | Phase 6 成果物  |
| トレーサビリティ網羅率   | `outputs/phase-7/traceability-coverage-report.md`                                      | Phase 7 成果物  |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`                                                  | Phase 8 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`                                                    | Phase 9 成果物  |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                                            | Phase 11 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                               | Phase 11 成果物 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`                                                | Phase 11 成果物 |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 手順       |
| Phase 12 ガイド          | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 詳細       |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`                                           | Phase 1 成果物  |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                                               | Phase 1 成果物  |
| 仕様抽出結果             | `outputs/phase-1/aiworkflow-requirements-extraction.md`                                | Phase 1 成果物  |
| 差分カバレッジ           | `outputs/phase-1/branch-diff-coverage.md`                                              | Phase 1 成果物  |
| トレーサビリティ行列     | `outputs/phase-1/implementation-spec-traceability-matrix.md`                           | Phase 1 成果物  |
| テスト戦略               | `outputs/phase-2/test-strategy.md`                                                     | Phase 2 成果物  |
| 依存整合マトリクス       | `outputs/phase-2/dependency-consistency-matrix.md`                                     | Phase 2 成果物  |
| 変更ファイル一覧         | `outputs/phase-5/changed-files.md`                                                     | Phase 5 成果物  |
| 契約差分                 | `outputs/phase-5/contract-diff.md`                                                     | Phase 5 成果物  |
| 再テスト計画             | `outputs/phase-8/post-refactor-test-plan.md`                                           | Phase 8 成果物  |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md`                                       | Phase 8 成果物  |
| リスク台帳               | `outputs/phase-9/risk-register.md`                                                     | Phase 9 成果物  |
| 因果ループ監査           | `outputs/phase-9/causal-loop-check.md`                                                 | Phase 9 成果物  |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                                              | Phase 10 成果物 |
| 是正計画                 | `outputs/phase-10/corrective-plan.md`                                                  | Phase 10 成果物 |
| 出荷準備チェック         | `outputs/phase-10/shipment-readiness-check.md`                                         | Phase 10 成果物 |

## 成果物

| 成果物                             | パス                                                     | 説明                        |
| ---------------------------------- | -------------------------------------------------------- | --------------------------- |
| 実装ガイド                         | `outputs/phase-12/implementation-guide.md`               | Part 1/2 構成               |
| システム仕様更新サマリー           | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G + Step 2 記録 |
| ドキュメント更新履歴               | `outputs/phase-12/documentation-changelog.md`            | 全更新履歴                  |
| 未タスク検出レポート               | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須             |
| スキルフィードバックレポート       | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須      |
| Task Spec コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence               |

## 完了条件

- [ ] Task 12-1: 実装ガイドが Part 1/2 構成で完成していること
- [ ] Task 12-2: Step 1-A〜1-G が全件完了し、Step 2 判定が記録されていること
- [ ] Task 12-3: documentation-changelog が全 Step の結果（「該当なし」も含む）を記録していること
- [ ] Task 12-4: 未タスク検出レポートが 0 件でも出力されていること
- [ ] Task 12-5: スキルフィードバックレポートが改善点なしでも出力されていること
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` が root evidence として残っていること
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が確認されていること
- [ ] LOGS.md が aiworkflow-requirements と task-specification-creator の両方で更新されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 苦戦防止 Tips

| Tips                               | 説明                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| Step 実行前にチェックリストを作成  | Step 1-A〜Step 2 を空欄で事前作成し逐次消化                 |
| `artifacts.json` parity を事前確認 | Phase 12 完了前に 2 ファイルを diff で同期                  |
| LOGS.md は 2 ファイル更新          | aiworkflow-requirements + task-specification-creator の両方 |

## サブタスク管理

1. Task 12-1: 実装ガイド作成（Part 1/2）
2. Task 12-2: システム仕様書更新（Step 1-A〜1-G + Step 2）
3. Task 12-3: ドキュメント更新履歴作成
4. Task 12-4: 未タスク検出レポート作成
5. Task 12-5: スキルフィードバックレポート作成
6. Task 12-6: Task Spec コンプライアンスチェック

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 6 つの成果物が全件存在すること
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 --regenerate
```

## 次のPhase

Phase 13: PR 作成（ユーザーの明示承認後のみ）
