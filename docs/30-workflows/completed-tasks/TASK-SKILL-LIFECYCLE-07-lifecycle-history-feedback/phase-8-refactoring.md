# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| Phase名    | リファクタリング                       |
| 前提Phase  | Phase 7（カバレッジ確認）              |
| 後続Phase  | Phase 9（品質検証）                    |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |

---

## 目的

重複する履歴記録と集約ロジックを整理する。Phase 5 の実装と Phase 6-7 のテスト拡充で蓄積された技術的負債（命名不統一、イベント記録パスの重複、不要な中間変換）を解消し、保守性と可読性を向上させる。

## 背景

Phase 5 の実装では機能の正確性を優先したため、以下の技術的負債が発生しうる:

- イベント記録ロジックが複数箇所に分散し、同一パターンのコードが重複している
- `SkillLifecycleEvent` / `SkillFeedback` / `SkillAggregateView` 間のデータ変換に冗長な中間ステップが存在する
- ドメイン用語（`skillId` vs `skillName`、`score` vs `qualityScore`）の命名が一貫していない

リファクタリングはテストが全て PASS している状態で行い、Red-Green-Refactor の Refactor フェーズとして位置づける。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 命名統一（ドメイン用語の標準化）

**目的**: イベント名・型名・変数名のドメイン用語を統一し、コードの可読性を向上させる。

**実行手順**:

1. 以下の命名規則を適用対象ファイル全体で統一する:
   - スキル識別子: `skillId`（`skillName` との混在を排除、P45 準拠）
   - スコア関連: `qualityScore`（`score` / `latestScore` / `evaluationScore` の統一）
   - イベントカテゴリ: `EventCategory` 型の値（`creation` / `evaluation` / `execution` / `improvement` / `reuse`）
   - タイムスタンプ: `*At` サフィックス（`createdAt` / `executedAt` / `processedAt`）
2. `grep -rn` で命名不統一箇所を検出する:
   ```bash
   grep -rn "skillName\|skill_name" packages/shared/src/ apps/desktop/src/
   grep -rn "\.score[^H]" packages/shared/src/  # scoreHistory 以外の曖昧な score 参照
   ```
3. 型定義ファイル（`packages/shared/src/`）から修正を開始し、コンパイルエラーを手掛かりに依存箇所を修正する
4. P32 準拠: `packages/shared/src/` と `apps/desktop/src/preload/types.ts` の両方を同時に更新する

**期待される成果物**:

- 命名統一レポート（変更前後の対応表、影響ファイル一覧）

---

### タスク2: 重複コード除去（イベント記録パスの共通化）

**目的**: イベント記録ロジックの重複を除去し、単一の記録パスに統合する。

**実行手順**:

1. イベント記録の重複箇所を特定する:
   ```bash
   grep -rn "recordEvent\|logEvent\|emitEvent\|addEvent" apps/desktop/src/main/ apps/desktop/src/renderer/
   ```
2. 共通のイベント記録関数を設計する:
   - `recordLifecycleEvent(event: Omit<SkillLifecycleEvent, 'id' | 'timestamp'>): SkillLifecycleEvent`
   - ID生成（UUID v4）とタイムスタンプ付与を一元化
   - metadata のバリデーションを共通化
3. カテゴリ別のファクトリ関数を作成する:
   - `createExecutionEvent(skillId, result, duration): SkillLifecycleEvent`
   - `createEvaluationEvent(skillId, score, previousScore): SkillLifecycleEvent`
   - `createFeedbackEvent(skillId, feedbackType, value): SkillLifecycleEvent`
4. 重複箇所をファクトリ関数の呼び出しに置換する
5. 置換ごとにテストを実行し、リグレッションがないことを確認する

**期待される成果物**:

- 共通化されたイベント記録関数（ファクトリパターン）
- 重複除去レポート（除去前の重複箇所、除去後の統一パス）

---

### タスク3: データフロー短縮（不要な中間変換の除去）

**目的**: `SkillLifecycleEvent` から `SkillAggregateView` への集約パスで不要な中間変換を除去する。

**実行手順**:

1. 現在のデータフローを可視化する:
   ```
   SkillLifecycleEvent → [中間変換A] → [中間変換B] → SkillAggregateView
   ```
2. 各中間変換の必要性を評価する:
   - 型変換のみで実質的なロジックがない変換は除去する
   - 複数の中間ステップを1つの集約関数に統合する
3. 集約ロジックの計算効率を改善する:
   - 成功率計算: イベント配列の全走査ではなくカウンタベースに変更
   - トレンド計算: 直近5件のスコアのみを使用（全履歴走査を回避）
   - 推薦スコア: `successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2` の計算を1パスで実行
4. `PublishReadinessMetrics` の生成パスも同様に短縮する

**期待される成果物**:

- 最適化されたデータフロー（変換ステップ数の削減記録）

---

### タスク4: リファクタリング後のテスト再実行確認

**目的**: リファクタリングによるリグレッションがないことを全テストで確認する。

**実行手順**:

1. Phase 4-7 で作成した全テストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/lifecycle-history/
   cd apps/desktop && pnpm vitest run src/renderer/store/slices/lifecycleHistory
   ```
2. テスト結果を記録する:
   - 全テスト PASS: タスク完了
   - 失敗テストあり: 失敗原因を分析し、リファクタリングのリグレッションか既存バグかを判定
3. リグレッションの場合はリファクタリングを修正し、再テストする
4. カバレッジが Phase 7 の基準を維持していることを確認する:
   - Line Coverage >= 80%
   - Branch Coverage >= 60%
   - Function Coverage >= 80%

**期待される成果物**:

- テスト再実行レポート（全テスト結果、カバレッジ比較）

---

## 参照資料

| 参照資料                               | パス                                                                                        | 内容                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 成果物                         | `outputs/phase-5/`                                                                          | 実装コード               |
| Phase 6 成果物                         | `outputs/phase-6/`                                                                          | 拡充テスト               |
| Phase 7 成果物                         | `outputs/phase-7/`                                                                          | カバレッジレポート       |
| Phase 2 設計書                         | `outputs/phase-2/`                                                                          | 型定義・集約ロジック設計 |
| Phase 1 要件                           | `outputs/phase-1/`                                                                          | 受入基準とイベント定義   |
| architecture-impl-patterns             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集           |
| SkillLifecycleEvent実装仕様書          | `outputs/phase-5/event-model-impl-spec.md`                                                  | Phase 5 成果物           |
| lifecycleHistorySlice設計仕様書        | `outputs/phase-5/lifecycle-history-slice-spec.md`                                           | Phase 5 成果物           |
| 集約ロジック実装仕様書                 | `outputs/phase-5/aggregate-logic-impl-spec.md`                                              | Phase 5 成果物           |
| フィードバックモデル実装仕様書         | `outputs/phase-5/feedback-model-impl-spec.md`                                               | Phase 5 成果物           |
| Task08メトリクスAPI実装仕様書          | `outputs/phase-5/publish-metrics-api-impl-spec.md`                                          | Phase 5 成果物           |
| イベントカテゴリ別カバレッジマトリクス | `outputs/phase-7/event-category-coverage-matrix.md`                                         | Phase 7 成果物           |
| 集約計算ロジックカバレッジマトリクス   | `outputs/phase-7/aggregate-logic-coverage-matrix.md`                                        | Phase 7 成果物           |
| フィードバック還流パスカバレッジ       | `outputs/phase-7/feedback-path-coverage-matrix.md`                                          | Phase 7 成果物           |
| カバレッジゲート判定書                 | `outputs/phase-7/coverage-gate-decision.md`                                                 | Phase 7 成果物           |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様との整合性を維持してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |

---

## 成果物

| 成果物                 | パス                                               | 内容                                     |
| ---------------------- | -------------------------------------------------- | ---------------------------------------- |
| 命名統一レポート       | `outputs/phase-8/naming-unification-report.md`     | 変更前後の対応表、影響ファイル一覧       |
| 重複除去レポート       | `outputs/phase-8/deduplication-report.md`          | 除去前の重複箇所、統一後のファクトリ構成 |
| データフロー最適化記録 | `outputs/phase-8/data-flow-optimization-report.md` | 変換ステップ削減の記録                   |
| テスト再実行レポート   | `outputs/phase-8/test-rerun-report.md`             | 全テスト結果、カバレッジ比較             |

---

## 統合テスト連携

- リファクタリング後のコードは Phase 9（品質検証）で Lint・型チェック・全テストの一括検証対象となる
- 命名統一の結果は Phase 10（最終レビュー）のコード品質レビュー観点で評価される
- ファクトリパターンの導入は Phase 12（ドキュメント）の実装ガイドに反映する

---

## 完了条件

- [ ] ドメイン用語（`skillId` / `qualityScore` / `EventCategory` / タイムスタンプ）が全ファイルで統一されている
- [ ] イベント記録ロジックの重複が除去され、共通ファクトリ関数に統合されている
- [ ] `SkillLifecycleEvent` → `SkillAggregateView` の中間変換が最小化されている
- [ ] Phase 4-7 の全テストが PASS している
- [ ] カバレッジが Phase 7 の基準（Line >= 80%, Branch >= 60%, Function >= 80%）を維持している
- [ ] P32 準拠: `packages/shared` と `apps/desktop/src/preload/types.ts` の型定義が同期している
- [ ] P45 準拠: 引数名が実際の値のセマンティクスと一致している
- [ ] 全成果物が `outputs/phase-8/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質検証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-9-quality-assurance.md`
