# 設計仕様書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-2-A |
| Issue番号  | #520       |
| Phase      | 2          |
| 作成日     | 2026-01-27 |
| ステータス | 確定       |

---

## 1. 概要

SkillStreamDisplayコンポーネントにR1〜R3の改善を実装するための詳細設計を定義する。

---

## 2. 新規コンポーネント設計

### 2.1 LoadingSpinner（R1）

```typescript
/**
 * ローディングスピナーコンポーネント
 * @module components/AgentView/LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** サイズ（デフォルト: 16px） */
  size?: number;
  /** カスタムクラス名 */
  className?: string;
}

function LoadingSpinner({
  size = 16,
  className,
}: LoadingSpinnerProps): JSX.Element;
```

**実装詳細**:

| 項目     | 値                                                                              |
| -------- | ------------------------------------------------------------------------------- |
| ファイル | apps/desktop/src/renderer/components/AgentView/LoadingSpinner.tsx               |
| スタイル | animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full |
| ARIA     | role="status" aria-label="実行中"                                               |
| メモ化   | React.memo使用                                                                  |

### 2.2 MessageTimestamp（R2）

```typescript
/**
 * メッセージタイムスタンプコンポーネント
 * @module components/AgentView/MessageTimestamp
 */
interface MessageTimestampProps {
  /** Unixタイムスタンプ（ミリ秒） */
  timestamp: number;
  /** カスタムクラス名 */
  className?: string;
}

function MessageTimestamp({
  timestamp,
  className,
}: MessageTimestampProps): JSX.Element;
```

**実装詳細**:

| 項目     | 値                                                                  |
| -------- | ------------------------------------------------------------------- |
| ファイル | apps/desktop/src/renderer/components/AgentView/MessageTimestamp.tsx |
| スタイル | text-xs text-gray-400 flex-shrink-0                                 |
| 依存     | formatRelativeTime関数                                              |
| メモ化   | React.memo使用                                                      |

### 2.3 CopyButton（R3）

```typescript
/**
 * クリップボードコピーボタンコンポーネント
 * @module components/AgentView/CopyButton
 */
interface CopyButtonProps {
  /** コピーする内容 */
  content: string;
  /** コピー成功時コールバック */
  onCopy?: () => void;
  /** カスタムクラス名 */
  className?: string;
}

function CopyButton({
  content,
  onCopy,
  className,
}: CopyButtonProps): JSX.Element | null;
```

**実装詳細**:

| 項目       | 値                                                            |
| ---------- | ------------------------------------------------------------- |
| ファイル   | apps/desktop/src/renderer/components/AgentView/CopyButton.tsx |
| 表示条件   | navigator.clipboard対応時のみ                                 |
| ホバー表示 | opacity-0 group-hover:opacity-100 transition-opacity          |
| ARIA       | aria-label="メッセージをコピー"                               |
| フォーカス | focus:ring-2 focus:ring-blue-500 focus:outline-none           |
| 成功表示   | 2000msのトースト表示                                          |
| メモ化     | React.memo使用                                                |

---

## 3. ユーティリティ関数設計

### 3.1 formatRelativeTime

```typescript
/**
 * タイムスタンプを相対時刻文字列に変換
 * @param timestamp - Unixタイムスタンプ（ミリ秒）
 * @param now - 現在時刻（テスト用、オプション）
 * @returns 相対時刻文字列
 */
export function formatRelativeTime(timestamp: number, now?: number): string;
```

**実装詳細**:

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| ファイル   | apps/desktop/src/renderer/utils/formatTime.ts                |
| 単体テスト | apps/desktop/src/renderer/utils/**tests**/formatTime.test.ts |

**変換ロジック**:

```typescript
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 0) return "たった今";
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  if (seconds > 0) return `${seconds}秒前`;
  return "たった今";
}
```

---

## 4. 既存コンポーネント変更設計

### 4.1 SkillStreamDisplay変更

**変更箇所**:

| 箇所                | 変更内容                                  |
| ------------------- | ----------------------------------------- |
| stream-header       | LoadingSpinnerの追加（running時）         |
| MessageItem呼び出し | showTimestamp, showCopyButtonプロップ追加 |

**変更後の構造**:

```tsx
<div className="stream-header flex items-center gap-2 p-2 border-b">
  <span className="status-badge ...">{getStatusText(status)}</span>
  {status === "running" && <LoadingSpinner />} {/* 追加 */}
  {/* 既存のボタン */}
</div>
```

### 4.2 MessageItem変更

**変更箇所**:

| 箇所             | 変更内容                          |
| ---------------- | --------------------------------- |
| Props            | showTimestamp, showCopyButton追加 |
| レイアウト       | flexレイアウトに変更              |
| 子コンポーネント | MessageTimestamp, CopyButton追加  |

**変更後のProps**:

```typescript
interface MessageItemProps {
  message: SkillStreamMessage;
  showTimestamp?: boolean; // 追加
  showCopyButton?: boolean; // 追加
}
```

**変更後の構造**:

```tsx
<div className="message-item group flex items-start gap-2">
  <div className="flex-1 min-w-0">
    <span>{message.content}</span>
  </div>
  {showTimestamp && <MessageTimestamp timestamp={message.timestamp} />}
  {showCopyButton && <CopyButton content={message.content} />}
</div>
```

---

## 5. 状態管理設計

### 5.1 CopyButton内部状態

| State名 | 型      | 初期値 | 用途               |
| ------- | ------- | ------ | ------------------ |
| copied  | boolean | false  | コピー成功表示制御 |

**状態遷移**:

```
初期状態: copied = false
↓ (コピー成功)
copied = true
↓ (2000ms後)
copied = false
```

### 5.2 SkillStreamDisplay追加State

状態管理の追加は不要。各MessageItemが独立してCopyButton状態を管理。

---

## 6. スタイル設計

### 6.1 Tailwind CSSクラス

| コンポーネント      | クラス                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| LoadingSpinner      | animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full    |
| MessageTimestamp    | text-xs text-gray-400 flex-shrink-0 ml-auto                                        |
| CopyButton          | opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 |
| CopyButton (成功時) | text-green-500                                                                     |
| MessageItem         | group flex items-start gap-2                                                       |

### 6.2 アニメーション

| 対象           | アニメーション         | 時間      |
| -------------- | ---------------------- | --------- |
| LoadingSpinner | rotate 360deg          | 1s linear |
| CopyButton     | opacity 0 → 1          | 150ms     |
| CopyFeedback   | opacity 1 → 0 (消える) | 150ms     |

---

## 7. アクセシビリティ設計

### 7.1 ARIA属性

| コンポーネント | 属性                              |
| -------------- | --------------------------------- |
| LoadingSpinner | role="status" aria-label="実行中" |
| CopyButton     | aria-label="メッセージをコピー"   |
| CopyFeedback   | role="status" aria-live="polite"  |

### 7.2 キーボード操作

| 要素       | キー  | 動作           |
| ---------- | ----- | -------------- |
| CopyButton | Enter | コピー実行     |
| CopyButton | Space | コピー実行     |
| CopyButton | Tab   | フォーカス移動 |

### 7.3 フォーカス管理

| 要素       | フォーカススタイル               |
| ---------- | -------------------------------- |
| CopyButton | focus:ring-2 focus:ring-blue-500 |

---

## 8. エラーハンドリング設計

### 8.1 Clipboard API

| エラー種別 | 対応              |
| ---------- | ----------------- |
| API非対応  | CopyButton非表示  |
| コピー失敗 | console.error出力 |
| 権限拒否   | console.error出力 |

### 8.2 フォールバック

```typescript
// Clipboard API対応チェック
if (!navigator.clipboard) {
  return null; // ボタン非表示
}
```

---

## 9. テスト設計

### 9.1 ユニットテスト

| 対象               | テスト内容                                   |
| ------------------ | -------------------------------------------- |
| LoadingSpinner     | レンダリング、ARIA属性、アニメーションクラス |
| MessageTimestamp   | フォーマット表示、各時間単位                 |
| CopyButton         | クリック処理、成功表示、キーボード操作       |
| formatRelativeTime | 各時間単位の変換                             |

### 9.2 統合テスト

| 対象               | テスト内容                                                          |
| ------------------ | ------------------------------------------------------------------- |
| SkillStreamDisplay | running時スピナー表示、メッセージにタイムスタンプ・コピーボタン表示 |

---

## 10. ファイル構成

```
apps/desktop/src/renderer/
├── components/
│   └── AgentView/
│       ├── SkillStreamDisplay.tsx      # 変更
│       ├── LoadingSpinner.tsx          # 新規
│       ├── MessageTimestamp.tsx        # 新規
│       ├── CopyButton.tsx              # 新規
│       └── __tests__/
│           ├── SkillStreamDisplay.test.tsx  # 変更
│           ├── LoadingSpinner.test.tsx      # 新規
│           ├── MessageTimestamp.test.tsx    # 新規
│           └── CopyButton.test.tsx          # 新規
└── utils/
    ├── formatTime.ts                   # 新規
    └── __tests__/
        └── formatTime.test.ts          # 新規
```

---

## 11. 承認

| 役割          | 承認状況 |
| ------------- | -------- |
| 設計完了      | 完了     |
| Phase 3へ進行 | 可       |
