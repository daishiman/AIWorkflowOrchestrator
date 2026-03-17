# UT-DESIGN-FEEDBACK-SEVERITY-FIELD-001 SkillFeedback severity フィールド設計検討 - タスク指示書

## メタ情報

```yaml
issue_number: 1258
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-DESIGN-FEEDBACK-SEVERITY-FIELD-001                      |
| タスク名     | SkillFeedback に severity フィールドを追加するかの設計検討 |
| 分類         | 改善                                                       |
| 対象機能     | SkillFeedback 型設計（フィードバックモデル）               |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-SKILL-LIFECYCLE-07 Phase 11 Note-03                   |
| 発見日       | 2026-03-16                                                 |
| 関連タスク   | TASK-SKILL-LIFECYCLE-07                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-07 の Phase 11 ウォークスルーで、`SkillFeedback` 型にフィードバックの重大度（severity）を直接保持するフィールドがない点が Note-03 として記録された。現状の設計では `FeedbackAction` 経由の間接的な判定（`hasCriticalFeedback` の計算）でのみ severity に相当する情報を取得できるが、フィードバック単体での重大度判定が困難。

### 1.2 問題点・課題

- フィードバック一覧表示時に、重大なフィードバックとそうでないものを区別するために集約ロジックを経由する必要がある
- `PublishReadinessMetrics.hasCriticalFeedback` の計算が、フィードバック単体のプロパティではなく `FeedbackAction` の種別に依存しており、データモデルと計算ロジックの結合度が高い
- UI でフィードバックの優先度表示を行う場合に、追加の計算が必要になる

### 1.3 放置した場合の影響

- Task08（公開・互換性）でフィードバック重大度を判定する際のロジックが複雑になる
- フィードバック一覧 UI の実装時に不要な集約計算が必要になり、パフォーマンスに影響する可能性がある
- ただし、現状の間接判定で機能上の問題はなく、影響は限定的

## 2. 何を達成するか（What）

### 2.1 目的

`SkillFeedback` 型に `severity` フィールドを直接追加するか、現状の `FeedbackAction` 経由の間接判定を維持するかを設計レベルで検討し、推奨案を文書化する。

### 2.2 最終ゴール

設計検討結果が文書化され、採用案と見送り案の根拠が明記されている。

### 2.3 スコープ

#### 含むもの

- `SkillFeedback` 型への `severity` フィールド追加の是非検討
- severity の値セット（例: `"critical" | "major" | "minor" | "info"`）の設計
- `PublishReadinessMetrics.hasCriticalFeedback` 計算への影響分析
- 推奨案の文書化

#### 含まないもの

- 実装コードの変更（設計検討タスク）
- UI コンポーネントの設計
- データベーススキーマの変更

### 2.4 成果物

- 設計検討結果ドキュメント（`feedback-loop-design.md` への追記または別ドキュメント）
- 推奨案と根拠

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-07 の成果物が確定していること
- `SkillFeedback` 型と `FeedbackAction` 型の現状設計を把握していること
- Phase 2 `feedback-loop-design.md` のフィードバック還流設計を理解済みであること
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の feedbackSlice セクションを確認済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- フィードバックモデルの設計（`feedback-loop-design.md`）
- `PublishReadinessMetrics` の計算ロジック（`publish-metrics-interface-design.md`）
- データモデル設計の原則（正規化 vs 非正規化のトレードオフ）

### 3.4 推奨アプローチ

以下の2案を比較検討する:

**案A: severity フィールドを直接追加**

```typescript
interface SkillFeedback {
  // 既存プロパティ...
  severity: "critical" | "major" | "minor" | "info";
}
```

- 利点: フィードバック単体で重大度が判定可能、UI 表示がシンプル
- 欠点: 入力時にユーザーが severity を判断する必要がある、データの冗長性

**案B: FeedbackAction 経由の間接判定を維持**

- 利点: データモデルがシンプル、severity はビジネスロジックで計算
- 欠点: 重大度判定に集約ロジックが必要

### 3.5 親タスク(TASK-SKILL-LIFECYCLE-07)の苦戦箇所

| 課題                                                 | 発見経緯                                                                   | 解決策                                                   | 教訓                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| hasCriticalFeedback の計算パスが間接的で分かりにくい | Phase 11 ウォークスルーシナリオC で PublishReadinessMetrics の追跡時に発見 | SkillFeedback に severity フィールドを直接追加するか検討 | フィードバックモデルの設計判断は公開判断メトリクスの計算複雑度に影響する |
| Phase 3 MINOR の追跡が Phase 横断で消失              | Phase 3→5→9→10 の4Phase横断で MINOR 対応状況が不明確に                     | Phase 5 完了時に MINOR 追跡マトリクスを作成              | 設計検討タスクでも MINOR 追跡は必要                                      |
| feedbackSlice と lifecycleHistorySlice の責務重複    | Phase 11 Note-04 でフィードバックデータの二重管理リスクを検出              | 実装タスク Phase 2 で責務統合/分担を確定                 | severity 設計判断はスライス責務設計と連動させる                          |

## 4. 実行手順

### Phase構成

現状分析 -> 案比較 -> 推奨案決定 -> 文書化。

### Phase 1: 設計検討と文書化

#### 目的

severity フィールドの要否を設計レベルで判断する。

#### 手順

1. `feedback-loop-design.md` の `SkillFeedback` 型定義を確認する
2. `publish-metrics-interface-design.md` の `hasCriticalFeedback` 計算ロジックを確認する
3. 案A（直接追加）と案B（間接判定維持）のメリット・デメリットを比較する
4. Task08 の要件から、severity の直接参照が必要かどうかを判断する
5. 推奨案を `feedback-loop-design.md` に追記する

#### 成果物

- 更新済み `feedback-loop-design.md`（設計検討セクション追加）

#### 完了条件

- 2案の比較が文書化されている
- 推奨案と根拠が明記されている

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 案A と案B の比較が文書化されている
- [ ] 推奨案が明記されている
- [ ] 推奨案の根拠が具体的に記載されている

### 品質要件

- [ ] Task08 連携への影響が分析されている
- [ ] `PublishReadinessMetrics` 計算への影響が明記されている

### ドキュメント要件

- [ ] 設計検討結果が仕様書に追記されている

## 6. 検証方法

### テストケース

- Case 1: 設計検討結果に2案の比較が含まれている
- Case 2: 推奨案の根拠が「Task08 連携」「UI 実装効率」「データモデル複雑度」の観点で記載されている

### 検証手順

1. 設計検討ドキュメントを確認し、2案の比較が記載されていることを目視確認する
2. 推奨案の根拠が具体的であることを確認する

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                    |
| --------------------------------- | ------ | -------- | ------------------------------------------------------- |
| Task08 の要件が未確定で判断が困難 | 中     | 中       | 両案を文書化し、Task08 確定後に最終判断する旨を明記する |
| 設計変更が後続タスクに波及する    | 低     | 低       | 変更影響範囲を設計検討ドキュメントに明記する            |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の Phase 2 成果物（feedback-loop-design.md, publish-metrics-interface-design.md）、Phase 11 成果物
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — ライフサイクル型定義セクション（SkillFeedback 型）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — feedbackSlice セクション
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — TASK-SKILL-LIFECYCLE-07 教訓セクション

### 参考資料

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の feedback-model-impl-spec.md

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 11 Note-03: SkillFeedback に severity フィールドを直接追加するか、FeedbackAction 経由の間接判定を維持するかの設計検討が必要
```

### 補足事項

設計検討タスクのため、実装は含まない。推奨案の採否は Task08 の具体化後に最終判断する。
