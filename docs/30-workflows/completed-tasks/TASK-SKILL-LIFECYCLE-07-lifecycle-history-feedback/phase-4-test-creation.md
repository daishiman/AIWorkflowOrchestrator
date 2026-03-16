# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成                             |
| 前提Phase  | Phase 3（設計レビュー）PASS/MINOR      |
| 後続Phase  | Phase 5（実装）                        |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計                                   |

---

## 目的

Phase 2 で設計したライフサイクルイベントモデル、集約ビュー、フィードバック還流、公開メトリクスの各設計に対して、TDD の Red フェーズとしてテスト仕様を作成する。テストが全て失敗する（Red 状態）ことを確認し、Phase 5 の実装の正確な受け入れ基準を確立する。

## 背景

本タスクは設計タスクであるため、実行可能なテストコードではなく、テスト仕様書（テストケース定義、期待値、テストデータ）を成果物とする。Phase 2 の型定義（`SkillLifecycleEvent`, `SkillAggregateView`, `SkillFeedback`, `PublishReadinessMetrics`）とロジック設計（成功率計算、トレンド判定、推薦スコア、改善優先度）を入力とし、将来の実装フェーズで即座にテストコードに変換可能な精度で記述する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: イベントモデルのユニットテスト設計

**目的**: `SkillLifecycleEvent` 型の生成・バリデーション・永続化に関するテスト仕様を設計する。

**実行手順**:

1. イベント生成テストケースを設計する:
   - 全5カテゴリ（creation, evaluation, execution, improvement, reuse）のイベント生成
   - 必須フィールド（id, skillId, skillVersion, eventType, category, timestamp, userId, source）の存在検証
   - `metadata` のカテゴリ別スキーマ準拠テスト
   - `parentEventId` による因果関係チェーン構築テスト
2. イベントバリデーションテストケースを設計する:
   - 不正な `eventType` の拒否（存在しないカテゴリ、空文字列）
   - 不正な `timestamp` フォーマットの拒否（非 ISO 8601）
   - `skillId` 空文字列の拒否（P42 準拠3段バリデーション: 型チェック -> 空文字列 -> トリム空文字列）
   - 存在しない `parentEventId` の参照整合性チェック
3. イベント永続化テストケースを設計する:
   - Zustand Store への追加と取得
   - カテゴリ別フィルタリング
   - skillId 別フィルタリング
   - 時系列ソート（降順）
4. テストデータファクトリを設計する:
   - `createMockLifecycleEvent(overrides?)` のインターフェース定義
   - カテゴリ別のデフォルト metadata テンプレート

**期待される成果物**:

- イベントモデルテスト仕様書（テストケース一覧、期待値、テストデータファクトリ定義）

---

### タスク2: 集約ロジックのテスト設計

**目的**: `SkillAggregateView` の計算ロジック（成功率、トレンド、推薦スコア）に関するテスト仕様を設計する。

**実行手順**:

1. 成功率計算テストケースを設計する:
   - 正常系: 10回実行中8回成功 -> `successRate = 0.8`
   - 境界値: 0回実行 -> `successRate = 0.0`（ゼロ除算回避）
   - 境界値: 全成功 -> `successRate = 1.0`
   - 期間フィルタ: 直近30日間のみの実行を対象とする
   - 古いイベント（31日以上前）が計算から除外されること
2. トレンド判定テストケースを設計する:
   - 直近5回のスコアが単調増加 -> `trend = 'improving'`
   - 直近5回のスコアが同一 -> `trend = 'stable'`
   - 直近5回のスコアが単調減少 -> `trend = 'declining'`
   - 5回未満のデータ -> `trend = 'stable'`（デフォルト）
   - スコアの変動が閾値以内 -> `trend = 'stable'`（変動幅の閾値定義）
3. 推薦スコア計算テストケースを設計する:
   - 計算式: `successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2`
   - `recency` の計算方法: 直近実行からの経過日数を 0.0-1.0 に正規化
   - 全要素が最大値のケース -> 推薦スコア `1.0`
   - 全要素が最小値のケース -> 推薦スコア `0.0`
   - 各要素の重み付けが正しく反映されるケース
4. 集約ビュー全体の統合テストケースを設計する:
   - 複数イベントから `SkillAggregateView` を正しく構築するケース
   - `recentEvents` が最新10件に制限されるケース
   - `scoreHistory` が時系列でソートされるケース

**期待される成果物**:

- 集約ロジックテスト仕様書（計算式ごとのテストケース、境界値、期待値テーブル）

---

### タスク3: フィードバック還流のテスト設計

**目的**: `SkillFeedback` の記録・ステータス遷移・改善優先度計算に関するテスト仕様を設計する。

**実行手順**:

1. フィードバック記録テストケースを設計する:
   - 4種別（auto_metric, user_rating, user_text, improvement_suggestion）の記録
   - `sourceEventId` が実在するイベントを参照していること
   - `status` の初期値が `'pending'` であること
   - `createdAt` が ISO 8601 形式で自動設定されること
2. フィードバックステータス遷移テストケースを設計する:
   - `pending` -> `applied`: 改善に反映された場合
   - `pending` -> `dismissed`: 却下された場合
   - `applied` -> `pending`: 遷移不可（不正遷移の拒否）
   - `dismissed` -> `pending`: 遷移不可（不正遷移の拒否）
   - `processedAt` が遷移時に設定されること
3. 改善優先度計算テストケースを設計する:
   - 計算式: `priority = (1 - successRate) * weight_sr + (1 - normalizedScore) * weight_ns + feedbackCount * weight_fb`
   - 成功率が低く、スコアが低く、フィードバックが多い -> 高優先度
   - 成功率が高く、スコアが高く、フィードバックが少ない -> 低優先度
   - 各重みパラメータの変更が結果に正しく反映されること
4. 還流ルール発火テストケースを設計する:
   - 成功率 50% 以下 -> 改善推奨アラート生成
   - ユーザーレーティング平均 3.0 以下 -> 改善推奨生成
   - 成功率 50% 超 + レーティング 3.0 超 -> アラート非生成

**期待される成果物**:

- フィードバック還流テスト仕様書（ステータス遷移図、優先度計算テーブル、還流ルール発火条件）

---

### タスク4: IPC 契約テスト設計

**目的**: ライフサイクル履歴・フィードバック関連の IPC チャンネル契約のテスト仕様を設計する。

**実行手順**:

1. IPC チャンネル定義テストケースを設計する:
   - 新規チャンネルが `IPC_CHANNELS` 定数に登録されていること
   - チャンネル名がハードコード文字列でないこと（P27 対策）
   - 想定チャンネル:
     - `lifecycle:getEvents` - イベント一覧取得
     - `lifecycle:recordEvent` - イベント記録
     - `lifecycle:getAggregate` - 集約ビュー取得
     - `feedback:submit` - フィードバック送信
     - `feedback:updateStatus` - ステータス更新
     - `metrics:getPublishReadiness` - 公開メトリクス取得
2. IPC 引数バリデーションテストケースを設計する:
   - P42 準拠3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
   - 各ハンドラの引数スキーマ定義と違反時のエラーレスポンス
   - `skillId` が `string` 型であること、空文字列でないこと、トリム後空文字列でないこと
3. IPC レスポンス型テストケースを設計する:
   - 成功時: `{ success: true, data: T }` 形式
   - 失敗時: `{ success: false, error: { code: string, message: string } }` 形式
   - エラーコード範囲がエラーカテゴリに準拠していること
4. Task08 向けメトリクス API テストケースを設計する:
   - `getPublishReadiness(skillId)` の戻り値が `PublishReadinessMetrics` に準拠
   - `readinessLevel` の判定ロジック（not_ready / review_needed / ready）
   - 存在しない skillId の場合のエラーハンドリング

**期待される成果物**:

- IPC 契約テスト仕様書（チャンネル一覧、引数スキーマ、レスポンス型、エラーケース）

---

## 参照資料

| 参照資料                   | パス                                                  | 内容                      |
| -------------------------- | ----------------------------------------------------- | ------------------------- |
| Phase 1 成果物             | `outputs/phase-1/`                                    | 要件定義の全成果物        |
| Phase 2 成果物             | `outputs/phase-2/`                                    | 設計の全成果物            |
| Phase 3 成果物             | `outputs/phase-3/`                                    | 設計レビュー結果          |
| Phase 3 ゲート判定書       | `outputs/phase-3/gate-decision.md`                    | PASS/MINOR 判定と対応方針 |
| ライフサイクルイベント一覧 | `outputs/phase-1/lifecycle-event-catalog.md`          | Phase 1 成果物            |
| フィードバック収集要件     | `outputs/phase-1/feedback-collection-spec.md`         | Phase 1 成果物            |
| Task05連携要件             | `outputs/phase-1/task05-integration-contract.md`      | Phase 1 成果物            |
| Task08メトリクス定義       | `outputs/phase-1/task08-metrics-definition.md`        | Phase 1 成果物            |
| 受入基準検証マトリクス     | `outputs/phase-1/acceptance-criteria-matrix.md`       | Phase 1 成果物            |
| イベントモデル設計書       | `outputs/phase-2/event-model-design.md`               | Phase 2 成果物            |
| 集約ビュー設計書           | `outputs/phase-2/aggregate-view-design.md`            | Phase 2 成果物            |
| フィードバック還流設計書   | `outputs/phase-2/feedback-loop-design.md`             | Phase 2 成果物            |
| 公開メトリクスIF設計書     | `outputs/phase-2/publish-metrics-interface-design.md` | Phase 2 成果物            |
| データフロー設計書         | `outputs/phase-2/data-flow-design.md`                 | Phase 2 成果物            |
| 要件-設計マトリクス        | `outputs/phase-3/requirements-design-matrix.md`       | Phase 3 成果物            |
| 技術レビュー結果           | `outputs/phase-3/technical-review-report.md`          | Phase 3 成果物            |
| 連携妥当性レビュー結果     | `outputs/phase-3/integration-review-report.md`        | Phase 3 成果物            |

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を確認し、既存パターンとの整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| interfaces-agent-sdk-history         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         | SDK履歴インターフェース    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |

---

## 成果物

| 成果物                         | パス                                              | 内容                                       |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------ |
| イベントモデルテスト仕様書     | `outputs/phase-4/event-model-test-spec.md`        | 生成・バリデーション・永続化テストケース   |
| 集約ロジックテスト仕様書       | `outputs/phase-4/aggregate-logic-test-spec.md`    | 成功率・トレンド・推薦スコアテストケース   |
| フィードバック還流テスト仕様書 | `outputs/phase-4/feedback-loop-test-spec.md`      | ステータス遷移・優先度・還流ルールテスト   |
| IPC契約テスト仕様書            | `outputs/phase-4/ipc-contract-test-spec.md`       | チャンネル・引数・レスポンス・エラーテスト |
| テストデータファクトリ定義     | `outputs/phase-4/test-data-factory-definition.md` | モックデータ生成のインターフェース定義     |

---

## 統合テスト連携

- Phase 5（実装）で本 Phase のテスト仕様書を基にテストコードを作成し、Red -> Green を確認する
- Phase 6（テスト拡充）で本 Phase で未カバーの境界値・異常系を追加する
- Phase 7（カバレッジ確認）で本 Phase のテストケース一覧をカバレッジ計測の基準とする
- Phase 10（最終レビュー）で本 Phase のテスト仕様と実装テストの一致を検証する

---

## 完了条件

- [ ] 全5カテゴリのイベント生成テストケースが設計されている
- [ ] イベントバリデーション（P42準拠3段バリデーション含む）のテストケースが設計されている
- [ ] 成功率計算のテストケース（ゼロ除算、期間フィルタ含む）が設計されている
- [ ] トレンド判定のテストケース（5回未満、変動閾値含む）が設計されている
- [ ] 推薦スコア計算のテストケース（重み付け検証含む）が設計されている
- [ ] フィードバックステータス遷移のテストケース（不正遷移拒否含む）が設計されている
- [ ] 改善優先度計算のテストケースが設計されている
- [ ] 還流ルール発火条件のテストケースが設計されている
- [ ] IPC チャンネル定義・引数バリデーション・レスポンス型のテストケースが設計されている
- [ ] Task08 向けメトリクス API のテストケースが設計されている
- [ ] テストデータファクトリのインターフェースが定義されている
- [ ] 全テストケースが Red 状態（未実装のため失敗する）であることが明記されている
- [ ] 全成果物が `outputs/phase-4/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が PASS または MINOR 判定で完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-5-implementation.md`
