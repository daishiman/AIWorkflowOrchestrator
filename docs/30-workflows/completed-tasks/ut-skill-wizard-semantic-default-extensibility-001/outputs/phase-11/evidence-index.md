# Phase 11: 証跡インデックス

## 証跡一覧

| 証跡名          | ファイル                                  | 内容                         |
| --------------- | ----------------------------------------- | ---------------------------- |
| vitest 実行ログ | `outputs/phase-11/vitest-verbose.log`     | 72件 PASS のテスト実行ログ   |
| NON_VISUAL 宣言 | `outputs/phase-11/screenshot-plan.json`   | スクリーンショット不要の根拠 |
| 手動テスト結果  | `outputs/phase-11/manual-test-result.md`  | 代替証跡サマリー             |
| 品質レポート    | `outputs/phase-9/quality-report.md`       | 型チェック・Lint・テスト結果 |
| 最終レビュー    | `outputs/phase-10/final-review-result.md` | AC-1〜AC-5 PASS 判定         |

## 既知制限

| 制限事項                                           | 理由                                     | 将来対応方針                        |
| -------------------------------------------------- | ---------------------------------------- | ----------------------------------- |
| 未定義 questionId（q7〜qN）は変換せずそのまま返す  | `SEMANTIC_LABEL_MAP` のスコープは q1〜q6 | q7〜qN 追加時にマップを拡張         |
| `inferSmartDefaults()` 本体は変更しない            | このタスクのスコープ外                   | 別タスクで対応                      |
| 新しい semantic default プロバイダの実装は含まない | このタスクのスコープ外                   | 別タスクで対応                      |
| vitest.config.ts の alias 手動追加                 | value import の tsconfigPaths 制限       | 別タスクで vite-tsconfig-paths 調査 |

## NON_VISUAL 判定根拠

- 変更対象はコンポーネントの内部関数であり、レンダリング結果に影響しない
- `@repo/shared` への型・定数の移動はビルド成果物の外部インターフェースに影響しない
- ユーザーが操作するウィザードの表示内容・レイアウト・スタイルに変更はない
