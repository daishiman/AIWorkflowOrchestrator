# Phase 11: 発見事項リスト

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 11                      |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| 作成日   | 2026-03-16              |

---

## 1. 発見事項サマリー

| カテゴリ | 件数 |
| -------- | ---- |
| Blocker  | 0    |
| Note     | 5    |
| Info     | 2    |

Blocker は 0 件であり、Phase 12 前に修正が必要な項目はない。

---

## 2. Note（Phase 12 の未タスク検出で記録すべき改善点）

### Note-01: interfaces-agent-sdk-skill-advanced.md への SkillLifecycleEvent 型参照追加

- **発見箇所**: シナリオA -- SKILL.md → interfaces-agent-sdk-skill.md の追跡確認
- **内容**: `interfaces-agent-sdk-skill-advanced.md` は SkillSlice 型定義を扱っているが、Task07 で新たに定義される `SkillLifecycleEvent` / `SkillAggregateView` / `SkillFeedback` 型への参照セクションが未追加。Task07 の型定義は `packages/shared/src/skill/` 配下に配置予定であり、interfaces-agent-sdk-skill 系仕様書に参照リンクを追加すべき
- **影響範囲**: 仕様書のナビゲーション。実装には影響しない
- **推奨対応**: Phase 12 Task 2 のシステム仕様書更新で `interfaces-agent-sdk-skill-advanced.md` にライフサイクル型定義セクションを追加する

### Note-02: lifecycle-event-catalog.md のイベント数表記揺れ（17 vs 18）

- **発見箇所**: シナリオA -- Phase 1 カタログの確認
- **内容**: Phase 1 `lifecycle-event-catalog.md` のメタ情報では「全17イベント」と記載（1行目付近）されているが、実際には `skill:forked` を追加定義して18イベントとなっている。カタログ末尾の注釈（437行目）で「Phase 2 設計レビューで採否を確定する」と記載されており、Phase 3 でゲート通過しているため18イベントが正式だが、メタ情報の数値が未更新
- **影響範囲**: ドキュメントの一貫性。実装には影響しない
- **推奨対応**: Phase 12 で `lifecycle-event-catalog.md` のメタ情報を「全18イベント」に更新する

### Note-03: SkillFeedback の severity フィールドが型定義に明示されていない

- **発見箇所**: シナリオC -- hasCriticalFeedback の追跡
- **内容**: `PublishReadinessMetrics.hasCriticalFeedback` は `severity='critical'` のフィードバック存在を確認する指標だが、`SkillFeedback` 型（Phase 2 feedback-loop-design.md 2-2）には `severity` フィールドが明示的に定義されていない。`FeedbackAction.severity` には `"info" | "warning" | "critical"` が定義されているが、`SkillFeedback` 自体への severity 付与は `evaluateFeedbackRules()` の出力（FeedbackAction）を通じて間接的に判定される設計になっている。この間接参照のため、`hasCriticalFeedback` の計算パスが一見分かりにくい
- **影響範囲**: 実装時のデータモデル設計判断。Phase 5 で `SkillFeedback` に `severity` フィールドを追加するか、`FeedbackAction` 経由で判定するかを実装タスクで確定すべき
- **推奨対応**: Phase 12 の未タスクとして、SkillFeedback への severity フィールド直接追加の検討タスクを記録する

### Note-04: feedbackSlice と lifecycleHistorySlice の責務重複の可能性

- **発見箇所**: シナリオB -- feedbackSlice と data-flow-design.md の比較
- **内容**: Phase 2 `feedback-loop-design.md` 6 で `feedbackSlice` が設計されている一方、`data-flow-design.md` 5 では `lifecycleHistorySlice` 内に `feedbackBySkill` フィールドが定義されている。両方のスライスがフィードバックデータを保持する設計となっており、責務境界が曖昧。Phase 5 `lifecycle-history-slice-spec.md` では lifecycleHistorySlice に feedbackBySkill が含まれているが、feedbackSlice との使い分けが明示されていない
- **影響範囲**: 実装時のスライス設計。データの二重管理によるバグリスク
- **推奨対応**: Phase 12 の未タスクとして、feedbackSlice と lifecycleHistorySlice の責務統合または明確な分担定義のタスクを記録する

### Note-05: EventQueue バッファのイベント破棄時のデータ損失通知

- **発見箇所**: シナリオB -- data-flow-design.md の EventQueue 設計確認
- **内容**: `data-flow-design.md` 1.3 で EventQueue のバッファ設計が記載されており、SQLite 書き込み3回失敗時にイベントを破棄する設計。破棄時は「エラーログ記録」のみで、ユーザーへの通知や破棄されたイベントの復旧パスが定義されていない。ライフサイクル履歴は「削除しない」方針（Phase 1 lifecycle-event-catalog.md 5）と矛盾する可能性がある
- **影響範囲**: データ完全性。低頻度だが SQLite 書き込み障害時にイベントが失われる
- **推奨対応**: Phase 12 の未タスクとして、EventQueue 破棄イベントのフォールバック保存（ファイルシステム等）の検討タスクを記録する

---

## 3. Info（参考情報、修正不要）

### Info-01: skill:forked イベントの Phase 3 採否確定

- **発見箇所**: シナリオA -- イベントカタログ確認
- **内容**: `skill:forked` はPhase 1 で「Phase 2 設計レビューで採否を確定する」と注釈されていたが、Phase 3 の gate-decision.md で PASS 判定を受けて正式採用されている。18イベント構成が確定済み
- **影響**: なし

### Info-02: Task08 ステータスが not_started

- **発見箇所**: シナリオC -- Task08 index.md 確認
- **内容**: Task08（TASK-SKILL-LIFECYCLE-08）は依存タスク（Task05, 06, 07）の全完了後に着手予定。現時点で not_started は正常な状態
- **影響**: なし

---

## 4. Blocker 確認

Blocker は **0 件** である。Phase 12 への進行をブロックする問題は発見されなかった。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 11 発見事項リスト_
