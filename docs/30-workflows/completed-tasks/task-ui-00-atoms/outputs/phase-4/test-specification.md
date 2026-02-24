# テスト仕様書 — TASK-UI-00-ATOMS Phase 4

## テスト作成サマリー

| コンポーネント     | テスト数 | カテゴリ                                   |
| ------------------ | -------- | ------------------------------------------ |
| StatusIndicator    | 17       | 6ステータス, 3サイズ, パルス, ARIA, テーマ |
| FilterChip         | 13       | 選択/非選択, disabled, カウント, ARIA      |
| Badge（拡張）      | 28       | 6バリアント, content, aria-label, テーマ   |
| SkeletonCard       | 13       | 3バリアント, アニメーション, ARIA, テーマ  |
| SuggestionBubble   | 19       | 3サイズ, disabled, キーボード, ARIA        |
| EmptyState（拡張） | 23       | mood, compact, suggestions, テーマ         |
| RelativeTime       | 26       | 3フォーマット, 自動更新, エラー, テーマ    |
| **合計**           | **139**  |                                            |

## テスト設計方針

### TDDサイクル（Red → Green）

- Phase 4: 全テストをFailing（Red）として作成
- Phase 5: 実装によりGreen化
- 統合テスト: 7ファイル139テスト全PASS確認

### テスト環境

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| フレームワーク | Vitest                                            |
| DOM環境        | happy-dom                                         |
| イベント       | fireEvent（P39: userEvent非互換対策）             |
| タイマー       | vi.useFakeTimers + advanceTimersByTime（P13対策） |
| テーマ         | renderWithAllThemes（3テーマ）                    |

### テストカテゴリ

| カテゴリ         | テスト数 | 内容                                    |
| ---------------- | -------- | --------------------------------------- |
| レンダリング     | 35       | 基本表示, バリアント, サイズ            |
| アクセシビリティ | 25       | role, aria-\*, キーボード操作           |
| スタイル         | 22       | CSS変数, Tailwindクラス                 |
| インタラクション | 18       | click, disabled, hover/active           |
| テーマ           | 14       | 3テーマ（kanagawa-dragon, light, dark） |
| エッジケース     | 12       | エラー, 空値, 境界値                    |
| ref転送          | 4        | forwardRef, callback ref                |
| 追加props        | 9        | data-\*, title, className               |

### 後方互換性テスト

- Badge: 既存17テストのうち6テストのアサーション更新（CSS変数移行）
- EmptyState: 既存7テスト全て維持（破壊的変更なし）

## テストファイル一覧

| ファイルパス                                       | テスト数 |
| -------------------------------------------------- | -------- |
| `atoms/StatusIndicator/StatusIndicator.test.tsx`   | 17       |
| `atoms/FilterChip/FilterChip.test.tsx`             | 13       |
| `atoms/Badge/Badge.test.tsx`                       | 28       |
| `atoms/SkeletonCard/SkeletonCard.test.tsx`         | 13       |
| `atoms/SuggestionBubble/SuggestionBubble.test.tsx` | 19       |
| `atoms/EmptyState/EmptyState.test.tsx`             | 23       |
| `atoms/RelativeTime/RelativeTime.test.tsx`         | 26       |
