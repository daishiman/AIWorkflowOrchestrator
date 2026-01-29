# Phase 2: 翻訳キー定義

## メタ情報

| 項目     | 値           |
| -------- | ------------ |
| Phase    | 2            |
| 作成日   | 2026-01-28   |
| タスクID | TASK-3-2-B   |
| 名前空間 | skill-stream |

---

## 翻訳キー命名規則

### 形式

```
{category}.{element}
```

### カテゴリ一覧

| カテゴリ | 説明                           |
| -------- | ------------------------------ |
| status   | 実行ステータス表示テキスト     |
| time     | 相対時刻表示テキスト           |
| feedback | ユーザーフィードバックテキスト |
| button   | ボタンラベル                   |
| message  | メッセージ・説明文             |
| aria     | aria-label属性                 |

---

## 翻訳キー一覧

### status（ステータス）

| キー             | 日本語 | 英語      | 使用箇所                             |
| ---------------- | ------ | --------- | ------------------------------------ |
| status.idle      | 待機中 | Idle      | ステータスバッジ、スクリーンリーダー |
| status.running   | 実行中 | Running   | ステータスバッジ、スクリーンリーダー |
| status.completed | 完了   | Completed | ステータスバッジ、スクリーンリーダー |
| status.error     | エラー | Error     | ステータスバッジ、スクリーンリーダー |
| status.aborted   | 中断   | Aborted   | ステータスバッジ、スクリーンリーダー |

### time（相対時刻）

| キー            | 日本語          | 英語（単数）         | 英語（複数）          | 使用箇所         |
| --------------- | --------------- | -------------------- | --------------------- | ---------------- |
| time.justNow    | たった今        | Just now             | -                     | MessageTimestamp |
| time.secondsAgo | {{count}}秒前   | {{count}} second ago | {{count}} seconds ago | MessageTimestamp |
| time.minutesAgo | {{count}}分前   | {{count}} minute ago | {{count}} minutes ago | MessageTimestamp |
| time.hoursAgo   | {{count}}時間前 | {{count}} hour ago   | {{count}} hours ago   | MessageTimestamp |
| time.daysAgo    | {{count}}日前   | {{count}} day ago    | {{count}} days ago    | MessageTimestamp |

**補足**:

- `{{count}}` は動的に挿入される数値プレースホルダー
- 英語版は i18next の複数形機能を使用（`_one`, `_other` サフィックス）

### feedback（フィードバック）

| キー            | 日本語         | 英語   | 使用箇所   |
| --------------- | -------------- | ------ | ---------- |
| feedback.copied | コピーしました | Copied | CopyButton |

### button（ボタン）

| キー         | 日本語   | 英語  | 使用箇所       |
| ------------ | -------- | ----- | -------------- |
| button.abort | 中断     | Abort | 中断ボタン     |
| button.reset | リセット | Reset | リセットボタン |

### message（メッセージ）

| キー                | 日本語                       | 英語                  | 使用箇所               |
| ------------------- | ---------------------------- | --------------------- | ---------------------- |
| message.startPrompt | スキル実行を開始してください | Start skill execution | アイドル状態メッセージ |
| message.executing   | 実行中...                    | Executing...          | 実行中状態メッセージ   |

### aria（アクセシビリティ）

| キー                | 日本語             | 英語                  | 使用箇所                  |
| ------------------- | ------------------ | --------------------- | ------------------------- |
| aria.loading        | 実行中             | Loading               | LoadingSpinner aria-label |
| aria.copyMessage    | メッセージをコピー | Copy message          | CopyButton aria-label     |
| aria.abortExecution | スキル実行を中断   | Abort skill execution | 中断ボタン aria-label     |
| aria.resetState     | 状態をリセット     | Reset state           | リセットボタン aria-label |

---

## 翻訳ファイル（JSON）

### ja/skill-stream.json

```json
{
  "status": {
    "idle": "待機中",
    "running": "実行中",
    "completed": "完了",
    "error": "エラー",
    "aborted": "中断"
  },
  "time": {
    "justNow": "たった今",
    "secondsAgo": "{{count}}秒前",
    "minutesAgo": "{{count}}分前",
    "hoursAgo": "{{count}}時間前",
    "daysAgo": "{{count}}日前"
  },
  "feedback": {
    "copied": "コピーしました"
  },
  "button": {
    "abort": "中断",
    "reset": "リセット"
  },
  "message": {
    "startPrompt": "スキル実行を開始してください",
    "executing": "実行中..."
  },
  "aria": {
    "loading": "実行中",
    "copyMessage": "メッセージをコピー",
    "abortExecution": "スキル実行を中断",
    "resetState": "状態をリセット"
  }
}
```

### en/skill-stream.json

```json
{
  "status": {
    "idle": "Idle",
    "running": "Running",
    "completed": "Completed",
    "error": "Error",
    "aborted": "Aborted"
  },
  "time": {
    "justNow": "Just now",
    "secondsAgo_one": "{{count}} second ago",
    "secondsAgo_other": "{{count}} seconds ago",
    "minutesAgo_one": "{{count}} minute ago",
    "minutesAgo_other": "{{count}} minutes ago",
    "hoursAgo_one": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago",
    "daysAgo_one": "{{count}} day ago",
    "daysAgo_other": "{{count}} days ago"
  },
  "feedback": {
    "copied": "Copied"
  },
  "button": {
    "abort": "Abort",
    "reset": "Reset"
  },
  "message": {
    "startPrompt": "Start skill execution",
    "executing": "Executing..."
  },
  "aria": {
    "loading": "Loading",
    "copyMessage": "Copy message",
    "abortExecution": "Abort skill execution",
    "resetState": "Reset state"
  }
}
```

---

## 統計

| カテゴリ | キー数 |
| -------- | ------ |
| status   | 5      |
| time     | 5      |
| feedback | 1      |
| button   | 2      |
| message  | 2      |
| aria     | 4      |
| **合計** | **19** |

---

## 使用例

### コンポーネントでの使用

```typescript
import { useTranslation } from 'react-i18next';

function SkillStreamDisplay() {
  const { t } = useTranslation('skill-stream');

  return (
    <div>
      {/* ステータス表示 */}
      <span>{t(`status.${status}`)}</span>

      {/* ボタン */}
      <button aria-label={t('aria.abortExecution')}>
        {t('button.abort')}
      </button>

      {/* フィードバック */}
      {copied && <span>{t('feedback.copied')}</span>}
    </div>
  );
}
```

### formatRelativeTimeでの使用

```typescript
// formatRelativeTimeは独自の翻訳テーブルを使用
formatRelativeTime(timestamp, "ja"); // => "30秒前"
formatRelativeTime(timestamp, "en"); // => "30 seconds ago"
```
