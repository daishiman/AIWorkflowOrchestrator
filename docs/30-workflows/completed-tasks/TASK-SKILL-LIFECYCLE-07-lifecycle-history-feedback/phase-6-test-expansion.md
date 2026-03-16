# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5（実装）                        |
| 後続Phase  | Phase 7（カバレッジ確認）              |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計                                   |

---

## 目的

Phase 4 の基本テスト仕様では網羅しきれなかった異常系・境界値・競合状態のテスト仕様を追加する。重複イベント記録の防止、失敗イベントの適切な処理、大量データの性能特性、ノイズデータの混入防止を検証し、実装仕様の堅牢性を保証するテスト仕様を拡充する。

## 背景

Phase 4 では主に正常系とバリデーションの基本テストを設計した。本 Phase では、実運用で発生しうるエッジケース（重複記録、タイムアウト、無効データ混入、大量イベント蓄積）に対するテスト仕様を追加し、Phase 7 のカバレッジ基準達成に向けた土台を築く。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複イベント記録の防止テスト

**目的**: 同一イベントの二重記録を防止するロジックのテスト仕様を追加する。

**実行手順**:

1. ID ベース重複検出テストケースを設計する:
   - 同一 `id` のイベントを2回記録した場合、2件目が拒否されること
   - 拒否時のエラーレスポンスが明確であること（エラーコード、メッセージ）
2. 内容ベース重複検出テストケースを設計する:
   - 同一 `skillId` + `eventType` + `timestamp`（秒単位同一）のイベントが短時間（1秒以内）に記録された場合の挙動
   - デバウンス処理が正しく機能すること（同一操作の連打対策）
   - デバウンス期間（1秒）経過後は別イベントとして記録されること
3. 並行記録テストケースを設計する:
   - 異なる `skillId` のイベントが同時に記録された場合、両方とも正常に記録されること
   - 同一 `skillId` の異なる `eventType` が同時に記録された場合の整合性

**期待される成果物**:

- 重複防止テスト仕様書（ID重複、内容重複、デバウンス、並行記録のテストケース）

---

### タスク2: 異常系テスト（タイムアウト・無効データ）

**目的**: イベント記録・フィードバック送信の失敗シナリオに対するテスト仕様を追加する。

**実行手順**:

1. タイムアウトテストケースを設計する:
   - Zustand persist の保存処理がタイムアウトした場合のフォールバック
   - IPC ハンドラの応答タイムアウト（5秒）時のエラーレスポンス
   - タイムアウト後にリトライが行われないこと（イベント記録はリトライ不可: Validation Error カテゴリ）
2. 無効データ混入テストケースを設計する:
   - `metadata` に予期しない型の値が含まれる場合（例: `score: "abc"` instead of `score: 80`）
   - `timestamp` に未来日時が設定されている場合の処理
   - `eventType` と `category` の不整合（例: `eventType: 'skill:executed'` + `category: 'creation'`）
   - `value` フィールドの型が `feedbackType` と不一致の場合（例: `feedbackType: 'user_rating'` + `value: "text"`）
3. 破損データ復旧テストケースを設計する:
   - persist ストレージから読み込んだデータが破損している場合の初期化処理
   - 不正な JSON フォーマットの場合のフォールバック
   - バージョン不一致時のマイグレーション処理

**期待される成果物**:

- 異常系テスト仕様書（タイムアウト、無効データ、破損データのテストケース）

---

### タスク3: 境界値テスト（大量イベント・空データ）

**目的**: データ量の極端なケースに対するテスト仕様を追加する。

**実行手順**:

1. 大量イベントテストケースを設計する:
   - 保持上限（1000件）到達時に古いイベントから削除されること
   - 1001件目のイベント記録後、最古のイベントが存在しないこと
   - 削除対象の選定が `timestamp` 順であること
   - 大量イベント環境での集約ビュー構築の正確性（1000件から正しく計算されること）
2. 空データテストケースを設計する:
   - イベントが0件の場合の集約ビュー（`successRate: 0.0`, `trend: 'stable'`, `recentEvents: []`）
   - フィードバックが0件の場合の改善優先度（デフォルト値）
   - `scoreHistory` が空の場合のトレンド判定（`'stable'`）
   - 新規スキル（履歴なし）の `PublishReadinessMetrics`（`readinessLevel: 'not_ready'`）
3. 境界値テストケースを設計する:
   - `successRate` が厳密に 0.5 の場合の還流ルール発火（`<= 0.5` で発火）
   - `averageRating` が厳密に 3.0 の場合の還流ルール発火（`<= 3.0` で発火）
   - `usageCount` が厳密に 5 の場合の readinessLevel 判定（`>= 5` で ready 候補）
   - `recency` が厳密に 90 日の場合（`recency = 0.0`）
   - `normalizedScore` が 100 の場合（`normalizedScore = 1.0`）

**期待される成果物**:

- 境界値テスト仕様書（大量データ、空データ、臨界値のテストケース）

---

### タスク4: 回帰ガードテスト

**目的**: 既知の落とし穴（P31, P42, P48）に対する回帰防止テスト仕様を追加する。

**実行手順**:

1. P31 回帰ガードテストケースを設計する:
   - `lifecycleHistorySlice` の合成 Hook を `useEffect` 依存配列に含めた場合に無限ループが発生しないこと
   - 個別セレクタ（`useRecordLifecycleEvent()` 等）がアクション参照の安定性を保持していること
2. P42 回帰ガードテストケースを設計する:
   - IPC ハンドラの全文字列引数に対して3段バリデーションが適用されていること:
     - `typeof args !== 'string'` -> 拒否
     - `args === ''` -> 拒否
     - `args.trim() === ''` -> 拒否（スペースのみの入力を拒否）
   - 各ハンドラで `"   "` （スペースのみ）が拒否されること
3. P48 回帰ガードテストケースを設計する:
   - `.filter()` / `.map()` を使う派生セレクタに `useShallow` が適用されていること
   - `useLifecycleEventsBySkill(skillId)` が連続呼び出しで同一参照を返すこと（shallow 比較）
   - `usePendingFeedbacks()` が連続呼び出しで同一参照を返すこと
4. P9 回帰ガードテストケースを設計する:
   - テスト間で Store 状態が共有されないこと
   - `beforeEach` で Store がリセットされることの検証方法

**期待される成果物**:

- 回帰ガードテスト仕様書（P31/P42/P48/P9 対策のテストケース）

---

## 参照資料

| 参照資料                        | パス                                               | 内容           |
| ------------------------------- | -------------------------------------------------- | -------------- |
| Phase 4 成果物                  | `outputs/phase-4/`                                 | テスト仕様書   |
| Phase 5 成果物                  | `outputs/phase-5/`                                 | 実装仕様書     |
| イベントモデルテスト仕様書      | `outputs/phase-4/event-model-test-spec.md`         | Phase 4 成果物 |
| 集約ロジックテスト仕様書        | `outputs/phase-4/aggregate-logic-test-spec.md`     | Phase 4 成果物 |
| フィードバック還流テスト仕様書  | `outputs/phase-4/feedback-loop-test-spec.md`       | Phase 4 成果物 |
| IPC契約テスト仕様書             | `outputs/phase-4/ipc-contract-test-spec.md`        | Phase 4 成果物 |
| テストデータファクトリ定義      | `outputs/phase-4/test-data-factory-definition.md`  | Phase 4 成果物 |
| SkillLifecycleEvent実装仕様書   | `outputs/phase-5/event-model-impl-spec.md`         | Phase 5 成果物 |
| lifecycleHistorySlice設計仕様書 | `outputs/phase-5/lifecycle-history-slice-spec.md`  | Phase 5 成果物 |
| 集約ロジック実装仕様書          | `outputs/phase-5/aggregate-logic-impl-spec.md`     | Phase 5 成果物 |
| フィードバックモデル実装仕様書  | `outputs/phase-5/feedback-model-impl-spec.md`      | Phase 5 成果物 |
| Task08メトリクスAPI実装仕様書   | `outputs/phase-5/publish-metrics-api-impl-spec.md` | Phase 5 成果物 |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様と既知の落とし穴を確認してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| interfaces-agent-sdk-history         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         | SDK履歴インターフェース    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |
| known-pitfalls                       | `.claude/rules/06-known-pitfalls.md`                                                        | 既知の落とし穴と防止策     |

---

## 成果物

| 成果物                 | パス                                                | 内容                                   |
| ---------------------- | --------------------------------------------------- | -------------------------------------- |
| 重複防止テスト仕様書   | `outputs/phase-6/duplicate-prevention-test-spec.md` | ID重複、内容重複、デバウンス、並行記録 |
| 異常系テスト仕様書     | `outputs/phase-6/error-handling-test-spec.md`       | タイムアウト、無効データ、破損データ   |
| 境界値テスト仕様書     | `outputs/phase-6/boundary-value-test-spec.md`       | 大量データ、空データ、臨界値           |
| 回帰ガードテスト仕様書 | `outputs/phase-6/regression-guard-test-spec.md`     | P31/P42/P48/P9 対策テスト              |

---

## 統合テスト連携

- Phase 4 のテスト仕様書を補完する位置づけであり、Phase 4 + Phase 6 の合計が Phase 7 のカバレッジ計測対象となる
- Phase 7 でカバレッジ未達の場合、本 Phase に戻り追加テストケースを設計する
- Phase 9（品質検証）で本 Phase の回帰ガードテストが正しく機能していることを検証する

---

## 完了条件

- [ ] 重複イベント記録（ID重複・内容重複・デバウンス）のテストケースが設計されている
- [ ] 並行記録の整合性テストケースが設計されている
- [ ] タイムアウト時のフォールバック・エラーレスポンスのテストケースが設計されている
- [ ] 無効データ混入（型不一致、未来日時、カテゴリ不整合）のテストケースが設計されている
- [ ] 破損データ復旧のテストケースが設計されている
- [ ] 大量イベント（保持上限1000件）のテストケースが設計されている
- [ ] 空データ（0件イベント、0件フィードバック）のテストケースが設計されている
- [ ] 境界値（successRate=0.5、usageCount=5、recency=90日）のテストケースが設計されている
- [ ] P31 回帰ガード（合成Hook無限ループ防止）のテストケースが設計されている
- [ ] P42 回帰ガード（3段バリデーション）のテストケースが設計されている
- [ ] P48 回帰ガード（useShallow 適用確認）のテストケースが設計されている
- [ ] P9 回帰ガード（テスト間状態リーク防止）のテストケースが設計されている
- [ ] 全成果物が `outputs/phase-6/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-7-coverage-check.md`
