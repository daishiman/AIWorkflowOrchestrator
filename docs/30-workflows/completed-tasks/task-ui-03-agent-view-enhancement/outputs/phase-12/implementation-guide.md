# AIアシスタント画面リデザイン 実装ガイド

## Part 1: 中学生向けのやさしい説明

まず「なぜ必要か」から説明します。前の画面は、最初から設定や細かい情報が多く、最初の一歩で迷いやすい構造でした。そこで、最初に触る場所をはっきりさせるために、このリデザインが必要でした。
次に「何をするか」を説明します。最初の画面は選択と実行だけにし、詳しい設定は必要なときだけ開く形に分けます。

### なぜ画面を作り直したのか

前の画面は、最初から設定や細かい情報がたくさん出ていて、どこから触ればよいか分かりにくい状態でした。
たとえば、スマートフォンのホーム画面を想像してください。ホーム画面にはアプリのアイコンだけがきれいに並んでいて、使いたいアプリをタップするだけですぐ使えます。設定画面は「設定」アイコンを開いたときだけ出てきます。

この「最初はシンプルに、詳しいことは必要なときだけ」という考え方を「Tap & Discover（タップして発見する）」と呼んでいます。

### 3つの大事な部品

新しい画面には、大きく分けて3つの部品があります。

#### 1. できること（ツールのチップ）

お店のショーケースを思い浮かべてください。ショーケースには人気の商品だけが大きく並んでいます。この画面でも、AIができること（「検索する」「文章を作る」など）が大きな丸いアイコンで並んでいます。使いたいものをタップして選ぶだけです。

#### 2. 実行ボタン

選んだツールを動かすためのボタンです。お店でいうとレジのようなものです。商品（ツール）を選んだあと、このボタンを押すと実行が始まります。まだ何も選んでいないときは、ボタンは薄い色になっていて押せません。

#### 3. 最近の実行

レシートのように、最近やったことの記録が表示されます。「検索ツール - 2分前 - 成功」のように、何をいつやって、うまくいったかどうかが分かります。

### 詳細設定パネル（裏側の設定）

画面の右上にある歯車のボタンを押すと、詳細設定パネルが横からスライドして出てきます。これはお店でいうと「裏のカウンター」のようなものです。ふだんは見えないけど、AIの種類を変えたり、許可の設定を変えたりするときだけ開きます。普段は隠れているので、画面がすっきりして迷いにくくなります。

### まとめ

| 要素           | 日常の例え         | 役割                     |
| -------------- | ------------------ | ------------------------ |
| ツールのチップ | ショーケースの商品 | できることを選ぶ         |
| 実行ボタン     | レジ               | 選んだものを実行する     |
| 最近の実行     | レシート           | 最近やったことを確認する |
| 詳細設定パネル | 裏のカウンター     | AIの種類や許可を変える   |

---

## Part 2: 開発者向けの技術詳細

### コンポーネント階層図

```
AgentView (views/AgentView/index.tsx) [修正]
+-- header
|   +-- h1 "Agent / AIアシスタント"
|   +-- GearIconButton -> AdvancedSettingsPanel 開閉トリガー
+-- section "できること"
|   +-- SkillSearchBar (条件付き表示: 11個以上)
|   +-- SkillChip[] (organisms/AgentView/SkillChip.tsx) [新規]
|   +-- EmptyState (条件付き表示: 0件)
+-- ExecuteButton (organisms/AgentView/ExecuteButton.tsx) [新規]
+-- RecentExecutionList (organisms/AgentView/RecentExecutionList.tsx) [新規]
+-- AdvancedSettingsPanel (organisms/AgentView/AdvancedSettingsPanel.tsx) [新規]
|   +-- ModelSelector (カード型ラジオ)
|   +-- PermissionSettings (モード + リセット)
+-- FloatingExecutionBar (organisms/AgentView/FloatingExecutionBar.tsx) [新規]
    +-- ProgressBar
    +-- StopButton
```

### TypeScript 型定義

#### SkillChip

```typescript
export interface SkillChipProps {
  skillName: string;
  displayName: string;
  icon?: string;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}
```

#### ExecuteButton

```typescript
export interface ExecuteButtonProps {
  selectedSkillName: string | null;
  onExecute: () => void;
  isExecuting: boolean;
}
```

#### FloatingExecutionBar

```typescript
export interface FloatingExecutionBarProps {
  skillName: string;
  status: "executing" | "completed" | "failed" | "idle";
  startedAt: Date | null;
  progress?: number; // 0-100
  onStop: () => void;
}
```

#### AdvancedSettingsPanel

```typescript
export interface ModelCardItem {
  providerId: string;
  modelId: string;
  displayName: string;
  description?: string;
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}

export interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  permissionMode: string;
  onModeChange: (mode: string) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}
```

#### RecentExecutionList

```typescript
export interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null; // ミリ秒
}

export interface RecentExecutionListProps {
  executions: ExecutionSummary[];
  onSelectExecution: (executionId: string) => void;
  maxItems?: number; // デフォルト: 3
}
```

### コンポーネント API シグネチャと使用例

```tsx
// SkillChip - ツール選択チップ
<SkillChip
  skillName="search"
  displayName="検索"
  isSelected={selectedSkillName === "search"}
  onSelect={() => selectSkill("search")}
/>

// ExecuteButton - 実行ボタン（未選択時は無効化）
<ExecuteButton
  selectedSkillName={selectedSkillName}
  isExecuting={executionState.status === "executing"}
  onExecute={executeSelectedSkill}
/>

// FloatingExecutionBar - 実行中フローティングバー
<FloatingExecutionBar
  skillName="検索ツール"
  status="executing"
  startedAt={new Date()}
  progress={45}
  onStop={handleAbort}
/>

// AdvancedSettingsPanel - 詳細設定パネル
<AdvancedSettingsPanel
  isOpen={isAdvancedSettingsOpen}
  onClose={() => setAdvancedSettingsOpen(false)}
  models={modelList}
  selectedProviderId={providerId}
  selectedModelId={modelId}
  onSelectModel={handleSelectModel}
  permissionMode="default"
  onModeChange={handleModeChange}
  rememberedCount={3}
  onResetRemembered={handleReset}
/>

// RecentExecutionList - 最近の実行履歴
<RecentExecutionList
  executions={recentExecutions}
  onSelectExecution={handleSelectExecution}
  maxItems={3}
/>
```

### 状態管理パターン（agentSlice 拡張）

既存の agentSlice に以下のフィールドとアクションを追加した。14個のスライス統合パターンを維持。

```typescript
// 新規フィールド
recentExecutions: ExecutionSummary[];   // 実行履歴（最大10件）
isAdvancedSettingsOpen: boolean;        // 詳細設定パネル開閉

// 新規アクション
addExecutionToHistory: (summary: ExecutionSummary) => void;  // 先頭追加、10件超で末尾削除
clearExecutionHistory: () => void;                            // 全クリア
setAdvancedSettingsOpen: (isOpen: boolean) => void;           // 開閉制御
```

#### 個別セレクタパターン（P31対策）

合成Store Hookの無限ループ問題（P31）を回避するため、個別セレクタを使用:

```typescript
export const useRecentExecutions = () =>
  useAppStore((state) => state.recentExecutions);
export const useAddExecutionToHistory = () =>
  useAppStore((state) => state.addExecutionToHistory);
export const useIsAdvancedSettingsOpen = () =>
  useAppStore((state) => state.isAdvancedSettingsOpen);
export const useSetAdvancedSettingsOpen = () =>
  useAppStore((state) => state.setAdvancedSettingsOpen);
```

### マイクロインタラクション実装詳細

共通アニメーション定数は `animations.ts` で管理:

```typescript
export const transitions = {
  hover: "transition-transform duration-200 ease", // ホバー: 200ms
  tap: "transition-transform duration-100 ease-in", // タップ: 100ms
  slideIn: "transition-transform duration-300 ease-out", // スライドイン: 300ms
  slideOut: "transition-transform duration-200 ease-in", // スライドアウト: 200ms
  colorFade: "transition-colors duration-200 ease", // 色変化: 200ms
  all: "transition-all duration-200 ease", // 全プロパティ: 200ms
} as const;
```

共通スタイル定数は `styles.ts` で管理:

```typescript
export const spacing = {
  sectionGap: "gap-6", // 24px (8px x 3)
  chipGap: "gap-4", // 16px (8px x 2)
  containerPadding: "p-6", // 24px
  sectionHeader: "mb-3", // 12px
} as const;

export const interactiveStyles = {
  iconButton:
    "p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors duration-200",
  cardHover: "cursor-pointer transition-colors duration-200",
} as const;
```

### エラーハンドリングとエッジケース

| エッジケース                 | 挙動                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| `selectedSkillName === null` | ExecuteButton を `disabled` にし、「ツールを選んでください」を表示   |
| 実行失敗時                   | FloatingExecutionBar を赤色の失敗状態で表示し、3秒後にスライドアウト |
| スキル0件                    | EmptyState を表示し「ツールがありません」メッセージ                  |
| スキル11件以上               | 検索バーを表示して絞り込み可能に                                     |
| `isExecuting === true`       | ExecuteButton を非表示にし、FloatingExecutionBar を表示              |
| ESCキー押下                  | AdvancedSettingsPanel を閉じる                                       |

### 設定項目・定数一覧

| 項目                             | 値                                               |
| -------------------------------- | ------------------------------------------------ |
| レイアウト最大幅                 | `max-width: 600px`                               |
| SkillChipアイコンサイズ          | `80x80px`                                        |
| ExecuteButton高さ                | `py-3`（約48px）                                 |
| FloatingExecutionBar最小幅       | `300px`                                          |
| 実行履歴最大保持件数             | `10件`（MAX_EXECUTION_HISTORY）                  |
| 実行履歴表示件数                 | `3件`（RecentExecutionList.maxItems デフォルト） |
| hover時間                        | `200ms ease`                                     |
| tap時間                          | `100ms ease-in`                                  |
| slide-in時間                     | `300ms ease-out`                                 |
| slide-out時間                    | `200ms ease-in`                                  |
| z-index（GlobalNavStrip）        | `z-20`                                           |
| z-index（AdvancedSettingsPanel） | `z-40`                                           |
| z-index（FloatingExecutionBar）  | `z-50`                                           |

### テスト実行方法

```bash
# AgentView関連テスト全実行
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/

# 個別コンポーネントテスト
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx
cd apps/desktop && pnpm exec vitest run src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx

# レイアウト統合テスト
cd apps/desktop && pnpm exec vitest run src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx

# AgentSlice拡張テスト
cd apps/desktop && pnpm exec vitest run src/renderer/store/slices/__tests__/agentSlice.extension.test.ts
```

### 実装の整合確認コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement
```
