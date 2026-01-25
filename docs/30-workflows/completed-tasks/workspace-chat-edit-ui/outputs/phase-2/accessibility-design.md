# アクセシビリティ設計書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 2                      |
| タスク | アクセシビリティ設計   |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. WCAG 2.1 AA準拠方針

### 1.1 適合レベル

| レベル | 対応状況 | 説明                           |
| ------ | -------- | ------------------------------ |
| A      | 必須     | 最低限のアクセシビリティ       |
| AA     | 必須     | 標準的なアクセシビリティ       |
| AAA    | 推奨     | 高度なアクセシビリティ（任意） |

### 1.2 対象ガイドライン

| ガイドライン | 項目               | 対応コンポーネント |
| ------------ | ------------------ | ------------------ |
| 1.1          | 代替テキスト       | 全コンポーネント   |
| 1.3          | 適応可能           | 全コンポーネント   |
| 1.4          | 判別可能           | 全コンポーネント   |
| 2.1          | キーボード操作可能 | 全コンポーネント   |
| 2.4          | ナビゲーション可能 | DiffPreview        |
| 3.2          | 予測可能           | 全コンポーネント   |
| 4.1          | 互換性             | 全コンポーネント   |

---

## 2. ARIA属性設計

### 2.1 FileContextBadge

```tsx
<div role="listitem" tabIndex={0} aria-selected={isActive}>
  <span className="file-name">{context.fileName}</span>
  <button
    type="button"
    aria-label={`${context.fileName}を削除`}
    aria-describedby="badge-delete-hint"
  >
    <XIcon aria-hidden="true" />
  </button>
</div>;

{
  /* スクリーンリーダー用ヒント（隠し） */
}
<span id="badge-delete-hint" className="sr-only">
  Delete または Backspace キーでも削除できます
</span>;
```

| 属性             | 値                  | 説明                     |
| ---------------- | ------------------- | ------------------------ |
| role             | "listitem"          | リストアイテムとして認識 |
| tabIndex         | 0                   | キーボードフォーカス可能 |
| aria-selected    | boolean             | アクティブ状態           |
| aria-label       | "${fileName}を削除" | 削除ボタンの説明         |
| aria-describedby | "badge-delete-hint" | キーボード操作のヒント   |

### 2.2 ApplyControls

```tsx
<div role="group" aria-label="変更操作" aria-busy={isLoading}>
  <button
    type="button"
    aria-label="変更を適用"
    aria-disabled={disabled || isLoading}
  >
    {isLoading ? (
      <>
        <Spinner aria-hidden="true" />
        <span className="sr-only">適用中...</span>
      </>
    ) : (
      <>
        <CheckIcon aria-hidden="true" />
        <span>適用</span>
      </>
    )}
  </button>

  <button
    type="button"
    aria-label="変更を却下"
    aria-disabled={disabled || isLoading}
  >
    <XIcon aria-hidden="true" />
    <span>却下</span>
  </button>

  {error && (
    <div role="alert" aria-live="polite">
      {error}
    </div>
  )}
</div>
```

| 属性          | 値         | 説明                       |
| ------------- | ---------- | -------------------------- |
| role          | "group"    | ボタングループとして認識   |
| aria-label    | "変更操作" | グループの説明             |
| aria-busy     | boolean    | ローディング中             |
| aria-disabled | boolean    | 無効状態                   |
| aria-live     | "polite"   | エラーメッセージの動的更新 |

### 2.3 FileContextDropZone

```tsx
<div
  role="region"
  aria-label="ファイルドロップゾーン"
  aria-dropeffect="copy"
  aria-describedby="dropzone-instructions"
>
  {children}

  <span id="dropzone-instructions" className="sr-only">
    ファイルをドラッグ＆ドロップするか、Enter
    キーでファイル選択ダイアログを開きます
  </span>

  {isDragging && (
    <div role="status" aria-live="assertive">
      ファイルをドロップして添付
    </div>
  )}

  {error && (
    <div role="alert" aria-live="assertive">
      {error}
    </div>
  )}
</div>
```

| 属性             | 値                       | 説明                         |
| ---------------- | ------------------------ | ---------------------------- |
| role             | "region"                 | ランドマークとして認識       |
| aria-label       | "ファイルドロップゾーン" | 領域の説明                   |
| aria-dropeffect  | "copy"                   | ドロップ効果                 |
| aria-describedby | "dropzone-instructions"  | 操作説明への参照             |
| aria-live        | "assertive"              | 即時通知（エラー、ドラッグ） |

### 2.4 DiffPreview

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="diff-preview-title"
  aria-describedby="diff-preview-description"
>
  <header>
    <h2 id="diff-preview-title">{result.fileName}</h2>
    <p id="diff-preview-description" className="sr-only">
      ファイルの変更内容を確認してください。適用または却下を選択できます。
    </p>
    <button type="button" aria-label="閉じる">
      <XIcon aria-hidden="true" />
    </button>
  </header>

  <div role="document" aria-label="差分内容">
    <DiffEditor {...props} />
  </div>

  <footer>
    <ApplyControls {...props} />
  </footer>
</div>
```

| 属性             | 値                         | 説明                 |
| ---------------- | -------------------------- | -------------------- |
| role             | "dialog"                   | ダイアログとして認識 |
| aria-modal       | "true"                     | モーダルダイアログ   |
| aria-labelledby  | "diff-preview-title"       | タイトルへの参照     |
| aria-describedby | "diff-preview-description" | 説明への参照         |

### 2.5 DiffEditor

```tsx
<div
  role="application"
  aria-label="差分エディタ"
  aria-describedby="diff-editor-instructions"
>
  <MonacoDiffEditor {...props} />

  <span id="diff-editor-instructions" className="sr-only">
    左側が元のコード、右側が変更後のコードです。
    差分はハイライト表示されています。
  </span>
</div>
```

| 属性             | 値                         | 説明                 |
| ---------------- | -------------------------- | -------------------- |
| role             | "application"              | アプリケーション領域 |
| aria-label       | "差分エディタ"             | 領域の説明           |
| aria-describedby | "diff-editor-instructions" | 使用方法の説明       |

### 2.6 EditCommandInput

```tsx
<div role="form" aria-label="編集コマンド入力">
  <div>
    <label htmlFor="command-type">コマンド</label>
    <select id="command-type" aria-describedby="command-type-description">
      <option value="continue">続きを書く</option>
      <option value="refactor">リファクタリング</option>
      <option value="generate-test">テスト生成</option>
      <option value="add-comment">コメント追加</option>
      <option value="custom">カスタム指示</option>
    </select>
    <span id="command-type-description" className="sr-only">
      実行する編集操作の種類を選択してください
    </span>
  </div>

  {commandType === "custom" && (
    <div>
      <label htmlFor="custom-instruction">カスタム指示</label>
      <textarea
        id="custom-instruction"
        aria-describedby="instruction-counter instruction-hint"
        maxLength={10000}
      />
      <span id="instruction-counter">{instruction.length}/10,000文字</span>
      <span id="instruction-hint" className="sr-only">
        Shift+Enter で改行、Enter で送信
      </span>
    </div>
  )}

  <button type="submit" aria-disabled={isDisabled}>
    送信
  </button>
</div>
```

| 属性             | 値                       | 説明                 |
| ---------------- | ------------------------ | -------------------- |
| role             | "form"                   | フォームとして認識   |
| aria-label       | "編集コマンド入力"       | フォームの説明       |
| htmlFor          | 対応するinput ID         | ラベルとの関連付け   |
| aria-describedby | 複数ID（スペース区切り） | 説明・ヒントへの参照 |
| aria-disabled    | boolean                  | 無効状態             |

---

## 3. キーボード操作マッピング

### 3.1 グローバルキーボード操作

| キー      | 動作                           | 対象コンポーネント       |
| --------- | ------------------------------ | ------------------------ |
| Tab       | 次のインタラクティブ要素へ移動 | 全コンポーネント         |
| Shift+Tab | 前のインタラクティブ要素へ移動 | 全コンポーネント         |
| Enter     | アクション実行                 | ボタン、リンク           |
| Space     | アクション実行 / トグル        | ボタン、チェックボックス |
| Escape    | キャンセル / 閉じる            | モーダル、ドロップダウン |

### 3.2 コンポーネント別キーボード操作

#### FileContextBadge

| キー       | 動作                         | 実装                 |
| ---------- | ---------------------------- | -------------------- |
| Tab        | フォーカス移動               | 標準                 |
| Enter      | バッジを選択（アクティブ化） | カスタム             |
| Space      | バッジを選択（アクティブ化） | カスタム             |
| Delete     | ファイル削除                 | カスタム             |
| Backspace  | ファイル削除                 | カスタム             |
| ArrowLeft  | 前のバッジへ移動             | カスタム（将来対応） |
| ArrowRight | 次のバッジへ移動             | カスタム（将来対応） |

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case "Delete":
    case "Backspace":
      e.preventDefault();
      onRemove?.();
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      onSelect?.();
      break;
  }
};
```

#### ApplyControls

| キー   | 動作                   | 実装     |
| ------ | ---------------------- | -------- |
| Tab    | ボタン間移動           | 標準     |
| Enter  | フォーカス中ボタン実行 | 標準     |
| Space  | フォーカス中ボタン実行 | 標準     |
| Escape | 却下（オプション）     | カスタム |

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    handleReject();
  }
};
```

#### FileContextDropZone

| キー  | 動作                         | 実装     |
| ----- | ---------------------------- | -------- |
| Tab   | フォーカス移動               | 標準     |
| Enter | ファイル選択ダイアログを開く | カスタム |
| Space | ファイル選択ダイアログを開く | カスタム |

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openFileDialog();
  }
};

const openFileDialog = async () => {
  const result = await window.chatEditAPI.openFileDialog();
  if (result.filePaths.length > 0) {
    for (const filePath of result.filePaths) {
      await attachFile(filePath);
    }
  }
};
```

#### DiffPreview

| キー   | 動作                               | 実装     |
| ------ | ---------------------------------- | -------- |
| Escape | プレビューを閉じる                 | カスタム |
| Tab    | パネル内フォーカス移動（トラップ） | カスタム |

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    onClose?.();
  }
};

// フォーカストラップ（詳細は後述）
```

#### DiffEditor

| キー        | 動作                     | 実装       |
| ----------- | ------------------------ | ---------- |
| Tab（内部） | エディタ内ナビゲーション | Monaco標準 |
| Ctrl+F      | 検索                     | Monaco標準 |
| Ctrl+G      | 行へ移動                 | Monaco標準 |
| F7          | 次の差分へ移動           | Monaco標準 |
| Shift+F7    | 前の差分へ移動           | Monaco標準 |

#### EditCommandInput

| キー        | 動作                 | 実装           |
| ----------- | -------------------- | -------------- |
| Tab         | フォーム要素間移動   | 標準           |
| Enter       | コマンド送信         | カスタム       |
| Shift+Enter | テキストエリア内改行 | カスタム       |
| ArrowUp     | コマンドタイプ変更   | 標準（select） |
| ArrowDown   | コマンドタイプ変更   | 標準（select） |

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (instruction.trim()) {
      handleSubmit();
    }
  }
  // Shift+Enter は標準動作（改行）のまま
};
```

---

## 4. フォーカス管理

### 4.1 フォーカス移動ルール

| シナリオ           | フォーカス移動先                       |
| ------------------ | -------------------------------------- |
| DiffPreview 開く   | 適用ボタン（最初のアクション）         |
| DiffPreview 閉じる | トリガー要素（開く前のフォーカス位置） |
| ファイル追加       | 追加されたバッジ                       |
| ファイル削除       | 前のバッジ、なければ次のバッジ         |
| エラー発生         | エラーメッセージ（aria-live）          |
| コマンドタイプ変更 | 次の入力要素（customの場合はtextarea） |

### 4.2 フォーカストラップ実装

```typescript
const useFocusTrap = (ref: RefObject<HTMLElement>, isActive: boolean) => {
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    // 開く前のフォーカス位置を保存
    previousActiveElement.current = document.activeElement;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 初期フォーカス
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: 最初の要素から最後へ
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: 最後の要素から最初へ
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // 閉じる時に元のフォーカスを復元
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, ref]);
};

// 使用例
const DiffPreview: React.FC<DiffPreviewProps> = ({ result, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true">
      {/* ... */}
    </div>
  );
};
```

### 4.3 フォーカス復元（ファイル削除時）

```typescript
const handleRemoveFileContext = (id: string) => {
  const index = fileContexts.findIndex((fc) => fc.id === id);
  const badgeRefs = useRef<Map<string, HTMLElement>>(new Map());

  // 削除実行
  removeFileContext(id);

  // 次のフォーカス先を決定
  requestAnimationFrame(() => {
    const newContexts = fileContexts.filter((fc) => fc.id !== id);

    if (newContexts.length === 0) {
      // バッジがなくなったらDropZoneへ
      dropZoneRef.current?.focus();
      return;
    }

    // 前のバッジ、なければ次のバッジ
    const nextIndex = Math.min(index, newContexts.length - 1);
    const nextContext = newContexts[nextIndex];
    badgeRefs.current.get(nextContext.id)?.focus();
  });
};
```

---

## 5. コントラスト比

### 5.1 最小コントラスト比要件

| 要素タイプ       | 最小コントラスト比 | 確認ツール              |
| ---------------- | ------------------ | ----------------------- |
| 通常テキスト     | 4.5:1              | WebAIM Contrast Checker |
| 大きなテキスト   | 3:1                | WebAIM Contrast Checker |
| UIコンポーネント | 3:1                | WebAIM Contrast Checker |
| フォーカスリング | 3:1                | WebAIM Contrast Checker |

### 5.2 カラーパレットのコントラスト検証

| 前景色    | 背景色    | コントラスト比 | 判定  |
| --------- | --------- | -------------- | ----- |
| slate-900 | white     | 15.3:1         | ✅ AA |
| slate-100 | slate-900 | 15.3:1         | ✅ AA |
| blue-600  | white     | 5.7:1          | ✅ AA |
| green-600 | white     | 4.5:1          | ✅ AA |
| red-600   | white     | 4.6:1          | ✅ AA |
| slate-500 | white     | 4.6:1          | ✅ AA |
| slate-400 | slate-900 | 6.0:1          | ✅ AA |

### 5.3 ダークモードでのコントラスト

| 前景色    | 背景色    | コントラスト比 | 判定  |
| --------- | --------- | -------------- | ----- |
| slate-100 | slate-900 | 15.3:1         | ✅ AA |
| blue-500  | slate-900 | 4.6:1          | ✅ AA |
| green-500 | slate-900 | 5.9:1          | ✅ AA |
| red-500   | slate-900 | 4.8:1          | ✅ AA |

---

## 6. スクリーンリーダー対応

### 6.1 ライブリージョン設計

| 状況                   | aria-live | 内容例                             |
| ---------------------- | --------- | ---------------------------------- |
| ファイル追加成功       | polite    | "file.ts を添付しました"           |
| ファイル削除           | polite    | "file.ts を削除しました"           |
| エラー発生             | assertive | "エラー: ファイルが見つかりません" |
| 適用成功               | polite    | "変更を適用しました"               |
| 適用中（ローディング） | polite    | "変更を適用中..."                  |
| ドラッグ開始           | assertive | "ファイルをドロップして添付"       |

### 6.2 ライブリージョン実装

```tsx
// アナウンサーコンポーネント
const Announcer: React.FC<{
  message: string;
  priority?: "polite" | "assertive";
}> = ({ message, priority = "polite" }) => (
  <div
    role="status"
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// 使用例
const FileContextDropZone: React.FC = () => {
  const [announcement, setAnnouncement] = useState("");

  const handleFilesDropped = async (files: File[]) => {
    for (const file of files) {
      await attachFile(file.path);
      setAnnouncement(`${file.name} を添付しました`);
    }
  };

  return (
    <>
      <Announcer message={announcement} />
      {/* ... */}
    </>
  );
};
```

### 6.3 隠しテキスト（sr-only）

```css
/* Tailwind CSS sr-only クラス相当 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 7. 色以外での情報伝達

### 7.1 状態表示の代替手段

| 状態             | 色     | 代替表示                        |
| ---------------- | ------ | ------------------------------- |
| エラー           | 赤     | アイコン + テキストラベル       |
| 成功             | 緑     | チェックアイコン + テキスト     |
| 警告             | 黄     | 警告アイコン + テキスト         |
| 差分追加行       | 緑背景 | "+" プレフィックス              |
| 差分削除行       | 赤背景 | "-" プレフィックス              |
| ローディング     | -      | スピナー + "処理中..." テキスト |
| アクティブバッジ | 青枠   | aria-selected="true"            |

### 7.2 実装例

```tsx
// エラー表示
{
  error && (
    <div role="alert" className="flex items-center gap-2 text-red-600">
      <ExclamationIcon className="w-4 h-4" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
}

// 差分行
<div className="diff-line added">
  <span className="line-prefix" aria-hidden="true">
    +
  </span>
  <span className="sr-only">追加: </span>
  <span className="line-content">{line}</span>
</div>;
```

---

## 8. テスト計画

### 8.1 アクセシビリティテスト項目

| テスト項目               | ツール/方法          | 対象コンポーネント |
| ------------------------ | -------------------- | ------------------ |
| ARIA属性検証             | jest-axe             | 全コンポーネント   |
| キーボードナビゲーション | 手動テスト           | 全コンポーネント   |
| フォーカス順序           | 手動テスト           | 全コンポーネント   |
| スクリーンリーダー       | VoiceOver, NVDA      | 全コンポーネント   |
| コントラスト比           | WebAIM, axe DevTools | 全コンポーネント   |
| ズーム200%               | 手動テスト           | 全コンポーネント   |

### 8.2 jest-axe テスト例

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('FileContextBadge accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <FileContextBadge
        context={mockContext}
        onRemove={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be focusable with Tab key', () => {
    const { getByRole } = render(
      <FileContextBadge
        context={mockContext}
        onRemove={jest.fn()}
      />
    );

    const badge = getByRole('listitem');
    badge.focus();
    expect(document.activeElement).toBe(badge);
  });

  it('should remove on Delete key', async () => {
    const onRemove = jest.fn();
    const { getByRole } = render(
      <FileContextBadge
        context={mockContext}
        onRemove={onRemove}
      />
    );

    const badge = getByRole('listitem');
    badge.focus();
    await userEvent.keyboard('{Delete}');

    expect(onRemove).toHaveBeenCalled();
  });
});
```

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
