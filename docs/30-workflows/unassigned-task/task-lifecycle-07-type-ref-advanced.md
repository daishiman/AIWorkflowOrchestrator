# UT-SPEC-LIFECYCLE-TYPE-REF-ADVANCED-001 ライフサイクル型定義セクション追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1259
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-SPEC-LIFECYCLE-TYPE-REF-ADVANCED-001                                     |
| タスク名     | interfaces-agent-sdk-skill-advanced.md にライフサイクル型定義セクション追加 |
| 分類         | 改善                                                                        |
| 対象機能     | システム仕様書（interfaces-agent-sdk-skill-advanced.md）                    |
| 優先度       | 低                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-SKILL-LIFECYCLE-07 Phase 11 Note-01                                    |
| 発見日       | 2026-03-16                                                                  |
| 関連タスク   | TASK-SKILL-LIFECYCLE-07                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-07 の Phase 11 ウォークスルーで、`interfaces-agent-sdk-skill-advanced.md` にライフサイクル関連の型定義（`SkillLifecycleEvent`, `SkillAggregateView`, `SkillFeedback`）への参照セクションが存在しないことが発見された（Note-01）。これらの型は TASK-SKILL-LIFECYCLE-07 で設計された主要インターフェースであり、SDK のスキル高度機能仕様書に記載されるべき。

### 1.2 問題点・課題

`interfaces-agent-sdk-skill-advanced.md` はスキルの高度な機能に関する型定義を集約する仕様書だが、ライフサイクル履歴・フィードバック関連の型が未記載のため、後続タスク（Task08 等）の開発者がライフサイクル型を参照する際に、成果物ディレクトリを直接確認する必要がある。仕様書の集約度が不十分。

### 1.3 放置した場合の影響

- 後続タスクの開発者がライフサイクル型定義の正式な参照先を見つけられず、実装に時間がかかる
- 仕様書間の追跡可能性（traceability）が低下する
- Task08（公開・互換性）が `PublishReadinessMetrics` の正式定義場所を特定できない

## 2. 何を達成するか（What）

### 2.1 目的

`interfaces-agent-sdk-skill-advanced.md` にライフサイクル型定義セクションを追加し、`SkillLifecycleEvent`, `SkillAggregateView`, `SkillFeedback`, `PublishReadinessMetrics` の型シグネチャと成果物への参照を記載する。

### 2.2 最終ゴール

`interfaces-agent-sdk-skill-advanced.md` にライフサイクル型定義セクションが存在し、各型の概要・プロパティ・参照先が記載されている。

### 2.3 スコープ

#### 含むもの

- `interfaces-agent-sdk-skill-advanced.md` へのセクション追加
- 各型（`SkillLifecycleEvent`, `SkillAggregateView`, `SkillFeedback`, `PublishReadinessMetrics`）の型シグネチャ記載
- TASK-SKILL-LIFECYCLE-07 の成果物への参照リンク

#### 含まないもの

- 型定義の変更・拡張
- 他の仕様書の修正
- 実装コードの変更

### 2.4 成果物

- 更新済み `interfaces-agent-sdk-skill-advanced.md`

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-07 の成果物が確定していること
- `interfaces-agent-sdk-skill-advanced.md` の現在の構成を把握していること
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` のライフサイクル型定義セクションの内容を理解済みであること
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md` の型配置判断フローを確認済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- TASK-SKILL-LIFECYCLE-07 で定義された型の構造
- システム仕様書の記述フォーマット

### 3.4 推奨アプローチ

1. TASK-SKILL-LIFECYCLE-07 の Phase 2 成果物から型定義を抽出する
2. `interfaces-agent-sdk-skill-advanced.md` の既存セクション構造に合わせてライフサイクルセクションを追加する
3. 各型について概要・主要プロパティ・参照先を記載する

### 3.5 親タスク（TASK-SKILL-LIFECYCLE-07）の苦戦箇所と教訓

以下は TASK-SKILL-LIFECYCLE-07 で発生した仕様書更新に関連する苦戦箇所をまとめたもの。本タスク実行時に同様の問題を回避するために参照すること。

| 課題                                                                    | 発見経緯                                                                         | 解決策                                                                                                 | 教訓                                                                                                                             |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `interfaces-agent-sdk-skill-advanced.md` にライフサイクル型参照が未追加 | Phase 11 ウォークスルーシナリオA で型参照パス追跡時に発見                        | `advanced.md` に `SkillLifecycleEvent` / `SkillAggregateView` / `SkillFeedback` 型参照セクションを追加 | 仕様書ファミリー（basic/advanced 分割）の場合、両方に新規型参照を追加する                                                        |
| Phase 12 サブエージェントが実ファイル更新を保留                         | Phase 12 Step 2 で仕様書更新が計画のみで保留された                               | 設計タスクでも Phase 12 の実ファイル更新は必須                                                         | サブエージェントに「計画記録のみ」を許容しない                                                                                   |
| 新規型定義の仕様書配置判断が不明確                                      | Task07 で4型（`SkillLifecycleEvent` 等）の配置先を決定する際に判断基準がなかった | `spec-update-workflow.md` に型配置判断フローを追加                                                     | `packages/shared` に定義された型 → `interfaces-agent-sdk-skill*.md`、`apps/desktop` に定義された型 → `arch-state-management*.md` |

## 4. 実行手順

### Phase構成

型定義抽出 -> セクション追加 -> 参照リンク確認。

### Phase 1: ライフサイクル型定義セクションの追加

#### 目的

仕様書にライフサイクル型の正式な参照を設ける。

#### 手順

1. TASK-SKILL-LIFECYCLE-07 の Phase 2 成果物から以下の型定義を確認する:
   - `outputs/phase-2/event-model-design.md` -> `SkillLifecycleEvent`
   - `outputs/phase-2/aggregate-view-design.md` -> `SkillAggregateView`
   - `outputs/phase-2/feedback-loop-design.md` -> `SkillFeedback`
   - `outputs/phase-2/publish-metrics-interface-design.md` -> `PublishReadinessMetrics`
2. `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md` にライフサイクルセクションを追加する
3. 各型の概要・主要プロパティ・成果物パスを記載する
4. `topic-map.md` を再生成する（`node scripts/generate-index.js`）

#### 成果物

- 更新済み `interfaces-agent-sdk-skill-advanced.md`
- 再生成済み `topic-map.md`

#### 完了条件

- ライフサイクル型定義セクションが追加されている
- 4つの型すべての概要と参照先が記載されている

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillLifecycleEvent` の型概要と参照先が記載されている
- [ ] `SkillAggregateView` の型概要と参照先が記載されている
- [ ] `SkillFeedback` の型概要と参照先が記載されている
- [ ] `PublishReadinessMetrics` の型概要と参照先が記載されている

### 品質要件

- [ ] 既存セクションの記述フォーマットと統一されている
- [ ] 参照リンクが有効である

### ドキュメント要件

- [ ] `topic-map.md` が再生成されている
- [ ] 変更内容が変更履歴に記録されている

## 6. 検証方法

### テストケース

- Case 1: `grep -n "SkillLifecycleEvent\|SkillAggregateView\|SkillFeedback\|PublishReadinessMetrics" interfaces-agent-sdk-skill-advanced.md` が 4 型すべてヒットする
- Case 2: 参照リンク先のファイルが存在する

### 検証手順

1. 対象仕様書に4つの型が記載されていることを grep 確認する
2. 参照リンク先のファイルが実在することを `ls` で確認する
3. `topic-map.md` が最新であることを確認する

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                       |
| ---------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 成果物パスの変更により参照リンクが切れる | 低     | 低       | 相対パスではなくリポジトリルートからの絶対パスを使用する   |
| 型定義が後続タスクで変更される           | 低     | 中       | 「TASK-SKILL-LIFECYCLE-07 時点の定義」であることを明記する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の Phase 2 成果物、Phase 11 成果物
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — ライフサイクル型定義セクション（既に更新済み）
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` — ライフサイクルイベントモデルセクション
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — TASK-SKILL-LIFECYCLE-07 教訓セクション

### 参考資料

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md` — 新規型定義の仕様書配置判断フロー

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 11 Note-01: interfaces-agent-sdk-skill-advanced.md にライフサイクル型定義セクション（SkillLifecycleEvent / SkillAggregateView / SkillFeedback参照）を追加すべき
```

### 補足事項

設計タスク（docs-only）の成果物であるため、型シグネチャと参照先の記載が主な作業。実装コードの変更は不要。
