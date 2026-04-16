# Phase 10 最終レビュー: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## AC-1〜AC-7 最終チェックリスト

| AC   | 受け入れ基準                                                                    | 状態 |
| ---- | ------------------------------------------------------------------------------- | ---- |
| AC-1 | `resolveExternalIntegration` が `string[]` を受け取り、`Promise.all` で並列処理 | ✅   |
| AC-2 | 各ツールの統合情報（apiEndpoints/authMethods/mainOperations）がマージされる     | ✅   |
| AC-3 | 単一ツール選択時は従来と同一の動作を維持する                                    | ✅   |
| AC-4 | 空配列・未対応ツールに対して安全にフォールバックする                            | ✅   |
| AC-5 | 呼び出し箇所が `selectedOptions` 全体を渡すよう更新されている                   | ✅   |
| AC-6 | テストカバレッジが 90% 以上（13テスト TC-1〜TC-13 全通過）                      | ✅   |
| AC-7 | M-01 TODO コメントが全て削除されている                                          | ✅   |

## バッジ削除確認

| 削除対象                       | 状態        |
| ------------------------------ | ----------- |
| `MAIN_TOOL_BADGE_ENABLED` 定数 | ✅ 削除済み |
| `MainToolBadgeProps` interface | ✅ 削除済み |
| `shouldShowMainToolBadge` 関数 | ✅ 削除済み |
| バッジ JSX                     | ✅ 削除済み |
| `aria-describedby` バッジ参照  | ✅ 削除済み |
| TC-1〜TC-6 バッジ関連テスト    | ✅ 削除済み |
| 拡充テスト describe ブロック   | ✅ 削除済み |

## ブロッカー

なし。全 AC 充足・テスト全通過・型チェック・Lint 問題なし。
