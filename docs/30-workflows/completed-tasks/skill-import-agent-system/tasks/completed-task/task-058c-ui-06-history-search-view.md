# TASK-UI-06-HISTORY-SEARCH-VIEW: あなたの記録

## 1. メタ情報

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスク ID    | TASK-UI-06-HISTORY-SEARCH-VIEW                                                   |
| ステータス   | 未着手                                                                           |
| 依存タスク   | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-02（ナビコア） |
| 複雑度       | medium                                                                           |
| 対象ビュー   | HistorySearchView（新規作成）                                                    |
| 関連スライス | `historySearchSlice`（新規）                                                     |

## 2. 目的

チャット・ファイル操作・スキル実行の履歴を **タイムライン形式で一覧** できる統合画面を提供する。タイムラインが画面の主役であり、検索は「必要なときだけ使う」セカンダリ機能として控えめに配置する。ユーザーはまずタイムラインを眺め、気になる項目をタップして詳細を発見する「タップ&ディスカバー」体験を提供する。

## 3. Why（なぜ必要か）

- **タイムラインで振り返り**: チャット・ファイル・スキル実行履歴が別々の画面に分散しており、「先週やったあの作業」を探すのに複数画面を行き来する必要がある
- **作業の文脈把握**: 時系列でアクティビティ全体を俯瞰し、作業の流れを把握できる
- **既存画面の補完**: ChatHistoryView はチャットセッション一覧に特化。HistorySearchView は種別横断の記録閲覧に特化

## 4. 設計哲学: 「タップ&ディスカバー」

### Level 1 = 4 個以下の大きな要素

画面を開いた瞬間に目に入る要素は **3 つだけ** に絞る:

1. **検索バー**（上部に控えめ配置、虫眼鏡アイコン + プレースホルダーのみ）
2. **タイムラインリスト**（画面の主役、全高の 90% 以上を占有）
3. **日付ヘッダー**（sticky でスクロール時に上部固定）

### Level 2 = タップで詳細

各タイムライン項目をタップするとインライン展開（アコーディオン）で詳細が表示される。全画面遷移しない。

### 全操作にフィードバック

hover、active、展開/折りたたみ、無限スクロール読み込みの全てに視覚的フィードバックを付与する。

## 5. 画面構成図（ASCII）

### デスクトップレイアウト（>= 1024px）

```
+-------------------------------------------------------------------+
| あなたの記録                                                       |
+-------------------------------------------------------------------+
| +---------------------------------------------------------------+ |
| | (虫眼鏡アイコン) やりとりを検索...       bg: --bg-secondary   | |
| |   高さ40px / ボーダーなし / デバウンス300ms                    | |
| +---------------------------------------------------------------+ |
|                                                                   |
| -- きょう -------------------------------------------------------  |
| +---------------------------------------------------------------+ |
| | (チャット 32px) 「Reactコンポーネントの設計」          14:32   | |
| |                 ...最適なパターンはComposition...               | |
| |                 min-height: 64px / 全幅カード                  | |
| +---------------------------------------------------------------+ |
| +---------------------------------------------------------------+ |
| | (スキル 32px) skill:presentation-generator 実行       13:15   | |
| |               出力: slides.html (成功)                         | |
| |  +--- タップで展開（アコーディオン 200ms）-----------------+   | |
| |  | 実行結果: 成功                                          |   | |
| |  | 出力ファイル: slides.html (24KB)                        |   | |
| |  | 実行時間: 12.3秒                                        |   | |
| |  | 使用モデル: claude-opus-4-6                             |   | |
| |  +--------------------------------------------------------+   | |
| +---------------------------------------------------------------+ |
| +---------------------------------------------------------------+ |
| | (ファイル 32px) src/components/Button.tsx 編集         11:20   | |
| |                 +12行 -3行                                     | |
| +---------------------------------------------------------------+ |
|                                                                   |
| -- きのう -------------------------------------------------------  |
| +---------------------------------------------------------------+ |
| | (チャット 32px) 「TypeScript型定義のベスト」          16:45   | |
| |                 ...Discriminated Unionを使うと...               | |
| +---------------------------------------------------------------+ |
| +---------------------------------------------------------------+ |
| | (スキル 32px) skill:code-review 実行                  10:30   | |
| |               対象: auth-service.ts (2件の指摘)                | |
| +---------------------------------------------------------------+ |
|                                                                   |
| -- 今週 ---------------------------------------------------------  |
| | ...                                                             | |
|                                                                   |
|             (スピナー / IntersectionObserver)                      |
|             「すべて表示しました」(全件読み込み完了時)              |
+-------------------------------------------------------------------+
```

### モバイルレイアウト（< 768px）

```
+------------------------------------------+
| あなたの記録                              |
+------------------------------------------+
| (虫眼鏡) やりとりを検索...   <- sticky   |
+------------------------------------------+
|                                          |
| -- きょう ------------------------------- |
| +--------------------------------------+ |
| | (チャット) Reactコンポーネント 14:32  | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | (スキル) presentation-gen... 13:15    | |
| +--------------------------------------+ |
| ...                                      |
|             (自動読み込み)                |
+------------------------------------------+
```

## 6. コンポーネント構成

### 6.1 画面固有コンポーネントツリー

```
HistorySearchView/
+-- index.tsx                              # メインレイアウト
+-- components/
|   +-- HistorySearchBar.tsx               # 控えめ検索バー（虫眼鏡+プレースホルダー）
|   +-- TimelineGroup/
|   |   +-- TimelineGroup.tsx              # 日付グループコンテナ
|   |   +-- TimelineGroupHeader.tsx        # 「きょう」「きのう」等のヘッダー（sticky）
|   |   +-- TimelineItem.tsx               # 個別アイテム（種別により表示分岐）
|   +-- HistoryItemCard/
|   |   +-- ChatHistoryCard.tsx            # チャット履歴カード
|   |   +-- FileHistoryCard.tsx            # ファイル操作カード
|   |   +-- SkillHistoryCard.tsx           # スキル実行カード（アコーディオン展開付き）
|   +-- HistoryEmptyState.tsx              # ゼロステート表示（EmptyState mood="encouraging"）
|   +-- InfiniteScrollSentinel.tsx         # IntersectionObserver による自動読み込み
+-- hooks/
    +-- useHistorySearch.ts                # 検索ロジック（デバウンス300ms）
    +-- useTimelineGroups.ts               # 日付グルーピングロジック
    +-- useInfiniteScroll.ts               # IntersectionObserver ロジック
```

### 6.2 HistorySearchBar コンポーネント

検索バーは画面の主役ではなく、**セカンダリ**として上部に控えめに配置する。FilterChips は廃止し、テキスト検索に統合する。

| プロパティ     | 値                                                                       |
| -------------- | ------------------------------------------------------------------------ |
| 表示           | 虫眼鏡アイコン + プレースホルダー「やりとりを検索...」が常に表示         |
| 高さ           | 40px                                                                     |
| 背景色         | `var(--bg-secondary)`                                                    |
| ボーダー       | なし                                                                     |
| デバウンス     | 300ms                                                                    |
| フォーカス時   | ボーダーが `var(--color-accent)` で表示（1px solid）、200ms ease-out     |
| 検索クリア     | 入力テキストがある場合のみ右端にクリアボタン（x アイコン）表示           |
| フィルタリング | テキスト検索のみ（種別フィルタは検索バーに統合しない。全種別を横断検索） |

```
// 通常状態
+-------------------------------------------------------------+
|  (虫眼鏡)  やりとりを検索...                                  |
+-------------------------------------------------------------+

// 入力中
+-------------------------------------------------------------+
|  (虫眼鏡)  React                                        (x)  |
+-------------------------------------------------------------+
```

### 6.3 TimelineGroup コンポーネント

#### 日付グループ定義（カジュアル表現）

| グループ名 | 表示テキスト                | 判定条件                        |
| ---------- | --------------------------- | ------------------------------- |
| きょう     | `きょう`                    | `isToday(item.timestamp)`       |
| きのう     | `きのう`                    | `isYesterday(item.timestamp)`   |
| 今週       | `今週`                      | きょう・きのうを除く直近7日以内 |
| 先週       | `先週`                      | 今週を除く直近14日以内          |
| それ以前   | `MM月`（例: `1月`, `12月`） | 14日より前（月単位グループ）    |

#### TimelineGroupHeader（sticky）

```
-- きょう -------------------------------------------
```

- 左揃えテキスト + 右に水平線（`border-bottom`）
- フォント: `var(--font-weight-semibold)`, `var(--font-size-sm)`
- 色: `var(--color-text-secondary)`
- **sticky 配置**: `position: sticky; top: 0; z-index: 10; background: var(--bg-primary);`
- スクロール時に上部に固定され、現在の日付グループが常に視認可能

### 6.4 TimelineItem（全幅カード）

| プロパティ       | 値                                                          |
| ---------------- | ----------------------------------------------------------- |
| 最低高さ         | 64px                                                        |
| 幅               | 100%（全幅）                                                |
| アイコンサイズ   | 32px x 32px                                                 |
| レイアウト       | アイコン(32px) + タイトル + 1行プレビュー + 時刻            |
| hover            | 背景色が `var(--bg-elevated)` に変化、150ms ease-out        |
| active（タップ） | `transform: scale(0.99)`、150ms ease-out                    |
| トランジション   | `background-color 150ms ease-out, transform 150ms ease-out` |

#### タイムライン項目マイクロインタラクション

```css
.timeline-item {
  min-height: 64px;
  width: 100%;
  transition:
    background-color 150ms ease-out,
    transform 150ms ease-out;
}
.timeline-item:hover {
  background-color: var(--bg-elevated);
}
.timeline-item:active {
  transform: scale(0.99);
}
```

### 6.5 HistoryItemCard 種別別表示

#### ChatHistoryCard

| 要素           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| アイコン       | チャットバブルアイコン（32px）                           |
| タイトル       | セッションタイトル or 最初のメッセージ冒頭30文字         |
| プレビュー     | AI 応答の冒頭テキスト（1行、ellipsis truncate）          |
| タイムスタンプ | `HH:mm` 形式                                             |
| タップ時       | **インライン展開（アコーディオン）**で会話プレビュー表示 |

**ChatHistoryCard アコーディオン展開仕様**:

| プロパティ       | 値                                                       |
| ---------------- | -------------------------------------------------------- |
| 展開トリガー     | カード全体のタップ                                       |
| 展開アニメ       | 高さアニメーション 200ms ease-out                        |
| 展開内容         | 最後のやりとり 2-3 往復のプレビュー                      |
| 折りたたみ       | 再タップで閉じる                                         |
| 展開インジケータ | 右端に `>>`（閉じ）/ `v`（開き）アイコン                 |
| 詳細リンク       | 展開内に「やりとりを見る」リンク -> ChatHistoryView 遷移 |

#### FileHistoryCard

| 要素           | 内容                                               |
| -------------- | -------------------------------------------------- |
| アイコン       | ファイルアイコン（32px）                           |
| タイトル       | ファイルパス（相対パス表示）                       |
| プレビュー     | `+N行 -M行` の差分サマリー                         |
| タイムスタンプ | `HH:mm` 形式                                       |
| タップ時       | **インライン展開（アコーディオン）**で差分詳細表示 |

**FileHistoryCard アコーディオン展開仕様**:

| プロパティ       | 値                                                  |
| ---------------- | --------------------------------------------------- |
| 展開トリガー     | カード全体のタップ                                  |
| 展開アニメ       | 高さアニメーション 200ms ease-out                   |
| 展開内容         | 変更行の diff プレビュー（最大 10 行）              |
| 折りたたみ       | 再タップで閉じる                                    |
| 展開インジケータ | 右端に `>>`（閉じ）/ `v`（開き）アイコン            |
| 詳細リンク       | 展開内に「ファイルを開く」リンク -> EditorView 遷移 |

#### SkillHistoryCard（アコーディオン展開付き）

| 要素           | 内容                                 |
| -------------- | ------------------------------------ |
| アイコン       | パッケージアイコン（32px）           |
| タイトル       | `skill:{skillName} 実行`             |
| プレビュー     | 出力ファイル名 + 結果（成功/失敗）   |
| タイムスタンプ | `HH:mm` 形式                         |
| タップ時       | **インライン展開（アコーディオン）** |

**SkillHistoryCard アコーディオン展開仕様**:

| プロパティ       | 値                                         |
| ---------------- | ------------------------------------------ |
| 展開トリガー     | カード全体のタップ                         |
| 展開アニメ       | 高さアニメーション 200ms ease-out          |
| 展開内容         | 実行結果サマリー / 出力ファイル / 実行時間 |
| 折りたたみ       | 再タップで閉じる                           |
| 展開インジケータ | 右端に `>>`（閉じ）/ `v`（開き）アイコン   |

```
// 閉じた状態
+---------------------------------------------------------------+
| (スキル) skill:presentation-generator 実行     13:15       >>  |
|          出力: slides.html (成功)                              |
+---------------------------------------------------------------+

// 展開状態（タップ後、高さアニメーション200ms）
+---------------------------------------------------------------+
| (スキル) skill:presentation-generator 実行     13:15        v  |
|          出力: slides.html (成功)                              |
| +-----------------------------------------------------------+ |
| | 実行結果: 成功                                             | |
| | 出力ファイル: slides.html (24KB)                           | |
| | 実行時間: 12.3秒                                           | |
| | 使用モデル: claude-opus-4-6                                | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

### 6.6 InfiniteScrollSentinel（無限スクロール）

IntersectionObserver による自動読み込み。「さらに読み込む」ボタンは存在しない。

| プロパティ         | 値                                                        |
| ------------------ | --------------------------------------------------------- |
| 実装方式           | `IntersectionObserver` API                                |
| 監視対象           | タイムライン最下部の sentinel 要素                        |
| トリガー閾値       | `threshold: 0.1`（sentinel が 10% 表示されたら発火）      |
| rootMargin         | `0px 0px 200px 0px`（200px 手前で先読み）                 |
| 読み込み中表示     | 画面下部にスピナー                                        |
| 全件読み込み完了   | 「すべて表示しました」テキスト（`--color-text-tertiary`） |
| 新項目フェードイン | `opacity 0->1` + `translateY(8px->0)`、300ms ease-in      |

#### 新項目フェードインアニメーション

```css
@keyframes timeline-item-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item-new {
  animation: timeline-item-enter 300ms ease-in forwards;
}
```

```typescript
// hooks/useInfiniteScroll.ts
function useInfiniteScroll(
  sentinelRef: RefObject<HTMLDivElement>,
  hasMore: boolean,
  isLoading: boolean,
  onLoadMore: () => void,
) {
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 200px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef, hasMore, isLoading, onLoadMore]);
}
```

### 6.7 検索ロジック

#### デバウンス検索

```typescript
// hooks/useHistorySearch.ts
const DEBOUNCE_MS = 300;

function useHistorySearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // debouncedQuery の変更で IPC 検索実行
  // ...
}
```

#### 検索バックエンド戦略

| 段階 | 検索方式                  | 対応状況            |
| ---- | ------------------------- | ------------------- |
| MVP  | SQLite `LIKE '%keyword%'` | 即座に実装可能      |
| 推奨 | SQLite FTS5 全文検索      | FTS5 テーブル構築後 |

**FTS5 依存の明確化**: FTS5 は「推奨」依存であり、未構築でも MVP として LIKE 検索で動作する。FTS5 構築は別タスクとして管理する。

```typescript
// IPC リクエスト例
interface HistorySearchRequest {
  query: string;
  filter: HistoryItemType | "all"; // "chat" | "file" | "skill" | "all"
  limit: number; // デフォルト: 30
  offset: number; // 無限スクロール用
}

interface HistorySearchResponse {
  items: HistoryItem[];
  totalCount: number;
  hasMore: boolean;
}
```

## 7. 状態管理

> Zustand スライスの設計原則は **TASK-UI-01 参照**。

### 7.1 historySearchSlice（新規作成）

```typescript
interface HistorySearchSlice {
  // 状態
  historySearchQuery: string;
  historySearchResults: HistoryItem[];
  historySearchTotalCount: number;
  historySearchHasMore: boolean;
  isHistorySearching: boolean;
  historySearchError: string | null;
  expandedItemId: string | null; // 展開中のアコーディオンカードID（全種別共通）

  // アクション
  setHistorySearchQuery: (query: string) => void;
  searchHistory: (query: string, offset?: number) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  resetHistorySearch: () => void;
  toggleItemExpanded: (itemId: string) => void;
}
```

### 7.2 個別セレクタ（P31 対策）

```typescript
// store/index.ts に追加
export const useHistorySearchQuery = () =>
  useStore((s) => s.historySearchQuery);
export const useHistorySearchResults = () =>
  useStore((s) => s.historySearchResults);
export const useHistorySearchTotalCount = () =>
  useStore((s) => s.historySearchTotalCount);
export const useIsHistorySearching = () =>
  useStore((s) => s.isHistorySearching);
export const useHistorySearchError = () =>
  useStore((s) => s.historySearchError);
export const useHistorySearchHasMore = () =>
  useStore((s) => s.historySearchHasMore);
export const useExpandedItemId = () => useStore((s) => s.expandedItemId);

// アクション
export const useSetHistorySearchQuery = () =>
  useStore((s) => s.setHistorySearchQuery);
export const useSearchHistory = () => useStore((s) => s.searchHistory);
export const useLoadMoreHistory = () => useStore((s) => s.loadMoreHistory);
export const useResetHistorySearch = () =>
  useStore((s) => s.resetHistorySearch);
export const useToggleItemExpanded = () =>
  useStore((s) => s.toggleItemExpanded);
```

### 7.3 既存スライスの利用

| スライス          | 利用する状態/アクション           |
| ----------------- | --------------------------------- |
| `navigationSlice` | `setCurrentView("historySearch")` |
| `uiSlice`         | `responsiveMode`                  |

### 7.4 型定義（packages/shared に追加）

```typescript
// packages/shared/src/types/history.ts

export type HistoryItemType = "chat" | "file" | "skill";

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  preview: string; // 1行プレビューテキスト
  timestamp: string; // ISO 8601
  metadata: HistoryItemMetadata;
}

export interface ChatHistoryMetadata {
  sessionId: string;
  messageCount: number;
  lastModel?: string;
}

export interface FileHistoryMetadata {
  filePath: string;
  additions: number;
  deletions: number;
}

export interface SkillHistoryMetadata {
  skillName: string;
  executionId: string;
  status: "success" | "failure" | "cancelled";
  outputFile?: string;
  executionTimeMs?: number; // アコーディオン展開で表示
  modelUsed?: string; // アコーディオン展開で表示
  outputFileSizeBytes?: number; // アコーディオン展開で表示
}

export type HistoryItemMetadata =
  | ({ type: "chat" } & ChatHistoryMetadata)
  | ({ type: "file" } & FileHistoryMetadata)
  | ({ type: "skill" } & SkillHistoryMetadata);
```

## 8. レスポンシブ仕様

| ブレークポイント | レイアウト                | 検索バー    | カード幅 |
| ---------------- | ------------------------- | ----------- | -------- |
| >= 1440px        | 中央揃え max-width: 960px | 全幅        | フル幅   |
| 1024px-1439px    | 中央揃え max-width: 800px | 全幅        | フル幅   |
| 768px-1023px     | パディング 16px           | 全幅        | フル幅   |
| < 768px          | パディング 12px           | sticky 全幅 | フル幅   |

### 検索バーレスポンシブ

- > = 768px: HistorySearchBar が上部に固定配置
- < 768px: HistorySearchBar が sticky（スクロール追従）

### タイムラインカード

- 全ブレークポイントでフル幅
- 最低高さ: 64px
- パディング: 12px 16px（>= 768px）/ 8px 12px（< 768px）

### 日付ヘッダー sticky 挙動

- 全ブレークポイントで `position: sticky; top: 0;`
- < 768px では検索バー sticky の下に配置（`top: 48px;`）

## 9. ゼロステート

### 9.1 履歴が 0 件の場合（EmptyState mood="encouraging"）

```
+------------------------------------------+
|                                          |
|           (時計アイコン)                  |
|                                          |
|   まだ記録がありません                    |
|   AIアシスタントに話しかけてみましょう    |
|                                          |
|   [チャットをはじめる]  (Primary Button)  |
|                                          |
+------------------------------------------+
```

- **トリガー**: `historySearchResults.length === 0 && !isHistorySearching && historySearchQuery === ""`
- **コンポーネント**: `EmptyState mood="encouraging"`
- **メッセージ**: 「まだ記録がありません。AIアシスタントに話しかけてみましょう」
- **アクション**: `setCurrentView("chat")` で ChatView へ遷移

### 9.2 検索結果が 0 件の場合

```
+------------------------------------------+
|                                          |
|           (虫眼鏡アイコン)                |
|                                          |
|   「{searchKeyword}」に一致する           |
|   記録が見つかりませんでした              |
|                                          |
|   キーワードを変えてみてください          |
|                                          |
|   [検索をクリア]  (Ghost Button)          |
|                                          |
+------------------------------------------+
```

### 9.3 ローディング中

- TimelineGroup エリアにスケルトンカード 5 枚を表示
- スケルトン構成: アイコン(円 32px) + タイトル行(矩形) + プレビュー行(矩形) + 時刻(小矩形)
- スケルトンカード最低高さ: 64px（実カードと同一）

### 9.4 エラー時

```
+------------------------------------------+
|                                          |
|           (警告アイコン)                  |
|                                          |
|   記録の読み込みに失敗しました            |
|                                          |
|   [もう一度試す]  (Primary Button)       |
|                                          |
+------------------------------------------+
```

## 10. マイクロインタラクション

| 対象                         | インタラクション                                    | タイミング     |
| ---------------------------- | --------------------------------------------------- | -------------- |
| タイムライン項目 hover       | 背景色が `var(--bg-elevated)` に変化                | 150ms ease-out |
| タイムライン項目 active      | `transform: scale(0.99)`                            | 150ms ease-out |
| アコーディオン展開           | 高さアニメーション + `opacity: 0->1`                | 200ms ease-out |
| アコーディオン折りたたみ     | 高さアニメーション + `opacity: 1->0`                | 200ms ease-in  |
| 無限スクロール新項目         | `opacity: 0->1` + `translateY(8px->0)` フェードイン | 300ms ease-in  |
| 検索バーフォーカス           | ボーダー `var(--color-accent)` 表示                 | 200ms ease-out |
| 検索バーフォーカス解除       | ボーダー消失                                        | 150ms ease-in  |
| 日付ヘッダー sticky 切り替え | `box-shadow` が出現（`0 1px 3px rgba(0,0,0,0.04)`） | 150ms ease-out |

## 11. 既存画面との差別化

| 観点                 | HistorySearchView（新規）                        | ChatHistoryView（既存・変更なし）          |
| -------------------- | ------------------------------------------------ | ------------------------------------------ |
| **主目的**           | タイムライン俯瞰（チャット + ファイル + スキル） | チャットセッション一覧・詳細表示           |
| **検索対象**         | 全種別のアクティビティ                           | チャットメッセージのみ                     |
| **表示形式**         | タイムラインベース（日付グループ）               | セッションリスト -> メッセージ詳細         |
| **検索の位置づけ**   | セカンダリ（控えめ配置）                         | 該当なし                                   |
| **フィルタリング**   | テキスト検索のみ（検索バーに統合）               | なし（チャットのみ）                       |
| **詳細表示**         | インライン展開（アコーディオン）全種別           | セッション内メッセージ閲覧                 |
| **ページネーション** | 無限スクロール（IntersectionObserver）           | ページネーション or 全件表示               |
| **ナビゲーション**   | タイムラインを眺める -> タップで発見             | セッション選択 -> メッセージ表示           |
| **URL**              | `/history-search`（ビュー切替）                  | `/chat/history/:sessionId`（React Router） |

### 既存 ChatHistoryView への影響

ChatHistoryView は **一切変更しない**。HistorySearchView の ChatHistoryCard 展開内にある「やりとりを見る」リンクをタップした際に、ChatHistoryView の該当セッションへ遷移（`navigate(/chat/history/${sessionId})`）する。

## 12. IPC チャネル設計

> IPC 契約の設計原則は **TASK-UI-01 参照**。

### 新規 IPC チャネル

| チャネル名          | 方向   | 用途               |
| ------------------- | ------ | ------------------ |
| `history:search`    | invoke | 履歴横断検索       |
| `history:get-stats` | invoke | 種別ごとの件数取得 |

### history:search リクエスト/レスポンス

```typescript
// Request
{
  query: string;                    // 検索キーワード（空文字で全件）
  filter: "all" | "chat" | "file" | "skill";
  limit: number;                    // デフォルト: 30
  offset: number;                   // 無限スクロール
}

// Response
{
  success: boolean;
  data?: {
    items: HistoryItem[];
    totalCount: number;
    hasMore: boolean;
  };
  error?: { code: string; message: string; };
}
```

### history:get-stats レスポンス

```typescript
// Response
{
  success: boolean;
  data?: {
    chat: number;      // チャット履歴件数
    file: number;      // ファイル操作件数
    skill: number;     // スキル実行件数
    total: number;     // 合計
  };
}
```

## 13. 成果物（ファイルパス）

```
apps/desktop/src/renderer/
+-- views/HistorySearchView/
|   +-- index.tsx
|   +-- components/
|       +-- HistorySearchBar.tsx
|       +-- TimelineGroup/
|       |   +-- TimelineGroup.tsx
|       |   +-- TimelineGroupHeader.tsx
|       |   +-- TimelineItem.tsx
|       +-- HistoryItemCard/
|       |   +-- ChatHistoryCard.tsx
|       |   +-- FileHistoryCard.tsx
|       |   +-- SkillHistoryCard.tsx
|       +-- HistoryEmptyState.tsx
|       +-- InfiniteScrollSentinel.tsx
+-- views/HistorySearchView/hooks/
|   +-- useHistorySearch.ts
|   +-- useTimelineGroups.ts
|   +-- useInfiniteScroll.ts
+-- store/slices/
|   +-- historySearchSlice.ts            # 新規作成
+-- (store/index.ts に個別セレクタ追加)

packages/shared/src/types/
+-- history.ts                           # 新規作成
```

### テストファイル

```
apps/desktop/src/renderer/
+-- views/HistorySearchView/__tests__/
|   +-- HistorySearchView.test.tsx
|   +-- HistorySearchBar.test.tsx
|   +-- TimelineGroup.test.tsx
|   +-- ChatHistoryCard.test.tsx
|   +-- FileHistoryCard.test.tsx
|   +-- SkillHistoryCard.test.tsx
|   +-- InfiniteScrollSentinel.test.tsx
+-- views/HistorySearchView/hooks/__tests__/
|   +-- useHistorySearch.test.ts
|   +-- useTimelineGroups.test.ts
|   +-- useInfiniteScroll.test.ts
+-- store/slices/__tests__/
    +-- historySearchSlice.test.ts

packages/shared/src/types/__tests__/
+-- history.test.ts
```

## 14. 完了条件

- [ ] HistorySearchBar が上部に控えめに配置され、虫眼鏡アイコン + プレースホルダー表示でデバウンス検索（300ms）が動作する
- [ ] FilterChips が廃止されており、テキスト検索のみで全種別横断検索できる
- [ ] 検索未使用時にタイムラインが画面の主役として全高の 90% 以上を占有する
- [ ] TimelineGroup で日付グループ（きょう/きのう/今週/先週/MM月）が正しく表示される
- [ ] 日付ヘッダーがスクロール時に sticky で上部に固定される
- [ ] 各種 HistoryItemCard が種別に応じた表示をする（最低高さ 64px、アイコン 32px）
- [ ] 全種別のカード（チャット/ファイル/スキル）がタップでインライン展開（アコーディオン）する
- [ ] アコーディオン展開時に高さアニメーション（200ms ease-out）が適用される
- [ ] ChatHistoryCard 展開内の「やりとりを見る」リンクで ChatHistoryView へ遷移する
- [ ] FileHistoryCard 展開内の「ファイルを開く」リンクで EditorView の該当ファイルを開く
- [ ] SkillHistoryCard 展開で実行結果・出力ファイル・実行時間が表示される
- [ ] IntersectionObserver による無限スクロールが動作する
- [ ] 無限スクロールで新項目が下からフェードイン（opacity 0->1 + translateY(8px->0)、300ms）する
- [ ] 全件読み込み完了時に「すべて表示しました」テキストが表示される
- [ ] タイムライン項目 hover で背景色が `var(--bg-elevated)` に変化する
- [ ] タイムライン項目 active で `transform: scale(0.99)` が適用される
- [ ] SQLite LIKE 検索で MVP が動作する（FTS5 未構築時）
- [ ] レスポンシブ: 768px 以下で検索バーが sticky になる
- [ ] ゼロステート: 記録 0 件時に EmptyState mood="encouraging" + 「まだ記録がありません。AIアシスタントに話しかけてみましょう」が表示される
- [ ] ChatHistoryView に変更がないこと
- [ ] historySearchSlice の全個別セレクタが定義されている（展開中カード ID を含む）
- [ ] 全コンポーネントテストが PASS する
- [ ] キーボードでの全操作が可能（WCAG 2.1 AA）

## 15. UX 言語対応表

| Before（旧）               | After（新）                    |
| -------------------------- | ------------------------------ |
| 横断履歴検索               | あなたの記録                   |
| セッション                 | やりとり                       |
| フィルター                 | しぼり込み                     |
| FilterChips                | （廃止、検索バーに統合）       |
| さらに読み込む             | （表示しない、無限スクロール） |
| ページネーション           | （表示しない、無限スクロール） |
| XX件の結果                 | （表示しない）                 |
| まだ履歴がありません       | まだ記録がありません           |
| 履歴が見つかりませんでした | 記録が見つかりませんでした     |
| 再試行                     | もう一度試す                   |
| 検索                       | やりとりを検索...              |

## 16. 既知の落とし穴・教訓

| Pitfall | 該当箇所                    | 対策                                                                 |
| ------- | --------------------------- | -------------------------------------------------------------------- |
| **P31** | historySearchSlice セレクタ | 個別セレクタ必須。合成 Hook を useEffect 依存配列に含めない          |
| **P39** | テスト環境                  | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止                |
| **P40** | テスト実行ディレクトリ      | `cd apps/desktop` から実行                                           |
| **P42** | IPC 引数バリデーション      | `history:search` の query 引数に `.trim()` 3段バリデーション         |
| **P9**  | テスト間状態リーク          | historySearchSlice のテストで `beforeEach` に `resetHistorySearch()` |

### デバウンス検索のテスト注意点

```typescript
// P13 対策: タイマーテストは advanceTimersByTime で1ステップずつ
vi.useFakeTimers();
act(() => {
  // 検索クエリ入力
  fireEvent.change(searchInput, { target: { value: "React" } });
});
// 300ms 経過をシミュレート
act(() => {
  vi.advanceTimersByTime(300);
});
// 検索 IPC が呼ばれたことを検証
expect(mockSearchHistory).toHaveBeenCalledWith("React", 0);
vi.useRealTimers();
```

### IntersectionObserver のテスト注意点

```typescript
// IntersectionObserver のモック
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockIntersectionObserver = vi.fn((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  unobserve: vi.fn(),
}));
vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);

// エントリをシミュレート
const [callback] = mockIntersectionObserver.mock.calls[0];
act(() => {
  callback([{ isIntersecting: true }]);
});
expect(mockLoadMore).toHaveBeenCalled();
```

### アコーディオン展開のテスト注意点

```typescript
// P39 対策: happy-dom では fireEvent を使用
// アコーディオン展開テスト
fireEvent.click(timelineItem);
// 展開後のコンテンツが表示されることを検証
expect(screen.getByText("実行結果: 成功")).toBeInTheDocument();

// 再タップで折りたたみ
fireEvent.click(timelineItem);
expect(screen.queryByText("実行結果: 成功")).not.toBeInTheDocument();
```

## 17. 参照資料

| 資料                       | パス / タスク ID                                    |
| -------------------------- | --------------------------------------------------- |
| デザイン基盤               | TASK-UI-00 `00-design-foundation.md`                |
| UI アーキテクチャ          | TASK-UI-01 `01-architecture.md`                     |
| ナビゲーションコア         | TASK-UI-02 `02-navigation-core.md`                  |
| 既存 ChatHistoryView       | `views/ChatHistoryView/index.tsx`                   |
| 既存 ConversationListPanel | `components/conversation/ConversationListPanel.tsx` |
| 既存 conversationAPI       | `preload/index.ts` (`window.conversationAPI`)       |
| 既存 Conversation 型       | `apps/desktop/src/shared/types/conversation.ts`     |
| IPC チャネル定義           | `preload/channels.ts`                               |
| P31: Store Hook 無限ループ | `.claude/rules/06-known-pitfalls.md#P31`            |
| P42: trim バリデーション   | `.claude/rules/06-known-pitfalls.md#P42`            |
| P13: タイマーテスト注意    | `.claude/rules/06-known-pitfalls.md#P13`            |
