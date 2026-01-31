# CommunityVisualization統合テスト修正 - タスク指示書

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | task-community-integration-test-alignment              |
| タスク名     | CommunityVisualization統合テストとUI実装の整合修正     |
| 分類         | バグ修正                                               |
| 対象機能     | CommunityVisualization / CommunityGraph                |
| 優先度       | 中                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | コードベースTODO検出（community-integration.test.tsx） |
| 発見日       | 2026-02-01                                             |
| issue_number | 621                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

community-integration.test.tsxに4件のスキップされたテスト（TODO付き）が存在する。これらはCommunityVisualizationコンポーネントのUIとテスト期待値の間に不一致があることを示している。テストがスキップされている間、これらの機能に対するリグレッション検出ができない。

### 1.2 問題点・課題

- CommunityGraphコンポーネントのレンダリングがテスト期待値と不一致（L178）
- 詳細パネルの表示ロジックが未実装または不一致（L238）
- 再試行ボタンの実装が不足（L378）
- selectedクラスの適用ロジックが未実装（L486）

### 1.3 放置した場合の影響

- CommunityVisualization機能のリグレッションが検出されない
- スキップされたテストが蓄積し、品質保証レベルが低下
- 実装とテストの乖離が拡大する

---

## 2. 何を達成するか（What）

### 2.1 目的

community-integration.test.tsxの4件のスキップされたテストを全てPASSする状態にする。テストの修正またはUIコンポーネントの修正（もしくは両方）で対応する。

### 2.2 最終ゴール

- 4件のスキップテストが全てスキップ解除されPASSしている
- CommunityVisualizationのUI実装とテスト期待値が一致している
- 新たなスキップテストが追加されていない

### 2.3 スコープ

#### 含むもの

- CommunityGraphコンポーネントの修正（必要に応じて）
- 詳細パネル表示ロジックの修正
- 再試行ボタンの実装
- selectedクラス適用ロジックの実装
- テストケースの修正（UI実装に合わせる場合）

#### 含まないもの

- CommunityVisualizationの新機能追加
- CONV-08-06エンティティ詳細画面遷移（別TODOで管理）

### 2.4 成果物

- CommunityVisualization関連コンポーネント修正
- community-integration.test.tsxのスキップ解除・修正
- テスト全件PASS確認

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CommunityVisualizationコンポーネントの仕様を理解していること
- 知識グラフ（Knowledge Graph）のUIパターンを理解していること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- TypeScript、React
- Testing Library / Vitest
- CommunityVisualizationのコンポーネント構造

### 3.4 推奨アプローチ

1. 各スキップテストのTODOコメントを読み、期待される動作を理解
2. 現在のUI実装を確認し、テスト期待値との差異を特定
3. UI実装の修正が正しいか、テストの期待値修正が正しいかを判断
4. 修正を実施し、スキップを解除

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。

### 主要作業

| #   | 対象テスト（行番号） | TODO内容                           | 想定修正                                       |
| --- | -------------------- | ---------------------------------- | ---------------------------------------------- |
| 1   | L178                 | CommunityGraph側の修正が必要       | CommunityGraphコンポーネントのレンダリング修正 |
| 2   | L238                 | 詳細パネル表示ロジックの修正が必要 | 詳細パネル表示条件のロジック修正               |
| 3   | L378                 | 再試行ボタンの実装が必要           | エラー時の再試行ボタン追加                     |
| 4   | L486                 | selectedクラスの適用が必要         | 選択状態のCSSクラス適用ロジック追加            |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] CommunityGraphコンポーネントが正しくレンダリングされる
- [ ] 詳細パネルが正しいタイミングで表示される
- [ ] エラー時に再試行ボタンが表示され、クリックで再実行できる
- [ ] 選択状態のノードにselectedクラスが適用される

### 品質要件

- [ ] 4件のスキップテストが全てPASS
- [ ] 既存テストが全てPASS（リグレッションなし）
- [ ] 新規テストのカバレッジが80%以上

### ドキュメント要件

- [ ] テスト修正内容の記録（Phase 12成果物）

---

## 6. 検証方法

### テストケース

- CommunityGraphレンダリングテスト（元L178）がPASS
- 詳細パネル表示テスト（元L238）がPASS
- 再試行ボタンテスト（元L378）がPASS
- selectedクラステスト（元L486）がPASS

### 検証手順

1. `pnpm vitest run apps/desktop/src/renderer/__tests__/community-integration.test.tsx` 実行
2. 全テストPASS確認
3. スキップ解除後の全体テスト実行

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                   |
| ---------------------------------- | ------ | -------- | -------------------------------------- |
| UI修正が他コンポーネントに影響     | 中     | 低       | 影響範囲を限定した修正                 |
| テスト期待値自体が不正確           | 低     | 中       | 仕様を確認してテスト修正を検討         |
| CommunityVisualization仕様が不明確 | 中     | 中       | 関連コンポーネントとテストから仕様推定 |

---

## 8. 参照情報

### 関連ドキュメント

- テストファイル: `apps/desktop/src/renderer/__tests__/community-integration.test.tsx`
- CommunityVisualization: `apps/desktop/src/renderer/components/community/templates/CommunityVisualization/index.tsx`
- ナレッジグラフ仕様: `.claude/skills/aiworkflow-requirements/references/rag-knowledge-graph.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
apps/desktop/src/renderer/__tests__/community-integration.test.tsx:
L178: TODO: テストがUIコンポーネントの実装と不一致 - CommunityGraph側の修正が必要
L238: TODO: テストがUIコンポーネントの実装と不一致 - 詳細パネル表示ロジックの修正が必要
L378: TODO: テストがUIコンポーネントの実装と不一致 - 再試行ボタンの実装が必要
L486: TODO: テストがUIコンポーネントの実装と不一致 - selectedクラスの適用が必要
```

### 補足事項

4件のTODOは全て「テストがUIコンポーネントの実装と不一致」というパターン。テストが先に書かれ、UI実装が追いついていない状態と推定される。各修正は独立しているため、個別にスキップ解除→修正→テストPASSのサイクルで対応可能。
