# Phase 2 設計 - UI/UX 実体化

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 2                                        |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## 1. 画面構成

### 1.1 Skill / Agent / Creator 共通レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│ [Lifecycle Header]                         [Terminal Button] │  ← 常設 Terminal ボタン
├─────────────────────────────────────────────────────────────┤
│ [Execution Bar]                                              │  ← job 名 + 進捗
│   "作成中..." / "実行中..." / "改善中..."                    │
├─────────────────────────────────────────────────────────────┤
│ [Streaming Content Area]                                     │  ← text streaming
│   streaming output...                                        │
├─────────────────────────────────────────────────────────────┤
│ [State Panel]                                                │
│   permission dialog | handoff card | result summary         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Execution Bar 状態定義

| 状態         | 表示                        | Primary CTA        | Secondary CTA               |
| ------------ | --------------------------- | ------------------ | --------------------------- |
| `preflight`  | 確認中...                   | -                  | -                           |
| `permission` | 権限を確認してください      | `許可する`         | `拒否する` `権限詳細を見る` |
| `streaming`  | 実行中...                   | `中断する`         | `terminal で続ける`         |
| `handoff`    | terminal で実行してください | `コマンドをコピー` | `terminal を開く`           |
| `failed`     | エラーが発生しました        | `再試行する`       | `terminal で続ける`         |
| `completed`  | 完了しました                | `改善する`         | `terminal で続ける`         |

---

## 3. Permission Dialog 設計

### 3.1 dialog 表示内容

```
┌─────────────────────────────────────────────────────────┐
│ ツールの使用を許可しますか？                             │
│                                                          │
│ ツール: [toolName]                                       │
│ 理由: [permission reason text]                           │
│                                                          │
│ □ 今後このツールを自動で許可する                        │
│                                                          │
│        [拒否する]    [許可する]                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 dialog アクセシビリティ

- dialog が開いたとき、`許可する` ボタンにフォーカス
- Escape キーで拒否
- Tab / Shift+Tab で `拒否する` ↔ `許可する` を移動
- `今後このツールを自動で許可する` チェックボックスも Tab で到達可能

### 3.3 dialog → execution bar フォーカス順序

1. permission dialog（modal）
2. execution bar（dialog 閉じたら自動フォーカス）
3. handoff card（terminal_handoff 時）

---

## 4. Terminal Handoff Card 設計

### 4.1 card 表示内容

```
┌─────────────────────────────────────────────────────────────┐
│ 🖥 Terminal で続けてください                                  │
│                                                              │
│ 以下のコマンドを terminal で実行してください：               │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ claude -p "skill context..."                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                              [コピー]                        │
│                                                              │
│ 作業ディレクトリ: /path/to/cwd                              │
│                                                              │
│ [詳細手順を見る ▼]                                          │
│                                                              │
│              [terminal を開く]  [閉じる]                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 handoff card アクセシビリティ

- card が表示されたとき `コピー` ボタンにフォーカス
- `terminal を開く` ボタンは `claude-cli:execute-script` を呼び出す
- `詳細手順を見る` は accordion で runbook を展開

---

## 5. Runtime Banner 設計

### 5.1 integrated_api モード

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Integrated API Runtime で実行中                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 terminal_handoff モード

```
┌─────────────────────────────────────────────────────────────┐
│ 🖥 Claude Code Terminal が必要です                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Result Summary 設計

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ 実行が完了しました                                        │
│                                                              │
│ [テキスト結果 / ファイル変更サマリー]                       │
│                                                              │
│ ツール使用: Read × 3  Edit × 1  Bash × 2                  │
│                                                              │
│      [改善する]              [terminal で続ける]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 状態遷移図

```
                [user starts skill/agent/creator]
                             │
                             ▼
                        [preflight]
                             │
                 ┌───────────┴───────────┐
                 │                       │
          api_key あり              api_key なし
          auth=integrated           または auth=claude_code
                 │                       │
                 ▼                       ▼
          [streaming]             [terminal_handoff card]
                 │                       │
         ┌───────┴───────┐        [user copies command]
         │               │               │
   [permission]    [complete]     [user runs in terminal]
         │               │
   [allow/deny]   [result_summary]
         │               │
   [streaming]    [end or improve]
```

---

## 8. マイクロコピー定義

| 状態                        | コピー                                       |
| --------------------------- | -------------------------------------------- |
| Planner 実行中              | 作成中...                                    |
| Executor 実行中             | 実行中...                                    |
| Improver 実行中             | 改善中...                                    |
| terminal handoff            | Terminal で続けてください                    |
| handoff guidance            | 以下のコマンドを terminal で実行してください |
| permission request          | ツールの使用を許可しますか？                 |
| result complete             | 実行が完了しました                           |
| runtime banner (integrated) | Integrated API Runtime で実行中              |
| runtime banner (terminal)   | Claude Code Terminal が必要です              |

**重要**: Planner / Executor / Improver のコピーを UI に出さない。

---

## 9. Lifecycle Header の常設 Terminal ボタン

- `Terminal` ボタン: lifecycle header の右端に常設
- どの job（作成/実行/改善）からでもクリック可能
- クリック時: terminal dock を開く（`claude-cli:execute-script` の準備状態）
- tooltip: `Claude Code terminal を開く`

---

## 完了確認

- [x] execution bar / permission / handoff / result summary の UI 状態と CTA が定義されている
- [x] アクセシビリティ（フォーカス順序、キーボード操作）が定義されている
- [x] マイクロコピーが定義されている（internal role 名を使わない）
- [x] 状態遷移図が定義されている
- [x] lifecycle header の常設 Terminal ボタンが定義されている
