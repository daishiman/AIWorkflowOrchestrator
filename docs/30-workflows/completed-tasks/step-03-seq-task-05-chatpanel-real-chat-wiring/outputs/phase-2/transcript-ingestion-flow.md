# Phase 2 設計: Transcript 受け取り設計（Task 2-6）

## メタ情報

| 項目       | 内容                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                                                              |
| Phase      | 2                                                                                                |
| Task       | 2-6 transcript 受け取り設計                                                                      |
| 作成日     | 2026-03-18                                                                                       |
| ステータス | completed                                                                                        |
| 担当Agent  | UX Agent                                                                                         |
| 参照Phase  | Phase 1 requirements-definition.md                                                               |
| 参照文書   | ui-ux-realization.md / ui-ux-diagrams.md（Terminal Transcript -> Chat Manual Bridge セクション） |

---

## 1. 設計原則

Terminal transcript を ChatPanel へ持ち込む操作は、以下の 3 原則を絶対に遵守する。

| 原則                         | 内容                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| ユーザー明示操作の必須化     | ユーザーが明示的に「共有」アクションを選択した場合のみ transcript を chat へ渡す   |
| auto-send 禁止               | Terminal が自動で ChatPanel にメッセージを送信してはならない（Critical 違反）      |
| hidden prompt injection 禁止 | transcript に隠しプロンプトを付与してはならない（Critical 違反）                   |
| silent fallback 禁止         | transcript 添付に失敗した場合はエラーを明示し、黙って無視してはならない（UX 違反） |

---

## 2. 共有フロー（4 ステップ）

```
Step 1: ユーザーが Terminal Dock 内で共有アクションを選択
        - 「直近出力を添付」: 直近の stdout ブロックをそのまま取得
        - 「選択範囲をチャットへ送る」: ユーザーが範囲選択した部分を取得
        （「セッションを貼り付ける」は Composer への paste として扱う）

Step 2: transcript 内容が ComposerAttachmentChip として Composer に添付
        - 添付成功: Chip が Composer の入力フィールド上部に表示される
        - 添付失敗: ErrorGuidance（role="alert"）で失敗内容を表示

Step 3: TranscriptProvenanceLabel で出所とタイムスタンプを表示
        - Chip または message bubble 内に「terminal transcript から添付 (HH:MM)」を表示

Step 4: ユーザーが送信ボタンを押した時点でメッセージを送信
        - transcript 内容はメッセージ先頭に [Terminal Transcript] プレフィックス付きで結合
        - メッセージ本文: "[Terminal Transcript]\n<transcript_content>\n---\n<user_message>"
        - 送信はユーザーの明示的な操作（Enter キー / 送信ボタン）によってのみ実行する
```

---

## 3. 禁止ルール（3 禁止）

| 禁止ルール                   | 詳細                                                                      | 違反時の扱い              |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------- |
| auto-send 禁止               | Terminal が自動で ChatPanel へメッセージを送信してはならない              | Critical セキュリティ違反 |
| hidden prompt injection 禁止 | transcript に隠しシステムプロンプトや追加指示を埋め込んではならない       | Critical セキュリティ違反 |
| silent fallback 禁止         | transcript 添付失敗時はエラーを `role="alert"` で明示し、黙って無視しない | UX 違反                   |

---

## 4. ComposerAttachmentChip コンポーネント契約

### Props 定義

| Prop名       | 型                     | 必須 | 説明                                               |
| ------------ | ---------------------- | ---- | -------------------------------------------------- |
| `fileName`   | `string`               | yes  | Chip に表示するラベル（例: "terminal-output.txt"） |
| `content`    | `string`               | yes  | 実際の transcript テキスト内容                     |
| `onRemove`   | `() => void`           | yes  | Chip 削除時のコールバック（ユーザーが「×」を押下） |
| `provenance` | `TranscriptProvenance` | yes  | 出所情報オブジェクト（後述）                       |

### TranscriptProvenance 型定義

```typescript
type TranscriptProvenance = {
  source: "terminal" | "file";
  timestamp: Date;
  sessionId?: string; // terminal セッション ID（terminal 由来の場合）
  rangeLabel?: string; // 「直近出力」「選択範囲」等の選択種別ラベル
};
```

### Chip の表示仕様

```
+--------------------------------------------------+
| [icon: terminal]  terminal-output.txt       [x]  |
| terminal transcript から添付 · 14:32             |
+--------------------------------------------------+
```

- アイコン: Lucide `Terminal` (16px)
- ラベル: `fileName` プロパティの値
- 削除ボタン: `aria-label="添付を削除"` の × ボタン
- プロバナンス行: `TranscriptProvenanceLabel` を inline で表示（セカンダリテキスト色）
- 背景: systemGray5 / `#E5E5EA`（ライトモード）、tertiarySystemBackground / `#2C2C2E`（ダークモード）
- 角丸: 8px

---

## 5. TranscriptProvenanceLabel コンポーネント契約

### Props 定義

| Prop名      | 型                     | 必須 | 説明       |
| ----------- | ---------------------- | ---- | ---------- |
| `source`    | `"terminal" \| "file"` | yes  | 出所の種類 |
| `timestamp` | `Date`                 | yes  | 取得日時   |

### 表示仕様

| source       | 表示テキスト例                         |
| ------------ | -------------------------------------- |
| `"terminal"` | `terminal transcript から添付 · HH:MM` |
| `"file"`     | `ファイルから添付 · HH:MM`             |

- タイムスタンプフォーマット: `HH:MM`（当日）/ `M月D日 HH:MM`（別日）
- フォントサイズ: `text-xs`（12px）
- カラー: セカンダリテキスト（`rgba(60,60,67,0.6)` / `rgba(235,235,245,0.6)`）
- `time` 要素でラップし、`dateTime` 属性に ISO 形式の日時を付与（アクセシビリティ対応）

---

## 6. フロー図（テキストベース）

### 全体フロー

```
Terminal Dock
  |
  |-- [直近出力を添付]
  |       |
  |       v
  |   transcript 取得
  |       |
  |       v
  |   AddAttachmentChip(fileName, content, provenance)
  |
  |-- [選択範囲をチャットへ送る]
  |       |
  |       v
  |   selectedText 取得
  |       |
  |       v
  |   AddAttachmentChip(fileName, selectedText, provenance)
  |
  |-- [セッションを貼り付ける]
          |
          v
      Composer の input に paste（Chip ではなくテキスト直接挿入）

ChatPanel Composer
  |
  |-- AttachmentChip 表示
  |       |
  |       v
  |   TranscriptProvenanceLabel 表示
  |
  |-- ユーザー: メッセージを入力（任意）
  |
  |-- ユーザー: 送信ボタン押下 / Enter キー
          |
          v
      message 構築:
        "[Terminal Transcript]\n<content>\n---\n<user_input>"
          |
          v
      llm:stream-chat invoke（または AI_CHAT）
```

### エラーフロー（添付失敗）

```
AddAttachmentChip(content) が失敗
  |
  v
ErrorGuidance 表示 (role="alert")
  メッセージ: 「transcript の添付に失敗しました。再度お試しください。」
  CTA: [再試行]（silent fallback 禁止）
```

### Chip 削除フロー

```
ユーザー: Chip の [x] ボタン押下
  |
  v
onRemove() 呼び出し
  |
  v
Composer から AttachmentChip を除去
  |
  v
（送信時に transcript は含まれない通常メッセージとして送信される）
```

---

## 7. メッセージ構築仕様

### transcript が添付されている場合のメッセージフォーマット

```
[Terminal Transcript]
<transcript_content>
---
<user_message>
```

- `[Terminal Transcript]` プレフィックスは固定文字列（変更不可）。
- transcript が複数 Chip ある場合は各ブロックを `---` で区切って連結する。
- `<user_message>` が空の場合でも送信可能（transcript のみの送信）。
- hidden プロンプトや追加システム指示は一切付与しない（hidden prompt injection 禁止）。

---

## 8. TranscriptShareActions コンポーネント仕様

Terminal Dock 内の Transcript 共有アクション群。

### 提供アクション

| アクション名         | ラベル                     | トリガー条件                             |
| -------------------- | -------------------------- | ---------------------------------------- |
| `attachRecentOutput` | `直近出力を添付`           | Terminal Dock が開いており出力が存在する |
| `sendSelectedRange`  | `選択範囲をチャットへ送る` | テキスト選択状態が存在する               |
| `pasteSession`       | `セッションを貼り付ける`   | Terminal Dock が開いており出力が存在する |

### アクション実行時の前提条件チェック

| チェック項目                     | 条件                       | 失敗時の動作                            |
| -------------------------------- | -------------------------- | --------------------------------------- |
| ChatPanel が開いているか         | ChatPanel が表示されている | 「チャットパネルを開いてください」案内  |
| transcript 内容が空でないか      | `content.trim() !== ""`    | 「共有できる出力がありません」案内      |
| Chip 上限（5件）に達していないか | 現在の Chip 数 < 5         | 「添付の上限（5件）に達しています」案内 |

---

## 9. 状態遷移（Transcript 共有）

```
[*] --> TranscriptVisible
    TranscriptVisible --> RangeSelected: ユーザーがテキスト範囲を選択
    RangeSelected --> ShareReady: 「選択範囲をチャットへ送る」クリック
    TranscriptVisible --> ShareReady: 「直近出力を添付」クリック
    ShareReady --> ChipAttached: ComposerAttachmentChip が追加される
    ShareReady --> ShareFailed: 添付失敗（empty content 等）
    ShareFailed --> TranscriptVisible: ErrorGuidance 表示後（再試行可）
    ChipAttached --> MessageSent: ユーザーが送信ボタン押下
    ChipAttached --> ChipRemoved: ユーザーが Chip の × ボタン押下
    ChipRemoved --> TranscriptVisible: Chip が除去される
    MessageSent --> [*]
```

---

## 10. セキュリティ制約（FR-08 / Terminal Boundary 準拠）

| 制約項目                | 仕様                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| auto-send               | Terminal Dock のアクションは ChatPanel へのメッセージ送信を自動で行わない                     |
| hidden prompt injection | `[Terminal Transcript]` プレフィックス以外の追加テキストをシステム側で挿入しない              |
| silent fallback         | 添付失敗時は必ず `role="alert"` のエラー表示を行い、黙って無視しない                          |
| content visibility      | 共有前にユーザーが transcript 内容を確認できる状態を保つ（Chip の tooltip 等）                |
| secret exclusion        | terminal コマンドに API key / パスワード等の secret が含まれる場合の警告は Phase 3 以降で設計 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| v1.0.0     | 2026-03-18 | 初版作成（Task 2-6 transcript 受け取り設計） |
