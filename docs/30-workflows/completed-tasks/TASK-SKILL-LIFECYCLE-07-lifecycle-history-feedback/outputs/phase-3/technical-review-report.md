# 技術レビュー結果報告書

## メタ情報

| 項目         | 内容                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase        | 3                                                                                                                                               |
| タスクID     | TASK-SKILL-LIFECYCLE-07                                                                                                                         |
| 作成日       | 2026-03-16                                                                                                                                      |
| 出力パス     | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-3/technical-review-report.md` |
| レビュー観点 | Zustand Store設計 / IPC契約 / SQLite永続化 / Simpler Alternative検討                                                                            |

---

## 1. Zustand Store設計レビュー（P31/P48対策準拠確認）

### 1-1. `lifecycleHistorySlice` の P31 対策確認

**確認箇所**: `data-flow-design.md` §5.3（セレクタ一覧）、`feedback-loop-design.md` §6-3（個別セレクタ）

| P31対策項目                              | 確認結果                                                                            | 判定 |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ---- |
| 合成Store Hook（`useXxxStore()`）の廃止  | セレクタは全て個別セレクタ（`useLatestQualityScore` 等）として設計                  | 準拠 |
| アクション関数の安定参照                 | `useAddFeedback()`, `useApplyFeedback()` 等でアクション関数を個別セレクタとして分離 | 準拠 |
| `useEffect` 依存配列での合成Hook使用禁止 | 設計書にアクション関数は個別セレクタ経由での取得が明示されている                    | 準拠 |
| `@deprecated` タグ付きの合成Hook 非使用  | `feedbackSlice` は合成Hook を定義せず、最初から個別セレクタ設計を採用               | 準拠 |

### 1-2. `lifecycleHistorySlice` の P48 対策確認

**確認箇所**: `data-flow-design.md` §5.3（useShallow 適用有無）、`feedback-loop-design.md` §6-3

| セレクタ名                            | 戻り値型                          | 配列/オブジェクト返却  | useShallow 適用    | 判定 |
| ------------------------------------- | --------------------------------- | ---------------------- | ------------------ | ---- |
| `useLatestQualityScore(skillId)`      | `number \| null`                  | なし（スカラー）       | 不要               | 準拠 |
| `useSuccessRate(skillId)`             | `number \| null`                  | なし（スカラー）       | 不要               | 準拠 |
| `useAggregateView(skillId)`           | `SkillAggregateView \| null`      | なし（null or object） | 不要（注1）        | 準拠 |
| `usePublishReadiness(skillId)`        | `PublishReadinessMetrics \| null` | なし（null or object） | 不要（注1）        | 準拠 |
| `useRecentLifecycleEvents(skillId)`   | `SkillLifecycleEvent[]`           | 配列返却               | **必要・適用済み** | 準拠 |
| `useFeedbackBySkill(skillId)`         | `SkillFeedback[]`                 | 配列返却               | **必要・適用済み** | 準拠 |
| `useIsLoadingMetrics()`               | `boolean`                         | なし（スカラー）       | 不要               | 準拠 |
| `useIsSubmittingFeedback(skillId)`    | `boolean`                         | なし（スカラー）       | 不要               | 準拠 |
| `usePendingFeedbacks(skillId)`        | `SkillFeedback[]`                 | 配列返却（filter()）   | **必要・適用済み** | 準拠 |
| `useFeedbackActions(skillId)`         | `FeedbackAction[]`                | 配列返却               | **必要・適用済み** | 準拠 |
| `useCriticalFeedbackActions(skillId)` | `FeedbackAction[]`                | 配列返却（filter()）   | **必要・適用済み** | 準拠 |
| `useRecentlyUsedSkillsAggregates()`   | 集計データ配列                    | 配列返却               | **必要・適用済み** | 準拠 |

**注1**: `SkillAggregateView` / `PublishReadinessMetrics` はオブジェクト型だが、セレクタが Store のマップから直接参照を返す構造であり、参照の安定性はZustandのストア実装に依存する。オブジェクト内の配列（`scoreHistory` 等）にアクセスする場合は呼び出し元で個別フィールドセレクタへの分解を推奨する（Phase 5 実装時の注意事項として記録）。

### 1-3. `persist` 設定の妥当性確認

**確認箇所**: `data-flow-design.md` §5.4（Persist 設定）

| 永続化対象                                     | 設計判断                                                                                           | 評価            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| `aggregateViews`（集約ビュー）                 | `partialize` で永続化対象に含める                                                                  | 妥当            |
| `publishReadiness`（公開準備度）               | `partialize` で永続化対象に含める                                                                  | 妥当            |
| `lifecycleEvents`（イベントリスト）            | 永続化対象外（SQLite が正本）                                                                      | 妥当            |
| `feedbackBySkill`（フィードバック）            | `feedbackSlice` では別途 `partialize` で機密フィールド除外が明記                                   | 妥当            |
| `aggregateViews` を persist 対象外にしない理由 | aggregate-view-design.md では `persist` 対象外としているが、data-flow-design.md では対象としている | 要整合（MINOR） |

**MINOR 指摘**: `aggregate-view-design.md` §5-1 では「`skillAggregateSlice` を `persist` 対象外とする」と設計されているが、`data-flow-design.md` §5.4 では `aggregateViews` を `partialize` で永続化対象に含めている。両設計書間で方針が矛盾している。実装時に統一が必要。

**推奨方針**: `aggregate-view-design.md` の「派生データなので永続化不要」の方が合理的。`aggregateViews` は SQLite から再構築可能なため、`partialize` から除外することを推奨する。

---

## 2. IPC契約レビュー（IPC_CHANNELS定数管理・P42バリデーション確認）

### 2-1. 新規IPCチャンネルの定数管理確認

**確認箇所**: `data-flow-design.md` §4.1、`publish-metrics-interface-design.md` §4.4

| チャンネル名                        | 定数名（IPC_CHANNELS）                | 文字列リテラル直接使用禁止 | 判定 |
| ----------------------------------- | ------------------------------------- | -------------------------- | ---- |
| `skill:submitUserRating`            | `SKILL_SUBMIT_USER_RATING`            | 定数使用が明示             | 準拠 |
| `skill:submitTextFeedback`          | `SKILL_SUBMIT_TEXT_FEEDBACK`          | 定数使用が明示             | 準拠 |
| `skill:submitImprovementSuggestion` | `SKILL_SUBMIT_IMPROVEMENT_SUGGESTION` | 定数使用が明示             | 準拠 |
| `skill:getPublishReadiness`         | `SKILL_GET_PUBLISH_READINESS`         | 定数使用が明示             | 準拠 |
| `skill:getSkillHealthReport`        | `SKILL_GET_SKILL_HEALTH_REPORT`       | 定数使用が明示             | 準拠 |
| `skill:getLifecycleEvents`          | `SKILL_GET_LIFECYCLE_EVENTS`          | 定数使用が明示             | 準拠 |
| `skill:lifecycle_event_emitted`     | `SKILL_LIFECYCLE_EVENT_EMITTED`       | 定数使用が明示             | 準拠 |

**配置先**: `packages/shared/src/ipc/channels.ts`（Phase 5 実装時に追加予定）と明記されており、04-electron-security.md の「チャンネル名はホワイトリストで管理し、定数で参照」原則に準拠している。

### 2-2. P42バリデーション（3段階）の確認

**確認箇所**: `publish-metrics-interface-design.md` §3.2、`data-flow-design.md` §3（統合データフロー図）

`skill:getPublishReadiness` ハンドラを代表例として確認する。

| バリデーション段階                                | 設計書での実装有無                                      | 判定 |
| ------------------------------------------------- | ------------------------------------------------------- | ---- |
| Stage 1: typeof === "string" チェック             | `publish-metrics-interface-design.md` §3.2 に実装例あり | 準拠 |
| Stage 2: 空文字列チェック（=== ""）               | 同上に実装例あり                                        | 準拠 |
| Stage 3: トリム空文字列チェック（.trim() === ""） | 同上に実装例あり                                        | 準拠 |

`skill:getSkillHealthReport` については「同一の3段階バリデーションを適用する」と明記されており、全IPCハンドラへの適用が設計上保証されている。

### 2-3. IPC 契約ドリフト防止確認（P44/P45 対策）

**確認箇所**: `data-flow-design.md` §4（IPC チャンネル一覧テーブル）

| ハンドラ                            | 引数型（設計書記載）                                             | Preload側引数型 | セマンティクス一致 | 判定 |
| ----------------------------------- | ---------------------------------------------------------------- | --------------- | ------------------ | ---- |
| `skill:submitUserRating`            | `{ skillName: string; rating: 1\|2\|3\|4\|5 }`                   | 同形式          | 一致               | 準拠 |
| `skill:submitTextFeedback`          | `{ skillName: string; feedbackText: string }`                    | 同形式          | 一致               | 準拠 |
| `skill:submitImprovementSuggestion` | `{ skillName: string; targetSection; suggestionText; priority }` | 同形式          | 一致               | 準拠 |
| `skill:getPublishReadiness`         | `skillName: string`                                              | 同形式          | 一致               | 準拠 |
| `skill:getSkillHealthReport`        | `skillName: string`                                              | 同形式          | 一致               | 準拠 |

P44（インターフェース不整合）・P45（引数命名ドリフト）の防止策として、全チャンネルで引数が `skillName`（スキル名）として統一されており、`skillId`（UUID）との混同リスクがない。

---

## 3. SQLite永続化レビュー

### 3-1. テーブルスキーマ設計の妥当性確認

**確認箇所**: `lifecycle-event-catalog.md` §5（永続化方針）、`data-flow-design.md` §1・3

| テーブル名                   | 主キー                      | 用途                                                  | 設計判断の妥当性 |
| ---------------------------- | --------------------------- | ----------------------------------------------------- | ---------------- |
| `lifecycle_events`           | `id` (UUID v4)              | 全ライフサイクルイベントの永続化                      | 妥当             |
| `skill_feedback`             | （設計書より推察: UUID v4） | UserRating / UserTextFeedback / ImprovementSuggestion | 妥当             |
| `usage_frequency_aggregates` | （集計期間+スキルID複合）   | 日次/週次/月次の集計値                                | 妥当             |
| `skill_aggregate_snapshots`  | skillId                     | 集約ビューの日次スナップショット                      | 妥当             |

### 3-2. インデックス設計の評価

**確認箇所**: `lifecycle-event-catalog.md` §5、`aggregate-view-design.md` §5-3

Phase 1 で定義された3つの標準インデックスを評価する。

| インデックス                 | 用途                                   | 評価       |
| ---------------------------- | -------------------------------------- | ---------- |
| `(skill_id, timestamp DESC)` | 1スキルの全イベントをtimestamp順で取得 | 必須・適切 |
| `(event_type)`               | カテゴリ別イベント抽出                 | 有効       |
| `(category, timestamp DESC)` | カテゴリ+時間範囲フィルタ              | 有効       |

Phase 2 `aggregate-view-design.md` §5-3 では追加インデックスも推奨されている。

```sql
CREATE INDEX idx_skill_events_execution
  ON skill_lifecycle_events (skill_id, event_type, timestamp DESC);
```

この追加インデックスは `calculateSuccessRate()` の30日ウィンドウクエリ（`skill_id + event_type + timestamp` の複合条件）に対して有効であり、Phase 5 実装時に追加することを推奨する。

### 3-3. データ保持方針の確認

| 保持方針               | 設計内容                                                     | 評価   |
| ---------------------- | ------------------------------------------------------------ | ------ |
| ライフサイクルイベント | 無制限（将来の公開・互換性判断の基礎データとして削除しない） | 合理的 |
| 利用頻度集計（日次）   | 90日保持                                                     | 合理的 |
| 利用頻度集計（週次）   | 52週保持                                                     | 合理的 |
| 利用頻度集計（月次）   | 24ヶ月保持                                                   | 合理的 |
| 集約スナップショット   | 日次更新（upsert、削除なし）                                 | 合理的 |

---

## 4. Simpler Alternative 検討

### 4-1. 設計の複雑性評価

本設計は以下のコンポーネントで構成される。

- SQLite永続化レイヤー（lifecycle_events テーブル + 集約テーブル）
- Zustand Store（lifecycleHistorySlice + feedbackSlice）
- EventQueue（インメモリバッファ + バッチフラッシュ）
- 集約ビュー計算（buildAggregateView + 3計算関数）
- フィードバックルールエンジン（7ルール + 優先度計算）
- IPC チャンネル（7チャンネル + P42バリデーション）

### 4-2. SQLiteなし（Zustand persistのみ）での代替可能性

**検討結果**: **SQLiteは必要。Zustand persistのみでは不十分。**

根拠:

| 要件                                           | Zustand persistのみ                                  | SQLite + Zustand     |
| ---------------------------------------------- | ---------------------------------------------------- | -------------------- |
| 全ライフサイクルイベントの永続的な保持         | 不可（ストレージ容量制限・データ増大による性能劣化） | 可能                 |
| Task08向け`getSkillHealthReport`（全期間集計） | 不可（メモリ上のデータ量に制限あり）                 | 可能                 |
| 30日/90日/52週の集計ウィンドウ集計             | 不可（全件メモリ保持が必要）                         | 効率的に実現可能     |
| アプリ再起動後のデータ復元                     | 可能だが大容量データで不安定                         | 安定（SQLiteが正本） |
| 削除済みスキルの履歴保持                       | 不可（スキル削除とStore整合が困難）                  | 可能                 |

**結論**: ライフサイクルイベントは長期的に蓄積される性質を持ち、将来の公開判断や推薦アルゴリズムの基礎データとなる。Zustand persistは「最新N件のUIキャッシュ」に特化し、SQLiteを正本データソースとする二段階構造が適切である。

### 4-3. イベントソーシングパターンの必要性検討

**検討結果**: **フルEventSourcingは不要。現設計のハイブリッドアプローチで十分。**

根拠:

| 観点                                 | フルEventSourcing                | 現設計（ハイブリッド）                                        |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------- |
| イベント再生（Event Replay）の必要性 | 必要（状態再構築のため）         | 不要（集約ビューはバッチ再計算で十分）                        |
| 読み取りパフォーマンス               | 要CQRS分離                       | 集約スナップショット（`skill_aggregate_snapshots`）で対応済み |
| 書き込み複雑性                       | 高（イベントストアへの追記のみ） | 中（イベント追記 + 集約更新）                                 |
| 監査ログ要件                         | 完全なイベント履歴で対応可能     | 同様に対応可能（lifecycle_eventsテーブル）                    |
| チームの習熟度                       | 高い学習コスト                   | 既存のSQLite + Zustandパターンを踏襲                          |

**結論**: 本プロジェクトでは「イベント履歴の保持」は必要だが「イベント再生による状態復元」は不要である。`buildAggregateView()` による明示的な集約計算と、日次バッチによるスナップショット更新の組み合わせで、EventSourcingの利点（監査ログ・集計の再実行）を実用的なコストで実現できる。

### 4-4. CRUD パターンとの比較

**検討結果**: **純粋なCRUDでは不十分。現設計（append-only + 集約ビュー）が妥当。**

根拠:

- ライフサイクルイベントは「事実（Fact）」であり、更新・削除が許容されない性質を持つ（例: 実行の失敗事実を後から変更できない）
- スコア変化の推移（scoreHistory）や成功率の計算には、時系列データの保持が不可欠
- Task08の公開判断材料（stabilityScore、usageCount）はイベント履歴からの集計であり、CRUDではリアルタイム集計コストが高い

---

## 5. 技術レビュー総合評価

### 5-1. 合格/指摘サマリー

| 観点                                 | 評価         | 指摘件数         | 重大度 |
| ------------------------------------ | ------------ | ---------------- | ------ |
| Zustand P31対策                      | 合格         | 0                | -      |
| Zustand P48対策                      | 合格         | 0                | -      |
| persist設定の整合性                  | 要注意       | 1                | MINOR  |
| IPC_CHANNELS定数管理                 | 合格         | 0                | -      |
| P42バリデーション（3段階）           | 合格         | 0                | -      |
| P44/P45（IPC契約ドリフト）防止       | 合格         | 0                | -      |
| SQLiteスキーマ設計                   | 合格         | 0                | -      |
| インデックス設計                     | 合格         | 0（追加推奨1件） | LOW    |
| データ保持方針                       | 合格         | 0                | -      |
| Simpler Alternative（SQLite代替）    | 結論: 必要   | -                | -      |
| Simpler Alternative（EventSourcing） | 結論: 不要   | -                | -      |
| Simpler Alternative（CRUD）          | 結論: 不十分 | -                | -      |

### 5-2. 技術的実現可能性の結論

**技術的実現可能性: 高**

設計全体として以下が確認された。

1. 既知の落とし穴（P31/P48/P42/P44/P45）に対する対策が設計段階から組み込まれている
2. Electron 3プロセスモデル（Main/Preload/Renderer）の責務分離が適切に守られている
3. SQLiteとZustandの役割分担（正本 vs キャッシュ）が明確で、一貫性保持の設計がある
4. 計算関数（buildAggregateView, calculateSuccessRate 等）が純粋関数として設計され、テスト容易性が高い
5. フィードバックルールエンジンが独立した純粋関数として設計され、拡張性がある

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 3_
