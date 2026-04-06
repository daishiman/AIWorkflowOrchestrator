# community-integration テスト TODO コメント解消 - タスク指示書

## メタ情報

```yaml
issue_number: 1943
task_id: TASK-IMP-COMMUNITY-IT-TODO-001
task_name: community-integration テスト TODO コメント解消
category: テスト品質改善
target_feature: Community Visualization 統合テスト
priority: medium
scale: 小規模
status: 未実施
source: TODOコメント解消パック
created_date: 2026-04-06
dependencies: []
```

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-IMP-COMMUNITY-IT-TODO-001                 |
| タスク名     | community-integration テスト TODO コメント解消 |
| 分類         | テスト品質改善                                 |
| 対象機能     | Community Visualization 統合テスト             |
| 優先度       | 中                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | TODOコメント解消パック                         |
| 発見日       | 2026-04-06                                     |
| 依存タスク   | なし                                           |

---

## 1. Why

### 1.1 背景

`apps/desktop/src/renderer/__tests__/community-integration.test.tsx` には現在4件の `it.skip` + TODOコメントが残存している。これらはいずれも「UIコンポーネントの実装と不一致」または「実装が未完了」という理由で一時的にスキップされたテストである。

スキップされたテストはテストスイートの実行結果に含まれず、コードカバレッジにも計上されない。そのため、これらが示す機能（ノードクリック→詳細パネル表示、再試行ボタン、選択状態同期）の動作保証が失われている。

### 1.2 問題点・課題

スキップされている4件のテストと、その理由として記されたTODOコメントは以下のとおり：

1. **`IPC経由でコミュニティ詳細が取得できる`**（行 179）
   - TODO: テストがUIコンポーネントの実装と不一致 - CommunityGraph側の修正が必要
   - ノードクリック時に `getById` / `getSummary` / `getMembers` が呼ばれることを検証するテスト

2. **`コミュニティ選択→詳細パネル表示のフローが動作する`**（行 239）
   - TODO: テストがUIコンポーネントの実装と不一致 - 詳細パネル表示ロジックの修正が必要
   - ノードクリック→詳細パネルが表示されるフローを検証するテスト

3. **`リトライ機能が動作する`**（行 379）
   - TODO: テストがUIコンポーネントの実装と不一致 - 再試行ボタンの実装が必要
   - エラー時に「再試行」ボタンが表示され、クリックでリトライできることを検証するテスト

4. **`選択状態がグラフと詳細パネルで同期される`**（行 487）
   - TODO: テストがUIコンポーネントの実装と不一致 - selectedクラスの適用が必要
   - ノード選択でグラフノードに `selected` クラスが付与され、詳細パネルと同期されることを検証するテスト

### 1.3 放置した場合の影響

- コミュニティ可視化機能の中核インタラクション（ノード選択→詳細パネル、再試行）がテストで保護されない状態が継続する
- UIコンポーネントのリファクタリング時にリグレッションを検知できない
- TODO コメントが溜まり続け、技術的負債の視認性が低下する

---

## 2. What

### 2.1 達成目標

- スキップされている4件のテストを `it.skip` から `it` へ戻し、全て PASS させる
- 必要に応じて `CommunityVisualization` および関連コンポーネントの実装を修正し、テストの期待値と一致させる
- TODOコメントを全件削除する

### 2.2 最終ゴール

1. `community-integration.test.tsx` の `it.skip` が 0 件になる
2. 復活させた4件のテストが全て PASS する
3. 既存の PASS しているテストがリグレッションしない
4. `pnpm --filter @repo/desktop test community-integration` が全件 PASS する

### 2.3 スコープ

#### 含むもの

- `community-integration.test.tsx` の4件の `it.skip` 解消
- テストが要求するUIコンポーネントの実装修正（詳細パネル表示、再試行ボタン、selected クラス付与）
- `CommunityVisualization` および `CommunityGraph` コンポーネントの該当機能実装

#### 含まないもの

- 新規テストケースの追加
- パフォーマンス最適化
- Community 機能の新規フィーチャー追加

---

## 3. How

### 3.1 調査フェーズ

1. `CommunityVisualization` コンポーネントの現在の実装を確認する
   - `apps/desktop/src/renderer/components/community/templates/CommunityVisualization.tsx`
2. `CommunityGraph` コンポーネントのノードクリックイベントハンドラを確認する
3. 詳細パネル（`role="complementary"` / `name=/コミュニティ詳細/i`）の実装有無を確認する
4. 再試行ボタン（`role="button"` / `name=/再試行/i`）の実装有無を確認する
5. ノードの `selected` / `highlighted` クラスの付与ロジックを確認する

### 3.2 実装フェーズ

各TODO項目に対して必要な実装を行う：

**TODO 1 / TODO 2: ノードクリック→詳細表示**

- `CommunityGraph` のノードクリック時に `onSelectCommunity(communityId)` を呼び出すコールバックが正しく動作することを確認・修正する
- `CommunityVisualization` で `selectedCommunityId` を状態として保持し、クリック時に `getById` / `getSummary` / `getMembers` を呼び出す
- 詳細パネルを `<aside aria-label="コミュニティ詳細">` として実装し、選択時に表示する

**TODO 3: 再試行ボタン**

- エラー表示（`role="alert"`）内に「再試行」ボタンを追加する
- ボタンクリックで `getAll` を再呼び出しする

**TODO 4: 選択状態クラス**

- ノードの `data-testid="community-node-{id}"` 要素に、選択時は `selected` クラスを付与する
- 検索結果ハイライト時は `highlighted` クラスを付与する

### 3.3 検証フェーズ

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test community-integration

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 4. 苦戦箇所と知見（重要）

### 苦戦箇所 1: モックの境界設計

統合テストは `electronAPI` グローバルをモックし、実際のIPCを経由せずにコンポーネントのデータフローを検証している。問題は「どこまでをモックにし、どこまでを実コンポーネントに任せるか」の境界設計にある。

TODOコメントが示す「UIコンポーネントの実装と不一致」は、テストが期待する `role` 属性・`aria-label` 属性・CSS クラス名が、実際のコンポーネント実装と食い違っていることを意味する。テスト修正だけでなく、コンポーネント側のアクセシビリティ属性を整備する必要がある。

**対策**: まずコンポーネントの現行実装を読み、テストの期待値（`role`, `aria-label`, CSS クラス, `data-testid`）と照合する。どちらを「正」とするかはプロダクト要件に基づいて判断し、原則としてテストをアクセシビリティ仕様の正本とする。

### 苦戦箇所 2: ノードクリックイベントのテスト困難性

`CommunityGraph` が SVG や Canvas ベースのレンダリングを行っている場合、`userEvent.click()` でノードをクリックしても `data-testid` が DOM に存在しないケースがある。SVG や Canvas 要素に `data-testid` を付与するには、実装側での対応が必要になる。

**対策**: ノード要素が `<div>` や `<button>` ではなく `<g>` (SVG group) の場合も `data-testid` を付与できるが、`userEvent.click()` の動作確認が必要。テスト環境で `fireEvent.click()` に切り替えることが有効な場合もある。

### 苦戦箇所 3: 詳細パネルの表示タイミング

詳細パネルはノードクリック後に非同期で IPC 呼び出し（`getById` / `getSummary` / `getMembers`）を行い、全て完了してから表示される設計になっている。`waitFor` のタイムアウト設定とモックの解決タイミングに注意が必要。

**対策**: `beforeEach` でモックを `mockResolvedValue`（即時解決）に設定しておき、`waitFor` のデフォルトタイムアウト（1000ms）以内に表示が完了することを確認する。

### 苦戦箇所 4: 選択状態 CSS クラスの検証

`expect(node).toHaveClass("selected")` は、レンダリングエンジン（Tailwind / CSS Modules / styled-components）によっては実際のクラス名が異なる場合がある。Tailwind を使用している場合、`selected` という単純なクラス名ではなく `data-selected` 属性や条件付きクラス（`bg-blue-500` 等）で状態を表現しているケースが多い。

**対策**: テストとコンポーネント実装を同期させる際、「`selected` クラスを使う」という設計を明示的に合意し、Tailwind + `clsx` で `selected: true` 条件を記述する実装パターンを採用する。

---

## 5. 依存関係

### 上流（このタスクが依存するもの）

なし（独立して実施可能）

### 下流（このタスクの完了を待つもの）

なし（統合テストの品質改善であり、機能追加を伴わない）

### 参照ドキュメント

| ドキュメント                          | パス                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| 統合テストファイル                    | `apps/desktop/src/renderer/__tests__/community-integration.test.tsx`                  |
| CommunityVisualization コンポーネント | `apps/desktop/src/renderer/components/community/templates/CommunityVisualization.tsx` |
