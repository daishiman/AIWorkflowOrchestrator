# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| Phase名    | 手動テスト                             |
| 前提Phase  | Phase 10（最終レビュー）PASS/MINOR     |
| 後続Phase  | Phase 12（ドキュメント）               |
| ステータス | 実施済み                               |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計（docs-only）                      |

---

## 目的

作成、評価、利用、改善の一連操作が履歴にどう現れるかを確認する。設計タスクのため、仕様書間の追跡可能性（traceability）と検証コマンドの再実行性を重点的にウォークスルーで検証する。

## 背景

TASK-SKILL-LIFECYCLE-07 は設計タスク（docs-only）であり、UIやコード実装を伴わない。Phase 11 ではスクリーンショットベースの視覚検証ではなく、仕様書間のリンク追跡・成果物の整合性・検証コマンドの再現性を確認するウォークスルーシナリオを実施する。

## テストケース

| TC-ID    | 対象シナリオ | 観点                               | 期待結果                                                     |
| -------- | ------------ | ---------------------------------- | ------------------------------------------------------------ |
| TC-11-01 | シナリオA    | スキル作成→評価→実行の履歴追跡     | Task07 のイベント/集約設計が Task05 導線と整合して追跡できる |
| TC-11-02 | シナリオB    | フィードバック入力→改善→再評価還流 | feedback から improvement までの因果関係が追跡できる         |
| TC-11-03 | シナリオC    | Task08 公開判断メトリクス連携      | PublishReadiness 指標を後続タスクへ受け渡せる                |

## 画面カバレッジマトリクス

| TC-ID    | 画面/観点                         | スクリーンショット                                                                                                  |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-11-01 | Immediate Use 代表画面            | `screenshots/TC-11-01-created-immediate-use-entry.png`, `screenshots/TC-11-00-created-skill-usage-review-board.png` |
| TC-11-02 | Deferred Use 代表画面             | `screenshots/TC-11-02-deferred-use-entry.png`, `screenshots/TC-11-00-created-skill-usage-review-board.png`          |
| TC-11-03 | History Reuse / Feedback 代表画面 | `screenshots/TC-11-03-history-reuse-entry.png`, `screenshots/TC-11-00-created-skill-usage-review-board.png`         |

> 注: current build の Vite 起動が `esbuild` platform mismatch で停止したため、同機能系 completed workflow の代表画面を current workflow 配下に再集約し、review board を再撮影して目視検証した。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ウォークスルーシナリオA - スキル作成→評価→実行の履歴追跡

**目的**: Phase 1 で定義したライフサイクルイベント（作成/評価/実行）が Phase 2 の設計モデルで正しく表現され、Phase 4-9 の成果物で検証可能であることを追跡確認する。

**実行手順**:

1. Phase 1 成果物 `outputs/phase-1/lifecycle-event-catalog.md` を開き、作成・評価・実行カテゴリのイベントを確認する
2. Phase 2 成果物 `outputs/phase-2/event-model-design.md` を開き、`SkillLifecycleEvent` 型が上記イベントをカバーしているか確認する
3. Phase 2 成果物 `outputs/phase-2/aggregate-view-design.md` を開き、`SkillAggregateView` 型の集約ロジックが Phase 1 要件と整合しているか確認する
4. Phase 4-9 の成果物で、上記の型定義に対するテスト・実装・品質検証が存在することを確認する
5. 以下の追跡チェックを実施する:
   - SKILL.md から `interfaces-agent-sdk-skill.md` へ辿れるか
   - LOGS.md からタスク完了記録へ辿れるか
   - `validate-phase-output.js` を対象ワークフローに対して再実行できるか

**期待される成果物**:

- `outputs/phase-11/walkthrough-scenario-a.md`（追跡結果と検証ログ）

---

### タスク2: ウォークスルーシナリオB - フィードバック入力→改善→再評価の還流確認

**目的**: フィードバック収集→改善アクション→再評価のデータフローが設計書で一貫して定義されていることを確認する。

**実行手順**:

1. Phase 1 成果物 `outputs/phase-1/feedback-collection-spec.md` を開き、自動収集と手動フィードバックの境界を確認する
2. Phase 2 成果物 `outputs/phase-2/feedback-loop-design.md` を開き、`SkillFeedback` 型と還流ルールが Phase 1 要件を満たしているか確認する
3. Phase 2 成果物 `outputs/phase-2/data-flow-design.md` を開き、フィードバック→改善アクションのデータフローが完結しているか確認する
4. Phase 1 の受入基準 AC-2（フィードバックデータ定義）と AC-3（Task05 連動）の検証データが存在するか確認する
5. 以下の追跡チェックを実施する:
   - `SkillFeedback` 型の `sourceEventId` が `SkillLifecycleEvent.id` を参照する設計になっているか
   - 改善優先度計算式の入力パラメータが集約ビューから取得可能か

**期待される成果物**:

- `outputs/phase-11/walkthrough-scenario-b.md`（還流パスの追跡結果）

---

### タスク3: ウォークスルーシナリオC - Task08 公開判断メトリクスの確認

**目的**: Task08（公開・互換性）が使う公開判断メトリクスが、本タスクの成果物から正しく提供されることを確認する。

**実行手順**:

1. Phase 1 成果物 `outputs/phase-1/task08-metrics-definition.md` を開き、公開判断に必要な最小指標セットを確認する
2. Phase 2 成果物 `outputs/phase-2/publish-metrics-interface-design.md` を開き、`PublishReadinessMetrics` インターフェースが Phase 1 の指標を網羅しているか確認する
3. Task05 連携要件 `outputs/phase-1/task05-integration-contract.md` との整合性を確認する（Task05 の CTA 制御マトリクスが必要とする履歴データが提供可能か）
4. 受入基準 AC-4（Task08 公開判断材料への接続）の検証データが存在するか確認する
5. Task08 index（`docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/index.md`）を確認し、本タスクの成果物が後続タスクの入力として参照可能か確認する

**期待される成果物**:

- `outputs/phase-11/walkthrough-scenario-c.md`（Task08 接続の検証結果）

---

### タスク4: 発見事項の記録

**目的**: ウォークスルーで発見された問題・改善点を記録し、Phase 12 での未タスク検出に引き継ぐ。

**実行手順**:

1. タスク1-3 で発見された問題を以下のカテゴリで分類する:
   - **Blocker**: Phase 12 に進む前に修正が必要な問題
   - **Note**: Phase 12 の未タスク検出で記録すべき改善点
   - **Info**: 参考情報（修正不要）
2. 各発見事項に対して影響範囲と推奨対応を記録する
3. 手動テスト結果レポートを作成する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`（発見事項リスト）
- `outputs/phase-11/manual-test-report.md`（手動テスト結果サマリー）

---

## docs-only タスク向け検証チェックリスト

> 設計タスク固有の追跡可能性チェック

- [ ] SKILL.md から `interfaces-agent-sdk-skill.md` の該当セクションへ辿れる
- [ ] LOGS.md から本タスクのアーカイブ（完了タスク記録）へ辿れる
- [ ] `.claude/skills/` と成果物ディレクトリのファイルセットが整合している
- [ ] `validate-phase-output.js` を本ワークフローに対して再実行でき、エラーが0件である

---

## 参照資料

| 参照資料               | パス                                                                                                                      | 内容                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物         | `outputs/phase-1/`                                                                                                        | 要件定義の全成果物         |
| Phase 2 成果物         | `outputs/phase-2/`                                                                                                        | 設計の全成果物             |
| Phase 5 成果物         | `outputs/phase-5/`                                                                                                        | 実装仕様の検証対象         |
| Phase 6 成果物         | `outputs/phase-6/`                                                                                                        | テスト拡充の検証対象       |
| Phase 7 成果物         | `outputs/phase-7/`                                                                                                        | カバレッジ根拠             |
| Phase 8 成果物         | `outputs/phase-8/`                                                                                                        | リファクタリング結果       |
| Phase 9 成果物         | `outputs/phase-9/`                                                                                                        | 品質検証結果               |
| Phase 10 成果物        | `outputs/phase-10/`                                                                                                       | 最終レビュー結果           |
| phase-template-phase11 | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                                          | Phase 11 テンプレート      |
| task-05 index          | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                              | 作成済みスキル利用導線     |
| task-08 index          | `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/index.md` | スキル公開・互換性（後続） |
| 受入基準充足マトリクス | `outputs/phase-10/acceptance-criteria-fulfillment.md`                                                                     | Phase 10 成果物            |
| 設計-実装差分レポート  | `outputs/phase-10/design-implementation-gap-report.md`                                                                    | Phase 10 成果物            |
| 連携最終検証レポート   | `outputs/phase-10/integration-final-verification.md`                                                                      | Phase 10 成果物            |
| 最終レビュー判定書     | `outputs/phase-10/final-review-decision.md`                                                                               | Phase 10 成果物            |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                       |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル管理インターフェース |

---

## 成果物

| 成果物                  | パス                                         | 内容                                     |
| ----------------------- | -------------------------------------------- | ---------------------------------------- |
| ウォークスルーシナリオA | `outputs/phase-11/walkthrough-scenario-a.md` | スキル作成→評価→実行の履歴追跡結果       |
| ウォークスルーシナリオB | `outputs/phase-11/walkthrough-scenario-b.md` | フィードバック→改善→再評価の還流確認結果 |
| ウォークスルーシナリオC | `outputs/phase-11/walkthrough-scenario-c.md` | Task08 公開判断メトリクスの検証結果      |
| 手動テスト結果レポート  | `outputs/phase-11/manual-test-report.md`     | ウォークスルー全体のサマリー             |
| 発見事項リスト          | `outputs/phase-11/discovered-issues.md`      | Blocker/Note/Info の分類済み発見事項     |

---

## 統合テスト連携

- Phase 10 の最終レビュー結果（PASS/MINOR）を前提とする
- 発見された Blocker は Phase 10 へ差し戻し、MINOR/Note は Phase 12 の未タスク検出で処理する
- ウォークスルー結果は Phase 12 の実装ガイド作成の入力として使用する

---

## 完了条件

- [ ] ウォークスルーシナリオA（作成→評価→実行）の追跡結果が記録されている
- [ ] ウォークスルーシナリオB（フィードバック→改善→再評価）の還流パスが確認されている
- [ ] ウォークスルーシナリオC（Task08 公開判断メトリクス）の接続が確認されている
- [ ] docs-only 検証チェックリストの全項目が PASS している
- [ ] 発見事項が Blocker/Note/Info で分類されている
- [ ] Blocker が0件である（0件でない場合は Phase 10 へ差し戻し）
- [ ] 全成果物が `outputs/phase-11/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS または MINOR で完了していること
- **後続**: Phase 12（ドキュメント）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-12-documentation.md`
