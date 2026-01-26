# Phase 2: コンポーネント設計書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 2                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. コンポーネント構成

### 1.1 ファイル構成

```
apps/desktop/src/renderer/
├── components/
│   └── Permission/
│       ├── index.ts                    # エクスポート
│       ├── PermissionDialog.tsx        # メインコンポーネント
│       ├── PermissionDialogContent.tsx # 内部コンテンツ
│       └── __tests__/
│           └── PermissionDialog.test.tsx
├── hooks/
│   ├── usePermissionDialog.ts
│   └── __tests__/
│       └── usePermissionDialog.test.ts
```

### 1.2 コンポーネント依存関係

```
┌─────────────────────┐
│       App.tsx       │
│    (or Layout)      │
└──────────┬──────────┘
           │
           │ uses
           ▼
┌─────────────────────┐
│ usePermissionDialog │
└──────────┬──────────┘
           │
           │ returns
           ▼
┌─────────────────────┐
│  PermissionDialog   │
│                     │
│  ┌───────────────┐  │
│  │DialogContent │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## 2. PermissionDialog コンポーネント

### 2.1 Props定義

```typescript
// apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx

import type { SkillPermissionRequest } from "@repo/shared";

export interface PermissionDialogProps {
  /** 表示するリクエスト（nullの場合は非表示） */
  request: SkillPermissionRequest | null;

  /** ダイアログ表示状態 */
  isOpen: boolean;

  /** 許可ボタンクリック時のコールバック */
  onAllow: () => void;

  /** 拒否ボタンクリック時のコールバック */
  onDeny: () => void;

  /** ダイアログを閉じる時のコールバック（Escキー等） */
  onClose?: () => void;

  /** 応答処理中かどうか */
  isResponding?: boolean;
}
```

### 2.2 コンポーネント実装

```tsx
import React, { useEffect, useRef } from "react";
import type { SkillPermissionRequest } from "@repo/shared";

export interface PermissionDialogProps {
  request: SkillPermissionRequest | null;
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onClose?: () => void;
  isResponding?: boolean;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  isOpen,
  onAllow,
  onDeny,
  onClose,
  isResponding = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const allowButtonRef = useRef<HTMLButtonElement>(null);

  // キーボードイベント（Esc, Enter）
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.() ?? onDeny();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onDeny]);

  // フォーカス管理（開いた時に許可ボタンにフォーカス）
  useEffect(() => {
    if (isOpen && allowButtonRef.current) {
      allowButtonRef.current.focus();
    }
  }, [isOpen]);

  // フォーカストラップ
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleTabKey);
    return () => dialog.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  if (!isOpen || !request) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose ?? onDeny}
        aria-hidden="true"
      />

      {/* ダイアログ */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-dialog-title"
        aria-describedby="permission-dialog-description"
        className="relative z-10 bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
      >
        {/* タイトル */}
        <h2 id="permission-dialog-title" className="text-lg font-semibold mb-4">
          権限の確認
        </h2>

        {/* 説明 */}
        <p
          id="permission-dialog-description"
          className="text-sm text-muted-foreground mb-4"
        >
          以下のツールを実行してもよろしいですか？
        </p>

        {/* ツール情報 */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm font-medium bg-primary/10 px-2 py-1 rounded">
              {request.toolName}
            </span>
          </div>

          {/* 引数表示 */}
          {Object.keys(request.args).length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">引数:</p>
              <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto max-h-32">
                {JSON.stringify(request.args, null, 2)}
              </pre>
            </div>
          )}

          {/* 理由表示 */}
          {request.reason && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onDeny}
            disabled={isResponding}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            拒否
          </button>
          <button
            ref={allowButtonRef}
            type="button"
            onClick={onAllow}
            disabled={isResponding}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResponding ? "処理中..." : "許可"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 3. UIモックアップ

### 3.1 基本レイアウト

```
┌────────────────────────────────────────────────────────────────┐
│                         (Overlay)                               │
│    ┌──────────────────────────────────────────────────────┐    │
│    │                                                      │    │
│    │  権限の確認                                          │    │
│    │                                                      │    │
│    │  以下のツールを実行してもよろしいですか？             │    │
│    │                                                      │    │
│    │  ┌──────────────────────────────────────────────┐   │    │
│    │  │                                              │   │    │
│    │  │  [Bash]                                      │   │    │
│    │  │                                              │   │    │
│    │  │  引数:                                       │   │    │
│    │  │  {                                           │   │    │
│    │  │    "command": "ls -la /home/user"            │   │    │
│    │  │  }                                           │   │    │
│    │  │                                              │   │    │
│    │  │  ─────────────────────────────────────       │   │    │
│    │  │  ディレクトリの内容を確認します               │   │    │
│    │  │                                              │   │    │
│    │  └──────────────────────────────────────────────┘   │    │
│    │                                                      │    │
│    │                              [拒否]  [許可]          │    │
│    │                                                      │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 状態別表示

#### 通常状態

- 許可ボタン: プライマリカラー、クリック可能
- 拒否ボタン: セカンダリカラー、クリック可能
- フォーカス: 許可ボタンに初期フォーカス

#### 応答処理中

- 許可ボタン: 「処理中...」表示、disabled
- 拒否ボタン: disabled
- オーバーレイクリック: 無効

#### 理由なしの場合

- 理由セクション: 非表示
- 引数のみ表示

#### 引数なしの場合

- 引数セクション: 非表示
- ツール名のみ表示

---

## 4. アクセシビリティ設計

### 4.1 ARIA属性

| 要素         | 属性             | 値                              |
| ------------ | ---------------- | ------------------------------- |
| ダイアログ   | role             | "dialog"                        |
| ダイアログ   | aria-modal       | "true"                          |
| ダイアログ   | aria-labelledby  | "permission-dialog-title"       |
| ダイアログ   | aria-describedby | "permission-dialog-description" |
| タイトル     | id               | "permission-dialog-title"       |
| 説明         | id               | "permission-dialog-description" |
| オーバーレイ | aria-hidden      | "true"                          |

### 4.2 キーボード操作

| キー        | 動作                       |
| ----------- | -------------------------- |
| Esc         | ダイアログを閉じる（拒否） |
| Tab         | 次のフォーカス要素に移動   |
| Shift + Tab | 前のフォーカス要素に移動   |
| Enter       | フォーカス中のボタンを実行 |
| Space       | フォーカス中のボタンを実行 |

### 4.3 フォーカス管理

1. ダイアログ表示時: 許可ボタンに自動フォーカス
2. フォーカストラップ: ダイアログ内でフォーカスが循環
3. ダイアログ閉じる時: トリガー要素にフォーカス復帰（該当する場合）

---

## 5. スタイリング設計

### 5.1 カラーパレット

```css
/* Tailwind CSS変数を使用 */
--background: /* ダイアログ背景 */ --foreground: /* テキスト色 */
  --muted: /* ツール情報背景 */ --muted-foreground: /* 補助テキスト */
  --primary: /* 許可ボタン背景 */ --primary-foreground: /* 許可ボタンテキスト */
  --border: /* ボーダー色 */;
```

### 5.2 レスポンシブ対応

| ブレークポイント | ダイアログ幅 | マージン |
| ---------------- | ------------ | -------- |
| sm以下           | 100% - 32px  | 16px     |
| sm以上           | max-w-md     | auto     |

### 5.3 z-index設計

| 要素         | z-index |
| ------------ | ------- |
| オーバーレイ | 50      |
| ダイアログ   | 60      |

---

## 6. エクスポート設計

### 6.1 index.ts

```typescript
// apps/desktop/src/renderer/components/Permission/index.ts

export { PermissionDialog } from "./PermissionDialog";
export type { PermissionDialogProps } from "./PermissionDialog";
```

### 6.2 使用例

```tsx
// App.tsx または適切なレイアウトコンポーネント

import { PermissionDialog } from "@/components/Permission";
import { usePermissionDialog } from "@/hooks/usePermissionDialog";

export function App() {
  const { currentRequest, isOpen, isResponding, respond, close } =
    usePermissionDialog();

  return (
    <>
      {/* アプリケーションのメインコンテンツ */}
      <MainContent />

      {/* 権限確認ダイアログ */}
      <PermissionDialog
        request={currentRequest}
        isOpen={isOpen}
        isResponding={isResponding}
        onAllow={() => respond(true)}
        onDeny={() => respond(false)}
        onClose={close}
      />
    </>
  );
}
```

---

## 7. テスト設計

### 7.1 ユニットテストケース

| テストID | テスト内容                   | 期待結果                       |
| -------- | ---------------------------- | ------------------------------ |
| PD-01    | isOpen=falseでレンダリング   | 何も表示されない               |
| PD-02    | isOpen=trueでレンダリング    | ダイアログが表示される         |
| PD-03    | toolNameの表示               | ツール名が表示される           |
| PD-04    | argsの表示                   | JSON形式で引数が表示される     |
| PD-05    | reasonの表示                 | 理由が表示される               |
| PD-06    | reasonがnullの場合           | 理由セクションが非表示         |
| PD-07    | 許可ボタンクリック           | onAllowが呼ばれる              |
| PD-08    | 拒否ボタンクリック           | onDenyが呼ばれる               |
| PD-09    | Escキー押下                  | onCloseまたはonDenyが呼ばれる  |
| PD-10    | オーバーレイクリック         | onCloseまたはonDenyが呼ばれる  |
| PD-11    | isResponding=trueの場合      | ボタンがdisabledになる         |
| PD-12    | ダイアログ表示時のフォーカス | 許可ボタンにフォーカスが当たる |
| PD-13    | Tabキーでのフォーカス移動    | フォーカストラップが機能する   |

### 7.2 スナップショットテスト

- 基本表示状態
- 理由あり状態
- 引数あり状態
- 応答処理中状態
