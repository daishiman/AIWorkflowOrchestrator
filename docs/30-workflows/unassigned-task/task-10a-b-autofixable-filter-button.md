# UT-TASK-10A-B-001 自動修正可能フィルタボタン実装 - タスク指示書

## メタ情報

```yaml
issue_number: 984
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | UT-TASK-10A-B-001                  |
| タスク名     | 自動修正可能フィルタボタン実装     |
| 分類         | 改善                               |
| 対象機能     | SkillAnalysisView / SuggestionList |
| 優先度       | 中                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 未実施                             |
| 発見元       | TASK-10A-B Phase 10 MINOR M1       |
| 発見日       | 2026-03-02                         |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SkillAnalysisView には提案選択UIがあるが、autoFixable提案のみを一括選択する導線がない。

### 1.2 問題点・課題

提案件数が多い場合、手動選択コストが高く、全自動改善を使わない中間運用がしづらい。

### 1.3 放置した場合の影響

改善適用UXが悪化し、提案適用率が下がる。

## 2. 何を達成するか（What）

### 2.1 目的

`autoFixable === true` の提案をワンクリックで選択できるUIを追加する。

### 2.2 最終ゴール

「自動修正可能を選択」操作で選択状態が更新され、適用ボタンまで到達できる。

### 2.3 スコープ

#### 含むもの

SuggestionList UI、useSkillAnalysis の選択制御、関連テスト。

#### 含まないもの

提案生成ロジックやMain側改善アルゴリズムの変更。

### 2.4 成果物

- `SuggestionList.tsx` のフィルタ操作UI
- `useSkillAnalysis.ts` の選択ヘルパー
- コンポーネントテスト更新

## 3. どのように実行するか（How）

### 3.1 前提条件

既存提案の `autoFixable` フラグが正しく取得できること。

### 3.2 依存タスク

なし。

### 3.3 必要な知識

React state管理、アクセシビリティ属性、既存テスト方針（fireEvent）。

### 3.4 推奨アプローチ

選択Setを再構築する純関数を用意し、UIはボタン追加のみで実現する。

## 4. 実行手順

### Phase構成

実装 → テスト → 仕様同期。

### Phase 1: 実装と検証

#### 目的

UI導線を追加して回帰なしを確認する。

#### 手順

1. SuggestionListに「自動修正可能を選択」ボタンを追加する。
2. 選択Setを更新するハンドラを実装する。
3. 既存テストと追加テストを実行する。

#### 成果物

コード差分とテスト結果。

#### 完了条件

ボタン操作でautoFixable提案が選択される。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] autoFixable提案の一括選択ができる

### 品質要件

- [ ] 関連テストがPASSする

### ドキュメント要件

- [ ] `task-workflow.md` の当該行が更新される

## 6. 検証方法

### テストケース

- autoFixable true/false混在時の一括選択
- 提案0件時の無効化表示

### 検証手順

1. `pnpm vitest run src/renderer/components/skill/__tests__/SuggestionList.test.tsx`
2. `pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                             |
| ------------------------ | ------ | -------- | -------------------------------- |
| 既存選択ロジックとの競合 | 中     | 中       | 選択更新ロジックを単一関数に集約 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md#p39`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
FR-3-2: 自動修正可能フィルタが未実装
```

### 補足事項

選択状態はインデックスベースで維持する。
