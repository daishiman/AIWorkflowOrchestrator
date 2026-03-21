# Phase 4 成果物: テスト設計書

## テストファイル一覧

| #        | ファイル                    | テスト数 | 内容                               |
| -------- | --------------------------- | -------- | ---------------------------------- |
| T1       | types.test.ts               | 17       | deriveSlideUIStatus 全状態パターン |
| T2       | selectors.test.ts           | 14       | 個別セレクタ renderHook テスト     |
| T3       | SlideSyncCard.test.tsx      | 17       | 4状態Badge + variantStyles + ARIA  |
| T4       | SlideProgressRow.test.tsx   | 17       | 進捗バー + キャンセルCTA           |
| T5       | SlideWatchStatus.test.tsx   | 14       | active/inactive + syncDirection    |
| T6       | SlideGuidanceBlock.test.tsx | 17       | 2バリアント + CTA + steps          |
| T7       | TerminalLauncher.test.tsx   | 10       | コマンド表示 + コピー/起動CTA      |
| T8       | SlideWorkspace.test.tsx     | 15       | 統合テスト（条件レンダリング）     |
| **合計** | **10ファイル**              | **167**  |                                    |

## 準拠確認

- P39: userEvent 不使用、fireEvent のみ
- P40: `cd apps/desktop` から実行
- P47: variantStyles を Record で export、テスト側で import
- P31: 個別セレクタ使用
- P60: IPC レスポンス wrapper 形式（TerminalLauncher は直接コールバック）
- P63: 既存テストパターン参照済み
