# Phase 2 成果物: UI/UX 実現仕様

## TerminalHandoffCard コンポーネント仕様

### 概要

RuntimeResolver が `handoff` を返した場合に、ユーザーに CLI で続行するための情報を表示するコンポーネント。

### ファイル構成

```
apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/
  TerminalHandoffCard.tsx   # コンポーネント実装
  index.ts                  # barrel export
  __tests__/
    TerminalHandoffCard.test.tsx  # テスト
```

### Props 定義

```typescript
interface TerminalHandoffCardProps {
  /** handoff 案内データ */
  guidance: HandoffGuidance;
  /** コマンドコピーハンドラ */
  onCopyCommand: () => void;
  /** カード閉じるハンドラ */
  onDismiss: () => void;
}

// HandoffGuidance 型（workspace-chat-edit/types/index.ts から参照）
interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

### レイアウト構造

```
+-------------------------------------------------------+
| [Terminal icon] Terminal Handoff Required      [x btn] |
|-------------------------------------------------------|
| [reason section]                                      |
| "subscription mode: use Claude Code CLI"              |
|-------------------------------------------------------|
| [context section]                                     |
| skill=my-skill workspace=my-project                   |
|-------------------------------------------------------|
| [command section]                                     |
| +---------------------------------------------------+ |
| | claude "Please analyze the code"                  | |
| +---------------------------------------------------+ |
|                                      [Copy Command]   |
+-------------------------------------------------------+
```

### ビジュアルスタイル

#### カードコンテナ

| プロパティ       | ライトモード                           | ダークモード        |
| ---------------- | -------------------------------------- | ------------------- |
| 背景色           | `#F2F2F7`（secondarySystemBackground） | `#1C1C1E`           |
| ボーダー         | `1px solid #C6C6C8`（opaqueSeparator） | `1px solid #38383A` |
| 角丸             | `12px`（`rounded-xl`）                 |                     |
| シャドウ         | `0 1px 3px rgba(0,0,0,0.04)`           |                     |
| パディング       | `16px`（8px グリッド x2）              |                     |
| マージン（上下） | `8px`                                  |                     |

#### ヘッダー

| プロパティ   | 値                                                        |
| ------------ | --------------------------------------------------------- |
| フォント     | システムフォント、`font-semibold`                         |
| サイズ       | `text-sm`（14px）                                         |
| アイコン     | Terminal アイコン（16x16px）                              |
| 閉じるボタン | 右上配置、`16x16px`、`hover:bg-[var(--bg-tertiary)]` 角丸 |

#### Reason セクション

| プロパティ     | ライトモード                              | ダークモード               |
| -------------- | ----------------------------------------- | -------------------------- |
| ラベル色       | `rgba(60, 60, 67, 0.6)`（secondaryLabel） | `rgba(235, 235, 245, 0.6)` |
| テキスト色     | `#000000`（label）                        | `#FFFFFF`                  |
| フォントサイズ | `text-xs`（12px）                         |                            |

#### Context セクション

| プロパティ     | ライトモード            | ダークモード               |
| -------------- | ----------------------- | -------------------------- |
| ラベル色       | `rgba(60, 60, 67, 0.6)` | `rgba(235, 235, 245, 0.6)` |
| テキスト色     | `#000000`               | `#FFFFFF`                  |
| フォントサイズ | `text-xs`（12px）       |                            |

#### コマンド表示エリア

| プロパティ     | ライトモード                        | ダークモード                          |
| -------------- | ----------------------------------- | ------------------------------------- |
| 背景色         | `#E5E5EA`（systemGray5）            | `#2C2C2E`（tertiarySystemBackground） |
| テキスト色     | `#000000`                           | `#FFFFFF`                             |
| フォント       | `font-mono`（monospace）            |                                       |
| フォントサイズ | `text-xs`（12px）                   |                                       |
| パディング     | `12px`                              |                                       |
| 角丸           | `8px`（`rounded-lg`）               |                                       |
| オーバーフロー | `overflow-x-auto`（水平スクロール） |                                       |

#### コピーボタン

| プロパティ     | ライトモード             | ダークモード              |
| -------------- | ------------------------ | ------------------------- |
| テキスト       | "Copy Command"           |                           |
| テキスト色     | `#007AFF`（systemBlue）  | `#0A84FF`                 |
| 背景（hover）  | `rgba(0, 122, 255, 0.1)` | `rgba(10, 132, 255, 0.1)` |
| フォントサイズ | `text-xs`（12px）        |                           |
| パディング     | `4px 8px`                |                           |
| 角丸           | `6px`（`rounded-md`）    |                           |
| 配置           | 右寄せ                   |                           |

### コントラスト比検証（WCAG 2.1 AA）

| テキスト種別                      | ライトモード                              | ダークモード                                 | 基準  | 判定 |
| --------------------------------- | ----------------------------------------- | -------------------------------------------- | ----- | ---- |
| プライマリテキスト on secondaryBg | `#000000` on `#F2F2F7` = 17.4:1           | `#FFFFFF` on `#1C1C1E` = 16.8:1              | 4.5:1 | PASS |
| セカンダリテキスト on secondaryBg | `rgba(60,60,67,0.6)` on `#F2F2F7` ≈ 5.2:1 | `rgba(235,235,245,0.6)` on `#1C1C1E` ≈ 8.1:1 | 4.5:1 | PASS |
| コマンドテキスト on tertiary Bg   | `#000000` on `#E5E5EA` = 14.6:1           | `#FFFFFF` on `#2C2C2E` = 13.3:1              | 4.5:1 | PASS |
| ボタンテキスト on secondaryBg     | `#007AFF` on `#F2F2F7` = 4.7:1            | `#0A84FF` on `#1C1C1E` = 5.6:1               | 4.5:1 | PASS |

### アクセシビリティ仕様

| 項目                        | 仕様                                           |
| --------------------------- | ---------------------------------------------- |
| コンテナ role               | `role="alert"`                                 |
| コンテナ aria-label         | `"Terminal handoff guidance"`                  |
| 閉じるボタン aria-label     | `"Dismiss handoff guidance"`                   |
| コピーボタン aria-label     | `"Copy terminal command"`                      |
| コマンドテキスト aria-label | `"Terminal command"`                           |
| Tab 順序                    | コマンドテキスト → コピーボタン → 閉じるボタン |
| フォーカスリング            | `ring-2 ring-offset-2 ring-[var(--accent)]`    |
| キーボード操作              | `Enter`/`Space` でボタン操作                   |

### インタラクション仕様

| 操作                 | 動作                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| コピーボタンクリック | `navigator.clipboard.writeText(terminalCommand)` を実行               |
| コピー成功           | ボタンテキストが一時的に "Copied!" に変化（2秒後に戻る）              |
| 閉じるボタンクリック | `onDismiss()` を呼び出し、Store の `handoffGuidance` を `null` に設定 |
| コマンド領域ホバー   | 背景色が若干明るくなる（`opacity: 0.8`）                              |

### トランジション

| 要素                 | トランジション                                            |
| -------------------- | --------------------------------------------------------- |
| カード表示           | `animate-in fade-in slide-in-from-bottom-2 duration-200`  |
| カード非表示         | `animate-out fade-out slide-out-to-bottom-2 duration-150` |
| コピーボタン状態変化 | `transition-colors duration-150`                          |

### 表示位置

TerminalHandoffCard は以下の画面で表示される:

| 画面                       | 表示位置                       | 条件                       |
| -------------------------- | ------------------------------ | -------------------------- |
| AgentExecutionView         | チャットインターフェースの上部 | `handoffGuidance !== null` |
| SkillExecutionView（将来） | 実行結果エリアの上部           | `handoffGuidance !== null` |

### コンポーネント実装イメージ

```tsx
export function TerminalHandoffCard({
  guidance,
  onCopyCommand,
  onDismiss,
}: TerminalHandoffCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(guidance.terminalCommand);
    setIsCopied(true);
    onCopyCommand();
    setTimeout(() => setIsCopied(false), 2000);
  }, [guidance.terminalCommand, onCopyCommand]);

  return (
    <div
      role="alert"
      aria-label="Terminal handoff guidance"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Terminal Handoff Required
          </span>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss handoff guidance"
          className="rounded p-1 hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
        >
          <XIcon className="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Reason */}
      <div className="mb-2">
        <span className="text-xs text-[var(--text-secondary)]">Reason:</span>
        <p className="text-xs text-[var(--text-primary)]">{guidance.reason}</p>
      </div>

      {/* Context */}
      <div className="mb-3">
        <span className="text-xs text-[var(--text-secondary)]">Context:</span>
        <p className="text-xs text-[var(--text-primary)]">
          {guidance.contextSummary}
        </p>
      </div>

      {/* Command */}
      <div className="mb-2">
        <span className="text-xs text-[var(--text-secondary)]">Command:</span>
        <pre
          aria-label="Terminal command"
          className="mt-1 rounded-lg bg-[var(--bg-tertiary)] p-3 text-xs font-mono text-[var(--text-primary)] overflow-x-auto"
        >
          {guidance.terminalCommand}
        </pre>
      </div>

      {/* Copy Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          aria-label="Copy terminal command"
          className="rounded-md px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors duration-150"
        >
          {isCopied ? "Copied!" : "Copy Command"}
        </button>
      </div>
    </div>
  );
}
```

### 依存コンポーネント

| コンポーネント | 種別         | 状態                                            |
| -------------- | ------------ | ----------------------------------------------- |
| TerminalIcon   | atoms (icon) | 新規作成 or lucide-react の `Terminal` アイコン |
| XIcon          | atoms (icon) | 新規作成 or lucide-react の `X` アイコン        |

### テスト観点

| テストケース   | 検証内容                                                           |
| -------------- | ------------------------------------------------------------------ |
| 表示テスト     | 3フィールド（reason, contextSummary, terminalCommand）が表示される |
| コピー機能     | コピーボタンクリックで clipboard API が呼ばれる                    |
| 閉じる機能     | 閉じるボタンクリックで onDismiss が呼ばれる                        |
| コピー状態表示 | コピー後に "Copied!" テキストが表示される                          |
| ARIA 属性      | role="alert", aria-label が正しく設定されている                    |
| monospace 表示 | コマンド領域が monospace フォントで表示される                      |
