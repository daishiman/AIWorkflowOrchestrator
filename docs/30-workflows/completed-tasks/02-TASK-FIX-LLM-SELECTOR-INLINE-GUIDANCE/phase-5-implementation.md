# Phase 5: 実装

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase番号  | 5                                                |
| 機能名     | LLMモデル選択インラインガイダンス追加            |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE            |
| 作成日     | 2026-03-20                                       |
| ステータス | 作成済み                                         |
| 依存       | [Phase 4 テスト作成](./phase-4-test-creation.md) |

## 目的

Phase 4 で作成したテストを Green にするため、以下の実装を行う:

1. セレクタ実装状況の確認（store/index.ts に実装済み、追加不要）
2. `LLMGuidanceBanner.tsx` 新規作成
3. `ChatView/index.tsx` へのバナー統合
4. `WorkspaceChatPanel.tsx` の GuidanceBlock 改善

## 実行タスク

### Task 1: 前提コード調査

実装前に既存コードを読み込み、変更差分を最小化する。

```bash
# llmSlice の個別セレクタ確認
grep -n "export const use\|selectedModelId\|selectedProviderId" \
  apps/desktop/src/renderer/store/slices/llmSlice.ts

# setCurrentView / useSetCurrentView の確認
grep -rn "setCurrentView\|useSetCurrentView" \
  apps/desktop/src/renderer/store/slices/

# ChatView の現在の実装
cat apps/desktop/src/renderer/views/ChatView/index.tsx

# WorkspaceChatPanel の GuidanceBlock 現在の実装
cat apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# GuidanceBlock コンポーネント本体の確認（props 構造）
grep -rn "GuidanceBlock" apps/desktop/src/renderer/
```

### Task 2: セレクタ実装状況の確認（追加不要）

P50チェックにより、以下のセレクタが store/index.ts に既に実装済みであることを確認した:

- `useSelectedModelId()` (L465-466)
- `useSelectedProviderId()` (L459-460)
- `useSetCurrentView()` (L267-268)

**新規セレクタの追加は不要。** 上記セレクタを import して使用する。

### Task 3: LLMGuidanceBanner コンポーネント実装

**ファイルパス**: `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`

**実装仕様**:

```typescript
interface LLMGuidanceBannerProps {
  onNavigateToSettings: () => void;
}
```

```typescript
// store/index.ts から個別セレクタを import
import { useSelectedModelId, useSelectedProviderId } from "@/renderer/store";
```

**表示条件**: `selectedModelId` または `selectedProviderId` のいずれかが null / undefined のとき表示

**UIデザイン要件（Apple HIG準拠）**:

- バナー背景: `bg-orange-50 dark:bg-orange-950` または CSS変数でsystemOrange 10%透明度
- テキスト: primaryLabel カラー（ライトモード #000000 / ダークモード #FFFFFF）
- ボタン: systemBlue (`text-[#007AFF] dark:text-[#0A84FF]`) のゴーストボタン
- アイコン: 警告アイコン（exclamation triangle or circle）
- アニメーション: `transition-opacity duration-200`
- アクセシビリティ: `role="alert"` を設定
- スペーシング: 8px グリッド準拠（`py-2 px-4` = 8px/16px）
- 角丸: `rounded-lg` (8px)

**レイアウト**:

```
[ !  AIモデルが選択されていません          [設定画面へ →] ]
```

### Task 4: ChatView へのバナー統合

**ファイル**: `apps/desktop/src/renderer/views/ChatView/index.tsx`

**変更方針**:

- `useSetCurrentView()` セレクタを使用してナビゲーション関数を取得
- ヘッダー直下（チャット入力エリアの上）に `<LLMGuidanceBanner>` を配置
- `onNavigateToSettings` に `() => setCurrentView("settings")` を渡す

```typescript
import { useSetCurrentView } from "@/renderer/store";

// ChatView 内での使用例
const setCurrentView = useSetCurrentView();

return (
  <div className="flex flex-col h-full">
    {/* ヘッダー */}
    <LLMGuidanceBanner onNavigateToSettings={() => setCurrentView("settings")} />
    {/* チャット本体 */}
  </div>
);
```

**注意**: LLMGuidanceBanner 内部で表示/非表示を自己管理するため、ChatView 側は常にレンダリングする。

### Task 5: WorkspaceChatPanel GuidanceBlock 改善

**ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**変更方針**:

- 既存 GuidanceBlock の `onAction` コールバックを接続する（Props 拡張不要、既に定義済み）
- ボタンラベル: 「設定画面を開く」

**GuidanceBlock の Props は既に `actionLabel` + `onAction` の分離型で定義済み**:

```typescript
interface GuidanceBlockProps {
  variant: GuidanceVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Props 拡張は不要。既存の `onAction` に値を渡すだけ。

**WorkspaceChatPanel での使用例**:

```typescript
const setCurrentView = useSetCurrentView();

<GuidanceBlock
  variant="blocked"
  message="AIモデルが選択されていません。Settings で使用するモデルを設定してください。"
  actionLabel="Settings を開く"
  onAction={() => setCurrentView("settings")}
/>
```

### Task 6: 実装後テスト実行（Green確認）

```bash
# LLMGuidanceBanner テスト
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx

# ChatView 統合テスト
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx

# WorkspaceChatPanel テスト
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx
```

## 参照資料

### フェーズ成果物

| ファイル                                                                              | 用途         |
| ------------------------------------------------------------------------------------- | ------------ |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`        | 設計仕様     |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-4-test-creation.md` | テストケース |

### プロジェクトルール

| ファイル                                 | 用途                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `.claude/rules/01-architecture.md`       | Apple HIG カラーパレット・スペーシング            |
| `.claude/rules/03-state-management.md`   | Zustand セレクタ設計                              |
| `.claude/rules/06-known-pitfalls.md#P31` | Zustand合成Hook無限ループ防止（個別セレクタ使用） |
| `.claude/rules/06-known-pitfalls.md#P46` | HTMLAttributes Props型衝突パターン                |
| `.claude/rules/06-known-pitfalls.md#P61` | DIP 違反: コンポーネント依存方向確認              |

### 実装対象ファイル

| ファイル                                                               | 変更種別                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | 新規作成                                         |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | 変更（バナー追加）                               |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | 変更（GuidanceBlock onAction接続）               |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                   | 変更不要（セレクタは store/index.ts に実装済み） |

## 実行手順

### Step 1: 既存コード読み込み（Task 1 実行）

実装前に必ず対象ファイルを全て読む。未読のままコードを変更しない。

### Step 2: セレクタ実装状況確認（Task 2）

### Step 3: LLMGuidanceBanner 実装（Task 3）

### Step 4: ChatView 統合（Task 4）

### Step 5: WorkspaceChatPanel 改善（Task 5）

### Step 6: Green 確認（Task 6）

全テストが PASS することを確認する。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                           | パス                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| LLMGuidanceBanner コンポーネント | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       |
| ChatView 変更                    | `apps/desktop/src/renderer/views/ChatView/index.tsx`                   |
| WorkspaceChatPanel 変更          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` |

## 完了条件

- [ ] 既存コードを読み込んでから実装している
- [ ] `LLMGuidanceBanner.tsx` が新規作成されている
- [ ] LLMGuidanceBanner が P31 対策済み個別セレクタを使用している → store/index.ts の既存セレクタを import
- [ ] LLMGuidanceBanner に `role="alert"` が設定されている（WCAG 2.1 AA 準拠）
- [ ] ChatView に LLMGuidanceBanner が統合されている
- [ ] WorkspaceChatPanel の GuidanceBlock の `onAction` に設定遷移が接続されている（Props 拡張不要）
- [ ] 全テストが Green になっている
- [ ] 既存テストが壊れていない

## 次Phase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
