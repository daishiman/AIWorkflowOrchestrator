# Phase 2: 設計 — ChatView インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| Phase    | 2                                           |
| 機能名   | chatview-inline-model-selector-integration  |
| タスクID | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                  |
| 更新日   | 2026-03-22                                  |

## 目的

Phase 1の要件定義に基づき、ChatViewへのInlineModelSelector配置設計・LLMGuidanceBannerとの共存設計を行う。

## 実行タスク

- 配置設計: ChatViewヘッダーへの具体的な配置位置とレイアウトを決定
- 表示制御設計: LLMGuidanceBannerとInlineModelSelectorの共存ルールを設計
- disabled制御設計: ストリーミング中のInlineModelSelector無効化方式を設計

## 参照資料

| 資料名              | パス                                                               | 説明                         |
| ------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Phase 1 要件定義    | `./phase-1-requirements.md`                                        | ChatView統合の要件・受入基準 |
| ChatView実装        | `apps/desktop/src/renderer/views/ChatView/index.tsx`               | 統合先（355行）              |
| LLMGuidanceBanner   | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`   | 既存警告バナー（44行）       |
| InlineModelSelector | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | Task 01成果物（462行）       |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                             | 内容                     |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                          | 既存UIコンポーネント構造 |
| デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG準拠設計        |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` | P31/P48対策パターン      |

## 実行手順

### ステップ1: ChatView現行レイアウトの分析

```
ChatView (現行: 355行)
┌─────────────────────────────────────────┐
│ <header>                                │
│   <h1> AIチャット </h1>                 │
│   <p> RAGステータス </p>                │
│   <button> スキル管理 </button>         │
│   <button> チャット履歴 </button>       │
│ </header>                               │
│                                         │
│ <LLMGuidanceBanner />                   │  ← モデル未選択時のみ表示
│                                         │
│ <SystemPromptToggleButton />            │
│ {expanded && <SystemPromptPanel />}     │
│                                         │
│ <main> メッセージエリア </main>         │
│                                         │
│ {chatError && <ErrorBanner />}          │
│                                         │
│ <footer>                                │
│   <GlassPanel> <ChatInput /> </GlassPanel>│
│ </footer>                               │
└─────────────────────────────────────────┘
```

### ステップ2: InlineModelSelector配置設計

```
ChatView (変更後)
┌─────────────────────────────────────────┐
│ <header>                                │
│   <h1> AIチャット </h1>                 │
│   <p> RAGステータス </p>                │
│   <InlineModelSelector compact          │  ← 新規追加: ヘッダー右側のボタン群の前
│     disabled={isSending} />             │
│   <button> スキル管理 </button>         │
│   <button> チャット履歴 </button>       │
│ </header>                               │
│                                         │
│ <LLMGuidanceBanner />                   │  ← 変更なし（既存動作維持）
│                                         │
│ ... (以降変更なし)                       │
└─────────────────────────────────────────┘
```

**配置位置**: ヘッダー内、RAGステータスの後・ボタン群の前
**理由**:

1. チャット入力前にモデルを確認・変更する操作フローに合致
2. ヘッダーの既存flex配置に自然に収まる
3. compact版（高さ28px）はヘッダー高に収まる

### ステップ3: 実装変更箇所の特定

#### 3.1 ChatView/index.tsx の変更

```typescript
// 追加するimport
import { InlineModelSelector } from "@/renderer/components/llm";

// header内のJSXに追加（既存ボタン群の前）
<InlineModelSelector compact disabled={isSending} />
```

**変更量**: import 1行 + JSX 1行（計2行の追加のみ）

**`isSending` の取得**: 既にStoreから取得済み（`const isSending = useAppStore((state) => state.isSending);`）。追加のStore接続は不要。

#### 3.2 LLMGuidanceBanner.tsx の変更

**変更なし**。現在の実装で `selectedModelId` と `selectedProviderId` が両方非nullなら非表示になる動作は、InlineModelSelectorから選択した場合も同じStore更新パスを通るため、そのまま動作する。

```typescript
// LLMGuidanceBanner.tsx 現行実装（変更不要）
const selectedModelId = useSelectedModelId();
const selectedProviderId = useSelectedProviderId();
const isModelSelected = selectedModelId !== null && selectedProviderId !== null;
if (isModelSelected) return null; // ← InlineModelSelector選択後も自動で非表示
```

### ステップ4: LLMGuidanceBannerとの共存設計

| 状態                          | InlineModelSelector      | LLMGuidanceBanner      |
| ----------------------------- | ------------------------ | ---------------------- |
| モデル未選択（初回）          | 表示（プレースホルダー） | 表示（Settings誘導）   |
| InlineModelSelectorで選択直後 | 表示（選択中モデル名）   | 即座に非表示           |
| モデル選択済み                | 表示（選択中モデル名）   | 非表示                 |
| ストリーミング中              | 表示（disabled）         | 非表示（選択済み前提） |

**設計判断**: LLMGuidanceBannerは変更不要。InlineModelSelectorがStoreを更新すると、LLMGuidanceBanner内の `useSelectedModelId()` / `useSelectedProviderId()` が反応し、自動で非表示になる。追加のイベント連携は不要。

### ステップ5: disabled制御設計

```typescript
// ChatView/index.tsx内（既存のStore取得を利用）
const isSending = useAppStore((state) => state.isSending);

// JSX
<InlineModelSelector compact disabled={isSending} />
```

**ストリーミング中にモデルを変更させない理由**:

- 途中でモデルが変わるとストリーミングレスポンスと不整合が発生する
- `isSending` フラグはStoreで既に管理済みなので追加実装なし

### ステップ6: Tab順序設計

```
Tab順序（ヘッダー内）:
1. h1 "AIチャット"（非フォーカス）
2. InlineModelSelector (combobox)  ← 新規追加
3. "スキル管理" ボタン
4. "チャット履歴" ボタン
```

DOMの配置順がそのままTab順序になるため、特別な `tabIndex` 設定は不要。

## 統合テスト連携（Phase 2）

- ChatView内にInlineModelSelectorがレンダーされることのテスト
- `isSending=true` 時に `disabled` propが渡されることのテスト
- LLMGuidanceBannerがモデル選択後に非表示になることのテスト
- P39対策: happy-dom環境では `fireEvent` を使用

## 多角的チェック観点

| 観点             | 適用 | 確認内容                                         |
| ---------------- | ---- | ------------------------------------------------ |
| UI/UX            | 該当 | ヘッダーレイアウトの崩れなし、compact版の操作性  |
| アーキテクチャ   | 該当 | 変更量が最小（2行追加）、既存Store/IPC活用       |
| アクセシビリティ | 該当 | Tab順序の自然さ（Task 01のARIA実装を継承）       |
| パフォーマンス   | 該当 | 追加Store接続なし（isSendingは既存取得を再利用） |

## 成果物

| 成果物 | パス                                                                                 | 説明           |
| ------ | ------------------------------------------------------------------------------------ | -------------- |
| 設計書 | `docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [x] ChatView現行レイアウトを分析し配置位置を決定
- [x] InlineModelSelectorの配置位置とprops設計を完了
- [x] LLMGuidanceBannerとの共存設計（変更不要の根拠含む）を完了
- [x] disabled制御（ストリーミング中）の方式を決定
- [x] Tab順序設計を完了
- [x] 影響ファイルの変更箇所と変更量を特定
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-3-design-review.md`（同ディレクトリ内）
