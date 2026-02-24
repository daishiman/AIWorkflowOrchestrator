# TASK-UI-07-DASHBOARD-ENHANCEMENT: ホーム画面リデザイン ─ 挨拶・サジェスチョン・タイムライン

## 1. メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスクID       | TASK-UI-07-DASHBOARD-ENHANCEMENT                                                     |
| タスク名       | ホーム画面リデザイン ─ 挨拶・サジェスチョン・タイムライン                            |
| ティア         | 4 (UI刷新・補足層)                                                                   |
| 優先度         | medium                                                                               |
| 複雑度         | small                                                                                |
| 依存タスク     | TASK-UI-00（デザイン基盤）, TASK-UI-01（Store/IPC設計）, TASK-UI-02（GlobalNavCore） |
| 並列可         | TASK-UI-08（UI-09は対象外）                                                          |
| 推定ファイル数 | 5-7                                                                                  |
| ステータス     | pending                                                                              |
| タグ           | frontend, renderer, ui, home, tap-and-discover                                       |

## 2. 目的と背景

### 2.1 目的

既存の `DashboardView`（`apps/desktop/src/renderer/views/DashboardView/index.tsx`、147行）を**Tap&Discover設計哲学**に基づいて全面リデザインする。ユーザーがアプリを開いた瞬間に「次に何をすべきか」が直感的に伝わるホーム画面を実現する。

**核心方針**: 統計カード群・クイックアクションバー・トレンドバッジを全て廃止し、**挨拶ヘッダー + サジェスチョンカード2~3枚 + シンプルタイムライン** の3要素のみで構成する。Level 1に表示される要素は最大4つ。詳細は全てタップ後に展開される。

### 2.2 設計哲学: Tap&Discover

| レベル | 原則                       | 本画面での適用                                                       |
| ------ | -------------------------- | -------------------------------------------------------------------- |
| L1     | 最初に見える要素は最大4個  | 挨拶ヘッダー + サジェスチョンカード2~3枚 + タイムライン              |
| L2     | 複雑さは全てタップ後に表示 | タイムライン項目タップ→インライン展開、サジェスチョンタップ→対象画面 |
| --     | 全操作にフィードバック     | タップ→バウンス、成功→チェック、失敗→シェイク                        |

### 2.3 UX言語変換表（5D準拠）

本タスクの全コード・UIテキストに適用する:

| 旧用語（技術語）   | 新用語（やさしい日本語） |
| ------------------ | ------------------------ |
| ダッシュボード     | ホーム                   |
| エージェント       | AIアシスタント           |
| スキル             | ツール / できること      |
| パーミッション     | 許可                     |
| セッション         | やりとり                 |
| コンテキスト       | 背景情報                 |
| クイックアクション | おすすめの次のステップ   |

### 2.4 Before → After

| Before（旧設計）                                               | After（新設計）                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| タイトル「ダッシュボード」                                     | タイトル**「ホーム」**（5D.3準拠）                                               |
| StatCard x4（スキル使用回数/チャット数/ファイル数/ストレージ） | **完全削除**（設定 > システム情報へ移動）                                        |
| TrendBadge（増減表示）                                         | **完全削除**                                                                     |
| QuickActionBar（4ボタン横並び）                                | **サジェスチョンカード**（SuggestionBubble、2~3枚）                              |
| RecentActivityPanel（詳細プレビュー付き、10件）                | **シンプルタイムライン**（アイコン+タイトル+相対時刻、最大5件 + 「もっと見る」） |
| ゼロステート「はじめましょう！」                               | EmptyState mood="welcoming"**「こんにちは！」**                                  |

### 2.5 背景

- 既存DashboardSlice（`dashboardSlice.ts`、54行）は `getStats` / `getActivity` のIPC呼び出しが実装済み
- 統計カード群は情報過多で「次に何をすべきか」の判断を妨げていた
- Apple HIG の Deference（コンテンツに主役を譲る）原則に従い、装飾的な統計表示を排除する
- 00-design-foundation で定義済みの SuggestionBubble / EmptyState コンポーネントを活用する

### 2.6 GlobalNavから分離した理由

GlobalNavCoreタスク（TASK-UI-02）のブロッキング期間を最小化するため、ナビゲーション基盤と独立して実装可能なホーム画面強化を切り出した。GlobalNavStripが提供するのは「どの画面に行くか」の導線であり、ホームが提供するのは「現在の状況把握 + 背景情報に応じた次のアクション提案」である。

### 2.7 責務境界

| 観点           | ホーム画面（本タスク）                 | あなたの記録（TASK-UI-06）              |
| -------------- | -------------------------------------- | --------------------------------------- |
| 主目的         | 概要把握 + 次のステップ提案            | 詳細検索 + フィルタリング               |
| アクティビティ | 直近5件のサマリー表示                  | 全件検索・時系列フィルタ                |
| ユーザー行動   | 「今何をすべきか」を判断する           | 「過去の特定操作」を探す                |
| データ量       | 軽量（キャッシュ済み + 最新5件）       | 重量（FTS5全文検索 + ページネーション） |
| 遷移関係       | タイムライン「もっと見る」→ 06の画面へ | 独立した検索画面                        |

**明確な境界**: タイムラインの「もっと見る」リンクは `setCurrentView("historySearch")` で06の画面に遷移する。ホーム画面内で検索やフィルタリングは実装しない。

---

## 3. 画面構成図（ASCII）

### 3.1 通常状態（アクティビティあり）

```
┌─────────────────────────────────────────────────────────────────┐
│ HomeView (= ホーム)                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ GreetingHeader ───────────────────────────────────────────┐ │
│  │ "ホーム"                                                    │ │
│  │ "おかえりなさい、{userName}さん"                             │ │
│  │ (時間帯応答: おはよう/こんにちは/こんばんは)                 │ │
│  │ ※出現アニメーション: opacity 0→1, translateY 8px→0          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ SuggestionSection ────────────────────────────────────────┐ │
│  │ "おすすめの次のステップ"                                     │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│  │  │ 120x120  │  │ 120x120  │  │ 120x120  │                  │ │
│  │  │ ○ アイコン│  │ ○ アイコン│  │ ○ アイコン│                  │ │
│  │  │   (丸)   │  │   (丸)   │  │   (丸)   │                  │ │
│  │  │ ラベル   │  │ ラベル   │  │ ラベル   │                  │ │
│  │  └──────────┘  └──────────┘  └──────────┘                  │ │
│  │  hover: scale(1.02) + shadow-md                              │ │
│  │  active: scale(0.97)                                         │ │
│  │  tap: success-bounce 300ms                                   │ │
│  │  ※背景情報に応じて内容が自動切替                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ RecentTimeline ───────────────────────────────────────────┐ │
│  │ "最近のできごと"                         [もっと見る →]      │ │
│  │ ┌──────────────────────────────────────────────────────┐    │ │
│  │ │ ○ CheckCircle  ツールを実行しました         2分前   │    │ │
│  │ │ ○ File         ファイルを更新しました       15分前  │    │ │
│  │ │ ○ MessageCircle やりとりを開始しました     1時間前  │    │ │
│  │ │ ○ Download     ツールを追加しました          3時間前│    │ │
│  │ │ ○ Settings     設定を変更しました           昨日    │    │ │
│  │ └──────────────────────────────────────────────────────┘    │ │
│  │ 各項目: 全幅カード、最低高さ64px（5C.2準拠）                │ │
│  │ タップ→インライン展開（L2）                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 ゼロステート（アクティビティ0件）

```
┌─────────────────────────────────────────────────────────────────┐
│ HomeView (= ホーム)                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ GreetingHeader ───────────────────────────────────────────┐ │
│  │ "ホーム"                                                    │ │
│  │ "こんにちは！"                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ SuggestionSection（初回用に自動切替）─────────────────────┐ │
│  │ "おすすめの次のステップ"                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│  │  │ Plus     │  │ BookOpen │  │ FolderOpen│                  │ │
│  │  │ ツールを │  │ 使い方を │  │ 作業スペ │                  │ │
│  │  │ 追加して │  │ 見る     │  │ ースを見 │                  │ │
│  │  │ みよう   │  │          │  │ る       │                  │ │
│  │  └──────────┘  └──────────┘  └──────────┘                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ EmptyState mood="welcoming" ──────────────────────────────┐ │
│  │ lucide: Sparkles (48px、--status-primary カラー)             │ │
│  │ 背景: うっすら青グラデーション                               │ │
│  │                                                              │ │
│  │ "こんにちは！"                                               │ │
│  │ "AIWorkflowOrchestratorへようこそ。"                         │ │
│  │ "ツールを追加してAIワークフローを始めてみよう。"             │ │
│  │                                                              │ │
│  │ [SuggestionBubble: ツールを探す]                             │ │
│  │ [SuggestionBubble: 作業スペースを見る]                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. コンポーネント構成

### 4.1 コンポーネントツリー

```
DashboardView (views/DashboardView/index.tsx) [既存改修]
├── GreetingHeader (molecules/GreetingHeader/index.tsx) [新規]
│   └── GreetingText — 時間帯応答の挨拶テキスト（出現アニメーション付き）
├── SuggestionSection (molecules/SuggestionSection/index.tsx) [新規]
│   └── SuggestionBubble (atoms/SuggestionBubble) [00基盤から流用]
│       ※ 120x120px カードとして使用、丸アイコン付き
├── RecentTimeline (organisms/RecentTimeline/index.tsx) [新規]
│   ├── TimelineItem — アイコン + タイトル + 相対時刻（全幅カード、min-h 64px）
│   │   └── TimelineItemExpanded — タップ後のインライン展開（L2詳細表示）
│   └── MoreLink → 「あなたの記録」画面遷移
└── EmptyState (atoms/EmptyState) [00基盤から流用、mood="welcoming"]
    └── SuggestionBubble [再利用]
```

### 4.2 旧→新 コンポーネントマッピング

| 旧コンポーネント    | 対応                                                           |
| ------------------- | -------------------------------------------------------------- |
| DashboardHeader     | **GreetingHeader** に改名・簡素化（更新ボタン削除）            |
| StatsCardGrid       | **完全削除**（設定 > システム情報へ移動）                      |
| StatCard x4         | **完全削除**（ホーム画面からは除去）                           |
| TrendBadge          | **完全削除**                                                   |
| QuickActionBar      | **SuggestionSection** に置換（SuggestionBubble使用）           |
| QuickActionButton   | **完全削除**（SuggestionBubble で代替）                        |
| RecentActivityPanel | **RecentTimeline** に置換（最大5件 + 「もっと見る」）          |
| ZeroStateCard       | **EmptyState** mood="welcoming" に置換（00基盤コンポーネント） |

### 4.3 新規コンポーネント詳細

#### GreetingHeader

```typescript
interface GreetingHeaderProps {
  /** ユーザー名（未設定の場合は挨拶のみ表示） */
  userName?: string;
}
```

- タイトル: `"ホーム"` -- `text-2xl font-bold text-[var(--text-primary)]`（5D.3準拠）
- 挨拶: 時間帯に応じた挨拶テキスト
  - 5:00-11:59: `"おはようございます、{userName}さん"`
  - 12:00-17:59: `"こんにちは、{userName}さん"`
  - 18:00-4:59: `"こんばんは、{userName}さん"`
  - userName未設定時: `"おかえりなさい"` のみ
- 出現アニメーション: `opacity: 0→1` + `translateY(8px→0)` 200ms `var(--ease-out)`
- 更新ボタン: **なし**（旧設計のRefreshButtonは削除。データ更新はマウント時の自動取得のみ）

```typescript
function getGreeting(userName?: string): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour >= 5 && hour < 12
      ? "おはようございます"
      : hour >= 12 && hour < 18
        ? "こんにちは"
        : "こんばんは";

  return userName ? `${timeGreeting}、${userName}さん` : "おかえりなさい";
}
```

**マイクロインタラクション**:

- 読み込み時: `opacity: 0→1` + `translateY(8px→0)` 200ms `var(--ease-out)`

#### SuggestionSection

```typescript
interface SuggestionSectionProps {
  /** サジェスチョンアイテムの配列（2~3件） */
  suggestions: SuggestionItem[];
}

interface SuggestionItem {
  /** 一意のID */
  id: string;
  /** 表示ラベル（5D.1準拠のやさしい日本語） */
  label: string;
  /** lucide-reactアイコン名 */
  icon: string;
  /** ナビゲーション先のViewTypeまたはアクション */
  action: (() => void) | ViewType;
}
```

- セクションタイトル: `"おすすめの次のステップ"` -- `text-base font-medium text-[var(--text-secondary)]`
- レイアウト: `flex gap-4 justify-center`（中央寄せ）
- 各カード: SuggestionBubble コンポーネント（00基盤定義）を使用
  - サイズ: `120 x 120px`（カード推奨サイズ、タッチターゲット80px以上を満たす）
  - アイコン: 丸背景（`--bg-elevated`、48px円）内に lucide アイコン 24px
  - ラベル: アイコン下部、`text-sm text-[var(--text-primary)]`、中央揃え
- マイクロインタラクション:
  - ホバー: `scale(var(--scale-hover))` = `scale(1.02)` + `box-shadow: var(--shadow-md)` -- `transition: var(--duration-fast) var(--ease-out)`
  - アクティブ: `scale(var(--scale-active))` = `scale(0.97)` -- `transition-duration: 50ms`
  - タップ後: `success-bounce` アニメーション 300ms `var(--ease-bounce)` → 画面遷移

##### 背景情報に応じた適応ロジック

| 状態                  | サジェスチョン                                                     |
| --------------------- | ------------------------------------------------------------------ |
| 初回利用（ツール0件） | 「ツールを追加してみよう」「使い方を見る」                         |
| ツールあり・未実行    | 「ツールを試してみよう」「作業スペースを開く」                     |
| 実行履歴あり          | 「前回の続きを見る」「新しいツールを探す」「AIアシスタントと話す」 |

```typescript
function getSuggestions(context: HomeContext): SuggestionItem[] {
  if (context.skillCount === 0) {
    return [
      {
        id: "add-skill",
        label: "ツールを追加してみよう",
        icon: "Plus",
        action: "skillCenter",
      },
      {
        id: "guide",
        label: "使い方を見る",
        icon: "BookOpen",
        action: "onboarding",
      },
    ];
  }
  if (context.lastExecutionAt === null) {
    return [
      {
        id: "try-skill",
        label: "ツールを試してみよう",
        icon: "Play",
        action: "skillCenter",
      },
      {
        id: "workspace",
        label: "作業スペースを開く",
        icon: "FolderOpen",
        action: "workspace",
      },
    ];
  }
  return [
    {
      id: "continue",
      label: "前回の続きを見る",
      icon: "ArrowRight",
      action: "workspace",
    },
    {
      id: "explore",
      label: "新しいツールを探す",
      icon: "Search",
      action: "skillCenter",
    },
    {
      id: "agent",
      label: "AIアシスタントと話す",
      icon: "Bot",
      action: "agent",
    },
  ];
}
```

#### RecentTimeline

```typescript
interface RecentTimelineProps {
  /** アクティビティの配列 */
  activities: ActivityItem[];
  /** ローディング状態 */
  isLoading: boolean;
  /** アクティビティクリック時のハンドラ */
  onActivityClick: (activity: ActivityItem) => void;
  /** 「もっと見る」クリック時のハンドラ */
  onViewMore: () => void;
}
```

- セクションタイトル: `"最近のできごと"` + `"もっと見る →"` リンク（右寄せ）
- 最大表示件数: **5件**（旧設計の10件から削減）
- `"もっと見る"` クリック → `setCurrentView("historySearch")` で「あなたの記録」画面に遷移
- ローディング状態: `"読み込み中..."` テキスト中央配置
- 遷移先が未実装の場合: ボタンを `disabled` 状態にする

##### TimelineItem（各項目）

| 要素       | 仕様                                                             |
| ---------- | ---------------------------------------------------------------- |
| レイアウト | 全幅カード、最低高さ 64px（リスト項目推奨サイズ準拠）            |
| 構成       | アイコン（左） + タイトル（中央） + 相対時刻（右）のみ           |
| プレビュー | **なし**（旧設計の説明テキストは削除 -- L1にはタイトルのみ）     |
| アイコン   | タイプ別 lucide アイコン、`--text-secondary` カラー、20px        |
| タイトル   | `text-sm text-[var(--text-primary)]`、1行に収まるよう `truncate` |
| 相対時刻   | `text-xs text-[var(--text-muted)]`、右寄せ                       |
| 区切り     | 各項目間に `--border-subtle` の1pxボーダー                       |

- タイプ別アイコンマッピング:
  - `success` → `CheckCircle`（lucide-react）
  - `info` → `Info`
  - `warning` → `AlertTriangle`
  - `error` → `XCircle`

##### TimelineItem タップ時のインライン展開（L2）

タップすると項目が展開され、詳細情報がインライン表示される（画面遷移しない）:

```
┌──────────────────────────────────────────────────────┐
│ ○ CheckCircle  ツールを実行しました         2分前   │ ← L1: タイトルのみ
│   ├─ ツール名: data-analyzer                         │ ← L2: タップ後展開
│   ├─ 結果: 正常完了                                  │
│   └─ [詳細を見る →]                                  │
└──────────────────────────────────────────────────────┘
```

- 展開アニメーション: `max-height: 0→auto` + `opacity: 0→1` 200ms `var(--ease-out)`
- 「詳細を見る」リンクで該当画面に遷移（実装済みの画面のみ有効）
- 再タップで折りたたみ（トグル動作）

##### マイクロインタラクション

| 操作   | CSS                                                                        |
| ------ | -------------------------------------------------------------------------- |
| ホバー | `background: var(--bg-elevated)` + `transition: var(--duration-fast)`      |
| タップ | `scale(var(--scale-active))` → `success-bounce` 300ms → インライン展開     |
| 出現   | 各項目に `opacity: 0→1` + `translateY(8px→0)` をスタガーで適用（50ms間隔） |

---

## 5. 状態管理

### 5.1 DashboardSlice 簡素化

既存の `dashboardSlice.ts`（54行）を**簡素化**する。統計関連フィールドを全て削除し、サジェスチョンを追加する。

```typescript
// 簡素化した DashboardSliceExtension
interface DashboardSliceExtension {
  // サジェスチョン
  suggestions: SuggestionItem[];

  // 背景情報（サジェスチョン生成用）
  homeContext: HomeContext;

  // 新規Actions
  setSuggestions: (suggestions: SuggestionItem[]) => void;
  updateHomeContext: (context: Partial<HomeContext>) => void;
  refreshHome: () => Promise<void>;
}

interface HomeContext {
  /** インポート済みツール数 */
  skillCount: number;
  /** 最後のツール実行日時（null = 未実行） */
  lastExecutionAt: string | null;
  /** アクティビティ件数 */
  activityCount: number;
}
```

**削除するフィールド**（旧設計から除去）:

| 削除フィールド        | 理由                         | 移動先              |
| --------------------- | ---------------------------- | ------------------- |
| `skillExecutionCount` | StatCard削除に伴い不要       | 設定 > システム情報 |
| `chatSessionCount`    | StatCard削除に伴い不要       | 設定 > システム情報 |
| `fileCount`           | StatCard削除に伴い不要       | 設定 > システム情報 |
| `storageUsage`        | StatCard削除に伴い不要       | 設定 > システム情報 |
| `weeklySkillDelta`    | TrendBadge完全削除に伴い不要 | --                  |
| `dailyChatDelta`      | TrendBadge完全削除に伴い不要 | --                  |
| `weeklyFileDelta`     | TrendBadge完全削除に伴い不要 | --                  |
| `isRefreshing`        | 手動更新ボタン削除に伴い不要 | --                  |
| `isRefreshError`      | 手動更新ボタン削除に伴い不要 | --                  |
| `refreshErrorMessage` | 手動更新ボタン削除に伴い不要 | --                  |

### 5.2 個別セレクタ（P31対策）

```typescript
// 既存セレクタ（維持）
export const useActivityFeed = () => useAppStore((s) => s.activityFeed);
export const useHomeIsLoading = () => useAppStore((s) => s.isLoading);

// 新規セレクタ
export const useSuggestions = () => useAppStore((s) => s.suggestions);
export const useHomeContext = () => useAppStore((s) => s.homeContext);
export const useRefreshHome = () => useAppStore((s) => s.refreshHome);

// 削除するセレクタ（旧設計から除去）
// useSkillExecutionCount, useChatSessionCount, useWeeklySkillDelta,
// useDailyChatDelta, useWeeklyFileDelta, useIsRefreshing,
// useIsRefreshError, useRefreshErrorMessage, useClearRefreshError
```

### 5.3 データフロー

```
Main Process (アクティビティ取得 + 背景情報集計)
    │
    ▼ IPC: dashboard:get-activity   (既存チャンネル名、変更なし)
Preload Bridge (safeInvoke)
    │
    ▼
DashboardSlice.refreshHome()
    │
    ├── setActivityFeed()                         ← 既存
    ├── updateHomeContext()                        ← 新規（背景情報集計）
    └── setSuggestions(getSuggestions(context))    ← 新規（サジェスチョン生成）
```

- 初回マウント時に `refreshHome()` を呼び出し
- 自動更新（ポーリング）は実装しない（パフォーマンスリスク回避）
- 手動更新ボタンは削除（データは画面遷移時に自動取得）

### 5.4 refreshHome 実装パターン

```typescript
refreshHome: async () => {
  set({ isLoading: true });
  try {
    const activity = await window.electronAPI.dashboard.getActivity();
    const context: HomeContext = {
      skillCount: activity.filter((a) => a.type === "skill_import").length,
      lastExecutionAt:
        activity.find((a) => a.type === "skill_execution")?.time ?? null,
      activityCount: activity.length,
    };
    const suggestions = getSuggestions(context);
    set({
      activityFeed: activity,
      homeContext: context,
      suggestions,
      isLoading: false,
    });
  } catch {
    set({ isLoading: false });
    // エラー時もキャッシュ済みデータを維持（空にしない）
  }
},
```

### 5.5 IPC活用（既存のみ、新規不要）

| 操作               | チャンネル               | 方向          | 備考                         |
| ------------------ | ------------------------ | ------------- | ---------------------------- |
| アクティビティ取得 | `dashboard:get-activity` | Renderer→Main | 既存（dashboardHandlers.ts） |

新規IPCチャンネルは不要。`dashboard:get-stats` は本画面では使用しない（設定 > システム情報で利用）。

---

## 6. レスポンシブ仕様

| ブレークポイント | SuggestionSection | RecentTimeline |
| ---------------- | ----------------- | -------------- |
| lg (1024px+)     | 3カード横並び     | フル幅         |
| md (768-1023px)  | 3カード横並び     | フル幅         |
| sm (<768px)      | 2カード + 折返し  | フル幅         |

- DashboardView全体: `p-6`（lg）、`p-4`（sm）
- セクション間: `gap-6`（lg）、`gap-4`（sm）
- サジェスチョンカード: 固定 `120 x 120px`（レスポンシブで縮小しない）

---

## 7. スタイリング仕様

### 7.1 カラー

全てCSS変数（00-design-foundation.md準拠）を使用:

| 要素                     | 変数               |
| ------------------------ | ------------------ |
| 背景（View全体）         | `--bg-primary`     |
| サジェスチョンカード背景 | `--bg-tertiary`    |
| サジェスチョンホバー     | `--bg-elevated`    |
| タイムライン項目ホバー   | `--bg-elevated`    |
| タイトルテキスト         | `--text-primary`   |
| 説明テキスト             | `--text-secondary` |
| 相対時刻テキスト         | `--text-muted`     |
| アクセントアイコン       | `--status-primary` |
| ボーダー                 | `--border-subtle`  |

### 7.2 スペーシング

| 要素                           | 値                   |
| ------------------------------ | -------------------- |
| ページパディング               | `--spacing-6` (24px) |
| セクション間ギャップ           | `--spacing-6` (24px) |
| サジェスチョンカード間ギャップ | `--spacing-4` (16px) |
| タイムライン項目内パディング   | `--spacing-4` (16px) |
| アイコンとテキスト間           | `--spacing-2` (8px)  |

### 7.3 シャドウ・角丸

| 要素                   | シャドウ      | 角丸                 |
| ---------------------- | ------------- | -------------------- |
| SuggestionBubble       | `--shadow-sm` | `--radius-lg` (12px) |
| SuggestionBubbleホバー | `--shadow-md` | `--radius-lg` (12px) |
| TimelineItem           | なし          | `--radius-md` (8px)  |
| EmptyState             | なし          | `--radius-lg` (12px) |

### 7.4 CSS変数（Tap&Discover基盤）

本タスクで使用するCSS変数:

| 変数                | 値             | 用途                         |
| ------------------- | -------------- | ---------------------------- |
| `--ease-bounce`     | イージング関数 | タップ後のバウンスに使用     |
| `--ease-anticipate` | イージング関数 | 予備動作のあるアニメーション |
| `--ease-out`        | イージング関数 | 出現アニメーション           |
| `--scale-hover`     | `1.02`         | ホバー時のスケール           |
| `--scale-active`    | `0.97`         | アクティブ時のスケール       |
| `--scale-bounce`    | `1.05`         | バウンス到達点のスケール     |
| `--duration-fast`   | `150ms`        | 高速トランジション           |
| `--shadow-sm`       | 小さい影       | カード通常状態               |
| `--shadow-md`       | 中間の影       | カードホバー状態             |

### 7.5 タッチターゲット

| 要素                   | 最小サイズ         | 推奨サイズ              |
| ---------------------- | ------------------ | ----------------------- |
| SuggestionBubbleカード | 80px               | 120px（本タスクで採用） |
| ボタン（もっと見る等） | 44px               | --                      |
| TimelineItem           | 64px（min-height） | --                      |

### 7.6 マイクロインタラクション一覧

| 要素             | 操作       | CSS / アニメーション                                                                                     |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| SuggestionBubble | ホバー     | `transform: scale(1.02); box-shadow: var(--shadow-md); transition: var(--duration-fast) var(--ease-out)` |
| SuggestionBubble | アクティブ | `transform: scale(0.97); transition-duration: 50ms`                                                      |
| SuggestionBubble | タップ後   | `success-bounce` 300ms `var(--ease-bounce)` → 画面遷移                                                   |
| TimelineItem     | ホバー     | `background: var(--bg-elevated); transition: var(--duration-fast)`                                       |
| TimelineItem     | タップ     | `scale(0.97)` → `success-bounce` → インライン展開                                                        |
| TimelineItem     | 出現       | `opacity: 0→1` + `translateY(8px→0)` スタガー 50ms間隔                                                   |
| GreetingText     | 出現       | `opacity: 0→1` + `translateY(8px→0)` 200ms `var(--ease-out)`                                             |
| EmptyState       | 出現       | `opacity: 0→1` + `translateY(8px→0)` 200ms `var(--ease-out)`                                             |

---

## 8. ゼロステート

### 8.1 表示条件

`activityFeed.length === 0 && !isLoading`

### 8.2 EmptyState mood="welcoming" 使用

00-design-foundation で定義済みの `EmptyState` コンポーネントを `mood="welcoming"` で使用する。独自の `ZeroStateCard` は作成しない。

```typescript
<EmptyState
  icon="Sparkles"
  heading="こんにちは！"
  description="AIWorkflowOrchestratorへようこそ。ツールを追加してAIワークフローを始めてみよう。"
  mood="welcoming"
  suggestions={[
    {
      label: "ツールを探す",
      icon: "Search",
      onClick: () => setCurrentView("skillCenter"),
    },
    {
      label: "作業スペースを見る",
      icon: "FolderOpen",
      onClick: () => setCurrentView("workspace"),
    },
  ]}
/>
```

- `mood="welcoming"` により:
  - アイコンカラー: `--status-primary`
  - 背景: うっすら青グラデーション
  - 出現アニメーション: `opacity: 0→1` + `translateY(8px→0)` 200ms `var(--ease-out)`
- UX言語（5D準拠）:
  - 「はじめましょう！」→「こんにちは！」
  - 「スキルセンターを開く」→「ツールを探す」
  - 「ワークスペースを見る」→「作業スペースを見る」
- ゼロステート表示時も SuggestionSection は表示する（サジェスチョンが初回用に切り替わる）
- RecentTimeline の代わりに EmptyState を表示

---

## 9. アクセシビリティ（WCAG 2.1 AA）

| 要素              | ARIA属性                                                   |
| ----------------- | ---------------------------------------------------------- |
| DashboardView     | `data-testid="home-view"`                                  |
| GreetingHeader    | `role="banner"`, `aria-label="挨拶"`                       |
| SuggestionSection | `role="navigation"`, `aria-label="おすすめの次のステップ"` |
| SuggestionBubble  | `role="button"`, `aria-label="{label}"`                    |
| RecentTimeline    | `role="region"`, `aria-label="最近のできごと"`             |
| TimelineItem      | `role="button"`, `aria-label="{title} {relativeTime}"`     |
| TimelineExpanded  | `role="region"`, `aria-label="{title}の詳細"`              |
| MoreLink          | `role="link"`, `aria-label="もっと見る"`                   |
| EmptyState        | `role="region"`, `aria-label="こんにちは"`                 |

- キーボード: Tab でフォーカス移動、Enter/Space でアクティベート（タイムライン展開含む）
- コントラスト比: 全テーマで `--text-primary` on `--bg-primary` が 4.5:1 以上であることを検証
- フォーカスリング: `outline: 2px solid var(--status-primary)` + `outline-offset: 2px`

---

## 10. テスト計画

### 10.1 ユニットテスト

| テスト対象        | テストケース                                                                                    | 数  |
| ----------------- | ----------------------------------------------------------------------------------------------- | --- |
| GreetingHeader    | 時間帯別挨拶テキスト（朝/昼/夜）、userName有無、出現アニメーションクラス                        | 5   |
| SuggestionSection | 背景情報別サジェスチョン表示（初回/未実行/実行済み）、クリック遷移、マイクロインタラクションCSS | 5   |
| RecentTimeline    | タイムライン表示（5件制限）、空リスト、「もっと見る」クリック、タイプ別アイコン、インライン展開 | 6   |
| EmptyState統合    | mood="welcoming"表示、サジェスチョンバブルクリック、出現アニメーション                          | 3   |
| DashboardView     | 統合テスト: 全セクション描画、ゼロステート切替、背景情報適応、L1要素数確認（最大4個）           | 4   |

合計: 約23テストケース

### 10.2 テスト環境ルール

| ルール                         | 根拠 | 対策                                        |
| ------------------------------ | ---- | ------------------------------------------- |
| `fireEvent` を使用             | P39  | `fireEvent.click()` + `act()`               |
| パッケージディレクトリから実行 | P40  | `cd apps/desktop && pnpm vitest run` で実行 |
| テスト間状態リセット           | P9   | `beforeEach` で DOM / store リセット        |
| 個別セレクタのみ使用           | P31  | 合成Hookを使用しない                        |

### 10.3 テスト実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/DashboardView/
cd apps/desktop && pnpm vitest run src/renderer/components/molecules/GreetingHeader/
cd apps/desktop && pnpm vitest run src/renderer/components/molecules/SuggestionSection/
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/RecentTimeline/
```

---

## 11. 成果物（ファイルパス）

| #   | 成果物                  | パス                                                                         | 種別 |
| --- | ----------------------- | ---------------------------------------------------------------------------- | ---- |
| 1   | DashboardView (改修)    | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                    | 改修 |
| 2   | GreetingHeader          | `apps/desktop/src/renderer/components/molecules/GreetingHeader/index.tsx`    | 新規 |
| 3   | SuggestionSection       | `apps/desktop/src/renderer/components/molecules/SuggestionSection/index.tsx` | 新規 |
| 4   | RecentTimeline          | `apps/desktop/src/renderer/components/organisms/RecentTimeline/index.tsx`    | 新規 |
| 5   | dashboardSlice (簡素化) | `apps/desktop/src/renderer/store/slices/dashboardSlice.ts`                   | 改修 |
| 6   | 型定義 (簡素化)         | `apps/desktop/src/renderer/store/types.ts`                                   | 改修 |

**削除する成果物**（旧設計から除去）:

| 旧成果物          | 理由                              |
| ----------------- | --------------------------------- |
| StatsCardGrid     | StatCard群の完全削除              |
| StatCard x4       | 完全削除（設定 > システム情報へ） |
| TrendBadge        | 完全削除                          |
| QuickActionBar    | SuggestionSection で代替          |
| QuickActionButton | SuggestionBubble（00基盤）で代替  |
| ZeroStateCard     | EmptyState（00基盤）で代替        |
| DashboardHeader   | GreetingHeader に置換             |

**流用する00基盤コンポーネント**（本タスクでは新規作成しない）:

| コンポーネント   | 定義元                       | 使用箇所                      |
| ---------------- | ---------------------------- | ----------------------------- |
| SuggestionBubble | 00-design-foundation Task 5B | SuggestionSection, EmptyState |
| EmptyState       | 00-design-foundation Task 5B | ゼロステート表示              |

### テストファイル

| #   | テスト対象        | パス                                                                                          |
| --- | ----------------- | --------------------------------------------------------------------------------------------- |
| 1   | DashboardView     | `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`                        |
| 2   | GreetingHeader    | `apps/desktop/src/renderer/components/molecules/GreetingHeader/GreetingHeader.test.tsx`       |
| 3   | SuggestionSection | `apps/desktop/src/renderer/components/molecules/SuggestionSection/SuggestionSection.test.tsx` |
| 4   | RecentTimeline    | `apps/desktop/src/renderer/components/organisms/RecentTimeline/RecentTimeline.test.tsx`       |

---

## 12. 完了条件

- [ ] タイトルが「ホーム」と表示される（5D.3準拠）
- [ ] GreetingHeader が時間帯に応じた挨拶を表示（朝/昼/夜の3パターン）
- [ ] 挨拶テキストに出現アニメーション（opacity 0→1 + translateY 8px→0）が適用される
- [ ] SuggestionSection に背景情報に応じたサジェスチョンカード（2~3枚）が表示される
- [ ] サジェスチョンカードのサイズが 120 x 120px である
- [ ] サジェスチョンカードのホバー: `scale(1.02)` + `shadow-md`
- [ ] サジェスチョンカードのアクティブ: `scale(0.97)`
- [ ] サジェスチョンカードのタップ後: `success-bounce` 300ms → 画面遷移
- [ ] サジェスチョンカードクリックで対象画面に遷移する
- [ ] RecentTimeline が直近5件のアクティビティを表示（アイコン + タイトル + 相対時刻のみ）
- [ ] タイムライン各項目の高さが最低 64px
- [ ] タイムライン項目タップでインライン展開（L2）が動作する
- [ ] タイムライン項目の出現にスタガーアニメーション（50ms間隔）が適用される
- [ ] 「もっと見る」クリックで「あなたの記録」画面に遷移
- [ ] EmptyState mood="welcoming" が `activityFeed.length === 0 && !isLoading` 時に表示される
- [ ] ゼロステートの見出しが「こんにちは！」である
- [ ] ゼロステート表示時も SuggestionSection は表示される（初回用サジェスチョンに切替）
- [ ] StatCard x4 がホーム画面に存在しない
- [ ] TrendBadge がホーム画面に存在しない
- [ ] DashboardSlice から stats関連フィールドが全て削除されている
- [ ] DashboardSlice の個別セレクタが全て定義されている（P31対策）
- [ ] UX言語が5D準拠（「ダッシュボード」→「ホーム」、「スキル」→「ツール」、「エージェント」→「AIアシスタント」等）
- [ ] 全テーマ（kanagawa-dragon/light/dark）で表示正常
- [ ] lucide-react アイコンのみ使用（絵文字不使用）
- [ ] WCAG 2.1 AA のコントラスト比要件を全テーマで充足
- [ ] 関連テスト約23ケースが全て PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること

---

## 13. 既知の落とし穴・教訓

| Pitfall | 内容                                    | 対策                                                   |
| ------- | --------------------------------------- | ------------------------------------------------------ |
| P31     | Zustand合成Hook無限ループ               | 個別セレクタのみ使用。合成Hookは`@deprecated`          |
| P5      | リスナー二重登録（React StrictMode）    | IPC リスナーはモジュールレベルでガード                 |
| P39     | happy-dom環境でのuserEvent非互換        | テストでは`fireEvent`を使用                            |
| P40     | テスト実行ディレクトリ依存              | `cd apps/desktop && pnpm vitest run` で実行            |
| P9      | モジュールスコープ変数のテスト間リーク  | `beforeEach` でリセット                                |
| --      | HistorySearchView未実装時のリンク       | 遷移先が未実装の場合はリンク非活性化（disabled状態）   |
| --      | 時間帯テストの非決定性                  | `getGreeting()` をテスト時にモック可能にする           |
| --      | SuggestionBubble が00基盤で未実装の場合 | 本タスクでは仮実装で対応し、00基盤タスク完了後に差替え |
| --      | インライン展開のアクセシビリティ        | `aria-expanded` 属性でトグル状態を通知する             |

---

## 14. 参照資料

| 資料                   | パス / 参照先                                              |
| ---------------------- | ---------------------------------------------------------- |
| 共通基盤コンポーネント | TASK-UI-00 (`task-050-ui-00-ui-design-foundation.md`)      |
| アーキテクチャ仕様     | TASK-UI-01 (`task-056-ui-01-store-ipc-architecture.md`)    |
| GlobalNavStrip仕様     | TASK-UI-02 (`task-057-ui-02-global-nav-core.md`)           |
| HistorySearch仕様      | TASK-UI-06 (`task-063-ui-06-history-search-view.md`)       |
| 既存DashboardView      | `apps/desktop/src/renderer/views/DashboardView/index.tsx`  |
| 既存dashboardSlice     | `apps/desktop/src/renderer/store/slices/dashboardSlice.ts` |
| 既存dashboardHandlers  | `apps/desktop/src/main/ipc/dashboardHandlers.ts`           |
| 既存Store型定義        | `apps/desktop/src/renderer/store/types.ts`                 |
| アーキテクチャルール   | `.claude/rules/01-architecture.md`                         |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                     |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                       |

---

## 15. 次のPhase

本タスクは Phase 1-13 ワークフローに従って実装する。

- **Phase 1**: 要件定義（本仕様書）
- **Phase 2**: 設計（コンポーネント詳細設計、データフロー設計）
- **Phase 3**: 設計レビュー
- **Phase 4**: テスト作成（TDD: 約23テストケース先行作成）
- **Phase 5**: 実装（DashboardView改修 + 新規コンポーネント3ファイル + Slice簡素化）
- **Phase 6-7**: テスト拡充・カバレッジ確認
- **Phase 8**: リファクタリング
- **Phase 9**: 品質検証（Lint・型チェック・全テスト）
- **Phase 10**: 最終レビュー
- **Phase 11**: 手動テスト（全テーマ x 全レスポンシブモード）
- **Phase 12**: ドキュメント更新
- **Phase 13**: 完了・PR準備
