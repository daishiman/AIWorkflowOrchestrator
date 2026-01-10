# Selectコンポーネントテンプレート

## 概要

Selectコンポーネントは、HTMLの`<select>`と`<option>`の関係を実現するコンパウンドコンポーネント。
Contextを使って選択状態を親子間で暗黙的に共有する。

## 構造

```typescript
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

// Context型定義
interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

// メインコンポーネント
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

function Select({ value, onChange, children, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className={`select ${className ?? ''}`}>
        <button
          className="select-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {value || 'Select...'}
        </button>
        {isOpen && (
          <div className="select-options" role="listbox">
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

// Optionコンポーネント
interface OptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

function Option({ value, children, disabled }: OptionProps) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select.Option must be used within a Select');
  }

  const isSelected = context.value === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      className={`option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && context.onChange(value)}
    >
      {children}
    </div>
  );
}

// サブコンポーネントを親に紐付け
Select.Option = Option;
```

## 使用例

```typescript
function App() {
  const [country, setCountry] = useState('');

  return (
    <Select value={country} onChange={setCountry}>
      <Select.Option value="jp">日本</Select.Option>
      <Select.Option value="us">アメリカ</Select.Option>
      <Select.Option value="uk">イギリス</Select.Option>
      <Select.Option value="cn" disabled>中国</Select.Option>
    </Select>
  );
}
```

## 実装のポイント

- **Context内部化**: 消費者はSelectContextを直接触らない
- **エラー検出**: Option単独使用時は明確なエラーメッセージを表示
- **ARIA対応**: role="listbox", role="option", aria-selectedを設定
- **disabled対応**: 無効なオプションのスタイルとクリック無効化
