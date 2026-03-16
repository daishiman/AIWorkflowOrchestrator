# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| Phase名    | 最終レビュー                           |
| 前提Phase  | Phase 9（品質検証）                    |
| 後続Phase  | Phase 11（手動テスト）                 |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |

---

## 目的

Task05（利用導線）/ Task08（公開・互換性）に対して十分な観測基盤となるか最終判定する。Phase 1-9 の全成果物を多角的にレビューし、PASS / MINOR / MAJOR / CRITICAL の判定を行い、Phase 11 への進行可否を決定する。

## 背景

最終レビューは品質ゲートの最終関門として、以下の観点で全体的な品質・整合性を検証する: (1) 受入基準 AC-1〜AC-4 の充足、(2) Phase 2 設計と最終実装の差分、(3) Task05/08 連携の実用性、(4) セキュリティ・パフォーマンス・エラーハンドリングの妥当性。判定結果に応じて Phase 11 への進行または Phase 1-8 への差し戻しを決定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準 AC-1〜AC-4 の充足確認

**目的**: Phase 1 で定義した全受入基準が最終成果物で満たされているか検証する。

**実行手順**:

1. AC-1（ライフサイクル履歴モデル）の充足確認:
   - `SkillLifecycleEvent` 型が全5カテゴリ（creation / evaluation / execution / improvement / reuse）をカバーしているか
   - 各カテゴリのイベント種別が Phase 1 のイベント一覧と一致しているか
   - metadata スキーマがカテゴリごとに定義されているか
   - 因果関係（parentEventId）ルールが実装されているか
2. AC-2（フィードバック契約）の充足確認:
   - `SkillFeedback` 型が自動メトリクス・ユーザーレーティング・テキスト・改善提案の4種類をカバーしているか
   - フィードバック→改善アクションの還流ルールが実装されているか
   - 改善優先度の計算式（`priority = (1 - successRate) * weight_sr + ...`）が実装されているか
3. AC-3（利用履歴と評価履歴の横断参照）の充足確認:
   - `SkillAggregateView` で実行履歴と評価履歴が統合表示されるか
   - 「最近使ったスキル」リスト（最新10件、最終実行日時降順）が実装されているか
   - スコア推移グラフのデータポイント（`ScoreDataPoint[]`）が提供されているか
4. AC-4（Task08 公開判断材料への接続）の充足確認:
   - `PublishReadinessMetrics` インターフェースが定義されているか
   - `getPublishReadiness(skillId)` API が実装されているか
   - 契約境界（データ提供 = Task07 / 判断ロジック = Task08）が明確か
5. 充足結果をマトリクス形式で記録する:

| AC   | 基準                                     | 充足 | 根拠（成果物パス・行番号） |
| ---- | ---------------------------------------- | ---- | -------------------------- |
| AC-1 | ライフサイクル履歴モデルが定義されている | -    | -                          |
| AC-2 | フィードバック契約がある                 | -    | -                          |
| AC-3 | 利用履歴と評価履歴を横断参照できる       | -    | -                          |
| AC-4 | Task08 公開判断材料へ接続できる          | -    | -                          |

**期待される成果物**:

- 受入基準充足マトリクス（AC ごとの充足状況と根拠）

---

### タスク2: 設計完全性レビュー（Phase 2 設計 vs 最終仕様の差分確認）

**目的**: Phase 2 の設計と最終実装の間に意図しない乖離がないか確認する。

**実行手順**:

1. 型定義の差分確認:
   - Phase 2 の `event-model-design.md` で定義した `SkillLifecycleEvent` と最終実装の型定義を比較する
   - Phase 2 の `aggregate-view-design.md` で定義した `SkillAggregateView` と最終実装を比較する
   - Phase 2 の `feedback-loop-design.md` で定義した `SkillFeedback` と最終実装を比較する
   - Phase 2 の `publish-metrics-interface-design.md` で定義した `PublishReadinessMetrics` と最終実装を比較する
2. 集約ロジックの差分確認:
   - 成功率計算（`successCount / totalExecutions`、直近30日間）
   - トレンド計算（直近5回のスコア変化の傾き）
   - 推薦スコア（`successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2`）
3. データフローの差分確認:
   - Phase 2 の `data-flow-design.md` で定義した Renderer -> IPC -> Main -> SQLite -> 集約 -> UI のフローが実装と一致するか
4. 意図的な変更と意図しない乖離を分類し記録する:
   - 意図的変更: Phase 8 のリファクタリングで改善した箇所
   - 意図しない乖離: 設計漏れまたは実装誤り

**期待される成果物**:

- 設計-実装差分レポート（差分一覧、意図的変更 vs 意図しない乖離の分類）

---

### タスク3: Task05/08 連携の最終検証

**目的**: Task05（利用導線）と Task08（公開・互換性）との連携が実用的であることを最終確認する。

**実行手順**:

1. Task05 連携の検証:
   - ScoreGateBadge のスコア表示に必要なデータが `SkillAggregateView.latestScore` から取得可能か
   - PostExecutionActionBar の導線分岐に必要な実行履歴が `SkillAggregateView.recentEvents` から参照可能か
   - 「最近使ったスキル」リストのクエリが効率的か（全イベント走査ではなくインデックスベースか）
   - フィードバック入力 UI（星レーティング + 一言コメント）のデータが `SkillFeedback` に正しく保存されるか
2. Task08 連携の検証:
   - `PublishReadinessMetrics.readinessLevel` の計算が `qualityScore` / `stabilityScore` / `usageCount` / `hasCriticalFeedback` から正しく導出されるか
   - Task08 が `getPublishReadiness(skillId)` を呼び出すだけで公開判断に必要な全データを取得できるか
   - メトリクス計算のタイミング（リアルタイム vs バッチ）が Task08 の要件に適合するか
3. 循環依存の最終確認:
   - Task07 -> Task05 / Task08 の依存方向が一方向であることを確認する
   - Task05 / Task08 から Task07 への逆方向依存がないことを確認する

**期待される成果物**:

- 連携最終検証レポート（Task05/08 各連携ポイントの検証結果、循環依存確認）

---

### タスク4: 多角的レビューと PASS/MINOR/MAJOR/CRITICAL 判定

**目的**: 全レビュー結果を統合し、最終判定を行う。

**実行手順**:

1. 以下のレビュー観点で評価する:

| #   | 観点               | 確認内容                                       |
| --- | ------------------ | ---------------------------------------------- |
| 1   | 機能完全性         | AC-1〜AC-4 が全て充足されているか              |
| 2   | コード品質         | Phase 8 リファクタリング後の命名・重複・可読性 |
| 3   | テスト品質         | カバレッジ基準達成、境界値・異常系テスト有無   |
| 4   | セキュリティ       | IPC バリデーション（P42）、型安全性（P19/P48） |
| 5   | パフォーマンス     | 集約計算の効率性、不要な全走査の有無           |
| 6   | エラーハンドリング | Result パターン使用、エラー伝播の適切性        |
| 7   | データ整合性       | イベント永続化の一貫性、集約ビューの正確性     |
| 8   | 設計完全性         | Phase 2 設計との乖離が意図的変更のみか         |

2. 判定基準:

| 判定     | 条件                                         | 次のアクション                                              |
| -------- | -------------------------------------------- | ----------------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                     | Phase 11（手動テスト）へ進行                                |
| MINOR    | 軽微な指摘あり（機能に影響しない）           | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行（省略不可） |
| MAJOR    | 重大な問題あり（AC 未充足、設計乖離）        | 影響範囲に応じて Phase 1-8 へ差し戻し                       |
| CRITICAL | 致命的な問題あり（セキュリティ、データ損失） | Phase 1 へ戻りユーザーと要件を再確認                        |

3. MINOR 判定の場合の必須フロー:
   - 全指摘事項を分析する
   - 各指摘を未タスク仕様書に変換する（generate-unassigned-task エージェント使用）
   - `docs/30-workflows/unassigned-task/` に配置する（P38 準拠: 配置先を間違えない）
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する
   - P3 準拠: 3ステップ全完了を確認する

4. MAJOR 判定の場合の戻り先決定:

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| テスト拡充の問題 | Phase 6（テスト拡充）       |
| カバレッジ未達   | Phase 7（カバレッジ確認）   |
| コード品質の問題 | Phase 8（リファクタリング） |

**期待される成果物**:

- 最終レビュー判定書（判定結果、全レビュー観点の評価、指摘事項一覧、対応方針）
- MINOR の場合: 未タスク仕様書（`unassigned-task/` に配置）

---

## 参照資料

| 参照資料                               | パス                                                                                                                      | 内容                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1-9 全成果物                     | `outputs/`                                                                                                                | 全 Phase の成果物           |
| Phase 2 設計成果物                     | `outputs/phase-2/`                                                                                                        | 設計契約の原本              |
| Phase 5 実装成果物                     | `outputs/phase-5/`                                                                                                        | 設計との突合対象            |
| Phase 9 品質ゲート                     | `outputs/phase-9/quality-gate-report.md`                                                                                  | 品質ゲート判定結果          |
| review-gate-criteria                   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                            | レビューゲート判定基準      |
| task-05 index                          | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                              | Task05 利用導線（完了済み） |
| task-08 index                          | `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/index.md` | Task08 公開・互換性（後続） |
| task-workflow                          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                      | 完了/未タスク台帳           |
| known-pitfalls                         | `.claude/rules/06-known-pitfalls.md`                                                                                      | 既知の落とし穴一覧          |
| ライフサイクルイベント一覧             | `outputs/phase-1/lifecycle-event-catalog.md`                                                                              | Phase 1 成果物              |
| フィードバック収集要件                 | `outputs/phase-1/feedback-collection-spec.md`                                                                             | Phase 1 成果物              |
| Task05連携要件                         | `outputs/phase-1/task05-integration-contract.md`                                                                          | Phase 1 成果物              |
| Task08メトリクス定義                   | `outputs/phase-1/task08-metrics-definition.md`                                                                            | Phase 1 成果物              |
| 受入基準検証マトリクス                 | `outputs/phase-1/acceptance-criteria-matrix.md`                                                                           | Phase 1 成果物              |
| イベントモデル設計書                   | `outputs/phase-2/event-model-design.md`                                                                                   | Phase 2 成果物              |
| 集約ビュー設計書                       | `outputs/phase-2/aggregate-view-design.md`                                                                                | Phase 2 成果物              |
| フィードバック還流設計書               | `outputs/phase-2/feedback-loop-design.md`                                                                                 | Phase 2 成果物              |
| 公開メトリクスIF設計書                 | `outputs/phase-2/publish-metrics-interface-design.md`                                                                     | Phase 2 成果物              |
| データフロー設計書                     | `outputs/phase-2/data-flow-design.md`                                                                                     | Phase 2 成果物              |
| SkillLifecycleEvent実装仕様書          | `outputs/phase-5/event-model-impl-spec.md`                                                                                | Phase 5 成果物              |
| lifecycleHistorySlice設計仕様書        | `outputs/phase-5/lifecycle-history-slice-spec.md`                                                                         | Phase 5 成果物              |
| 集約ロジック実装仕様書                 | `outputs/phase-5/aggregate-logic-impl-spec.md`                                                                            | Phase 5 成果物              |
| フィードバックモデル実装仕様書         | `outputs/phase-5/feedback-model-impl-spec.md`                                                                             | Phase 5 成果物              |
| Task08メトリクスAPI実装仕様書          | `outputs/phase-5/publish-metrics-api-impl-spec.md`                                                                        | Phase 5 成果物              |
| イベントカテゴリ別カバレッジマトリクス | `outputs/phase-7/event-category-coverage-matrix.md`                                                                       | Phase 7 成果物              |
| 集約計算ロジックカバレッジマトリクス   | `outputs/phase-7/aggregate-logic-coverage-matrix.md`                                                                      | Phase 7 成果物              |
| フィードバック還流パスカバレッジ       | `outputs/phase-7/feedback-path-coverage-matrix.md`                                                                        | Phase 7 成果物              |
| カバレッジゲート判定書                 | `outputs/phase-7/coverage-gate-decision.md`                                                                               | Phase 7 成果物              |
| 命名統一レポート                       | `outputs/phase-8/naming-unification-report.md`                                                                            | Phase 8 成果物              |
| 重複除去レポート                       | `outputs/phase-8/deduplication-report.md`                                                                                 | Phase 8 成果物              |
| データフロー最適化記録                 | `outputs/phase-8/data-flow-optimi                                                                                         |
| 仕様書品質検証レポート                 | `outputs/phase-9/spec-quality-report.md`                                                                                  | Phase 9 成果物              |
| 型整合性検証レポート                   | `outputs/phase-9/type-consistency-report.md`                                                                              | Phase 9 成果物              |
| リンク有効性検証レポート               | `outputs/phase-9/link-validity-report.md`                                                                                 | Phase 9 成果物              |

zation-report.md`| Phase 8 成果物 |
| テスト再実行レポート |`outputs/phase-8/test-rerun-report.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

> 最終レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |

---

## 成果物

| 成果物                 | パス                                                   | 内容                                     |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------- |
| 受入基準充足マトリクス | `outputs/phase-10/acceptance-criteria-fulfillment.md`  | AC-1〜AC-4 の充足状況と根拠              |
| 設計-実装差分レポート  | `outputs/phase-10/design-implementation-gap-report.md` | Phase 2 設計と最終実装の差分分析         |
| 連携最終検証レポート   | `outputs/phase-10/integration-final-verification.md`   | Task05/08 各連携ポイントの検証結果       |
| 最終レビュー判定書     | `outputs/phase-10/final-review-decision.md`            | PASS/MINOR/MAJOR/CRITICAL 判定と指摘事項 |

---

## 統合テスト連携

- PASS 判定の場合、Phase 11（手動テスト）で実際の操作フローを検証する
- MINOR 指摘は未タスク仕様書に変換し、Phase 12 で追跡する（省略不可）
- MAJOR 判定の場合、影響範囲に応じて Phase 1-8 に戻り修正する
- CRITICAL 判定の場合、Phase 1 に戻りユーザーと要件を再確認する

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション                       |
| -------- | ------------------------ | ------------------------------------ |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行                      |
| MINOR    | 軽微な指摘あり           | 未タスク化後 Phase 11 へ（省略不可） |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて Phase 1-8 へ戻る    |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認           |

### 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| テスト拡充の問題 | Phase 6（テスト拡充）       |
| カバレッジ未達   | Phase 7（カバレッジ確認）   |
| コード品質の問題 | Phase 8（リファクタリング） |

---

## 完了条件

- [ ] 受入基準 AC-1〜AC-4 の充足状況が全て確認・記録されている
- [ ] Phase 2 設計と最終実装の差分が分析され、意図的変更 vs 意図しない乖離が分類されている
- [ ] Task05 との連携（ScoreGateBadge / PostExecutionActionBar / 最近使ったスキル）が検証されている
- [ ] Task08 との連携（PublishReadinessMetrics / getPublishReadiness API / 契約境界）が検証されている
- [ ] 循環依存がないことが確認されている
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] MINOR 判定の場合、全指摘事項が未タスク仕様書に変換されている（P3 準拠: 3ステップ完了）
- [ ] MINOR の未タスク仕様書が `unassigned-task/` に配置されている（P38 準拠）
- [ ] 全成果物が `outputs/phase-10/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9（品質検証）が完了し、品質ゲートが PASS していること
- **後続**: PASS/MINOR 判定の場合 Phase 11 へ進む。MAJOR の場合 Phase 1-8 へ戻る。CRITICAL の場合 Phase 1 へ戻る

---

## 次のPhase

PASS/MINOR 判定後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-11-manual-test.md`
