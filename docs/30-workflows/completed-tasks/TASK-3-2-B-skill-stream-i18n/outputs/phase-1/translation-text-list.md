# Phase 1: 翻訳テキスト一覧

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 1          |
| 作成日 | 2026-01-28 |
| タスク | TASK-3-2-B |

---

## 翻訳対象テキスト

### 1. SkillStreamDisplay.tsx

#### 1.1 ステータステキスト (getStatusText関数)

| キー             | 日本語 | 英語      | 場所                    |
| ---------------- | ------ | --------- | ----------------------- |
| status.idle      | 待機中 | Idle      | getStatusText (line 52) |
| status.running   | 実行中 | Running   | getStatusText (line 54) |
| status.completed | 完了   | Completed | getStatusText (line 56) |
| status.error     | エラー | Error     | getStatusText (line 58) |
| status.aborted   | 中断   | Aborted   | getStatusText (line 60) |

#### 1.2 aria-label属性

| キー                | 日本語             | 英語                  | 場所                     |
| ------------------- | ------------------ | --------------------- | ------------------------ |
| aria.loading        | 実行中             | Loading               | LoadingSpinner (line 74) |
| aria.copyMessage    | メッセージをコピー | Copy message          | CopyButton (line 124)    |
| aria.abortExecution | スキル実行を中断   | Abort skill execution | abort button (line 340)  |
| aria.resetState     | 状態をリセット     | Reset state           | reset button (line 351)  |

#### 1.3 UIテキスト

| キー                | 日本語                       | 英語                  | 場所                     |
| ------------------- | ---------------------------- | --------------------- | ------------------------ |
| feedback.copied     | コピーしました               | Copied                | CopyButton (line 147)    |
| button.abort        | 中断                         | Abort                 | abort button (line 343)  |
| button.reset        | リセット                     | Reset                 | reset button (line 354)  |
| message.startPrompt | スキル実行を開始してください | Start skill execution | idle state (line 366)    |
| message.executing   | 実行中...                    | Executing...          | running state (line 369) |

---

### 2. formatTime.ts (formatRelativeTime関数)

#### 2.1 相対時刻テキスト

| キー            | 日本語          | 英語                  | 場所    |
| --------------- | --------------- | --------------------- | ------- |
| time.justNow    | たった今        | Just now              | line 32 |
| time.secondsAgo | {{count}}秒前   | {{count}} seconds ago | line 52 |
| time.minutesAgo | {{count}}分前   | {{count}} minutes ago | line 49 |
| time.hoursAgo   | {{count}}時間前 | {{count}} hours ago   | line 45 |
| time.daysAgo    | {{count}}日前   | {{count}} days ago    | line 41 |

**注**: `{{count}}`はi18nextの補間構文で、動的な数値を挿入する

---

## 翻訳キー構造

```
skill-stream
├── status
│   ├── idle
│   ├── running
│   ├── completed
│   ├── error
│   └── aborted
├── aria
│   ├── loading
│   ├── copyMessage
│   ├── abortExecution
│   └── resetState
├── feedback
│   └── copied
├── button
│   ├── abort
│   └── reset
├── message
│   ├── startPrompt
│   └── executing
└── time
    ├── justNow
    ├── secondsAgo
    ├── minutesAgo
    ├── hoursAgo
    └── daysAgo
```

---

## 統計

| カテゴリ   | 件数   |
| ---------- | ------ |
| ステータス | 5      |
| aria-label | 4      |
| UIテキスト | 5      |
| 相対時刻   | 5      |
| **合計**   | **19** |
