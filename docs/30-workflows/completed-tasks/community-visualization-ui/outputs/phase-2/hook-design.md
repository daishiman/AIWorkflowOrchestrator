# Hook設計書 - Phase 2成果物

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. カスタムHook一覧

| Hook名             | 用途                 | IPC依存 |
| ------------------ | -------------------- | ------- |
| useCommunities     | コミュニティ一覧取得 | あり    |
| useCommunityDetail | コミュニティ詳細取得 | あり    |
| useCommunitySearch | コミュニティ検索     | あり    |
| useCommunityGraph  | グラフデータ変換     | なし    |

---

## 2. Hook詳細定義

### 2.1 useCommunities

````typescript
// hooks/useCommunities.ts

import type { Community, CommunityId } from "@repo/shared";

/**
 * クエリオプション
 */
export interface CommunityQueryOptions {
  /** 特定レベルのみ取得 */
  level?: number;
  /** 親コミュニティIDでフィルタ */
  parentId?: CommunityId;
}

/**
 * 戻り値の型
 */
export interface UseCommunities {
  /** コミュニティ一覧 */
  communities: Community[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
  /** 再取得関数 */
  refetch: () => Promise<void>;
  /** 利用可能なレベル一覧（派生データ） */
  availableLevels: number[];
}

/**
 * コミュニティ一覧を取得するHook
 *
 * @example
 * ```tsx
 * const { communities, isLoading, error, refetch } = useCommunities();
 *
 * // レベル指定
 * const { communities } = useCommunities({ level: 0 });
 * ```
 */
export function useCommunities(options?: CommunityQueryOptions): UseCommunities;
````

**実装詳細**:

```typescript
export function useCommunities(
  options?: CommunityQueryOptions,
): UseCommunities {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        options?.level !== undefined
          ? await window.electronAPI.community.getByLevel(options.level)
          : await window.electronAPI.community.getAll();

      if (result.ok) {
        setCommunities(result.value);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [options?.level]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const availableLevels = useMemo(() => {
    const levels = new Set(communities.map((c) => c.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [communities]);

  return {
    communities,
    isLoading,
    error,
    refetch: fetchCommunities,
    availableLevels,
  };
}
```

---

### 2.2 useCommunityDetail

````typescript
// hooks/useCommunityDetail.ts

import type {
  Community,
  CommunityId,
  CommunitySummary,
  StoredEntity,
} from "@repo/shared";

/**
 * 戻り値の型
 */
export interface UseCommunityDetail {
  /** コミュニティ基本データ */
  community: Community | null;
  /** 要約データ */
  summary: CommunitySummary | null;
  /** メンバーエンティティ */
  members: StoredEntity[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
}

/**
 * コミュニティ詳細を取得するHook
 *
 * @param communityId - 取得対象のコミュニティID（nullで何も取得しない）
 *
 * @example
 * ```tsx
 * const { community, summary, members, isLoading } =
 *   useCommunityDetail(selectedCommunityId);
 * ```
 */
export function useCommunityDetail(
  communityId: CommunityId | null,
): UseCommunityDetail;
````

**実装詳細**:

```typescript
export function useCommunityDetail(
  communityId: CommunityId | null,
): UseCommunityDetail {
  const [community, setCommunity] = useState<Community | null>(null);
  const [summary, setSummary] = useState<CommunitySummary | null>(null);
  const [members, setMembers] = useState<StoredEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!communityId) {
      setCommunity(null);
      setSummary(null);
      setMembers([]);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 並列取得
        const [communityResult, summaryResult, membersResult] =
          await Promise.all([
            window.electronAPI.community.getById(communityId),
            window.electronAPI.community.getSummary(communityId),
            window.electronAPI.community.getMembers(communityId),
          ]);

        if (communityResult.ok) {
          setCommunity(communityResult.value);
        } else {
          throw communityResult.error;
        }

        if (summaryResult.ok) {
          setSummary(summaryResult.value);
        }

        if (membersResult.ok) {
          setMembers(membersResult.value);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [communityId]);

  return {
    community,
    summary,
    members,
    isLoading,
    error,
  };
}
```

---

### 2.3 useCommunitySearch

````typescript
// hooks/useCommunitySearch.ts

import type { Community, CommunityId } from "@repo/shared";

/**
 * 検索オプション
 */
export interface SearchOptions {
  /** 最大結果数 */
  limit?: number;
  /** 特定レベルのみ検索 */
  level?: number;
}

/**
 * 戻り値の型
 */
export interface UseCommunitySearch {
  /** 検索実行関数 */
  search: (query: string) => void;
  /** 検索クエリ */
  query: string;
  /** 検索結果 */
  results: Community[];
  /** ハイライト対象ID */
  highlightedIds: CommunityId[];
  /** 検索中状態 */
  isSearching: boolean;
  /** 検索クリア */
  clear: () => void;
}

/**
 * コミュニティ検索Hook
 * - 300msのデバウンス処理
 * - 検索結果のハイライト用ID抽出
 *
 * @example
 * ```tsx
 * const { search, results, highlightedIds, isSearching, clear } =
 *   useCommunitySearch({ limit: 10 });
 *
 * // 入力時
 * search("キーワード");
 *
 * // クリア時
 * clear();
 * ```
 */
export function useCommunitySearch(options?: SearchOptions): UseCommunitySearch;
````

**実装詳細**:

```typescript
const DEBOUNCE_MS = 300;

export function useCommunitySearch(
  options?: SearchOptions,
): UseCommunitySearch {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      // デバウンス
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const result = await window.electronAPI.community.search(
            searchQuery,
            options,
          );

          if (result.ok) {
            setResults(result.value);
          }
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [options],
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const highlightedIds = useMemo(() => results.map((c) => c.id), [results]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    search,
    query,
    results,
    highlightedIds,
    isSearching,
    clear,
  };
}
```

---

### 2.4 useCommunityGraph

````typescript
// hooks/useCommunityGraph.ts

import type { Node, Edge } from "@xyflow/react";
import type { Community, CommunityId } from "@repo/shared";
import type { CommunityNodeData } from "../molecules/CommunityNode";

/**
 * グラフ変換オプション
 */
export interface GraphOptions {
  /** 選択中のコミュニティID */
  selectedId: CommunityId | null;
  /** ハイライト対象ID */
  highlightedIds: CommunityId[];
}

/**
 * 戻り値の型
 */
export interface UseCommunityGraph {
  /** グラフノード */
  nodes: Node<CommunityNodeData>[];
  /** グラフエッジ */
  edges: Edge[];
}

/**
 * コミュニティデータをreact-flow用に変換するHook
 *
 * @example
 * ```tsx
 * const { nodes, edges } = useCommunityGraph(communities, {
 *   selectedId: selectedCommunityId,
 *   highlightedIds: searchHighlightIds,
 * });
 * ```
 */
export function useCommunityGraph(
  communities: Community[],
  options: GraphOptions,
): UseCommunityGraph;
````

**実装詳細**:

```typescript
import { useMemo } from "react";
import dagre from "@xyflow/dagre";

const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;

export function useCommunityGraph(
  communities: Community[],
  options: GraphOptions,
): UseCommunityGraph {
  const { selectedId, highlightedIds } = options;

  const { nodes, edges } = useMemo(() => {
    if (communities.length === 0) {
      return { nodes: [], edges: [] };
    }

    // ノード生成
    const rawNodes: Node<CommunityNodeData>[] = communities.map((c) => ({
      id: c.id,
      type: "communityNode",
      position: { x: 0, y: 0 }, // dagreで上書き
      data: {
        community: c,
        isSelected: c.id === selectedId,
        isHighlighted: highlightedIds.includes(c.id),
      },
    }));

    // エッジ生成（親→子）
    const rawEdges: Edge[] = communities
      .filter((c) => c.parentCommunityId)
      .map((c) => ({
        id: `${c.parentCommunityId}-${c.id}`,
        source: c.parentCommunityId!,
        target: c.id,
        type: "communityEdge",
      }));

    // dagreレイアウト適用
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 100 });

    rawNodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    rawEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // 位置を適用
    const layoutedNodes = rawNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges: rawEdges };
  }, [communities, selectedId, highlightedIds]);

  return { nodes, edges };
}
```

---

## 3. データフロー図

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CommunityVisualization (Template)                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     State Management                           │ │
│  │  selectedCommunityId, selectedLevel, searchQuery               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│         │                    │                    │                  │
│         ▼                    ▼                    ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐         │
│  │useCommunities│    │useCommunity- │    │useCommunity-  │         │
│  │  (level)     │    │   Detail     │    │   Search      │         │
│  └──────┬───────┘    │(communityId) │    │  (debounced)  │         │
│         │            └──────┬───────┘    └───────┬───────┘         │
│         │                   │                    │                  │
│         ▼                   │                    │                  │
│  ┌──────────────┐          │                    │                  │
│  │useCommunity- │          │                    │                  │
│  │   Graph      │◀─────────┼────────────────────┘                  │
│  │(transform)   │          │     highlightedIds                    │
│  └──────┬───────┘          │                                       │
│         │                  │                                        │
│         ▼                  ▼                                        │
│  ┌──────────────┐   ┌──────────────┐                               │
│  │CommunityGraph│   │CommunityDet- │                               │
│  │   (nodes,    │   │  ailPanel    │                               │
│  │    edges)    │   │(detail data) │                               │
│  └──────────────┘   └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
          │                   │
          ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        window.electronAPI                            │
│  community.getAll / getByLevel / getById / getSummary / getMembers  │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Main Process                                 │
│               ipcMain.handle('community:*')                          │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CommunityDetector / Repository                    │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SQLite Database                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. キャッシュ戦略

### 4.1 現時点のアプローチ

- **シンプル実装**: React状態でのキャッシュ
- **再取得**: `refetch`関数による明示的な再取得
- **依存配列**: `useEffect`の依存配列で自動再取得

### 4.2 将来の拡張オプション

| 方式        | メリット                     | デメリット |
| ----------- | ---------------------------- | ---------- |
| React Query | 自動キャッシュ・再検証       | 依存追加   |
| SWR         | 軽量、stale-while-revalidate | 機能限定   |
| Zustand     | 軽量グローバル状態           | 学習コスト |

---

## 5. エラーハンドリング

### 5.1 エラー伝播パターン

```typescript
// 各HookでResult<T, E>パターンを処理
const result = await window.electronAPI.community.getAll();
if (result.ok) {
  setData(result.value);
} else {
  setError(result.error);
}
```

### 5.2 リトライロジック（将来実装）

```typescript
const fetchWithRetry = async <T>(
  fn: () => Promise<Result<T, Error>>,
  maxRetries = 3,
): Promise<Result<T, Error>> => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result.ok) return result;

    // 指数バックオフ
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
  }
  return { ok: false, error: new Error("Max retries exceeded") };
};
```

---

## 確認完了

- [x] useCommunities Hook定義
- [x] useCommunityDetail Hook定義
- [x] useCommunitySearch Hook定義
- [x] useCommunityGraph Hook定義
- [x] データフロー図作成
- [x] キャッシュ戦略検討
- [x] エラーハンドリング設計
