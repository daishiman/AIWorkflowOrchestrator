# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 8                                                    |
| Phase名    | リファクタリング（TDD: Refactor）                    |
| 前提Phase  | Phase 7                                              |
| 後続Phase  | Phase 9                                              |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

Phase 5で実装した機能のコード品質を改善する。TDDのRefactorフェーズとして、テストを維持しながらコードを整理・最適化する。

## 背景

Phase 7でテストカバレッジが確保されたため、安全にリファクタリングが可能。以下の観点でコード品質を改善する:

- 重複コードの排除
- 命名の一貫性
- パフォーマンス最適化
- 可読性の向上

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: useFocusTrap コード品質改善

**目的**: フォーカストラップフックのコード品質を改善する

**実行手順**:

1. 改善ポイントの特定:
   - useCallbackの適切な使用
   - 依存配列の最適化
   - 型定義の厳密化

2. リファクタリング実施:

```typescript
// Before: 潜在的な依存関係問題
const getFocusableElements = () => {
  if (!containerRef.current) return [];
  return Array.from(
    containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
};

// After: useCallbackで最適化
const getFocusableElements = useCallback(() => {
  if (!containerRef.current) return [];
  return Array.from(
    containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}, [containerRef]);
```

3. テスト実行で動作確認:

```bash
pnpm --filter @repo/desktop test:run -- useFocusTrap
```

**期待される成果物**:

- useFocusTrap.ts の改善

---

### タスク2: FileSelectorModal コンポーネント整理

**目的**: モーダルコンポーネントの構造を整理する

**実行手順**:

1. コンポーネント分割の検討:
   - ヘッダー部分の分離
   - フッター部分の分離
   - アクセシビリティ属性のまとめ

2. カスタムフックの抽出:

```typescript
// アクセシビリティ関連ロジックをフックに抽出
function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);

  const { activate, deactivate } = useFocusTrap(modalRef, isOpen, {
    initialFocusSelector: "[data-autofocus]",
    returnFocusOnDeactivate: true,
  });

  // Escapeキーハンドリング
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) activate();
    else deactivate();
  }, [isOpen, activate, deactivate]);

  return { modalRef };
}
```

3. テスト実行で動作確認

**期待される成果物**:

- FileSelectorModal.tsx の改善
- useModalAccessibility フック（オプション）

---

### タスク3: FileSelectorFileList キーボードナビゲーション整理

**目的**: キーボードナビゲーションロジックを整理する

**実行手順**:

1. キーボードハンドリングの整理:

```typescript
// Before: 長い switch 文
const handleKeyDown = (
  event: React.KeyboardEvent,
  file: FileItem,
  index: number,
) => {
  switch (event.key) {
    case "ArrowDown":
    // ...
    case "ArrowUp":
    // ...
    // 多くのケース
  }
};

// After: マッピングベースのハンドリング
const keyHandlers: Record<string, (index: number) => void> = {
  ArrowDown: (i) => setFocusedIndex(Math.min(i + 1, files.length - 1)),
  ArrowUp: (i) => setFocusedIndex(Math.max(i - 1, 0)),
  Home: () => setFocusedIndex(0),
  End: () => setFocusedIndex(files.length - 1),
};

const handleKeyDown = useCallback(
  (event: React.KeyboardEvent, file: FileItem, index: number) => {
    const handler = keyHandlers[event.key];
    if (handler) {
      event.preventDefault();
      handler(index);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectFile(file);
    }
  },
  [files.length, onSelectFile],
);
```

2. テスト実行で動作確認

**期待される成果物**:

- FileSelectorFileList.tsx の改善

---

### タスク4: aria-live通知の最適化

**目的**: aria-live通知のパフォーマンスと使いやすさを改善する

**実行手順**:

1. 通知ロジックのフック化:

```typescript
// カスタムフックとして抽出
function useAnnouncer() {
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string) => {
    // 既存のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setAnnouncement(message);

    // 1秒後にクリア
    timeoutRef.current = setTimeout(() => {
      setAnnouncement("");
    }, 1000);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announcement, announce };
}
```

2. コンポーネントでの使用:

```typescript
function FileSelectorFileList({ ... }) {
  const { announcement, announce } = useAnnouncer();

  const handleSelect = (file: FileItem) => {
    const message = isSelected(file)
      ? `${file.name}の選択を解除しました`
      : `${file.name}を選択しました`;
    announce(message);
    onSelectFile(file);
  };

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {/* ... */}
    </>
  );
}
```

3. テスト実行で動作確認

**期待される成果物**:

- useAnnouncer フック
- FileSelectorFileList.tsx の改善

---

### タスク5: 型定義の厳密化

**目的**: TypeScript型定義を厳密化し、型安全性を向上する

**実行手順**:

1. 共通型定義の作成:

```typescript
// types/accessibility.ts
export interface AriaDialogProps {
  role: "dialog";
  "aria-modal": boolean;
  "aria-labelledby": string;
  "aria-describedby"?: string;
}

export interface AriaListboxProps {
  role: "listbox";
  "aria-label": string;
  "aria-multiselectable"?: boolean;
}

export interface AriaOptionProps {
  role: "option";
  "aria-selected": boolean;
  tabIndex: number;
}
```

2. コンポーネントでの使用確認

3. テスト実行で動作確認

**期待される成果物**:

- 型定義ファイル
- コンポーネントの型アノテーション改善

---

### タスク6: リファクタリング後のテスト確認

**目的**: リファクタリング後も全てのテストが成功することを確認する

**実行手順**:

1. 全テストを実行:

```bash
pnpm --filter @repo/desktop test:run
```

2. 全てのテストが成功することを確認

3. カバレッジが維持されていることを確認:

```bash
pnpm --filter @repo/desktop test:coverage -- --grep "FileSelector\|useFocusTrap"
```

**期待される成果物**:

- リファクタリング確認レポート（outputs/phase-8/refactoring-verification.md）

---

## 参照資料

| 参照資料                   | パス                                                    | 内容                   |
| -------------------------- | ------------------------------------------------------- | ---------------------- |
| Phase 5実装                | 実装ファイル                                            | リファクタリング対象   |
| Phase 7カバレッジ          | `outputs/phase-7/`                                      | カバレッジベースライン |
| React Hooks Best Practices | https://react.dev/learn/reusing-logic-with-custom-hooks | フック設計ガイド       |

---

## 成果物

| 成果物                       | パス                                               | 内容                 |
| ---------------------------- | -------------------------------------------------- | -------------------- |
| useFocusTrap改善             | `apps/desktop/src/renderer/hooks/useFocusTrap.ts`  | パフォーマンス最適化 |
| useAnnouncer                 | `apps/desktop/src/renderer/hooks/useAnnouncer.ts`  | aria-live通知フック  |
| FileSelectorModal改善        | コンポーネントファイル                             | 構造整理             |
| FileSelectorFileList改善     | コンポーネントファイル                             | キーボードナビ整理   |
| 型定義                       | `apps/desktop/src/renderer/types/accessibility.ts` | アクセシビリティ型   |
| リファクタリング確認レポート | `outputs/phase-8/refactoring-verification.md`      | テスト確認結果       |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 8での統合テスト連携アクション

- [ ] リファクタリング後の統合テスト継続成功を確認
- [ ] フォーカス遷移シナリオの動作確認
- [ ] aria属性同期シナリオの動作確認

---

## 完了条件

- [ ] useFocusTrapのコード品質が改善されている
- [ ] FileSelectorModalの構造が整理されている
- [ ] キーボードナビゲーションロジックが整理されている
- [ ] aria-live通知がフック化されている
- [ ] 型定義が厳密化されている
- [ ] 全てのテストが成功している
- [ ] カバレッジが維持されている
- [ ] リファクタリング確認レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-9-quality-assurance.md`
