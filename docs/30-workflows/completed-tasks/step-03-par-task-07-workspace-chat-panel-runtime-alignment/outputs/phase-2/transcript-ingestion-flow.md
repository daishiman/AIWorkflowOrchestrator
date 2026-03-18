# Phase 2: Transcript 受け取り設計

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 2 (T2-6)                                     |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 概要

Terminal Dock の transcript からユーザーが手動で選択した内容を、WorkspaceChatPanel の composer attachment として受け取る。自動共有・hidden parsing・silent summarization は禁止。

## 共有方法（3パターン）

| 共有操作                 | ソース                              | 操作                           |
| ------------------------ | ----------------------------------- | ------------------------------ |
| 選択範囲をチャットへ送る | Terminal 上でユーザーが選択した範囲 | コンテキストメニュー or ボタン |
| 直近出力を添付           | Terminal の直近コマンド出力         | ワンクリック                   |
| セッションを貼り付ける   | Terminal セッション全体             | コピー&ペースト                |

## TranscriptProvenanceChip

| 項目         | 定義                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| ラベル       | 「Terminal transcript から添付」                                                    |
| 色           | file context chip とは異なる色系統（terminal 起点の視覚区別）                       |
| sourceType   | "selection" / "recent-output" / "full-session"                                      |
| アイコン     | sourceType に応じて変更（selection: text-select, recent: terminal, full: document） |
| 削除操作     | chip の x ボタンで削除                                                              |
| 最大表示件数 | file context chip と合わせて最大3件                                                 |

## データフロー

```
Terminal Dock
  |
  v（ユーザー手動操作）
  |
WorkspaceChatPanel (Renderer)
  |
  +--> TranscriptProvenanceChip 表示（composer attachment area）
  |
  +--> buildFileContextBlock に transcript content を含める
  |
  +--> llm:stream-chat の messages に context として送信
```

## 禁止事項

| 禁止事項                                         | 理由                             |
| ------------------------------------------------ | -------------------------------- |
| transcript を自動で chat message 化しない        | ユーザーの意図なく会話に混入する |
| chat 入力を自動で terminal へ返送しない          | 意図しないコマンド実行のリスク   |
| hidden parsing / silent summarization を行わない | ユーザーが共有内容を確認できない |

## セキュリティ

| 要件             | 仕様                                                       |
| ---------------- | ---------------------------------------------------------- |
| 共有前の内容確認 | 共有前に内容が見える状態を保つ                             |
| サイズ制限       | file context と合計で 100KB 以下（ContextBuilder 制約）    |
| パス検証         | transcript 自体にはパスがないため isAllowedPath 検証は不要 |

## compact 幅での表示

- TranscriptProvenanceChip は file context chip と同列で横スクロール表示
- compact 幅では「+N more」で省略表示
- chip の削除操作は compact でもアクセス可能
