# Phase 2: 設計

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase番号  | 2                                             |
| 機能名     | LLMモデル選択インラインガイダンス追加         |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE         |
| 作成日     | 2026-03-20                                    |
| ステータス | 作成済み                                      |
| 依存       | [Phase 1 要件定義](./phase-1-requirements.md) |

## 目的

Phase 1 で定義した要件を元に、ChatView・WorkspaceView へのインラインガイダンス追加の技術設計を行う。コンポーネント構成・状態管理の依存方向・画面遷移パターンを確定し、Phase 4 のテスト設計・Phase 5 の実装の基礎とする。

## 実行タスク

### Task 1: 前提調査結果の確認

Phase 1 P50チェックの結果を参照し、以下を確認する:

- `llmSlice.ts` に `selectedModelId` / `selectedProviderId` の個別セレクタが既に存在するか
- `WorkspaceChatPanel.tsx` の `GuidanceBlock` の既存実装を把握する
- `setCurrentView` の型定義と呼び出し方法を確認する

### Task 2: コンポーネント設計

#### 2-1: LLMGuidanceBanner コンポーネント（新規）

**責務**: モデル未選択時に ChatView ヘッダー下部に表示するインラインバナー

**ファイルパス**: `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`

**Props 定義**:

```typescript
interface LLMGuidanceBannerProps {
  onNavigateToSettings: () => void;
}
```

**表示条件**:

- `useSelectedModelId()` が `null` または `undefined` のとき表示
- `useSelectedProviderId()` が `null` または `undefined` のとき表示
- 両方が非null値になった時点で非表示（`display: none` ではなく条件付きレンダリング）

**UIレイアウト**:

```
[ ! AIモデルが選択されていません ]  [ 設定画面へ → ]
```

- 背景: `bg-[var(--color-system-orange-opacity10)]` または Apple HIG警告色を薄くしたもの
- アイコン: 警告アイコン（exclamation circle）
- ボタン: `systemBlue` (#007AFF / ダーク #0A84FF) のゴーストボタン
- アニメーション: バナー出現/消滅は 200ms フェード

**Zustand セレクタ使用方針（P31対策）**:

```typescript
// 合成Hook禁止（P31）
// const { selectedModelId } = useLLMStore(); // NG

// 個別セレクタを使用
const selectedModelId = useSelectedModelId();
const selectedProviderId = useSelectedProviderId();
```

#### 2-2: ChatView へのバナー統合

**対象ファイル**: `apps/desktop/src/renderer/views/ChatView/index.tsx`

**変更内容**:

- ヘッダー部の直下（チャット入力エリアの上）に `<LLMGuidanceBanner>` を配置
- `onNavigateToSettings` コールバックを `setCurrentView("settings")` で実装
- バナーはコンポーネント内部で表示/非表示を自己管理する（ChatView 側は常にレンダリング、バナー側が条件判定）

**画面遷移パターン**:

```typescript
// 既存パターンを流用（setCurrentView は既存の状態管理を使用）
const setCurrentView = useSetCurrentView();
const handleNavigateToSettings = () => setCurrentView("settings");
```

**注意**: Settings 画面内の特定セクション（LLMセクション）へのスクロール遷移は本タスクスコープ外。Settings 画面を開くだけで十分。

#### 2-3: WorkspaceChatPanel GuidanceBlock 改善

**対象ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**変更内容**:

- 既存の GuidanceBlock 内「AIモデルが選択されていません」メッセージに設定ボタンを追加
- ボタンは GuidanceBlock のアクションエリア（メッセージ下部）に配置

**GuidanceBlockアクション設計**:

```typescript
// GuidanceBlock が action props を受け取る設計（既存実装に合わせて調整）
<GuidanceBlock
  message="AIモデルが選択されていません。Settings で使用するモデルを設定してください。"
  action={{
    label: "設定画面を開く",
    onClick: () => setCurrentView("settings"),
  }}
/>
```

### Task 3: 状態管理設計

#### 3-1: llmSlice セレクタ確認・追加

既存セレクタの確認対象:

- `useSelectedModelId(): string | null`
- `useSelectedProviderId(): string | null`

上記セレクタが存在しない場合、`llmSlice.ts` に追加する:

```typescript
// llmSlice.ts に追加（既存セレクタがない場合のみ）
export const useSelectedModelId = () =>
  useAppStore((state) => state.llm.selectedModelId);

export const useSelectedProviderId = () =>
  useAppStore((state) => state.llm.selectedProviderId);
```

**P31チェック**: 派生セレクタ（filter/map）を使わないため `useShallow` は不要。

#### 3-2: ナビゲーションセレクタ確認

既存の `setCurrentView` セレクタが存在するか確認:

- `useSetCurrentView(): (view: ViewType) => void`

存在しない場合、適切なスライスから取得方法を調査する。

### Task 4: コンポーネント依存方向設計

```
ChatView/index.tsx
  └── LLMGuidanceBanner (新規)
        ├── useSelectedModelId() [llmSlice]
        ├── useSelectedProviderId() [llmSlice]
        └── onNavigateToSettings: () => void [props]

WorkspaceView/WorkspaceChatPanel.tsx
  └── GuidanceBlock (既存)
        └── action.onClick: () => setCurrentView("settings")
```

**レイヤー依存確認**:

- Renderer 層内での依存のみ → アーキテクチャルール準拠
- IPC 通信なし → Main Process 依存なし
- セレクタは個別セレクタのみ → P31 対策済み

### Task 5: IPC レスポンス形式（該当なし）

本タスクは Renderer 内部の UI 変更のみであり、新規 IPC ハンドラの追加はない。P60 チェック対象外。

## 参照資料

### システム仕様（aiworkflow-requirements）

| ファイル                                                                     | 用途                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | UI/UX設計哲学、Apple HIG準拠設計原則        |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand Store設計原則、個別セレクタパターン |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザインシステム仕様                        |

### プロジェクトルール

| ファイル                                 | 用途                                          |
| ---------------------------------------- | --------------------------------------------- |
| `.claude/rules/01-architecture.md`       | アーキテクチャルール、Apple HIGカラーパレット |
| `.claude/rules/03-state-management.md`   | Zustand状態管理ルール                         |
| `.claude/rules/06-known-pitfalls.md#P31` | 合成Hook無限ループ防止                        |
| `.claude/rules/06-known-pitfalls.md#P48` | useShallow適用基準                            |
| `.claude/rules/06-known-pitfalls.md#P62` | DEFAULT_CONFIG暗黙fallback禁止                |

### 実装対象ファイル

| ファイル                                                               | 変更種別                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | 変更（バナー追加）                               |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | 変更（GuidanceBlock改善）                        |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`              | 変更（必要に応じて）                             |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                   | 変更（セレクタ追加、既存セレクタがない場合のみ） |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | 新規作成                                         |

## 実行手順

### Step 1: 既存コード読み込み

```bash
# ChatView の現在の実装
cat apps/desktop/src/renderer/views/ChatView/index.tsx

# WorkspaceChatPanel の GuidanceBlock 実装
cat apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# llmSlice のセレクタ定義
grep -n "export const use\|selectedModelId\|selectedProviderId" \
  apps/desktop/src/renderer/store/slices/llmSlice.ts

# ナビゲーションセレクタ確認
grep -rn "setCurrentView\|useSetCurrentView" \
  apps/desktop/src/renderer/store/slices/
```

### Step 2: LLMGuidanceBanner コンポーネント設計図作成

Task 2-1 の設計に基づいてコンポーネント仕様を詳細化する。

### Step 3: セレクタ不足箇所の特定

Task 3-1/3-2 の調査結果を元に、追加が必要なセレクタをリストアップする。

### Step 4: 変更差分の最小化確認

既存の LLMSelectorPanel との重複を確認し、新規コンポーネントが既存機能と競合しないことを確認する。

```bash
grep -rn "LLMSelector\|llm-selector" \
  apps/desktop/src/renderer/views/
```

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Phase 2 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md` |

## 完了条件

- [ ] LLMGuidanceBanner コンポーネントの Props・表示条件・UIレイアウトが設計されている
- [ ] ChatView への統合方針（バナー配置場所・遷移コールバック）が設計されている
- [ ] WorkspaceChatPanel GuidanceBlock の改善方針が設計されている
- [ ] Zustand 個別セレクタの使用方針が明確になっている（P31対策済み）
- [ ] 画面遷移パターン（`setCurrentView("settings")`）が確認されている
- [ ] LLMSelectorPanel との重複がないことが確認されている
- [ ] 新規 IPC ハンドラなしのRendererのみの変更であることが確認されている
- [ ] コンポーネント依存方向が一方向（Renderer内部）であることが確認されている

## 次Phase

[Phase 3: 設計レビュー](./phase-3-design-review.md)
