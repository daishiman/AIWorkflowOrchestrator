# Agent SDK Skill 仕様

## 概要
この親仕様書は型定義と契約の入口であり、詳細ドメイン別定義と履歴は child companion へ分離した。
旧連番 suffix の reference / history child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [interfaces-agent-sdk-skill-core.md](interfaces-agent-sdk-skill-core.md) | core specification | 概要 / Skill Dashboard 型定義（AGENT-002） |
| [interfaces-agent-sdk-skill-details.md](interfaces-agent-sdk-skill-details.md) | detail specification | Skill Dashboard 型定義（AGENT-002） / SkillImportStore（TASK-2B） |
| [interfaces-agent-sdk-skill-advanced.md](interfaces-agent-sdk-skill-advanced.md) | advanced specification | SkillSlice型定義（TASK-6-1） / ModifierSkill（スライド逆同期機能） / ChatPanel統合（TASK-7D） / SkillFileManager（TASK-9A-A） |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | reference bundle (creator / editor / chain / schedule) | SkillCreatorService（TASK-9B-G） / SkillEditor UI 型定義（TASK-9A / completed） / スキルチェーン 型定義（TASK-9D） / スキルスケジュール 型定義（TASK-9G） |
| [interfaces-agent-sdk-skill-reference-share-debug-analytics.md](interfaces-agent-sdk-skill-reference-share-debug-analytics.md) | reference bundle (share / debug / doc-generation / analytics) | スキル共有 型定義（TASK-9F） / スキルデバッグ 型定義（TASK-9H） / スキルドキュメント生成 型定義（TASK-9I） / スキル分析 型定義（TASK-9J） |
| [interfaces-agent-sdk-skill-history.md](interfaces-agent-sdk-skill-history.md) | history bundle (completed tasks / doc links) | 完了タスク / 関連ドキュメント |
| [interfaces-agent-sdk-skill-history-contract-fix-changelog.md](interfaces-agent-sdk-skill-history-contract-fix-changelog.md) | history bundle (contract fix backlog / change log) | 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## ライフサイクル履歴型定義（TASK-SKILL-LIFECYCLE-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| ステータス | `spec_created`（設計タスク） |
| 成果物 | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` |

### 型サマリー

| 型名 | 概要 |
| --- | --- |
| `SkillLifecycleEvent` | ライフサイクルイベント単体。18種別のイベントを `eventType` で判別し、`metadata` に詳細を格納する |
| `SkillAggregateView` | スキル単位の集約ビュー。成功率・トレンド・推薦スコア・最終イベント日時を保持する |
| `SkillFeedback` | ユーザーフィードバック。rating / comment / category / severity を持つ |
| `PublishReadinessMetrics` | 公開準備度指標。success_rate / test_coverage / feedback_score / overall_readiness を集約する |

### 参照リンク

- 要件定義: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-1-requirements.md`
- 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`
- 最終レビュー: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-10-final-review.md`

---

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
