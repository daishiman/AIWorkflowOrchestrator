# Phase 2 成果物: 設計決定サマリー

## 質問定義定数（QUESTIONS）

```typescript
export const QUESTIONS = [
  {
    id: "q1" as const,
    label: "このスキルは誰が使いますか？",
    options: [
      "自分のみ",
      "チームメンバー",
      "社内全体",
      "外部ユーザー",
    ] as const,
  },
  {
    id: "q2" as const,
    label: "どのようなデータを入力しますか？",
    options: ["テキスト", "ファイル", "URLリンク", "構造化データ"] as const,
  },
  {
    id: "q3" as const,
    label: "いつ実行しますか？",
    options: ["手動実行", "定期実行", "イベント駆動", "都度判断"] as const,
  },
  {
    id: "q4" as const,
    label: "結果をどこに出力しますか？",
    options: ["チャット返信", "ファイル保存", "外部ツール", "通知"] as const,
  },
  {
    id: "q5" as const,
    label: "連携する外部ツールはありますか？",
    options: ["なし", "Slack", "GitHub", "その他"] as const,
  },
  {
    id: "q6" as const,
    label: "出力フォーマットはどれですか？",
    options: ["Markdown", "プレーンテキスト", "JSON", "箇条書き"] as const,
  },
] as const;
```

## 主要設計決定

| 決定事項                      | 選択肢                                  | 決定内容                                   | 理由                                                            |
| ----------------------------- | --------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| ページング状態型              | `number` vs `1 \| 2`                    | `useState<1 \| 2>(1)`                      | 型安全・3ページ以上を防止                                       |
| buildInitialAnswers の export | private vs export                       | `export function buildInitialAnswers(...)` | Phase 4 で単体テスト可能にするため                              |
| 選択肢ウィジェット            | 独自実装 vs interview-widgets 再利用    | `SingleSelectChips` 再利用                 | 既存 UI 資産の活用・保守性向上                                  |
| 進捗表示                      | 独自実装 vs InterviewProgressBar 再利用 | `InterviewProgressBar` 再利用              | 既存 UI 資産の活用・重複実装の排除                              |
| Q3 スケジュール設定           | 詳細実装 vs 最小実装                    | `scheduleConfig: undefined` の最小実装     | 別タスク候補・スコープを最小化                                  |
| inferenceLog の取り扱い       | 使用 vs 無視                            | 無視                                       | `ConversationAnswers` に対応フィールドが存在しない              |
| ConfigureStep 削除            | このタスクで削除 vs Wave 2 で削除       | Wave 2（W2-seq-03a）で削除                 | 本タスクは `ConversationRoundStep` 追加と export 反映に集中する |
| semantic default 正規化       | そのまま使用 vs UI ラベルへ変換         | UI ラベルへ正規化                          | `自分だけ` / `scheduled` / `realtime` 等の入力差分を吸収する    |

## 責務境界

- **Props 入力**: `SmartDefaultResult`（inferSmartDefaults の結果）
- **変換**: `buildInitialAnswers()` で初期 `ConversationAnswers` に変換し、semantic default を UI ラベルへ正規化
- **状態**: `currentPage` と `answers` をコンポーネント内で管理
- **Props 出力**: `onComplete(answers)` で `ConversationAnswers` を親に渡す
- **コンポーネント内では `inferSmartDefaults()` を呼ばない**（Props 受け取り済みの結果を利用）
