# UI設計 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| 機能名 | chat-multi-llm-switching   |
| Phase  | 2                          |
| 作成日 | 2026-01-07                 |
| スキル | design-system-architecture |

---

## 1. コンポーネント階層

```
apps/desktop/src/renderer/components/
└── Chat/
    ├── ChatView.tsx              # チャット画面全体（既存）
    ├── ChatInput.tsx             # メッセージ入力エリア（既存）
    ├── ChatMessages.tsx          # メッセージ一覧（既存）
    ├── LLMSelector/              # 新規: LLM選択コンポーネント
    │   ├── index.tsx             # エクスポート
    │   ├── LLMSelector.tsx       # メインコンポーネント
    │   ├── ProviderDropdown.tsx  # プロバイダー選択
    │   ├── ModelDropdown.tsx     # モデル選択
    │   └── LLMSelector.test.tsx  # テスト
    └── MessageWithLLM/           # 新規: LLMラベル付きメッセージ
        ├── index.tsx             # エクスポート
        ├── MessageWithLLM.tsx    # メインコンポーネント
        ├── LLMBadge.tsx          # LLMバッジ
        └── MessageWithLLM.test.tsx # テスト
```

---

## 2. LLMSelector コンポーネント

### 2.1 コンポーネント構成

```
┌─────────────────────────────────────────────────────────────┐
│                      LLMSelector                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │   ProviderDropdown      │ │    ModelDropdown        │    │
│  │  ┌───────────────────┐  │ │  ┌───────────────────┐  │    │
│  │  │ 🟢 OpenAI       ▼│  │ │  │ GPT-4o          ▼│  │    │
│  │  └───────────────────┘  │ │  └───────────────────┘  │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Props 定義

```typescript
// LLMSelector.tsx
interface LLMSelectorProps {
  /** 選択中のプロバイダーID */
  selectedProviderId: LLMProviderId;

  /** 選択中のモデルID */
  selectedModelId: string;

  /** プロバイダー変更ハンドラ */
  onProviderChange: (providerId: LLMProviderId) => void;

  /** モデル変更ハンドラ */
  onModelChange: (modelId: string) => void;

  /** 無効化フラグ（送信中など） */
  disabled?: boolean;

  /** コンパクト表示 */
  compact?: boolean;

  /** カスタムクラス */
  className?: string;
}
```

### 2.3 ProviderDropdown

```typescript
// ProviderDropdown.tsx
interface ProviderDropdownProps {
  providers: LLMProvider[];
  selectedId: LLMProviderId;
  onChange: (id: LLMProviderId) => void;
  disabled?: boolean;
}
```

**表示仕様**:

| 状態          | 表示                               |
| ------------- | ---------------------------------- |
| 利用可能      | プロバイダー名 + 🟢                |
| APIキー未設定 | プロバイダー名 + ⚠️ (グレーアウト) |
| 選択中        | ハイライト背景 + チェックマーク    |

### 2.4 ModelDropdown

```typescript
// ModelDropdown.tsx
interface ModelDropdownProps {
  models: LLMModel[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}
```

**表示仕様**:

| 状態           | 表示                            |
| -------------- | ------------------------------- |
| デフォルト     | モデル名 + (推奨) ラベル        |
| 選択中         | ハイライト背景 + チェックマーク |
| モデル説明あり | モデル名 + 小さいサブテキスト   |

---

## 3. MessageWithLLM コンポーネント

### 3.1 レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│  Assistant                                    [OpenAI GPT-4o] │
│  ─────────────────────────────────────────────────────────── │
│  こんにちは！何かお手伝いできることはありますか？            │
│                                                               │
│                                               2026-01-07 16:00│
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Props 定義

```typescript
// MessageWithLLM.tsx
interface MessageWithLLMProps {
  /** メッセージデータ */
  message: ChatMessageWithLLM;

  /** LLMバッジ表示フラグ */
  showLLMBadge?: boolean;

  /** タイムスタンプ表示フラグ */
  showTimestamp?: boolean;
}

// 拡張されたメッセージ型
interface ChatMessageWithLLM extends ChatMessage {
  /** 使用されたプロバイダーID（assistant時） */
  llmProviderId?: LLMProviderId;

  /** 使用されたモデルID（assistant時） */
  llmModelId?: string;
}
```

### 3.3 LLMBadge

```typescript
// LLMBadge.tsx
interface LLMBadgeProps {
  providerId: LLMProviderId;
  modelId: string;
  size?: "sm" | "md";
}
```

**スタイル仕様**:

| プロバイダー | 背景色  | アイコン |
| ------------ | ------- | -------- |
| OpenAI       | #10A37F | 🟢       |
| Anthropic    | #D97706 | 🟠       |
| Google       | #4285F4 | 🔵       |
| xAI          | #000000 | ⚫       |

---

## 4. 配置位置

### 4.1 ChatView 内の配置

```
┌─────────────────────────────────────────────────────────────┐
│  Chat View                                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Header                                                  ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ 💬 チャット        [LLMSelector: OpenAI ▼] [GPT-4o ▼]│││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Messages Area                                          ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ User: こんにちは                                  │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ Assistant [OpenAI GPT-4o]: こんにちは！          │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Input Area                                             ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ メッセージを入力...                    [送信]    │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 5. インタラクション設計

### 5.1 プロバイダー切り替え

| 操作                   | 動作                                 |
| ---------------------- | ------------------------------------ |
| ドロップダウンクリック | プロバイダー一覧を表示               |
| プロバイダー選択       | 即座に切り替え（確認なし）           |
| APIキー未設定選択      | 設定画面への誘導ダイアログ表示       |
| 切り替え後             | モデルは新プロバイダーのデフォルトへ |

### 5.2 モデル切り替え

| 操作                   | 動作                       |
| ---------------------- | -------------------------- |
| ドロップダウンクリック | モデル一覧を表示           |
| モデル選択             | 即座に切り替え（確認なし） |
| 切り替え後             | 次のメッセージから適用     |

### 5.3 送信中の状態

| 状態   | LLMSelector動作           |
| ------ | ------------------------- |
| 送信中 | disabled=true（操作不可） |
| エラー | 再度操作可能              |
| 完了後 | 再度操作可能              |

---

## 6. アクセシビリティ

### 6.1 キーボード操作

| キー          | 動作                 |
| ------------- | -------------------- |
| Tab           | フォーカス移動       |
| Enter/Space   | ドロップダウン開閉   |
| Arrow Up/Down | 選択肢間移動         |
| Enter         | 選択確定             |
| Escape        | ドロップダウン閉じる |

### 6.2 ARIA属性

```tsx
<div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
  <button aria-label="LLMプロバイダーを選択">{selectedProvider.name}</button>
  <ul role="listbox" aria-label="プロバイダー一覧">
    <li role="option" aria-selected={isSelected}>
      {provider.name}
    </li>
  </ul>
</div>
```

### 6.3 スクリーンリーダー対応

| 要素             | 読み上げ内容                              |
| ---------------- | ----------------------------------------- |
| プロバイダー選択 | 「LLMプロバイダーを選択、OpenAI、選択中」 |
| モデル選択       | 「LLMモデルを選択、GPT-4o、選択中」       |
| LLMバッジ        | 「OpenAI GPT-4oで生成」                   |

---

## 7. レスポンシブ対応

### 7.1 ブレークポイント

| 幅       | LLMSelector表示            |
| -------- | -------------------------- |
| >= 768px | 横並び（Provider + Model） |
| < 768px  | 縦積み or アイコンのみ表示 |

### 7.2 コンパクトモード

```tsx
// 狭い画面用
<LLMSelector compact={true} />

// コンパクト時の表示
┌─────────────────────┐
│ 🟢 GPT-4o         ▼│
└─────────────────────┘
```

---

## 8. エラー状態

### 8.1 APIキー未設定

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Anthropic のAPIキーが設定されていません                 │
│                                                              │
│  [設定画面を開く]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 接続エラー

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ OpenAI への接続に失敗しました                            │
│                                                              │
│  [再試行] [別のLLMを使用]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. 関連ドキュメント

| ドキュメント       | パス                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                  |
| 状態管理設計       | `outputs/phase-2/state-management-design.md`                              |
| API仕様            | `outputs/phase-2/api-specification.md`                                    |
| 既存UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md` |
