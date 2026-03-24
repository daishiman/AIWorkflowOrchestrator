# 要件定義書

## AC-1~AC-7 検証方法

| AC   | 受入基準                                                        | 検証方法                                                 | タイプ |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------- | ------ |
| AC-1 | UiState 型が 8 値を含み UI_STATE_VALUES と一致                  | 型定義の目視確認 + `as const satisfies` のコンパイル確認 | 自動   |
| AC-2 | resolveUiState() が全フィールドに基づき 8 値を正しく導出        | uistate-resolve.test.ts の P1-P8 テスト（13ケース）      | 自動   |
| AC-3 | resolveCtaContract() が全組み合わせで仕様準拠 CTA を返す        | contract-matrix.test.ts の 32 セルテスト                 | 自動   |
| AC-4 | handoff 状態で handoffGuidance が HandoffGuidance 型を返す      | uistate-resolve.test.ts P2 テスト + 型チェック           | 自動   |
| AC-5 | 既存 3 値テスト CC-1~CC-5 が全て PASS                           | pnpm --filter @repo/shared vitest run                    | 自動   |
| AC-6 | 新規 Contract Matrix テスト（全 32 セル + エッジケース）が PASS | pnpm --filter @repo/shared vitest run                    | 自動   |
| AC-7 | pnpm typecheck / pnpm lint が PASS                              | コマンド実行                                             | 自動   |

## UiState 8 値定義

| 値            | セマンティクス      | 遷移元                                                           |
| ------------- | ------------------- | ---------------------------------------------------------------- |
| ready         | 実行可能            | capability が none 以外                                          |
| blocked       | 設定が必要          | capability=none + hasResolutionAction                            |
| unavailable   | アクションなし      | capability=none + !hasResolutionAction + !hasAlternativeGuidance |
| streaming     | 出力増加中          | ready → execute → stream                                         |
| handoff       | terminal へ委譲     | capability=terminalSurface/both + isHandoffRequired              |
| terminal-only | terminal が primary | capability=terminalSurface のみ                                  |
| guidance-only | 設定誘導            | capability=none + hasAlternativeGuidance                         |
| degraded      | 品質低下            | isDegraded + capability !== none                                 |

## CapabilityContext 拡張フィールド

| フィールド             | 型                 | デフォルト | 用途                     |
| ---------------------- | ------------------ | ---------- | ------------------------ |
| isStreaming            | boolean (optional) | false      | streaming 状態判定       |
| isHandoffRequired      | boolean (optional) | false      | handoff 条件成立判定     |
| isDegraded             | boolean (optional) | false      | legacy lane 品質低下判定 |
| hasAlternativeGuidance | boolean (optional) | false      | guidance-only 条件判定   |
