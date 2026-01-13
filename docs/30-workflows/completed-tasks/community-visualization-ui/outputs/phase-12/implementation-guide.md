# Community Visualization UI 実装ガイド

> タスクID: CONV-08-05
> 作成日: 2026-01-13

---

## Part 1: 概念的な説明

### コミュニティ構造可視化とは

#### 比喩で理解する

コミュニティ構造は「地図」のようなものです。

- **エンティティ**（人物、概念など）は「建物」
- **コミュニティ**は「地区」や「街区」
- **階層レベル**は「区 > 町 > 丁目」のような行政区分

例えば、ある会社のナレッジベースを考えてみましょう：

```
Level 2（大分類）
├── 「技術部門」コミュニティ
│   ├── Level 1（中分類）
│   │   ├── 「フロントエンド」コミュニティ
│   │   │   └── Level 0（小分類）
│   │   │       ├── React関連エンティティ
│   │   │       └── TypeScript関連エンティティ
│   │   └── 「バックエンド」コミュニティ
└── 「営業部門」コミュニティ
    └── ...
```

#### なぜ可視化が必要か

データベースに保存されているコミュニティ情報は数値とIDの羅列です。これを人間が理解するには、視覚的な表現に変換する必要があります。

グラフ表示により：

- どのエンティティがどのコミュニティに属しているか
- コミュニティ間の親子関係
- 階層構造（どれくらいの粒度でグルーピングされているか）

が一目で分かるようになります。

#### ユーザーが達成できること

| 目的                   | 機能                         |
| ---------------------- | ---------------------------- |
| 全体像の把握           | グラフ全体表示、ズームアウト |
| 特定コミュニティの探索 | レベルフィルター、検索       |
| 詳細情報の確認         | ノード選択 → 詳細パネル表示  |
| 関連性の理解           | 親子関係のエッジ、ハイライト |

---

## Part 2: 技術的な詳細

### 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │       CommunityVisualization (統合ビュー)        │    │
│  │  ├── CommunityFilter                            │    │
│  │  ├── CommunityGraph (SVG + dagre)               │    │
│  │  └── CommunityDetailPanel                       │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
│               useCommunities (Hook)                      │
│                         │ IPC                            │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                     Main Process                         │
│                         │                                │
│         communityHandlers ← → CommunityRepository        │
│                         │                                │
│                   SQLite Database                        │
└─────────────────────────────────────────────────────────┘
```

### コンポーネント設計

#### なぜこの設計にしたか

1. **責務分離**: 各コンポーネントが単一の責務を持つ
   - `CommunityGraph`: グラフ描画のみ
   - `CommunityDetailPanel`: 詳細情報表示のみ
   - `CommunityFilter`: フィルタリングロジックのみ
   - `CommunityVisualization`: 全体の統合・状態管理

2. **SVGベースのグラフ描画を選んだ理由**:
   - 軽量でシンプルな実装
   - カスタマイズ性が高い
   - TypeScript完全対応
   - dagreによる階層レイアウトアルゴリズム対応

3. **Atomic Design原則の適用**:
   - Organisms: 独立した機能を持つコンポーネント群
   - Templates: ページレイアウトの定義
   - Hooks: 状態管理とIPCの抽象化

### コンポーネント一覧

| コンポーネント         | 種別     | ファイル                                   |
| ---------------------- | -------- | ------------------------------------------ |
| useCommunities         | Hook     | `renderer/hooks/useCommunities.ts`         |
| CommunityGraph         | Organism | `renderer/components/community/organisms/` |
| CommunityDetailPanel   | Organism | `renderer/components/community/organisms/` |
| CommunityFilter        | Organism | `renderer/components/community/organisms/` |
| CommunityVisualization | Template | `renderer/components/community/templates/` |

### IPC API

```typescript
interface CommunityAPI {
  getAll(): Promise<Result<Community[]>>;
  getByLevel(level: number): Promise<Result<Community[]>>;
  getSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary | null>>;
  getMembers(communityId: CommunityId): Promise<Result<StoredEntity[]>>;
  search(query: string): Promise<Result<Community[]>>;
}
```

### データフロー

```
1. ユーザーがページにアクセス
   ↓
2. useCommunities Hookがマウント時にgetAll()を呼び出し
   ↓
3. IPCを通じてMain Processへリクエスト
   ↓
4. communityHandlersがCommunityRepositoryにアクセス
   ↓
5. SQLiteからコミュニティデータを取得
   ↓
6. Result型でRenderer Processへ返却
   ↓
7. CommunityVisualizationが状態を更新
   ↓
8. CommunityGraphがdagreレイアウトを計算・描画
```

### 状態管理

```typescript
// useCommunities Hookの状態
interface UseCommunityResult {
  communities: readonly Community[]; // コミュニティ一覧
  isLoading: boolean; // ローディング中フラグ
  error: Error | null; // エラー情報
  availableLevels: readonly number[]; // 利用可能なレベル一覧
  refetch: () => Promise<void>; // 再取得関数
}

// CommunityVisualizationの内部状態
interface VisualizationState {
  selectedCommunityId: CommunityId | null; // 選択中のコミュニティ
  levelFilter: number | null; // レベルフィルター
  searchQuery: string; // 検索クエリ
}
```

### 用語集

| 用語       | 読み方         | 意味                                          |
| ---------- | -------------- | --------------------------------------------- |
| Community  | コミュニティ   | 意味的に関連するエンティティの集まり          |
| Level      | レベル         | 階層の深さ（0が最下層、数字が大きいほど上位） |
| Entity     | エンティティ   | ナレッジグラフの頂点（人物、概念など）        |
| Modularity | モジュラリティ | クラスタリングの品質指標（0〜1）              |
| dagre      | ダグレ         | 階層グラフレイアウトアルゴリズム              |
| IPC        | アイピーシー   | Inter-Process Communication（プロセス間通信） |

### テスト戦略

| カテゴリ         | テスト内容                               | 件数 |
| ---------------- | ---------------------------------------- | ---- |
| ユニットテスト   | Hook・コンポーネントの単体動作           | 145  |
| アクセシビリティ | キーボード操作、aria属性、フォーカス管理 | 20   |
| エッジケース     | 空データ、大量データ、エラー状態         | 30   |
| パフォーマンス   | 100+コミュニティでの描画時間             | 5    |

### 既知の制限事項

1. **グラフ表示**: ReactFlowではなくSVGベースで実装
2. **データソース**: IPCを通じた実データ取得（モックも対応可）
3. **ビルド**: Rendererビルドに`@repo/shared`モジュール解決の既存問題あり

### 今後の拡張ポイント

| 機能                                 | タスクID   | 優先度 |
| ------------------------------------ | ---------- | ------ |
| エンティティ詳細画面への遷移         | CONV-08-06 | 高     |
| セマンティック検索                   | 未採番     | 中     |
| エッジの重み表示                     | 未採番     | 低     |
| キーボードショートカットカスタマイズ | 未採番     | 低     |

---

## 関連ドキュメント

| ドキュメント       | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| タスク仕様書       | `docs/30-workflows/community-visualization-ui/`                         |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                                   |
| テスト結果         | `outputs/phase-7/coverage-report.md`                                    |
| 最終レビュー       | `outputs/phase-10/final-review.md`                                      |
| UI/UXガイドライン  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` |
