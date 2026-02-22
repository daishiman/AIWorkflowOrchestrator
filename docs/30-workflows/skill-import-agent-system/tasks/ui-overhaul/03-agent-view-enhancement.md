# TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AIアシスタント画面リデザイン

## 1. メタ情報

| 項目             | 値                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------ |
| タスクID         | TASK-UI-03-AGENT-VIEW-ENHANCEMENT                                                          |
| タスク名         | AIアシスタント画面リデザイン（Tap & Discover + Apple HIG準拠）                             |
| 優先度           | 高（難易度低 x Impact高）                                                                  |
| 複雑度           | medium                                                                                     |
| 依存タスク       | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ基盤）, TASK-UI-02（GlobalNavStrip） |
| ブロック対象     | なし（独立して完了可能）                                                                   |
| 推定影響ファイル | 6〜10ファイル                                                                              |

## 2. 目的

既存の AgentView を「Tap & Discover」体験に全面リデザインする。Level 1 は大きなツールチップ + 実行ボタン + 最近の実行の3要素のみで構成し、モデル選択・権限設定は Level 2（詳細設定パネル）に隠蔽する。ユーザーが最初に見る画面は「何ができるか」と「実行する」だけに絞り、認知負荷を最小化する。既存ロジック（agentSlice, useSkillExecution, useSkillPermission 等）は維持する。

### UX言語マッピング（5D準拠）

UIテキスト上の表記を以下の通り統一する。コード識別子（変数名・型名・ファイル名等）は既存のまま維持する。

| 技術用語           | UIテキスト表記      |
| ------------------ | ------------------- |
| エージェントビュー | AIアシスタント      |
| スキル             | ツール / できること |
| パーミッション     | 許可                |
| モデル選択         | AIの種類            |
| プロバイダ         | AI                  |

## 3. Why（なぜ必要か）

### 現状の課題

1. **情報過多**: 2カラム x 5カードコンポーネント（AgentStatus / ModelSelector / SkillSelector / Permission / RecentExecution）が同時に表示され、初見ユーザーがどこから操作すべきか判断できない
2. **操作フローが不明瞭**: 「ツールを選ぶ -> 実行する」という単純なフローが、設定項目の中に埋もれている
3. **認知負荷が高い**: モデル選択や権限設定など、多くのユーザーが気にしない設定が Level 1 に露出している

### リデザインの方針: Tap & Discover

- **Level 1**（最初に見える画面）: ツール選択チップ + 「実行する」ボタン + 最近の実行（最大3件）= **3要素**
- **Level 2**（タップで展開）: 詳細設定パネル（AIの種類、許可設定）
- **全操作にフィードバック**: hover / tap / 選択 の各状態変化を視覚的に明示
- **デフォルト自動選択**: モデルはデフォルトが自動選択され、ユーザーは変更不要
- **権限は都度リクエスト**: 実行時にAIが必要な権限を都度要求する形式

## 4. 画面構成図（ASCII）

### Level 1: メイン画面（シングルカラム、中央寄せ max-width: 600px）

```
+---------------------------------------------------+
|              AIアシスタント                          |
|        (中央寄せ, max-width: 600px)                |
|                                            [gear]  |
|                                                     |
|  +-----------------------------------------------+ |
|  | できること                                     | |
|  |                                                 | |
|  |   +------+  +------+  +------+  +------+      | |
|  |   |      |  |      |  |      |  |      |      | |
|  |   | icon |  | icon |  | icon |  | icon |      | |
|  |   |      |  |      |  |      |  |      |      | |
|  |   +------+  +------+  +------+  +------+      | |
|  |    検索      文章      画像      分析           | |
|  |                                                 | |
|  |   +------+  +------+                            | |
|  |   |      |  |      |                            | |
|  |   | icon |  | icon |                            | |
|  |   |      |  |      |                            | |
|  |   +------+  +------+                            | |
|  |    開発     ファイル                              | |
|  |                                                 | |
|  |  (10個以下: 検索バー非表示)                     | |
|  |  (11個以上: 上部にインライン検索出現)            | |
|  +-----------------------------------------------+ |
|                                                     |
|  +-----------------------------------------------+ |
|  |                                                 | |
|  |         [  >>> 実行する  ]                      | |
|  |                                                 | |
|  |   (全幅, 高さ56px, 角丸12px, アクセントカラー)  | |
|  |   (ツール未選択時: "ツールを選んでください"      | |
|  |    disabled状態, opacity-50)                     | |
|  +-----------------------------------------------+ |
|                                                     |
|  +-----------------------------------------------+ |
|  | 最近の実行                                      | |
|  |                                                 | |
|  |  > 検索ツール      [check]  2分前               | |
|  |  > 文章作成         [x]     5分前               | |
|  |  > コード分析       [spin]  実行中               | |
|  |                                                 | |
|  |  (0件: "まだ実行履歴がありません")               | |
|  +-----------------------------------------------+ |
|                                                     |
+---------------------------------------------------+
```

### Level 2: 詳細設定パネル（スライドインパネル）

```
+---------------------------------------------------+
|                                                     |
|  (メイン画面がオーバーレイで暗くなる)                |
|                                                     |
|  +-----------------------------------------------+ |
|  | 詳細設定                              [x 閉じる]| |
|  |                                                 | |
|  |  +-------------------------------------------+ | |
|  |  | AIの種類                                   | | |
|  |  |                                             | | |
|  |  |  (o) Claude Opus 4.6      [*] 最高性能     | | |
|  |  |  ( ) Claude Sonnet 4      [*] バランス型   | | |
|  |  |  ( ) Claude Haiku 3.5     [*] 高速         | | |
|  |  |                                             | | |
|  |  |  ヘルスステータス: [green] 正常             | | |
|  |  +-------------------------------------------+ | |
|  |                                                 | |
|  |  +-------------------------------------------+ | |
|  |  | 許可設定                                   | | |
|  |  |                                             | | |
|  |  |  モード: [Standard v]                      | | |
|  |  |  記憶済み: 3件  [リセット]                  | | |
|  |  +-------------------------------------------+ | |
|  |                                                 | |
|  +-----------------------------------------------+ |
|                                                     |
+---------------------------------------------------+
```

### 実行中: フローティングバー（画面下部固定）

```
+---------------------------------------------------+
| (メイン画面はそのまま表示)                           |
|                                                     |
|  ...                                                |
|                                                     |
| +-----------------------------------------------+  |
| | [spin] 検索ツール 実行中...  0:32  [stop 停止] |  |
| | ============............................. 40%   |  |
| +-----------------------------------------------+  |
+---------------------------------------------------+
```

### 実行完了: success-bounce フィードバック

```
+---------------------------------------------------+
| (メイン画面)                                        |
|                                                     |
| +-----------------------------------------------+  |
| | [check-bounce] 検索ツール 完了!  0:45          |  |
| | ======================================== 100%  |  |
| +-----------------------------------------------+  |
|                                                     |
| (1.5秒後にスライドアウトして消える)                  |
+---------------------------------------------------+
```

## 5. 実行タスク

### Task 1: SkillChip コンポーネント作成

**概要**: 80x80px の丸アイコン + スキル名テキストのチップコンポーネント。ユーザーが「できること」を直感的に選択できる大きなタッチターゲット。

#### 実装要件

- サイズ: 80x80px の丸アイコン + 下部にスキル名テキスト（全体高さ約110px）
- アイコン: スキルメタデータの `icon` フィールドを使用、未設定時はデフォルトアイコン（ツールモチーフ）
- 選択状態: アクセントカラーのリング + チェックマークオーバーレイ
- **アクセシビリティ**: `role="radio"` + `aria-checked` + `aria-label={skillDisplayName}`

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

#### マイクロインタラクション（Tap & Discover準拠）

| 状態       | スタイル                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------- |
| デフォルト | `border-2 border-transparent bg-[var(--bg-secondary)]`                                    |
| ホバー     | `scale(1.05) transition-transform duration-200`                                           |
| タップ     | `scale(0.97) transition-transform duration-100`                                           |
| 選択時     | `scale(0.97) -> scale(1.05) -> scale(1) + border-[var(--status-primary)]` 色変化（300ms） |
| 無効       | `opacity-50 cursor-not-allowed`                                                           |

選択時のアニメーションシーケンス:

1. タップ: `scale(0.97)`（100ms, ease-in）
2. バウンス: `scale(1.05)`（150ms, ease-out）
3. 着地: `scale(1.0)`（100ms, ease-in-out）
4. 同時にボーダーカラーが `transparent` -> `var(--status-primary)` にフェード（200ms）

### Task 2: ExecuteButton コンポーネント作成

**概要**: 全幅の大きなプライマリ実行ボタン。画面の視覚的重心となる要素。

#### 実装要件

- サイズ: 全幅（`w-full`）、高さ 56px（`h-14`）、角丸 12px
- カラー: `bg-[var(--status-primary)]`（Apple systemBlue）、テキスト白、フォント 18px semibold
- ツール未選択時: `disabled` 状態（`opacity-50 cursor-not-allowed`、テキスト: 「ツールを選んでください」）
- ツール選択時: テキスト「実行する」
- クリックで AgentExecutionView に遷移

```typescript
export interface ExecuteButtonProps {
  selectedSkillName: string | null;
  onExecute: () => void;
  isExecuting: boolean;
}
```

#### マイクロインタラクション（Tap & Discover準拠）

| 状態           | スタイル                                                                |
| -------------- | ----------------------------------------------------------------------- |
| デフォルト     | `bg-[var(--status-primary)] text-white rounded-xl h-14`                 |
| ホバー         | `scale(1.02) shadow-md transition-all duration-200`                     |
| タップ         | `scale(0.97) bg-[var(--status-primary)]/80 transition-all duration-150` |
| 無効（未選択） | `opacity-50 cursor-not-allowed`（アニメーションなし）                   |
| 実行中         | ボタン非表示（FloatingExecutionBar に切り替え）                         |

### Task 3: FloatingExecutionBar コンポーネント作成

**概要**: 実行中のみ画面下部に表示されるフローティングプログレスバー。AgentStatusCard の代替。

#### 表示条件

- `executionState.status === 'executing'` の場合: プログレス表示
- `executionState.status === 'completed'` の場合: success-bounce アニメーション後にスライドアウト（1.5秒後）
- `executionState.status === 'failed'` の場合: エラー表示後にスライドアウト（3秒後）
- 非実行時（idle）: 非表示

#### 表示内容

| 項目       | データソース               | 表示形式                           |
| ---------- | -------------------------- | ---------------------------------- |
| スキル名   | `selectedSkillName`        | テキスト                           |
| ステータス | `executionState.status`    | 「実行中...」/ 「完了!」/ 「失敗」 |
| 経過時間   | `executionState.startedAt` | `mm:ss` 形式                       |
| プログレス | `executionState.progress`  | プログレスバー（任意）             |
| 停止ボタン | ---                        | 赤い「停止」ボタン                 |

```typescript
export interface FloatingExecutionBarProps {
  skillName: string;
  status: AgentExecutionStatus;
  startedAt: Date | null;
  progress?: number; // 0-100
  onStop: () => void;
}
```

#### マイクロインタラクション

| 状態                     | アニメーション                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------- |
| 表示（スライドイン）     | `translateY(100%) -> translateY(0)`（300ms, ease-out）                                |
| 非表示（スライドアウト） | `translateY(0) -> translateY(100%)`（200ms, ease-in）                                 |
| 実行完了                 | success-bounce: プログレスバーが緑に変化 + チェックマークが scale(0->1.2->1)（300ms） |
| 実行失敗                 | shake: `translateX(0, -4px, 4px, -4px, 4px, 0)`（300ms）+ 赤色表示                    |
| 固定位置                 | `fixed bottom-0 left-0 right-0 z-50`                                                  |

### Task 4: AdvancedSettingsPanel コンポーネント作成

**概要**: 歯車アイコン（gear）タップで展開するスライドインパネル。デフォルトモデル自動選択とAIが都度権限を要求する設計により、多くのユーザーはこのパネルを開く必要がない。

#### トリガー

- メイン画面右上の歯車アイコンボタン（24x24px、`var(--text-secondary)`）
- ホバー時: `var(--status-primary)` に色変化 + `scale(1.1)`（200ms）
- タップで AdvancedSettingsPanel がスライドイン

#### パネル内容

1. **AIの種類（ModelSelector）**: カード型ラジオ選択
   - デフォルトモデルを自動選択（ユーザーは変更不要）
   - `role="radiogroup"` + `aria-label="AIの種類"`
   - ヘルスバッジ: 右上に小さな丸（green / yellow / red / gray）
   - 各カードにモデルの特徴テキスト（「最高性能」「バランス型」「高速」）

2. **許可設定（Permission）**: モード選択 + 記憶済み件数
   - PermissionMode セレクタ（SDK の `default` / `acceptEdits` / `bypassPermissions` / `plan` / `delegate` / `dontAsk`）
   - 記憶済みの許可選択: 件数表示 + 「リセット」ボタン
   - 説明テキスト: 「実行中にAIが必要な許可を都度リクエストします」

```typescript
export interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // AIの種類
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  // 許可設定
  permissionMode: PermissionMode;
  onModeChange: (mode: PermissionMode) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}

interface ModelCardItem {
  providerId: LLMProviderId;
  modelId: string;
  displayName: string; // "Claude Opus 4.6"
  description?: string; // "最高性能"
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}
```

#### パネル開閉アニメーション

| 状態       | アニメーション                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 開く       | 背景オーバーレイ `opacity 0 -> 0.3`（200ms）+ パネル `translateX(100%) -> 0`（300ms, ease-out） |
| 閉じる     | パネル `translateX(0) -> 100%`（200ms, ease-in）+ オーバーレイ `opacity 0.3 -> 0`（150ms）      |
| 背景タップ | 閉じる動作をトリガー                                                                            |
| ESCキー    | 閉じる動作をトリガー                                                                            |

### Task 5: RecentExecutionList コンポーネント作成

**概要**: 最近のツール実行履歴を最大3件表示するリスト。Level 1 の一部として常に表示。

#### 実装要件

- 最大3件表示（Level 1 に収まる量に制限）
- 各エントリ: スキル表示名 + ステータスアイコン（check / x / spinner）+ 相対時間（「2分前」「1時間前」）
- クリックで AgentExecutionView に遷移（実行詳細表示）
- 空の場合: 「まだ実行履歴がありません」メッセージ（`var(--text-secondary)` テキスト）
- セクションヘッダー: 「最近の実行」（`var(--text-secondary)` 小文字テキスト）

```typescript
export interface RecentExecutionListProps {
  executions: ExecutionSummary[];
  onSelectExecution: (executionId: string) => void;
  maxItems?: number; // デフォルト: 3
}

interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null; // ミリ秒
}
```

#### マイクロインタラクション

| 状態   | スタイル                                                              |
| ------ | --------------------------------------------------------------------- |
| ホバー | `bg-[var(--bg-secondary)] rounded-lg transition-colors duration-150`  |
| タップ | `bg-[var(--bg-tertiary)] transition-colors duration-100`              |
| 新着   | リスト先頭に追加時: `opacity 0 -> 1 + translateY(-8px) -> 0`（200ms） |

### Task 6: AgentView レイアウト統合

**概要**: Task 1〜5 のコンポーネントをシングルカラムレイアウトに統合し、Tap & Discover 体験を実現する。

#### レイアウト実装

```typescript
// AgentView/index.tsx
<div className="flex flex-col items-center h-full p-6">
  <div className="w-full max-w-[600px] flex flex-col gap-6">
    {/* ヘッダー: タイトル + 詳細設定ギアアイコン */}
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        AIアシスタント
      </h1>
      <button
        onClick={() => setAdvancedOpen(true)}
        className="p-2 rounded-lg text-[var(--text-secondary)]
                   hover:text-[var(--status-primary)] hover:scale-110
                   transition-all duration-200"
        aria-label="詳細設定を開く"
      >
        <GearIcon size={24} />
      </button>
    </header>

    {/* ツール選択（SkillChip 群） */}
    <section>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        できること
      </h2>
      <div role="radiogroup" aria-label="ツール選択">
        {importedSkills.length > 10 && (
          <SkillSearchBar filter={filter} onFilterChange={setFilter} />
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {filteredSkills.map(skill => (
            <SkillChip key={skill.name} ... />
          ))}
        </div>
        {importedSkills.length === 0 && (
          <EmptyState
            message="Skill Centerでツールをインポート"
            onAction={onNavigateToSkillCenter}
          />
        )}
      </div>
    </section>

    {/* 実行ボタン */}
    <ExecuteButton
      selectedSkillName={selectedSkillName}
      onExecute={handleExecute}
      isExecuting={isExecuting}
    />

    {/* 最近の実行 */}
    <RecentExecutionList
      executions={recentExecutions}
      onSelectExecution={handleSelectExecution}
      maxItems={3}
    />
  </div>

  {/* 詳細設定パネル（Level 2） */}
  <AdvancedSettingsPanel
    isOpen={isAdvancedOpen}
    onClose={() => setAdvancedOpen(false)}
    ...
  />

  {/* 実行中フローティングバー */}
  {(isExecuting || justCompleted || justFailed) && (
    <FloatingExecutionBar
      skillName={selectedSkillName}
      status={executionStatus}
      startedAt={startedAt}
      progress={progress}
      onStop={handleStop}
    />
  )}
</div>
```

### Task 7: agentSlice 拡張（最小限）

**概要**: 新UIに必要な状態のみ追加。大幅な構造変更は行わない。

#### 追加フィールド

```typescript
// 既存の AgentSlice に追加
interface AgentSliceExtension {
  // 実行履歴サマリー（RecentExecutionList 用）
  recentExecutions: ExecutionSummary[];
  // 詳細設定パネルの開閉状態
  isAdvancedSettingsOpen: boolean;

  // アクション
  addExecutionToHistory: (summary: ExecutionSummary) => void;
  clearExecutionHistory: () => void;
  setAdvancedSettingsOpen: (isOpen: boolean) => void;
}
```

#### 追加セレクタ（P31対策: 個別セレクタパターン）

```typescript
// 新規個別セレクタ
export const useRecentExecutions = () =>
  useAppStore((state) => state.recentExecutions);
export const useAddExecutionToHistory = () =>
  useAppStore((state) => state.addExecutionToHistory);
export const useIsAdvancedSettingsOpen = () =>
  useAppStore((state) => state.isAdvancedSettingsOpen);
export const useSetAdvancedSettingsOpen = () =>
  useAppStore((state) => state.setAdvancedSettingsOpen);
```

#### 既存セレクタの再利用（変更なし）

- `useSelectedSkillName()` --- 選択中スキル名
- `useImportedSkills()` --- インポート済みスキル
- `useSelectedProviderId()` / `useSelectedModelId()` --- モデル選択
- `useExecutionState()` --- 実行状態（既存の `executionState` フィールド）

## 6. 既存 AgentView との差分サマリー

### 変更するもの

| 項目                   | Before（現行）                          | After（リデザイン後）                              |
| ---------------------- | --------------------------------------- | -------------------------------------------------- |
| レイアウト             | 2カラム（左: ステータス、右: カード群） | シングルカラム（中央寄せ、max-width: 600px）       |
| 画面名称（UIテキスト） | 「Agent」                               | 「AIアシスタント」                                 |
| Level 1 要素数         | 5カード同時表示                         | 3要素（チップ + ボタン + 履歴）                    |
| モデル選択UI           | ModelSelectorCard（常時表示）           | 詳細設定パネル内（デフォルト自動選択）             |
| 権限設定               | PermissionCard（常時表示）              | 詳細設定パネル内（実行時にAIが都度リクエスト）     |
| ステータス表示         | AgentStatusCard（常時表示カード）       | FloatingExecutionBar（実行中のみ表示）             |
| スキル表示形式         | リスト / グリッド + 検索バー            | 80x80px チップ群（10個以下は検索バー非表示）       |
| 実行ボタン             | カード群の最下部                        | 全幅 56px 大型ボタン（Level 1 中央配置）           |
| 実行履歴               | 最大10件                                | 最大3件（Level 1 に収まる量）                      |
| 詳細設定アクセス       | 常時表示カード                          | 歯車アイコン -> スライドインパネル                 |
| レスポンシブ           | 1024px で2カラム -> 1カラム切替         | 常にシングルカラム（レスポンシブ不要）             |
| インポート操作         | AgentView 内の SkillImportDialog        | SkillCenter に移管（TASK-UI-05）                   |
| 削除操作               | AgentView 内のコンテキストメニュー      | SkillCenter に移管（TASK-UI-05）                   |
| 実行完了フィードバック | ステータスカードの更新のみ              | success-bounce アニメーション + フローティングバー |

### 維持するもの（変更なし）

| 項目                    | 理由                                               |
| ----------------------- | -------------------------------------------------- |
| agentSlice の基本構造   | 14個のスライス統合パターンを壊さない               |
| useSkillExecution Hook  | スキル実行ロジックは完成しており変更不要           |
| useSkillPermission Hook | 権限管理ロジックは完成しており変更不要             |
| SkillStreamDisplay      | 実行ストリーム表示は AgentExecutionView で継続使用 |
| CopyHistoryPanel        | コピー履歴機能は AgentExecutionView で継続使用     |
| AgentExecutionView      | チャット型実行画面は別画面として維持               |
| IPC インターフェース    | skill:execute, skill:abort 等の IPC は変更不要     |
| 個別セレクタパターン    | P31 対策済みのセレクタ設計を維持                   |
| TimestampContext        | バッチ更新パターンは AgentExecutionView で継続使用 |

### 削除するもの

| コンポーネント             | 移管先 / 理由                                 |
| -------------------------- | --------------------------------------------- |
| AgentStatusCard            | FloatingExecutionBar に置換（実行中のみ表示） |
| ModelSelectorCard          | AdvancedSettingsPanel 内に統合                |
| PermissionCard             | AdvancedSettingsPanel 内に統合                |
| SkillImportDialog          | SkillCenter（TASK-UI-05）で再実装             |
| SkillSearchBar（全体検索） | SkillCenter のグローバル検索に統合            |
| SkillCategoryFilter        | SkillCenter のフィルタリングUIに統合          |
| SkillDetailPanel（詳細）   | SkillCenter の詳細ビューに統合                |
| 2カラムレイアウト構造      | シングルカラムに置換                          |

## 7. IPC連携

### 使用するIPCチャンネル（既存・変更なし）

| チャンネル名       | 方向             | 用途                     |
| ------------------ | ---------------- | ------------------------ |
| `skill:execute`    | Renderer -> Main | スキル実行開始           |
| `skill:abort`      | Renderer -> Main | スキル実行停止           |
| `skill:list`       | Renderer -> Main | インポート済みスキル取得 |
| `llm:getProviders` | Renderer -> Main | LLMプロバイダ一覧取得    |
| `llm:health`       | Renderer -> Main | LLMヘルスチェック        |
| `agent:stream`     | Main -> Renderer | 実行ストリーミング       |
| `agent:status`     | Main -> Renderer | エージェントステータス   |

### IPC呼び出しパターン

```typescript
// Preload API 経由（contextBridge）
// SkillChip のデータ取得
const skills = await window.electronAPI.skill.list();

// 実行ボタンのクリック
const result = await window.electronAPI.skill.execute(skillName, options);

// 停止ボタン
await window.electronAPI.skill.abort(executionId);
```

## 8. 成果物（ファイルパス）

| ファイル                                                                             | 種別 | 説明                                   |
| ------------------------------------------------------------------------------------ | ---- | -------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`             | 新規 | 80x80px 丸アイコン + スキル名チップ    |
| `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`         | 新規 | 全幅プライマリ実行ボタン               |
| `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`  | 新規 | 実行中フローティングバー               |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` | 新規 | 詳細設定スライドインパネル             |
| `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`   | 新規 | 最近の実行履歴リスト（最大3件）        |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                                | 修正 | シングルカラムレイアウトに再構成       |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                               | 修正 | recentExecutions, advancedSettings追加 |

### テストファイル

| ファイル                                                                                            | 種別 | 説明                           |
| --------------------------------------------------------------------------------------------------- | ---- | ------------------------------ |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx`             | 新規 | チップ選択・インタラクション   |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`         | 新規 | ボタン状態・無効化テスト       |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx`  | 新規 | 表示条件・停止操作テスト       |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` | 新規 | パネル開閉・設定変更テスト     |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx`   | 新規 | 実行履歴表示テスト             |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx`                     | 新規 | シングルカラムレイアウトテスト |

## 9. テスト計画

### ユニットテスト（P39/P40対策準拠）

**実行方法**: `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/`（P40対策: 対象パッケージのディレクトリから実行）

**テストツール**: `fireEvent` を使用（P39対策: happy-dom環境では `userEvent` 使用禁止）

#### SkillChip.test.tsx

| テストケース                         | 検証内容                                               |
| ------------------------------------ | ------------------------------------------------------ |
| 未選択チップの表示                   | `aria-checked="false"`, border-transparent             |
| 選択済みチップの表示                 | `aria-checked="true"`, border-color がアクセントカラー |
| チップクリックで onSelect 発火       | `fireEvent.click` -> `onSelect` 呼び出し確認           |
| 無効状態でクリック不可               | `isDisabled=true` -> `onSelect` 呼び出しなし           |
| アイコン未設定時のデフォルトアイコン | `icon` 未指定 -> デフォルトアイコン表示                |
| アクセシビリティ属性                 | `role="radio"`, `aria-label` の存在確認                |

#### ExecuteButton.test.tsx

| テストケース              | 検証内容                                        |
| ------------------------- | ----------------------------------------------- |
| ツール未選択時の無効化    | `selectedSkillName=null` -> `disabled` 属性あり |
| ツール選択時のテキスト    | 「実行する」テキスト表示                        |
| ツール未選択時のテキスト  | 「ツールを選んでください」テキスト表示          |
| クリックで onExecute 発火 | `fireEvent.click` -> `onExecute` 呼び出し確認   |
| 無効時にクリック不可      | `disabled` 状態 -> `onExecute` 呼び出しなし     |

#### FloatingExecutionBar.test.tsx

| テストケース         | 検証内容                                   |
| -------------------- | ------------------------------------------ |
| executing 状態で表示 | `status="executing"` -> コンポーネント表示 |
| 停止ボタンクリック   | `fireEvent.click` -> `onStop` 呼び出し確認 |
| 経過時間の表示       | `startedAt` から `mm:ss` 形式で表示        |
| プログレスバー表示   | `progress=40` -> 40% 表示                  |
| completed 状態の表示 | `status="completed"` -> 「完了!」テキスト  |

#### AdvancedSettingsPanel.test.tsx

| テストケース                  | 検証内容                                          |
| ----------------------------- | ------------------------------------------------- |
| `isOpen=true` でパネル表示    | パネル要素が DOM に存在                           |
| `isOpen=false` でパネル非表示 | パネル要素が DOM に不在                           |
| 閉じるボタンで onClose 発火   | `fireEvent.click` -> `onClose` 呼び出し確認       |
| モデル選択の変更              | ラジオ選択 -> `onSelectModel` 呼び出し確認        |
| 許可モード変更                | セレクタ変更 -> `onModeChange` 呼び出し確認       |
| リセットボタン                | `fireEvent.click` -> `onResetRemembered` 呼び出し |
| ESCキーで閉じる               | `fireEvent.keyDown(Escape)` -> `onClose` 呼び出し |

#### RecentExecutionList.test.tsx

| テストケース             | 検証内容                                              |
| ------------------------ | ----------------------------------------------------- |
| 最大3件の表示            | 5件入力 -> 3件のみ表示                                |
| 空リストのメッセージ     | 0件 -> 「まだ実行履歴がありません」表示               |
| エントリクリックで遷移   | `fireEvent.click` -> `onSelectExecution` 呼び出し     |
| ステータスアイコンの表示 | completed -> check, failed -> x, executing -> spinner |
| 相対時間の表示           | 「2分前」「1時間前」形式の表示                        |

#### AgentView.layout.test.tsx

| テストケース                      | 検証内容                                               |
| --------------------------------- | ------------------------------------------------------ |
| シングルカラムレイアウト          | `max-width: 600px` の中央寄せコンテナ確認              |
| Level 1 の要素数                  | ツールチップ群 + 実行ボタン + 最近の実行 = 3セクション |
| ツール0件で EmptyState 表示       | SkillCenter への導線リンク確認                         |
| ツール10個以下で検索バー非表示    | 検索バーの DOM 不在確認                                |
| ツール11個以上で検索バー表示      | 検索バーの DOM 存在確認                                |
| 歯車アイコンで詳細設定パネル表示  | `fireEvent.click` -> パネル表示確認                    |
| UIテキストが UX言語マッピング準拠 | 「AIアシスタント」「できること」のテキスト確認         |

### 状態管理テスト

```typescript
// agentSlice 拡張部分のテスト（P31対策: 個別セレクタ使用）
describe("agentSlice extension", () => {
  it("addExecutionToHistory: 実行履歴を先頭に追加する", () => { ... });
  it("addExecutionToHistory: 10件を超えたら古いものを削除する", () => { ... });
  it("clearExecutionHistory: 全履歴をクリアする", () => { ... });
  it("setAdvancedSettingsOpen: パネル開閉状態を切り替える", () => { ... });
  it("useRecentExecutions: 個別セレクタで履歴を取得する", () => { ... });
});
```

## 10. スタイルガイド（Apple HIG準拠）

### SkillChip スタイル

```css
.skill-chip {
  width: 80px;
  height: 80px;
  border-radius: 50%; /* 完全な丸 */
  background: var(--bg-secondary);
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 200ms ease,
    border-color 200ms ease;
}

.skill-chip:hover {
  transform: scale(1.05);
}

.skill-chip:active {
  transform: scale(0.97);
  transition: transform 100ms ease-in;
}

.skill-chip[aria-checked="true"] {
  border-color: var(--status-primary);
  animation: skill-select-bounce 300ms ease;
}

@keyframes skill-select-bounce {
  0% {
    transform: scale(0.97);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
```

### ExecuteButton スタイル

```css
.execute-button {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  background: var(--status-primary);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 150ms ease,
    background-color 150ms ease,
    box-shadow 200ms ease;
}

.execute-button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.execute-button:active:not(:disabled) {
  transform: scale(0.97);
  background: var(--status-primary-pressed); /* systemBlue/80% */
}

.execute-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### FloatingExecutionBar スタイル

```css
.floating-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-subtle);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  padding: 12px 20px;
  transform: translateY(0);
  transition: transform 300ms ease-out;
}

.floating-bar.entering {
  animation: slide-up 300ms ease-out;
}

.floating-bar.exiting {
  animation: slide-down 200ms ease-in;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

/* 実行完了時の success-bounce */
@keyframes success-bounce {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.floating-bar .check-icon {
  animation: success-bounce 300ms ease;
  color: var(--status-success);
}

/* 実行失敗時の shake */
@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

.floating-bar.error {
  animation: error-shake 300ms ease;
  border-top-color: var(--status-error);
}
```

### AdvancedSettingsPanel スタイル

```css
.advanced-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 40;
  transition: opacity 200ms ease;
}

.advanced-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  background: var(--bg-primary);
  z-index: 41;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  transition: transform 300ms ease-out;
  overflow-y: auto;
  padding: 24px;
}

.advanced-panel.entering {
  animation: panel-slide-in 300ms ease-out;
}

.advanced-panel.exiting {
  animation: panel-slide-out 200ms ease-in;
}

@keyframes panel-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes panel-slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
```

### 共通スペーシング

- コンポーネント間: `gap-6`（24px）= 8px グリッド x 3
- チップ間: `gap-4`（16px）= 8px グリッド x 2
- コンテナ padding: `p-6`（24px）
- セクションヘッダーとコンテンツ: `mb-3`（12px）= 8px グリッド x 1.5

## 11. 既知の落とし穴・教訓

### P31 関連: Zustand セレクタ

- 全ての状態アクセスは個別セレクタ経由で行う
- `useAppStore()` の一括分割代入は禁止
- 新規セレクタ（`useRecentExecutions`, `useIsAdvancedSettingsOpen` 等）も個別セレクタパターンで実装
- `useEffect` の依存配列に含めるアクション関数は個別セレクタで取得

### P39 関連: テスト環境

- happy-dom 環境では `userEvent` を使用しない。`fireEvent` を使用する
- SkillChip の選択テスト、ExecuteButton のクリックテストは `fireEvent.click` で実装
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む

### P40 関連: テスト実行ディレクトリ

- テスト実行は `cd apps/desktop && pnpm vitest run src/...` で実行
- プロジェクトルートからの `pnpm vitest run apps/desktop/src/...` は `vitest.config.ts` の `environment` 設定と `setupFiles` が読み込まれないため使用禁止

### P24 関連: Store 型定義の不統一

- `ImportedSkill` 型（preload/types.ts）と `Skill` 型（agentSlice）の不一致に注意
- SkillChip では `useImportedSkills()` の返す型をそのまま使用し、型アサーションを避ける

### スキル管理境界の逸脱防止

- AgentView にインポート/削除ボタンを配置しない
- 「Skill Centerでツールをインポート」リンクのみ提供し、操作は SkillCenter に完全委譲

### z-index 管理

| レイヤー              | z-index | 用途                               |
| --------------------- | ------- | ---------------------------------- |
| 背景オーバーレイ      | `z-30`  | 詳細設定パネルの背景               |
| AdvancedSettingsPanel | `z-40`  | 詳細設定パネル本体                 |
| FloatingExecutionBar  | `z-50`  | 実行中フローティングバー（最前面） |

- GlobalNavStrip の z-index と競合しないよう調整が必要

### マイクロインタラクションの一貫性

- ホバーは常に `200ms ease` で統一
- タップは常に `100-150ms ease-in` で統一
- スライドインは `300ms ease-out`、スライドアウトは `200ms ease-in` で統一
- success-bounce は `300ms ease` で統一

## 12. 完了条件

### 必須条件

- [ ] シングルカラムレイアウト（中央寄せ、max-width: 600px）が正しく表示されること
- [ ] Level 1 に表示される要素が3セクション（ツールチップ群 + 実行ボタン + 最近の実行）であること
- [ ] 画面タイトルが「AIアシスタント」であること
- [ ] セクションヘッダーが「できること」であること
- [ ] SkillChip でツール選択が動作し、選択状態が視覚的に明示されること
- [ ] SkillChip の選択時アニメーション: `scale(0.97) -> scale(1.05) -> scale(1)` + 色変化が動作すること
- [ ] ツールが0件の場合、SkillCenter への導線が表示されること
- [ ] ツールが10個以下の場合、検索バーが非表示であること
- [ ] ツールが11個以上の場合、検索バーが出現すること
- [ ] ExecuteButton がツール未選択時に無効化され、テキストが「ツールを選んでください」であること
- [ ] ExecuteButton がツール選択時にテキストが「実行する」であること
- [ ] ExecuteButton のホバーで `scale(1.02)` + shadow、タップで `scale(0.97)` が動作すること
- [ ] 「実行する」ボタンクリックで AgentExecutionView に遷移すること
- [ ] FloatingExecutionBar が実行中のみ表示されること（非実行時は非表示）
- [ ] FloatingExecutionBar のスライドイン（300ms）/スライドアウト（200ms）が動作すること
- [ ] FloatingExecutionBar の停止ボタンでスキル実行が停止できること
- [ ] 実行完了時: success-bounce（チェックマーク scale(0->1.2->1)）+ 1.5秒後にスライドアウト
- [ ] 実行失敗時: shake アニメーション + 赤色表示 + 3秒後にスライドアウト
- [ ] 歯車アイコン（24x24px）がヘッダー右端に配置されていること
- [ ] 歯車アイコンのホバーで色変化 + `scale(1.1)` が動作すること
- [ ] 歯車アイコンタップで AdvancedSettingsPanel がスライドインすること
- [ ] AdvancedSettingsPanel 内でモデル変更が可能であること
- [ ] AdvancedSettingsPanel 内で許可モード変更が可能であること
- [ ] AdvancedSettingsPanel の背景タップ/ESCキーで閉じること
- [ ] RecentExecutionList が最大3件の実行履歴を表示すること
- [ ] 既存の agentSlice セレクタが正常に動作すること（P31 対策維持）
- [ ] UIテキストが UX言語マッピングに従っていること（「ツール」「AIアシスタント」「できること」等）
- [ ] マイクロインタラクション全体が統一されたタイミングで動作すること
- [ ] Apple HIG 準拠のスタイルが適用されていること（CSS変数名が 00-design-foundation と一致）
- [ ] WCAG 2.1 AA: コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（UI部品）
- [ ] SkillChip 群が `role="radiogroup"` + `aria-label` で囲まれ、各チップが `role="radio"` + `aria-checked` を持つこと
- [ ] 全要素がキーボード操作可能（Tab / Enter / Space）であること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること
- [ ] 全テストが PASS すること

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/
```

## 13. 参照資料

| 資料                           | 参照先                                                                  |
| ------------------------------ | ----------------------------------------------------------------------- |
| デザイン基盤（カードスタイル） | `ui-overhaul/00-design-foundation.md` (TASK-UI-00)                      |
| アーキテクチャ基盤（ViewType） | `ui-overhaul/01-architecture-foundation.md` (TASK-UI-01)                |
| GlobalNavStrip（ナビ連携）     | `ui-overhaul/02-global-nav-core.md` (TASK-UI-02)                        |
| 既存 AgentView 実装            | `apps/desktop/src/renderer/views/AgentView/index.tsx`                   |
| 既存 AgentExecutionView        | `apps/desktop/src/renderer/views/AgentExecutionView/`                   |
| 既存 SkillStreamDisplay        | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| agentSlice                     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                  |
| llmSlice                       | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                    |
| permissionHistorySlice         | `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts`      |
| Apple HIG デザイン原則         | `.claude/rules/01-architecture.md` UI/UXデザイン哲学セクション          |
| 状態管理ルール（P31対策）      | `.claude/rules/03-state-management.md`                                  |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                    |
