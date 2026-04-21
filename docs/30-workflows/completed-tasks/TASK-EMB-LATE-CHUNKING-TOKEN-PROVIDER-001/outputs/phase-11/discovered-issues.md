# Discovered Issues

| #   | シナリオ           | 発見事項                                                      | 分類  | 対応方針                                            |
| --- | ------------------ | ------------------------------------------------------------- | ----- | --------------------------------------------------- |
| 1   | 実装レビュー       | `chunk()` 本流が token provider 契約を使っていなかった        | Major | `ChunkingService` 本流へ接続し解消                  |
| 2   | フルスイート初回   | `build-verification.test.ts` が `dist/` 未生成で失敗          | Info  | `pnpm --filter @repo/shared build` 実行で前提解消   |
| 3   | フルスイート再実行 | `build-verification.test.ts` の `dist/index.d.ts` 1件だけ再現 | Info  | 単体 rerun は PASS。baseline の実行順依存として記録 |
| 4   | Phase 12 close-out | Phase 12 成果物がプレースホルダだった                         | Major | 実測値ベースへ更新し解消                            |

## オープン課題

現在 wave で未解消の blocker / major は 0 件。
shared baseline には build verification の不安定要素が 1 件残る。
