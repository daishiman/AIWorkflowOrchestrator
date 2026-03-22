# Phase 2: 設計

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 2                                       |
| 機能名   | chat-inline-model-selector              |
| タスクID | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT |
| 作成日   | 2026-03-21                              |

## 目的

Phase 1の要件定義に基づき、インラインモデルセレクタのコンポーネント設計・状態管理・配置設計を行う。

## 実行タスク

- コンポーネント設計: InlineModelSelectorのインターフェースと内部構造を定義
- 配置設計: ChatView/WorkspaceChatPanelへの具体的な配置位置とレイアウトを決定
- 状態管理設計: 既存llmSliceとの連携パターンを設計
- 既存コンポーネントとの関係整理: LLMSelectorPanel/LLMGuidanceBannerとの共存設計

## 参照資料

| 資料名           | パス                                                                                                                    | 説明                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-1-requirements.md` | 要件・受入基準         |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`                                                         | 既存フル版パネル       |
| ProviderSelector | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`                                                         | プロバイダー選択子部品 |
| ModelSelector    | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`                                                            | モデル選択子部品       |
| ChatView         | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                                    | チャット画面           |
| WorkspaceChat    | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                  | ワークスペースチャット |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                                             | 内容                     |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                          | 既存UIコンポーネント構造 |
| 状態管理Core        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                | LLM Slice設計            |
| デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG準拠設計        |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` | P31/P48対策パターン      |

## 実行手順

### ステップ1: コンポーネント設計

#### 1.1 InlineModelSelector コンポーネント

**新規コンポーネント**: `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`

```typescript
// Props定義
export interface InlineModelSelectorProps {
  /** コンパクト表示（チャットヘッダー向け） */
  compact?: boolean;
  /** 追加CSSクラス */
  className?: string;
  /** 選択変更時のコールバック（副作用フック用） */
  onSelectionChange?: (selection: {
    providerId: string;
    modelId: string;
  }) => void;
  /** 無効化（ストリーミング中等） */
  disabled?: boolean;
}
```

**内部構造（Atomic Design: molecule）**:

```
InlineModelSelector (molecule)
  ├── SelectorTrigger (atom) ← 現在選択中のProvider/Modelを表示するボタン
  │   ├── ProviderIcon ← プロバイダーアイコン（Anthropic/OpenAI/Google等）
  │   ├── ModelDisplayName ← "Claude 3.5 Sonnet" 等
  │   └── HealthDot ← 緑/赤/灰のステータスドット
  │
  └── SelectorDropdown (molecule) ← 展開時のドロップダウンパネル
      ├── ProviderSection ← プロバイダー選択グループ
      │   └── ProviderOption[] ← 各プロバイダー行
      └── ModelSection ← モデル選択グループ（選択プロバイダーに連動）
          └── ModelOption[] ← 各モデル行（コンテキストウィンドウサイズ表示）
```

#### 1.2 コンポーネントの責務分離

| コンポーネント      | 責務                                 | Store依存            |
| ------------------- | ------------------------------------ | -------------------- |
| InlineModelSelector | 全体制御・ドロップダウン開閉         | あり（個別セレクタ） |
| SelectorTrigger     | 現在の選択状態表示・クリックハンドラ | なし（props受取）    |
| SelectorDropdown    | プロバイダー/モデル一覧表示          | なし（props受取）    |

**設計判断**: `InlineModelSelector` のみがStoreに接続し、子コンポーネントはpresentationalとする。これにより子コンポーネントの再利用性を保つ。

#### 1.3 既存コンポーネントとの関係

```
components/llm/
  ├── LLMSelectorPanel.tsx      ← 既存: Settings向けフルパネル（変更なし）
  ├── ProviderSelector.tsx      ← 既存: ドロップダウン（内部利用可能）
  ├── ModelSelector.tsx         ← 既存: ドロップダウン（内部利用可能）
  ├── HealthIndicator.tsx       ← 既存: ヘルスバッジ（参考にしてHealthDot作成）
  ├── InlineModelSelector.tsx   ← 新規: チャット向けコンパクト版
  └── index.ts                  ← 更新: InlineModelSelectorをエクスポート追加
```

**設計判断**: 既存の `ProviderSelector`/`ModelSelector` は `<select>` ベースのフルサイズUI。インライン版ではドロップダウンパネル内で直接 `<button>` リストを使う新しいUIパターンを採用する。理由: コンパクト表示では `<select>` のOSネイティブUIがデザインに馴染まないため。

### ステップ2: 状態管理設計

#### 2.1 使用するStore個別セレクタ（P31対策）

```typescript
// InlineModelSelector内で使用する個別セレクタ
import {
  useLLMProviders, // プロバイダー一覧
  useSelectedProviderId, // 選択中プロバイダーID
  useSelectedModelId, // 選択中モデルID
  useLLMIsLoading, // ローディング状態
  useLLMHealthStatus, // ヘルスステータス
  useFetchProviders, // プロバイダー取得アクション
  useSelectProvider, // プロバイダー選択アクション
  useSelectModel, // モデル選択アクション
  useCheckLLMHealth, // ヘルスチェックアクション
} from "@/renderer/store";
```

#### 2.2 状態フロー

```
ユーザーがドロップダウンを開く
  → SelectorDropdown表示（ローカル useState: isOpen）

ユーザーがプロバイダーを選択
  → useSelectProvider(providerId)
  → llmSlice.selectProvider() 内部で:
    1. selectedProviderId 更新
    2. selectedModelId をプロバイダーのデフォルトモデルに自動設定
    3. window.electronAPI.llm.setSelectedConfig() でMain同期
  → useCheckLLMHealth(providerId)

ユーザーがモデルを選択
  → useSelectModel(modelId)
  → llmSlice.selectModel() 内部で:
    1. selectedModelId 更新
    2. window.electronAPI.llm.setSelectedConfig() でMain同期
  → ドロップダウンを閉じる
```

#### 2.3 ドロップダウン開閉の状態管理

ドロップダウンの開閉はコンポーネントローカル（`useState`）で管理する。理由:

- 複数画面間で共有する必要がない
- UIのみに関わるトランジェント状態
- 03-state-management.md の「コンポーネント固有UI: useState/useReducer」に該当

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### ステップ3: 配置設計

#### 3.1 ChatView配置

```
ChatView (現行)
┌─────────────────────────────────────────┐
│ [Header: システムプロンプトボタン etc.]  │
│ [LLMGuidanceBanner (未選択時のみ)]      │
│                                         │
│ [メッセージエリア]                       │
│                                         │
│ [ChatInput]                              │
└─────────────────────────────────────────┘

ChatView (変更後)
┌─────────────────────────────────────────┐
│ [Header: [InlineModelSelector] | ...]   │  ← ヘッダー左側に配置
│ [LLMGuidanceBanner (未選択時のみ)]      │  ← 維持（初回案内として機能）
│                                         │
│ [メッセージエリア]                       │
│                                         │
│ [ChatInput]                              │
└─────────────────────────────────────────┘
```

**配置位置**: ヘッダーの左側（SystemPromptToggleButtonの隣）
**理由**: チャット入力前にモデルを確認・変更する操作フローに合致

#### 3.2 WorkspaceChatPanel配置

```
WorkspaceChatPanel (現行)
┌─────────────────────────────────────────┐
│ [GuidanceBlock (blocked時のみ)]         │
│                                         │
│ [メッセージエリア]                       │
│                                         │
│ [WorkspaceChatInput]                     │
└─────────────────────────────────────────┘

WorkspaceChatPanel (変更後)
┌─────────────────────────────────────────┐
│ [InlineModelSelector (compact)]         │  ← パネル上部に配置
│ [GuidanceBlock (blocked+未選択時のみ)]  │  ← モデル選択済みなら非表示
│                                         │
│ [メッセージエリア]                       │
│                                         │
│ [WorkspaceChatInput]                     │
└─────────────────────────────────────────┘
```

**配置位置**: パネルの最上部
**理由**: WorkspaceChatはサイドパネルとして使われるため、コンパクト版を上部に配置

#### 3.3 LLMGuidanceBannerとの共存

| 状態                 | InlineModelSelector      | LLMGuidanceBanner      |
| -------------------- | ------------------------ | ---------------------- |
| モデル未選択（初回） | 表示（プレースホルダー） | 表示（初回案内として） |
| モデル選択済み       | 表示（選択中モデル名）   | 非表示（既存動作維持） |

**設計判断**: LLMGuidanceBannerは完全に削除せず、初回案内として残す。インラインセレクタとの役割を分離:

- InlineModelSelector: モデルの選択・変更操作
- LLMGuidanceBanner: API keyの設定案内（Settings遷移が必要なため）

### ステップ4: ビジュアルデザイン

#### 4.1 SelectorTrigger（折りたたみ時）

```
┌──────────────────────────────────┐
│ [Icon] Claude 3.5 Sonnet    [v] │  ← 通常サイズ
└──────────────────────────────────┘

┌─────────────────────────┐
│ [I] Claude 3.5 Son. [v] │  ← compact版
└─────────────────────────┘

┌──────────────────────────────────┐
│ [?] モデルを選択            [v] │  ← 未選択状態
└──────────────────────────────────┘
```

#### 4.2 SelectorDropdown（展開時）

```
┌──────────────────────────────────┐
│ Provider                         │
│ ┌──────────────────────────────┐ │
│ │ [*] Anthropic                │ │  ← 選択中は * マーク
│ │ [ ] OpenAI                   │ │
│ │ [ ] Google                   │ │
│ └──────────────────────────────┘ │
│                                  │
│ Model                            │
│ ┌──────────────────────────────┐ │
│ │ [*] Claude 3.5 Sonnet        │ │
│ │     200K context             │ │  ← コンテキストウィンドウサイズ
│ │ [ ] Claude 3.5 Haiku         │ │
│ │     200K context             │ │
│ │ [ ] Claude 3 Opus            │ │
│ │     200K context             │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

#### 4.3 デザイントークン（Apple HIG準拠）

```typescript
// 色定義（CSS変数参照）
const DESIGN_TOKENS = {
  trigger: {
    bg: "var(--bg-secondary)", // secondarySystemBackground
    border: "var(--border-primary)", // opaqueSeparator
    borderRadius: "8px",
    padding: "6px 12px", // 8pxグリッド近似
    height: "32px", // compact: 28px
  },
  dropdown: {
    bg: "var(--bg-primary)", // systemBackground
    border: "var(--border-primary)",
    borderRadius: "12px",
    shadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxHeight: "320px",
  },
  option: {
    padding: "8px 12px",
    hoverBg: "var(--bg-tertiary)", // systemGray5 / tertiarySystemBackground
    selectedColor: "var(--accent)", // systemBlue
  },
  healthDot: {
    size: "8px",
    healthy: "var(--status-success)", // systemGreen
    unhealthy: "var(--status-error)", // systemRed
    unknown: "var(--text-tertiary)", // tertiaryLabel
  },
} as const;
```

### ステップ5: エラーハンドリング

| エラー状態           | UI表示                              | アクション                                                                 |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| プロバイダー取得失敗 | トリガーに警告アイコン表示          | ドロップダウン内にリトライボタン                                           |
| ヘルスチェック失敗   | HealthDotが赤                       | ツールチップでエラー詳細表示                                               |
| 選択同期失敗（IPC）  | エラー情報をllmSlice.llmErrorに格納 | InlineModelSelectorのトリガーに警告アイコン表示 + ツールチップでエラー詳細 |

### ステップ6: アクセシビリティ設計

```html
<!-- SelectorTrigger -->
<button
  role="combobox"
  aria-expanded="{isOpen}"
  aria-haspopup="listbox"
  aria-label="LLMモデル選択: {selectedModelName || 'モデルを選択'}"
>
  <!-- SelectorDropdown -->
  <div role="listbox" aria-label="LLMモデル一覧">
    <div role="group" aria-label="Provider">
      <button role="option" aria-selected="{isSelected}">Anthropic</button>
    </div>
    <div role="group" aria-label="Model">
      <button role="option" aria-selected="{isSelected}">
        Claude 3.5 Sonnet
      </button>
    </div>
  </div>
</button>
```

**キーボード操作**:

- `Enter`/`Space`: ドロップダウン開閉
- `ArrowDown`/`ArrowUp`: オプション間移動
- `Escape`: ドロップダウンを閉じる
- `Tab`: 次の要素にフォーカス移動

## 統合テスト連携（Phase 2）

- コンポーネント単体テスト: InlineModelSelector のドロップダウン動作・選択同期
- 統合テスト: ChatView/WorkspaceChatPanel での配置・動作検証
- P31/P48対策テスト: 個別セレクタ使用・再レンダー回数検証

## 多角的チェック観点

| 観点             | 適用 | 確認内容                                                         |
| ---------------- | ---- | ---------------------------------------------------------------- |
| UI/UX            | 該当 | Apple HIG準拠デザイン、コンパクト表示の操作性、配置位置の妥当性  |
| アーキテクチャ   | 該当 | Atomic Design準拠、Store接続パターン、既存コンポーネントとの関係 |
| アクセシビリティ | 該当 | WCAG 2.1 AA、キーボード操作、ARIA属性                            |
| パフォーマンス   | 該当 | P31個別セレクタ、P48 useShallow、ドロップダウン遅延レンダリング  |

## 成果物

| 成果物 | パス                                                                                                              | 説明           |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [x] InlineModelSelectorのインターフェース（Props型）を定義
- [x] 内部コンポーネント構造（Atomic Design）を設計
- [x] 既存コンポーネントとの関係を整理
- [x] 状態管理パターン（個別セレクタ使用）を設計
- [x] ChatView/WorkspaceChatPanelへの配置位置を決定
- [x] LLMGuidanceBannerとの共存方針を決定
- [x] ビジュアルデザイン（Apple HIG準拠）を定義
- [x] エラーハンドリング方針を設計
- [x] アクセシビリティ設計を完了
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-3-design-review.md`（同ディレクトリ内）
