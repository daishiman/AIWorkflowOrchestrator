# Phase 7: カバレッジレポート

## SEM テストカバレッジ（Layer 1 対象）

`TEST_TARGETS` の `layer1: true` 対象: 5 画面

| ターゲット ID      | 説明                     | SEM-001〜007 |
| ------------------ | ------------------------ | ------------ |
| chat-main          | メインチャット画面       | ✓ 全 7 項目  |
| skill-list         | スキル一覧画面           | ✓ 全 7 項目  |
| settings-general   | 設定画面（一般タブ）     | ✓ 全 7 項目  |
| sidebar-navigation | サイドバーナビゲーション | ✓ 全 7 項目  |
| error-display      | エラー表示コンポーネント | ✓ 全 7 項目  |

**総テストケース数**: 5 画面 × 7 項目 = 35 テスト

## VIS テストカバレッジ（Layer 2 対象）

`TEST_TARGETS` の `layer2: true` 対象: 7 画面（VIS-001〜007 に対応）

| ターゲット ID      | 説明                             | maxDiffPixels | 状態                             |
| ------------------ | -------------------------------- | ------------- | -------------------------------- |
| chat-main          | メインチャット画面               | 50            | ✓ baseline 生成済み              |
| skill-list         | スキル一覧                       | 50            | ✓ baseline 生成済み              |
| settings-general   | 設定画面（一般タブ）             | 50            | ✓ baseline 生成済み              |
| sidebar-navigation | サイドバーナビゲーション         | 30            | ✓ baseline 生成済み（clip あり） |
| error-display      | エラー表示コンポーネント         | 20            | ✓ baseline 生成済み              |
| loading-state      | ローディング状態                 | 20            | ✓ baseline 生成済み              |
| dark-mode          | ダークモード（テーマ切り替え後） | 50            | ✓ baseline 生成済み              |

**総テストケース数**: 7 画面 + 3 guard テスト = 10 テスト

## カバレッジギャップ

現時点でのカバレッジギャップなし。
`TEST_TARGETS` の全 7 Layer 2 対象に baseline が生成されており、
全 5 Layer 1 対象に SEM-001〜007 が適用されている。

将来追加予定の画面については `test-targets.config.ts` に 1 行追加するだけで自動的にカバレッジに含まれる。
