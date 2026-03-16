# Agent SDK 完了タスク・履歴

## 概要
この親仕様書は型定義と契約の入口であり、詳細ドメイン別定義と履歴は child companion へ分離した。
旧連番 suffix の history child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [interfaces-agent-sdk-history-core.md](interfaces-agent-sdk-history-core.md) | core specification | 概要 / 残課題（未タスク） |
| [interfaces-agent-sdk-history-history.md](interfaces-agent-sdk-history-history.md) | history bundle (completed timeline) | 完了タスク |
| [interfaces-agent-sdk-history-history-doc-links-changelog.md](interfaces-agent-sdk-history-history-doc-links-changelog.md) | history bundle (completed timeline / doc links / change log) | 完了タスク / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## ライフサイクルイベントモデル（TASK-SKILL-LIFECYCLE-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| ステータス | `spec_created`（設計タスク） |
| 成果物 | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` |

### 18イベント種別カテゴリ分類

| カテゴリ | イベント数 | イベント種別 |
| --- | --- | --- |
| creation | 3 | `skill:created`, `skill:imported`, `skill:forked` |
| evaluation | 4 | `skill:evaluated`, `skill:score_updated`, `skill:gate_passed`, `skill:gate_failed` |
| execution | 4 | `skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`, `skill:execution_timeout` |
| improvement | 3 | `skill:improved`, `skill:version_bumped`, `skill:feedback_applied` |
| reuse | 4 | `skill:reused`, `skill:recommended`, `skill:imported`, `skill:forked` |

### ScoreDataPoint 型参照

`ScoreDataPoint` は時系列スコア推移を記録する型で、`{ timestamp: number; score: number; eventType: string }` の構造を持つ。SkillAggregateView の `scoreTrend` フィールドで使用される。

---

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
