# Phase 2 検証コマンドマトリクス

## 自動検証

| 種別          | コマンド                                                                                   | 確認内容                                  |
| ------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 型チェック    | `pnpm --filter @repo/desktop typecheck`                                                    | TypeScript コンパイルエラーなし           |
| リント        | `pnpm --filter @repo/desktop lint`                                                         | ESLint エラーなし（exhaustive-deps 含む） |
| targeted test | `pnpm --filter @repo/desktop test -- --run ConversationalInterview.restoredPendingRequest` | restoredPendingRequest 固有テスト通過     |
| 既存テスト    | `pnpm --filter @repo/desktop test -- --run ConversationalInterview`                        | 既存テスト回帰なし                        |

## 手動検証（Phase 11）

| シナリオ   | 確認内容                                               | NON_VISUAL |
| ---------- | ------------------------------------------------------ | ---------- |
| 通常フロー | snapshot の質問が表示される                            | ✅         |
| 復元フロー | handleUndo 後に前の質問が即時表示される                | ✅         |
| 切替確認   | 新しい snapshot 到着後に restored value がクリアされる | ✅         |

## 責務分離

| 検証                | 担当フェーズ    |
| ------------------- | --------------- |
| TypeScript 型整合   | Phase 5（自動） |
| ESLint ルール       | Phase 5（自動） |
| targeted scenario   | Phase 4〜6      |
| AC トレース         | Phase 7         |
| 手動 semantic check | Phase 11        |
