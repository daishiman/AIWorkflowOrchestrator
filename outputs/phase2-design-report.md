# Phase 2: 設計レポート

## 1. 概要

タスク CONV-08-05（Community Visualization UI）の設計を実施しました。

## 2. 成果物一覧

| 成果物               | 説明                        |
| -------------------- | --------------------------- |
| library-selection.md | ライブラリ選定（dagre選択） |
| component-design.md  | コンポーネント設計          |
| hook-design.md       | カスタムフック設計          |
| ipc-design.md        | IPC通信設計                 |
| wireframe.md         | ワイヤーフレーム            |

## 3. ライブラリ選定

| ライブラリ | 選定理由                                  |
| ---------- | ----------------------------------------- |
| dagre      | 階層グラフレイアウトに特化、軽量、SVG互換 |
| SVG (直接) | テスト容易性、カスタマイズ性              |

**除外したライブラリ**:

- ReactFlow: 高機能だがテスト時のモック複雑化
- D3.js: 低レベルAPI、学習コスト高

## 4. コンポーネント設計

### 4.1 コンポーネント一覧

| コンポーネント         | レイヤー | 責務                 |
| ---------------------- | -------- | -------------------- |
| CommunityGraph         | Organism | グラフ可視化         |
| CommunityDetailPanel   | Organism | 詳細情報表示         |
| CommunityFilter        | Organism | フィルタリング・検索 |
| CommunityVisualization | Template | レイアウト統合       |

### 4.2 アーキテクチャ

```
CommunityVisualization (Template)
├── CommunityFilter (Organism)
├── CommunityGraph (Organism)
└── CommunityDetailPanel (Organism)
```

## 5. フック設計

### 5.1 useCommunities

```typescript
interface UseCommunityOptions {
  level?: number;
}

interface UseCommunityResult {
  communities: readonly Community[];
  isLoading: boolean;
  error: Error | null;
  availableLevels: readonly number[];
  refetch: () => Promise<void>;
}
```

**機能**:

- コミュニティ一覧の取得
- レベルフィルタリング
- エラーハンドリング
- 再取得機能

## 6. IPC設計

### 6.1 チャンネル

| チャンネル           | 説明               |
| -------------------- | ------------------ |
| community:getAll     | 全コミュニティ取得 |
| community:getByLevel | レベル別取得       |
| community:getSummary | 要約取得           |
| community:getMembers | メンバー取得       |
| community:search     | 検索               |

### 6.2 レスポンス形式

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

## 7. ワイヤーフレーム

### 7.1 レイアウト構成

```
┌─────────────────────────────────────────────┐
│ フィルターバー                               │
│ [レベル選択 ▼] [検索 🔍____________]         │
├────────────────────────────────┬────────────┤
│                                │            │
│     グラフエリア                │  詳細      │
│     (SVG)                      │  パネル    │
│                                │            │
│                                │            │
└────────────────────────────────┴────────────┘
```

## 8. まとめ

Phase 2 の設計が完了しました。dagre + SVG によるグラフ可視化、Atomic Design に基づくコンポーネント構成、IPC API 設計を策定しました。
