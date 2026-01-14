# コンポーネント設計書 - Phase 2成果物

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. コンポーネント階層図

```
apps/desktop/src/renderer/components/community/
├── atoms/
│   ├── CommunityEdge/              # エッジコンポーネント
│   │   └── index.tsx
│   ├── LevelBadge/                 # レベル表示バッジ
│   │   └── index.tsx
│   ├── SentimentIcon/              # センチメントアイコン
│   │   └── index.tsx
│   └── ZoomButton/                 # ズームボタン
│       └── index.tsx
├── molecules/
│   ├── CommunityNode/              # ノードコンポーネント
│   │   └── index.tsx
│   ├── LevelSelector/              # レベル選択ドロップダウン
│   │   └── index.tsx
│   ├── SearchInput/                # 検索入力フィールド
│   │   └── index.tsx
│   ├── SummarySection/             # 要約セクション
│   │   └── index.tsx
│   ├── MemberList/                 # メンバーリスト
│   │   └── index.tsx
│   ├── KeywordList/                # キーワードリスト
│   │   └── index.tsx
│   └── ZoomControls/               # ズームコントロール群
│       └── index.tsx
├── organisms/
│   ├── CommunityGraph/             # グラフ表示
│   │   └── index.tsx
│   ├── CommunityDetailPanel/       # 詳細パネル
│   │   └── index.tsx
│   └── CommunityFilter/            # フィルターコントロール
│       └── index.tsx
└── templates/
    └── CommunityVisualization/     # 統合ビュー
        └── index.tsx
```

---

## 2. コンポーネント詳細定義

### 2.1 Atoms

#### CommunityEdge

```typescript
// atoms/CommunityEdge/index.tsx

import type { EdgeProps } from "@xyflow/react";

export interface CommunityEdgeProps extends EdgeProps {
  /** エッジの強調表示 */
  highlighted?: boolean;
}

/**
 * コミュニティ間の親子関係を表すエッジ
 * - 親コミュニティから子コミュニティへの有向エッジ
 * - ハイライト時は色を変更
 */
export const CommunityEdge: React.FC<CommunityEdgeProps>;
```

#### LevelBadge

```typescript
// atoms/LevelBadge/index.tsx

export interface LevelBadgeProps {
  /** 階層レベル（0が最下層） */
  level: number;
  /** サイズバリアント */
  size?: "sm" | "md" | "lg";
}

/**
 * 階層レベルを表示するバッジ
 * - レベルに応じた色分け
 * - アクセシブルなラベル付き
 */
export const LevelBadge: React.FC<LevelBadgeProps>;
```

#### SentimentIcon

```typescript
// atoms/SentimentIcon/index.tsx

export interface SentimentIconProps {
  /** センチメント値 */
  sentiment: "positive" | "negative" | "neutral";
  /** アイコンサイズ */
  size?: number;
}

/**
 * センチメントを視覚的に表現するアイコン
 * - positive: 緑色 + 上向き矢印
 * - negative: 赤色 + 下向き矢印
 * - neutral: グレー + 横線
 */
export const SentimentIcon: React.FC<SentimentIconProps>;
```

#### ZoomButton

```typescript
// atoms/ZoomButton/index.tsx

export interface ZoomButtonProps {
  /** ボタンタイプ */
  type: "in" | "out" | "fit" | "reset";
  /** クリックハンドラ */
  onClick: () => void;
  /** 無効状態 */
  disabled?: boolean;
  /** アクセシブルラベル */
  "aria-label": string;
}

/**
 * ズーム操作用の個別ボタン
 */
export const ZoomButton: React.FC<ZoomButtonProps>;
```

---

### 2.2 Molecules

#### CommunityNode

```typescript
// molecules/CommunityNode/index.tsx

import type { NodeProps } from "@xyflow/react";
import type { Community } from "@repo/shared";

export interface CommunityNodeData {
  /** コミュニティデータ */
  community: Community;
  /** 選択状態 */
  isSelected: boolean;
  /** 検索ハイライト状態 */
  isHighlighted: boolean;
}

export interface CommunityNodeProps extends NodeProps<CommunityNodeData> {}

/**
 * コミュニティを表すノードコンポーネント
 * - 円形表示、サイズはcommunity.sizeに比例
 * - 選択時はボーダー強調
 * - ハイライト時は背景色変更
 */
export const CommunityNode: React.FC<CommunityNodeProps>;
```

#### LevelSelector

```typescript
// molecules/LevelSelector/index.tsx

export interface LevelSelectorProps {
  /** 選択可能なレベル一覧 */
  availableLevels: number[];
  /** 現在の選択値（nullで「全て」） */
  selectedLevel: number | null;
  /** 選択変更ハンドラ */
  onLevelChange: (level: number | null) => void;
  /** 無効状態 */
  disabled?: boolean;
}

/**
 * 階層レベルを選択するドロップダウン
 * - 「全て」オプションを先頭に配置
 * - 各レベルにバッジを表示
 */
export const LevelSelector: React.FC<LevelSelectorProps>;
```

#### SearchInput

```typescript
// molecules/SearchInput/index.tsx

export interface SearchInputProps {
  /** 現在の検索値 */
  value: string;
  /** 値変更ハンドラ */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 検索中状態 */
  isSearching?: boolean;
  /** クリアハンドラ */
  onClear: () => void;
}

/**
 * コミュニティ検索入力フィールド
 * - 検索アイコン付き
 * - クリアボタン
 * - ローディングインジケーター
 */
export const SearchInput: React.FC<SearchInputProps>;
```

#### SummarySection

```typescript
// molecules/SummarySection/index.tsx

import type { CommunitySummary } from "@repo/shared";

export interface SummarySectionProps {
  /** 要約データ */
  summary: CommunitySummary | null;
  /** ローディング状態 */
  isLoading: boolean;
}

/**
 * コミュニティ要約を表示するセクション
 * - 要約文
 * - 信頼度バー
 * - センチメント表示
 */
export const SummarySection: React.FC<SummarySectionProps>;
```

#### MemberList

```typescript
// molecules/MemberList/index.tsx

import type { StoredEntity } from "@repo/shared";

export interface MemberListProps {
  /** メンバーエンティティ一覧 */
  members: StoredEntity[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エンティティクリックハンドラ */
  onEntityClick?: (entityId: string) => void;
}

/**
 * コミュニティメンバーを表示するリスト
 * - エンティティ名とタイプを表示
 * - スクロール可能
 * - 件数表示
 */
export const MemberList: React.FC<MemberListProps>;
```

#### KeywordList

```typescript
// molecules/KeywordList/index.tsx

export interface KeywordListProps {
  /** キーワード一覧 */
  keywords: string[];
  /** クリックハンドラ */
  onKeywordClick?: (keyword: string) => void;
}

/**
 * キーワードをバッジ形式で表示
 * - クリックで検索トリガー
 */
export const KeywordList: React.FC<KeywordListProps>;
```

#### ZoomControls

```typescript
// molecules/ZoomControls/index.tsx

export interface ZoomControlsProps {
  /** ズームイン */
  onZoomIn: () => void;
  /** ズームアウト */
  onZoomOut: () => void;
  /** フィット表示 */
  onFitView: () => void;
  /** リセット */
  onReset: () => void;
  /** 現在のズーム倍率 */
  currentZoom: number;
  /** ズーム範囲 */
  zoomRange?: { min: number; max: number };
}

/**
 * ズーム操作コントロール群
 * - ズームイン/アウトボタン
 * - フィットボタン
 * - リセットボタン
 */
export const ZoomControls: React.FC<ZoomControlsProps>;
```

---

### 2.3 Organisms

#### CommunityGraph

```typescript
// organisms/CommunityGraph/index.tsx

import type { Community, CommunityId } from "@repo/shared";

export interface CommunityGraphProps {
  /** コミュニティ一覧 */
  communities: Community[];
  /** 選択中のコミュニティID */
  selectedCommunityId: CommunityId | null;
  /** 検索ハイライト対象ID一覧 */
  highlightedIds: CommunityId[];
  /** コミュニティ選択ハンドラ */
  onSelect: (communityId: CommunityId | null) => void;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
}

/**
 * コミュニティ構造をグラフ表示
 * - react-flowベース
 * - dagreレイアウト
 * - ズーム・パン操作
 */
export const CommunityGraph: React.FC<CommunityGraphProps>;
```

#### CommunityDetailPanel

```typescript
// organisms/CommunityDetailPanel/index.tsx

import type { Community, CommunitySummary, StoredEntity } from "@repo/shared";

export interface CommunityDetailPanelProps {
  /** コミュニティデータ */
  community: Community | null;
  /** 要約データ */
  summary: CommunitySummary | null;
  /** メンバーエンティティ */
  members: StoredEntity[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
  /** 閉じるハンドラ */
  onClose: () => void;
}

/**
 * 選択コミュニティの詳細表示パネル
 * - 要約セクション
 * - キーワードリスト
 * - メンバーリスト
 */
export const CommunityDetailPanel: React.FC<CommunityDetailPanelProps>;
```

#### CommunityFilter

```typescript
// organisms/CommunityFilter/index.tsx

export interface CommunityFilterProps {
  /** 選択可能なレベル一覧 */
  availableLevels: number[];
  /** 現在の選択レベル */
  selectedLevel: number | null;
  /** レベル変更ハンドラ */
  onLevelChange: (level: number | null) => void;
  /** 検索値 */
  searchQuery: string;
  /** 検索変更ハンドラ */
  onSearchChange: (query: string) => void;
  /** 検索中状態 */
  isSearching: boolean;
}

/**
 * フィルタリングコントロール群
 * - レベル選択
 * - 検索入力
 */
export const CommunityFilter: React.FC<CommunityFilterProps>;
```

---

### 2.4 Templates

#### CommunityVisualization

```typescript
// templates/CommunityVisualization/index.tsx

export interface CommunityVisualizationProps {
  /** 初期選択コミュニティID */
  initialSelectedId?: string;
}

/**
 * コミュニティ可視化の統合ビュー
 * - CommunityFilter
 * - CommunityGraph
 * - CommunityDetailPanel
 * を統合し、状態を管理
 */
export const CommunityVisualization: React.FC<CommunityVisualizationProps>;
```

---

## 3. 状態管理設計

### 3.1 ローカル状態（useState）

| 状態                    | 型                  | 管理場所               |
| ----------------------- | ------------------- | ---------------------- |
| selectedCommunityId     | `CommunityId｜null` | CommunityVisualization |
| selectedLevel           | `number｜null`      | CommunityVisualization |
| searchQuery             | `string`            | CommunityVisualization |
| highlightedCommunityIds | `CommunityId[]`     | CommunityVisualization |

### 3.2 派生状態（useMemo）

| 状態                | 派生元                      |
| ------------------- | --------------------------- |
| filteredCommunities | communities + selectedLevel |
| graphNodes          | filteredCommunities         |
| graphEdges          | filteredCommunities         |
| availableLevels     | communities                 |

---

## 4. イベントフロー

### 4.1 コミュニティ選択フロー

```
User clicks CommunityNode
    ↓
CommunityGraph.onSelect(communityId)
    ↓
CommunityVisualization.setSelectedCommunityId(communityId)
    ↓
useCommunityDetail(communityId) triggered
    ↓
CommunityDetailPanel receives data
```

### 4.2 フィルタリングフロー

```
User selects level in LevelSelector
    ↓
CommunityFilter.onLevelChange(level)
    ↓
CommunityVisualization.setSelectedLevel(level)
    ↓
useCommunities({ level }) triggered
    ↓
CommunityGraph receives filtered communities
```

### 4.3 検索フロー

```
User types in SearchInput (debounced 300ms)
    ↓
CommunityFilter.onSearchChange(query)
    ↓
useCommunitySearch.search(query)
    ↓
Results → highlightedCommunityIds updated
    ↓
CommunityGraph highlights matching nodes
```

---

## 5. 既存コンポーネント活用

### 5.1 再利用するAtoms

| 既存コンポーネント | 用途                    |
| ------------------ | ----------------------- |
| `Badge`            | LevelBadge, KeywordList |
| `Button`           | ZoomButton              |
| `Input`            | SearchInput             |
| `Spinner`          | ローディング表示        |
| `EmptyState`       | コミュニティ0件時       |
| `ErrorDisplay`     | エラー表示              |
| `Icon`             | 各種アイコン            |

### 5.2 スタイリング方針

- Tailwind CSSを使用
- デザイントークン（colors, spacing）を活用
- 既存コンポーネントのスタイルパターンを踏襲

---

## 確認完了

- [x] Atomic Designに従った階層設計
- [x] 全コンポーネントのインターフェース定義
- [x] 状態管理設計
- [x] イベントフロー定義
- [x] 既存コンポーネントとの整合性確認
