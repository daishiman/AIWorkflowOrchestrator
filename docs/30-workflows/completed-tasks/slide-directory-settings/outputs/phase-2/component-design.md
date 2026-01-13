# コンポーネント設計書 - スライド出力ディレクトリ設定

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスク     | T-02-1                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |
| ステータス | 完了                     |

---

## コンポーネント階層

```
apps/desktop/src/renderer/
├── components/
│   └── settings/
│       └── SlideDirectorySettings/
│           ├── index.tsx                    # エントリーポイント（re-export）
│           ├── SlideDirectorySettings.tsx   # メインコンポーネント
│           ├── DirectorySelector.tsx        # ディレクトリ選択UI
│           ├── PathDisplay.tsx              # パス表示コンポーネント
│           └── types.ts                     # コンポーネント型定義
└── hooks/
    └── useSlideSettings.ts                  # 設定管理カスタムフック
```

---

## コンポーネント詳細設計

### 1. SlideDirectorySettings（メインコンポーネント）

**ファイル**: `SlideDirectorySettings.tsx`

**責務**:

- 設定セクション全体のレイアウト管理
- 状態管理（useSlideSettingsフック使用）
- 保存/キャンセルアクションの処理
- ローディング状態・エラー状態の管理

**Props**:

```typescript
export interface SlideDirectorySettingsProps {
  className?: string;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}
```

**状態**:

```typescript
interface ComponentState {
  directory: string; // 現在のディレクトリパス
  autoCreate: boolean; // 自動作成オプション
  isModified: boolean; // 変更有無フラグ
  isLoading: boolean; // ローディング状態
  isSaving: boolean; // 保存中状態
  error: string | null; // エラーメッセージ
  validationResult: ValidationResult | null; // バリデーション結果
}
```

**使用するAtomicコンポーネント**:

- `Button` (atoms)
- `Checkbox` (atoms)
- `Spinner` (atoms)
- `FormField` (molecules)

---

### 2. DirectorySelector（ディレクトリ選択UI）

**ファイル**: `DirectorySelector.tsx`

**責務**:

- ディレクトリ選択ボタンの表示
- OS標準ダイアログの起動（IPC経由）
- 選択結果の親コンポーネントへの伝達

**Props**:

```typescript
export interface DirectorySelectorProps {
  value: string;
  onChange: (path: string) => void;
  onValidate: (path: string) => Promise<ValidationResult>;
  disabled?: boolean;
  className?: string;
}
```

**イベントハンドリング**:

```typescript
const handleSelectClick = async () => {
  const result = await window.electronAPI.slideSettings.selectDirectory();
  if (result.success && result.data) {
    onChange(result.data);
    await onValidate(result.data);
  }
};
```

---

### 3. PathDisplay（パス表示コンポーネント）

**ファイル**: `PathDisplay.tsx`

**責務**:

- 現在のディレクトリパスの表示
- パスの省略表示（長いパスの場合）
- バリデーション結果の視覚的フィードバック
- ツールチップでの全パス表示

**Props**:

```typescript
export interface PathDisplayProps {
  path: string;
  validationResult?: ValidationResult | null;
  isValidating?: boolean;
  className?: string;
}
```

**バリデーション結果の型**:

```typescript
export type ValidationStatus = "valid" | "warning" | "error";

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
}
```

**表示パターン**:

| 状態    | アイコン | 色           | メッセージ例                                         |
| ------- | -------- | ------------ | ---------------------------------------------------- |
| valid   | ✓        | 緑 (#10B981) | 有効なディレクトリです                               |
| warning | ⚠        | 橙 (#F59E0B) | ディレクトリが存在しません。保存時に作成されます     |
| error   | ✕        | 赤 (#EF4444) | 無効なパスです。有効なディレクトリを選択してください |

---

### 4. types.ts（型定義）

**ファイル**: `types.ts`

```typescript
// バリデーション関連
export type ValidationStatus = "valid" | "warning" | "error";

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
}

// 設定データ
export interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

// コンポーネントProps
export interface SlideDirectorySettingsProps {
  className?: string;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

export interface DirectorySelectorProps {
  value: string;
  onChange: (path: string) => void;
  onValidate: (path: string) => Promise<ValidationResult>;
  disabled?: boolean;
  className?: string;
}

export interface PathDisplayProps {
  path: string;
  validationResult?: ValidationResult | null;
  isValidating?: boolean;
  className?: string;
}
```

---

## カスタムフック設計

### useSlideSettings

**ファイル**: `hooks/useSlideSettings.ts`

**責務**:

- IPC通信を介した設定の読み書き
- 状態管理の抽象化
- バリデーション処理の提供
- エラーハンドリング

**インターフェース**:

```typescript
export interface UseSlideSettingsReturn {
  // 状態
  settings: SlideSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // アクション
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<SlideSettings>) => Promise<Result<void>>;
  selectDirectory: () => Promise<Result<string | null>>;
  validateDirectory: (path: string) => Promise<ValidationResult>;

  // ヘルパー
  resetError: () => void;
}
```

**実装パターン**:

```typescript
export function useSlideSettings(): UseSlideSettingsReturn {
  const [settings, setSettings] = useState<SlideSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.slideSettings.getAllSettings();
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || "設定の読み込みに失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ... 他のメソッド実装

  return {
    settings,
    isLoading,
    isSaving,
    error,
    loadSettings,
    saveSettings,
    selectDirectory,
    validateDirectory,
    resetError,
  };
}
```

---

## コンポーネント間データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                  SlideDirectorySettings                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useSlideSettings() hook                              │    │
│  │   - settings state                                   │    │
│  │   - loadSettings()                                   │    │
│  │   - saveSettings()                                   │    │
│  │   - selectDirectory()                                │    │
│  │   - validateDirectory()                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│            ┌──────────────┼──────────────┐                  │
│            │              │              │                  │
│            ▼              ▼              ▼                  │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐        │
│  │PathDisplay  │  │Directory   │  │Checkbox      │        │
│  │  path       │  │Selector    │  │ autoCreate   │        │
│  │  validation │  │  onChange  │  │ onChange     │        │
│  └─────────────┘  └────────────┘  └──────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ActionButtons: [キャンセル] [保存]                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## アクセシビリティ要件

### キーボードナビゲーション

| 要素                     | Tab順序 | キー操作           |
| ------------------------ | ------- | ------------------ |
| パス表示フィールド       | 1       | - (読み取り専用)   |
| 選択ボタン               | 2       | Enter/Space で起動 |
| 自動作成チェックボックス | 3       | Space で切り替え   |
| キャンセルボタン         | 4       | Enter で実行       |
| 保存ボタン               | 5       | Enter で実行       |

### ARIA属性

```tsx
// PathDisplay
<div
  role="textbox"
  aria-readonly="true"
  aria-label="出力先ディレクトリ"
  aria-describedby={validationMessageId}
>
  {path}
</div>

// DirectorySelector
<Button
  aria-haspopup="dialog"
  aria-label="ディレクトリを選択"
>
  選択...
</Button>

// ValidationMessage
<div
  id={validationMessageId}
  role="alert"
  aria-live="polite"
>
  {validationMessage}
</div>
```

---

## スタイリング方針

### デザイントークン使用

```css
/* Tailwind CSS クラス参照 */
.slide-settings-section {
  @apply bg-white/5 rounded-lg p-4;
}

.path-display {
  @apply flex items-center gap-2 px-3 py-2 bg-white/10 rounded border border-white/20;
}

.validation-message {
  @apply text-sm mt-1 flex items-center gap-1;
}

.validation-valid {
  @apply text-emerald-400;
}

.validation-warning {
  @apply text-amber-400;
}

.validation-error {
  @apply text-red-400;
}
```

---

## テスト戦略

### ユニットテスト

| コンポーネント         | テスト項目                                       |
| ---------------------- | ------------------------------------------------ |
| SlideDirectorySettings | 初期表示、保存処理、キャンセル処理、エラー表示   |
| DirectorySelector      | クリックイベント、disabled状態、onChange呼び出し |
| PathDisplay            | パス表示、省略表示、バリデーション結果表示       |
| useSlideSettings       | 状態管理、IPC呼び出し、エラーハンドリング        |

### 統合テスト

- 設定読み込み→表示→変更→保存の一連フロー
- バリデーションエラー時の保存ボタン無効化
- キャンセル時の変更破棄

---

## 完了確認

- [x] コンポーネント階層が定義されている
- [x] 各コンポーネントの責務が明確に定義されている
- [x] Props/State/Interfaceが型定義されている
- [x] useSlideSettingsフックが設計されている
- [x] アクセシビリティ要件が定義されている
- [x] スタイリング方針が定義されている
- [x] テスト戦略が定義されている
