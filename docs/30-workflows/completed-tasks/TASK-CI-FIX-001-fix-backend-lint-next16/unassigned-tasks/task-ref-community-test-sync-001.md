# task-ref-community-test-sync-001: Community統合テストとUI実装の同期修正

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | task-ref-community-test-sync-001      |
| タスク名     | Community統合テストとUI実装の同期修正 |
| カテゴリ     | リファクタリング（ref）               |
| 優先度       | 中（medium）                          |
| 規模         | 小（small）                           |
| ステータス   | 未着手                                |
| 発見元       | コードコメント（TODO）                |
| 発見日       | 2026-01-29                            |
| issue_number | 567                                   |

---

## なぜこのタスクが必要か（Why）

### 背景

`apps/desktop/src/renderer/__tests__/community-integration.test.tsx` に4箇所のTODOコメントが存在し、テストケースがCommunityGraph UIコンポーネントの実装と不一致であることが明示されている。テストは現在スキップまたは不完全な状態で、実際のUIコンポーネントの挙動を検証できていない。

### 問題点

以下の4つのテスト-UI不一致が確認されている:

| 行番号  | TODOコメント                           | 問題内容                           |
| ------- | -------------------------------------- | ---------------------------------- |
| 178行目 | テストがUIコンポーネントの実装と不一致 | CommunityGraph側の修正が必要       |
| 238行目 | テストがUIコンポーネントの実装と不一致 | 詳細パネル表示ロジックの修正が必要 |
| 378行目 | テストがUIコンポーネントの実装と不一致 | 再試行ボタンの実装が必要           |
| 486行目 | テストがUIコンポーネントの実装と不一致 | selectedクラスの適用が必要         |

### 放置した場合の影響

- テストカバレッジの実質的な低下（テストが存在するが実際の検証を行っていない）
- CommunityGraph UIのリグレッションが検出できないリスク
- 新規開発者がテストを参考にした際に誤った実装を行う可能性

---

## 何を達成するか（What）

### 目的

Community統合テスト（community-integration.test.tsx）の4つのTODO箇所を解消し、テストとUI実装を完全に同期させる。

### 最終ゴール

4つのTODO箇所すべてが解消され、テストが実際のCommunityGraph UIコンポーネントの挙動を正しく検証している状態にする。

### スコープ

**含む:**

- community-integration.test.tsx の4つのTODO箇所の修正
- CommunityGraph UIコンポーネントの修正（テストに合わせる場合）
- テストケースの修正（UIに合わせる場合）

**含まない:**

- CommunityGraph UIの新機能追加
- テストフレームワークの変更
- 他のテストファイルの修正

### 成果物

| 成果物名                 | 説明                                               |
| ------------------------ | -------------------------------------------------- |
| 修正済みテストファイル   | community-integration.test.tsx のTODO 4箇所を解消  |
| 修正済みUIコンポーネント | 必要に応じてCommunityGraph関連コンポーネントを修正 |

---

## どのように実行するか（How）

### 前提条件

- CommunityGraph UIコンポーネントの現在の実装を理解していること
- Vitest + React Testing Library の知識
- 開発環境が動作すること（`pnpm install` 完了）

### 依存タスク

- なし（独立して実行可能）

### 必要な知識

- React Testing Library のクエリ手法（getByRole, getByText等）
- CommunityVisualization コンポーネントの構造
- Vitest のテスト記述パターン

### 推奨アプローチ

各TODO箇所について、テストの期待値とUIの実装を比較し、どちらを修正すべきか判断する。UIの設計意図に合わせてテストを修正するのが基本方針。

---

## 実行手順

### Phase 1: 現状調査

**目的**: 各TODOの不一致内容を詳細に把握する

**手順:**

- `community-integration.test.tsx` の4つのTODO箇所を確認
- 対応するCommunityGraph UIコンポーネントの実装を確認
- 各箇所の不一致内容と修正方針を決定

**成果物:** 修正方針リスト（各TODO箇所の対応方針）

**完了条件:** 4箇所すべての修正方針が決定されていること

### Phase 2: テスト-UI同期修正

**目的**: テストとUIの不一致を解消する

**手順:**

- 修正方針に基づき、テストまたはUIコンポーネントを修正
- 各修正後にテストを実行して通過を確認
- TODOコメントを削除

**成果物:** 修正済みテストファイル、修正済みUIコンポーネント

**完了条件:** 4つのTODOがすべて解消され、テストがすべて通過

---

## 完了条件チェックリスト

### 機能要件

- [ ] 178行目のTODO（CommunityGraph修正）が解消されている
- [ ] 238行目のTODO（詳細パネル表示ロジック）が解消されている
- [ ] 378行目のTODO（再試行ボタン実装）が解消されている
- [ ] 486行目のTODO（selectedクラス適用）が解消されている

### 品質要件

- [ ] community-integration.test.tsx の全テストが通過する
- [ ] TypeScript型チェックがエラーなし
- [ ] ESLint警告が増加していない

### ドキュメント要件

- [ ] 修正内容がコミットメッセージに記載されている

---

## 検証方法

### テストケース

| テストケース                | 期待結果                                   | 検証コマンド                                                   |
| --------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Community統合テスト全件通過 | すべてのテストがPASS                       | `pnpm --filter @repo/desktop vitest run community-integration` |
| TODOコメント残存確認        | community-integration.test.tsx にTODOが0件 | `grep -c "TODO" community-integration.test.tsx`                |
| 型チェック                  | エラー0件                                  | `pnpm --filter @repo/desktop typecheck`                        |

### 検証手順

- community-integration.test.tsx の全テストを実行し、通過を確認
- grep で TODOコメントの残存がないことを確認
- CommunityGraph UIを手動で操作し、テストで検証した機能が正しく動作することを確認

---

## リスクと対策

| リスク                                     | 影響度 | 確率 | 対策                                                   |
| ------------------------------------------ | ------ | ---- | ------------------------------------------------------ |
| UIコンポーネント修正が他のテストに影響する | 中     | 低   | 修正前に関連テストの全件実行で影響範囲を確認           |
| テスト修正がUI設計意図と乖離する           | 中     | 中   | CommunityGraphコンポーネントのデザイン仕様を事前に確認 |

---

## 参照情報

| ドキュメント           | パス                                                                             | 用途           |
| ---------------------- | -------------------------------------------------------------------------------- | -------------- |
| テストファイル         | apps/desktop/src/renderer/**tests**/community-integration.test.tsx               | 修正対象       |
| CommunityVisualization | apps/desktop/src/renderer/components/community/templates/CommunityVisualization/ | UI実装参照     |
| technology-backend仕様 | .claude/skills/aiworkflow-requirements/references/technology-backend.md          | Vitest設定参照 |
| technology-devops仕様  | .claude/skills/aiworkflow-requirements/references/technology-devops.md           | テスト環境参照 |

---

## 備考

- 4つのTODOは同一ファイル内に集中しており、一括で対応することが効率的
- CommunityGraph機能はCONV-08系タスクで拡張予定のため、過度な修正は避ける
- 発見元: TASK-CI-FIX-001実行中のコードベーススキャン（Phase 12 未タスク検出）
