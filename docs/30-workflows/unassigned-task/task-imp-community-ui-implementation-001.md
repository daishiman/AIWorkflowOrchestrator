# Community統合テストUIコンポーネント不一致修正 - タスク指示書

## メタ情報

```yaml
issue_number: 668
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | task-imp-community-ui-implementation-001      |
| タスク名     | Community統合テストUIコンポーネント不一致修正 |
| 分類         | 改善                                          |
| 対象機能     | CommunityGraph / CommunityVisualization       |
| 優先度       | 低                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | コードベーススキャン（TODOコメント検出）      |
| 発見日       | 2026-02-02                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`community-integration.test.tsx` には、CommunityGraphおよびCommunityVisualizationコンポーネントの統合テストが存在するが、現在4件のTODOコメントにより一部テストがスキップ状態となっている。これらのTODOは、テストの期待値とUIコンポーネントの実装が不一致であることを示している。

### 1.2 問題点・課題

以下の4点が未実装/不一致として認識されている：

| #   | ファイル:行                        | 問題点                             |
| --- | ---------------------------------- | ---------------------------------- |
| 1   | community-integration.test.tsx:178 | CommunityGraph側の修正が必要       |
| 2   | community-integration.test.tsx:238 | 詳細パネル表示ロジックの修正が必要 |
| 3   | community-integration.test.tsx:378 | 再試行ボタンの実装が必要           |
| 4   | community-integration.test.tsx:486 | selectedクラスの適用が必要         |

### 1.3 放置した場合の影響

- テストカバレッジが不完全なままとなり、UIの品質保証ができない
- 将来の機能追加時にリグレッションリスクが増大
- CommunityGraphコンポーネントの仕様が不明確なまま放置される

---

## 2. 何を達成するか（What）

### 2.1 目的

CommunityGraphおよびCommunityVisualizationコンポーネントの実装とテストの整合性を確保し、全統合テストがPASSする状態にする。

### 2.2 最終ゴール

- 4件のTODOコメントが解消され、対応するテストケースが全てPASS
- UIコンポーネントがテストの期待値通りに動作

### 2.3 スコープ

#### 含むもの

- CommunityGraph.tsxの修正（必要に応じて）
- CommunityVisualization/index.tsxの修正
- community-integration.test.tsxのTODO解消
- 関連するCSS/スタイリングの修正

#### 含まないもの

- CommunityGraph全体のリファクタリング
- 新規機能の追加
- パフォーマンス最適化

### 2.4 成果物

| 成果物                                   | 説明                                             |
| ---------------------------------------- | ------------------------------------------------ |
| 修正済みCommunityGraph.tsx               | 必要に応じたUIロジック修正                       |
| 修正済みCommunityVisualization/index.tsx | 詳細パネル表示・再試行ボタン・selected状態の実装 |
| 更新済みcommunity-integration.test.tsx   | TODOコメント除去、全テストPASS                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Communityコンポーネントの基本構造を理解していること
- React Testing Libraryの使用方法を理解していること

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

- React / TypeScript
- React Testing Library
- Tailwind CSS（selectedクラスの適用）

### 3.4 推奨アプローチ

1. 各TODOを順番に解消し、テストがPASSすることを確認
2. UIの変更は最小限に抑え、テストの期待値との整合性を優先

### 3.5 システム仕様書参照

| 仕様書                                    | セクション       | 内容               |
| ----------------------------------------- | ---------------- | ------------------ |
| `ui-ux-components.md`                     | CommunityGraph   | コンポーネント仕様 |
| `architecture-implementation-patterns.md` | UIテストパターン | テスト設計パターン |

---

## 4. 実行手順

### Phase構成

| Phase | 名称 | 概要                 |
| ----- | ---- | -------------------- |
| 1     | 調査 | 各TODOの原因分析     |
| 2     | 実装 | UIコンポーネント修正 |
| 3     | 検証 | テスト実行・確認     |

### Phase 1: 調査

#### 目的

各TODOの原因を特定し、必要な修正内容を明確化する。

#### 手順

1. `community-integration.test.tsx`の各テストケースを読み、期待される動作を理解
2. 対応するUIコンポーネントのコードを確認
3. 期待値と実装のギャップを特定

#### 成果物

調査結果レポート（修正箇所一覧）

### Phase 2: 実装

#### 目的

特定したギャップを解消する実装を行う。

#### 手順

1. TODO #1: CommunityGraph側の修正
2. TODO #2: 詳細パネル表示ロジックの実装
3. TODO #3: 再試行ボタンの実装
4. TODO #4: selectedクラスの適用

#### 成果物

修正済みコンポーネントファイル群

### Phase 3: 検証

#### 目的

全テストがPASSすることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test community-integration` でテスト実行
2. 全テストがPASSすることを確認
3. TODOコメントを削除

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TODO #1（CommunityGraph修正）が解消されている
- [ ] TODO #2（詳細パネル表示）が解消されている
- [ ] TODO #3（再試行ボタン）が解消されている
- [ ] TODO #4（selectedクラス）が解消されている

### 品質要件

- [ ] community-integration.test.tsxの全テストがPASS
- [ ] 既存の他テストに影響がない
- [ ] TypeScriptコンパイルエラーがない

### ドキュメント要件

- [ ] TODOコメントが全て除去されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果 |
| --- | -------------------------------- | -------- |
| 1   | CommunityGraphレンダリングテスト | PASS     |
| 2   | 詳細パネル表示テスト             | PASS     |
| 3   | 再試行ボタンクリックテスト       | PASS     |
| 4   | selectedクラス適用テスト         | PASS     |

### 検証手順

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test community-integration

# 2. 全テストPASS確認
# Expected: Tests: X passed, X total

# 3. TODOコメント残存確認
grep -n "TODO" apps/desktop/src/renderer/__tests__/community-integration.test.tsx
# Expected: 結果なし
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                             |
| ------------------ | ------ | -------- | -------------------------------- |
| UIの見た目が変わる | 中     | 中       | 変更前後のスクリーンショット比較 |
| 他テストへの影響   | 中     | 低       | 変更後に全テスト実行             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`

### 参考資料

- [React Testing Library 公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし（コードベーススキャンによる発見）

### 補足事項

- このタスクは独立して実行可能であり、他タスクをブロックしない
- 優先度は低いが、テストカバレッジ改善のために将来的に対応が望ましい
