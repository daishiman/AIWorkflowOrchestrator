# 実装ガイド: SkillStreamDisplay UX改善

## メタ情報

| 項目      | 内容                                         |
| --------- | -------------------------------------------- |
| タスクID  | TASK-3-2-A                                   |
| Issue番号 | #520                                         |
| 作成日    | 2026-01-27                                   |
| 対象機能  | R1: スピナー, R2: タイムスタンプ, R3: コピー |

---

# Part 1: わかりやすい解説

## なぜこの改善が必要だったの？

### 日常生活での例え話

想像してみてください。レストランで料理を注文したとき、料理が来るまで何も情報がなかったらどうでしょう？

「ちゃんと注文入ったかな？」「忘れられてないかな？」と不安になりますよね。

でも、もし店員さんが「お料理を準備中です」と伝えてくれたり、注文時間が書かれた伝票があったりすれば、安心して待てます。

コンピュータのプログラムでも同じことが言えます。AIがタスクを実行しているとき、何も表示されないとユーザーは「動いているのかな？」と不安になります。今回の改善は、まさにこの「安心感」を提供するためのものです。

---

## R1: クルクル回るマーク（ローディングスピナー）

### これは何？

みなさんがスマホでアプリを使うとき、クルクル回るマークを見たことがありますよね？あれは「今、作業中ですよ」というサインです。

### なぜ必要？

AIがスキルを実行している間、画面が固まったように見えると「壊れた？」と思ってしまいます。クルクル回るマークがあれば、「ちゃんと動いているんだ」とわかります。

### どう動く？

1. スキルの実行が始まると、クルクルマークが表示される
2. 実行が終わると、クルクルマークが消える
3. 途中で止めたい場合も、ちゃんと消える

---

## R2: いつのメッセージ？（タイムスタンプ）

### これは何？

LINEやメールを見るとき、「いつ送られたメッセージかな？」と思うことがありますよね。タイムスタンプは、それぞれのメッセージがいつ表示されたかを教えてくれる機能です。

### なぜ必要？

たくさんのメッセージがあるとき、どれが新しくてどれが古いかわからなくなることがあります。「3秒前」「5分前」のような表示があれば、すぐにわかります。

### 表示の仕方

- 「5秒前」「30秒前」（1分未満のとき）
- 「3分前」「15分前」（1時間未満のとき）
- 「2時間前」「8時間前」（1日未満のとき）
- 「1日前」「3日前」（1日以上のとき）

---

## R3: メッセージをコピー（クリップボード機能）

### これは何？

気に入った文章をコピーして、別のところに貼り付けたいことがありますよね？この機能は、AIのメッセージを簡単にコピーできるようにします。

### なぜ必要？

AIが出力した結果をメモに保存したり、別のアプリで使いたいことがよくあります。マウスでドラッグして選択するより、ボタン一つでコピーできるほうが便利です。

### 使い方

1. メッセージの上にマウスを置くと、コピーボタンが現れる
2. ボタンをクリックすると、メッセージがコピーされる
3. 「コピーしました」という表示が出て、成功したことがわかる
4. 2秒後に「コピーしました」の表示は消える

---

# Part 2: 技術的詳細

## 1. 実装概要

| 機能                    | 実装ファイル           | 変更内容             |
| ----------------------- | ---------------------- | -------------------- |
| R1 ローディングスピナー | SkillStreamDisplay.tsx | LoadingSpinner追加   |
| R2 タイムスタンプ       | formatTime.ts (新規)   | 相対時刻関数         |
| R2 タイムスタンプ       | SkillStreamDisplay.tsx | MessageTimestamp追加 |
| R3 クリップボードコピー | SkillStreamDisplay.tsx | CopyButton追加       |

---

## 2. API仕様

### 2.1 formatRelativeTime

**ファイル**: `apps/desktop/src/renderer/utils/formatTime.ts`

```typescript
/**
 * タイムスタンプを相対時刻文字列に変換
 * @param timestamp - UNIXタイムスタンプ（ミリ秒）
 * @param now - 現在時刻（テスト用、デフォルトはDate.now()）
 * @returns 相対時刻文字列（例: "3分前"）
 */
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string;
```

| パラメータ | 型     | 必須 | 説明                               |
| ---------- | ------ | ---- | ---------------------------------- |
| timestamp  | number | Yes  | UNIXタイムスタンプ（ミリ秒）       |
| now        | number | No   | 現在時刻（デフォルト: Date.now()） |
| **戻り値** | string | -    | 相対時刻文字列                     |

**出力形式**:

| 条件         | 出力例     |
| ------------ | ---------- |
| diff < 0     | "たった今" |
| seconds < 60 | "X秒前"    |
| minutes < 60 | "X分前"    |
| hours < 24   | "X時間前"  |
| days >= 1    | "X日前"    |

---

### 2.2 LoadingSpinner

**ファイル**: `SkillStreamDisplay.tsx`

```typescript
const LoadingSpinner = React.memo(function LoadingSpinner(): JSX.Element;
```

| プロパティ  | 説明                                           |
| ----------- | ---------------------------------------------- |
| data-testid | `loading-spinner-container`, `loading-spinner` |
| role        | `status`                                       |
| aria-label  | `実行中`                                       |

**表示条件**: `status === "running"`

---

### 2.3 MessageTimestamp

**ファイル**: `SkillStreamDisplay.tsx`

```typescript
interface MessageTimestampProps {
  timestamp: number;
  messageId: string;
}

const MessageTimestamp = React.memo(
  function MessageTimestamp(props: MessageTimestampProps): JSX.Element
);
```

| プロパティ | 型     | 説明                          |
| ---------- | ------ | ----------------------------- |
| timestamp  | number | メッセージのタイムスタンプ    |
| messageId  | string | メッセージID（data-testid用） |

---

### 2.4 CopyButton

**ファイル**: `SkillStreamDisplay.tsx`

```typescript
interface CopyButtonProps {
  content: string;
  messageId: string;
}

const CopyButton = React.memo(
  function CopyButton(props: CopyButtonProps): JSX.Element | null
);
```

| プロパティ | 型     | 説明                          |
| ---------- | ------ | ----------------------------- |
| content    | string | コピーするテキスト            |
| messageId  | string | メッセージID（data-testid用） |

**動作**:

- Clipboard API非対応時は`null`を返す
- コピー成功時に`copied`状態を2秒間`true`に設定
- エラー時はconsole.errorでログ出力

---

## 3. コンポーネント階層

```
SkillStreamDisplay
├── stream-header
│   ├── status-badge
│   └── LoadingSpinner (status === "running" のとき)
├── stream-messages
│   └── MessageItem (各メッセージ)
│       ├── message-content
│       ├── MessageTimestamp
│       └── CopyButton
└── stream-actions (abort-buttonなど)
```

---

## 4. スタイリング

### 4.1 LoadingSpinner

```css
/* Tailwind CSS */
.animate-spin      /* 回転アニメーション */
.h-4 .w-4          /* サイズ: 16px */
.border-2          /* ボーダー幅: 2px */
.border-blue-500   /* ボーダー色: 青 */
.rounded-full      /* 完全な円形 */
.border-t-transparent  /* 上部を透明に */
```

### 4.2 MessageTimestamp

```css
.text-xs           /* フォントサイズ: 12px */
.text-gray-400     /* 文字色: グレー */
.flex-shrink-0     /* 縮小しない */
```

### 4.3 CopyButton

```css
.opacity-0              /* 通常時は非表示 */
.group-hover:opacity-100  /* ホバー時に表示 */
.transition-opacity     /* 透明度のトランジション */
.p-1                    /* パディング: 4px */
.hover:bg-gray-100      /* ホバー時の背景色 */
.rounded                /* 角丸 */
.focus:ring-2           /* フォーカス時のリング */
.focus:ring-blue-500    /* リング色: 青 */
```

---

## 5. アクセシビリティ

| 要素           | ARIA属性                          | WCAG基準                |
| -------------- | --------------------------------- | ----------------------- |
| LoadingSpinner | role="status" aria-label="実行中" | 4.1.2 Name, Role, Value |
| CopyButton     | aria-label="メッセージをコピー"   | 4.1.2 Name, Role, Value |
| CopyFeedback   | role="status" aria-live="polite"  | 4.1.3 Status Messages   |

### キーボードナビゲーション

| 要素       | キー          | 動作           |
| ---------- | ------------- | -------------- |
| CopyButton | Tab           | フォーカス移動 |
| CopyButton | Enter / Space | コピー実行     |

---

## 6. エラーハンドリング

### Clipboard API

```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

// API非対応時のフォールバック
if (typeof navigator === "undefined" || !navigator.clipboard) {
  return null;
}
```

---

## 7. パフォーマンス最適化

| 手法          | 適用箇所                    | 効果                     |
| ------------- | --------------------------- | ------------------------ |
| React.memo    | 全サブコンポーネント        | 不要な再レンダリング防止 |
| CSS animation | LoadingSpinner              | JSではなくCSSで処理      |
| useState      | CopyButton (copied状態のみ) | 最小限の状態管理         |

---

## 8. テスト

### テストファイル

| ファイル                             | テストケース数 |
| ------------------------------------ | -------------- |
| formatTime.test.ts                   | 11             |
| SkillStreamDisplay.test.tsx (新機能) | 50             |

### テスト実行コマンド

```bash
# 単体テスト
pnpm --filter @repo/desktop test -- --run src/renderer/utils/__tests__/formatTime.test.ts

# コンポーネントテスト
pnpm --filter @repo/desktop test -- --run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx
```

---

## 9. 使用例

### 基本的な使用

```tsx
import { SkillStreamDisplay } from "./SkillStreamDisplay";

<SkillStreamDisplay
  status="running"
  messages={[
    { id: "1", type: "text", content: "処理中...", timestamp: Date.now() },
  ]}
  onAbort={() => console.log("abort")}
/>;
```

### メッセージ型

```typescript
interface StreamMessage {
  id: string;
  type: "text" | "tool_use" | "error" | "complete";
  content: string;
  timestamp: number;
}
```
