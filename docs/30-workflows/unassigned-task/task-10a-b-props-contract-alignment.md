# UT-TASK-10A-B-004 Props契約整合（skill vs skillName） - タスク指示書

## メタ情報

```yaml
issue_number: 995
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | UT-TASK-10A-B-004                   |
| タスク名     | Props契約整合（skill vs skillName） |
| 分類         | 改善                                |
| 対象機能     | SkillAnalysisView 設計仕様          |
| 優先度       | 低                                  |
| 見積もり規模 | 小規模                              |
| ステータス   | 未実施                              |
| 発見元       | TASK-10A-B Phase 10 MINOR M4        |
| 発見日       | 2026-03-02                          |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

設計書は `skill: ImportedSkill`、実装は `skillName: string` で契約が乖離している。

### 1.2 問題点・課題

仕様とコードの参照先が一致せず、後続実装で誤解を生む。

### 1.3 放置した場合の影響

タスク分解時に不要な実装差し戻しや型変換が発生する。

## 2. 何を達成するか（What）

### 2.1 目的

設計と実装のProps契約を単一仕様へ統一する。

### 2.2 最終ゴール

設計書・実装・テストで同一Props定義を参照する。

### 2.3 スコープ

#### 含むもの

Phase 2設計書、Phase 5実装仕様、関連リファレンス。

#### 含まないもの

実装ロジックの機能拡張。

### 2.4 成果物

- 契約統一後の仕様差分
- 変更履歴更新

## 3. どのように実行するか（How）

### 3.1 前提条件

現行実装が `skillName` 前提で動作していること。

### 3.2 依存タスク

なし。

### 3.3 必要な知識

TypeScript interface設計、ドキュメント同期。

### 3.4 推奨アプローチ

実装契約を正本にして仕様書を更新する。

## 4. 実行手順

### Phase構成

契約確定 → 文書更新 → 検証。

### Phase 1: 仕様同期

#### 目的

契約乖離を解消する。

#### 手順

1. Phase 2/5 のProps定義記述を `skillName: string` に統一する。
2. 影響箇所をgrepで確認する。
3. 最終レビュー成果物に同期結果を記録する。

#### 成果物

更新済み仕様書。

#### 完了条件

対象文書に `skill: ImportedSkill` 記述が残らない。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 実装契約と設計契約が一致する

### 品質要件

- [ ] 影響箇所が網羅更新される

### ドキュメント要件

- [ ] 変更履歴へ理由を追記する

## 6. 検証方法

### テストケース

- `rg -n "skill: ImportedSkill|skillName" docs/30-workflows/completed-tasks/skill-analysis-view`

### 検証手順

1. grepで旧記述の残存有無を確認する。
2. `verify-all-specs` を再実行する。

## 7. リスクと対策

| リスク         | 影響度 | 発生確率 | 対策                       |
| -------------- | ------ | -------- | -------------------------- |
| 設計側更新漏れ | 低     | 中       | grepで全フェーズを機械確認 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/phase-2-design.md`
- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
設計: skill, 実装: skillName の契約乖離
```

### 補足事項

技術的には現状実装で問題なし。
