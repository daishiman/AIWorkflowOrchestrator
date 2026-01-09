# LLM UIコンポーネント設計

## 文書情報

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| タスクID | TASK-LLM-UI-IPC-ADAPTER-001                 |
| Phase    | 2                                           |
| 作成日   | 2026-01-09                                  |
| 配置先   | `apps/desktop/src/renderer/components/llm/` |

---

## 1. コンポーネント一覧

| コンポーネント   | 責務                        | 状態管理     |
| ---------------- | --------------------------- | ------------ |
| ProviderSelector | プロバイダー選択UI          | llmSlice連携 |
| ModelSelector    | モデル選択UI                | llmSlice連携 |
| HealthIndicator  | 接続状態表示                | llmSlice連携 |
| LLMSelectorPanel | 統合パネル（上記3つを含む） | llmSlice連携 |

---

## 2. ProviderSelector

### 2.1 概要

```
┌─────────────────────────────────────────┐
│ Provider: [OpenAI           ▼]          │
└─────────────────────────────────────────┘
```

### 2.2 Props定義

```typescript
interface ProviderSelectorProps {
  /** 利用可能なプロバイダー一覧 */
  providers: LLMProvider[];

  /** 現在選択中のプロバイダーID */
  selectedProviderId: LLMProviderId | null;

  /** プロバイダー選択時のコールバック */
  onSelect: (providerId: LLMProviderId) => void;

  /** 無効状態 */
  disabled?: boolean;

  /** ローディング状態 */
  isLoading?: boolean;

  /** カスタムクラス名 */
  className?: string;
}
```

### 2.3 内部State

```typescript
interface ProviderSelectorState {
  /** ドロップダウン開閉状態 */
  isOpen: boolean;
}
```

### 2.4 イベントハンドラー

| イベント     | ハンドラー         | 動作                          |
| ------------ | ------------------ | ----------------------------- |
| クリック     | handleToggle       | ドロップダウン開閉            |
| 項目選択     | handleSelect       | onSelect(providerId) 呼び出し |
| Escape       | handleEscape       | ドロップダウン閉じる          |
| 外部クリック | handleOutsideClick | ドロップダウン閉じる          |
| Tab          | handleTab          | フォーカス移動                |

### 2.5 レンダリングロジック

```typescript
const renderProvider = (provider: LLMProvider) => {
  const isSelected = provider.id === selectedProviderId;
  const isDisabled = !provider.isAvailable;

  return (
    <DropdownItem
      key={provider.id}
      disabled={isDisabled}
      selected={isSelected}
      onClick={() => !isDisabled && handleSelect(provider.id)}
    >
      {provider.icon && <ProviderIcon src={provider.icon} />}
      <span>{provider.name}</span>
      {isDisabled && <DisabledBadge>APIキー未設定</DisabledBadge>}
    </DropdownItem>
  );
};
```

### 2.6 アクセシビリティ

| 属性                  | 値                        |
| --------------------- | ------------------------- |
| role                  | combobox                  |
| aria-expanded         | {isOpen}                  |
| aria-haspopup         | listbox                   |
| aria-labelledby       | "provider-selector-label" |
| aria-activedescendant | 選択中項目のID            |

---

## 3. ModelSelector

### 3.1 概要

```
┌─────────────────────────────────────────┐
│ Model: [GPT-4o                ▼]        │
└─────────────────────────────────────────┘
```

### 3.2 Props定義

```typescript
interface ModelSelectorProps {
  /** 利用可能なモデル一覧 */
  models: LLMModel[];

  /** 現在選択中のモデルID */
  selectedModelId: string | null;

  /** モデル選択時のコールバック */
  onSelect: (modelId: string) => void;

  /** 無効状態 */
  disabled?: boolean;

  /** ローディング状態 */
  isLoading?: boolean;

  /** カスタムクラス名 */
  className?: string;
}
```

### 3.3 内部State

```typescript
interface ModelSelectorState {
  /** ドロップダウン開閉状態 */
  isOpen: boolean;

  /** 検索フィルタ（モデル数が多い場合） */
  filterText: string;
}
```

### 3.4 イベントハンドラー

| イベント | ハンドラー   | 動作                       |
| -------- | ------------ | -------------------------- |
| クリック | handleToggle | ドロップダウン開閉         |
| 項目選択 | handleSelect | onSelect(modelId) 呼び出し |
| 入力     | handleFilter | モデルリストをフィルタ     |
| Escape   | handleEscape | ドロップダウン閉じる       |

### 3.5 レンダリングロジック

```typescript
const renderModel = (model: LLMModel) => {
  const isSelected = model.id === selectedModelId;
  const isDefault = model.isDefault;

  return (
    <DropdownItem
      key={model.id}
      selected={isSelected}
      onClick={() => handleSelect(model.id)}
    >
      <span>{model.name}</span>
      {isDefault && <DefaultBadge>デフォルト</DefaultBadge>}
      {model.description && (
        <ModelDescription>{model.description}</ModelDescription>
      )}
    </DropdownItem>
  );
};

// フィルタ適用
const filteredModels = models.filter(m =>
  m.name.toLowerCase().includes(filterText.toLowerCase())
);
```

### 3.6 アクセシビリティ

| 属性            | 値                     |
| --------------- | ---------------------- |
| role            | combobox               |
| aria-expanded   | {isOpen}               |
| aria-haspopup   | listbox                |
| aria-labelledby | "model-selector-label" |

---

## 4. HealthIndicator

### 4.1 概要

```
┌─────┐
│ ● ✓ │  ← 緑: connected
└─────┘

┌─────┐
│ ● ! │  ← 黄: degraded (latency高)
└─────┘

┌─────┐
│ ● ✗ │  ← 赤: error
└─────┘

┌─────┐
│ ◌   │  ← 灰: checking...
└─────┘
```

### 4.2 Props定義

```typescript
interface HealthIndicatorProps {
  /** ヘルスチェック結果 */
  healthStatus: HealthCheckResult | undefined;

  /** 更新ボタンクリック時のコールバック */
  onRefresh?: () => void;

  /** ローディング状態 */
  isLoading?: boolean;

  /** サイズ */
  size?: "sm" | "md" | "lg";

  /** カスタムクラス名 */
  className?: string;
}
```

### 4.3 ステータス表示ロジック

```typescript
const getStatusDisplay = (status: HealthCheckResult | undefined) => {
  if (!status) {
    return { color: "gray", icon: "loading", text: "チェック中..." };
  }

  switch (status.status) {
    case "connected":
      return {
        color: "green",
        icon: "check",
        text: `接続済み${status.latency ? ` (${status.latency}ms)` : ""}`,
      };
    case "disconnected":
      return { color: "yellow", icon: "warning", text: "切断" };
    case "error":
      return {
        color: "red",
        icon: "error",
        text: status.errorMessage || "エラー",
      };
  }
};
```

### 4.4 レンダリングロジック

```typescript
const { color, icon, text } = getStatusDisplay(healthStatus);

return (
  <div className={cn('health-indicator', className)}>
    <StatusDot color={color}>
      {isLoading ? <Spinner size="xs" /> : <Icon name={icon} />}
    </StatusDot>
    <Tooltip content={text}>
      <span className="sr-only">{text}</span>
    </Tooltip>
    {onRefresh && (
      <RefreshButton
        onClick={onRefresh}
        disabled={isLoading}
        aria-label="接続状態を更新"
      />
    )}
  </div>
);
```

### 4.5 アクセシビリティ

| 属性       | 値               |
| ---------- | ---------------- |
| role       | status           |
| aria-live  | polite           |
| aria-label | 接続状態: {text} |

---

## 5. LLMSelectorPanel

### 5.1 概要

```
┌─────────────────────────────────────────────────────────────┐
│ LLM設定                                            ● ✓      │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Provider: [OpenAI    ▼] │ │ Model: [GPT-4o           ▼] │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Props定義

```typescript
interface LLMSelectorPanelProps {
  /** 表示/非表示 */
  isVisible?: boolean;

  /** パネル閉じるコールバック（モーダル時） */
  onClose?: () => void;

  /** コンパクトモード（ツールバー埋め込み時） */
  compact?: boolean;

  /** カスタムクラス名 */
  className?: string;
}
```

### 5.3 llmSlice連携

```typescript
const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  isVisible = true,
  onClose,
  compact = false,
  className,
}) => {
  // llmSlice から状態取得
  const {
    providers,
    selectedProviderId,
    selectedModelId,
    isLoading,
    error,
    healthStatus,
    fetchProviders,
    selectProvider,
    selectModel,
    checkHealth,
  } = useLLMStore();

  // 選択中プロバイダーのモデル一覧取得
  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const models = selectedProvider?.models ?? [];

  // 選択中プロバイダーのヘルス状態
  const currentHealth = selectedProviderId
    ? healthStatus[selectedProviderId]
    : undefined;

  // 初期ロード
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // プロバイダー選択時にヘルスチェック
  useEffect(() => {
    if (selectedProviderId) {
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]);

  // ... レンダリング
};
```

### 5.4 エラー表示

```typescript
{error && (
  <ErrorBanner>
    <ErrorIcon />
    <ErrorMessage>{error.message}</ErrorMessage>
    {error.retryable && (
      <RetryButton onClick={() => fetchProviders()}>
        リトライ
      </RetryButton>
    )}
  </ErrorBanner>
)}
```

### 5.5 レンダリング構造

```tsx
return (
  <Panel className={cn("llm-selector-panel", className, { compact })}>
    {/* ヘッダー */}
    <PanelHeader>
      <PanelTitle>LLM設定</PanelTitle>
      <HealthIndicator
        healthStatus={currentHealth}
        onRefresh={() => selectedProviderId && checkHealth(selectedProviderId)}
        isLoading={isLoading}
      />
    </PanelHeader>

    {/* エラー表示 */}
    {error && <ErrorBanner error={error} onRetry={fetchProviders} />}

    {/* セレクター */}
    <PanelBody>
      {isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          <FormField label="Provider">
            <ProviderSelector
              providers={providers}
              selectedProviderId={selectedProviderId}
              onSelect={selectProvider}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Model">
            <ModelSelector
              models={models}
              selectedModelId={selectedModelId}
              onSelect={selectModel}
              disabled={isLoading || !selectedProviderId}
            />
          </FormField>
        </>
      )}
    </PanelBody>

    {/* フッター（モーダル時） */}
    {onClose && (
      <PanelFooter>
        <Button onClick={onClose}>閉じる</Button>
      </PanelFooter>
    )}
  </Panel>
);
```

---

## 6. スタイリング方針

### 6.1 Tailwind CSS クラス設計

```typescript
// components/llm/styles.ts
export const llmStyles = {
  panel: "bg-background border border-border rounded-lg shadow-sm",
  header: "flex items-center justify-between px-4 py-3 border-b",
  body: "p-4 space-y-4",
  footer: "px-4 py-3 border-t flex justify-end",

  selector: {
    trigger:
      "w-full flex items-center justify-between px-3 py-2 rounded-md border",
    dropdown:
      "absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg",
    item: "px-3 py-2 cursor-pointer hover:bg-accent",
    itemDisabled: "opacity-50 cursor-not-allowed",
    itemSelected: "bg-accent",
  },

  health: {
    dot: "w-3 h-3 rounded-full",
    connected: "bg-green-500",
    disconnected: "bg-yellow-500",
    error: "bg-red-500",
    loading: "bg-gray-300",
  },
};
```

### 6.2 ダークモード対応

Tailwind の `dark:` バリアントを使用:

```tsx
<div className="bg-white dark:bg-gray-900">
  <span className="text-gray-900 dark:text-gray-100">{provider.name}</span>
</div>
```

---

## 7. テスト設計

### 7.1 ProviderSelector テスト

```typescript
describe('ProviderSelector', () => {
  const mockProviders: LLMProvider[] = [
    { id: 'openai', name: 'OpenAI', isAvailable: true, models: [...] },
    { id: 'anthropic', name: 'Anthropic', isAvailable: false, models: [...] },
  ];

  it('プロバイダー一覧を表示する', () => {
    render(<ProviderSelector providers={mockProviders} ... />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('無効なプロバイダーはグレーアウト表示', () => {
    render(<ProviderSelector providers={mockProviders} ... />);
    const anthropicItem = screen.getByText('Anthropic').closest('button');
    expect(anthropicItem).toHaveAttribute('disabled');
  });

  it('プロバイダー選択時にonSelectが呼ばれる', async () => {
    const onSelect = vi.fn();
    render(<ProviderSelector providers={mockProviders} onSelect={onSelect} ... />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('OpenAI'));

    expect(onSelect).toHaveBeenCalledWith('openai');
  });
});
```

### 7.2 LLMSelectorPanel テスト

```typescript
describe('LLMSelectorPanel', () => {
  it('マウント時にfetchProvidersが呼ばれる', () => {
    const mockFetchProviders = vi.fn();
    // Zustand store のモック設定
    useLLMStore.setState({ fetchProviders: mockFetchProviders, ... });

    render(<LLMSelectorPanel />);

    expect(mockFetchProviders).toHaveBeenCalled();
  });

  it('エラー時にエラーバナーを表示', () => {
    useLLMStore.setState({
      error: { code: 'NETWORK_ERROR', message: 'ネットワークエラー', retryable: true },
      ...
    });

    render(<LLMSelectorPanel />);

    expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'リトライ' })).toBeInTheDocument();
  });
});
```

---

## 8. ファイル構成

```
apps/desktop/src/renderer/components/llm/
├── index.ts                    # エクスポート
├── ProviderSelector.tsx        # プロバイダーセレクター
├── ModelSelector.tsx           # モデルセレクター
├── HealthIndicator.tsx         # ヘルスインジケーター
├── LLMSelectorPanel.tsx        # 統合パネル
├── styles.ts                   # 共通スタイル
├── types.ts                    # コンポーネント固有型
└── __tests__/
    ├── ProviderSelector.test.tsx
    ├── ModelSelector.test.tsx
    ├── HealthIndicator.test.tsx
    └── LLMSelectorPanel.test.tsx
```
