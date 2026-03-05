# [#990] "[UT-TASK-10A-B-005] SkillAnalysisView 分割設計追補"

## メタ情報

```yaml
task_id: UT-TASK-10A-B-005
task_name: SkillAnalysisView 分割設計追補
category: リファクタリング
target_feature: SkillAnalysisView
priority: 低
scale: 中規模
status: 未実施
source_phase: TASK-10A-B Phase 10 MINOR M5
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-b-analysis-view-molecule-separation.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

設計では Header / Actions / Error をmolecule分離する想定だったが、実装はinline構成。

### 1.2 問題点・課題

責務の集約により、将来のUI変更で差分影響範囲が広い。

### 1.3 放置した場合の影響

保守性が低下し、拡張時の回帰リスクが増える。

## 2. 何を達成するか（What）

### 2.1 目的

SkillAnalysisViewの責務をmoleculeへ再分割して構造を明確化する。

### 2.2 最終ゴール

`AnalysisHeader` / `AnalysisActions` / `AnalysisError` を独立コンポーネント化する。

### 2.3 スコープ

#### 含むもの

コンポーネント分離、props再定義、既存テスト移設。

#### 含まないもの

機能仕様そのものの追加。

### 2.4 成果物

- 3つのmoleculeコンポーネント
- SkillAnalysisView簡素化
- テスト更新

## 3. どのように実行するか（How）

### 3.1 前提条件

現行テスト57件が回帰ガードとして利用できること。

### 3.2 依存タスク

なし。

### 3.3 必要な知識

Atomic Design、Reactコンポーネント分割、Props設計。

### 3.4 推奨アプローチ

表示責務のみを分離し、ビジネスロジックは `useSkillAnalysis` に残す。

## 4. 実行手順

### Phase構成

分割設計 → 実装 → 回帰検証。

### Phase 1: 分割実装

#### 目的

責務境界を明確にする。

#### 手順

1. Header/Error/Actionsをmolecule化する。
2. SkillAnalysisViewをレイアウト統合専用に寄せる。
3. 既存テストを再配置し回帰確認する。

#### 成果物

分割後コンポーネント群。

#### 完了条件

構成が設計仕様と一致する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Header/Error/Actions が独立コンポーネント化される

### 品質要件

- [ ] 既存テストが全PASSする

### ドキュメント要件

- [ ] component-documentation.md を更新する

## 6. 検証方法

### テストケース

- 表示回帰
- disabled状態回帰
- エラー状態回帰

### 検証手順

1. `pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                       |
| ----------------------- | ------ | -------- | -------------------------- |
| 分割後のprops連携不整合 | 中     | 中       | 分割前後でテストを固定比較 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/phase-2-design.md`
- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md`

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
AnalysisActions / AnalysisHeader / AnalysisError が独立molecule未分離
```

### 補足事項

機能追加ではなく構造改善タスクとして扱う。
