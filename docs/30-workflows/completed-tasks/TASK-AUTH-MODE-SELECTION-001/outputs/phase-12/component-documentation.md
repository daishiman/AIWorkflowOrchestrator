# コンポーネントドキュメント - 認証方式選択機能

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| 機能名   | auth-mode-selection          |
| 作成日   | 2026-02-09                   |

---

## コンポーネント一覧

| コンポーネント名    | パス                                                           | 説明           |
| ------------------- | -------------------------------------------------------------- | -------------- |
| AuthModeSelector    | `components/settings/AuthModeSelector/index.tsx`               | 認証方式選択UI |
| AuthStatusIndicator | `components/settings/AuthModeSelector/AuthStatusIndicator.tsx` | 認証状態表示   |
| ConfirmDialog       | `components/settings/AuthModeSelector/ConfirmDialog.tsx`       | 確認ダイアログ |

---

## AuthModeSelector

認証方式を選択するためのセグメントコントロールUIコンポーネント。

### パス

```
apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx
```

### Props

```typescript
interface AuthModeSelectorProps {
  /** 現在選択中の認証方式 */
  currentMode?: AuthMode;
  /** 認証方式変更時のコールバック */
  onModeChange?: (mode: AuthMode) => void;
  /** コンポーネントを無効化 */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
}
```

### 使用例

```tsx
import { AuthModeSelector } from "@/components/settings/AuthModeSelector";
import { useAuthModeStore } from "@/store";

function SettingsPage() {
  const { mode, setMode, isLoading } = useAuthModeStore();

  return (
    <div className="settings-section">
      <h3>認証設定</h3>
      <AuthModeSelector
        currentMode={mode}
        onModeChange={setMode}
        disabled={isLoading}
      />
    </div>
  );
}
```

### デザイン仕様（Apple HIG準拠）

| 要素           | 仕様                        |
| -------------- | --------------------------- |
| レイアウト     | セグメントコントロール      |
| 角丸           | 8px                         |
| 選択状態背景   | #007AFF（アクセントカラー） |
| 非選択状態背景 | #F5F5F7（セカンダリ背景）   |
| フォント       | システムフォント、14px      |
| 高さ           | 32px                        |
| パディング     | 12px 16px                   |

### アクセシビリティ

| 要件           | 実装                        |
| -------------- | --------------------------- |
| ARIA role      | `role="radiogroup"`         |
| ARIA checked   | `aria-checked="true/false"` |
| キーボード操作 | 矢印キーで選択切り替え      |
| フォーカス表示 | フォーカスリング表示        |
| ラベル         | `aria-label="認証方式選択"` |

### 状態

| 状態         | 表示                       |
| ------------ | -------------------------- |
| 通常         | セグメントコントロール表示 |
| ローディング | スピナー + 操作無効        |
| エラー       | エラーメッセージ表示       |
| 無効         | グレーアウト表示           |

---

## AuthStatusIndicator

現在の認証状態を表示するインジケーターコンポーネント。

### パス

```
apps/desktop/src/renderer/components/settings/AuthModeSelector/AuthStatusIndicator.tsx
```

### Props

```typescript
interface AuthStatusIndicatorProps {
  /** 認証状態 */
  status: AuthModeStatus | null;
  /** ローディング中かどうか */
  isLoading?: boolean;
}
```

### 使用例

```tsx
import { AuthStatusIndicator } from "@/components/settings/AuthModeSelector/AuthStatusIndicator";
import { useAuthModeStore } from "@/store";

function AuthSection() {
  const { status, isLoading } = useAuthModeStore();

  return (
    <div className="auth-status">
      <AuthStatusIndicator status={status} isLoading={isLoading} />
    </div>
  );
}
```

### 表示パターン

| 状態         | アイコン | テキスト          | 色                    |
| ------------ | -------- | ----------------- | --------------------- |
| 認証済み     | ✅       | 認証済み          | #34C759（成功）       |
| 未認証       | ⚠️       | 認証が必要です    | #FF9500（警告）       |
| エラー       | ❌       | エラー: {message} | #FF3B30（エラー）     |
| ローディング | 🔄       | 確認中...         | #86868B（セカンダリ） |

---

## ConfirmDialog

認証方式切り替え時の確認ダイアログコンポーネント。

### パス

```
apps/desktop/src/renderer/components/settings/AuthModeSelector/ConfirmDialog.tsx
```

### Props

```typescript
interface ConfirmDialogProps {
  /** ダイアログを開くかどうか */
  isOpen: boolean;
  /** 切り替え先の認証方式 */
  targetMode: AuthMode | null;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 確認時のコールバック */
  onConfirm: () => void;
  /** ローディング中かどうか */
  isLoading?: boolean;
}
```

### 使用例

```tsx
import { ConfirmDialog } from "@/components/settings/AuthModeSelector/ConfirmDialog";
import { useAuthModeStore } from "@/store";

function AuthModeSelector() {
  const {
    isConfirmDialogOpen,
    pendingMode,
    closeConfirmDialog,
    confirmModeChange,
    isLoading,
  } = useAuthModeStore();

  return (
    <>
      {/* セグメントコントロール */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        targetMode={pendingMode}
        onCancel={closeConfirmDialog}
        onConfirm={confirmModeChange}
        isLoading={isLoading}
      />
    </>
  );
}
```

### ダイアログ内容

| 要素             | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| タイトル         | 認証方式を切り替えますか？                           |
| 説明文           | 「{現在の方式}」から「{新しい方式}」に切り替えます。 |
| キャンセルボタン | キャンセル                                           |
| 確認ボタン       | 切り替える                                           |

### デザイン仕様

| 要素             | 仕様                  |
| ---------------- | --------------------- |
| 幅               | 400px                 |
| 角丸             | 12px                  |
| 背景             | #FFFFFF               |
| オーバーレイ     | rgba(0, 0, 0, 0.5)    |
| 確認ボタン       | #007AFF（プライマリ） |
| キャンセルボタン | #F5F5F7（セカンダリ） |

---

## Zustand Store 連携

### authModeSlice

コンポーネントが使用するZustand Storeスライス。

```typescript
// apps/desktop/src/renderer/store/slices/authModeSlice.ts

interface AuthModeState {
  // 状態
  mode: AuthMode;
  status: AuthModeStatus | null;
  isLoading: boolean;
  error: string | null;

  // 確認ダイアログ
  isConfirmDialogOpen: boolean;
  pendingMode: AuthMode | null;

  // アクション
  setMode: (mode: AuthMode) => Promise<void>;
  fetchMode: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  validateMode: () => Promise<boolean>;
  openConfirmDialog: (mode: AuthMode) => void;
  closeConfirmDialog: () => void;
  confirmModeChange: () => Promise<void>;
}
```

### 使用パターン

```tsx
import { useAuthModeStore } from "@/store";

function useAuthMode() {
  // 必要なフィールドのみ取得（再レンダー最適化）
  const mode = useAuthModeStore((state) => state.mode);
  const isLoading = useAuthModeStore((state) => state.isLoading);
  const setMode = useAuthModeStore((state) => state.setMode);

  return { mode, isLoading, setMode };
}
```

---

## テスト

### AuthModeSelector のテスト例

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModeSelector } from './index';

describe('AuthModeSelector', () => {
  it('現在の認証方式を表示する', () => {
    render(<AuthModeSelector currentMode="subscription" />);

    expect(screen.getByRole('radio', { name: /サブスクリプション/i }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('認証方式をクリックすると確認ダイアログが開く', () => {
    const onModeChange = vi.fn();
    render(
      <AuthModeSelector
        currentMode="subscription"
        onModeChange={onModeChange}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /APIキー/i }));

    expect(screen.getByText(/切り替えますか/)).toBeInTheDocument();
  });

  it('無効状態では操作できない', () => {
    render(<AuthModeSelector currentMode="subscription" disabled />);

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
  });
});
```

---

## ディレクトリ構造

```
apps/desktop/src/renderer/components/settings/AuthModeSelector/
├── index.tsx                    # メインコンポーネント
├── AuthModeSelector.module.css  # スタイル
├── AuthStatusIndicator.tsx      # 認証状態表示
├── ConfirmDialog.tsx            # 確認ダイアログ
├── types.ts                     # 型定義
└── __tests__/
    ├── AuthModeSelector.test.tsx
    ├── AuthStatusIndicator.test.tsx
    └── ConfirmDialog.test.tsx
```
