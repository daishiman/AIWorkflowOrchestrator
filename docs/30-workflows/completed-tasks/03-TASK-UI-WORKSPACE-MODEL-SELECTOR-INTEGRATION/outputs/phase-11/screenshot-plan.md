# Phase 11: スクリーンショット計画

## 撮影シナリオ

| ID   | シナリオ                                                   | 状態             | 命名規則                             |
| ---- | ---------------------------------------------------------- | ---------------- | ------------------------------------ |
| SS-1 | WorkspaceChatPanel + InlineModelSelector(compact) 初期表示 | モデル未選択     | `workspace-panel-initial.png`        |
| SS-2 | モデル選択後のパネル表示                                   | モデル選択済み   | `workspace-panel-model-selected.png` |
| SS-3 | ストリーミング中のdisabled状態                             | ストリーミング中 | `workspace-panel-streaming.png`      |
| SS-4 | ダークモード表示                                           | ダークモード     | `workspace-panel-dark.png`           |

## CLI環境での代替検証（P53対策）

CLI環境ではスクリーンショット取得が制約されるため、自動テスト結果を間接的な検証として記録する。

### 検証結果

- 11テスト全PASS（I-1〜I-6, E-1〜E-5）
- カバレッジ: Line 98.71%, Branch 100%, Function 100%
- リグレッション: 0件（既存135テスト全PASS）
