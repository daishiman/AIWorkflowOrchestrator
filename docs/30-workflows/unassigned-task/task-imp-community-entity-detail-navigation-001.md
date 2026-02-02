# エンティティ詳細画面ナビゲーション - タスク指示書

## メタ情報

```yaml
issue_number: 651
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-community-entity-detail-navigation-001 |
| タスク名     | エンティティ詳細画面ナビゲーション              |
| 分類         | 改善                                            |
| 対象機能     | CommunityVisualization コンポーネント           |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 12（システム仕様書横断スキャン）          |
| 発見日       | 2026-02-02                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CommunityVisualizationコンポーネント（`apps/desktop/src/renderer/components/community/templates/CommunityVisualization/index.tsx`）にはコミュニティのエンティティ（ノード）をクリックした際のハンドラ `handleEntityClick` が定義されているが、現在は空実装（TODOコメント: CONV-08-06）である。

### 1.2 問題点・課題

- エンティティをクリックしても何も起こらない（ユーザーが操作不能と感じる）
- ナレッジグラフのノード情報を深掘りする手段がUI上に存在しない
- `EntityId` 型が渡されるが、詳細パネルやドリルダウン画面が未実装

### 1.3 放置した場合の影響

- ナレッジグラフの閲覧が俯瞰レベルに留まり、個別エンティティの関連情報・メタデータへのアクセスが不可能
- ユーザーがクリック可能に見えるノードをクリックしても反応がなく、UX品質が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

CommunityVisualization内でエンティティをクリックした際に、エンティティの詳細情報（プロパティ、関連エンティティ、所属コミュニティ等）を表示するパネルまたは画面を実装する。

### 2.2 最終ゴール

- エンティティクリック→詳細パネルが表示される
- 詳細パネルにはエンティティ名、プロパティ一覧、関連エンティティリスト、所属コミュニティが表示される
- 関連エンティティをクリックすることで、さらにそのエンティティの詳細にドリルダウンできる

### 2.3 スコープ

#### 含むもの

- `handleEntityClick` の実装（エンティティ詳細パネルの表示トリガー）
- `EntityDetailPanel` コンポーネントの新規作成
- エンティティ詳細データの取得ロジック（Zustand Store or ローカルデータ）
- ドリルダウンナビゲーション（関連エンティティ→別エンティティ詳細）

#### 含まないもの

- ナレッジグラフの構造変更（既存GraphRAGデータモデルを使用）
- バックエンド/APIの新規追加（既存データ構造から詳細情報を取得）
- エンティティの編集・削除機能

### 2.4 成果物

| 成果物                     | 説明                               |
| -------------------------- | ---------------------------------- |
| EntityDetailPanel.tsx      | エンティティ詳細表示コンポーネント |
| EntityDetailPanel.test.tsx | コンポーネントテスト               |
| CommunityVisualization更新 | handleEntityClick実装              |
| テスト結果レポート         | 全テストPASS確認                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CommunityVisualizationコンポーネントが正常に動作していること
- エンティティデータ（`EntityId`に紐づくプロパティ・関連情報）がStore経由でアクセス可能であること

### 3.2 依存タスク

- task-imp-community-dashboard-handlers-001（コミュニティダッシュボードIPCハンドラ実装）が先行すると望ましい

### 3.3 必要な知識

- React + TypeScript コンポーネント設計
- Zustand ストア操作
- CommunityVisualization の既存アーキテクチャ
- GraphRAG エンティティ/コミュニティデータモデル

### 3.4 推奨アプローチ

1. EntityDetailPanelをSlideOverパネル形式で実装（右サイドパネル）
2. `selectedEntityId` 状態をCommunityVisualization内で管理
3. handleEntityClickでselectedEntityIdを設定→条件レンダリングでパネル表示
4. パネル内で関連エンティティリストを表示し、クリックでドリルダウン

---

## 4. 実行手順

### Phase構成

Phase 1-13のタスク仕様書作成スキルに従って実行。小規模タスクのため、主要フェーズは以下:

### Phase 1-2: 要件定義・設計

#### 目的

EntityDetailPanelのUI設計とデータフロー設計

#### 手順

1. エンティティデータモデルの確認（EntityId → Entity詳細の取得パス）
2. UIワイヤーフレーム設計（右サイドパネル、エンティティ情報表示レイアウト）
3. Zustand状態管理設計（selectedEntityId、パネル開閉状態）

#### 成果物

- 設計ドキュメント（UI構成図、データフロー図）

#### 完了条件

- EntityDetailPanelの表示項目と状態管理方針が確定している

### Phase 4-5: テスト作成・実装

#### 目的

TDD RedでEntityDetailPanelのテストを先に作成し、Greenで実装

#### 手順

1. EntityDetailPanel.test.tsx作成（表示テスト、クリックイベントテスト）
2. EntityDetailPanel.tsx実装
3. handleEntityClick実装
4. CommunityVisualizationとの統合

#### 成果物

- EntityDetailPanel.tsx
- EntityDetailPanel.test.tsx

#### 完了条件

- 全テストがPASS
- エンティティクリック→パネル表示→ドリルダウンが動作

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] エンティティクリックで詳細パネルが表示される
- [ ] パネルにエンティティ名・プロパティ・関連エンティティが表示される
- [ ] 関連エンティティクリックでドリルダウンナビゲーションが動作する
- [ ] パネルの閉じるボタンでパネルが閉じる

### 品質要件

- [ ] TypeScript strict モードでエラーなし
- [ ] ESLint PASS
- [ ] テストカバレッジ 80% 以上

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成（Part 1/Part 2）
- [ ] システム仕様書更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                 | 期待結果                                 |
| --- | ---------------------------- | ---------------------------------------- |
| 1   | エンティティノードをクリック | EntityDetailPanelが表示される            |
| 2   | パネル内のプロパティ表示     | エンティティのプロパティが一覧表示される |
| 3   | 関連エンティティをクリック   | 別エンティティの詳細にドリルダウン       |
| 4   | 閉じるボタンをクリック       | パネルが閉じる                           |
| 5   | 存在しないEntityIdの場合     | エラー表示またはフォールバック           |

### 検証手順

1. CommunityVisualization画面を開く
2. ナレッジグラフ上の任意のエンティティノードをクリック
3. 右サイドパネルにエンティティ詳細が表示されることを確認
4. 関連エンティティリストのアイテムをクリックしてドリルダウンを確認

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                 |
| ------------------------------------------ | ------ | -------- | ---------------------------------------------------- |
| エンティティデータがStoreに存在しない場合  | 中     | 中       | フォールバック表示（「データなし」メッセージ）を実装 |
| 大量の関連エンティティでパフォーマンス低下 | 低     | 低       | 仮想スクロールまたは表示件数制限（20件）を適用       |

---

## 8. 参照情報

### 関連ドキュメント

- システム仕様書: `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- 既存コンポーネント: `apps/desktop/src/renderer/components/community/templates/CommunityVisualization/index.tsx`
- GraphRAG仕様: `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`

### 参考資料

- TODO参照: `CommunityVisualization/index.tsx:139` - `// TODO: CONV-08-06 でエンティティ詳細画面への遷移を実装`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: CONV-08-06 でエンティティ詳細画面への遷移を実装
// この機能は別タスクで対応予定
```

### 補足事項

- CommunityVisualizationは既にCommunityDetailPanelを持っている（コミュニティ単位の詳細表示）。本タスクはそれをエンティティ単位に拡張するもの。
- `selectedCommunity` 状態管理パターンを参考に、`selectedEntity` 状態を追加する設計が自然。
