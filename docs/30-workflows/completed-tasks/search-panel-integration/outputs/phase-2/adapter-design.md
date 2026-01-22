# Phase 2: EditorInstance アダプター設計書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| 作成日     | 2026-01-22       |
| フェーズ   | Phase 2          |
| 成果物種別 | アダプター設計書 |
| ステータス | 完了             |
| 関連Issue  | #361             |

---

## 1. 設計パターン

### 1.1 アダプターパターンの適用

SearchPanel は `EditorInstance` インターフェースを通じてエディタと対話する。
TextArea を使用する EditorView では、`TextAreaEditorAdapter` がこのインターフェースを実装し、
SearchPanel と TextArea の間を橋渡しする。

```
┌──────────────────┐         ┌──────────────────────┐
│   SearchPanel    │ ──uses──▶│   EditorInstance    │
│ (Phase 5実装)    │         │     (Interface)      │
└──────────────────┘         └──────────────────────┘
                                       ▲
                                       │ implements
                             ┌─────────┴───────────┐
                             │ TextAreaEditorAdapter│
                             │ (useEditorInstance)  │
                             └─────────────────────┘
                                       │
                                       │ wraps
                                       ▼
                             ┌─────────────────────┐
                             │   HTMLTextAreaElement│
                             └─────────────────────┘
```

### 1.2 設計原則

| 原則                 | 適用                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| 依存性逆転原則 (DIP) | SearchPanel は EditorInstance インターフェースに依存、具体実装に依存しない |
| 単一責任原則 (SRP)   | アダプターは TextArea → EditorInstance 変換のみ担当                        |
| 開放閉鎖原則 (OCP)   | 新しいエディタ実装を追加する場合、既存コードを変更せず新アダプター作成     |

---

## 2. EditorInstance インターフェース定義

### 2.1 インターフェース

```typescript
interface EditorInstance {
  // コンテンツ取得
  getContent(): string;

  // ハイライト管理
  setHighlights(
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ): void;
  getHighlights(): Array<{
    line: number;
    column: number;
    length: number;
    isCurrent?: boolean;
  }>;

  // スクロール・ナビゲーション
  scrollToLine(line: number, column?: number): void;

  // カーソル操作
  getCursorPosition(): { line: number; column: number };
  setCursorPosition(line: number, column: number): void;

  // テキスト置換
  replaceText(
    line: number,
    column: number,
    length: number,
    replacement: string,
  ): void;
  replaceAllText(
    matches: Array<{ line: number; column: number; length: number }>,
    replacement: string,
  ): void;

  // フォーカス制御
  focus(): void;
}
```

### 2.2 座標系仕様

| 項目                    | 仕様      | 備考           |
| ----------------------- | --------- | -------------- |
| 行番号 (line)           | 1-indexed | 最初の行 = 1   |
| 列番号 (column)         | 1-indexed | 最初の文字 = 1 |
| 文字位置 (charPosition) | 0-indexed | 内部計算用     |

### 2.3 メソッド仕様

| メソッド              | 入力                                        | 出力             | 説明                         |
| --------------------- | ------------------------------------------- | ---------------- | ---------------------------- |
| `getContent()`        | なし                                        | `string`         | 現在のエディタコンテンツ全体 |
| `setHighlights()`     | `Array<{line, column, length, isCurrent?}>` | `void`           | マッチ位置のハイライト設定   |
| `getHighlights()`     | なし                                        | `Array<{...}>`   | 現在のハイライト配列         |
| `scrollToLine()`      | `line: number, column?: number`             | `void`           | 指定行にスクロール           |
| `getCursorPosition()` | なし                                        | `{line, column}` | カーソル位置取得             |
| `setCursorPosition()` | `line, column`                              | `void`           | カーソル位置設定             |
| `replaceText()`       | `line, column, length, replacement`         | `void`           | 単一箇所の置換               |
| `replaceAllText()`    | `matches[], replacement`                    | `void`           | 複数箇所の一括置換           |
| `focus()`             | なし                                        | `void`           | エディタへフォーカス移動     |

---

## 3. TextAreaEditorAdapter 実装設計

### 3.1 クラス構造

```typescript
interface TextAreaEditorAdapterOptions {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  getContent: () => string;
  setContent: (content: string) => void;
  onHighlightsChange?: (highlights: Array<{...}>) => void;
}

class TextAreaEditorAdapter implements EditorInstance {
  private textAreaRef: React.RefObject<HTMLTextAreaElement>;
  private getContentCallback: () => string;
  private setContentCallback: (content: string) => void;
  private onHighlightsChange?: (highlights: Array<{...}>) => void;
  private currentHighlights: Array<{...}> = [];

  constructor(options: TextAreaEditorAdapterOptions) {
    this.textAreaRef = options.textAreaRef;
    this.getContentCallback = options.getContent;
    this.setContentCallback = options.setContent;
    this.onHighlightsChange = options.onHighlightsChange;
  }

  // メソッド実装...
}
```

### 3.2 メソッド実装

#### getContent()

```typescript
getContent(): string {
  return this.getContentCallback();
}
```

#### setHighlights()

```typescript
setHighlights(highlights: Array<{...}>): void {
  this.currentHighlights = highlights;

  // 現在のマッチを選択範囲で表示
  const currentMatch = highlights.find(h => h.isCurrent);
  if (currentMatch && this.textAreaRef.current) {
    const charPosition = this.lineColumnToCharPosition(
      currentMatch.line,
      currentMatch.column
    );
    this.textAreaRef.current.setSelectionRange(
      charPosition,
      charPosition + currentMatch.length
    );
  }

  this.onHighlightsChange?.(highlights);
}
```

#### scrollToLine()

```typescript
scrollToLine(line: number, column?: number): void {
  const textArea = this.textAreaRef.current;
  if (!textArea) return;

  const lineHeight = this.estimateLineHeight();
  const targetScrollTop = (line - 1) * lineHeight - lineHeight * 3;

  textArea.scrollTop = Math.max(0, targetScrollTop);

  if (column !== undefined) {
    const charPosition = this.lineColumnToCharPosition(line, column);
    textArea.setSelectionRange(charPosition, charPosition);
  }
}
```

#### replaceText()

```typescript
replaceText(
  line: number,
  column: number,
  length: number,
  replacement: string
): void {
  const content = this.getContentCallback();
  const charPosition = this.lineColumnToCharPosition(line, column);

  const newContent =
    content.substring(0, charPosition) +
    replacement +
    content.substring(charPosition + length);

  this.setContentCallback(newContent);
}
```

#### replaceAllText()

```typescript
replaceAllText(
  matches: Array<{ line: number; column: number; length: number }>,
  replacement: string
): void {
  // 後方から置換（位置ずれ防止）
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  let content = this.getContentCallback();

  for (const match of sortedMatches) {
    const charPosition = this.lineColumnToCharPosition(match.line, match.column);
    content =
      content.substring(0, charPosition) +
      replacement +
      content.substring(charPosition + match.length);
  }

  this.setContentCallback(content);
}
```

### 3.3 ヘルパーメソッド

```typescript
private lineColumnToCharPosition(line: number, column: number): number {
  const content = this.getContentCallback();
  const lines = content.split('\n');

  let position = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    position += lines[i].length + 1; // +1 for newline
  }
  position += column - 1;

  return position;
}

private charPositionToLineColumn(position: number): { line: number; column: number } {
  const content = this.getContentCallback();
  const lines = content.split('\n');

  let currentPos = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = currentPos + lines[i].length;
    if (position <= lineEnd) {
      return { line: i + 1, column: position - currentPos + 1 };
    }
    currentPos = lineEnd + 1; // +1 for newline
  }

  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

private estimateLineHeight(): number {
  const textArea = this.textAreaRef.current;
  if (!textArea) return 20;

  const computedStyle = window.getComputedStyle(textArea);
  const fontSize = parseFloat(computedStyle.fontSize) || 14;
  const lineHeight = parseFloat(computedStyle.lineHeight);

  if (isNaN(lineHeight)) {
    return fontSize * 1.5;
  }
  return lineHeight;
}
```

---

## 4. 工場関数

```typescript
function createTextAreaEditorAdapter(
  options: TextAreaEditorAdapterOptions,
): EditorInstance {
  return new TextAreaEditorAdapter(options);
}

// エクスポート
export {
  EditorInstance,
  TextAreaEditorAdapter,
  TextAreaEditorAdapterOptions,
  createTextAreaEditorAdapter,
};
```

---

## 5. 制約と制限事項

### 5.1 TextArea の制限

| 制限                       | 対処法                         |
| -------------------------- | ------------------------------ |
| ハイライトレンダリング不可 | 選択範囲で現在マッチを表示     |
| 複数ハイライト同時表示不可 | 状態として保持、UI側で対応     |
| 行番号表示なし             | EditorView側で実装             |
| シンタックスハイライトなし | 将来的にCodeMirror等へ移行検討 |

### 5.2 パフォーマンス考慮

| 項目                 | 対策                       |
| -------------------- | -------------------------- |
| 大量置換             | 後方から処理で位置ずれ回避 |
| 頻繁なハイライト更新 | 必要最小限の DOM 操作      |
| スクロール計算       | 行高さをキャッシュ         |

---

## 6. 実装状況

### 既存実装

| ファイル                                                             | ステータス                |
| -------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts` | 実装済み                  |
| `apps/desktop/src/features/search/types.ts`                          | EditorInstance 型定義済み |

### 追加・修正が必要な項目

| 項目                         | 対応状況                                |
| ---------------------------- | --------------------------------------- |
| setContent メソッド追加      | 既存実装に含まれるか確認要              |
| clearHighlights メソッド追加 | オプショナル、setHighlights([])で代用可 |

---

## 完了条件チェック

- [x] EditorInstance インターフェースが定義されている
- [x] TextAreaEditorAdapter の設計が完了している
- [x] 座標変換ロジックが設計されている
- [x] 制約と制限事項が文書化されている
