# Phase 2: UI/UX 実体化設計

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 2                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 5 領域構成

| 領域               | 責務                                                                | コンポーネント                                       |
| ------------------ | ------------------------------------------------------------------- | ---------------------------------------------------- |
| panel header       | タイトル表示、capability 状態、Terminal ボタン                      | WorkspaceChatHeader, PersistentTerminalLauncher      |
| file context chips | 選択ファイルと transcript provenance の表示・削除                   | WorkspaceFileContextChips, TranscriptProvenanceChip  |
| message log        | user/assistant メッセージの時系列表示、streaming 中間表示           | WorkspaceChatMessageList, StreamingMessage           |
| composer           | テキスト入力、mention 候補、送信/cancel、file add、terminal handoff | WorkspaceChatInput, MentionDropdown, ComposerActions |
| guidance block     | error guidance、blocked 説明、terminal handoff card                 | GuidanceBlock, HandoffCard                           |

## 状態遷移テーブル

| 現在状態  | トリガー                | 遷移先    | 条件                                                |
| --------- | ----------------------- | --------- | --------------------------------------------------- |
| zero      | file 選択 or input 入力 | ready     | selectedFiles.length > 0 or input.length > 0        |
| ready     | send ボタン押下         | streaming | selectedModelId !== null && input.trim().length > 0 |
| ready     | terminal button 押下    | handoff   | accessCapability.type === "handoff"                 |
| ready     | panel 幅 <= 360px       | compact   | ResizeObserver 監視                                 |
| streaming | cancel ボタン押下       | cancelled | streamRequestId あり                                |
| streaming | stream 完了             | ready     | onStreamEnd 受信                                    |
| streaming | stream エラー           | guidance  | onStreamError 受信                                  |
| cancelled | 自動遷移                | ready     | cancel 処理完了後                                   |
| guidance  | 回復操作                | ready     | エラー解消後                                        |
| compact   | panel 幅 > 360px        | ready     | ResizeObserver 監視                                 |

## マイクロコピー定義

| 状態        | 表示テキスト                                                                     |
| ----------- | -------------------------------------------------------------------------------- |
| zero        | 「最初の質問を選ぶか、そのまま入力して始めてください。」+ suggestion bubbles     |
| streaming   | streaming indicator + 「応答を生成中...」（cancel ボタン併設）                   |
| cancel      | テキスト表示なし、ready 状態に戻る                                               |
| guidance    | エラー種別に応じた具体的メッセージ + 次アクションボタン                          |
| blocked     | 「この操作は terminal で実行してください。ワークスペースの文脈は保持されます。」 |
| compact     | chips と composer action のラベル省略、guidance は折りたたみ summary 表示        |
| model未選択 | 「モデルを選択してください」+ Settings への導線リンク                            |

## 新規コンポーネント設計

### GuidanceBlock

```typescript
interface GuidanceBlockProps {
  type: "error" | "blocked" | "handoff" | "model-unselected";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  isCompact?: boolean; // compact 幅で折りたたみ表示
}
```

- error: fail-fast エラー時。赤系ボーダー、再送信/設定画面ボタン
- blocked: terminal handoff 時。青系ボーダー、terminal ボタン
- handoff: HandoffCard 表示。context summary + suggested command
- model-unselected: モデル未選択時。黄系ボーダー、Settings 導線

### TranscriptProvenanceChip

```typescript
interface TranscriptProvenanceChipProps {
  label: string; // "Terminal transcript から添付"
  onRemove: () => void;
  sourceType: "selection" | "recent-output" | "full-session";
}
```

- file context chip とは異なる色系統（terminal 起点であることを視覚区別）
- sourceType に応じたアイコン変更

### CompactLayout

```typescript
interface CompactLayoutProps {
  isCompact: boolean; // panel 幅 <= 360px
  children: React.ReactNode;
}
```

- ResizeObserver で panel 幅を監視
- isCompact 時にレイアウトルールを適用:
  - file context chips: 横スクロール1行 + "+N more" 省略
  - composer actions: アイコンのみ
  - suggestion bubbles: 縦1列
  - message log: padding 12px（通常20px）
  - guidance block: 折りたたみ summary + expand
  - terminal button: アイコンのみ
  - panel header: title のみ

## compact 幅レイアウトルール

| コンポーネント     | 通常幅              | compact 幅 (<=360px)              |
| ------------------ | ------------------- | --------------------------------- |
| file context chips | 横並び表示          | 横スクロール1行 + 「+N more」省略 |
| composer actions   | アイコン + ラベル   | アイコンのみ                      |
| suggestion bubbles | 横並び表示          | 縦1列                             |
| message log        | padding: 20px       | padding: 12px                     |
| guidance block     | 展開表示            | 折りたたみ summary + expand       |
| terminal button    | ラベル付き          | アイコンのみ（非表示にしない）    |
| panel header       | title + description | title のみ（description 非表示）  |

## アクセシビリティ要件

| 要件           | 仕様                                                       |
| -------------- | ---------------------------------------------------------- |
| メッセージログ | role="log" + aria-live="polite"                            |
| エラー通知     | role="alert"                                               |
| GuidanceBlock  | role="alert" + aria-describedby                            |
| キーボード操作 | Tab/Enter/Escape で全機能アクセス可能                      |
| compact 幅     | compact でも Tab で chips/composer actions/send に到達可能 |
| コントラスト比 | WCAG 2.1 AA: 4.5:1 以上（通常テキスト）                    |
