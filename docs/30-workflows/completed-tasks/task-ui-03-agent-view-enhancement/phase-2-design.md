# Phase 2: 設計

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 2                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

Phase 1 で定義した要件を実現可能なコンポーネント構造・状態管理設計・マイクロインタラクション仕様に落とし込む。Atomic Design（organisms）に従い、Apple HIG準拠のスタイルガイドを確定する。

## 実行タスク

- コンポーネント階層設計: Atomic Design に基づくコンポーネント構造の設計
- 状態管理設計: agentSlice 拡張と個別セレクタパターンの設計
- マイクロインタラクション設計: 各コンポーネントのアニメーション仕様確定
- スタイルガイド確定: Apple HIG準拠の CSS変数・スペーシング・z-index 管理
- IPC連携設計: 既存IPCチャンネルの利用パターン確認

## 参照資料

| 資料名                         | パス                                                                                                         | 説明                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Phase 1 要件定義書             | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-1-requirements.md`                | 機能・非機能要件                |
| 元タスク仕様書                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md` | 画面構成図・スタイルガイド      |
| UI/UXコンポーネント仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                      | コンポーネント設計基準          |
| 機能コンポーネント仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                              | 機能コンポーネント定義          |
| デザイン原則                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                               | Apple HIG準拠デザイン原則       |
| デザインシステム               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                   | トークン・8px grid・配色        |
| UIコンポーネントアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                    | コンポーネント階層              |
| 状態管理アーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                 | Zustand Store設計               |
| ナビゲーション仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                      | GlobalNavStrip連携              |
| 実行UI仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                 | 実行中/完了/失敗の表示契約      |
| モデル選択UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                    | モデル選択カードの基準          |
| 許可設定UI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                        | Permission settings の基準      |
| スキル実行セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                              | PermissionMode と allowed tools |
| 実装パターン                   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                  | P24/P31/P47 の設計基準          |
| 要件定義書                     | `outputs/phase-1/requirements-definition.md`                                                                 | Phase 1 成果物                  |

---

## 1. コンポーネント階層設計（Atomic Design: organisms）

### 階層図

```
AgentView (views/AgentView/index.tsx) [修正]
├── header
│   ├── h1 "AIアシスタント"
│   └── GearIconButton → AdvancedSettingsPanel 開閉トリガー
├── section "できること"
│   ├── SkillSearchBar (条件付き表示: 11個以上)
│   ├── div[role="radiogroup"]
│   │   └── SkillChip[] (organisms/AgentView/SkillChip.tsx) [新規]
│   └── EmptyState (条件付き表示: 0件)
├── ExecuteButton (organisms/AgentView/ExecuteButton.tsx) [新規]
├── RecentExecutionList (organisms/AgentView/RecentExecutionList.tsx) [新規]
├── AdvancedSettingsPanel (organisms/AgentView/AdvancedSettingsPanel.tsx) [新規]
│   ├── ModelSelector (カード型ラジオ)
│   └── PermissionSettings (モード + リセット)
└── FloatingExecutionBar (organisms/AgentView/FloatingExecutionBar.tsx) [新規]
    ├── ProgressBar
    └── StopButton
```

### コンポーネント Props 定義

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
  status: AgentExecutionStatus; // 'executing' | 'completed' | 'failed'
  startedAt: Date | null;
  progress?: number; // 0-100
  onStop: () => void;
}
```

#### AdvancedSettingsPanel

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

#### RecentExecutionList

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

---

## 2. 状態管理設計

### agentSlice 拡張

既存の agentSlice に以下のフィールドとアクションを追加する。14個のスライス統合パターンを壊さない。

```typescript
// 既存の AgentSlice に追加する型定義
interface AgentSliceExtension {
  // 新規フィールド
  recentExecutions: ExecutionSummary[];
  isAdvancedSettingsOpen: boolean;

  // 新規アクション
  addExecutionToHistory: (summary: ExecutionSummary) => void;
  clearExecutionHistory: () => void;
  setAdvancedSettingsOpen: (isOpen: boolean) => void;
}
```

### 初期値

```typescript
// 追加フィールドの初期値
recentExecutions: [],
isAdvancedSettingsOpen: false,
```

### アクション実装設計

| アクション                | 動作                                    |
| ------------------------- | --------------------------------------- |
| `addExecutionToHistory`   | 先頭に追加。10件超過時は末尾を削除      |
| `clearExecutionHistory`   | `recentExecutions` を空配列にリセット   |
| `setAdvancedSettingsOpen` | `isAdvancedSettingsOpen` を指定値に設定 |

### 個別セレクタ（P31対策）

```typescript
// 新規個別セレクタ（P31対策: 個別セレクタパターン）
export const useRecentExecutions = () =>
  useAppStore((state) => state.recentExecutions);
export const useAddExecutionToHistory = () =>
  useAppStore((state) => state.addExecutionToHistory);
export const useIsAdvancedSettingsOpen = () =>
  useAppStore((state) => state.isAdvancedSettingsOpen);
export const useSetAdvancedSettingsOpen = () =>
  useAppStore((state) => state.setAdvancedSettingsOpen);
```

### 既存セレクタの再利用（変更なし）

| セレクタ                  | 用途                 |
| ------------------------- | -------------------- |
| `useSelectedSkillName()`  | 選択中スキル名       |
| `useImportedSkills()`     | インポート済みスキル |
| `useSelectedProviderId()` | 選択プロバイダID     |
| `useSelectedModelId()`    | 選択モデルID         |
| `useExecutionState()`     | 実行状態             |

---

## 3. マイクロインタラクション設計

### SkillChip

| 状態       | スタイル                                                                                        | タイミング    |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------- |
| デフォルト | `border-2 border-transparent bg-[var(--bg-secondary)]`                                          | -             |
| ホバー     | `scale(1.05)`                                                                                   | 200ms ease    |
| タップ     | `scale(0.97)`                                                                                   | 100ms ease-in |
| 選択時     | `scale(0.97) -> scale(1.05) -> scale(1)` + `border-color: transparent -> var(--status-primary)` | 300ms ease    |
| 無効       | `opacity-50 cursor-not-allowed`                                                                 | -             |

選択時アニメーションシーケンス:

1. タップ: `scale(0.97)`（100ms, ease-in）
2. バウンス: `scale(1.05)`（150ms, ease-out）
3. 着地: `scale(1.0)`（100ms, ease-in-out）
4. 同時にボーダーカラーが `transparent` → `var(--status-primary)` にフェード（200ms）

### ExecuteButton

| 状態           | スタイル                                                | タイミング    |
| -------------- | ------------------------------------------------------- | ------------- |
| デフォルト     | `bg-[var(--status-primary)] text-white rounded-xl h-14` | -             |
| ホバー         | `scale(1.02) shadow-md`                                 | 200ms ease    |
| タップ         | `scale(0.97) bg-[var(--status-primary)]/80`             | 150ms ease-in |
| 無効（未選択） | `opacity-50 cursor-not-allowed`                         | -             |
| 実行中         | ボタン非表示（FloatingExecutionBar に切り替え）         | -             |

### FloatingExecutionBar

| 状態                     | アニメーション                                               | タイミング     |
| ------------------------ | ------------------------------------------------------------ | -------------- |
| 表示（スライドイン）     | `translateY(100%) -> translateY(0)`                          | 300ms ease-out |
| 非表示（スライドアウト） | `translateY(0) -> translateY(100%)`                          | 200ms ease-in  |
| 実行完了                 | プログレスバー緑変化 + チェックマーク `scale(0 -> 1.2 -> 1)` | 300ms ease     |
| 実行失敗                 | `translateX(0, -4px, 4px, -4px, 4px, 0)` + 赤色表示          | 300ms ease     |
| 完了後消去               | スライドアウト                                               | 1.5秒後        |
| 失敗後消去               | スライドアウト                                               | 3秒後          |

### AdvancedSettingsPanel

| 状態       | アニメーション                                                    | タイミング    |
| ---------- | ----------------------------------------------------------------- | ------------- |
| 開く       | オーバーレイ `opacity: 0 -> 0.3` + パネル `translateX(100%) -> 0` | 200ms + 300ms |
| 閉じる     | パネル `translateX(0) -> 100%` + オーバーレイ `opacity: 0.3 -> 0` | 200ms + 150ms |
| 背景タップ | 閉じる動作をトリガー                                              | -             |
| ESCキー    | 閉じる動作をトリガー                                              | -             |

### RecentExecutionList

| 状態   | スタイル                                                        | タイミング |
| ------ | --------------------------------------------------------------- | ---------- |
| ホバー | `bg-[var(--bg-secondary)] rounded-lg`                           | 150ms ease |
| タップ | `bg-[var(--bg-tertiary)]`                                       | 100ms ease |
| 新着   | リスト先頭に追加時: `opacity: 0 -> 1` + `translateY(-8px) -> 0` | 200ms ease |

---

## 4. スタイルガイド（Apple HIG準拠）

### CSS変数マッピング

| 用途               | CSS変数名          | ライトモード値          | ダークモード値             |
| ------------------ | ------------------ | ----------------------- | -------------------------- |
| 背景               | `--bg-primary`     | `#FFFFFF`               | `#000000`                  |
| セカンダリ背景     | `--bg-secondary`   | `#F2F2F7`               | `#1C1C1E`                  |
| ターシャリ背景     | `--bg-tertiary`    | `#E5E5EA`               | `#2C2C2E`                  |
| プライマリテキスト | `--text-primary`   | `#000000`               | `#FFFFFF`                  |
| セカンダリテキスト | `--text-secondary` | `rgba(60, 60, 67, 0.6)` | `rgba(235, 235, 245, 0.6)` |
| アクセント         | `--status-primary` | `#007AFF`               | `#0A84FF`                  |
| 成功               | `--status-success` | `#34C759`               | `#30D158`                  |
| エラー             | `--status-error`   | `#FF3B30`               | `#FF453A`                  |
| ボーダー           | `--border-subtle`  | `#C6C6C8`               | `#38383A`                  |

### スペーシング（8px グリッド）

| 用途                           | クラス  | 値   |
| ------------------------------ | ------- | ---- |
| コンポーネント間               | `gap-6` | 24px |
| チップ間                       | `gap-4` | 16px |
| コンテナ padding               | `p-6`   | 24px |
| セクションヘッダー〜コンテンツ | `mb-3`  | 12px |

### z-index 管理

| レイヤー              | z-index | 用途                               |
| --------------------- | ------- | ---------------------------------- |
| 背景オーバーレイ      | `z-30`  | 詳細設定パネルの背景               |
| AdvancedSettingsPanel | `z-40`  | 詳細設定パネル本体                 |
| FloatingExecutionBar  | `z-50`  | 実行中フローティングバー（最前面） |

GlobalNavStrip の z-index（z-20）と競合しないよう、z-30 以上を使用する。

### タイポグラフィ

| 要素               | クラス                  | サイズ・ウェイト |
| ------------------ | ----------------------- | ---------------- |
| 画面タイトル       | `text-2xl font-bold`    | 24px / 700       |
| セクションヘッダー | `text-sm font-medium`   | 14px / 500       |
| 実行ボタンテキスト | `text-lg font-semibold` | 18px / 600       |
| チップラベル       | `text-xs`               | 12px / 400       |
| 履歴テキスト       | `text-sm`               | 14px / 400       |

---

## 5. レイアウト設計

### AgentView メインレイアウト

```
┌─────────────────────────────────────────────────┐
│ div.flex.flex-col.items-center.h-full.p-6       │
│                                                   │
│   ┌─────────────────────────────────────────┐     │
│   │ div.w-full.max-w-[600px].flex.flex-col  │     │
│   │     .gap-6                               │     │
│   │                                           │     │
│   │   ┌─── header ──────────────────────┐     │     │
│   │   │ h1: AIアシスタント    [gear]    │     │     │
│   │   └─────────────────────────────────┘     │     │
│   │                                           │     │
│   │   ┌─── section: できること ─────────┐     │     │
│   │   │ [SkillSearchBar] (11個以上)     │     │     │
│   │   │ div[role="radiogroup"]          │     │     │
│   │   │   SkillChip SkillChip ...       │     │     │
│   │   │ [EmptyState] (0件)              │     │     │
│   │   └─────────────────────────────────┘     │     │
│   │                                           │     │
│   │   ┌─── ExecuteButton ──────────────┐     │     │
│   │   │ [  >>> 実行する  ]              │     │     │
│   │   └─────────────────────────────────┘     │     │
│   │                                           │     │
│   │   ┌─── RecentExecutionList ────────┐     │     │
│   │   │ 最近の実行                      │     │     │
│   │   │ > 検索ツール  [check] 2分前     │     │     │
│   │   │ > 文章作成    [x]    5分前      │     │     │
│   │   │ > コード分析  [spin] 実行中     │     │     │
│   │   └─────────────────────────────────┘     │     │
│   │                                           │     │
│   └─────────────────────────────────────────┘     │
│                                                   │
│   [AdvancedSettingsPanel] (z-40, right slide-in) │
│   [FloatingExecutionBar]  (z-50, bottom fixed)   │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## 6. IPC連携設計

### 使用する既存IPCチャンネル（変更なし）

| チャンネル名       | 方向            | 用途                     | 呼び出し元コンポーネント   |
| ------------------ | --------------- | ------------------------ | -------------------------- |
| `skill:list`       | Renderer → Main | インポート済みスキル取得 | AgentView（初期化時）      |
| `skill:execute`    | Renderer → Main | スキル実行開始           | ExecuteButton              |
| `skill:abort`      | Renderer → Main | スキル実行停止           | FloatingExecutionBar       |
| `llm:getProviders` | Renderer → Main | LLMプロバイダ一覧取得    | AdvancedSettingsPanel      |
| `llm:health`       | Renderer → Main | LLMヘルスチェック        | AdvancedSettingsPanel      |
| `agent:stream`     | Main → Renderer | 実行ストリーミング       | AgentExecutionView（既存） |
| `agent:status`     | Main → Renderer | エージェントステータス   | FloatingExecutionBar       |

### Preload API 呼び出しパターン

```typescript
// SkillChip のデータ取得
const skills = await window.electronAPI.skill.list();

// 実行ボタンのクリック
const result = await window.electronAPI.skill.execute(skillName, options);

// 停止ボタン
await window.electronAPI.skill.abort(executionId);

// LLMプロバイダ取得
const providers = await window.electronAPI.llm.getProviders();

// ヘルスチェック
const health = await window.electronAPI.llm.health(providerId);
```

---

## 7. 削除対象コンポーネント

以下のコンポーネントは新UIコンポーネントに置換または SkillCenter（TASK-UI-05）に移管する。

| コンポーネント             | 移管先 / 理由                        |
| -------------------------- | ------------------------------------ |
| AgentStatusCard            | FloatingExecutionBar に置換          |
| ModelSelectorCard          | AdvancedSettingsPanel 内に統合       |
| PermissionCard             | AdvancedSettingsPanel 内に統合       |
| SkillImportDialog          | SkillCenter（TASK-UI-05）で再実装    |
| SkillSearchBar（全体検索） | SkillCenter のグローバル検索に統合   |
| SkillCategoryFilter        | SkillCenter のフィルタリングUIに統合 |
| SkillDetailPanel（詳細）   | SkillCenter の詳細ビューに統合       |
| 2カラムレイアウト構造      | シングルカラムに置換                 |

---

## 8. 維持対象（変更なし）

| 項目                    | 理由                                               |
| ----------------------- | -------------------------------------------------- |
| agentSlice の基本構造   | 14個のスライス統合パターンを壊さない               |
| useSkillExecution Hook  | スキル実行ロジックは完成しており変更不要           |
| useSkillPermission Hook | 権限管理ロジックは完成しており変更不要             |
| SkillStreamDisplay      | 実行ストリーム表示は AgentExecutionView で継続使用 |
| CopyHistoryPanel        | コピー履歴機能は AgentExecutionView で継続使用     |
| AgentExecutionView      | チャット型実行画面は別画面として維持               |
| IPC インターフェース    | skill:execute, skill:abort 等のIPCは変更不要       |
| 個別セレクタパターン    | P31 対策済みのセレクタ設計を維持                   |
| TimestampContext        | バッチ更新パターンは AgentExecutionView で継続使用 |

---

## 9. 成果物ファイルパス

### プロダクションコード

| ファイル                                                                             | 種別 | 説明                                   |
| ------------------------------------------------------------------------------------ | ---- | -------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`             | 新規 | 80x80px 丸アイコン + スキル名チップ    |
| `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`         | 新規 | 全幅プライマリ実行ボタン               |
| `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`  | 新規 | 実行中フローティングバー               |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` | 新規 | 詳細設定スライドインパネル             |
| `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`   | 新規 | 最近の実行履歴リスト（最大3件）        |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                                | 修正 | シングルカラムレイアウトに再構成       |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                               | 修正 | recentExecutions, advancedSettings追加 |

### テストコード

| ファイル                                                                                            | 種別 | 説明                           |
| --------------------------------------------------------------------------------------------------- | ---- | ------------------------------ |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx`             | 新規 | チップ選択・インタラクション   |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`         | 新規 | ボタン状態・無効化テスト       |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx`  | 新規 | 表示条件・停止操作テスト       |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` | 新規 | パネル開閉・設定変更テスト     |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx`   | 新規 | 実行履歴表示テスト             |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx`                     | 新規 | シングルカラムレイアウトテスト |

---

## 統合テスト連携

統合ポイント・契約を以下の通り設計に反映する:

| 統合ポイント                | 契約定義                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| AgentView → agentSlice      | 個別セレクタ経由で状態取得。一括分割代入禁止（P31対策）                        |
| ExecuteButton → IPC         | `window.electronAPI.skill.execute(skillName, options)` で実行開始              |
| FloatingExecutionBar → IPC  | `window.electronAPI.skill.abort(executionId)` で実行停止                       |
| AdvancedSettingsPanel → IPC | `window.electronAPI.llm.getProviders()` でモデル一覧取得                       |
| AgentView → GlobalNavStrip  | ViewType.Agent でのナビゲーション連携（z-index競合なし: Nav=z-20, Panel=z-40） |

## 多角的チェック観点

| 観点             | 確認項目                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| UI/UX            | Apple HIG準拠のカラー・スペーシング・タイポグラフィ。Tap & Discover体験の実現 |
| アクセシビリティ | WCAG 2.1 AA コントラスト比。ARIA属性。キーボード操作。スクリーンリーダー対応  |
| 状態管理         | P31対策: 個別セレクタパターン。既存セレクタの正常動作維持                     |
| パフォーマンス   | 60fpsアニメーション。個別セレクタによる不要再レンダリング防止                 |

**Electronデスクトップアプリ観点**:

| 層                         | 設計観点                                                     |
| -------------------------- | ------------------------------------------------------------ |
| フロントエンド（Renderer） | コンポーネント設計、状態管理、CSS変数ベースのスタイリング    |
| IPC通信                    | 既存チャンネル（skill:_, llm:_, agent:\*）の利用パターン確認 |

## 成果物

| 成果物 | パス                                                                                    | 説明                                                     |
| ------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 設計書 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-2-design.md` | 本ドキュメント（コンポーネント・状態管理・スタイル設計） |

## 完了条件

- [ ] コンポーネント階層図が Atomic Design に基づいて定義されている
- [ ] 全7コンポーネントの Props 型定義が記載されている
- [ ] agentSlice 拡張の状態設計（フィールド・アクション・セレクタ）が定義されている
- [ ] 個別セレクタパターン（P31対策）が設計に反映されている
- [ ] 全コンポーネントのマイクロインタラクション仕様（状態・スタイル・タイミング）が確定している
- [ ] CSS変数マッピング（Apple HIG準拠）が確定している
- [ ] z-index 管理テーブル（z-30, z-40, z-50）が定義されている
- [ ] スペーシング（8pxグリッド）が確定している
- [ ] IPC連携設計（既存チャンネル利用パターン）が確認されている
- [ ] 削除対象コンポーネントと維持対象が明記されている
- [ ] 成果物ファイルパス（プロダクション + テスト）が確定している
- [ ] Phase 1 要件定義との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
